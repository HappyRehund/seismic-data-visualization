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
    inlineFolder: '/csv_data/inline_crossline/inline',
    crosslineFolder: '/csv_data/inline_crossline/crossline',

    getInlinePath(index) {
        return `${this.inlineFolder}/inline_${index + 1}.png`;
    },

    getCrosslinePath(index) {
        return `${this.crosslineFolder}/crossline_${index + 1}.png`;
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

// ============================================================================
// CONFIG: fault-file.config.js
// ============================================================================
const FaultFileConfig = {
    basePath: 'CSV_fault/',

    faultsByType: {
        thrustFault: [
            'F1(IL^Thrust Fault).csv',
            'F6(IL^Thrust Fault).csv'
        ],

        normalFault: [
            'F2(XL^Normal Fault).csv',
            'F3(XL^Normal Fault).csv',
            'F4(XL^Normal Fault).csv',
            'F5(XL^Normal Fault).csv',
            'F7(XL^Normal Fault).csv',
            'F15(XL^Normal Fault).csv',
            'F22(XL^Normal Fault).csv',
            'F23(XL^Normal Fault).csv',
            'F26(XL^Normal Fault).csv',
            'F27(XL^Normal_Fault).csv',
            'F28(XL^Normal Fault).csv',
            'F30(XL^Normal Fault).csv',
            'F31(XL^Normal Fault).csv',
            'F32(XL^Normal Fault).csv',
            'F33(XL^Normal Fault).csv',
            'F35(XL^Normal Fault).csv',
            'F37(XL^Normal Fault).csv',
            'F38(XL^Normal Fault).csv',
            'F39(XL^Normal Fault).csv',
            'F40(XL^Normal Fault).csv',
            'F41(XL^Normal Fault).csv',
            'F44(XL^Normal Fault).csv',
            'F47 (XL^Normal Fault).csv',
            'F48(XL^Normal Fault).csv',
            'F49 (XL^Normal Fault).csv',
            'F50 (XL^Normal Fault).csv',
            'F51 (XL^Normal Fault).csv',
            'F53 (XL^Normal Fault).csv',
            'F56 (XL^Normal Fault).csv',
            'F57 (XL^Normal Fault).csv',
            'F60 (XL^Normal Fault).csv',
            'F63 (IL^Normal Fault).csv',
            'F64 (IL^Normal Fault).csv',
            'F65 (IL^Normal Fault).csv',
            'F76 (XL^Normal Fault).csv',
            'F77 (XL^Normal Fault).csv',
            'F81 (XL^Normal Fault).csv',
            'F83 (XL^Normal Fault).csv',
            'F89 (XL^Normal Fault).csv',
            'F90 (XL^Normal Fault).csv',
            'F94 (XL^Normal Fault).csv',
            'F101 (XL^Normal Fault).csv',
            'F102 (XL^Normal Fault).csv',
            'F103 (XL^Normal Fault).csv',
            'F104 (XL^Normal Fault).csv',
            'F105 (XL^Normal Fault).csv',
            'F106 (XL^Normal Fault).csv',
            'F107 (XL^Normal Fault).csv',
            'F108 (XL^Normal Fault).csv',
            'F110 (XL^Normal Fault).csv',
            'F114 (XL^Normal Fault).csv',
            'F115 (XL^Normal Fault).csv',
            'F123 (XL^Normal Fault).csv',
            'F124 (XL^Normal Fault).csv',
            'F126 (XL^Normal Fault).csv',
            'F127 (XL^Normal Fault).csv',
            'F128 (XL^Normal Fault).csv',
            'F129 (XL^Normal Fault).csv',
            'F130 (IL^Normal Fault).csv',
            'F131(IL^Normal Fault).csv',
            'F132 (IL^Normal Fault).csv'
        ],

        transpressional: [
            'F8(XL^Transpressional).csv',
            'F9(XL^Transpressional).csv',
            'F10(XL^Transpressional).csv',
            'F11(XL^Transpressional).csv',
            'F12(XL^Transpressional).csv',
            'F13(XL^Normal Transpressional).csv',
            'F14(XL^Transpressional).csv',
            'F16(XL^Transpressional).csv',
            'F17(XL^Transpressional).csv',
            'F18(XL^Transpressional).csv',
            'F19(XL^Transpressional).csv',
            'F20(XL^Transpressional).csv',
            'F21(XL^Transpressional).csv',
            'F24(XL^Transpressional).csv',
            'F25(XL^Transpressional).csv',
            'F34(XL^Transpressional).csv',
            'F36(XL^Transpressional).csv',
            'F42(XL^Transressional).csv',
            'F43(XL^Transpressional).csv',
            'F45 (XL^Transpressional).csv',
            'F46 (XL^Transpressional).csv',
            'F52 (XL^Transpressional).csv',
            'F54(XL^Transpressional).csv',
            'F55 (XL^Transpressional).csv',
            'F58(XL^Transpressional).csv',
            'F59 (XL^Transpressional).csv',
            'F61 (XL^Transpressional).csv',
            'F66 (XL^Transpressional).csv',
            'F67 (XL^Transpressional).csv',
            'F68 (XL^Transpressional).csv',
            'F69 (XL^Transpressional).csv',
            'F70 (XL^Transpressional).csv',
            'F71 (XL^Transpressional).csv',
            'F72 (XL^Trans[ressional).csv',
            'F73 (XL^Transpressional).csv',
            'F74 (XL^Transpressional).csv',
            'F75 (XL^Transpressional).csv',
            'F78 (XL^Transpressional).csv',
            'F79 (XL^Transpressional).csv',
            'F80 (XL^Trampsressional).csv',
            'F82 (XL^Tramspressional).csv',
            'F84 (XL^Transpressional).csv',
            'F85 (XL^Transpressional).csv',
            'F86 (XL^Transpressional).csv',
            'F87 (XL^Transpressional).csv',
            'F88 (XL^Transpressional).csv',
            'F91 (XL^Transpressional).csv',
            'F92 (XL^Transpressional).csv',
            'F93 (XL^Transpressional).csv',
            'F95 (XL^Transpressional).csv',
            'F96 (XL^Transpressional).csv',
            'F100(XL^Transpressional).csv',
            'F109 (XL^Transpressional).csv',
            'F111 (XL^Tranpsressional).csv',
            'F112 (XL^Transpressional).csv',
            'F113 (XL^Transpressional).csv',
            'F116 (XL^Transpressional).csv',
            'F118 (XL^Transpressional).csv',
            'F119 (XL^Transpressional).csv',
            'F120 (XL^Transpressional).csv',
            'F121 (XL^Transressional).csv',
            'F122 (XL^Transprssional).csv',
            'F125 (XL^Transpressional).csv',
            'F126 (XL^Transpressional).csv'
        ],

        reverseFault: [
            'F62 (IL^Reverse Fault).csv'
        ]
    },

    getAllFaultFiles() {
        const allFiles = [];

        Object.values(this.faultsByType).forEach(files => {
            files.forEach(file => {
                allFiles.push(this.basePath + file);
            });
        });

        return allFiles;
    }
};

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

    async loadFaultLines(path) {
        console.log(`Loading fault lines: ${path}`);

        try {
            const response = await fetch(path);
            const text = await response.text();
            const faultData = this._parseCSV(text);

            Object.values(faultData).forEach(segment => {
                if (segment.length !== 2) return;

                const fault = new FaultSegment(
                    this.sceneManager,
                    segment[0],
                    segment[1],
                    segment[0].name
                );
                this.faults.push(fault);
            });

            console.log(`Fault lines loaded: ${path}`);
        } catch (error) {
            console.error('Failed to load fault:', error);
        }
    }

    async loadFaultSurfaces(path) {
        console.log(`Loading fault surfaces: ${path}`);

        try {
            const response = await fetch(path);
            const text = await response.text();
            const faultData = this._parseCSV(text);

            const pairKeys = Object.keys(faultData)
                .map(k => parseInt(k))
                .sort((a, b) => a - b);

            for (let i = 0; i < pairKeys.length - 1; i++) {
                const p1 = faultData[pairKeys[i]];
                const p2 = faultData[pairKeys[i + 1]];

                if (p1[0].name !== p2[0].name) continue;

                if (p1.length === 2 && p2.length === 2) {
                    const panel = new FaultPanel(
                        this.sceneManager,
                        p1[0], p1[1],
                        p2[0], p2[1]
                    );
                    this.faults.push(panel);
                }
            }

            console.log(`Fault surfaces loaded: ${path}`);
        } catch (error) {
            console.error('Failed to load fault surface:', error);
        }
    }

    _parseCSV(text) {
        const delimiter = ',';
        const rows = text.trim().split(/\r?\n/);
        const header = rows[0].split(delimiter);

        const idx = (col) => header.indexOf(col);
        const faultPairIdx = idx('Fault_Stick');
        const faultNameIdx = idx('Fault_Plane');

        if (faultPairIdx === -1 || idx('Times') === -1) {
            throw new Error('Required columns not found: Fault_Stick, Times');
        }

        const faults = {};

        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(delimiter);
            if (cols.length < header.length) continue;

            const pair = parseInt(cols[faultPairIdx]);
            if (!faults[pair]) faults[pair] = [];

            faults[pair].push({
                inline_n: parseFloat(cols[idx('inline_n')]),
                crossline_n: parseFloat(cols[idx('crossline_n')]),
                time: parseFloat(cols[idx('Times')]),
                name: cols[faultNameIdx]
            });
        }

        return faults;
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

    async load(csvUrl, zColumnName) {
        console.log(`Loading horizon: ${csvUrl}`);

        try {
            const response = await fetch(csvUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            const data = this._parseCSV(text, zColumnName);

            if (data.points.length === 0) {
                console.warn('No valid horizon points found');
                return;
            }

            this._createPointCloud(data);
            console.log(`Horizon loaded: ${data.points.length} points`);

        } catch (error) {
            console.error('Failed to load horizon:', error);
            throw error;
        }
    }

    _parseCSV(text, zColumnName) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        const inlineIdx = headers.indexOf('Inline');
        const crosslineIdx = headers.indexOf('Crossline');
        const zIdx = headers.indexOf(zColumnName);

        if (inlineIdx === -1 || crosslineIdx === -1 || zIdx === -1) {
            throw new Error(
                `Required columns not found. Need: Inline, Crossline, ${zColumnName}. ` +
                `Found: ${headers.join(', ')}`
            );
        }

        const points = [];
        let minInline = Infinity, maxInline = -Infinity;
        let minCrossline = Infinity, maxCrossline = -Infinity;

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length < headers.length) continue;

            const inline = parseFloat(values[inlineIdx]);
            const crossline = parseFloat(values[crosslineIdx]);
            const z = parseFloat(values[zIdx]);

            if (isNaN(inline) || isNaN(crossline) || isNaN(z)) continue;

            points.push({ inline, crossline, z });

            minInline = Math.min(minInline, inline);
            maxInline = Math.max(maxInline, inline);
            minCrossline = Math.min(minCrossline, crossline);
            maxCrossline = Math.max(maxCrossline, crossline);
            this.minZ = Math.min(this.minZ, z);
            this.maxZ = Math.max(this.maxZ, z);
        }

        return {
            points,
            ranges: {
                inline: { min: minInline, max: maxInline },
                crossline: { min: minCrossline, max: maxCrossline },
                z: { min: this.minZ, max: this.maxZ }
            }
        };
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

    async addHorizon(csvUrl, zColumnName) {
        const horizon = new Horizon(this.sceneManager);
        await horizon.load(csvUrl, zColumnName);
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

    async load(csvPath) {
        console.log(`Loading well logs: ${csvPath}`);

        try {
            const response = await fetch(csvPath);
            const text = await response.text();

            this._parseCSV(text);

            console.log(`Well logs loaded for ${this.wellLogs.size} wells`);
            console.log(`Well names in log file: ${[...this.wellLogs.keys()].slice(0, 10).join(', ')}...`);
            console.log(`Available log types: ${[...this.availableLogTypes].join(', ')}`);

        } catch (error) {
            console.error('Failed to load well logs:', error);
        }
    }

    _parseCSV(text) {
        const rows = text.split('\n').map(r => r.trim()).filter(r => r.length > 0);

        if (rows.length === 0) return;

        const header = rows[0].split(',').map(h => h.trim());

        const wellIdx = header.indexOf('WELL');
        const depthIdx = header.indexOf('TVDSS');

        const logColumns = ['GR', 'RT', 'RHOB', 'NPHI', 'DT', 'SP', 'PHIE', 'VSH', 'SWE'];
        const logIndices = {};

        for (const log of logColumns) {
            const idx = header.indexOf(log);
            if (idx !== -1) {
                logIndices[log] = idx;
                this.availableLogTypes.add(log);
            }
        }

        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(',');

            let wellName = cols[wellIdx]?.trim();
            const depth = parseFloat(cols[depthIdx]);

            if (!wellName || isNaN(depth)) continue;

            const normalizedNames = this._getNormalizedNames(wellName);

            if (!this.wellLogs.has(wellName)) {
                this.wellLogs.set(wellName, new WellLogData(wellName));

                for (const normName of normalizedNames) {
                    if (!this.wellLogs.has(normName)) {
                        this.wellLogs.set(normName, this.wellLogs.get(wellName));
                    }
                }
            }
            const wellLogData = this.wellLogs.get(wellName);

            const logValues = {};
            for (const [logType, idx] of Object.entries(logIndices)) {
                const value = parseFloat(cols[idx]);
                logValues[logType] = isNaN(value) ? null : value;
            }

            wellLogData.addDataPoint(depth, logValues);
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

    async load(path, defaultTimeEnd = 1200) {
        console.log(`Loading wells: ${path}`);

        try {
            const response = await fetch(path);
            const text = await response.text();

            const delimiter = ';';
            const rows = text.split('\n').map(r => r.trim()).filter(r => r.length > 1);
            const header = rows[0].split(delimiter);

            const inlineIdx = header.indexOf('Inline_n');
            const crossIdx = header.indexOf('Crossline_n');
            const nameIdx = header.indexOf('Well_name');

            const coordinateMap = new Map();

            const wellDataList = [];
            for (let i = 1; i < rows.length; i++) {
                const cols = rows[i].split(delimiter);

                const inline = parseFloat(cols[inlineIdx]);
                const crossline = parseFloat(cols[crossIdx]);
                const name = cols[nameIdx]?.trim();

                if (!isNaN(inline) && !isNaN(crossline) && name) {
                    wellDataList.push({ inline, crossline, name });
                }
            }

            for (const wellData of wellDataList) {
                const coordKey = `${wellData.inline},${wellData.crossline}`;

                if (!coordinateMap.has(coordKey)) {
                    coordinateMap.set(coordKey, {
                        primary: wellData,
                        duplicates: []
                    });
                } else {
                    coordinateMap.get(coordKey).duplicates.push(wellData.name);
                }
            }

            for (const [coordKey, coordData] of coordinateMap) {
                const { primary, duplicates } = coordData;

                if (this.wellsMap.has(primary.name)) {
                    console.log(`Skipping duplicate well name: ${primary.name}`);
                    continue;
                }

                let displayName = primary.name;
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

    async loadAs3D(faultFiles) {
        console.log(`Loading ${faultFiles.length} fault files as 3D...`);
        for (const file of faultFiles) {
            try {
                await this.faultLoader.loadFaultSurfaces(file);
            } catch (e) {
                console.warn(`Failed to load fault: ${file}`, e);
            }
        }

        this.isLoaded = true;
        console.log(`Faults loaded: ${this.faultLoader.faults.length} objects`);
    }

    async loadAsLines(faultFiles) {
        console.log(`Loading ${faultFiles.length} fault files as lines...`);
        for (const file of faultFiles) {
            try {
                await this.faultLoader.loadFaultLines(file);
            } catch (e) {
                console.warn(`Failed to load fault: ${file}`, e);
            }
        }
        this.isLoaded = true;
        console.log(`Faults loaded: ${this.faultLoader.faults.length} objects`);
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

    async load(csvPath, zColumn) {
        return await this.horizonManager.addHorizon(csvPath, zColumn);
    }

    async loadMultiple(csvPath, zColumns) {
        const horizons = [];
        for (const zColumn of zColumns) {
            horizons.push(await this.load(csvPath, zColumn));
        }
        return horizons;
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

    async loadWells(csvPath, defaultTimeEnd = 1200) {
        await this.wellLoader.load(csvPath, defaultTimeEnd);
    }

    async loadWellLogs(csvPath) {
        await this.wellLogLoader.load(csvPath);
    }

    async loadAll(wellCsvPath, logCsvPath) {
        await this.loadWells(wellCsvPath);
        await this.loadWellLogs(logCsvPath);
        this.attachLogs();
    }

    attachLogs() {
        this.wellLoader.attachLogData(this.wellLogLoader);
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
// DATA: data-loader-factory.js
// ============================================================================
class DataSourceStrategy {
    constructor(config = {}) {
        this.config = config;
        this.name = 'BaseStrategy';
    }

    async isAvailable() {
        throw new Error('Subclass must implement isAvailable()');
    }

    async fetch(endpoint, params = {}) {
        throw new Error('Subclass must implement fetch()');
    }
}

class DatabaseStrategy extends DataSourceStrategy {
    constructor(config = {}) {
        super(config);
        this.name = 'Database';
        this.baseUrl = config.apiBaseUrl || '/api';
    }

    async isAvailable() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            return response.ok;
        } catch (error) {
            console.log(`Database API not available: ${error.message}`);
            return false;
        }
    }

    async fetch(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}/${endpoint}`, window.location.origin);

        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Database fetch failed: ${response.status}`);
        }

        return await response.json();
    }
}

class CSVStrategy extends DataSourceStrategy {
    constructor(config = {}) {
        super(config);
        this.name = 'CSV';
        this.basePath = config.csvBasePath || '';
    }

    async isAvailable() {
        return true;
    }

    async fetch(endpoint, params = {}) {
        const path = `${this.basePath}${endpoint}`;
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`CSV fetch failed: ${response.status} for ${path}`);
        }

        const text = await response.text();
        return this._parseCSV(text);
    }

    _parseCSV(text) {
        const lines = text.trim().split('\n');
        if (lines.length === 0) return { headers: [], rows: [] };

        const headers = lines[0].split(',').map(h => h.trim());
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length >= headers.length) {
                const row = {};
                headers.forEach((header, idx) => {
                    row[header] = values[idx];
                });
                rows.push(row);
            }
        }

        return { headers, rows, rawText: text };
    }
}

