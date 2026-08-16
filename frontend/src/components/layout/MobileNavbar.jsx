import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, BookOpen, Users, UserPlus, CircleUser, PenLine } from "lucide-react";

const MOBILE_ITEMS = [
  { to: "/", label: "Today", icon: CalendarDays, end: true },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/requests", label: "Requests", icon: UserPlus },
  { to: "/profile", label: "Profile", icon: CircleUser },
];

/**
 * Bottom navigation for mobile, with a floating write button that overlaps
 * the bar — the primary action stays reachable from every screen.
 */
export default function MobileNavbar({ requestCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <motion.button
        type="button"
        onClick={() => navigate("/journal/write")}
        aria-label="Write today's entry"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 24, delay: 0.3 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-[4.6rem] right-5 z-50 grid h-14 w-14 place-items-center border-2 border-primary bg-primary text-on-primary shadow-press-primary lg:hidden"
      >
        <PenLine className="h-5 w-5" strokeWidth={2.6} />
      </motion.button>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/70 bg-surface/90 frost lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch justify-around">
          {MOBILE_ITEMS.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            const showCount = item.to === "/requests" && requestCount > 0;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="relative flex flex-1 flex-col items-center gap-1 py-2.5"
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-active-bar"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-x-4 top-0 h-0.5 bg-primary"
                  />
                )}

                <span className="relative">
                  <item.icon
                    className={`h-[19px] w-[19px] transition-colors ${
                      isActive ? "text-primary" : "text-on-surface-variant/65"
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.9}
                  />
                  {showCount && (
                    <span className="absolute -right-1.5 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-primary px-1 font-display text-[8px] font-bold text-on-primary">
                      {requestCount}
                    </span>
                  )}
                </span>

                <span
                  className={`font-display text-[9px] uppercase tracking-[0.1em] transition-colors ${
                    isActive ? "font-bold text-primary" : "text-on-surface-variant/60"
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
