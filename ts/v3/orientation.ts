import * as THREE from "three";

export class Orientation {
  private static orientations: THREE.Quaternion[] =
    (function () {
      const quaternions = [];
      const faces = [
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0),  // Top
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2),  // Front
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI), // Bottom
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), // Back
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2), // Left
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2), // Right
      ];
      const rotations = [
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0),  // 0
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2),  // 90
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI),  // 180
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2),  // -90
      ];

      for (const f of faces) {
        for (const r of rotations) {
          const q = new THREE.Quaternion().copy(f);
          f.multiply(r);
          quaternions.push(f);
        }
      }

      return quaternions;
    })();

  static getQuaternionFromOrientation(orientation: number) {
    return Orientation.orientations[orientation];
  }

  private static getSquaredDistance(q1: THREE.Quaternion, q2: THREE.Quaternion): number {
    const x = q1.x - q2.x;
    const y = q1.y - q2.y;
    const z = q1.z - q2.z;
    const w = q1.w - q2.w;
    return x * x + y * y + z * z + w * w;
  }

  static getOrientationFromQuaternion(q: THREE.Quaternion): number {
    let closestIndex = 0;
    let closestDistance = Infinity;
    for (let i = 0; i < Orientation.orientations.length; i++) {
      const distance = Orientation.getSquaredDistance(
        q, Orientation.orientations[i]);
      if (distance < closestDistance) {
        closestIndex = i;
        closestDistance = distance;
      }
    }
    return closestIndex;
  }

  constructor(readonly o: number) { }

  quaternion() { return Orientation.orientations[this.o]; }
}