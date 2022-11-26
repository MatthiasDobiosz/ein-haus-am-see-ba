import express, { Express, Request, Response } from "express";

const port = 3200;

const app: Express = express();

app.get("/test", (req: Request, res: Response) => {
  res.send({ message: "hello" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
