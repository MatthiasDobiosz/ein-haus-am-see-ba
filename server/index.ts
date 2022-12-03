import express, { Express, Request, Response } from "express";
import {
  endPerformanceMeasure,
  evaluateMeasure,
  startPerformanceMeasure,
} from "../shared/benchmarking.js";

const port = 3200;

const app: Express = express();

app.get("/test", (req: Request, res: Response) => {
  startPerformanceMeasure("server");
  let j = 0;
  for (let i = 0; i < 1000000; i++) {
    j += i;
  }
  console.log(j);
  endPerformanceMeasure("server");
  evaluateMeasure();
  res.send({ message: "Hello" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
