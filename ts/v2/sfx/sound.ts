import * as THREE from "three";
import { TriggerInterface, TriggerNode } from "./triggerInterface";


type SfxFactory = () => TriggerNode;

class SfxCollection {
  constructor(private source: THREE.Audio) { }

  private sfx = new Map<string, TriggerNode>();
  getOrMake(name: string, factory: SfxFactory): TriggerNode {
    if (this.sfx.has(name)) {
      return this.sfx.get(name);
    }

    const result = factory();
    this.sfx.set(name, result);
    result.getNode().connect(this.source.gain);
    return result;
  }
}

export class Sound {
  private ctx: AudioContext;
  constructor(private listener: THREE.AudioListener) {
    this.ctx = listener.context;

  }

  private audioMap = new Map<string, THREE.Audio>();
  private audioObjectMap = new Map<THREE.Object3D, THREE.Audio>();
  makeAudio(id: string, source: THREE.Object3D): THREE.Audio {
    const audio = new THREE.Audio(this.listener);
    this.audioMap.set(id, audio);
    this.audioObjectMap.set(source, audio);
    source.add(audio);
    return audio;
  }

  private sfxObjectMap = new Map<THREE.Object3D, SfxCollection>();
  playOnObject(object: THREE.Object3D, soundName: string) {
    const audio = this.audioObjectMap.get(object);
    if (!audio) {
      throw new Error('No audio created on object.');
    }
    if (!this.sfxObjectMap.has(object)) {
      this.sfxObjectMap.set(object, new SfxCollection(audio));
    }
    // TODO: Implement factory.
    this.sfxObjectMap.get(object)
      .getOrMake(soundName, () => { return undefined });
  }

}