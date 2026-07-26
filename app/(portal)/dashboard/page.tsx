"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWMSStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Ticket,
  Clock,
  CheckCircle2,
  Lock,
  PlusCircle,
  FileText,
  Megaphone,
  BookOpen,
  ArrowRight,
  PhoneCall,
  Calendar,
  Settings,
} from "lucide-react";

export default function CustomerDashboard() {
  const router = useRouter();
  const { tickets, announcements, articles } = useWMSStore();

  // Metrics Calculations
  const openCount = tickets.filter(t => ["New", "Assigned", "In Progress", "Escalated"].includes(t.status)).length;
  const progressCount = tickets.filter(t => t.status === "In Progress").length;
  const resolvedCount = tickets.filter(t => t.status === "Resolved").length;
  const closedCount = tickets.filter(t => t.status === "Closed").length;

  // Recent 4 tickets
  const recentTickets = tickets.slice(0, 4);

  // Status distributions for chart
  const statusValues = {
    Open: tickets.filter(t => ["New", "Assigned", "In Progress", "Escalated"].includes(t.status)).length,
    Testing: tickets.filter(t => t.status === "Testing").length,
    Waiting: tickets.filter(t => t.status === "Waiting for Customer").length,
    Resolved: tickets.filter(t => ["Resolved", "Closed"].includes(t.status)).length,
  };
  const totalTickets = tickets.length || 1;

  const handleDownloadReport = () => {
    toast.info("Generating system dispatch report...");
    setTimeout(() => {
      // Mock CSV generation
      const headers = ["Ticket ID", "Subject", "Category", "Priority", "Status", "Created Date"];
      const rows = tickets.map(t => [t.id, `"${t.subject.replace(/"/g, '""')}"`, t.category, t.priority, t.status, t.createdDate]);
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `wms_tickets_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("WMS ticket inventory report downloaded successfully!");
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WMS Service Desk</h1>
          <p className="text-sm text-muted-foreground">
            Monitor open warehouse telemetry tickets and access support protocols.
          </p>
        </div>
        <div className="flex gap-2.5 mt-3 md:mt-0">
          <Button onClick={() => router.push("/raise")} className="h-9 font-semibold">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Raise Ticket
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Active Tickets", val: openCount, sub: "Requires attention", icon: Ticket, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
          { title: "In Progress", val: progressCount, sub: "Active investigations", icon: Clock, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
          { title: "Resolved", val: resolvedCount, sub: "Awaiting verification", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
          { title: "Closed", val: closedCount, sub: "Archive logs", icon: Lock, color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
        ].map((kpi, idx) => (
          <Card key={idx} className="overflow-hidden border border-border/60 hover:shadow-md hover:border-border transition-all">
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

      {/* Charts & Activity Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Analytics Section */}
        <Card className="lg:col-span-8 border-border/60">
          <CardHeader className="pb-2 border-b border-border/30">
            <CardTitle className="text-base font-bold">Ticket Distribution & Trends</CardTitle>
            <CardDescription>Visual state breakdown of current support tickets</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Status Pie Chart Representation using Beautiful custom SVG */}
            <div className="flex flex-col items-center justify-center p-3 border border-border/40 rounded-xl bg-muted/10">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 block">Status Distribution</span>
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* SVG circular donut chart */}
                <svg width="176" height="176" viewBox="0 0 40 40" className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle cx="20" cy="20" r="16" fill="transparent" stroke="var(--border)" strokeWidth="4" />
                  
                  {/* Slice 1: Open */}
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="transparent"
                    stroke="#2563eb"
                    strokeWidth="4"
                    strokeDasharray={`${(statusValues.Open / totalTickets) * 100.5} 100`}
                    strokeDashoffset={0}
                  />
                  {/* Slice 2: Testing */}
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="transparent"
                    stroke="#a855f7"
                    strokeWidth="4"
                    strokeDasharray={`${(statusValues.Testing / totalTickets) * 100.5} 100`}
                    strokeDashoffset={`-${(statusValues.Open / totalTickets) * 100}`}
                  />
                  {/* Slice 3: Waiting */}
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="4"
                    strokeDasharray={`${(statusValues.Waiting / totalTickets) * 100.5} 100`}
                    strokeDashoffset={`-${((statusValues.Open + statusValues.Testing) / totalTickets) * 100}`}
                  />
                  {/* Slice 4: Resolved */}
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeDasharray={`${(statusValues.Resolved / totalTickets) * 100.5} 100`}
                    strokeDashoffset={`-${((statusValues.Open + statusValues.Testing + statusValues.Waiting) / totalTickets) * 100}`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-foreground">{tickets.length}</span>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Total logs</span>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-6 w-full text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-600 block shrink-0" />
                  <span className="text-muted-foreground truncate">Open ({statusValues.Open})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-purple-500 block shrink-0" />
                  <span className="text-muted-foreground truncate">Testing ({statusValues.Testing})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 block shrink-0" />
                  <span className="text-muted-foreground truncate">Waiting ({statusValues.Waiting})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 block shrink-0" />
                  <span className="text-muted-foreground truncate">Resolved ({statusValues.Resolved})</span>
                </div>
              </div>
            </div>

            {/* Weekly trend mockup using elegant CSS bar grid */}
            <div className="flex flex-col justify-between border border-border/40 rounded-xl p-4 bg-muted/10">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Weekly Incoming Load</span>
                <span className="text-xs text-muted-foreground">Volume profile over past 5 weeks</span>
              </div>
              <div className="flex justify-between items-end h-28 pt-4 pb-1">
                {[
                  { label: "Wk 27", height: "h-[30%]", val: 4 },
                  { label: "Wk 28", height: "h-[45%]", val: 6 },
                  { label: "Wk 29", height: "h-[75%]", val: 10 },
                  { label: "Wk 30", height: "h-[60%]", val: 8 },
                  { label: "Wk 31", height: "h-[90%]", val: 12 },
                ].map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1 group">
                    <span className="text-[10px] font-bold text-foreground mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {bar.val}
                    </span>
                    <div className="w-6 bg-primary/20 hover:bg-primary/80 transition-all rounded-t-md duration-300 relative overflow-hidden flex flex-col justify-end h-20">
                      <div className={`w-full bg-primary ${bar.height} rounded-t-md`} />
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground mt-2">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base font-bold">Operator Desk Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid gap-2.5">
              <Button
                onClick={() => router.push("/raise")}
                variant="outline"
                className="w-full justify-start text-xs font-bold border-border hover:bg-accent/40 text-foreground"
              >
                <PlusCircle className="w-4 h-4 text-blue-500 mr-2 shrink-0" />
                Raise New WMS Ticket
              </Button>
              <Button
                onClick={() => router.push("/tickets")}
                variant="outline"
                className="w-full justify-start text-xs font-bold border-border hover:bg-accent/40 text-foreground"
              >
                <Ticket className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                View Active Tickets List
              </Button>
              <Button
                onClick={handleDownloadReport}
                variant="outline"
                className="w-full justify-start text-xs font-bold border-border hover:bg-accent/40 text-foreground"
              >
                <FileText className="w-4 h-4 text-purple-500 mr-2 shrink-0" />
                Export Ticket CSV Log
              </Button>
            </CardContent>
          </Card>

          {/* Announcements Card */}
          <Card className="border-border/60 overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/30 bg-muted/20">
              <div className="flex items-center gap-1.5">
                <Megaphone className="w-4.5 h-4.5 text-primary shrink-0" />
                <CardTitle className="text-base font-bold">Announcements</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {announcements.slice(0, 2).map((ann) => (
                <div key={ann.id} className="border-b border-border/30 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-semibold text-xs leading-snug">{ann.title}</span>
                    {ann.important && (
                      <Badge variant="danger" className="text-[8px] py-0 px-1 font-extrabold">Urgent</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 2: Recent Tickets & Knowledge Base Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Tickets Table */}
        <Card className="lg:col-span-8 border-border/60">
          <CardHeader className="pb-2 border-b border-border/30">
            <CardTitle className="text-base font-bold">Recent Ticket Logs</CardTitle>
            <CardDescription>Status summary of your recently filed incidents</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            {recentTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No tickets filed yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground text-[10px] uppercase font-bold tracking-wider text-left bg-muted/20">
                      <th className="py-2.5 px-4">Ticket ID</th>
                      <th className="py-2.5 px-4">Subject</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Priority</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Assigned Tech</th>
                      <th className="py-2.5 px-4 text-right">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => router.push(`/tickets/${t.id}`)}
                        className="border-b border-border/20 last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-4 font-bold text-foreground group-hover:text-primary transition-colors">{t.id}</td>
                        <td className="py-3 px-4 font-semibold max-w-[180px] md:max-w-xs truncate">{t.subject}</td>
                        <td className="py-3 px-4 text-xs font-semibold text-muted-foreground">{t.category}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              t.priority === "Critical"
                                ? "danger"
                                : t.priority === "High"
                                ? "warning"
                                : t.priority === "Medium"
                                ? "info"
                                : "secondary"
                            }
                            className="text-[9px] py-0"
                          >
                            {t.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              t.status === "New"
                                ? "default"
                                : t.status === "Resolved" || t.status === "Closed"
                                ? "success"
                                : t.status === "Waiting for Customer"
                                ? "warning"
                                : t.status === "Escalated"
                                ? "purple"
                                : "info"
                            }
                            className="text-[9px] py-0"
                          >
                            {t.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-muted-foreground truncate max-w-[100px]">
                          {t.assignedEngineer ? t.assignedEngineer.split(" (")[0] : "Queue"}
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-muted-foreground font-medium">
                          {new Date(t.updatedDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="border-t border-border/40 px-4 py-2.5 text-center bg-muted/20 rounded-b-lg">
              <Link href="/tickets" className="text-xs text-primary font-bold hover:underline flex items-center justify-center gap-1">
                <span>View all tickets logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* KB quick list & Support contacts */}
        <div className="lg:col-span-4 space-y-6">
          {/* KB list */}
          <Card className="border-border/60">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-base font-bold">Featured Knowledge</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid gap-3">
              {articles.slice(0, 3).map((art) => (
                <Link
                  key={art.id}
                  href="/kb"
                  className="flex gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors group text-left align-top"
                >
                  <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0 space-y-0.5">
                    <span className="font-semibold text-xs leading-snug group-hover:text-primary transition-colors block truncate">{art.title}</span>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{art.summary}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Support Contacts Card */}
          <Card className="border-border/60">
            <CardHeader className="pb-2 border-b border-border/30">
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-4.5 h-4.5 text-success shrink-0" />
                <CardTitle className="text-base font-bold">Emergency Hotlines</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              {[
                { name: "US Operations Support", num: "+1 (800) 555-0199", tag: "24/7" },
                { name: "EU Logistics Helpdesk", num: "+31 (20) 555-4022", tag: "Business Hours" }
              ].map((c, i) => (
                <div key={i} className="flex justify-between items-center text-xs font-sans">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{c.name}</span>
                    <span className="font-mono text-muted-foreground text-[10px] mt-0.5">{c.num}</span>
                  </div>
                  <Badge variant="secondary" className="text-[8px] tracking-normal font-extrabold uppercase py-0">{c.tag}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
