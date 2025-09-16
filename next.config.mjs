/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [
      'wrf7neuyrmcfw9ve.public.blob.vercel-storage.com',
      'l7krxsdfvx6sguxt.public.blob.vercel-storage.com'
    ],
    formats: ['image/avif', 'image/webp']
  },
  experimental: {
    serverComponentsExternalPackages: ['@vercel/blob'],
  },
  serverRuntimeConfig: {
    maxFileSize: '30mb',
  },
  // Configure API routes for larger payloads
  api: {
    bodyParser: {
      sizeLimit: '30mb',
    },
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          
          // Prevent XSS attacks (for older browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          
          // Enforce HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          
          // Content Security Policy - Customize based on your needs
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-scripts.com *.vercel.app",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "img-src 'self' data: https: blob: *.public.blob.vercel-storage.com",
              "font-src 'self' fonts.gstatic.com data:",
              "connect-src 'self' *.vercel.app vitals.vercel-insights.com *.supabase.co",
              "frame-src 'self' www.google.com maps.google.com",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          
          // Permissions Policy (replaces Feature-Policy)
          {
            key: 'Permissions-Policy',
            value: [
              'geolocation=()',
              'microphone=()',
              'camera=()',
              'fullscreen=(self)',
              'payment=()'
            ].join(', ')
          }
        ]
      },
      
      // Additional headers for admin routes
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ]
      },
      
      // Headers for API routes
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ]
      }
    ]
  },

  async redirects() {
    return []
  },

  env: {
    // Add any custom environment variables here
  }
}

export default nextConfig
