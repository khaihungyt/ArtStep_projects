"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Layers,
  ImageIcon,
  Type,
  Square,
  Circle,
  Triangle,
  Palette,
  Save,
  Download,
  Share2,
  Undo,
  Redo,
  Plus,
  Minus,
  RotateCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export default function CustomDesignTool() {
  const [activeTab, setActiveTab] = useState("shapes")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Design Canvas */}
      <div className="lg:col-span-3 bg-background border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon">
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm">100%</span>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="relative bg-white border border-dashed rounded-lg h-[500px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>Your design canvas</p>
            <p className="text-sm">Use the tools on the right to add elements to your design</p>
          </div>
        </div>
      </div>

      {/* Design Tools */}
      <div className="bg-background border rounded-lg overflow-hidden">
        <Tabs defaultValue="shapes" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="shapes" className="p-2">
              <Square className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger value="text" className="p-2">
              <Type className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger value="images" className="p-2">
              <ImageIcon className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger value="colors" className="p-2">
              <Palette className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger value="layers" className="p-2">
              <Layers className="h-5 w-5" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shapes" className="p-4 h-[500px] overflow-y-auto">
            <h3 className="font-medium mb-4">Shapes</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Square className="h-8 w-8" />, name: "Square" },
                { icon: <Circle className="h-8 w-8" />, name: "Circle" },
                { icon: <Triangle className="h-8 w-8" />, name: "Triangle" },
                { icon: <div className="h-8 w-8 border-2 rounded-md" />, name: "Rectangle" },
                { icon: <div className="h-8 w-8 border-2 rounded-full" />, name: "Oval" },
                {
                  icon: (
                    <div className="h-0 w-0 border-l-[16px] border-r-[16px] border-b-[24px] border-l-transparent border-r-transparent" />
                  ),
                  name: "Triangle Down",
                },
              ].map((shape, index) => (
                <Card key={index} className="cursor-pointer hover:border-primary">
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    {shape.icon}
                    <span className="mt-2 text-sm">{shape.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h3 className="font-medium mt-6 mb-4">Properties</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Size</Label>
                <div className="flex items-center space-x-2">
                  <Input type="number" placeholder="Width" className="w-20" />
                  <span>×</span>
                  <Input type="number" placeholder="Height" className="w-20" />
                  <Button variant="outline" size="icon">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Fill Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00"].map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-md cursor-pointer hover:ring-2 ring-primary ring-offset-2"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Border</Label>
                <div className="flex items-center space-x-2">
                  <Select defaultValue="1">
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="Width" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0px</SelectItem>
                      <SelectItem value="1">1px</SelectItem>
                      <SelectItem value="2">2px</SelectItem>
                      <SelectItem value="4">4px</SelectItem>
                    </SelectContent>
                  </Select>
                  <div
                    className="w-8 h-8 rounded-md cursor-pointer border hover:ring-2 ring-primary ring-offset-2"
                    style={{ backgroundColor: "#000000" }}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Opacity</Label>
                <Slider defaultValue={[100]} max={100} step={1} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="p-4 h-[500px] overflow-y-auto">
            <h3 className="font-medium mb-4">Add Text</h3>
            <Button className="w-full mb-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Text Layer
            </Button>

            <h3 className="font-medium mt-6 mb-4">Text Properties</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Font</Label>
                <Select defaultValue="inter">
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="opensans">Open Sans</SelectItem>
                    <SelectItem value="montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Size</Label>
                <Select defaultValue="16">
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12px</SelectItem>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="20">20px</SelectItem>
                    <SelectItem value="24">24px</SelectItem>
                    <SelectItem value="32">32px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Style</Label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="w-10">
                    B
                  </Button>
                  <Button variant="outline" size="sm" className="w-10">
                    I
                  </Button>
                  <Button variant="outline" size="sm" className="w-10">
                    U
                  </Button>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00"].map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-md cursor-pointer hover:ring-2 ring-primary ring-offset-2"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Alignment</Label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Left
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Center
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Right
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="images" className="p-4 h-[500px] overflow-y-auto">
            <h3 className="font-medium mb-4">Upload Image</h3>
            <div className="border-2 border-dashed rounded-lg p-8 text-center mb-6">
              <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop an image here or click to browse</p>
              <Button size="sm">Upload Image</Button>
            </div>

            <h3 className="font-medium mb-4">Stock Images</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="relative h-20 rounded-md overflow-hidden cursor-pointer hover:ring-2 ring-primary"
                >
                  <Image
                    src={`/placeholder.svg?height=80&width=120&text=Stock+${index + 1}`}
                    alt={`Stock image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full">
              Browse More Stock Images
            </Button>

            <h3 className="font-medium mt-6 mb-4">Image Properties</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Size</Label>
                <div className="flex items-center space-x-2">
                  <Input type="number" placeholder="Width" className="w-20" />
                  <span>×</span>
                  <Input type="number" placeholder="Height" className="w-20" />
                  <Button variant="outline" size="icon">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Filters</Label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="grayscale">Grayscale</SelectItem>
                    <SelectItem value="sepia">Sepia</SelectItem>
                    <SelectItem value="blur">Blur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Opacity</Label>
                <Slider defaultValue={[100]} max={100} step={1} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="p-4 h-[500px] overflow-y-auto">
            <h3 className="font-medium mb-4">Color Palette</h3>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                "#000000",
                "#ffffff",
                "#f8f9fa",
                "#e9ecef",
                "#dee2e6",
                "#ced4da",
                "#adb5bd",
                "#6c757d",
                "#495057",
                "#343a40",
                "#212529",
                "#ff0000",
                "#ff8000",
                "#ffff00",
                "#00ff00",
                "#00ffff",
                "#0000ff",
                "#8000ff",
                "#ff00ff",
                "#ff0080",
              ].map((color, index) => (
                <div
                  key={index}
                  className="w-12 h-12 rounded-md cursor-pointer hover:ring-2 ring-primary ring-offset-2"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <h3 className="font-medium mb-4">Custom Color</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Hex Code</Label>
                <Input defaultValue="#000000" />
              </div>

              <div>
                <Label className="mb-2 block">RGB</Label>
                <div className="flex items-center space-x-2">
                  <Input type="number" placeholder="R" className="w-16" min="0" max="255" />
                  <Input type="number" placeholder="G" className="w-16" min="0" max="255" />
                  <Input type="number" placeholder="B" className="w-16" min="0" max="255" />
                </div>
              </div>
            </div>

            <h3 className="font-medium mt-6 mb-4">Saved Colors</h3>
            <div className="flex flex-wrap gap-2">
              {["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"].map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-md cursor-pointer hover:ring-2 ring-primary ring-offset-2"
                  style={{ backgroundColor: color }}
                />
              ))}
              <Button variant="outline" size="icon" className="w-8 h-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="layers" className="p-4 h-[500px] overflow-y-auto">
            <h3 className="font-medium mb-4">Layers</h3>
            <div className="space-y-2">
              {[
                { name: "Text Layer 1", type: "text" },
                { name: "Image 1", type: "image" },
                { name: "Rectangle 1", type: "shape" },
                { name: "Circle 1", type: "shape" },
              ].map((layer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-md hover:bg-muted cursor-pointer"
                >
                  <div className="flex items-center">
                    {layer.type === "text" && <Type className="h-4 w-4 mr-2" />}
                    {layer.type === "image" && <ImageIcon className="h-4 w-4 mr-2" />}
                    {layer.type === "shape" && <Square className="h-4 w-4 mr-2" />}
                    <span>{layer.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-eye"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-trash-2"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Layer
              </Button>
              <Button variant="outline" size="sm">
                Reorder Layers
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
