import { SeismicConfig, StyleConfig } from '../config/SeismicConfig.js';
import { WellLog, WellLogConfig } from './WellLog.js';

export class Well {
    constructor(sceneManager, name, inline, crossline, timeStart, timeEnd,
                radius = StyleConfig.wellRadius, color = StyleConfig.defaultWellColor) {
        this.sceneManager = sceneManager;
        this.name = name;
        this.mesh = null;
        this.originalColor = color;
        this.isHighlighted = false;

        // Well log related
        this.logData = null;           // WellLogData instance
        this.currentLogType = 'None';  // Currently displayed log type
        this.wellLog = null;           // Current WellLog visualization

        this._create(inline, crossline, timeStart, timeEnd, radius, color);
    }

    _create(inline, crossline, timeStart, timeEnd, radius, color) {
        // Calculate 3D positions
        // Note: Well coordinates typically use 1-based indexing
        const x = ((inline - 1) / (SeismicConfig.inlineCount - 1)) * SeismicConfig.imageWidth;
        const z = ((crossline - 1) / (SeismicConfig.crosslineCount - 1)) * SeismicConfig.imageWidth;

        const yTop = this._mapTimeToY(timeStart);
        const yBottom = this._mapTimeToY(timeEnd);

        // Calculate pipe dimensions
        const height = Math.abs(
            ((yTop - yBottom) / SeismicConfig.timeSize) * SeismicConfig.imageHeight
        );
        const centerY = (yTop + yBottom) / 2;

        // Create pipe geometry
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
        const material = new THREE.MeshPhongMaterial({
            color,
            shininess: 100
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(
            x,
            -centerY / SeismicConfig.timeSize * SeismicConfig.imageHeight + SeismicConfig.timeSize,
            z
        );
        
        // Add user data for identification and highlighting
        this.mesh.userData = {
            type: 'well',
            name: this.name,
            wellInstance: this // Store reference to this Well instance
        };
        
        this.sceneManager.add(this.mesh);
    }

    _mapTimeToY(time) {
        return time - 200;
    }

    setVisible(visible) {
        if (this.mesh) this.mesh.visible = visible;
        if (this.wellLog) this.wellLog.setVisible(visible);
    }

    highlight() {
        if (this.mesh && !this.isHighlighted) {
            const color = new THREE.Color(this.originalColor);
            // Darken the color by 40%
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

    /**
     * Set the well log data for this well
     * @param {WellLogData} logData 
     */
    setLogData(logData) {
        this.logData = logData;
    }

    /**
     * Display a specific log type
     * @param {string} logType - Log type to display (e.g., 'GR', 'RT', 'None')
     */
    setLogType(logType) {
        // Remove existing log visualization
        if (this.wellLog) {
            this.wellLog.dispose();
            this.wellLog = null;
        }

        this.currentLogType = logType;

        // Create new log visualization if not 'None'
        if (logType !== 'None' && this.logData) {
            const logDataArray = this.logData.getLogData(logType);
            if (logDataArray && logDataArray.length > 0) {
                this.wellLog = new WellLog(this, logDataArray, logType);
                
                // Match visibility with well
                if (this.mesh && this.wellLog) {
                    this.wellLog.setVisible(this.mesh.visible);
                }
            }
        }
    }

    /**
     * Get available log types for this well
     * @returns {string[]}
     */
    getAvailableLogs() {
        if (!this.logData) return ['None'];
        return ['None', ...this.logData.getAvailableLogs()];
    }

    /**
     * Get current log type
     * @returns {string}
     */
    getCurrentLogType() {
        return this.currentLogType;
    }

    dispose() {
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

export class WellLoader {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.wells = [];           // Array of Well objects
        this.wellsMap = new Map(); // Map of name -> Well for quick lookup
        this.onWellsLoaded = null; // Callback when wells are loaded
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

            // Track coordinates to detect duplicates
            const coordinateMap = new Map(); // key: "inline,crossline" -> count

            for (let i = 1; i < rows.length; i++) {
                const cols = rows[i].split(delimiter);

                let inline = parseFloat(cols[inlineIdx]);
                let crossline = parseFloat(cols[crossIdx]);
                const name = cols[nameIdx]?.trim();

                if (!isNaN(inline) && !isNaN(crossline) && name) {
                    // Skip duplicate names
                    if (this.wellsMap.has(name)) {
                        console.log(`Skipping duplicate well name: ${name}`);
                        continue;
                    }

                    // Check for duplicate coordinates and apply offset
                    const coordKey = `${inline},${crossline}`;
                    if (coordinateMap.has(coordKey)) {
                        const count = coordinateMap.get(coordKey);
                        // Offset subsequent wells slightly in a circular pattern
                        const angle = (count * Math.PI * 2) / 4; // Divide circle into 4 parts
                        const offset = 0.5; // Small offset
                        inline += offset * Math.cos(angle);
                        crossline += offset * Math.sin(angle);
                        coordinateMap.set(coordKey, count + 1);
                        console.log(`Well ${name} has duplicate coordinates with another well, applying offset`);
                    } else {
                        coordinateMap.set(coordKey, 1);
                    }

                    const well = new Well(
                        this.sceneManager,
                        name,
                        inline,
                        crossline,
                        0,              // timeStart
                        defaultTimeEnd  // timeEnd
                    );
                    this.wells.push(well);
                    this.wellsMap.set(name, well);
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

    setWellsVisible(names, visible) {
        names.forEach(name => this.setWellVisible(name, visible));
    }

    setAllVisible(visible) {
        this.wells.forEach(w => w.setVisible(visible));
    }

    toggleWell(name) {
        const well = this.wellsMap.get(name);
        if (well) {
            const newState = !well.mesh?.visible;
            well.setVisible(newState);
            return newState;
        }
        return false;
    }

    isWellVisible(name) {
        const well = this.wellsMap.get(name);
        return well?.mesh?.visible ?? false;
    }

    /**
     * Attach log data to wells
     * @param {WellLogLoader} wellLogLoader 
     */
    attachLogData(wellLogLoader) {
        for (const [name, well] of this.wellsMap) {
            const logData = wellLogLoader.getWellLogData(name);
            if (logData) {
                well.setLogData(logData);
                console.log(`Attached log data to well ${name}`);
            }
        }
    }

    /**
     * Set log type for a specific well
     * @param {string} wellName 
     * @param {string} logType 
     */
    setWellLogType(wellName, logType) {
        const well = this.wellsMap.get(wellName);
        if (well) {
            well.setLogType(logType);
        }
    }

    /**
     * Get available log types for a specific well
     * @param {string} wellName 
     * @returns {string[]}
     */
    getWellAvailableLogs(wellName) {
        const well = this.wellsMap.get(wellName);
        return well ? well.getAvailableLogs() : ['None'];
    }

    /**
     * Get current log type for a specific well
     * @param {string} wellName 
     * @returns {string}
     */
    getWellCurrentLogType(wellName) {
        const well = this.wellsMap.get(wellName);
        return well ? well.getCurrentLogType() : 'None';
    }

    dispose() {
        this.wells.forEach(w => w.dispose());
        this.wells = [];
        this.wellsMap.clear();
    }
}
