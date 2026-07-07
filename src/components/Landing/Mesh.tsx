"use client";

import { useRef, useEffect } from "react";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/models/dandelion.glb";

export default function Mesh() {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF(MODEL_PATH);
    useEffect(() => {
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        console.log("Model raw size:", size);
        console.log(
            "Suggested scale for a ~1.5 unit tall model:",
            1.5 / Math.max(size.x, size.y, size.z)
        );
    }, [scene]);

    return (
        <Center>
            <group ref={group} scale={0.015}>
                <primitive object={scene} />
            </group>
        </Center>
    );
}

useGLTF.preload(MODEL_PATH);