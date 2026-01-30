/**
 * App.js
 * =======
 * Main application entry point.
 *
 * This file orchestrates all components and follows:
 * - DEPENDENCY INVERSION principle - high-level modules depend on abstractions
 * - FACTORY PATTERN - DataLoaderFactory creates appropriate loaders
 * - STRATEGY PATTERN - Swappable data sources (DB vs CSV)
 * - OBSERVER PATTERN - Loading state management
 *
 * DATA FLOW:
 * 1. App initializes SceneManager (Three.js infrastructure)
 * 2. App uses DataLoadingOrchestrator to load all data
 * 3. App creates UI controls and connects them to components
 * 4. App starts the render loop
 *
 * TO ADD NEW DATA SOURCES:
 * 1. Implement new DataSourceStrategy in DataLoaderFactory.js
 * 2. Register with DataSourceManager (priority determines fallback order)
 * 
 * TO ADD NEW LOADERS:
 * 1. Extend AbstractDataLoader in DataLoaders.js
 * 2. Register with SeismicDataLoaderFactory
 */

// Core
import { SceneManager } from './core/SceneManager.js';

// Components
import { InlinePlane, CrosslinePlane } from './components/SeismicPlane.js';

// Data Loading (Factory Pattern)
import { DataLoadingOrchestrator } from './data/DataLoaders.js';
import { loadingStateManager } from './data/DataLoaderFactory.js';

// UI
import { UIManager } from './ui/UIControls.js';
import { loadingUI } from './ui/LoadingUI.js';

// Configuration for fault files
import { FaultFileConfig } from './config/FaultFileConfig.js';

class SeismicViewerApp {
    constructor() {
        // Core systems
        this.sceneManager = null;
        this.uiManager = null;

        // Data loading orchestrator (Factory Pattern)
        this.dataOrchestrator = null;

        // Components
        this.inlinePlane = null;
        this.crosslinePlane = null;
        
        // Loaded components (from factory)
        this.horizonManager = null;
        this.faultLoader = null;
        this.wellLoader = null;
        this.wellLogLoader = null;
    }

    async init() {
        console.log('Initializing Seismic Viewer...');

        try {
            // Step 1: Setup 3D scene
            this._initScene();

            // Step 2: Create seismic plane components
            this._initComponents();

            // Step 3: Initialize data orchestrator
            this._initDataOrchestrator();

            // Step 4: Load all data with progress tracking
            await this._loadData();

            // Step 5: Setup UI controls (after data is loaded)
            this._initUI();

            // Step 6: Start rendering
            this.sceneManager.startRenderLoop();

            console.log('Seismic Viewer initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize Seismic Viewer:', error);
            loadingUI.forceHide();
            throw error;
        }
    }

    _initScene() {
        this.sceneManager = new SceneManager();
    }

    _initComponents() {
        this.inlinePlane = new InlinePlane(this.sceneManager);
        this.crosslinePlane = new CrosslinePlane(this.sceneManager);
    }

    _initDataOrchestrator() {
        this.dataOrchestrator = new DataLoadingOrchestrator(this.sceneManager);
        this.dataOrchestrator.initialize();
    }

    _initUI() {
        this.uiManager = new UIManager();

        // Connect sliders to planes
        this.uiManager.createInlineSlider(this.inlinePlane);
        this.uiManager.createCrosslineSlider(this.crosslinePlane);

        // Connect toggle button to horizons
        this.uiManager.createHorizonToggle(this.horizonManager);

        // Connect toggle button to faults
        this.uiManager.createFaultToggle(this.faultLoader);

        // Connect well panel to well loader
        this.uiManager.createWellPanel(this.wellLoader);

        // Refresh well log selectors
        this.uiManager.refreshWellLogSelectors();

        // Connect reset camera button
        this.uiManager.createCameraReset(this.sceneManager);
    }

    async _loadData() {
        // Get fault files configuration
        const faultFiles = FaultFileConfig.getAllFaultFiles();

        // Load all data using the orchestrator
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

        // Store references to loaded components
        this.horizonManager = result.horizonManager;
        this.faultLoader = result.faultLoader;
        this.wellLoader = result.wellLoader;
        this.wellLogLoader = result.wellLogLoader;

        // Update loading UI with data source info
        loadingUI.setDataSource(result.dataSource);
    }

    // ========================================
    // PUBLIC API METHODS
    // ========================================

    async addHorizon(csvPath, zColumn = 'Z') {
        return await this.horizonManager.addHorizon(csvPath, zColumn);
    }

    async addFaultLines(csvPath) {
        await this.faultLoader.loadFaultLines(csvPath);
    }

    async addFaultSurfaces(csvPath) {
        await this.faultLoader.loadFaultSurfaces(csvPath);
    }

    async addWells(csvPath) {
        await this.wellLoader.load(csvPath);
    }

    /**
     * Get the data source being used
     * @returns {string}
     */
    getDataSource() {
        return this.dataOrchestrator?.getFactory()
            .getDataSourceManager()
            .getCurrentSourceName() || 'Unknown';
    }
}

const app = new SeismicViewerApp();

window.seismicApp = app;

app.init().catch(error => {
    console.error('Failed to initialize application:', error);
});
