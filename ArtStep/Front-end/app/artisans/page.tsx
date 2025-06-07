import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import ArtisansList from "@/components/artisans-list"

export default function ArtisansPage() {
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Artisans</h1>

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

            {/* Specialties Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Specialties</h3>
              <div className="space-y-2">
                {["Leather goods", "Woodworking", "Ceramics", "Jewelry", "Textiles", "Metal work"].map((specialty) => (
                  <div key={specialty} className="flex items-center space-x-2">
                    <Checkbox id={`specialty-${specialty.toLowerCase().replace(/\s+/g, "-")}`} />
                    <label
                      htmlFor={`specialty-${specialty.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {specialty}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Location Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Location</h3>
              <div className="space-y-4">
                <Select defaultValue="anywhere">
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anywhere">Anywhere</SelectItem>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="australia">Australia</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Checkbox id="local-only" />
                  <label
                    htmlFor="local-only"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Local artisans only
                  </label>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Rating Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox id={`rating-${rating}`} />
                    <label
                      htmlFor={`rating-${rating}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                    >
                      <span className="text-yellow-500 mr-1">
                        {"★".repeat(rating)}
                        {"☆".repeat(5 - rating)}
                      </span>
                      {rating}+ stars
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Experience Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Experience</h3>
              <div className="space-y-2">
                {["Beginner", "Intermediate", "Expert", "Master Craftsman"].map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox id={`experience-${level.toLowerCase()}`} />
                    <label
                      htmlFor={`experience-${level.toLowerCase()}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {level}
                    </label>
                  </div>
                ))}
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
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search artisans by name, specialty, or location..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="rating">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                  <SelectItem value="projects">Most Projects</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="md:hidden">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-muted-foreground mb-6">Showing 24 of 156 artisans</p>

          {/* Artisans List */}
          <ArtisansList />

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
