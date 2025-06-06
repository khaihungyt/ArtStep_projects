import Image from "next/image"
import Link from "next/link"
import { Heart, Share2, MessageCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ArtisanCard from "@/components/artisan-card"
import RelatedDesigns from "@/components/related-designs"

export default function DesignDetailPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the design data based on the ID
  const design = {
    id: params.id,
    title: "Custom Leather Wallet with Personalized Monogram",
    description:
      "Handcrafted from premium full-grain leather, this wallet features a personalized monogram and custom stitching. Each piece is meticulously crafted by our artisans to ensure durability and a unique finish that will develop a beautiful patina over time.",
    price: 89.99,
    images: [
      "/placeholder.svg?height=600&width=600&text=Main+Image",
      "/placeholder.svg?height=300&width=300&text=Detail+1",
      "/placeholder.svg?height=300&width=300&text=Detail+2",
      "/placeholder.svg?height=300&width=300&text=Detail+3",
    ],
    category: "Accessories",
    style: "Minimalist",
    material: "Leather",
    colors: ["Black", "Brown", "Tan", "Navy"],
    customizationOptions: [
      "Monogram (up to 3 letters)",
      "Stitching color",
      "Interior layout",
      "Card slot configuration",
    ],
    artisan: {
      id: "artisan-1",
      name: "Maria Lopez",
      avatar: "/placeholder.svg?height=100&width=100&text=ML",
      rating: 4.9,
      reviews: 124,
      location: "Barcelona, Spain",
      specialties: ["Leather goods", "Custom accessories"],
      bio: "With over 15 years of experience in leathercraft, Maria creates timeless pieces that combine traditional techniques with modern design.",
    },
    productionTime: "7-10 days",
    shipping: "3-5 business days",
    reviews: {
      average: 4.8,
      count: 56,
    },
  }

  return (
    <div className="container px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href="/designs" className="hover:text-primary">
          Designs
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href={`/designs?category=${design.category.toLowerCase()}`} className="hover:text-primary">
          {design.category}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground">{design.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="relative h-[400px] mb-4 rounded-lg overflow-hidden">
            <Image src={design.images[0] || "/placeholder.svg"} alt={design.title} fill className="object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {design.images.slice(1).map((image, index) => (
              <div
                key={index}
                className="relative h-24 rounded-lg overflow-hidden border cursor-pointer hover:border-primary"
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${design.title} detail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">{design.title}</h1>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center mt-2 mb-4">
            <div className="flex items-center">
              <span className="text-yellow-500">★★★★★</span>
              <span className="ml-1 text-muted-foreground">
                {design.reviews.average} ({design.reviews.count} reviews)
              </span>
            </div>
          </div>

          <p className="text-2xl font-bold mb-6">${design.price}</p>

          <p className="text-muted-foreground mb-6">{design.description}</p>

          <div className="space-y-6 mb-8">
            {/* Style & Material */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{design.style}</Badge>
              <Badge variant="secondary">{design.material}</Badge>
              <Badge variant="secondary">{design.category}</Badge>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-medium mb-2">Color</h3>
              <div className="flex space-x-3">
                {design.colors.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full border cursor-pointer hover:ring-2 ring-primary ring-offset-2 ${index === 0 ? "ring-2" : ""}`}
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    <span className="text-xs mt-1">{color}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customization Options */}
            <div>
              <h3 className="font-medium mb-2">Customization Options</h3>
              <ul className="list-disc list-inside text-muted-foreground">
                {design.customizationOptions.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
            </div>

            {/* Production & Shipping */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Production Time:</span>
                <span>{design.productionTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Shipping:</span>
                <span>{design.shipping}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1" size="lg">
              Customize This Design
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              <MessageCircle className="mr-2 h-5 w-5" />
              Chat with Artisan
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-16">
        <Tabs defaultValue="details">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="customization">Customization</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Product Details</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">Material:</span> Premium full-grain leather
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Dimensions:</span> 4.5" x 3.5" when folded
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Features:</span> 6 card slots, 2 hidden pockets, bill
                    compartment
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Care:</span> Wipe with a damp cloth, apply leather
                    conditioner as needed
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">The Making Process</h3>
                <p className="text-muted-foreground">
                  Each wallet is cut from a single piece of leather, ensuring durability and a seamless finish. The
                  edges are beveled and burnished by hand, and all stitching is done using the traditional saddle stitch
                  method for exceptional strength. Your personalized monogram is carefully stamped using heated brass
                  tools for a lasting impression.
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="customization" className="py-6">
            <h3 className="text-xl font-semibold mb-4">Customization Options</h3>
            <p className="text-muted-foreground mb-6">
              This design can be fully customized to your preferences. Here are the options available:
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Monogram</h4>
                <p className="text-muted-foreground">
                  Add up to 3 letters for a personal touch. Choose from block, script, or serif font styles.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Stitching Color</h4>
                <p className="text-muted-foreground">
                  Select from 8 different thread colors to complement or contrast with your leather choice.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Interior Layout</h4>
                <p className="text-muted-foreground">
                  Choose between standard layout, minimalist layout, or ID window configuration.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Additional Features</h4>
                <p className="text-muted-foreground">
                  Add RFID blocking layer, coin pocket, or extra card slots for a small additional fee.
                </p>
              </div>
            </div>

            <Button className="mt-6">Start Customizing</Button>
          </TabsContent>
          <TabsContent value="reviews" className="py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold">Customer Reviews</h3>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-500 text-lg">★★★★★</span>
                  <span className="ml-2">{design.reviews.average} out of 5</span>
                  <span className="ml-2 text-muted-foreground">Based on {design.reviews.count} reviews</span>
                </div>
              </div>
              <Button>Write a Review</Button>
            </div>

            <Separator className="my-6" />

            {/* Sample Reviews */}
            <div className="space-y-6">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="border-b pb-6 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <span className="text-yellow-500">★★★★★</span>
                        <h4 className="font-medium ml-2">Perfect gift!</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">By John D. on March 15, 2023</p>
                    </div>
                    <Badge variant="outline">Verified Purchase</Badge>
                  </div>
                  <p className="mt-3">
                    I ordered this wallet as a gift for my father and he absolutely loves it. The quality of the leather
                    is exceptional and the monogram looks very elegant. The craftsmanship is outstanding!
                  </p>
                </div>
              ))}
            </div>

            <Button variant="outline" className="mt-6 w-full">
              Load More Reviews
            </Button>
          </TabsContent>
          <TabsContent value="shipping" className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Shipping Information</h3>
                <p className="text-muted-foreground mb-4">
                  All items are made to order and will ship within the production time specified on the product page.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">Standard Shipping:</span> 3-5 business days
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Express Shipping:</span> 1-2 business days (additional
                    fee)
                  </li>
                  <li>
                    <span className="font-medium text-foreground">International Shipping:</span> 7-14 business days
                  </li>
                </ul>
                <p className="mt-4 text-muted-foreground">
                  Tracking information will be provided via email once your order ships.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Returns & Refunds</h3>
                <p className="text-muted-foreground mb-4">
                  Due to the custom nature of our products, we cannot accept returns unless there is a defect in
                  materials or workmanship.
                </p>
                <p className="text-muted-foreground mb-4">
                  If you receive a defective item, please contact us within 7 days of receipt with photos of the issue.
                </p>
                <p className="text-muted-foreground">
                  For approved returns, we will provide a prepaid shipping label and issue a full refund or replacement
                  once the item is received.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Artisan Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Meet the Artisan</h2>
        <ArtisanCard artisan={design.artisan} />
      </section>

      {/* Related Designs */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <RelatedDesigns category={design.category} style={design.style} currentId={design.id} />
      </section>
    </div>
  )
}
