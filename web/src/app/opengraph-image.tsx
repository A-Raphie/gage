import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Gage · proof-settled escrow on Creditcoin";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0e10",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#3eaa6d",
              display: "flex",
            }}
          />
          <div
            style={{
              color: "#85878a",
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            testnet · sepolia → creditcoin cc3 · precompile 0x0FD2
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#f0efee",
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.05,
              display: "flex",
            }}
          >
            Pay on Ethereum.
          </div>
          <div
            style={{
              color: "#4976ff",
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.05,
              display: "flex",
            }}
          >
            Release on proof.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* the strand, statically */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              border: "3px solid #4976ff",
              display: "flex",
            }}
          />
          <div style={{ width: 340, height: 0, borderTop: "3px dashed #7a9fff", display: "flex" }} />
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: "#4976ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 26,
            }}
          >
            ✓
          </div>
          <div style={{ color: "#aaacae", fontSize: 30, display: "flex", marginLeft: 16 }}>
            the Attestcoin proof is the settlement
          </div>
        </div>
      </div>
    ),
    size,
  );
}
