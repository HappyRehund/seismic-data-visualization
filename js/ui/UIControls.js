import { SeismicConfig } from '../config/SeismicConfig.js';
export class SliderControl {
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


    setValue(value) {
        if (this.slider) {
            this.slider.value = value;
            this._updateLabel(value);
        }
    }

    getValue() {
        return this.slider ? parseInt(this.slider.value) : 0;
    }
}

export class ToggleButton {
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

    setState(active) {
        this.isActive = active;
        this._updateText();
    }
}

export class WellTogglePanel {
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
                
                this.checkboxes.forEach((checkbox) => {
                    checkbox.checked = this.allVisible;
                });
            });
        }
    }

    populateWells(wellNames) {
        if (!this.container) return;

        // Clear existing content
        this.container.innerHTML = '';
        this.checkboxes.clear();

        if (wellNames.length === 0) {
            this.container.innerHTML = '<div style="color: #888; font-style: italic;">No wells found</div>';
            return;
        }

        const sortedNames = [...wellNames].sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return a.localeCompare(b);
        });

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

    setWellChecked(name, checked) {
        const checkbox = this.checkboxes.get(name);
        if (checkbox) {
            checkbox.checked = checked;
        }
    }
}
export class UIManager {
    constructor() {
        this.controls = {};
    }

    createInlineSlider(inlinePlane) {
        this.controls.inlineSlider = new SliderControl(
            'inlineSlider',
            'label_inline',
            SeismicConfig.maxInlineIndex,
            (value) => inlinePlane.setIndex(value)
        );
    }

    createCrosslineSlider(crosslinePlane) {
        this.controls.crosslineSlider = new SliderControl(
            'crosslineSlider',
            'label_crossline',
            SeismicConfig.maxCrosslineIndex,
            (value) => crosslinePlane.setIndex(value)
        );
    }

    createHorizonToggle(horizonManager) {
        this.controls.horizonToggle = new ToggleButton(
            'toggleHorizonBtn',
            'Show Horizon',
            'Hide Horizon',
            (visible) => horizonManager.setAllVisible(visible)
        );
    }

    createFaultToggle(faultLoader) {
        this.controls.faultToggle = new ToggleButton(
            'toggleFaultBtn',
            'Show Fault',
            'Hide Fault',
            (visible) => faultLoader.setAllVisible(visible)
        );
    }

    createWellPanel(wellLoader) {
        this.controls.wellPanel = new WellTogglePanel(
            'wellList',
            'toggleAllWellsBtn',
            wellLoader
        );

        wellLoader.onWellsLoaded = (wellNames) => {
            this.controls.wellPanel.populateWells(wellNames);
        };

        const existingWells = wellLoader.getWellNames();
        if (existingWells.length > 0) {
            this.controls.wellPanel.populateWells(existingWells);
        }
    }

    getControl(name) {
        return this.controls[name];
    }
}
