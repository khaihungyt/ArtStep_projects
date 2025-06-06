import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const featuredDesigns = [
  {
    id: 1,
    title: "Modern Minimalist Leather Wallet",
    category: "Accessories",
    style: "Minimalist",
    material: "Leather",
    image: "/placeholder.svg?height=300&width=400",
    artisan: "Crafted by Maria L.",
    price: 89.99,
  },
  {
    id: 2,
    title: "Vintage-Inspired Ceramic Vase",
    category: "Home Decor",
    style: "Vintage",
    material: "Ceramic",
    image: "/placeholder.svg?height=300&width=400",
    artisan: "Crafted by James T.",
    price: 129.99,
  },
  {
    id: 3,
    title: "Custom Sport Jersey Design",
    category: "Apparel",
    style: "Sport",
    material: "Cotton",
    image: "/placeholder.svg?height=300&width=400",
    artisan: "Crafted by Alex K.",
    price: 74.99,
  },
  {
    id: 4,
    title: "Luxury Handcrafted Wooden Watch",
    category: "Accessories",
    style: "Luxury",
    material: "Wood",
    image: "/placeholder.svg?height=300&width=400",
    artisan: "Crafted by Thomas W.",
    price: 199.99,
  },
]

export default function FeaturedDesigns() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredDesigns.map((design) => (
        <Link href={`/designs/${design.id}`} key={design.id}>
          <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full">
              <Image src={design.image || "/placeholder.svg"} alt={design.title} fill className="object-cover" />
            </div>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline">{design.style}</Badge>
                <Badge variant="outline">{design.material}</Badge>
              </div>
              <h3 className="font-semibold text-lg line-clamp-2">{design.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{design.artisan}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
              <span className="font-bold text-lg">${design.price}</span>
                      <Badge className="bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-400 to-purple-500 text-white font-semibold hover:brightness-110">Customize</Badge>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
