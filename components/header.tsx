"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { getResultsPublicationStatus, checkAndUpdateScheduledPublication } from "@/lib/results-utils"

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resultsPublished, setResultsPublished] = useState(false)

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
      setResultsPublished(status.arePublished)
    } catch (error) {
      console.error("Error checking results status:", error)
    }
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-bk-light-gray border-b border-bk-dark-gray/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity" onClick={closeMobileMenu}>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/design-mode-images/Big%20Kid%20Custom%20Rides%20Logo%281%29-DFu2KNfmpnlHHw4MQvVZirVhMJx7jv.png"
              alt="Big Kid Custom Rides Logo"
              width={230}
              height={69}
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/vehicles"
              className={`text-bk-dark-gray hover:text-bk-bright-red transition-colors ${
                isActive("/vehicles") ? "text-bk-bright-red font-semibold" : ""
              }`}
            >
              VEHICLE COLLECTION
            </Link>
            <Link
              href="/schedule"
              className={`text-bk-dark-gray hover:text-bk-bright-red transition-colors ${
                isActive("/schedule") ? "text-bk-bright-red font-semibold" : ""
              }`}
            >
              SCHEDULE
            </Link>
            {resultsPublished && (
              <Link
                href="/results"
                className={`text-bk-dark-gray hover:text-bk-bright-red transition-colors ${
                  isActive("/results") ? "text-bk-bright-red font-semibold" : ""
                }`}
              >
                RESULTS
              </Link>
            )}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex space-x-3">
            <Button asChild className="bg-bk-dark-gray hover:bg-bk-dark-gray/90 text-bk-light-gray border-0">
              <a
                href="https://tinytimstoys.org/donate"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Heart className="h-4 w-4 mr-2" />
                DONATE
              </a>
            </Button>
            <Button asChild className="bg-bk-deep-red hover:bg-bk-deep-red/90 text-bk-light-gray">
              <Link href="/register">REGISTER</Link>
            </Button>
            {resultsPublished && (
              <Button asChild className="bg-bk-bright-red hover:bg-bk-bright-red/90 text-bk-light-gray">
                <Link href="/vehicles">VOTE</Link>
              </Button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="lg:hidden p-2 rounded-md text-bk-dark-gray hover:text-bk-bright-red hover:bg-bk-dark-gray/5 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 z-40" onClick={closeMobileMenu} />

            {/* Mobile Menu Panel */}
            <div className="absolute top-full left-0 right-0 bg-bk-light-gray border-b border-bk-dark-gray/10 shadow-lg z-50">
              <div className="px-4 py-6 space-y-6">
                {/* Mobile Navigation Links */}
                <nav className="space-y-4">
                  <Link
                    href="/vehicles"
                    className={`block text-lg font-medium transition-colors ${
                      isActive("/vehicles")
                        ? "text-bk-bright-red font-semibold"
                        : "text-bk-dark-gray hover:text-bk-bright-red"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    VEHICLE COLLECTION
                  </Link>
                  <Link
                    href="/schedule"
                    className={`block text-lg font-medium transition-colors ${
                      isActive("/schedule")
                        ? "text-bk-bright-red font-semibold"
                        : "text-bk-dark-gray hover:text-bk-bright-red"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    SCHEDULE
                  </Link>
                  {resultsPublished && (
                    <Link
                      href="/results"
                      className={`block text-lg font-medium transition-colors ${
                        isActive("/results")
                          ? "text-bk-bright-red font-semibold"
                          : "text-bk-dark-gray hover:text-bk-bright-red"
                      }`}
                      onClick={closeMobileMenu}
                    >
                      RESULTS
                    </Link>
                  )}
                </nav>

                {/* Mobile Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-bk-dark-gray/10">
                  <Button
                    asChild
                    className="w-full bg-bk-dark-gray hover:bg-bk-dark-gray/90 text-bk-light-gray border-0"
                  >
                    <a
                      href="https://tinytimstoys.org/donate"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                      onClick={closeMobileMenu}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      DONATE
                    </a>
                  </Button>
                  <Button asChild className="w-full bg-bk-deep-red hover:bg-bk-deep-red/90 text-bk-light-gray">
                    <Link href="/register" className="flex items-center justify-center" onClick={closeMobileMenu}>
                      REGISTER
                    </Link>
                  </Button>
                  {resultsPublished && (
                    <Button asChild className="w-full bg-bk-bright-red hover:bg-bk-bright-red/90 text-bk-light-gray">
                      <Link href="/vehicles" className="flex items-center justify-center" onClick={closeMobileMenu}>
                        VOTE
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
