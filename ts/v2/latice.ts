import * as THREE from "three";

export class LaticeEntry<T> {
  constructor(readonly position: THREE.Vector3, readonly value: T) { }
}

export class Latice<T> {
  private keyToCode = new Map<T, number>();
  private codeToKey = new Map<number, T>();
  private keyCount = new Map<T, number>();

  readonly origin = new THREE.Vector3();
  private data: Uint8Array;

  // `origin` is the lower left corner of the region in space.
  // `edgeSize` is the number of buckets.  So, if you want a cube 
  // centered at the origin with a radius of 10, you would specify:
  // new Latice<YourType>(new THRE.Vector3(-10, -10, -10), 21);
  // This allows for positions from -10 to +10 (inclusive) which
  // is a total of 21 positions.
  constructor(origin: THREE.Vector3, private edgeSize: number) {
    this.origin.copy(origin);
    this.data = new Uint8Array(edgeSize * edgeSize * edgeSize);
    this.codeToKey.set(0, null);
  }

  private getIndex(x: number, y: number, z: number): number {
    return x + y * this.edgeSize + z * this.edgeSize * this.edgeSize;
  }

  private getIndexFromVector(v: THREE.Vector3) {
    return this.getIndex(
      Math.round(v.x), Math.round(v.y), Math.round(v.z));
  }

  Get(pos: THREE.Vector3): T {
    const index = this.getIndexFromVector(pos);
    return this.codeToKey.get(this.data[index]);
  }

  Set(pos: THREE.Vector3, value: T) {
    let code: number;
    const index = this.getIndexFromVector(pos);
    if (this.data[index] > 0) {
      // TODO: decrement counter.
    }
    if (!this.keyToCode.has(value)) {
      code = this.codeToKey.size;
      this.keyToCode.set(value, code);
      this.codeToKey.set(code, value);
      this.keyCount.set(value, 1);
    } else {
      code = this.keyToCode.get(value);
      this.keyCount.set(value, this.keyCount.get(value) + 1);
    }
    this.data[index] = code;
  }

  * Entries(): Iterable<LaticeEntry<T>> {
    for (let z = 0; z < this.edgeSize; ++z) {
      for (let y = 0; y < this.edgeSize; ++y) {
        let index = this.getIndex(0, y, z);
        for (let x = 0; x < this.edgeSize; ++x) {
          const code = this.data[index];
          if (code != 0) {
            const pos = new THREE.Vector3(x, y, z);
            pos.add(this.origin);
            yield new LaticeEntry(pos, this.codeToKey.get(code));
          }
          ++index;
        }
      }
    }
  }
}
