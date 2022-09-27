

export class Buzz {
  private gain: GainNode;
  private osc: OscillatorNode;
  private filter: BiquadFilterNode;
  constructor(ctx: AudioContext, hz: number) {
    this.gain = ctx.createGain();
    this.osc = ctx.createOscillator();
    this.filter = ctx.createBiquadFilter();

    this.osc.frequency.setValueAtTime(hz, ctx.currentTime);
    this.osc.type = 'square';
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(hz * 4, ctx.currentTime);
    this.gain.gain.setValueAtTime(0.15, ctx.currentTime);
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
}