import path from "path"
import process from "node:process"

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  sassOptions: {
    includePaths: [path.join(process.cwd(), "src")]
  },
  async redirects() {
    return [
      {
        source: "/query",
        destination: "/wydarzenia",
        permanent: true
      }
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@styles": path.resolve(process.cwd(), "app/styles"),
      "@icons": path.resolve(process.cwd(), "img/icons"),
      "@images": path.resolve(process.cwd(), "src/img"),
      "../build/polyfills/polyfill-module": false,
      "next/dist/build/polyfills/polyfill-module": false
    }

    config.module.rules.push(
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: /react/,
        use: ["@svgr/webpack"]
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/react/] },
        type: "asset/resource"
      }
    )

    return config
  }
}

export default nextConfig
