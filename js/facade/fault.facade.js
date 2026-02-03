import { FaultLoader } from '../components/fault.js';

export class FaultFacade {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.faultLoader = new FaultLoader(sceneManager);
        this.isVisible = true;
        this.isLoaded = false;
    }

    async loadAs3D(faultFiles) {
        console.log(`Loading ${faultFiles.length} fault files as 3D...`);
        for (const file of faultFiles) {
            try {
                await this.faultLoader.loadFaultSurfaces(file);
            } catch (e) {
                console.warn(`Failed to load fault: ${file}`, e);
            }
        }
        this.isLoaded = true;
        console.log(`Faults loaded: ${this.faultLoader.faults.length} objects`);
    }

    async loadAsLines(faultFiles) {
        console.log(`Loading ${faultFiles.length} fault files as lines...`);
        for (const file of faultFiles) {
            try {
                await this.faultLoader.loadFaultLines(file);
            } catch (e) {
                console.warn(`Failed to load fault: ${file}`, e);
            }
        }
        this.isLoaded = true;
        console.log(`Faults loaded: ${this.faultLoader.faults.length} objects`);
    }

    show() {
      this.setVisible(true);
    }

    hide() {
      this.setVisible(false);
    }

    toggle() {
        this.setVisible(!this.isVisible);
        return this.isVisible;
    }

    setVisible(visible) {
        this.faultLoader.setAllVisible(visible);
        this.isVisible = visible;
    }

    getFaultCount() {
      return this.faultLoader.faults.length;
    }

    getVisible() {
      return this.isVisible;
    }

    hasLoaded() {
      return this.isLoaded && this.faultLoader.faults.length > 0;
    }

    getLoader() {
      return this.faultLoader;
    }

    dispose() {
      this.faultLoader.dispose();
      this.isLoaded = false;
    }
}
