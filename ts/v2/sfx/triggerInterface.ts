export interface TriggerInterface {
  // Triggers the sound effect
  trigger(triggerTime: number, secondsPerMeasure: number): void;
}

export interface HasNode {
  // The AudioNode which produces the effect.
  getNode(): AudioNode;
}

export type TriggerNode = TriggerInterface & HasNode;