/**
 * UIControls.js
 * ==============
 * Handles all UI elements: sliders, buttons, labels.
 *
 * SINGLE RESPONSIBILITY: UI interaction only
 * DEPENDENCY INVERSION: Components injected, UI doesn't know implementation details
 */

import { SeismicConfig } from '../config/SeismicConfig.js';

/**
 * Slider control for seismic planes
 */
export class SliderControl {
    /**
     * @param {string} sliderId - HTML element ID for the slider
     * @param {string} labelId - HTML element ID for the label
     * @param {number} maxValue - Maximum slider value
     * @param {Function} onChange - Callback when value changes
     */
    constructor(sliderId, labelId, maxValue, onChange) {
        this.slider = document.getElementById(sliderId);
        this.label = document.getElementById(labelId);
        this.onChange = onChange;

        if (this.slider) {
            this._init(maxValue);
        }
    }

    _init(maxValue) {
        this.slider.max = maxValue;
        this.slider.value = 0;

        this.slider.addEventListener('input', () => {
            const value = parseInt(this.slider.value);
            this._updateLabel(value);

            if (this.onChange) {
                this.onChange(value);
            }
        });
    }

    _updateLabel(value) {
        if (this.label) {
            this.label.textContent = value.toString();
        }
    }

    /**
     * Set slider value programmatically
     */
    setValue(value) {
        if (this.slider) {
            this.slider.value = value;
            this._updateLabel(value);
        }
    }

    /**
     * Get current value
     */
    getValue() {
        return this.slider ? parseInt(this.slider.value) : 0;
    }
}

/**
 * Toggle button for visibility control
 */
export class ToggleButton {
    /**
     * @param {string} buttonId - HTML element ID
     * @param {string} showText - Text when items are visible
     * @param {string} hideText - Text when items are hidden
     * @param {Function} onToggle - Callback when toggled
     */
    constructor(buttonId, showText, hideText, onToggle) {
        this.button = document.getElementById(buttonId);
        this.showText = showText;
        this.hideText = hideText;
        this.onToggle = onToggle;
        this.isActive = true;

        if (this.button) {
            this._init();
        }
    }

    _init() {
        this.button.textContent = this.hideText;

        this.button.addEventListener('click', () => {
            this.isActive = !this.isActive;
            this._updateText();

            if (this.onToggle) {
                this.onToggle(this.isActive);
            }
        });
    }

    _updateText() {
        this.button.textContent = this.isActive ? this.hideText : this.showText;
    }

    /**
     * Set state programmatically
     */
    setState(active) {
        this.isActive = active;
        this._updateText();
    }
}

/**
 * UI Manager - coordinates all UI elements
 */
export class UIManager {
    constructor() {
        this.controls = {};
    }

    /**
     * Create inline slider
     * @param {InlinePlane} inlinePlane - The plane to control
     */
    createInlineSlider(inlinePlane) {
        this.controls.inlineSlider = new SliderControl(
            'inlineSlider',
            'label_inline',
            SeismicConfig.maxInlineIndex,
            (value) => inlinePlane.setIndex(value)
        );
    }

    /**
     * Create crossline slider
     * @param {CrosslinePlane} crosslinePlane - The plane to control
     */
    createCrosslineSlider(crosslinePlane) {
        this.controls.crosslineSlider = new SliderControl(
            'crosslineSlider',
            'label_crossline',
            SeismicConfig.maxCrosslineIndex,
            (value) => crosslinePlane.setIndex(value)
        );
    }

    /**
     * Create horizon toggle button
     * @param {HorizonManager} horizonManager - The horizon manager
     */
    createHorizonToggle(horizonManager) {
        this.controls.horizonToggle = new ToggleButton(
            'toggleHorizonBtn',
            'Show Horizon',
            'Hide Horizon',
            (visible) => horizonManager.setAllVisible(visible)
        );
    }

    /**
     * Get a control by name
     */
    getControl(name) {
        return this.controls[name];
    }
}
