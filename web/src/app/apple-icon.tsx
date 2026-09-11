import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0c0e10",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "#4976ff",
            fontSize: 120,
            fontWeight: 700,
            fontFamily: "sans-serif",
            display: "flex",
            paddingBottom: 12,
          }}
        >
          G
        </div>
      </div>
    ),
    size,
  );
}
