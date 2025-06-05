"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingCart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary">
          ArtStep
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/designs" className="text-foreground hover:text-primary transition-colors">
            Browse Designs
          </Link>
          <Link href="/create" className="text-foreground hover:text-primary transition-colors">
            Create Design
          </Link>
          <Link href="/artisans" className="text-foreground hover:text-primary transition-colors">
            Find Artisans
          </Link>
          <Link href="/how-it-works" className="text-foreground hover:text-primary transition-colors">
            How It Works
          </Link>
        </nav>

        {/* User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href="/profile" className="w-full">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/orders" className="w-full">
                  My Orders
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/wallet" className="w-full">
                  Wallet
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/logout" className="w-full">
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
          </Button>

          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <div className="container mx-auto max-w-7xl px-4 py-4 flex flex-col space-y-4">
            <Link
              href="/designs"
              className="text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Designs
            </Link>
            <Link
              href="/create"
              className="text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Create Design
            </Link>
            <Link
              href="/artisans"
              className="text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Artisans
            </Link>
            <Link
              href="/how-it-works"
              className="text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <div className="pt-4 border-t flex items-center justify-between">
              <Button variant="outline" size="sm" className="w-[48%]">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
              </Button>
              <Link href="/login">
                <Button size="sm" className="w-[48%]">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
