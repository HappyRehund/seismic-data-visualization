/**
 * DataLoaderFactory.js
 * ====================
 * Implements Factory Pattern for data loading with strategy support.
 * 
 * DESIGN PATTERNS:
 * - Factory Pattern: Creates appropriate loader instances
 * - Strategy Pattern: Swappable data sources (DB vs CSV)
 * - Template Method: Common loading flow with customizable steps
 * 
 * USAGE:
 * const factory = new DataLoaderFactory();
 * const horizonLoader = factory.createLoader('horizon', sceneManager);
 * await horizonLoader.load();
 */

// ============================================================
// DATA SOURCE STRATEGY INTERFACE
// ============================================================

/**
 * Abstract base class for data source strategies
 * Implements Strategy Pattern for interchangeable data sources
 */
export class DataSourceStrategy {
    constructor(config = {}) {
        this.config = config;
        this.name = 'BaseStrategy';
    }

    /**
     * Check if this data source is available
     * @returns {Promise<boolean>}
     */
    async isAvailable() {
        throw new Error('Subclass must implement isAvailable()');
    }

    /**
     * Fetch data from this source
     * @param {string} endpoint - Data endpoint/path
     * @param {Object} params - Additional parameters
     * @returns {Promise<any>}
     */
    async fetch(endpoint, params = {}) {
        throw new Error('Subclass must implement fetch()');
    }
}

/**
 * Database data source strategy
 * Will be used when database is ready
 */
export class DatabaseStrategy extends DataSourceStrategy {
    constructor(config = {}) {
        super(config);
        this.name = 'Database';
        this.baseUrl = config.apiBaseUrl || '/api';
    }

