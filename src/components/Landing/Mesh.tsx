"use client";

import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {useRef} from "react";

const MODEL_PATH = "/models/dandelion.glb";

export default function Mesh() {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF(MODEL_PATH);

    return (
        <group ref={group}>
            <primitive object={scene} />
        </group>
    );
}

useGLTF.preload(MODEL_PATH);
