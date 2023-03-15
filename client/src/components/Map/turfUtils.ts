import buffer from "@turf/buffer";
import type {
  Feature,
  GeoJsonProperties,
  Geometry,
  MultiPolygon,
  Polygon,
} from "geojson";

type turfUnits = "meters" | "kilometers";

// uses turf-buffer to buffer the bounding box if needed
export function addBufferToFeature(
  element: Feature<Geometry, GeoJsonProperties>,
  bufferSize = 100,
  units: turfUnits = "meters"
): Feature<Polygon | MultiPolygon, GeoJsonProperties> {
  //const newElement = buffer(element as Feature<Polygon, GeoJsonProperties>, 50, "meters");
  return buffer(element, bufferSize, { units: units });
}
