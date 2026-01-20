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

    _initScene() {
        this.sceneManager = new SceneManager();
    }

    _initComponents() {
        this.inlinePlane = new InlinePlane(this.sceneManager);
        this.crosslinePlane = new CrosslinePlane(this.sceneManager);

        this.horizonManager = new HorizonManager(this.sceneManager);

        this.faultLoader = new FaultLoader(this.sceneManager);

        this.wellLoader = new WellLoader(this.sceneManager);
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
    }

    async _loadData() {
        try {
            await this.horizonManager.addHorizon('/horizon.csv', 'top');
            await this.horizonManager.addHorizon('/horizon.csv', 'bottom');
        } catch (e) {
            console.warn('Horizon file not found or invalid:', e);
        }

        try {
            await this.wellLoader.load('/well_coordinates.csv');
        } catch (e) {
            console.warn('Well file not found or invalid');
        }

        const faultFiles = [
            'CSV_fault/F1(IL^Thrust Fault).csv',
            'CSV_fault/F2(XL^Normal Fault).csv',
            'CSV_fault/F3(XL^Normal Fault).csv',
            'CSV_fault/F4(XL^Normal Fault).csv',
            'CSV_fault/F5(XL^Normal Fault).csv',
            'CSV_fault/F6(IL^Thrust Fault).csv',
            'CSV_fault/F7(XL^Normal Fault).csv',
            'CSV_fault/F8(XL^Transpressional).csv',
            'CSV_fault/F9(XL^Transpressional).csv',
            'CSV_fault/F10(XL^Transpressional).csv',
            'CSV_fault/F11(XL^Transpressional).csv',
            'CSV_fault/F12(XL^Transpressional).csv',
            'CSV_fault/F13(XL^Normal Transpressional).csv',
            'CSV_fault/F14(XL^Transpressional).csv',
            'CSV_fault/F15(XL^Normal Fault).csv',
            'CSV_fault/F16(XL^Transpressional).csv',
            'CSV_fault/F17(XL^Transpressional).csv',
            'CSV_fault/F18(XL^Transpressional).csv',
            'CSV_fault/F19(XL^Transpressional).csv',
            'CSV_fault/F20(XL^Transpressional).csv',
            'CSV_fault/F21(XL^Transpressional).csv',
            'CSV_fault/F22(XL^Normal Fault).csv',
            'CSV_fault/F23(XL^Normal Fault).csv',
            'CSV_fault/F24(XL^Transpressional).csv',
            'CSV_fault/F25(XL^Transpressional).csv',
            'CSV_fault/F26(XL^Normal Fault).csv',
            'CSV_fault/F27(XL^Normal_Fault).csv',
            'CSV_fault/F28(XL^Normal Fault).csv',
            'CSV_fault/F30(XL^Normal Fault).csv',
            'CSV_fault/F31(XL^Normal Fault).csv',
            'CSV_fault/F32(XL^Normal Fault).csv',
            'CSV_fault/F33(XL^Normal Fault).csv',
            'CSV_fault/F34(XL^Transpressional).csv',
            'CSV_fault/F35(XL^Normal Fault).csv',
            'CSV_fault/F36(XL^Transpressional).csv',
            'CSV_fault/F37(XL^Normal Fault).csv',
            'CSV_fault/F38(XL^Normal Fault).csv',
            'CSV_fault/F39(XL^Normal Fault).csv',
            'CSV_fault/F40(XL^Normal Fault).csv',
            'CSV_fault/F41(XL^Normal Fault).csv',
            'CSV_fault/F42(XL^Transressional).csv',
            'CSV_fault/F43(XL^Transpressional).csv',
            'CSV_fault/F44(XL^Normal Fault).csv',
            'CSV_fault/F45 (XL^Transpressional).csv',
            'CSV_fault/F46 (XL^Transpressional).csv',
            'CSV_fault/F47 (XL^Normal Fault).csv',
            'CSV_fault/F48(XL^Normal Fault).csv',
            'CSV_fault/F49 (XL^Normal Fault).csv',
            'CSV_fault/F50 (XL^Normal Fault).csv',
            'CSV_fault/F51 (XL^Normal Fault).csv',
            'CSV_fault/F52 (XL^Transpressional).csv',
            'CSV_fault/F53 (XL^Normal Fault).csv',
            'CSV_fault/F54(XL^Transpressional).csv',
            'CSV_fault/F55 (XL^Transpressional).csv',
            'CSV_fault/F56 (XL^Normal Fault).csv',
            'CSV_fault/F57 (XL^Normal Fault).csv',
            'CSV_fault/F58(XL^Transpressional).csv',
            'CSV_fault/F59 (XL^Transpressional).csv',
            'CSV_fault/F60 (XL^Normal Fault).csv',
            'CSV_fault/F61 (XL^Transpressional).csv',
            'CSV_fault/F62 (IL^Reverse Fault).csv',
            'CSV_fault/F63 (IL^Normal Fault).csv',
            'CSV_fault/F64 (IL^Normal Fault).csv',
            'CSV_fault/F65 (IL^Normal Fault).csv',
            'CSV_fault/F66 (XL^Transpressional).csv',
            'CSV_fault/F67 (XL^Transpressional).csv',
            'CSV_fault/F68 (XL^Transpressional).csv',
            'CSV_fault/F69 (XL^Transpressional).csv',
            'CSV_fault/F70 (XL^Transpressional).csv',
            'CSV_fault/F71 (XL^Transpressional).csv',
            'CSV_fault/F72 (XL^Trans[ressional).csv',
            'CSV_fault/F73 (XL^Transpressional).csv',
            'CSV_fault/F74 (XL^Transpressional).csv',
            'CSV_fault/F75 (XL^Transpressional).csv',
            'CSV_fault/F76 (XL^Normal Fault).csv',
            'CSV_fault/F77 (XL^Normal Fault).csv',
            'CSV_fault/F78 (XL^Transpressional).csv',
            'CSV_fault/F79 (XL^Transpressional).csv',
            'CSV_fault/F80 (XL^Trampsressional).csv',
            'CSV_fault/F81 (XL^Normal Fault).csv',
            'CSV_fault/F82 (XL^Tramspressional).csv',
            'CSV_fault/F83 (XL^Normal Fault).csv',
            'CSV_fault/F84 (XL^Transpressional).csv',
            'CSV_fault/F85 (XL^Transpressional).csv',
            'CSV_fault/F86 (XL^Transpressional).csv',
            'CSV_fault/F87 (XL^Transpressional).csv',
            'CSV_fault/F88 (XL^Transpressional).csv',
            'CSV_fault/F89 (XL^Normal Fault).csv',
            'CSV_fault/F90 (XL^Normal Fault).csv',
            'CSV_fault/F91 (XL^Transpressional).csv',
            'CSV_fault/F92 (XL^Transpressional).csv',
            'CSV_fault/F93 (XL^Transpressional).csv',
            'CSV_fault/F94 (XL^Normal Fault).csv',
            'CSV_fault/F95 (XL^Transpressional).csv',
            'CSV_fault/F96 (XL^Transpressional).csv',
            'CSV_fault/F100(XL^Transpressional).csv',
            'CSV_fault/F101 (XL^Normal Fault).csv',
            'CSV_fault/F102 (XL^Normal Fault).csv',
            'CSV_fault/F103 (XL^Normal Fault).csv',
            'CSV_fault/F104 (XL^Normal Fault).csv',
            'CSV_fault/F105 (XL^Normal Fault).csv',
            'CSV_fault/F106 (XL^Normal Fault).csv',
            'CSV_fault/F107 (XL^Normal Fault).csv',
            'CSV_fault/F108 (XL^Normal Fault).csv',
            'CSV_fault/F109 (XL^Transpressional).csv',
            'CSV_fault/F110 (XL^Normal Fault).csv',
            'CSV_fault/F111 (XL^Tranpsressional).csv',
            'CSV_fault/F112 (XL^Transpressional).csv',
            'CSV_fault/F113 (XL^Transpressional).csv',
            'CSV_fault/F114 (XL^Normal Fault).csv',
            'CSV_fault/F115 (XL^Normal Fault).csv',
            'CSV_fault/F116 (XL^Transpressional).csv',
            'CSV_fault/F118 (XL^Transpressional).csv',
            'CSV_fault/F119 (XL^Transpressional).csv',
            'CSV_fault/F120 (XL^Transpressional).csv',
            'CSV_fault/F121 (XL^Transressional).csv',
            'CSV_fault/F122 (XL^Transprssional).csv',
            'CSV_fault/F123 (XL^Normal Fault).csv',
            'CSV_fault/F124 (XL^Normal Fault).csv',
            'CSV_fault/F125 (XL^Transpressional).csv',
            'CSV_fault/F126 (XL^Normal Fault).csv',
            'CSV_fault/F126 (XL^Transpressional).csv',
            'CSV_fault/F127 (XL^Normal Fault).csv',
            'CSV_fault/F128 (XL^Normal Fault).csv',
            'CSV_fault/F129 (XL^Normal Fault).csv',
            'CSV_fault/F130 (IL^Normal Fault).csv',
            'CSV_fault/F131(IL^Normal Fault).csv',
            'CSV_fault/F132 (IL^Normal Fault).csv'
        ];
        
        try {
            await this.faultLoader.loadAllFaults(faultFiles, true); // Load as 3D surfaces
        } catch (e) {
            console.warn('Failed to load some fault files:', e);
        }
    }

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
}

const app = new SeismicViewerApp();

window.seismicApp = app;

app.init().catch(error => {
    console.error('Failed to initialize application:', error);
});
