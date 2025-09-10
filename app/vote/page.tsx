"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, Check, Lock, Trophy, Calendar, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import { castVote, getCurrentVote, getVoteCount } from "@/lib/vote-utils"
import { VotingCountdown } from "@/components/voting-countdown"
import { useVotingStatus } from "@/hooks/use-voting-status"
import { getResultsPublicationStatus, checkAndUpdateScheduledPublication } from "@/lib/results-utils"
import type { Vehicle } from "@/lib/types"

const supabase = createClient()

export default function VotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get("vehicle")

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [currentVote, setCurrentVote] = useState<any>(null)
  const [currentVotedVehicle, setCurrentVotedVehicle] = useState<Vehicle | null>(null)
  const [voteCount, setVoteCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultsPublished, setResultsPublished] = useState(false)

  // Using the new voting status hook for real-time updates
  const { status: votingStatus, schedule: votingSchedule, isVotingOpen } = useVotingStatus()

  useEffect(() => {
    if (vehicleId) {
      loadData()
    }
  }, [vehicleId])

  // Refresh vote count when voting status changes
  useEffect(() => {
    if (votingStatus !== "loading" && vehicleId) {
      refreshVoteCount()
    }
  }, [votingStatus, vehicleId])

  useEffect(() => {
    checkResultsStatus()

    // Check every 30 seconds for scheduled publication updates
    const interval = setInterval(checkResultsStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkResultsStatus = async () => {
    try {
      await checkAndUpdateScheduledPublication()
      const status = await getResultsPublicationStatus()
      setResultsPublished(status.arePublished)
    } catch (error) {
      console.error("Error checking results status:", error)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load the vehicle being voted for
      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .neq("status", "archived")
        .single()

      if (vehicleError) {
        console.error("Vehicle error:", vehicleError)
        throw new Error(`Vehicle not found: ${vehicleError.message}`)
      }
      setVehicle(vehicleData)

      // Check if user has already voted
      const existingVote = await getCurrentVote()
      setCurrentVote(existingVote)

      // If they have voted for a different vehicle, load that vehicle's details
      if (existingVote && existingVote.vehicle_id !== Number(vehicleId)) {
        const { data: votedVehicleData } = await supabase
          .from("vehicles")
          .select("*")
          .eq("id", existingVote.vehicle_id)
          .single()

        setCurrentVotedVehicle(votedVehicleData)
      }

      // Load vote count for the current vehicle
      const count = await getVoteCount(Number(vehicleId))
      setVoteCount(count)
    } catch (error) {
      console.error("Error loading vote data:", error)
      setError(error instanceof Error ? error.message : "Failed to load voting data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Added function to refresh vote count for real-time updates
  const refreshVoteCount = async () => {
    if (!vehicleId) return

    try {
      const count = await getVoteCount(Number(vehicleId))
      setVoteCount(count)
    } catch (error) {
      console.error("Error refreshing vote count:", error)
    }
  }

  const handleVote = async () => {
    if (!vehicleId || !isVotingOpen) return

    try {
      setSubmitting(true)
      setError(null)

      console.log("Submitting vote for vehicle:", vehicleId)

      const result = await castVote(Number(vehicleId))

      console.log("Vote result:", result)

      if (result.success) {
        // Refresh the data to show the updated state
        await loadData()

        // Redirect to success page
        router.push(`/vote/success?vehicle=${vehicleId}`)
      } else {
        setError(result.error || "Failed to submit vote. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting vote:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Helper function to get primary image URL
  const getPrimaryImageUrl = (vehicle: Vehicle): string => {
    if (vehicle.image_1_url) return vehicle.image_1_url
    if (vehicle.photos && vehicle.photos.length > 0 && vehicle.photos[0]) {
      return vehicle.photos[0]
    }
    return `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(vehicle.make + " " + vehicle.model)}`
  }

  if (!resultsPublished && !isVotingOpen && votingStatus !== "loading") {
    return (
      <div className="min-h-screen bg-bk-light-gray flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Card className="bg-white shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 bg-bk-dark-gray/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <EyeOff className="h-10 w-10 text-bk-dark-gray/40" />
              </div>
              <h2 className="text-2xl font-bold text-bk-dark-gray mb-4">Voting Not Yet Available</h2>
              <p className="text-bk-dark-gray/60 mb-6">
                Live voting and results will be available once the event organizers publish them. Please check back
                later or visit the event for updates.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full bg-bk-bright-red hover:bg-bk-bright-red/90 text-white">
                  <Link href="/vehicles">Browse Vehicle Collection</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bk-light-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bk-bright-red mx-auto mb-4"></div>
          <p className="text-bk-dark-gray">Loading voting information...</p>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-bk-light-gray flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-bk-dark-gray mb-4">Vehicle not found or archived.</p>
            <Button asChild>
              <Link href="/vehicles">Browse Vehicles</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasAlreadyVoted = currentVote !== null
  const isVotingForSameVehicle = currentVote && currentVote.vehicle_id === Number(vehicleId)
  const primaryImageUrl = getPrimaryImageUrl(vehicle)

  return (
    <div className="min-h-screen bg-bk-light-gray py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button asChild variant="ghost" className="text-bk-dark-gray hover:bg-bk-dark-gray hover:text-white">
            <Link href={`/vehicle/${vehicle.profile_url}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vehicle
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Vehicle Card */}
          <Card className="bg-white shadow-lg">
            <div className="aspect-video relative overflow-hidden rounded-t-lg">
              <Image
                src={primaryImageUrl || "/placeholder.svg"}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-bk-bright-red text-white">#{vehicle.entry_number}</Badge>
                <Badge variant="outline" className="border-bk-bright-red text-bk-bright-red">
                  <Trophy className="h-3 w-3 mr-1" />
                  Best in Show
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-bk-dark-gray mb-2">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h2>
              <p className="text-bk-dark-gray/80 mb-4">by {vehicle.full_name}</p>
              <p className="text-bk-dark-gray/60 mb-4">
                {vehicle.city}, {vehicle.state}
              </p>
              <div className="text-sm text-bk-dark-gray/60">
                Current votes: <span className="font-bold text-bk-bright-red">{voteCount}</span>
                {/* Added real-time update indicator */}
                {isVotingOpen && (
                  <div className="flex items-center mt-1 text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                    Live updates
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Voting Card */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-bk-dark-gray flex items-center">
                {votingStatus === "ended" ? (
                  <Calendar className="h-6 w-6 mr-2 text-gray-500" />
                ) : hasAlreadyVoted ? (
                  <Lock className="h-6 w-6 mr-2 text-bk-deep-red" />
                ) : (
                  <Trophy className="h-6 w-6 mr-2 text-bk-bright-red" />
                )}
                {votingStatus === "ended"
                  ? "Voting Has Ended"
                  : votingStatus === "closed"
                    ? "Voting Not Yet Open"
                    : hasAlreadyVoted
                      ? "You've Already Voted!"
                      : "Vote for Best in Show"}
              </CardTitle>
              <CardDescription>
                {votingStatus === "ended"
                  ? "Thank you for participating in the 2025 CRUISERFEST Show-N-Shine!"
                  : votingStatus === "closed"
                    ? "Voting will open soon. Check back later!"
                    : hasAlreadyVoted
                      ? "You've already cast your vote for Best in Show."
                      : "You're about to vote for this vehicle as Best in Show."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {votingStatus === "closed" && votingSchedule && (
                <VotingCountdown opensAt={votingSchedule.voting_opens_at} closesAt={votingSchedule.voting_closes_at} />
              )}

              {votingStatus === "ended" && (
                <Alert className="border-gray-500 bg-gray-50">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <AlertDescription>
                    <strong>Voting has concluded</strong>
                    <br />
                    Thank you for participating! Results will be announced soon.
                  </AlertDescription>
                </Alert>
              )}

              {/* Already Voted Display */}
              {votingStatus === "open" && hasAlreadyVoted && currentVotedVehicle && !isVotingForSameVehicle && (
                <Alert className="border-bk-deep-red bg-bk-deep-red/5">
                  <Lock className="h-4 w-4 text-bk-deep-red" />
                  <AlertDescription>
                    <strong>Your Best in Show vote:</strong>
                    <br />
                    {currentVotedVehicle.year} {currentVotedVehicle.make} {currentVotedVehicle.model} by{" "}
                    {currentVotedVehicle.full_name}
                    <br />
                    <br />
                    <strong>You cannot change your vote.</strong> Each voter can only vote once for Best in Show.
                  </AlertDescription>
                </Alert>
              )}

              {/* Same Vehicle Voted */}
              {votingStatus === "open" && isVotingForSameVehicle && (
                <Alert className="border-bk-deep-red bg-bk-deep-red/5">
                  <Check className="h-4 w-4 text-bk-deep-red" />
                  <AlertDescription>
                    <strong>You've already voted for this vehicle!</strong>
                    <br />
                    Your vote is recorded and counts toward this vehicle's Best in Show total.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Display */}
              {error && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {/* Voting Rules - only show when voting is open */}
              {votingStatus === "open" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-bk-dark-gray mb-2">Best in Show Voting Rules</h4>
                  <ul className="text-sm text-bk-dark-gray/80 space-y-1">
                    <li>• You can vote once for Best in Show</li>
                    <li>• Votes cannot be changed once submitted</li>
                    <li>• Your vote is anonymous and secure</li>
                    <li>• Choose carefully - your vote is final!</li>
                    <li>• All vehicles compete for the same award</li>
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                {votingStatus === "open" && hasAlreadyVoted ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-bk-deep-red rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-bk-deep-red font-semibold mb-2">Voting Complete</p>
                    <p className="text-bk-dark-gray/60 text-sm mb-4">
                      You have already voted for Best in Show. Votes cannot be changed.
                    </p>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/vehicles">Browse Other Vehicles</Link>
                    </Button>
                  </div>
                ) : votingStatus === "open" && !hasAlreadyVoted ? (
                  <>
                    <Alert className="border-amber-500 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <AlertDescription className="text-amber-700">
                        <strong>Important:</strong> Once you vote, you cannot change your selection. Make sure this is
                        the vehicle you want to vote for as Best in Show.
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={handleVote}
                      disabled={submitting}
                      className="w-full bg-bk-bright-red hover:bg-bk-bright-red/90 text-white py-3"
                    >
                      {submitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Casting Vote...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 mr-2" />
                          Vote for Best in Show (Final)
                        </div>
                      )}
                    </Button>

                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/vehicles">Cancel & Browse Vehicles</Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/vehicles">Browse Vehicles</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
