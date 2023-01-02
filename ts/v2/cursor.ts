import * as THREE from "three";
import { LineSegments } from "three";
import { Assets } from "./assets";
import { Cubie } from "./construction";

export class Cursor extends THREE.Object3D {
  private hold: string;
  private heldObject: THREE.Object3D;
  private lineSegments: THREE.LineSegments;

  constructor(private assets: Assets) {
    super();
    const points = [];
    // four left to right lines
    points.push(new THREE.Vector3(-0.5, -0.5, -0.5));
    points.push(new THREE.Vector3(0.5, -0.5, -0.5));
    points.push(new THREE.Vector3(-0.5, -0.5, 0.5));
    points.push(new THREE.Vector3(0.5, -0.5, 0.5));
    points.push(new THREE.Vector3(-0.5, 0.5, -0.5));
    points.push(new THREE.Vector3(0.5, 0.5, -0.5));
    points.push(new THREE.Vector3(-0.5, 0.5, 0.5));
    points.push(new THREE.Vector3(0.5, 0.5, 0.5));
    // four front to back lines
    points.push(new THREE.Vector3(-0.5, -0.5, -0.5));
    points.push(new THREE.Vector3(-0.5, -0.5, 0.5));
    points.push(new THREE.Vector3(-0.5, 0.5, -0.5));
    points.push(new THREE.Vector3(-0.5, 0.5, 0.5));
    points.push(new THREE.Vector3(0.5, -0.5, -0.5));
    points.push(new THREE.Vector3(0.5, -0.5, 0.5));
    points.push(new THREE.Vector3(0.5, 0.5, -0.5));
    points.push(new THREE.Vector3(0.5, 0.5, 0.5));
    // four up and down lines
    points.push(new THREE.Vector3(-0.5, -0.5, -0.5));
    points.push(new THREE.Vector3(-0.5, 0.5, -0.5));
    points.push(new THREE.Vector3(-0.5, -0.5, 0.5));
    points.push(new THREE.Vector3(-0.5, 0.5, 0.5));
    points.push(new THREE.Vector3(0.5, -0.5, -0.5));
    points.push(new THREE.Vector3(0.5, 0.5, -0.5));
    points.push(new THREE.Vector3(0.5, -0.5, 0.5));
    points.push(new THREE.Vector3(0.5, 0.5, 0.5));

    const material = new THREE.LineBasicMaterial(
      { color: "#0f0", linewidth: 1, depthTest: true, depthWrite: true });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.lineSegments = new LineSegments(geometry, material);
    this.add(this.lineSegments);

    const axes = new THREE.AxesHelper();
    (axes.material as THREE.Material).depthTest = true;
    (axes.material as THREE.Material).depthWrite = true;
    this.add(new THREE.AxesHelper());
  }

  public isHolding(): boolean {
    return !!this.hold;
  }

  public getHold(): string {
    return this.hold;
  }

  public setHold(item: string) {
    if (this.heldObject) {
      this.remove(this.heldObject);
    }
    if (item) {
      // TODO: There should be rotation here.
      this.heldObject = this.assets.getMesh(item);
      if (this.heldObject) {
        this.add(this.heldObject);
      }
    }
    this.hold = item;
  }
}