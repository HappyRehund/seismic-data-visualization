/**
 * SceneManager.js
 * ================
 * Manages Three.js scene, camera, renderer, and lighting.
 *
 * SINGLE RESPONSIBILITY: Scene infrastructure only
 * DEPENDENCY INJECTION: Receives config, doesn't know about components
 */

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
            previousMouse: { x: 0, y: 0 },
            theta: CameraConfig.initialTheta,
            phi: CameraConfig.initialPhi,
            radius: CameraConfig.initialRadius
        };

        // Raycaster for mouse interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.tooltip = null;
        this.hoveredWell = null; // Track currently hovered well for highlighting

        this._init();
        this._setupMouseInteraction();
    }

    /**
     * Initialize Three.js scene components
     */
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

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
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

    /**
     * Setup scene lighting
     */
    _setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(ambientLight);
    }

    /**
     * Create wireframe bounding box for reference
     */
    _createBoundingBox() {
        const { imageWidth, imageHeight } = SeismicConfig;

        const geometry = new THREE.BoxGeometry(imageWidth, imageHeight, imageWidth);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: StyleConfig.boundingBoxColor });

        const wireframe = new THREE.LineSegments(edges, material);
        wireframe.position.set(imageWidth / 2, 0, imageWidth / 2);

        this.scene.add(wireframe);
    }

    /**
     * Setup mouse-based camera orbit controls
     */
    _setupCameraControls() {
        const canvas = this.renderer.domElement;

        canvas.addEventListener('mousedown', (e) => {
            this.orbitState.isDragging = true;
            this.orbitState.previousMouse = { x: e.clientX, y: e.clientY };
        });

        canvas.addEventListener('mouseup', () => {
            this.orbitState.isDragging = false;
        });

        canvas.addEventListener('mousemove', (e) => this._handleMouseMove(e));
        canvas.addEventListener('wheel', (e) => this._handleMouseWheel(e));
    }

    /**
     * Handle mouse drag for rotation
     */
    _handleMouseMove(e) {
        if (!this.orbitState.isDragging) return;

        const deltaX = e.clientX - this.orbitState.previousMouse.x;
        const deltaY = e.clientY - this.orbitState.previousMouse.y;

        this.orbitState.theta -= deltaX * CameraConfig.rotationSpeed;
        this.orbitState.phi -= deltaY * CameraConfig.rotationSpeed;

        // Clamp phi to prevent camera flip
        const EPS = 0.01;
        this.orbitState.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.orbitState.phi));

        this._updateCameraPosition();

        this.orbitState.previousMouse = { x: e.clientX, y: e.clientY };
    }

    /**
     * Handle mouse wheel for zoom
     */
    _handleMouseWheel(e) {
        this.orbitState.radius += e.deltaY * 2;
        this.orbitState.radius = Math.max(
            CameraConfig.minRadius,
            Math.min(CameraConfig.maxRadius, this.orbitState.radius)
        );
        this._updateCameraPosition();
    }

    /**
     * Update camera position based on orbit state
     */
    _updateCameraPosition() {
        const center = CoordinateSystem.getBoundingBoxCenter();
        const target = CoordinateSystem.getCameraTarget();
        const { radius, phi, theta } = this.orbitState;

        const x = center.x + radius * Math.sin(phi) * Math.cos(theta);
        const y = center.y + radius * Math.cos(phi);
        const z = center.z + radius * Math.sin(phi) * Math.sin(theta);

        this.camera.position.set(x, y, z);
        this.camera.lookAt(target.x, target.y, target.z);
    }

    /**
     * Setup window resize handler
     */
    _setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /**
     * Add object to scene
     * @param {THREE.Object3D} object - Object to add
     */
    add(object) {
        this.scene.add(object);
    }

    /**
     * Remove object from scene
     * @param {THREE.Object3D} object - Object to remove
     */
    remove(object) {
        this.scene.remove(object);
    }

    /**
     * Start the render loop
     */
    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    /**
     * Setup mouse interaction for tooltips
     * @private
     */
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

    /**
     * Check if mouse is hovering over a well
     * @private
     */
    _checkWellHover(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check for intersections with all objects
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        let wellFound = false;
        let newHoveredWell = null;
        
        for (let intersect of intersects) {
            // Check if the intersected object is a well
            if (intersect.object.userData && intersect.object.userData.type === 'well') {
                this._showTooltip(intersect.object.userData.name, event.clientX, event.clientY);
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

    /**
     * Show tooltip at mouse position
     * @private
     */
    _showTooltip(wellName, x, y) {
        if (!this.tooltip) return;
        
        this.tooltip.textContent = `Well ${wellName}`;
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = `${x + 15}px`;
        this.tooltip.style.top = `${y + 15}px`;
    }

    /**
     * Hide tooltip
     * @private
     */
    _hideTooltip() {
        if (!this.tooltip) return;
        this.tooltip.style.display = 'none';
    }
}
