import axios from "./axiosInterceptor";
import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  MultiPolygon,
  Point,
  Polygon,
} from "geojson";

export async function fetchHouseDataFromPostGIS(
  mapBounds: string
): Promise<FeatureCollection<Point, any> | null> {
  try {
    const params = new URLSearchParams({
      bounds: mapBounds,
    });

    const url = "/getHouses?" + params.toString();
    const response = await axios.get(url, { timeout: 20000 });
    return response.data as FeatureCollection<Point, any>;
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
      console.log(url);
    } else {
      const params = new URLSearchParams({
        bounds: mapBounds,
        osmQuery: condition,
        bufferValue: bufferValue.toString(),
      });

      url = "/postGISNoBuffer?" + params.toString();
    }

    const response = await axios.get(url, { timeout: 20000 });
    //console.log(response);

    return response.data as FeatureCollection<Polygon | MultiPolygon, any>;
  } catch (error) {
    console.error(error);
    return null;
  }
}
