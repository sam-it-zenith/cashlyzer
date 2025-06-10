"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth";

interface Notification {
  id: string;
  type: 'savings_alert' | 'budget_alert';
  message: string;
  severity: 'low' | 'medium' | 'high';
  read: boolean;
  timestamp: string;
}

interface NotificationsResponse {
  message: string;
  notifications: Notification[];
}

interface UserProfile {
  notificationPreferences: {
    email: boolean;
    push: boolean;
  };
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const { user, loading: isUserLoading, getAuthHeaders } = useAuthStore();

  const fetchUserProfile = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        throw new Error('No auth headers available');
      }

      const response = await fetch('https://api.cashlyzer.com/api/profile', {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      const profile = data.data as UserProfile;
      
      // Check if push notifications are enabled
      setNotificationEnabled(profile.notificationPreferences?.push ?? true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Default to enabled if we can't fetch the profile
      setNotificationEnabled(true);
    }
  };

  const fetchNotifications = async () => {
    if (isUserLoading) {
      return;
    }

    if (!user) {
      return;
    }

    if (!notificationEnabled) {
      setNotifications([]);
      return;
    }
    
    try {
      setIsLoading(true);
      const headers = getAuthHeaders();
      if (!headers) {
        throw new Error('No auth headers available');
      }

      const response = await fetch('https://api.cashlyzer.com/api/notifications', {
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Failed to fetch notifications:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData?.message || 'Failed to fetch notifications');
      }

      const data = await response.json() as NotificationsResponse;

      // Validate the response data
      if (!data || !Array.isArray(data.notifications)) {
        console.error('Invalid notifications data format:', data);
        setNotifications([]);
        return;
      }

      // Validate each notification object
      const validNotifications = data.notifications.filter((notification): notification is Notification => {
        return (
          typeof notification === 'object' &&
          notification !== null &&
          typeof notification.id === 'string' &&
          typeof notification.type === 'string' &&
          ['savings_alert', 'budget_alert'].includes(notification.type) &&
          typeof notification.message === 'string' &&
          typeof notification.severity === 'string' &&
          ['low', 'medium', 'high'].includes(notification.severity) &&
          typeof notification.read === 'boolean' &&
          typeof notification.timestamp === 'string'
        );
      });

      setNotifications(validNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (isUserLoading) {
      return;
    }

    if (!user) {
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        throw new Error('No auth headers available');
      }

      const response = await fetch(`https://api.cashlyzer.com/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Failed to mark notification as read:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData?.message || 'Failed to mark notification as read');
      }

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (isUserLoading) {
      return;
    }

    if (!user) {
  
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        throw new Error('No auth headers available');
      }

      const response = await fetch('https://api.cashlyzer.com/api/notifications/read-all', {
        method: 'PATCH',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Failed to mark all notifications as read:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData?.message || 'Failed to mark all notifications as read');
      }
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteOldNotifications = async () => {
    if (isUserLoading) {
    
      return;
    }

    if (!user) {
    
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        throw new Error('No auth headers available');
      }

      const response = await fetch('https://api.cashlyzer.com/api/notifications/old', {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Failed to delete old notifications:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData?.message || 'Failed to delete old notifications');
      }


      // Clear notifications from state immediately
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error deleting old notifications:', error);
      toast.error('Failed to delete old notifications');
    }
  };

  // Fetch user profile and notifications when user is loaded
  useEffect(() => {
    if (!isUserLoading && user) {
      fetchUserProfile();
    }
  }, [isUserLoading, user]);

  // Only set up polling when we have a valid user and notifications are enabled
  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    if (!user) {
      return;
    }

    if (!notificationEnabled) {
      return;
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, [user, isUserLoading, notificationEnabled]);

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return `${Math.round(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {!isUserLoading && notificationEnabled && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <h4 className="text-sm font-medium">Notifications</h4>
          <div className="flex gap-2">
            {!isUserLoading && notificationEnabled && unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={markAllAsRead}
                disabled={isLoading}
              >
                Mark all as read
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={deleteOldNotifications}
              disabled={isLoading || isUserLoading}
            >
              Clear all
            </Button>
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {isUserLoading ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : !notificationEnabled ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Notifications are disabled. Enable them in settings.
            </div>
          ) : isLoading ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : !Array.isArray(notifications) || notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 px-4 py-3 cursor-pointer"
                onClick={() => markAsRead(notification.id)}
                disabled={isLoading}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`font-medium ${!notification.read ? 'font-bold' : ''}`}>
                    {notification.type === 'savings_alert' ? 'Savings Alert' : 'Budget Alert'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                {!notification.read && (
                  <div className={`h-2 w-2 rounded-full mt-1 ${
                    notification.severity === 'high' ? 'bg-destructive' :
                    notification.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-primary'
                  }`} />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 