"use client";

import { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/models/flower/source/Blue_end.glb";

export default function Mesh() {
    const group = useRef<THREE.Group>(null);
    const { scene, animations } = useGLTF(MODEL_PATH);
    const { actions, names, mixer } = useAnimations(animations, group);

    useEffect(() => {
        console.log("Animation Clips found in this GLB: ", names);
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.morphTargetDictionary) {
                console.log(`"${child.name}" has morph targets: `, child.morphTargetDictionary);
            }
        });
    }, [scene, names]);

    useEffect(() => {
        if (!names.length) return;
        const bloomAction = actions[names[0]];
        if (!bloomAction) return;

        bloomAction.reset();
        bloomAction.setLoop(THREE.LoopOnce, 1);
        bloomAction.clampWhenFinished = true;
        bloomAction.play();
    }, [actions, names]);

    return <primitive object={scene} ref={group} />
}

useGLTF.preload(MODEL_PATH);