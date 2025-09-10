"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Car, ArrowLeft, X, AlertCircle, AlertTriangle, FileX } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"

export default function RegisterPageClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [rejectedFiles, setRejectedFiles] = useState<Array<{ name: string; reason: string; size?: number }>>([])
  const [registrationClosed, setRegistrationClosed] = useState(false)
  const [currentCount, setCurrentCount] = useState<number | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    make: "",
    model: "",
    year: "",
    description: "",
  })
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({})
  const [emailError, setEmailError] = useState<string>("")

  useEffect(() => {
    checkRegistrationStatus()
  }, [])

  const checkRegistrationStatus = async () => {
    try {
      const supabase = createClient()
      const { count, error } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")

      if (error) {
        console.error("Error checking registration count:", error)
        return
      }

      setCurrentCount(count)
      setRegistrationClosed(count !== null && count >= 50)
    } catch (error) {
      console.error("Error checking registration status:", error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Only JPEG, PNG, and WebP images are supported.`,
      }
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File too large (${formatFileSize(file.size)}). Maximum size is 5MB.`,
      }
    }

    return { isValid: true }
  }

  const uploadPhotoToBlob = async (file: File, index: number): Promise<string> => {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const fileName = `temp-${Date.now()}-${index}.${fileExt}`

    console.log(`Uploading photo ${index + 1}: ${file.name} (${file.size} bytes)`)

    setUploadProgress((prev) => ({ ...prev, [index]: 0 }))

    try {
      const response = await fetch(`/api/upload?filename=${fileName}`, {
        method: "POST",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      setUploadProgress((prev) => ({ ...prev, [index]: 100 }))

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log(`Photo ${index + 1} uploaded successfully:`, result.url)
      return result.url
    } catch (error) {
      console.error(`Error uploading photo ${index + 1}:`, error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus("")
    setError("")
    setRejectedFiles([])
    setUploadProgress({})

    try {
      console.log("=== CLIENT SIDE REGISTRATION START ===")

      if (photos.length === 0) {
        setError("Please upload at least one photo of your vehicle.")
        return
      }

      if (photos.length > 5) {
        setError("Maximum 5 photos allowed.")
        return
      }

      if (
        !formData.first_name ||
        !formData.last_name ||
        !formData.email ||
        !formData.city ||
        !formData.state ||
        !formData.make ||
        !formData.model ||
        !formData.year
      ) {
        setError("Please fill in all required fields.")
        return
      }

      if (emailError) {
        setError(emailError)
        return
      }

      setStatus("Uploading photos...")

      const photoUrls: string[] = []
      for (let i = 0; i < photos.length; i++) {
        try {
          setStatus(`Uploading photo ${i + 1} of ${photos.length}...`)
          const url = await uploadPhotoToBlob(photos[i], i)
          photoUrls.push(url)
        } catch (error) {
          console.error(`Failed to upload photo ${i + 1}:`, error)
          setError(`Failed to upload photo ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`)
          return
        }
      }

      console.log("All photos uploaded successfully:", photoUrls)
      setStatus("Creating vehicle registration...")

      const registrationData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: Number.parseInt(formData.year),
        description: formData.description.trim() || undefined,
        photo_urls: photoUrls,
      }

      console.log("Sending registration data:", registrationData)

      const response = await fetch("/api/register-vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      })

      console.log("API response status:", response.status)
      console.log("API response ok:", response.ok)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("API response error:", errorData)

        if (errorData.registrationClosed) {
          setRegistrationClosed(true)
          setError(errorData.error)
          return
        }

        throw new Error(errorData.error || `Registration failed with status ${response.status}`)
      }

      const result = await response.json()
      console.log("Registration result:", result)

      if (result.success) {
        setStatus("Registration completed successfully!")
        console.log("Registration successful, redirecting to success page...")
        setTimeout(() => {
          router.push(`/register/success?id=${result.vehicleId}`)
        }, 1500)
      } else {
        setError(result.error || "Registration failed for unknown reason")
      }
    } catch (error) {
      console.error("CLIENT SIDE ERROR in registration:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(`Registration failed: ${errorMessage}`)
    } finally {
      setLoading(false)
      setUploadProgress({})
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const existingPhotos = [...photos]

      setRejectedFiles([])
      setError("")

      if (existingPhotos.length + files.length > 5) {
        setError(`Maximum 5 photos allowed. You currently have ${existingPhotos.length} photos.`)
        return
      }

      const validFiles: File[] = []
      const newRejectedFiles: Array<{ name: string; reason: string; size?: number }> = []

      for (const file of files) {
        const validation = validateFile(file)

        if (!validation.isValid) {
          newRejectedFiles.push({
            name: file.name,
            reason: validation.error!,
            size: file.size,
          })
          continue
        }

        validFiles.push(file)
      }

      if (newRejectedFiles.length > 0) {
        setRejectedFiles(newRejectedFiles)
      }

      if (validFiles.length === 0 && newRejectedFiles.length > 0) {
        setError(
          `${newRejectedFiles.length} file(s) were rejected. Please see details below and try again with valid image files.`,
        )
      }

      if (validFiles.length > 0) {
        const allPhotos = [...existingPhotos, ...validFiles]
        setPhotos(allPhotos)

        const existingPreviewUrls = photoPreviewUrls.slice(0, existingPhotos.length)
        const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file))
        const allPreviewUrls = [...existingPreviewUrls, ...newPreviewUrls]

        setPhotoPreviewUrls(allPreviewUrls)
      }

      e.target.value = ""
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newPreviewUrls = photoPreviewUrls.filter((_, i) => i !== index)

    URL.revokeObjectURL(photoPreviewUrls[index])

    setPhotos(newPhotos)
    setPhotoPreviewUrls(newPreviewUrls)
  }

  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files)
    const existingPhotos = [...photos]

    setRejectedFiles([])
    setError("")

    if (existingPhotos.length + files.length > 5) {
      setError(`Maximum 5 photos allowed. You currently have ${existingPhotos.length} photos.`)
      return
    }

    const validFiles: File[] = []
    const newRejectedFiles: Array<{ name: string; reason: string; size?: number }> = []

    for (const file of files) {
      const validation = validateFile(file)

      if (!validation.isValid) {
        newRejectedFiles.push({
          name: file.name,
          reason: validation.error!,
          size: file.size,
        })
        continue
      }

      validFiles.push(file)
    }

    if (newRejectedFiles.length > 0) {
      setRejectedFiles(newRejectedFiles)
    }

    if (validFiles.length === 0 && newRejectedFiles.length > 0) {
      setError(
        `${newRejectedFiles.length} file(s) were rejected. Please see details below and try again with valid image files.`,
      )
    }

    if (validFiles.length > 0) {
      const allPhotos = [...existingPhotos, ...validFiles]
      setPhotos(allPhotos)

      const existingPreviewUrls = photoPreviewUrls.slice(0, existingPhotos.length)
      const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file))
      const allPreviewUrls = [...existingPreviewUrls, ...newPreviewUrls]

      setPhotoPreviewUrls(allPreviewUrls)
    }
  }

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10)

    // Format as (XXX)-XXX-XXXX
    if (limitedDigits.length >= 6) {
      return `(${limitedDigits.slice(0, 3)})-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`
    } else if (limitedDigits.length >= 3) {
      return `(${limitedDigits.slice(0, 3)})-${limitedDigits.slice(3)}`
    } else if (limitedDigits.length > 0) {
      return `(${limitedDigits}`
    }

    return ""
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setFormData({ ...formData, email })

    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("")
    }
  }

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-bk-light-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bk-bright-red mx-auto mb-4"></div>
          <p className="text-bk-dark-gray">Checking registration status...</p>
        </div>
      </div>
    )
  }

  if (registrationClosed) {
    return (
      <div className="min-h-screen bg-bk-light-gray py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <Button asChild variant="ghost" className="text-bk-dark-gray hover:bg-bk-dark-gray hover:text-white">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Car className="h-8 w-8 text-bk-bright-red" />
                <CardTitle className="text-3xl font-bold text-bk-dark-gray">Registration Closed</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <Alert className="border-bk-bright-red bg-bk-bright-red/5">
                <AlertCircle className="h-4 w-4 text-bk-bright-red" />
                <AlertDescription className="text-bk-dark-gray">
                  <strong>Registration is now closed.</strong> We have reached the maximum of 50 vehicle entries for the
                  2025 Cars For A Cause.
                </AlertDescription>
              </Alert>

              <div className="bg-bk-light-gray rounded-lg p-6">
                <h3 className="text-xl font-semibold text-bk-dark-gray mb-2">What's Next?</h3>
                <p className="text-bk-dark-gray/80 mb-4">
                  Even though registration is closed, you can still enjoy the show! Browse all registered vehicles and
                  cast your votes when voting opens.
                </p>
                <div className="space-y-3">
                  <Button asChild className="bg-bk-bright-red hover:bg-bk-bright-red/90 text-white w-full">
                    <Link href="/vehicles">View All Registered Vehicles</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/">Return to Home</Link>
                  </Button>
                </div>
              </div>

              <div className="text-sm text-bk-dark-gray/60">
                <p>
                  Total Registered Vehicles: <strong>{currentCount}/50</strong>
                </p>
                <p className="mt-2">
                  For questions about the event, please contact the{" "}
                  <a
                    href="https://landcruiserhm.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bk-bright-red hover:underline"
                  >
                    Cars For A Cause
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bk-light-gray py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button asChild variant="ghost" className="text-bk-dark-gray hover:bg-bk-dark-gray hover:text-white">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-bk-bright-red" />
              <CardTitle className="text-3xl font-bold text-bk-dark-gray">Vehicle Registration</CardTitle>
            </div>
            <CardDescription className="text-bk-dark-gray/60">
              Register your vehicle for the 2025 Cars For A Cuase Best in Show competition. All fields marked with * are
              required.
            </CardDescription>
            {currentCount !== null && (
              <div className="mt-4 p-3 bg-bk-light-gray rounded-lg">
                <p className="text-sm font-medium text-bk-dark-gray">
                  Registered Vehicles: <span className="text-bk-bright-red font-bold">{currentCount}/50</span>
                  {currentCount >= 45 && currentCount < 50 && (
                    <span className="text-bk-bright-red ml-2">• Only {50 - currentCount} spots remaining!</span>
                  )}
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading && status && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {status}
                  {Object.keys(uploadProgress).length > 0 && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(uploadProgress).map(([index, progress]) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-xs">Photo {Number.parseInt(index) + 1}:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-bk-bright-red h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs">{progress}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-6 border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {rejectedFiles.length > 0 && (
              <Alert className="mb-6 border-orange-500 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <div className="text-orange-800">
                    <p className="font-semibold mb-2">{rejectedFiles.length} file(s) could not be uploaded:</p>
                    <div className="space-y-2">
                      {rejectedFiles.map((file, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <FileX className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-orange-700">
                              {file.reason}
                              {file.size && ` (Current size: ${formatFileSize(file.size)})`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-sm font-medium">
                      💡 Tip: You can compress large images using online tools or photo editing software before
                      uploading.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-bk-dark-gray border-b border-bk-bright-red pb-2">
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="border-bk-dark-gray/20 focus:border-bk-bright-red"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="border-bk-dark-gray/20 focus:border-bk-bright-red"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleEmailChange}
                      className={`border-bk-dark-gray/20 focus:border-bk-bright-red ${
                        emailError ? "border-red-500 focus:border-red-500" : ""
                      }`}
                    />
                    {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value)
                        setFormData({ ...formData, phone: formatted })
                      }}
                      placeholder="(XXX)-XXX-XXXX"
                      className="border-bk-dark-gray/20 focus:border-bk-bright-red"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="border-bk-dark-gray/20 focus:border-bk-bright-red"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="border-bk-dark-gray/20 focus:border-bk-bright-red"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-bk-dark-gray border-b border-bk-bright-red pb-2">
                  Vehicle Information
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="make">Make *</Label>
                    <Input
                      id="make"
                      required
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="border-bk-dark-gray/20 focus:border-bk-bright-red"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="border-bk-dark-gray/20 focus:border-bk-bright-red"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      min="1900"
                      max="2025"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="border-bk-dark-gray/20 focus:border-bk-bright-red"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Vehicle Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your vehicle - modifications, engine details, history, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="border-bk-dark-gray/20 focus:border-bk-bright-red min-h-[100px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-bk-dark-gray border-b border-bk-bright-red pb-2">
                  Vehicle Photos * (Maximum 5 photos, 5MB each)
                </h3>

                {photoPreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                    {photoPreviewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-bk-light-gray">
                        <Image
                          src={url || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          disabled={loading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          Photo {index + 1}
                        </div>
                        {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-white text-sm">{uploadProgress[index]}%</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className="border-2 border-dashed border-bk-dark-gray/20 rounded-lg p-8 text-center hover:border-bk-bright-red/50 transition-colors"
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-bk-dark-gray/40 mx-auto mb-4" />
                  <Label htmlFor="photos" className="cursor-pointer">
                    <span className="text-bk-bright-red font-semibold">Click to upload multiple photos</span>
                    <span className="text-bk-dark-gray/60"> or drag and drop</span>
                  </Label>
                  <Input
                    id="photos"
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                    required={photos.length === 0}
                    disabled={loading}
                    key={photos.length}
                  />
                  <p className="text-sm text-bk-dark-gray/60 mt-2">
                    Upload multiple photos at once. Maximum 5 photos total, 5MB each.
                  </p>
                  <p className="text-sm text-bk-dark-gray/60">Supported formats: JPEG, PNG, WebP</p>
                  {photos.length > 0 && (
                    <p className="text-sm text-bk-deep-red mt-2 font-semibold">{photos.length} photo(s) selected</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button type="button" variant="outline" asChild disabled={loading}>
                  <Link href="/">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-bk-bright-red hover:bg-bk-bright-red/90 text-white px-8"
                >
                  {loading ? "Registering..." : "Register Vehicle"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
