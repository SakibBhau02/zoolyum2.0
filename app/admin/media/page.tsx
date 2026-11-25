import { prisma } from "@/lib/prisma";
import { can, requireUser } from "@/lib/auth";
import { Badge, Card, EmptyState, PageHeader } from "../_ui/primitives";
import { MediaCard, UploadPanel } from "./media-client";

export default async function MediaPage() {
  const user = await requireUser("editor");
  const files = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 200 }).catch(() => []);
  const missingAlt = files.filter((f) => !f.alt).length;

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title={
          <>
            Media library<span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="Every upload lives here. Alt text is not decoration — it is how search engines and screen readers understand the image."
        actions={
          <Badge tone={missingAlt === 0 ? "ok" : "warn"}>
            {missingAlt === 0 ? "All images have alt text" : `${missingAlt} missing alt text`}
          </Badge>
        }
      />

      <Card>
        <h2 className="a-title mb-3 text-[15px]">Upload</h2>
        <UploadPanel />
      </Card>

      <div className="mt-4">
        {files.length === 0 ? (
          <EmptyState title="No uploads yet" description="Upload an image and it becomes available in every editor." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((f) => (
              <MediaCard
                key={f.id}
                canDelete={can(user.role, "admin")}
                file={{
                  id: f.id,
                  url: f.url,
                  alt: f.alt,
                  mime: f.mime,
                  size: f.size,
                  width: f.width,
                  height: f.height,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
