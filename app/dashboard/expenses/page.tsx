"use client";

import { useRequireAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
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
import { format, subMonths, isAfter, isBefore, parseISO } from "date-fns";
import { toast } from "sonner";
import { Plus, FilterX, Calendar, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { getCurrencySymbol } from "@/lib/constants/currencies";

interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

interface Expense {
  id: string;
  amount: number;
  category: {
    id: string;
    name: string;
  };
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  type: "expense";
}

export default function ExpensesPage() {
  const { getAuthHeaders } = useRequireAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userCurrency, setUserCurrency] = useState("USD");
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const fetchExpenses = async () => {
      try {
      setLoading(true);
        const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const response = await fetch("https://api.cashlyzer.com/api/expenses", {
        headers: {
          Authorization: headers.Authorization,
        },
        });
        
      if (!response.ok) {
          throw new Error("Failed to fetch expenses");
        }
        
      const responseData = await response.json();
    
      
      // Extract expenses from the response
      const expensesData = responseData.expenses || [];
        
      // Ensure expensesData is an array and has the correct structure
      if (!Array.isArray(expensesData)) {
        console.error("Invalid expenses data structure:", expensesData);
        setExpenses([]);
        setFilteredExpenses([]);
        return;
      }

      // Sort expenses by date (newest first) and add type field
      const sortedExpenses = [...expensesData]
        .map(expense => ({ ...expense, type: "expense" as const }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setExpenses(sortedExpenses);
      setFilteredExpenses(sortedExpenses);
      } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to fetch expenses");
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

      const response = await fetch("https://api.cashlyzer.com/api/profile", {
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
    fetchExpenses();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    let filtered = expenses;

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (expense) =>
          (expense.category?.name?.toLowerCase() || "").includes(query) ||
          (expense.note && expense.note.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(expense => expense.category?.name === selectedCategory);
    }

    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = parseISO(expense.date);
        
        if (startDate && endDate) {
          const start = parseISO(startDate);
          const end = parseISO(endDate);
          return isAfter(expenseDate, start) && isBefore(expenseDate, end);
        } else if (startDate) {
          const start = parseISO(startDate);
          return isAfter(expenseDate, start);
        } else if (endDate) {
          const end = parseISO(endDate);
          return isBefore(expenseDate, end);
        }
        
        return true;
      });
    }

    setFilteredExpenses(filtered);
  }, [expenses, searchQuery, selectedCategory, startDate, endDate]);
  
  const handleRefreshExpenses = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }
      
      const response = await fetch("https://api.cashlyzer.com/api/expenses", {
        headers: {
          Authorization: headers.Authorization,
          "Content-Type": "application/json",
        } as HeadersInit,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch expenses");
      }
      
      const responseData = await response.json();
      
      // Extract expenses from the response
      const expensesData = responseData.expenses || [];
      
      // Ensure expensesData is an array
      const expensesArray = Array.isArray(expensesData) ? expensesData : [];
      
      setExpenses(expensesArray.map((expense: any) => ({
        ...expense,
        type: "expense",
      })));
    } catch (error) {
      console.error("Error refreshing expenses:", error);
      toast.error(error instanceof Error ? error.message : "Failed to refresh expenses");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteExpense = async (id: string, type: "expense" | "income") => {
    if (type !== "expense") return;
    
    try {
      const headers = getAuthHeaders();
      if (!headers || !headers.Authorization) {
        throw new Error("No auth headers available");
      }
      
      const response = await fetch(`https://api.cashlyzer.com/api/expenses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: headers.Authorization,
          "Content-Type": "application/json",
        } as HeadersInit,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete expense");
      }
      
      // Filter out the deleted expense
      setExpenses(prev => prev.filter(e => e.id !== id));
      
      toast.success("Expense deleted successfully");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete expense");
      throw error; // Re-throw to be caught by the component
    }
  };
  
  const handleFilterReset = () => {
    setSelectedCategory("");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };
  
  // Calculate total filtered expenses
  const totalFilteredExpenses = filteredExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );
  
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

  // Convert expenses to transactions format
  const expensesAsTransactions = filteredExpenses.map(expense => ({
    id: expense.id,
    type: "expense" as const,
    amount: expense.amount,
    category: expense.category.name,
    date: expense.date,
    note: expense.note
  }));

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 sm:space-y-8 p-3 sm:p-4 md:p-6 lg:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div variants={item}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track and manage your spending
          </p>
        </motion.div>
        <motion.div variants={item}>
          <Button onClick={() => setIsAddExpenseOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </motion.div>
      </div>
      
      <motion.div variants={item} className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm font-medium">
              Current Month
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">
              {getCurrencySymbol(userCurrency)}{expenses
                .filter(expense => {
                  const now = new Date();
                  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                  return new Date(expense.date) >= firstDayOfMonth;
                })
                .reduce((total, expense) => total + expense.amount, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total spending this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm font-medium">
              Previous Month
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">
              {getCurrencySymbol(userCurrency)}{expenses
                .filter(expense => {
                  const now = new Date();
                  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                  const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                  return new Date(expense.date) >= firstDayOfLastMonth && new Date(expense.date) < firstDayOfCurrentMonth;
                })
                .reduce((total, expense) => total + expense.amount, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total spending last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm font-medium">
              Filtered Total
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">
              {getCurrencySymbol(userCurrency)}{totalFilteredExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} shown
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm font-medium">
              All Time
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">
              {getCurrencySymbol(userCurrency)}{expenses.reduce((total, expense) => total + expense.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.length} total expense{expenses.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={item}>
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Expense Filters</CardTitle>
            <CardDescription>
              Filter your expenses by category, date range, or search for specific notes
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Search Notes
                </label>
                <Input
                  type="text"
                  placeholder="Search by note..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {(selectedCategory || startDate || endDate || searchQuery) && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
                <p className="text-sm text-muted-foreground">Active filters:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Category: {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
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
                    <Badge variant="outline" className="flex items-center gap-1">
                      Note: "{searchQuery}"
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
        <RecentTransactions 
          transactions={expensesAsTransactions} 
          onDelete={handleDeleteExpense}
          showAll={true}
          type="expense"
          currencySymbol={getCurrencySymbol(userCurrency)}
        />
      </motion.div>
      
      <ExpenseForm 
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        onSuccess={handleRefreshExpenses}
      />
    </motion.div>
  );
}