/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Optimize production build
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      '@react-three/fiber',
      '@react-three/drei',
      'three',
      'lucide-react',
    ],
  },
}

export default nextConfig
