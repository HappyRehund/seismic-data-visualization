/**
 * Well.js
 * ========
 * Component for loading and displaying well pipes.
 *
 * SINGLE RESPONSIBILITY: Well rendering only
 */

import { SeismicConfig, StyleConfig } from '../config/SeismicConfig.js';

/**
 * Single well pipe representation
 */
export class Well {
    /**
     * @param {SceneManager} sceneManager - Scene manager instance
     * @param {string} name - Well name
     * @param {number} inline - Inline position
     * @param {number} crossline - Crossline position
     * @param {number} timeStart - Top of well (time)
     * @param {number} timeEnd - Bottom of well (time)
     * @param {number} [radius] - Pipe radius
     * @param {number} [color] - Pipe color
     */
    constructor(sceneManager, name, inline, crossline, timeStart, timeEnd,
                radius = StyleConfig.wellRadius, color = StyleConfig.defaultWellColor) {
        this.sceneManager = sceneManager;
        this.name = name;
        this.mesh = null;
        this.label = null;

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
        this.sceneManager.add(this.mesh);

        // Create label
        this.label = this._createLabel();
        this.label.position.set(x, yTop + 100, z);
        this.sceneManager.add(this.label);
    }

    /**
     * Map time value to Y coordinate
     * @private
     */
    _mapTimeToY(time) {
        return time - 200;
    }

    /**
     * Create text label sprite
     * @private
     */
    _createLabel() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const fontSize = 48;
        ctx.font = `${fontSize}px Arial`;

        const textWidth = ctx.measureText(this.name).width;
        canvas.width = textWidth + 20;
        canvas.height = fontSize + 20;

        // Re-render after resize
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(150, 50, 1);

        return sprite;
    }

    /**
     * Toggle visibility
     */
    setVisible(visible) {
        if (this.mesh) this.mesh.visible = visible;
        if (this.label) this.label.visible = visible;
    }

    /**
     * Remove from scene
     */
    dispose() {
        if (this.mesh) {
            this.sceneManager.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        if (this.label) {
            this.sceneManager.remove(this.label);
            this.label.material.map.dispose();
            this.label.material.dispose();
        }
    }
}

/**
 * Well loader - handles CSV parsing and well creation
 */
export class WellLoader {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.wells = [];           // Array of Well objects
        this.wellsMap = new Map(); // Map of name -> Well for quick lookup
        this.onWellsLoaded = null; // Callback when wells are loaded
    }

    /**
     * Load wells from CSV file
     * @param {string} path - Path to CSV file
     * @param {number} [defaultTimeEnd=1200] - Default bottom time if not in CSV
     */
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

            for (let i = 1; i < rows.length; i++) {
                const cols = rows[i].split(delimiter);

                const inline = parseFloat(cols[inlineIdx]);
                const crossline = parseFloat(cols[crossIdx]);
                const name = cols[nameIdx]?.trim();

                if (!isNaN(inline) && !isNaN(crossline) && name) {
                    // Skip duplicates (use first occurrence)
                    if (this.wellsMap.has(name)) {
                        console.log(`Skipping duplicate well: ${name}`);
                        continue;
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

            // Trigger callback if set
            if (this.onWellsLoaded) {
                this.onWellsLoaded(this.getWellNames());
            }
        } catch (error) {
            console.error('Failed to load wells:', error);
        }
    }

    /**
     * Get all well names
     * @returns {string[]} Array of well names
     */
    getWellNames() {
        return this.wells.map(w => w.name);
    }

    /**
     * Get a well by name
     * @param {string} name - Well name
     * @returns {Well|undefined}
     */
    getWell(name) {
        return this.wellsMap.get(name);
    }

    /**
     * Set visibility for a specific well
     * @param {string} name - Well name
     * @param {boolean} visible - Visibility state
     */
    setWellVisible(name, visible) {
        const well = this.wellsMap.get(name);
        if (well) {
            well.setVisible(visible);
        }
    }

    /**
     * Set visibility for multiple wells
     * @param {string[]} names - Array of well names
     * @param {boolean} visible - Visibility state
     */
    setWellsVisible(names, visible) {
        names.forEach(name => this.setWellVisible(name, visible));
    }

    /**
     * Set visibility for all wells
     * @param {boolean} visible - Visibility state
     */
    setAllVisible(visible) {
        this.wells.forEach(w => w.setVisible(visible));
    }

    /**
     * Toggle visibility for a specific well
     * @param {string} name - Well name
     * @returns {boolean} New visibility state
     */
    toggleWell(name) {
        const well = this.wellsMap.get(name);
        if (well) {
            const newState = !well.mesh?.visible;
            well.setVisible(newState);
            return newState;
        }
        return false;
    }

    /**
     * Check if a well is visible
     * @param {string} name - Well name
     * @returns {boolean}
     */
    isWellVisible(name) {
        const well = this.wellsMap.get(name);
        return well?.mesh?.visible ?? false;
    }

    /**
     * Remove all wells
     */
    dispose() {
        this.wells.forEach(w => w.dispose());
        this.wells = [];
        this.wellsMap.clear();
    }
}
