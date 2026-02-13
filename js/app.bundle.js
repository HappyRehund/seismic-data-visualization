// ============================================================================
// SEISMIC VIEWER - Single File Bundle
// ============================================================================

// ============================================================================
// CONFIG: seismic.config.js
// ============================================================================
const SeismicConfig = {
    inlineCount: 1092,
    crosslineCount: 549,
    timeSize: 1400,
    imageWidth: 2790,
    imageHeight: 2800,
    depthStep: 1100,
    yTop: 200,
    yBottom: 1600,

    get verticalOffset() {
        return this.timeSize + 200;
    },
    get maxInlineIndex() {
        return this.inlineCount - 1;
    },
    get maxCrosslineIndex() {
        return this.crosslineCount - 1;
    }
};

const CameraConfig = {
    fov: 45,
    near: 100,
    far: 10000,

    initialRadius: 6000,
    initialTheta: Math.PI / 4,
    initialPhi: Math.PI / 3,

    minRadius: 500,
    maxRadius: 10000,

    rotationSpeed: 0.005,
    panSpeed: 2.0,
    zoomSpeed: 1.5
};

const StyleConfig = {
    backgroundColor: 0x111111,
    boundingBoxColor: 0x888888,

    defaultFaultColor: 0xff0000,
    defaultFault3DColor: 0x00ffff,
    defaultWellColor: 0xffff00,

    wellRadius: 10,
    horizonPointSize: 2,

    fault3DOpacity: 0.6
};

const PathConfig = {
    apiBase: 'http://localhost:5000/api',

    getInlinePath(index) {
        return `${this.apiBase}/seismic/inline/${index}`;
    },

    getCrosslinePath(index) {
        return `${this.apiBase}/seismic/crossline/${index}`;
    }
};

// ============================================================================
// CONFIG: well-log.config.js
// ============================================================================
const WellLogConfig = {
    logTypes: {
        'None': { min: 0, max: 1, color: 0xffffff, label: 'None' },
        'GR': {
            min: 0,
            max: 150,
            color: 0x00ff00,
            label: 'Gamma Ray',
            fill: {
                enabled: true,
                color: 0xFF7F7F,
                opacity: 0.6,
                direction: 'right'
            }
        },
        'RT': { min: 0.1, max: 1000, color: 0xff0000, label: 'Resistivity', logScale: true },
        'RHOB': { min: 1.95, max: 2.95, color: 0x0000ff, label: 'Density' },
        'NPHI': { min: 0.45, max: -0.15, color: 0xff00ff, label: 'Neutron Porosity' },
        'DT': { min: 140, max: 40, color: 0x00ffff, label: 'Sonic' },
        'SP': { min: -200, max: 50, color: 0xffff00, label: 'SP' },
        'PHIE': { min: 0, max: 0.4, color: 0x00ff88, label: 'Effective Porosity' },
        'VSH': { min: 0, max: 1, color: 0x8b4513, label: 'Shale Volume' },
        'SWE': { min: 0, max: 1, color: 0x4169e1, label: 'Water Saturation' }
    },
    maxLogWidth: 10,
    tubeRadius: 1,
    curveSegments: 6,
    nullValue: -999.25,
    nullOffset: 0
};

// FaultFileConfig removed – fault list now comes from backend API.

// ============================================================================
// CORE: coordinate-system.js
// ============================================================================
class CoordinateSystem {

    static inlineToX(inline) {
        const normalized = inline / (SeismicConfig.inlineCount - 1);
        return normalized * SeismicConfig.imageWidth;
    }

    static crosslineToZ(crossline) {
        const normalized = crossline / (SeismicConfig.crosslineCount - 1);
        return normalized * SeismicConfig.imageWidth;
    }

    static timeToY(time) {
        return -time + SeismicConfig.verticalOffset;
    }

    static seismicToWorld(point) {
        return new THREE.Vector3(
            this.inlineToX(point.inline || point.inline_n),
            this.timeToY(point.time || point.z),
            this.crosslineToZ(point.crossline || point.crossline_n)
        );
    }

    static indexToPosition(index, maxCount) {
        const normalized = index / (maxCount - 1);
        return normalized * SeismicConfig.imageWidth;
    }

    static getBoundingBoxCenter() {
        return {
            x: SeismicConfig.imageWidth / 2,
            y: SeismicConfig.imageHeight / 2,
            z: SeismicConfig.imageWidth / 2
        };
    }
}

// ============================================================================
// CORE: scene-manager.js
// ============================================================================
class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.orbitState = {
            isDragging: false,
            isPanning: false,
            previousMouse: {
                x: 0,
                y: 0
            },
            theta: CameraConfig.initialTheta,
            phi: CameraConfig.initialPhi,
            radius: CameraConfig.initialRadius,
            targetOffset: {
                x: 0,
                y: 0,
                z: 0
            }
        };

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.tooltip = null;
        this.hoveredWell = null;

        this._lastRaycastTime = 0;
        this._raycastThrottle = 50;

        this._init();
        this._setupMouseInteraction();
    }

    _init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(StyleConfig.backgroundColor);

        this.camera = new THREE.PerspectiveCamera(
            CameraConfig.fov,
            window.innerWidth / window.innerHeight,
            CameraConfig.near,
            CameraConfig.far
        );

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.appendChild(this.renderer.domElement);

        this._setupLighting();
        this._createBoundingBox();
        this._setupCameraControls();
        this._setupResizeHandler();
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

        canvas.addEventListener('mouseleave', () => {
            this.orbitState.isDragging = false;
            this.orbitState.isPanning = false;
        });

        canvas.addEventListener('mousemove', (e) => this._handleMouseMove(e));
        canvas.addEventListener('wheel', (e) => this._handleMouseWheel(e), { passive: true });

        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    _handleMouseMove(e) {
        const deltaX = e.clientX - this.orbitState.previousMouse.x;
        const deltaY = e.clientY - this.orbitState.previousMouse.y;

        if (this.orbitState.isPanning) {
            this._handlePan(deltaX, deltaY);
            this.orbitState.previousMouse = { x: e.clientX, y: e.clientY };
            return;
        }

        if (!this.orbitState.isDragging) return;

        this.orbitState.theta -= deltaX * CameraConfig.rotationSpeed;
        this.orbitState.phi -= deltaY * CameraConfig.rotationSpeed;

        const EPS = 0.01;
        this.orbitState.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.orbitState.phi));

        this._updateCameraPosition();

        this.orbitState.previousMouse = { x: e.clientX, y: e.clientY };
    }

    _handlePan(deltaX, deltaY) {
        const panSpeed = CameraConfig.panSpeed;
        const { theta } = this.orbitState;

        const rightX = -Math.sin(theta);
        const rightZ = Math.cos(theta);

        this.orbitState.targetOffset.x += deltaX * panSpeed * rightX;
        this.orbitState.targetOffset.z += deltaX * panSpeed * rightZ;
        this.orbitState.targetOffset.y += deltaY * panSpeed;

        this._updateCameraPosition();
    }

    _handleMouseWheel(e) {
        const zoomDelta = e.deltaY * CameraConfig.zoomSpeed;
        this.orbitState.radius += zoomDelta;
        this.orbitState.radius = Math.max(
            CameraConfig.minRadius,
            Math.min(CameraConfig.maxRadius, this.orbitState.radius)
        );
        this._updateCameraPosition();
    }

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

        const targetX = center.x + targetOffset.x;
        const targetY = center.y + targetOffset.y;
        const targetZ = center.z + targetOffset.z;

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
        const render = () => {
            requestAnimationFrame(render);
            this.renderer.render(this.scene, this.camera);
        };
        render();
    }

    _setupMouseInteraction() {
        this.tooltip = document.getElementById('wellTooltip');

        if (!this.tooltip) {
            console.warn('Well tooltip element not found');
            return;
        }

        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (this.orbitState.isDragging) {
                this._hideTooltip();
                return;
            }
            this._checkWellHover(event);
        });
    }

    _checkWellHover(e) {
        const now = performance.now();
        if (now - this._lastRaycastTime < this._raycastThrottle) {
            return;
        }
        this._lastRaycastTime = now;

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const wellMeshes = this.scene.children.filter(
            obj => obj.userData && obj.userData.type === 'well'
        );

        const intersects = this.raycaster.intersectObjects(wellMeshes, false);

        let wellFound = false;
        let newHoveredWell = null;

        for (let intersect of intersects) {
            if (intersect.object.userData &&
                intersect.object.userData.type === 'well' &&
                intersect.object.visible) {
                this._showTooltip(intersect.object.userData.name, e.clientX, e.clientY);
                newHoveredWell = intersect.object;
                wellFound = true;
                break;
            }
        }

        if (newHoveredWell !== this.hoveredWell) {
            if (this.hoveredWell && this.hoveredWell.userData.wellInstance) {
                this.hoveredWell.userData.wellInstance.unhighlight();
            }

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

// ============================================================================
// COMPONENTS: fault.js
// ============================================================================
class FaultSegment {
    constructor(sceneManager, point1, point2, name, color = StyleConfig.defaultFaultColor) {
        this.sceneManager = sceneManager;
        this.name = name;
        this.line = null;

        this._create(point1, point2, color);
    }

    _create(point1, point2, color) {
        const v1 = CoordinateSystem.seismicToWorld(point1);
        const v2 = CoordinateSystem.seismicToWorld(point2);

        const geometry = new THREE.BufferGeometry().setFromPoints([v1, v2]);
        const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });

        this.line = new THREE.Line(geometry, material);
        this.sceneManager.add(this.line);
    }

    setVisible(visible) {
        if (this.line) {
            this.line.visible = visible;
        }
    }

    dispose() {
        if (this.line) {
            this.sceneManager.remove(this.line);
            this.line.geometry.dispose();
            this.line.material.dispose();
        }
    }
}

