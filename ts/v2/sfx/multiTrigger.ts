import { TriggerInterface } from "./triggerInterface";

export class MultiTrigger implements TriggerInterface {
  constructor(private triggers: TriggerInterface[]) {
  }

  trigger(triggerTime: number, secondsPerMeasure: number): void {
    for (const t of this.triggers) {
      t.trigger(triggerTime, secondsPerMeasure);
    }
  }
}