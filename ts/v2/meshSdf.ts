import * as THREE from "three";
import { SDF } from "../graphics/marchingCubes";

import { MeshCollection } from "./meshCollection";

export class MeshSdf {
    private data: Float32Array;
    private extent = new THREE.Vector3();
    private min = new THREE.Vector3(Infinity, Infinity, Infinity);

    constructor(meshCollection: MeshCollection) {
        const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
        for (const [p, s] of meshCollection.getCubes()) {
            this.min.x = Math.min(this.min.x, p.x);
            this.min.y = Math.min(this.min.y, p.y);
            this.min.z = Math.min(this.min.z, p.z);
            max.x = Math.max(max.x, p.x);
            max.y = Math.max(max.y, p.y);
            max.z = Math.max(max.z, p.z);
        }
        const buffer = new THREE.Vector3(3, 3, 3);
        this.min.sub(buffer);
        max.add(buffer);
        this.extent.copy(max);
        this.extent.sub(this.min);
        this.extent.x = Math.round(this.extent.x);
        this.extent.y = Math.round(this.extent.y);
        this.extent.z = Math.round(this.extent.z);

        this.data = new Float32Array(this.extent.x * this.extent.y * this.extent.z);
        for (let i = 0; i < this.data.length; ++i) {
            this.data[i] = 1;
        }

        const tmp = new THREE.Vector3();
        for (const [p, s] of meshCollection.getCubes()) {
            tmp.copy(p);
            tmp.sub(this.min);
            const index = Math.round(tmp.x + tmp.y * this.extent.x + tmp.z * this.extent.x * this.extent.y);
            this.data[index] = -1;
        }
    }

    private tmp = new THREE.Vector3();
    getSdf(): SDF {
        return (pos: THREE.Vector3) => {
            this.tmp.copy(pos);
            this.tmp.sub(this.min);
            this.tmp.x = Math.round(this.tmp.x);
            this.tmp.y = Math.round(this.tmp.y);
            this.tmp.z = Math.round(this.tmp.z);
            const index = this.tmp.x + this.tmp.y * this.extent.x + this.tmp.z * this.extent.x * this.extent.y;
            return this.data[index];
        };
    }
}