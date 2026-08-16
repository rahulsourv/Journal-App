import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import FriendStatus from "./FriendStatus";
import { staggerItem } from "../../animations/staggerAnimations";
import { accentFor } from "../../utils/constants";

// Subtle per-card tinting keeps a grid of cards from reading as a spreadsheet.
const TINTS = {
  primary: "bg-primary-fixed/25",
  secondary: "bg-secondary-fixed/40",
  tertiary: "bg-tertiary-fixed/35",
  lavender: "bg-lavender-fixed/40",
  mint: "bg-mint-fixed/40",
};

const RINGS = {
  primary: "ring-primary/60",
  secondary: "ring-secondary/50",
  tertiary: "ring-tertiary/50",
  lavender: "ring-lavender/50",
  mint: "ring-mint/50",
};

export default function FriendCard({ friend, index = 0 }) {
  const accent = accentFor(friend.username);

  // Nudge alternating cards down — the mobile design staggers the two
  // columns rather than aligning them into a strict grid.
  const offset = index % 2 === 1 ? "translate-y-5 lg:translate-y-0" : "";
  const desktopOffset = index % 3 === 1 ? "xl:translate-y-6" : "";

  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -6, x: -2 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative ${offset} ${desktopOffset}`}
    >
      <Link
        to={`/friends/${friend._id}`}
        className="relative block overflow-hidden paper grain-panel p-4 transition-shadow duration-300 group-hover:shadow-paper-lg sm:p-6"
      >
        <span
          className={`pointer-events-none absolute right-0 top-0 h-24 w-28 ${TINTS[accent]} sm:h-32 sm:w-40`}
          aria-hidden="true"
        />

        {friend.wroteToday && (
          <span className="washi -right-3 top-3 h-5 w-24 rotate-3 bg-tertiary-bright/45" />
        )}

        {/* Mobile: portrait, centred. Desktop: identity row, then actions. */}
        <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
          <Avatar
            username={friend.username}
            size="xl"
            active={friend.wroteToday}
            className={`rounded-lg ring-2 ring-offset-2 ring-offset-surface-lowest lg:hidden ${
              friend.wroteToday ? RINGS[accent] : "ring-outline-variant/60"
            }`}
          />
          <Avatar
            username={friend.username}
            size="lg"
            active={friend.wroteToday}
            className="hidden lg:inline-flex"
          />

          <h3 className="mt-3 w-full truncate font-display text-base font-extrabold leading-tight tracking-tight lg:mt-4 lg:text-lg">
            {friend.username}
          </h3>

          <p className="label-caps mt-1 hidden w-full truncate text-on-surface-variant/60 lg:block">
            @{friend.username}
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 lg:mt-4 lg:justify-start lg:gap-3">
            {friend.streak > 0 && (
              <Badge tone="primary" size="sm" icon={Flame}>
                {friend.streak} day{friend.streak === 1 ? "" : "s"}
              </Badge>
            )}
            <FriendStatus wroteToday={friend.wroteToday} size="sm" />
          </div>

          {/* The whole card is the tap target on mobile, so this reads as a
              label there and only becomes a bordered button on desktop. */}
          <span className="mt-4 hidden w-full items-center justify-between border-2 border-on-surface px-4 py-3 font-display text-label-caps uppercase transition-colors group-hover:bg-on-surface group-hover:text-surface lg:flex">
            View journal
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={2.6}
            />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
