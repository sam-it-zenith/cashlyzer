"use client";

import { useRequireAuth } from "@/lib/auth";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SummaryChart } from "@/components/dashboard/summary-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { BadgeDollarSign, Wallet, PiggyBank, TrendingUp, Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrencySymbol } from "@/lib/constants/currencies";
import DashboardTour from "@/components/dashboard/dashboard-tour";
import { Mail, Plus } from "lucide-react";
import Link from "next/link";


interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  monthlyBudget: number;
  budgetUtilization: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentBalance: number;
  expenseTrend: any[];
  incomeTrend: any[];
  categoryBreakdown: Array<{
    name: string;
    amount: number;
  }>;
  topCategories: Array<{
    name: string;
    amount: number;
  }>;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: "income" | "expense";
  category: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface AIInsight {
  type: string;
  message: string;
  timestamp: string;
}

interface Prediction {
  type: string;
  message: string;
}

interface TopCategory {
  category: string;
  amount: number;
}

interface AIInsights {
  insights: AIInsight[];
  summary: {
    total_spent: number;
    total_income: number;
    average_transaction: number;
    budget_status: string;
    top_categories: TopCategory[];
  };
  predictions: Prediction[];
  metadata: {
    totalTransactions: number;
    lastUpdated: string;
    analysisPeriod: string;
  };
}

interface CategoryTotal {
  name: string;
  amount: number;
}

interface TrendData {
  month: string;
  amount: number;
}

