import { Mission } from "../mission";
import { Construction } from "../construction";

export class AsteroidFarmMission implements Mission {
  readonly title =
    "Set up a farm on an asteroid using resonance technology";
  readonly details = `
  Use resonance technology to set up a farm on an asteroid to help with 
  food production in space`;

  isComplete(c: Construction): boolean {
    return false;
  }
}