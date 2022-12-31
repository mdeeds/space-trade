import * as THREE from "three";

export class Vector3Map<T> {
  private objectMap: Map<THREE.Vector3, T>;
  private map: Map<string, T>;

  constructor() {
    this.map = new Map<string, T>();
    this.objectMap = new Map<THREE.Vector3, T>();
  }

  public set(key: THREE.Vector3, value: T): void {
    const stringKey = `${key.x},${key.y},${key.z}`;
    this.map.set(stringKey, value);
    this.objectMap.set(key, value);
  }

  public get(key: THREE.Vector3): T | undefined {
    const tmp = this.objectMap.get(key);
    if (!!tmp) return tmp;
    const stringKey = `${key.x},${key.y},${key.z}`;
    return this.map.get(stringKey);
  }

  public has(key: THREE.Vector3): boolean {
    if (this.objectMap.has(key)) return true;
    const stringKey = `${key.x},${key.y},${key.z}`;
    return this.map.has(stringKey);
  }

  public delete(key: THREE.Vector3): boolean {
    const stringKey = `${key.x},${key.y},${key.z}`;

    var toDelete: THREE.Vector3 = undefined;
    for (const [k, v] of this.objectMap.entries()) {
      if (k.x == key.x && k.y == key.y && k.z == key.z) {
        toDelete = k;
        break;
      }
    }
    if (!!toDelete) {
      this.objectMap.delete(toDelete);
    }
    return this.map.delete(stringKey);
  }

  public entries(): Iterable<[string, T]> {
    return this.map.entries();
  }

  public clear(): void {
    this.map.clear();
  }
}