class FaultPanel {
    constructor(sceneManager, p1a, p1b, p2a, p2b, color = StyleConfig.defaultFault3DColor) {
        this.sceneManager = sceneManager;
        this.mesh = null;

        this._create(p1a, p1b, p2a, p2b, color);
    }

    _create(p1a, p1b, p2a, p2b, color) {
        const A = CoordinateSystem.seismicToWorld(p1a);
        const B = CoordinateSystem.seismicToWorld(p1b);
        const C = CoordinateSystem.seismicToWorld(p2a);
        const D = CoordinateSystem.seismicToWorld(p2b);

        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            // Triangle 1
            A.x, A.y, A.z,
            B.x, B.y, B.z,
            C.x, C.y, C.z,
            // Triangle 2
            B.x, B.y, B.z,
            D.x, D.y, D.z,
            C.x, C.y, C.z
        ]);

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        const material = new THREE.MeshPhongMaterial({
            color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: StyleConfig.fault3DOpacity,
            shininess: 50
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.sceneManager.add(this.mesh);
    }

    setVisible(visible) {
        if (this.mesh) {
            this.mesh.visible = visible;
        }
    }

    dispose() {
        if (this.mesh) {
            this.sceneManager.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}

class FaultLoader {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.faults = [];
    }

    loadFaultSurfacesFromJSON(faultData) {
        console.log(`Loading fault surfaces from JSON: ${faultData.filename}`);

        try {
            const sticks = faultData.sticks;
            const sticksSorted = sticks.sort((a, b) => a.stick_id - b.stick_id);

            for (let i = 0; i < sticksSorted.length - 1; i++) {
                const s1 = sticksSorted[i];
                const s2 = sticksSorted[i + 1];

                if (s1.points.length === 2 && s2.points.length === 2) {
                    // Check same fault plane
                    if (s1.points[0].fault_plane !== s2.points[0].fault_plane) continue;

                    const p1 = s1.points;
                    const p2 = s2.points;

                    const panel = new FaultPanel(
                        this.sceneManager,
                        { inline_n: p1[0].inline_n, crossline_n: p1[0].crossline_n, time: p1[0].time, name: p1[0].fault_plane },
                        { inline_n: p1[1].inline_n, crossline_n: p1[1].crossline_n, time: p1[1].time, name: p1[1].fault_plane },
                        { inline_n: p2[0].inline_n, crossline_n: p2[0].crossline_n, time: p2[0].time, name: p2[0].fault_plane },
                        { inline_n: p2[1].inline_n, crossline_n: p2[1].crossline_n, time: p2[1].time, name: p2[1].fault_plane }
                    );
                    this.faults.push(panel);
                }
            }

            console.log(`Fault surfaces loaded from JSON: ${faultData.filename}`);
        } catch (error) {
            console.error('Failed to load fault surface from JSON:', error);
        }
    }

    setAllVisible(visible) {
        this.faults.forEach(f => f.setVisible(visible));
    }

    dispose() {
        this.faults.forEach(f => f.dispose());
        this.faults = [];
    }
}

// ============================================================================
// COMPONENTS: horizon.js
// ============================================================================
class Horizon {

    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.pointCloud = null;
        this.visible = true;

        this.minZ = Infinity;
        this.maxZ = -Infinity;
    }

    loadFromJSON(horizonData) {
        console.log(`Loading horizon: ${horizonData.name}`);

        try {
            const points = horizonData.points;
            if (!points || points.length === 0) {
                console.warn('No valid horizon points found');
                return;
            }

            this.minZ = horizonData.z_min;
            this.maxZ = horizonData.z_max;

            // Build ranges from the data
            let minInline = Infinity, maxInline = -Infinity;
            let minCrossline = Infinity, maxCrossline = -Infinity;

            for (const point of points) {
                minInline = Math.min(minInline, point.inline);
                maxInline = Math.max(maxInline, point.inline);
                minCrossline = Math.min(minCrossline, point.crossline);
                maxCrossline = Math.max(maxCrossline, point.crossline);
            }

            const data = {
                points,
                ranges: {
                    inline: { min: minInline, max: maxInline },
                    crossline: { min: minCrossline, max: maxCrossline },
                    z: { min: this.minZ, max: this.maxZ }
                }
            };

            this._createPointCloud(data);
            console.log(`Horizon loaded: ${points.length} points`);

        } catch (error) {
            console.error('Failed to load horizon:', error);
            throw error;
        }
    }

    _createPointCloud(data) {
        const { points, ranges } = data;
        const positions = [];
        const colors = [];
        const color = new THREE.Color();

        const inlineRange = ranges.inline.max - ranges.inline.min;
        const crosslineRange = ranges.crossline.max - ranges.crossline.min;
        const zRange = ranges.z.max - ranges.z.min;

        for (const point of points) {
            const normInline = (point.inline - ranges.inline.min) / inlineRange;
            const normCrossline = (point.crossline - ranges.crossline.min) / crosslineRange;

            const x = normInline * SeismicConfig.imageWidth;
            const z = normCrossline * SeismicConfig.imageWidth;
            const y = CoordinateSystem.timeToY(point.z);

            positions.push(x, y, z);

            const normalizedZ = (point.z - ranges.z.min) / (zRange / 2);
            color.setHSL(normalizedZ * 0.7, 1.0, 0.5);
            colors.push(color.r, color.g, color.b);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: StyleConfig.horizonPointSize,
            vertexColors: true
        });

        this.pointCloud = new THREE.Points(geometry, material);
        this.sceneManager.add(this.pointCloud);
    }

    setVisible(visible) {
        if (visible === undefined) {
            this.visible = !this.visible;
        } else {
            this.visible = visible;
        }

        if (this.pointCloud) {
            this.pointCloud.visible = this.visible;
        }
    }

    dispose() {
        if (this.pointCloud) {
            this.sceneManager.remove(this.pointCloud);
            this.pointCloud.geometry.dispose();
            this.pointCloud.material.dispose();
            this.pointCloud = null;
        }
    }
}

class HorizonManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.horizons = [];
    }

    addHorizonFromJSON(horizonData) {
        const horizon = new Horizon(this.sceneManager);
        horizon.loadFromJSON(horizonData);
        this.horizons.push(horizon);
        return horizon;
    }

    setAllVisible(visible) {
        this.horizons.forEach(h => h.setVisible(visible));
    }

    getAll() {
        return this.horizons;
    }
}

