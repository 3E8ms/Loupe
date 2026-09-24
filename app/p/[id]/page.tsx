import { notFound } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import { getPosts, isFollowing } from "@/app/lib/queries";
import { PostCard } from "@/app/components/PostCard";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const me = await getCurrentUser();
  const [post] = await getPosts({ meId: me?.id, postId: id, take: 1 });
  if (!post) notFound();
  const following = me ? await isFollowing(me.id, post.author.id) : undefined;
  return <div className="feed"><PostCard post={post} meId={me?.id} following={following} /></div>;
}
