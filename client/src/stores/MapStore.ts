import { action, makeObservable, observable } from "mobx";
import { RootStore } from "./RootStore";
import { MapboxMap } from "react-map-gl";
import MapLayerManager from "./../mapLayerMangager";
import osmTagCollection from "../osmTagCollection";
import {
  fetchDataFromPostGISIndex,
  fetchDataFromPostGISMulti,
  fetchDataFromPostGISSingle,
  fetchDataFromPostGISSpIndex,
  fetchOsmDataFromServer,
} from "../network/networkUtils";
import { Filter } from "../components/Sidebar/Filter/Filters";
import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from "geojson";
import truncate from "@turf/truncate";
import { addBufferToFeature } from "../components/Map/turfUtils";
import { createOverlay } from "../overlayCreation/canvasRenderer";
import {
  getViewportBoundsString,
  getViewportPolygon,
} from "../components/Map/mapUtils";
import {
  DBType,
  endPerformanceMeasure,
  startPerformanceMeasure,
} from "../../../shared/benchmarking";
import { SnackbarType } from "./SnackbarStore";

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
  dbType: DBType;
  performanceViewActive: boolean;

  constructor(rootStore: RootStore) {
    this.map = null;
    this.visualType = VisualType.OVERLAY;
    this.mapLayerManager = null;
    this.rootStore = rootStore;
    this.dbType = DBType.POSTGISMULTI;
    this.performanceViewActive = false;

    makeObservable(this, {
      map: observable,
      visualType: observable,
      dbType: observable,
      performanceViewActive: observable,
      setMap: action,
      setVisualType: action,
      toggleDbType: action,
      setPerformanceViewActive: action,
      mapLayerManager: false,
      loadMapDataOverpass: false,
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
    if (this.mapLayerManager === null) {
      this.mapLayerManager = new MapLayerManager(
        this,
        this.rootStore.legendStore
      );
    }
  }

  setVisualType(visualType: VisualType) {
    if (visualType !== this.visualType) {
      this.visualType = visualType;

      if (this.rootStore.filterStore.activeFilters.size > 0) {
        if (this.visualType === VisualType.OVERLAY) {
          this.loadMapData();
        } else {
          this.showPOILocations();
        }
      } else {
        this.rootStore.snackbarStore.displayHandler(
          "Aktive Filter müssen vorhanden sein, um Informationen anzuzeigen!",
          2000,
          SnackbarType.WARNING
        );
      }
    }
  }

  toggleDbType() {
    if (this.dbType === DBType.POSTGISMULTI) {
      this.dbType = DBType.POSTGISSINGLE;
    } else if (this.dbType === DBType.POSTGISSINGLE) {
      this.dbType = DBType.POSTGISINDEX;
    } else if (this.dbType === DBType.POSTGISINDEX) {
      this.dbType = DBType.POSTGISINDEXSp;
    } else if (this.dbType === DBType.POSTGISINDEXSp) {
      this.dbType = DBType.OVERPASS;
    } else {
      this.dbType = DBType.POSTGISMULTI;
    }
  }

  setPerformanceViewActive() {
    this.performanceViewActive = this.performanceViewActive ? false : true;
  }

  async loadMapDataOverpass(): Promise<void> {
    startPerformanceMeasure("The whole workflow PostGIS");
    if (this.rootStore.filterStore.activeFilters.size === 0) {
      return;
    }

    // give feedback to the user
    // FIXME: Do that in component to get snackbarContext
    //showSnackbar("Daten werden geladen...", SnackbarType.INFO, undefined, true);
    this.rootStore.snackbarStore.displayHandler(
      "Daten werden geladen...",
      undefined,
      SnackbarType.INFO
    );

    if (this.map) {
      const bounds = getViewportBoundsString(this.map, 500);

      const allResults = await Promise.allSettled(
        Array.from(this.rootStore.filterStore.activeFilters).map(
          async (tag) => {
            // get overpass query for each tag
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
                this.preprocessGeoData(data, tag);
              }
            }
          }
        )
      );

      this.rootStore.snackbarStore.closeHandler();

      let success = true;
      for (const res of allResults) {
        if (res.status === "rejected") {
          success = false;
          break;
        }
      }
      if (!success) {
        this.rootStore.snackbarStore.displayHandler(
          "Nicht alle Daten konnten erfolgreich geladen werden",
          1500,
          SnackbarType.ERROR
        );
      }

      this.showAreasOnMap();
    }
  }

  async loadMapData(): Promise<void> {
    startPerformanceMeasure("Workflow");
    if (this.rootStore.filterStore.activeFilters.size === 0) {
      return;
    }

    // give feedback to the user
    // FIXME: Do that in component to get snackbarContext
    //showSnackbar("Daten werden geladen...", SnackbarType.INFO, undefined, true);
    this.rootStore.snackbarStore.displayHandler(
      "Daten werden geladen...",
      undefined,
      SnackbarType.INFO
    );

    if (this.map) {
      if (this.dbType === DBType.OVERPASS) {
        const bounds = getViewportBoundsString(this.map, 500);
        startPerformanceMeasure("LoadingAllFilters");
        const activeTags = Array.from(this.rootStore.filterStore.activeFilters);
        const firstTag = activeTags[0];
        const lastTag = activeTags[activeTags.length - 1];
        const allResults = await Promise.allSettled(
          activeTags.map(async (tag) => {
            // get overpass query for each tag
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
            const data = await fetchOsmDataFromServer(
              bounds,
              query,
              tag === firstTag,
              tag === lastTag
            );
            //console.log("Overpass: ", data);
            //Benchmark.stopMeasure("Fetching data from osm");

            if (data) {
              console.log(data);
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
                startPerformanceMeasure("LoadingSingleFilter");
                this.preprocessGeoData(data, tag);
                endPerformanceMeasure("LoadingSingleFilter");
              }
            }
          })
        );

        endPerformanceMeasure("LoadingAllFilters");
        this.rootStore.snackbarStore.closeHandler();

        let success = true;
        for (const res of allResults) {
          if (res.status === "rejected") {
            success = false;
            break;
          }
        }
        if (!success) {
          this.rootStore.snackbarStore.displayHandler(
            "Nicht alle Daten konnten erfolgreich geladen werden",
            1500,
            SnackbarType.ERROR
          );
        }
        this.showAreasOnMap();
      } else if (this.dbType === DBType.POSTGISMULTI) {
        startPerformanceMeasure("LoadingAllFilters");
        const bounds = getViewportPolygon(this.map, 500);
        const activeTags = Array.from(this.rootStore.filterStore.activeFilters);
        const firstTag = activeTags[0];
        const lastTag = activeTags[activeTags.length - 1];
        const allResults = await Promise.allSettled(
          activeTags.map(async (tag) => {
            const query = osmTagCollection.getQueryForCategoryPostGIS(tag);

            const data = await fetchDataFromPostGISMulti(
              bounds,
              query,
              tag === firstTag,
              tag === lastTag
            );
            //console.log("Multi: ", data);
            if (data) {
              console.log(data);
              const layer = this.rootStore.filterStore.getFilterLayer(tag);

              if (layer) {
                layer.originalData = data;
              }

              if (this.visualType === VisualType.NORMAL) {
                this.showDataOnMap(data, tag);
              } else {
                startPerformanceMeasure("LoadingSingleFilter");
                this.preprocessGeoData(data, tag);
                endPerformanceMeasure("LoadingSingleFilter");
              }
            }
          })
        );

        endPerformanceMeasure("LoadingAllFilters");
        this.rootStore.snackbarStore.closeHandler();

        let success = true;
        for (const res of allResults) {
          if (res.status === "rejected") {
            success = false;
            break;
          }
        }
        if (!success) {
          this.rootStore.snackbarStore.displayHandler(
            "Nicht alle Daten konnten erfolgreich geladen werden",
            1500,
            SnackbarType.ERROR
          );
        }
        this.showAreasOnMap();
      } else if (this.dbType === DBType.POSTGISSINGLE) {
        startPerformanceMeasure("LoadingAllFilters");
        const bounds = getViewportPolygon(this.map, 500);
        //get Tags for active Filters
        const tags = Array.from(this.rootStore.filterStore.activeFilters);
        const queryInformation = osmTagCollection.getQueryForPostGISAll(tags);

        const data = await fetchDataFromPostGISSingle(bounds, queryInformation);

        if (data) {
          //const filterLayer = this.preprocessGeoData(data, tag);

          // loop through the active tags, get their respective data and show it on the map
          //console.log(data);
          for (let i = 0; i <= tags.length; i++) {
            const layer = this.rootStore.filterStore.getFilterLayer(tags[i]);
            if (layer) {
              const filteredFeatures = data.features.filter(function (feature) {
                if (feature) {
                  return (
                    feature.properties.subclass ===
                    osmTagCollection.getSubclass(tags[i])
                  );
                } else {
                  return false;
                }
              });
              const filteredData: FeatureCollection<
                Geometry,
                GeoJsonProperties
              > = {
                type: "FeatureCollection",
                features: filteredFeatures,
              };

              layer.originalData = filteredData;

              if (this.visualType === VisualType.NORMAL) {
                this.showDataOnMap(filteredData, tags[i]);
              } else {
                startPerformanceMeasure("LoadingSingleFilter");
                this.preprocessGeoData(filteredData, tags[i]);
                endPerformanceMeasure("LoadingSingleFilter");
              }
            }
          }
        }
        endPerformanceMeasure("LoadingAllFilters");
        this.rootStore.snackbarStore.closeHandler();
        const success = true;
        if (!success) {
          this.rootStore.snackbarStore.displayHandler(
            "Nicht alle Daten konnten erfolgreich geladen werden",
            1500,
            SnackbarType.ERROR
          );
        }

        this.showAreasOnMap();
      } else if (this.dbType === DBType.POSTGISINDEX) {
        startPerformanceMeasure("LoadingAllFilters");
        const bounds = getViewportPolygon(this.map, 500);
        const activeTags = Array.from(this.rootStore.filterStore.activeFilters);
        const firstTag = activeTags[0];
        const lastTag = activeTags[activeTags.length - 1];
        const allResults = await Promise.allSettled(
          activeTags.map(async (tag) => {
            const query = osmTagCollection.getQueryForCategoryPostGIS(tag);
            const data = await fetchDataFromPostGISIndex(
              bounds,
              query,
              tag === firstTag,
              tag === lastTag
            );
            //console.log(data);
            if (data) {
              const layer = this.rootStore.filterStore.getFilterLayer(tag);

              if (layer) {
                layer.originalData = data;
              }

              if (this.visualType === VisualType.NORMAL) {
                this.showDataOnMap(data, tag);
              } else {
                startPerformanceMeasure("LoadingSingleFilter");
                this.preprocessGeoData(data, tag);
                endPerformanceMeasure("LoadingSingleFilter");
              }
            }
          })
        );

        endPerformanceMeasure("LoadingAllFilters");
        this.rootStore.snackbarStore.closeHandler();

        let success = true;
        for (const res of allResults) {
          if (res.status === "rejected") {
            success = false;
            break;
          }
        }
        if (!success) {
          this.rootStore.snackbarStore.displayHandler(
            "Nicht alle Daten konnten erfolgreich geladen werden",
            1500,
            SnackbarType.ERROR
          );
        }
        this.showAreasOnMap();
      } else {
        startPerformanceMeasure("LoadingAllFilters");
        const bounds = getViewportPolygon(this.map, 500);
        const activeTags = Array.from(this.rootStore.filterStore.activeFilters);
        const firstTag = activeTags[0];
        const lastTag = activeTags[activeTags.length - 1];
        const allResults = await Promise.allSettled(
          activeTags.map(async (tag) => {
            const query = osmTagCollection.getQueryForCategoryPostGIS(tag);

            const data = await fetchDataFromPostGISSpIndex(
              bounds,
              query,
              tag === firstTag,
              tag === lastTag
            );
            //console.log(data);
            if (data) {
              const layer = this.rootStore.filterStore.getFilterLayer(tag);

              if (layer) {
                layer.originalData = data;
              }

              if (this.visualType === VisualType.NORMAL) {
                this.showDataOnMap(data, tag);
              } else {
                startPerformanceMeasure("LoadingSingleFilter");
                this.preprocessGeoData(data, tag);
                endPerformanceMeasure("LoadingSingleFilter");
              }
            }
          })
        );

        endPerformanceMeasure("LoadingAllFilters");
        this.rootStore.snackbarStore.closeHandler();

        let success = true;
        for (const res of allResults) {
          if (res.status === "rejected") {
            success = false;
            break;
          }
        }
        if (!success) {
          this.rootStore.snackbarStore.displayHandler(
            "Nicht alle Daten konnten erfolgreich geladen werden",
            1500,
            SnackbarType.ERROR
          );
        }
        this.showAreasOnMap();
      }
    }
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
    this.rootStore.filterStore.removeFilter(filter.layername);

    if (this.visualType === VisualType.OVERLAY) {
      this.mapLayerManager?.removeCanvasSource("overlaySource");
      if (this.rootStore.filterStore.activeFilters.size > 0) {
        this.addAreaOverlay();
      }
    } else {
      //console.log("removeGeojson");
      this.mapLayerManager?.removeGeojsonSource(filter.layername);
    }
  }

  resetMapData(): void {
    this.rootStore.filterStore.clearAllFilters();
    this.mapLayerManager?.removeAllDataFromMap();
    this.rootStore.snackbarStore.displayHandler(
      "Filter wurden vollständig zurückgesetzt!",
      2000,
      SnackbarType.SUCCESS
    );
  }

  showDataOnMap(data: any, tagName: string): void {
    //startPerformanceMeasure("RemoveExistingLayers");
    if (this.map?.getSource("overlaySource")) {
      this.mapLayerManager?.removeCanvasSource("overlaySource");
    }
    this.mapLayerManager?.removeAllLayersForSource(tagName);

    //endPerformanceMeasure("RemoveExistingLayers");

    //startPerformanceMeasure("AddNewGeoData");
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

    //endPerformanceMeasure("AddNewGeoData");
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
      if (feature.geometry.type === "MultiLineString") {
        for (let i = 0; i < feature.geometry.coordinates.length; i++) {
          const singleFeature: Feature<Geometry, any> = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: feature.geometry.coordinates[i],
            },
            properties: {},
          };
          const bufferedPoly = addBufferToFeature(
            singleFeature,
            layer.distance,
            "meters"
          );
          layer.features.push(bufferedPoly);
          //console.log(bufferedPoly.geometry.coordinates);
          this.rootStore.filterStore.convertPolygonCoordsToPixelCoords(
            bufferedPoly,
            layer
          );
        }
      } else {
        const bufferedPoly = addBufferToFeature(
          feature,
          layer.distance,
          "meters"
        );
        layer.features.push(bufferedPoly);
        //console.log(bufferedPoly.geometry.coordinates);
        this.rootStore.filterStore.convertPolygonCoordsToPixelCoords(
          bufferedPoly,
          layer
        );
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
     *    name: "Park",import { lineCategories } from './../../../dist/client/src/osmTagCollection';

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
        createOverlay(
          this.rootStore.filterStore.allFilterLayers,
          this.map,
          this,
          this.rootStore.legendStore
        );
      }
    } else {
      console.warn(
        "Creating an overlay is not possible because overlayData is empty!"
      );
    }
  }
}

export default MapStore;
