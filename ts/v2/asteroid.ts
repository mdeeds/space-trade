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
import { Composition } from "./composition";

export class Asteroid extends Composition implements Codeable, PointSet {
  private surface: MarchingCubes = undefined;
  private surfaceMesh: THREE.Mesh;

  constructor(assets: Assets, controls: Controls,
    cursors: Map<THREE.XRHandedness, Cursor>, saveId: string) {
    super(assets, controls, cursors, saveId);
    super.name = saveId;
  }

  private async buildCubes() {
    if (this.surfaceMesh) {
      super.remove(this.surfaceMesh);
    }
    const radius = 10.0;
    const sdf = new MeshSdf(this);
    if (S.float('mcs') > 0) {
      // TODO: ideally we don't have to clone the Marching Cubes
      // when we merge the Vertices.  Probably best to make MarchingCubes
      // some sort of factory instead of an Object itself.
      // I.e. MarchingCubs *has a* Mesh; not Marching cubes *is a* mesh.
      this.surface = new MarchingCubes(sdf.getSdf(), sdf.getColorF(), radius, S.float('mcs'));
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
    return super.getMeshCollection().serialize();
  }

  deserialize(serialized: Object): this {
    super.getMeshCollection().deserialize(serialized);
    this.buildCubes();
    return this;
  }

  fallback(p: THREE.Vector3) {
    const gen = new AstroGen(super.getMeshCollection());
    gen.buildAsteroid(S.float('as'), 0, 0, 0);
    super.getMeshCollection().buildGeometry();
    this.buildCubes();
    return this;
  }
}