/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid stale webpack cache errors with dynamic/vendor chunks in dev
  webpack: (config, { dev }) => {
    if (dev) config.cache = false;
    return config;
  },
};

export default nextConfig;
