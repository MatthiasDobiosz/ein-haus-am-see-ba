import { Feature, GeoJsonProperties, MultiPolygon, Polygon } from "geojson";
import { LngLatLike } from "react-map-gl";
import { action, makeObservable, observable } from "mobx";
import { Filter } from "../components/Sidebar/Filter/Filters";
import { RootStore } from "./RootStore";

class FilterStore {
  // all active filter layer objects
  allFilterLayers: Filter[];
  // set of alle filternames
  activeFilters: Set<string>;
  rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this.allFilterLayers = [];
    this.activeFilters = new Set();
    this.rootStore = rootStore;

    makeObservable(this, {
      allFilterLayers: observable,
      activeFilters: observable,
      addFilter: action,
      removeFilter: action,
      getFilterLayer: false,
      clearAllFilters: action,
      recalculateScreenCoords: false,
      calculatePointCoordsForFeatures: false,
      convertPolygonCoordsToPixelCoords: action,
      rootStore: false,
    });
  }

  // function to add single filter to context array
  addFilter = (filterLayer: Filter): void => {
    //dont add if filter with that name already exists
    //TODO: show error message to user that he cant create more than one filter of the same category
    if (!this.activeFilters.has(filterLayer.layername)) {
      this.allFilterLayers.push(filterLayer);
      const newActiveFilters = this.activeFilters;
      newActiveFilters.add(filterLayer.layername);
      this.activeFilters = newActiveFilters;
    }
  };

  // function to remove single filter from context array
  removeFilter(layerName: string): void {
    this.allFilterLayers = this.allFilterLayers.filter(
      (prevFilterLayer) => !(prevFilterLayer.layername === layerName)
    );

    const newActiveFilters = this.activeFilters;
    newActiveFilters.delete(layerName);
    this.activeFilters = newActiveFilters;
  }

  getFilterLayer(name: string): Filter | null {
    const filter = this.allFilterLayers.find((filterLayer) => {
      return filterLayer.layername === name;
    });
    if (filter) {
      return filter;
    }
    return null;
  }

  clearAllFilters(): void {
    this.allFilterLayers = [];
    this.activeFilters.clear();
  }

  /**
   * ! Has to be called on every overlay update to recalculate the geojson polygons in point/screen coords.
   * ! Otherwise they would not be in sync with the map!!
   */
  recalculateScreenCoords(): void {
    this.allFilterLayers.forEach((filterLayer) => {
      this.calculatePointCoordsForFeatures(filterLayer);
    });
  }

  calculatePointCoordsForFeatures(filterLayer: Filter): void {
    filterLayer.points.length = 0;
    for (let i = 0; i < filterLayer.features.length; i++) {
      this.convertPolygonCoordsToPixelCoords(
        filterLayer.features[i],
        filterLayer
      );
    }
  }

  convertPolygonCoordsToPixelCoords(
    polygon: Feature<Polygon | MultiPolygon, GeoJsonProperties>,
    layer: Filter
  ): void {
    const coords = polygon.geometry.coordinates;

    // check if this is a multidimensional array (i.e. a multipolygon or a normal one)
    if (coords.length > 1) {
      //console.log("Multipolygon: ", coords);
      //const flattened: mapboxgl.Point[] = [];
      for (let i = 0; i < coords.length; i++) {
        layer.points.push(
          //@ts-expect-error idk
          coords[i].map((coord: number[] | number[][]) => {
            try {
              return this.rootStore.mapStore.map?.project(coord as LngLatLike);
            } catch (error) {
              console.log("Error in projecting coord: ", error);
              return null;
            }
          })
        );

        //flattened.push(coordPart.map((coord: number[]) => mapboxUtils.convertToPixelCoord(coord)));
      }
      // layer.Points.push(flattened);
    } else {
      //@ts-expect-error idk
      const pointData = coords[0].map((coord: number[]) => {
        try {
          return this.rootStore.mapStore.map?.project(coord as LngLatLike);
        } catch (error) {
          console.log("Error in projecting coord: ", error);
          return null;
        }
      });

      // @ts-expect-error: possbily null but worked before
      layer.points.push(pointData);
    }
  }
}

export default FilterStore;
