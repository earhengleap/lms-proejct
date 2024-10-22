/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["jspdf", "jspdf-autotable"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};

export default nextConfig;
