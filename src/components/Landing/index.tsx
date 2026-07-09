"use client";

import gsap from "gsap";
import styles from "./style.module.scss";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Scene from "./Scene";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

export default function Landing() {
    const landingRef = useRef<HTMLDivElement>(null);
    const subRef = useRef<HTMLHeadingElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const paraRef = useRef<HTMLParagraphElement>(null);
    return (
        <section className={styles.landing} ref={landingRef}>
            <div className={styles.canvasWrapper}>
                <Scene />
            </div>
            <div className={styles.overlay}>
                <div className={styles.subHead}>
                    <h3 ref={subRef}>PORTFOLIO CONTEXT // 2026 — INDEX: 07</h3>
                </div>

                <div className={styles.main}>
                    <h1 ref={headingRef}>
                        See the market moves long before they become breaking news headlines.
                    </h1>
                </div>

                <div className={styles.textContainer}>
                    <p ref={paraRef}>
                        A collective balance of creative brutalism, typographical density control, and interactive graphic shaders.
                    </p>
                </div>
            </div>
        </section>
    );
}