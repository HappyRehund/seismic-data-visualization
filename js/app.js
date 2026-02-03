import { SceneManager } from './core/scene-manager.js';
import {
    FaultFacade,
    HorizonFacade,
    SceneFacade,
    SeismicPlaneFacade,
    WellFacade
} from './facade/index.js';

import { DataLoadingOrchestrator } from './data/data-loader.js';
import { UIManager } from './ui/ui-controls.js';
import { loadingUI } from './ui/loading-ui.js';
import { FaultFileConfig } from './config/fault-file.config.js';
import { loadingStateManager } from './data/data-loader-factory.js';

class SeismicViewerApp {
    constructor() {
        this.sceneManager = null;
        this.uiManager = null;

        this.dataOrchestrator = null;
        this.loadingStateManager = loadingStateManager;

        this.sceneFacade = null;
        this.seismicPlanes = null;
        this.faults = null;
        this.horizons = null;
        this.wells = null;
    }

    async init() {
        console.log('Initializing Seismic Viewer...');

        try {
            this._initScene();

            this._initSeismicPlanes();

            this._initDataOrchestrator();

            await this._loadData();

            this._initUI();

            this.sceneFacade.startRenderLoop();

            console.log('Seismic Viewer initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize Seismic Viewer:', error);
            loadingUI.forceHide();
            throw error;
        }
    }

    _initScene() {
        this.sceneManager = new SceneManager();
        this.sceneFacade = new SceneFacade(this.sceneManager);
    }

    _initSeismicPlanes() {
        this.seismicPlanes = new SeismicPlaneFacade(this.sceneManager);
    }

    _initDataOrchestrator() {
        this.dataOrchestrator = new DataLoadingOrchestrator(this.sceneManager);
        this.dataOrchestrator.initialize();
    }

    _initUI() {
        this.uiManager = new UIManager();

        const planes = this.seismicPlanes.getPlanes();
        this.uiManager.createInlineSlider(planes.inline);
        this.uiManager.createCrosslineSlider(planes.crossline);

        this.uiManager.createHorizonToggle(this.horizons.getManager());

        this.uiManager.createFaultToggle(this.faults.getLoader());

        this.uiManager.createWellPanel(this.wells.getWellLoader());

        this.uiManager.refreshWellLogSelectors();

        this.uiManager.createCameraReset(this.sceneManager);
    }

    async _loadData() {

        this.loadingStateManager.registerTask('horizons', 'Loading Horizons');
        this.loadingStateManager.registerTask('faults', 'Loading Faults');
        this.loadingStateManager.registerTask('wells', 'Loading Wells');

        // Listen to loading progress
        this.loadingStateManager.addListener((state) => {
            console.log(`Loading: ${state.totalProgress.toFixed(0)}% - ${state.currentTask || 'Done'}`);
        });

        const faultFiles = FaultFileConfig.getAllFaultFiles();

        try {
            this.loadingStateManager.updateTask('horizons', { status: 'loading', progress: 0 });
            this.loadingStateManager.updateTask('faults', { status: 'loading', progress: 0 });
            this.loadingStateManager.updateTask('wells', { status: 'loading', progress: 0 });

            const result = await this.dataOrchestrator.loadAll({
                horizonConfig: {
                    csvPath: '/horizon.csv',
                    zColumns: ['top', 'bottom']
                },
                wellConfig: {
                    csvPath: '/well_coordinates.csv'
                },
                wellLogConfig: {
                    csvPath: '/GNK_update.csv'
                },
                faultConfig: {
                    faultFiles: faultFiles,
                    as3D: true
                }
            });

            this.horizons = new HorizonFacade(this.sceneManager);
            this.horizons.horizonManager = result.horizonManager;
            this.loadingStateManager.completeTask('horizons', true, 'Horizons loaded');

            this.faults = new FaultFacade(this.sceneManager);
            this.faults.faultLoader = result.faultLoader;
            this.faults.isLoaded = true;
            this.loadingStateManager.completeTask('faults', true, 'Faults loaded');

            this.wells = new WellFacade(this.sceneManager);
            this.wells.wellLoader = result.wellLoader;
            this.wells.wellLogLoader = result.wellLogLoader;
            this.loadingStateManager.completeTask('wells', true, 'Wells loaded');

            loadingUI.setDataSource(result.dataSource);
        } catch (error) {
            this.loadingStateManager.completeTask('horizons', false, error.message);
            this.loadingStateManager.completeTask('faults', false, error.message);
            this.loadingStateManager.completeTask('wells', false, error.message);
            throw error;
        }
    }

    async addHorizon(csvPath, zColumn = 'Z') {
        return await this.horizons.load(csvPath, zColumn);
    }

    async addFaultLines(csvPath) {
        await this.faults.addFaultLines(csvPath);
    }

    async addFaultSurfaces(csvPath) {
        await this.faults.addFaultSurface(csvPath);
    }

    async addWells(csvPath) {
        await this.wells.loadWells(csvPath);
    }

    setInlineIndex(index) {
        this.seismicPlanes.setInlineIndex(index);
    }

    setCrosslineIndex(index) {
        this.seismicPlanes.setCrosslineIndex(index);
    }

    toggleHorizons() {
        return this.horizons.toggle();
    }

    toggleFaults() {
        return this.faults.toggle();
    }

    toggleWells() {
        return this.wells.toggle();
    }

    resetCamera() {
        this.sceneFacade.resetCamera();
    }

    getDataSource() {
        return this.dataOrchestrator?.getFactory()
            .getDataSourceManager()
            .getCurrentSourceName() || 'Unknown';
    }

    getSceneFacade() {
        return this.sceneFacade;
    }

    getSeismicPlanesFacade() {
        return this.seismicPlanes;
    }

    getFaultFacade() {
        return this.faults;
    }

    getHorizonFacade() {
        return this.horizons;
    }

    getWellFacade() {
        return this.wells;
    }
}

const app = new SeismicViewerApp();

window.seismicApp = app;

app.init().catch(error => {
    console.error('Failed to initialize application:', error);
});
