import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const r2PublicUrl = process.env.R2_PUBLIC_BASE_URL;
const r2Pattern = (() => {
  if (!r2PublicUrl) return null;
  try {
    const u = new URL(r2PublicUrl);
    return { protocol: u.protocol.replace(':', ''), hostname: u.hostname };
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      ...(r2Pattern ? [r2Pattern] : []),
    ],
  },
};

export default nextConfig;
