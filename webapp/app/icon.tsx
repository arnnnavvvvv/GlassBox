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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050509",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            border: "2.5px solid #836ef9",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 5, height: 5, borderRadius: 1, background: "#836ef9", opacity: 0.7 }} />
        </div>
      </div>
    ),
    size,
  );
}
