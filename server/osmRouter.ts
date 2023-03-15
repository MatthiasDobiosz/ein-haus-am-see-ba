import express, { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import * as ServerUtils from "./serverUtils.js";
import pgk from "pg";
import {
  Feature,
  FeatureCollection,
  Geometry,
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
      if (bounds && query && bufferValue) {
        // query for point table
        const pointQuery = ServerUtils.buildPostGISQueryWithBuffer(
          bounds,
          query,
          bufferValue,
          "points"
        );

        // query for ways table
        const wayQuery = ServerUtils.buildPostGISQueryWithBuffer(
          bounds,
          query,
          bufferValue,
          "ways"
        );

        // query for polygons table
        const polyQuery = ServerUtils.buildPostGISQueryWithBuffer(
          bounds,
          query,
          bufferValue,
          "polygons"
        );

        // query for relations table
        const relationsQuery = ServerUtils.buildPostGISQueryWithBuffer(
          bounds,
          query,
          bufferValue,
          "relations"
        );

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
      }
    });

    this.osmRouter.get("/postGISNoBuffer", (req: Request, res: Response) => {
      const bounds = req.query.bounds?.toString();
      const query = req.query.osmQuery?.toString();
      if (bounds && query) {
        const pointQuery = ServerUtils.buildPostGISQueryForPoi(
          bounds,
          query,
          "points"
        );

        const wayQuery = ServerUtils.buildPostGISQueryForPoi(
          bounds,
          query,
          "ways"
        );

        const polyQuery = ServerUtils.buildPostGISQueryForPoi(
          bounds,
          query,
          "polygons"
        );

        const relationsQuery = ServerUtils.buildPostGISQueryForPoi(
          bounds,
          query,
          "relations"
        );

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
          allFeatures.forEach((feature) => {
            feature.type = "Feature";
          });
          const featureCollection = {
            type: "FeatureCollection",
            features: allFeatures,
          };
          res.status(StatusCodes.OK).send(featureCollection);
        });
      }
    });
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
