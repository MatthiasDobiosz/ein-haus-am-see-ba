import axios from "./axiosInterceptor";
import { FeatureCollection, MultiPolygon, Polygon } from "geojson";

/**
 *
 * @param mapBounds - map bounds that specify the area that should be retrieved
 * @param condition - specifies the kind of objects that should be retrieved
 * @param bufferValue - the distance/buffer of the polygons
 * @param overlay - boolean to check if overlay or POI-View is active
 * @returns
 */
export async function fetchDataFromPostGIS(
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

      // if buffered values should be retrieved for Overlay
      url = "/postGISBuffer?" + params.toString();
      console.log(url);
    } else {
      const params = new URLSearchParams({
        bounds: mapBounds,
        osmQuery: condition,
        bufferValue: bufferValue.toString(),
      });

      // if non-buffered values should be retrieved for POI-View
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
