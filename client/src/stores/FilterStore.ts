import { Feature, GeoJsonProperties, MultiPolygon, Polygon } from "geojson";
import { LngLatLike } from "react-map-gl";
import { action, makeObservable, observable } from "mobx";
import { Filter } from "../components/Sidebar/Filter/FilterGroups";
import { RootStore } from "./RootStore";
import { FilterGroup } from "../components/Sidebar/Filter/FilterGroups";

/**
 * FilterStore - Class that handles all the states of the current filters
 */
class FilterStore {
  // all filter groups
  allFilterGroups: FilterGroup[];
  // all active filter layer objects
  allFilterLayers: Filter[];
  // set of all filternames
  activeFilters: Set<string>;
  rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this.allFilterGroups = [];
    this.allFilterLayers = [];
    this.activeFilters = new Set();
    this.rootStore = rootStore;

    makeObservable(this, {
      allFilterGroups: observable,
      allFilterLayers: observable,
      activeFilters: observable,
      addNewFilterToGroup: action,
      getMaxDistance: action,
      addFilter: action,
      removeFilter: action,
      removeFilterFromGroup: action,
      updateGroups: action,
      toggleFiltergroupActive: action,
      getFilterGroup: false,
      filtergroupsActive: false,
      getFilterLayer: false,
      getFilterLayerBuffer: false,
      clearAllFilters: action,
      recalculateScreenCoords: false,
      calculatePointCoordsForFeatures: false,
      convertPolygonCoordsToPixelCoords: action,
      getUniqueLayerName: false,
      validateGroupName: false,
      getAllActiveLayers: false,
      getAllInactiveLayers: false,
      getAllActiveTags: false,
      getRelevanceValue: false,
      changeSingleFilter: action,
      changeGroupRelevance: action,
      rootStore: false,
    });
  }

  // Function to add a new Filter to a group or create a new one
  addNewFilterToGroup = (
    filter: Filter,
    newGroup: boolean,
    groupName: string,
    relevance?: number
  ): boolean => {
    if (newGroup && groupName && relevance) {
      if (this.addFilter(filter, groupName)) {
        this.allFilterGroups.push({
          groupName: groupName,
          filters: this.allFilterLayers.filter(
            (filter) => filter.group === groupName
          ),
          groupRelevance: relevance,
          active: true,
        });
        return true;
      } else {
        return false;
      }
    } else if (!newGroup && groupName) {
      const filterGroup = this.allFilterGroups.find((group) => {
        if (group.groupName === groupName) {
          return group;
        }
      });
      if (filterGroup) {
        if (this.addFilter(filter, groupName)) {
          filterGroup.filters = this.allFilterLayers.filter(
            (filter) => filter.group === groupName
          );
          return true;
        } else {
          return false;
        }
      } else {
        console.error("Could not find Filtergroup with corresponding name");
        return false;
      }
    }
    return false;
  };

  // function to add single filter to context array
  addFilter = (filterLayer: Filter, groupname: string): boolean => {
    //dont add if filter of same category already exists within a group
    const groupIndex = this.allFilterGroups.findIndex((group) => {
      return group.groupName === groupname;
    });
    // filter is the first of its group
    if (groupIndex > -1) {
      const alreadyExistsWithinGroup = this.allFilterGroups[
        groupIndex
      ].filters.find((filter) => {
        return filter.tagName === filterLayer.tagName;
      });
      if (alreadyExistsWithinGroup) {
        return false;
      } else {
        this.allFilterLayers.push(filterLayer);
        const newActiveFilters = this.activeFilters;
        newActiveFilters.add(filterLayer.layername);
        this.activeFilters = newActiveFilters;
        return true;
      }
    }
    // Check if group already has same filter
    else {
      this.allFilterLayers.push(filterLayer);
      const newActiveFilters = this.activeFilters;
      newActiveFilters.add(filterLayer.layername);
      this.activeFilters = newActiveFilters;
      return true;
    }
  };

  // function to remove single filter from current state
  removeFilter(layerName: string): void {
    this.allFilterLayers = this.allFilterLayers.filter(
      (prevFilterLayer) => !(prevFilterLayer.layername === layerName)
    );

    const newActiveFilters = this.activeFilters;
    newActiveFilters.delete(layerName);
    this.activeFilters = newActiveFilters;
    this.updateGroups();
  }

  // removes a single filter from a filter group
  removeFilterFromGroup(layerName: string): void {
    const correspondingFilterGroup = this.getFilterGroup(layerName);
    if (correspondingFilterGroup) {
      if (correspondingFilterGroup.filters.length === 1) {
        this.allFilterGroups = this.allFilterGroups.filter((filtergroup) => {
          return !(
            filtergroup.groupName === correspondingFilterGroup.groupName
          );
        });
      } else {
        this.allFilterGroups.forEach((group) => {
          group.filters = group.filters.filter((filter) => {
            return !(filter.layername === layerName);
          });
        });
      }
    }
  }

  // gets MaxDistance that is required to check all relevant objects
  getMaxDistance(): number {
    let minDistance = 500;
    for (let i = 0; i < this.allFilterLayers.length; i++) {
      if (this.allFilterLayers[i].distance > minDistance) {
        minDistance = this.allFilterLayers[i].distance;
      }
    }
    return minDistance;
  }

  // updates groups
  updateGroups(): void {
    this.allFilterGroups.forEach((group) => {
      group.filters = this.allFilterLayers.filter(
        (filter) => filter.group === group.groupName
      );
    });
    this.allFilterGroups = this.allFilterGroups.filter((group) => {
      return !(group.filters.length === 0);
    });
  }

  // sets group to active
  toggleFiltergroupActive(groupname: string) {
    this.allFilterGroups.forEach((group) => {
      if (group.groupName === groupname) {
        group.active = !group.active;
      }
    });
  }

  // gets the filtergroup a filter belongs to
  getFilterGroup(layerName: string): FilterGroup | null {
    const filterGroup = this.allFilterGroups.find((group) => {
      return group.filters.find((filter) => {
        return filter.layername === layerName;
      });
    });
    if (filterGroup) {
      return filterGroup;
    }
    return null;
  }

  // checks if filtergroup is active at the moment
  filtergroupsActive(): boolean {
    const filterGroup = this.allFilterGroups.find((group) => {
      return group.active === true;
    });
    if (filterGroup) {
      return true;
    } else {
      return false;
    }
  }

  // get Filter layer
  getFilterLayer(name: string): Filter | null {
    const filter = this.allFilterLayers.find((filterLayer) => {
      return filterLayer.layername === name;
    });
    if (filter) {
      return filter;
    }
    return null;
  }

  getFilterLayerBuffer(name: string): number | null {
    const filter = this.allFilterLayers.find((filterLayer) => {
      return filterLayer.layername === name;
    });
    if (filter) {
      return filter.distance;
    }
    return null;
  }

  // clears all filters from state
  clearAllFilters(): void {
    this.allFilterGroups = [];
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
    this.updateGroups();
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

  /**
   * Function that projects all polygons retrieved from db on the mapbox map
   */
  convertPolygonCoordsToPixelCoords(
    polygon: Feature<Polygon | MultiPolygon, GeoJsonProperties>,
    layer: Filter
  ): void {
    const coords = polygon.geometry.coordinates;
    if (polygon.geometry.type === "MultiPolygon") {
      for (const simplePolygon of coords) {
        for (const coordPart of simplePolygon) {
          layer.points.push(
            //@ts-expect-error idk
            coordPart.map((coord: number[]) => {
              try {
                return this.rootStore.mapStore.map?.project(
                  coord as LngLatLike
                );
              } catch (error) {
                console.log("Error in projecting coord: ", error);
                return null;
              }
            })
          );
        }
      }
    } else if (polygon.geometry.type === "Polygon") {
      for (const coordPart of coords) {
        layer.points.push(
          //@ts-expect-error idk
          coordPart.map((coord: number[]) => {
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
    } else {
      console.error("Geometry is not a Polygon or Multipolygon");
    }
    // layer.Points.push(flattened);
  }

  // each filter Layer needs a unique name since multiple filters of same type can exist
  getUniqueLayerName(filterName: string, groupName: string): string {
    return filterName + " - " + groupName;
  }

  // checks if group name already exists
  validateGroupName(groupName: string): boolean {
    const existingGroup = this.allFilterGroups.find((group) => {
      return group.groupName === groupName;
    });
    if (existingGroup || groupName === "") {
      return false;
    }
    return true;
  }

  // retrieves all currently active layers
  getAllActiveLayers(): Filter[] {
    const activeFilters: Filter[] = [];
    this.allFilterGroups.forEach((group) => {
      if (group.active) {
        activeFilters.push(...group.filters);
      }
    });
    return activeFilters;
  }

  // retrieves all currently inactive layers
  getAllInactiveLayers(): Filter[] {
    const inactiveFilters: Filter[] = [];
    this.allFilterGroups.forEach((group) => {
      if (!group.active) {
        inactiveFilters.push(...group.filters);
      }
    });
    return inactiveFilters;
  }

  // checks which categories are active for POI-View
  getAllActiveTags(): string[] {
    const tags: string[] = [];

    this.allFilterLayers.forEach((filter) => {
      if (
        !tags.includes(filter.tagName) &&
        this.getFilterGroup(filter.layername)?.active
      ) {
        tags.push(filter.tagName);
      }
    });
    return tags;
  }

  // gets group relevance by a given filter
  getRelevanceValue(filter: Filter): number | null {
    const filterGroup = this.allFilterGroups.find((group) => {
      return group.groupName === filter.group;
    });
    if (filterGroup) {
      return filterGroup.groupRelevance;
    }
    return null;
  }

  // edit the values of a single filter
  changeSingleFilter(
    layername: string,
    distance: number,
    wanted: boolean
  ): void {
    this.allFilterLayers.forEach((filter) => {
      if (filter.layername === layername) {
        filter.distance = distance;
        filter.wanted = wanted;
      }
    });
    this.updateGroups();
  }

  // edit the relevance of the whole group
  changeGroupRelevance(groupName: string, relevance: number) {
    const group = this.allFilterGroups.find((group) => {
      return group?.groupName === groupName;
    });

    if (group) {
      group.groupRelevance = relevance;
    }
  }
}

export default FilterStore;
