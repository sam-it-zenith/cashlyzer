"use client";

import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuth } from "@/lib/auth";

export default function DashboardTour() {
  const { user } = useAuth();
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour
    const tourSeen = localStorage.getItem("dashboardTourSeen");
    if (!tourSeen && user) {
      startTour();
    }
  }, [user]);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: [
        {
          element: "#dashboard-welcome",
          popover: {
            title: "Welcome to Cashlyzer! 👋",
            description: "Your personal financial dashboard. Let's explore the key features that will help you manage your finances better.",
            side: "bottom",
            align: "start"
          },
        },
        {
          element: "#total-balance",
          popover: {
            title: "Financial Overview",
            description: "Get a quick snapshot of your monthly income, expenses, current balance, and budget utilization.",
            side: "bottom",
            align: "start"
          },
        },
        {
          element: "#income-expense-chart",
          popover: {
            title: "Income & Expenses Analysis",
            description: "Visualize your financial trends with interactive charts showing your income, expenses, and category breakdown.",
            side: "left",
            align: "center"
          },
        },
        {
          element: "#recent-transactions",
          popover: {
            title: "Recent Transactions",
            description: "View and manage your latest financial activities. You can add, edit, or delete transactions here.",
            side: "left",
            align: "center"
          },
        },
        {
          element: "#savings-goals",
          popover: {
            title: "AI Financial Insights",
            description: "Get smart analysis of your spending patterns, predictions, and personalized recommendations.",
            side: "top",
            align: "center"
          },
        },
        {
          element: "#sidebar",
          popover: {
            title: "Quick Actions",
            description: "Quickly add new transactions, generate reports, or access common features.",
            side: "bottom",
            align: "center"
          },
        },
        {
          element: "#sidebar",
          popover: {
            title: "Navigation Menu",
            description: "Access all features of Cashlyzer including expenses, income, savings, and settings.",
            side: "right",
            align: "center"
          },
        },
        {
          element: "#sidebar",
          popover: {
            title: "User Settings",
            description: "Customize your profile, preferences, currency, and account settings from settings page.",
            side: "left",
            align: "center"
          },
        }
      ],
      onDestroyed: () => {
        localStorage.setItem("dashboardTourSeen", "true");
        setHasSeenTour(true);
      }
    });

    driverObj.drive();
  };

  return null; // This is a utility component, no UI needed
}