import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import FeaturedDesigns from "@/components/featured-designs"
import CategorySection from "@/components/category-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 z-0">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=500&width=1200')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
        </div>
        <div className="container relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Bring Your Design Ideas to Life</h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Browse our collection or create your own custom designs and connect with skilled artisans to make them a
            reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Browse Designs
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
              Create Custom Design
            </Button>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-muted py-8">
        <div className="container px-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search designs, styles, materials..." className="pl-10 h-12 rounded-full" />
          </div>
        </div>
      </section>

      {/* Featured Designs */}
      <section className="py-12">
        <div className="container px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Designs</h2>
          <FeaturedDesigns />
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-muted/50">
        <div className="container px-4">
          <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CategorySection title="Style" items={["Sport", "Casual", "Luxury", "Vintage", "Minimalist"]} />
            <CategorySection title="Color" items={["Black", "White", "Red", "Blue", "Green", "Multi-color"]} />
            <CategorySection title="Material" items={["Leather", "Cotton", "Silk", "Wood", "Metal", "Ceramic"]} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                title: "Browse & Customize",
                description: "Find designs you love or create your own custom design with our online tools.",
              },
              {
                title: "Connect with Artisans",
                description: "Chat directly with skilled artisans to refine your design and get expert advice.",
              },
              {
                title: "Confirm & Pay",
                description: "Finalize your design, confirm your order, and pay securely through our platform.",
              },
              {
                title: "Track & Receive",
                description: "Track your order's progress and receive your unique, handcrafted item.",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="container px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Design Journey?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join our community of creators and artisans to bring your unique vision to life.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90">
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  )
}
