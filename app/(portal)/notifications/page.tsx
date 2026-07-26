"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useWMSStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Bell,
  CheckCheck,
  CheckCircle,
  MessageSquare,
  AlertTriangle,
  Info,
  Calendar,
} from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useWMSStore();
  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  const displayedNotifs = React.useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    toast.success("All notifications marked as read.");
  };

  const handleNotifClick = (n: any) => {
    markNotificationRead(n.id);
    if (n.ticketId) {
      router.push(`/tickets/${n.ticketId}`);
    } else {
      toast.info(n.message);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
      case "danger":
        return <AlertTriangle className="w-4 h-4 text-destructive shrink-0 animate-bounce" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning shrink-0" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-primary shrink-0" />;
    }
  };

  const getNotifClass = (n: any) => {
    let classes = "p-4 border-b border-border/20 last:border-b-0 flex items-start gap-3 transition-colors cursor-pointer ";
    if (!n.read) {
      classes += "bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary";
    } else {
      classes += "hover:bg-muted/30 border-l-2 border-l-transparent";
    }
    return classes;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-sm text-muted-foreground">
            Track real-time updates regarding your filed incidents, SLA warning alerts, and system releases.
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            size="sm"
            className="h-9 text-xs font-bold border-border hover:bg-accent/40 mt-3 md:mt-0"
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* List Container Card */}
      <Card className="border-border/60 overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  filter === "all" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Alerts ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  filter === "unread" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Unread ({notifications.filter((n) => !n.read).length})
              </button>
            </div>
            <CardDescription className="text-xs">
              Showing {displayedNotifs.length} items
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {displayedNotifs.length === 0 ? (
            <div className="p-16 text-center text-xs text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto text-muted-foreground/30 mb-3" />
              No notifications matching the filter criteria.
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {displayedNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className={getNotifClass(n)}
                >
                  <div className="mt-0.5">{getNotifIcon(n.type)}</div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                        {n.title}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-semibold shrink-0">
                        {new Date(n.timestamp).toLocaleDateString()} {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {n.message}
                    </p>
                    {n.ticketId && (
                      <div className="pt-1.5">
                        <Badge variant="outline" className="text-[8px] py-0 px-1.5 font-bold hover:bg-accent/40">
                          Related Log: {n.ticketId}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
