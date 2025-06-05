"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Send, Paperclip, ImageIcon, ChevronLeft, MoreVertical, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function ChatPage({ params }: { params: { id: string } }) {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data for the chat
  const artisan = {
    id: params.id,
    name: "Maria Lopez",
    avatar: "/placeholder.svg?height=100&width=100&text=ML",
    status: "online",
    lastSeen: "Active now",
  }

  const design = {
    id: "design-1",
    title: "Custom Leather Wallet",
    image: "/placeholder.svg?height=200&width=300&text=Design",
    price: 89.99,
  }

  const messages = [
    {
      id: 1,
      sender: "artisan",
      text: "Hello! Thank you for your interest in my custom leather wallet design. How can I help you today?",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "user",
      text: "Hi Maria! I really like your wallet design, but I was wondering if it's possible to add more card slots?",
      time: "10:32 AM",
    },
    {
      id: 3,
      sender: "artisan",
      text: "I can customize the wallet to include additional card slots. The standard design has 6 slots, but I can add up to 10 slots depending on your needs. Would you like to see some examples of different configurations?",
      time: "10:35 AM",
    },
    {
      id: 4,
      sender: "user",
      text: "That would be great! I'd like to see what 8 card slots would look like. Also, is it possible to add a small coin pocket?",
      time: "10:38 AM",
    },
    {
      id: 5,
      sender: "artisan",
      text: "Here are some examples of the 8-slot configuration:",
      time: "10:40 AM",
      images: [
        "/placeholder.svg?height=200&width=300&text=Example+1",
        "/placeholder.svg?height=200&width=300&text=Example+2",
      ],
    },
    {
      id: 6,
      sender: "artisan",
      text: "And yes, I can definitely add a coin pocket! It would be placed either on the side or as a zippered compartment in the center, depending on your preference. The additional customizations would bring the total price to $104.99. Would you like to proceed with these modifications?",
      time: "10:42 AM",
    },
  ]

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, you would send the message to the server
      console.log("Sending message:", message)
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <header className="bg-background border-b p-4">
        <div className="container px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/messages" className="mr-4">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center">
              <div className="relative mr-3">
                <Image
                  src={artisan.avatar || "/placeholder.svg"}
                  alt={artisan.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
              </div>
              <div>
                <h2 className="font-semibold">{artisan.name}</h2>
                <p className="text-xs text-muted-foreground">{artisan.lastSeen}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Block Artisan</DropdownMenuItem>
                <DropdownMenuItem>Report Issue</DropdownMenuItem>
                <DropdownMenuItem>Clear Chat History</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Design Info */}
      <div className="bg-muted/30 p-4 border-b">
        <div className="container px-4">
          <div className="flex items-center">
            <div className="relative w-12 h-12 rounded overflow-hidden mr-3">
              <Image src={design.image || "/placeholder.svg"} alt={design.title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{design.title}</h3>
                <Badge variant="outline">${design.price}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Discussing customizations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
        <div className="container px-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] md:max-w-[70%] rounded-lg p-3 ${
                  msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p>{msg.text}</p>
                {msg.images && (
                  <div className="mt-2 flex gap-2">
                    {msg.images.map((img, index) => (
                      <div key={index} className="relative h-32 w-40 rounded overflow-hidden">
                        <Image
                          src={img || "/placeholder.svg"}
                          alt={`Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs mt-1 opacity-70 text-right">{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-background border-t p-4">
        <div className="container px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ImageIcon className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="pr-10"
              />
            </div>
            <Button onClick={handleSendMessage} disabled={!message.trim()} size="icon">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
