/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  reactStrictMode: true,
  async redirects() {
    return [{ source: '/reviews', destination: '/', permanent: true }]
  },
}

export default nextConfig
