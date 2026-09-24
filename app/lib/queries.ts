import "server-only";
import { sql } from "./db";

export type FeedPost = {
  id: string;
  imageFile: string;
  caption: string;
  createdAt: Date;
  author: { id: string; username: string; name: string };
  likeCount: number;
  likedByMe: boolean;
};

type Row = {
  id: string; image_file: string; caption: string; created_at: Date;
  author_id: string; username: string; name: string; like_count: number; liked_by_me: boolean;
};

/**
 * Posts with author, like count and whether `meId` liked each one.
 * Filters: authorIds (a profile or the Following feed) or postId (one post).
 */
export async function getPosts(opts: {
  meId?: string; authorIds?: string[]; postId?: string; orderByLikes?: boolean; take?: number;
}): Promise<FeedPost[]> {
  const rows = await sql<Row>(
    `SELECT p.id, p.image_file, p.caption, p.created_at,
            u.id AS author_id, u.username, u.name,
            (SELECT count(*)::int FROM likes l WHERE l.post_id = p.id) AS like_count,
            EXISTS (SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $1) AS liked_by_me
       FROM posts p JOIN users u ON u.id = p.author_id
      WHERE ($2::bigint[] IS NULL OR p.author_id = ANY($2))
        AND ($3::bigint IS NULL OR p.id = $3)
      ORDER BY ${opts.orderByLikes ? "like_count DESC, p.created_at DESC" : "p.created_at DESC"}
      LIMIT $4`,
    [opts.meId ?? null, opts.authorIds ?? null, opts.postId ?? null, opts.take ?? 50]
  );
  return rows.map((r) => ({
    id: r.id,
    imageFile: r.image_file,
    caption: r.caption,
    createdAt: r.created_at,
    author: { id: r.author_id, username: r.username, name: r.name },
    likeCount: r.like_count,
    likedByMe: r.liked_by_me,
  }));
}

export async function followingIds(meId: string) {
  const rows = await sql<{ following_id: string }>("SELECT following_id FROM follows WHERE follower_id = $1", [meId]);
  return rows.map((r) => r.following_id);
}

export async function isFollowing(meId: string, userId: string) {
  const rows = await sql("SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2", [meId, userId]);
  return rows.length > 0;
}
