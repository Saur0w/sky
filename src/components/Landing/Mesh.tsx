"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Center, useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const MODEL_PATH = "/models/dandelion.glb";
const ANIMATION_SPEED = 0.85;
const ASCII_SHADER_KEY = "ascii-dither-surface-v2";
const ASCII_TIME_UNIFORM = { value: 0 };

const ASCII_DITHER_FRAGMENT = /* glsl */ `
uniform float uAsciiTime;
uniform vec3 uAsciiInk;
uniform vec3 uAsciiPaper;
uniform vec3 uAsciiGlow;

vec2 asciiDitherUv() {
    #if defined( USE_MAP )
        return vMapUv;
    #elif defined( USE_UV )
        return vUv;
    #else
        return gl_FragCoord.xy * 0.01;
    #endif
}

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

vec3 asciiDitherColor(vec2 uv, vec3 sourceColor) {
    float luminance = dot(sourceColor, vec3(0.299, 0.587, 0.114));
    float darkness = 1.0 - luminance;
    vec2 grid = uv * vec2(42.0, 70.0);
    grid += vec2(sin(uAsciiTime * 0.25) * 0.12, uAsciiTime * 0.035);

    vec2 cellUv = fract(grid);
    float threshold = asciiBayer4(grid);
    float orderedInk = step(threshold, darkness);
    float glyphInk = asciiGlyph(cellUv, darkness);
    float inkAmount = clamp(max(orderedInk * 0.38, glyphInk), 0.0, 1.0);

    vec3 paper = mix(uAsciiPaper, uAsciiGlow, smoothstep(0.45, 0.95, luminance));
    return mix(paper, uAsciiInk, inkAmount);
}
`;

type AsciiUniforms = {
    uAsciiTime: { value: number };
    uAsciiInk: { value: THREE.Color };
    uAsciiPaper: { value: THREE.Color };
    uAsciiGlow: { value: THREE.Color };
};

function isMesh(object: THREE.Object3D): object is THREE.Mesh {
    return (object as THREE.Mesh).isMesh === true;
}

function styleMaterial(material: THREE.Material, uniforms: AsciiUniforms) {
    const styled = material.clone();

    styled.onBeforeCompile = (shader) => {
        shader.uniforms.uAsciiTime = uniforms.uAsciiTime;
        shader.uniforms.uAsciiInk = uniforms.uAsciiInk;
        shader.uniforms.uAsciiPaper = uniforms.uAsciiPaper;
        shader.uniforms.uAsciiGlow = uniforms.uAsciiGlow;

        shader.fragmentShader = shader.fragmentShader
            .replace(
                "#include <uv_pars_fragment>",
                `#include <uv_pars_fragment>\n${ASCII_DITHER_FRAGMENT}`
            )
            .replace(
                "#include <map_fragment>",
                "#include <map_fragment>\ndiffuseColor.rgb = asciiDitherColor(asciiDitherUv(), diffuseColor.rgb);"
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

    if (styled.transparent) {
        styled.alphaTest = Math.max(styled.alphaTest, 0.025);
    }

    return styled;
}

function styleScene(scene: THREE.Group, uniforms: AsciiUniforms) {
    const styledScene = clone(scene) as THREE.Group;

    styledScene.traverse((child) => {
        if (!isMesh(child)) {
            return;
        }

        child.castShadow = true;
        child.receiveShadow = true;
        child.material = Array.isArray(child.material)
            ? child.material.map((material) => styleMaterial(material, uniforms))
            : styleMaterial(child.material, uniforms);
    });

    return styledScene;
}

export default function Mesh() {
    const group = useRef<THREE.Group>(null);
    const uniforms = useMemo<AsciiUniforms>(
        () => ({
            uAsciiTime: ASCII_TIME_UNIFORM,
            uAsciiInk: { value: new THREE.Color("#11131f") },
            uAsciiPaper: { value: new THREE.Color("#ececf4") },
            uAsciiGlow: { value: new THREE.Color("#9be7d8") },
        }),
        []
    );
    const { scene, animations } = useGLTF(MODEL_PATH);
    const styledScene = useMemo(() => styleScene(scene, uniforms), [scene, uniforms]);
    const { actions } = useAnimations(animations, group);

    useFrame((_, delta) => {
        ASCII_TIME_UNIFORM.value += delta;
    });

    useEffect(() => {
        const playingActions = animations
            .map((clip) => actions[clip.name])
            .filter((action): action is THREE.AnimationAction => Boolean(action));

        playingActions.forEach((action) => {
            action
                .reset()
                .setLoop(THREE.LoopRepeat, Infinity)
                .setEffectiveTimeScale(ANIMATION_SPEED)
                .fadeIn(0.35)
                .play();
        });

        return () => {
            playingActions.forEach((action) => {
                action.fadeOut(0.2).stop();
            });
        };
    }, [actions, animations]);

    useEffect(() => {
        return () => {
            styledScene.traverse((child) => {
                if (!isMesh(child)) {
                    return;
                }

                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((material) => material.dispose());
            });
        };
    }, [styledScene]);

    return (
        <Center position={[0, -2.5, 0]}>
            <group ref={group} scale={0.03}>
                <primitive object={styledScene} />
            </group>
        </Center>
    );
}

useGLTF.preload(MODEL_PATH);
