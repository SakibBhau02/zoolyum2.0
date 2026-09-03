/**
 * OgCard - shared 1200x630 social preview renderer for dynamic
 * opengraph-image routes. Server-only (used inside ImageResponse).
 */
export function OgCard({
  eyebrow,
  title,
  footer,
}: {
  eyebrow: string;
  title: string;
  footer: string;
}) {
  const titleSize = title.length > 70 ? 54 : title.length > 40 ? 62 : 70;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: "linear-gradient(120deg, #241f1b 0%, #3a2e26 55%, #241f1b 100%)",
        color: "#f6f1e8",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: "#ff5001",
            boxShadow: "0 0 24px #ff5001",
          }}
        />
        <span style={{ fontSize: 28, letterSpacing: 6, fontWeight: 600 }}>ZOOLYUM</span>
        <span style={{ fontSize: 24, color: "#f6f1e880", marginLeft: 12 }}>{eyebrow}</span>
      </div>

      <div style={{ display: "flex", fontSize: titleSize, fontWeight: 700, lineHeight: 1.12 }}>
        {title.length > 110 ? `${title.slice(0, 107)}...` : title}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ height: 2, width: 90, background: "#ff5001" }} />
        <span style={{ fontSize: 26, color: "#ff6a26" }}>{footer}</span>
      </div>
    </div>
  );
}