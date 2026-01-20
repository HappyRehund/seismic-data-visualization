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
        this.checkboxes = new Map();     // Map of well name -> checkbox element
        this.logSelectors = new Map();   // Map of well name -> select element
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
        this.logSelectors.clear();

        if (wellNames.length === 0) {
            this.container.innerHTML = '<div style="color: #888; font-style: italic;">No wells found</div>';
            return;
        }

        const sortedNames = [...wellNames].sort((a, b) => {
            // Try to extract numeric part for natural sorting
            const matchA = a.match(/(\d+)/);
            const matchB = b.match(/(\d+)/);
            if (matchA && matchB) {
                return parseInt(matchA[1]) - parseInt(matchB[1]);
            }
            return a.localeCompare(b);
        });

        sortedNames.forEach(name => {
            const wellItem = document.createElement('div');
            wellItem.className = 'well-item';

            // Well name label
            const label = document.createElement('span');
            label.className = 'well-name';
            label.textContent = name;

            // Log type selector dropdown
            const logSelect = document.createElement('select');
            logSelect.className = 'well-log-select';
            logSelect.id = `welllog_${name}`;
            
            // Get available logs for this well
            const availableLogs = this.wellLoader.getWellAvailableLogs(name);
            availableLogs.forEach(logType => {
                const option = document.createElement('option');
                option.value = logType;
                option.textContent = logType;
                logSelect.appendChild(option);
            });

            // Set current selection
            const currentLog = this.wellLoader.getWellCurrentLogType(name);
            logSelect.value = currentLog;

            logSelect.addEventListener('change', () => {
                this.wellLoader.setWellLogType(name, logSelect.value);
            });

            // Visibility checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `well_${name}`;
            checkbox.className = 'well-checkbox';
            checkbox.checked = true;
            checkbox.title = 'Show/Hide well';
            checkbox.addEventListener('change', () => {
                this.wellLoader.setWellVisible(name, checkbox.checked);
                this._updateToggleAllButton();
            });

            wellItem.appendChild(label);
            wellItem.appendChild(logSelect);
            wellItem.appendChild(checkbox);
            this.container.appendChild(wellItem);

            this.checkboxes.set(name, checkbox);
            this.logSelectors.set(name, logSelect);
        });
    }

    /**
     * Refresh log selectors after log data is loaded
     */
    refreshLogSelectors() {
        this.logSelectors.forEach((select, name) => {
            const currentValue = select.value;
            
            // Clear existing options
            select.innerHTML = '';
            
            // Get updated available logs
            const availableLogs = this.wellLoader.getWellAvailableLogs(name);
            availableLogs.forEach(logType => {
                const option = document.createElement('option');
                option.value = logType;
                option.textContent = logType;
                select.appendChild(option);
            });

            // Restore selection if still available
            if (availableLogs.includes(currentValue)) {
                select.value = currentValue;
            }
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

    /**
     * Refresh well log selectors after log data is loaded
     */
    refreshWellLogSelectors() {
        if (this.controls.wellPanel) {
            this.controls.wellPanel.refreshLogSelectors();
        }
    }

    getControl(name) {
        return this.controls[name];
    }
}
