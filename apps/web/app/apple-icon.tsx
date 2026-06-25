import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, position: "relative", display: "flex" }}>
        {/* Back layer */}
        <div
          style={{
            position: "absolute",
            left: 50,
            top: 50,
            width: 96,
            height: 96,
            borderRadius: 22,
            background: "#059669",
          }}
        />
        {/* Front layer */}
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 34,
            width: 96,
            height: 96,
            borderRadius: 22,
            background: "#10b981",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
