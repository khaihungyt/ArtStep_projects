import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import DesignGrid from "@/components/design-grid"

export default function DesignsPage() {
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">List designs</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-background rounded-lg border p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Filters</h2>
              <Button variant="ghost" size="sm">
                Reset
              </Button>
            </div>

            <Separator className="my-4" />

            {/* Style Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Style</h3>
              <div className="space-y-2">
                {["Sport", "Casual", "Luxury", "Vintage", "Minimalist"].map((style) => (
                  <div key={style} className="flex items-center space-x-2">
                    <Checkbox id={`style-${style.toLowerCase()}`} />
                    <label
                      htmlFor={`style-${style.toLowerCase()}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {style}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Color Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Color</h3>
              <div className="grid grid-cols-4 gap-2">
                {["Black", "White", "Red", "Blue", "Green", "Yellow", "Purple", "Brown"].map((color) => (
                  <div
                    key={color}
                    className="w-8 h-8 rounded-full border cursor-pointer hover:ring-2 ring-primary ring-offset-2"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Material Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Material</h3>
              <div className="space-y-2">
                {["Leather", "Cotton", "Silk", "Wood", "Metal", "Ceramic"].map((material) => (
                  <div key={material} className="flex items-center space-x-2">
                    <Checkbox id={`material-${material.toLowerCase()}`} />
                    <label
                      htmlFor={`material-${material.toLowerCase()}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {material}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Price Range</h3>
              <Slider defaultValue={[0, 500]} min={0} max={1000} step={10} />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm">$0</span>
                <span className="text-sm">$1000+</span>
              </div>
            </div>

            <Button className="w-full">Apply Filters</Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input placeholder="Search designs..." className="w-full" />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="featured">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="md:hidden">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-muted-foreground mb-6">Showing 24 of 156 designs</p>

          {/* Design Grid */}
          <DesignGrid />

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <span>...</span>
              <Button variant="outline" size="sm">
                10
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
