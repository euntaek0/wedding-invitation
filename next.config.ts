import os from 'node:os'
import type { NextConfig } from 'next'

function getLocalDevOrigins() {
  const origins = new Set<string>(['localhost', '127.0.0.1', '0.0.0.0'])
  const interfaces = os.networkInterfaces()

  for (const values of Object.values(interfaces)) {
    for (const info of values ?? []) {
      if (info.family === 'IPv4' && !info.internal) {
        origins.add(info.address)
      }
    }
  }

  return Array.from(origins)
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getLocalDevOrigins(),
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
