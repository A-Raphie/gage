import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          border: "12px solid #1f2428",
        }}
      >
        <div
          style={{
            color: "#4976ff",
            fontSize: 300,
            fontWeight: 700,
            fontFamily: "sans-serif",
            display: "flex",
            paddingBottom: 30,
          }}
        >
          G
        </div>
      </div>
    ),
    size,
  );
}
