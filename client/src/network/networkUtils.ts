import axios from "./axiosInterceptor";
import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  MultiPolygon,
  Polygon,
} from "geojson";

export async function fetchDataFromPostGISBuffer(
  mapBounds: string,
  condition: string,
  bufferValue: number,
  overlay: boolean
): Promise<FeatureCollection<Polygon | MultiPolygon, any> | null> {
  try {
    let url = "";
    if (overlay) {
      const params = new URLSearchParams({
        bounds: mapBounds,
        osmQuery: condition,
        bufferValue: bufferValue.toString(),
      });

      url = "/postGISBuffer?" + params.toString();
    } else {
      const params = new URLSearchParams({
        bounds: mapBounds,
        osmQuery: condition,
        bufferValue: bufferValue.toString(),
      });

      url = "/postGISNoBuffer?" + params.toString();
    }

    const response = await axios.get(url, { timeout: 20000 });

    return response.data as FeatureCollection<Polygon | MultiPolygon, any>;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchCityBoundary(): Promise<
  Feature<Geometry, GeoJsonProperties>
> {
  const response = await axios.get("/getCityBoundary", { timeout: 20000 });
  return response.data as Feature<Geometry, GeoJsonProperties>;
}
