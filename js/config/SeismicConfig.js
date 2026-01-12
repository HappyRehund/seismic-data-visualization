/**
 * SeismicConfig.js
 * ================
 * Single source of truth for all configuration constants.
 *
 * HOW TO DEFINE THESE VALUES:
 * - inlineCount: Number of PNG files in /inline/ folder
 * - crosslineCount: Number of PNG files in /crossline/ folder
 * - imageWidth/Height: Pixel dimensions of your seismic PNG images
 * - timeSize: Depth/time range from seismic survey metadata
 * - yTop/yBottom: Vertical clipping range for visualization
 */

export const SeismicConfig = {
    // ========================================
    // SEISMIC DATA DIMENSIONS
    // ========================================

    /** Total number of inline slices (count files in /inline/ folder) */
    inlineCount: 1092,

    /** Total number of crossline slices (count files in /crossline/ folder) */
    crosslineCount: 549,

    /** Time/depth range in milliseconds (from seismic survey metadata) */
    timeSize: 1400,

    // ========================================
    // IMAGE DIMENSIONS (in pixels)
    // ========================================

    /** Width of seismic slice images */
    imageWidth: 2790,

    /** Height of seismic slice images */
    imageHeight: 2800,

    // ========================================
    // 3D VISUALIZATION SETTINGS
    // ========================================

    /** Spacing between slices in 3D space (affects cube stretch) */
    depthStep: 1100,

    /** Top clipping boundary for vertical display */
    yTop: 200,

    /** Bottom clipping boundary for vertical display */
    yBottom: 1600,

    // ========================================
    // COMPUTED VALUES (don't modify directly)
    // ========================================

    /** Vertical offset for positioning elements */
    get verticalOffset() {
        return this.timeSize + 200;
    },

    /** Maximum inline index (for sliders) */
    get maxInlineIndex() {
        return this.inlineCount - 1;
    },

    /** Maximum crossline index (for sliders) */
    get maxCrosslineIndex() {
        return this.crosslineCount - 1;
    }
};

/**
 * Camera configuration for 3D navigation
 */
export const CameraConfig = {
    fov: 45,
    near: 100,
    far: 10000,

    // Initial camera position (spherical coordinates)
    initialRadius: 4000,
    initialTheta: Math.PI / 4,   // Horizontal angle
    initialPhi: Math.PI / 3,     // Vertical angle

    // Zoom limits
    minRadius: 500,
    maxRadius: 10000,

    // Mouse sensitivity
    rotationSpeed: 0.005
};

/**
 * Visual styling configuration
 */
export const StyleConfig = {
    backgroundColor: 0x111111,
    boundingBoxColor: 0x888888,

    // Component colors
    defaultFaultColor: 0xff0000,
    defaultFault3DColor: 0x00ffff,
    defaultWellColor: 0xffff00,

    // Component sizes
    wellRadius: 10,
    horizonPointSize: 2,

    // Opacity
    fault3DOpacity: 0.6
};

/**
 * File path configuration
 */
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
