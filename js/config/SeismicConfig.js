export const SeismicConfig = {

    inlineCount: 1092,

    crosslineCount: 549,

    timeSize: 1400,

    imageWidth: 2790,

    imageHeight: 2800,

    depthStep: 1100,

    yTop: 200,

    yBottom: 1600,

    get verticalOffset() {
        return this.timeSize + 200;
    },

    get maxInlineIndex() {
        return this.inlineCount - 1;
    },

    get maxCrosslineIndex() {
        return this.crosslineCount - 1;
    }
};

export const CameraConfig = {
    fov: 45,
    near: 100,
    far: 10000,

    initialRadius: 6000,
    initialTheta: Math.PI / 4,
    initialPhi: Math.PI / 3,

    minRadius: 500,
    maxRadius: 10000,

    rotationSpeed: 0.005,
    panSpeed: 2.0,          // Speed for panning (shift + drag)
    zoomSpeed: 1.5          // Zoom smoothness multiplier
};

export const StyleConfig = {
    backgroundColor: 0x111111,
    boundingBoxColor: 0x888888,

    defaultFaultColor: 0xff0000,
    defaultFault3DColor: 0x00ffff,
    defaultWellColor: 0xffff00,

    wellRadius: 10,
    horizonPointSize: 2,

    fault3DOpacity: 0.6
};

export const PathConfig = {
    inlineFolder: '/inline',
    crosslineFolder: '/crossline',

    getInlinePath(index) {
        return `${this.inlineFolder}/inline_${index + 1}.png`;
    },

    getCrosslinePath(index) {
        return `${this.crosslineFolder}/crossline_${index + 1}.png`;
    }
};
