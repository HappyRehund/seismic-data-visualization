import { AbstractDataLoader, DataLoaderFactory, loadingStateManager } from './data-loader-factory.js';
import { HorizonManager, FaultLoader, WellLoader, WellLogLoader } from '../components/index.js'

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
            const data = await this.dataSourceManager.fetch('horizons', {});
            return { source: 'database', data, zColumns };
        } catch (error) {
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
            const data = await this.dataSourceManager.fetch('faults', {});
            return { source: 'database', data, as3D };
        } catch (error) {
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

        await this.wellLoader.load(csvPath);
        return this.wellLoader;
    }

    getLoader() {
        return this.wellLoader;
    }
}

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

        await this.wellLogLoader.load(csvPath);
        return this.wellLogLoader;
    }

    getLoader() {
        return this.wellLogLoader;
    }
}

export class SeismicDataLoaderFactory extends DataLoaderFactory {
    constructor() {
        super();

        this.registerLoader('horizon', HorizonDataLoader);
        this.registerLoader('fault', FaultDataLoader);
        this.registerLoader('well', WellDataLoader);
        this.registerLoader('wellLog', WellLogDataLoader);
    }

    createAllLoaders(sceneManager) {
        return {
            horizon: this.createLoader('horizon', sceneManager),
            fault: this.createLoader('fault', sceneManager),
            well: this.createLoader('well', sceneManager),
            wellLog: this.createLoader('wellLog', sceneManager)
        };
    }
}

export class DataLoadingOrchestrator {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.factory = new SeismicDataLoaderFactory();
        this.loaders = {};
        this.results = {};
    }

    initialize() {
        this.loaders = this.factory.createAllLoaders(this.sceneManager);
    }

    async loadAll(config = {}) {
        const {
            horizonConfig = {},
            faultConfig = {},
            wellConfig = {},
            wellLogConfig = {}
        } = config;

        loadingStateManager.registerTask('horizon', 'Horizons');
        loadingStateManager.registerTask('well', 'Wells');
        loadingStateManager.registerTask('wellLog', 'Well Logs');
        loadingStateManager.registerTask('fault', 'Faults');

        try {
            loadingStateManager.updateTask('horizon', { status: 'loading', progress: 0 });
            this.results.horizon = await this.loaders.horizon.load(horizonConfig);
            loadingStateManager.completeTask('horizon', true, 'Loaded');
        } catch (error) {
            console.warn('Horizon loading failed:', error);
            loadingStateManager.completeTask('horizon', false, 'Failed');
        }

        try {
            loadingStateManager.updateTask('well', { status: 'loading', progress: 0 });
            this.results.well = await this.loaders.well.load(wellConfig);
            loadingStateManager.completeTask('well', true, 'Loaded');
        } catch (error) {
            console.warn('Well loading failed:', error);
            loadingStateManager.completeTask('well', false, 'Failed');
        }

        try {
            loadingStateManager.updateTask('wellLog', { status: 'loading', progress: 0 });
            this.results.wellLog = await this.loaders.wellLog.load(wellLogConfig);

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

    getFactory() {
        return this.factory;
    }
}
