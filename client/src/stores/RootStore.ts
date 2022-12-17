import FilterStore from "./FilterStore";
import SnackbarStore from "./SnackbarStore";
import MapStore from "./MapStore";

export class RootStore {
  snackbarStore: SnackbarStore;
  filterStore: FilterStore;
  mapStore: MapStore;
  constructor() {
    this.snackbarStore = new SnackbarStore(this);
    this.filterStore = new FilterStore(this);
    this.mapStore = new MapStore(this);
  }
}

const rootStore = new RootStore();

export default rootStore;
