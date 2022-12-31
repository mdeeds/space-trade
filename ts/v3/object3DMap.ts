import * as THREE from "three";
import { Octree } from "./octree";
import { Vector3Map } from "./vector3Map";

export class Object3DMap extends THREE.Object3D {
  private octree = new Octree<THREE.Object3D>();
  private objects = new Vector3Map<THREE.Object3D>();

  public set(position: THREE.Vector3, value: THREE.Object3D): this {
    this.delete(position);
    this.octree.add(value, position);
    this.objects.set(position, value);

    // Check for neighbors in all eight directions around the given position
    const up = new THREE.Vector3(position.x, position.y + 1, position.z);
    const down = new THREE.Vector3(position.x, position.y - 1, position.z);
    const left = new THREE.Vector3(position.x - 1, position.y, position.z);
    const right = new THREE.Vector3(position.x + 1, position.y, position.z);
    const front = new THREE.Vector3(position.x, position.y, position.z + 1);
    const back = new THREE.Vector3(position.x, position.y, position.z - 1);

    // Check if any of the neighbors are open
    if (
      !this.objects.get(up) &&
      !this.objects.get(down) &&
      !this.objects.get(left) &&
      !this.objects.get(right) &&
      !this.objects.get(front) &&
      !this.objects.get(back)
    ) {
      // If all the neighbors are occupied, remove the entry from the Object3D
      this.remove(value);
    } else {
      // If any of the neighbors are open, add the entry to the Object3D
      this.add(value);
    }

    return this;
  }

  public get(position: THREE.Vector3): THREE.Object3D | undefined {
    const closest = this.octree.getClosest(position);
    return closest !== undefined ? closest : undefined;
  }

  public delete(position: THREE.Vector3): boolean {
    const value = this.get(position);
    if (value !== undefined) {
      this.octree.remove(position);
      this.remove(value);
      this.objects.delete(position);

      // Check for neighbors in all eight directions around the given position
      const up = new THREE.Vector3(position.x, position.y + 1, position.z);
      const down = new THREE.Vector3(position.x, position.y - 1, position.z);
      const left = new THREE.Vector3(position.x - 1, position.y, position.z);
      const right = new THREE.Vector3(position.x + 1, position.y, position.z);
      const front = new THREE.Vector3(position.x, position.y, position.z + 1);
      const back = new THREE.Vector3(position.x, position.y, position.z - 1);

      // Check if any of the neighbors are occupied
      const upValue = this.objects.get(up);
      const downValue = this.objects.get(down);
      const leftValue = this.objects.get(left);
      const rightValue = this.objects.get(right);
      const frontValue = this.objects.get(front);
      const backValue = this.objects.get(back);

      // If any of the neighbors are occupied, add them to the Object3D
      if (upValue) this.add(upValue);
      if (downValue) this.add(downValue);
      if (leftValue) this.add(leftValue);
      if (rightValue) this.add(rightValue);
      if (frontValue) this.add(frontValue);
      if (backValue) this.add(backValue);

      return true;
    }
    return false;
  }
}