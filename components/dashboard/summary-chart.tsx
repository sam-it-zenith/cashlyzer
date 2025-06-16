"use client";

import React, { useEffect, useState } from "react";
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

interface CustomTooltipProps extends TooltipProps<number, string> {
  currencySymbol: string;
}

const CustomTooltip = ({ active, payload, label, currencySymbol }: CustomTooltipProps) => {
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Custom tooltip formatter for currency
  const formatCurrency = (value: number) => `${currencySymbol}${value.toFixed(2)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full"
    >
      <Card className="p-3 sm:p-4">
        <CardHeader className="px-0 sm:px-0 pb-2">
          <CardTitle className="text-lg sm:text-xl">Financial Overview</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-0">
          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 mb-20 sm:mb-0">
              <TabsTrigger value="trends" className="w-full">Trends</TabsTrigger>
              <TabsTrigger value="comparison" className="w-full">Income vs Expenses</TabsTrigger>
              <TabsTrigger value="categories" className="w-full">Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="trends" className="mt-4">
              <div className="h-[250px] sm:h-[300px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={expenseData}
                    margin={{ top: 20, right: 5, left: 27, bottom: 10 }}
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
                      tick={{ fontSize: 10, sm: 11 }}
                      tickLine={false}
                      minTickGap={20}
                      height={40}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 10, sm: 11 }}
                      tickLine={false}
                      width={50}
                    />
                    <Tooltip<number, string> content={(props) => <CustomTooltip {...props} currencySymbol={currencySymbol} />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
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
              <div className="h-[250px] sm:h-[300px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={expenseData.map((d, i) => ({
                      month: d.month,
                      expense: d.amount,
                      income: incomeData[i]?.amount || 0
                    }))}
                    margin={{ top: 20, right: 5, left: 27, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 10, sm: 11 }}
                      tickLine={false}
                      minTickGap={20}
                      height={40}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 10, sm: 11 }}
                      tickLine={false}
                      width={50}
                    />
                    <Tooltip<number, string> content={(props) => <CustomTooltip {...props} currencySymbol={currencySymbol} />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
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
              <div className="h-[250px] sm:h-[300px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => 
                        !isMobile ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip<number, string> 
                      content={(props) => (
                        <div className="rounded-lg border bg-card p-3 shadow-sm">
                          {props.payload && props.payload[0] && (
                            <>
                              <p className="text-sm font-medium text-foreground">
                                {props.payload[0].name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {currencySymbol}{props.payload[0].value?.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {((props.payload[0].value / categoryData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}% of total
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    />
                    {!isMobile && (
                      <Legend 
                        layout="vertical" 
                        align="right"
                        verticalAlign="middle"
                        wrapperStyle={{ 
                          fontSize: '11px',
                          paddingLeft: '10px',
                          maxWidth: '40%'
                        }}
                      />
                    )}
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {isMobile && (
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {categoryData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="truncate">{entry.name}</span>
                      <span className="text-muted-foreground">
                        {currencySymbol}{entry.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}