"use client";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  MoreHorizontal, 
  Tag, 
  Trash 
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCurrencySymbol } from "@/lib/constants/currencies";

interface Transaction {
  id: string;
  type: "expense" | "income";
  amount: number;
  category?: string;
  source?: string;
  date: string;
  note?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  onDelete: (id: string, type: "expense" | "income") => Promise<void>;
  showAll?: boolean;
  type?: "expense" | "income" | "all";
  currencySymbol?: string;
}

export function RecentTransactions({ 
  transactions,
  onDelete, 
  showAll = false,
  type = "all",
  currencySymbol = "$"
}: RecentTransactionsProps) {
  const [visibleTransactions, setVisibleTransactions] = useState<Transaction[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    if (showAll) {
      setVisibleTransactions(transactions);
    } else {
      // For recent transactions, show only the latest 5
      setVisibleTransactions(transactions.slice(0, 5));
    }
  }, [transactions, showAll]);
  
  const handleDelete = async (id: string, type: "expense" | "income") => {
    try {
      // Optimistic UI update
      setVisibleTransactions(prev => prev.filter(t => t.id !== id));
      
      // Call the parent handler to perform the actual deletion
      await onDelete(id, type);
      
      toast.success(`${type === "expense" ? "Expense" : "Income"} deleted successfully`);
    } catch (error) {
      // Restore the deleted item if the API call fails
      setVisibleTransactions(transactions);
      toast.error("Failed to delete transaction");
    }
  };

  const getSeeMoreDestination = () => {
    if (showAll) {
      // If we're already on the transactions page, filter by type
      return `/dashboard/transactions?type=${type}`;
    }
    // If we're on the dashboard, go to the transactions page
    return `/dashboard/transactions${type !== "all" ? `?type=${type}` : ""}`;
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>
              {showAll 
                ? (type === "all" 
                    ? "All Transactions" 
                    : type === "expense" 
                      ? "All Expenses" 
                      : "All Income")
                : (type === "all" 
                    ? "Recent Transactions" 
                    : type === "expense" 
                      ? "Recent Expenses" 
                      : "Recent Income")}
            </CardTitle>
            <CardDescription className="my-2">
              {showAll 
                ? "View and manage all your financial activities" 
                : "Your latest financial activities"}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push(getSeeMoreDestination())}
            className="w-full sm:w-auto"
          >
            See More
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <motion.div 
          className="space-y-3 sm:space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {visibleTransactions.length > 0 ? (
              visibleTransactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  variants={item}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`rounded-full p-2 ${
                      transaction.type === "expense" 
                        ? "bg-red-100 dark:bg-red-900/20" 
                        : "bg-green-100 dark:bg-green-900/20"
                    }`}>
                      {transaction.type === "expense" ? (
                        <ArrowDownCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {transaction.type === "expense" 
                          ? transaction.category 
                          : transaction.source}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </p>
                      {transaction.note && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {transaction.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    {transaction.type === "expense" && transaction.category && (
                      <Badge variant="outline" className="hidden sm:flex">
                        <Tag className="h-3 w-3 mr-1" />
                        {transaction.category}
                      </Badge>
                    )}
                    <span className={`text-sm font-medium ${
                      transaction.type === "expense" 
                        ? "text-red-500" 
                        : "text-green-500"
                    }`}>
                      {transaction.type === "expense" ? "-" : "+"}
                      {currencySymbol}{transaction.amount.toFixed(2)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(transaction.id, transaction.type)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No transactions found
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  );
}