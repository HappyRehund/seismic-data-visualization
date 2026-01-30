import { SeismicConfig, StyleConfig } from '../config/SeismicConfig.js';
import { WellLog } from './WellLog.js';

/**
 * WellLabel Class
 * Renders a text label above the well using a sprite
 * Follows OOP best practices with single responsibility
 */
export class WellLabel {
    /**
     * @param {Well} well - Parent Well instance
     * @param {string} text - Label text to display
     */
    constructor(well, text) {
        this.well = well;
        this.text = text;
        this.sprite = null;

        this._create();
    }

    /**
     * Create the text sprite
     * @private
     */
    _create() {
        // Create canvas for text rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Configure canvas size
        const fontSize = 48;
        const padding = 20;
        context.font = `bold ${fontSize}px Arial`;
        const textMetrics = context.measureText(this.text);
        
        canvas.width = textMetrics.width + padding * 2;
        canvas.height = fontSize + padding * 2;

        // Draw background (semi-transparent dark)
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this._roundRect(context, 0, 0, canvas.width, canvas.height, 8);
        context.fill();

        // Draw text
        context.font = `bold ${fontSize}px Arial`;
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.text, canvas.width / 2, canvas.height / 2);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create sprite material
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,      // Always render on top
            depthWrite: false
        });

        // Create sprite
        this.sprite = new THREE.Sprite(material);

        // Calculate scale based on canvas aspect ratio
        const aspectRatio = canvas.width / canvas.height;
        const labelHeight = 15;  // Height in world units
        this.sprite.scale.set(labelHeight * aspectRatio, labelHeight, 1);

        // Position above the well
        this._updatePosition();

        // Set render order to ensure it's on top
        this.sprite.renderOrder = 100;

        this.sprite.userData = {
            type: 'wellLabel',
            wellName: this.well.name
        };

        this.well.sceneManager.add(this.sprite);
    }

    /**
     * Draw rounded rectangle on canvas
     * @private
     */
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

    /**
     * Update label position to be above well
     * @private
     */
    _updatePosition() {
        if (!this.sprite || !this.well.mesh) return;

        const wellMesh = this.well.mesh;
        const wellHeight = wellMesh.geometry.parameters.height;
        const wellTopY = wellMesh.position.y + wellHeight / 2;

        // Position label above the well top
        this.sprite.position.set(
            wellMesh.position.x,
            wellTopY + 20,  // Offset above well
            wellMesh.position.z
        );
    }

    /**
     * Set visibility of the label
     * @param {boolean} visible
     */
    setVisible(visible) {
        if (this.sprite) {
            this.sprite.visible = visible;
        }
    }

    /**
     * Dispose the label and free resources
     */
    dispose() {
        if (this.sprite) {
            this.well.sceneManager.remove(this.sprite);
            this.sprite.material.map.dispose();
            this.sprite.material.dispose();
            this.sprite = null;
        }
    }
}

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

        // Well label
        this.label = null;             // WellLabel instance

        this._create(inline, crossline, timeStart, timeEnd, radius, color);
        this._createLabel();
    }

    /**
     * Create the well name label
     * @private
     */
    _createLabel() {
        this.label = new WellLabel(this, this.name);
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
            shininess: 100,
            transparent: true,
            opacity: 0.4,           // Make well semi-transparent so logs are visible
            depthWrite: false       // Prevent z-fighting with log inside
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.renderOrder = 0;  // Render well first, then log on top
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
        if (this.label) this.label.setVisible(visible);
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
        // Dispose label
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
            // key: "inline,crossline" -> { primaryName, duplicates: [] }
            const coordinateMap = new Map();

            // First pass: identify all wells and group by coordinates
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

            // Group wells by coordinates
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

            // Second pass: create wells (only primary wells, with duplicate info)
            for (const [coordKey, coordData] of coordinateMap) {
                const { primary, duplicates } = coordData;

                // Skip if we already have this well name
                if (this.wellsMap.has(primary.name)) {
                    console.log(`Skipping duplicate well name: ${primary.name}`);
                    continue;
                }

                // Create display name with duplicate info
                let displayName = primary.name;
                if (duplicates.length > 0) {
                    console.log(`Well ${primary.name} has duplicates at same location: ${duplicates.join(', ')}`);
                }

                const well = new Well(
                    this.sceneManager,
                    primary.name,
                    primary.inline,
                    primary.crossline,
                    0,              // timeStart
                    defaultTimeEnd  // timeEnd
                );

                // Store duplicate names for reference
                well.duplicateNames = duplicates;

                this.wells.push(well);
                this.wellsMap.set(primary.name, well);

                // Also map duplicate names to the same well for log data matching
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

    setWellsVisible(names, visible) {
        names.forEach(name => this.setWellVisible(name, visible));
    }

    setAllVisible(visible) {
        this.wells.forEach(w => w.setVisible(visible));
    }

    /**
     * Attach log data to wells
     * @param {WellLogLoader} wellLogLoader
     */
    attachLogData(wellLogLoader) {
        let attachedCount = 0;

        for (const [name, well] of this.wellsMap) {
            // Try multiple name formats to match well log data
            const namesToTry = [
                name,                           // Original: "067"
                `GNK-${name}`,                  // With prefix: "GNK-067"
                `GNK-0${name}`,                 // With prefix and leading zero: "GNK-0067"
                name.replace(/^0+/, ''),        // Without leading zeros: "67"
                `GNK-${name.replace(/^0+/, '')}`, // GNK without leading zeros: "GNK-67"
                name.padStart(3, '0'),          // Padded to 3 digits: "067"
                `GNK-${name.padStart(3, '0')}`, // GNK with padding: "GNK-067"
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

    /**
     * Set log type for all wells at once
     * @param {string} logType
     */
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
