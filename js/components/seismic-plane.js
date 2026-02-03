import { SeismicConfig, PathConfig } from '../config/seismic.config.js';
import { CoordinateSystem } from '../core/coordinate-system.js';

class SeismicPlaneBase {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.plane = null;
        this.loader = new THREE.TextureLoader();
        this.currentIndex = 0;
    }

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

    setIndex(index) {
        this.currentIndex = index;
        this._updatePosition();
        this._loadTexture();
    }

    // Abstract methods - to be implemented by subclasses
    _updatePosition() {
        throw new Error('Must implement _updatePosition');
    }

    _loadTexture() {
        throw new Error('Must implement _loadTexture');
    }

    _getImagePath(index) {
        throw new Error('Must implement _getImagePath');
    }
}

export class InlinePlane extends SeismicPlaneBase {
    constructor(sceneManager) {
        super(sceneManager);
        this._initialize();
    }

    _initialize() {
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

    static getMaxIndex() {
        return SeismicConfig.maxInlineIndex;
    }
}

export class CrosslinePlane extends SeismicPlaneBase {
    constructor(sceneManager) {
        super(sceneManager);
        this._initialize();
    }

    _initialize() {
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

    static getMaxIndex() {
        return SeismicConfig.maxCrosslineIndex;
    }
}
