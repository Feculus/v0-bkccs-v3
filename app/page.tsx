"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import type { Vehicle } from "@/lib/types"
import { Car, Users, Trophy, EyeOff, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { getResultsPublicationStatus, checkAndUpdateScheduledPublication } from "@/lib/results-utils"

export default function HomePage() {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [resultsPublished, setResultsPublished] = useState(false)
  const [publicationStatus, setPublicationStatus] = useState<any>(null)
  const glideRef = useRef<HTMLDivElement>(null)
  const glideInstance = useRef<any>(null)

  useEffect(() => {
    checkResultsStatus()

    // Check every 60 seconds for publication status updates
    const interval = setInterval(checkResultsStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const checkResultsStatus = async () => {
    try {
      await checkAndUpdateScheduledPublication()
      const status = await getResultsPublicationStatus()
      setPublicationStatus(status)
      setResultsPublished(status.arePublished)
    } catch (error) {
      console.error("Error checking results status:", error)
    }
  }

  // Define sponsors array
  const sponsors = [
    {
      src: "https://l7krxsdfvx6sguxt.public.blob.vercel-storage.com/Site%20Images/Landcar-Heritage-Black-White-Box-White-Type.png",
      alt: "Land Cruiser Heritage Museum",
      url: "https://landcruiserhm.com/",
    },
    {
      src: "https://l7krxsdfvx6sguxt.public.blob.vercel-storage.com/Site%20Images/Wasatch_Cruisers_Utah.png",
      alt: "Wasatch Cruisers Utah",
      url: "https://forum.wasatchcruisers.org/",
    },
    {
      src: "https://l7krxsdfvx6sguxt.public.blob.vercel-storage.com/Site%20Images/CruiserOutfitters-3x4.png",
      alt: "Cruiser Outfitters",
      url: "https://cruiserteq.com/",
    },
    {
      src: "https://l7krxsdfvx6sguxt.public.blob.vercel-storage.com/Site%20Images/ABC_3division.vector.png",
      alt: "ABC 3 Division",
      url: "https://www.abc-concrete.com/",
    },
    {
      src: "https://l7krxsdfvx6sguxt.public.blob.vercel-storage.com/Site%20Images/OEX_LOGO_resized.png",
      alt: "OEX",
      url: "https://www.overlandexperts.com/",
    },
    {
      src: "/images/sponsors/4x4Engineering.png",
      alt: "4x4 Engineering",
      url: "https://www.4x4es.co.jp/en/",
    },
    {
      src: "/images/sponsors/Dometic.png",
      alt: "Dometic",
      url: "https://www.dometic.com/en-us/outdoor",
    },
    {
      src: "/images/sponsors/TLCA.png",
      alt: "TLCA",
      url: "https://tlca.org/",
    },
    {
      src: "/images/sponsors/ToyoTires.png",
      alt: "Toyo Tires",
      url: "https://www.toyotires.com/",
    },
    {
      src: "/images/sponsors/ValleyOverlanding_resized.png",
      alt: "Valley Overlanding",
      url: "https://valleyoverlandco.com/",
    },
  ]

  useEffect(() => {
    loadFeaturedVehicles()

    // Initialize Glide.js dynamically
    const initializeGlide = async () => {
      if (glideRef.current) {
        try {
          // Dynamic import of Glide.js
          const { default: Glide } = await import("@glidejs/glide")

          glideInstance.current = new Glide(glideRef.current, {
            type: "carousel",
            startAt: 0,
            perView: 3,
            gap: 32,
            autoplay: 4000,
            hoverpause: true,
            animationDuration: 800,
            animationTimingFunc: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            breakpoints: {
              1024: {
                perView: 2,
                gap: 24,
              },
              768: {
                perView: 1,
                gap: 16,
              },
            },
          })

          glideInstance.current.mount()
        } catch (error) {
          console.error("Failed to initialize Glide.js:", error)
        }
      }
    }

    initializeGlide()

    // Cleanup
    return () => {
      if (glideInstance.current) {
        glideInstance.current.destroy()
      }
    }
  }, [])

  const loadFeaturedVehicles = async () => {
    try {
      console.log("[v0] Loading featured vehicles for homepage...")

      const supabase = createClient()
      const { data, error } = await supabase
        .from("vehicles")
        .select(`
          *,
          category:categories(*)
        `)
        .neq("status", "archived")
        .order("created_at", { ascending: false })
        .limit(4)

      console.log("[v0] Homepage vehicles query result:", { data, error })
      console.log("[v0] Featured vehicles count:", data?.length || 0)

      if (error) {
        console.error("[v0] Homepage vehicles query error:", error)
        return
      }

      if (data) {
        setFeaturedVehicles(data)
        console.log(
          "[v0] Featured vehicles set:",
          data.map((v) => ({ id: v.id, make: v.make, model: v.model, status: v.status })),
        )
      }
    } catch (error) {
      console.error("[v0] Error loading featured vehicles:", error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get the primary image URL
  const getPrimaryImageUrl = (vehicle: Vehicle): string | null => {
    if (vehicle.image_1_url) return vehicle.image_1_url
    if (vehicle.photos && vehicle.photos.length > 0 && vehicle.photos[0]) {
      return vehicle.photos[0]
    }
    return null
  }

  return (
    <div className="bg-bk-light-gray">
      {/* Hero Section */}
      <section className="relative py-20 text-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://wrf7neuyrmcfw9ve.public.blob.vercel-storage.com/site%20images/69camaro-15_d7405e10-f6bb-40d3-ae82-f6563a000f53.webp"
            alt="Classic 1969 Camaro"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="mb-4">
            <Image
              src="https://wrf7neuyrmcfw9ve.public.blob.vercel-storage.com/site%20images/logos/Big%20Kid%20Custom%20Rides%20Logo.png"
              alt="Big Kid Custom Rides"
              width={800}
              height={200}
              className="mx-auto drop-shadow-lg"
              priority
            />
          </div>
          <div className="w-24 h-1 bg-bk-bright-red mx-auto mb-8"></div>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto drop-shadow-md">
            Where automotive passion meets timeless craftsmanship. Register your vehicle for a chance to take home the
            honors of the best custom ride at the show.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-bk-bright-red hover:bg-bk-bright-red/90 text-bk-light-gray px-8 py-4 text-lg shadow-lg"
          >
            <Link href="/register">REGISTER YOUR VEHICLE</Link>
          </Button>
          <h4 className="text-xl text-white/90 mt-8 drop-shadow-md max-w-2xl mx-auto">
            {"EARLY REGISTRATION ENDS SEPTEMBER 19TH"}{" "}
          </h4>
          <Button
            asChild
            size="lg"
            className="bg-white hover:bg-white/90 text-bk-bright-red px-8 py-4 text-lg shadow-lg mt-4 border-2 border-white"
          >
            <Link
              href="https://www.bigkidcustomrides.com/products/cars-for-a-cause-registration-2025"
              target="_blank"
              rel="noopener noreferrer"
            >
              PREREGISTRATION TICKETS
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <Car className="h-16 w-16 text-bk-bright-red mx-auto" />
              <div>
                <h3 className="text-4xl font-bold text-bk-dark-gray">50 MAX</h3>
                <p className="text-bk-dark-gray/60 uppercase tracking-wide">VEHICLES</p>
              </div>
            </div>
            <div className="space-y-4">
              <Users className="h-16 w-16 text-bk-bright-red mx-auto" />
              <div>
                <h3 className="text-4xl font-bold text-bk-dark-gray">LOCAL</h3>
                <p className="text-bk-dark-gray/60 uppercase tracking-wide">ATTENDEES</p>
              </div>
            </div>
            <div className="space-y-4">
              <Trophy className="h-16 w-16 text-bk-bright-red mx-auto" />
              <div>
                <h3 className="text-4xl font-bold text-bk-dark-gray">5</h3>
                <p className="text-bk-dark-gray/60 uppercase tracking-wide">AWARD CATEGORIES</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Information Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Text Content */}
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-4xl font-bold text-bk-dark-gray mb-6">Join Us for Cars for a Cause</h2>
              <p className="text-lg text-bk-dark-gray/80 leading-relaxed">
                Join us Saturday, September 20th from 10am - 2pm for a charity car show to raise money for Tiny Tim's
                Foundation for Kids. There will be cars, awards, raffle prizes, games and food and all the proceeds will
                be donated to Tiny Tim's. The shop will also be open for tours. Be sure to register today and bring the
                whole family for a good time!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild className="bg-bk-bright-red hover:bg-bk-bright-red/90 text-white">
                  <Link href="/register">Register Your Vehicle</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-bk-dark-gray text-bk-dark-gray hover:bg-bk-dark-gray hover:text-white bg-transparent"
                >
                  <Link href="https://tinytimstoys.org/donate" target="_blank" rel="noopener noreferrer">
                    Donate to Tiny Tim's
                  </Link>
                </Button>
              </div>
            </div>

            {/* Flyer Image */}
            <div className="lg:w-1/2">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="https://wrf7neuyrmcfw9ve.public.blob.vercel-storage.com/site%20images/Flyer_page_1_b0e86029-dd38-4572-9fe4-883c986db3b2.webp"
                  alt="Cars for a Cause Event Flyer"
                  width={600}
                  height={800}
                  className="w-full h-auto object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Collection Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-bk-dark-gray mb-4">VEHICLE COLLECTION</h2>
            <p className="text-bk-dark-gray/60">
              {loading
                ? "Loading registered vehicles..."
                : featuredVehicles.length > 0
                  ? resultsPublished
                    ? "Click on photos to learn more about each vehicle and cast your vote."
                    : "Explore the amazing vehicles registered for the show."
                  : "Be the first to register your vehicle for the show!"}
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 rounded-lg shadow-lg overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-300"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredVehicles.length > 0 ? (
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {featuredVehicles.map((vehicle) => {
                const primaryImageUrl = getPrimaryImageUrl(vehicle)

                return (
                  <Link key={vehicle.id} href={`/vehicle/${vehicle.profile_url}`}>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                      <div className="aspect-square relative">
                        {primaryImageUrl ? (
                          <Image
                            src={primaryImageUrl || "/placeholder.svg"}
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-bk-light-gray flex items-center justify-center">
                            <div className="text-center text-bk-dark-gray/40">
                              <div className="w-16 h-16 bg-bk-dark-gray/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Car className="h-8 w-8" />
                              </div>
                              <p className="text-sm">No Photo</p>
                            </div>
                          </div>
                        )}

                        {/* Entry number badge */}
                        <div className="absolute top-3 left-3">
                          <div className="bg-bk-bright-red text-white text-xs font-bold px-2 py-1 rounded">
                            #{vehicle.entry_number}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="font-bold text-bk-dark-gray mb-1">
                          {vehicle.year} {vehicle.make}
                        </h3>
                        <p className="text-bk-dark-gray/60 text-sm mb-2">{vehicle.model}</p>
                        <p className="text-bk-dark-gray/50 text-xs">
                          by {vehicle.full_name} • {vehicle.city}, {vehicle.state}
                        </p>
                        {vehicle.category && (
                          <div className="mt-2">
                            <span className="inline-block bg-bk-deep-red/10 text-bk-deep-red text-xs px-2 py-1 rounded">
                              {vehicle.category.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-bk-dark-gray/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="h-12 w-12 text-bk-dark-gray/40" />
              </div>
              <h3 className="text-xl font-semibold text-bk-dark-gray mb-2">No Vehicles Registered Yet</h3>
              <p className="text-bk-dark-gray/60 mb-6">
                Be the first to showcase your vehicle at the 2025 Cars For A Cause Show!
              </p>
              <Button asChild className="bg-bk-bright-red hover:bg-bk-bright-red/90 text-white">
                <Link href="/register">Register Your Vehicle</Link>
              </Button>
            </div>
          )}

          <div className="text-center">
            <Button
              asChild
              variant="outline"
              className="border-bk-dark-gray text-bk-dark-gray hover:bg-bk-dark-gray hover:text-white bg-transparent"
            >
              <Link href="/vehicles">
                {featuredVehicles.length > 0 ? "VIEW ALL REGISTERED VEHICLES" : "VIEW VEHICLE COLLECTION"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Participant Hub */}
      <section className="py-20 bg-bk-light-gray">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-bk-dark-gray mb-4">PARTICIPANT HUB</h2>
            <p className="text-bk-dark-gray/60">Everything you need for the ultimate car show experience</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-bk-bright-red rounded-full flex items-center justify-center mx-auto">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-bk-dark-gray mb-4">Register</h3>
                <p className="text-bk-dark-gray/60 mb-6">Submit your vehicle for judging across multiple categories.</p>
                <Button asChild className="bg-bk-bright-red hover:bg-bk-bright-red/90 text-white">
                  <Link href="/register">START REGISTRATION →</Link>
                </Button>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-bk-dark-gray rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-bk-dark-gray mb-4">Browse Entries</h3>
                <p className="text-bk-dark-gray/60 mb-6">
                  Explore all registered vehicles with detailed specifications, owner stories, and high-resolution
                  galleries.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="border-bk-dark-gray text-bk-dark-gray hover:bg-bk-dark-gray hover:text-white bg-transparent"
                >
                  <Link href="/vehicles">VIEW COLLECTION →</Link>
                </Button>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                  resultsPublished ? "bg-bk-deep-red" : "bg-bk-dark-gray/20"
                }`}
              >
                {resultsPublished ? (
                  <Trophy className="h-8 w-8 text-white" />
                ) : publicationStatus?.isScheduled ? (
                  <Clock className="h-8 w-8 text-bk-dark-gray/60" />
                ) : (
                  <EyeOff className="h-8 w-8 text-bk-dark-gray/60" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-bk-dark-gray mb-4">Results</h3>
                <p className="text-bk-dark-gray/60 mb-6">
                  {resultsPublished
                    ? "Track real-time voting results and see which vehicles are leading in each category and people's choice."
                    : publicationStatus?.isScheduled
                      ? `Live voting will be available on ${new Date(publicationStatus.scheduledFor).toLocaleDateString()}. Check back then to see real-time results!`
                      : "Results will be available at the close of the voting period."}
                </p>
                {resultsPublished ? (
                  <Button asChild className="bg-bk-deep-red hover:bg-bk-deep-red/90 text-white">
                    <Link href="/vote">VIEW RESULTS →</Link>
                  </Button>
                ) : (
                  <Button disabled className="bg-bk-dark-gray/20 text-bk-dark-gray/60 cursor-not-allowed">
                    {publicationStatus?.isScheduled ? "COMING SOON →" : "NOT YET AVAILABLE →"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-bk-dark-gray mb-4">PRESENTED BY</h2>
            <p className="text-bk-dark-gray/60">Proudly supported by our amazing sponsors and partners</p>
          </div>

          {/* Title Sponsor */}
          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold text-bk-bright-red mb-8">TITLE SPONSOR</h3>
            <div className="flex justify-center">
              <a
                href="https://toyota.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-80 transition-opacity"
              >
                <div className="w-80 h-32 bg-white border-2 border-bk-dark-gray/10 rounded-lg flex items-center justify-center p-4">
                  <Image
                    src="https://wrf7neuyrmcfw9ve.public.blob.vercel-storage.com/site%20images/logos/Big%20Kid%20Custom%20Rides%20Logo.png"
                    alt="Toyota"
                    width={280}
                    height={84}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </a>
            </div>
          </div>

          {/* Major Sponsors - Glide.js Slider */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-bk-bright-red text-center mb-8">MAJOR SPONSORS</h3>
            <div className="relative">
              <div ref={glideRef} className="glide">
                <div className="glide__track" data-glide-el="track">
                  <ul className="glide__slides">
                    {sponsors.map((sponsor, index) => (
                      <li key={index} className="glide__slide">
                        <a
                          href={sponsor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block hover:opacity-80 transition-opacity group"
                        >
                          <div className="w-full h-64 bg-white border-2 border-bk-dark-gray/10 rounded-lg flex items-center justify-center p-6 group-hover:border-bk-bright-red/30 group-hover:shadow-lg transition-all duration-300">
                            <Image
                              src={sponsor.src || "/placeholder.svg"}
                              alt={sponsor.alt}
                              width={400}
                              height={160}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Media Partners */}
          <div>
            <h3 className="text-xl font-bold text-bk-deep-red text-center mb-8">MEDIA PARTNERS</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <a
                href="https://www.leolinx.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-80 transition-opacity"
              >
                <div className="w-full h-16 bg-white border border-bk-dark-gray/10 rounded-lg flex items-center justify-center p-4">
                  <Image
                    src="https://l7krxsdfvx6sguxt.public.blob.vercel-storage.com/Site%20Images/Logo%20200x50.png"
                    alt="Leo Linx Media Partner"
                    width={120}
                    height={30}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </a>
              <a
                href="https://www.talentacommerce.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-80 transition-opacity"
              >
                <div className="w-full h-16 bg-white border border-bk-dark-gray/10 rounded-lg flex items-center justify-center p-4">
                  <Image
                    src="https://l7krxsdfvx6sguxt.public.blob.vercel-storage.com/Site%20Images/TALENTA%20Logo%202023%20250px.png"
                    alt="Talenta Commerce"
                    width={120}
                    height={30}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
