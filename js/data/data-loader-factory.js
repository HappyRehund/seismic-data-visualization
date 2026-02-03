export class DataSourceStrategy {
    constructor(config = {}) {
        this.config = config;
        this.name = 'BaseStrategy';
    }

    async isAvailable() {
        throw new Error('Subclass must implement isAvailable()');
    }

    async fetch(endpoint, params = {}) {
        throw new Error('Subclass must implement fetch()');
    }
}
export class DatabaseStrategy extends DataSourceStrategy {
    constructor(config = {}) {
        super(config);
        this.name = 'Database';
        this.baseUrl = config.apiBaseUrl || '/api';
    }

    async isAvailable() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000) // 3 second timeout
            });
            return response.ok;
        } catch (error) {
            console.log(`Database API not available: ${error.message}`);
            return false;
        }
    }

    async fetch(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}/${endpoint}`, window.location.origin);

        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Database fetch failed: ${response.status}`);
        }

        return await response.json();
    }
}
export class CSVStrategy extends DataSourceStrategy {
    constructor(config = {}) {
        super(config);
        this.name = 'CSV';
        this.basePath = config.csvBasePath || '';
    }

    async isAvailable() {
        return true;
    }

    async fetch(endpoint, params = {}) {
        const path = `${this.basePath}${endpoint}`;
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`CSV fetch failed: ${response.status} for ${path}`);
        }

        const text = await response.text();
        return this._parseCSV(text);
    }

    _parseCSV(text) {
        const lines = text.trim().split('\n');
        if (lines.length === 0) return { headers: [], rows: [] };

        const headers = lines[0].split(',').map(h => h.trim());
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length >= headers.length) {
                const row = {};
                headers.forEach((header, idx) => {
                    row[header] = values[idx];
                });
                rows.push(row);
            }
        }

        return { headers, rows, rawText: text };
    }
}
export class AbstractDataLoader {
    constructor(sceneManager, dataSourceManager) {
        this.sceneManager = sceneManager;
        this.dataSourceManager = dataSourceManager;
        this.loadingState = {
            status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
            progress: 0,
            message: '',
            error: null
        };
        this.onProgress = null;
    }

    get typeName() {
        return 'AbstractLoader';
    }

    async load(options = {}) {
        this._updateState('loading', 0, `Loading ${this.typeName}...`);

        try {
            // Step 1: Prepare (hook for subclasses)
            await this._prepare(options);
            this._updateState('loading', 10, 'Preparing...');

            // Step 2: Fetch data
            const data = await this._fetchData(options);
            this._updateState('loading', 50, 'Processing data...');

            // Step 3: Process and create objects
            const result = await this._processData(data, options);
            this._updateState('loading', 90, 'Finalizing...');

            // Step 4: Finalize
            await this._finalize(result, options);
            this._updateState('success', 100, `${this.typeName} loaded successfully`);

            return result;
        } catch (error) {
            this._updateState('error', 0, `Failed to load ${this.typeName}`, error);
            throw error;
        }
    }

    async _prepare(options) {
        // Override in subclasses if needed
    }

    async _fetchData(options) {
        throw new Error('Subclass must implement _fetchData()');
    }

    async _processData(data, options) {
        throw new Error('Subclass must implement _processData()');
    }

    async _finalize(result, options) {
        // Override in subclasses if needed
    }

    _updateState(status, progress, message, error = null) {
        this.loadingState = { status, progress, message, error };
        if (this.onProgress) {
            this.onProgress({ ...this.loadingState });
        }
    }
}

export class DataSourceManager {
    constructor() {
        this.strategies = [];
        this.currentStrategy = null;
    }

    registerStrategy(strategy, priority = 100) {
        this.strategies.push({ strategy, priority });
        this.strategies.sort((a, b) => a.priority - b.priority);
    }

    async getAvailableStrategy() {
        for (const { strategy } of this.strategies) {
            if (await strategy.isAvailable()) {
                this.currentStrategy = strategy;
                console.log(`Using data source: ${strategy.name}`);
                return strategy;
            }
        }
        throw new Error('No data source available');
    }

    async fetch(endpoint, params = {}) {
        for (const { strategy } of this.strategies) {
            try {
                if (await strategy.isAvailable()) {
                    return await strategy.fetch(endpoint, params);
                }
            } catch (error) {
                console.warn(`Strategy ${strategy.name} failed for ${endpoint}:`, error.message);
                // Continue to next strategy
            }
        }
        throw new Error(`All data sources failed for: ${endpoint}`);
    }

    getCurrentSourceName() {
        return this.currentStrategy?.name || 'Unknown';
    }
}

export class DataLoaderFactory {
    constructor() {
        this.dataSourceManager = new DataSourceManager();

        this.dataSourceManager.registerStrategy(
            new DatabaseStrategy({ apiBaseUrl: '/api' }),
            1
        );
        this.dataSourceManager.registerStrategy(
            new CSVStrategy({ csvBasePath: '' }),
            100
        );

        this.loaderRegistry = new Map();
    }

    registerLoader(type, LoaderClass) {
        this.loaderRegistry.set(type, LoaderClass);
    }

    createLoader(type, sceneManager) {
        const LoaderClass = this.loaderRegistry.get(type);
        if (!LoaderClass) {
            throw new Error(`Unknown loader type: ${type}`);
        }
        return new LoaderClass(sceneManager, this.dataSourceManager);
    }

    getDataSourceManager() {
        return this.dataSourceManager;
    }
}

export class LoadingStateManager {
    constructor() {
        this.tasks = new Map();
        this.listeners = [];
        this.isComplete = false;
    }

    registerTask(taskId, label) {
        this.tasks.set(taskId, {
            id: taskId,
            label,
            status: 'pending', // 'pending' | 'loading' | 'success' | 'error' | 'skipped'
            progress: 0,
            message: ''
        });
        this._notifyListeners();
    }

    updateTask(taskId, state) {
        const task = this.tasks.get(taskId);
        if (task) {
            Object.assign(task, state);
            this._notifyListeners();
        }
    }

    completeTask(taskId, success = true, message = '') {
        this.updateTask(taskId, {
            status: success ? 'success' : 'error',
            progress: 100,
            message
        });
        this._checkAllComplete();
    }

    skipTask(taskId, reason = '') {
        this.updateTask(taskId, {
            status: 'skipped',
            progress: 100,
            message: reason
        });
        this._checkAllComplete();
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    getState() {
        const tasks = Array.from(this.tasks.values());
        const totalProgress = tasks.length > 0
            ? tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length
            : 0;

        return {
            tasks,
            totalProgress,
            isComplete: this.isComplete,
            hasErrors: tasks.some(t => t.status === 'error'),
            currentTask: tasks.find(t => t.status === 'loading')?.label || null
        };
    }

    _checkAllComplete() {
        const tasks = Array.from(this.tasks.values());
        this.isComplete = tasks.every(t =>
            t.status === 'success' || t.status === 'error' || t.status === 'skipped'
        );
        if (this.isComplete) {
            this._notifyListeners();
        }
    }

    _notifyListeners() {
        const state = this.getState();
        this.listeners.forEach(callback => callback(state));
    }
}

export const loadingStateManager = new LoadingStateManager();
