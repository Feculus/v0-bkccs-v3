import Image from "next/image"
import { MapPin } from "lucide-react"

export default function SchedulePage() {
  const scheduleItems = [
    {
      time: "9:00",
      period: "AM",
      title: "CAR SHOW REGISTRATION OPEN ON SITE",
      description: "Ticket sales are available at the door. Registration for the show is open until 10:30 AM.",
      location: "Big Kid Custom Rides | Orem, UT",
    },
    {
      time: "10:00",
      period: "AM",
      title: "DOORS OPEN",
      description:
        "Come check out the amazing builds and rides",
      location: "Big Kid Custom Rides | Orem, UT",
    },
    {
      time: "2:00",
      period: "PM",
      title: "SHOW ENDS",
      description: "Awards will be given before the end of the show",
      location: "Big Kid Custom Rides | Orem, UT",
    },
  ]

  return (
    <div className="bg-[#F2EEEB] min-h-screen">
      {/* Hero Section with Background */}
      <section className="relative py-20 text-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/design-mode-images/DSC09819%281%29-Wem9xxeBtV0UIpf1NHFfxyBeMd5PoU.webp"
            alt="Car show event background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">EVENT SCHEDULE</h1>
          <div className="w-24 h-1 bg-[#BF6849] mx-auto mb-8 text-transparent bg-cyan-700"></div>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Cars For A Cause 2025 • September 20th, 2025
          </p>
          <p className="text-lg text-white/80 max-w-3xl mx-auto drop-shadow-md">
            Join us for a day of car shows, food, raffles, and kids games celebrating the custom car
            community.
          </p>
        </div>
      </section>

      {/* Schedule Cards */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            {scheduleItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Time Section */}
                  <div className="bg-[#BF6849] text-white p-6 md:w-48 flex flex-col justify-center items-center md:items-start bg-cyan-700">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold">{item.time}</span>
                      <span className="text-lg font-medium opacity-90">{item.period}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.location}</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-6">
                    <h3 className="text-2xl font-bold text-[#3A403D] mb-3 tracking-wide">{item.title}</h3>
                    <p className="text-[#3A403D]/80 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
