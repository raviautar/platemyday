const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: false,
  register: true,
  skipWaiting: true,
  cacheOnNavigation: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          },
        },
      },
      {
        urlPattern: ({ url, sameOrigin }) => {
          return sameOrigin && url.pathname.startsWith('/api/') && !url.pathname.includes('/api/generate-');
        },
        handler: 'NetworkFirst',
        method: 'GET',
        options: {
          cacheName: 'apis',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 24 * 60 * 60,
          },
        },
      },
      {
        urlPattern: ({ url }) => {
          return url.pathname.startsWith('/api/generate-');
        },
        handler: 'NetworkOnly',
        method: 'POST',
      },
      {
        urlPattern: ({ url }) => {
          return url.pathname.startsWith('/api/generate-');
        },
        handler: 'NetworkOnly',
        method: 'GET',
      },
    ],
  },
});

const nextConfig = {
  turbopack: {},
};

module.exports = withPWA(nextConfig);
