/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    '@prisma/client',
    'bcryptjs',
    'pdf-parse',
    'mammoth',
  ],
  images: { remotePatterns: [] },
  typescript: { ignoreBuildErrors: false },
  turbopack: {},
}
export default nextConfig