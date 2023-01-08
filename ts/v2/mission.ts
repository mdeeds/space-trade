import { Construction } from "./construction";

export interface Mission {
  readonly title: string;
  readonly details: string;
  isComplete(c: Construction): boolean;
}