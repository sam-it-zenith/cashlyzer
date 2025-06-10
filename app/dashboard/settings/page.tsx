"use client";

import { useRequireAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogOut, Moon, Sun, Monitor, AlertTriangle, Bell, User, Upload, Loader2, Mail } from "lucide-react";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CURRENCIES, getCurrencyDisplay } from "@/lib/constants/currencies";

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

interface UserSettings {
  notifications: {
    budgetAlerts: boolean;
    monthlySummary: boolean;
  };
  theme: "light" | "dark" | "system";
}

const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    budgetAlerts: true,
    monthlySummary: true
  },
  theme: "system"
};

export default function SettingsPage() {
  const { getAuthHeaders } = useRequireAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    currency: "USD",
    language: "en"
  });
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [deleteEmailConfirmation, setDeleteEmailConfirmation] = useState("");

  useEffect(() => {
    fetchSettings();
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
      const profileData = data.data || {};
      
      setProfile(profileData);
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        phoneNumber: profileData.phoneNumber || "",
        currency: profileData.currency || "USD",
        language: profileData.language || "en"
      });

      // Update notification settings from profile with default values
      setSettings(prev => ({
        ...prev,
        notifications: {
          budgetAlerts: profileData.notificationPreferences?.push ?? true,
          monthlySummary: profileData.notificationPreferences?.email ?? true
        }
      }));
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("image", file);

      // Upload to imgbb
      const response = await fetch("https://api.imgbb.com/1/upload?key=0a511cc4676943e47e1517d20ebac63a", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      const imageUrl = data.data.url;

      // Update profile with new image URL
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const updateResponse = await fetch("https://api.cashlyzer.com/api/profile", {
        method: "PUT",
        headers: { 
          Authorization: headers.Authorization,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ profilePictureUrl: imageUrl })
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update profile");
      }

      await fetchProfile();
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      // Remove email and language from the update data since they can't be changed
      const { email, language, ...updateData } = formData;

      // Format the data according to the API's expected structure
      const requestData = {
        displayName: updateData.name,
        phoneNumber: updateData.phoneNumber,
        currency: updateData.currency,
        theme: theme, // Include current theme
        notificationPreferences: {
          email: settings.notifications.monthlySummary,
          push: settings.notifications.budgetAlerts
        }
      };

      const response = await fetch("https://api.cashlyzer.com/api/profile", {
        method: "PUT",
        headers: { 
          Authorization: headers.Authorization,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      await fetchProfile();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const fetchSettings = () => {
    try {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      localStorage.setItem("userSettings", JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };
  
  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("idToken");
      localStorage.removeItem("userSettings");
    toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };
  
  const handleDeleteAccount = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const response = await fetch("https://api.cashlyzer.com/api/profile", {
        method: "DELETE",
        headers: { Authorization: headers.Authorization },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      // Clear local settings when account is deleted
      localStorage.removeItem("userSettings");
      localStorage.removeItem("token");
      localStorage.removeItem("idToken");
    toast.success("Account deleted successfully");
      window.location.href = "/login"
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    updateSettings({ theme: newTheme });
  };

  const handleNotificationChange = async (key: keyof UserSettings["notifications"], value: boolean) => {
    try {
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      // Update local settings
      const newSettings = {
        ...settings,
        notifications: {
          ...settings.notifications,
          [key]: value
        }
      };
      setSettings(newSettings);

      // Update profile with new notification preferences
      const response = await fetch("https://api.cashlyzer.com/api/profile", {
        method: "PUT",
        headers: { 
          Authorization: headers.Authorization,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          notificationPreferences: {
            email: newSettings.notifications.monthlySummary,
            push: newSettings.notifications.budgetAlerts
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update notification preferences");
      }

      toast.success("Notification preferences updated");
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast.error("Failed to update notification preferences");
      // Revert the change if it failed
      setSettings(settings);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true);
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        throw new Error("No auth headers available");
      }

      const response = await fetch("https://api.cashlyzer.com/api/summary/monthly", {
        method: "POST",
        headers: {
          Authorization: headers.Authorization,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate summary");
      }

      const data = await response.json();
      toast.success(data.message || "Monthly summary sent to your email");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate summary");
    } finally {
      setGeneratingSummary(false);
    }
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 px-3"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </motion.div>
      
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative h-24 w-24">
                {profile?.profilePictureUrl ? (
                  <Image
                    src={profile.profilePictureUrl}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-picture">Profile Picture</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("profile-picture")?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploadingImage ? "Uploading..." : "Upload Picture"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-sm text-muted-foreground">
                  Email address cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    {Object.entries(CURRENCIES).map(([code, currency]) => (
                      <option key={code} value={code}>
                        {getCurrencyDisplay(code)}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-muted-foreground">
                    This will be used for all monetary values
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    value="en"
                    disabled
                    className="w-full rounded-md border border-input bg-muted px-3 py-2 cursor-not-allowed"
                  >
                    <option value="en">English</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Language cannot be changed
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleProfileUpdate} className="w-full">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how Cashlyzer looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleThemeChange("light")}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleThemeChange("dark")}
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleThemeChange("system")}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    System
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="budget-alerts">Budget Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when you approach your budget limits
                </p>
              </div>
              <Switch 
                id="budget-alerts" 
                checked={settings.notifications.budgetAlerts}
                onCheckedChange={(checked) => handleNotificationChange("budgetAlerts", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="monthly-summary">Monthly Summary</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a monthly report of your financial activity
                </p>
              </div>
              <Switch 
                id="monthly-summary" 
                checked={settings.notifications.monthlySummary}
                onCheckedChange={(checked) => handleNotificationChange("monthlySummary", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Generate Report</Label>
                <p className="text-sm text-muted-foreground">
                  Send a detailed financial report to your email
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
              >
                {generatingSummary ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {generatingSummary ? "Sending..." : "Send Report"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
            
            <AlertDialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Label htmlFor="delete-email-confirmation" className="text-sm font-medium">
                    To confirm, type your email address: {profile?.email}
                  </Label>
                  <Input
                    id="delete-email-confirmation"
                    type="email"
                    value={deleteEmailConfirmation}
                    onChange={(e) => setDeleteEmailConfirmation(e.target.value)}
                    placeholder="Enter your email"
                    className="mt-2"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteEmailConfirmation("")}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleteEmailConfirmation !== profile?.email}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}