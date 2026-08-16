import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, EyeOff, ArrowRight } from "lucide-react";
import Badge from "../ui/Badge";
import { excerpt, formatStacked, readingTime } from "../../utils/formatDate";
import { timelineItem } from "../../animations/cardAnimations";
import { staggerContainer } from "../../animations/staggerAnimations";
import { isTodayIST } from "../../utils/dateUtils";

/**
 * Chronological archive with a vertical rail. Each entry hangs off a stacked
 * date marker, mirroring the way a physical journal is indexed by day.
 */
/**
 * Two ways to open an entry:
 *   `linkable` — navigate to /journal/:id (only valid for your own archive,
 *                since the API has no route for fetching someone else's by id)
 *   `onSelect` — hand the entry back to the parent, which opens the reader
 *                modal using content already in memory (friends' archives)
 *
 * With neither, entries are inert and the "read full entry" affordance is
 * hidden rather than shown as a dead link.
 */
export default function JournalTimeline({
  journals = [],
  linkable = true,
  onSelect,
  className = "",
}) {
  const openable = Boolean(linkable || onSelect);
  const Entry = onSelect ? "button" : linkable ? Link : "div";

  return (
    <motion.ol
      variants={staggerContainer(0.07)}
      initial="initial"
      animate="animate"
      className={`relative ${className}`}
    >
      {/* the rail */}
      <span
        className="absolute bottom-6 left-[2.35rem] top-6 w-px bg-outline-variant md:left-[3.35rem]"
        aria-hidden="true"
      />

      {journals.map((journal) => {
        const { month, day } = formatStacked(journal.journalDate);
        const today = isTodayIST(journal.journalDate);

        return (
          <motion.li
            key={journal._id}
            variants={timelineItem}
            className="relative flex gap-5 pb-8 md:gap-8"
          >
            {/* date marker */}
            <div className="relative z-10 shrink-0">
              <div
                className={`flex h-[4.6rem] w-[4.6rem] flex-col items-center justify-center border-2 md:h-[6.7rem] md:w-[6.7rem] ${
                  today
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant bg-surface-lowest text-primary"
                }`}
              >
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
                  {month}
                </span>
                <span className="font-display text-2xl font-extrabold leading-none tracking-tight md:text-4xl">
                  {day}
                </span>
              </div>
            </div>

            {/* entry */}
            <Entry
              {...(onSelect
                ? { type: "button", onClick: () => onSelect(journal) }
                : linkable
                  ? { to: `/journal/${journal._id}` }
                  : {})}
              className={`group relative block min-w-0 flex-1 text-left paper grain-panel p-6 md:p-7 ${
                openable ? "transition-shadow duration-300 hover:shadow-paper-lg" : ""
              }`}
            >
              {today && (
                <span className="washi -left-3 -top-2 h-6 w-24 rotate-[-5deg] bg-tertiary-bright/50" />
              )}

              <div className="relative z-10">
                <div className="mb-4 flex flex-wrap items-center gap-2.5">
                  <Badge
                    tone={journal.isPublic ? "secondary" : "neutral"}
                    size="sm"
                    icon={journal.isPublic ? Globe : EyeOff}
                  >
                    {journal.isPublic ? "Public" : "Private"}
                  </Badge>
                  {today && (
                    <Badge tone="primary" size="sm">
                      Today
                    </Badge>
                  )}
                  <span className="font-annotation text-[11px] tracking-[0.12em] text-on-surface-variant/45">
                    {readingTime(journal.content)} min read
                  </span>
                </div>

                <p className="font-journal text-journal-body leading-relaxed text-on-surface text-pretty">
                  {excerpt(journal.content, 240)}
                </p>

                {openable && (
                  <span className="mt-5 flex items-center gap-1.5 font-display text-label-caps-sm uppercase text-on-surface-variant/55 transition-colors group-hover:text-primary">
                    Read full entry
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      strokeWidth={2.6}
                    />
                  </span>
                )}
              </div>
            </Entry>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}
