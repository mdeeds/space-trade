import { AudioTrigger } from "./audioTrigger";

export class OooSound implements AudioTrigger {
  private oscillator: OscillatorNode;
  private gain: GainNode;

  constructor(private audioContext: AudioContext) {
    this.oscillator = audioContext.createOscillator();
    this.oscillator.frequency.value = 220;
    this.gain = audioContext.createGain();
    this.gain.gain.setValueAtTime(0, audioContext.currentTime);
    this.oscillator.connect(this.gain);
    this.gain.connect(audioContext.destination);
    this.oscillator.start();
  }

  trigger(time: number): void {
    // this.gain.gain.setValueAtTime(0, time);
    this.gain.gain.linearRampToValueAtTime(1, time + 0.1);
    this.gain.gain.linearRampToValueAtTime(0.2, time + 0.6);
  }

  release(time: number): void {
    this.gain.gain.linearRampToValueAtTime(0, time + 1);
    this.oscillator.stop(time + 1);
  }
}