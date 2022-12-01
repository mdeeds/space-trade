import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { Assets } from "./assets";
import { AstroGen } from "./astroGen";
import { Codeable, File } from "./file";
import { Compounds } from "./compounds";
import { Controls, StartStopEvent } from "./controls";
import { Cursor } from "./cursor";
import { Grid } from "./grid";
import { IsoTransform } from "./isoTransform";
import { MarchingCubes } from "../graphics/marchingCubes";
import { MeshCollection } from "./meshCollection";
import { MeshSdf } from "./meshSdf";
import { PointSet } from "./pointSet";
import { S } from "../settings";
import { AsteroidMaterial } from "./asteroidMaterial";

export class Asteroid extends THREE.Object3D implements Codeable, PointSet {
  private meshCollection: MeshCollection;
  private surface: MarchingCubes = undefined;
  private surfaceMesh: THREE.Mesh;

  constructor(assets: Assets, controls: Controls,
    private cursors: Map<THREE.XRHandedness, Cursor>, private saveId: string) {
    super();
    this.name = saveId;
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

  private async buildCubes() {
    if (this.surfaceMesh) {
      this.remove(this.surfaceMesh);
    }
    const radius = 10.0;
    const sdf = new MeshSdf(this.meshCollection);
    if (S.float('mcs') > 0) {
      this.surface = new MarchingCubes(sdf.getSdf(), radius, S.float('mcs'));
      this.surface = BufferGeometryUtils.mergeVertices(this.surface, 0.01);
      this.surface.computeVertexNormals();
      this.surfaceMesh = new THREE.Mesh(
        this.surface, await AsteroidMaterial.make(new THREE.Color('#fdd'))
      );
      this.surfaceMesh.geometry.computeBoundingSphere();
      this.surfaceMesh.geometry.computeBoundingBox();
      this.add(this.surfaceMesh);
    }
    return;
  }

  serialize(): Object {
    return this.meshCollection.serialize();
  }

  deserialize(serialized: Object): this {
    this.meshCollection.deserialize(serialized);
    this.buildCubes();
    return this;
  }

  fallback(p: THREE.Vector3) {
    const gen = new AstroGen(this.meshCollection);
    gen.buildAsteroid(S.float('as'), 0, 0, 0);
    this.meshCollection.buildGeometry();
    this.buildCubes();
    return this;
  }

  public getClosestDistance(p: THREE.Vector3): number {
    return this.meshCollection.getClosestDistance(p);
  }
}