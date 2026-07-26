"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useWMSStore } from "@/lib/store";
import { toast } from "sonner";
import {
  Warehouse,
  LogIn,
  Sparkles,
  Building2,
  Mail,
  Lock,
  Server,
  Activity,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const { setUserRole } = useWMSStore();
  const [email, setEmail] = React.useState("m.aurelius@apexlogistics.com");
  const [password, setPassword] = React.useState("••••••••");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [demoRole, setDemoRole] = React.useState<"customer" | "engineer">("customer");

  // Pre-fill fields when user toggles demo role is 
  React.useEffect(() => {
    if (demoRole === "customer") {
      setEmail("m.aurelius@apexlogistics.com");
    } else {
      setEmail("s.jenkins@enterprise-wms.com");
    }
  }, [demoRole]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setUserRole(demoRole);
      localStorage.setItem("wms-portal-state", JSON.stringify({ loggedIn: true, role: demoRole }));
      setIsLoading(false);
      toast.success(
        `Access granted. Welcome back, ${
          demoRole === "engineer" ? "Sarah Jenkins (Support Engineer)" : "Marcus Aurelius (Apex Logistics)"
        }!`
      );

      if (demoRole === "engineer") {
        router.push("/engineer");
      } else {
        router.push("/dashboard");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] text-slate-100 p-4 relative overflow-hidden font-sans">
      {/* High-tech ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
      
      {/* Technical Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Floating Glassmorphic Login Card */}
        <div className="p-8 md:p-10 rounded-2xl border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl shadow-2xl shadow-black/80 space-y-6">
          
          {/* Brand Logo & Name */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/10">
              <Warehouse className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white leading-tight">WMS Service Portal</h1>
              <p className="text-[9px] text-blue-400 uppercase tracking-widest font-bold">Enterprise Operations console</p>
            </div>
          </div>

          {/* Title Header */}
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              System Sign In
            </h2>
            <p className="text-[11px] text-slate-400 leading-normal max-w-xs mx-auto">
              Monitor active warehouse diagnostic metrics, check scanners status, and log tickets.
            </p>
          </div>

          {/* Quick Demo Segmented Tab Switcher */}
          <div className="p-1 rounded-xl bg-slate-950/90 border border-slate-900 flex flex-col gap-1.5 shadow-inner">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setDemoRole("customer")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center flex flex-col gap-0.5 cursor-pointer select-none ${
                  demoRole === "customer"
                    ? "bg-slate-900 text-white border border-slate-800 shadow-md font-semibold"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <span>Customer</span>
                <span className="text-[8px] font-normal opacity-70">Apex Logistics</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoRole("engineer")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center flex flex-col gap-0.5 cursor-pointer select-none ${
                  demoRole === "engineer"
                    ? "bg-slate-900 text-white border border-slate-800 shadow-md font-semibold"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <span>Support Engineer</span>
                <span className="text-[8px] font-normal opacity-70">Sarah Jenkins</span>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-850 bg-slate-900/60 text-slate-100 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:bg-slate-900 transition-all placeholder-slate-600"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[9px] text-blue-500 font-bold hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-850 bg-slate-900/60 text-slate-100 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:bg-slate-900 transition-all font-mono"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[10px] text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 text-blue-600 bg-slate-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                Remember this terminal profile
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/10 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/20 active:scale-[0.99] transition-all select-none duration-200"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" />
              Sign in to Console
            </Button>
          </form>

          {/* Footer security tag */}
          <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 border-t border-slate-900/60 pt-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>Secure 256-bit SSL encrypted terminal session</span>
          </div>

        </div>

        {/* Minimalist Telemetry Ticker Bar below Card */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950/60 border border-slate-900 rounded-xl text-[9px] font-bold text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>CHICAGO_P1A</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Server className="w-3 h-3 text-blue-500" />
              14 Devices
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-500" />
              12ms Ping
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
