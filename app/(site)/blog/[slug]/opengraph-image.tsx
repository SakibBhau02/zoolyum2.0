import { ImageResponse } from "next/og";
import { OgCard } from "@/components/seo/OgCard";
import { POSTS } from "@/lib/data";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  return new ImageResponse(
    (
      <OgCard
        eyebrow={post ? `Insights - ${post.category}` : "Insights"}
        title={post ? post.title : "Zoolyum Insights"}
        footer={post ? `${post.author} - ${post.readTime} read` : "zoolyum.com/blog"}
      />
    ),
    { ...size },
  );
}