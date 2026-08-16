import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, PenLine } from "lucide-react";
import Avatar from "../ui/Avatar";
import ThemeToggle from "../ui/ThemeToggle";
import useAuth from "../../hooks/useAuth";
import { NAV_ITEMS } from "./Sidebar";
import { formatDateline } from "../../utils/formatDate";

/**
 * Slim frosted header. On desktop it shows the current section and the live
 * dateline; on mobile it carries the wordmark, since the sidebar is hidden.
 */
export default function Topbar({ requestCount = 0 }) {
  const location = useLocation();
  const { user } = useAuth();

  const current =
    NAV_ITEMS.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    )?.label ?? "Daymark";

  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant/60 bg-surface/80 frost">
      <div className="flex h-16 items-center justify-between gap-4 px-5 md:px-8 lg:px-margin-desktop">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            to="/"
            className="font-display text-xl font-extrabold tracking-tight text-primary lg:hidden"
          >
            Daymark
          </Link>

          <div className="hidden min-w-0 items-baseline gap-3 lg:flex">
            <motion.span
              key={current}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="label-caps text-on-surface"
            >
              {current}
            </motion.span>
            <span className="h-3 w-px bg-outline-variant" aria-hidden="true" />
            <span className="truncate font-annotation text-[11px] tracking-[0.14em] text-on-surface-variant/60">
              {formatDateline()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/journal/write"
            className="hidden items-center gap-2 border-2 border-on-surface px-4 py-2 font-display text-label-caps-sm uppercase transition-colors hover:bg-on-surface hover:text-surface md:inline-flex lg:hidden"
          >
            <PenLine className="h-3.5 w-3.5" strokeWidth={2.6} />
            Write
          </Link>

          <Link
            to="/requests"
            aria-label={`Friend requests${requestCount ? ` (${requestCount} pending)` : ""}`}
            className="relative grid h-9 w-9 place-items-center border border-outline-variant/70 bg-surface-container text-on-surface-variant transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Bell className="h-4 w-4" strokeWidth={2.1} />
            {requestCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 font-display text-[9px] font-bold text-on-primary">
                {requestCount}
              </span>
            )}
          </Link>

          <ThemeToggle compact className="lg:hidden" />

          <Link to="/profile" aria-label="Your profile" className="ml-1">
            <Avatar username={user?.username ?? ""} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  );
}
