import { sql } from "../lib/db";
import { getPosts } from "../lib/queries";
import { Grid } from "../components/Grid";

export const dynamic = "force-dynamic";

export default async function Explore() {
  const posts = await getPosts({ take: 200, orderByLikes: true });
  const [{ count: people }] = await sql<{ count: number }>("SELECT count(*)::int AS count FROM users");
  return (
    <div className="col">
      <h1 className="page">Explore</h1>
      <p className="note">{posts.length} photos from {people} people, most liked first.</p>
      {posts.length ? <Grid posts={posts} /> : <div className="empty"><h2>Nothing to explore yet</h2></div>}
    </div>
  );
}
