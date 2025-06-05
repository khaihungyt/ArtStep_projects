import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Plus, Wallet, ArrowUpCircle } from "lucide-react"
import TransactionHistory from "@/components/transaction-history"

export default function WalletPage() {
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wallet</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Wallet Balance</CardTitle>
            <CardDescription>Your current balance and payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-4xl font-bold mb-2">$349.50</h2>
              <p className="text-muted-foreground">Available Balance</p>
            </div>

            <div className="space-y-4 mt-6">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Funds
              </Button>
              <Button variant="outline" className="w-full">
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Withdraw Funds
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <h3 className="font-medium mb-4">Payment Methods</h3>
            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">•••• 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 04/25</p>
                  </div>
                </div>
                <Badge variant="outline">Default</Badge>
              </div>
              <Button variant="ghost" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent transactions and payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="deposits">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <TransactionHistory type="all" />
              </TabsContent>
              <TabsContent value="deposits" className="mt-4">
                <TransactionHistory type="deposit" />
              </TabsContent>
              <TabsContent value="withdrawals" className="mt-4">
                <TransactionHistory type="withdrawal" />
              </TabsContent>
              <TabsContent value="payments" className="mt-4">
                <TransactionHistory type="payment" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add Funds Form */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Add Funds to Your Wallet</CardTitle>
          <CardDescription>Choose an amount and payment method to add funds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium mb-4">Amount</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {["$50", "$100", "$200", "$500"].map((amount, index) => (
                    <Button key={index} variant="outline" className={index === 0 ? "bg-primary/10" : ""}>
                      {amount}
                    </Button>
                  ))}
                  <Button variant="outline">Custom</Button>
                </div>

                <div className="pt-4">
                  <Label htmlFor="custom-amount">Custom Amount</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                    <Input id="custom-amount" className="pl-7" placeholder="0.00" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Payment Method</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">•••• 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 04/25</p>
                    </div>
                  </div>
                  <Badge variant="outline">Default</Badge>
                </div>

                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Use Different Payment Method
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button size="lg">Add Funds</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
