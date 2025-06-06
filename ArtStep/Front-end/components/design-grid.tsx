import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data for designs
const designs = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: [
    "Custom Leather Wallet",
    "Handcrafted Wooden Bowl",
    "Personalized Sport Jersey",
    "Luxury Silk Scarf",
    "Minimalist Metal Pendant",
    "Vintage Ceramic Mug",
    "Custom Canvas Tote Bag",
    "Engraved Wooden Watch",
    "Handmade Silver Bracelet",
    "Personalized Denim Jacket",
    "Custom Printed T-Shirt",
    "Artisan Glass Vase",
  ][i % 12],
  category: ["Accessories", "Home Decor", "Apparel", "Jewelry"][i % 4],
  style: ["Sport", "Casual", "Luxury", "Vintage", "Minimalist"][i % 5],
  material: ["Leather", "Wood", "Cotton", "Silk", "Metal", "Ceramic", "Glass"][i % 7],
  image: `/placeholder.svg?height=300&width=400&text=Design+${i + 1}`,
  artisan: [
    "Crafted by Maria L.",
    "Crafted by James T.",
    "Crafted by Alex K.",
    "Crafted by Thomas W.",
    "Crafted by Sarah P.",
    "Crafted by Michael R.",
  ][i % 6],
  price: Math.floor(Math.random() * 200) + 50 + 0.99,
}))

export default function DesignGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {designs.map((design) => (
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
                      <Badge className="bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-400 to-purple-500 text-white font-semibold hover:brightness-110">
                          Customize
                      </Badge>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
