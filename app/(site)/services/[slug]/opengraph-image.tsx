import { ImageResponse } from "next/og";
import { OgCard } from "@/components/seo/OgCard";
import { SERVICES } from "@/lib/data";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Services"
        title={service ? service.name : "Zoolyum Services"}
        footer={service ? service.tagline : "zoolyum.com/services"}
      />
    ),
    { ...size },
  );
}