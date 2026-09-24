"use client";
import { useOptimistic, useState, useTransition } from "react";
import { toggleLike, toggleFollow, deletePost } from "@/app/lib/actions";

const Heart = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.6 4.5 7.1 4.5c2 0 3.5 1.1 4.9 2.9 1.4-1.8 2.9-2.9 4.9-2.9 3.5 0 5.6 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
  </svg>
);

/** Photo + like button. Double-click the photo to like. */
export function LikeablePhoto({ postId, src, alt, liked, count, canLike }: {
  postId: string; src: string; alt: string; liked: boolean; count: number; canLike: boolean;
}) {
  const [state, setOptimistic] = useOptimistic({ liked, count });
  const [, start] = useTransition();
  const [burst, setBurst] = useState(0);

  function toggle(forceOn = false) {
    if (!canLike || (forceOn && state.liked)) return;
    start(async () => {
      setOptimistic({ liked: !state.liked, count: state.count + (state.liked ? -1 : 1) });
      await toggleLike(postId);
    });
  }

  return (
    <>
      <div className="frame" onDoubleClick={() => { setBurst((b) => b + 1); toggle(true); }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" />
        {burst > 0 && <div key={burst} className="burst"><Heart /></div>}
      </div>
      <div className="actions">
        <button className={`like${state.liked ? " on" : ""}`} onClick={() => toggle()} disabled={!canLike}
          aria-pressed={state.liked} aria-label={state.liked ? "Unlike" : "Like"}>
          <Heart /><span>{state.count} {state.count === 1 ? "like" : "likes"}</span>
        </button>
      </div>
    </>
  );
}

export function FollowButton({ userId, following }: { userId: string; following: boolean }) {
  const [on, setOn] = useOptimistic(following);
  const [, start] = useTransition();
  return (
    <button className={`follow${on ? " on" : ""}`}
      onClick={() => start(async () => { setOn(!on); await toggleFollow(userId); })}>
      {on ? "Following" : "Follow"}
    </button>
  );
}

export function DeleteButton({ postId }: { postId: string }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  if (!confirm) return <button className="del" onClick={() => setConfirm(true)}>Delete</button>;
  return (
    <span className="del-confirm">
      Delete post?
      <button className="yes" disabled={pending} onClick={() => start(() => deletePost(postId))}>Delete</button>
      <button onClick={() => setConfirm(false)}>Cancel</button>
    </span>
  );
}
