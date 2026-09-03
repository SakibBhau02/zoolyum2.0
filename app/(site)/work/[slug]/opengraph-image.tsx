import { ImageResponse } from "next/og";
import { OgCard } from "@/components/seo/OgCard";
import { PROJECTS } from "@/lib/data";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  return new ImageResponse(
    (
      <OgCard
        eyebrow={project ? `Case Study - ${project.industry}` : "Case Study"}
        title={project ? project.title : "Zoolyum Work"}
        footer={project ? project.result : "zoolyum.com/work"}
      />
    ),
    { ...size },
  );
}