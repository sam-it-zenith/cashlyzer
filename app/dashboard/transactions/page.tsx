"use client";

import { useRequireAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { FilterX, Calendar, Search, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
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

const TransactionSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <Skeleton className="h-4 w-[100px]" />
      </div>
    ))}
  </div>
);

export default function TransactionsPage() {
  const { getAuthHeaders } = useRequireAuth();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") as "expense" | "income" | "all" || "all";
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCurrency, setUserCurrency] = useState("USD");
  
  // Filters
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const fetchTransactions = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      // Fetch both expenses and incomes
      const [expensesResponse, incomesResponse] = await Promise.all([
        fetch("https://api2.cashlyzer.com/api/expenses", {
          headers: { Authorization: headers.Authorization },
        }),
        fetch("https://api2.cashlyzer.com/api/incomes", {
          headers: { Authorization: headers.Authorization },
        }),
      ]);

      if (!expensesResponse.ok || !incomesResponse.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const expensesData = await expensesResponse.json();
      const incomesData = await incomesResponse.json();

      // Combine and format transactions
      const allTransactions = [
        ...(expensesData.expenses || []).map((expense: any) => ({
          ...expense,
          type: "expense" as const,
        })),
        ...(incomesData.incomes || []).map((income: any) => ({
          ...income,
          type: "income" as const,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTransactions(allTransactions);
      setFilteredTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const response = await fetch("https://api2.cashlyzer.com/api/profile", {
        headers: { Authorization: headers.Authorization }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setUserCurrency(data.data?.currency || "USD");
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.category?.toLowerCase().includes(query)) ||
          (t.source?.toLowerCase().includes(query)) ||
          (t.note?.toLowerCase().includes(query))
      );
    }

    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter(t => {
        const transactionDate = parseISO(t.date);
        
        if (startDate && endDate) {
          const start = parseISO(startDate);
          const end = parseISO(endDate);
          return transactionDate >= start && transactionDate <= end;
        } else if (startDate) {
          const start = parseISO(startDate);
          return transactionDate >= start;
        } else if (endDate) {
          const end = parseISO(endDate);
          return transactionDate <= end;
        }
        
        return true;
      });
    }

    // Sort transactions
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredTransactions(filtered);
  }, [transactions, selectedType, searchQuery, startDate, endDate, sortOrder]);

  const handleFilterReset = () => {
    setSelectedType("all");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setSortOrder("desc");
  };

  const handleDeleteTransaction = async (id: string, type: "expense" | "income") => {
    try {
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const endpoint = type === "expense" ? "expenses" : "incomes";
      const response = await fetch(`https://api2.cashlyzer.com/api/${endpoint}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: headers.Authorization,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to delete ${type}`);
      }

      toast.success(`${type === "expense" ? "Expense" : "Income"} deleted successfully`);
      fetchTransactions(); // Refresh the list
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to delete ${type}`);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 sm:space-y-8 p-3 sm:p-4 md:p-6 lg:p-8"
    >
      <motion.div variants={item}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {selectedType === "all" 
            ? "All Transactions" 
            : selectedType === "expense" 
              ? "All Expenses" 
              : "All Income"}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          View and manage all your financial transactions
        </p>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Transaction Filters</CardTitle>
            <CardDescription>
              Filter and sort your transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium">Sort Order</label>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="w-full"
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortOrder === "asc" ? "Oldest First" : "Newest First"}
                </Button>
              </div>
            </div>
            
            {(selectedType !== "all" || startDate || endDate || searchQuery) && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
                <p className="text-sm text-muted-foreground">Active filters:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedType !== "all" && (
                    <Badge variant="outline">
                      Type: {selectedType === "expense" ? "Expenses" : "Income"}
                    </Badge>
                  )}
                  {startDate && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      From: {format(parseISO(startDate), "MMM dd, yyyy")}
                    </Badge>
                  )}
                  {endDate && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      To: {format(parseISO(endDate), "MMM dd, yyyy")}
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="outline">
                      Search: "{searchQuery}"
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleFilterReset} className="h-7 px-2">
                    <FilterX className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        {loading ? (
          <TransactionSkeleton />
        ) : (
          <RecentTransactions 
            transactions={filteredTransactions}
            onDelete={handleDeleteTransaction}
            showAll={true}
            type={selectedType as "expense" | "income" | "all"}
            currencySymbol={getCurrencySymbol(userCurrency)}
          />
        )}
      </motion.div>
    </motion.div>
  );
} 