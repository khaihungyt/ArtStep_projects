import { ArrowDownCircle, ArrowUpCircle, ShoppingCart, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TransactionHistoryProps {
  type: "all" | "deposit" | "withdrawal" | "payment"
}

export default function TransactionHistory({ type }: TransactionHistoryProps) {
  // Mock data for transactions
  const allTransactions = [
    {
      id: "TRX-12345",
      type: "deposit",
      amount: 200.0,
      date: "March 15, 2023",
      status: "completed",
      description: "Added funds via Credit Card •••• 4242",
      time: "10:30 AM",
    },
    {
      id: "TRX-12346",
      type: "payment",
      amount: -104.99,
      date: "March 15, 2023",
      status: "completed",
      description: "Payment for Custom Leather Wallet (Order #ORD-12345)",
      time: "11:45 AM",
    },
    {
      id: "TRX-12347",
      type: "withdrawal",
      amount: -50.0,
      date: "March 10, 2023",
      status: "completed",
      description: "Withdrawal to Bank Account •••• 5678",
      time: "3:20 PM",
    },
    {
      id: "TRX-12348",
      type: "deposit",
      amount: 100.0,
      date: "March 5, 2023",
      status: "completed",
      description: "Added funds via Credit Card •••• 4242",
      time: "9:15 AM",
    },
    {
      id: "TRX-12349",
      type: "payment",
      amount: -59.99,
      date: "March 1, 2023",
      status: "completed",
      description: "Payment for Personalized Ceramic Mug (Order #ORD-12346)",
      time: "2:30 PM",
    },
    {
      id: "TRX-12350",
      type: "withdrawal",
      amount: -100.0,
      date: "February 25, 2023",
      status: "pending",
      description: "Withdrawal to Bank Account •••• 5678",
      time: "4:45 PM",
    },
  ]

  // Filter transactions based on type
  const filteredTransactions = allTransactions.filter((transaction) => {
    if (type === "all") return true
    return transaction.type === type
  })

  // Helper function to get transaction icon
  const getTransactionIcon = (type: string, status: string) => {
    if (status === "pending") return <Clock className="h-5 w-5 text-yellow-500" />

    switch (type) {
      case "deposit":
        return <ArrowDownCircle className="h-5 w-5 text-green-500" />
      case "withdrawal":
        return <ArrowUpCircle className="h-5 w-5 text-red-500" />
      case "payment":
        return <ShoppingCart className="h-5 w-5 text-blue-500" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No transactions found</p>
        </div>
      ) : (
        filteredTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center">
              {getTransactionIcon(transaction.type, transaction.status)}
              <div className="ml-4">
                <p className="font-medium">{transaction.description}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{transaction.date}</span>
                  <span className="mx-1">•</span>
                  <span>{transaction.time}</span>
                  <span className="mx-1">•</span>
                  <span>ID: {transaction.id}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                {transaction.amount > 0 ? "+" : ""}
                {transaction.amount.toFixed(2)}
              </p>
              {getStatusBadge(transaction.status)}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
