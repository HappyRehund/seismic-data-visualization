import { loadingStateManager } from '../data/data-loader-factory.js';
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

    _bindToStateManager() {
        loadingStateManager.addListener((state) => this._onStateChange(state));
    }

    _onStateChange(state) {
        this._updateProgress(state.totalProgress);
        this._updateStatus(state.currentTask);
        this._updateTasks(state.tasks);

        if (state.isComplete) {
            this._onComplete(state.hasErrors);
        }
    }

    _updateProgress(progress) {
        if (this.progressFill) {
            this.progressFill.style.width = `${Math.min(100, progress)}%`;
        }
    }

    _updateStatus(currentTask) {
        if (this.statusText) {
            this.statusText.textContent = currentTask
                ? `Loading ${currentTask}...`
                : 'Processing...';
        }
    }

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

    _getTaskClass(status) {
        switch (status) {
            case 'loading': return 'active';
            case 'success': return 'complete';
            case 'error': return 'error';
            case 'skipped': return 'skipped';
            default: return '';
        }
    }

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

    _onComplete(hasErrors) {
        if (this.statusText) {
            this.statusText.textContent = hasErrors
                ? 'Completed with some issues'
                : 'Loading complete!';
        }

        this._updateProgress(100);

        setTimeout(() => {
            this.hide();
        }, hasErrors ? 1500 : 800);
    }

    setDataSource(sourceName) {
        if (this.dataSourceName) {
            this.dataSourceName.textContent = sourceName;
        }
        if (this.currentDataSource) {
            this.currentDataSource.textContent = sourceName;
        }
    }

    show() {
        if (this.screen) {
            this.screen.classList.remove('hidden');
        }
    }

    hide() {
        if (this.screen) {
            this.screen.classList.add('hidden');
        }
        // Show the data source indicator
        if (this.dataSourceIndicator) {
            this.dataSourceIndicator.style.display = 'block';
        }
    }

    forceHide() {
        if (this.screen) {
            this.screen.style.display = 'none';
        }
    }
}

export const loadingUI = new LoadingUI();
