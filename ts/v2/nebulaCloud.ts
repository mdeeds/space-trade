import * as THREE from "three";
import { S } from "../settings";

export class NebulaCloud extends THREE.Object3D {
  private material: THREE.ShaderMaterial;
  private geometry: THREE.BufferGeometry;

  constructor() {
    super();
    this.buildStars();
  }

  buildStars() {
    const numStars = S.float('nebn');
    const radius = S.float('nebr');
    const size = S.float('nebs');
    const alpha = S.float('neba');

    const index: number[] = [];
    const pos: number[] = [];
    const col: number[] = [];
    const dxy: number[] = [];
    const r: number[] = [];

    for (let i = 0; i < numStars; ++i) {
      const v = new THREE.Vector3(
        (Math.random() * 2 - 1) * radius,
        (Math.random() * 2 - 1) * radius,
        (Math.random() * 2 - 1) * radius);
      const o = Math.round(pos.length / 3);
      index.push(o + 0, o + 1, o + 2, o + 2, o + 3, o + 0);
      for (let j = 0; j < 4; ++j) {
        pos.push(v.x, v.y, v.z);
        col.push(0.5 * Math.sin(6.2 * v.x / radius) + 0.5,
          0,
          0.5 * Math.cos(7.7 * v.y / radius) * Math.sin(9 * v.z / radius) + 0.5);
      }
      dxy.push(-1, -1, 1, -1, 1, 1, -1, 1);
      r.push(size, size, size, size);
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position',
      new THREE.BufferAttribute(new Float32Array(pos), 3));
    this.geometry.setAttribute('color',
      new THREE.BufferAttribute(new Float32Array(col), 3));
    this.geometry.setAttribute('dxy',
      new THREE.BufferAttribute(new Float32Array(dxy), 2));
    this.geometry.setAttribute('r',
      new THREE.BufferAttribute(new Float32Array(r), 1));
    this.geometry.setIndex(index);

    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e30);


    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute vec2 dxy;
        attribute float r;
        attribute float alpha;
        varying vec3 vColor;
        varying vec2 vDxy;
        varying float vIntensity;
        void main() {
          vDxy = dxy;
          vColor = color;
          vIntensity = 1.0;

          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          float distance = length(worldPosition.xyz / worldPosition.w);
          vIntensity = smoothstep(${(size).toFixed(3)}, ${(size * 10).toFixed(3)}, distance);
          // float sizeScale = 1.0 / (distance * 500.0);
          vec4 mvPosition = viewMatrix * worldPosition;
          mvPosition += r * vec4(dxy, 0.0, 0.0); 
          gl_Position = projectionMatrix * mvPosition;
        }`,
      fragmentShader: `
        varying float vIntensity;
        varying vec3 vColor;
        varying vec2 vDxy;
        void main() {
          float intensity = vIntensity * clamp(10.0 - 10.0 * length(vDxy),
            0.0, 1.0);
          gl_FragColor = vec4(vColor * intensity, ${S.float('neba').toFixed(3)});
        }`,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: false,
      vertexColors: true,
      clipping: false,
      clipIntersection: false,
      clippingPlanes: [],
      side: THREE.DoubleSide,
    });

    const points = new THREE.Mesh(this.geometry, this.material);
    this.add(points);
  }
}