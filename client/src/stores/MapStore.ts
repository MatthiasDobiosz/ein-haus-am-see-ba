import { action, makeObservable, observable } from "mobx";
import { RootStore } from "./RootStore";
import { MapboxMap } from "react-map-gl";
import MapLayerManager from "./../mapLayerMangager";
import osmTagCollection from "../osmTagCollection";
import { fetchOsmDataFromServer } from "../network/networkUtils";
import { Filter } from "../components/Sidebar/Filter/Filters";
import { FeatureCollection, Geometry } from "geojson";
import truncate from "@turf/truncate";
import { addBufferToFeature } from "../components/Map/turfUtils";
import { createOverlay } from "../overlayCreation/canvasRenderer";
import { getViewportBoundsString } from "../components/Map/mapUtils";

export const enum VisualType {
  NORMAL,
  OVERLAY,
  //HEATMAP
}

class MapStore {
  map: MapboxMap | null;
  visualType: VisualType;
  mapLayerManager: MapLayerManager | null;
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.map = null;
    this.visualType = VisualType.OVERLAY;
    this.mapLayerManager = null;
    this.rootStore = rootStore;

    makeObservable(this, {
      map: observable,
      visualType: observable,
      setMap: action,
      setVisualType: action,
      mapLayerManager: false,
      loadMapData: false,
      showAreasOnMap: false,
      showPOILocations: false,
      showDataOnMap: false,
      removeData: false,
      resetMapData: false,
      preprocessGeoData: false,
      addAreaOverlay: false,
      rootStore: false,
    });
  }

  setMap(map: MapboxMap) {
    this.map = map;
    this.mapLayerManager = new MapLayerManager(map);
  }

  setVisualType(visualType: VisualType) {
    if (visualType !== this.visualType) {
      this.visualType = visualType;
    }
  }

  async loadMapData(): Promise<void> {
    if (this.rootStore.filterStore.activeFilters.size === 0) {
      return;
    }

    // give feedback to the user
    // FIXME: Do that in component to get snackbarContext
    //showSnackbar("Daten werden geladen...", SnackbarType.INFO, undefined, true);

    if (this.map) {
      const bounds = getViewportBoundsString(this.map);
      const allResults = await Promise.allSettled(
        Array.from(this.rootStore.filterStore.activeFilters).map(
          async (tag) => {
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
              const layer = this.rootStore.filterStore.getFilterLayer(tag);
              if (layer) {
                layer.originalData = data;
              }

              //console.log(this.selectedVisualType);
              if (this.visualType === VisualType.NORMAL) {
                this.showDataOnMap(data, tag);
              } else {
                console.log("preprocess");
                this.preprocessGeoData(data, tag);
              }
            }
          }
        )
      );

      let success = true;
      console.log(allResults);
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
    this.showAreasOnMap();
  }

  showAreasOnMap(): void {
    if (this.visualType === VisualType.OVERLAY) {
      if (this.mapLayerManager?.geojsonSourceActive) {
        this.mapLayerManager?.removeAllDataFromMap();
      }

      this.addAreaOverlay();
    }
  }

  showPOILocations(): void {
    const filterLayers = this.rootStore.filterStore.allFilterLayers;
    for (let index = 0; index < filterLayers.length; index++) {
      const layer = filterLayers[index];
      this.showDataOnMap(layer.originalData, layer.layername);
    }
  }

  removeData(filter: Filter): void {
    this.rootStore.filterStore.removeFilter(filter);

    if (this.visualType === VisualType.OVERLAY) {
      this.mapLayerManager?.removeCanvasSource("overlaySource");
      this.addAreaOverlay();
    } else {
      this.mapLayerManager?.removeGeojsonSource(filter.layername);
    }
  }

  resetMapData(): void {
    this.rootStore.filterStore.clearAllFilters();
    this.mapLayerManager?.removeAllDataFromMap();
    // show Snackbar
  }

  showDataOnMap(data: any, tagName: string): void {
    if (this.map?.getSource("overlaySource")) {
      this.mapLayerManager?.removeCanvasSource("overlaySource");
    }
    this.mapLayerManager?.removeAllLayersForSource(tagName);

    if (this.map?.getSource(tagName)) {
      // the source already exists, only update the data
      //console.log(`Source ${tagName} is already used! Updating it!`);
      this.mapLayerManager?.updateGeojsonSource(tagName, data);
    } else {
      // source doesn't exist yet, create a new one
      this.mapLayerManager?.addNewGeojsonSource(tagName, data, false);
    }
    //show the source data on the map
    this.mapLayerManager?.addLayersForSource(tagName);
  }

  //! most of the data preprocessing could (and probably should) already happen on the server!
  //! (maybe after the data has been fetched and before being saved in Redis)
  preprocessGeoData(
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
    const layer = this.rootStore.filterStore.getFilterLayer(dataName);
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

      this.rootStore.filterStore.convertPolygonCoordsToPixelCoords(
        bufferedPoly,
        layer
      );
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

  addAreaOverlay(): void {
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
    if (this.rootStore.filterStore.allFilterLayers.length > 0) {
      if (this.map) {
        createOverlay(this.rootStore.filterStore.allFilterLayers, this.map);
      }
    } else {
      console.warn(
        "Creating an overlay is not possible because overlayData is empty!"
      );
    }
  }
}

export default MapStore;
