import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#10b981",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#0e0e10",
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1,
            fontFamily: "sans-serif",
            letterSpacing: "-1px",
          }}
        >
          F
        </span>
      </div>
    ),
    { ...size }
  );
}
