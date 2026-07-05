"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { Shader } from "@/lib/Shader";

export default function Mesh() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const count = 8000;
    useEffect(() => {
        if (!meshRef.current) return;

        const dummy = new THREE.Object3D();
        let index = 0;

        const radius = 2.5;

        for (let i = 0; i < count; i++) {
            const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);

            const r = Math.pow(THREE.MathUtils.randFloat(0, 1), 0.5) * radius;
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            const z = THREE.MathUtils.randFloat(-0.1, 0.1);

            dummy.position.set(x, y, z);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(index++, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;

        if (materialRef.current) {
            gsap.to(materialRef.current.uniforms.uBloom, {
                value: 1.0,
                duration: 3.0,
                ease: 'power4.inOut',
                delay: 0.5
            })
        }
    }, []);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
        if (meshRef.current) {
            meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <planeGeometry args={[0.04, 0.04]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={Shader.vertexShader}
                fragmentShader={Shader.fragmentShader}
                uniforms={{
                    uTime: { value: 0 },
                    uBloom: { value: 0 }
                }}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </instancedMesh>
    )
}