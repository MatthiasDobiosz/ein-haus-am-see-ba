/* eslint-env node */
import bodyParser from "body-parser";
import compression from "compression";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";
import OsmRouter from "./osmRouter.js";

// handle crashes
process.on("uncaughtException", (e) => {
  console.log(e);
  process.exit(1);
});

process.on("unhandledRejection", (e) => {
  console.log(e);
  process.exit(1);
});

export default class Server {
  // Init express
  private readonly app: express.Application = express();
  private port: number;

  constructor(serverPort: number) {
    this.port = serverPort;

    this.setupExpressApp();
    this.setupRoutes();

    // error handling must be at the end!
    this.setupErrorHandling();
  }

  setupExpressApp(): void {
    //compress all routes to improve performance
    this.app.use(compression());

    // add basic security
    this.app.use(helmet());

    // enable request body parsing
    this.app.use(bodyParser.urlencoded({ extended: true }));
    //this.app.use(bodyParser.text());
    this.app.use(bodyParser.json());
  }

  setupRoutes(): void {
    const osmRouter = new OsmRouter();
    // mount the routes with the prefix "osm"
    //this.app.use("/osm", osmRouter);
    this.app.use(osmRouter.instance);
  }

  setupErrorHandling(): void {
    this.app.use(this.errorHandler);

    // catch 404; this must be the last handler this.app uses!
    this.app.use(function (req, res, next) {
      res.status(StatusCodes.NOT_FOUND);
      // respond with json
      if (req.accepts("json")) {
        res.send({ error: "Not found" });
        return;
      }
      // default to plain-text
      res.type("txt").send("Not found");
    });
  }

  errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): Response<Error> | void => {
    if (res.headersSent) {
      return next(err);
    }
    console.log(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send(err);
  };

  /**
   * Start the express server on the given port.
   */
  start(): void {
    const server = this.app.listen(this.port, () => {
      console.log(
        `⚡️[server]: Server is running at http://localhost:${this.port}`
      );
    });
  }
}
