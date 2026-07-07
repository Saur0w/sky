"use client";

import { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/models/flower/source/Blue_end.glb";

export default function Mesh() {
    const group = useRef<THREE.Group>(null);
    const { scene, animations } = useGLTF(MODEL_PATH);
    const { actions, names, mixer } = useAnimations(animations, group);
    
    return <primitive object={scene} ref={group} />
}

useGLTF.preload(MODEL_PATH);