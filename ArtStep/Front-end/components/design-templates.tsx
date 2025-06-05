import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"

// Mock template categories
const categories = ["All Templates", "Accessories", "Apparel", "Home Decor", "Jewelry", "Stationery", "Art Prints"]

// Mock templates
const templates = Array.from({ length: 12 }, (_, i) => ({
  id: `template-${i + 1}`,
  title: [
    "Leather Wallet Template",
    "Custom T-Shirt Design",
    "Ceramic Mug Template",
    "Wooden Sign Design",
    "Personalized Jewelry",
    "Canvas Tote Bag",
    "Custom Phone Case",
    "Engraved Cutting Board",
    "Embroidered Hat",
    "Printed Stationery Set",
    "Metal Keychain",
    "Personalized Notebook",
  ][i % 12],
  category: ["Accessories", "Apparel", "Home Decor", "Stationery"][i % 4],
  image: `/placeholder.svg?height=300&width=400&text=Template+${i + 1}`,
  difficulty: ["Beginner", "Intermediate", "Advanced"][i % 3],
  customizationLevel: ["Basic", "Standard", "Advanced"][i % 3],
}))

export default function DesignTemplates() {
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide">
        {categories.map((category, index) => (
          <Button key={index} variant={index === 0 ? "default" : "outline"} className="whitespace-nowrap">
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full">
              <Image src={template.image || "/placeholder.svg"} alt={template.title} fill className="object-cover" />
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg line-clamp-1">{template.title}</h3>
                <Badge>{template.category}</Badge>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mb-4">
                <span>Difficulty: {template.difficulty}</span>
                <span>Customization: {template.customizationLevel}</span>
              </div>
              <Link href={`/customize/${template.id}`}>
                <Button className="w-full">Use This Template</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
