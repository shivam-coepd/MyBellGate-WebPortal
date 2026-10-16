"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Receipt,
  LifeBuoy,
  Shield,
  MessageSquare,
  Calendar,
  Megaphone,
  Sparkles,
  QrCode,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Bell,
  Building,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import NotificationBell from "./NotificationBell";

interface AdminSidebarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  societyName?: string;
  societyLocation?: string;
}

export const ADMIN_NAV_ITEMS = [
  {
    key: "overview",
    label: "Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "users",
    label: "Users & Residents",
    href: "/admin/users",
    icon: Users,
  },
  {
    key: "buildings",
    label: "Buildings & Flats",
    href: "/admin/buildings",
    icon: Building2,
  },
  {
    key: "finance",
    label: "Finance & Invoices",
    href: "/admin/accounting",
    icon: Receipt,
  },
  {
    key: "helpdesk",
    label: "Helpdesk",
    href: "/admin/helpdesk",
    icon: LifeBuoy,
  },
  {
    key: "guards",
    label: "Guards",
    href: "/admin/guards",
    icon: Shield,
  },
  {
    key: "community",
    label: "Community",
    href: "/admin/community",
    icon: MessageSquare,
  },
  {
    key: "events",
    label: "Events",
    href: "/admin/events",
    icon: Calendar,
  },
  {
    key: "communications",
    label: "Announcements & Polls",
    href: "/admin/communications",
    icon: Megaphone,
  },
  {
    key: "amenities",
    label: "Amenities",
    href: "/admin/amenities",
    icon: Sparkles,
  },
  {
    key: "security",
    label: "Security Alerts",
    href: "/admin/security/alerts",
    icon: Shield,
  },
  {
    key: "daily-help",
    label: "Daily Help & Static QR",
    href: "/admin/visitors/daily-help",
    icon: QrCode,
  },
];

export default function AdminSidebar({
  currentTab,
  onTabChange,
  societyName,
  societyLocation,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Toggle Bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 flex items-center gap-2"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="text-sm font-semibold text-gray-800">Menu</span>
        </button>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={logout}
            className="text-xs bg-red-50 text-red-600 hover:bg-red-100 font-medium px-3 py-1.5 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo / Society Branding */}
          <div className="p-5 border-b border-gray-100">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Building className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <h2 className="text-base font-bold text-gray-900 truncate tracking-tight">
                  {societyName || user?.society_name || "MyGateBell"}
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  {societyLocation || "Society Admin Portal"}
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              Management
            </div>

            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isOverview = item.key === "overview";
              const isCurrentPage = isOverview
                ? pathname === "/admin/dashboard" && (!currentTab || currentTab === "overview")
                : pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));

              const handleClick = (e: React.MouseEvent) => {
                setMobileMenuOpen(false);
                if (pathname === "/admin/dashboard" && onTabChange && isOverview) {
                  e.preventDefault();
                  onTabChange("overview");
                }
              };

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={handleClick}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isCurrentPage
                      ? "bg-blue-600 text-white shadow-sm font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isCurrentPage ? "text-white" : "text-gray-400"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Footer with Profile & Logout */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {user?.name || "Administrator"}
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  {user?.role ? user.role.toUpperCase() : "ADMIN"}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
