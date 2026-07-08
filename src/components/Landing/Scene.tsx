"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Mesh from "./Mesh";
import styles from "./scene.module.scss";

export default function Scene() {
    return (
        <div className={styles.scene}>
            <Canvas
                camera={{ position: [0, 0, 5.5], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={1.5} />
                <directionalLight position={[2, 3, 4]} intensity={1} />
                <Suspense fallback={null}>
                    <Mesh />
                </Suspense>
            </Canvas>
        </div>
    );
}
