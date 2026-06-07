/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Disables Next.js telemetry collection
  // serverExternalPackages replaces the deprecated serverComponentsExternalPackages
  serverExternalPackages: ["bcryptjs", "nodemailer"],
};

export default nextConfig;
