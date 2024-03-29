import { action, makeObservable, observable } from "mobx";
import { RootStore } from "./RootStore";

/**
 * specifies a legend item
 */
export interface LegendObject {
  layerName: string;
  color: string;
}

/**
 * LegendStore class that handles the state of the POI-Legend
 */
class LegendStore {
  isLegendActive: boolean;
  isOverlayLegendActive: boolean;
  legendItems: LegendObject[];
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.isLegendActive = false;
    this.isOverlayLegendActive = true;
    this.legendItems = [];
    this.rootStore = rootStore;

    makeObservable(this, {
      isLegendActive: observable,
      isOverlayLegendActive: observable,
      legendItems: observable,
      rootStore: false,
      showLegend: action,
      showOverlayLegend: action,
      hideLegend: action,
      hideOverlayLegend: action,
      addItem: action,
      removeItem: action,
    });
  }

  showLegend(): void {
    this.isLegendActive = true;
  }

  showOverlayLegend(): void {
    this.isOverlayLegendActive = true;
  }

  hideLegend(): void {
    this.isLegendActive = false;
    this.legendItems = [];
  }

  hideOverlayLegend(): void {
    this.isOverlayLegendActive = false;
  }

  //FIXME: Könnte hier tatsächlich so passen, da theoretisch bei mehreren Gleichen Layern immer die erste geholt wird und der Name so gleich bleitb
  addItem(layerName: string, color: string): void {
    this.legendItems.push({ layerName: layerName, color: color });
  }

  removeItem(layerName: string): boolean {
    this.legendItems = this.legendItems.filter((legendItem) => {
      return legendItem.layerName !== layerName;
    });

    if (this.legendItems.length === 0) {
      this.isLegendActive = false;
      return true;
    }
    return false;
  }
}

export default LegendStore;
