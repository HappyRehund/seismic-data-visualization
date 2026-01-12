/**
 * CoordinateSystem.js
 * ===================
 * Handles all coordinate transformations between:
 * - Seismic coordinates (inline, crossline, time)
 * - 3D world coordinates (x, y, z)
 *
 * SINGLE RESPONSIBILITY: Only coordinate conversion logic
 */

import { SeismicConfig } from '../config/SeismicConfig.js';

export class CoordinateSystem {

    /**
     * Convert inline number to X coordinate in 3D space
     * @param {number} inline - Inline number from seismic data
     * @returns {number} X coordinate in 3D world
     */
    static inlineToX(inline) {
        const normalized = inline / (SeismicConfig.inlineCount - 1);
        return normalized * SeismicConfig.imageWidth;
    }

    /**
     * Convert crossline number to Z coordinate in 3D space
     * @param {number} crossline - Crossline number from seismic data
     * @returns {number} Z coordinate in 3D world
     */
    static crosslineToZ(crossline) {
        const normalized = crossline / (SeismicConfig.crosslineCount - 1);
        return normalized * SeismicConfig.imageWidth;
    }

    /**
     * Convert time/depth to Y coordinate in 3D space
     * Note: Time increases downward, but Y increases upward in Three.js
     * @param {number} time - Time value in milliseconds
     * @returns {number} Y coordinate in 3D world
     */
    static timeToY(time) {
        return -time + SeismicConfig.verticalOffset;
    }

    /**
     * Convert seismic point to 3D Vector3
     * @param {Object} point - Object with inline, crossline, time properties
     * @returns {THREE.Vector3} 3D position
     */
    static seismicToWorld(point) {
        return new THREE.Vector3(
            this.inlineToX(point.inline || point.inline_n),
            this.timeToY(point.time || point.z),
            this.crosslineToZ(point.crossline || point.crossline_n)
        );
    }

    /**
     * Get normalized position for slider-controlled planes
     * @param {number} index - Slider index value
     * @param {number} maxCount - Total count (inlineCount or crosslineCount)
     * @returns {number} Position in 3D space
     */
    static indexToPosition(index, maxCount) {
        const normalized = index / (maxCount - 1);
        return normalized * SeismicConfig.imageWidth;
    }

    /**
     * Get center of the 3D bounding box
     * @returns {Object} {x, y, z} center coordinates
     */
    static getBoundingBoxCenter() {
        return {
            x: SeismicConfig.imageWidth / 2,
            y: SeismicConfig.imageHeight / 2,
            z: SeismicConfig.imageWidth / 2
        };
    }

    /**
     * Get camera look-at target (slightly below center)
     * @returns {Object} {x, y, z} target coordinates
     */
    static getCameraTarget() {
        const center = this.getBoundingBoxCenter();
        return {
            x: center.x,
            y: center.y - SeismicConfig.depthStep,
            z: center.z
        };
    }
}
