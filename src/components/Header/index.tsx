"use client";

import styles from "./style.module.scss";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

export default function Header() {
    const headerRef = useRef<HTMLDivElement>(null);
    const leftRef = useRef<HTMLHeadingElement>(null);
    const rightHeadRef = useRef<HTMLHeadingElement>(null);
    const paraRef = useRef<HTMLParagraphElement>(null);

    useGSAP(() => {
        const maskLines = (el: HTMLElement) => {
            const outer = SplitText.create(el, {
                type: "lines",
                linesClass: "line-mask",
            });

            const inner = SplitText.create(outer.lines, {
                type: "lines",
                linesClass: "line-content",
            });

            gsap.set(outer.lines, {
                overflow: "hidden",
                display: "block",
            });

            return inner.lines;
        };

        const headingLines = leftRef.current ? maskLines(leftRef.current) : [];
        const sublines = rightHeadRef.current ? maskLines(rightHeadRef.current) : [];
        const paraLines = paraRef.current ? maskLines(paraRef.current) : [];

        gsap.from([...headingLines, ...sublines, ...paraLines], {
            yPercent: 110,
            duration: 1,
            ease: "power2.inOut",
            stagger: 0.08,
            delay: 1.4
        })
    }, {
        scope: headerRef,
    });
    return (
        <header className={styles.header} ref={headerRef}>
            <div className={styles.heading}>
                <h1 ref={leftRef}>SAUROW. — FIELD STUDY®</h1>
            </div>
            <div className={styles.right}>
                <p ref={paraRef}>IDX 07 / 2016</p>
                <h1 ref={rightHeadRef}>STATUS: PRE-HEADLINE</h1>
            </div>
        </header>
    );
}