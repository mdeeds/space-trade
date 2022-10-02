import * as THREE from "three";
import { Log } from "./log";

export class Hud extends THREE.Object3D {
  private canvas: HTMLCanvasElement;
  private texture: THREE.CanvasTexture;
  private mesh: THREE.Mesh;
  constructor() {
    super();
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1024;
    this.canvas.height = 1024;

    this.texture = new THREE.CanvasTexture(this.canvas);

    // HUD will be 1m from the player and 2m wide.  This makes it take
    // up 90 degrees of the view frustrum.
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

    this.init();
  }

  private init() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 1024);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0f04';
    ctx.strokeRect(2, 2, 1020, 1020);

    ctx.fillStyle = '#0f0f';
    // ctx.strokeStyle = '#000';
    ctx.font = '32px monospace'
    // ctx.strokeText('Greetings', 16, 32);
    ctx.fillText('Greetings, Reso.', 16, 32);
    this.texture.needsUpdate = true;
  }

}