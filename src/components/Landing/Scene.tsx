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
                style={{ background: "transparent" }}
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                }}
            >
                <ambientLight intensity={1.1} color="#e4dff6" />
                <directionalLight position={[3, 4, 5]} intensity={1.1} color="#faf8ff" />
                <directionalLight position={[-3, 1, -2]} intensity={0.45} color="#9b8ec8" />
                <Suspense fallback={null}>
                    <Mesh />
                </Suspense>
            </Canvas>
        </div>
    );
}
