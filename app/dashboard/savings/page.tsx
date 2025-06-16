"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { AlertCircle, TrendingUp, PiggyBank, Target, Trash2, AlertTriangle, Loader2, Trophy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { format } from "date-fns";
import { getCurrencySymbol } from "@/lib/constants/currencies";

interface SavingsPlan {
  id: string;
  currentAmount: number;
  monthlyContribution: number;
  targetAmount: number;
  targetDate: {
    _seconds: number;
    _nanoseconds: number;
  } | null;
  startDate: {
    _seconds: number;
    _nanoseconds: number;
  };
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  userId: string;
  monthlyData?: Array<{
    name: string;
    savings: number;
    isProjected?: boolean;
  }>;
  canContribute?: boolean;
  currentBalance?: number;
}

interface ApiResponse {
  message: string;
  savingsPlan: SavingsPlan;
}

// Helper function to convert Firestore timestamp to Date
const firestoreTimestampToDate = (timestamp: { _seconds: number; _nanoseconds: number } | null): Date | null => {
  if (!timestamp) return null;
  return new Date(timestamp._seconds * 1000);
};

export default function SavingsPage() {
  const { getAuthHeaders } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [savingsData, setSavingsData] = useState<SavingsPlan | null>(null);
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isContributing, setIsContributing] = useState(false);
  const [userCurrency, setUserCurrency] = useState("USD");

  const fetchSavingsData = async () => {
      try {
      setLoading(true);
        const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const response = await fetch("https://api.cashlyzer.com/api/savings", {
        headers: { Authorization: headers.Authorization },
      });

      if (!response.ok && response.status !== 404) {
        throw new Error("Failed to fetch savings data");
      }

      const data: ApiResponse = await response.json();
      
      
      if (data.savingsPlan) {
        setSavingsData(data.savingsPlan);
        setMonthlyContribution(data.savingsPlan.monthlyContribution?.toString() || "");
        setTargetAmount(data.savingsPlan.targetAmount?.toString() || "");
        if (data.savingsPlan.targetDate) {
          const date = new Date(data.savingsPlan.targetDate._seconds * 1000);
          setTargetDate(date.toISOString().split('T')[0]);
            } else {
          setTargetDate("");
        }
      }
      } catch (error) {
        console.error("Error fetching savings data:", error);
        toast.error("Failed to load savings data");
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
    fetchSavingsData();
    fetchUserProfile();
  }, []);
  
  const handleUpdateSavings = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const endpoint = savingsData?.id 
        ? `https://api.cashlyzer.com/api/savings/${savingsData.id}`
        : "https://api.cashlyzer.com/api/savings";

      const method = savingsData?.id ? "PUT" : "POST";

      const formattedTargetDate = targetDate ? new Date(targetDate).toISOString() : null;

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: headers.Authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monthlyContribution: parseFloat(monthlyContribution),
          targetAmount: parseFloat(targetAmount),
          targetDate: formattedTargetDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update savings");
      }

      toast.success("Savings plan updated successfully");
      fetchSavingsData();
    } catch (error) {
      console.error("Error updating savings:", error);
      toast.error("Failed to update savings");
    }
  };
  
  const handleDeleteSavings = async () => {
    if (!savingsData?.id) return;

    try {
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const response = await fetch(`https://api.cashlyzer.com/api/savings/${savingsData.id}`, {
        method: "DELETE",
        headers: { Authorization: headers.Authorization },
      });

      if (!response.ok) {
        throw new Error("Failed to delete savings plan");
      }

      toast.success("Savings plan deleted successfully");
      setSavingsData(null);
      setMonthlyContribution("");
      setTargetAmount("");
      setTargetDate("");
      fetchSavingsData();
    } catch (error) {
      console.error("Error deleting savings:", error);
      toast.error("Failed to delete savings plan");
    }
  };

  const getSavingsStatus = () => {
    if (!savingsData) return null;
    
    const progress = savingsData.targetAmount > 0 
      ? (savingsData.currentAmount / savingsData.targetAmount) * 100 
    : 0;
  if (progress >= 100) {
    return {
      icon: <Trophy className="h-4 w-4" />,
      title: "Goal Achieved!",
      description: "Congratulations! You've reached your savings goal.",
      variant: "default" as const,
    };
}
    else if (progress >= 90) {
      return {
        icon: <Target className="h-4 w-4" />,
        title: "Almost There!",
        description: "You're close to reaching your savings goal!",
        variant: "default" as const,
      };
    } else if (progress >= 50) {
      return {
        icon: <TrendingUp className="h-4 w-4" />,
        title: "Good Progress",
        description: "You're making good progress towards your savings goal.",
        variant: "default" as const,
      };
    } else {
      return {
        icon: <PiggyBank className="h-4 w-4" />,
        title: "Keep Saving",
        description: "Continue your savings journey to reach your goal.",
        variant: "default" as const,
      };
    }
  };

  const handleContribute = async () => {
    if (!savingsData?.id) return;
    
    try {
      setIsContributing(true);
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const response = await fetch(`https://api.cashlyzer.com/api/savings/${savingsData.id}/contribute`, {
        method: 'POST',
        headers: {
          Authorization: headers.Authorization,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error("Failed to contribute to savings");
      }

      toast.success("Contribution successful!");
      fetchSavingsData(); // Refresh the data
    } catch (error) {
      console.error("Error contributing to savings:", error);
      toast.error("Failed to contribute to savings");
    } finally {
      setIsContributing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const savingsStatus = getSavingsStatus();

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track and manage your savings progress
          </p>
        </div>
        {savingsData?.id && (
          <Button 
            variant="destructive" 
            onClick={handleDeleteSavings}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4" />
            Delete Plan
          </Button>
        )}
      </div>

      {savingsStatus && (
        <Alert variant={savingsStatus.variant} className="p-3 sm:p-4">
          <div className="flex items-start gap-3">
            {savingsStatus.icon}
            <div>
              <AlertTitle className="text-base sm:text-lg">{savingsStatus.title}</AlertTitle>
              <AlertDescription className="mt-1 text-sm">{savingsStatus.description}</AlertDescription>
            </div>
          </div>
        </Alert>
      )}
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="p-3 sm:p-4">
          <CardHeader className="px-0 sm:px-0 pb-2">
            <CardTitle className="text-lg sm:text-xl">Savings Plan</CardTitle>
            <CardDescription className="text-sm">Set your monthly contribution and target amount</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-0 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Contribution</label>
                <Input
                  type="number"
                  placeholder={`Enter monthly contribution (${getCurrencySymbol(userCurrency)})`}
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Amount</label>
                <Input
                  type="number"
                  placeholder={`Enter target amount (${getCurrencySymbol(userCurrency)})`}
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Date (Optional)</label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
              <Button onClick={handleUpdateSavings} className="w-full">
                {savingsData?.id ? "Update Savings Plan" : "Create Savings Plan"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="p-3 sm:p-4">
          <CardHeader className="px-0 sm:px-0 pb-2">
            <CardTitle className="text-lg sm:text-xl">Progress Overview</CardTitle>
            <CardDescription className="text-sm">Track your savings progress</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-0 space-y-4">
            {savingsData && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Savings</span>
                    <span className="font-medium">{getCurrencySymbol(userCurrency)}{(savingsData.currentAmount || 0).toFixed(2)}</span>
                  </div>
                  <Progress
                    value={savingsData.targetAmount > 0 
                      ? (savingsData.currentAmount / savingsData.targetAmount) * 100 
                      : 0}
                    className="h-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Target Amount</span>
                    <span className="font-medium">{getCurrencySymbol(userCurrency)}{(savingsData.targetAmount || 0).toFixed(2)}</span>
                  </div>
                </div>

                {savingsData.canContribute && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Available Balance</p>
                      <p className="text-sm font-medium text-green-600">{getCurrencySymbol(userCurrency)}{savingsData.currentBalance?.toFixed(2)}</p>
                    </div>
                    <Button 
                      onClick={handleContribute} 
                      className="w-full"
                      disabled={isContributing}
                    >
                      {isContributing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Contributing...
                        </>
                      ) : (
                        `Contribute ${getCurrencySymbol(userCurrency)}${savingsData.monthlyContribution.toFixed(2)}`
                      )}
                    </Button>
                  </div>
                )}

                {savingsData.targetDate && (
                  <div className="pt-4">
                    <p className="text-sm sm:text-base font-medium">Target Date</p>
                    <p className="text-xl sm:text-2xl font-bold my-1">
                      {(() => {
                        try {
                          const date = firestoreTimestampToDate(savingsData.targetDate);
                          if (!date || isNaN(date.getTime())) {
                            return "Invalid date";
                          }
                          return format(date, "MMMM d, yyyy");
                        } catch (error) {
                          console.error("Error formatting date:", error);
                          return "Invalid date";
                        }
                      })()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        try {
                          const date = firestoreTimestampToDate(savingsData.targetDate);
                          if (!date || isNaN(date.getTime())) {
                            return "";
                          }
                          return format(date, "EEEE");
                        } catch (error) {
                          console.error("Error formatting date:", error);
                          return "";
                        }
                      })()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {savingsData?.monthlyData && savingsData.monthlyData.length > 0 && (
        <Card className="p-3 sm:p-4">
          <CardHeader className="px-0 sm:px-0 pb-2">
            <CardTitle className="text-lg sm:text-xl">Savings Trend</CardTitle>
            <CardDescription className="text-sm">Your monthly savings trend over time</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-0">
            <div className="h-[250px] sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={savingsData.monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${getCurrencySymbol(userCurrency)}${(value as number).toFixed(2)}`, "Savings"]}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    labelFormatter={(label) => {
                      const dataPoint = savingsData.monthlyData?.find(d => d.name === label);
                      return `${label}${dataPoint?.isProjected ? ' (Projected)' : ''}`;
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="savings" 
                    stroke="hsl(var(--chart-3))" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Savings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}