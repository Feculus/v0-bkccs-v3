import { createClient } from "@/utils/supabase/client"
import { voterTracker } from "@/lib/voter-tracking"

export interface VoteResult {
  success: boolean
  action: "created" | "already_voted"
  voteId?: number
  error?: string
}

export interface CurrentVote {
  id: number
  vehicle_id: number
  category_id: number
  voter_ip: string
  voter_session: string
  created_at: string
  updated_at: string
  vehicle?: {
    id: number
    entry_number: number
    make: string
    model: string
    year: number
    full_name: string
    city?: string
    state?: string
  }
  category?: {
    id: number
    name: string
    description?: string
  }
}

export async function getCurrentVote(): Promise<CurrentVote | null> {
  const supabase = createClient()

  try {
    // Get voter fingerprint using the existing voter tracking system
    const voterFingerprint = await voterTracker.getVoterFingerprint()

    console.log("Checking for existing vote:", {
      voterFingerprint: voterFingerprint.substring(0, 10) + "...",
    })

    const { data, error } = await supabase
      .from("votes")
      .select(`
        *,
        vehicles!votes_vehicle_id_fkey(id, entry_number, make, model, year, full_name, city, state),
        categories!votes_category_id_fkey(id, name, description)
      `)
      .eq("voter_session", voterFingerprint)
      .maybeSingle()

    if (error) {
      console.error("Error fetching current vote:", error)
      return null
    }

    console.log("Current vote found:", data)
    return data
      ? {
          ...data,
          vehicle: data.vehicles,
          category: data.categories,
        }
      : null
  } catch (error) {
    console.error("Error in getCurrentVote:", error)
    return null
  }
}

export async function castVote(vehicleId: number, categoryId: number): Promise<VoteResult> {
  const supabase = createClient()

  try {
    // Get voter fingerprint using the existing voter tracking system
    const voterFingerprint = await voterTracker.getVoterFingerprint()

    console.log("Attempting to cast vote:", {
      vehicleId,
      categoryId,
      voterFingerprint: voterFingerprint.substring(0, 10) + "...",
    })

    const { data: existingVote, error: fetchError } = await supabase
      .from("votes")
      .select("id, vehicle_id, category_id")
      .eq("voter_session", voterFingerprint)
      .maybeSingle()

    if (fetchError) {
      console.error("Error checking existing vote:", fetchError)
      return {
        success: false,
        action: "created",
        error: `Failed to check existing vote: ${fetchError.message}`,
      }
    }

    if (existingVote) {
      console.log("User has already voted:", existingVote.id)
      return {
        success: false,
        action: "already_voted",
        voteId: existingVote.id,
        error: "You have already voted. Each voter can only vote once.",
      }
    }

    // No existing vote - create new one
    console.log("Creating new vote")

    const { data: newVote, error: insertError } = await supabase
      .from("votes")
      .insert({
        vehicle_id: vehicleId,
        voter_ip: voterFingerprint, // Using fingerprint as IP for consistency
        voter_session: voterFingerprint,
        category_id: categoryId,
      })
      .select("id")
      .single()

    if (insertError) {
      console.error("Error creating vote:", insertError)

      // Handle duplicate key constraint violation (race condition)
      if (insertError.code === "23505") {
        console.log("Duplicate key detected - user already voted")
        return {
          success: false,
          action: "already_voted",
          error: "You have already voted. Each voter can only vote once.",
        }
      }

      return {
        success: false,
        action: "created",
        error: `Failed to create vote: ${insertError.message}`,
      }
    }

    if (!newVote) {
      return {
        success: false,
        action: "created",
        error: "Vote was not created - no data returned",
      }
    }

    console.log("Vote created successfully:", newVote)
    return {
      success: true,
      action: "created",
      voteId: newVote.id,
    }
  } catch (error) {
    console.error("Unexpected error in castVote:", error)
    return {
      success: false,
      action: "created",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getVoteCount(vehicleId: number, categoryId: number): Promise<number> {
  const supabase = createClient()

  try {
    const { count, error } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("vehicle_id", vehicleId)
      .eq("category_id", categoryId)

    if (error) {
      console.error("Error getting vote count:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error("Error in getVoteCount:", error)
    return 0
  }
}

export async function getAllVotes() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("votes")
      .select(`
        *,
        vehicles!votes_vehicle_id_fkey(id, entry_number, make, model, year, full_name, city, state),
        categories!votes_category_id_fkey(id, name, description)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching votes:", error)
      return []
    }

    return (
      data?.map((vote) => ({
        ...vote,
        vehicle: vote.vehicles,
        category: vote.categories,
      })) || []
    )
  } catch (error) {
    console.error("Error in getAllVotes:", error)
    return []
  }
}

export async function getCurrentVotesByCategory(): Promise<CurrentVote[]> {
  const vote = await getCurrentVote()
  return vote ? [vote] : []
}

export async function getCurrentVoteInCategory(categoryId: number): Promise<CurrentVote | null> {
  return await getCurrentVote()
}

export async function getVotingCategories() {
  return [{ id: 28, name: "People's Choice", description: "Vote for your favorite vehicle" }]
}

export async function getVoteCountsByCategory(vehicleId: number) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("votes")
      .select(`
        category_id,
        categories!votes_category_id_fkey(id, name)
      `)
      .eq("vehicle_id", vehicleId)

    if (error) {
      console.error("Error getting vote counts by category:", error)
      return []
    }

    // Group votes by category
    const voteCounts = data?.reduce(
      (acc, vote) => {
        const categoryId = vote.category_id
        const categoryName = vote.categories?.name || "Unknown"

        if (!acc[categoryId]) {
          acc[categoryId] = {
            categoryId,
            categoryName,
            count: 0,
          }
        }
        acc[categoryId].count++
        return acc
      },
      {} as Record<number, { categoryId: number; categoryName: string; count: number }>,
    )

    return Object.values(voteCounts || {})
  } catch (error) {
    console.error("Error in getVoteCountsByCategory:", error)
    return []
  }
}
