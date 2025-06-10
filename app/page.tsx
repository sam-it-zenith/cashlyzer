"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  ArrowRight, 
  BadgeDollarSign, 
  PiggyBank, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Smartphone, 
  Zap,
  Users,
  CheckCircle2,
  ArrowUpRight,
  LayoutDashboard
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import "./overflow_control.css"

export default function Home() {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center sticky top-0 bg-background/80 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <BadgeDollarSign className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-xl">Cashlyzer</span>
        </Link>
          <nav className="flex gap-4 sm:gap-6 items-center">
            {isAuthenticated ? (
              <Link 
                href="/dashboard" 
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "rounded-full"
                )}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            ) : (
              <>
          <Link 
            href="/login" 
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Log In
          </Link>
          <Link 
            href="/signup" 
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "rounded-full"
            )}
          >
            Sign Up
          </Link>
              </>
            )}
        </nav>
        </div>
      </header>
      <main className="flex-1 px-1 sm:px-2 md:px-4">
        {/* Hero Section */}
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32 xl:py-40 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                    🚀 The Future of Personal Finance
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter py-3">
                    Smart Finance Tracking with{" "}
                    <span className="text-primary">AI Insights</span>
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-[600px]" style={{textAlign: 'justify'}}>
                  Take control of your money with Cashlyzer - your AI-powered finance buddy. Track income and expenses, and receive intelligent insights that help you spend smarter and save better.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row py-2">
                  {isAuthenticated ? (
                    <Link 
                      href="/dashboard" 
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "rounded-full w-full min-[400px]:w-auto"
                      )}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                  <Link 
                    href="/signup" 
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "rounded-full w-full min-[400px]:w-auto"
                    )}
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link 
                    href="/login" 
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "rounded-full w-full min-[400px]:w-auto"
                    )}
                  >
                    Log In
                  </Link>
                    </>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Free Forever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>No Credit Card Required</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center mt-8 lg:mt-0">
                <div className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] aspect-square">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/0 animate-pulse" />
                  <div className="absolute inset-[5%] rounded-2xl bg-gradient-to-tr from-background to-background/80 backdrop-blur-sm shadow-lg flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-6">
                      <div className="space-y-2">
                        <div className="h-16 sm:h-20 md:h-24 rounded-lg bg-primary/10 p-2 sm:p-4 flex items-center justify-center">
                          <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
                        </div>
                        <div className="h-16 sm:h-20 md:h-24 rounded-lg bg-primary/10 p-2 sm:p-4 flex items-center justify-center">
                          <PiggyBank className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-16 sm:h-20 md:h-24 rounded-lg bg-primary/10 p-2 sm:p-4 flex items-center justify-center">
                          <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
                        </div>
                        <div className="h-16 sm:h-20 md:h-24 rounded-lg bg-primary/10 p-2 sm:p-4 flex items-center justify-center">
                          <Shield className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter">
                Everything You Need to Master Your Money
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-[900px]">
                Powerful and intelligent tools designed to guide you toward a smarter financial future.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:gap-6 py-8 sm:py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-primary/10 p-2">
                  <BadgeDollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Expense Tracking</h3>
                <p className="text-sm sm:text-base text-center text-muted-foreground">
                Easily log and categorize your spending. Visualize where your money goes and uncover patterns in your habits.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-primary/10 p-2">
                  <PiggyBank className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Budget Management</h3>
                <p className="text-sm sm:text-base text-center text-muted-foreground">
                Create flexible budgets that work for you. Get gentle nudges when you're close to overspending and stay on track effortlessly.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-primary/10 p-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">AI-Powered Insights</h3>
                <p className="text-sm sm:text-base text-center text-muted-foreground">
                Cashlyzer's intelligent engine analyzes your habits and gives you tailored insights to help you save more and spend wiser.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-primary/10 p-2">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Secure & Private</h3>
                <p className="text-sm sm:text-base text-center text-muted-foreground">
                  Your financial data is always secure and private. We use top-tier encryption to protect your information.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-primary/10 p-2">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Mobile First</h3>
                <p className="text-sm sm:text-base text-center text-muted-foreground">
                From commuting to couch time, manage your finances from anywhere with a sleek, mobile-first experience.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-primary/10 p-2">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Real-time Updates</h3>
                <p className="text-sm sm:text-base text-center text-muted-foreground">
                Your dashboard refreshes in real-time. No delays, no surprises. Stay informed every step of the way.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter">
                Why Choose Cashlyzer?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-[600px]">
              Because your money deserves more than spreadsheets and guesswork.
              </p>
            </div>
            <div className="grid gap-4 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative space-y-4">
                  <div className="rounded-full bg-primary/10 p-3 w-fit">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">AI That Works For You</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                    Cashlyzer learns from your spending habits and delivers actionable insights. So you don't have to crunch the numbers.
                    </p>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative space-y-4">
                  <div className="rounded-full bg-primary/10 p-3 w-fit">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">All-in-One Finance Toolkit</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                    From budgeting and saving to insights and tracking, manage your entire financial life without juggling multiple apps.
                    </p>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative space-y-4">
                  <div className="rounded-full bg-primary/10 p-3 w-fit">
                    <PiggyBank className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Finance Made Friendly</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                    We turn complex data into easy-to-understand guidance, helping you make confident financial choices without feeling lost.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter">
                How Cashlyzer Works
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-[600px]">
                Get started with Cashlyzer in just a few simple steps
              </p>
            </div>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-primary/10 animate-pulse" />
                    <div className="relative rounded-full bg-primary/20 p-3 sm:p-4">
                      <span className="text-xl sm:text-2xl font-bold text-primary">1</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold">Create Account</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Sign up in seconds with your email and password. No credit card required.
                    </p>
                  </div>
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/20" />
              </div>
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-primary/10 animate-pulse" />
                    <div className="relative rounded-full bg-primary/20 p-3 sm:p-4">
                      <span className="text-xl sm:text-2xl font-bold text-primary">2</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold">Track & Organize</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                    Add expenses and income easily. Everything is automatically categorized.
                    </p>
                  </div>
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/20" />
              </div>
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-primary/10 animate-pulse" />
                    <div className="relative rounded-full bg-primary/20 p-3 sm:p-4">
                      <span className="text-xl sm:text-2xl font-bold text-primary">3</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold">Set Budgets & Goals</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                    Create monthly budgets and long-term savings goals. Monitor your progress.
                    </p>
                  </div>
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/20" />
              </div>
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-primary/10 animate-pulse" />
                    <div className="relative rounded-full bg-primary/20 p-3 sm:p-4">
                      <span className="text-xl sm:text-2xl font-bold text-primary">4</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold">Review & Grow</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Monitor your financial health with real-time insights and personalized recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 flex justify-center">
              {isAuthenticated ? (
                <Link 
                  href="/dashboard" 
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "rounded-full w-full min-[400px]:w-auto"
                  )}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              ) : (
                <Link 
                  href="/signup" 
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "rounded-full w-full min-[400px]:w-auto"
                  )}
                >
                  Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter">
                What Our Users Say
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-[600px]">
                Stories from people who took charge of their finances with Cashlyzer.
              </p>
            </div>
            <div className="grid gap-4 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-base sm:text-lg font-semibold text-primary">KR</span>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold">Khabib Rahman</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Software Engineer</p>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                  "Cashlyzer transformed how I manage my budget. The AI insights are like having a personal finance coach in my pocket!"
                  </p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-base sm:text-lg font-semibold text-primary">RM</span>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold">Rafiq Mahmud</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Freelancer</p>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                  "Finally, an app that makes tracking expenses easy and even enjoyable. I feel more confident about my money than ever before."
                  </p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-base sm:text-lg font-semibold text-primary">MR</span>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold">Mike Rodriguez</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Entrepreneur</p>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                  "The real-time updates and personalized tips helped me save more and reduce unnecessary spending. Highly recommend!"
                  </p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter">
                  Ready to take control of your finances?
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-[600px]">
                Join thousands who trust Cashlyzer to make smarter financial decisions every day.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row w-full sm:w-auto justify-center">
                {isAuthenticated ? (
                  <Link 
                    href="/dashboard" 
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "rounded-full w-full min-[400px]:w-auto"
                    )}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link 
                    href="/signup" 
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "rounded-full w-full min-[400px]:w-auto"
                    )}
                  >
                    Get Started Free <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t my-5">
        <div className="container mx-auto px-4 md:px-6 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:gap-2 sm:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground pt-5">
              © {new Date().getFullYear()} Cashlyzer. All rights reserved.
            </p>
            <nav className="pt-5 flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="/terms-of-service" className="text-sm hover:underline underline-offset-4">
                Terms of Service
              </Link>
              <Link href="/privacy-policy" className="text-sm hover:underline underline-offset-4">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-sm hover:underline underline-offset-4">
                Contact Us
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}