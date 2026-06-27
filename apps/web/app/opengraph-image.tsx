import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0e0e10",
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          position: "relative",
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            background: "radial-gradient(ellipse at center top, rgba(16,185,129,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div style={{ position: "relative", width: 72, height: 72, display: "flex", marginBottom: 32 }}>
          <div
            style={{
              position: "absolute",
              left: 22,
              top: 22,
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "#059669",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 8,
              top: 8,
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "#10b981",
            }}
          />
        </div>

        {/* Wordmark */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#e2e2e5",
            letterSpacing: "-2px",
            marginBottom: 16,
          }}
        >
          Freebase
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            letterSpacing: "-0.5px",
            textAlign: "center",
            maxWidth: 640,
          }}
        >
          The free product feedback platform
        </div>

        {/* Accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, transparent, #10b981 30%, #059669 70%, transparent)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
