import type { NextConfig } from "next"

const config: NextConfig = {
  allowedDevOrigins: ["10.0.0.209"], // LAN host used for mobile development.
  poweredByHeader: false,
  devIndicators: false,
  images: { unoptimized: true },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
      ],
    }]
  },
}
export default config
