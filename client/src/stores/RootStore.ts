import FilterStore from "./FilterStore";
import SnackbarStore from "./SnackbarStore";
import MapStore from "./MapStore";
import LegendStore from "./LegendStore";

/**
 * Parent RootStore class that enables communication between the different stores
 */
export class RootStore {
  snackbarStore: SnackbarStore;
  filterStore: FilterStore;
  mapStore: MapStore;
  legendStore: LegendStore;
  constructor() {
    this.snackbarStore = new SnackbarStore(this);
    this.filterStore = new FilterStore(this);
    this.mapStore = new MapStore(this);
    this.legendStore = new LegendStore(this);
  }
}

const rootStore = new RootStore();

export default rootStore;
