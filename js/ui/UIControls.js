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
 * Well toggle panel for individual well visibility control
 */
export class WellTogglePanel {
    /**
     * @param {string} containerId - HTML element ID for the well list container
     * @param {string} toggleAllBtnId - HTML element ID for the toggle all button
     * @param {WellLoader} wellLoader - The well loader instance
     */
    constructor(containerId, toggleAllBtnId, wellLoader) {
        this.container = document.getElementById(containerId);
        this.toggleAllBtn = document.getElementById(toggleAllBtnId);
        this.wellLoader = wellLoader;
        this.checkboxes = new Map(); // Map of well name -> checkbox element
        this.allVisible = true;

        this._initToggleAllButton();
    }

    _initToggleAllButton() {
        if (this.toggleAllBtn) {
            this.toggleAllBtn.addEventListener('click', () => {
                this.allVisible = !this.allVisible;
                this.toggleAllBtn.textContent = this.allVisible ? 'Hide All' : 'Show All';
                this.wellLoader.setAllVisible(this.allVisible);
                
                // Update all checkboxes
                this.checkboxes.forEach((checkbox) => {
                    checkbox.checked = this.allVisible;
                });
            });
        }
    }

    /**
     * Populate the well list with checkboxes
     * @param {string[]} wellNames - Array of well names
     */
    populateWells(wellNames) {
        if (!this.container) return;

        // Clear existing content
        this.container.innerHTML = '';
        this.checkboxes.clear();

        if (wellNames.length === 0) {
            this.container.innerHTML = '<div style="color: #888; font-style: italic;">No wells found</div>';
            return;
        }

        // Sort well names for better UX
        const sortedNames = [...wellNames].sort((a, b) => {
            // Try numeric sort first
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return a.localeCompare(b);
        });

        // Create checkbox for each well
        sortedNames.forEach(name => {
            const wellItem = document.createElement('div');
            wellItem.className = 'well-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `well_${name}`;
            checkbox.checked = true;
            checkbox.addEventListener('change', () => {
                this.wellLoader.setWellVisible(name, checkbox.checked);
                this._updateToggleAllButton();
            });

            const label = document.createElement('label');
            label.htmlFor = `well_${name}`;
            label.textContent = `Well ${name}`;

            wellItem.appendChild(checkbox);
            wellItem.appendChild(label);
            this.container.appendChild(wellItem);

            this.checkboxes.set(name, checkbox);
        });
    }

    /**
     * Update the toggle all button text based on checkbox states
     * @private
     */
    _updateToggleAllButton() {
        if (!this.toggleAllBtn) return;

        let allChecked = true;
        let allUnchecked = true;

        this.checkboxes.forEach(checkbox => {
            if (checkbox.checked) allUnchecked = false;
            else allChecked = false;
        });

        this.allVisible = allChecked;
        this.toggleAllBtn.textContent = allChecked ? 'Hide All' : 'Show All';
    }

    /**
     * Set checkbox state for a specific well
     * @param {string} name - Well name
     * @param {boolean} checked - Checkbox state
     */
    setWellChecked(name, checked) {
        const checkbox = this.checkboxes.get(name);
        if (checkbox) {
            checkbox.checked = checked;
        }
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
     * Create fault toggle button
     * @param {FaultLoader} faultLoader - The fault loader
     */
    createFaultToggle(faultLoader) {
        this.controls.faultToggle = new ToggleButton(
            'toggleFaultBtn',
            'Show Fault',
            'Hide Fault',
            (visible) => faultLoader.setAllVisible(visible)
        );
    }

    /**
     * Create well toggle panel
     * @param {WellLoader} wellLoader - The well loader
     */
    createWellPanel(wellLoader) {
        this.controls.wellPanel = new WellTogglePanel(
            'wellList',
            'toggleAllWellsBtn',
            wellLoader
        );

        // Set callback to populate wells when loaded
        wellLoader.onWellsLoaded = (wellNames) => {
            this.controls.wellPanel.populateWells(wellNames);
        };

        // If wells are already loaded, populate immediately
        const existingWells = wellLoader.getWellNames();
        if (existingWells.length > 0) {
            this.controls.wellPanel.populateWells(existingWells);
        }
    }

    /**
     * Get a control by name
     */
    getControl(name) {
        return this.controls[name];
    }
}
