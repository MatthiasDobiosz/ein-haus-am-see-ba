/* eslint-env node */
import { Feature, Geometry } from "geojson";
import { Polygon } from "geojson";
import { MultiPolygon } from "geojson";

//const exec = Util.promisify(childProcess.exec);

/**
 * Builds a query for the overpass api to fetch osm data as Json in the given map bounds.
 */
export function buildOverpassQuery(bounds: string, userQuery: string): string {
  // output-format json, runtime of max. 25 seconds (needs to be higher for more complex queries) and global bounding box
  const querySettings = `[out:json][timeout:25][bbox:${bounds}];`;
  const output = "out geom qt;"; // use "qt" to sort by quadtile index (sorts by location and is faster than sort by id)
  const query = `${querySettings}(${userQuery});${output}`;
  //console.log(query);
  return query;
}

export function buildPostGISQueryForMulti(
  bounds: string,
  condition: string,
  table: string
): string {
  if (table === "polygons" || table === "polygonsn" || table === "polygonss") {
    return (
      `SELECT ST_AsGeoJSON(ST_Boundary(ST_ForceRHR(st_transform(geom,4326))))::json as geometry, area_id as id, jsonb_build_object('subclass',subclass,'name', name) as properties` +
      ` FROM ${table} WHERE ${condition} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`
    );
  } else if (table === "ways" || table === "waysn" || table === "wayss") {
    return (
      `SELECT ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json as geometry, way_id as id, jsonb_build_object('subclass',subclass,'name', name) as properties` +
      ` FROM ${table} WHERE ${condition} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`
    );
  } else if (
    table === "relations" ||
    table === "relationsn" ||
    table === "relationss"
  ) {
    return (
      `SELECT ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json as geometry, relation_id as id, jsonb_build_object('subclass',subclass,'name', name) as properties` +
      ` FROM ${table} WHERE ${condition} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857));`
    );
  } else {
    return (
      `SELECT ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json as geometry, node_id as id, jsonb_build_object('subclass',subclass,'name', name) as properties` +
      ` FROM ${table} WHERE ${condition} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`
    );
  }
}

export function buildPostGISQueryWithBuffer(
  bounds: string,
  condition: string,
  bufferValue: string,
  table: string
): string {
  if (table === "polygons") {
    return (
      `SELECT ST_AsGeoJSON(ST_Buffer(ST_Boundary(ST_ForceRHR(st_transform(geom,4326)))::geography, ${bufferValue}))::json as geometry, area_id as id, jsonb_build_object('subclass',subclass,'name', name) as properties` +
      ` FROM ${table} WHERE ${condition} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`
    );
  } else if (table === "ways") {
    return (
      `SELECT ST_AsGeoJSON(ST_Buffer(ST_ForceRHR(st_transform(geom,4326)):: geography, ${bufferValue}))::json as geometry, way_id as id, jsonb_build_object('subclass',subclass,'name', name) as properties` +
      ` FROM ${table} WHERE ${condition} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`
    );
  } else if (table === "relations") {
    return (
      `SELECT ST_AsGeoJSON(ST_Buffer(ST_ForceRHR(st_transform(geom,4326)):: geography, ${bufferValue}))::json as geometry, relation_id as id, jsonb_build_object('subclass',subclass,'name', name) as properties` +
      ` FROM ${table} WHERE ${condition} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857));`
    );
  } else {
    return (
      `SELECT ST_AsGeoJSON(ST_Buffer(ST_ForceRHR(st_transform(geom,4326)):: geography, ${bufferValue}))::json as geometry, node_id as id, jsonb_build_object('subclass',subclass,'name', name) as properties` +
      ` FROM ${table} WHERE ${condition} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`
    );
  }
}

