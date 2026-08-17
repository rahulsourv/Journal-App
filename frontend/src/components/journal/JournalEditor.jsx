import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Flame, Check, Loader2 } from "lucide-react";
import JournalVisibility from "./JournalVisibility";
import MarkdownToolbar from "./MarkdownToolbar";
import Markdown from "../ui/Markdown";
import Button from "../ui/Button";
import SunMark from "../ui/SunMark";
import { formatDateline } from "../../utils/formatDate";
import { wordCount } from "../../utils/formatDate";
import {
  toggleWrap,
  togglePrefix,
  insertLink,
  stripMarkdown,
} from "../../utils/markdown";

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
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef(null);

  // Undo/redo history. The textarea's native stack can't be used, because a
  // toolbar action replaces `value` through React rather than typing into the
  // element, which the browser doesn't record as an undoable step.
  const history = useRef({ past: [], future: [] });
  const [historySize, setHistorySize] = useState({ past: 0, future: 0 });

  const syncHistorySize = () =>
    setHistorySize({
      past: history.current.past.length,
      future: history.current.future.length,
    });

  useEffect(() => {
    setContent(initialContent);
    setIsPublic(initialIsPublic);
    history.current = { past: [], future: [] };
    syncHistorySize();
  }, [initialContent, initialIsPublic]);

  // Grow the textarea with its content — no inner scrollbar while writing.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el || preview) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 420)}px`;
  }, [content, preview]);

  /** Commit a new value, recording the previous one for undo. */
  const commit = (next, selection) => {
    history.current.past.push(content);
    history.current.future = [];
    syncHistorySize();
    setContent(next);

    if (selection) {
      // Restore the selection once React has flushed the new value, so a
      // second action applies to the same range instead of a collapsed caret.
      //
      // A timer rather than requestAnimationFrame: rAF is paused in
      // background tabs, and if it never fires the selection collapses —
      // which silently turns "quote these three lines" into "quote the last
      // line". setTimeout still runs either way.
      setTimeout(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(selection.start, selection.end);
      }, 0);
    }
  };

  const undo = () => {
    const { past, future } = history.current;
    if (!past.length) return;
    future.push(content);
    setContent(past.pop());
    syncHistorySize();
  };

  const redo = () => {
    const { past, future } = history.current;
    if (!future.length) return;
    past.push(content);
    setContent(future.pop());
    syncHistorySize();
  };

  /** Run a toolbar action against the current selection. */
  const applyAction = (id) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;

    const result = (() => {
      switch (id) {
        case "bold":
          return toggleWrap(content, start, end, "**");
        case "italic":
          return toggleWrap(content, start, end, "*");
        case "code":
          return toggleWrap(content, start, end, "`");
        case "h1":
          return togglePrefix(content, start, end, "# ");
        case "h2":
          return togglePrefix(content, start, end, "## ");
        case "quote":
          return togglePrefix(content, start, end, "> ");
        case "ul":
          return togglePrefix(content, start, end, "- ");
        case "ol":
          return togglePrefix(content, start, end, "", { ordered: true });
        case "link":
          return insertLink(content, start, end);
        default:
          return null;
      }
    })();

    if (result) commit(result.value, { start: result.start, end: result.end });
  };

  // Cmd/Ctrl+Enter saves; the usual formatting shortcuts also work.
  useEffect(() => {
    const onKeyDown = (event) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;

      if (event.key === "Enter") {
        event.preventDefault();
        if (content.trim() && !saving) onSave?.({ content: content.trim(), isPublic });
        return;
      }

      // Only intercept the rest while the editor itself has focus, so these
      // don't hijack the shortcut anywhere else on the page.
      if (document.activeElement !== textareaRef.current) return;

      const key = event.key.toLowerCase();
      const map = { b: "bold", i: "italic", k: "link" };

      if (map[key]) {
        event.preventDefault();
        applyAction(map[key]);
      } else if (key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // applyAction/undo/redo close over `content`, which is in the deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, isPublic, saving, onSave]);

  // Count the words the reader will see, not the Markdown syntax around them.
  const words = wordCount(stripMarkdown(content));
  const canSave = content.trim().length > 0 && !saving && !saved;

  // "Sunday, August 16" — the mobile design leads with the date as a headline.
  const longDateline = (() => {
    const parts = formatDateline().split(" · ");
    const weekday = parts[0]?.charAt(0) + parts[0]?.slice(1).toLowerCase();
    const monthDay = parts[1]?.charAt(0) + parts[1]?.slice(1).toLowerCase();
    return `${weekday}, ${monthDay}`;
  })();

  return (
    <div className="relative mx-auto max-w-3xl">
      {/* Meta rail above the sheet. On mobile the streak leads, with the
          date set large underneath — as in the mobile design. */}
      <div className="mb-5 lg:mb-6 lg:flex lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
        {streak > 0 && (
          <span className="relative inline-flex items-center gap-2 font-display text-label-caps uppercase text-on-surface-variant lg:order-2">
            <span className="washi -left-2 -top-1 h-6 w-20 -rotate-2 bg-primary-fixed/70 lg:hidden" />
            <Flame className="relative h-3.5 w-3.5 text-primary" strokeWidth={2.6} />
            <span className="relative">
              Day {streak + (isEditing ? 0 : 1)} streak
            </span>
          </span>
        )}

        <span className="hidden items-center gap-2 font-display text-label-caps uppercase text-on-surface-variant lg:flex lg:order-1">
          <CalendarDays className="h-3.5 w-3.5 text-primary" strokeWidth={2.6} />
          {formatDateline()}
        </span>

        <h1 className="mt-2 font-display text-[1.7rem] font-bold leading-tight tracking-[-0.025em] lg:hidden">
          {longDateline}
        </h1>
      </div>

      {/* The sheet. Full-bleed on mobile — no border or shadow competing
          with the writing surface on a small screen. */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-transparent lg:bg-surface-lowest lg:shadow-paper-lg"
      >
        <span className="washi -right-4 -top-3 hidden h-9 w-32 rotate-[4deg] bg-tertiary-bright/50 lg:block" />

        <SunMark className="pointer-events-none absolute right-2 top-10 h-24 w-24 text-outline-variant/30 lg:bottom-6 lg:right-6 lg:top-auto lg:h-12 lg:w-12 lg:text-outline-variant/40" />

        <div className="relative z-10 py-2 lg:px-14 lg:py-14">
          <h2 className="mb-2 font-journal text-[1.5rem] font-bold italic leading-tight lg:text-[2.5rem] lg:not-italic">
            Dear today,
          </h2>

          <MarkdownToolbar
            onAction={applyAction}
            onUndo={undo}
            onRedo={redo}
            canUndo={historySize.past > 0}
            canRedo={historySize.future > 0}
            preview={preview}
            onTogglePreview={() => setPreview((p) => !p)}
            disabled={saving || saved}
          />

          {preview ? (
            <div className="mt-6 min-h-[420px] lg:mt-8">
              {content.trim() ? (
                <Markdown>{content}</Markdown>
              ) : (
                <p className="font-journal text-journal-body italic text-on-surface-variant/40">
                  Nothing to preview yet.
                </p>
              )}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start where you are. Nobody is grading this.&#10;&#10;**bold**, *italic*, # heading, - list"
              aria-label="Today's journal entry"
              spellCheck
              className="mt-6 w-full resize-none border-0 bg-transparent p-0 font-journal text-journal-body leading-[1.8] text-on-surface placeholder:text-on-surface-variant/35 focus:ring-0 lg:mt-8"
              style={{ minHeight: 420 }}
            />
          )}
        </div>
      </motion.div>

      {/* Controls. On mobile the save button is pinned to the bottom of the
          viewport so it stays reachable however long the entry grows. */}
      <div className="mt-8 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
        <JournalVisibility
          isPublic={isPublic}
          onChange={setIsPublic}
          disabled={saving || saved}
        />

        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-outline-variant/60 bg-surface/90 px-margin-mobile py-3 frost md:static md:z-auto md:flex-col md:items-end md:gap-3 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <span className="font-annotation text-[11px] tracking-[0.12em] text-on-surface-variant/50">
            {words} {words === 1 ? "word" : "words"}
            <span className="hidden md:inline"> · ⌘↵ to save</span>
          </span>

          {/* Steps 1–4 of the unlock sequence animate this button. */}
          <motion.button
            ref={saveRefs.button}
            type="button"
            disabled={!canSave}
            onClick={() => onSave?.({ content: content.trim(), isPublic })}
            whileHover={canSave ? { y: -2, x: -1 } : undefined}
            whileTap={canSave ? { y: 3, x: 3 } : undefined}
            className="relative inline-flex shrink-0 items-center justify-center gap-2.5 border-2 border-primary bg-primary px-7 py-3 font-display text-[12px] font-bold uppercase tracking-[0.14em] text-on-primary shadow-press-primary transition-colors hover:bg-primary-bright disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none md:min-w-[15rem] md:px-9 md:py-4 md:text-[13px]"
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
