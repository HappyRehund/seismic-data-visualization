import { SeismicConfig, CameraConfig, StyleConfig } from '../config/SeismicConfig.js';
import { CoordinateSystem } from './CoordinateSystem.js';

export class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Camera orbit controls state
        this.orbitState = {
            isDragging: false,
            isPanning: false,           // NEW: Track if panning (Shift + drag)
            previousMouse: { x: 0, y: 0 },
            theta: CameraConfig.initialTheta,
            phi: CameraConfig.initialPhi,
            radius: CameraConfig.initialRadius,
            // NEW: Camera target offset for panning
            targetOffset: { x: 0, y: 0, z: 0 }
        };

        // Raycaster for mouse interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.tooltip = null;
        this.hoveredWell = null; // Track currently hovered well for highlighting

        // Performance: throttle raycasting
        this._lastRaycastTime = 0;
        this._raycastThrottle = 50; // ms between raycasts

        this._init();
        this._setupMouseInteraction();
    }

    _init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(StyleConfig.backgroundColor);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            CameraConfig.fov,
            window.innerWidth / window.innerHeight,
            CameraConfig.near,
            CameraConfig.far
        );

        // Create renderer with performance optimizations
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: 'high-performance',  // Use dedicated GPU if available
            stencil: false,                       // Disable stencil buffer if not needed
            depth: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        document.body.appendChild(this.renderer.domElement);

        // Add lighting
        this._setupLighting();

        // Add bounding box
        this._createBoundingBox();

        // Setup camera controls
        this._setupCameraControls();

        // Handle window resize
        this._setupResizeHandler();

        // Position camera
        this._updateCameraPosition();
    }

    _setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(ambientLight);
    }

    _createBoundingBox() {
        const { imageWidth, imageHeight } = SeismicConfig;

        const geometry = new THREE.BoxGeometry(imageWidth, imageHeight, imageWidth);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: StyleConfig.boundingBoxColor });

        const wireframe = new THREE.LineSegments(edges, material);
        wireframe.position.set(imageWidth / 2, 0, imageWidth / 2);

        this.scene.add(wireframe);
    }

    _setupCameraControls() {
        const canvas = this.renderer.domElement;

        canvas.addEventListener('mousedown', (e) => {
            // Check if Shift is held for panning
            if (e.shiftKey) {
                this.orbitState.isPanning = true;
                this.orbitState.isDragging = false;
            } else {
                this.orbitState.isDragging = true;
                this.orbitState.isPanning = false;
            }
            this.orbitState.previousMouse = { x: e.clientX, y: e.clientY };
        });

        canvas.addEventListener('mouseup', () => {
            this.orbitState.isDragging = false;
            this.orbitState.isPanning = false;
        });

        // Handle mouse leaving window
        canvas.addEventListener('mouseleave', () => {
            this.orbitState.isDragging = false;
            this.orbitState.isPanning = false;
        });

        canvas.addEventListener('mousemove', (e) => this._handleMouseMove(e));
        canvas.addEventListener('wheel', (e) => this._handleMouseWheel(e), { passive: true });

        // Prevent context menu on right-click
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    _handleMouseMove(e) {
        const deltaX = e.clientX - this.orbitState.previousMouse.x;
        const deltaY = e.clientY - this.orbitState.previousMouse.y;

        // Handle panning (Shift + drag)
        if (this.orbitState.isPanning) {
            this._handlePan(deltaX, deltaY);
            this.orbitState.previousMouse = { x: e.clientX, y: e.clientY };
            return;
        }

        // Handle rotation (normal drag)
        if (!this.orbitState.isDragging) return;

        this.orbitState.theta -= deltaX * CameraConfig.rotationSpeed;
        this.orbitState.phi -= deltaY * CameraConfig.rotationSpeed;

        // Clamp phi to prevent camera flip
        const EPS = 0.01;
        this.orbitState.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.orbitState.phi));

        this._updateCameraPosition();

        this.orbitState.previousMouse = { x: e.clientX, y: e.clientY };
    }

    /**
     * Handle camera panning (shift + drag)
     * @private
     * @param {number} deltaX - Mouse X delta
     * @param {number} deltaY - Mouse Y delta
     */
    _handlePan(deltaX, deltaY) {
        const panSpeed = CameraConfig.panSpeed;
        
        // Calculate camera right vector based on current theta
        // Right vector is perpendicular to view direction in XZ plane
        const { theta } = this.orbitState;
        
        // Camera looks toward center, so right vector is:
        // cross(viewDirection, upVector) = (-sin(theta), 0, cos(theta))
        const rightX = -Math.sin(theta);
        const rightZ = Math.cos(theta);
        
        // Pan horizontally (left/right) along camera's right vector
        this.orbitState.targetOffset.x += deltaX * panSpeed * rightX;
        this.orbitState.targetOffset.z += deltaX * panSpeed * rightZ;
        
        // Pan vertically (up/down)
        this.orbitState.targetOffset.y += deltaY * panSpeed;
        
        this._updateCameraPosition();
    }

    _handleMouseWheel(e) {
        // Smoother zoom with configurable speed
        const zoomDelta = e.deltaY * CameraConfig.zoomSpeed;
        this.orbitState.radius += zoomDelta;
        this.orbitState.radius = Math.max(
            CameraConfig.minRadius,
            Math.min(CameraConfig.maxRadius, this.orbitState.radius)
        );
        this._updateCameraPosition();
    }

    /**
     * Reset camera to initial position and clear pan offset
     */
    resetCamera() {
        this.orbitState.theta = CameraConfig.initialTheta;
        this.orbitState.phi = CameraConfig.initialPhi;
        this.orbitState.radius = CameraConfig.initialRadius;
        this.orbitState.targetOffset = { x: 0, y: 0, z: 0 };
        this._updateCameraPosition();
    }

    _updateCameraPosition() {
        const center = CoordinateSystem.getBoundingBoxCenter();
        const { radius, phi, theta, targetOffset } = this.orbitState;

        // Apply target offset to center for panning
        const targetX = center.x + targetOffset.x;
        const targetY = center.y + targetOffset.y;
        const targetZ = center.z + targetOffset.z;

        // Calculate camera position based on spherical coordinates
        const x = targetX + radius * Math.sin(phi) * Math.cos(theta);
        const y = targetY + radius * Math.cos(phi);
        const z = targetZ + radius * Math.sin(phi) * Math.sin(theta);

        this.camera.position.set(x, y, z);
        this.camera.lookAt(targetX, targetY, targetZ);
    }

    _setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    startRenderLoop() {
        // Performance: Use bound function to avoid creating new function each frame
        const render = () => {
            requestAnimationFrame(render);
            this.renderer.render(this.scene, this.camera);
        };
        render();
    }

    /**
     * Get renderer info for debugging performance
     * @returns {Object} Renderer info including draw calls, triangles, etc.
     */
    getRendererInfo() {
        const info = this.renderer.info;
        return {
            drawCalls: info.render.calls,
            triangles: info.render.triangles,
            points: info.render.points,
            lines: info.render.lines,
            geometries: info.memory.geometries,
            textures: info.memory.textures
        };
    }

    _setupMouseInteraction() {
        this.tooltip = document.getElementById('wellTooltip');
        
        if (!this.tooltip) {
            console.warn('Well tooltip element not found');
            return;
        }
        
        // Track mouse movement for tooltip
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            // Don't show tooltip while dragging camera
            if (this.orbitState.isDragging) {
                this._hideTooltip();
                return;
            }
            this._checkWellHover(event);
        });
    }

    _checkWellHover(e) {
        // Performance: Throttle raycasting
        const now = performance.now();
        if (now - this._lastRaycastTime < this._raycastThrottle) {
            return;
        }
        this._lastRaycastTime = now;

        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Performance: Only raycast against wells, not all scene children
        const wellMeshes = this.scene.children.filter(
            obj => obj.userData && obj.userData.type === 'well'
        );

        const intersects = this.raycaster.intersectObjects(wellMeshes, false);
        
        let wellFound = false;
        let newHoveredWell = null;
        
        for (let intersect of intersects) {
            // Check if the intersected object is a well AND is visible
            if (intersect.object.userData && 
                intersect.object.userData.type === 'well' &&
                intersect.object.visible) {
                this._showTooltip(intersect.object.userData.name, e.clientX, e.clientY);
                newHoveredWell = intersect.object;
                wellFound = true;
                break;
            }
        }

        // Update highlighting
        if (newHoveredWell !== this.hoveredWell) {
            // Unhighlight previous well
            if (this.hoveredWell && this.hoveredWell.userData.wellInstance) {
                this.hoveredWell.userData.wellInstance.unhighlight();
            }
            
            // Highlight new well
            if (newHoveredWell && newHoveredWell.userData.wellInstance) {
                newHoveredWell.userData.wellInstance.highlight();
            }
            
            this.hoveredWell = newHoveredWell;
        }

        if (!wellFound) {
            this._hideTooltip();
        }
    }

    _showTooltip(wellName, x, y) {
        if (!this.tooltip) return;
        
        this.tooltip.textContent = `Well ${wellName}`;
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = `${x + 15}px`;
        this.tooltip.style.top = `${y + 15}px`;
    }

    _hideTooltip() {
        if (!this.tooltip) return;
        this.tooltip.style.display = 'none';
    }
}
