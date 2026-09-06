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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#101218",
        }}
      >
        <div
          style={{
            width: 108,
            height: 108,
            borderRadius: 999,
            background: "linear-gradient(135deg, #4ea1ff 0%, #8b7cff 42%, #f472b6 72%, #fb923c 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "#fff",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
