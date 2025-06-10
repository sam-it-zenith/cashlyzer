"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/auth";
import { toast } from "sonner";

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  currencySymbol?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  subcategories?: string[];
}

const expenseFormSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Amount must be a positive number"
  ),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  note: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export function ExpenseForm({ 
  open, 
  onOpenChange, 
  onSuccess,
  currencySymbol = "$"
}: ExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { getAuthHeaders } = useRequireAuth();
  
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: "",
      category: "",
      subcategory: "",
      note: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const headers = getAuthHeaders();
        if (!headers?.Authorization) {
          throw new Error("No auth headers available");
        }

        const response = await fetch("https://api.cashlyzer.com/api/categories", {
          headers: {
            Authorization: headers.Authorization,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const responseData = await response.json();
        
        // Extract categories from the response
        const categoriesData = responseData.categories || [];
        
        // Ensure categoriesData is an array and has the correct structure
        if (!Array.isArray(categoriesData)) {
          console.error("Invalid categories data structure:", categoriesData);
          setCategories([]);
          return;
        }

        // Process each category
        const processedCategories = categoriesData.map((category: any) => {
          return {
            id: category.id,
            name: category.name,
            description: category.description,
            subcategories: category.subcategories || [],
          };
        });

        setCategories(processedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories");
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open, getAuthHeaders]);

  // Reset subcategory when category changes
  useEffect(() => {
    if (selectedCategory) {
      form.setValue("subcategory", "");
    }
  }, [selectedCategory, form]);
  
  const onSubmit = async (data: z.infer<typeof expenseFormSchema>) => {
    try {
      setIsLoading(true);
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      // Format the date to YYYY-MM-DD
      const formattedDate = new Date(data.date).toISOString().split('T')[0];

      // Prepare the expense data
      const expenseData = {
        amount: parseFloat(data.amount),
        note: data.note,
        date: formattedDate,
        category: data.category,
        subcategory: data.subcategory || null,
        paymentMethod: "cash"
      };


      const response = await fetch("https://api.cashlyzer.com/api/expenses", {
        method: "POST",
        headers: {
          Authorization: headers.Authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || "Failed to add expense");
      }

      const result = await response.json();

      toast.success("Expense added successfully");
      onSuccess?.();
      onOpenChange?.(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add expense");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details of your expense below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ({currencySymbol})</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0.00" 
                      {...field} 
                      type="number" 
                      step="0.01" 
                      min="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCategory(value);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category: Category) => {
                        const displayName = category.name || '';
                        const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            {capitalizedName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedCategory && (() => {
              const selectedCategoryData = categories.find(c => c.id === selectedCategory);
              return selectedCategoryData?.subcategories && selectedCategoryData.subcategories.length > 0;
            })() && (
              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories
                          .find(c => c.id === selectedCategory)
                          ?.subcategories?.map((subcategory) => (
                            <SelectItem key={subcategory} value={subcategory}>
                              {subcategory}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a note about this expense" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding expense...
                  </span>
                ) : (
                  <span>Add Expense</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}