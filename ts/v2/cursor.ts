import * as THREE from "three";

export class Cursor extends THREE.LineSegments {

  private hold: string;

  constructor() {
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
      { color: "#0f0", linewidth: 1 });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    super(geometry, material);
  }

  public isHolding(): boolean {
    return !!this.hold;
  }

  public getHold(): string {
    return this.hold;
  }

  public setHold(item: string) {
    this.hold = item;
  }
}