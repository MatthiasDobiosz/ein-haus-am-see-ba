import { action, makeObservable, observable } from "mobx";
import { RootStore } from "./RootStore";
import { MapboxMap } from "react-map-gl";
import MapLayerManager from "./../mapLayerMangager";
import osmTagCollection from "../osmTagCollection";
import { fetchDataFromPostGISBuffer } from "../network/networkUtils";
import { Filter, FilterGroup } from "../components/Sidebar/Filter/Filters";
import { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { createOverlay } from "../overlayCreation/canvasRenderer";
import { getViewportPolygon } from "../components/Map/mapUtils";
import {
  DBType,
  endPerformanceMeasure,
  startPerformanceMeasure,
} from "../../../shared/benchmarking";
import { SnackbarType } from "./SnackbarStore";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import mapboxgl from "mapbox-gl";

export const enum VisualType {
  NORMAL,
  OVERLAY,
  BOTH,
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
    this.dbType = DBType.POSTGISSINGLE;
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
      loadOverlayMapData: false,
      loadPOIMapData: false,
      loadMapData: false,
      showAreasOnMap: false,
      showPOILocations: false,
      showDataOnMap: false,
      removeData: false,
      removeGroupData: false,
      updateData: false,
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
      this.map.addControl(
        new MapboxGeocoder({
          accessToken: process.env.MAPBOX_TOKEN,
          mapboxgl: mapboxgl,
          limit: 10,
          minLength: 4,
          zoom: 12,
          placeholder: "Ort suchen",
          countries: "de",
          collapsed: true,
        }),
        "top-left"
      );
    }
  }

  setVisualType(visualType: VisualType) {
    if (visualType !== this.visualType) {
      this.visualType = visualType;

      if (this.rootStore.filterStore.filtergroupsActive()) {
        this.loadMapData();
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
    if (this.dbType === DBType.POSTGISSINGLE) {
      this.dbType = DBType.POSTGISINDEX;
    } else if (this.dbType === DBType.POSTGISINDEX) {
      this.dbType = DBType.POSTGISBUFFER;
    } else if (this.dbType === DBType.POSTGISBUFFER) {
      this.dbType = DBType.OVERPASS;
    } else {
      this.dbType = DBType.POSTGISSINGLE;
    }
  }

  setPerformanceViewActive() {
    this.performanceViewActive = this.performanceViewActive ? false : true;
  }

  async loadOverlayMapData(): Promise<void> {
    if (this.map) {
      const bounds = getViewportPolygon(this.map, 500);
      const activeFilters = this.rootStore.filterStore.getAllActiveLayers();
      console.log(activeFilters.length);
      const allResults = await Promise.allSettled(
        activeFilters.map(async (filter) => {
          const query = osmTagCollection.getQueryForCategoryPostGIS(
            filter.tagName
          );
          const bufferValue =
            this.rootStore.filterStore.getFilterLayerBuffer(filter.layername) ||
            0;
          const data = await fetchDataFromPostGISBuffer(
            bounds,
            query,
            bufferValue,
            true
          );
          //console.log(data);
          if (data) {
            console.log(data);

            startPerformanceMeasure("LoadingSingleFilter");
            this.preprocessGeoData(data, filter.layername);
            endPerformanceMeasure("LoadingSingleFilter");
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
      console.log("done");
      const inactiveFilters = this.rootStore.filterStore.getAllInactiveLayers();
      console.log(inactiveFilters.length);

      const inactiveResults = await Promise.allSettled(
        inactiveFilters.map(async (filter) => {
          const query = osmTagCollection.getQueryForCategoryPostGIS(
            filter.tagName
          );
          const bufferValue =
            this.rootStore.filterStore.getFilterLayerBuffer(filter.layername) ||
            0;
          const data = await fetchDataFromPostGISBuffer(
            bounds,
            query,
            bufferValue,
            this.visualType === VisualType.OVERLAY
          );
          //console.log(data);
          if (data) {
            this.preprocessGeoData(data, filter.layername);
          }
        })
      );

      let inactiveSuccess = true;
      for (const res of inactiveResults) {
        if (res.status === "rejected") {
          inactiveSuccess = false;
          break;
        }
      }
      if (!inactiveSuccess) {
        this.rootStore.snackbarStore.displayHandler(
          "Nicht alle Daten konnten erfolgreich geladen werden",
          1500,
          SnackbarType.ERROR
        );
      }
    }
  }

  async loadPOIMapData(): Promise<void> {
    if (this.map) {
      const bounds = getViewportPolygon(this.map, 500);
      const activeTags = this.rootStore.filterStore.getAllActiveTags();
      const allResults = await Promise.allSettled(
        activeTags.map(async (tag) => {
          const query = osmTagCollection.getQueryForCategoryPostGIS(tag);
          const data = await fetchDataFromPostGISBuffer(
            bounds,
            query,
            0,
            false
          );
          //console.log(data);
          if (data) {
            console.log(data);
            this.showDataOnMap(data, tag);
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
      startPerformanceMeasure("LoadingAllFilters");
      if (this.visualType === VisualType.BOTH) {
        await this.loadOverlayMapData();
        this.loadPOIMapData();
      } else if (this.visualType === VisualType.OVERLAY) {
        this.loadOverlayMapData();
      } else {
        this.loadPOIMapData();
      }
    }
  }

  showAreasOnMap(): void {
    if (
      this.visualType === VisualType.OVERLAY ||
      this.visualType === VisualType.BOTH
    ) {
      if (this.mapLayerManager?.geojsonSourceActive) {
        this.mapLayerManager?.removeAllDataFromMap();
      }

      this.addAreaOverlay();
    }
  }

  // FIXME: wird jetzt glaub ich sowieso nicht mehr genutzt
  showPOILocations(): void {
    const filterLayers = this.rootStore.filterStore.allFilterLayers;
    for (let index = 0; index < filterLayers.length; index++) {
      const layer = filterLayers[index];
      this.showDataOnMap(layer.originalData, layer.layername);
    }
  }

  removeData(filter: Filter): void {
    this.rootStore.filterStore.removeFilter(filter.layername);

    if (this.visualType === VisualType.BOTH) {
      this.mapLayerManager?.removeCanvasSource("overlaySource");
      //only remove source if removed tag was the only one of this kind
      if (
        !this.rootStore.filterStore.getAllActiveTags().includes(filter.tagName)
      ) {
        this.mapLayerManager?.removeGeojsonSource(filter.tagName);
      }
      if (this.rootStore.filterStore.filtergroupsActive()) {
        this.addAreaOverlay();
      }
    } else if (this.visualType === VisualType.OVERLAY) {
      this.mapLayerManager?.removeCanvasSource("overlaySource");
      if (this.rootStore.filterStore.filtergroupsActive()) {
        this.addAreaOverlay();
      }
    } else {
      //only remove source if removed tag was the only one of this kind
      if (
        !this.rootStore.filterStore.getAllActiveTags().includes(filter.tagName)
      ) {
        this.mapLayerManager?.removeGeojsonSource(filter.tagName);
      }
    }
  }

  updateData(filterGroup: FilterGroup): void {
    if (this.visualType === VisualType.BOTH) {
      this.mapLayerManager?.removeCanvasSource("overlaySource");
      if (this.rootStore.filterStore.filtergroupsActive()) {
        this.addAreaOverlay();
        this.loadPOIMapData();
      } else {
        filterGroup.filters.forEach((filter) => {
          if (
            !this.rootStore.filterStore
              .getAllActiveTags()
              .includes(filter.tagName)
          ) {
            this.mapLayerManager?.removeGeojsonSource(filter.tagName);
          }
        });
      }
    } else if (this.visualType === VisualType.OVERLAY) {
      this.mapLayerManager?.removeCanvasSource("overlaySource");
      if (this.rootStore.filterStore.filtergroupsActive()) {
        this.addAreaOverlay();
      }
    } else {
      //console.log("removeGeojson");
      //only remove source if removed tag was the only one of this kind
      if (this.rootStore.filterStore.filtergroupsActive()) {
        this.loadMapData();
      } else {
        filterGroup.filters.forEach((filter) => {
          if (
            !this.rootStore.filterStore
              .getAllActiveTags()
              .includes(filter.tagName)
          ) {
            this.mapLayerManager?.removeGeojsonSource(filter.tagName);
          }
        });
      }
    }
  }

  removeGroupData(filterGroup: FilterGroup): void {
    const filters = filterGroup.filters;
    filterGroup.filters.forEach((filter) => {
      this.rootStore.filterStore.removeFilter(filter.layername);
    });
    if (this.visualType === VisualType.BOTH) {
      this.mapLayerManager?.removeCanvasSource("overlaySource");
      console.log(filters.length);
      //only remove source if removed tag was the only one of this kind
      filters.forEach((filter) => {
        if (
          !this.rootStore.filterStore
            .getAllActiveTags()
            .includes(filter.tagName)
        ) {
          this.mapLayerManager?.removeGeojsonSource(filter.tagName);
        }
      });
      if (this.rootStore.filterStore.filtergroupsActive()) {
        this.addAreaOverlay();
      }
    } else if (this.visualType === VisualType.OVERLAY) {
      this.mapLayerManager?.removeCanvasSource("overlaySource");
      if (this.rootStore.filterStore.filtergroupsActive()) {
        this.addAreaOverlay();
      }
    } else {
      //console.log("removeGeojson");
      //only remove source if removed tag was the only one of this kind

      filters.forEach((filter) => {
        if (
          !this.rootStore.filterStore
            .getAllActiveTags()
            .includes(filter.tagName)
        ) {
          this.mapLayerManager?.removeGeojsonSource(filter.tagName);
        }
      });
    }
  }

  //FIXME: Removen der Daten sollte dann eigtl. passen wenn alles andere stimmt
  resetMapData(): void {
    this.rootStore.filterStore.clearAllFilters();
    this.mapLayerManager?.removeAllDataFromMap();
    this.rootStore.snackbarStore.displayHandler(
      "Filter wurden vollständig zurückgesetzt!",
      2000,
      SnackbarType.SUCCESS
    );
  }

  //FIXME: Hier statt tagName dann einzigartigen Namen übergeben
  showDataOnMap(data: any, tagName: string): void {
    startPerformanceMeasure("RemoveExistingLayers");
    if (this.map?.getSource("overlaySource")) {
      this.mapLayerManager?.removeCanvasSource("overlaySource");
    }
    this.mapLayerManager?.removeAllLayersForSource(tagName);

    endPerformanceMeasure("RemoveExistingLayers");

    startPerformanceMeasure("AddNewGeoData");
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

    endPerformanceMeasure("AddNewGeoData");
  }

  //! most of the data preprocessing could (and probably should) already happen on the server!
  //! (maybe after the data has been fetched and before being saved in Redis)
  preprocessGeoData(
    data: FeatureCollection<Polygon | MultiPolygon, any>,
    dataName: string
  ): Filter | null {
    //* split up multipoints, multilinestrings and multipolygons into normal ones
    //const flattenedData = mapboxUtils.flattenMultiGeometry(data);

    //Benchmark.startMeasure("truncate geodata");

    // truncate geojson precision to yy4 decimals;
    // this increases performance and the perfectly exact coords aren't necessary for the area overlay
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
    for (let index = 0; index < data.features.length; index++) {
      const feature = data.features[index];

      //console.log(bufferedPoly.geometry.coordinates);
      layer.features.push(feature);
      this.rootStore.filterStore.convertPolygonCoordsToPixelCoordsNew(
        feature,
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
     *    name: "Park",import { lineCategories } from './../../../dist/client/src/osmTagCollection';
import { buffer } from '@turf/buffer';
import { MapboxGeocoder } from '@mapbox/mapbox-gl-geocoder';

     *    wanted: true,
     *  },
     *  { ### FilterLayer - Restaurant
     *    ...
     *  },
     *  ...
     * ]
     */

    // check that there is data to create an overlay for the map
    // FIXME: Hier evtl. check ausbessern
    if (this.rootStore.filterStore.filtergroupsActive()) {
      if (this.map) {
        createOverlay(
          this.rootStore.filterStore.allFilterGroups.filter(
            (group) => group.active === true
          ),
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
