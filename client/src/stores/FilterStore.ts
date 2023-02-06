import { Feature, GeoJsonProperties, MultiPolygon, Polygon } from "geojson";
import { LngLatLike } from "react-map-gl";
import { action, makeObservable, observable } from "mobx";
import { Filter } from "../components/Sidebar/Filter/Filters";
import { RootStore } from "./RootStore";
import { FilterGroup } from "./../components/Sidebar/Filter/Filters";

class FilterStore {
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
      convertPolygonCoordsToPixelCoordsNew: action,
      getUniqueLayerName: false,
      validateGroupName: false,
      getAllActiveLayers: false,
      getAllInactiveLayers: false,
      getAllActiveTags: false,
      getRelevanceValue: false,
      rootStore: false,
    });
  }

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
          groupID: this.allFilterGroups.length + 1,
          filters: this.allFilterLayers.filter(
            (filter) => filter.group === groupName
          ),
          groupRelevance: relevance,
          active: true,
        });
        console.log("Successfully added new Group");
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
          console.log("succesfully added to existing group");
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

  // function to remove single filter from context array
  removeFilter(layerName: string): void {
    console.log("Lösche Filter: ", layerName);
    this.allFilterLayers = this.allFilterLayers.filter(
      (prevFilterLayer) => !(prevFilterLayer.layername === layerName)
    );

    const newActiveFilters = this.activeFilters;
    newActiveFilters.delete(layerName);
    this.activeFilters = newActiveFilters;
    this.updateGroups();
  }

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
    console.log(this.allFilterGroups);
  }

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

  toggleFiltergroupActive(groupname: string) {
    this.allFilterGroups.forEach((group) => {
      if (group.groupName === groupname) {
        group.active = !group.active;
      }
    });
  }

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

  getFilterLayer(name: string): Filter | null {
    const filter = this.allFilterLayers.find((filterLayer) => {
      return filterLayer.layername === name;
    });
    if (filter) {
      return filter;
    }
    return null;
  }

  //FIXME: Hier muss dann über die Gruppen gefiltert werden um richtigen Buffer zu kriegen
  getFilterLayerBuffer(name: string): number | null {
    const filter = this.allFilterLayers.find((filterLayer) => {
      return filterLayer.layername === name;
    });
    if (filter) {
      return filter.distance;
    }
    return null;
  }

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

  convertPolygonCoordsToPixelCoords(
    polygon: Feature<Polygon | MultiPolygon, GeoJsonProperties>,
    layer: Filter
  ): void {
    const coords = polygon.geometry.coordinates;
    // check if this is a multidimensional array (i.e. a multipolygon or a normal one)
    if (coords.length > 1) {
      //console.log("Multipolygon: ", coords);

      //const flattened: mapboxgl.Point[] = [];
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

  convertPolygonCoordsToPixelCoordsNew(
    polygon: Feature<Polygon | MultiPolygon, GeoJsonProperties>,
    layer: Filter
  ): void {
    const coords = polygon.geometry.coordinates;
    // check if this is a multidimensional array (i.e. a multipolygon or a normal one)

    //console.log("Multipolygon: ", coords);
    //const flattened: mapboxgl.Point[] = [];
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

  getUniqueLayerName(filterName: string, groupName: string): string {
    return filterName + " - " + groupName;
  }

  validateGroupName(groupName: string): boolean {
    const existingGroup = this.allFilterGroups.find((group) => {
      return group.groupName === groupName;
    });
    if (existingGroup || groupName === "") {
      return false;
    }
    return true;
  }

  getAllActiveLayers(): Filter[] {
    const activeFilters: Filter[] = [];
    this.allFilterGroups.forEach((group) => {
      if (group.active) {
        activeFilters.push(...group.filters);
      }
    });
    return activeFilters;
  }

  getAllInactiveLayers(): Filter[] {
    const inactiveFilters: Filter[] = [];
    this.allFilterGroups.forEach((group) => {
      if (!group.active) {
        inactiveFilters.push(...group.filters);
      }
    });
    return inactiveFilters;
  }

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

  getRelevanceValue(filter: Filter): number | null {
    const filterGroup = this.allFilterGroups.find((group) => {
      return group.groupName === filter.group;
    });
    if (filterGroup) {
      return filterGroup.groupRelevance;
    }
    return null;
  }
}

export default FilterStore;
