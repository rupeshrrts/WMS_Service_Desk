"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWMSStore } from "@/lib/store";
import {
  LayoutDashboard,
  PlusCircle,
  Ticket,
  BookOpen,
  Megaphone,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Warehouse,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userRole, tickets, notifications, setUserRole } = useWMSStore();

  const activeTickets = tickets.filter(t => t.status !== "Closed" && t.status !== "Resolved").length;
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const links = [
    {
      name: "Dashboard",
      href: userRole === "engineer" ? "/engineer" : "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Raise Ticket",
      href: "/raise",
      icon: PlusCircle,
      customerOnly: true,
    },
    {
      name: "My Tickets",
      href: "/tickets",
      icon: Ticket,
      badge: activeTickets > 0 ? activeTickets : undefined,
      badgeColor: "bg-primary text-primary-foreground",
    },
    {
      name: "Knowledge Base",
      href: "/kb",
      icon: BookOpen,
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Megaphone,
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
      badgeColor: "bg-destructive text-destructive-foreground animate-pulse",
    },
  ];

  const bottomLinks = [
    {
      name: "Profile & Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    // Clear Zustand store / logout flow
    localStorage.removeItem("wms-portal-state");
    router.push("/login");
  };

  const navContent = (
    <div className="flex flex-col h-full bg-card border-r border-border/80">
      {/* Header / Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20 shrink-0">
            <Warehouse className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-sans font-bold text-sm leading-tight tracking-tight text-foreground">WMS Portal</span>
              <span className="font-sans text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Enterprise Service</span>
            </div>
          )}
        </Link>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-md border border-border bg-background hover:bg-accent text-muted-foreground cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 overflow-y-auto px-3 space-y-7">
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-sans">
              Main Menu
            </div>
          )}
          <nav className="space-y-1">
            {links
              .filter(link => !link.customerOnly || userRole === "customer")
              .map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const Icon = link.icon;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                    {!isCollapsed && <span className="truncate">{link.name}</span>}
                    
                    {/* Badge */}
                    {link.badge !== undefined && !isCollapsed && (
                      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${link.badgeColor}`}>
                        {link.badge}
                      </span>
                    )}

                    {/* Tooltip when collapsed */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border text-popover-foreground text-xs font-semibold rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                        {link.name}
                        {link.badge !== undefined && ` (${link.badge})`}
                      </div>
                    )}
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* User Role Quick Indicator */}
        {!isCollapsed && (
          <div className="mx-2 p-3.5 rounded-lg bg-muted/30 border border-border/40 text-xs font-sans">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Active Environment
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground truncate max-w-[110px]">
                {userRole === "engineer" ? "Support Engineer" : "Customer Portal"}
              </span>
              <span className={`w-2 h-2 rounded-full ${userRole === "engineer" ? "bg-indigo-500 animate-pulse" : "bg-success"}`} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Action */}
      <div className="p-4 border-t border-border/40 space-y-1">
        {bottomLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              }`}
            >
              <Icon className="w-4.5 h-4.5 text-muted-foreground group-hover:text-foreground" />
              {!isCollapsed && <span className="truncate">{link.name}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border text-popover-foreground text-xs font-semibold rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                  {link.name}
                </div>
              )}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group relative cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5 text-muted-foreground group-hover:text-destructive" />
          {!isCollapsed && <span>Log Out</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
              Log Out
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar wrapper */}
      <aside
        className={`hidden md:block h-screen fixed left-0 top-0 z-20 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {navContent}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute -right-3 top-5 flex items-center justify-center w-6 h-6 rounded-full border border-border bg-background hover:bg-accent text-muted-foreground cursor-pointer z-30"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-64 h-full z-50 animate-slide-in">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
