import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RelatedDesignsProps {
  category: string
  style: string
  currentId: string
}

export default function RelatedDesigns({ category, style, currentId }: RelatedDesignsProps) {
  // In a real app, you would fetch related designs based on category and style
  const relatedDesigns = [
    {
      id: "related-1",
      title: "Minimalist Leather Card Holder",
      category: "Accessories",
      style: "Minimalist",
      material: "Leather",
      image: "/placeholder.svg?height=300&width=400&text=Related+1",
      artisan: "Crafted by Maria L.",
      price: 49.99,
    },
    {
      id: "related-2",
      title: "Custom Leather Keychain",
      category: "Accessories",
      style: "Minimalist",
      material: "Leather",
      image: "/placeholder.svg?height=300&width=400&text=Related+2",
      artisan: "Crafted by Thomas W.",
      price: 29.99,
    },
    {
      id: "related-3",
      title: "Personalized Leather Passport Holder",
      category: "Accessories",
      style: "Minimalist",
      material: "Leather",
      image: "/placeholder.svg?height=300&width=400&text=Related+3",
      artisan: "Crafted by James T.",
      price: 69.99,
    },
    {
      id: "related-4",
      title: "Handcrafted Leather Belt",
      category: "Accessories",
      style: "Minimalist",
      material: "Leather",
      image: "/placeholder.svg?height=300&width=400&text=Related+4",
      artisan: "Crafted by Alex K.",
      price: 79.99,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {relatedDesigns.map((design) => (
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
              <Badge>Customize</Badge>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
