import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Info, Wifi, WifiOff } from "lucide-react";

import PageTransition from "../../components/layout/PageTransition";
import ConversationList from "../../components/chat/ConversationList";
import MessageThread from "../../components/chat/MessageThread";
import ChatComposer from "../../components/chat/ChatComposer";
import Avatar from "../../components/ui/Avatar";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";

import useAuth from "../../hooks/useAuth";
import useFriends from "../../hooks/useFriends";
import useChat from "../../hooks/useChat";
import { getConversationMap } from "../../utils/storage";

/**
 * Messages.
 *
 * Mobile is two screens — the list, then the thread — driven by the route.
 * Desktop shows both side by side, per the chat workspace design.
 */
export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends, loading: friendsLoading } = useFriends({ includeRequests: false });

  const [query, setQuery] = useState("");

  // Friends joined to whatever conversation ids we know about.
  const conversations = useMemo(() => {
    const map = getConversationMap(user?.userId);
    return friends.map((friend) => ({
      ...friend,
      conversationId: map[String(friend._id)] ?? null,
    }));
  }, [friends, user?.userId]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter((c) => c.username.toLowerCase().includes(needle));
  }, [conversations, query]);

  const active = conversations.find((c) => c.conversationId === conversationId) ?? null;
  const { messages, loading, error, connected, send, myId } = useChat(conversationId);

  // A conversation id in the URL that doesn't match any friend is stale.
  useEffect(() => {
    if (conversationId && !friendsLoading && !active) {
      navigate("/messages", { replace: true });
    }
  }, [conversationId, friendsLoading, active, navigate]);

  const openable = conversations.filter((c) => c.conversationId).length;

  if (friendsLoading) {
    return (
      <PageTransition>
        <Loader message="Finding your people…" />
      </PageTransition>
    );
  }

  if (!friends.length) {
    return (
      <PageTransition className="mx-auto max-w-5xl">
        <EmptyState
          icon={MessageSquare}
          title="No one to write to yet."
          body="Messages open up once you have friends. Add someone first."
          actionLabel="Find people"
          onAction={() => navigate("/discover")}
        />
      </PageTransition>
    );
  }

  const showThreadOnMobile = Boolean(conversationId);

  return (
    <PageTransition className="mx-auto max-w-7xl">
      <div className="lg:grid lg:h-[calc(100vh-10rem)] lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-8">
        {/* ---------- Conversation list ---------- */}
        <section
          className={`flex min-h-0 flex-col ${showThreadOnMobile ? "hidden lg:flex" : "flex"}`}
        >
          <header className="mb-6 px-margin-mobile md:px-6">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-journal text-[2.5rem] font-bold leading-none tracking-tight lg:text-5xl"
            >
              Messages
            </motion.h1>
          </header>

          {/* Honest about the id gap rather than silently hiding people. */}
          {openable < conversations.length && (
            <p className="mx-margin-mobile mb-5 flex items-start gap-2.5 border-l-2 border-secondary bg-secondary-fixed/40 px-4 py-3 font-annotation text-xs leading-relaxed text-secondary md:mx-6">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
              <span>
                Some chats can&rsquo;t open yet — the API doesn&rsquo;t return a
                conversation id for friendships made before now. New friends
                you add or accept will work.
              </span>
            </p>
          )}

          <ConversationList
            conversations={filtered}
            activeId={conversationId}
            onSelect={(c) => navigate(`/messages/${c.conversationId}`)}
            query={query}
            onQueryChange={setQuery}
            className="min-h-0 flex-1"
          />
        </section>

        {/* ---------- Thread ---------- */}
        <section
          className={`flex min-h-0 flex-col lg:border-l lg:border-outline-variant/60 ${
            showThreadOnMobile ? "flex" : "hidden lg:flex"
          }`}
        >
          {active ? (
            <>
              <header className="flex items-center gap-3 border-b border-outline-variant/60 px-margin-mobile py-3 md:px-8">
                <button
                  type="button"
                  onClick={() => navigate("/messages")}
                  aria-label="Back to messages"
                  className="-ml-1 shrink-0 p-1.5 text-on-surface-variant transition-colors hover:text-primary lg:hidden"
                >
                  <ArrowLeft className="h-5 w-5" strokeWidth={2.4} />
                </button>

                <div className="min-w-0 flex-1 text-center lg:text-left">
                  <h2 className="truncate font-journal text-xl font-bold leading-tight">
                    {active.username}
                  </h2>
                  <p
                    className={`mt-0.5 flex items-center justify-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-[0.1em] lg:justify-start ${
                      connected ? "text-primary" : "text-on-surface-variant/50"
                    }`}
                  >
                    {connected ? (
                      <>
                        <Wifi className="h-2.5 w-2.5" strokeWidth={3} />
                        Connected
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-2.5 w-2.5" strokeWidth={3} />
                        Connecting…
                      </>
                    )}
                  </p>
                </div>

                <Avatar
                  username={active.username}
                  size="sm"
                  active={active.wroteToday}
                  className="shrink-0 rounded-full"
                />
              </header>

              {error ? (
                <div className="flex flex-1 items-center justify-center px-8 py-16 text-center">
                  <p className="max-w-sm font-journal text-lg italic text-on-surface-variant">
                    {error.message}
                  </p>
                </div>
              ) : (
                <MessageThread messages={messages} loading={loading} myId={myId} />
              )}

              <ChatComposer onSend={send} disabled={Boolean(error)} />
            </>
          ) : (
            <div className="hidden flex-1 flex-col items-center justify-center px-8 text-center lg:flex">
              <span className="mb-6 grid h-16 w-16 place-items-center border-2 border-outline-variant/70 text-on-surface-variant/45">
                <MessageSquare className="h-7 w-7" strokeWidth={1.6} />
              </span>
              <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight">
                Pick someone to write to.
              </h3>
              <p className="mt-3 max-w-xs font-journal text-[17px] italic text-on-surface-variant/70">
                Conversations here are just between the two of you.
              </p>
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
