export interface AudioTrigger {
  trigger(time: number): void;
  release(time: number): void;
}