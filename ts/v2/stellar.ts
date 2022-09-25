import * as THREE from "three";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import { Player } from "./player";
import { S } from "../settings";
import { Assets } from "./assets";
import { Controls } from "./controls";
import { Cursor } from "./cursor";
import { File } from "./file";
import { PointCloudUnion } from "./pointSet";
import { Stars } from "./stars";
import { Grid } from "./grid";
import { Tick, Ticker } from "../tick";
import { IsoTransform } from "./isoTransform";
import { Buzz } from "./buzz";

export class Stellar {
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private universe = new THREE.Group();
  private playerGroup = new THREE.Group();
  private player = new Player();

  private allPoints = new PointCloudUnion();
  private stars: Stars;
  private cursors = new Map<THREE.XRHandedness, Cursor>();
  private leftPosition = new IsoTransform();
  private rightPosition = new IsoTransform();
  private controls: Controls = undefined;
  private buzzes = new Map<THREE.XRHandedness, THREE.PositionalAudio>();

  constructor() {
    this.scene.add(this.playerGroup);
    this.scene.add(this.universe);
    this.initialize();
  }

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
      this.stars.handlePops(this.universe, this.allPoints);
      this.tmpV.copy(this.universe.position);
      this.tmpV.multiplyScalar(-1);
      // this.nebulae.updatePosition(this.tmpV);
      if (!!this.controls) {
        this.controls.setPositions(this.leftPosition, this.rightPosition,
          this.camera);
        this.setWorldToPlayer(
          this.leftPosition.position, this.cursors.get('left').position)
        this.setWorldToPlayerQ(
          this.leftPosition.quaternion, this.cursors.get('left').quaternion)
        this.setWorldToPlayer(
          this.rightPosition.position, this.cursors.get('right').position)
        this.setWorldToPlayerQ(
          this.rightPosition.quaternion, this.cursors.get('right').quaternion)
      }
      this.scene.traverseVisible((o) => {
        if (o['tick']) {
          (o as any as Ticker).tick(new Tick(elapsedS, deltaS, frameCount));
        }
      })
      this.updateSound(deltaS);
    });
  }

  private setWorldToPlayer(pos: THREE.Vector3, target: THREE.Vector3) {
    target.copy(pos);
    this.playerGroup.worldToLocal(target);
  }

  private setWorldToPlayerQ(q: THREE.Quaternion, target: THREE.Quaternion) {
    // We need to "subtract" the playerGroup quaternion from q.
    // q - pgq = q + (-pgq)
    target.copy(this.playerGroup.quaternion);
    target.invert();
    target.premultiply(q)
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

  private listener: THREE.AudioListener;
  private initializeSound() {
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);
  }

  private updateSound(deltaS: number) {
    for (const b of this.buzzes.values()) {
      b.updateMatrixWorld(true);
    }
  }

  private tmpV = new THREE.Vector3();
  private distanceToClosest(closestPos: THREE.Vector3): number {
    this.tmpV.copy(this.playerGroup.position);
    this.tmpV.sub(this.universe.position);
    return this.allPoints.getClosestDistance(this.tmpV, closestPos);
  }

  private addBuzz(sourceObject: THREE.Object3D): THREE.PositionalAudio {
    const source = new THREE.PositionalAudio(this.listener);
    sourceObject.add(source);
    const buzz = new Buzz(this.listener.context);
    buzz.connect(source.panner);
    return source;
  }

  private velocityVector = new THREE.Vector3();
  private q = new THREE.Quaternion();
  private yAxis = new THREE.Vector3(0, 1, 0);
  private closestPos = new THREE.Vector3();
  private handleControls(deltaS: number) {
    if (!this.controls.hasSession()) {
      const session = this.renderer.xr.getSession();
      if (session) {
        this.controls.setSession(session);
        this.buzzes.set('left', this.addBuzz(this.cursors.get('left')));
        this.buzzes.set('right', this.addBuzz(this.cursors.get('right')));
      }
    }
    const r = this.distanceToClosest(this.closestPos);
    if (r < 1.0) {
      this.velocityVector.copy(this.player.position);
      this.velocityVector.sub(this.closestPos);
      this.velocityVector.setLength(5.0);
    } else {
      const velocity = S.float('rv') * r;
      this.velocityVector.set(
        this.controls.leftRight(),
        this.controls.upDown(),
        this.controls.forwardBack());
      this.velocityVector.multiplyScalar(velocity);
    }
    if (this.velocityVector.lengthSq() > 0) {
      this.velocityVector.multiplyScalar(deltaS);
      this.velocityVector.applyQuaternion(this.playerGroup.quaternion);
      this.player.position.add(this.velocityVector);
    }

    const spinRate = this.controls.spinLeftRight();
    if (spinRate != 0) {
      this.q.setFromAxisAngle(this.yAxis, deltaS * spinRate * 3);
      this.player.rotation.multiply(this.q);
    }

    this.universe.position.copy(this.player.position);
    this.universe.position.multiplyScalar(-1);
    this.playerGroup.quaternion.copy(this.player.rotation);
  }

  private async initializeWorld() {
    // this.scene.add(this.nebulae);
    const canvas = document.getElementsByTagName('canvas')[0];
    this.controls = new Controls(this.camera, canvas,
      this.renderer.xr, this.playerGroup);

    const light = new THREE.DirectionalLight(new THREE.Color('#fff'),
      1.0);
    light.position.set(0, 10, 2);
    this.scene.add(light);

    const ambient = new THREE.AmbientLight('#def', 0.5);
    this.scene.add(ambient);

    console.log('Initialize World');
    const assets = await Assets.load();
    console.log('Assets loaded.');
    this.stars = new Stars(assets, this.controls, this.cursors);
    File.load(this.stars, 'Stellar', new THREE.Vector3(0, 0, 0));
    this.universe.add(this.stars);
    this.allPoints.add(this.stars);
    this.cursors.set('left', new Cursor(assets));
    this.cursors.set('right', new Cursor(assets));
    this.playerGroup.add(this.cursors.get('left'));
    this.playerGroup.add(this.cursors.get('right'));

    File.load(this.player, 'Player', new THREE.Vector3(0, 0, 0));
    setInterval(() => { File.save(this.player, 'Player') }, 1000);
    return;
  }
}

const startButton = document.createElement('div');
startButton.innerHTML = 'Start';
startButton.onclick = () => {
  new Stellar();
}
document.body.appendChild(startButton);