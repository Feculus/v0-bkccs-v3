"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, PenTool } from "lucide-react"

interface SignatureCaptureProps {
  onSignatureChange: (signature: string | null) => void
  required?: boolean
}

export default function SignatureCapture({ onSignatureChange, required = false }: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isSigningActive, setIsSigningActive] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = 200

    // Set drawing styles
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Fill with white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [isSigningActive])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isSigningActive) return

    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let x, y
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isSigningActive) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let x, y
    if ("touches" in e) {
      e.preventDefault()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    setHasSignature(true)

    // Convert canvas to base64 and notify parent
    const canvas = canvasRef.current
    if (canvas) {
      const signatureData = canvas.toDataURL("image/png")
      onSignatureChange(signatureData)
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onSignatureChange(null)
  }

  const activateSigning = () => {
    setIsSigningActive(true)
  }

  const deactivateSigning = () => {
    setIsSigningActive(false)
    setIsDrawing(false)
  }

  return (
    <div className="space-y-4">
      {!isSigningActive ? (
        <div className="text-center">
          <Button
            type="button"
            onClick={activateSigning}
            className="bg-bk-bright-red hover:bg-bk-bright-red/90 text-white"
          >
            <PenTool className="h-4 w-4 mr-2" />
            Click to Sign
          </Button>
        </div>
      ) : (
        <Card className="border-2 border-bk-bright-red">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-bk-dark-gray">Sign below:</h4>
              <div className="space-x-2">
                <Button type="button" variant="outline" size="sm" onClick={clearSignature} disabled={!hasSignature}>
                  Clear
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={deactivateSigning}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              className="w-full border border-gray-300 rounded cursor-crosshair bg-white"
              style={{ height: "200px", touchAction: "none" }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            <p className="text-sm text-gray-600 mt-2">
              Sign with your mouse or finger. Use the Clear button to start over.
            </p>
          </CardContent>
        </Card>
      )}

      {hasSignature && !isSigningActive && (
        <div className="text-center">
          <p className="text-sm text-green-600 font-medium">✓ Signature captured</p>
          <Button type="button" variant="outline" size="sm" onClick={activateSigning} className="mt-2 bg-transparent">
            Edit Signature
          </Button>
        </div>
      )}
    </div>
  )
}
