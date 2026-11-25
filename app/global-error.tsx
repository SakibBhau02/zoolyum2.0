"use client";

/**
 * Last-resort boundary for errors thrown by the root layout itself. It cannot
 * use the site header/footer (they may be the thing that failed), so it ships
 * its own minimal shell.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#241f1b", color: "#f6f1e8", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "96px 24px" }}>
          <p style={{ margin: 0, color: "#ff7a3d", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase" }}>
            Zoolyum
          </p>
          <h1 style={{ margin: "18px 0 12px", fontSize: 32, lineHeight: 1.2 }}>The site could not start.</h1>
          <p style={{ margin: 0, color: "#cfc6bc", fontSize: 15, lineHeight: 1.65 }}>
            Something failed at the root of the page. Try again; if it continues, email{" "}
            <a href="mailto:hello@zoolyum.com" style={{ color: "#ff7a3d" }}>
              hello@zoolyum.com
            </a>
            .
          </p>
          {error.digest && (
            <p style={{ marginTop: 16, color: "#8f867d", fontSize: 11 }}>Reference: {error.digest}</p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 28,
              padding: "12px 22px",
              border: 0,
              borderRadius: 8,
              background: "#ff5001",
              color: "#241f1b",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
