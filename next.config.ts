import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['mongoose'],
  webpack(config, { isServer }) {
    if (!isServer) {
      // punycode is a Node.js built-in shim that Mongoose pulls in — not needed in browser
      config.resolve = config.resolve || {};
      config.resolve.fallback = { ...(config.resolve.fallback || {}), punycode: false };
    }
    return config;
  },
};

export default nextConfig;
