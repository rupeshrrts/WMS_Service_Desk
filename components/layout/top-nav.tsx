"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWMSStore } from "@/lib/store";
import { ThemeToggle } from "../theme-toggle";
import { Dialog, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Search,
  Bell,
  User,
  ChevronDown,
  Menu,
  Check,
  Ticket,
  BookOpen,
  ArrowRight,
  UserCheck,
} from "lucide-react";

interface TopNavProps {
  isCollapsed: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function TopNav({ isCollapsed, setMobileOpen }: TopNavProps) {
  const router = useRouter();
  const { userRole, currentUser, setUserRole, notifications, tickets, markNotificationRead } = useWMSStore();
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Command Menu Event Listener (Ctrl+K or Cmd+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleRoleToggle = () => {
    const targetRole = userRole === "customer" ? "engineer" : "customer";
    setUserRole(targetRole);
    setProfileDropdownOpen(false);
    
    // Auto redirect based on role
    if (targetRole === "engineer") {
      router.push("/engineer");
    } else {
      router.push("/dashboard");
    }
  };

  // Quick search filtration for Mock KB Articles & Tickets
  const matchedTickets = searchQuery
    ? tickets.filter(
        (t) =>
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b border-border/40 bg-background/80 backdrop-blur-md">
      {/* Mobile Drawer Trigger & Search indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-accent/40 text-muted-foreground cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Box (Trigger command menu) */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground border border-border/80 rounded-lg bg-card hover:bg-accent/30 w-64 text-left transition-all cursor-pointer shadow-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search tickets & KB...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-xs">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right navigation utilities */}
      <div className="flex items-center gap-2">
        {/* Mobile Search Button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex sm:hidden items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-accent/40 text-muted-foreground cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border/40 hover:bg-accent/40 text-muted-foreground relative cursor-pointer active:scale-95 transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive pulse-ring-blue" />
            )}
          </button>

          {notifDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
              <div className="absolute right-0 mt-2.5 w-80 rounded-xl border border-border bg-card shadow-lg z-50 py-2 animate-fade-in overflow-hidden">
                <div className="px-4 py-2 border-b border-border/40 flex items-center justify-between">
                  <span className="font-semibold text-sm">Notifications</span>
                  <Badge variant="danger" className="text-[10px]">
                    {unreadNotifs.length} new
                  </Badge>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {unreadNotifs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No unread notifications
                    </div>
                  ) : (
                    unreadNotifs.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          setNotifDropdownOpen(false);
                          if (n.ticketId) router.push(`/tickets/${n.ticketId}`);
                        }}
                        className="px-4 py-3 hover:bg-muted/30 border-b border-border/20 last:border-b-0 cursor-pointer flex flex-col gap-1 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-xs text-foreground truncate max-w-[190px]">{n.title}</span>
                          <span className="text-[9px] text-muted-foreground">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-border/40 px-4 py-2 text-center bg-muted/20">
                  <Link
                    href="/notifications"
                    onClick={() => setNotifDropdownOpen(false)}
                    className="text-xs text-primary font-semibold hover:underline flex items-center justify-center gap-1"
                  >
                    <span>View all notifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-lg border border-border/40 hover:bg-accent/40 cursor-pointer active:scale-95 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 uppercase">
              {currentUser.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="hidden lg:flex flex-col min-w-0">
              <span className="text-xs font-semibold leading-tight text-foreground truncate">{currentUser.name}</span>
              <span className="text-[10px] text-muted-foreground leading-tight truncate">{currentUser.company}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {profileDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
              <div className="absolute right-0 mt-2.5 w-64 rounded-xl border border-border bg-card shadow-lg z-50 py-1.5 animate-fade-in">
                {/* User Header */}
                <div className="px-4 py-3 border-b border-border/40">
                  <p className="text-xs font-bold text-foreground leading-tight">{currentUser.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate leading-normal mt-0.5">{currentUser.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Badge variant={userRole === "engineer" ? "purple" : "info"} className="text-[9px] py-0">
                      {userRole === "engineer" ? "Support Tech" : "Plant Operations"}
                    </Badge>
                  </div>
                </div>

                {/* Role Switcher Option */}
                <div className="p-2 border-b border-border/40 bg-muted/10">
                  <button
                    onClick={handleRoleToggle}
                    className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-primary hover:bg-primary/15 transition-all cursor-pointer text-left"
                  >
                    <UserCheck className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                      <span>Switch role environment</span>
                      <span className="text-[9px] text-muted-foreground font-normal">
                        Switch to {userRole === "customer" ? "Support Engineer" : "Customer Portal"}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Navigation links */}
                <div className="p-1.5 space-y-0.5">
                  <Link
                    href="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-all"
                  >
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>My Account Settings</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Global Command Menu Dialog */}
      <Dialog isOpen={searchOpen} onClose={() => setSearchOpen(false)}>
        <DialogHeader>
          <DialogTitle>WMS Desk Search Console</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tickets by ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-muted/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-card transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-1">
            {searchQuery === "" ? (
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Quick links</div>
                <div className="grid gap-2">
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      router.push(userRole === "engineer" ? "/engineer" : "/dashboard");
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 hover:bg-accent/40 text-sm font-medium text-left transition-all"
                  >
                    <User className="w-4 h-4 text-primary" />
                    <span>Go to Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      router.push("/tickets");
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 hover:bg-accent/40 text-sm font-medium text-left transition-all"
                  >
                    <Ticket className="w-4 h-4 text-emerald-500" />
                    <span>View Open Tickets</span>
                  </button>
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      router.push("/kb");
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 hover:bg-accent/40 text-sm font-medium text-left transition-all"
                  >
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <span>Browse Knowledge Base</span>
                  </button>
                </div>
              </div>
            ) : matchedTickets.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No matching tickets found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Matching Tickets ({matchedTickets.length})</div>
                {matchedTickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSearchOpen(false);
                      router.push(`/tickets/${t.id}`);
                    }}
                    className="flex items-center justify-between w-full p-3 border border-border rounded-lg bg-card hover:bg-accent/40 text-sm transition-all text-left group"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-foreground">{t.id}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[320px]">{t.subject}</span>
                    </div>
                    <Badge variant={t.priority === "Critical" ? "danger" : t.priority === "High" ? "warning" : "info"} className="group-hover:scale-105 transition-transform text-[9px] py-0">
                      {t.priority}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </header>
  );
}
