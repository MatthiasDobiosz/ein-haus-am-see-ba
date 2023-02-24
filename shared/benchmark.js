import Benchmark from "benchmark";
import axios from "./axiosInter.js";

let suite = new Benchmark.Suite();

suite
  .add("Restaurant 500m (PostGIS)", {
    defer: true,
    fn: async function (deferred) {
      const data = await axios.get(
        "http://localhost:3202/postGIS?bounds=11.93691490881318+49.06334045685992%2C12.266333091186453+49.06334045685992%2C12.266333091186453+48.963473458586435%2C11.93691490881318+48.963473458586435%2C11.93691490881318+49.06334045685992&conditions=%5B%22subclass%20%3D%20'river'%22%5D"
      );
      deferred.resolve();
    },
  })
  .on("cycle", (event) => {
    console.log(String(event.target));
  })
  .add("Restaurant 500m (Overpass)", {
    defer: true,
    fn: async function (deferred) {
      const data = await axios.get(
        "http://localhost:3202/osmRequestCache?bounds=48.95897687001247%2C11.93005221880167%2C49.06783704542032%2C12.273195781197964&osmQuery=nwr%5B%22waterway%22%3D%22river%22%5D%3B"
      );
      deferred.resolve();
    },
  })
  .on("cycle", (event) => {
    console.log(String(event.target));
  })
  .run();