class AbstractDataLoader {
    constructor(sceneManager, dataSourceManager) {
        this.sceneManager = sceneManager;
        this.dataSourceManager = dataSourceManager;
        this.loadingState = {
            status: 'idle',
            progress: 0,
            message: '',
            error: null
        };
        this.onProgress = null;
    }

    get typeName() {
        return 'AbstractLoader';
    }

    async load(options = {}) {
        this._updateState('loading', 0, `Loading ${this.typeName}...`);

        try {
            await this._prepare(options);
            this._updateState('loading', 10, 'Preparing...');

            const data = await this._fetchData(options);
            this._updateState('loading', 50, 'Processing data...');

            const result = await this._processData(data, options);
            this._updateState('loading', 90, 'Finalizing...');

            await this._finalize(result, options);
            this._updateState('success', 100, `${this.typeName} loaded successfully`);

            return result;
        } catch (error) {
            this._updateState('error', 0, `Failed to load ${this.typeName}`, error);
            throw error;
        }
    }

    async _prepare(options) {
    }

    async _fetchData(options) {
        throw new Error('Subclass must implement _fetchData()');
    }

    async _processData(data, options) {
        throw new Error('Subclass must implement _processData()');
    }

    async _finalize(result, options) {
    }

    _updateState(status, progress, message, error = null) {
        this.loadingState = { status, progress, message, error };
        if (this.onProgress) {
            this.onProgress({ ...this.loadingState });
        }
    }
}

