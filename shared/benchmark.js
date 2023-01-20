import Benchmark from "benchmark";
import axios from "../client/src/network/axiosInterceptor";

let suite = new Benchmark.Suite();

suite
  .add("Test1", () => {
    /o/.test("Hello World!");
  })
  .on("cycle", (event) => {
    console.log(String(event.target));
  })
  .on("complete", () => {
    console.log("Done with the test");
  })
  .add("PostGIS Restaurant 500m", async () => {
    const data = await axios.get(
      "/testdb?bounds=11.93691490881318+49.06334045685992%2C12.266333091186453+49.06334045685992%2C12.266333091186453+48.963473458586435%2C11.93691490881318+48.963473458586435%2C11.93691490881318+49.06334045685992&conditions=%5B%22subclass%20%3D%20'restaurant'%22%5D"
    );
    console.log(data);
  })
  .on("cycle", (event) => {
    console.log(String(event.target));
  })
  .run();
