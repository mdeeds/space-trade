import * as THREE from "three";
import { S } from "../settings";
import { Tick, Ticker } from "../tick";
import { Assets } from "./assets";
import { Construction } from "./construction";
import { Codeable } from "./file";
import { Grid } from "./grid";
import { IsoTransform } from "./isoTransform";
import { LocationMap } from "./locationMap";
import { Log } from "./log";
import { NeighborCount } from "./neighborCount";
import { PointMapOctoTree } from "./octoTree";
import { PointSet } from "./pointSet";
import { SimpleLocationMap } from "./simpleLocationMap";

class NameAndRotation {
  constructor(readonly name: string, readonly quaternion: THREE.Quaternion) {
  }
}

export class MeshCollection extends THREE.Object3D
  implements PointSet, Construction, Ticker, Codeable {
  private rocks = new PointMapOctoTree<IsoTransform>(Grid.zero, 1e3);

  // Maps item names to corresponding materials and geometry.
  // This is used to create the appropriate Instanced Meshes.
  private materialMap = new Map<string, THREE.Material>();
  private geometryMap = new Map<string, THREE.BufferGeometry>();
  // The instances of InstancedMesh created for each item.
  private meshMap = new Map<string, THREE.InstancedMesh>();
  private colorMap = new Map<string, THREE.Color>();

  private cubes: SimpleLocationMap<string>;
  private quaternions = new SimpleLocationMap<THREE.Quaternion>();

  private t = new THREE.Vector3();
  private r = new THREE.Quaternion();
  private s = new THREE.Vector3();

  constructor(assets: Assets, private radius: number) {
    super();
    const r = Math.ceil(radius);
    this.cubes = new SimpleLocationMap<string>();

    console.log('constructing Mesh Collection');

    for (const name of assets.names()) {
      const mesh = assets.getMesh(name);
      // console.log(`Mesh: ${mesh.name}`);
      // let oldMaterial = mesh.material as THREE.Material;
      // let newMaterial = oldMaterial;
      // if (oldMaterial.type === 'MeshPhysicalMaterial') {
      //   let m = oldMaterial as THREE.MeshPhysicalMaterial;
      //   // console.log(m);
      //   newMaterial = new THREE.MeshPhongMaterial({
      //     color: m.color,
      //     shininess: 1.0,
      //     emissive: m.emissive,
      //   });
      // }
      // newMaterial.depthWrite = true;
      // newMaterial.depthTest = true;
      // newMaterial.transparent = false;

      const color = this.getColor(mesh);
      this.colorMap.set(name, color);
      // Log.info(`Color of ${name} is ${[color.r, color.g, color.b]}`);
      // TODO: Consider MeshToonMaterial

      const geometry = mesh.geometry.clone();
      mesh.matrix.decompose(this.t, this.r, this.s);
      geometry.scale(this.s.x, this.s.y, this.s.z);
      this.defineItem(name, geometry, mesh.material as THREE.Material);
      //this.defineItem(name, geometry, newMaterial);
    }
  }

  private getColor(mesh: THREE.Mesh): THREE.Color {
    const geometry = mesh.geometry;
    const colorAtt = geometry.getAttribute('color') as THREE.BufferAttribute;
    const finalColor = new THREE.Color();
    const c = new THREE.Color();
    let seen = 0;
    if (colorAtt) {
      for (let i = 0; i < colorAtt.count; ++i) {
        ++seen;
        c.fromBufferAttribute(colorAtt, i);
        if (Math.random() < 1 / seen) {
          finalColor.copy(c);
        }
      }
    }
    if (seen > 0) {
      return finalColor;
    } else {
      return new THREE.Color(mesh.material['color']);
    }
  }

  public getMeshColor(name: string): THREE.Color {
    return this.colorMap.get(name);
  }

  fallback(p: THREE.Vector3): this {
    throw new Error("Method not implemented.");
  }

  public getCubes(): Iterable<[THREE.Vector3, string]> {
    return this.cubes.entries();
  }

  private tmpV = new THREE.Vector3();
  public getClosestDistance(p: THREE.Vector3): number {
    this.tmpV.copy(p);
    this.tmpV.sub(this.parent.position);  // Astroid relative to System
    this.tmpV.sub(this.parent.parent.position);  // System relative to Universe
    const distance = this.rocks.getClosestDistance(this.tmpV);
    return distance;
  }

  private dirty = false;
  public addCube(name: string, tx: IsoTransform) {
    this.cubes.set(tx.position, name);
    this.rocks.add(tx.position, tx);
    this.quaternions.set(tx.position, tx.quaternion);
    this.dirty = true;
  }

  public removeCube(position: THREE.Vector3): string {
    const name = this.cubes.get(position);
    if (!!name) {
      this.cubes.set(position, null);
      this.dirty = true;
      return name;
    }
    return null;
  }

  public cubeAt(p: THREE.Vector3): boolean {
    return !!this.cubes.get(p);
  }

  public get(p: THREE.Vector3): string {
    return this.cubes.get(p);
  }

  public buildGeometry() {
    this.children.splice(0);
    this.add(new THREE.AxesHelper(this.radius * 1.5));
    this.meshMap.clear();

    const nc = new NeighborCount();
    // console.log('Building mesh collection.');
    for (const [cubePosition, cubeName] of this.cubes.entries()) {
      let tx: IsoTransform = new IsoTransform(
        cubePosition, this.quaternions.get(cubePosition));
      nc.set(cubePosition, cubeName);
    }

    // Populate the neighbor mesh
    for (const [name, material] of this.materialMap.entries()) {
      const instancedMesh = new THREE.InstancedMesh(
        this.geometryMap.get(name), this.materialMap.get(name),
        nc.getCount(name));
      instancedMesh.count = 0;
      this.meshMap.set(name, instancedMesh);
      this.add(instancedMesh);
    }

    const tx = new IsoTransform();
    for (const mav of nc.externalElements()) {
      const name = mav.value;
      const pos = mav.pos;
      const instancedMesh = this.meshMap.get(name);
      if (instancedMesh) {
        const i = instancedMesh.count++;
        tx.position.copy(pos);
        tx.quaternion.copy(this.quaternions.get(pos));
        if (S.float('mcs') == 0) {
          instancedMesh.setMatrixAt(i, tx.MakeMatrix());
        }
      } else {
        console.log(`Error: no mesh for ${name}`);
      }
    }
  }

  tick(t: Tick) {
    if (this.dirty) {
      console.time(`Rebuilding`);
      this.buildGeometry();
      console.timeEnd(`Rebuilding`);
      this.dirty = false;
    }
  }

  serialize(): Object {
    const o = {};
    const positionMap = new Map<string, Object[]>();
    const rotationMap = new Map<string, Object[]>();
    for (const [cubePosition, cubeName] of this.cubes.entries()) {
      if (!positionMap.has(cubeName)) positionMap.set(cubeName, []);
      positionMap.get(cubeName).push({ x: cubePosition.x, y: cubePosition.y, z: cubePosition.z });
      if (!rotationMap.has(cubeName)) rotationMap.set(cubeName, []);
      let q: THREE.Quaternion = this.quaternions.get(cubePosition)
      rotationMap.get(cubeName).push({ x: q.x, y: q.y, z: q.z, w: q.w });
    }
    for (const [name, rockPositions] of positionMap.entries()) {
      o[`${name}Positions`] = rockPositions;
      o[`${name}Rotations`] = rotationMap.get(name);
    }
    return o;
  }

  deserialize(o: Object): this {
    this.rocks.clear();
    for (const name of this.geometryMap.keys()) {
      const positions = o[`${name}Positions`];
      const rotations = o[`${name}Rotations`] ? o[`${name}Rotations`] : [];
      if (!positions) {
        continue;
      }
      for (let i = 0; i < positions.length; ++i) {
        const p = positions[i];
        const q = (i < rotations.length) ? rotations[i] : Grid.notRotated;
        const v = new THREE.Vector3(p.x, p.y, p.z);
        const qu = new THREE.Quaternion(q.x, q.y, q.z, q.w);
        this.addCube(name, new IsoTransform(v, qu));
      }
    }
    this.buildGeometry();
    return this;
  }

  private defineItem(name: string, geometry: THREE.BufferGeometry,
    material: THREE.Material) {
    this.geometryMap.set(name, geometry);
    this.materialMap.set(name, material);
  };
}