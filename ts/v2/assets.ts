import * as THREE from "three";

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Log } from "./log";

export class Assets {
  private constructor(private namedMeshes: Map<string, THREE.Mesh>) { }

  public *names() {
    yield* this.namedMeshes.keys();
  }

  public getMesh(name: string) {
    if (!this.namedMeshes.has(name)) {
      throw new Error(`Not found: ${name}`);
    }
    return this.namedMeshes.get(name);
  }

  private static findFirstMesh(o: THREE.Object3D): THREE.Mesh {
    const tmpMatrix = new THREE.Matrix4();
    if (o.type === "Mesh") {
      // console.log(`Mesh found: ${o.name}`);
      const matrix = new THREE.Matrix4();
      matrix.identity();
      let cursor = o;
      while (cursor != null) {
        tmpMatrix.compose(cursor.position, cursor.quaternion, cursor.scale);
        matrix.premultiply(tmpMatrix);
        cursor = cursor.parent;
      }
      o.matrix.copy(matrix);
      o.matrix.decompose(o.position, o.quaternion, o.scale);
      return o as THREE.Mesh;
    }
    for (const child of o.children) {
      const mesh = Assets.findFirstMesh(child);
      if (!!mesh) { return mesh; }
    }
    return null;
  }

  private static async loadMeshFromModel(filename: string): Promise<THREE.Mesh> {
    const loader = new GLTFLoader();
    return new Promise<THREE.Mesh>((resolve, reject) => {
      loader.load(filename, (gltf) => {
        resolve(Assets.findFirstMesh(gltf.scene));
      });
    });
  }

  public static async load(): Promise<Assets> {
    const namedMeshes = new Map<string, THREE.Mesh>();
    const modelNames = [
      'borosilicate',
      'carbon-chondrite',
      'carbon-fiber-corner',
      'carbon-fiber-cube',
      'carbon-fiber-wedge',
      'carbon-fiber',
      'chair',
      'cluster-jet',
      'cone',
      'conveyor',
      'cube',
      'cylinder',
      'factory',
      'food',
      'fuel',
      'glass-corner',
      'glass-cube',
      'glass-wedge',
      'guide',
      'habitat',
      'iron-chondrite',
      'iron-corner',
      'iron-cube',
      'iron',
      'iron-wedge',
      'mud',
      'phylosilicate',
      'point',
      'polyoxide-corner',
      'polyoxide-cube',
      'polyoxide-wedge',
      'rod',
      'scaffold',
      'silicone',
      'thruster-jet',
      'water-ice',
    ];
    for (const modelName of modelNames) {
      // Log.info(`Loading '${modelName}'`);
      const m = await Assets.loadMeshFromModel(`Model/${modelName}.glb`);
      m.name = modelName;
      namedMeshes.set(modelName, m);
    }

    return new Promise<Assets>((accept, reject) => {
      accept(new Assets(namedMeshes));
    });
  }
}