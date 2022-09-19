import * as THREE from "three";
import { S } from "../settings";
import { Assets } from "./assets";
import { AstroGen } from "./astroGen";
import { Compounds } from "./compounds";
import { Controls, StartStopEvent, StartStopEventHandler } from "./controls";
import { Cursor } from "./cursor";

import { Codeable } from "./file";
import { Grid } from "./grid";
import { IsoTransform } from "./isoTransform";
import { MeshCollection } from "./meshCollection";
import { Sound } from "./sfx/sound";

export class Asteroid extends MeshCollection implements Codeable {
  constructor(assets: Assets, controls: Controls,
    private cursors: Map<THREE.XRHandedness, Cursor>,
    private sound: Sound) {
    super(assets, S.float('as') * 1.2);

    controls.setStartStopCallback((ev: StartStopEvent) => {
      if (ev.state == 'start') {
        const pos = new IsoTransform();
        pos.copy(ev.worldPosition);
        this.worldToLocal(pos.position);
        Grid.round(pos.position);
        Grid.roundRotation(pos.quaternion);

        const cursor = cursors.get(ev.handedness);
        if (cursor.isHolding()) {
          this.handleDrop(pos, cursor);
          this.sound.playOnObject(cursor, 'boop');
        } else {
          const removed = this.removeCube(pos.position);
          if (!removed && this.cursorsAreTogether()) {
            this.handleSplit();
          } else {
            cursor.setHold(removed);
          }
        }
      }
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

  private handleDrop(pos: IsoTransform, cursor: Cursor) {
    if (!this.cubeAt(pos.position)) {
      this.addCube(cursor.getHold(), pos);
      cursor.setHold(null);
    } else {
      const existingCube = this.get(pos.position);
      const combo = this.compounds.combine(existingCube, cursor.getHold());
      if (!!combo) {
        this.removeCube(pos.position);
        this.addCube(combo, pos);
        cursor.setHold(null);
      }
    }
  }

  fallback(p: THREE.Vector3) {
    const gen = new AstroGen(this);
    gen.buildAsteroid(S.float('as'), 0, 0, 0);
    this.buildGeometry();
    return this;
  }
}