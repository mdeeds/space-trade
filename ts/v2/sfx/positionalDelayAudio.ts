import * as THREE from "three";
import { Log } from "../log";

export class PositionalDelayAudio extends THREE.Audio {

  private _position = /*@__PURE__*/ new THREE.Vector3();
  private _quaternion = /*@__PURE__*/ new THREE.Quaternion();
  private _scale = /*@__PURE__*/ new THREE.Vector3();
  private _orientation = /*@__PURE__*/ new THREE.Vector3();

  private panner: PannerNode;
  private leftDelay: DelayNode;
  private rightDelay: DelayNode;

  constructor(listener: THREE.AudioListener) {
    super(listener);
    this.panner = this.context.createPanner();
    this.panner.panningModel = 'equalpower';
    this.leftDelay = listener.context.createDelay();
    this.rightDelay = listener.context.createDelay();

    this.panner.connect(this.leftDelay, 0);
    this.panner.connect(this.rightDelay, 1);

    this.leftDelay.connect(this.gain);
    this.rightDelay.connect(this.gain);
  }

  disconnect(): this {
    super.disconnect();
    this.panner.disconnect(this.gain);
    return this;
  }

  getOutput(): GainNode {
    return this.gain;
  }

  getRefDistance(): number {
    return this.panner.refDistance;
  }

  setRefDistance(value: number) {
    this.panner.refDistance = value;
    return this;
  }

  getRolloffFactor(): number {
    return this.panner.rolloffFactor;
  }

  setRolloffFactor(value: number) {
    this.panner.rolloffFactor = value;
    return this;
  }

  getDistanceModel(): DistanceModelType {
    return this.panner.distanceModel;
  }

  setDistanceModel(value: DistanceModelType) {
    this.panner.distanceModel = value;
    return this;
  }

  getMaxDistance(): number {
    return this.panner.maxDistance;
  }

  setMaxDistance(value: number): this {
    this.panner.maxDistance = value;
    return this;
  }

  setDirectionalCone(coneInnerAngle: number,
    coneOuterAngle: number, coneOuterGain: number) {
    this.panner.coneInnerAngle = coneInnerAngle;
    this.panner.coneOuterAngle = coneOuterAngle;
    this.panner.coneOuterGain = coneOuterGain;
    return this;
  }

  private leftEar = new THREE.Vector3(-0.07, 0, 0);
  private rightEar = new THREE.Vector3(0.07, 0, 0);
  private d = new THREE.Vector3();
  updateMatrixWorld(force: boolean) {
    Log.once('updateMatrixWorld');
    super.updateMatrixWorld(force);
    if (this.hasPlaybackControl === true && this.isPlaying === false) return;
    this.matrixWorld.decompose(this._position, this._quaternion, this._scale);
    this._orientation.set(0, 0, 1).applyQuaternion(this._quaternion);

    this.d.copy(this._position);
    this.d.sub(this.leftEar);
    const leftDistance = this.d.length();
    this.d.copy(this._position);
    this.d.sub(this.rightEar);
    const rightDistance = this.d.length();

    Log.once('updateMatrixWorld A');
    const endTime = this.context.currentTime + this.listener.timeDelta;
    this.leftDelay.delayTime.linearRampToValueAtTime(
      leftDistance / 343, endTime);
    this.rightDelay.delayTime.linearRampToValueAtTime(
      rightDistance / 343, endTime);

    Log.once('updateMatrixWorld B');
    const panner = this.panner;
    if (panner.positionX) {
      Log.once('updateMatrixWorld C');
      // code path for Chrome and Firefox (see #14393)
      panner.positionX.linearRampToValueAtTime(this._position.x, endTime);
      panner.positionY.linearRampToValueAtTime(this._position.y, endTime);
      panner.positionZ.linearRampToValueAtTime(this._position.z, endTime);
      panner.orientationX.linearRampToValueAtTime(this._orientation.x, endTime);
      panner.orientationY.linearRampToValueAtTime(this._orientation.y, endTime);
      panner.orientationZ.linearRampToValueAtTime(this._orientation.z, endTime);
    } else {
      Log.once('updateMatrixWorld D');
      panner.setPosition(this._position.x, this._position.y, this._position.z);
      panner.setOrientation(this._orientation.x, this._orientation.y, this._orientation.z);
    }
    Log.once('updateMatrixWorld done');
  }
}