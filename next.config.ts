import path from 'node:path';
import type { NextConfig } from 'next';

const ROOT = __dirname;

// Windows + non-ASCII path workaround.
// Forces a single React/React-DOM/Next instance to fix duplicate-module
// errors like "invariant expected layout router to be mounted" caused by
// case-folding the project folder differently across module resolutions.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disable the Next.js devtools segment explorer that loads its own React copy
  // and trips the duplicate-React invariant on case-folding Windows paths.
  devIndicators: false,
  experimental: {
    devtoolSegmentExplorer: false,
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.symlinks = false;
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      react: path.resolve(ROOT, 'node_modules/react'),
      'react-dom': path.resolve(ROOT, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(
        ROOT,
        'node_modules/react/jsx-runtime',
      ),
      'react/jsx-dev-runtime': path.resolve(
        ROOT,
        'node_modules/react/jsx-dev-runtime',
      ),
    };
    return config;
  },
};

export default nextConfig;
