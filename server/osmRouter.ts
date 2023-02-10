import axios from "axios";
import express, { NextFunction, Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import querystring from "querystring";
import * as ServerUtils from "./serverUtils.js";
import RedisCache from "./redisCache.js";

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
    /**
     * * Forwards the query and the bounds to the overpass api and returns and caches the result.
     * * Also checks the redis cache first before sending requerst to overpass api to prevent unnecessary requests.
     */
    this.osmRouter.get(
      "/osmRequestCache",
      this.checkCache,
      async (req: Request, res: Response, next: NextFunction) => {
        const bounds = req.query.bounds?.toString();
        const query = req.query.osmQuery?.toString();

        if (bounds && query) {
          // TODO show user some kind of progress information: progress bar or simply percentage / remaining time!
          //res.status(200).send("Got it! You sent: " + query + ",\n" + bounds);
          const compositeKey = (bounds + "/" + query).trim().toLowerCase();
          const osmQuery = ServerUtils.buildOverpassQuery(bounds, query);

          try {
            const encodedQuery = querystring.stringify({ data: osmQuery });
            //console.log(encodedQuery);
            const geoData = await axios.get(
              // `https://overpass-api.de/api/interpreter?${encodedQuery}`, // official overpass api (online version)
              `http://localhost:12346/api/interpreter?${encodedQuery}`, // local overpass api (docker image)
              //`http://localhost:${Config.OVERPASS_PORT}/api/interpreter?${encodedQuery}`, // hosted overpass api on project server
              { timeout: 12000 }
            );
            //console.log(geoData.data);
            //console.log(geoData.data.elements.length);

            //* remove tags as we don't need them on the frontend (small performance improvement)
            geoData.data.elements.forEach((el: any) => {
              el.tags = {};
            });

            // cache data for one hour, this should be enough for a typical usecase
            const cacheTime = 3600;
            //! cache only for 15 minutes during study to prevent influencing the next participant!
            //const cacheTime = 900;
            RedisCache.cacheData(compositeKey, geoData.data, cacheTime);

            //this.saveGeoData(geoData.data, query);
            return res.status(StatusCodes.OK).json(geoData.data);
          } catch (error: any) {
            if (error.response) {
              // send error status to client
              return res
                .status(error.response.status)
                .send(error.response.statusText);
            }
            // if no response property on error (e.g. internal error), pass to error handler
            return next(error);
          }
        }
        return res.end();
      }
    );

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
