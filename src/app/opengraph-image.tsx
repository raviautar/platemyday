import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PlateMyDay — Stop Wasting Food, Start Eating Better";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          background: "linear-gradient(135deg, #FEFCF8 0%, #F3EDE4 40%, #E4D9CC 70%, #FEFCF8 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Green radial glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 500,
            background: "radial-gradient(ellipse, rgba(58,125,68,0.18) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Logo circle */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3A7D44, #2D6235)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
            boxShadow: "0 20px 60px rgba(58,125,68,0.3)",
          }}
        >
          <span style={{ fontSize: 64 }}>🥗</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            background: "linear-gradient(90deg, #3A7D44, #2D6235, #3A7D44)",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: "-2px",
            marginBottom: 16,
            WebkitBackgroundClip: "text",
          }}
        >
          PlateMyDay
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#5A5144",
            marginBottom: 12,
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Stop Wasting Food. Start Eating Better.
        </div>

        <div
          style={{
            fontSize: 20,
            color: "#8B7355",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          Turn what&apos;s already in your kitchen into a week of delicious, personalized meals.
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.7)",
            borderRadius: 100,
            padding: "8px 20px",
            border: "1px solid rgba(200,185,165,0.5)",
          }}
        >
          <span style={{ fontSize: 14, color: "#8B7355" }}>by</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#3A7D44" }}>ravilution.ai</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
