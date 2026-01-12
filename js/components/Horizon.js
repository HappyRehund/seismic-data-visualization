/**
 * Horizon.js
 * ===========
 * Component for loading and displaying seismic horizon surfaces.
 *
 * SINGLE RESPONSIBILITY: Horizon rendering only
 * Uses CoordinateSystem for all coordinate transformations
 */

import { SeismicConfig, StyleConfig } from '../config/SeismicConfig.js';
import { CoordinateSystem } from '../core/CoordinateSystem.js';

export class Horizon {
    /**
     * @param {SceneManager} sceneManager - The scene manager instance
     */
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.pointCloud = null;
        this.visible = true;

        // Track min/max Z for color mapping
        this.minZ = Infinity;
        this.maxZ = -Infinity;
    }

    /**
     * Load horizon data from CSV file
     * @param {string} csvUrl - Path to the CSV file
     * @param {string} zColumnName - Name of the Z/depth column
     * @returns {Promise<void>}
     */
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

    /**
     * Parse CSV text into structured data
     * @private
     */
    _parseCSV(text, zColumnName) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        // Find column indices
        const inlineIdx = headers.indexOf('Inline');
        const crosslineIdx = headers.indexOf('Crossline');
        const zIdx = headers.indexOf(zColumnName);

        if (inlineIdx === -1 || crosslineIdx === -1 || zIdx === -1) {
            throw new Error(
                `Required columns not found. Need: Inline, Crossline, ${zColumnName}. ` +
                `Found: ${headers.join(', ')}`
            );
        }

        // Parse data and find ranges
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

            // Track ranges
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

    /**
     * Create Three.js point cloud from parsed data
     * @private
     */
    _createPointCloud(data) {
        const { points, ranges } = data;
        const positions = [];
        const colors = [];
        const color = new THREE.Color();

        const inlineRange = ranges.inline.max - ranges.inline.min;
        const crosslineRange = ranges.crossline.max - ranges.crossline.min;
        const zRange = ranges.z.max - ranges.z.min;

        for (const point of points) {
            // Normalize to 0-1 range
            const normInline = (point.inline - ranges.inline.min) / inlineRange;
            const normCrossline = (point.crossline - ranges.crossline.min) / crosslineRange;

            // Convert to 3D coordinates
            const x = normInline * SeismicConfig.imageWidth;
            const z = normCrossline * SeismicConfig.imageWidth;
            const y = CoordinateSystem.timeToY(point.z);

            positions.push(x, y, z);

            // Color based on depth (red = shallow, blue = deep)
            const normalizedZ = (point.z - ranges.z.min) / (zRange / 2);
            color.setHSL(normalizedZ * 0.7, 1.0, 0.5);
            colors.push(color.r, color.g, color.b);
        }

        // Create geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // Create material
        const material = new THREE.PointsMaterial({
            size: StyleConfig.horizonPointSize,
            vertexColors: true
        });

        // Create and add to scene
        this.pointCloud = new THREE.Points(geometry, material);
        this.sceneManager.add(this.pointCloud);
    }

    /**
     * Toggle horizon visibility
     * @param {boolean} [visible] - Force visibility state
     */
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

    /**
     * Check if horizon is visible
     * @returns {boolean}
     */
    isVisible() {
        return this.visible;
    }

    /**
     * Remove horizon from scene
     */
    dispose() {
        if (this.pointCloud) {
            this.sceneManager.remove(this.pointCloud);
            this.pointCloud.geometry.dispose();
            this.pointCloud.material.dispose();
            this.pointCloud = null;
        }
    }
}

/**
 * Factory for creating and managing multiple horizons
 */
export class HorizonManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.horizons = [];
    }

    /**
     * Load a new horizon
     * @param {string} csvUrl - Path to CSV file
     * @param {string} zColumnName - Z column name
     * @returns {Promise<Horizon>}
     */
    async addHorizon(csvUrl, zColumnName) {
        const horizon = new Horizon(this.sceneManager);
        await horizon.load(csvUrl, zColumnName);
        this.horizons.push(horizon);
        return horizon;
    }

    /**
     * Toggle all horizons visibility
     */
    toggleAll() {
        const newState = this.horizons.length > 0 ? !this.horizons[0].isVisible() : true;
        this.horizons.forEach(h => h.setVisible(newState));
        return newState;
    }

    /**
     * Set visibility for all horizons
     */
    setAllVisible(visible) {
        this.horizons.forEach(h => h.setVisible(visible));
    }

    /**
     * Get all horizons
     */
    getAll() {
        return this.horizons;
    }
}
