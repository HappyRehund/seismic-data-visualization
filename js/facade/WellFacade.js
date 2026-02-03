import { WellLoader } from '../components/Well.js';
import { WellLogLoader } from '../components/WellLog.js';

export class WellFacade {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.wellLoader = new WellLoader(sceneManager);
        this.wellLogLoader = new WellLogLoader();
        this.isVisible = true;
    }

    async loadWells(csvPath, defaultTimeEnd = 1200) {
        await this.wellLoader.load(csvPath, defaultTimeEnd);
    }

    async loadWellLogs(csvPath) {
        await this.wellLogLoader.load(csvPath);
    }

    async loadAll(wellCsvPath, logCsvPath) {
        await this.loadWells(wellCsvPath);
        await this.loadWellLogs(logCsvPath);
        this.attachLogs();
    }

    attachLogs() {
        this.wellLoader.attachLogData(this.wellLogLoader);
    }

    show() {
      this.setAllVisible(true);
    }

    hide() {
      this.setAllVisible(false);
    }

    toggle() {
        this.setAllVisible(!this.isVisible);
        return this.isVisible;
    }

    setAllVisible(visible) {
        this.wellLoader.setAllVisible(visible);
        this.isVisible = visible;
    }

    setWellVisible(wellName, visible) {
        this.wellLoader.setWellVisible(wellName, visible);
    }

    setWellLogType(wellName, logType) {
        this.wellLoader.setWellLogType(wellName, logType);
    }

    setAllWellsLogType(logType) {
        this.wellLoader.setAllWellsLogType(logType);
    }

    getWellAvailableLogs(wellName) {
        return this.wellLoader.getWellAvailableLogs(wellName);
    }

    getWellNames() {
      return this.wellLoader.getWellNames();
    }

    getWell(name) {
      return this.wellLoader.getWell(name);
    }

    getWellCount() {
      return this.wellLoader.wells.length;
    }

    getVisible() {
      return this.isVisible;
    }

    getWellLoader() {
      return this.wellLoader;
    }

    getWellLogLoader() {
      return this.wellLogLoader;
    }

    dispose() {
      this.wellLoader.dispose();
    }
}
