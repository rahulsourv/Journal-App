import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { driftDecor, attachParallax } from "../../animations/gsapAnimations";
import SunMark from "../../components/ui/SunMark";
import ThemeToggle from "../../components/ui/ThemeToggle";

/**
 * Shared split layout for login and signup: an editorial statement on the
 * left, the form as a taped-down sheet of paper on the right. Oversized
 * watermark words drift behind everything.
 */
export default function AuthShell({ headline, subline, children }) {
  const rootRef = useRef(null);
  const decorRefs = useRef([]);

  useEffect(() => {
    const shapes = decorRefs.current.filter(Boolean);
    const timeline = driftDecor(shapes, { amplitude: 20, duration: 12 });
    const detach = attachParallax(rootRef.current, shapes, 26);

    return () => {
      timeline?.kill();
      detach();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative min-h-screen overflow-hidden bg-surface">
      {/* drifting decorative layers */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span
          ref={(el) => (decorRefs.current[0] = el)}
          className="watermark absolute left-[42%] top-4 text-[9rem] md:text-[13rem]"
        >
          DAY
        </span>
        <span
          ref={(el) => (decorRefs.current[1] = el)}
          className="watermark absolute bottom-6 right-[6%] text-[8rem] md:text-[12rem]"
        >
          REFLECT
        </span>
        <div
          ref={(el) => (decorRefs.current[2] = el)}
          className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-primary-fixed/30 blur-3xl"
        />
        <div
          ref={(el) => (decorRefs.current[3] = el)}
          className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-secondary-fixed/35 blur-3xl"
        />
        {/* angled paper sheets in the background */}
        <div className="absolute right-[8%] top-[6%] hidden h-[70%] w-[38%] rotate-[7deg] border border-outline-variant/40 bg-surface-lowest/40 lg:block" />
        <div className="absolute right-[14%] top-[10%] hidden h-[64%] w-[34%] -rotate-[4deg] border border-outline-variant/30 bg-surface-lowest/30 lg:block" />
      </div>

      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle compact />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-14 px-6 py-14 md:px-10 lg:grid-cols-[1.05fr_minmax(0,26rem)] lg:gap-20 lg:px-margin-desktop">
        {/* Left — the statement */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 inline-flex items-center gap-3 bg-tertiary-fixed px-4 py-3"
          >
            <SunMark className="h-8 w-8 text-on-surface" />
            <span className="font-display text-xs font-bold uppercase tracking-[0.28em] text-on-surface">
              Daymark
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl font-display text-[2.75rem] font-extrabold uppercase leading-[0.9] tracking-[-0.035em] sm:text-6xl xl:text-7xl"
          >
            {headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8 max-w-md font-journal text-journal-quote italic leading-snug text-on-surface-variant text-pretty"
          >
            {subline}
          </motion.p>
        </div>

        {/* Right — the form sheet */}
        <motion.div
          initial={{ opacity: 0, y: 34, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full"
        >
          <span className="washi -right-5 -top-4 h-10 w-32 rotate-[8deg] bg-tertiary-bright/60" />
          <span className="washi -bottom-3 -left-5 h-8 w-24 rotate-[-6deg] bg-primary-fixed/80" />

          <div className="relative bg-surface-lowest px-7 py-9 shadow-paper-lg md:px-9 md:py-11 grain-panel">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