class DataSourceManager {
    constructor() {
        this.strategies = [];
        this.currentStrategy = null;
    }

    registerStrategy(strategy, priority = 100) {
        this.strategies.push({ strategy, priority });
        this.strategies.sort((a, b) => a.priority - b.priority);
    }

    async getAvailableStrategy() {
        for (const { strategy } of this.strategies) {
            if (await strategy.isAvailable()) {
                this.currentStrategy = strategy;
                console.log(`Using data source: ${strategy.name}`);
                return strategy;
            }
        }
        throw new Error('No data source available');
    }

    async fetch(endpoint, params = {}) {
        for (const { strategy } of this.strategies) {
            try {
                if (await strategy.isAvailable()) {
                    return await strategy.fetch(endpoint, params);
                }
            } catch (error) {
                console.warn(`Strategy ${strategy.name} failed for ${endpoint}:`, error.message);
            }
        }
        throw new Error(`All data sources failed for: ${endpoint}`);
    }

    getCurrentSourceName() {
        return this.currentStrategy?.name || 'Unknown';
    }
}

class DataLoaderFactory {
    constructor() {
        this.dataSourceManager = new DataSourceManager();

        this.dataSourceManager.registerStrategy(
            new DatabaseStrategy({ apiBaseUrl: '/api' }),
            1
        );
        this.dataSourceManager.registerStrategy(
            new CSVStrategy({ csvBasePath: '' }),
            100
        );

        this.loaderRegistry = new Map();
    }

