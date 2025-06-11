import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cashlyzer – Smarter Finances, Better You',
  description: 'Cashlyzer is your all-in-one personal finance assistant. Track income, manage expenses, set budgets, monitor savings goals, and get smart AI-powered financial insights—all in one clean, modern interface.',
keywords: [
  'Cashlyzer', 
  'finance tracker', 
  'budget app', 
  'expense tracker', 
  'AI financial insights', 
  'personal finance', 
  'money management', 
  'financial planning', 
  'budget planner', 
  'income tracker', 
  'savings app', 
  'monthly spending report', 
  'financial dashboard', 
  'AI money assistant', 
  'track finances online', 
  'financial goals app'
],
  authors: [{ name: 'Cashlyzer' }],
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Cashlyzer – Smarter Finances, Better You',
    description: 'Track expenses, plan budgets, and gain personalized insights with Cashlyzer’s AI-powered finance tools.',
    url: 'https://cashlyzer.com', // replace with actual URL
    siteName: 'Cashlyzer',
    images: [
      {
        url: '/og_image.png', // Open Graph preview image
        width: 1156,
        height: 578,
        alt: 'Cashlyzer App Preview',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cashlyzer – Smarter Finances, Better You',
    description: 'Take control of your finances with AI-driven insights, budgeting tools, and real-time tracking.',
    images: ['/og_image.png'], // Twitter preview image
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}