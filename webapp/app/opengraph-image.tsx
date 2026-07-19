import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050509",
          backgroundImage:
            "radial-gradient(circle at 28% 30%, rgba(131,110,249,0.35), transparent 60%), radial-gradient(circle at 75% 65%, rgba(185,164,255,0.28), transparent 55%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 96,
            height: 96,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 22,
            background: "#0a0a10",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 46,
              height: 46,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              border: "5px solid #836ef9",
            }}
          >
            <div style={{ width: 16, height: 16, borderRadius: 3, background: "rgba(131,110,249,0.7)" }} />
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 600, color: "#f1f0f6", letterSpacing: -2 }}>
          GlassBox
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#b9a4ff", marginTop: 20 }}>
          See it. Verify it. Trust it.
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#8f8ba3", marginTop: 28 }}>
          Every decision your trading agent makes, committed onchain before it executes.
        </div>
      </div>
    ),
    size,
  );
}
