import * as THREE from "three";
import { Log } from "../log";

export class PositionalDelayAudio extends THREE.Audio {

  private _position = /*@__PURE__*/ new THREE.Vector3();
  private _quaternion = /*@__PURE__*/ new THREE.Quaternion();
  private _scale = /*@__PURE__*/ new THREE.Vector3();
  private _orientation = /*@__PURE__*/ new THREE.Vector3();

  public panner: AudioNode;
  private leftDelay: DelayNode;
  private rightDelay: DelayNode;
  private leftGain: GainNode;
  private rightGain: GainNode;

  constructor(listener: THREE.AudioListener) {
    super(listener);
    try {
      this.panner = this.context.createGain();

      this.leftGain = this.context.createGain();
      this.rightGain = this.context.createGain();
      this.panner.connect(this.leftGain);
      this.panner.connect(this.rightGain);

      this.leftDelay = listener.context.createDelay(1.0);
      this.rightDelay = listener.context.createDelay(1.0);
      const merger = listener.context.createChannelMerger(2);

      this.leftDelay.delayTime.setValueAtTime(0.0, listener.context.currentTime);
      this.rightDelay.delayTime.setValueAtTime(0.0, listener.context.currentTime);

      this.leftGain.connect(this.leftDelay);
      this.rightGain.connect(this.rightDelay);

      this.leftDelay.connect(merger, 0, 0);
      this.rightDelay.connect(merger, 0, 1);
      merger.connect(this.gain);
    } catch (e) {
      Log.info(e);
    }
  }

  getOutput(): GainNode {
    return this.gain;
  }

  private leftEar = new THREE.Vector3(-0.07, 0, 0);
  private rightEar = new THREE.Vector3(0.07, 0, 0);
  private d = new THREE.Vector3();
  updateMatrixWorld(force: boolean) {
    super.updateMatrixWorld(force);
    this.matrixWorld.decompose(this._position, this._quaternion, this._scale);
    this._orientation.set(0, 0, 1).applyQuaternion(this._quaternion);
    this.listener.worldToLocal(this._position);

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

    this.leftDelay.delayTime.setTargetAtTime(
      leftDistance / 343, this.context.currentTime, this.listener.timeDelta);
    this.rightDelay.delayTime.setTargetAtTime(
      rightDistance / 343, this.context.currentTime, this.listener.timeDelta);
  }
}