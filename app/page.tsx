import Link from "next/link";
import { getCurrentUser } from "./lib/auth";
import { getPosts, followingIds } from "./lib/queries";
import { PostCard } from "./components/PostCard";

export const dynamic = "force-dynamic";

export default async function Feed({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const me = await getCurrentUser();
  const follows = me ? await followingIds(me.id) : [];
  const onlyFollowing = tab === "following" && !!me;
  const posts = await getPosts({
    meId: me?.id,
    authorIds: onlyFollowing ? [...follows, me!.id] : undefined,
  });
  const followSet = new Set(follows);

  return (
    <div className="feed">
      {me && (
        <div className="seg">
          <Link href="/" aria-current={!onlyFollowing ? "true" : undefined}>Everyone</Link>
          <Link href="/?tab=following" aria-current={onlyFollowing ? "true" : undefined}>Following</Link>
        </div>
      )}
      {!me && <p className="banner">You're browsing as a guest. <Link href="/signup">Sign up</Link> to post, like and follow.</p>}
      {posts.length === 0 ? (
        <div className="empty">
          <h2>{onlyFollowing ? "No posts from people you follow" : "No photos yet"}</h2>
          <p>{me ? <Link href="/new">Share the first one.</Link> : "Posts will show up here."}</p>
        </div>
      ) : (
        posts.map((p) => (
          <PostCard key={p.id} post={p} meId={me?.id} following={me ? followSet.has(p.author.id) : undefined} />
        ))
      )}
    </div>
  );
}
