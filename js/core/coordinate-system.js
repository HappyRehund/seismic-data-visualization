import { SeismicConfig } from '../config/seismic.config.js';

export class CoordinateSystem {

    static inlineToX(inline) {
        const normalized = inline / (SeismicConfig.inlineCount - 1);
        return normalized * SeismicConfig.imageWidth;
    }

    static crosslineToZ(crossline) {
        const normalized = crossline / (SeismicConfig.crosslineCount - 1);
        return normalized * SeismicConfig.imageWidth;
    }

    static timeToY(time) {
        return -time + SeismicConfig.verticalOffset;
    }

    static seismicToWorld(point) {
        return new THREE.Vector3(
            this.inlineToX(point.inline || point.inline_n),
            this.timeToY(point.time || point.z),
            this.crosslineToZ(point.crossline || point.crossline_n)
        );
    }

    static indexToPosition(index, maxCount) {
        const normalized = index / (maxCount - 1);
        return normalized * SeismicConfig.imageWidth;
    }

    static getBoundingBoxCenter() {
        return {
            x: SeismicConfig.imageWidth / 2,
            y: SeismicConfig.imageHeight / 2,
            z: SeismicConfig.imageWidth / 2
        };
    }
}