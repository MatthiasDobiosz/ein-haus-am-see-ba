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
 * Get the current bounding box as a string
 * can add additional distance via the parameter
 */
export function getViewportPolygon(
  map: MapboxMap,
  additionalDistance?: number
): string {
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
  const north = northLat.toString();
  const west = westLng.toString();
  const east = eastLng.toString();
  const south = southLat.toString();
  const boundsString =
    west +
    " " +
    north +
    "," +
    east +
    " " +
    north +
    "," +
    east +
    " " +
    south +
    "," +
    west +
    " " +
    south +
    "," +
    west +
    " " +
    north;
  return boundsString;
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
