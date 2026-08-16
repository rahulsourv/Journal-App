import { motion } from "framer-motion";
import { Search, Lock } from "lucide-react";
import Avatar from "../ui/Avatar";
import { staggerContainer, staggerItem } from "../../animations/staggerAnimations";
import { excerpt, formatRelative } from "../../utils/formatDate";

/**
 * The list of people you can write to — one row per friend.
 *
 * A friend without a known `conversationId` is shown dimmed and locked
 * rather than hidden, so it's obvious the person exists and why their chat
 * can't open yet. See utils/storage.js for why that id can be missing.
 */
export default function ConversationList({
  conversations = [],
  activeId,
  onSelect,
  query,
  onQueryChange,
  className = "",
}) {
  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="px-margin-mobile md:px-6">
        <div className="relative flex items-center gap-3 border-b-2 border-outline-variant pb-2.5">
          <Search className="h-5 w-5 shrink-0 text-on-surface-variant/60" strokeWidth={2} />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search conversations…"
            aria-label="Search conversations"
            className="w-full border-0 bg-transparent p-0 font-journal text-[17px] italic text-on-surface placeholder:text-on-surface-variant/45 focus:ring-0"
          />
        </div>
      </div>

      <motion.ul
        variants={staggerContainer(0.05)}
        initial="initial"
        animate="animate"
        className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto px-margin-mobile pb-4 md:px-6"
      >
        {conversations.map((conversation) => {
          const isActive = conversation.conversationId === activeId;
          const locked = !conversation.conversationId;

          return (
            <motion.li key={conversation._id} variants={staggerItem}>
              <button
                type="button"
                onClick={() => onSelect(conversation)}
                disabled={locked}
                className={`
                  w-full rounded-lg border px-4 py-3.5 text-left transition-colors
                  ${
                    isActive
                      ? "border-on-surface bg-surface-container shadow-paper-sm"
                      : "border-outline-variant/70 bg-surface-lowest hover:border-outline-variant"
                  }
                  ${locked ? "cursor-not-allowed opacity-55" : ""}
                `}
              >
                <div className="flex items-center gap-3.5">
                  <Avatar
                    username={conversation.username}
                    size="md"
                    active={conversation.wroteToday}
                    className="rounded-full"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-journal text-lg font-bold leading-tight">
                        {conversation.username}
                      </p>
                      {conversation.lastAt && (
                        <span className="shrink-0 font-display text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/50">
                          {formatRelative(conversation.lastAt)}
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 truncate font-journal text-[15px] italic text-on-surface-variant/75">
                      {locked ? (
                        <span className="flex items-center gap-1.5 not-italic">
                          <Lock className="h-3 w-3" strokeWidth={2.4} />
                          <span className="font-display text-[10px] font-bold uppercase tracking-[0.1em]">
                            No conversation yet
                          </span>
                        </span>
                      ) : conversation.lastMessage ? (
                        excerpt(conversation.lastMessage, 44)
                      ) : (
                        "Say something first…"
                      )}
                    </p>
                  </div>
                </div>
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
