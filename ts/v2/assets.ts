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
      'accordion', 'chrome-wedge', 'Cube.013', 'guide', 'organics', 'solar-panel',
      'arm', 'chromium', 'cube', 'habitat', 'port', 'steel-corner',
      'borosilicate', 'chromium-ore', 'doped-silicon', 'ht-steel-cylinder', 'producer', 'steel-cylinder',
      'carbon-chondrite', 'clay', 'doping', 'ice', 'refined-silicon', 'steel-wedge',
      'carbon-fiber-cube', 'cluster-jet', 'factory', 'iron-chondrite', 'salt-common', 'tank',
      'carbon-fiber', 'composite-slab', 'flight computer', 'iron', 'salt-rare', 'thruster-jet',
      'carbon-fiber-wedge', 'computer', 'food', 'light-blue', 'scaffold', 'untitled',
      'chair', 'console', 'fuel', 'lithium', 'ship', 'wedge 2',
      'chopped corner', 'conveyer', 'fuel-tank', 'lithium-silicate', 'silicate-rock', 'wedge',
      'chrome-corner', 'corner', 'glass-cone', 'metal-common', 'silicon-crystalized', 'window-slope',
      'chrome-cube', 'glass-rod', 'metal-rare', 'silicon', 'wonk',
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