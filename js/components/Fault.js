import { StyleConfig } from '../config/SeismicConfig.js';
import { CoordinateSystem } from '../core/CoordinateSystem.js';

export class FaultSegment {
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

export class FaultPanel {
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

export class FaultLoader {
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

            // Create segments from pairs
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

            // Get sorted pair keys
            const pairKeys = Object.keys(faultData)
                .map(k => parseInt(k))
                .sort((a, b) => a - b);

            // Create panels between adjacent pairs
            for (let i = 0; i < pairKeys.length - 1; i++) {
                const p1 = faultData[pairKeys[i]];
                const p2 = faultData[pairKeys[i + 1]];

                // Only connect same fault name
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

    async loadAllFaults(faultFiles, as3D = true) {
        console.log(`Loading ${faultFiles.length} fault files...`);
        
        for (const file of faultFiles) {
            try {
                if (as3D) {
                    await this.loadFaultSurfaces(file);
                } else {
                    await this.loadFaultLines(file);
                }
            } catch (e) {
                console.warn(`Failed to load fault: ${file}`, e);
            }
        }
        
        console.log(`All faults loaded: ${this.faults.length} objects created`);
    }

    setAllVisible(visible) {
        this.faults.forEach(f => f.setVisible(visible));
    }

    toggleAll() {
        const newState = this.faults.length > 0 ? !this.faults[0].line?.visible ?? !this.faults[0].mesh?.visible : true;
        this.setAllVisible(newState);
        return newState;
    }

    dispose() {
        this.faults.forEach(f => f.dispose());
        this.faults = [];
    }
}
