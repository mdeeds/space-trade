import * as THREE from "three";
import { IsoTransform } from "./isoTransform";
import { LocationMap } from "./locationMap";
import { SimpleLocationMap } from "./simpleLocationMap";

export class TxAnd<T> {
  constructor(readonly pos: THREE.Vector3, readonly value: T) { }
}

export class NeighborCount {
  constructor() { }

  // TODO: Change this to a latice of numbers ???
  private neighborCount = new SimpleLocationMap<number>();
  private data = new SimpleLocationMap<TxAnd<string>>();

  // The number of this value in the map.  E.g. number of 'salt' blocks.
  private valueCount = new Map<string, number>();

  private addOrChange3(x: number, y: number, z: number,
    m: LocationMap<number>, delta: number) {
    if (m.has3(x, y, z)) {
      m.set3(x, y, z, m.get3(x, y, z) + delta);
    } else {
      m.set3(x, y, z, Math.max(0, delta));
    }
  }

  private addOrChange(key: string, m: Map<string, number>, delta: number) {
    if (m.has(key)) {
      m.set(key, m.get(key) + delta);
    } else {
      m.set(key, Math.max(0, delta));
    }
  }

  private applyDelta(tx: THREE.Vector3, delta: number) {
    this.addOrChange3(
      tx.x, tx.y, tx.z + 1,
      this.neighborCount, delta);
    this.addOrChange3(
      tx.x, tx.y, tx.z - 1,
      this.neighborCount, delta);
    this.addOrChange3(
      tx.x, tx.y + 1, tx.z,
      this.neighborCount, delta);
    this.addOrChange3(
      tx.x, tx.y - 1, tx.z,
      this.neighborCount, delta);
    this.addOrChange3(
      tx.x + 1, tx.y, tx.z,
      this.neighborCount, delta);
    this.addOrChange3(
      tx.x - 1, tx.y, tx.z,
      this.neighborCount, delta);
  }

  public set(pos: THREE.Vector3, value: string) {
    const hasKey = this.data.has(pos);
    this.data.set(pos, new TxAnd<string>(pos, value));
    if (hasKey) {
      const prevValue = this.data.get(pos).value;
      this.addOrChange(prevValue, this.valueCount, -1);
    } else {
      this.applyDelta(pos, 1);
    }
    this.addOrChange(value, this.valueCount, 1);
  }

  public delete(tx: THREE.Vector3) {
    if (this.data.delete(tx)) this.applyDelta(tx, -1);
  }

  public getCount(value: string): number {
    return this.valueCount.get(value) || 0;
  }

  public * allElements() {
    yield* this.data.values();
  }

  public * externalElements() {
    console.log(`Enumerating neighbor count...`);
    for (const [key, matrixAndT] of this.data.entries()) {
      const count = this.neighborCount.get(key);
      if (!count || count < 6) {
        yield matrixAndT;
      }
    }
  }
}