// ============================================================================
// COMPONENTS: seismic-plane.js
// ============================================================================
class SeismicPlaneBase {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.plane = null;
        this.loader = new THREE.TextureLoader();
        this.currentIndex = 0;
    }

    _createPlane(texture) {
        const geometry = new THREE.PlaneGeometry(
            SeismicConfig.imageWidth,
            SeismicConfig.imageHeight
        );
        geometry.translate(SeismicConfig.imageWidth / 2, 0, 0);

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true
        });

        return new THREE.Mesh(geometry, material);
    }

    _updateTexture(path) {
        this.loader.load(path, (texture) => {
            texture.generateMipmaps = false;
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            texture.needsUpdate = true;

            if (this.plane) {
                this.plane.material.map = texture;
                this.plane.material.needsUpdate = true;
            }
        });
    }

    setIndex(index) {
        this.currentIndex = index;
        this._updatePosition();
        this._loadTexture();
    }

    _updatePosition() {
        throw new Error('Must implement _updatePosition');
    }

    _loadTexture() {
        throw new Error('Must implement _loadTexture');
    }

    _getImagePath(index) {
        throw new Error('Must implement _getImagePath');
    }
}

class InlinePlane extends SeismicPlaneBase {
    constructor(sceneManager) {
        super(sceneManager);
        this._initialize();
    }

    _initialize() {
        this.loader.load(PathConfig.getInlinePath(0), (texture) => {
            this.plane = this._createPlane(texture);
            this.plane.rotation.y = -Math.PI / 2;
            this.plane.position.set(0, 0, 0);
            this.sceneManager.add(this.plane);
        });
    }

    _updatePosition() {
        if (this.plane) {
            const x = CoordinateSystem.indexToPosition(
                this.currentIndex,
                SeismicConfig.inlineCount
            );
            this.plane.position.x = x;
        }
    }

    _loadTexture() {
        this._updateTexture(PathConfig.getInlinePath(this.currentIndex));
    }

    static getMaxIndex() {
        return SeismicConfig.maxInlineIndex;
    }
}

class CrosslinePlane extends SeismicPlaneBase {
    constructor(sceneManager) {
        super(sceneManager);
        this._initialize();
    }

    _initialize() {
        this.loader.load(PathConfig.getCrosslinePath(0), (texture) => {
            this.plane = this._createPlane(texture);
            this.plane.rotation.y = 0;
            this.plane.position.set(0, 0, 0);
            this.sceneManager.add(this.plane);
        });
    }

    _updatePosition() {
        if (this.plane) {
            const z = CoordinateSystem.indexToPosition(
                this.currentIndex,
                SeismicConfig.crosslineCount
            );
            this.plane.position.z = z;
        }
    }

    _loadTexture() {
        this._updateTexture(PathConfig.getCrosslinePath(this.currentIndex));
    }

    static getMaxIndex() {
        return SeismicConfig.maxCrosslineIndex;
    }
}

// ============================================================================
// COMPONENTS: well-log.js
// ============================================================================
class WellLogFill {
    constructor(wellLog, curvePoints, fillConfig) {
        this.wellLog = wellLog;
        this.curvePoints = curvePoints;
        this.fillConfig = fillConfig;
        this.mesh = null;

        this._create();
    }

