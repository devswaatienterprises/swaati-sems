/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/sems',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/sems',
        basePath: false,
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
