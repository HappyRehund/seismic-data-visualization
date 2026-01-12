/**
 * SeismicPlane.js
 * ================
 * Component for displaying inline and crossline seismic slice images.
 *
 * SINGLE RESPONSIBILITY: Seismic plane rendering only
 * OPEN/CLOSED: Extend via subclass, don't modify
 */

import { SeismicConfig, PathConfig } from '../config/SeismicConfig.js';
import { CoordinateSystem } from '../core/CoordinateSystem.js';

/**
 * Base class for seismic planes
 */
class SeismicPlaneBase {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.plane = null;
        this.loader = new THREE.TextureLoader();
        this.currentIndex = 0;
    }

    /**
     * Create the plane geometry and material
     * @param {THREE.Texture} texture - Initial texture
     * @returns {THREE.Mesh} The plane mesh
     */
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

    /**
     * Update the plane's texture with optimized settings
     * @param {string} path - Path to the new texture image
     */
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

    /**
     * Set the current slice index
     * @param {number} index - New index value
     */
    setIndex(index) {
        this.currentIndex = index;
        this._updatePosition();
        this._loadTexture();
    }

    /**
     * Get current index
     * @returns {number}
     */
    getIndex() {
        return this.currentIndex;
    }

    // Abstract methods - to be implemented by subclasses
    _updatePosition() { throw new Error('Must implement _updatePosition'); }
    _loadTexture() { throw new Error('Must implement _loadTexture'); }
    _getImagePath(index) { throw new Error('Must implement _getImagePath'); }
}

/**
 * Inline seismic plane (perpendicular to X axis)
 */
export class InlinePlane extends SeismicPlaneBase {
    constructor(sceneManager) {
        super(sceneManager);
        this._initialize();
    }

    _initialize() {
        // Load first texture
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

    /**
     * Get maximum index for slider
     */
    static getMaxIndex() {
        return SeismicConfig.maxInlineIndex;
    }
}

/**
 * Crossline seismic plane (perpendicular to Z axis)
 */
export class CrosslinePlane extends SeismicPlaneBase {
    constructor(sceneManager) {
        super(sceneManager);
        this._initialize();
    }

    _initialize() {
        // Load first texture
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

    /**
     * Get maximum index for slider
     */
    static getMaxIndex() {
        return SeismicConfig.maxCrosslineIndex;
    }
}
