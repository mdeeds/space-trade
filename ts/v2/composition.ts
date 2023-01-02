import * as THREE from "three";

import { Assets } from "./assets";
import { Compounds } from "./compounds";
import { Construction, Cubie } from "./construction";
import { Controls, StartStopEvent } from "./controls";
import { Cursor } from "./cursor";
import { Codeable, File } from "./file";
import { Grid } from "./grid";
import { IsoTransform } from "./isoTransform";
import { MeshCollection } from "./meshCollection";
import { PointSet } from "./pointSet";

// An object in the universe that you can interact with.
export class Composition extends THREE.Object3D implements Construction, PointSet {
    private meshCollection: MeshCollection;
    private saveableCollection: Codeable;
    constructor(assets: Assets, controls: Controls,
        private cursors: Map<THREE.XRHandedness, Cursor>,
        private saveId: string) {
        super();
        const meshCollection = new MeshCollection(assets, 10);
        super.add(meshCollection);
        this.meshCollection = meshCollection;
        this.saveableCollection = meshCollection;
        controls.setStartStopCallback((ev: StartStopEvent) => {
            if (ev.state == 'start') {
                const pos = new IsoTransform();
                pos.copy(ev.worldPosition);
                this.worldToLocal(pos.position);
                Grid.round(pos.position);
                Grid.roundRotation(pos.quaternion);

                const cursor = cursors.get(ev.handedness);
                if (cursor.isHolding()) {
                    this.handleDrop(pos, cursor, (ev.type == 'grip'));
                    // this.sound.playOnObject(cursor, 'boop');
                } else {
                    const removed = this.meshCollection.removeCubie(pos.position);
                    if ((ev.type == 'grip')) {
                        if (!removed && this.cursorsAreTogether()) {
                            this.handleSplit();
                        } else {
                            cursor.setHold(removed.name);
                        }
                    }
                }
            }
            File.save(this.saveableCollection, this.saveId);
        });
    }

    private cursorsAreTogether(): boolean {
        const v = new THREE.Vector3();
        v.copy(this.cursors.get('left').position);
        v.sub(this.cursors.get('right').position);
        return v.length() < 0.20;
    }

    private handleSplit() {
        const left = this.cursors.get('left');
        const right = this.cursors.get('right');
        let item = left.getHold();
        if (!item) {
            item = right.getHold();
        }
        const [a, b] = this.compounds.break(item);
        if (a || b) {
            left.setHold(a);
            right.setHold(b);
        }
    }

    private compounds = new Compounds();

    private handleDrop(pos: IsoTransform, cursor: Cursor, removeFromHand: boolean = true) {
        if (!this.meshCollection.cubeAt(pos.position)) {
            this.meshCollection.addCube(cursor.getHold(), pos);
            if (removeFromHand) {
                cursor.setHold(null);
            }
        } else {
            const existingCube = this.meshCollection.getCubeAt(pos.position);
            const combo = this.compounds.combine(existingCube, cursor.getHold());
            if (!!combo) {
                this.meshCollection.removeCubie(pos.position);
                this.meshCollection.addCube(combo, pos);
                if (removeFromHand) {
                    cursor.setHold(null);
                }
            }
        }
    }

    public getClosestDistance(p: THREE.Vector3): number {
        return this.meshCollection.getClosestDistance(p);
    }

    public addCube(name: string, tx: IsoTransform): void {
        this.meshCollection.addCube(name, tx);
    }

    public addCubie(cubie: Cubie): void {
        this.meshCollection.addCubie(cubie);
    }

    public cubeAt(p: THREE.Vector3): boolean {
        return this.meshCollection.cubeAt(p);
    }

    public getCubeAt(p: THREE.Vector3): string {
        return this.meshCollection.getCubeAt(p);
    }

    public getCubes(): Iterable<[THREE.Vector3, string]> {
        return this.meshCollection.getCubes();
    }

    public getCubies(): Iterable<[THREE.Vector3, Cubie]> {
        return this.meshCollection.getCubies();
    }

    public removeCubie(position: THREE.Vector3): Cubie {
        return this.meshCollection.removeCubie(position);
    }

    public getMeshCollection(): MeshCollection {
        return this.meshCollection;
    }
}