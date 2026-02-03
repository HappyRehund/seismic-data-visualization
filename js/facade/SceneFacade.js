export class SceneFacade {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
    }

    resetCamera() {
        this.sceneManager.resetCamera();
    }

    getCameraPosition() {
        const pos = this.sceneManager.camera.position;
        return { x: pos.x, y: pos.y, z: pos.z };
    }

    getOrbitState() {
        const { theta, phi, radius } = this.sceneManager.orbitState;
        return { theta, phi, radius };
    }

    setOrbitState(theta, phi, radius) {
        Object.assign(this.sceneManager.orbitState, { theta, phi, radius });
        this.sceneManager._updateCameraPosition();
    }

    add(object) {
      this.sceneManager.add(object);
    }

    remove(object) {;
      this.sceneManager.remove(object);
    }

    getScene() {
      return this.sceneManager.scene;
    }

    getCamera() {
      return this.sceneManager.camera;
    }

    getRenderer() {
      return this.sceneManager.renderer;
    }

    startRenderLoop() {
        this.sceneManager.startRenderLoop();
    }

    render() {
        this.sceneManager.renderer.render(
            this.sceneManager.scene,
            this.sceneManager.camera
        );
    }

    getSceneManager() {
      return this.sceneManager;
    }
}
