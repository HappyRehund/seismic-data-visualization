import { WellLogConfig } from '../config/WellLogConfig.js';
export class WellLogFill {
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
            const curveIdx1 = i * 2;       // Current curve point
            const refIdx1 = i * 2 + 1;     // Current reference point
            const curveIdx2 = (i + 1) * 2; // Next curve point
            const refIdx2 = (i + 1) * 2 + 1; // Next reference point

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

export class WellLog {
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

export class WellLogData {
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

export class WellLogLoader {
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
            names.push(numPart);                    // "065"
            names.push(numPart.replace(/^0+/, '')); // "65"
            names.push(numPart.padStart(3, '0'));   // "065"
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
