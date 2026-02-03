/**
 * LoadingUI.js
 * =============
 * Manages the loading screen UI
 * Implements Observer pattern to react to loading state changes
 */

import { loadingStateManager } from '../data/data-loader-factory.js';

/**
 * LoadingUI Class
 * Manages the visual loading screen and progress indicators
 */
export class LoadingUI {
    constructor() {
        this.screen = document.getElementById('loadingScreen');
        this.progressFill = document.getElementById('loadingProgressFill');
        this.statusText = document.getElementById('loadingStatus');
        this.tasksContainer = document.getElementById('loadingTasks');
        this.dataSourceName = document.getElementById('dataSourceName');
        this.dataSourceIndicator = document.getElementById('dataSourceIndicator');
        this.currentDataSource = document.getElementById('currentDataSource');

        this._bindToStateManager();
    }

    /**
     * Bind to the loading state manager
     * @private
     */
    _bindToStateManager() {
        loadingStateManager.addListener((state) => this._onStateChange(state));
    }

    /**
     * Handle state changes from LoadingStateManager
     * @private
     * @param {Object} state
     */
    _onStateChange(state) {
        this._updateProgress(state.totalProgress);
        this._updateStatus(state.currentTask);
        this._updateTasks(state.tasks);

        if (state.isComplete) {
            this._onComplete(state.hasErrors);
        }
    }

    /**
     * Update progress bar
     * @private
     * @param {number} progress - 0-100
     */
    _updateProgress(progress) {
        if (this.progressFill) {
            this.progressFill.style.width = `${Math.min(100, progress)}%`;
        }
    }

    /**
     * Update status text
     * @private
     * @param {string|null} currentTask
     */
    _updateStatus(currentTask) {
        if (this.statusText) {
            this.statusText.textContent = currentTask
                ? `Loading ${currentTask}...`
                : 'Processing...';
        }
    }

    /**
     * Update task list UI
     * @private
     * @param {Array} tasks
     */
    _updateTasks(tasks) {
        if (!this.tasksContainer) return;

        this.tasksContainer.innerHTML = '';

        tasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `loading-task ${this._getTaskClass(task.status)}`;

            const iconEl = document.createElement('span');
            iconEl.className = 'task-icon';
            iconEl.innerHTML = this._getTaskIcon(task.status);

            const labelEl = document.createElement('span');
            labelEl.textContent = task.label;

            taskEl.appendChild(iconEl);
            taskEl.appendChild(labelEl);

            if (task.message && (task.status === 'error' || task.status === 'skipped')) {
                const msgEl = document.createElement('span');
                msgEl.style.marginLeft = 'auto';
                msgEl.style.fontSize = '11px';
                msgEl.style.opacity = '0.7';
                msgEl.textContent = task.message;
                taskEl.appendChild(msgEl);
            }

            this.tasksContainer.appendChild(taskEl);
        });
    }

    /**
     * Get CSS class for task status
     * @private
     * @param {string} status
     * @returns {string}
     */
    _getTaskClass(status) {
        switch (status) {
            case 'loading': return 'active';
            case 'success': return 'complete';
            case 'error': return 'error';
            case 'skipped': return 'skipped';
            default: return '';
        }
    }

    /**
     * Get icon HTML for task status
     * @private
     * @param {string} status
     * @returns {string}
     */
    _getTaskIcon(status) {
        switch (status) {
            case 'pending': return '○';
            case 'loading': return '<div class="task-spinner"></div>';
            case 'success': return '✓';
            case 'error': return '✗';
            case 'skipped': return '⊘';
            default: return '○';
        }
    }

    /**
     * Handle loading complete
     * @private
     * @param {boolean} hasErrors
     */
    _onComplete(hasErrors) {
        if (this.statusText) {
            this.statusText.textContent = hasErrors
                ? 'Completed with some issues'
                : 'Loading complete!';
        }

        // Update progress to 100%
        this._updateProgress(100);

        // Hide loading screen after a short delay
        setTimeout(() => {
            this.hide();
        }, hasErrors ? 1500 : 800);
    }

    /**
     * Set the data source name
     * @param {string} sourceName
     */
    setDataSource(sourceName) {
        if (this.dataSourceName) {
            this.dataSourceName.textContent = sourceName;
        }
        if (this.currentDataSource) {
            this.currentDataSource.textContent = sourceName;
        }
    }

    /**
     * Show the loading screen
     */
    show() {
        if (this.screen) {
            this.screen.classList.remove('hidden');
        }
    }

    /**
     * Hide the loading screen
     */
    hide() {
        if (this.screen) {
            this.screen.classList.add('hidden');
        }
        // Show the data source indicator
        if (this.dataSourceIndicator) {
            this.dataSourceIndicator.style.display = 'block';
        }
    }

    /**
     * Force hide immediately (for error cases)
     */
    forceHide() {
        if (this.screen) {
            this.screen.style.display = 'none';
        }
    }
}

// Export singleton instance
export const loadingUI = new LoadingUI();
