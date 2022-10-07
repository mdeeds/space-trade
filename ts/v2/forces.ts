import * as THREE from "three";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import { Controls, StartStopEvent } from "./controls";
import { ForcePointCloud } from "./forcePointCloud";
import { IsoTransform } from "./isoTransform";
import { Tick, Ticker } from "../tick";
import { Sound } from "./sfx/sound";

export class Forces {
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private universe = new THREE.Group();
  private playerGroup = new THREE.Group();
  private playerFrame = new IsoTransform();

  private stars: ForcePointCloud;
  private leftPosition = new IsoTransform();
  private rightPosition = new IsoTransform();
  private controls: Controls = undefined;

  private currentVelocity: number = 0.0;

  constructor() {
    this.scene.add(this.playerGroup);
    this.scene.add(this.universe);
    this.initialize();
  }

  private tmpV = new THREE.Vector3();
  private async initialize() {
    this.initializeGraphics();
    this.initializeSound();
    await this.initializeWorld();

    // Set up animation loop last - after everything is loaded.
    const clock = new THREE.Clock();
    let elapsedS = 0;
    let frameCount = 0;
    this.renderer.setAnimationLoop(() => {
      const deltaS = Math.min(clock.getDelta(), 0.1);
      elapsedS += deltaS;
      ++frameCount;
      this.renderer.render(this.scene, this.camera);
      this.handleControls(deltaS);
      this.tmpV.copy(this.universe.position);
      this.tmpV.multiplyScalar(-1);
      // this.nebulae.updatePosition(this.tmpV);
      if (!!this.controls) {
        this.controls.setPositions(this.leftPosition, this.rightPosition,
          this.camera);
      }
      this.scene.traverseVisible((o) => {
        if (o['tick']) {
          (o as any as Ticker).tick(new Tick(elapsedS, deltaS, frameCount));
        }
      })
    });
  }

  private initializeGraphics() {
    document.body.innerHTML = '';
    this.camera = new THREE.PerspectiveCamera(75,
      1.0, /*near=*/0.1, /*far=*/20e9);
    this.camera.position.set(0, 1.7, 0);
    this.camera.lookAt(0, 1.7, -1.5);
    this.playerGroup.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true });
    this.renderer.setSize(800, 800);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(this.renderer.domElement);
    document.body.appendChild(VRButton.createButton(this.renderer));
    this.renderer.xr.enabled = true;
  }

  private sound: Sound;
  private initializeSound() {
    const listener = new THREE.AudioListener();
    this.camera.add(listener);
    this.sound = new Sound(listener);
  }

  private velocityVector = new THREE.Vector3();
  private q = new THREE.Quaternion();
  private yAxis = new THREE.Vector3(0, 1, 0);
  private handleControls(deltaS: number) {
    if (!this.controls.hasSession()) {
      const session = this.renderer.xr.getSession();
      if (session) {
        this.controls.setSession(session);
      }
    }
    const target_velocity = this.controls.leftRight() + this.controls.upDown() + this.controls.forwardBack();
    const mag = Math.max(deltaS / 100, 1)
    this.currentVelocity = (1 - mag) * this.currentVelocity + mag * target_velocity

    this.velocityVector.set(
      this.controls.leftRight(),
      this.controls.upDown(),
      this.controls.forwardBack());
    if (this.velocityVector.lengthSq() > 0) {
      this.velocityVector.multiplyScalar(this.currentVelocity * deltaS);
      this.velocityVector.applyQuaternion(this.playerGroup.quaternion);
      this.playerFrame.position.add(this.velocityVector);
    }

    const spinRate = this.controls.spinLeftRight();
    if (spinRate != 0) {
      this.q.setFromAxisAngle(this.yAxis, deltaS * spinRate * 3);
      this.playerFrame.quaternion.multiply(this.q);
    }

    this.universe.position.copy(this.playerFrame.position);
    this.universe.position.multiplyScalar(-1);
    this.playerGroup.quaternion.copy(this.playerFrame.quaternion);
  }

  private async initializeWorld() {
    // this.scene.add(this.nebulae);
    const canvas = document.getElementsByTagName('canvas')[0];
    this.controls = new Controls(this.camera, canvas,
      this.renderer.xr, this.playerGroup);

    this.controls.setStartStopCallback((ev: StartStopEvent) => {
      if (ev.state == 'start') {
        const color = ev.handedness == 'left' ? 'blue' : 'red';
        this.stars.addStar(ev.worldPosition.position, color);
      }
    });

    const light = new THREE.DirectionalLight(new THREE.Color('#fff'),
      1.0);
    light.position.set(0, 10, 2);
    this.scene.add(light);

    const ambient = new THREE.AmbientLight('#def', 0.5);
    this.scene.add(ambient);

    if (!this.sound) {
      throw new Error('Sound not initialized yet!');
    }
    this.stars = new ForcePointCloud();

    for (let i = 0; i < 100; ++i) {
      if (Math.random() < 0.1) {
        this.stars.addStar(new THREE.Vector3(Math.random() * 10 - 5,
          Math.random() * 10, Math.random() * 10 - 5), 'red');
      } else {
        this.stars.addStar(new THREE.Vector3(Math.random() * 10 - 5,
          Math.random() * 10, Math.random() * 10 - 5), 'blue');
      }
    }

    this.universe.add(this.stars);
    return;
  }
}

const startButton = document.createElement('div');
startButton.innerHTML = 'Start';
startButton.onclick = () => {
  new Forces();
}
document.body.appendChild(startButton);