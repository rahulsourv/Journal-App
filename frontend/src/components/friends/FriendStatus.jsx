import { motion } from "framer-motion";

/**
 * The only per-friend status this product has: did they write today?
 * Written = a live pulsing dot. Not written = a static hollow ring.
 */
export default function FriendStatus({ wroteToday, size = "md", showLabel = true }) {
  const dot = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";

  return (
    <span
      className={`inline-flex items-center gap-2 font-display uppercase tracking-[0.1em] ${
        size === "sm" ? "text-[9px]" : "text-label-caps-sm"
      } ${wroteToday ? "text-tertiary" : "text-on-surface-variant/45"}`}
    >
      <span className="relative flex items-center justify-center">
        {wroteToday && (
          <motion.span
            className={`absolute rounded-full bg-tertiary-bright ${dot}`}
            animate={{ scale: [1, 2.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <span
          className={`relative rounded-full ${dot} ${
            wroteToday
              ? "bg-tertiary-bright"
              : "border border-on-surface-variant/40 bg-transparent"
          }`}
        />
      </span>

      {showLabel && (wroteToday ? "Wrote today" : "Has not written")}
    </span>
  );
}
