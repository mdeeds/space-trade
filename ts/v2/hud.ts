import * as THREE from "three";
import { Tick, Ticker } from "../tick";
import { Log } from "./log";
import { Warble } from "./sfx/warble";

export class Hud extends THREE.Object3D implements Ticker {
  private canvas: HTMLCanvasElement;
  private texture: THREE.CanvasTexture;
  private mesh: THREE.Mesh;
  private warble: Warble;

  constructor(private listener: THREE.AudioListener) {
    super();
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1024;
    this.canvas.height = 1024;

    this.warble = new Warble(listener.getInput());

    this.texture = new THREE.CanvasTexture(this.canvas);

    // HUD will be 1.5m from the player and 2m wide.  This makes it take
    // up about 60 degrees of the view frustrum.  Text at the top and bottom
    // is hard to read.
    this.mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2.0, 2.0).translate(0, 0, -1.5),
      new THREE.MeshBasicMaterial({
        color: '#fff',
        map: this.texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );

    this.add(this.mesh);

    this.display();
  }

  private display() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 1024);
    // ctx.lineWidth = 2;
    // ctx.strokeStyle = '#0f04';
    // ctx.strokeRect(2, 2, 1020, 1020);

    ctx.font = '22px monospace'
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
    ctx.strokeText(this.postedMessage, 64, 1024 * 0.7);
    ctx.fillStyle = '#0f0f';
    ctx.fillText(this.postedMessage, 64, 1024 * 0.7);


    this.texture.needsUpdate = true;
  }

  private pendingMessage: string = '';
  private postedMessage: string = '';
  private totalElapsedS = 0;
  public pushMessage(text: string) {
    this.postedMessage = '';
    this.pendingMessage = text;
    this.totalElapsedS = 0;
    this.clearTime = Infinity;
    this.display();
  }

  private clearTime: number = Infinity;
  public tick(t: Tick) {
    if (this.postedMessage.length > 0 && t.elapsedS > this.clearTime) {
      this.postedMessage = '';
      this.pendingMessage = '';
      this.warble.intone('.');
      this.clearTime = Infinity;
      this.display();
    }
    if (this.postedMessage.length >= this.pendingMessage.length) {
      return;
    }
    this.totalElapsedS += t.deltaS;
    const desiredCharCount = Math.round(this.totalElapsedS * 12);
    if (desiredCharCount > this.postedMessage.length) {
      this.postedMessage = this.pendingMessage.substring(0, desiredCharCount);
      this.warble.intone(this.pendingMessage.charAt(desiredCharCount - 1));
      this.display();
    }
    if (this.pendingMessage.length == this.postedMessage.length) {
      this.clearTime = t.elapsedS + 1.5;
    }
  }
}