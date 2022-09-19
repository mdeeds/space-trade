import { ParamSinkInterface } from "./paramSink";

export class FreqSink implements ParamSinkInterface {
  constructor() {
  }

  private sinks: AudioParam[] = [];
  connect(sink: AudioParam) {
    this.sinks.push(sink);
  }

  cancelScheduledValues(time: number): void {
    for (const sink of this.sinks) {
      sink.cancelScheduledValues(time);
    }
  }

  public static voltageToHz(volts: number): number {
    return 261.63 * Math.pow(2, volts);
  }

  public static hzToVoltage(hz: number): number {
    return Math.log2(hz / 261.63);
  }

  setValueAtTime(value: number, time: number): void {
    const outValue = FreqSink.voltageToHz(value);
    for (const sink of this.sinks) {
      sink.setValueAtTime(outValue, time);
    }
  }

  linearRampToValueAtTime(value: number, time: number): void {
    const outValue = FreqSink.voltageToHz(value);
    for (const sink of this.sinks) {
      sink.exponentialRampToValueAtTime(outValue, time);
    }
  }
}

