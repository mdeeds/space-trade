import { Log } from "../log";
import { ParamSink, ParamSinkInterface } from "./paramSink";
import { TriggerInterface } from "./triggerInterface";

export class Automation implements TriggerInterface {
  // Time offsets for values in series. These are measured in subdivisions.
  private offset: number[] = [];
  private series: number[] = [];

  // `subdivisions`: 8 = eigth notes.
  private constructor(private subdivisions: number) {
  }

  static makeRamps(series: string, subdivisions: number): Automation {
    const result = new Automation(subdivisions);
    let offset = 0;
    for (let i = 0; i < series.length; ++i) {
      let hasValue = true;
      switch (series[i]) {
        case '0': result.series.push(-5); break;
        case '1': result.series.push(-4); break;
        case '2': result.series.push(-3); break;
        case '3': result.series.push(-2); break;
        case '4': result.series.push(-1); break;
        case '5': result.series.push(0); break;
        case '6': result.series.push(1); break;
        case '7': result.series.push(2); break;
        case '8': result.series.push(3); break;
        case '9': result.series.push(4); break;
        case 'a': result.series.push(5); break;
        default: hasValue = false; break;
      }
      if (hasValue) {
        result.offset.push(offset);
      }
      offset += 1 / result.subdivisions;
    }
    return result
  }

  static makeGate(subdivisions: number): Automation {
    const result = new Automation(subdivisions);
    result.series.push(0, 1, 1, 0);
    result.offset.push(0, 0.01, 0.99, 1);
    return result;
  }

  private sinks: ParamSink[] = [];

  connect(sink: ParamSink): ParamSink {
    this.sinks.push(sink);
    return sink;
  }

  public trigger(triggerTime: number, secondsPerMeasure: number) {
    for (const param of this.sinks) {
      const delta = secondsPerMeasure / this.subdivisions;
      param.cancelScheduledValues(triggerTime);
      param.setValueAtTime(this.series[0], triggerTime);
      for (let i = 1; i < this.series.length; ++i) {
        if (this.series[i] != undefined) {
          const eventTime = triggerTime + delta * this.offset[i];
          param.linearRampToValueAtTime(this.series[i], eventTime);
        }
      }
    }
  }
}

