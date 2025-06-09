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
import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/auth";
import { toast } from "sonner";

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  currentBudget?: number;
}

const budgetFormSchema = z.object({
  monthlyBudget: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Amount must be a positive number"
  ),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export function BudgetForm({ open, onOpenChange, onSuccess, currentBudget }: BudgetFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { getAuthHeaders } = useRequireAuth();
  
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      monthlyBudget: currentBudget ? currentBudget.toString() : "",
    },
  });
  
  // Update form when currentBudget changes
  useEffect(() => {
    if (currentBudget) {
      form.setValue("monthlyBudget", currentBudget.toString());
    }
  }, [currentBudget, form]);
  
  async function onSubmit(data: BudgetFormValues) {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }
      
      const payload = {
        monthlyBudget: parseFloat(data.monthlyBudget),
      };
      
      const response = await fetch("http://api.cashlyzer.com/api/budget", {
        method: "POST",
        headers: {
          Authorization: headers.Authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update budget");
      }
      
      toast.success("Budget updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update budget");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{currentBudget ? "Update" : "Set"} Monthly Budget</DialogTitle>
          <DialogDescription>
            Enter your monthly budget amount below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="monthlyBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Budget ($)</FormLabel>
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
            
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {currentBudget ? "Updating" : "Setting"} budget...
                  </span>
                ) : (
                  <span>{currentBudget ? "Update" : "Set"} Budget</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}