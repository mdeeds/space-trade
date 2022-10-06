import * as THREE from "three";
import { S } from "../settings";
import { Log } from "./log";

export class NebulaCloud extends THREE.Object3D {
  private material: THREE.ShaderMaterial;
  private geometry: THREE.BufferGeometry;

  private tex: THREE.Texture;

  constructor() {
    super();

    const loader = new THREE.ImageLoader();
    loader.load('images/neb1.png',
      (image: HTMLImageElement) => {
        Log.info('Image loaded.');
        this.tex = new THREE.Texture(image);
        this.tex.needsUpdate = true;
        this.buildStars();
      },
      null,
      (e: ErrorEvent) => { Log.info(`Error: ${e.message}`) });
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
        col.push(1, 1, 1);
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
      uniforms: {
        'tex': { value: this.tex },
      },
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
          if (vIntensity > 0.001) {
            mvPosition += r * vec4(dxy, 0.0, 0.0); 
          }
          gl_Position = projectionMatrix * mvPosition;
        }`,
      fragmentShader: `
        varying float vIntensity;
        varying vec3 vColor;
        varying vec2 vDxy;
        uniform sampler2D tex;
        void main() {
          // float intensity = vIntensity * smoothstep(1.0, 0.6, length(vDxy));
          // gl_FragColor = vec4(vColor * intensity, ${alpha.toFixed(3)});

          vec3 c1 = 1.0 - texture(tex, vDxy * 0.5 + 0.5).rga;
          vec3 c2 = vec3(1, vDxy * 0.5 + 0.5);
          vec3 col = c1; // + c2;

          gl_FragColor = vec4(vColor * col, ${alpha.toFixed(3)});
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

    this.material.uniformsNeedUpdate = true;

    const points = new THREE.Mesh(this.geometry, this.material);
    this.add(points);
  }
}