    _create() {
        if (this.curvePoints.length < 2) return;

        const geometry = this._generateFillGeometry();
        if (!geometry) return;

        const material = new THREE.MeshBasicMaterial({
            color: this.fillConfig.color,
            transparent: true,
            opacity: this.fillConfig.opacity,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.renderOrder = 0.5;
        this.mesh.userData = {
            type: 'wellLogFill',
            wellName: this.wellLog.well.name,
            logType: this.wellLog.logType
        };

        this.wellLog.well.sceneManager.add(this.mesh);
    }

    _generateFillGeometry() {
        const vertices = [];
        const indices = [];

        const wellX = this.wellLog.well.mesh.position.x;
        const wellZ = this.wellLog.well.mesh.position.z;

        const direction = this.fillConfig.direction || 'right';
        const referenceX = direction === 'right'
            ? wellX + WellLogConfig.maxLogWidth
            : wellX - WellLogConfig.maxLogWidth;

        for (let i = 0; i < this.curvePoints.length; i++) {
            const curvePoint = this.curvePoints[i];
            vertices.push(curvePoint.x, curvePoint.y, curvePoint.z);
            vertices.push(referenceX, curvePoint.y, wellZ);
        }

        for (let i = 0; i < this.curvePoints.length - 1; i++) {
            const curveIdx1 = i * 2;
            const refIdx1 = i * 2 + 1;
            const curveIdx2 = (i + 1) * 2;
            const refIdx2 = (i + 1) * 2 + 1;

            indices.push(curveIdx1, refIdx1, curveIdx2);
            indices.push(curveIdx2, refIdx1, refIdx2);
        }

        if (vertices.length === 0) return null;

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        return geometry;
    }

    setVisible(visible) {
        if (this.mesh) {
            this.mesh.visible = visible;
        }
    }

    dispose() {
        if (this.mesh) {
            this.wellLog.well.sceneManager.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
    }
}

class WellLog {
    constructor(well, logData, logType = 'GR') {
        this.well = well;
        this.logData = logData;
        this.logType = logType;
        this.mesh = null;
        this.fill = null;
        this.config = WellLogConfig.logTypes[logType] || WellLogConfig.logTypes['GR'];

        if (logType !== 'None' && logData && logData.length > 0) {
            this._create();
        }
    }

    _create() {
        const points = this._generateCurvePoints();

        if (points.length < 2) {
            console.warn(`Not enough valid points for log ${this.logType} on well ${this.well.name}`);
            return;
        }

        const curve = new THREE.CatmullRomCurve3(points);

        const geometry = new THREE.TubeGeometry(
            curve,
            Math.max(points.length * 2, 50),
            WellLogConfig.tubeRadius,
            WellLogConfig.curveSegments,
            false
        );

        const material = new THREE.MeshPhongMaterial({
            color: this.config.color,
            shininess: 60,
            transparent: true,
            opacity: 0.95
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.renderOrder = 1;
        this.mesh.userData = {
            type: 'wellLog',
            wellName: this.well.name,
            logType: this.logType
        };

        this.well.sceneManager.add(this.mesh);

        this._createFill(points);
    }

    _createFill(curvePoints) {
        if (this.config.fill && this.config.fill.enabled) {
            this.fill = new WellLogFill(this, curvePoints, this.config.fill);
        }
    }

    _generateCurvePoints() {
        const points = [];
        const wellPos = this.well.mesh.position;

        const wellX = wellPos.x;
        const wellZ = wellPos.z;

        const wellMesh = this.well.mesh;
        const wellHeight = wellMesh.geometry.parameters.height;
        const wellCenterY = wellMesh.position.y;
        const wellTopY = wellCenterY + wellHeight / 2;
        const wellBottomY = wellCenterY - wellHeight / 2;

        const sortedData = [...this.logData].sort((a, b) => a.depth - b.depth);

        if (sortedData.length === 0) return points;

        const validDepths = sortedData.filter(d => !isNaN(d.depth)).map(d => d.depth);
        if (validDepths.length === 0) return points;

        const minDepth = Math.min(...validDepths);
        const maxDepth = Math.max(...validDepths);
        const depthRange = maxDepth - minDepth;

        if (depthRange === 0) return points;

        let minVal = this.config.min;
        let maxVal = this.config.max;

        const useLogScale = this.config.logScale || false;

        for (const data of sortedData) {
            if (isNaN(data.depth)) continue;

            let offset;
            const isNull = data.value === null ||
                        data.value === WellLogConfig.nullValue ||
                        isNaN(data.value);

            if (isNull) {
                offset = WellLogConfig.nullOffset;
            } else {
                let normalizedValue;

                if (useLogScale) {
                    const logMin = Math.log10(Math.max(minVal, 0.001));
                    const logMax = Math.log10(Math.max(maxVal, 0.001));
                    const logVal = Math.log10(Math.max(data.value, 0.001));
                    normalizedValue = (logVal - logMin) / (logMax - logMin);
                } else {
                    normalizedValue = (data.value - minVal) / (maxVal - minVal);
                }

                normalizedValue = Math.max(0, Math.min(1, normalizedValue));

                offset = (normalizedValue * 2 - 1) * WellLogConfig.maxLogWidth;
            }

            const depthNormalized = (data.depth - minDepth) / depthRange;
            const y = wellTopY - depthNormalized * wellHeight;

            points.push(new THREE.Vector3(
                wellX + offset,
                y,
                wellZ
            ));
        }

        return points;
    }

    setVisible(visible) {
        if (this.mesh) {
            this.mesh.visible = visible;
        }
        if (this.fill) {
            this.fill.setVisible(visible);
        }
    }

    dispose() {
        if (this.fill) {
            this.fill.dispose();
            this.fill = null;
        }

        if (this.mesh) {
            this.well.sceneManager.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
    }
}

class WellLogData {
    constructor(wellName) {
        this.wellName = wellName;
        this.logs = {};
        this.depthRange = { min: Infinity, max: -Infinity };
    }

    addDataPoint(depth, logValues) {
        if (depth < this.depthRange.min) this.depthRange.min = depth;
        if (depth > this.depthRange.max) this.depthRange.max = depth;

        for (const [logType, value] of Object.entries(logValues)) {
            if (!this.logs[logType]) {
                this.logs[logType] = [];
            }
            this.logs[logType].push({ depth, value });
        }
    }

    getLogData(logType) {
        return this.logs[logType] || [];
    }

    getAvailableLogs() {
        return Object.keys(this.logs).filter(log =>
            this.logs[log].some(d => d.value !== null && d.value !== WellLogConfig.nullValue)
        );
    }
}

class WellLogLoader {
    constructor() {
        this.wellLogs = new Map();
        this.availableLogTypes = new Set();
    }

    loadFromJSON(apiData) {
        console.log('Loading well logs from API...');

        try {
            const { well_logs, available_log_types } = apiData;

            this.availableLogTypes = new Set(available_log_types || []);

            for (const wellLog of well_logs) {
                const wellName = wellLog.well_name;
                const wellLogData = new WellLogData(wellName);

                for (const dp of wellLog.data) {
                    const logValues = {};
                    for (const logType of (wellLog.available_logs || [])) {
                        const key = logType.toLowerCase();
                        logValues[logType] = dp[key] !== null && dp[key] !== undefined ? dp[key] : null;
                    }
                    wellLogData.addDataPoint(dp.tvdss, logValues);
                }

                this.wellLogs.set(wellName, wellLogData);

                // Create normalized name mappings
                const normalizedNames = this._getNormalizedNames(wellName);
                for (const normName of normalizedNames) {
                    if (!this.wellLogs.has(normName)) {
                        this.wellLogs.set(normName, wellLogData);
                    }
                }
            }

            console.log(`Well logs loaded for ${well_logs.length} wells`);
            console.log(`Available log types: ${[...this.availableLogTypes].join(', ')}`);

        } catch (error) {
            console.error('Failed to load well logs:', error);
        }
    }

    _getNormalizedNames(wellName) {
        const names = [];

        const match = wellName.match(/^GNK-(\d+)$/i);
        if (match) {
            const numPart = match[1];
            names.push(numPart);
            names.push(numPart.replace(/^0+/, ''));
            names.push(numPart.padStart(3, '0'));
        }

        if (/^\d+$/.test(wellName)) {
            names.push(`GNK-${wellName}`);
            names.push(`GNK-${wellName.padStart(3, '0')}`);
            names.push(wellName.replace(/^0+/, ''));
            names.push(wellName.padStart(3, '0'));
        }

        return names;
    }

    getWellLogData(wellName) {
        return this.wellLogs.get(wellName);
    }

    getAvailableLogTypes() {
        return ['None', ...this.availableLogTypes];
    }

    hasLogsForWell(wellName) {
        return this.wellLogs.has(wellName);
    }
}

// ============================================================================
// COMPONENTS: well.js
// ============================================================================
class WellLabel {

    constructor(well, text) {
        this.well = well;
        this.text = text;
        this.sprite = null;

        this._create();
    }

    _create() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const fontSize = 48;
        const padding = 20;
        context.font = `bold ${fontSize}px Arial`;
        const textMetrics = context.measureText(this.text);

        canvas.width = textMetrics.width + padding * 2;
        canvas.height = fontSize + padding * 2;

        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this._roundRect(context, 0, 0, canvas.width, canvas.height, 8);
        context.fill();

        context.font = `bold ${fontSize}px Arial`;
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });

        this.sprite = new THREE.Sprite(material);

        const aspectRatio = canvas.width / canvas.height;
        const labelHeight = 15;
        this.sprite.scale.set(labelHeight * aspectRatio, labelHeight, 1);

        this._updatePosition();

        this.sprite.renderOrder = 100;

        this.sprite.userData = {
            type: 'wellLabel',
            wellName: this.well.name
        };

        this.well.sceneManager.add(this.sprite);
    }

    _roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    _updatePosition() {
        if (!this.sprite || !this.well.mesh) return;

        const wellMesh = this.well.mesh;
        const wellHeight = wellMesh.geometry.parameters.height;
        const wellTopY = wellMesh.position.y + wellHeight / 2;

        this.sprite.position.set(
            wellMesh.position.x,
            wellTopY + 20,
            wellMesh.position.z
        );
    }

    setVisible(visible) {
        if (this.sprite) {
            this.sprite.visible = visible;
        }
    }

    dispose() {
        if (this.sprite) {
            this.well.sceneManager.remove(this.sprite);
            this.sprite.material.map.dispose();
            this.sprite.material.dispose();
            this.sprite = null;
        }
    }
}

class Well {
    constructor(sceneManager, name, inline, crossline, timeStart, timeEnd,
                radius = StyleConfig.wellRadius, color = StyleConfig.defaultWellColor) {
        this.sceneManager = sceneManager;
        this.name = name;
        this.mesh = null;
        this.originalColor = color;
        this.isHighlighted = false;

        this.logData = null;
        this.currentLogType = 'None';
        this.wellLog = null;

        this.label = null;

        this._create(inline, crossline, timeStart, timeEnd, radius, color);
        this._createLabel();
    }

    _createLabel() {
        this.label = new WellLabel(this, this.name);
    }

    _create(inline, crossline, timeStart, timeEnd, radius, color) {
        const x = ((inline - 1) / (SeismicConfig.inlineCount - 1)) * SeismicConfig.imageWidth;
        const z = ((crossline - 1) / (SeismicConfig.crosslineCount - 1)) * SeismicConfig.imageWidth;

        const yTop = this._mapTimeToY(timeStart);
        const yBottom = this._mapTimeToY(timeEnd);

        const height = Math.abs(
            ((yTop - yBottom) / SeismicConfig.timeSize) * SeismicConfig.imageHeight
        );
        const centerY = (yTop + yBottom) / 2;

        const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
        const material = new THREE.MeshPhongMaterial({
            color,
            shininess: 100,
            transparent: true,
            opacity: 0.4,
            depthWrite: false
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.renderOrder = 0;
        this.mesh.position.set(
            x,
            -centerY / SeismicConfig.timeSize * SeismicConfig.imageHeight + SeismicConfig.timeSize,
            z
        );

        this.mesh.userData = {
            type: 'well',
            name: this.name,
            wellInstance: this
        };

        this.sceneManager.add(this.mesh);
    }

    _mapTimeToY(time) {
        return time - 200;
    }

    setVisible(visible) {
        if (this.mesh) this.mesh.visible = visible;
        if (this.wellLog) this.wellLog.setVisible(visible);
        if (this.label) this.label.setVisible(visible);
    }

    highlight() {
        if (this.mesh && !this.isHighlighted) {
            const color = new THREE.Color(this.originalColor);
            color.multiplyScalar(0.6);
            this.mesh.material.color.copy(color);
            this.isHighlighted = true;
        }
    }

    unhighlight() {
        if (this.mesh && this.isHighlighted) {
            this.mesh.material.color.set(this.originalColor);
            this.isHighlighted = false;
        }
    }

    setLogData(logData) {
        this.logData = logData;
    }

    setLogType(logType) {
        if (this.wellLog) {
            this.wellLog.dispose();
            this.wellLog = null;
        }

        this.currentLogType = logType;

        if (logType !== 'None' && this.logData) {
            const logDataArray = this.logData.getLogData(logType);
            if (logDataArray && logDataArray.length > 0) {
                this.wellLog = new WellLog(this, logDataArray, logType);

                if (this.mesh && this.wellLog) {
                    this.wellLog.setVisible(this.mesh.visible);
                }
            }
        }
    }

    getAvailableLogs() {
        if (!this.logData) return ['None'];
        return ['None', ...this.logData.getAvailableLogs()];
    }

    getCurrentLogType() {
        return this.currentLogType;
    }

    dispose() {
        if (this.label) {
            this.label.dispose();
            this.label = null;
        }

        if (this.wellLog) {
            this.wellLog.dispose();
            this.wellLog = null;
        }
        if (this.mesh) {
            this.sceneManager.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}

class WellLoader {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.wells = [];
        this.wellsMap = new Map();
        this.onWellsLoaded = null;
    }

    loadFromJSON(apiData, defaultTimeEnd = 1200) {
        console.log('Loading wells from API...');

        try {
            const { wells: wellDataList } = apiData;

            const coordinateMap = new Map();

            for (const wd of wellDataList) {
                const inline = wd.inline_n;
                const crossline = wd.crossline_n;
                const name = wd.well_name;

                if (isNaN(inline) || isNaN(crossline) || !name) continue;

                const coordKey = `${inline},${crossline}`;

                if (!coordinateMap.has(coordKey)) {
                    coordinateMap.set(coordKey, {
                        primary: { inline, crossline, name },
                        duplicates: []
                    });
                } else {
                    coordinateMap.get(coordKey).duplicates.push(name);
                }
            }

            for (const [coordKey, coordData] of coordinateMap) {
                const { primary, duplicates } = coordData;

                if (this.wellsMap.has(primary.name)) {
                    console.log(`Skipping duplicate well name: ${primary.name}`);
                    continue;
                }

                if (duplicates.length > 0) {
                    console.log(`Well ${primary.name} has duplicates at same location: ${duplicates.join(', ')}`);
                }

                const well = new Well(
                    this.sceneManager,
                    primary.name,
                    primary.inline,
                    primary.crossline,
                    0,
                    defaultTimeEnd
                );

                well.duplicateNames = duplicates;

                this.wells.push(well);
                this.wellsMap.set(primary.name, well);

                for (const dupName of duplicates) {
                    if (!this.wellsMap.has(dupName)) {
                        this.wellsMap.set(dupName, well);
                    }
                }
            }

            console.log(`Wells loaded: ${this.wells.length}`);

            if (this.onWellsLoaded) {
                this.onWellsLoaded(this.getWellNames());
            }
        } catch (error) {
            console.error('Failed to load wells:', error);
        }
    }

    getWellNames() {
        return this.wells.map(w => w.name);
    }

    getWell(name) {
        return this.wellsMap.get(name);
    }

    setWellVisible(name, visible) {
        const well = this.wellsMap.get(name);
        if (well) {
            well.setVisible(visible);
        }
    }

    setAllVisible(visible) {
        this.wells.forEach(w => w.setVisible(visible));
    }

    attachLogData(wellLogLoader) {
        let attachedCount = 0;

        for (const [name, well] of this.wellsMap) {
            const namesToTry = [
                name,
                `GNK-${name}`,
                `GNK-0${name}`,
                name.replace(/^0+/, ''),
                `GNK-${name.replace(/^0+/, '')}`,
                name.padStart(3, '0'),
                `GNK-${name.padStart(3, '0')}`,
            ];

            let logData = null;
            let matchedName = null;

            for (const tryName of namesToTry) {
                logData = wellLogLoader.getWellLogData(tryName);
                if (logData) {
                    matchedName = tryName;
                    break;
                }
            }

            if (logData) {
                well.setLogData(logData);
                attachedCount++;
                console.log(`Attached log data to well ${name} (matched as ${matchedName})`);
            }
        }

        console.log(`Total wells with log data: ${attachedCount}/${this.wellsMap.size}`);
    }

    setWellLogType(wellName, logType) {
        const well = this.wellsMap.get(wellName);
        if (well) {
            well.setLogType(logType);
        }
    }

    getWellAvailableLogs(wellName) {
        const well = this.wellsMap.get(wellName);
        return well ? well.getAvailableLogs() : ['None'];
    }

    getWellCurrentLogType(wellName) {
        const well = this.wellsMap.get(wellName);
        return well ? well.getCurrentLogType() : 'None';
    }

    setAllWellsLogType(logType) {
        let changedCount = 0;
        for (const well of this.wells) {
            if (well.logData) {
                well.setLogType(logType);
                changedCount++;
            }
        }
        console.log(`Set ${changedCount} wells to log type: ${logType}`);
        return changedCount;
    }

    dispose() {
        this.wells.forEach(w => w.dispose());
        this.wells = [];
        this.wellsMap.clear();
    }
}

// ============================================================================
// FACADE: scene.facade.js
// ============================================================================
class SceneFacade {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
    }

    resetCamera() {
        this.sceneManager.resetCamera();
    }

    getCameraPosition() {
        const pos = this.sceneManager.camera.position;
        return { x: pos.x, y: pos.y, z: pos.z };
    }

    getOrbitState() {
        const { theta, phi, radius } = this.sceneManager.orbitState;
        return { theta, phi, radius };
    }

    setOrbitState(theta, phi, radius) {
        Object.assign(this.sceneManager.orbitState, { theta, phi, radius });
        this.sceneManager._updateCameraPosition();
    }

    add(object) {
        this.sceneManager.add(object);
    }

    remove(object) {
        this.sceneManager.remove(object);
    }

    getScene() {
        return this.sceneManager.scene;
    }

    getCamera() {
        return this.sceneManager.camera;
    }

    getRenderer() {
        return this.sceneManager.renderer;
    }

    startRenderLoop() {
        this.sceneManager.startRenderLoop();
    }

    render() {
        this.sceneManager.renderer.render(
            this.sceneManager.scene,
            this.sceneManager.camera
        );
    }

    getSceneManager() {
        return this.sceneManager;
    }
}

// ============================================================================
// FACADE: seismic-plane.facade.js
// ============================================================================
class SeismicPlaneFacade {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.inlinePlane = new InlinePlane(sceneManager);
        this.crosslinePlane = new CrosslinePlane(sceneManager);
    }

    setInlineIndex(index) {
        this.inlinePlane.setIndex(Math.max(0, Math.min(index, InlinePlane.getMaxIndex())));
    }

    setCrosslineIndex(index) {
        this.crosslinePlane.setIndex(Math.max(0, Math.min(index, CrosslinePlane.getMaxIndex())));
    }

    setIndices(inlineIndex, crosslineIndex) {
        this.setInlineIndex(inlineIndex);
        this.setCrosslineIndex(crosslineIndex);
    }

    getIndices() {
        return {
            inline: this.inlinePlane.currentIndex,
            crossline: this.crosslinePlane.currentIndex
        };
    }

    getMaxInlineIndex() {
        return InlinePlane.getMaxIndex();
    }

    getMaxCrosslineIndex() {
        return CrosslinePlane.getMaxIndex();
    }

    getPlanes() {
        return {
            inline: this.inlinePlane, crossline: this.crosslinePlane
        };
    }

    dispose() {
        [this.inlinePlane, this.crosslinePlane].forEach(plane => {
            if (plane?.plane) {
                this.sceneManager.remove(plane.plane);
                plane.plane.geometry.dispose();
                plane.plane.material.dispose();
            }
        });
    }
}

// ============================================================================
// FACADE: fault.facade.js
// ============================================================================
class FaultFacade {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.faultLoader = new FaultLoader(sceneManager);
        this.isVisible = true;
        this.isLoaded = false;
    }

    show() {
        this.setVisible(true);
    }

    hide() {
        this.setVisible(false);
    }

    toggle() {
        this.setVisible(!this.isVisible);
        return this.isVisible;
    }

    setVisible(visible) {
        this.faultLoader.setAllVisible(visible);
        this.isVisible = visible;
    }

    getFaultCount() {
        return this.faultLoader.faults.length;
    }

    getVisible() {
        return this.isVisible;
    }

    hasLoaded() {
        return this.isLoaded && this.faultLoader.faults.length > 0;
    }

    getLoader() {
        return this.faultLoader;
    }

    dispose() {
        this.faultLoader.dispose();
        this.isLoaded = false;
    }
}

// ============================================================================
// FACADE: horizon.facade.js
// ============================================================================
class HorizonFacade {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.horizonManager = new HorizonManager(sceneManager);
        this.isVisible = true;
    }

    show() {
        this.setVisible(true);
    }

    hide() {
        this.setVisible(false);
    }

    toggle() {
        this.setVisible(!this.isVisible);
        return this.isVisible;
    }

    setVisible(visible) {
        this.horizonManager.setAllVisible(visible);
        this.isVisible = visible;
    }

    getHorizonCount() {
        return this.horizonManager.getAll().length;
    }

    getVisible() {
        return this.isVisible;
    }

    getAll() {
        return this.horizonManager.getAll();
    }

    getManager() {
        return this.horizonManager;
    }

    dispose() {
        this.horizonManager.getAll().forEach(h => h.dispose());
    }
}

// ============================================================================
// FACADE: well.facade.js
// ============================================================================
class WellFacade {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.wellLoader = new WellLoader(sceneManager);
        this.wellLogLoader = new WellLogLoader();
        this.isVisible = true;
    }

    show() {
        this.setAllVisible(true);
    }

    hide() {
        this.setAllVisible(false);
    }

    toggle() {
        this.setAllVisible(!this.isVisible);
        return this.isVisible;
    }

    setAllVisible(visible) {
        this.wellLoader.setAllVisible(visible);
        this.isVisible = visible;
    }

    setWellVisible(wellName, visible) {
        this.wellLoader.setWellVisible(wellName, visible);
    }

    setWellLogType(wellName, logType) {
        this.wellLoader.setWellLogType(wellName, logType);
    }

    setAllWellsLogType(logType) {
        this.wellLoader.setAllWellsLogType(logType);
    }

    getWellAvailableLogs(wellName) {
        return this.wellLoader.getWellAvailableLogs(wellName);
    }

    getWellNames() {
        return this.wellLoader.getWellNames();
    }

    getWell(name) {
        return this.wellLoader.getWell(name);
    }

    getWellCount() {
        return this.wellLoader.wells.length;
    }

    getVisible() {
        return this.isVisible;
    }

    getWellLoader() {
        return this.wellLoader;
    }

    getWellLogLoader() {
        return this.wellLogLoader;
    }

    dispose() {
        this.wellLoader.dispose();
    }
}

// ============================================================================
// DATA: api-client.js
// ============================================================================
class ApiClient {
    constructor(baseUrl = 'http://localhost:5000/api') {
        this.baseUrl = baseUrl;
    }

