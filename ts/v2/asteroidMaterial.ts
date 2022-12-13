import * as THREE from "three";
import { Constants } from "./constants";
import { Log } from "./log";

export class AsteroidMaterial extends THREE.ShaderMaterial {
    // src/renderers/shaders/ShaderChunk/common.glsl.js
    private constructor(color: THREE.Color,
        tex_low: THREE.Texture, tex_mid: THREE.Texture, tex_hig: THREE.Texture) {
        super({
            vertexShader: `
#define EPSILON 1e-6
uniform float logDepthBufFC;
varying vec3 vNormal;
varying vec3 vMxyz;
varying vec3 vColor;
void main() {
    vMxyz = position;
    vNormal = normal;
    vColor = color;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );

    gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
    gl_Position.z *= gl_Position.w;
}
            `,
            fragmentShader: `
varying vec3 vNormal;
varying vec3 vColor;
uniform sampler2D tex_low;
uniform sampler2D tex_mid;
uniform sampler2D tex_hig;
varying vec3 vMxyz;
void main() {
    float intensity = (0.2 + clamp(vNormal.y, 0.0, 1.0));

    vec3 mxyz = vMxyz;

    vec3 o1 = mod(mxyz * 0.04, 1.0);
    vec3 o2 = mod(mxyz * 0.5, 1.0);
    vec3 o3 = mod(mxyz * 3.1, 1.0);
    vec3 rates = vec3(0.5, 0.3, 0.2);

    float lxy = dot(rates, vec3(texture(tex_low, o1.xy).r, texture(tex_mid, o2.xy).r, texture(tex_hig, o3.xy).r));
    float lyz = dot(rates, vec3(texture(tex_low, o1.yz).r, texture(tex_mid, o2.yz).r, texture(tex_hig, o3.yz).r));
    float lzx = dot(rates, vec3(texture(tex_low, o1.zx).r, texture(tex_mid, o2.zx).r, texture(tex_hig, o3.zx).r));

    float lightness = lxy * smoothstep(0.2, 1.0, abs(vNormal.z)) + lyz * smoothstep(0.2, 1.0, abs(vNormal.x)) + lzx * smoothstep(0.2, 1.0, abs(vNormal.y));

    gl_FragColor = vec4(lightness * intensity * vColor, 1.0);
}
            `,
            depthTest: true,
            depthWrite: true,
            blending: THREE.NormalBlending,
            side: THREE.FrontSide,
            transparent: false,
            vertexColors: true,
            uniforms: {
                baseColor: { value: color },
                tex_low: { value: tex_low },
                tex_mid: { value: tex_mid },
                tex_hig: { value: tex_hig },
                logDepthBufFC: {
                    value:
                        2.0 / (Math.log(Constants.cameraFar + 1.0) / Math.LN2)
                },
            }
        });
        super.uniformsNeedUpdate = true;
    }

    private static async loadTex(name: string): Promise<THREE.Texture> {
        const loader = new THREE.ImageLoader();
        return new Promise<THREE.Texture>((resolve, reject) => {
            loader.load('images/astro_tex.png',
                (image: HTMLImageElement) => {
                    const tex = new THREE.Texture(image);
                    tex.needsUpdate = true;
                    resolve(tex);
                },
                null,
                (e: ErrorEvent) => { reject(e) });
        })
    }

    static async make(color: THREE.ColorRepresentation): Promise<AsteroidMaterial> {
        const c = new THREE.Color(color);
        const tex_low = await AsteroidMaterial.loadTex('images/astro_tex_low.png');
        const tex_mid = await AsteroidMaterial.loadTex('images/astro_tex_mid.png');
        const tex_hig = await AsteroidMaterial.loadTex('images/astro_tex_hig.png');
        return new Promise<AsteroidMaterial>((resolve, reject) => {
            resolve(new AsteroidMaterial(c, tex_low, tex_mid, tex_hig));
        })
    }
}