    registerLoader(type, LoaderClass) {
        this.loaderRegistry.set(type, LoaderClass);
    }

    createLoader(type, sceneManager) {
        const LoaderClass = this.loaderRegistry.get(type);
        if (!LoaderClass) {
            throw new Error(`Unknown loader type: ${type}`);
        }
        return new LoaderClass(sceneManager, this.dataSourceManager);
    }

    getDataSourceManager() {
        return this.dataSourceManager;
    }
}

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
class HorizonDataLoader extends AbstractDataLoader {
    constructor(sceneManager, dataSourceManager) {
        super(sceneManager, dataSourceManager);
        this.horizonManager = new HorizonManager(sceneManager);
    }

    get typeName() {
        return 'Horizons';
    }

    async _fetchData(options) {
        const { csvPath = '/horizon.csv', zColumns = ['top', 'bottom'] } = options;

        try {
            const data = await this.dataSourceManager.fetch('horizons', {});
            return { source: 'database', data, zColumns };
        } catch (error) {
            return { source: 'csv', csvPath, zColumns };
        }
    }

    async _processData(fetchResult, options) {
        const { source, csvPath, zColumns, data } = fetchResult;

        if (source === 'database') {
            console.log('Processing horizon data from database');
            return this.horizonManager;
        }

        for (const zColumn of zColumns) {
            try {
                await this.horizonManager.addHorizon(csvPath, zColumn);
                this._updateState('loading', 50 + (zColumns.indexOf(zColumn) * 20), `Loaded horizon: ${zColumn}`);
            } catch (error) {
                console.warn(`Failed to load horizon column ${zColumn}:`, error);
            }
        }

        return this.horizonManager;
    }

