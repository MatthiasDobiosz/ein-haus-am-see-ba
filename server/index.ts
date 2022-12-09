import express, { Express, Request, Response } from "express";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import querystring from "querystring";

const port = 3200;
const app: Express = express();

// handle crashes
process.on("uncaughtException", (e) => {
  console.log(e);
  process.exit(1);
});

process.on("unhandledRejection", (e) => {
  console.log(e);
  process.exit(1);
});

/*
const staticDir = path.join(__dirname, "../", "client"); // folder with client files
const publicDir = path.join(__dirname, "../", "public"); // folder with static files

// compress routes for performance improvement
app.use(compression());

// basic security
app.use(helmet());

// enable request body parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*
app.use(express.static(staticDir));
app.use(express.static(publicDir));
*/

const buildOverpassQuery = (bounds: string, userQuery: string): string => {
  // output-format json, runtime of max. 25 seconds (needs to be higher for more complex queries) and global bounding box
  const querySettings = `[out:json][timeout:25][bbox:${bounds}];`;
  const output = "out geom qt;"; // use "qt" to sort by quadtile index (sorts by location and is faster than sort by id)
  const query = `${querySettings}(${userQuery});${output}`;
  //console.log(query);
  return query;
};

app.get("/osmRequestCache", async (req: Request, res: Response) => {
  console.log("hello there");
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
      console.log(error);
    }
  }
  res.send({ message: "hey" });
});

app.listen(port, () => {
  console.log(`Backend Server running on port ${port}`);
});
