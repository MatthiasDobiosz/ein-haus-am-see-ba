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
import { FilterItem } from "./FilterItem";

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
  distance: number;
  measurement: string;
  relevanceValue: number;
  wanted: boolean;
  points: Point[][];
  features: Feature<Polygon | MultiPolygon, GeoJsonProperties>[];
  originalData: FeatureCollection<Geometry> | null;
}

/**
 * Filters Component that maps the list of currently active filters
 */
export const Filters = observer((): JSX.Element => {
  return (
    <div>
      {rootStore.filterStore.allFilterLayers.length > 0 ? (
        <ul className="text-[0.9em] list-none pt-0 pr-[5px] pb-[10px] pl-[5px]">
          {rootStore.filterStore.allFilterLayers.map((filterLayer) => {
            return (
              <FilterItem key={filterLayer.layername} filter={filterLayer} />
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
