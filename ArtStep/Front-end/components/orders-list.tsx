import Image from "next/image"
import Link from "next/link"
import { MessageCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface OrdersListProps {
  status: "active" | "completed" | "cancelled" | "all"
}

export default function OrdersList({ status }: OrdersListProps) {
  // Mock data for orders
  const allOrders = [
    {
      id: "ORD-12345",
      design: {
        title: "Custom Leather Wallet",
        image: "/placeholder.svg?height=100&width=100&text=Wallet",
      },
      artisan: {
        name: "Maria Lopez",
        avatar: "/placeholder.svg?height=50&width=50&text=ML",
      },
      date: "March 15, 2023",
      price: 104.99,
      status: "in_production",
      progress: 60,
      estimatedDelivery: "April 2, 2023",
    },
    {
      id: "ORD-12346",
      design: {
        title: "Personalized Ceramic Mug",
        image: "/placeholder.svg?height=100&width=100&text=Mug",
      },
      artisan: {
        name: "James Thompson",
        avatar: "/placeholder.svg?height=50&width=50&text=JT",
      },
      date: "March 10, 2023",
      price: 59.99,
      status: "shipped",
      progress: 80,
      estimatedDelivery: "March 25, 2023",
    },
    {
      id: "ORD-12347",
      design: {
        title: "Custom Wooden Sign",
        image: "/placeholder.svg?height=100&width=100&text=Sign",
      },
      artisan: {
        name: "Thomas Wilson",
        avatar: "/placeholder.svg?height=50&width=50&text=TW",
      },
      date: "February 28, 2023",
      price: 149.99,
      status: "delivered",
      progress: 100,
      estimatedDelivery: "March 20, 2023",
    },
    {
      id: "ORD-12348",
      design: {
        title: "Personalized T-Shirt",
        image: "/placeholder.svg?height=100&width=100&text=Shirt",
      },
      artisan: {
        name: "Sarah Parker",
        avatar: "/placeholder.svg?height=50&width=50&text=SP",
      },
      date: "March 5, 2023",
      price: 39.99,
      status: "cancelled",
      progress: 0,
      estimatedDelivery: "N/A",
    },
  ]

  // Filter orders based on status
  const filteredOrders = allOrders.filter((order) => {
    if (status === "all") return true
    if (status === "active") return ["in_production", "shipped"].includes(order.status)
    if (status === "completed") return order.status === "delivered"
    if (status === "cancelled") return order.status === "cancelled"
    return true
  })

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_production":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            In Production
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Shipped
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Delivered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-center md:items-start">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden">
                    <Image
                      src={order.design.image || "/placeholder.svg"}
                      alt={order.design.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold">{order.design.title}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Order #{order.id} • Placed on {order.date}
                      </p>
                    </div>
                    <p className="font-bold text-lg mt-2 md:mt-0">${order.price}</p>
                  </div>

                  <div className="flex items-center mb-4">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2">
                      <Image
                        src={order.artisan.avatar || "/placeholder.svg"}
                        alt={order.artisan.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm">Crafted by {order.artisan.name}</span>
                  </div>

                  {order.status !== "cancelled" && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Order Progress</span>
                        <span>{order.progress}%</span>
                      </div>
                      <Progress value={order.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Order Placed</span>
                        <span>In Production</span>
                        <span>Shipped</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="text-sm mb-3 sm:mb-0">
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <p>
                          Estimated Delivery: <span className="font-medium">{order.estimatedDelivery}</span>
                        </p>
                      )}
                      {order.status === "delivered" && (
                        <p>
                          Delivered on: <span className="font-medium">{order.estimatedDelivery}</span>
                        </p>
                      )}
                      {order.status === "cancelled" && <p className="text-red-500">This order was cancelled</p>}
                    </div>
                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact Artisan
                      </Button>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
