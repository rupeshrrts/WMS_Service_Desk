"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWMSStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { userRole } = useWMSStore();

  useEffect(() => {
    const isLogged = localStorage.getItem("wms-portal-state");
    if (!isLogged) {
      router.push("/login");
    } else {
      router.push(userRole === "engineer" ? "/engineer" : "/dashboard");
    }
  }, [router, userRole]);

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm text-muted-foreground font-medium">Loading WMS Service Portal...</span>
      </div>
    </div>
  );
}
