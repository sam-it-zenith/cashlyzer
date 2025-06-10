"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";
import { BadgeDollarSign, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import "../overflow_control.css"

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://api.cashlyzer.com/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset instructions');
      }

      setIsSubmitted(true);
      toast.success("Password reset instructions sent to your email!");
    } catch (error) {
      console.error("Password reset error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to send reset instructions. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center px-4 py-8 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex w-full flex-col justify-center space-y-6 sm:space-y-8 sm:w-[450px] md:w-[500px]"
      >
        <div className="flex flex-col space-y-2 sm:space-y-3 text-center">
          <div className="flex items-center justify-center">
            <BadgeDollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Forgot Password
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-2 sm:space-y-3">
            <CardTitle className="text-xl sm:text-2xl">Reset Password</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {isSubmitted 
                ? "Check your email for the password reset link"
                : "We'll send you a link to reset your password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 sm:h-12 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      Sending instructions...
                    </>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-lg bg-primary/10 p-3 sm:p-4 text-center">
                  <p className="text-sm sm:text-base text-primary">
                    Password reset instructions have been sent to your email address.
                    Please check your inbox and follow the instructions to reset your password.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full h-10 sm:h-12 text-sm sm:text-base"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm sm:text-base">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 