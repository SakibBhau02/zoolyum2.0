import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Zoolyum - Consultancy. Strategy. Solution.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
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
          <span style={{ fontSize: 30, letterSpacing: 6, fontWeight: 600 }}>ZOOLYUM</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, maxWidth: 940 }}>
            Consultancy. Strategy. Solution.
          </span>
          <span style={{ fontSize: 30, color: "#f6f1e8aa" }}>
            The market has a pattern. We help you read it first.
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ height: 2, width: 90, background: "#ff5001" }} />
          <span style={{ fontSize: 24, color: "#f6f1e8aa" }}>zoolyum.com</span>
        </div>
      </div>
    ),
    { ...size },
  );
}