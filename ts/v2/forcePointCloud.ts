import * as THREE from "three";
import { Tick, Ticker } from "../tick";

class AtomRule {
  constructor(readonly s: number, readonly r: number) { }
}

class Atom {
  private vel = new THREE.Vector3();
  private lifeS = 30;
  readonly pos = new THREE.Vector3();
  readonly threeColor = new THREE.Color('white');
  constructor(position: THREE.Vector3, private col: string, private f: number) {
    this.pos.copy(position);
    this.threeColor.set(col);
  }

  public getLife(): number { return this.lifeS; }

  private friction = new THREE.Vector3();
  applyForces(allAtoms: Atom[], atomRules: Map<string, Map<string, AtomRule>>,
    deltaS: number) {
    this.lifeS -= deltaS;
    this.friction.copy(this.vel);
    this.friction.multiplyScalar(-1 * this.f * deltaS);
    this.vel.add(this.friction);

    const rules = atomRules.get(this.col);
    if (!rules) return;
    for (const a of allAtoms) {
      if (a === this) continue;
      const rule = rules.get(a.col);
      if (!rule) continue;
      this.applyRule(rule, a, deltaS);
    }
    this.delta.copy(this.vel);
    this.delta.multiplyScalar(deltaS);
    this.pos.add(this.delta);
  }

  private delta = new THREE.Vector3();
  private applyRule(rule: AtomRule, other: Atom, deltaS: number) {
    this.delta.copy(other.pos);
    this.delta.sub(this.pos);

    const x2 = this.delta.lengthSq();
    const x = Math.sqrt(x2);
    const x3 = x * x2;
    const v = this.vel.length();

    // https://docs.google.com/document/d/1u5dQ7iKdMIGNJTiJtpq8ALEvyZpDKhJC0hV8UeUrIxc/edit#heading=h.v83gswbtwelc
    const magnitude = rule.s * (1 / x2 - rule.r / x3);
    this.delta.setLength(magnitude * deltaS);
    this.vel.add(this.delta);
  }
}

export class ForcePointCloud extends THREE.Object3D implements Ticker {
  private material: THREE.ShaderMaterial;
  private geometry: THREE.BufferGeometry;
  private allAtoms: Atom[] = [];
  private atomRules = new Map<string, Map<string, AtomRule>>();

  constructor() {
    super();
    this.addStars();
    const redRules = new Map<string, AtomRule>();
    // Strength, Distance
    redRules.set('red', new AtomRule(0.1, 1));
    redRules.set('blue', new AtomRule(0.1, 0.5));

    const blueRules = new Map<string, AtomRule>();
    blueRules.set('blue', new AtomRule(0.1, 0.5));
    blueRules.set('red', new AtomRule(0.1, 0.5));

    this.atomRules.set('red', redRules);
    this.atomRules.set('blue', blueRules);
  }

  public addStar(pos: THREE.Vector3, color: string) {
    const a = new Atom(pos, color, /*f=*/1.5);
    this.allAtoms.push(a);
  }

  private addStars() {
    const positions: number[] = [];
    const colors: number[] = [];
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position',
      new THREE.Float32BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(
      colors, 3));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        'sizeScale': { value: 1.0 },
      },
      vertexShader: `
        varying vec3 vColor;
        uniform float sizeScale;
        varying float vDistance;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDistance = abs(mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = max(10.0 / vDistance, 2.0);
          
        }`,
      fragmentShader: `
      varying vec3 vColor;
      varying float vDistance;
      void main() {
        vec2 coords = gl_PointCoord;
        float intensity = smoothstep(0.5, 0.4, length(coords - 0.5));
        gl_FragColor = vec4(intensity * vColor, 1.0);
      }`,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: false,
      vertexColors: true,
      clipping: false,
    });

    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3, 1e30);

    const points = new THREE.Points(this.geometry, this.material);
    this.add(points);
  }

  private updatePositions(deltaS: number): void {
    const positions: number[] = [];
    const colors: number[] = [];
    // Simultaneously cull out dead atoms and add the moved atoms to the
    // geometry's position buffer.
    for (let i = 0; i < this.allAtoms.length;) {
      const a = this.allAtoms[i];
      if (a.getLife() <= 0) {
        this.allAtoms.splice(i, 1);
      } else {
        positions.push(a.pos.x, a.pos.y, a.pos.z);
        colors.push(a.threeColor.r, a.threeColor.g, a.threeColor.b);
        ++i;
      }
    }

    for (let i = 0; i < this.allAtoms.length; ++i) {
      this.allAtoms[i].applyForces(this.allAtoms, this.atomRules, deltaS);
    }


    this.geometry.setAttribute('position',
      new THREE.Float32BufferAttribute(positions, 3));
    this.geometry.getAttribute('position').needsUpdate = true;
    this.geometry.setAttribute('color',
      new THREE.Float32BufferAttribute(colors, 3));
    this.geometry.getAttribute('color').needsUpdate = true;
  }

  tick(t: Tick) {
    this.updatePositions(t.deltaS);
  }
}