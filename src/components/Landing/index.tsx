"use client";

import gsap from "gsap";
import styles from "./style.module.scss";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Scene from "./Scene";

gsap.registerPlugin(useGSAP);

export default function Landing() {
    const landingRef = useRef<HTMLDivElement>(null);
    return (
        <section className={styles.landing} ref={landingRef}>
            <div className={styles.canvasWrapper}>
                <Scene />
            </div>
            <div className={styles.overlay}>
                <header>
                    <span>Portfolio Context // 2026</span>
                    <span>Index: 01</span>
                </header>

                <main>
                    <h1>
                        See The Market Moves Long Before They Become Breaking News Headlines
                    </h1>
                </main>

                <footer>
                    <p>
                        A collective balance of creative brutalism, typographical density control, and interactive graphic shaders.
                    </p>
                    <span>Scroll to Explore</span>
                </footer>
            </div>
        </section>
    );
}