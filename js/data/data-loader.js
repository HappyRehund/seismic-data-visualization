/**
 * DataLoaders.js
 * ===============
 * Concrete data loader implementations using Factory pattern.
 * Each loader extends AbstractDataLoader and implements specific loading logic.
 *
 * ARCHITECTURE:
 * - AbstractDataLoader provides template method for loading flow
 * - Concrete loaders implement _fetchData() and _processData()
 * - DataSourceManager handles DB vs CSV fallback automatically
 */

import { AbstractDataLoader, DataLoaderFactory, loadingStateManager } from './data-loader-factory.js';
import { HorizonManager } from '../components/horizon.js';
import { FaultLoader } from '../components/fault.js';
import { WellLoader } from '../components/well.js';
import { WellLogLoader } from '../components/well-log.js';

// ============================================================
// HORIZON LOADER
// ============================================================

export class HorizonDataLoader extends AbstractDataLoader {
    constructor(sceneManager, dataSourceManager) {
        super(sceneManager, dataSourceManager);
        this.horizonManager = new HorizonManager(sceneManager);
    }

    get typeName() {
        return 'Horizons';
    }

    async _fetchData(options) {
        const { csvPath = '/horizon.csv', zColumns = ['top', 'bottom'] } = options;

        try {
            // Try database first
            const data = await this.dataSourceManager.fetch('horizons', {});
            return { source: 'database', data, zColumns };
        } catch (error) {
            // Fallback to CSV - return path for horizon manager to handle
            return { source: 'csv', csvPath, zColumns };
        }
    }

    async _processData(fetchResult, options) {
        const { source, csvPath, zColumns, data } = fetchResult;

        if (source === 'database') {
            // Process database response
            // TODO: Implement when database is ready
            console.log('Processing horizon data from database');
            return this.horizonManager;
        }

        // CSV fallback - use existing horizon manager logic
        for (const zColumn of zColumns) {
            try {
                await this.horizonManager.addHorizon(csvPath, zColumn);
                this._updateState('loading', 50 + (zColumns.indexOf(zColumn) * 20), `Loaded horizon: ${zColumn}`);
            } catch (error) {
                console.warn(`Failed to load horizon column ${zColumn}:`, error);
            }
        }

        return this.horizonManager;
    }

    getManager() {
        return this.horizonManager;
    }
}

// ============================================================
// FAULT LOADER
// ============================================================

export class FaultDataLoader extends AbstractDataLoader {
    constructor(sceneManager, dataSourceManager) {
        super(sceneManager, dataSourceManager);
        this.faultLoader = new FaultLoader(sceneManager);
    }

    get typeName() {
        return 'Faults';
    }

    async _fetchData(options) {
        const { faultFiles = [], as3D = true } = options;

        try {
            // Try database first
            const data = await this.dataSourceManager.fetch('faults', {});
            return { source: 'database', data, as3D };
        } catch (error) {
            // Fallback to CSV
            return { source: 'csv', faultFiles, as3D };
        }
    }

    async _processData(fetchResult, options) {
        const { source, faultFiles, as3D, data } = fetchResult;

        if (source === 'database') {
            // Process database response
            // TODO: Implement when database is ready
            console.log('Processing fault data from database');
            return this.faultLoader;
        }

        // CSV fallback
        if (faultFiles.length > 0) {
            const totalFiles = faultFiles.length;
            let loadedCount = 0;

            for (const file of faultFiles) {
                try {
                    if (as3D) {
                        await this.faultLoader.loadFaultSurfaces(file);
                    } else {
                        await this.faultLoader.loadFaultLines(file);
                    }
                    loadedCount++;
                    const progress = 20 + (loadedCount / totalFiles * 70);
                    this._updateState('loading', progress, `Loaded fault ${loadedCount}/${totalFiles}`);
                } catch (error) {
                    console.warn(`Failed to load fault: ${file}`, error);
                }
            }
        }

        return this.faultLoader;
    }

    getLoader() {
        return this.faultLoader;
    }
}

// ============================================================
// WELL LOADER
// ============================================================

export class WellDataLoader extends AbstractDataLoader {
    constructor(sceneManager, dataSourceManager) {
        super(sceneManager, dataSourceManager);
        this.wellLoader = new WellLoader(sceneManager);
    }

    get typeName() {
        return 'Wells';
    }

    async _fetchData(options) {
        const { csvPath = '/well_coordinates.csv' } = options;

        try {
            // Try database first
            const data = await this.dataSourceManager.fetch('wells', {});
            return { source: 'database', data };
        } catch (error) {
            // Fallback to CSV
            return { source: 'csv', csvPath };
        }
    }

    async _processData(fetchResult, options) {
        const { source, csvPath, data } = fetchResult;

        if (source === 'database') {
            // Process database response
            // TODO: Implement when database is ready
            console.log('Processing well data from database');
            return this.wellLoader;
        }

        // CSV fallback
        await this.wellLoader.load(csvPath);
        return this.wellLoader;
    }

    getLoader() {
        return this.wellLoader;
    }
}

// ============================================================
// WELL LOG LOADER
// ============================================================

export class WellLogDataLoader extends AbstractDataLoader {
    constructor(sceneManager, dataSourceManager) {
        super(sceneManager, dataSourceManager);
        this.wellLogLoader = new WellLogLoader();
    }

