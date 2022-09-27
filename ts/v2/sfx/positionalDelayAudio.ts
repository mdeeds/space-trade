import { copyFileSync } from "fs";
import * as THREE from "three";
import { Log } from "../log";

export class PositionalDelayAudio extends THREE.Audio {

  private _position = /*@__PURE__*/ new THREE.Vector3();
  private _quaternion = /*@__PURE__*/ new THREE.Quaternion();
  private _scale = /*@__PURE__*/ new THREE.Vector3();
  private _orientation = /*@__PURE__*/ new THREE.Vector3();

  // public panner: PannerNode;
  public panner: AudioNode;
  private leftDelay: DelayNode;
  private rightDelay: DelayNode;
  private leftGain: GainNode;
  private rightGain: GainNode;

  constructor(listener: THREE.AudioListener) {
    super(listener);
    try {
      // this.panner = this.context.createPanner();
      // this.panner.panningModel = 'HRTF';

      this.panner = this.context.createGain();

      this.leftGain = this.context.createGain();
      this.rightGain = this.context.createGain();
      this.panner.connect(this.leftGain);
      this.panner.connect(this.rightGain);

      this.leftDelay = listener.context.createDelay(1.0);
      this.rightDelay = listener.context.createDelay(1.0);
      const splitter = listener.context.createChannelSplitter(2);
      const merger = listener.context.createChannelMerger(2);

      this.leftDelay.delayTime.setValueAtTime(0.0, listener.context.currentTime);
      this.rightDelay.delayTime.setValueAtTime(0.0, listener.context.currentTime);

      // this.panner.connect(splitter);
      // splitter.connect(this.leftDelay, 0, 0);
      // splitter.connect(this.rightDelay, 1, 0);
      this.leftGain.connect(this.leftDelay);
      this.rightGain.connect(this.rightDelay);

      this.leftDelay.connect(merger, 0, 0);
      this.rightDelay.connect(merger, 0, 1);
      merger.connect(this.gain);

      // this.panner.connect(this.gain);
    } catch (e) {
      Log.info(e);
    }
  }

  disconnect(): this {
    super.disconnect();
    this.panner.disconnect(this.gain);
    return this;
  }

  // setNodeSource(audioNode: AudioNode) {

  //   this.hasPlaybackControl = false;
  //   this.sourceType = 'audioNode';
  //   this.source = audioNode as AudioBufferSourceNode;
  //   audioNode.connect(this.panner);
  //   return this;
  // }

  connect() {
    super.connect();
    // if (this.filters.length > 0) {
    //   this.source.connect(this.filters[0]);
    //   for (let i = 1, l = this.filters.length; i < l; i++) {
    //     this.filters[i - 1].connect(this.filters[i]);
    //   }
    //   this.filters[this.filters.length - 1].connect(this.getOutput());
    // } else {
    this.source.connect(this.panner);
    // }

    Log.once('connected');

    // this._connected = true;
    return this;

  }

  getOutput(): GainNode {
    return this.gain;
  }

  // getRefDistance(): number {
  //   return this.panner.refDistance;
  // }

  // setRefDistance(value: number) {
  //   this.panner.refDistance = value;
  //   return this;
  // }

  // getRolloffFactor(): number {
  //   return this.panner.rolloffFactor;
  // }

  // setRolloffFactor(value: number) {
  //   this.panner.rolloffFactor = value;
  //   return this;
  // }

  // getDistanceModel(): DistanceModelType {
  //   return this.panner.distanceModel;
  // }

  // setDistanceModel(value: DistanceModelType) {
  //   this.panner.distanceModel = value;
  //   return this;
  // }

  // getMaxDistance(): number {
  //   return this.panner.maxDistance;
  // }

  // setMaxDistance(value: number): this {
  //   this.panner.maxDistance = value;
  //   return this;
  // }

  // setDirectionalCone(coneInnerAngle: number,
  //   coneOuterAngle: number, coneOuterGain: number) {
  //   this.panner.coneInnerAngle = coneInnerAngle;
  //   this.panner.coneOuterAngle = coneOuterAngle;
  //   this.panner.coneOuterGain = coneOuterGain;
  //   return this;
  // }

  private leftEar = new THREE.Vector3(-0.07, 0, 0);
  private rightEar = new THREE.Vector3(0.07, 0, 0);
  private d = new THREE.Vector3();
  updateMatrixWorld(force: boolean) {
    super.updateMatrixWorld(force);
    this.matrixWorld.decompose(this._position, this._quaternion, this._scale);
    this._orientation.set(0, 0, 1).applyQuaternion(this._quaternion);
    this.listener.worldToLocal(this._position);

    // const th = Math.PI * 2 * ((window.performance.now() / 4000) % 1);
    // const r = 3 * Math.sin(th * 2);
    // const x = r * Math.cos(th);
    // const z = r * Math.sin(th);

    // this._position.x = x;
    // this._position.z = z;

    this.d.copy(this._position);
    this.d.sub(this.leftEar);
    const leftDistance = this.d.length();
    this.d.copy(this._position);
    this.d.sub(this.rightEar);
    const rightDistance = this.d.length();

    this.d.copy(this._position);
    this.d.normalize();
    this.leftGain.gain.setTargetAtTime(
      Math.min(1, Math.max(0, 1 - this.d.x)),
      this.context.currentTime, this.listener.timeDelta);
    this.rightGain.gain.setTargetAtTime(
      Math.min(1, Math.max(0, this.d.x + 1)),
      this.context.currentTime, this.listener.timeDelta);

    const endTime = this.context.currentTime + this.listener.timeDelta;
    this.leftDelay.delayTime.setTargetAtTime(
      leftDistance / 343, this.context.currentTime, this.listener.timeDelta);
    this.rightDelay.delayTime.setTargetAtTime(
      rightDistance / 343, this.context.currentTime, this.listener.timeDelta);


    // const panner = this.panner;
    // if (panner.positionX) {
    //   // code path for Chrome and Firefox (see #14393)
    //   panner.positionX.linearRampToValueAtTime(this._position.x, endTime);
    //   panner.positionY.linearRampToValueAtTime(this._position.y, endTime);
    //   panner.positionZ.linearRampToValueAtTime(this._position.z, endTime);
    //   panner.orientationX.linearRampToValueAtTime(this._orientation.x, endTime);
    //   panner.orientationY.linearRampToValueAtTime(this._orientation.y, endTime);
    //   panner.orientationZ.linearRampToValueAtTime(this._orientation.z, endTime);
    // } else {
    //   panner.setPosition(this._position.x, this._position.y, this._position.z);
    //   panner.setOrientation(this._orientation.x, this._orientation.y, this._orientation.z);
    // }
  }
}