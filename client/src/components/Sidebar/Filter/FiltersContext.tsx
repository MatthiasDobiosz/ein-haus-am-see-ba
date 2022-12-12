import { createContext } from "react";
import { MapboxMap } from "react-map-gl";
import { Filter } from "./Filters";

interface FiltersContextState {
  // all active filter layer objects
  allFilterLayers: Filter[];
  // set of alle filternames
  activeFilters: Set<string>;
  // function to add single filter to context array
  addFilter: (filterLayer: Filter) => void;
  // function to remove single filter from context array
  removeFilter: (filterLayer: Filter) => void;
  // gets specific filter layer
  getFilterLayer: (name: string) => Filter | null;
  // clears all filterLayers
  clearAllFilters: () => void;
  // recalculates screen coordinats
  recalculateScreenCoords: (map: MapboxMap) => void;
}

export const FiltersContext = createContext({} as FiltersContextState);
