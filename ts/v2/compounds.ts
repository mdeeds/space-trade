export class Compounds {
  constructor() {
    // Silicone
    this.addUpgrade(['borosilicate', 'glass', 'glass-corner', 'glass-wedge', 'glass-cube']);

    // Water
    this.addUpgrade(['phylosilicate', 'water-ice', 'polyoxide-corner', 'polyoxide-wedge', 'polyoxide-cube']);

    // Iron
    this.addUpgrade(['iron-chondrite', 'iron', 'iron-corner', 'iron-wedge', 'iron-cube'])

    // Carbon
    this.addUpgrade(['carbon-chondrite', 'carbon-fiber',
      'carbon-fiber-corner', 'carbon-fiber-wedge', 'carbon-fiber-cube']);

    // Architect Iron+Carbon
    this.add('iron-chondrite', 'carbon-chondrite', 'point');
    this.add('iron', 'carbon-fiber', 'rod');
    this.add('iron-corner', 'carbon-fiber-corner', 'cone');
    this.add('iron-wedge', 'carbon-fiber-wedge', 'cylinder');
    this.add('iron-cube', 'carbon-fiber-cube', 'habitat');

    // Farmer Water+Carbon
    this.add('borosilicate', 'carbon-chondrite', 'mud');
    this.add('silicone', 'carbon-fiber', 'food');
    this.add('glass-corner', 'carbon-fiber-corner', 'composite-slab');
    this.add('glass-wedge', 'carbon-fiber-wedge', 'thruster-jet');
    this.add('glass-cube', 'carbon-fiber-cube', 'fuel');

    // Pilot Iron+Silicon
    this.add('iron-chondrite', 'carbon-chondrite', 'point');
    this.add('iron', 'carbon-fiber', 'rod');
    this.add('iron-corner', 'carbon-fiber-corner', 'cluster-jet');
    this.add('iron-wedge', 'carbon-fiber-wedge', 'chair');
    this.add('iron-cube', 'carbon-fiber-cube', 'thruster');

    // Engineer Silicon+Water
    this.add('borosilicate', 'phylosilicate', 'scaffold');
    this.add('silicone', 'water-ice', 'Cube.010');
    this.add('glass-corner', 'polyoxide-corner', 'wheel');
    this.add('glass-wedge', 'polyoxide-wedge', 'conveyor');
    this.add('glass-cube', 'polyoxide-cube', 'factory');
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