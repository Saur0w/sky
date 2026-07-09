"use client";

import styles from "./style.module.scss";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

export default function Header() {
    const headerRef = useRef<HTMLDivElement>(null);
    return (
        <header className={styles.header} ref={headerRef}>
            <div className={styles.heading}>
                <h1>SAUROW. — FIELD STUDY®</h1>
            </div>
            <div className={styles.right}>
                <p>IDX 07 / 2016</p>
                <h1>STATUS: PRE-HEADLINE</h1>
            </div>
        </header>
    );
}