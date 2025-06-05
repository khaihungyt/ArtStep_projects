import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for artisans
const artisans = Array.from({ length: 8 }, (_, i) => ({
  id: `artisan-${i + 1}`,
  name: [
    "Maria Lopez",
    "James Thompson",
    "Alex Kim",
    "Thomas Wilson",
    "Sarah Parker",
    "Michael Rodriguez",
    "Emma Chen",
    "David Nguyen",
  ][i % 8],
  avatar: `/placeholder.svg?height=100&width=100&text=${i + 1}`,
  rating: (4 + Math.random()).toFixed(1),
  reviews: Math.floor(Math.random() * 200) + 10,
  location: [
    "Barcelona, Spain",
    "Portland, USA",
    "Seoul, South Korea",
    "London, UK",
    "Melbourne, Australia",
    "Mexico City, Mexico",
    "Toronto, Canada",
    "Tokyo, Japan",
  ][i % 8],
  specialties: [
    ["Leather goods", "Custom accessories"],
    ["Woodworking", "Furniture design"],
    ["Ceramics", "Pottery"],
    ["Metal work", "Jewelry"],
    ["Textiles", "Embroidery"],
    ["Glass art", "Sculpture"],
    ["Paper crafts", "Bookbinding"],
    ["Digital design", "3D printing"],
  ][i % 8],
  bio: [
    "With over 15 years of experience in leathercraft, Maria creates timeless pieces that combine traditional techniques with modern design.",
    "James specializes in handcrafted wooden furniture and home goods, focusing on sustainable materials and timeless designs.",
    "Alex is a ceramic artist who creates functional pottery with unique glazes and textures inspired by natural landscapes.",
    "Thomas is a metalsmith who combines traditional blacksmithing techniques with contemporary design to create unique jewelry and home decor.",
    "Sarah is a textile artist specializing in hand-embroidery and custom garment design with a focus on sustainable fashion.",
    "Michael creates stunning glass art pieces using traditional blowing techniques combined with modern design sensibilities.",
    "Emma is a paper artist who creates intricate handmade books, cards, and paper sculptures with a focus on traditional binding techniques.",
    "David combines digital design with physical craftsmanship, specializing in 3D printed objects and custom prototypes.",
  ][i % 8],
  completedProjects: Math.floor(Math.random() * 100) + 20,
  responseTime: ["1-2 hours", "Same day", "Within 24 hours"][i % 3],
}))

export default function ArtisansList() {
  return (
    <div className="space-y-6">
      {artisans.map((artisan) => (
        <Card key={artisan.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3">
                  <Image src={artisan.avatar || "/placeholder.svg"} alt={artisan.name} fill className="object-cover" />
                </div>
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 font-medium">{artisan.rating}</span>
                  <span className="ml-1 text-sm text-muted-foreground">({artisan.reviews} reviews)</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  {artisan.location}
                </div>
                <Button className="w-full md:w-auto">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <h3 className="text-xl font-semibold">{artisan.name}</h3>
                  <Link href={`/artisans/${artisan.id}`} className="text-primary hover:underline text-sm mt-1 md:mt-0">
                    View Full Profile
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {artisan.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <p className="text-muted-foreground mb-4">{artisan.bio}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Completed Projects:</span>
                    <p className="font-medium">{artisan.completedProjects}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Response Time:</span>
                    <p className="font-medium">{artisan.responseTime}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Member Since:</span>
                    <p className="font-medium">January 2022</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
