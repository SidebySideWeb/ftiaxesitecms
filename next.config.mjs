/** @type {import('next').NextConfig} */
export default {
  experimental: {
    // Server Actions 2.0
    serverActions: { 
      bodySizeLimit: "2mb" 
    },
  },
  // Disable source maps completely to avoid Turbopack source map warnings
  productionBrowserSourceMaps: false,
};

