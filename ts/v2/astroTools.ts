import * as THREE from "three";
import { PositionalAudio, Vector3 } from "three";
import { randFloat } from "three/src/math/MathUtils";
import { Item } from "../assets";
import { Construction } from "./construction";
import { Grid } from "./grid";
import { IsoTransform } from "./isoTransform";
import { NeighborCount } from "./neighborCount";
import { SimpleLocationMap } from "./simpleLocationMap";

export class AstroTools {
    public density = 1.0;  // density is the chance that a block will be placed
    private blocks = new SimpleLocationMap<string>();
    private orthogonalVectors = [
        new Vector3(0, 0, -1),
        new Vector3(0, 1, 0),
        new Vector3(0, -1, 0),
        new Vector3(0, 1, 0),
        new Vector3(-1, 0, 0),
        new Vector3(1, 0, 0),
    ]

    public constructor() {
        // this.randomWalk(new Vector3(), 5, "cube");
        // this.dialate("clay");
        // this.erode();
    }

    private addAt(pos: Vector3, item: string, overwrite = false) {
        if (Math.random() < this.density) {
            if (this.blocks.has(pos)) {
                if (overwrite) {
                    this.blocks.delete(pos);
                    this.blocks.set(pos, item);
                }
            }
            else {
                this.blocks.set(pos, item);
            }
        }
    }

    private randomDirection() {
        let possibilities = this.orthogonalVectors;
        const index = Math.floor(Math.random() * possibilities.length);
        return possibilities[index];
    }

    private removeAt(pos: Vector3) {
        if (Math.random() < this.density) {
            if (this.blocks.has(pos)) {
                this.blocks.delete(pos);
            }
        }
    }

    public disk(pos: Vector3, r: number, item: string, overwrite = false) {
        for (let x = -r; x < r; x++) {
            for (let z = -r; z < r; z++) {
                if (Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2)) < r) {
                    let localPos = new Vector3(x, 0, z);
                    localPos.add(pos);
                    this.addAt(localPos, item, overwrite)
                }
            }
        }
    }

    public randomWalk(pos: Vector3, n: number, item: string, overwrite = false) {
        for (let i = 0; i < n; i++) {
            this.addAt(pos, item, overwrite);
            pos.add(this.randomDirection());
        }
    }

    public dialate(item: string) {
        for (let i of this.blocks.clone().entries()) {
            for (let v of this.orthogonalVectors) {
                let localPos = new Vector3();
                localPos.add(i[0]);
                localPos.add(v);
                this.addAt(localPos, item, false);
            }
        }
    }

    public erode(n = 6) {
        for (let i of this.blocks.clone().entries()) {
            let neighbors = 0;
            for (let v of this.orthogonalVectors) {
                let localPos = new Vector3();
                localPos.add(i[0]);
                localPos.add(v);
                if (this.blocks.has(localPos)) {
                    neighbors++;
                }
            }
            if (neighbors < n) {
                this.blocks.delete(i[0]);
            }
        }
    }

    public double() {
        let retValue = new SimpleLocationMap<string>();
        for (let i of this.blocks.entries()) {
            let localPos = new Vector3();
            retValue.set(i[0], i[1]);
            // TODO(SWD): finish this code
        }
    }

    public addToConstruction(construction: Construction) {
        for (let block of this.blocks.entries()) {
            const quaternion = Grid.randomRotation();
            const location = block[0];
            const item = block[1];
            construction.addCube(item, new IsoTransform(
                location,
                quaternion));
        }
    }
}