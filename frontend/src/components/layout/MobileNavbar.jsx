import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, SquarePen, Users, CircleUser, PenLine } from "lucide-react";

/**
 * Mobile navigation — a floating rounded pill rather than a flat edge-to-edge
 * bar, per the mobile design: inset from the screen edges, frosted, with the
 * same hard coral offset shadow used on paper elsewhere.
 *
 * Four destinations only. Friend requests live in the top bar's bell instead,
 * which keeps this row uncrowded and each target comfortably tappable.
 */
const MOBILE_ITEMS = [
  { to: "/", label: "Today", icon: CalendarDays, end: true },
  { to: "/journal", label: "Journal", icon: SquarePen },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/profile", label: "Profile", icon: CircleUser },
];

export default function MobileNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Writing is a focused mode: the editor has its own sticky save bar, and
  // the design shows no bottom nav there. Leaving it would also stack two
  // fixed bars on top of each other.
  if (location.pathname === "/journal/write") return null;

  return (
    <>
      {/* Write stays one tap away from every screen; sits above the pill. */}
      <motion.button
        type="button"
        onClick={() => navigate("/journal/write")}
        aria-label="Write today's entry"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 24, delay: 0.3 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-28 right-5 z-50 grid h-14 w-14 place-items-center rounded-full border-2 border-primary bg-primary text-on-primary shadow-press-primary lg:hidden"
      >
        <PenLine className="h-5 w-5" strokeWidth={2.6} />
      </motion.button>

      <nav
        aria-label="Main"
        className="fixed inset-x-margin-mobile bottom-6 z-40 mx-auto flex h-16 max-w-md items-center justify-around rounded-full border border-outline-variant/40 bg-surface-container/90 frost shadow-[4px_4px_0_0_rgb(var(--primary)/0.2)] lg:hidden"
      >
        {MOBILE_ITEMS.map((item) => {
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="relative flex items-center justify-center rounded-full px-4 py-2 active:translate-y-0.5"
            >
              {/* The filled pill slides between items. */}
              {isActive && (
                <motion.span
                  layoutId="mobile-active-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-primary"
                />
              )}

              <span className="relative z-10 flex flex-col items-center gap-0.5">
                <item.icon
                  className={`h-[19px] w-[19px] transition-colors ${
                    isActive ? "text-on-primary" : "text-on-surface-variant/70"
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.9}
                />
                <span
                  className={`font-display text-[9px] font-bold uppercase leading-none tracking-[0.08em] transition-colors ${
                    isActive ? "text-on-primary" : "text-on-surface-variant/60"
                  }`}
                >
                  {item.label}
                </span>
              </span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
