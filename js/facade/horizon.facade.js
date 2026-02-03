import { HorizonManager } from '../components/horizon.js';

export class HorizonFacade {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.horizonManager = new HorizonManager(sceneManager);
        this.isVisible = true;
    }

    async load(csvPath, zColumn) {
        return await this.horizonManager.addHorizon(csvPath, zColumn);
    }

    async loadMultiple(csvPath, zColumns) {
        const horizons = [];
        for (const zColumn of zColumns) {
            horizons.push(await this.load(csvPath, zColumn));
        }
        return horizons;
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
        this.horizonManager.setAllVisible(visible);
        this.isVisible = visible;
    }

    getHorizonCount() {
      return this.horizonManager.getAll().length;
    }

    getVisible() {
      return this.isVisible;
    }

    getAll() {
      return this.horizonManager.getAll();
    }

    getManager() {
      return this.horizonManager;
    }

    dispose() {
        this.horizonManager.getAll().forEach(h => h.dispose());
    }
}
