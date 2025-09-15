import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  console.log("[v0] Upload API called with filename:", filename)
  console.log("[v0] Request headers:", Object.fromEntries(request.headers.entries()))

  if (!filename) {
    console.error("[v0] No filename provided")
    return NextResponse.json({ error: "Filename is required" }, { status: 400 })
  }

  // Sanitize filename to prevent path traversal attacks
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 100)
  if (sanitizedFilename !== filename) {
    console.error("[v0] Invalid filename provided:", filename)
    return NextResponse.json({ error: "Invalid filename format" }, { status: 400 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("[v0] BLOB_READ_WRITE_TOKEN is not set")
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 })
  }

  try {
    console.log("[v0] Getting file blob from request...")
    // Get the file as a blob from the request
    const fileBlob = await request.blob()
    console.log("[v0] File blob received:", { size: fileBlob.size, type: fileBlob.type })

    if (!fileBlob || fileBlob.size === 0) {
      console.error("[v0] No file data received")
      return NextResponse.json({ error: "No file data received" }, { status: 400 })
    }

    const maxFileSize = 10 * 1024 * 1024 // 10MB limit
    if (fileBlob.size > maxFileSize) {
      console.error("[v0] File too large:", fileBlob.size)
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(fileBlob.type)) {
      console.error("[v0] Invalid file type:", fileBlob.type)
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are allowed" }, { status: 400 })
    }

    console.log(`[v0] Processing upload: ${sanitizedFilename}`)
    console.log(`[v0] Original file size: ${fileBlob.size} bytes`)
    console.log(`[v0] Original file type: ${fileBlob.type}`)

    console.log("[v0] Converting to buffer...")
    const imageBuffer = Buffer.from(await fileBlob.arrayBuffer())
    console.log("[v0] Buffer created, size:", imageBuffer.length)

    console.log("[v0] Starting Sharp conversion to WebP...")
    // Convert to WebP with high quality (85%) for optimal balance of size and quality
    const webpBuffer = await sharp(imageBuffer).webp({ quality: 85, effort: 4 }).toBuffer()
    console.log("[v0] Sharp conversion completed")

    // Update filename to have .webp extension
    const webpFilename = sanitizedFilename.replace(/\.(jpe?g|png|webp)$/i, ".webp")

    console.log(`[v0] Converted to WebP: ${webpFilename}`)
    console.log(
      `[v0] WebP file size: ${webpBuffer.length} bytes (${Math.round((1 - webpBuffer.length / fileBlob.size) * 100)}% reduction)`,
    )

    // Upload the converted WebP image to Vercel Blob
    console.log("[v0] Attempting blob upload...")
    const blob = await put(`vehicle-photos/${webpFilename}`, webpBuffer, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: "image/webp", // Set correct content type for WebP
    })

    console.log(`[v0] Upload successful:`, {
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      downloadUrl: blob.downloadUrl,
      originalSize: fileBlob.size,
      compressedSize: webpBuffer.length,
      compressionRatio: Math.round((1 - webpBuffer.length / fileBlob.size) * 100),
    })
  } catch (error) {
    console.error("[v0] Upload error details:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    const errorMessage = error instanceof Error ? error.message : "Unknown upload error"
    return NextResponse.json(
      {
        error: "Upload failed",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
