"use client";

import gsap from "gsap";
import styles from "./style.module.scss";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import dynamic from "next/dynamic";
const Scene = dynamic(() => 
    import("./Scene"), { 
        ssr: false 
    });
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

export default function Landing() {
    const landingRef = useRef<HTMLDivElement>(null);
    const subRef = useRef<HTMLHeadingElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const paraRef = useRef<HTMLParagraphElement>(null);

    useGSAP(() => {
        const maskLines = (el: HTMLElement) => {
            const outer = SplitText.create(el, {
                type: "lines",
                linesClass: "line-mask",
            });

            const inner = SplitText.create(outer.lines, {
                type: "lines",
                linesClass: "line-content"
            });

            gsap.set(outer.lines, {
                overflow: "hidden",
                display: "block",
            });

            return inner.lines;
        };

        const headingLines = headingRef.current ? maskLines(headingRef.current) : [];
        const subLines = subRef.current ? maskLines(subRef.current) : [];
        const paraLines = paraRef.current ? maskLines(paraRef.current) : [];

        gsap.from([...headingLines, ...subLines, ...paraLines], {
            yPercent: 110,
            duration: 1,
            ease: "power2.inOut",
            stagger: 0.08,
            delay: 1.4
        });
    }, { scope: landingRef});
    return (
        <section className={styles.landing} ref={landingRef}>
            <div className={styles.canvasWrapper}>
                <Scene />
            </div>
            <div className={styles.overlay}>
                <div className={styles.subHead}>
                    <h3 ref={subRef}>SAUROW // WEBGL LABS — VOL. 01</h3>
                </div>

                <div className={styles.main}>
                    <h1 ref={headingRef}>
                        Digital botany rendered through real-time halftone dithering.
                    </h1>
                </div>

                <div className={styles.textContainer}>
                    <p ref={paraRef}>
                        Exploring the intersection of organic 3D forms and retro-digital shaders. A custom ASCII dither effect applied to a dandelion model.
                    </p>
                </div>
            </div>
        </section>
    );
}