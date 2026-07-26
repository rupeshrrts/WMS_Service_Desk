"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWMSStore } from "@/lib/store";
import { Ticket, TicketStatus } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ShieldAlert,
  ClipboardList,
  BarChart4,
  CalendarDays,
  UserCheck,
  Zap,
  TrendingUp,
  MessageSquare,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function EngineerDashboard() {
  const router = useRouter();
  const { tickets, userRole, assignTicket } = useWMSStore();

  // Route block for security (in case user switches paths directly)
  React.useEffect(() => {
    if (userRole !== "engineer") {
      router.push("/dashboard");
    }
  }, [userRole, router]);

  // Support Engineer Metrics
  const assignedTickets = tickets.filter(
    (t) => t.assignedEngineer === "Sarah Jenkins (Senior Support)" && t.status !== "Closed" && t.status !== "Resolved"
  );
  const pendingCount = assignedTickets.length;
  const criticalCount = tickets.filter((t) => ["High", "Critical"].includes(t.priority) && t.status !== "Closed" && t.status !== "Resolved").length;
  
  // Simulated SLA breaching (e.g. deadline is less than 6 hours from now)
  const slaBreachCount = tickets.filter((t) => {
    if (t.status === "Closed" || t.status === "Resolved" || !t.slaDeadline) return false;
    const hoursLeft = (new Date(t.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft < 12; // less than 12 hours left
  }).length;

  const workloadByModule = {
    Picking: tickets.filter((t) => t.module === "Picking" && t.status !== "Closed").length,
    Scanning: tickets.filter((t) => t.module === "RF Scanning" && t.status !== "Closed").length,
    Integration: tickets.filter((t) => t.module === "ERP Interface" && t.status !== "Closed").length,
    Routing: tickets.filter((t) => t.module === "Conveyor Routing" && t.status !== "Closed").length,
  };

  const recentReplies = tickets
    .filter((t) => t.status === "In Progress" || t.status === "Waiting for Customer")
    .slice(0, 3);

  // Calendar dates mock
  const calendarSchedules = [
    { title: "WMS Core Upgrade (v12.4.0)", date: "Aug 1", time: "02:00 UTC", type: "system" },
    { title: "Zebra scanner roaming driver updates", date: "Jul 29", time: "08:30 CET", type: "driver" },
    { title: "SQL index database rebuild", date: "Aug 2", time: "01:00 UTC", type: "maintenance" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b border-border/30 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Support Engineering Console</h1>
            <Badge variant="purple" className="text-[10px] animate-pulse">Sarah Jenkins Active</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Review workload balance, track critical SLA tickets, and manage assigned queue items.
          </p>
        </div>
      </div>

      {/* SLA Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "My Assigned Queue", val: pendingCount, sub: "Action required", icon: ClipboardList, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
          { title: "Risk SLA Breach", val: slaBreachCount, sub: "Due < 12 hours", icon: Clock, color: "text-destructive bg-destructive/10 border-destructive/20 animate-pulse" },
          { title: "System Criticals", val: criticalCount, sub: "Open global tickets", icon: ShieldAlert, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
          { title: "SLA Success Rate", val: "97.8%", sub: "MTTR: 2.4 Hours", icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
        ].map((kpi, idx) => (
          <Card key={idx} className="overflow-hidden border-border/60 hover:shadow-md hover:border-border transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1.5 min-w-0">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block truncate">{kpi.title}</span>
                <span className="text-3xl font-extrabold tracking-tight text-foreground block">{kpi.val}</span>
                <span className="text-[10px] text-muted-foreground font-semibold block truncate">{kpi.sub}</span>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Queue tabs vs Workload analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket Queue list */}
        <Card className="lg:col-span-8 border-border/60 overflow-hidden shadow-xs">
          <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
            <CardTitle className="text-base font-bold">WMS Incident Dispatch Desk</CardTitle>
            <CardDescription>Filter tickets by queue parameters</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <Tabs defaultValue="my-tickets">
              <div className="px-4 border-b border-border/30 pb-2">
                <TabsList className="w-full justify-start max-w-sm">
                  <TabsTrigger value="my-tickets">Assigned to Me ({pendingCount})</TabsTrigger>
                  <TabsTrigger value="unassigned">Unassigned Queue ({tickets.filter(t => !t.assignedEngineer).length})</TabsTrigger>
                  <TabsTrigger value="all-open">All Open Tickets ({tickets.filter(t => t.status !== "Closed" && t.status !== "Resolved").length})</TabsTrigger>
                </TabsList>
              </div>

              {/* Tab: Assigned to Me */}
              <TabsContent value="my-tickets" className="mt-0">
                {assignedTickets.length === 0 ? (
                  <div className="p-12 text-center text-xs text-muted-foreground">
                    No tickets assigned to you are currently open. Great work!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-sans text-left">
                      <thead>
                        <tr className="border-b border-border/40 text-muted-foreground text-[10px] uppercase font-bold tracking-wider text-left bg-muted/20">
                          <th className="py-2.5 px-4">Ticket ID</th>
                          <th className="py-2.5 px-4">Subject</th>
                          <th className="py-2.5 px-4">Priority</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4">Plant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedTickets.map((t) => (
                          <tr
                            key={t.id}
                            onClick={() => router.push(`/tickets/${t.id}`)}
                            className="border-b border-border/20 last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors group"
                          >
                            <td className="py-3.5 px-4 font-bold text-foreground group-hover:text-primary transition-colors">{t.id}</td>
                            <td className="py-3.5 px-4 font-semibold truncate max-w-[200px]">{t.subject}</td>
                            <td className="py-3.5 px-4">
                              <Badge variant={t.priority === "Critical" ? "danger" : t.priority === "High" ? "warning" : "info"} className="text-[9px] py-0">
                                {t.priority}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge variant="secondary" className="text-[9px] py-0">{t.status}</Badge>
                            </td>
                            <td className="py-3.5 px-4 text-xs font-semibold text-muted-foreground">{t.plant.split(" (")[0]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              {/* Tab: Unassigned Queue */}
              <TabsContent value="unassigned" className="mt-0">
                {tickets.filter(t => !t.assignedEngineer).length === 0 ? (
                  <div className="p-12 text-center text-xs text-muted-foreground">
                    All incoming tickets have been assigned to technicians.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-sans text-left">
                      <thead>
                        <tr className="border-b border-border/40 text-muted-foreground text-[10px] uppercase font-bold tracking-wider text-left bg-muted/20">
                          <th className="py-2.5 px-4">Ticket ID</th>
                          <th className="py-2.5 px-4">Subject</th>
                          <th className="py-2.5 px-4">Priority</th>
                          <th className="py-2.5 px-4">Category</th>
                          <th className="py-2.5 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets
                          .filter((t) => !t.assignedEngineer)
                          .map((t) => (
                            <tr
                              key={t.id}
                              onClick={() => router.push(`/tickets/${t.id}`)}
                              className="border-b border-border/20 last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors group"
                            >
                              <td className="py-3.5 px-4 font-bold text-foreground group-hover:text-primary transition-colors">{t.id}</td>
                              <td className="py-3.5 px-4 font-semibold truncate max-w-[200px]">{t.subject}</td>
                              <td className="py-3.5 px-4">
                                <Badge variant={t.priority === "Critical" ? "danger" : t.priority === "High" ? "warning" : "info"} className="text-[9px] py-0">
                                  {t.priority}
                                </Badge>
                              </td>
                              <td className="py-3.5 px-4 text-xs font-semibold text-muted-foreground">{t.category}</td>
                              <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  onClick={() => {
                                    assignTicket(t.id, "Sarah Jenkins (Senior Support)");
                                    toast.success(`Ticket ${t.id} assigned to you.`);
                                  }}
                                  size="sm"
                                  className="h-7 px-2.5 text-[10px] font-bold"
                                >
                                  Claim
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              {/* Tab: All Open Tickets */}
              <TabsContent value="all-open" className="mt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-sans text-left">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground text-[10px] uppercase font-bold tracking-wider text-left bg-muted/20">
                        <th className="py-2.5 px-4">Ticket ID</th>
                        <th className="py-2.5 px-4">Subject</th>
                        <th className="py-2.5 px-4">Priority</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Assigned Engineer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets
                        .filter((t) => t.status !== "Closed" && t.status !== "Resolved")
                        .map((t) => (
                          <tr
                            key={t.id}
                            onClick={() => router.push(`/tickets/${t.id}`)}
                            className="border-b border-border/20 last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors group"
                          >
                            <td className="py-3.5 px-4 font-bold text-foreground group-hover:text-primary transition-colors">{t.id}</td>
                            <td className="py-3.5 px-4 font-semibold truncate max-w-[200px]">{t.subject}</td>
                            <td className="py-3.5 px-4">
                              <Badge variant={t.priority === "Critical" ? "danger" : t.priority === "High" ? "warning" : "info"} className="text-[9px] py-0">
                                {t.priority}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge
                                variant={t.status === "Waiting for Customer" ? "warning" : t.status === "Escalated" ? "purple" : "info"}
                                className="text-[9px] py-0"
                              >
                                {t.status}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-xs font-semibold text-muted-foreground">
                              {t.assignedEngineer ? t.assignedEngineer.split(" (")[0] : "Queue"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
            <div className="border-t border-border/40 px-4 py-2.5 text-center bg-muted/20 rounded-b-lg">
              <Link href="/tickets" className="text-xs text-primary font-bold hover:underline flex items-center justify-center gap-1">
                <span>View historical archives</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Workload analysis charts */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-2 border-b border-border/30 bg-muted/20">
              <div className="flex items-center gap-1.5">
                <BarChart4 className="w-4.5 h-4.5 text-primary" />
                <CardTitle className="text-sm font-bold">Queue Load by Module</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              {[
                { label: "Outbound / Picking", val: workloadByModule.Picking, color: "bg-blue-500", pct: "w-[80%]" },
                { label: "RF Terminals / Scanning", val: workloadByModule.Scanning, color: "bg-amber-500", pct: "w-[40%]" },
                { label: "ERP Interfaces / API", val: workloadByModule.Integration, color: "bg-purple-500", pct: "w-[60%]" },
                { label: "Conveyor diverts / PLC", val: workloadByModule.Routing, color: "bg-emerald-500", pct: "w-[50%]" },
              ].map((w, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-muted-foreground">{w.label}</span>
                    <span className="text-foreground font-bold">{w.val} tickets</span>
                  </div>
                  <div className="w-full bg-muted border border-border/40 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${w.color} ${w.pct} rounded-full`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Maintenance Calendar */}
          <Card className="border-border/60">
            <CardHeader className="pb-2 border-b border-border/30 bg-muted/20">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4.5 h-4.5 text-success" />
                <CardTitle className="text-sm font-bold">Release & Upgrade Calendar</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {calendarSchedules.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs border-b border-border/20 pb-3.5 last:border-b-0 last:pb-0">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-muted text-center border border-border/60 shrink-0">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase leading-none">{item.date.split(" ")[0]}</span>
                    <span className="text-sm font-black text-foreground leading-none mt-1">{item.date.split(" ")[1]}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground block leading-tight">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground block font-mono">{item.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
