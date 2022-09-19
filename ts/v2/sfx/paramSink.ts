export interface ParamSinkInterface {
  cancelScheduledValues(time: number): void;
  setValueAtTime(value: number, time: number): void;
  linearRampToValueAtTime(value: number, time: number): void;
}

export type ParamSink = AudioParam | ParamSinkInterface;
