import * as hdr from "hdr-histogram-js";

type Mark = string & { _kind: "mark" };
type Flow = { name: string; startMark: Mark; endMark: Mark; histogram: hdr.Histogram };
type Timing = number;

const invariant = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export class Benchmark {
  private static instance: Benchmark;

  private state: "empty" | "building" | "warming" | "recording" = "empty";

  private marks = new Set<Mark>();
  private flows: Flow[] = [];

  private timings = new Map<Mark, Timing>();

  private constructor() {}

  public static getInstance(): Benchmark {
    if (!Benchmark.instance) {
      Benchmark.instance = new Benchmark();
    }
    return Benchmark.instance;
  }

  benchmark(fn: Function, warmupExamples: number, recordingExamples: number) {
    this.startWarmingUp();
    for (let i = 0; i < warmupExamples; i++) {
      this.startExample();
      fn();
    }

    this.startRecording();
    for (let i = 0; i < recordingExamples; i++) {
      this.startExample();
      fn();
    }

    return this.getResults();
  }

  addMark(name: string) {
    if (this.state === "empty") {
      this.state = "building";
    }
    invariant(this.state === "building", "Cannot add mark while warming or recording");
    this.marks.add(name as Mark);
  }

  private buildHistogram() {
    return hdr.build();
  }

  addFlow(name: string, startMark: string, endMark: string) {
    invariant(this.state === "building", "Cannot add flow while warming or recording");

    if (!this.marks.has(startMark as Mark)) {
      throw new Error(`Mark ${startMark} not found`);
    }

    invariant(this.marks.has(startMark as Mark), `Mark ${startMark} not found`);
    invariant(this.marks.has(endMark as Mark), `Mark ${endMark} not found`);

    invariant(
      this.flows.find((f) => f.startMark === startMark && f.endMark === endMark) === undefined,
      `Flow ${startMark} -> ${endMark} already exists`
    );

    const histogram = this.buildHistogram();

    this.flows.push({
      name: name,
      startMark: startMark as Mark,
      endMark: endMark as Mark,
      histogram,
    });
  }

  startWarmingUp() {
    this.state = "warming";

    invariant(this.marks.size > 0, "No marks added");
    invariant(this.flows.length > 0, "No flows added");

    const connectedMarks = new Set<Mark>();
    for (const flow of this.flows) {
      connectedMarks.add(flow.startMark);
      connectedMarks.add(flow.endMark);
    }

    const unconnectedMarks = [...this.marks].filter((m) => !connectedMarks.has(m));
    invariant(unconnectedMarks.length === 0, "Unconnected marks: " + unconnectedMarks.join(", "));
  }

  startRecording() {
    this.state = "recording";
  }

  startExample() {
    invariant(this.state !== "building", "Cannot add example while building");
    for (const mark of this.marks) {
      this.timings.set(mark, 0);
    }
  }

  time(): number {
    const [seconds, nanoseconds] = process.hrtime();
    return seconds * 1000 + nanoseconds / 1000000;
  }

  recordMark(name: string) {
    if (this.state === "empty") {
      return;
    }

    invariant(this.state !== "building", "Cannot add mark while building");
    invariant(this.marks.has(name as Mark), `Mark ${name} not found`);

    if (this.state === "warming") {
      return;
    }

    this.timings.set(name as Mark, this.time());

    const finishedFlows = this.flows.filter((f) => f.endMark === name);
    if (finishedFlows.length > 0) {
      for (const flow of finishedFlows) {
        const start = this.timings.get(flow.startMark)!;
        const end = this.timings.get(flow.endMark)!;
        flow.histogram.recordValue((end - start) * 1_000_000);
      }
    }
  }

  getResults(): string {
    invariant(this.state !== "building", "Cannot get results while building");

    const interestingFlows = this.flows.filter((f) => f.histogram.totalCount > 0);

    const results: string[] = [];
    for (const flow of interestingFlows) {
      results.push(flow.name);
      results.push(flow.histogram.toString());
      results.push(flow.histogram.outputPercentileDistribution());
    }

    return results.join("\n");
  }

  saveResults(directory: string) {
    invariant(this.state !== "building", "Cannot save results while building");

    const interestingFlows = this.flows.filter((f) => f.histogram.totalCount > 0);

    for (const flow of interestingFlows) {
      const percentileDistrtibution = flow.histogram.outputPercentileDistribution();
      Bun.write(directory + "/" + flow.name + ".tsv", percentileDistrtibution);
    }
  }
}