export function buildPostGISQueryForSingle(
  bounds: string,
  conditions: string[],
  bufferValues: string[],
  table: string
): string {
  let queryString = "";
  for (let i = 0; i < conditions.length; i++) {
    if (table === "polygons") {
      queryString +=
        `SELECT jsonb_build_object('geometry', ST_AsGeoJSON(ST_Buffer(ST_Boundary(ST_ForceRHR(st_transform(geom,4326)))::geography, ${bufferValues[i]}))::json, 'id', area_id, 'properties', jsonb_build_object('subclass',subclass,'name', name))` +
        ` FROM ${table} WHERE ${conditions[i]} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`;
    } else if (table === "ways") {
      queryString +=
        `SELECT jsonb_build_object('geometry', ST_AsGeoJSON(ST_Buffer(ST_ForceRHR(st_transform(geom,4326))::geography, ${bufferValues[i]}))::json, 'id', way_id, 'properties', jsonb_build_object('subclass',subclass,'name', name))` +
        ` FROM ${table} WHERE ${conditions[i]} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`;
    } else if (table === "relations") {
      queryString +=
        `SELECT jsonb_build_object('geometry', ST_AsGeoJSON(ST_Buffer(ST_ForceRHR(st_transform(geom,4326))::geography, ${bufferValues[i]}))::json, 'id', relation_id, 'properties', jsonb_build_object('subclass',subclass,'name', name))` +
        ` FROM ${table} WHERE ${conditions[i]} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`;
    } else {
      queryString +=
        `SELECT jsonb_build_object('geometry', ST_AsGeoJSON(ST_Buffer(ST_ForceRHR(st_transform(geom,4326))::geography, ${bufferValues[i]}))::json, 'id', node_id, 'properties', jsonb_build_object('subclass',subclass,'name', name))` +
        ` FROM ${table} WHERE ${conditions[i]} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`;
    }

    if (i !== conditions.length - 1) {
      queryString += " UNION ";
    }
  }
  return queryString;
}

export function convertMulti(
  allData: Feature<Geometry, any>[]
): Feature<Geometry, any>[] {
  const featuresWithin: Feature<Geometry, any>[] = [];
  for (let i = 0; i < allData.length; i++) {
    const feature = allData[i];
    if (feature.geometry.type === "MultiLineString") {
      for (let y = 0; y < feature.geometry.coordinates.length; y++) {
        for (let x = 0; x < feature.geometry.coordinates[y].length; x++) {
          const singleFeature: Feature<Geometry, any> = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: feature.geometry.coordinates[y],
            },
            properties: {},
          };
          featuresWithin.push(singleFeature);
          break;
        }
      }
    }
  }

  return featuresWithin;
}

export function buildBoundaryQuery(): string {
  const querystring =
    `SELECT ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json as geometry, relation_id as id, jsonb_build_object('name', name) as properties` +
    ` FROM relations WHERE name = 'Bamberg' `;
  return querystring;
}

export function getDataWithinBoundingBox(
  allData: Feature<Geometry, any>[],
  bounds: string
): Feature<Geometry, any>[] {
  const boundingBox = bounds
    .split(",")
    .map((points) => {
      return points.split(" ");
    })
    .map((points) => {
      return [parseFloat(points[0]), parseFloat(points[1])];
    });

  const featuresWithin: Feature<Geometry, any>[] = [];
  for (let i = 0; i < allData.length; i++) {
    const feature = allData[i];
    if (feature.geometry.type === "MultiLineString") {
      for (let y = 0; y < feature.geometry.coordinates.length; y++) {
        for (let x = 0; x < feature.geometry.coordinates[y].length; x++) {
          if (
            isPointInPolygon(
              feature.geometry.coordinates[y][x][0],
              feature.geometry.coordinates[y][x][1],
              boundingBox
            )
          ) {
            const singleFeature: Feature<Geometry, any> = {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: feature.geometry.coordinates[y],
              },
              properties: {},
            };
            featuresWithin.push(singleFeature);
            break;
          }
        }
      }
    } else {
      featuresWithin.push(feature);
    }
  }

  return featuresWithin;
}

export function removeUnseenRelationParts(
  allData: Feature<Polygon | MultiPolygon, any>[],
  bounds: string
): Feature<Polygon | MultiPolygon, any>[] {
  const boundingBox = bounds
    .split(",")
    .map((points) => {
      return points.split(" ");
    })
    .map((points) => {
      return [parseFloat(points[0]), parseFloat(points[1])];
    });

  const featuresWithin: Feature<Polygon | MultiPolygon, any>[] = [];
  for (let i = 0; i < allData.length; i++) {
    const feature = allData[i];
    if (feature.geometry.type === "Polygon") {
      const validFeature = isPolygonWithinBounds(feature.geometry, boundingBox);
      if (validFeature) {
        featuresWithin.push(feature);
      }
    } else if (feature.geometry.type === "MultiPolygon") {
      for (let y = 0; y < feature.geometry.coordinates.length; y++) {
        const validFeature = isPolygonWithinBounds(
          {
            type: "Polygon",
            coordinates: feature.geometry.coordinates[y],
          },
          boundingBox
        );
        if (validFeature) {
          featuresWithin.push({
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: feature.geometry.coordinates[y],
            },
            properties: {
              name: feature.properties.name,
              subclass: feature.properties.subclass,
            },
          });
        }
      }
    }
  }

  return featuresWithin;
}

