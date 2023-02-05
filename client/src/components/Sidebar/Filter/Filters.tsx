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
 * @param layername - category of the filter
 * @param distance - specified distance (m/km) of the filter
 * @param measurement - current chosen measurement
 * @param relevanceValue - importance of the filter
 * @param wanted - if filter is wanted
 * @param points - ?
 * @param features - ?
 * @param originalData - ?
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

export interface FilterGroup {
  groupName: string;
  groupID: number;
  filters: Filter[];
  groupRelevance: number;
}

//FIXME: Hier können dann auch Gruppenkomponenten hinzugeüfgt werden oder auch nur Gruppen
/**
 * Filters Component that maps the list of currently active filters
 */
export const Filters = observer((): JSX.Element => {
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
            Klicke auf eine der Kategorien oben, um Filter auszuwählen.
          </p>
        </div>
      )}
    </div>
  );
});
