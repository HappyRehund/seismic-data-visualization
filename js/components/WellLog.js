
export const WellLogConfig = {
    // Available log types with min/max ranges and colors
    logTypes: {
        'None': { min: 0, max: 1, color: 0xffffff, label: 'None' },
        'GR': { min: 0, max: 150, color: 0x00ff00, label: 'Gamma Ray' },
        'RT': { min: 0.1, max: 1000, color: 0xff0000, label: 'Resistivity', logScale: true },
        'RHOB': { min: 1.95, max: 2.95, color: 0x0000ff, label: 'Density' },
        'NPHI': { min: 0.45, max: -0.15, color: 0xff00ff, label: 'Neutron Porosity' },
        'DT': { min: 140, max: 40, color: 0x00ffff, label: 'Sonic' },
        'SP': { min: -200, max: 50, color: 0xffff00, label: 'SP' },
        'PHIE': { min: 0, max: 0.4, color: 0x00ff88, label: 'Effective Porosity' },
        'VSH': { min: 0, max: 1, color: 0x8b4513, label: 'Shale Volume' },
        'SWE': { min: 0, max: 1, color: 0x4169e1, label: 'Water Saturation' }
    },

    // Display settings
    maxLogWidth: 20,          // Maximum width of log curve from well center (inside well radius of 10)
    tubeRadius: 1,          // Radius of the log curve tube
    curveSegments: 6,       // Smoothness of tube
    nullValue: -999.25,     // Null/missing data value
    nullOffset: -6          // Offset for null values (left side of well, inside radius)
};

/**
 * WellLog Class
 * Renders a well log curve as a 3D tube geometry along the well bore
 */