function isPolygonWithinBounds(
  feature: Polygon,
  boundingBox: number[][]
): Polygon | null {
  for (let y = 0; y < feature.coordinates.length; y++) {
    for (let x = 0; x < feature.coordinates[y].length; x++) {
      if (
        isPointInPolygon(
          feature.coordinates[y][x][0],
          feature.coordinates[y][x][1],
          boundingBox
        )
      ) {
        return feature;
      }
    }
  }
  return null;
}

/**
 * Verify if point of coordinates (longitude, latitude) is within polygon of coordinates
 * https://github.com/substack/point-in-polygon/blob/master/index.js
 * @param {number} latitude Latitude
 * @param {number} longitude Longitude
 * @param {array<[number,number]>} polygon Polygon contains arrays of points. One array have the following format: [latitude,longitude]
 */
export function isPointInPolygon(
  latitude: number,
  longitude: number,
  polygon: number[][]
) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new TypeError("Invalid latitude or longitude. Numbers are expected");
  } else if (!polygon || !Array.isArray(polygon)) {
    throw new TypeError("Invalid polygon. Array with locations expected");
  } else if (polygon.length === 0) {
    throw new TypeError("Invalid polygon. Non-empty Array expected");
  }

  const x = latitude;
  const y = longitude;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * TODO the code below is only needed for executing local cmd scripts! (not used right now)
 */

/*
  //Returns a string identifying the operating system platform. The value is set at compile time.
  //Possible values are 'aix', 'darwin', 'freebsd', 'linux', 'openbsd', 'sunos', and 'win32'.
  
  function getPlatform(): string {
    return os.platform();
  }
  
  export async function executeOSMFilter(path: string): Promise<string | null> {
    const platform = getPlatform();
    let script: string;
  
    if (platform === "win32") {
      //script = `${path}/assets/osmconvert.exe ${path}/assets/ny_extract.osm.pbf --drop-author -o=${path}/assets/new.osm.pbf`;
      script = `dir "${path}/assets"`;
    } else if (platform === "linux") {
      script = "ls";
    } else {
      console.error("Only Windows and Linux are supported at the moment!");
      return null;
    }
  
    try {
      const { stdout, stderr } = await exec(script);
  
      // the *entire* stdout and stderr (buffered)
      console.log("stdout: " + stdout);
      console.log("stderr: " + stderr);
      return stdout;
    } catch (error) {
      // node couldn't execute the command
      console.log("exec error: " + error);
      return null;
    }
  }
  
  // executes command line scripts
  export async function executeScript(script: string): Promise<void> {
    // TODO check for correct os!
    const platform = getPlatform();
    let exampleScript: string;
  
    if (platform === "win32") {
      exampleScript = "docker -v";
      //TODO use cmd (or test.bat)
    } else if (platform === "linux") {
      exampleScript = "ls";
      //TODO use test.sh
    } else {
      console.error("Only Windows and Linux are supported at the moment!");
      return;
    }
  
    try {
      const { stdout, stderr } = await exec(script);
  
      // the *entire* stdout and stderr (buffered)
      console.log("stdout: " + stdout);
      console.log("stderr: " + stderr);
    } catch (error) {
      // node couldn't execute the command
      console.log("exec error: " + error);
      return;
    }
  }
  
  //TODO spawn besser für memory-intensive tasks!
  
  export async function executeFile(command: string): Promise<void> {
    const script = exec("sh test.sh /myDir");
  
    script.child.on("data", (data) => {
      console.log(data);
    });
  
    script.child.on("error", (error) => {
      console.log(error);
    });
  
    console.log((await script).stdout);
  }
  */
