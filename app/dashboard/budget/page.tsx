"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Gauge, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCurrencySymbol } from "@/lib/constants/currencies";

interface BudgetData {
  monthlyBudget: number;
  budgetUtilization: number;
  balance: number;
  month: string;
  totalExpenses: number;
  totalIncome: number;
  transactionCount: {
    expenses: number;
    incomes: number;
  };
}

export default function BudgetPage() {
  const { getAuthHeaders } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [userCurrency, setUserCurrency] = useState("USD");
  
  const fetchUserProfile = async () => {
      try {
        const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const response = await fetch("http://api.cashlyzer.com/api/profile", {
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

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const response = await fetch("http://api.cashlyzer.com/api/budget", {
        headers: { Authorization: headers.Authorization },
        });
        
      if (!response.ok && response.status !== 404) {
        throw new Error("Failed to fetch budget data");
        }
        
      const data = await response.json();
      
      setBudgetData({
        monthlyBudget: data.monthlyBudget || 0,
        budgetUtilization: data.budgetUtilization || 0,
        balance: data.balance || 0,
        month: data.month || "",
        totalExpenses: data.totalExpenses || 0,
        totalIncome: data.totalIncome || 0,
        transactionCount: data.transactionCount || { expenses: 0, incomes: 0 }
      });
      setMonthlyBudget(data.monthlyBudget?.toString() || "");
      } catch (error) {
        console.error("Error fetching budget data:", error);
        toast.error("Failed to load budget data");
      } finally {
        setLoading(false);
      }
  };
    
  useEffect(() => {
    fetchBudgetData();
    fetchUserProfile();
  }, []);
  
  const handleUpdateMonthlyBudget = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const response = await fetch("http://api.cashlyzer.com/api/budget", {
        method: "POST",
        headers: {
          Authorization: headers.Authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monthlyBudget: parseFloat(monthlyBudget),
        }),
        });
        
      if (!response.ok) {
        throw new Error("Failed to update budget");
        }

      toast.success("Monthly budget updated successfully");
      fetchBudgetData();
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error("Failed to update budget");
    }
  };
  
  const getBudgetStatus = () => {
    if (!budgetData) return null;
    const utilization = budgetData.monthlyBudget > 0 
      ? (budgetData.totalExpenses / budgetData.monthlyBudget) * 100 
      : 0;
    
    if (utilization > 100) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        title: "Budget Exceeded",
        description: `You've exceeded your monthly budget by ${(utilization - 100).toFixed(1)}%!`,
        variant: "destructive" as const,
      };
    } 
    else if (utilization === 100) {
      return {
        icon: <Gauge className="h-4 w-4" />,
        title: "Budget Fully Used",
        description: "You've exactly met your monthly budget. Plan ahead to avoid overspending.",
        variant: "default" as const,
      };
    }
    else if (utilization >= 90) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        title: "Budget Alert",
        description: "You're close to exceeding your monthly budget!",
        variant: "destructive" as const,
      };
    }else if (utilization === 0) {
      return {
        icon: <Info className="h-4 w-4" />,
        title: "No Spending Yet",
        description: "You haven't recorded any expenses this month.",
        variant: "default" as const,
      };
    }
    else {
    return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        title: "Budget Status",
        description: "Your spending is within budget limits.",
        variant: "default" as const,
      };
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const budgetStatus = getBudgetStatus();

  return (
    <div className="container mx-auto py-6 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-muted-foreground">
            Set and track your monthly budget
          </p>
        </div>
      </div>
      
      {budgetStatus && (
        <Alert variant={budgetStatus.variant}>
          {budgetStatus.icon}
          <AlertTitle>{budgetStatus.title}</AlertTitle>
          <AlertDescription className="mt-1">{budgetStatus.description}</AlertDescription>
          </Alert>
      )}
      
        <Card>
          <CardHeader>
          <CardTitle>Monthly Budget</CardTitle>
          <CardDescription>Set your overall monthly budget</CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder={`Enter monthly budget (${getCurrencySymbol(userCurrency)})`}
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleUpdateMonthlyBudget}>Update</Button>
                  </div>
          {budgetData && (
                  <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Spending</span>
                <span>{getCurrencySymbol(userCurrency)}{(budgetData.totalExpenses || 0).toFixed(2)}</span>
                    </div>
                    <Progress 
                value={budgetData.monthlyBudget > 0 
                  ? (budgetData.totalExpenses / budgetData.monthlyBudget) * 100 
                  : 0}
                className="h-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Monthly Budget</span>
                <span>{getCurrencySymbol(userCurrency)}{(budgetData.monthlyBudget || 0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
                    </div>
  );
}