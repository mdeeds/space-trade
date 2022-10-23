import * as THREE from "three";
import { Log } from "./log";

export class AsteroidMaterial extends THREE.ShaderMaterial {
    private constructor(color: THREE.Color, private tex: THREE.Texture) {
        super({
            vertexShader: `
  varying vec3 vNormal;
  varying vec3 vMxyz;
  void main() {
    vMxyz = position;
    vNormal = normal;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
  }
            `,
            fragmentShader: `
  varying vec3 vNormal;
  uniform vec3 baseColor;
  uniform sampler2D tex;
  varying vec3 vMxyz;
  void main() {
    float intensity = (0.2 + clamp(vNormal.y, 0.0, 1.0));

    vec3 mxyz = vMxyz;

    vec3 o1 = mod(mxyz * 0.04, 1.0);
    vec3 o2 = mod(mxyz * 0.5, 1.0);
    vec3 o3 = mod(mxyz * 3.1, 1.0);
    vec3 rates = vec3(0.5, 0.3, 0.2);

    float lxy = dot(rates, vec3(texture(tex, o1.xy).r, texture(tex, o2.xy).r, texture(tex, o3.xy).r));
    float lyz = dot(rates, vec3(texture(tex, o1.yz).r, texture(tex, o2.yz).r, texture(tex, o3.yz).r));
    float lzx = dot(rates, vec3(texture(tex, o1.zx).r, texture(tex, o2.zx).r, texture(tex, o3.zx).r));

    float lightness = lxy * smoothstep(0.2, 1.0, abs(vNormal.z)) + lyz * smoothstep(0.2, 1.0, abs(vNormal.x)) + lzx * smoothstep(0.2, 1.0, abs(vNormal.y));

    gl_FragColor = vec4(lightness * intensity * baseColor, 1.0);
  }
            `,
            depthTest: true,
            depthWrite: true,
            blending: THREE.NormalBlending,
            side: THREE.FrontSide,
            transparent: false,
            vertexColors: false,
            uniforms: {
                baseColor: { value: color },
                tex: { value: tex },
            }
        });
        super.uniformsNeedUpdate = true;


    }

    static async make(color: THREE.ColorRepresentation): Promise<AsteroidMaterial> {
        const c = new THREE.Color(color);
        const loader = new THREE.ImageLoader();
        let tex: THREE.Texture;
        return new Promise<AsteroidMaterial>((resolve, reject) => {
            loader.load('images/astro_tex.png',
                (image: HTMLImageElement) => {
                    tex = new THREE.Texture(image);
                    tex.needsUpdate = true;
                    resolve(new AsteroidMaterial(c, tex));
                },
                null,
                (e: ErrorEvent) => { reject(e) });
        })
    }
}
