/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  output: "export",
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    unoptimized: true
  }
};

export default nextConfig;
