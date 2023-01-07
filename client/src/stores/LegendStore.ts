import { action, makeObservable, observable } from "mobx";
import { RootStore } from "./RootStore";

/**
 * specifies a legend item
 */
export interface LegendObject {
  layerName: string;
  color: string;
}

class LegendStore {
  isLegendActive: boolean;
  legendItems: LegendObject[];
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.isLegendActive = false;
    this.legendItems = [];
    this.rootStore = rootStore;

    makeObservable(this, {
      isLegendActive: observable,
      legendItems: observable,
      rootStore: false,
      showLegend: action,
      hideLegend: action,
      addItem: action,
      removeItem: action,
    });
  }

  showLegend(): void {
    this.isLegendActive = true;
  }

  hideLegend(): void {
    this.isLegendActive = false;
    this.legendItems = [];
  }

  addItem(layerName: string, color: string): void {
    this.legendItems.push({ layerName: layerName, color: color });
  }

  removeItem(layerName: string): boolean {
    this.legendItems = this.legendItems.filter((legendItem) => {
      legendItem.layerName !== layerName;
    });
    if (this.legendItems.length === 0) {
      this.isLegendActive = false;
      return true;
    }
    return false;
  }
}

export default LegendStore;