    getManager() {
        return this.horizonManager;
    }
}

class FaultDataLoader extends AbstractDataLoader {
    constructor(sceneManager, dataSourceManager) {
        super(sceneManager, dataSourceManager);
        this.faultLoader = new FaultLoader(sceneManager);
    }

    get typeName() {
        return 'Faults';
    }

    async _fetchData(options) {
        const { faultFiles = [], as3D = true } = options;

        try {
            const data = await this.dataSourceManager.fetch('faults', {});
            return { source: 'database', data, as3D };
        } catch (error) {
            return { source: 'csv', faultFiles, as3D };
        }
    }

    async _processData(fetchResult, options) {
        const { source, faultFiles, as3D, data } = fetchResult;

        if (source === 'database') {
            console.log('Processing fault data from database');
            return this.faultLoader;
        }

        if (faultFiles.length > 0) {
            const totalFiles = faultFiles.length;
            let loadedCount = 0;

            for (const file of faultFiles) {
                try {
                    if (as3D) {
                        await this.faultLoader.loadFaultSurfaces(file);
                    } else {
                        await this.faultLoader.loadFaultLines(file);
                    }
                    loadedCount++;
                    const progress = 20 + (loadedCount / totalFiles * 70);
                    this._updateState('loading', progress, `Loaded fault ${loadedCount}/${totalFiles}`);
                } catch (error) {
                    console.warn(`Failed to load fault: ${file}`, error);
                }
            }
        }

        return this.faultLoader;
    }

