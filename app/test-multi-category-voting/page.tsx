"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, RefreshCw, CheckCircle } from "lucide-react"
import {
  castVote,
  getCurrentVotesByCategory,
  getCurrentVoteInCategory,
  getVotingCategories,
  getVoteCount,
} from "@/lib/vote-utils"
import { voterTracker } from "@/lib/voter-tracking"
import { createClient } from "@/utils/supabase/client"

export default function TestMultiCategoryVoting() {
  const [categories, setCategories] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [currentVotes, setCurrentVotes] = useState<any[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [voterFingerprint, setVoterFingerprint] = useState<string>("")

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      // Load categories
      const categoriesData = await getVotingCategories()
      setCategories(categoriesData)

      // Load some vehicles for testing
      const supabase = createClient()
      const { data: vehiclesData } = await supabase
        .from("vehicles")
        .select("id, entry_number, make, model, year, full_name")
        .neq("status", "archived")
        .limit(5)

      setVehicles(vehiclesData || [])

      // Load current votes
      await refreshCurrentVotes()

      // Get voter fingerprint
      const fingerprint = await voterTracker.getVoterFingerprint()
      setVoterFingerprint(fingerprint.substring(0, 10) + "...")
    } catch (error) {
      console.error("Error loading initial data:", error)
      addResult(`Error loading data: ${error}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const refreshCurrentVotes = async () => {
    try {
      const votes = await getCurrentVotesByCategory()
      setCurrentVotes(votes)
      addResult(`Found ${votes.length} existing votes across all categories`, "info")
    } catch (error) {
      console.error("Error refreshing votes:", error)
      addResult(`Error refreshing votes: ${error}`, "error")
    }
  }

  const addResult = (message: string, type: "success" | "error" | "info" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    setResults((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)])
  }

  const testVoteInCategory = async () => {
    if (!selectedVehicleId || !selectedCategoryId) {
      addResult("Please select both a vehicle and category", "error")
      return
    }

    try {
      setLoading(true)
      addResult(`Testing vote for vehicle ${selectedVehicleId} in category ${selectedCategoryId}...`, "info")

      // First check if already voted in this category
      const existingVote = await getCurrentVoteInCategory(selectedCategoryId)
      if (existingVote) {
        addResult(`Already voted in this category for vehicle ${existingVote.vehicle_id}`, "info")
      }

      // Attempt to cast vote
      const result = await castVote(selectedVehicleId, selectedCategoryId)

      if (result.success) {
        addResult(`✅ Vote cast successfully! Vote ID: ${result.voteId}`, "success")
        await refreshCurrentVotes()
      } else {
        addResult(`❌ Vote failed: ${result.error}`, "error")
      }
    } catch (error) {
      console.error("Error testing vote:", error)
      addResult(`Error testing vote: ${error}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const testVoteCountForCategory = async () => {
    if (!selectedVehicleId || !selectedCategoryId) {
      addResult("Please select both a vehicle and category", "error")
      return
    }

    try {
      const count = await getVoteCount(selectedVehicleId, selectedCategoryId)
      addResult(`Vote count for vehicle ${selectedVehicleId} in category ${selectedCategoryId}: ${count}`, "info")
    } catch (error) {
      console.error("Error getting vote count:", error)
      addResult(`Error getting vote count: ${error}`, "error")
    }
  }

  const clearVotingData = async () => {
    try {
      setLoading(true)
      addResult("Clearing all voting data...", "info")

      await voterTracker.clearVotingData()
      await refreshCurrentVotes()

      addResult("✅ All voting data cleared", "success")
    } catch (error) {
      console.error("Error clearing voting data:", error)
      addResult(`Error clearing voting data: ${error}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const clearCategoryVotingData = async () => {
    if (!selectedCategoryId) {
      addResult("Please select a category", "error")
      return
    }

    try {
      setLoading(true)
      addResult(`Clearing voting data for category ${selectedCategoryId}...`, "info")

      await voterTracker.clearVotingData(selectedCategoryId)
      await refreshCurrentVotes()

      addResult(`✅ Voting data cleared for category ${selectedCategoryId}`, "success")
    } catch (error) {
      console.error("Error clearing category voting data:", error)
      addResult(`Error clearing category voting data: ${error}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const testMultipleCategoryVotes = async () => {
    if (!selectedVehicleId || categories.length < 2) {
      addResult("Need at least 2 categories and a selected vehicle", "error")
      return
    }

    try {
      setLoading(true)
      addResult("Testing votes across multiple categories...", "info")

      // Try to vote in first 3 categories (or all if less than 3)
      const categoriesToTest = categories.slice(0, Math.min(3, categories.length))

      for (const category of categoriesToTest) {
        addResult(`Attempting vote in category: ${category.name}`, "info")

        const result = await castVote(selectedVehicleId, category.id)

        if (result.success) {
          addResult(`✅ Vote successful in ${category.name}`, "success")
        } else {
          addResult(`❌ Vote failed in ${category.name}: ${result.error}`, "error")
        }

        // Small delay between votes
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      await refreshCurrentVotes()
      addResult("Multi-category voting test completed", "info")
    } catch (error) {
      console.error("Error testing multiple category votes:", error)
      addResult(`Error testing multiple category votes: ${error}`, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bk-light-gray py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bk-dark-gray mb-4">Multi-Category Voting Test</h1>
          <p className="text-bk-dark-gray/60">
            Test the new multi-category voting system. Each user can now vote once per category instead of once total.
          </p>
          <div className="mt-2 text-sm text-bk-dark-gray/60">
            Voter Fingerprint: <code className="bg-gray-100 px-2 py-1 rounded">{voterFingerprint}</code>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-bk-dark-gray">Test Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Vehicle Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-bk-dark-gray">Select Vehicle:</label>
                  <Select
                    value={selectedVehicleId?.toString() || ""}
                    onValueChange={(value) => setSelectedVehicleId(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          #{vehicle.entry_number} - {vehicle.year} {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-bk-dark-gray">Select Category:</label>
                  <Select
                    value={selectedCategoryId?.toString() || ""}
                    onValueChange={(value) => setSelectedCategoryId(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Test Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={testVoteInCategory}
                    disabled={loading || !selectedVehicleId || !selectedCategoryId}
                    className="bg-bk-bright-red hover:bg-bk-bright-red/90"
                  >
                    Test Single Vote
                  </Button>

                  <Button
                    onClick={testVoteCountForCategory}
                    disabled={loading || !selectedVehicleId || !selectedCategoryId}
                    variant="outline"
                  >
                    Check Vote Count
                  </Button>

                  <Button
                    onClick={testMultipleCategoryVotes}
                    disabled={loading || !selectedVehicleId}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Test Multi-Category
                  </Button>

                  <Button onClick={refreshCurrentVotes} disabled={loading} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {/* Clear Data Buttons */}
                <div className="border-t pt-4 space-y-2">
                  <Button
                    onClick={clearCategoryVotingData}
                    disabled={loading || !selectedCategoryId}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Category Data
                  </Button>

                  <Button
                    onClick={clearVotingData}
                    disabled={loading}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Voting Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Votes */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-bk-dark-gray">
                  Current Votes ({currentVotes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentVotes.length === 0 ? (
                  <p className="text-bk-dark-gray/60 text-center py-4">No votes cast yet</p>
                ) : (
                  <div className="space-y-2">
                    {currentVotes.map((vote) => (
                      <div key={vote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-bk-dark-gray">
                            {vote.category?.name || "Unknown Category"}
                          </div>
                          <div className="text-sm text-bk-dark-gray/60">
                            Vehicle #{vote.vehicle?.entry_number} - {vote.vehicle?.make} {vote.vehicle?.model}
                          </div>
                        </div>
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Voted
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Test Results */}
          <div>
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-bk-dark-gray">Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.length === 0 ? (
                    <p className="text-bk-dark-gray/60 text-center py-4">No test results yet</p>
                  ) : (
                    results.map((result, index) => {
                      const isError = result.includes("❌") || result.includes("Error")
                      const isSuccess = result.includes("✅")

                      return (
                        <div
                          key={index}
                          className={`p-2 rounded text-sm font-mono ${
                            isError
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : isSuccess
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {result}
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="bg-white shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-bk-dark-gray">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-bk-dark-gray mb-2">Single Category Testing:</h4>
                <ol className="text-sm text-bk-dark-gray/80 space-y-1 list-decimal list-inside">
                  <li>Select a vehicle and category</li>
                  <li>Click "Test Single Vote" to cast a vote</li>
                  <li>Try voting again in the same category (should fail)</li>
                  <li>Change category and vote again (should succeed)</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-bk-dark-gray mb-2">Multi-Category Testing:</h4>
                <ol className="text-sm text-bk-dark-gray/80 space-y-1 list-decimal list-inside">
                  <li>Select a vehicle</li>
                  <li>Click "Test Multi-Category" to vote in multiple categories</li>
                  <li>Verify votes appear in "Current Votes" section</li>
                  <li>Use "Clear Category Data" to test specific category clearing</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
