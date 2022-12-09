import axios from "axios";
import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import querystring from "querystring";

export const osmRouter = express.Router();

const buildOverpassQuery = (bounds: string, userQuery: string): string => {
  // output-format json, runtime of max. 25 seconds (needs to be higher for more complex queries) and global bounding box
  const querySettings = `[out:json][timeout:25][bbox:${bounds}];`;
  const output = "out geom qt;"; // use "qt" to sort by quadtile index (sorts by location and is faster than sort by id)
  const query = `${querySettings}(${userQuery});${output}`;
  //console.log(query);
  return query;
};

osmRouter.get("/osmRequestCache", (req: Request, res: Response) => {
  console.log("hello there");
  async () => {
    console.log("async");
    const bounds = req.query.bounds?.toString();
    const query = req.query.osmQuery?.toString();
    console.log(req.query);
    if (bounds && query) {
      // TODO show user some kind of progress information: progress bar or simply percentage / remaining time!
      //res.status(200).send("Got it! You sent: " + query + ",\n" + bounds);
      const osmQuery = buildOverpassQuery(bounds, query);

      try {
        const encodedQuery = querystring.stringify({ data: osmQuery });
        const geoData = await axios.get(
          `https://overpass-api.de/api/interpreter?${encodedQuery}`, // official overpass api (online version)
          //`http://localhost:${Config.OVERPASS_PORT}/api/interpreter?${encodedQuery}`, // local overpass api (docker image)
          //`http://localhost:${Config.OVERPASS_PORT}/api/interpreter?${encodedQuery}`, // hosted overpass api on project server
          { timeout: 12000 }
        );

        return res.status(StatusCodes.OK).json(geoData.data);
      } catch (error) {
        // if no response property on error (e.g. internal error), pass to error handler
        if (typeof error === "string") {
          res.send(error); // works, `e` narrowed to string
        } else if (error instanceof Error) {
          res.send(error);
        }
      }
    }
    res.end();
  };
});