export class WellLog {
    constructor(well, logData, logType = 'GR') {
        this.well = well;
        this.logData = logData;         // Array of {depth, value} for this log
        this.logType = logType;
        this.mesh = null;
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

        // Create a smooth curve through the points
        const curve = new THREE.CatmullRomCurve3(points);

        // Create tube geometry along the curve
        const geometry = new THREE.TubeGeometry(
            curve,
            Math.max(points.length * 2, 50),  // tubular segments
            WellLogConfig.tubeRadius,
            WellLogConfig.curveSegments,
            false  // not closed
        );

        const material = new THREE.MeshPhongMaterial({
            color: this.config.color,
            shininess: 60,
            transparent: true,
            opacity: 0.95
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.renderOrder = 1;  // Render log after well so it appears on top
        this.mesh.userData = {
            type: 'wellLog',
            wellName: this.well.name,
            logType: this.logType
        };

        this.well.sceneManager.add(this.mesh);
    }

    _generateCurvePoints() {
        const points = [];
        const wellPos = this.well.mesh.position;

        // Get well X and Z position
        const wellX = wellPos.x;
        const wellZ = wellPos.z;

        // Get well's Y range for proper alignment
        const wellMesh = this.well.mesh;
        const wellHeight = wellMesh.geometry.parameters.height;
        const wellCenterY = wellMesh.position.y;
        const wellTopY = wellCenterY + wellHeight / 2;
        const wellBottomY = wellCenterY - wellHeight / 2;

        // Sort data by depth (don't filter out nulls yet)
        const sortedData = [...this.logData].sort((a, b) => a.depth - b.depth);

        if (sortedData.length === 0) return points;

        // Get depth range from data
        const validDepths = sortedData.filter(d => !isNaN(d.depth)).map(d => d.depth);
        if (validDepths.length === 0) return points;

        const minDepth = Math.min(...validDepths);
        const maxDepth = Math.max(...validDepths);
        const depthRange = maxDepth - minDepth;

        if (depthRange === 0) return points;

        // Determine min/max for normalization
        let minVal = this.config.min;
        let maxVal = this.config.max;

        // For log scale (like RT), use logarithmic normalization
        const useLogScale = this.config.logScale || false;

        for (const data of sortedData) {
            if (isNaN(data.depth)) continue;

            let offset;
            const isNull = data.value === null ||
                          data.value === WellLogConfig.nullValue ||
                          isNaN(data.value);

            if (isNull) {
                // Null values: straight line at left side of well
                offset = WellLogConfig.nullOffset;
            } else {
                let normalizedValue;

                if (useLogScale) {
                    // Logarithmic scale
                    const logMin = Math.log10(Math.max(minVal, 0.001));
                    const logMax = Math.log10(Math.max(maxVal, 0.001));
                    const logVal = Math.log10(Math.max(data.value, 0.001));
                    normalizedValue = (logVal - logMin) / (logMax - logMin);
                } else {
                    // Linear scale
                    normalizedValue = (data.value - minVal) / (maxVal - minVal);
                }

                // Clamp to 0-1
                normalizedValue = Math.max(0, Math.min(1, normalizedValue));

                // Calculate offset from well center (inside well radius)
                // Map 0-1 to -maxLogWidth to +maxLogWidth
                offset = (normalizedValue * 2 - 1) * WellLogConfig.maxLogWidth;
            }

            // Calculate Y position - map depth to well's Y range
            const depthNormalized = (data.depth - minDepth) / depthRange;
            const y = wellTopY - depthNormalized * wellHeight;

            // Create point offset from well center
            points.push(new THREE.Vector3(
                wellX + offset,
                y,
                wellZ
            ));
        }

        return points;
    }

    // Removed _depthToY - now using well's actual geometry for Y alignment

    setVisible(visible) {
        if (this.mesh) {
            this.mesh.visible = visible;
        }
    }

    dispose() {
        if (this.mesh) {
            this.well.sceneManager.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
    }
}

/**
 * WellLogData Class
 * Stores all log data for a single well
 */
export class WellLogData {
    constructor(wellName) {
        this.wellName = wellName;
        this.logs = {};  // logType -> Array of {depth, value}
        this.depthRange = { min: Infinity, max: -Infinity };
    }

    addDataPoint(depth, logValues) {
        // Update depth range
        if (depth < this.depthRange.min) this.depthRange.min = depth;
        if (depth > this.depthRange.max) this.depthRange.max = depth;

        // Store each log value
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

/**
 * WellLogLoader Class
 * Loads well log data from CSV file
 */
export class WellLogLoader {
    constructor() {
        this.wellLogs = new Map();  // wellName -> WellLogData
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

        // Parse header
        const header = rows[0].split(',').map(h => h.trim());

        // Find column indices
        const wellIdx = header.indexOf('WELL');
        const depthIdx = header.indexOf('TVDSS');  // Use TVDSS for depth

        // Log columns to track
        const logColumns = ['GR', 'RT', 'RHOB', 'NPHI', 'DT', 'SP', 'PHIE', 'VSH', 'SWE'];
        const logIndices = {};

        for (const log of logColumns) {
            const idx = header.indexOf(log);
            if (idx !== -1) {
                logIndices[log] = idx;
                this.availableLogTypes.add(log);
            }
        }

        // Parse data rows
        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(',');

            let wellName = cols[wellIdx]?.trim();
            const depth = parseFloat(cols[depthIdx]);

            if (!wellName || isNaN(depth)) continue;

            // Normalize well name - store both original and normalized versions
            // Original: "GNK-065" -> Also store as "065" and "65"
            const normalizedNames = this._getNormalizedNames(wellName);

            // Get or create WellLogData (use original name as key)
            if (!this.wellLogs.has(wellName)) {
                this.wellLogs.set(wellName, new WellLogData(wellName));

                // Also store references with normalized names for easier lookup
                for (const normName of normalizedNames) {
                    if (!this.wellLogs.has(normName)) {
                        this.wellLogs.set(normName, this.wellLogs.get(wellName));
                    }
                }
            }
            const wellLogData = this.wellLogs.get(wellName);

            // Parse log values
            const logValues = {};
            for (const [logType, idx] of Object.entries(logIndices)) {
                const value = parseFloat(cols[idx]);
                logValues[logType] = isNaN(value) ? null : value;
            }

            wellLogData.addDataPoint(depth, logValues);
        }
    }

    /**
     * Generate normalized name variants for a well
     * @param {string} wellName
     * @returns {string[]}
     */
    _getNormalizedNames(wellName) {
        const names = [];

        // If name is like "GNK-065", extract "065" and "65"
        const match = wellName.match(/^GNK-(\d+)$/i);
        if (match) {
            const numPart = match[1];
            names.push(numPart);                    // "065"
            names.push(numPart.replace(/^0+/, '')); // "65"
            names.push(numPart.padStart(3, '0'));   // "065"
        }

        // If name is just a number, add variations
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

    /**
     * Get all well names in the log data
     * @returns {string[]}
     */
    getWellNames() {
        return [...this.wellLogs.keys()];
    }
}
