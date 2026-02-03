import { SeismicConfig, StyleConfig } from '../config/SeismicConfig.js';
import { WellLog } from './WellLog.js';

export class WellLabel {

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
        const labelHeight = 15;  // Height in world units
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
            wellTopY + 20,  // Offset above well
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

export class Well {
    constructor(sceneManager, name, inline, crossline, timeStart, timeEnd,
                radius = StyleConfig.wellRadius, color = StyleConfig.defaultWellColor) {
        this.sceneManager = sceneManager;
        this.name = name;
        this.mesh = null;
        this.originalColor = color;
        this.isHighlighted = false;

        this.logData = null;           // WellLogData instance
        this.currentLogType = 'None';  // Currently displayed log type
        this.wellLog = null;           // Current WellLog visualization

        this.label = null;             // WellLabel instance

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
            opacity: 0.4,           // Make well semi-transparent so logs are visible
            depthWrite: false       // Prevent z-fighting with log inside
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

                // Match visibility with well
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
                    0,
                    defaultTimeEnd
                );

                // Store duplicate names for reference
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
