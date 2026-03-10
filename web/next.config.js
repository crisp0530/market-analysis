/** @type {import('next').NextConfig} */
const nextConfig = {
  // Include data files in serverless function bundles
  outputFileTracingIncludes: {
    '/*': ['./public/data/**/*.json'],
  },
};

module.exports = nextConfig;
