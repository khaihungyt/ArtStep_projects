import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface ArtisanProps {
  artisan: {
    id: string
    name: string
    avatar: string
    rating: number
    reviews: number
    location: string
    specialties: string[]
    bio: string
  }
}

export default function ArtisanCard({ artisan }: ArtisanProps) {
  return (
    <Card>
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
            <p className="text-sm text-muted-foreground mb-4">{artisan.location}</p>
            <Button className="w-full md:w-auto">
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Artisan
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

            <p className="text-muted-foreground">{artisan.bio}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
