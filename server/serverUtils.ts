/* eslint-env node */

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

/**
 * Builds a query for the PostGIS Database to fetch osm data as GeoJson in the given map bounds
 */
export function buildPostGISQUeryOld(
  bounds: string,
  condition: string,
  table: string
): string {
  if (table === "polygons") {
    return (
      `SELECT json_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',area_id,'geometry',ST_AsGeoJSON(ST_Boundary(ST_ForceRHR(st_transform(geom,4326))))::json,'properties', jsonb_set(row_to_json(${table})::jsonb,'{geom}','0',false))))` +
      ` FROM ${table} WHERE ${condition} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`
    );
  } else if (table === "ways") {
    return (
      `SELECT json_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',way_id,'geometry',ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json,'properties', jsonb_set(row_to_json(${table})::jsonb,'{geom}','0',false))))` +
      ` FROM ${table} WHERE ${condition} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`
    );
  } else if (table === "relations") {
    return (
      `SELECT json_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',relation_id,'geometry',ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json,'properties', jsonb_set(row_to_json(${table})::jsonb,'{geom}','0',false))))` +
      ` FROM ${table} WHERE ${condition} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857));`
    );
  } else {
    return (
      `SELECT json_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',node_id,'geometry',ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json,'properties', jsonb_set(row_to_json(${table})::jsonb,'{geom}','0',false))))` +
      ` FROM ${table} WHERE ${condition} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`
    );
  }
}

export function buildPostGISQuerySingleOld(
  bounds: string,
  conditions: string[],
  table: string
): string {
  let queryString = "";
  for (let i = 0; i < conditions.length; i++) {
    if (table === "polygons") {
      queryString +=
        `SELECT jsonb_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',area_id,'geometry',ST_AsGeoJSON(ST_Boundary(ST_ForceRHR(st_transform(geom,4326))))::json,'properties', jsonb_set(row_to_json(${table})::jsonb,'{geom}','0',false))))` +
        ` FROM ${table} WHERE ${conditions[i]} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`;
    } else if (table === "ways") {
      queryString +=
        `SELECT jsonb_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',way_id,'geometry',ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json,'properties', jsonb_set(row_to_json(${table})::jsonb,'{geom}','0',false))))` +
        ` FROM ${table} WHERE ${conditions[i]} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`;
    } else if (table === "relations") {
      return (
        `SELECT json_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',relation_id,'geometry',ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json,'properties', jsonb_set(row_to_json(${table})::jsonb,'{geom}','0',false))))` +
        ` FROM ${table} WHERE ${conditions[i]} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857));`
      );
    } else {
      queryString +=
        `SELECT jsonb_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',node_id,'geometry',ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json,'properties', jsonb_set(row_to_json(${table})::jsonb,'{geom}','0',false))))` +
        ` FROM ${table} WHERE ${conditions[i]} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`;
    }

    if (i !== conditions.length - 1) {
      queryString += " UNION ";
    }
  }
  return queryString;
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

export function buildPostGISQueryForSingle(
  bounds: string,
  conditions: string[],
  table: string
): string {
  let queryString = "";
  for (let i = 0; i < conditions.length; i++) {
    if (table === "polygons") {
      queryString +=
        `SELECT jsonb_build_object('geometry', ST_AsGeoJSON(ST_Boundary(ST_ForceRHR(st_transform(geom,4326))))::json, 'id', area_id, 'properties', jsonb_build_object('subclass',subclass,'name', name))` +
        ` FROM ${table} WHERE ${conditions[i]} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`;
    } else if (table === "ways") {
      queryString +=
        `SELECT jsonb_build_object('geometry', ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json, 'id', way_id, 'properties', jsonb_build_object('subclass',subclass,'name', name))` +
        ` FROM ${table} WHERE ${conditions[i]} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`;
    } else if (table === "relations") {
      queryString +=
        `SELECT jsonb_build_object('geometry', ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json, 'id', relation_id, 'properties', jsonb_build_object('subclass',subclass,'name', name))` +
        ` FROM ${table} WHERE ${conditions[i]} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`;
    } else {
      queryString +=
        `SELECT jsonb_build_object('geometry', ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json, 'id', node_id, 'properties', jsonb_build_object('subclass',subclass,'name', name))` +
        ` FROM ${table} WHERE ${conditions[i]} AND ST_Intersects(${table}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`;
    }

    if (i !== conditions.length - 1) {
      queryString += " UNION ";
    }
  }
  return queryString;
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
