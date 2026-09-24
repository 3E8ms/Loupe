import { notFound } from "next/navigation";
import { sql } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";
import { getPosts, isFollowing } from "@/app/lib/queries";
import { Grid } from "@/app/components/Grid";
import { Avatar } from "@/app/components/Avatar";
import { FollowButton } from "@/app/components/Buttons";

export const dynamic = "force-dynamic";

type Profile = { id: string; username: string; name: string; posts: number; followers: number; following: number };

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [user] = await sql<Profile>(
    `SELECT u.id, u.username, u.name,
            (SELECT count(*)::int FROM posts   WHERE author_id    = u.id) AS posts,
            (SELECT count(*)::int FROM follows WHERE following_id = u.id) AS followers,
            (SELECT count(*)::int FROM follows WHERE follower_id  = u.id) AS following
       FROM users u WHERE u.username = $1`,
    [username]
  );
  if (!user) notFound();
  const me = await getCurrentUser();
  const iFollow = me ? await isFollowing(me.id, user.id) : false;
  const posts = await getPosts({ authorIds: [user.id], take: 200 });

  return (
    <div className="col">
      <div className="prof">
        <Avatar name={user.name} size={96} />
        <div className="info">
          <div className="name-row">
            <h1 className="page">{user.name}</h1>
            {me && me.id !== user.id && <FollowButton userId={user.id} following={iFollow} />}
          </div>
          <span className="meta">@{user.username}</span>
          <div className="stats">
            <span><b>{user.posts}</b>posts</span>
            <span><b>{user.followers}</b>followers</span>
            <span><b>{user.following}</b>following</span>
          </div>
        </div>
      </div>
      {posts.length ? <Grid posts={posts} /> : <div className="empty"><h2>No posts yet</h2></div>}
    </div>
  );
}
