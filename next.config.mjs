/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // static HTML export for GitHub Pages
  trailingSlash: true,       // required for static hosting
  basePath: '/foodkwetu',    // GitHub Pages serves at /reponame
  assetPrefix: '/foodkwetu/',
  images: {
    unoptimized: true,       // required for static export (no Next.js image server)
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
