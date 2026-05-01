import path from 'node:path';
import type { NextConfig } from 'next';

const ROOT = __dirname;

// Windows + non-ASCII path workaround.
// Forces a single React/React-DOM/Next instance to fix duplicate-module
// errors like "invariant expected layout router to be mounted" caused by
// case-folding the project folder differently across module resolutions.
//
// 이 alias 는 Linux 빌드(Vercel)에서 SSR React 컨텍스트를 깨뜨려
// `/_not-found` prerender 시 `Cannot read properties of null (reading 'useContext')`
// 오류를 일으킨다 → Windows 로컬 dev 환경에서만 적용한다.
const isWindows = process.platform === 'win32';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disable the Next.js devtools segment explorer that loads its own React copy
  // and trips the duplicate-React invariant on case-folding Windows paths.
  devIndicators: false,
  experimental: {
    devtoolSegmentExplorer: false,
  },
  webpack: (config) => {
    if (!isWindows) return config; // Linux/macOS — Next 의 기본 resolve 사용.
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
