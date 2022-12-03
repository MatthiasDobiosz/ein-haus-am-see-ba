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
  .run();
