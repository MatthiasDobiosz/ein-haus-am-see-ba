/* eslint-env node */
import { complexQuery } from "./../client/src/osmTagCollection";

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
export function buildPostGISQUery(
  bounds: string,
  userQuery: complexQuery
): string {
  let conditions = "";
  for (let i = 0; i < userQuery.conditions.length; i++) {
    conditions += userQuery.conditions[i];
    if (i > 0 && i != userQuery.conditions.length) {
      conditions += " AND ";
    }
  }
  console.log(conditions);
  return (
    `SELECT json_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',area_id,'geometry',ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json,'properties', jsonb_set(row_to_json(${userQuery.dataTable})::jsonb,'{geom}','0',false))))` +
    ` FROM ${userQuery.dataTable} WHERE ${conditions} AND ST_Within(${userQuery.dataTable}.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`
  );
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
