import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    unoptimized: true,        // ← 追加（最適化を経由しない）
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wfhdpkxycamtckzxpzar.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default config
