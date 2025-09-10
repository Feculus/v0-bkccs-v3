import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#3A403D] text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Image
                src="https://wrf7neuyrmcfw9ve.public.blob.vercel-storage.com/site%20images/logos/Big%20Kid%20Custom%20Rides%20Logo.png"
                alt="Big Kid Custom Rides Logo"
                width={360}
                height={108}
                className="h-20 w-auto"
              />
            </div>
            <p className="text-white/80 mb-4">
              {"All proceeds go to support Tiny Tim\'s Foundation For Kids. Register your vehicle today to support this great cause."}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-[#BF6849] text-red-600">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/register" className="text-white/80 hover:text-white transition-colors">
                  Registration
                </Link>
              </li>
              <li>
                <Link href="/vehicles" className="text-white/80 hover:text-white transition-colors">
                  Vehicle Collection
                </Link>
              </li>
              <li>
                <Link href="/results" className="text-white/80 hover:text-white transition-colors">
                  Voting Results
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-[#BF6849] text-red-600">Contact Info</h3>
            <div className="space-y-2 text-white/80">
              <p>Big Kid Custom Rides | 385-375-2191 </p>
              <p>165 1330 W C2</p>
              <p>Orem, UT 84057</p>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2 text-[#A9BF88] text-red-600">Event Date</h4>
              <p className="text-white/80">September 20, 2025</p>
              <p className="text-white/80 text-sm">Gates open at 10:00 AM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
          <p>© 2025 CARS FOR A CAUSE. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>|</span>
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
