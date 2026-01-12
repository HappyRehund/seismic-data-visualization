/**
 * App.js
 * =======
 * Main application entry point.
 *
 * This file orchestrates all components and follows the
 * DEPENDENCY INVERSION principle - high-level modules depend
 * on abstractions, not concrete implementations.
 *
 * DATA FLOW:
 * 1. App initializes SceneManager (Three.js infrastructure)
 * 2. App creates components (planes, horizons, faults, wells)
 * 3. App creates UI controls and connects them to components
 * 4. App starts the render loop
 *
 * TO ADD NEW COMPONENTS:
 * 1. Create a new file in /components/
 * 2. Import it here
 * 3. Instantiate it in the _initComponents() method
 * 4. Add UI controls in _initUI() if needed
 */

// Core
import { SceneManager } from './core/SceneManager.js';

// Components
import { InlinePlane, CrosslinePlane } from './components/SeismicPlane.js';
import { HorizonManager } from './components/Horizon.js';
import { FaultLoader } from './components/Fault.js';
import { WellLoader } from './components/Well.js';

// UI
import { UIManager } from './ui/UIControls.js';

/**
 * Main Seismic Viewer Application
 */
class SeismicViewerApp {
    constructor() {
        // Core systems
        this.sceneManager = null;
        this.uiManager = null;

        // Components
        this.inlinePlane = null;
        this.crosslinePlane = null;
        this.horizonManager = null;
        this.faultLoader = null;
        this.wellLoader = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Seismic Viewer...');

        // Step 1: Setup 3D scene
        this._initScene();

        // Step 2: Create seismic components
        this._initComponents();

        // Step 3: Setup UI controls
        this._initUI();

        // Step 4: Load data
        await this._loadData();

        // Step 5: Start rendering
        this.sceneManager.startRenderLoop();

        console.log('Seismic Viewer initialized successfully!');
    }

    /**
     * Initialize Three.js scene
     * @private
     */
    _initScene() {
        this.sceneManager = new SceneManager();
    }

    /**
     * Initialize seismic visualization components
     * @private
     */
    _initComponents() {
        // Seismic slice planes
        this.inlinePlane = new InlinePlane(this.sceneManager);
        this.crosslinePlane = new CrosslinePlane(this.sceneManager);

        // Horizon manager for multiple horizons
        this.horizonManager = new HorizonManager(this.sceneManager);

        // Fault loader
        this.faultLoader = new FaultLoader(this.sceneManager);

        // Well loader
        this.wellLoader = new WellLoader(this.sceneManager);
    }

    /**
     * Initialize UI controls and connect to components
     * @private
     */
    _initUI() {
        this.uiManager = new UIManager();

        // Connect sliders to planes
        this.uiManager.createInlineSlider(this.inlinePlane);
        this.uiManager.createCrosslineSlider(this.crosslinePlane);

        // Connect toggle button to horizons
        this.uiManager.createHorizonToggle(this.horizonManager);
    }

    /**
     * Load all data files
     * @private
     */
    async _loadData() {
        // Load horizons
        // Add your horizon CSV files here
        try {
            await this.horizonManager.addHorizon('/horizon.csv', 'top');
            await this.horizonManager.addHorizon('/horizon.csv', 'bottom');
        } catch (e) {
            console.warn('Horizon file not found or invalid:', e);
        }

        // Load wells
        try {
            await this.wellLoader.load('/well_coordinates.csv');
        } catch (e) {
            console.warn('Well file not found or invalid');
        }

        // Load faults (uncomment to enable)
        // await this.faultLoader.loadFaultLines('/CSV_fault/fault1.csv');
        // await this.faultLoader.loadFaultSurfaces('/CSV_fault/fault1.csv');
    }

    // ========================================
    // PUBLIC API FOR ADDING COMPONENTS
    // ========================================

    /**
     * Add a horizon from CSV file
     * @param {string} csvPath - Path to CSV file
     * @param {string} zColumn - Name of Z/depth column
     */
    async addHorizon(csvPath, zColumn = 'Z') {
        return await this.horizonManager.addHorizon(csvPath, zColumn);
    }

    /**
     * Load 2D fault lines
     * @param {string} csvPath - Path to CSV file
     */
    async addFaultLines(csvPath) {
        await this.faultLoader.loadFaultLines(csvPath);
    }

    /**
     * Load 3D fault surfaces
     * @param {string} csvPath - Path to CSV file
     */
    async addFaultSurfaces(csvPath) {
        await this.faultLoader.loadFaultSurfaces(csvPath);
    }

    /**
     * Load wells from CSV
     * @param {string} csvPath - Path to CSV file
     */
    async addWells(csvPath) {
        await this.wellLoader.load(csvPath);
    }
}

// ========================================
// APPLICATION STARTUP
// ========================================

// Create and initialize app when DOM is ready
const app = new SeismicViewerApp();

// Export for console access (debugging)
window.seismicApp = app;

// Initialize
app.init().catch(error => {
    console.error('Failed to initialize application:', error);
});
