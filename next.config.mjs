/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true,
    distDir: process.env.DIST_DIR || '.next',
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'images.pexels.com',
        },
        {
          protocol: 'https',
          hostname: 'images.pixabay.com',
        },
        {
          protocol: 'https',
          hostname: 'th.bing.com',
        },
      ],
      // Optimisation pour l'Italie : cache agressif des images
      minimumCacheTTL: 60,
    },
    // Optimisations de performance pour réduire la latence
    compress: true,
    poweredByHeader: false,
    async redirects() {
      return [
        {
          source: '/',
          destination: '/product-catalog',
          permanent: false,
        },
      ];
    },
    // Headers pour améliorer le cache et réduire les requêtes
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=3600, stale-while-revalidate=86400',
            },
          ],
        },
        {
          source: '/product-catalog',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=1800, stale-while-revalidate=3600',
            },
          ],
        },
      ];
    },
    // Temporairement désactivé pour déboguer
    // webpack(config) {
    //   config.module.rules.push({
    //     test: /\.(jsx|tsx)$/,
    //     exclude: [/node_modules/],
    //     use: [{
    //       loader: '@dhiwise/component-tagger/nextLoader',
    //     }],
    //   });
    //   return config;
    // },
  };
  
  export default nextConfig;
  