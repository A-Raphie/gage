import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// The brand mark: the proof strand. Two nodes, one connection,
// solid at the verified end. Simplified to survive 32px favicons.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0C0E10",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 400,
            height: 400,
            borderRadius: "50%",
            border: "10px solid #1F2428",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              border: "14px solid #4976FF",
              background: "#111417",
              position: "absolute",
              left: 8,
              display: "flex",
            }}
          />
          <div
            style={{
              width: 210,
              borderTop: "14px solid #4976FF",
              position: "absolute",
              left: 118,
              right: 118,
              display: "flex",
            }}
          />
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: "#4976FF",
              position: "absolute",
              right: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 40,
                height: 22,
                borderBottom: "10px solid #fff",
                borderLeft: "10px solid #fff",
                transform: "rotate(-45deg) translate(4px, -6px)",
                display: "flex",
              }}
            />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
