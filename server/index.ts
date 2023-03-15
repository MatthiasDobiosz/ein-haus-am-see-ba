/* eslint-env node */

import { Config } from "../shared/config.js";
import Server from "./server.js";
//import open from "open";

function init(): void {
  const serverPort = Config.SERVER_PORT; // port to use for the express server and for serving static files
  const server = new Server(serverPort);
  server.start();

  // open the website automatically
  //open(`http://localhost:${serverPort}`);
}

init();
