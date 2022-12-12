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

  const setSelectedVisualTypeWhenDifferent = (visualType: VisualType) => {
    if (visualType !== selectedVisualType) {
      setSelectedVisualType(visualType);
    }
  };

  /* TODO: Implement depndent functions first
  const loadMapData = (allCurrentFilters: Set<string>): Promise<void> => {
    if (allCurrentFilters.size === 0) {
      return;
    }

    // give feedback to the user
    // FIXME: Do that in component to get snackbarContext
    //showSnackbar("Daten werden geladen...", SnackbarType.INFO, undefined, true);

    if(map){
      const bounds = getViewportBounds(map);
      const allResults = await Promise.allSettled(
        Array.from(allCurrentFilters).map(async (tag) => {
          //TODO: const query = OsmTagCollection.getQueryforCategory(tag);

          //TODO check if already locally loaded this tag; only fetch if not!
        //TODO also check that bounds are nearly the same!
        //! doesnt work like this because filterlayer has already been created before in main!
        /*
        if (FilterManager.activeFilters.has(tag)) {
          console.log("loadin locally");
          const layer = FilterManager.getFilterLayer(tag);
          console.log("tag", tag);
          console.log(layer);
          this.showDataOnMap(layer?.Features, tag);
          return;
        }*/

  //Benchmark.startMeasure("Fetching data from osm");
  // request data from osm

  // TODO: const data = await fetchOsmDataFromServer(bounds, query);

  //Benchmark.stopMeasure("Fetching data from osm");

  //console.log("data from server:", data);

  /* TODO:
        if (data) {
          //const filterLayer = this.preprocessGeoData(data, tag);

          // get the filterlayer for this tag that has already been created at this point
          const layer = FilterManager.getFilterLayer(tag);
          if (layer) {
            layer.OriginalData = data;
          }

          //console.log(this.selectedVisualType);
          if (this.selectedVisualType === VisualType.NORMAL) {
            this.showDataOnMap(data, tag);
          } else {
            Benchmark.startMeasure("Preprocessing geo data for one filter");
            this.preprocessGeoData(data, tag);
            Benchmark.stopMeasure("Preprocessing geo data for one filter");
          }
        }
        })
      )
    }   
    TODO: Rest of the function
  };*/

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
