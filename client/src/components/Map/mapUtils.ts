import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  GeometryObject,
  LineString,
  Point,
  Polygon,
} from "geojson";
import { LngLatLike, MapboxMap, PointLike } from "react-map-gl";
import bbox from "@turf/bbox";
import { addBufferToFeature } from "./turfUtils";
import bboxPolygon from "@turf/bbox-polygon";

// Utility functions to use for the map

// convert meter to screen pixel, formula based on https://wiki.openstreetmap.org/wiki/Zoom_levels
export function metersInPixel(
  meters: number,
  latitude: number,
  zoomLevel: number
): number {
  const earthCircumference = 40075016.686;
  const latitudeRadians = latitude * (Math.PI / 180);
  //* zoomlevel + 9 instead of + 8 because mapbox uses 512*512 tiles, see https://docs.mapbox.com/help/glossary/zoom-level/
  const metersPerPixel =
    (earthCircumference * Math.cos(latitudeRadians)) /
    Math.pow(2, zoomLevel + 9);

  return meters / metersPerPixel;
}

/**
 * Get the current bounding box as an array
 */
export function getViewportBounds(map: MapboxMap): number[][] {
  const bounds = map.getBounds();
  const viewportBounds = [
    bounds.getNorthWest().toArray(),
    bounds.getNorthEast().toArray(),
    bounds.getSouthEast().toArray(),
    bounds.getSouthWest().toArray(),
  ];
  return viewportBounds;
}

/**
 * Get the current bounding box, in order:
 * southern-most latitude, western-most longitude, northern-most latitude, eastern-most longitude.
 * @return string representation of the bounds in the above order
 */
export function getViewportBoundsString(
  map: MapboxMap,
  additionalDistance?: number
): string {
  console.log(map?.getZoom());

  const currBounds = map.getBounds();
  let southLat = currBounds.getSouth();
  let westLng = currBounds.getWest();
  let northLat = currBounds.getNorth();
  let eastLng = currBounds.getEast();

  if (additionalDistance) {
    const bufferedBBox = bbox(
      addBufferToFeature(
        bboxPolygon([westLng, southLat, eastLng, northLat]),
        additionalDistance
      )
    );

    southLat = bufferedBBox[1];
    westLng = bufferedBBox[0];
    northLat = bufferedBBox[3];
    eastLng = bufferedBBox[2];
  }

  return `${southLat},${westLng},${northLat},${eastLng}`;
}

/**
 * Util-Function to convert LngLat coordinates to pixel coordinates on the screen.
 */
export function convertToPixelCoord(
  map: MapboxMap,
  coord: LngLatLike
): mapboxgl.Point {
  return map.project(coord);
}

/**
 * Util-Function to convert pixel coordinates to LngLat coordinates.
 */
export function convertToLatLngCoord(
  map: MapboxMap,
  coord: LngLatLike
): PointLike {
  return map.project(coord);
}

export function flattenMultiGeometry(
  data: FeatureCollection<GeometryObject>
): (
  | Feature<Point, GeoJsonProperties>
  | Feature<LineString, GeoJsonProperties>
  | Feature<Polygon, GeoJsonProperties>
)[] {
  const currentPoints: Set<Feature<Point, GeoJsonProperties>> = new Set();
  const currentWays: Set<Feature<LineString, GeoJsonProperties>> = new Set();
  const currentPolygons: Set<Feature<Polygon, GeoJsonProperties>> = new Set();

  for (let index = 0; index < data.features.length; index++) {
    const element = data.features[index];

    switch (element.geometry.type) {
      case "Point":
        currentPoints.add(element as Feature<Point, GeoJsonProperties>);
        break;

      case "MultiPoint":
        for (const coordinate of element.geometry.coordinates) {
          const point = {
            geometry: { type: "Point", coordinates: coordinate },
            properties: { ...element.properties },
            type: "Feature",
          } as Feature<Point, GeoJsonProperties>;

          currentPoints.add(point);
        }
        break;

      case "LineString": {
        currentWays.add(element as Feature<LineString, GeoJsonProperties>);
        break;
      }
      case "MultiLineString":
        for (const coordinate of element.geometry.coordinates) {
          const way = {
            geometry: { type: "LineString", coordinates: coordinate },
            properties: { ...element.properties },
            type: "Feature",
          } as Feature<LineString, GeoJsonProperties>;

          currentWays.add(way);
        }
        break;

      case "Polygon": {
        currentPolygons.add(element as Feature<Polygon, GeoJsonProperties>);
        break;
      }
      case "MultiPolygon":
        for (const coordinate of element.geometry.coordinates) {
          // construct a new polygon for every coordinate array in the multipolygon
          const polygon = {
            geometry: { type: "Polygon", coordinates: coordinate },
            properties: { ...element.properties },
            type: "Feature",
          } as Feature<Polygon, GeoJsonProperties>;

          currentPolygons.add(polygon);
        }
        break;
      case "GeometryCollection":
        break;

      default:
        throw new Error("Unknown geojson geometry type in data!");
    }
  }

  const allFeatures = [...currentPoints, ...currentWays, ...currentPolygons];
  //console.log("allFeatures: ", allFeatures);
  return allFeatures;
}
