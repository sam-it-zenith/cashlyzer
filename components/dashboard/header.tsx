"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { Notifications } from "@/components/dashboard/notifications";
import { useRequireAuth } from "@/lib/auth";

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  profilePictureUrl: string;
  phoneNumber: string;
  currency: string;
  language: string;
  theme: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export function Header() {
  const { user, logout } = useAuth();
  const { getAuthHeaders } = useRequireAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
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
      setProfile(data.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <h1 className="text-lg font-semibold">
              {(() => {
                const lastSegment = pathname.split('/').pop();
                if (!lastSegment) return 'Dashboard';
                return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
              })()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Notifications />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.profilePictureUrl || ""} alt={profile?.name || ""} />
                    <AvatarFallback>
                      {profile?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.name || user?.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-background p-6 shadow-lg"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              <Sidebar />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 