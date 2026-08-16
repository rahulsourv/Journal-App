import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

import PageTransition from "../../components/layout/PageTransition";
import FriendGrid from "../../components/friends/FriendGrid";
import FriendSearch from "../../components/friends/FriendSearch";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ErrorState from "../../components/ui/ErrorState";
import { toast } from "../../components/ui/Toast";
import useFriends from "../../hooks/useFriends";

export default function Friends() {
  const { friends, activeToday, loading, error, reload, sendRequest } = useFriends({
    includeRequests: false,
  });
  const [addOpen, setAddOpen] = useState(false);

  const handleSendRequest = async (user) => {
    try {
      await sendRequest(user._id);
      toast.success("Request sent.", `@${user.username} will see it shortly.`);
    } catch (err) {
      toast.error("Couldn't send that.", err.message);
      throw err;
    }
  };

  if (error) {
    return (
      <PageTransition>
        <ErrorState error={error} onRetry={reload} />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-7xl">
      <header className="relative mb-12">
        <span
          className="watermark absolute -left-3 -top-8 hidden text-[10rem] lg:block"
          aria-hidden="true"
        >
          ✳
        </span>

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="font-display text-[2.75rem] font-extrabold uppercase leading-none tracking-[-0.035em] sm:text-6xl lg:text-7xl"
          >
            Your people.
          </motion.h1>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Badge tone="secondary">
              {loading ? "…" : `${friends.length} friends`}
            </Badge>
            <Badge tone="tertiary" dot>
              {loading ? "…" : `${activeToday} active today`}
            </Badge>

            <Button
              icon={UserPlus}
              onClick={() => setAddOpen(true)}
              className="ml-auto"
            >
              Add friend
            </Button>
          </div>

          <div className="mt-7 h-0.5 w-full bg-on-surface" />
        </div>
      </header>

      <FriendGrid
        friends={friends}
        loading={loading}
        onAddFriend={() => setAddOpen(true)}
      />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        eyebrow="Add someone"
        title="Who should be reading your days?"
        size="lg"
      >
        <FriendSearch onSendRequest={handleSendRequest} />
      </Modal>
    </PageTransition>
  );
}
