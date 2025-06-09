"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  TooltipProps
} from "recharts";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

interface SummaryChartProps {
  expenseData: any[];
  incomeData: any[];
  categoryData: any[];
  currencySymbol: string;
}

const CustomTooltip = ({ active, payload, label, currencySymbol }: TooltipProps<number, string> & { currencySymbol: string }) => {
  const { theme } = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-sm">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-muted-foreground">
            {entry.name}: {currencySymbol}{entry.value?.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SummaryChart({ expenseData, incomeData, categoryData, currencySymbol }: SummaryChartProps) {
  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  // Custom tooltip formatter for currency
  const formatCurrency = (value: number) => `${currencySymbol}${value.toFixed(2)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full"
    >
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trends">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="comparison">Income vs Expenses</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="trends" className="mt-4">
              <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={expenseData}
                    margin={{ top: 20, right: 30, left: 40, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <Tooltip content={(props) => <CustomTooltip {...props} currencySymbol={currencySymbol} />} />
                    <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                      name="Expenses"
                    stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorExpense)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="comparison" className="mt-4">
              <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={expenseData.map((d, i) => ({
                      month: d.month,
                      expense: d.amount,
                      income: incomeData[i]?.amount || 0
                    }))}
                    margin={{ top: 20, right: 30, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <Tooltip content={(props) => <CustomTooltip {...props} currencySymbol={currencySymbol} />} />
                    <Legend />
                    <Bar 
                      dataKey="expense" 
                      name="Expenses"
                      fill="hsl(var(--chart-1))" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="income" 
                      name="Income"
                      fill="hsl(var(--chart-2))" 
                      radius={[4, 4, 0, 0]} 
                    />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="categories" className="mt-4">
              <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                      outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => 
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                  >
                    {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                    ))}
                  </Pie>
                    <Tooltip content={(props) => <CustomTooltip {...props} currencySymbol={currencySymbol} />} />
                    <Legend 
                      layout="vertical" 
                      align="right"
                      verticalAlign="middle"
                    />
                </PieChart>
              </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}