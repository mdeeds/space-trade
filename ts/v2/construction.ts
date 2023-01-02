import { IsoTransform } from "./isoTransform";

export class Cubie {
  constructor(
    readonly name: string,
    readonly tx: IsoTransform) { }
}

export interface Construction {
  // Adds an object to this collection.
  addCube(name: string, tx: IsoTransform): void;
  addCubie(cube: Cubie): void;
  cubeAt(p: THREE.Vector3): boolean;
  getCubeAt(p: THREE.Vector3): string;
  getCubes(): Iterable<[THREE.Vector3, string]>;
  getCubies(): Iterable<[THREE.Vector3, Cubie]>;
  removeCubie(position: THREE.Vector3): Cubie;
}
