"use client";

import { useRequireAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IncomeForm } from "@/components/income/income-form";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { toast } from "sonner";
import { Plus, FilterX, Calendar, BarChart3, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { getCurrencySymbol } from "@/lib/constants/currencies";

interface Income {
  id: string;
  amount: number;
  source: string;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  type: "income";
}

export default function IncomePage() {
  const { getAuthHeaders } = useRequireAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [filteredIncomes, setFilteredIncomes] = useState<Income[]>([]);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [userCurrency, setUserCurrency] = useState("USD");
  
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

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const response = await fetch("https://api.cashlyzer.com/api/incomes", {
        headers: { Authorization: headers.Authorization },
      });
        
      if (!response.ok) {
        throw new Error("Failed to fetch incomes");
      }
        
      const data = await response.json();
      setIncomes(data.incomes || []);
      setFilteredIncomes(data.incomes || []);
    } catch (error) {
      console.error("Error fetching incomes:", error);
      toast.error("Failed to load incomes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    let filtered = [...incomes];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (income) =>
          income.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (income.note && income.note.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply date range filter
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((income) => {
        const incomeDate = parseISO(income.date);
        return (
          isAfter(incomeDate, dateRange.from!) &&
          isBefore(incomeDate, dateRange.to!)
        );
      });
    }

    setFilteredIncomes(filtered);
  }, [searchQuery, dateRange, incomes]);

  const handleDelete = async (id: string) => {
    try {
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const response = await fetch(`https://api.cashlyzer.com/api/incomes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: headers.Authorization,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete income");
      }

      toast.success("Income deleted successfully");
      
      // Filter out the deleted income
      setIncomes(prev => prev.filter(income => income.id !== id));
      setFilteredIncomes(prev => prev.filter(income => income.id !== id));
    } catch (error) {
      console.error("Error deleting income:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete income");
    }
  };

  const handleRefreshIncomes = () => {
    fetchIncomes();
  };

  const totalFilteredIncomes = filteredIncomes.reduce(
    (total, income) => total + income.amount,
    0
  );

  // Prepare data for source breakdown chart
  const sourceBreakdown = filteredIncomes.reduce((acc: any, income) => {
    const source = income.source;
    if (!acc[source]) {
      acc[source] = 0;
    }
    acc[source] += income.amount;
    return acc;
  }, {});
  
  const sourceChartData = Object.entries(sourceBreakdown).map(([source, amount]) => ({
    source,
    amount,
  })).sort((a, b) => (b.amount as number) - (a.amount as number));
  
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
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold tracking-tight">Income</h1>
          <p className="text-muted-foreground">
            Track and manage your income sources
          </p>
        </motion.div>
        <motion.div variants={item}>
          <Button
            onClick={() => setIsAddIncomeOpen(true)}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Income
          </Button>
        </motion.div>
      </div>
      
      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Current Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getCurrencySymbol(userCurrency)}{incomes
                .filter(income => {
                  const now = new Date();
                  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                  return new Date(income.date) >= firstDayOfMonth;
                })
                .reduce((total, income) => total + income.amount, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total income this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Previous Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getCurrencySymbol(userCurrency)}{incomes
                .filter(income => {
                  const now = new Date();
                  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                  const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                  return new Date(income.date) >= firstDayOfLastMonth && new Date(income.date) < firstDayOfCurrentMonth;
                })
                .reduce((total, income) => total + income.amount, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total income last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Filtered Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getCurrencySymbol(userCurrency)}{totalFilteredIncomes.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredIncomes.length} income source{filteredIncomes.length !== 1 ? 's' : ''} shown
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              All Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getCurrencySymbol(userCurrency)}{incomes.reduce((total, income) => total + income.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {incomes.length} total income source{incomes.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={item} className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Income by Source</CardTitle>
                <CardDescription>
                  Breakdown of your income sources
                </CardDescription>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sourceChartData}
                    margin={{
                      top: 20,
                      right: 10,
                      left: 65,
                      bottom: 70,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      dataKey="source" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      tick={{fontSize: 12}}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${getCurrencySymbol(userCurrency)}${value.toFixed(2)}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`${getCurrencySymbol(userCurrency)}${(value as number).toFixed(2)}`, "Amount"]}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="hsl(var(--chart-2))" 
                      radius={[4, 4, 0, 0]} 
                      name="Amount" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Income Sources</CardTitle>
              <CardDescription>
                Summary of your income sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sourceChartData.length > 0 ? (
                  sourceChartData.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-chart-${(index % 5) + 1}`} />
                        <span className="text-sm">{source.source}</span>
                      </div>
                      <span className="text-sm font-medium">{getCurrencySymbol(userCurrency)}{(source.amount as number).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">No data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
      
      <motion.div variants={item}>
        <RecentTransactions 
          transactions={filteredIncomes} 
          onDelete={handleDelete}
          currencySymbol={getCurrencySymbol(userCurrency)}
        />
      </motion.div>
      
      <IncomeForm 
        open={isAddIncomeOpen}
        onOpenChange={setIsAddIncomeOpen}
        onSuccess={handleRefreshIncomes}
        currencySymbol={getCurrencySymbol(userCurrency)}
      />
    </motion.div>
  );
}