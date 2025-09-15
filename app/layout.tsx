import type React from "react"
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { ScrollToTop } from "@/components/scroll-to-top"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "2025 Cars For A Cause | Big Kid's Custom Rides",
  description:
    "Register your vehicle for the 2025 Cars For A Cause Show. Vote for your favorite vehicles, view results, and help raise funds for Tiny Tim's Foundation For Kids",
  keywords: [
    "Cars For A Cause 2025",
    "car show",
    "Show-N-Shine",
    "vehicle registration",
    "car show voting",
    "Big Kid's Custom Rides",
    "classic cars",
    "automotive event",
    "car enthusiasts",
    "vehicle competition",
  ],
  authors: [{ name: "Big Kid's Custom Rides" }],
  creator: "Ryan Berg",
  publisher: "TALENTA Commerce",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bkccs.vercel.app/",
    siteName: "2025 Cars For A Cause",
    title: "2025 Cars For A Cause | Register & Vote",
    description:
      "Join the premier showcase event! Vote for your favorite vehicles, view results, and help raise funds for Tiny Tim's Foundation For Kids",
    images: [
      {
        url: "https://wrf7neuyrmcfw9ve.public.blob.vercel-storage.com/site%20images/logos/bigkidcustomridesfinal10-21-20_FTYU.avif",
        width: 1200,
        height: 630,
        alt: "2025 Cars For A Cause - Classic cars showcase event",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "2025 Cars For A Cause | Register & Vote",
    description:
      "Join the premier showcase event! Vote for your favorite vehicles, view results, and help raise funds for Tiny Tim's Foundation For Kids",
    images: ["https://wrf7neuyrmcfw9ve.public.blob.vercel-storage.com/site%20images/logos/bigkidcustomridesfinal10-21-20_FTYU.avif"],
    creator: "Ryan Berg",
    site: "https://bkccs.vercel.app/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "",
  },
  alternates: {
    canonical: "https://bkccs.vercel.app/",
  },
  category: "automotive",
  applicationName: "Cars For A Cause",
  referrer: "origin-when-cross-origin",
  colorScheme: "light",
  themeColor: "#BF6849",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="https://wrf7neuyrmcfw9ve.public.blob.vercel-storage.com/site%20images/logos/Fav%20Icon.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="https://wrf7neuyrmcfw9ve.public.blob.vercel-storage.com/site%20images/logos/Fav%20Icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="https://wrf7neuyrmcfw9ve.public.blob.vercel-storage.com/site%20images/logos/Fav%20Icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="https://wrf7neuyrmcfw9ve.public.blob.vercel-storage.com/site%20images/logos/Fav%20Icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#BF6849" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="2025 Cars For A Cause" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#BF6849" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            <Header />
            <main>{children}</main>
            <Footer />
            <ScrollToTop />
            <Analytics />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
