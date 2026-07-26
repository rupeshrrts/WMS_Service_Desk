"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { useWMSStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { userRole } = useWMSStore();
  const router = useRouter();

  // Redirect to login if userRole not loaded or initialized (for demo safety, though store auto-persists)
  React.useEffect(() => {
    const isLogged = localStorage.getItem("wms-portal-state");
    if (!isLogged) {
      // In case they directly enter or refresh without state, forward to login
      // but let's allow automatic state initialisation
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Panel wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? "md:pl-16" : "md:pl-64"
        }`}
      >
        {/* Top Navbar */}
        <TopNav isCollapsed={isCollapsed} setMobileOpen={setMobileOpen} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto animate-fade-in max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
