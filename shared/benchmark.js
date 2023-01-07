import Benchmark from "benchmark";

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
  .add("for-schleife", () => {
    for (let i = 0; i < 100000; i++) {
      i++;
    }
  })
  .on("cycle", (event) => {
    console.log(String(event.target));
  })
  .add("basic overpass API request test1", async () => {
    const encodedQuery =
      "data=%5Bout%3Ajson%5D%5Btimeout%3A25%5D%5Bbbox%3A48.958976863957574%2C11.973396716484501%2C49.067837051478875%2C12.229851283515359%5D%3B(nwr%5B%22leisure%22~%22%5Epark%7Cnature_reserve%24%22%5D%3B%20nwr%5B%22landuse%22~%22%5Evillage_green%7Crecreation_ground%24%22%5D%3B)%3Bout%20geom%20qt%3B";
    const geoData = await axios.get(
      `https://overpass-api.de/api/interpreter?${encodedQuery}`, // official overpass api (online version)
      //`http://localhost:${Config.OVERPASS_PORT}/api/interpreter?${encodedQuery}`, // local overpass api (docker image)
      //`http://localhost:${Config.OVERPASS_PORT}/api/interpreter?${encodedQuery}`, // hosted overpass api on project server
      { timeout: 12000 }
    );
    console.log(geoData);
  })
  .on("cycle", (event) => {
    console.log(String(event.target));
  })
  .run();