    get typeName() {
        return 'Well Logs';
    }

    async _fetchData(options) {
        const { csvPath = '/GNK_update.csv' } = options;

        try {
            // Try database first
            const data = await this.dataSourceManager.fetch('well-logs', {});
            return { source: 'database', data };
        } catch (error) {
            // Fallback to CSV
            return { source: 'csv', csvPath };
        }
    }

    async _processData(fetchResult, options) {
        const { source, csvPath, data } = fetchResult;

        if (source === 'database') {
            // Process database response
            // TODO: Implement when database is ready
            console.log('Processing well log data from database');
            return this.wellLogLoader;
        }

        // CSV fallback
        await this.wellLogLoader.load(csvPath);
        return this.wellLogLoader;
    }

    getLoader() {
        return this.wellLogLoader;
    }
}

// ============================================================
// SEISMIC DATA LOADER FACTORY (Extended)
// ============================================================

/**
 * Extended factory with pre-registered loaders
 */
export class SeismicDataLoaderFactory extends DataLoaderFactory {
    constructor() {
        super();

        // Register all loader types
        this.registerLoader('horizon', HorizonDataLoader);
        this.registerLoader('fault', FaultDataLoader);
        this.registerLoader('well', WellDataLoader);
        this.registerLoader('wellLog', WellLogDataLoader);
    }

    /**
     * Create all loaders at once
     * @param {Object} sceneManager
     * @returns {Object} Map of loader instances
     */
    createAllLoaders(sceneManager) {
        return {
            horizon: this.createLoader('horizon', sceneManager),
            fault: this.createLoader('fault', sceneManager),
            well: this.createLoader('well', sceneManager),
            wellLog: this.createLoader('wellLog', sceneManager)
        };
    }
}

// ============================================================
// DATA LOADING ORCHESTRATOR
// ============================================================

/**
 * Orchestrates the loading of all data with progress tracking
 */
export class DataLoadingOrchestrator {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.factory = new SeismicDataLoaderFactory();
        this.loaders = {};
        this.results = {};
    }

    /**
     * Initialize all loaders
     */
    initialize() {
        this.loaders = this.factory.createAllLoaders(this.sceneManager);
    }

    /**
     * Load all data with progress tracking
     * @param {Object} config - Loading configuration
     * @returns {Promise<Object>}
     */
    async loadAll(config = {}) {
        const {
            horizonConfig = {},
            faultConfig = {},
            wellConfig = {},
            wellLogConfig = {}
        } = config;

        // Register tasks with loading state manager
        loadingStateManager.registerTask('horizon', 'Horizons');
        loadingStateManager.registerTask('well', 'Wells');
        loadingStateManager.registerTask('wellLog', 'Well Logs');
        loadingStateManager.registerTask('fault', 'Faults');

        // Load in sequence for proper dependency handling
        // (wells need to be loaded before well logs can be attached)

        // 1. Load Horizons
        try {
            loadingStateManager.updateTask('horizon', { status: 'loading', progress: 0 });
            this.results.horizon = await this.loaders.horizon.load(horizonConfig);
            loadingStateManager.completeTask('horizon', true, 'Loaded');
        } catch (error) {
            console.warn('Horizon loading failed:', error);
            loadingStateManager.completeTask('horizon', false, 'Failed');
        }

        // 2. Load Wells
        try {
            loadingStateManager.updateTask('well', { status: 'loading', progress: 0 });
            this.results.well = await this.loaders.well.load(wellConfig);
            loadingStateManager.completeTask('well', true, 'Loaded');
        } catch (error) {
            console.warn('Well loading failed:', error);
            loadingStateManager.completeTask('well', false, 'Failed');
        }

        // 3. Load Well Logs (depends on wells)
        try {
            loadingStateManager.updateTask('wellLog', { status: 'loading', progress: 0 });
            this.results.wellLog = await this.loaders.wellLog.load(wellLogConfig);

            // Attach log data to wells if both loaded successfully
            if (this.results.well && this.results.wellLog) {
                const wellLoader = this.loaders.well.getLoader();
                const wellLogLoader = this.loaders.wellLog.getLoader();
                wellLoader.attachLogData(wellLogLoader);
            }

            loadingStateManager.completeTask('wellLog', true, 'Loaded');
        } catch (error) {
            console.warn('Well log loading failed:', error);
            loadingStateManager.skipTask('wellLog', 'No data');
        }

        // 4. Load Faults (can be loaded independently)
        try {
            loadingStateManager.updateTask('fault', { status: 'loading', progress: 0 });
            this.results.fault = await this.loaders.fault.load(faultConfig);
            loadingStateManager.completeTask('fault', true, 'Loaded');
        } catch (error) {
            console.warn('Fault loading failed:', error);
            loadingStateManager.completeTask('fault', false, 'Failed');
        }

        return {
            horizonManager: this.loaders.horizon.getManager(),
            faultLoader: this.loaders.fault.getLoader(),
            wellLoader: this.loaders.well.getLoader(),
            wellLogLoader: this.loaders.wellLog.getLoader(),
            dataSource: this.factory.getDataSourceManager().getCurrentSourceName()
        };
    }

    /**
     * Get factory instance
     * @returns {SeismicDataLoaderFactory}
     */
    getFactory() {
        return this.factory;
    }
}
