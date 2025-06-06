import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OrdersList from "@/components/orders-list"

export default function OrdersPage() {
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-4">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="all">All Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          <OrdersList status="active" />
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <OrdersList status="completed" />
        </TabsContent>
        <TabsContent value="cancelled" className="mt-6">
          <OrdersList status="cancelled" />
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          <OrdersList status="all" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