    getLoader() {
        return this.faultLoader;
    }
}

class WellDataLoader extends AbstractDataLoader {
    constructor(sceneManager, dataSourceManager) {
        super(sceneManager, dataSourceManager);
        this.wellLoader = new WellLoader(sceneManager);
    }

    get typeName() {
        return 'Wells';
    }

    async _fetchData(options) {
        const { csvPath = '/well_coordinates.csv' } = options;

        try {
            const data = await this.dataSourceManager.fetch('wells', {});
            return { source: 'database', data };
        } catch (error) {
            return { source: 'csv', csvPath };
        }
    }

    async _processData(fetchResult, options) {
        const { source, csvPath, data } = fetchResult;

        if (source === 'database') {
            console.log('Processing well data from database');
            return this.wellLoader;
        }

        await this.wellLoader.load(csvPath);
        return this.wellLoader;
    }

    getLoader() {
        return this.wellLoader;
    }
}

class WellLogDataLoader extends AbstractDataLoader {
    constructor(sceneManager, dataSourceManager) {
        super(sceneManager, dataSourceManager);
        this.wellLogLoader = new WellLogLoader();
    }

    get typeName() {
        return 'Well Logs';
    }

    async _fetchData(options) {
        const { csvPath = '/GNK_update.csv' } = options;

        try {
            const data = await this.dataSourceManager.fetch('well-logs', {});
            return { source: 'database', data };
        } catch (error) {
            return { source: 'csv', csvPath };
        }
    }

