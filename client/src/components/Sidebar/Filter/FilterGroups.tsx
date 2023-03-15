import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  MultiPolygon,
  Polygon,
} from "geojson";
import { observer } from "mobx-react";
import { Point } from "react-map-gl";
import rootStore from "../../../stores/RootStore";
import { FilterGroupItem } from "./FilterGroupItem";

// every relevance has a specific weight
export enum FilterRelevance {
  notVeryImportant = 0.2,
  important = 0.5,
  veryImportant = 0.8,
}

/**
 * Filter Interface
 *
 * @interface Filter
 * @param layername - internal layername in mapbox
 * @param tagname - category of the filter
 * @param distance - specified distance of the filter
 * @param measurement - current chosen measurement
 * @param wanted - if filter is wanted
 * @param points - projected coordinates to display polygons in mapbox
 * @param features - non-projected features that are directly retrieved from the db
 * @param originalData - previous data to enable refreshing overlay without a new db request
 * @param specifies the group the filter belongs to
 */
export interface Filter {
  layername: string;
  tagName: string;
  distance: number;
  measurement: string;
  wanted: boolean;
  points: Point[][];
  features: Feature<Polygon | MultiPolygon, GeoJsonProperties>[];
  originalData: FeatureCollection<Geometry> | null;
  group: string;
}

/**
 * FilterGroup Interface
 *
 * @interface FilterGroup
 * @param groupName - the unique name of the filtergroup
 * @param filters - all filters that belong to the group
 * @param groupRelevance - the relevance for the whole group
 * @param active - specifies if group is currently active and should be displayed
 */
export interface FilterGroup {
  groupName: string;
  filters: Filter[];
  groupRelevance: number;
  active: boolean;
}

/**
 * Filters Component that maps the list of currently active filters
 */
export const FilterGroups = observer((): JSX.Element => {
  // maps all filters within a group
  return (
    <div>
      {rootStore.filterStore.allFilterGroups.length > 0 ? (
        <ul className="text-[0.9em] pt-0 pr-[5px] pb-[10px] pl-[5px]">
          {rootStore.filterStore.allFilterGroups.map((filterGroup) => {
            return (
              <FilterGroupItem
                filtergroup={filterGroup}
                key={filterGroup.groupName}
              />
            );
          })}
        </ul>
      ) : (
        <div className="p-[20px]">
          <p className="m-[14px]">Keine Filter sind im Moment aktiv.</p>
          <p className="m-[14px]">
            Gehe zur Filterauswahl und füge Filtergruppen hinzu.
          </p>
        </div>
      )}
    </div>
  );
});
