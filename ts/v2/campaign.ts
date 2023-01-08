import { Mission } from "./mission";
import { AsteroidFarmMission } from "./missions/farmMission1";

export class Campaign {
  private missions: Mission[] = [];
  constructor() {
    this.missions.push(new AsteroidFarmMission());
  }

  // TODO: Create accessors.
}