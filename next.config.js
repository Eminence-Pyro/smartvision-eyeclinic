/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC compiler — required for Android ARM (Termux) environments
  // SWC binaries are not published for android-arm64
  experimental: {
    forceSwcTransforms: false,
  },

  // Allow images from Unsplash and Cloudinary
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  // Disable Next.js telemetry collection
  // (the "anonymous telemetry" message you saw)
};

module.exports = nextConfig;
