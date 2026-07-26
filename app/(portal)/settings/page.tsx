"use client";

import * as React from "react";
import { useWMSStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, MapPin, Bell, Shield, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const { currentUser, userRole, setCurrentUser } = useWMSStore();

  const [name, setName] = React.useState(currentUser.name);
  const [email, setEmail] = React.useState(currentUser.email);
  const [plant, setPlant] = React.useState(currentUser.plant);
  const [warehouse, setWarehouse] = React.useState(currentUser.warehouse);

  // Notification states
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [slaAlerts, setSlaAlerts] = React.useState(true);

  // Security
  const [mfa, setMfa] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      name,
      company: currentUser.company,
      email,
      plant,
      warehouse,
    });
    toast.success("User account preferences saved successfully!");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Preferences</h1>
        <p className="text-sm text-muted-foreground">
          Modify default operational details, email alerts, and security profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side menu summaries */}
        <div className="md:col-span-1 space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary mx-auto uppercase">
                {currentUser.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{currentUser.name}</h3>
                <p className="text-xs text-muted-foreground">{currentUser.company}</p>
              </div>
              <div className="pt-2">
                <Badge variant={userRole === "engineer" ? "purple" : "info"} className="text-[9px]">
                  {userRole === "engineer" ? "Support Engineer" : "Plant Operations Manager"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Settings Columns */}
        <div className="md:col-span-2 space-y-6">
          {/* Details Form */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-bold">Profile Configurations</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-foreground uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-foreground uppercase tracking-wider block">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/20 pt-4">
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-foreground uppercase tracking-wider block">Default Plant</label>
                    <select
                      value={plant}
                      onChange={(e) => setPlant(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option>Plant A (Chicago)</option>
                      <option>Plant B (Rotterdam)</option>
                      <option>Plant C (Singapore)</option>
                      <option>Plant D (Houston)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-foreground uppercase tracking-wider block">Default Warehouse</label>
                    <select
                      value={warehouse}
                      onChange={(e) => setWarehouse(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option>WH-East-1</option>
                      <option>WH-West-2</option>
                      <option>WH-Singapore-3</option>
                      <option>WH-South-4</option>
                      <option>WH-All</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end border-t border-border/20 pt-4">
                  <Button type="submit" size="sm" className="text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Save Preferences
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Alert Toggles */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
              <div className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-500" />
                <CardTitle className="text-sm font-bold">Alert Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-start justify-between text-xs font-sans">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="font-bold text-foreground block">Email Notifications</span>
                  <span className="text-muted-foreground text-[11px] block">Receive immediate email alerts when tickets receive support responses.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => {
                    setEmailAlerts(e.target.checked);
                    toast.success(`Email updates ${e.target.checked ? "enabled" : "disabled"}.`);
                  }}
                  className="rounded border-border text-primary cursor-pointer mt-1"
                />
              </div>

              <div className="flex items-start justify-between text-xs font-sans border-t border-border/20 pt-4">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="font-bold text-foreground block">SLA Warning Prompts</span>
                  <span className="text-muted-foreground text-[11px] block">Receive high priority warnings when critical tickets are nearing SLA deadlines.</span>
                </div>
                <input
                  type="checkbox"
                  checked={slaAlerts}
                  onChange={(e) => {
                    setSlaAlerts(e.target.checked);
                    toast.success(`SLA alerts ${e.target.checked ? "enabled" : "disabled"}.`);
                  }}
                  className="rounded border-border text-primary cursor-pointer mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security details */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-500" />
                <CardTitle className="text-sm font-bold">Credential Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between text-xs font-sans">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="font-bold text-foreground block">Multi-Factor Authentication (MFA)</span>
                  <span className="text-muted-foreground text-[11px] block">Enforce authentication verification on every new console sign-in session.</span>
                </div>
                <input
                  type="checkbox"
                  checked={mfa}
                  onChange={(e) => {
                    setMfa(e.target.checked);
                    toast.info(`MFA verification setup is simulated.`);
                  }}
                  className="rounded border-border text-primary cursor-pointer mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
