/** @type {import('next').NextConfig} */
const nextConfig = {
  // SWC is the default Next.js compiler — fast, no extra config needed on laptop/server
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

module.exports = nextConfig;
