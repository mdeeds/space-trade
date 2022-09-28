import { Log } from "./log";


export class Buzz {
  private gain: GainNode;
  private osc: OscillatorNode;
  private filter: BiquadFilterNode;
  constructor(private ctx: AudioContext, private hz: number) {
    this.gain = ctx.createGain();
    this.osc = ctx.createOscillator();
    this.filter = ctx.createBiquadFilter();

    this.osc.frequency.setValueAtTime(hz, ctx.currentTime);
    this.osc.type = 'square';
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(hz * 4, ctx.currentTime);
    this.gain.gain.setValueAtTime(0.0, ctx.currentTime);
    this.osc.connect(this.filter);
    this.filter.connect(this.gain);

    this.osc.start();
  }

  public connect(target: AudioNode) {
    this.gain.connect(target);
  }

  public getGain(): GainNode {
    return this.gain;
  }

  private isOn = false;
  public setState(on: boolean) {
    if (on != this.isOn) {
      if (on) {
        this.gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime);
        this.gain.gain.exponentialRampToValueAtTime(0.02, this.ctx.currentTime + 0.3);
        this.filter.frequency.setValueAtTime(this.hz * 4, this.ctx.currentTime);
        this.filter.frequency.setTargetAtTime(this.hz * 1.5, this.ctx.currentTime + 0.05, 2.0);
      } else {
        this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.0);
        this.filter.frequency.setTargetAtTime(this.hz, this.ctx.currentTime, 0.5);
      }
    }
    this.isOn = on;
  }

}