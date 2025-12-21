import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  webpack: (config, { isServer }) => {
    // Ignorar warnings de source maps de mapbox-gl y otros módulos
    if (!isServer) {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
          module: /node_modules\/mapbox-gl/,
        },
        /Failed to parse source map/,
        /Invalid source map/,
        /sourceMapURL could not be parsed/,
        /source map error/,
        (warning) => {
          // Ignorar cualquier warning relacionado con source maps
          if (
            warning.message &&
            (warning.message.includes("source map") ||
              warning.message.includes("sourceMapURL") ||
              warning.message.includes("sourceMap"))
          ) {
            return true;
          }
          return false;
        },
      ];
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
      {
        protocol: "https",
        //https://nextjs.org/docs/messages/next-image-unconfigured-host
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "guiadigital.iaph.es",
      },
      {
        protocol: "http",
        hostname: "guiadigital.iaph.es",
      },
      {
        protocol: "https",
        hostname: "palacetedelaalameda.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
