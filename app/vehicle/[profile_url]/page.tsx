"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Heart,
  MapPin,
  User,
  ArrowLeft,
  Calendar,
  Lock,
  Info,
  Trophy,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import { getCurrentVote, getVoteCountsByCategory } from "@/lib/vote-utils"
import type { Vehicle } from "@/lib/types"

const supabase = createClient()

export default function VehicleProfilePage() {
  const params = useParams()
  const profileUrl = params.profile_url as string
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentVote, setCurrentVote] = useState<any>(null)
  const [voteCountsByCategory, setVoteCountsByCategory] = useState<
    Array<{ categoryId: number; categoryName: string; count: number }>
  >([])
  const [error, setError] = useState<string | null>(null)

  // Image lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [allImages, setAllImages] = useState<string[]>([])

  useEffect(() => {
    if (profileUrl) {
      loadVehicle()
    }
  }, [profileUrl])

  useEffect(() => {
    if (vehicle) {
      checkVotingStatus()
      const images = getAllImages(vehicle)
      setAllImages(images)
    }
  }, [vehicle])

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return

      if (e.key === "Escape") {
        setLightboxOpen(false)
      } else if (e.key === "ArrowLeft") {
        navigateImage("prev")
      } else if (e.key === "ArrowRight") {
        navigateImage("next")
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [lightboxOpen, currentImageIndex, allImages.length])

  const loadVehicle = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: vehicleError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("profile_url", profileUrl)
        .single()

      if (vehicleError) {
        console.error("Error loading vehicle:", vehicleError)
        setError("Vehicle not found")
        return
      }

      console.log("Loaded vehicle with image URLs:", {
        id: data.id,
        make: data.make,
        model: data.model,
        image_1_url: data.image_1_url,
        image_2_url: data.image_2_url,
        image_3_url: data.image_3_url,
        image_4_url: data.image_4_url,
        image_5_url: data.image_5_url,
        photos: data.photos,
      })

      setVehicle(data)

      try {
        const voteCounts = await getVoteCountsByCategory(data.id)
        console.log("[v0] Vote counts by category:", voteCounts)
        setVoteCountsByCategory(voteCounts)
      } catch (error) {
        console.error("Error getting vote count:", error)
        setVoteCountsByCategory([])
      }
    } catch (error) {
      console.error("Error loading vehicle:", error)
      setError("Failed to load vehicle")
    } finally {
      setLoading(false)
    }
  }

  const checkVotingStatus = async () => {
    try {
      // Check if user has already voted
      const existingVote = await getCurrentVote()
      setCurrentVote(existingVote)

      console.log("Voting status:", existingVote)
    } catch (error) {
      console.error("Error checking voting status:", error)
      setCurrentVote(null)
    }
  }

  // Helper function to get primary image URL
  const getPrimaryImageUrl = (vehicle: Vehicle): string => {
    if (vehicle.image_1_url) return vehicle.image_1_url
    if (vehicle.photos && vehicle.photos.length > 0 && vehicle.photos[0]) {
      return vehicle.photos[0]
    }
    return `/placeholder.svg?height=600&width=800&text=${encodeURIComponent(vehicle.make + " " + vehicle.model)}`
  }

  // Get all available images
  const getAllImages = (vehicle: Vehicle): string[] => {
    const images: string[] = []

    // Add individual image URLs
    if (vehicle.image_1_url) images.push(vehicle.image_1_url)
    if (vehicle.image_2_url) images.push(vehicle.image_2_url)
    if (vehicle.image_3_url) images.push(vehicle.image_3_url)
    if (vehicle.image_4_url) images.push(vehicle.image_4_url)
    if (vehicle.image_5_url) images.push(vehicle.image_5_url)

    // Add photos array if it exists and has items
    if (vehicle.photos && Array.isArray(vehicle.photos)) {
      vehicle.photos.forEach((photo) => {
        if (photo && !images.includes(photo)) {
          images.push(photo)
        }
      })
    }

    return images.filter(Boolean) // Remove any null/undefined values
  }

  const openLightbox = (imageIndex: number) => {
    setCurrentImageIndex(imageIndex)
    setLightboxOpen(true)
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden"
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setCurrentImageIndex(0)
    // Restore body scroll
    document.body.style.overflow = "unset"
  }

  const navigateImage = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
    } else {
      setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2EEEB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BF6849] mx-auto mb-4"></div>
          <p className="text-[#3A403D]">Loading vehicle details...</p>
        </div>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-[#F2EEEB] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-[#3A403D] mb-4">{error || "Vehicle not found."}</p>
            <Button asChild>
              <Link href="/vehicles">Browse All Vehicles</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const primaryImageUrl = getPrimaryImageUrl(vehicle)
  const hasAlreadyVoted = currentVote !== null
  const hasVotedForThisVehicle = currentVote && currentVote.vehicle_id === vehicle.id
  const totalVotes = voteCountsByCategory.reduce((sum, category) => sum + category.count, 0)

  return (
    <div className="min-h-screen bg-[#F2EEEB] py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Navigation */}
        <div className="mb-6 sm:mb-8">
          <Button asChild variant="ghost" className="text-[#3A403D] hover:bg-[#3A403D] hover:text-white">
            <Link href="/vehicles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Vehicles</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="aspect-video relative overflow-hidden rounded-lg bg-white shadow-lg cursor-pointer group"
              onClick={() => openLightbox(0)}
            >
              <Image
                src={primaryImageUrl || "/placeholder.svg"}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Click indicator overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2">
                  <svg className="w-6 h-6 text-[#3A403D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Additional Images */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {allImages.slice(1, 5).map((imageUrl, index) => (
                  <div
                    key={index}
                    className="aspect-square relative overflow-hidden rounded-lg bg-white shadow cursor-pointer group"
                    onClick={() => openLightbox(index + 1)}
                  >
                    <Image
                      src={imageUrl || "/placeholder.svg"}
                      alt={`${vehicle.make} ${vehicle.model} - Image ${index + 2}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 12.5vw"
                    />
                    {/* Click indicator overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-1">
                        <svg className="w-4 h-4 text-[#3A403D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <Badge className="bg-[#BF6849] text-white text-base sm:text-lg px-3 py-2 w-fit">
                    #{vehicle.entry_number}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-[#BF6849] text-[#BF6849] text-base sm:text-lg px-3 py-2 w-fit"
                  >
                    <Trophy className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">People's Choice</span>
                    <span className="sm:hidden">People's Choice</span>
                  </Badge>
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-[#3A403D] break-words">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Owner Information */}
                <div className="flex items-start space-x-2 text-[#3A403D]/80">
                  <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">
                    Owned by <strong className="break-words">{vehicle.full_name}</strong>
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-2 text-[#3A403D]/80">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">
                    {vehicle.city}, {vehicle.state}
                  </span>
                </div>

                {/* Registration Date */}
                {vehicle.created_at && (
                  <div className="flex items-start space-x-2 text-[#3A403D]/80">
                    <Calendar className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span>Registered {new Date(vehicle.created_at).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-start space-x-2 text-[#BF6849] font-semibold">
                    <Heart className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span>{totalVotes} total votes</span>
                  </div>
                  {voteCountsByCategory.length > 0 && (
                    <div className="text-sm text-[#3A403D]/70 ml-7 space-y-1">
                      {voteCountsByCategory.map((category, index) => (
                        <div key={category.categoryId} className="break-words">
                          {category.categoryName}: {category.count} vote{category.count !== 1 ? "s" : ""}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                {vehicle.description && (
                  <div className="bg-[#F2EEEB] rounded-lg p-4">
                    <h4 className="font-semibold text-[#3A403D] mb-2">Description</h4>
                    <p className="text-[#3A403D]/80 whitespace-pre-wrap break-words leading-relaxed">
                      {vehicle.description}
                    </p>
                  </div>
                )}

                {/* Vehicle Specifications */}
                <div className="bg-[#F2EEEB] rounded-lg p-4">
                  <h4 className="font-semibold text-[#3A403D] mb-3">Specifications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="min-w-0">
                      <span className="text-[#3A403D]/60">Year:</span>
                      <span className="ml-2 font-medium text-[#3A403D] break-words">{vehicle.year}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[#3A403D]/60">Make:</span>
                      <span className="ml-2 font-medium text-[#3A403D] break-words">{vehicle.make}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[#3A403D]/60">Model:</span>
                      <span className="ml-2 font-medium text-[#3A403D] break-words">{vehicle.model}</span>
                    </div>
                    {vehicle.trim && (
                      <div className="min-w-0">
                        <span className="text-[#3A403D]/60">Trim:</span>
                        <span className="ml-2 font-medium text-[#3A403D] break-words">{vehicle.trim}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#BF6849]/5 to-[#A9BF88]/5 border-2 border-[#BF6849]/20 rounded-lg p-4 sm:p-6">
                  <div className="text-center">
                    {hasVotedForThisVehicle ? (
                      <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-[#A9BF88] mx-auto mb-4" />
                    ) : (
                      <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-[#BF6849] mx-auto mb-4" />
                    )}
                    <h3 className="text-lg sm:text-xl font-bold text-[#3A403D] mb-2 break-words">
                      {hasVotedForThisVehicle ? "You Voted for This Vehicle!" : "Vote for People's Choice Award"}
                    </h3>

                    {hasVotedForThisVehicle ? (
                      <div>
                        <Alert className="border-[#A9BF88] bg-[#A9BF88]/5 mb-4">
                          <Lock className="h-4 w-4 text-[#A9BF88]" />
                          <AlertDescription className="text-left">
                            <strong>Your vote is recorded!</strong>
                            <br />
                            You have successfully voted for this vehicle in one or more categories.
                          </AlertDescription>
                        </Alert>
                        <Button asChild variant="outline" className="bg-transparent w-full sm:w-auto">
                          <Link href="/vehicles">Browse Other Vehicles</Link>
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Alert className="border-blue-500 bg-blue-50 mb-4">
                          <Info className="h-4 w-4 text-blue-500" />
                          <AlertDescription className="text-left text-blue-700">
                            <strong>Voting Rules:</strong> You can vote one time in the people's choice category.
                          </AlertDescription>
                        </Alert>
                        <Button
                          asChild
                          className="bg-[#BF6849] hover:bg-[#BF6849]/90 text-white px-4 sm:px-8 py-3 w-full sm:w-auto"
                        >
                          <Link href={`/vote?vehicle=${vehicle.id}`}>
                            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                            <span className="text-sm sm:text-base break-words">
                              Vote This Vehicle For People's Choice Award
                            </span>
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Actions */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="bg-transparent">
                    <Link href="/vehicles">Browse More Vehicles</Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-transparent">
                    <Link href="/results">View Results</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Lightbox Modal */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 sm:p-4">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 sm:p-3 transition-colors touch-manipulation"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Navigation buttons */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage("prev")}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 sm:p-3 transition-colors touch-manipulation"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                  onClick={() => navigateImage("next")}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 sm:p-3 transition-colors touch-manipulation"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </>
            )}

            {/* Image counter */}
            {allImages.length > 1 && (
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/10 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} of {allImages.length}
              </div>
            )}

            {/* Main image */}
            <div className="relative max-w-full max-h-full">
              <Image
                src={allImages[currentImageIndex] || "/placeholder.svg"}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - Image ${currentImageIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
                sizes="100vw"
              />
            </div>

            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={closeLightbox} />
          </div>
        )}
      </div>
    </div>
  )
}
