import * as THREE from "three";

export type AsciiUniforms = {
    uAsciiTime: { value: number };
    uAsciiInk: { value: THREE.Color };
    uAsciiPaper: { value: THREE.Color };
    uAsciiGlow: { value: THREE.Color };
};

const ASCII_SHADER_KEY = "ascii-dither-surface-v3";

export const ASCII_TIME_UNIFORM = { value: 0 };

export function createAsciiUniforms(): AsciiUniforms {
    return {
        uAsciiTime: ASCII_TIME_UNIFORM,
        uAsciiInk: { value: new THREE.Color("#6d28d9") },
        uAsciiPaper: { value: new THREE.Color("#f3edfb") },
        uAsciiGlow: { value: new THREE.Color("#c4b5fd") },
    };
}

const ASCII_DITHER_FRAGMENT = `
uniform float uAsciiTime;
uniform vec3 uAsciiInk;
uniform vec3 uAsciiPaper;
uniform vec3 uAsciiGlow;
uniform float uAsciiHasTexture;

varying vec3 vAsciiWorldPos;

float asciiBayer4(vec2 p) {
    vec2 q = mod(floor(p), 4.0);
    if (q.y < 1.0) {
        if (q.x < 1.0) return 0.0 / 16.0;
        if (q.x < 2.0) return 8.0 / 16.0;
        if (q.x < 3.0) return 2.0 / 16.0;
        return 10.0 / 16.0;
    }
    if (q.y < 2.0) {
        if (q.x < 1.0) return 12.0 / 16.0;
        if (q.x < 2.0) return 4.0 / 16.0;
        if (q.x < 3.0) return 14.0 / 16.0;
        return 6.0 / 16.0;
    }
    if (q.y < 3.0) {
        if (q.x < 1.0) return 3.0 / 16.0;
        if (q.x < 2.0) return 11.0 / 16.0;
        if (q.x < 3.0) return 1.0 / 16.0;
        return 9.0 / 16.0;
    }
    if (q.x < 1.0) return 15.0 / 16.0;
    if (q.x < 2.0) return 7.0 / 16.0;
    if (q.x < 3.0) return 13.0 / 16.0;
    return 5.0 / 16.0;
}

float asciiStroke(float value, float width) {
    return 1.0 - smoothstep(width, width + 0.035, abs(value));
}

float asciiGlyph(vec2 cellUv, float darkness) {
    vec2 centered = cellUv - 0.5;
    float slash = asciiStroke(centered.x + centered.y, 0.045);
    float backslash = asciiStroke(centered.x - centered.y, 0.045);
    float vertical = asciiStroke(centered.x, 0.035);
    float horizontal = asciiStroke(centered.y, 0.035);
    float dot = 1.0 - smoothstep(0.07, 0.12, length(centered));

    float lightMark = max(dot, slash * 0.65);
    float midMark = max(lightMark, max(slash, horizontal));
    float darkMark = max(midMark, max(backslash, vertical));

    float lightGate = smoothstep(0.18, 0.48, darkness);
    float midGate = smoothstep(0.42, 0.72, darkness);
    float darkGate = smoothstep(0.68, 0.92, darkness);

    return max(lightMark * lightGate, max(midMark * midGate, darkMark * darkGate));
}

vec4 asciiDitherColor(vec3 sourceColor, float sourceAlpha) {
    float luminance = dot(sourceColor, vec3(0.299, 0.587, 0.114));
    float darkness = 1.0 - luminance;

    vec2 grid = vAsciiWorldPos.xy * 18.0;
    grid += vec2(sin(uAsciiTime * 0.25) * 0.12, uAsciiTime * 0.035);

    vec2 cellUv = fract(grid);
    float threshold = asciiBayer4(grid);
    float orderedInk = step(threshold, darkness);
    float glyphInk = asciiGlyph(cellUv, darkness);
    float inkAmount = clamp(max(orderedInk * 0.38, glyphInk), 0.0, 1.0);

    vec3 paper = mix(uAsciiPaper, uAsciiGlow, smoothstep(0.45, 0.95, luminance));
    vec3 finalColor = mix(paper, uAsciiInk, inkAmount);
    float finalAlpha = mix(inkAmount * 0.85, sourceAlpha, uAsciiHasTexture);

    return vec4(finalColor, finalAlpha);
}
`;

export function styleMaterial(material: THREE.Material, uniforms: AsciiUniforms): THREE.Material {
    const styled = material.clone();
    const hasTexture = Boolean((material as THREE.MeshStandardMaterial).map);
    const hasTextureUniform = { value: hasTexture ? 1 : 0 };

    styled.onBeforeCompile = (shader) => {
        shader.uniforms.uAsciiTime = uniforms.uAsciiTime;
        shader.uniforms.uAsciiInk = uniforms.uAsciiInk;
        shader.uniforms.uAsciiPaper = uniforms.uAsciiPaper;
        shader.uniforms.uAsciiGlow = uniforms.uAsciiGlow;
        shader.uniforms.uAsciiHasTexture = hasTextureUniform;

        shader.vertexShader = shader.vertexShader
            .replace("#include <common>", "#include <common>\nvarying vec3 vAsciiWorldPos;")
            .replace(
                "#include <worldpos_vertex>",
                "#include <worldpos_vertex>\nvAsciiWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;"
            );

        shader.fragmentShader = shader.fragmentShader
            .replace(
                "#include <common>",
                `#include <common>\n${ASCII_DITHER_FRAGMENT}`
            )
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

    if (!hasTexture) {
        styled.transparent = true;
        styled.depthWrite = false;
    } else if (styled.transparent) {
        styled.alphaTest = Math.max(styled.alphaTest, 0.025);
    }

    return styled;
}