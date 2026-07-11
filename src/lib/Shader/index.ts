import * as THREE from "three";

export type AsciiUniforms = {
    uAsciiInk: { value: THREE.Color };
    uAsciiPaper: { value: THREE.Color };
    uAsciiGlow: { value: THREE.Color };
    uAsciiCellSize: { value: number };
    uOpacity: { value: number };
    uTime: { value: number };
};

const ASCII_SHADER_KEY = "ascii-dither-surface-v7";

export function createAsciiUniforms(): AsciiUniforms {
    return {
        uAsciiInk: { value: new THREE.Color("#6d28d9") },
        uAsciiPaper: { value: new THREE.Color("#f3edfb") },
        uAsciiGlow: { value: new THREE.Color("#c4b5fd") },
        uAsciiCellSize: { value: 4.0 },
        uOpacity: { value: 0.5 },
        uTime: { value: 0.0 },
    };
}

const ASCII_DITHER_FRAGMENT = `
uniform vec3 uAsciiInk;
uniform vec3 uAsciiPaper;
uniform vec3 uAsciiGlow;
uniform float uAsciiHasTexture;
uniform float uAsciiCellSize;
uniform float uOpacity;  

float asciiHash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float asciiHalftoneDot(vec2 cellUv, vec2 cellId, float darkness) {
    vec2 centered = cellUv - 0.5;
    float dist = length(centered);
    float jitter = (asciiHash(cellId) - 0.5) * 0.06;
    float radius = clamp(darkness * 0.55 + jitter, 0.0, 0.55);

    return 1.0 - smoothstep(radius - 0.05, radius, dist);
}

vec4 asciiDitherColor(vec3 sourceColor, float sourceAlpha) {
    float luminance = dot(sourceColor, vec3(0.299, 0.587, 0.114));
    float darkness = 1.0 - luminance;
    vec2 grid = gl_FragCoord.xy / uAsciiCellSize;
    vec2 cellId = floor(grid);
    vec2 cellUv = fract(grid);

    float inkAmount = asciiHalftoneDot(cellUv, cellId, darkness);

    vec3 paper = mix(uAsciiPaper, uAsciiGlow, smoothstep(0.45, 0.95, luminance));
    vec3 finalColor = mix(paper, uAsciiInk, inkAmount);
    float flatAlpha = inkAmount * 0.6;
    float finalAlpha = mix(flatAlpha, sourceAlpha, uAsciiHasTexture);
    
    finalAlpha *= uOpacity;

    return vec4(finalColor, finalAlpha);
}
`;

export function styleMaterial(material: THREE.Material, uniforms: AsciiUniforms): THREE.Material {
    const styled = material.clone();
    const hasTexture = Boolean((material as THREE.MeshStandardMaterial).map);
    const hasTextureUniform = { value: hasTexture ? 1 : 0 };

    styled.onBeforeCompile = (shader) => {
        shader.uniforms.uAsciiInk = uniforms.uAsciiInk;
        shader.uniforms.uAsciiPaper = uniforms.uAsciiPaper;
        shader.uniforms.uAsciiGlow = uniforms.uAsciiGlow;
        shader.uniforms.uAsciiCellSize = uniforms.uAsciiCellSize;
        shader.uniforms.uAsciiHasTexture = hasTextureUniform;
        shader.uniforms.uOpacity = uniforms.uOpacity;
        shader.uniforms.uTime = uniforms.uTime;

        shader.vertexShader = shader.vertexShader
            .replace("#include <common>", `#include <common>\nuniform float uTime;`)
            .replace(
                "#include <project_vertex>",
                `
                vec4 mvPosition = vec4( transformed, 1.0 );
                #ifdef USE_INSTANCING
                    mvPosition = instanceMatrix * mvPosition;
                #endif
                mvPosition = modelViewMatrix * mvPosition;
                vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
                float h = max(0.0, worldPos.y + 10.0);
                float sway = sin(uTime * 0.8 - h * 0.1) * (h * h * 0.001);
                mvPosition.x += sway;
                gl_Position = projectionMatrix * mvPosition;
                `
            );

        shader.fragmentShader = shader.fragmentShader
            .replace("#include <common>", `#include <common>\n${ASCII_DITHER_FRAGMENT}`)
            .replace(
                "#include <map_fragment>",
                "#include <map_fragment>\ndiffuseColor = asciiDitherColor(diffuseColor.rgb, diffuseColor.a);"
            );
    };

    styled.customProgramCacheKey = () => ASCII_SHADER_KEY;
    styled.needsUpdate = true;

    if ("roughness" in styled) {
        (styled as THREE.MeshStandardMaterial).roughness = 0.92;
    }
    if ("metalness" in styled) {
        (styled as THREE.MeshStandardMaterial).metalness = 0.02;
    }

    styled.transparent = true;
    styled.depthWrite = false;
    styled.alphaTest = 0.0;

    return styled;
}