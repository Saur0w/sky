"use client";

import gsap from "gsap";
import styles from "./style.module.scss";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

export default function Landing() {
    const landingRef = useRef<HTMLDivElement>(null);
    return (
        <section className={styles.landing} ref={landingRef}>

        </section>
    );
}