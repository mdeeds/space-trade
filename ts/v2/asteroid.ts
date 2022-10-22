import * as THREE from "three";
import { MarchingCubes } from "../graphics/marchingCubes";
import { S } from "../settings";
import { Assets } from "./assets";
import { AstroGen } from "./astroGen";
import { Compounds } from "./compounds";
import { Controls, StartStopEvent, StartStopEventHandler } from "./controls";
import { Cursor } from "./cursor";

import { Codeable, File } from "./file";
import { Grid } from "./grid";
import { IsoTransform } from "./isoTransform";
import { MeshCollection } from "./meshCollection";
import { PointSet } from "./pointSet";
import { Sound } from "./sfx/sound";

export class Asteroid extends THREE.Object3D implements Codeable, PointSet {
  private meshCollection: MeshCollection;
  private surface: MarchingCubes = undefined;
  private surfaceMesh: THREE.Mesh;

  constructor(assets: Assets, controls: Controls,
    private cursors: Map<THREE.XRHandedness, Cursor>, private saveId: string) {
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
          if ((ev.type == 'grip')) {
            if (!removed && this.cursorsAreTogether()) {
              this.handleSplit();
            } else {
              cursor.setHold(removed);
            }
          }
        }
      }
      File.save(this, this.saveId);
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

  private buildCubes() {
    if (this.surfaceMesh) {
      this.remove(this.surfaceMesh);
    }
    const radius = 10.0;
    const partitions = radius * 2;
    const center = new THREE.Vector3(0, 0, 0);
    this.surface = new MarchingCubes((pos: THREE.Vector3) => {
      // TODO look into this.meshCollection, return 1 if it's inside.
      return pos.length() - 8.0;
    }, radius, center, partitions);
    this.surfaceMesh = new THREE.Mesh(
      this.surface, new THREE.MeshPhongMaterial({ color: '#fdd' })
    );
    this.add(this.surfaceMesh);
  }

  serialize(): Object {
    return this.meshCollection.serialize();
  }

  deserialize(serialized: Object): this {
    this.meshCollection.deserialize(serialized);
    // this.buildCubes();
    return this;
  }

  fallback(p: THREE.Vector3) {
    const gen = new AstroGen(this.meshCollection);
    gen.buildAsteroid(S.float('as'), 0, 0, 0);
    this.meshCollection.buildGeometry();
    // this.buildCubes();
    return this;
  }

  public getClosestDistance(p: THREE.Vector3): number {
    return this.meshCollection.getClosestDistance(p);
  }
}