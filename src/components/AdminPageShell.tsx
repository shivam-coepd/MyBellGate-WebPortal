"use client";

import React, { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../contexts/AuthContext";

interface AdminPageShellProps {
  children: ReactNode;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function AdminPageShell({
  children,
  icon,
  title,
  subtitle,
  actions,
}: AdminPageShellProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Consistent Left Sidebar */}
      <AdminSidebar />

      {/* Main Content Area (offset by fixed left sidebar on desktop) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Consistent Top Header across all admin pages (No back button) */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs">
          <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 flex-shrink-0">
                    {icon}
                  </div>
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Right side: custom page actions + Notification Bell + Logout */}
              <div className="flex items-center gap-3 flex-wrap">
                {actions}
                <NotificationBell />
                <button
                  onClick={logout}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
