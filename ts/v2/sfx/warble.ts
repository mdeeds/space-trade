


class Intonation {
  private fundamental: number;
  constructor(f: number, private cutoff: number, private gain) {
    this.fundamental = Math.pow(2, f);
  }

  public inflect(
    basHz: number,
    osc: OscillatorNode, gain: GainNode, filter: BiquadFilterNode) {
    const ctx = osc.context;
    osc.frequency.setTargetAtTime(basHz * this.fundamental, ctx.currentTime, 0.05);
    gain.gain.setTargetAtTime(this.gain * 0.1, ctx.currentTime, 0.05);
    filter.frequency.setTargetAtTime(basHz * this.cutoff, ctx.currentTime, 0.05);
  }
}


export class Warble {
  private osc: OscillatorNode;
  private gain: GainNode;
  private filter: BiquadFilterNode;

  private toneMap = new Map<string, Intonation>();

  constructor(target: AudioNode) {
    const ctx = target.context;
    this.osc = ctx.createOscillator();
    this.osc.frequency.setValueAtTime(170, ctx.currentTime);
    this.osc.type = 'square';

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.Q.setValueAtTime(1.5, ctx.currentTime);

    this.gain = ctx.createGain();
    this.gain.gain.setValueAtTime(0, ctx.currentTime);

    this.osc.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(target);

    this.initTones();

    this.osc.start();
  }
  public intone(ch: string) {
    let tone: Intonation;
    if (this.toneMap.has(ch)) {
      tone = this.toneMap.get(ch);
    } else {
      tone = this.toneMap.get(' ');
    }
    tone.inflect(170, this.osc, this.gain, this.filter);
  }

  private initTones() {
    this.toneMap.set('a', new Intonation(0.0, 4.0, 1.0));
    this.toneMap.set('b', new Intonation(-0.3, 3.0, 1.0));
    this.toneMap.set('c', new Intonation(0.3, 3.0, 1.0));
    this.toneMap.set('d', new Intonation(0.0, 3.0, 1.0));
    this.toneMap.set('e', new Intonation(-0.2, 4.0, 1.0));
    this.toneMap.set('f', new Intonation(0.1, 4.0, 1.0));
    this.toneMap.set('g', new Intonation(0.0, 4.0, 1.0));
    this.toneMap.set('h', new Intonation(0.0, 3.0, 1.0));
    this.toneMap.set('i', new Intonation(0.3, 4.0, 1.0));
    this.toneMap.set('j', new Intonation(0.3, 4.0, 1.0));
    this.toneMap.set('k', new Intonation(0.0, 3.0, 1.0));
    this.toneMap.set('l', new Intonation(0.0, 4.0, 1.0));
    this.toneMap.set('m', new Intonation(-0.4, 4.0, 1.0));
    this.toneMap.set('n', new Intonation(-0.3, 3.0, 1.0));
    this.toneMap.set('o', new Intonation(0.2, 3.0, 1.0));
    this.toneMap.set('p', new Intonation(0.0, 4.0, 1.0));
    this.toneMap.set('q', new Intonation(0.0, 4.0, 1.0));
    this.toneMap.set('r', new Intonation(0.0, 4.0, 1.0));
    this.toneMap.set('s', new Intonation(-0.1, 3.0, 1.0));
    this.toneMap.set('t', new Intonation(-0.2, 3.0, 1.0));
    this.toneMap.set('u', new Intonation(0.3, 4.0, 1.0));
    this.toneMap.set('v', new Intonation(0.4, 4.0, 1.0));
    this.toneMap.set('w', new Intonation(-0.2, 4.0, 1.0));
    this.toneMap.set('x', new Intonation(-0.3, 4.0, 1.0));
    this.toneMap.set('y', new Intonation(0.4, 4.0, 1.0));
    this.toneMap.set('z', new Intonation(0.0, 4.0, 1.0));
    this.toneMap.set('.', new Intonation(0.0, 0.5, 0));
    this.toneMap.set(' ', new Intonation(0.0, 4.0, 0));
  }
}