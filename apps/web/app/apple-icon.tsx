import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "#10b981",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#0e0e10",
            fontSize: 100,
            fontWeight: 700,
            lineHeight: 1,
            fontFamily: "sans-serif",
            letterSpacing: "-4px",
          }}
        >
          F
        </span>
      </div>
    ),
    { ...size }
  );
}
