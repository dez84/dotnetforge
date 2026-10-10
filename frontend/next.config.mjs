/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle for slim Docker images. Off by default so
  // platform adapters (Netlify/Vercel) use their own build output.
  output: process.env.BUILD_STANDALONE === '1' ? 'standalone' : undefined,
  async rewrites() {
    // Proxy API calls to the Express backend so the browser stays same-origin.
    const target = process.env.API_PROXY_TARGET || 'http://localhost:4000';
    return [{ source: '/api/:path*', destination: `${target}/api/:path*` }];
  },
};

export default nextConfig;
