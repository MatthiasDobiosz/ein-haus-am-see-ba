import axios from "./axiosInterceptor";
import osmtogeojson from "osmtogeojson";
import {
  FeatureCollection,
  GeometryObject,
  MultiPolygon,
  Polygon,
} from "geojson";
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
  query: string,
  first?: boolean,
  last?: boolean
): Promise<FeatureCollection<GeometryObject, any> | null> {
  try {
    const params = new URLSearchParams({
      bounds: mapBounds,
      osmQuery: query,
    });
    let url = "/osmRequestCache?" + params.toString();
    if (first) {
      url += "&first=true";
    }
    if (last) {
      url += "&last=true";
    }
    console.log(url);

    if (first) {
      startPerformanceMeasure("RequestClient");
    }
    // set a timeout of 7 seconds
    const response = await axios.get(url, { timeout: 20000 });
    if (last) {
      endPerformanceMeasure("RequestClient");
    }
    //startPerformanceMeasure("Osm2Geo");
    //console.log(response.data);
    const geoJson = osmtogeojson(response.data);
    //console.log(geoJson);
    //endPerformanceMeasure("Osm2Geo");
    return geoJson as FeatureCollection<GeometryObject, any>;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchDataFromPostGISSingle(
  mapBounds: string,
  conditions: string[],
  bufferValue: string[]
): Promise<FeatureCollection<Polygon | MultiPolygon, any> | null> {
  try {
    const conditionsQuery = encodeURIComponent(JSON.stringify(conditions));
    const bufferValues = encodeURIComponent(JSON.stringify(bufferValue));

    const params = new URLSearchParams({
      bounds: mapBounds,
    });

    const url =
      "/postGISSingle?" +
      params.toString() +
      "&conditions=" +
      conditionsQuery +
      "&bufferValue=" +
      bufferValues;

    console.log(url);

    // set a timeout of 7 seconds
    startPerformanceMeasure("RequestClient");
    const response = await axios.get(url, { timeout: 20000 });
    endPerformanceMeasure("RequestClient");
    return response.data as FeatureCollection<Polygon | MultiPolygon, any>;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchDataFromPostGISIndex(
  mapBounds: string,
  condition: string,
  first?: boolean,
  last?: boolean
): Promise<FeatureCollection<GeometryObject, any> | null> {
  try {
    const params = new URLSearchParams({
      bounds: mapBounds,
      osmQuery: condition,
    });

    let url = "/postGISIndex?" + params.toString();

    if (first) {
      url += "&first=true";
    }
    if (last) {
      url += "&last=true";
    }

    console.log(url);

    // set a timeout of 7 seconds
    if (first) {
      startPerformanceMeasure("RequestClient");
    }
    const response = await axios.get(url, { timeout: 20000 });
    //console.log(response);
    if (last) {
      endPerformanceMeasure("RequestClient");
    }
    return response.data as FeatureCollection<GeometryObject, any>;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchDataFromPostGISBuffer(
  mapBounds: string,
  condition: string,
  bufferValue: number,
  overlay: boolean,
  first?: boolean,
  last?: boolean
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

    if (first) {
      url += "&first=true";
    }
    if (last) {
      url += "&last=true";
    }

    // set a timeout of 7 seconds
    if (first) {
      startPerformanceMeasure("RequestClient");
    }
    const response = await axios.get(url, { timeout: 20000 });
    //console.log(response);
    if (last) {
      endPerformanceMeasure("RequestClient");
    }
    return response.data as FeatureCollection<Polygon | MultiPolygon, any>;
  } catch (error) {
    console.error(error);
    return null;
  }
}