export default function DashboardPage() {
  const { getAuthHeaders } = useRequireAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [aiInsightsLoading, setAIInsightsLoading] = useState(true);
  const [aiInsights, setAIInsights] = useState<AIInsights | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [userCurrency, setUserCurrency] = useState("USD");

  const fetchAIInsights = async () => {
      try {
      setAIInsightsLoading(true);
        const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const response = await fetch("https://api.cashlyzer.com/api/ai/insights", {
        headers: { Authorization: headers.Authorization },
        });
        
      if (!response.ok) {
        throw new Error("Failed to fetch AI insights");
        }
        
      const data = await response.json();
      setAIInsights(data);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      toast.error("Failed to load AI insights");
    } finally {
      setAIInsightsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }
        
      // Fetch expenses
      const expensesResponse = await fetch("https://api.cashlyzer.com/api/expenses", {
        headers: { Authorization: headers.Authorization },
        });
        
      if (!expensesResponse.ok) {
        throw new Error("Failed to fetch expenses");
      }
        
      const expensesData = await expensesResponse.json();
      const expensesArray = expensesData.expenses || [];

      // Fetch incomes
      const incomesResponse = await fetch("https://api.cashlyzer.com/api/incomes", {
        headers: { Authorization: headers.Authorization },
        });
        
      if (!incomesResponse.ok) {
        throw new Error("Failed to fetch incomes");
      }

      const incomesData = await incomesResponse.json();
      const incomesArray = incomesData.incomes || [];

      // Fetch budget
      const budgetResponse = await fetch("https://api.cashlyzer.com/api/budget", {
        headers: { Authorization: headers.Authorization },
      });
        
      if (!budgetResponse.ok && budgetResponse.status !== 404) {
        throw new Error("Failed to fetch budget");
      }

      const budgetData = await budgetResponse.json();
      const monthlyBudget = typeof budgetData === 'object' ? budgetData.monthlyBudget : budgetData;

      // Get current month's start and end dates
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Calculate monthly expenses
      const monthlyExpenses = expensesArray
        .filter((expense: { date: string; amount: number }) => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= firstDayOfMonth && expenseDate <= lastDayOfMonth;
        })
        .reduce((total: number, expense: { amount: number }) => total + expense.amount, 0);

      // Calculate monthly income
      const monthlyIncome = incomesArray
        .filter((income: { date: string; amount: number }) => {
          const incomeDate = new Date(income.date);
          return incomeDate >= firstDayOfMonth && incomeDate <= lastDayOfMonth;
        })
        .reduce((total: number, income: { amount: number }) => total + income.amount, 0);

      // Calculate current balance
      const currentBalance = monthlyIncome - monthlyExpenses;

      // Calculate budget utilization
      const budgetUtilization = monthlyBudget > 0
        ? Math.min((monthlyExpenses / monthlyBudget) * 100, 100)
        : 0;

      // Calculate top spending categories for current month
      const categoryTotals = expensesArray
        .filter((expense: { date: string; amount: number; category: string }) => 
          new Date(expense.date) >= firstDayOfMonth
        )
        .reduce((acc: { [key: string]: number }, expense: { category: string; amount: number }) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
          return acc;
        }, {});

      const topCategories: CategoryTotal[] = Object.entries(categoryTotals)
        .map(([name, amount]): CategoryTotal => ({ name, amount: Number(amount) }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
        
      // Calculate category breakdown for pie chart
      const categoryBreakdown: CategoryTotal[] = Object.entries(categoryTotals)
        .map(([name, amount]): CategoryTotal => ({ name, amount: Number(amount) }));

      // Calculate expense trend (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const expenseTrend = Array.from({ length: 6 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        const monthExpenses = expensesArray
          .filter((expense: { date: string; amount: number }) => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= monthStart && expenseDate <= monthEnd;
          })
          .reduce((total: number, expense: { amount: number }) => total + expense.amount, 0);

        return {
          month: month.toLocaleString('default', { month: 'short' }),
          amount: monthExpenses,
        };
      }).reverse();
        
      // Calculate income trend (last 6 months)
      const incomeTrend = Array.from({ length: 6 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        const monthIncome = incomesArray
          .filter((income: { date: string; amount: number }) => {
            const incomeDate = new Date(income.date);
            return incomeDate >= monthStart && incomeDate <= monthEnd;
          })
          .reduce((total: number, income: { amount: number }) => total + income.amount, 0);

        return {
          month: month.toLocaleString('default', { month: 'short' }),
          amount: monthIncome,
        };
      }).reverse();
      
      // Update summary with calculated data
      const updatedSummary: DashboardSummary = {
        totalIncome: incomesArray.reduce((total: number, income: { amount: number }) => total + income.amount, 0),
        totalExpenses: expensesArray.reduce((total: number, expense: { amount: number }) => total + expense.amount, 0),
        savings: monthlyIncome - monthlyExpenses,
        savingsRate: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0,
        monthlyBudget,
        budgetUtilization,
        monthlyExpenses,
        monthlyIncome,
        currentBalance,
        topCategories,
        categoryBreakdown,
        expenseTrend,
        incomeTrend,
      };
      
      setSummary(updatedSummary);
      
      const allTransactions = [
        ...expensesArray.map((expense: any) => ({
            ...expense,
          type: "expense" as const,
          })),
        ...incomesArray.map((income: any) => ({
            ...income,
          type: "income" as const,
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
         .slice(0, 5);
        
      setRecentTransactions(allTransactions);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
  };
    
  useEffect(() => {
    fetchDashboardData();
    fetchAIInsights();
    fetchUserProfile();
  }, []);

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const handleDeleteTransaction = async (id: string, type: "expense" | "income") => {
    try {
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const endpoint = type === "expense" ? "expenses" : "incomes";
      const response = await fetch(`https://api.cashlyzer.com/api/${endpoint}/${id}`, {
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
      
      // Filter out the deleted transaction
      setRecentTransactions(prev => prev.filter(t => t.id !== id));
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to delete ${type}`);
    }
  };
  
  // Transform category data for pie chart
  const categoryData = summary?.categoryBreakdown 
    ? summary.categoryBreakdown.map((cat) => ({
        name: cat.name,
        value: cat.amount
      }))
    : [];

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
    <div className="min-h-screen bg-background">
      <DashboardTour />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4 md:space-y-6 lg:space-y-8 p-4 md:p-6 lg:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div variants={item} id="dashboard-welcome">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Overview of your financial status
            </p>
          </motion.div>
        </div>
      
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" id="total-balance">
          <StatsCard
            title="Monthly Income"
            value={`${getCurrencySymbol(userCurrency)}${summary?.monthlyIncome?.toFixed(2) || '0.00'}`}
            description="Total income this month"
            icon={Wallet}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Monthly Expenses"
            value={`${getCurrencySymbol(userCurrency)}${summary?.monthlyExpenses?.toFixed(2) || '0.00'}`}
            description="Total expenses this month"
            icon={BadgeDollarSign}
            iconColor="text-red-500"
          />
          <StatsCard
            title="Current Balance"
            value={`${getCurrencySymbol(userCurrency)}${summary?.currentBalance?.toFixed(2) || '0.00'}`}
            description="Available to spend"
            icon={PiggyBank}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Budget Utilization"
            value={`${summary?.budgetUtilization?.toFixed(0) || '0'}%`}
            description={`of ${getCurrencySymbol(userCurrency)}${summary?.monthlyBudget?.toFixed(2) || '0.00'} budget`}
            icon={TrendingUp}
            iconColor="text-orange-500"
          />
        </div>
      
        <div id="income-expense-chart" className="w-full overflow-x-auto">
          <SummaryChart 
            expenseData={summary?.expenseTrend?.map(trend => ({
              month: trend.month,
              amount: Number(trend.amount) || 0
            })) || []} 
            incomeData={summary?.incomeTrend?.map(trend => ({
              month: trend.month,
              amount: Number(trend.amount) || 0
            })) || []}
            categoryData={summary?.categoryBreakdown?.map(cat => ({
              name: cat.name,
              value: Number(cat.amount) || 0
            })) || []}
            currencySymbol={getCurrencySymbol(userCurrency)}
          />
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2" id="savings-goals">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">AI Financial Insights</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Smart analysis of your financial patterns and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              {aiInsightsLoading ? (
                <>
                  {/* Summary Section Skeleton */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                    ))}
                  </div>

                  {/* Insights Section Skeleton */}
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="grid gap-4 md:grid-cols-2">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-start gap-2 p-4 rounded-lg bg-muted">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Predictions Section Skeleton */}
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="grid gap-4 md:grid-cols-2">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-start gap-2 p-4 rounded-lg bg-muted">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Categories Section Skeleton */}
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <div className="grid gap-4 md:grid-cols-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 rounded-lg bg-muted">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-32 mt-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Summary Section */}
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                      <p className="text-2xl font-bold">
                        {getCurrencySymbol(userCurrency)}{aiInsights?.summary?.total_income?.toLocaleString() ?? '0'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold">
                        {getCurrencySymbol(userCurrency)}{aiInsights?.summary?.total_spent?.toLocaleString() ?? '0'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Average Transaction</p>
                      <p className="text-2xl font-bold">
                        {getCurrencySymbol(userCurrency)}{aiInsights?.summary?.average_transaction?.toLocaleString() ?? '0'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Budget Status</p>
                      <p className="text-2xl font-bold">
                        {aiInsights?.summary?.budget_status ?? `${getCurrencySymbol(userCurrency)}${summary?.monthlyBudget?.toFixed(2) || '0.00'}`}
                      </p>
                    </div>
                  </div>

                  {/* Insights Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg md:text-xl font-medium">Key Insights</h3>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      {aiInsights?.insights?.map((insight, index) => (
                        <div key={index} className="flex items-start gap-2 p-4 rounded-lg bg-muted">
                          <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                            <Lightbulb className="h-4 w-4 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium capitalize">{insight.type.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">{insight.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Predictions Section */}
                  {
                    aiInsights?.predictions && (
                      <div className="space-y-4">
                        <h3 className="text-lg md:text-xl font-medium">Financial Predictions</h3>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                          {aiInsights?.predictions?.map((prediction, index) => (
                            <div key={index} className="flex items-start gap-2 p-4 rounded-lg bg-muted">
                              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                                <TrendingUp className="h-4 w-4 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium capitalize">{prediction.type.replace('_', ' ')}</p>
                                <p className="text-sm text-muted-foreground">{prediction.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  {/* Top Categories Section */}
                  {
                    aiInsights?.summary?.top_categories && (
                      <div className="space-y-4">
                        <h3 className="text-lg md:text-xl font-medium">Top Spending Categories</h3>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                          {aiInsights?.summary?.top_categories?.map((category, index) => (
                            <div key={index} className="p-4 rounded-lg bg-muted">
                              <p className="text-sm font-medium capitalize">{category.category}</p>
                              <p className="text-2xl font-bold mt-2">
                                {getCurrencySymbol(userCurrency)}{category.amount.toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  {/* Analysis Info */}
                  {aiInsights?.metadata && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-muted-foreground gap-2">
                      <p>Analysis based on last {aiInsights.metadata.totalTransactions} transactions</p>
                      <p>Last updated: {new Date(aiInsights.metadata.lastUpdated).toLocaleString()}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      
        <div id="recent-transactions" className="w-full overflow-x-auto">
          <RecentTransactions 
            transactions={recentTransactions} 
            onDelete={handleDeleteTransaction}
            currencySymbol={getCurrencySymbol(userCurrency)}
          />
        </div>
      </motion.div>
    </div>
  );
}