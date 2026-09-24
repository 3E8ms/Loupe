import Link from "next/link";
import type { FeedPost } from "@/app/lib/queries";
import { LikeablePhoto, FollowButton, DeleteButton } from "./Buttons";
import { Avatar } from "./Avatar";
import { ago } from "@/app/lib/format";

export function PostCard({ post, meId, following }: { post: FeedPost; meId?: string; following?: boolean }) {
  const mine = post.author.id === meId;
  return (
    <article className="post">
      <div className="post-head">
        <Avatar name={post.author.name} />
        <div className="grow">
          <Link className="who" href={`/u/${post.author.username}`}>{post.author.name}</Link>
          <span className="meta">@{post.author.username} · {ago(post.createdAt)}</span>
        </div>
        {meId && !mine && following !== undefined && <FollowButton userId={post.author.id} following={following} />}
      </div>
      <LikeablePhoto postId={post.id} src={`/api/images/${post.imageFile}`}
        alt={post.caption ? `Photo: ${post.caption.slice(0, 80)}` : "Photo"}
        liked={post.likedByMe} count={post.likeCount} canLike={!!meId} />
      <div className="post-body">
        {post.caption && <p className="caption"><b>{post.author.username}</b>{post.caption}</p>}
        {mine && <DeleteButton postId={post.id} />}
      </div>
    </article>
  );
}
