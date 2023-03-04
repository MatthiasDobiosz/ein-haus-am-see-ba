import express, { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import * as ServerUtils from "./serverUtils.js";
import pgk from "pg";
import {
  Feature,
  FeatureCollection,
  Geometry,
  Point,
  Polygon,
  MultiPolygon,
} from "geojson";
import truncate from "@turf/truncate";

const { Pool } = pgk;

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "syn27X!L",
  database: "osm_om",
  max: 100,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

export default class OsmRouter {
  private readonly osmRouter: Router;

  constructor() {
    this.osmRouter = express.Router();
    this.setupRoutes();

    //this.testNodeOsmium();
  }

  get instance(): Router {
    return this.osmRouter;
  }

  /**
   * Init the express router and setup routes.
   */
  setupRoutes(): void {
    this.osmRouter.get("/postGISBuffer", (req: Request, res: Response) => {
      const bounds = req.query.bounds?.toString();
      const query = req.query.osmQuery?.toString();
      const bufferValue = req.query.bufferValue?.toString();
      const first = req.query.first?.toString();
      const last = req.query.last?.toString();
      if (bounds && query && bufferValue) {
        /** 
        const complexQuery =
          "SELECT jsonb_build_object('type','FeatureCollection','features', jsonb_agg(features.feature)) FROM (SELECT jsonb_build_object('type', 'Feature','id', osm_id,'geometry', ST_AsGeoJSON(way)::jsonb,'properties', to_jsonb(planet_osm_point) - 'osm_id' - 'way') AS feature FROM (SELECT * FROM planet_osm_point)) features;";

        const featureQuery =
          "SELECT json_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',osm_id,'geometry',ST_AsGeoJSON(ST_ForceRHR(st_transform(way,4326)))::json,'properties', jsonb_set(row_to_json(planet_osm_point)::jsonb,'{way}','0',false))))" +
          "FROM planet_osm_point WHERE amenity = 'restaurant' AND ST_Within(planet_osm_point.way,st_transform(ST_GeographyFromText('POLYGON((11.980345237183542 49.06334045685861,12.222902762818705 49.06334045685861, 12.222902762818705 48.963473458585185, 11.980345237183542 48.963473458585185, 11.980345237183542 49.06334045685861))')::geometry,3857))";
        const lel =
          "SELECT json_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',osm_id,'geometry',ST_AsGeoJSON(ST_ForceRHR(st_transform(way,4326)))::json,'properties', jsonb_set(row_to_json(planet_osm_point)::jsonb,'{way}','0',false))))" +
          "FROM planet_osm_point WHERE amenity = 'restaurant' AND ST_Within(planet_osm_point.way,st_transform(ST_GeographyFromText('POLYGON((11.523960394564455 49.17681124925767,12.552824961656114 49.17681124925767, 12.552824961656114 48.75279187037441, 11.523960394564455 48.75279187037441, 11.523960394564455 49.17681124925767))')::geometry,3857))";
        const standardQuery =
          "SELECT ST_X(ST_Transform(way, 4326)) as LONG, ST_Y(ST_Transform(way, 4326)) as LAT from planet_osm_point WHERE amenity ='restaurant' AND ST_Within(planet_osm_point.way,st_transform(ST_GeographyFromText('POLYGON((11.980345237183542 49.06334045685861,12.222902762818705 49.06334045685861, 12.222902762818705 48.963473458585185, 11.980345237183542 48.963473458585185, 11.980345237183542 49.06334045685861))')::geometry,3857))";

        const poisquery =
          "SELECT json_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',osm_id,'geometry',ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json,'properties', jsonb_set(row_to_json(restaurants)::jsonb,'{geom}','0',false))))" +
          "FROM restaurants WHERE subclass = 'restaurant' AND ST_Within(restaurants.geom,st_transform(ST_GeographyFromText('POLYGON((11.375428993859288 49.285878356498586, 12.890034554177703 49.285878356498586, 12.890034554177703 48.8271096698945, 11.375428993859288 48.8271096698945, 11.375428993859288 49.285878356498586))')::geometry,3857))";
        */

        const pointQuery = ServerUtils.buildPostGISQueryWithBuffer(
          bounds,
          query,
          bufferValue,
          "points"
        );

        const wayQuery = ServerUtils.buildPostGISQueryWithBuffer(
          bounds,
          query,
          bufferValue,
          "ways"
        );

        const polyQuery = ServerUtils.buildPostGISQueryWithBuffer(
          bounds,
          query,
          bufferValue,
          "polygons"
        );

        const relationsQuery = ServerUtils.buildPostGISQueryWithBuffer(
          bounds,
          query,
          bufferValue,
          "relations"
        );

        /** 
        client.query(wayQuery, (err, result) => {
          if (!err) {
            res.status(StatusCodes.OK).send(result.rows[0].json_build_object);
          } else {
            console.log(err.message);
          }
          client.end();
        });*/
        let allFeatures: Feature<Geometry, any>[] = [];
        Promise.allSettled([
          pool
            .query(pointQuery)
            .then((res) => (allFeatures = allFeatures.concat(res.rows)))
            .catch((e) => console.error(e)),
          pool
            .query(wayQuery)
            .then((res) => (allFeatures = allFeatures.concat(res.rows)))
            .catch((e) => console.error(e)),
          pool
            .query(polyQuery)
            .then((res) => (allFeatures = allFeatures.concat(res.rows)))
            .catch((e) => console.error(e)),
          pool
            .query(relationsQuery)
            .then(
              (res) =>
                (allFeatures = allFeatures.concat(
                  ServerUtils.removeUnseenRelationParts(res.rows, bounds)
                ))
            )
            .catch((e) => console.error(e)),
        ]).then((results) => {
          // cache data for one hour, this should be enough for a typical usecase
          //const cacheTime = 3600;
          //! cache only for 15 minutes during study to prevent influencing the next participant!
          //const cacheTime = 900;
          //const features: any = featureCollection.features;
          //RedisCache.cacheData(compositeKey, features, cacheTime);

          allFeatures.forEach((feature) => {
            feature.type = "Feature";
          });
          const featureCollection = {
            type: "FeatureCollection",
            features: allFeatures,
          };
          const options = { precision: 4, coordinates: 2, mutate: true };
          const truncatedData: FeatureCollection<Polygon | MultiPolygon, any> =
            truncate(featureCollection, options);
          res.status(StatusCodes.OK).send(truncatedData);
        });
        // let roadFeatures: GeoJsonProperties[];
      }
    });

    this.osmRouter.get("/getHouses", (req: Request, res: Response) => {
      const bounds = req.query.bounds?.toString();
      if (bounds) {
        const housesQuery =
          "SELECT ST_AsGeoJSON(ST_Centroid(ST_ForceRHR(st_transform(geom,4326))))::json as geometry, jsonb_build_object('address',address,'street',street,'name', name, 'kind',kind, 'id', way_id) as properties " +
          `FROM houses WHERE ST_Within(houses.geom,st_transform(ST_GeographyFromText('POLYGON((${bounds}))')::geometry,3857))`;

        pool
          .query(housesQuery)
          .then((resp) => {
            const allFeatures: Feature<Geometry, any>[] = resp.rows;
            allFeatures.forEach((feature) => {
              feature.type = "Feature";
            });
            const featureCollection = {
              type: "FeatureCollection",
              features: allFeatures,
            };

            const options = { precision: 4, coordinates: 2, mutate: true };
            const truncatedData: FeatureCollection<Point, any> = truncate(
              featureCollection,
              options
            );
            res.status(StatusCodes.OK).send(truncatedData);
          })
          .catch((e) => console.error(e));
      }
    });

    this.osmRouter.get("/postGISNoBuffer", (req: Request, res: Response) => {
      const bounds = req.query.bounds?.toString();
      const query = req.query.osmQuery?.toString();
      const first = req.query.first?.toString();
      const last = req.query.last?.toString();
      if (bounds && query) {
        /** 
        const complexQuery =
          "SELECT jsonb_build_object('type','FeatureCollection','features', jsonb_agg(features.feature)) FROM (SELECT jsonb_build_object('type', 'Feature','id', osm_id,'geometry', ST_AsGeoJSON(way)::jsonb,'properties', to_jsonb(planet_osm_point) - 'osm_id' - 'way') AS feature FROM (SELECT * FROM planet_osm_point)) features;";

        const featureQuery =
          "SELECT json_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',osm_id,'geometry',ST_AsGeoJSON(ST_ForceRHR(st_transform(way,4326)))::json,'properties', jsonb_set(row_to_json(planet_osm_point)::jsonb,'{way}','0',false))))" +
          "FROM planet_osm_point WHERE amenity = 'restaurant' AND ST_Within(planet_osm_point.way,st_transform(ST_GeographyFromText('POLYGON((11.980345237183542 49.06334045685861,12.222902762818705 49.06334045685861, 12.222902762818705 48.963473458585185, 11.980345237183542 48.963473458585185, 11.980345237183542 49.06334045685861))')::geometry,3857))";
        const lel =
          "SELECT json_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',osm_id,'geometry',ST_AsGeoJSON(ST_ForceRHR(st_transform(way,4326)))::json,'properties', jsonb_set(row_to_json(planet_osm_point)::jsonb,'{way}','0',false))))" +
          "FROM planet_osm_point WHERE amenity = 'restaurant' AND ST_Within(planet_osm_point.way,st_transform(ST_GeographyFromText('POLYGON((11.523960394564455 49.17681124925767,12.552824961656114 49.17681124925767, 12.552824961656114 48.75279187037441, 11.523960394564455 48.75279187037441, 11.523960394564455 49.17681124925767))')::geometry,3857))";
        const standardQuery =
          "SELECT ST_X(ST_Transform(way, 4326)) as LONG, ST_Y(ST_Transform(way, 4326)) as LAT from planet_osm_point WHERE amenity ='restaurant' AND ST_Within(planet_osm_point.way,st_transform(ST_GeographyFromText('POLYGON((11.980345237183542 49.06334045685861,12.222902762818705 49.06334045685861, 12.222902762818705 48.963473458585185, 11.980345237183542 48.963473458585185, 11.980345237183542 49.06334045685861))')::geometry,3857))";

        const poisquery =
          "SELECT json_build_object('type', 'FeatureCollection','features', json_agg(json_build_object('type','Feature','id',osm_id,'geometry',ST_AsGeoJSON(ST_ForceRHR(st_transform(geom,4326)))::json,'properties', jsonb_set(row_to_json(restaurants)::jsonb,'{geom}','0',false))))" +
          "FROM restaurants WHERE subclass = 'restaurant' AND ST_Within(restaurants.geom,st_transform(ST_GeographyFromText('POLYGON((11.375428993859288 49.285878356498586, 12.890034554177703 49.285878356498586, 12.890034554177703 48.8271096698945, 11.375428993859288 48.8271096698945, 11.375428993859288 49.285878356498586))')::geometry,3857))";
        */

        const pointQuery = ServerUtils.buildPostGISQueryForMulti(
          bounds,
          query,
          "points"
        );

        const wayQuery = ServerUtils.buildPostGISQueryForMulti(
          bounds,
          query,
          "ways"
        );

        const polyQuery = ServerUtils.buildPostGISQueryForMulti(
          bounds,
          query,
          "polygons"
        );

        const relationsQuery = ServerUtils.buildPostGISQueryForMulti(
          bounds,
          query,
          "relations"
        );

        /** 
        client.query(wayQuery, (err, result) => {
          if (!err) {
            res.status(StatusCodes.OK).send(result.rows[0].json_build_object);
          } else {
            console.log(err.message);
          }
          client.end();
        });*/
        let allFeatures: Feature<Geometry, any>[] = [];
        Promise.allSettled([
          pool
            .query(pointQuery)
            .then((res) => (allFeatures = allFeatures.concat(res.rows)))
            .catch((e) => console.error(e)),
          pool
            .query(wayQuery)
            .then((res) => (allFeatures = allFeatures.concat(res.rows)))
            .catch((e) => console.error(e)),
          pool
            .query(polyQuery)
            .then((res) => (allFeatures = allFeatures.concat(res.rows)))
            .catch((e) => console.error(e)),
          pool
            .query(relationsQuery)
            .then((res) => (allFeatures = allFeatures.concat(res.rows)))
            .catch((e) => console.error(e)),
        ]).then((results) => {
          // cache data for one hour, this should be enough for a typical usecase
          //const cacheTime = 3600;
          //! cache only for 15 minutes during study to prevent influencing the next participant!
          //const cacheTime = 900;
          //const features: any = featureCollection.features;
          //RedisCache.cacheData(compositeKey, features, cacheTime);

          allFeatures.forEach((feature) => {
            feature.type = "Feature";
          });
          const featureCollection = {
            type: "FeatureCollection",
            features: allFeatures,
          };
          res.status(StatusCodes.OK).send(featureCollection);
        });
        // let roadFeatures: GeoJsonProperties[];
      }
    });

    this.osmRouter.get("/getCityBoundary", (req: Request, res: Response) => {
      const boundaryQuery = ServerUtils.buildBoundaryQuery();
      pool
        .query(boundaryQuery)
        .then((resp) => {
          const boundary = resp.rows[0];
          boundary.type = "Feature";
          res.status(StatusCodes.OK).send(boundary);
        })
        .catch((e) => console.error(e));
    });

    /*
    this.osmRouter.get("/getMask", async (req: Request, res: Response, next: NextFunction) => {
      const queryParam = req.query.filter;
      if (!queryParam) {
        //console.log("Something, somewhere went horribly wrong!");
        return res
          .status(INTERNAL_SERVER_ERROR)
          .send("Couldn't get the queryParameter, something might be wrong with the request!");
      }

      //TODO use the local pbf files with osmium or something like this?

      //const filePath = `./public/data/mask_${queryParam}.geojson`;
      const filePath = `./public/data/mask_${queryParam}`;

      try {
        //check if the file exists
        await fs.promises.access(filePath);
        // it does
        const pbfFile = await readFile(filePath);
        const geoBufMask = geobuf.decode(new Pbf(pbfFile));
        return res.status(OK).send(geoBufMask);

        //! vllt direkt eine URL schicken? sonst muss alles in data mit in den browser übertragen werden oder?
        //return res.status(OK).send(`../data/mask_${queryParam}.geojson`);
      } catch (error) {
        console.error("File does not exist: ", error);
        return res.status(INTERNAL_SERVER_ERROR).send("Mask File not found!");
      }
    });
    */
  }

  /*
  //Express middleware function to check Redis Cache
  checkCache = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const bounds = req.query.bounds?.toString();
    const query = req.query.osmQuery?.toString();

    if (bounds && query) {
      //TODO needs some major improvement! don't only check for exact key but instead check for overlap in bounds ?
      const compositeKey = (bounds + "/" + query).trim().toLowerCase();
      //Benchmark.startMeasure("Getting data from redis cache");
      const result = await RedisCache.fetchDataFromCache(compositeKey);
      //Benchmark.stopMeasure("Getting data from redis cache");

      if (result) {
        //console.log("Found in cache: \n", result);
        res.status(StatusCodes.OK).json(result);
      } else {
        //if not in cache proceed to next middleware function
        next();
      }
    }
  };

  //Express middleware function to check Redis Cache
  checkCachePostGIS = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const bounds = req.query.bounds?.toString();
    let conditions: string[] = [];
    if (typeof req.query.conditions === "string") {
      conditions = JSON.parse(req.query.conditions);
    }

    if (bounds && conditions) {
      //TODO needs some major improvement! don't only check for exact key but instead check for overlap in bounds ?
      const compositeKey = (bounds + "/" + conditions.join("") + ";")
        .replace(/ /g, "")
        .toLowerCase();

      //Benchmark.startMeasure("Getting data from redis cache");
      const result = await RedisCache.fetchDataFromCache(compositeKey);
      //Benchmark.stopMeasure("Getting data from redis cache");

      if (result) {
        //console.log("Found in cache: \n", result);
        res
          .status(StatusCodes.OK)
          .send({ type: "FeatureCollection", features: result });
      } else {
        //if not in cache proceed to next middleware function
        next();
      }
    }
  };
*/
  //! only works in linux
  /*
  testNodeOsmium(): void {
    console.time("read with osmium");

    const path = this.publicDirPath + "/assets/oberpfalz-latest.osm.pbf";
    const file = new osmium.File(path);
    const reader = new osmium.Reader(file, { node: true, way: true, relation: true });

    const handler = new osmium.Handler();
    //prettier-ignore
    handler.options({ "tagged_nodes_only": true });

    let count = 0;
    handler.on("node", (node: any) => {
      if (node.tags("park") || node.tags("amenity")) {
        console.log(node.tags());
        count++;
      }
    });
    handler.on("way", (way: any) => {
      if (way.tags("park") || way.tags("amenity")) {
        count++;
      }
    });
    handler.on("relation", (relation: any) => {
      if (relation.tags("park") || relation.tags("amenity")) {
        count++;
      }
    });

    // wird irgendwie nie aufgerufen
    // handler.on("done", function () {
    //   console.log("Found " + count + " parks and amenities!");

    //   console.timeEnd("read with osmium");
    // });

    osmium.apply(reader, handler);

    console.log("Found " + count + " parks and amenities!");

    console.timeEnd("read with osmium");
  }
  */
}
