import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 32, height: 32, position: "relative", display: "flex" }}>
        {/* Back layer */}
        <div
          style={{
            position: "absolute",
            left: 9,
            top: 9,
            width: 17,
            height: 17,
            borderRadius: 4,
            background: "#059669",
          }}
        />
        {/* Front layer */}
        <div
          style={{
            position: "absolute",
            left: 6,
            top: 6,
            width: 17,
            height: 17,
            borderRadius: 4,
            background: "#10b981",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
