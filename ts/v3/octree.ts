import * as THREE from "three";

export class Octree<T> {
  private root = new OctreeNode<T>(new THREE.Box3(new THREE.Vector3(-1e8, -1e8, -1e8), new THREE.Vector3(1e8, 1e8, 1e8)));

  constructor() { }

  public add(value: T, position: THREE.Vector3): void {
    this.root.add(value, position);
  }

  public remove(position: THREE.Vector3): boolean {
    if (this.root !== undefined) {
      return this.root.remove(position);
    }
    return false;
  }

  public getClosest(position: THREE.Vector3): T | undefined {
    if (this.root !== undefined) {
      return this.root.getClosest(position);
    }
    return undefined;
  }
}

type OctreeKV<T> = [THREE.Vector3, T];

class OctreeNode<T> {
  private points: OctreeKV<T>[] = [];
  private children: OctreeNode<T>[] = undefined;

  constructor(private bounds: THREE.Box3) {
  }

  public add(value: T, position: THREE.Vector3): boolean {
    if (!this.bounds.containsPoint(position)) return false;
    if (!!this.children) {
      for (const c of this.children) {
        if (c.add(value, position)) {
          return true;
        }
      }
      return false;
    } else {
      this.points.push([position, value]);
      if (this.points.length > 8) {
        this.split();
      }
    }
  }

  public remove(position: THREE.Vector3): boolean {
    if (!this.bounds.containsPoint(position)) return false;
    if (!!this.children) {
      for (const c of this.children) {
        if (c.remove(position)) {
          return true;
        }
      }
      return false;
    } else {
      for (let i = 0; i < this.points.length; ++i) {
        const p = this.points[i][0];
        if (p.x == position.x && p.y == position.y && p.z == position.z) {
          this.points.splice(i, 1);
          return true;
        }
      }
      return false;
    }
  }

  private tmpCenter = new THREE.Vector3();
  public getClosest(position: THREE.Vector3): T | undefined {
    let closest: T | undefined;
    let closestDistance = Infinity;
    if (!!this.children) {
      for (const child of this.children) {
        if (child.bounds.distanceToPoint(position) < closestDistance) {
          const result = child.getClosest(position);
          if (result !== undefined) {
            this.bounds.getCenter(this.tmpCenter);
            const distance = position.distanceToSquared(this.tmpCenter);
            if (distance < closestDistance) {
              closest = result;
              closestDistance = distance;
            }
          }
        }
      }
    } else {
      for (const [k, v] of this.points) {
        const distance = position.distanceToSquared(k);
        if (distance < closestDistance) {
          closest = v;
          closestDistance = distance;
        }
      }
    }
    return closest;
  }

  private split(): void {
    const { min, max } = this.bounds;
    const midX = (min.x + max.x) / 2;
    const midY = (min.y + max.y) / 2;
    const midZ = (min.z + max.z) / 2;
    this.children.push(
      new OctreeNode(new THREE.Box3(min, new THREE.Vector3(midX, midY, midZ))),
      new OctreeNode(new THREE.Box3(new THREE.Vector3(midX, min.y, min.z), new THREE.Vector3(max.x, midY, midZ))),
      new OctreeNode(new THREE.Box3(new THREE.Vector3(min.x, midY, min.z), new THREE.Vector3(midX, max.y, midZ))),
      new OctreeNode(new THREE.Box3(new THREE.Vector3(midX, midY, min.z), new THREE.Vector3(max.x, max.y, midZ))),
      new OctreeNode(new THREE.Box3(new THREE.Vector3(min.x, min.y, midZ), new THREE.Vector3(midX, midY, max.z))),
      new OctreeNode(new THREE.Box3(new THREE.Vector3(midX, min.y, midZ), new THREE.Vector3(max.x, midY, max.z))),
      new OctreeNode(new THREE.Box3(new THREE.Vector3(min.x, midY, midZ), new THREE.Vector3(midX, max.y, max.z))),
      new OctreeNode(new THREE.Box3(new THREE.Vector3(midX, midY, midZ), max))
    );

    for (const [k, v] of this.points) {
      for (const c of this.children) {
        if (c.add(v, k)) continue;
      }
    }
    this.points = undefined;
  }
}