/**
 * Markdown helpers for the journal editor.
 *
 * Entries are stored as a plain Markdown string in the existing `content`
 * field — no new fields, no files, no schema change. The toolbar below edits
 * that string; the renderer turns it back into formatted text for reading.
 */

/* ------------------------------------------------------------------ *
 * Editing
 * ------------------------------------------------------------------ */

/**
 * Wrap the selection in a marker, or unwrap it if it's already wrapped.
 *
 * With nothing selected, the markers are inserted and the caret is placed
 * between them so the next keystroke lands inside the formatting.
 */
export function toggleWrap(value, start, end, marker) {
  const selected = value.slice(start, end);
  const before = value.slice(0, start);
  const after = value.slice(end);
  const len = marker.length;

  // Already wrapped — remove the markers rather than nesting them.
  if (
    before.endsWith(marker) &&
    after.startsWith(marker) &&
    selected.length > 0
  ) {
    return {
      value: before.slice(0, -len) + selected + after.slice(len),
      start: start - len,
      end: end - len,
    };
  }

  // Selection itself carries the markers.
  if (selected.startsWith(marker) && selected.endsWith(marker) && selected.length > len * 2) {
    const inner = selected.slice(len, -len);
    return { value: before + inner + after, start, end: start + inner.length };
  }

  return {
    value: `${before}${marker}${selected}${marker}${after}`,
    start: start + len,
    end: start + len + selected.length,
  };
}

/** Expand a range to cover the whole lines it touches. */
function lineRange(value, start, end) {
  const from = value.lastIndexOf("\n", start - 1) + 1;
  let to = value.indexOf("\n", end);
  if (to === -1) to = value.length;
  return { from, to };
}

/**
 * Apply a line prefix ("## ", "> ", "- ") across every selected line,
 * toggling it off if all of them already have it.
 *
 * `ordered` renumbers instead of repeating a fixed prefix.
 */
export function togglePrefix(value, start, end, prefix, { ordered = false } = {}) {
  const { from, to } = lineRange(value, start, end);
  const block = value.slice(from, to);
  const lines = block.split("\n");

  // Any existing list/heading/quote marker on the line.
  const existing = /^(\s*)(#{1,6}\s+|>\s+|[-*+]\s+|\d+\.\s+)?/;
  const matcher = ordered ? /^\s*\d+\.\s+/ : new RegExp(`^\\s*${prefix.trim()}\\s+`);

  const allHave = lines.every((line) => !line.trim() || matcher.test(line));

  const next = lines
    .map((line, i) => {
      if (!line.trim()) return line;

      // Strip whatever marker is there, so switching between block types
      // replaces rather than stacks them.
      const bare = line.replace(existing, (_, indent) => indent ?? "");

      if (allHave) return bare;
      return ordered ? `${i + 1}. ${bare}` : `${prefix}${bare}`;
    })
    .join("\n");

  return {
    value: value.slice(0, from) + next + value.slice(to),
    start: from,
    end: from + next.length,
  };
}

/** Insert a link, using the selection as the label when there is one. */
export function insertLink(value, start, end, url = "") {
  const selected = value.slice(start, end);
  const label = selected || "link text";
  const snippet = `[${label}](${url})`;

  return {
    value: value.slice(0, start) + snippet + value.slice(end),
    // Select the url slot if there's a label, otherwise the label.
    start: selected ? start + label.length + 3 : start + 1,
    end: selected ? start + label.length + 3 + url.length : start + 1 + label.length,
  };
}

/* ------------------------------------------------------------------ *
 * Reading
 * ------------------------------------------------------------------ */

/**
 * Reduce Markdown to readable plain text.
 *
 * Card previews and word counts must not show or count syntax — a preview
 * reading "## My Day  Today was **really** good" would leak the markup that
 * the reader is supposed to hide.
 */
export function stripMarkdown(input = "") {
  return (
    input
      // fenced code — keep the code, drop the fence
      .replace(/```[\w-]*\n?([\s\S]*?)```/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      // images before links, or the alt text survives twice
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      // headings, quotes, list markers
      .replace(/^\s{0,3}#{1,6}\s+/gm, "")
      .replace(/^\s{0,3}>\s?/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      // horizontal rules
      .replace(/^\s*([-*_])\1{2,}\s*$/gm, "")
      // emphasis / strikethrough
      .replace(/(\*\*\*|___)(.*?)\1/g, "$2")
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/~~(.*?)~~/g, "$1")
      .trim()
  );
}

/** The first heading in an entry, if it opens with one — used as a title. */
export function extractTitle(input = "") {
  const match = input.match(/^\s{0,3}#{1,6}\s+(.+)$/m);
  return match ? match[1].trim() : null;
}
