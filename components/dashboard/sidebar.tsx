"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { 
  BadgeDollarSign, 
  Home, 
  PieChart, 
  Wallet, 
  Landmark, 
  TrendingUp, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, href, active, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-accent",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ onClose, className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: "Dashboard", href: "/dashboard" },
    { icon: <Receipt className="h-5 w-5" />, label: "Transactions", href: "/dashboard/transactions" },
    { icon: <PieChart className="h-5 w-5" />, label: "Expenses", href: "/dashboard/expenses" },
    { icon: <Wallet className="h-5 w-5" />, label: "Income", href: "/dashboard/income" },
    { icon: <Landmark className="h-5 w-5" />, label: "Budget", href: "/dashboard/budget" },
    { icon: <TrendingUp className="h-5 w-5" />, label: "Savings", href: "/dashboard/savings" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <aside id="sidebar" className={className}>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center overflow-hidden w-full">
          <BadgeDollarSign className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl overflow-hidden max-w-full">Cashlyzer</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        {user && (
          <div className="mb-6 mx-4 flex items-center gap-2 rounded-lg border p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <span className="text-xl font-semibold text-primary">
                {user.displayName?.charAt(0) || user.email?.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{user.displayName || user.email}</p>
            </div>
          </div>
        )}
        <nav className="grid gap-2 px-2">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname === item.href}
              onClick={onClose}
            />
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-3 px-3"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
} 