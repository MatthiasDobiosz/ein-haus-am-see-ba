import axios from "./axiosInterceptor";
import osmtogeojson from "osmtogeojson";
import { FeatureCollection, GeometryObject } from "geojson";
import {
  endPerformanceMeasure,
  startPerformanceMeasure,
} from "../../../shared/benchmarking";

export async function uploadLogs(logs: any): Promise<void> {
  try {
    //const url = "http://pro.mi.ur.de:8000/logs";
    const url = "/logs";
    const response = await axios.post(url, logs);
    //console.log(response);
    // TODO: showSnackbar(`Uploading logs: ${response.data}`, SnackbarType.INFO, 3000);
  } catch (error) {
    //console.log(error);
  }
}

/**
 * Overpass Requests
 */
function buildOverpassQuery(bounds: string, userQuery: string): string {
  // output-format json, runtime of max. 25 seconds (needs to be higher for more complex queries) and global bounding box
  const querySettings = `[out:json][timeout:25][bbox:${bounds}];`;
  const output = "out geom qt;"; // use "qt" to sort by quadtile index (sorts by location and is faster than sort by id)
  const query = `${querySettings}(${userQuery});${output}`;
  //console.log(query);
  return query;
}

export async function fetchOsmDataFromClientVersion(
  mapBounds: string,
  query: string
): Promise<any> {
  try {
    //console.log("sending request!");
    const overpassQuery = new URLSearchParams({
      data: buildOverpassQuery(mapBounds, query),
    });

    //Benchmark.startMeasure("Request client side");
    // online overpass api
    const url = `https://overpass-api.de/api/interpreter?${overpassQuery.toString()}`;

    // local overpass api (docker image)
    //const url = `https://192.168.99.100:12345/api/interpreter?${overpassQuery}`;

    const response = await axios.get(url, { timeout: 7000 });
    //console.log(Benchmark.stopMeasure("Request client side"));

    //console.log(response);
    // * measure time over 50 trials with this:
    //console.log(await Benchmark.getAverageTime(osmtogeojson, [response.data]));

    //Benchmark.startMeasure("o2geo client");
    const geoJson = osmtogeojson(response.data);
    //Benchmark.stopMeasure("o2geo client");

    return geoJson;
  } catch (error) {
    //console.error(error);
    return null;
  }
}

export async function fetchOsmDataFromServer(
  mapBounds: string,
  query: string
): Promise<FeatureCollection<GeometryObject, any> | null> {
  try {
    const params = new URLSearchParams({
      bounds: mapBounds,
      osmQuery: query,
    });
    const url = "/osmRequestCache?" + params.toString();
    console.log(url);

    startPerformanceMeasure("Request client side");
    // set a timeout of 7 seconds
    const response = await axios.get(url, { timeout: 20000 });
    endPerformanceMeasure("Request client side");
    startPerformanceMeasure("o2geo client");
    console.log(response.data);
    const geoJson = osmtogeojson(response.data);
    console.log(geoJson);
    endPerformanceMeasure("o2geo client");
    return geoJson as FeatureCollection<GeometryObject, any>;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchDataFromPostGIS(
  mapBounds: string,
  conditions: string[]
): Promise<FeatureCollection<GeometryObject, any> | null> {
  try {
    const conditionsQuery = encodeURIComponent(JSON.stringify(conditions));

    const params = new URLSearchParams({
      bounds: mapBounds,
    });
    const data = await axios.get(
      "/testdb?bounds=11.93691490881318+49.06334045685992%2C12.266333091186453+49.06334045685992%2C12.266333091186453+48.963473458586435%2C11.93691490881318+48.963473458586435%2C11.93691490881318+49.06334045685992&conditions=%5B%22subclass%20%3D%20'restaurant'%22%5D"
    );
    console.log(data);
    console.log("LOL");
    const url =
      "/testdb?" + params.toString() + "&conditions=" + conditionsQuery;

    console.log(url);
    console.log("start request");
    // set a timeout of 7 seconds
    const response = await axios.get(url, { timeout: 20000 });

    return response.data as FeatureCollection<GeometryObject, any>;
  } catch (error) {
    console.error(error);
    return null;
  }
}
