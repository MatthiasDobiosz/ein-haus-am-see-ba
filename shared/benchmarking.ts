/**
 * Measurement interface
 *
 * @interface Measurement
 * @field name - the name of the measurement process
 * @field duration - the duration of the measured process
 * @field count - the number of times the process was measured
 */
interface measurement {
  name: string;
  duration: number;
  count: number;
}

/**
 * Starts the measuring timer
 * @param name - The name of the process to measure
 */
export const startPerformanceMeasure = (name: string): void => {
  performance.mark(`start:${name}`);
};

/**
 * Ends the measuring timer
 * @param name - The name of the process to measure
 */
export const endPerformanceMeasure = (name: string): void => {
  performance.mark(`end:${name}`);
  performance.measure(name, `start:${name}`, `end:${name}`);
};

/**
 * logs all measured processes
 */
export const evaluateMeasure = (): void => {
  const measures = avergageMeasures(performance.getEntriesByType("measure"));
  for (let i = 0; i < measures.length; i++) {
    console.log(
      `Average Time meassured for the process "${measures[i].name}": ${
        measures[i].duration * 1000
      }ms over ${measures[i].count} iterations`
    );
  }
};

/**
 * Averages all saved measurements by name
 * @param measureEntries - List of Performance Entries
 * @returns - array of duration objects
 */
const avergageMeasures = (
  measureEntries: PerformanceEntryList
): measurement[] => {
  return (
    [
      ...measureEntries
        // get list of names/durations
        .reduce(
          (map, { name, duration }) =>
            map.set(name, [...(map.get(name) || []), duration]),
          new Map<string, number[]>()
        ),
    ]
      // get list of name/average
      .map(([name, durations]: [string, number[]]) => ({
        name,
        duration:
          durations.reduce((sum: number, val: number) => sum + val, 0) /
          durations.length,
        count: durations.length,
      }))
  );
};
