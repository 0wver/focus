/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during the build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during the build
    ignoreBuildErrors: true
  }
};

export default nextConfig; 