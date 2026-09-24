import Link from "next/link";
import type { FeedPost } from "@/app/lib/queries";

export function Grid({ posts }: { posts: FeedPost[] }) {
  return (
    <div className="grid">
      {posts.map((p) => (
        <Link key={p.id} href={`/p/${p.id}`} className="cell" aria-label="Open post">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/images/${p.imageFile}`} alt="" loading="lazy" />
          <span className="ov">♥ {p.likeCount}</span>
        </Link>
      ))}
    </div>
  );
}
