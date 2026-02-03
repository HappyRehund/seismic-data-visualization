import { InlinePlane, CrosslinePlane } from '../components/seismic-plane.js';

export class SeismicPlaneFacade {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.inlinePlane = new InlinePlane(sceneManager);
        this.crosslinePlane = new CrosslinePlane(sceneManager);
    }


    setInlineIndex(index) {
        this.inlinePlane.setIndex(Math.max(0, Math.min(index, InlinePlane.getMaxIndex())));
    }

    setCrosslineIndex(index) {
        this.crosslinePlane.setIndex(Math.max(0, Math.min(index, CrosslinePlane.getMaxIndex())));
    }

    setIndices(inlineIndex, crosslineIndex) {
        this.setInlineIndex(inlineIndex);
        this.setCrosslineIndex(crosslineIndex);
    }

    getIndices() {
        return {
            inline: this.inlinePlane.currentIndex,
            crossline: this.crosslinePlane.currentIndex
        };
    }

    getMaxInlineIndex() {
      return InlinePlane.getMaxIndex();
    }

    getMaxCrosslineIndex() {
      return CrosslinePlane.getMaxIndex();
    }

    getPlanes() {
        return {
          inline: this.inlinePlane, crossline: this.crosslinePlane
        };
    }

    dispose() {
        [this.inlinePlane, this.crosslinePlane].forEach(plane => {
            if (plane?.plane) {
                this.sceneManager.remove(plane.plane);
                plane.plane.geometry.dispose();
                plane.plane.material.dispose();
            }
        });
    }
}
