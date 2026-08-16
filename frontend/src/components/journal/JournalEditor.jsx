import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Flame, Check, Loader2 } from "lucide-react";
import JournalVisibility from "./JournalVisibility";
import Button from "../ui/Button";
import SunMark from "../ui/SunMark";
import { formatDateline } from "../../utils/formatDate";
import { wordCount } from "../../utils/formatDate";

/**
 * A premium digital notebook: paper texture, faint rules, large serif type.
 * Chrome is kept to the edges so the writing surface itself dominates.
 *
 * The save button exposes refs (button / spinner / check) that the parent
 * hands to the GSAP unlock timeline — steps 1–4 of the signature sequence
 * happen right here on this button.
 */
export default function JournalEditor({
  initialContent = "",
  initialIsPublic = true,
  isEditing = false,
  streak = 0,
  saving = false,
  saved = false,
  onSave,
  saveRefs = {},
}) {
  const [content, setContent] = useState(initialContent);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const textareaRef = useRef(null);

  useEffect(() => {
    setContent(initialContent);
    setIsPublic(initialIsPublic);
  }, [initialContent, initialIsPublic]);

  // Grow the textarea with its content — no inner scrollbar while writing.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 420)}px`;
  }, [content]);

  // Cmd/Ctrl+Enter saves without reaching for the mouse.
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        if (content.trim() && !saving) onSave?.({ content: content.trim(), isPublic });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [content, isPublic, saving, onSave]);

  const words = wordCount(content);
  const canSave = content.trim().length > 0 && !saving && !saved;

  return (
    <div className="relative mx-auto max-w-3xl">
      {/* Meta rail above the sheet */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <span className="flex items-center gap-2 font-display text-label-caps uppercase text-on-surface-variant">
          <CalendarDays className="h-3.5 w-3.5 text-primary" strokeWidth={2.6} />
          {formatDateline()}
        </span>

        {streak > 0 && (
          <span className="flex items-center gap-2 font-display text-label-caps uppercase text-on-surface-variant">
            <Flame className="h-3.5 w-3.5 text-primary" strokeWidth={2.6} />
            Day {streak + (isEditing ? 0 : 1)} of your streak
          </span>
        )}
      </div>

      {/* The sheet */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-surface-lowest shadow-paper-lg"
      >
        <span className="washi -right-4 -top-3 h-9 w-32 rotate-[4deg] bg-tertiary-bright/50" />

        <SunMark
          className="pointer-events-none absolute bottom-6 right-6 h-12 w-12 text-outline-variant/40"
        />

        <div className="relative z-10 px-7 py-10 md:px-14 md:py-14">
          <h2 className="mb-2 font-journal text-[2rem] font-bold leading-tight md:text-[2.5rem]">
            Dear today,
          </h2>
          <div className="mb-8 h-0.5 w-full bg-on-surface" />

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start where you are. Nobody is grading this."
            aria-label="Today's journal entry"
            spellCheck
            className="ruled-paper w-full resize-none border-0 bg-transparent p-0 font-journal text-journal-body leading-[40px] text-on-surface placeholder:text-on-surface-variant/35 focus:ring-0"
            style={{ minHeight: 420 }}
          />
        </div>
      </motion.div>

      {/* Controls below the sheet */}
      <div className="mt-8 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
        <JournalVisibility
          isPublic={isPublic}
          onChange={setIsPublic}
          disabled={saving || saved}
        />

        <div className="flex flex-col items-start gap-3 md:items-end">
          <span className="font-annotation text-[11px] tracking-[0.12em] text-on-surface-variant/50">
            {words} {words === 1 ? "word" : "words"} · ⌘↵ to save
          </span>

          {/* Steps 1–4 of the unlock sequence animate this button. */}
          <motion.button
            ref={saveRefs.button}
            type="button"
            disabled={!canSave}
            onClick={() => onSave?.({ content: content.trim(), isPublic })}
            whileHover={canSave ? { y: -2, x: -1 } : undefined}
            whileTap={canSave ? { y: 3, x: 3 } : undefined}
            className="relative inline-flex min-w-[15rem] items-center justify-center gap-2.5 border-2 border-primary bg-primary px-9 py-4 font-display text-[13px] font-bold uppercase tracking-[0.14em] text-on-primary shadow-press-primary transition-colors hover:bg-primary-bright disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            <span
              ref={saveRefs.spinner}
              className="absolute opacity-0"
              aria-hidden="true"
            >
              <Loader2 className="h-5 w-5" strokeWidth={2.8} />
            </span>

            <span
              ref={saveRefs.check}
              className="absolute opacity-0"
              aria-hidden="true"
            >
              <Check className="h-6 w-6" strokeWidth={3.2} />
            </span>

            <span
              className="flex items-center gap-2.5 transition-opacity"
              style={{ opacity: saving || saved ? 0 : 1 }}
            >
              {isEditing ? "Update today's entry" : "Save today's entry"}
              <ArrowRight className="h-4 w-4" strokeWidth={2.8} />
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
