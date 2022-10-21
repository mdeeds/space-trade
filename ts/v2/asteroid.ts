import * as THREE from "three";
import { S } from "../settings";
import { Assets } from "./assets";
import { AstroGen } from "./astroGen";
import { Compounds } from "./compounds";
import { Controls, StartStopEvent, StartStopEventHandler } from "./controls";
import { Cursor } from "./cursor";

import { Codeable } from "./file";
import { Grid } from "./grid";
import { IsoTransform } from "./isoTransform";
import { MeshCollection } from "./meshCollection";
import { PointSet } from "./pointSet";
import { Sound } from "./sfx/sound";

export class Asteroid extends THREE.Object3D implements Codeable, PointSet {
  private meshCollection: MeshCollection;

  constructor(assets: Assets, controls: Controls,
    private cursors: Map<THREE.XRHandedness, Cursor>) {
    super();
    this.meshCollection = new MeshCollection(assets, S.float('as') * 1.2);
    this.add(this.meshCollection);

    controls.setStartStopCallback((ev: StartStopEvent) => {
      if (ev.state == 'start') {
        const pos = new IsoTransform();
        pos.copy(ev.worldPosition);
        this.worldToLocal(pos.position);
        Grid.round(pos.position);
        Grid.roundRotation(pos.quaternion);

        const cursor = cursors.get(ev.handedness);
        if (cursor.isHolding()) {
          this.handleDrop(pos, cursor, (ev.type == 'grip'));
          // this.sound.playOnObject(cursor, 'boop');
        } else {
          const removed = this.meshCollection.removeCube(pos.position);
          if (!removed && this.cursorsAreTogether()) {
            this.handleSplit();
          } else {
            cursor.setHold(removed);
          }
        }
      }
    });
  }

  private cursorsAreTogether(): boolean {
    const v = new THREE.Vector3();
    v.copy(this.cursors.get('left').position);
    v.sub(this.cursors.get('right').position);
    return v.length() < 0.20;
  }

  private handleSplit() {
    const left = this.cursors.get('left');
    const right = this.cursors.get('right');
    let item = left.getHold();
    if (!item) {
      item = right.getHold();
    }
    const [a, b] = this.compounds.break(item);
    if (a || b) {
      left.setHold(a);
      right.setHold(b);
    }
  }

  private compounds = new Compounds();

  private handleDrop(pos: IsoTransform, cursor: Cursor, removeFromHand: boolean = true) {
    if (!this.meshCollection.cubeAt(pos.position)) {
      this.meshCollection.addCube(cursor.getHold(), pos);
      if (removeFromHand) {
        cursor.setHold(null);
      }
    } else {
      const existingCube = this.meshCollection.get(pos.position);
      const combo = this.compounds.combine(existingCube, cursor.getHold());
      if (!!combo) {
        this.meshCollection.removeCube(pos.position);
        this.meshCollection.addCube(combo, pos);
        if (removeFromHand) {
          cursor.setHold(null);
        }
      }
    }
  }

  serialize(): Object {
    return this.meshCollection.serialize();
  }

  deserialize(serialized: Object): this {
    this.meshCollection.deserialize(serialized);
    return this;
  }

  fallback(p: THREE.Vector3) {
    const gen = new AstroGen(this.meshCollection);
    gen.buildAsteroid(S.float('as'), 0, 0, 0);
    this.meshCollection.buildGeometry();
    return this;
  }

  public getClosestDistance(p: THREE.Vector3): number {
    return this.meshCollection.getClosestDistance(p);
  }
}