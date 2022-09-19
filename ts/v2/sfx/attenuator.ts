import { ParamSink, ParamSinkInterface } from "./paramSink";

export class Attenuator implements ParamSinkInterface {
  // Offset is applied after gain.
  // i.e. out = offset + in * gain
  constructor(private gain: number, private offset: number) {
  }

  private sinks: ParamSink[] = [];
  connect(sink: ParamSink): ParamSink {
    this.sinks.push(sink);
    return sink;
  }

  cancelScheduledValues(time: number): void {
    for (const sink of this.sinks) {
      sink.cancelScheduledValues(time);
    }
  }

  setValueAtTime(value: number, time: number): void {
    const outValue = this.offset + value * this.gain;
    for (const sink of this.sinks) {
      sink.setValueAtTime(outValue, time);
    }
  }

  linearRampToValueAtTime(value: number, time: number): void {
    const outValue = (value + this.offset) * this.gain;
    for (const sink of this.sinks) {
      sink.linearRampToValueAtTime(outValue, time);
    }
  }
  exponentialRampToValueAtTime(value: number, time: number): void {
    const outValue = (value + this.offset) * this.gain;
    for (const sink of this.sinks) {
      sink.linearRampToValueAtTime(outValue, time);
    }
  }
}