    async isAvailable() {
        try {
            // Check if API endpoint is accessible
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
        
        // Add query parameters
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

/**
 * CSV file data source strategy
 * Used as fallback when database is not available
 */
export class CSVStrategy extends DataSourceStrategy {
    constructor(config = {}) {
        super(config);
        this.name = 'CSV';
        this.basePath = config.csvBasePath || '';
    }

    async isAvailable() {
        // CSV is always available as fallback
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

// ============================================================
// ABSTRACT DATA LOADER (Template Method Pattern)
// ============================================================

/**
 * Abstract base class for data loaders
 * Implements Template Method pattern with common loading flow
 */
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
        this.onProgress = null; // Callback for progress updates
    }

    /**
     * Get loader type name
     * @returns {string}
     */
    get typeName() {
        return 'AbstractLoader';
    }

    /**
     * Load data (Template Method)
     * @param {Object} options - Loading options
     * @returns {Promise<any>}
     */
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

    /**
     * Prepare for loading (hook)
     * @protected
     */
    async _prepare(options) {
        // Override in subclasses if needed
    }

    /**
     * Fetch data from source
     * @protected
     * @abstract
     */
    async _fetchData(options) {
        throw new Error('Subclass must implement _fetchData()');
    }

    /**
     * Process fetched data
     * @protected
     * @abstract
     */
    async _processData(data, options) {
        throw new Error('Subclass must implement _processData()');
    }

    /**
     * Finalize after loading (hook)
     * @protected
     */
    async _finalize(result, options) {
        // Override in subclasses if needed
    }

    /**
     * Update loading state
     * @private
     */
    _updateState(status, progress, message, error = null) {
        this.loadingState = { status, progress, message, error };
        if (this.onProgress) {
            this.onProgress({ ...this.loadingState });
        }
    }
}

// ============================================================
// DATA SOURCE MANAGER
// ============================================================

/**
 * Manages data source strategies with fallback support
 */
export class DataSourceManager {
    constructor() {
        this.strategies = [];
        this.currentStrategy = null;
    }

    /**
     * Register a data source strategy
     * @param {DataSourceStrategy} strategy
     * @param {number} priority - Lower = higher priority
     */
    registerStrategy(strategy, priority = 100) {
        this.strategies.push({ strategy, priority });
        this.strategies.sort((a, b) => a.priority - b.priority);
    }

    /**
     * Get the best available strategy
     * @returns {Promise<DataSourceStrategy>}
     */
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

    /**
     * Fetch data with automatic fallback
     * @param {string} endpoint
     * @param {Object} params
     * @returns {Promise<any>}
     */
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

    /**
     * Get current active strategy name
     * @returns {string}
     */
    getCurrentSourceName() {
        return this.currentStrategy?.name || 'Unknown';
    }
}

// ============================================================
// DATA LOADER FACTORY
// ============================================================

/**
 * Factory for creating data loaders
 * Implements Factory Pattern
 */
export class DataLoaderFactory {
    constructor() {
        // Initialize data source manager with strategies
        this.dataSourceManager = new DataSourceManager();
        
        // Register strategies (Database first, CSV as fallback)
        this.dataSourceManager.registerStrategy(
            new DatabaseStrategy({ apiBaseUrl: '/api' }), 
            1  // High priority
        );
        this.dataSourceManager.registerStrategy(
            new CSVStrategy({ csvBasePath: '' }), 
            100  // Low priority (fallback)
        );

        // Registry of loader classes
        this.loaderRegistry = new Map();
    }

    /**
     * Register a custom loader class
     * @param {string} type - Loader type name
     * @param {Function} LoaderClass - Loader class constructor
     */
    registerLoader(type, LoaderClass) {
        this.loaderRegistry.set(type, LoaderClass);
    }

    /**
     * Create a loader instance
     * @param {string} type - Type of loader ('horizon', 'well', 'fault', 'wellLog')
     * @param {Object} sceneManager - Scene manager instance
     * @returns {AbstractDataLoader}
     */
    createLoader(type, sceneManager) {
        const LoaderClass = this.loaderRegistry.get(type);
        if (!LoaderClass) {
            throw new Error(`Unknown loader type: ${type}`);
        }
        return new LoaderClass(sceneManager, this.dataSourceManager);
    }

    /**
     * Get data source manager
     * @returns {DataSourceManager}
     */
    getDataSourceManager() {
        return this.dataSourceManager;
    }
}

// ============================================================
// LOADING STATE MANAGER (Observer Pattern)
// ============================================================

/**
 * Manages overall loading state for the application
 * Implements Observer Pattern for UI updates
 */
export class LoadingStateManager {
    constructor() {
        this.tasks = new Map();
        this.listeners = [];
        this.isComplete = false;
    }

    /**
     * Register a loading task
     * @param {string} taskId - Unique task identifier
     * @param {string} label - Display label for the task
     */
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

    /**
     * Update task state
     * @param {string} taskId
     * @param {Object} state
     */
    updateTask(taskId, state) {
        const task = this.tasks.get(taskId);
        if (task) {
            Object.assign(task, state);
            this._notifyListeners();
        }
    }

    /**
     * Mark task as complete
     * @param {string} taskId
     * @param {boolean} success
     * @param {string} message
     */
    completeTask(taskId, success = true, message = '') {
        this.updateTask(taskId, {
            status: success ? 'success' : 'error',
            progress: 100,
            message
        });
        this._checkAllComplete();
    }

    /**
     * Mark task as skipped
     * @param {string} taskId
     * @param {string} reason
     */
    skipTask(taskId, reason = '') {
        this.updateTask(taskId, {
            status: 'skipped',
            progress: 100,
            message: reason
        });
        this._checkAllComplete();
    }

    /**
     * Add a listener for state changes
     * @param {Function} callback
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove a listener
     * @param {Function} callback
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    /**
     * Get current state
     * @returns {Object}
     */
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

    /**
     * Check if all tasks are complete
     * @private
     */
    _checkAllComplete() {
        const tasks = Array.from(this.tasks.values());
        this.isComplete = tasks.every(t => 
            t.status === 'success' || t.status === 'error' || t.status === 'skipped'
        );
        if (this.isComplete) {
            this._notifyListeners();
        }
    }

    /**
     * Notify all listeners of state change
     * @private
     */
    _notifyListeners() {
        const state = this.getState();
        this.listeners.forEach(callback => callback(state));
    }
}

// Export singleton instance of loading state manager
export const loadingStateManager = new LoadingStateManager();
