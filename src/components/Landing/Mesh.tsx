"use client";

import { useEffect, useMemo, useRef } from "react";
import { Center, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { createAsciiUniforms, styleMaterial, AsciiUniforms } from "@/lib/Shader";

const MODEL_PATH = "/models/dandelion.glb";
const ANIMATION_SPEED = 0.85;

function isMesh(object: THREE.Object3D): object is THREE.Mesh {
    return (object as THREE.Mesh).isMesh;
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

interface MeshProps {
    opacity?: number;
}

export default function Mesh({ opacity = 0.5 }: MeshProps) {
    const group = useRef<THREE.Group>(null);
    const uniforms = useMemo(() => createAsciiUniforms(), []);

    const { scene, animations } = useGLTF(MODEL_PATH);
    const styledScene = useMemo(() => styleScene(scene, uniforms), [scene, uniforms]);
    const { actions } = useAnimations(animations, group);

    useEffect(() => {
        uniforms.uOpacity.value = opacity;
    }, [opacity, uniforms]);

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

    useFrame((state) => {
        uniforms.uTime.value = state.clock.elapsedTime;
    });

    return (
        <Center position={[0, -3.8, 0]}>
            <group ref={group} scale={0.04}>
                <primitive object={styledScene} />
            </group>
        </Center>
    );
}

useGLTF.preload(MODEL_PATH);