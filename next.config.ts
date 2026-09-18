import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* The e2e suite builds into its own directory so it never shares .next
     with the dev server someone has open on a phone. */
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
