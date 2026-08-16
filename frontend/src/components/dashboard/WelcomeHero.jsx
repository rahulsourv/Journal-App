import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { driftDecor, attachParallax } from "../../animations/gsapAnimations";
import { wordContainer, wordItem } from "../../animations/staggerAnimations";
import { formatDateline } from "../../utils/formatDate";
import { greetingFor } from "../../utils/dateUtils";
import SunMark from "../ui/SunMark";

/**
 * The first thing the user sees. Oversized flush-left display type, a live
 * IST dateline, and GSAP-driven decorative shapes drifting behind it.
 */
export default function WelcomeHero({ username = "" }) {
  const containerRef = useRef(null);
  const decorRefs = useRef([]);

  useEffect(() => {
    const shapes = decorRefs.current.filter(Boolean);
    const timeline = driftDecor(shapes, { amplitude: 26, duration: 10 });
    const detach = attachParallax(containerRef.current, shapes, 30);

    return () => {
      timeline?.kill();
      detach();
    };
  }, []);

  const greeting = `${greetingFor()},`;
  const name = `${username || "there"}.`;

  return (
    <section ref={containerRef} className="relative overflow-hidden pb-4 pt-2">
      {/* Decorative layers — purely atmospheric, hidden from assistive tech. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          ref={(el) => (decorRefs.current[0] = el)}
          className="absolute -right-16 -top-10 h-56 w-56 rounded-full bg-primary-fixed/40 blur-2xl"
        />
        <div
          ref={(el) => (decorRefs.current[1] = el)}
          className="absolute right-40 top-24 hidden h-28 w-28 rotate-12 border-2 border-secondary/20 md:block"
        />
        <div
          ref={(el) => (decorRefs.current[2] = el)}
          className="absolute right-8 top-4 hidden md:block"
        >
          <SunMark className="h-16 w-16 text-tertiary/35" />
        </div>
        <span
          ref={(el) => (decorRefs.current[3] = el)}
          className="watermark absolute -left-4 top-16 hidden text-[13rem] lg:block"
        >
          {new Date().getDate()}
        </span>
      </div>

      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="label-caps mb-5 flex items-center gap-2.5 text-on-surface-variant/70"
        >
          <SunMark className="h-3.5 w-3.5 text-primary" />
          {formatDateline()}
        </motion.p>

        {/* Word-by-word reveal from behind a mask. */}
        <motion.h1
          variants={wordContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl font-display text-[2.6rem] font-extrabold uppercase leading-[0.92] tracking-[-0.035em] sm:text-6xl lg:text-7xl xl:text-[5.2rem]"
        >
          {greeting.split(" ").map((word, i) => (
            <span key={`g-${i}`} className="inline-block overflow-hidden align-bottom">
              <motion.span variants={wordItem} className="inline-block pr-[0.22em]">
                {word}
              </motion.span>
            </span>
          ))}
          <br />
          <span className="inline-block overflow-hidden align-bottom">
            <motion.span variants={wordItem} className="inline-block text-primary">
              {name}
            </motion.span>
          </span>
        </motion.h1>
      </div>
    </section>
  );
}
