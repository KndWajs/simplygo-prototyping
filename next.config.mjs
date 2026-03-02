import { createRequire } from "module"
import path from "path"
import process from "node:process"

const require = createRequire(import.meta.url)

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
    // Resolve the RSC flight client entry loader using the project's own Next.js
    // so the sandbox runner can find it regardless of its installed version.
    try {
      const nextDir = path.dirname(require.resolve("next/package.json"))
      config.resolveLoader = config.resolveLoader || {}
      config.resolveLoader.alias = {
        ...(config.resolveLoader.alias || {}),
        "next-flight-client-entry-loader": path.join(
          nextDir,
          "dist/build/webpack/loaders/next-flight-client-entry-loader.js"
        )
      }
    } catch (_) {
      // If resolution fails, continue without the alias
    }

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
