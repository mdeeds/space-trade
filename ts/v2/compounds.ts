export class Compounds {
  constructor() {
    // Class-S
    this.addUpgrade(['borosilicate', 'glass', 'glass-rod', 'glass-cone', 'glass-large-cylinder', 'glass-cube']);
    this.addUpgrade(['lithium-silicate', 'silicone', '', 'silicone-point', 'silicone-wedge', 'silicon-lopped', 'silicon-cube']);

    // Class-M
    this.addUpgrade(['iron-chondrite', 'iron', 'steel-corner', 'steel-wedge', 'iron-cube'])

    // Class-C
    this.addUpgrade(['carbon-chondrite', 'carbon-fiber',
      'carbon-fiber-corner', 'carbon-fiber-wedge', 'carbon-fiber-cube']);

    // Right slice
    this.add('iron-chondrite', 'carbon-chondrite', 'Cube.001');
    this.add('iron', 'carbon-fiber', 'fuel');
    this.add('steel-corner', 'carbon-fiber-corner', 'cluster-jet');
    this.add('steel-wedge', 'carbon-fiber-wedge', 'chair');

    // Front slice
    this.add('borosilicate', 'iron-chondrite', 'nutrient');
    this.add('glass', 'iron', 'Cube.013');
    this.add('glass-rod', 'steel-corner', 'composite-slab');
    this.add('glass-cone', 'steel-wedge', 'thruster-jet');
    this.add('glass-large-cylinder', 'iron-cube', 'factory');

    // Middle slice
    this.add('Cube.005', 'Cube.001', 'food');
    this.add('fuel-tank', 'fuel', 'full-tank');

    // Back slice
    this.add('lithium-silicate', 'carbon-chondrite', 'organics');
    this.add('silicone', 'carbon-fiber', 'Cube.010');
    this.add('silicone-point', 'carbon-fiber-corner', 'wheel');
    this.add('silicon-lopped', 'carbon-fiber-cube', 'computer');

    // Left slice
    this.add('lithium-silicate', 'borosilicate', 'Cube.005');
    this.add('silicone', 'glass', 'fuel-tank');
    this.add('silicone-point', 'glass-rod', 'scanner');
    this.add('silicone-wedge', 'glass-cone', 'solar-panel');
    this.add('silicon-lopped', 'glass-large-cylinder', 'conveyer');
  }


  private combinations = new Map<string, string>();
  private breaks = new Map<string, string[]>();

  private comboKey(a: string, b: string): string {
    if (a < b) {
      return a + '+' + b;
    } else {
      return b + '+' + a;
    }
  }

  addUpgrade(sequence: string[]) {
    for (let i = 0; i < sequence.length - 1; ++i) {
      this.add(sequence[i], sequence[i], sequence[i + 1]);
    }
  }

  add(a: string, b: string, combined: string) {
    this.combinations.set(this.comboKey(a, b), combined);
    this.breaks.set(combined, [a, b]);
  }

  combine(a: string, b: string): string {
    const key = this.comboKey(a, b);
    if (this.combinations.has(key)) {
      return this.combinations.get(key);
    } else {
      return undefined;
    }
  }

  break(a: string): string[] {
    if (this.breaks.has(a)) {
      return this.breaks.get(a);
    } else {
      return undefined;
    }
  }

  allCompoundNames(): Iterable<string> {
    const names = new Set<string>();
    for (const [a, [b, c]] of this.breaks.entries()) {
      for (const item of [a, b, c]) {
        names.add(item);
      }
    }
    return names.values();
  }
}