    async fetch(endpoint) {
        const url = `${this.baseUrl}/${endpoint}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`API fetch failed: ${response.status} for ${url}`);
        }

        return await response.json();
    }

    async isAvailable() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            return response.ok;
        } catch (error) {
            console.log(`API not available: ${error.message}`);
            return false;
        }
    }
}

const apiClient = new ApiClient();

class LoadingStateManager {
    constructor() {
        this.tasks = new Map();
        this.listeners = [];
        this.isComplete = false;
    }

    registerTask(taskId, label) {
        this.tasks.set(taskId, {
            id: taskId,
            label,
            status: 'pending',
            progress: 0,
            message: ''
        });
        this._notifyListeners();
    }

    updateTask(taskId, state) {
        const task = this.tasks.get(taskId);
        if (task) {
            Object.assign(task, state);
            this._notifyListeners();
        }
    }

    completeTask(taskId, success = true, message = '') {
        this.updateTask(taskId, {
            status: success ? 'success' : 'error',
            progress: 100,
            message
        });
        this._checkAllComplete();
    }

    skipTask(taskId, reason = '') {
        this.updateTask(taskId, {
            status: 'skipped',
            progress: 100,
            message: reason
        });
        this._checkAllComplete();
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    getState() {
        const tasks = Array.from(this.tasks.values());
        const totalProgress = tasks.length > 0
            ? tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length
            : 0;

        return {
            tasks,
            totalProgress,
            isComplete: this.isComplete,
            hasErrors: tasks.some(t => t.status === 'error'),
            currentTask: tasks.find(t => t.status === 'loading')?.label || null
        };
    }

    _checkAllComplete() {
        const tasks = Array.from(this.tasks.values());
        this.isComplete = tasks.every(t =>
            t.status === 'success' || t.status === 'error' || t.status === 'skipped'
        );
        if (this.isComplete) {
            this._notifyListeners();
        }
    }

    _notifyListeners() {
        const state = this.getState();
        this.listeners.forEach(callback => callback(state));
    }
}

const loadingStateManager = new LoadingStateManager();

// ============================================================================
// DATA: data-loader.js
// ============================================================================
class DataLoadingOrchestrator {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.horizonManager = null;
        this.faultLoader = null;
        this.wellLoader = null;
        this.wellLogLoader = null;
    }

    async loadAll() {
        loadingStateManager.registerTask('horizon', 'Horizons');
        loadingStateManager.registerTask('well', 'Wells');
        loadingStateManager.registerTask('wellLog', 'Well Logs');
        loadingStateManager.registerTask('fault', 'Faults');

        // ── Horizons ──
        this.horizonManager = new HorizonManager(this.sceneManager);
        try {
            loadingStateManager.updateTask('horizon', { status: 'loading', progress: 0 });
            const horizonData = await apiClient.fetch('horizons?z_columns=top,bottom');
            for (const h of horizonData.horizons) {
                this.horizonManager.addHorizonFromJSON(h);
            }
            loadingStateManager.completeTask('horizon', true, 'Loaded');
        } catch (error) {
            console.warn('Horizon loading failed:', error);
            loadingStateManager.completeTask('horizon', false, 'Failed');
        }

        // ── Wells ──
        this.wellLoader = new WellLoader(this.sceneManager);
        try {
            loadingStateManager.updateTask('well', { status: 'loading', progress: 0 });
            const wellData = await apiClient.fetch('wells');
            this.wellLoader.loadFromJSON(wellData);
            loadingStateManager.completeTask('well', true, 'Loaded');
        } catch (error) {
            console.warn('Well loading failed:', error);
            loadingStateManager.completeTask('well', false, 'Failed');
        }

        // ── Well Logs ──
        this.wellLogLoader = new WellLogLoader();
        try {
            loadingStateManager.updateTask('wellLog', { status: 'loading', progress: 0 });
            const wellLogData = await apiClient.fetch('well-logs');
            this.wellLogLoader.loadFromJSON(wellLogData);

            if (this.wellLoader && this.wellLogLoader) {
                this.wellLoader.attachLogData(this.wellLogLoader);
            }
            loadingStateManager.completeTask('wellLog', true, 'Loaded');
        } catch (error) {
            console.warn('Well log loading failed:', error);
            loadingStateManager.skipTask('wellLog', 'No data');
        }

        // ── Faults ──
        this.faultLoader = new FaultLoader(this.sceneManager);
        try {
            loadingStateManager.updateTask('fault', { status: 'loading', progress: 0 });
            const faultData = await apiClient.fetch('faults');
            const totalFaults = faultData.faults.length;
            let loadedCount = 0;

            for (const fault of faultData.faults) {
                this.faultLoader.loadFaultSurfacesFromJSON(fault);
                loadedCount++;
                loadingStateManager.updateTask('fault', {
                    status: 'loading',
                    progress: Math.round((loadedCount / totalFaults) * 100),
                    message: `Loaded ${loadedCount}/${totalFaults}`
                });
            }
            loadingStateManager.completeTask('fault', true, 'Loaded');
        } catch (error) {
            console.warn('Fault loading failed:', error);
            loadingStateManager.completeTask('fault', false, 'Failed');
        }

        return {
            horizonManager: this.horizonManager,
            faultLoader: this.faultLoader,
            wellLoader: this.wellLoader,
            wellLogLoader: this.wellLogLoader,
            dataSource: 'API'
        };
    }
}

// ============================================================================
// UI: ui-controls.js
// ============================================================================
class SliderControl {
    constructor(sliderId, labelId, maxValue, onChange) {
        this.slider = document.getElementById(sliderId);
        this.label = document.getElementById(labelId);
        this.onChange = onChange;

        if (this.slider) {
            this._init(maxValue);
        }
    }

    _init(maxValue) {
        this.slider.max = maxValue;
        this.slider.value = 0;

        this.slider.addEventListener('input', () => {
            const value = parseInt(this.slider.value);
            this._updateLabel(value);

            if (this.onChange) {
                this.onChange(value);
            }
        });
    }

    _updateLabel(value) {
        if (this.label) {
            this.label.textContent = value.toString();
        }
    }

    setValue(value) {
        if (this.slider) {
            this.slider.value = value;
            this._updateLabel(value);
        }
    }

    getValue() {
        return this.slider ? parseInt(this.slider.value) : 0;
    }
}

class ToggleButton {
    constructor(buttonId, showText, hideText, onToggle) {
        this.button = document.getElementById(buttonId);
        this.showText = showText;
        this.hideText = hideText;
        this.onToggle = onToggle;
        this.isActive = true;

        if (this.button) {
            this._init();
        }
    }

    _init() {
        this.button.textContent = this.hideText;

        this.button.addEventListener('click', () => {
            this.isActive = !this.isActive;
            this._updateText();

            if (this.onToggle) {
                this.onToggle(this.isActive);
            }
        });
    }

    _updateText() {
        this.button.textContent = this.isActive ? this.hideText : this.showText;
    }
}

class WellTogglePanel {
    constructor(containerId, toggleAllBtnId, wellLoader) {
        this.container = document.getElementById(containerId);
        this.toggleAllBtn = document.getElementById(toggleAllBtnId);
        this.setAllLogTypeSelect = document.getElementById('setAllLogTypeSelect');
        this.wellLoader = wellLoader;
        this.checkboxes = new Map();
        this.logSelectors = new Map();
        this.allVisible = true;

        this._initToggleAllButton();
        this._initSetAllLogType();
    }

    _initToggleAllButton() {
        if (this.toggleAllBtn) {
            this.toggleAllBtn.addEventListener('click', () => {
                this.allVisible = !this.allVisible;
                this.toggleAllBtn.textContent = this.allVisible ? 'Hide All' : 'Show All';
                this.wellLoader.setAllVisible(this.allVisible);

                this.checkboxes.forEach((checkbox) => {
                    checkbox.checked = this.allVisible;
                });
            });
        }
    }

    _initSetAllLogType() {
        if (this.setAllLogTypeSelect) {
            this.setAllLogTypeSelect.addEventListener('change', () => {
                const selectedLogType = this.setAllLogTypeSelect.value;
                if (selectedLogType && selectedLogType !== '') {
                    this.wellLoader.setAllWellsLogType(selectedLogType);

                    this.logSelectors.forEach((select) => {
                        if ([...select.options].some(opt => opt.value === selectedLogType)) {
                            select.value = selectedLogType;
                        }
                    });

                    this.setAllLogTypeSelect.value = '';
                }
            });
        }
    }

    populateWells(wellNames) {
        if (!this.container) return;

        this.container.innerHTML = '';
        this.checkboxes.clear();
        this.logSelectors.clear();

        if (wellNames.length === 0) {
            this.container.innerHTML = '<div style="color: #888; font-style: italic;">No wells found</div>';
            return;
        }

        const sortedNames = [...wellNames].sort((a, b) => {
            const matchA = a.match(/(\d+)/);
            const matchB = b.match(/(\d+)/);
            if (matchA && matchB) {
                return parseInt(matchA[1]) - parseInt(matchB[1]);
            }
            return a.localeCompare(b);
        });

        sortedNames.forEach(name => {
            const wellItem = document.createElement('div');
            wellItem.className = 'well-item';

            const well = this.wellLoader.getWell(name);
            const hasDuplicates = well && well.duplicateNames && well.duplicateNames.length > 0;

            const label = document.createElement('span');
            label.className = 'well-name';

            if (hasDuplicates) {
                label.textContent = `${name} (+${well.duplicateNames.length})`;
                label.title = `Includes: ${well.duplicateNames.join(', ')}`;
                label.style.cursor = 'help';
            } else {
                label.textContent = name;
            }

            const logSelect = document.createElement('select');
            logSelect.className = 'well-log-select';
            logSelect.id = `welllog_${name}`;

            const availableLogs = this.wellLoader.getWellAvailableLogs(name);
            availableLogs.forEach(logType => {
                const option = document.createElement('option');
                option.value = logType;
                option.textContent = logType;
                logSelect.appendChild(option);
            });

            const currentLog = this.wellLoader.getWellCurrentLogType(name);
            logSelect.value = currentLog;

            logSelect.addEventListener('change', () => {
                this.wellLoader.setWellLogType(name, logSelect.value);
            });

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `well_${name}`;
            checkbox.className = 'well-checkbox';
            checkbox.checked = true;
            checkbox.title = 'Show/Hide well';
            checkbox.addEventListener('change', () => {
                this.wellLoader.setWellVisible(name, checkbox.checked);
                this._updateToggleAllButton();
            });

            wellItem.appendChild(label);
            wellItem.appendChild(logSelect);
            wellItem.appendChild(checkbox);
            this.container.appendChild(wellItem);

            this.checkboxes.set(name, checkbox);
            this.logSelectors.set(name, logSelect);
        });
    }

    refreshLogSelectors() {
        if (this.setAllLogTypeSelect) {
            const allLogTypes = new Set(['None']);

            this.wellLoader.wells.forEach(well => {
                if (well.logData) {
                    well.getAvailableLogs().forEach(log => allLogTypes.add(log));
                }
            });

            this.setAllLogTypeSelect.innerHTML = '<option value="">Set All...</option>';
            [...allLogTypes].filter(log => log !== 'None').sort().forEach(logType => {
                const option = document.createElement('option');
                option.value = logType;
                option.textContent = logType;
                this.setAllLogTypeSelect.appendChild(option);
            });

            const noneOption = document.createElement('option');
            noneOption.value = 'None';
            noneOption.textContent = 'None';
            this.setAllLogTypeSelect.appendChild(noneOption);
        }

        this.logSelectors.forEach((select, name) => {
            const currentValue = select.value;

            select.innerHTML = '';

            const availableLogs = this.wellLoader.getWellAvailableLogs(name);
            availableLogs.forEach(logType => {
                const option = document.createElement('option');
                option.value = logType;
                option.textContent = logType;
                select.appendChild(option);
            });

            if (availableLogs.includes(currentValue)) {
                select.value = currentValue;
            }
        });
    }

    _updateToggleAllButton() {
        if (!this.toggleAllBtn) return;

        let allChecked = true;
        let allUnchecked = true;

        this.checkboxes.forEach(checkbox => {
            if (checkbox.checked) allUnchecked = false;
            else allChecked = false;
        });

        this.allVisible = allChecked;
        this.toggleAllBtn.textContent = allChecked ? 'Hide All' : 'Show All';
    }

    setWellChecked(name, checked) {
        const checkbox = this.checkboxes.get(name);
        if (checkbox) {
            checkbox.checked = checked;
        }
    }
}

class UIManager {
    constructor() {
        this.controls = {};
    }

    createInlineSlider(inlinePlane) {
        this.controls.inlineSlider = new SliderControl(
            'inlineSlider',
            'label_inline',
            SeismicConfig.maxInlineIndex,
            (value) => inlinePlane.setIndex(value)
        );
    }

    createCrosslineSlider(crosslinePlane) {
        this.controls.crosslineSlider = new SliderControl(
            'crosslineSlider',
            'label_crossline',
            SeismicConfig.maxCrosslineIndex,
            (value) => crosslinePlane.setIndex(value)
        );
    }

    createHorizonToggle(horizonManager) {
        this.controls.horizonToggle = new ToggleButton(
            'toggleHorizonBtn',
            'Show Horizon',
            'Hide Horizon',
            (visible) => horizonManager.setAllVisible(visible)
        );
    }

    createFaultToggle(faultLoader) {
        this.controls.faultToggle = new ToggleButton(
            'toggleFaultBtn',
            'Show Fault',
            'Hide Fault',
            (visible) => faultLoader.setAllVisible(visible)
        );
    }

    createWellPanel(wellLoader) {
        this.controls.wellPanel = new WellTogglePanel(
            'wellList',
            'toggleAllWellsBtn',
            wellLoader
        );

        wellLoader.onWellsLoaded = (wellNames) => {
            this.controls.wellPanel.populateWells(wellNames);
        };

        const existingWells = wellLoader.getWellNames();
        if (existingWells.length > 0) {
            this.controls.wellPanel.populateWells(existingWells);
        }
    }

    refreshWellLogSelectors() {
        if (this.controls.wellPanel) {
            this.controls.wellPanel.refreshLogSelectors();
        }
    }

    createCameraReset(sceneManager) {
        const resetBtn = document.getElementById('resetCameraBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                sceneManager.resetCamera();
            });
        }
    }

    getControl(name) {
        return this.controls[name];
    }
}

// ============================================================================
// UI: loading-ui.js
// ============================================================================
class LoadingUI {
    constructor() {
        this.screen = document.getElementById('loadingScreen');
        this.progressFill = document.getElementById('loadingProgressFill');
        this.statusText = document.getElementById('loadingStatus');
        this.tasksContainer = document.getElementById('loadingTasks');
        this.dataSourceName = document.getElementById('dataSourceName');
        this.dataSourceIndicator = document.getElementById('dataSourceIndicator');
        this.currentDataSource = document.getElementById('currentDataSource');

        this._bindToStateManager();
    }

    _bindToStateManager() {
        loadingStateManager.addListener((state) => this._onStateChange(state));
    }

    _onStateChange(state) {
        this._updateProgress(state.totalProgress);
        this._updateStatus(state.currentTask);
        this._updateTasks(state.tasks);

        if (state.isComplete) {
            this._onComplete(state.hasErrors);
        }
    }

    _updateProgress(progress) {
        if (this.progressFill) {
            this.progressFill.style.width = `${Math.min(100, progress)}%`;
        }
    }

    _updateStatus(currentTask) {
        if (this.statusText) {
            this.statusText.textContent = currentTask
                ? `Loading ${currentTask}...`
                : 'Processing...';
        }
    }

    _updateTasks(tasks) {
        if (!this.tasksContainer) return;

        this.tasksContainer.innerHTML = '';

        tasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `loading-task ${this._getTaskClass(task.status)}`;

            const iconEl = document.createElement('span');
            iconEl.className = 'task-icon';
            iconEl.innerHTML = this._getTaskIcon(task.status);

            const labelEl = document.createElement('span');
            labelEl.textContent = task.label;

            taskEl.appendChild(iconEl);
            taskEl.appendChild(labelEl);

            if (task.message && (task.status === 'error' || task.status === 'skipped')) {
                const msgEl = document.createElement('span');
                msgEl.style.marginLeft = 'auto';
                msgEl.style.fontSize = '11px';
                msgEl.style.opacity = '0.7';
                msgEl.textContent = task.message;
                taskEl.appendChild(msgEl);
            }

            this.tasksContainer.appendChild(taskEl);
        });
    }

    _getTaskClass(status) {
        switch (status) {
            case 'loading': return 'active';
            case 'success': return 'complete';
            case 'error': return 'error';
            case 'skipped': return 'skipped';
            default: return '';
        }
    }

    _getTaskIcon(status) {
        switch (status) {
            case 'pending': return '○';
            case 'loading': return '<div class="task-spinner"></div>';
            case 'success': return '✓';
            case 'error': return '✗';
            case 'skipped': return '⊘';
            default: return '○';
        }
    }

    _onComplete(hasErrors) {
        if (this.statusText) {
            this.statusText.textContent = hasErrors
                ? 'Completed with some issues'
                : 'Loading complete!';
        }

        this._updateProgress(100);

        setTimeout(() => {
            this.hide();
        }, hasErrors ? 1500 : 800);
    }

    setDataSource(sourceName) {
        if (this.dataSourceName) {
            this.dataSourceName.textContent = sourceName;
        }
        if (this.currentDataSource) {
            this.currentDataSource.textContent = sourceName;
        }
    }

    show() {
        if (this.screen) {
            this.screen.classList.remove('hidden');
        }
    }

    hide() {
        if (this.screen) {
            this.screen.classList.add('hidden');
        }
        if (this.dataSourceIndicator) {
            this.dataSourceIndicator.style.display = 'block';
        }
    }

    forceHide() {
        if (this.screen) {
            this.screen.style.display = 'none';
        }
    }
}

const loadingUI = new LoadingUI();

// ============================================================================
// APP: Main Application
// ============================================================================
class SeismicViewerApp {
    constructor() {
        this.sceneManager = null;
        this.uiManager = null;

        this.dataOrchestrator = null;
        this.loadingStateManager = loadingStateManager;

        this.sceneFacade = null;
        this.seismicPlanes = null;
        this.faults = null;
        this.horizons = null;
        this.wells = null;
    }

    async init() {
        console.log('Initializing Seismic Viewer...');

        try {
            this._initScene();

            this._initSeismicPlanes();

            await this._loadData();

            this._initUI();

            this.sceneFacade.startRenderLoop();

            console.log('Seismic Viewer initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize Seismic Viewer:', error);
            loadingUI.forceHide();
            throw error;
        }
    }

    _initScene() {
        this.sceneManager = new SceneManager();
        this.sceneFacade = new SceneFacade(this.sceneManager);
    }

    _initSeismicPlanes() {
        this.seismicPlanes = new SeismicPlaneFacade(this.sceneManager);
    }

    _initUI() {
        this.uiManager = new UIManager();

        const planes = this.seismicPlanes.getPlanes();
        this.uiManager.createInlineSlider(planes.inline);
        this.uiManager.createCrosslineSlider(planes.crossline);

        this.uiManager.createHorizonToggle(this.horizons.getManager());

        this.uiManager.createFaultToggle(this.faults.getLoader());

        this.uiManager.createWellPanel(this.wells.getWellLoader());

        this.uiManager.refreshWellLogSelectors();

        this.uiManager.createCameraReset(this.sceneManager);
    }

    async _loadData() {

        this.loadingStateManager.addListener((state) => {
            console.log(`Loading: ${state.totalProgress.toFixed(0)}% - ${state.currentTask || 'Done'}`);
        });

        this.dataOrchestrator = new DataLoadingOrchestrator(this.sceneManager);

        try {
            const result = await this.dataOrchestrator.loadAll();

            this.horizons = new HorizonFacade(this.sceneManager);
            this.horizons.horizonManager = result.horizonManager;

            this.faults = new FaultFacade(this.sceneManager);
            this.faults.faultLoader = result.faultLoader;
            this.faults.isLoaded = true;

            this.wells = new WellFacade(this.sceneManager);
            this.wells.wellLoader = result.wellLoader;
            this.wells.wellLogLoader = result.wellLogLoader;

            loadingUI.setDataSource(result.dataSource);
        } catch (error) {
            throw error;
        }
    }

    setInlineIndex(index) {
        this.seismicPlanes.setInlineIndex(index);
    }

    setCrosslineIndex(index) {
        this.seismicPlanes.setCrosslineIndex(index);
    }

    toggleHorizons() {
        return this.horizons.toggle();
    }

    toggleFaults() {
        return this.faults.toggle();
    }

    toggleWells() {
        return this.wells.toggle();
    }

    resetCamera() {
        this.sceneFacade.resetCamera();
    }

    getDataSource() {
        return 'API';
    }

    getSceneFacade() {
        return this.sceneFacade;
    }

    getSeismicPlanesFacade() {
        return this.seismicPlanes;
    }

    getFaultFacade() {
        return this.faults;
    }

    getHorizonFacade() {
        return this.horizons;
    }

    getWellFacade() {
        return this.wells;
    }
}

// ============================================================================
// Bootstrap
// ============================================================================
const app = new SeismicViewerApp();

window.seismicApp = app;

app.init().catch(error => {
    console.error('Failed to initialize application:', error);
});
