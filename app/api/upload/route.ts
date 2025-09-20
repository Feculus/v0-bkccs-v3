import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("[v0] Upload API: Starting request processing")

  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")
    console.log("[v0] Upload API: Filename received:", filename)

    if (!filename) {
      console.log("[v0] Upload API: No filename provided")
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    // Sanitize filename to prevent path traversal attacks
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 100)
    if (sanitizedFilename !== filename) {
      console.log("[v0] Upload API: Invalid filename format")
      return NextResponse.json({ error: "Invalid filename format" }, { status: 400 })
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log("[v0] Upload API: No blob token configured")
      return NextResponse.json({ error: "Storage not configured" }, { status: 500 })
    }

    console.log("[v0] Upload API: Getting file blob from request")
    // Get the file as a blob from the request
    const fileBlob = await request.blob()
    console.log("[v0] Upload API: File blob received, size:", fileBlob.size, "type:", fileBlob.type)

    if (!fileBlob || fileBlob.size === 0) {
      console.log("[v0] Upload API: No file data received")
      return NextResponse.json({ error: "No file data received" }, { status: 400 })
    }

    const maxFileSize = 10 * 1024 * 1024 // 10MB limit
    if (fileBlob.size > maxFileSize) {
      console.log("[v0] Upload API: File size exceeds limit")
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/tiff", "image/tif"]
    if (!allowedTypes.includes(fileBlob.type)) {
      console.log("[v0] Upload API: Invalid file type:", fileBlob.type)
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, HEIC, and TIFF images are allowed" }, { status: 400 })
    }

    console.log("[v0] Upload API: Creating File object for blob upload")
    const file = new File([fileBlob], sanitizedFilename, { type: fileBlob.type })
    console.log("[v0] Upload API: File object created, size:", file.size)

    console.log("[v0] Upload API: Starting blob upload to:", `vehicle-photos/${sanitizedFilename}`)
    const blob = await put(`vehicle-photos/${sanitizedFilename}`, file, {
      access: "public",
      addRandomSuffix: true,
    })
    console.log("[v0] Upload API: Blob upload completed:", blob.url)

    const response = {
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      downloadUrl: blob.downloadUrl,
      originalSize: fileBlob.size,
      compressedSize: file.size,
      compressionRatio: 0, // No compression without Sharp
    }

    console.log("[v0] Upload API: Returning success response")
    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Upload API: Caught error:", error)
    console.error("[v0] Upload API: Error stack:", error instanceof Error ? error.stack : "No stack trace")

    let errorMessage = "Unknown upload error"
    let errorDetails = ""

    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.name
      console.log("[v0] Upload API: Error details - name:", error.name, "message:", error.message)

      if (error.message.includes("blob") || error.message.includes("storage") || error.message.includes("put")) {
        errorMessage = "Storage upload failed"
        errorDetails = "Unable to save image to storage - check blob configuration"
      } else if (error.message.includes("token") || error.message.includes("unauthorized")) {
        errorMessage = "Storage authentication failed"
        errorDetails = "Storage service is not properly configured"
      } else if (error.message.includes("fetch") || error.message.includes("network")) {
        errorMessage = "Network error during upload"
        errorDetails = "Please check your internet connection and try again"
      }
    }

    // Always return a proper JSON response
    const errorResponse = {
      error: "Upload failed",
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString(),
    }

    console.log("[v0] Upload API: Returning error response:", errorMessage)
    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
