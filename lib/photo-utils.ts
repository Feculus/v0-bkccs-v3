export interface PhotoUploadResult {
  success: boolean
  url?: string
  error?: string
}

export function validatePhotoFile(file: File): { valid: boolean; error?: string } {
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: "File size must be less than 10MB" }
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/tiff", "image/tif"]
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only JPEG, PNG, WebP, HEIC, and TIFF images are allowed" }
  }

  return { valid: true }
}

export function generatePhotoFileName(vehicleId: number, photoIndex: number, originalFileName: string): string {
  const fileExt = originalFileName.split(".").pop()?.toLowerCase()
  return `vehicle-${vehicleId}-${photoIndex}-${Date.now()}.${fileExt}`
}

export function getOptimizedPhotoUrl(originalUrl: string, width?: number, height?: number): string {
  // Vercel Blob doesn't have built-in image optimization
  // You could use Vercel's Image Optimization API or a service like Cloudinary
  return originalUrl
}

// These operations should be handled directly in server actions or API routes where environment variables are safe to access
