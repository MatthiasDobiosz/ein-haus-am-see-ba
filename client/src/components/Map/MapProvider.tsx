import { ReactNode, useContext, useState } from "react";
import { MapContext } from "./MapContext";
import { MapboxMap } from "react-map-gl";

export const enum VisualType {
  NORMAL,
  OVERLAY,
  //HEATMAP
}

interface MapContextProviderProps {
  children: ReactNode;
}

/**
 * MapContextProvider Component that enables the rest of the application to access the current map
 */
export function MapContextProvider(
  props: MapContextProviderProps
): JSX.Element {
  const [map, setMap] = useState<MapboxMap | null>(null);
  const [selectedVisualType, setSelectedVisualType] = useState(
    VisualType.OVERLAY
  );
  //tresholds to prevent reloading when small movements are made (performance optimization)
  const zoomTreshold = 0.7; // zoom level difference -> update if a map zoom event changed more than this
  const moveTreshold = 1000; // map center difference in meters
  const currentZoom = map?.getZoom();

  const setSelectedVisualTypeWhenDifferent = (visualType: VisualType) => {
    if (visualType !== selectedVisualType) {
      setSelectedVisualType(visualType);
    }
  };

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        selectedVisualType,
        setSelectedVisualType: setSelectedVisualTypeWhenDifferent,
      }}
      {...props}
    />
  );
}

// expose a helper hook to easily grab the state anywhere in your app
// wary of how you can optimise it:
// https://kentcdodds.com/blog/how-to-optimize-your-context-value
export function useMap() {
  const context = useContext(MapContext);
  if (context === undefined)
    throw Error("You forgot to wrap your app with <MapContextProvider />");
  return context;
}
