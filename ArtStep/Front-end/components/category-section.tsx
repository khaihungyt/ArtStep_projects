import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface CategorySectionProps {
  title: string
  items: string[]
}

export default function CategorySection({ title, items }: CategorySectionProps) {
  return (
    <div className="bg-background rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index}>
            <Link
              href={`/designs?${title.toLowerCase()}=${item.toLowerCase()}`}
              className="flex items-center justify-between text-muted-foreground hover:text-primary transition-colors py-1"
            >
              <span>{item}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </li>
        ))}
        <li className="pt-2 mt-2 border-t">
          <Link
            href={`/designs?category=${title.toLowerCase()}`}
            className="flex items-center justify-between text-primary hover:underline py-1"
          >
            <span>View all {title.toLowerCase()}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </li>
      </ul>
    </div>
  )
}
