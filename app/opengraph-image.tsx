import { ImageResponse } from "next/og";

export const alt = "SchoolFinder SA — find the right school for your child";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The preview card Facebook, WhatsApp and others show when the site is shared. */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0A1628 0%, #13284A 100%)",
          color: "#F9F7F4",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 700 }}>
          <Logo />
          SchoolFinder SA
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Find the right school
          </div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: "#F5A623" }}>
            for your child.
          </div>
          <div style={{ marginTop: 28, fontSize: 32, color: "rgba(249,247,244,0.75)" }}>
            Every Western Cape school · fees, distance & how to apply
          </div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["Primary", "High school", "No-fee", "Special needs", "Free for parents"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(249,247,244,0.10)",
                border: "1px solid rgba(249,247,244,0.18)",
                fontSize: 24,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

function Logo() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24">
      <path d="M12 2 2 7l10 5 10-5-10-5z" fill="#F5A623" />
      <path d="m2 17 10 5 10-5M2 12l10 5 10-5" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
