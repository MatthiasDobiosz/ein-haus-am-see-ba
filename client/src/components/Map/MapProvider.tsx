import { ReactNode, useContext, useState } from "react";
import truncate from "@turf/truncate";
import { MapContext } from "./MapContext";
import { MapboxMap } from "react-map-gl";
import { getViewportBoundsString } from "./mapUtils";
import osmTagCollection from "../../osmTagCollection";
import { fetchOsmDataFromServer } from "../../network/networkUtils";
import { Filter } from "../Sidebar/Filter/Filters";
import MapLayerManager from "../../mapLayerMangager";
import { useFilterLayers } from "../Sidebar/Filter/FiltersContextProvider";
import { FeatureCollection, Geometry } from "geojson";
import { addBufferToFeature } from "./turfUtils";
import { createOverlay } from "../../overlayCreation/canvasRenderer";

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
  const {
    activeFilters,
    allFilterLayers,
    clearAllFilters,
    getFilterLayer,
    removeFilter,
  } = useFilterLayers();
  let mapLayerManager: MapLayerManager;
  if (map) {
    mapLayerManager = new MapLayerManager(map);
  }

  const setSelectedVisualTypeWhenDifferent = (visualType: VisualType) => {
    if (visualType !== selectedVisualType) {
      setSelectedVisualType(visualType);
    }
  };

  const loadMapData = async (): Promise<void> => {
    if (activeFilters.size === 0) {
      return;
    }

    // give feedback to the user
    // FIXME: Do that in component to get snackbarContext
    //showSnackbar("Daten werden geladen...", SnackbarType.INFO, undefined, true);

    if (map) {
      const bounds = getViewportBoundsString(map);
      const allResults = await Promise.allSettled(
        Array.from(activeFilters).map(async (tag) => {
          const query = osmTagCollection.getQueryForCategory(tag);

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

          const data = await fetchOsmDataFromServer(bounds, query);
          console.log("data fetched");
          console.log(data);
          //Benchmark.stopMeasure("Fetching data from osm");

          //console.log("data from server:", data);
          if (data) {
            //const filterLayer = this.preprocessGeoData(data, tag);

            // get the filterlayer for this tag that has already been created at this point
            const layer = getFilterLayer(tag);
            if (layer) {
              layer.originalData = data;
            }

            //console.log(this.selectedVisualType);
            if (selectedVisualType === VisualType.NORMAL) {
              showDataOnMap(data, tag);
            } else {
              console.log("preprocess");
              preprocessGeoData(data, tag);
            }
          }
        })
      );

      let success = true;
      console.log("YEHEE");
      for (const res of allResults) {
        if (res.status === "rejected") {
          success = false;
          break;
        }
      }
      if (!success) {
        // show snackbar
      }
    }
    //showAreasOnMap(selectedVisualType);
  };

  function showAreasOnMap(selectedVisualType: VisualType): void {
    if (selectedVisualType === VisualType.OVERLAY) {
      if (mapLayerManager.geojsonSourceActive) {
        mapLayerManager.removeAllDataFromMap();
      }

      addAreaOverlay();
    }
  }

  function showPOILocations(allFilterLayers: Filter[]): void {
    for (let index = 0; index < allFilterLayers.length; index++) {
      const layer = allFilterLayers[index];
      showDataOnMap(layer.originalData, layer.layername);
    }
  }

  function removeData(filter: Filter, visualType: VisualType): void {
    removeFilter(filter);

    if (visualType === VisualType.OVERLAY) {
      mapLayerManager.removeCanvasSource("overlaySource");
      addAreaOverlay();
    } else {
      mapLayerManager.removeGeojsonSource(filter.layername);
    }
  }

  function resetMapData(): void {
    clearAllFilters();
    mapLayerManager.removeAllDataFromMap();
    // show Snackbar
  }

  function showDataOnMap(data: any, tagName: string): void {
    if (map?.getSource("overlaySource")) {
      mapLayerManager.removeCanvasSource("overlaySource");
    }
    mapLayerManager.removeAllLayersForSource(tagName);

    if (map?.getSource(tagName)) {
      // the source already exists, only update the data
      //console.log(`Source ${tagName} is already used! Updating it!`);
      mapLayerManager.updateGeojsonSource(tagName, data);
    } else {
      // source doesn't exist yet, create a new one
      mapLayerManager.addNewGeojsonSource(tagName, data, false);
    }
    //show the source data on the map
    mapLayerManager.addLayersForSource(tagName);
  }

  //! most of the data preprocessing could (and probably should) already happen on the server!
  //! (maybe after the data has been fetched and before being saved in Redis)
  function preprocessGeoData(
    data: FeatureCollection<Geometry, any>,
    dataName: string
  ): Filter | null {
    //* split up multipoints, multilinestrings and multipolygons into normal ones
    //const flattenedData = mapboxUtils.flattenMultiGeometry(data);

    //Benchmark.startMeasure("truncate geodata");

    // truncate geojson precision to yy4 decimals;
    // this increases performance and the perfectly exact coords aren't necessary for the area overlay
    const options = { precision: 4, coordinates: 2, mutate: true };
    const truncatedData: FeatureCollection<Geometry, any> = truncate(
      data,
      options
    );
    //Benchmark.stopMeasure("truncate geodata");
    console.log(dataName);
    const layer = getFilterLayer(dataName);
    console.log(layer);
    if (!layer) {
      return null;
    }

    //! reset arrays for this layer
    //TODO the new and the old information (if any) could probably be merged somehow to improve this
    layer.points.length = 0;
    layer.features.length = 0;

    // add buffer to filterlayer
    for (let index = 0; index < truncatedData.features.length; index++) {
      const feature = truncatedData.features[index];
      const bufferedPoly = addBufferToFeature(
        feature,
        layer.distance,
        "meters"
      );

      layer.features.push(bufferedPoly);
      if (map) {
        convertPolygonCoordsToPixelCoords(map, bufferedPoly, layer);
      }
    }

    /*
    //! Benchmarking version: two for loops to be able to measure the performance of both separately
    Benchmark.startMeasure("buffer all Polygons of layer");
    // add buffer to filterlayer
    for (let index = 0; index < truncatedData.features.length; index++) {
      const feature = truncatedData.features[index];
      const bufferedPoly = addBufferToFeature(feature, layer.Distance, "meters");

      layer.Features.push(bufferedPoly);
    }
    Benchmark.stopMeasure("buffer all Polygons of layer");

    Benchmark.startMeasure("convert all Polygons to pixel coords");
    // convert to pixels
    for (let index = 0; index < layer.Features.length; index++) {
      const element = layer.Features[index];
      mapboxUtils.convertPolygonCoordsToPixelCoords(element, layer);
    }
    Benchmark.stopMeasure("convert all Polygons to pixel coords");
    */

    return layer;
  }

  function addAreaOverlay(): void {
    /**
     * FilterManager.allFilterLayers should look like this at this point:
     *[
     *  { ### FilterLayer - Park
     *    points: [
     *      [{x: 49.1287; y: 12.3591}, ...],
     *      [{x: 49.1287; y: 12.3591}, ...],
     *      ...,
     *    ]
     *    features: [ {Feature}, {Feature}, ...],
     *    distance: 500,
     *    relevance: 0.8,  //="very important"
     *    name: "Park",
     *    wanted: true,
     *  },
     *  { ### FilterLayer - Restaurant
     *    ...
     *  },
     *  ...
     * ]
     */

    // check that there is data to create an overlay for the map
    if (allFilterLayers.length > 0) {
      if (map) {
        createOverlay(allFilterLayers, map);
      }
    } else {
      console.warn(
        "Creating an overlay is not possible because overlayData is empty!"
      );
    }
  }

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        selectedVisualType,
        setSelectedVisualType: setSelectedVisualTypeWhenDifferent,
        loadMapData: loadMapData,
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
