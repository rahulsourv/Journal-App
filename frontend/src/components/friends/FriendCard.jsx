import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import FriendStatus from "./FriendStatus";
import { staggerItem } from "../../animations/staggerAnimations";
import { accentFor } from "../../utils/constants";

// Subtle per-card tinting keeps a 3-up grid from reading as a spreadsheet.
const TINTS = {
  primary: "bg-primary-fixed/25",
  secondary: "bg-secondary-fixed/40",
  tertiary: "bg-tertiary-fixed/35",
  lavender: "bg-lavender-fixed/40",
  mint: "bg-mint-fixed/40",
};

export default function FriendCard({ friend, index = 0 }) {
  const accent = accentFor(friend.username);
  // Nudge every third card down a little — asymmetric editorial flow.
  const offset = index % 3 === 1 ? "md:translate-y-6" : "";

  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -6, x: -2 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative ${offset}`}
    >
      <div className="relative overflow-hidden paper grain-panel p-6 transition-shadow duration-300 group-hover:shadow-paper-lg">
        {/* tinted block behind the identity row */}
        <span
          className={`pointer-events-none absolute right-0 top-0 h-32 w-40 ${TINTS[accent]}`}
          aria-hidden="true"
        />

        {friend.wroteToday && (
          <span className="washi -right-3 top-4 h-6 w-28 rotate-3 bg-tertiary-bright/45" />
        )}

        <div className="relative z-10">
          <div className="mb-5 flex items-start gap-4">
            <Avatar username={friend.username} size="lg" active={friend.wroteToday} />

            <div className="min-w-0 flex-1 pt-1">
              <h3 className="truncate font-display text-lg font-extrabold leading-tight tracking-tight">
                {friend.username}
              </h3>
              <p className="label-caps mt-1 truncate text-on-surface-variant/60">
                @{friend.username}
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            {friend.streak > 0 && (
              <Badge tone="primary" size="sm" icon={Flame}>
                {friend.streak} day{friend.streak === 1 ? "" : "s"}
              </Badge>
            )}
            <FriendStatus wroteToday={friend.wroteToday} size="sm" />
          </div>

          <Link
            to={`/friends/${friend._id}`}
            className="flex items-center justify-between border-2 border-on-surface px-4 py-3 font-display text-label-caps uppercase transition-colors hover:bg-on-surface hover:text-surface"
          >
            View journal
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={2.6}
            />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
