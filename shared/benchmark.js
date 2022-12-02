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
  .run();
