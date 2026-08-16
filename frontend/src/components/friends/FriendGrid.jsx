import { motion } from "framer-motion";
import { Users } from "lucide-react";
import FriendCard from "./FriendCard";
import EmptyState from "../ui/EmptyState";
import { SkeletonFriendCard } from "../ui/Skeleton";
import { staggerContainer } from "../../animations/staggerAnimations";

export default function FriendGrid({ friends = [], loading = false, onAddFriend }) {
  if (loading) {
    return (
      <div className="grid gap-gutter sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonFriendCard key={i} />
        ))}
      </div>
    );
  }

  if (!friends.length) {
    return (
      <EmptyState
        icon={Users}
        title="Your people aren't here yet."
        body="Daymark is quiet on your own. Send a request and start reading each other's days."
        actionLabel="Add a friend"
        onAction={onAddFriend}
      />
    );
  }

  return (
    <motion.div
      variants={staggerContainer(0.08)}
      initial="initial"
      animate="animate"
      className="grid gap-gutter sm:grid-cols-2 xl:grid-cols-3"
    >
      {friends.map((friend, index) => (
        <FriendCard key={friend._id} friend={friend} index={index} />
      ))}
    </motion.div>
  );
}