    async _processData(fetchResult, options) {
        const { source, csvPath, data } = fetchResult;

        if (source === 'database') {
            console.log('Processing well log data from database');
            return this.wellLogLoader;
        }

        await this.wellLogLoader.load(csvPath);
        return this.wellLogLoader;
    }

    getLoader() {
        return this.wellLogLoader;
    }
}

class SeismicDataLoaderFactory extends DataLoaderFactory {
    constructor() {
        super();

        this.registerLoader('horizon', HorizonDataLoader);
        this.registerLoader('fault', FaultDataLoader);
        this.registerLoader('well', WellDataLoader);
        this.registerLoader('wellLog', WellLogDataLoader);
    }

    createAllLoaders(sceneManager) {
        return {
            horizon: this.createLoader('horizon', sceneManager),
            fault: this.createLoader('fault', sceneManager),
            well: this.createLoader('well', sceneManager),
            wellLog: this.createLoader('wellLog', sceneManager)
        };
    }
}

class DataLoadingOrchestrator {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.factory = new SeismicDataLoaderFactory();
        this.loaders = {};
        this.results = {};
    }

    initialize() {
        this.loaders = this.factory.createAllLoaders(this.sceneManager);
    }

    async loadAll(config = {}) {
        const {
            horizonConfig = {},
            faultConfig = {},
            wellConfig = {},
            wellLogConfig = {}
        } = config;

        loadingStateManager.registerTask('horizon', 'Horizons');
        loadingStateManager.registerTask('well', 'Wells');
        loadingStateManager.registerTask('wellLog', 'Well Logs');
        loadingStateManager.registerTask('fault', 'Faults');

        try {
            loadingStateManager.updateTask('horizon', { status: 'loading', progress: 0 });
            this.results.horizon = await this.loaders.horizon.load(horizonConfig);
            loadingStateManager.completeTask('horizon', true, 'Loaded');
        } catch (error) {
            console.warn('Horizon loading failed:', error);
            loadingStateManager.completeTask('horizon', false, 'Failed');
        }

        try {
            loadingStateManager.updateTask('well', { status: 'loading', progress: 0 });
            this.results.well = await this.loaders.well.load(wellConfig);
            loadingStateManager.completeTask('well', true, 'Loaded');
        } catch (error) {
            console.warn('Well loading failed:', error);
            loadingStateManager.completeTask('well', false, 'Failed');
        }

        try {
            loadingStateManager.updateTask('wellLog', { status: 'loading', progress: 0 });
            this.results.wellLog = await this.loaders.wellLog.load(wellLogConfig);

            if (this.results.well && this.results.wellLog) {
                const wellLoader = this.loaders.well.getLoader();
                const wellLogLoader = this.loaders.wellLog.getLoader();
                wellLoader.attachLogData(wellLogLoader);
            }

            loadingStateManager.completeTask('wellLog', true, 'Loaded');
        } catch (error) {
            console.warn('Well log loading failed:', error);
            loadingStateManager.skipTask('wellLog', 'No data');
        }

        try {
            loadingStateManager.updateTask('fault', { status: 'loading', progress: 0 });
            this.results.fault = await this.loaders.fault.load(faultConfig);
            loadingStateManager.completeTask('fault', true, 'Loaded');
        } catch (error) {
            console.warn('Fault loading failed:', error);
            loadingStateManager.completeTask('fault', false, 'Failed');
        }

        return {
            horizonManager: this.loaders.horizon.getManager(),
            faultLoader: this.loaders.fault.getLoader(),
            wellLoader: this.loaders.well.getLoader(),
            wellLogLoader: this.loaders.wellLog.getLoader(),
            dataSource: this.factory.getDataSourceManager().getCurrentSourceName()
        };
    }

    getFactory() {
        return this.factory;
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

            this._initDataOrchestrator();

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

    _initDataOrchestrator() {
        this.dataOrchestrator = new DataLoadingOrchestrator(this.sceneManager);
        this.dataOrchestrator.initialize();
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

        this.loadingStateManager.registerTask('horizons', 'Loading Horizons');
        this.loadingStateManager.registerTask('faults', 'Loading Faults');
        this.loadingStateManager.registerTask('wells', 'Loading Wells');

        this.loadingStateManager.addListener((state) => {
            console.log(`Loading: ${state.totalProgress.toFixed(0)}% - ${state.currentTask || 'Done'}`);
        });

        const faultFiles = FaultFileConfig.getAllFaultFiles();

        try {
            this.loadingStateManager.updateTask('horizons', { status: 'loading', progress: 0 });
            this.loadingStateManager.updateTask('faults', { status: 'loading', progress: 0 });
            this.loadingStateManager.updateTask('wells', { status: 'loading', progress: 0 });

            const result = await this.dataOrchestrator.loadAll({
                horizonConfig: {
                    csvPath: '/csv_data/horizon/horizon.csv',
                    zColumns: ['top', 'bottom']
                },
                wellConfig: {
                    csvPath: '/csv_data/well/well_coordinates.csv'
                },
                wellLogConfig: {
                    csvPath: '/csv_data/well_log/gnk_well_log.csv'
                },
                faultConfig: {
                    faultFiles: faultFiles,
                    as3D: true
                }
            });

            this.horizons = new HorizonFacade(this.sceneManager);
            this.horizons.horizonManager = result.horizonManager;
            this.loadingStateManager.completeTask('horizons', true, 'Horizons loaded');

            this.faults = new FaultFacade(this.sceneManager);
            this.faults.faultLoader = result.faultLoader;
            this.faults.isLoaded = true;
            this.loadingStateManager.completeTask('faults', true, 'Faults loaded');

            this.wells = new WellFacade(this.sceneManager);
            this.wells.wellLoader = result.wellLoader;
            this.wells.wellLogLoader = result.wellLogLoader;
            this.loadingStateManager.completeTask('wells', true, 'Wells loaded');

            loadingUI.setDataSource(result.dataSource);
        } catch (error) {
            this.loadingStateManager.completeTask('horizons', false, error.message);
            this.loadingStateManager.completeTask('faults', false, error.message);
            this.loadingStateManager.completeTask('wells', false, error.message);
            throw error;
        }
    }

    async addHorizon(csvPath, zColumn = 'Z') {
        return await this.horizons.load(csvPath, zColumn);
    }

    async addFaultLines(csvPath) {
        await this.faults.addFaultLines(csvPath);
    }

    async addFaultSurfaces(csvPath) {
        await this.faults.addFaultSurface(csvPath);
    }

    async addWells(csvPath) {
        await this.wells.loadWells(csvPath);
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
        return this.dataOrchestrator?.getFactory()
            .getDataSourceManager()
            .getCurrentSourceName() || 'Unknown';
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
