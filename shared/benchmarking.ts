/**
 * Measurement interface
 *
 * @interface Measurement
 * @field name - the name of the measurement process
 * @field duration - the duration of the measured process
 * @field count - the number of times the process was measured
 */
export interface measurement {
  name: string;
  duration: number;
  count: number;
}

export const enum DBType {
  POSTGISSINGLE = "(union query)",
  POSTGISINDEX = "(Index-gist)",
  OVERPASS = "(Overpass)",
}

export const enum MeasurementNames {
  Workflow = "Workflow",
  RequestClient = "RequestClient",
  DBQuery = "DBQuery",
  Osm2Geo = "Osm2Geo",
  RemoveExistingLayers = "RemoveExistingLayers",
  AddNewGeoData = "AddNewGeoData",
  LoadingAllFilters = "LoadingAllFilters",
  LoadingSingleFilter = "LoadingSingleFilter",
  RenderAllPolygons = "RenderAllPolygons",
  CreateCanvasLayer = "CreateCanvasLayer",
  RenderLayerPolygons = "RenderLayerPolygons",
  GetImageFromCanvas = "GetImageFromCanvas",
  BlurImage = "BlurImage",
  ReadAndSaveLayer = "ReadAndSaveLayer",
  CombiningTextures = "CombiningTextures",
  CreateAlphaMask = "CreateAlphaMask",
  AddLayerToMap = "AddLayerToMap",
}

let dbType = DBType.POSTGISSINGLE;
let measuring = true;

export const toggleDbTypeForBenchmark = () => {
  if (dbType === DBType.POSTGISSINGLE) {
    dbType = DBType.POSTGISINDEX;
  } else if (dbType === DBType.POSTGISINDEX) {
    dbType = DBType.OVERPASS;
  } else {
    dbType = DBType.POSTGISSINGLE;
  }
};

const getMeasurementName = (name: string): string => {
  switch (name) {
    case MeasurementNames.Workflow:
      return "The whole workflow" + dbType;
    case MeasurementNames.RequestClient:
      return "Request Client Side" + dbType;
    case MeasurementNames.DBQuery:
      return "Query From Database" + dbType;
    case MeasurementNames.Osm2Geo:
      return "Osm to Geojson" + dbType;
    case MeasurementNames.RemoveExistingLayers:
      return "removing existing layers" + dbType;
    case MeasurementNames.AddNewGeoData:
      return "Adding new GeoData" + dbType;
    case MeasurementNames.LoadingAllFilters:
      return "Loading of all filters" + dbType;
    case MeasurementNames.LoadingSingleFilter:
      return "Loadtime of a single filter" + dbType;
    case MeasurementNames.RenderAllPolygons:
      return "Rendering of All Polygons" + dbType;
    case MeasurementNames.CreateCanvasLayer:
      return "Creating the Canvas Layer" + dbType;
    case MeasurementNames.RenderLayerPolygons:
      return "Rendering of Polygons for single Layer" + dbType;
    case MeasurementNames.GetImageFromCanvas:
      return "Getting Image from Canvas to blur" + dbType;
    case MeasurementNames.BlurImage:
      return "Bluring of image" + dbType;
    case MeasurementNames.ReadAndSaveLayer:
      return "Reading and saving final layer" + dbType;
    case MeasurementNames.CombiningTextures:
      return "Combining of textures" + dbType;
    case MeasurementNames.CreateAlphaMask:
      return "Creating Alpha Mask" + dbType;
    case MeasurementNames.AddLayerToMap:
      return "Adding Layer to the Map" + dbType;
    default:
      throw new Error(
        `Unknown input value for Measurement! No suitable key for ${name} was found!`
      );
  }
};

/**
 * Starts the measuring timer
 * @param name - The name of the process to measure
 */
export const startPerformanceMeasure = (
  name: string,
  backend?: boolean
): void => {
  if (measuring) {
    if (backend) {
      performance.mark(`start:${name}`);
    } else {
      performance.mark(`start:${getMeasurementName(name)}`);
    }
  }
};

/**
 * Ends the measuring timer
 * @param name - The name of the process to measure
 */
export const endPerformanceMeasure = (
  name: string,
  backend?: boolean
): void => {
  if (measuring) {
    if (backend) {
      performance.mark(`end:${name}`);
      performance.measure(name, `start:${name}`, `end:${name}`);
    } else {
      const fullName = getMeasurementName(name);
      performance.mark(`end:${fullName}`);
      performance.measure(fullName, `start:${fullName}`, `end:${fullName}`);
    }
  }
};

/**
 * logs all measured processes
 */
export const evaluateMeasure = (): void => {
  const measures = avergageMeasures(performance.getEntriesByType("measure"));
  /*
  for (let i = 0; i < measures.length; i++) {
    console.log(
      `Average Time meassured for the process "${measures[i].name}": ${measures[i].duration}ms over ${measures[i].count} iterations`
    );
  }*/
};

export const clearAllMeasures = (): void => {
  performance.clearMeasures();
};

export const toggleMeasuring = (isMeasuring: boolean): void => {
  measuring = isMeasuring;
};

export const getMeasures = (): measurement[] => {
  return avergageMeasures(performance.getEntriesByType("measure"));
};

/**
 * Averages all saved measurements by name
 * @param measureEntries - List of Performance Entries
 * @returns - array of duration objects
 */
const avergageMeasures = (
  measureEntries: PerformanceEntryList
): measurement[] => {
  return (
    [
      ...measureEntries
        // get list of names/durations
        .reduce(
          (map, { name, duration }) =>
            map.set(name, [...(map.get(name) || []), duration]),
          new Map<string, number[]>()
        ),
    ]
      // get list of name/average
      .map(([name, durations]: [string, number[]]) => ({
        name,
        duration:
          durations.reduce((sum: number, val: number) => sum + val, 0) /
          durations.length,
        count: durations.length,
      }))
  );
};
