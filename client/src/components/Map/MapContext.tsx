import { createContext } from "react";
import { MapboxMap } from "react-map-gl";
import { VisualType } from "./MapProvider";

// TODO: maybe allow components to get certain features of the map instead of the map as a whole
interface MapContextState {
  // current map that can be accessed in the rest of the app
  map: MapboxMap | null;
  // set new map-object (e.g. on viewport change)
  setMap: (map: MapboxMap) => void;
  selectedVisualType: VisualType;
  setSelectedVisualType: (visualType: VisualType) => void;
  loadMapData: () => Promise<void>;
}

export const MapContext = createContext({} as MapContextState);
