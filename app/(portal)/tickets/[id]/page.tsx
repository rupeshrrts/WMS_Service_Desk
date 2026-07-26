"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useWMSStore } from "@/lib/store";
import { TicketStatus, TicketPriority } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  Lock,
  CornerUpRight,
  UserCheck,
  AlertOctagon,
  Printer,
  File,
  Clock,
  Activity,
  CheckCircle,
  HelpCircle,
  FileCode,
} from "lucide-react";

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const {
    tickets,
    userRole,
    currentUser,
    addMessage,
    updateTicketStatus,
    escalateTicket,
    assignTicket,
    closeTicket,
    reopenTicket,
  } = useWMSStore();

  const ticket = tickets.find((t) => t.id === ticketId);

  // Editor states
  const [replyText, setReplyText] = React.useState("");
  const [isInternal, setIsInternal] = React.useState(false);
  const [msgAttachments, setMsgAttachments] = React.useState<any[]>([]);
  const [assigneeSelect, setAssigneeSelect] = React.useState("");

  React.useEffect(() => {
    if (ticket && ticket.assignedEngineer) {
      setAssigneeSelect(ticket.assignedEngineer);
    }
  }, [ticket]);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 font-sans text-center">
        <AlertOctagon className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Ticket Registry Error</h2>
        <p className="text-sm text-muted-foreground">The requested WMS ticket ID could not be loaded.</p>
        <Button onClick={() => router.push("/tickets")}>Return to active list</Button>
      </div>
    );
  }

  // Stepper steps configuration
  const steps: TicketStatus[] = ["New", "Assigned", "In Progress", "Testing", "Resolved", "Closed"];
  const currentStepIndex = steps.indexOf(ticket.status === "Escalated" || ticket.status === "Waiting for Customer" || ticket.status === "Rejected" ? "In Progress" : ticket.status);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && msgAttachments.length === 0) {
      toast.error("Please compose a reply message or select attachments.");
      return;
    }

    addMessage(ticketId, replyText, isInternal, msgAttachments);
    setReplyText("");
    setMsgAttachments([]);
    toast.success(isInternal ? "Internal engineering note appended." : "Conversation response dispatched.");
  };

  const handleEscalate = () => {
    escalateTicket(ticketId);
    toast.warning("Incident escalated to Aisha Rahman (WMS Lead).");
  };

  const handleAssign = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const engineer = e.target.value;
    setAssigneeSelect(engineer);
    assignTicket(ticketId, engineer);
    toast.success(`Ticket assigned to ${engineer.split(" (")[0]}.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:m-0 print:bg-white print:text-black">
      {/* Header action bar */}
      <div className="flex items-center gap-3 print:hidden">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="sm"
          className="h-8 text-xs font-bold border-border hover:bg-accent/40"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </Button>
        <span className="text-xs text-muted-foreground font-semibold">Incident Registry / {ticket.id}</span>
      </div>

      {/* Ticket Large Header Panel */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b border-border/40 pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-bold tracking-tight text-foreground print:text-lg">{ticket.id}</span>
            <Badge
              variant={
                ticket.priority === "Critical"
                  ? "danger"
                  : ticket.priority === "High"
                  ? "warning"
                  : ticket.priority === "Medium"
                  ? "info"
                  : "secondary"
              }
              className="text-[9px] uppercase font-bold py-0"
            >
              {ticket.priority} Priority
            </Badge>
            <Badge
              variant={
                ticket.status === "New"
                  ? "default"
                  : ticket.status === "Resolved" || ticket.status === "Closed"
                  ? "success"
                  : ticket.status === "Waiting for Customer"
                  ? "warning"
                  : ticket.status === "Escalated"
                  ? "purple"
                  : "info"
              }
              className="text-[9px] uppercase font-bold py-0"
            >
              Status: {ticket.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground leading-tight print:text-xl">{ticket.subject}</h1>
          <p className="text-xs text-muted-foreground print:text-black print:text-[10px]">
            Reported by {ticket.customerName} &bull; {ticket.company} &bull; {new Date(ticket.createdDate).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap shrink-0 print:hidden">
          <Button onClick={handlePrint} variant="outline" size="sm" className="h-9 border-border text-xs font-bold hover:bg-accent/40">
            <Printer className="w-3.5 h-3.5 mr-1" />
            Print Details
          </Button>

          {ticket.status !== "Closed" && ticket.status !== "Resolved" ? (
            <Button
              onClick={() => {
                closeTicket(ticket.id);
                toast.success("Incident closed.");
              }}
              variant="outline"
              size="sm"
              className="h-9 text-xs font-bold border-border hover:bg-destructive/10 hover:text-destructive"
            >
              <Lock className="w-3.5 h-3.5 mr-1" />
              Close Ticket
            </Button>
          ) : (
            <Button
              onClick={() => {
                reopenTicket(ticket.id);
                toast.success("Incident reopened.");
              }}
              variant="outline"
              size="sm"
              className="h-9 text-xs font-bold border-border hover:bg-accent/40"
            >
              <CornerUpRight className="w-3.5 h-3.5 mr-1" />
              Reopen Ticket
            </Button>
          )}
        </div>
      </div>

      {/* SLA Alert banner */}
      {ticket.status !== "Closed" && ticket.status !== "Resolved" && ticket.slaDeadline && (
        <div className="p-3.5 rounded-lg border border-warning/20 bg-warning/5 dark:bg-warning/10 text-warning text-xs font-semibold flex items-center gap-2 print:hidden">
          <Clock className="w-4 h-4 text-warning shrink-0" />
          <span>
            SLA Resolution Target: **{new Date(ticket.slaDeadline).toLocaleDateString()} {new Date(ticket.slaDeadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}** 
            {new Date(ticket.slaDeadline).getTime() < Date.now() ? " (SLA BREACH RISK HIGH)" : ""}
          </span>
        </div>
      )}

      {/* Main Grid: Details Stepper & Timeline vs Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left main content panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stepper Status tracker */}
          <Card className="border-border/60 print:hidden">
            <CardContent className="p-5 overflow-x-auto">
              <div className="flex justify-between items-center min-w-[500px] w-full text-xs">
                {steps.map((st, sIdx) => {
                  const isPassed = sIdx <= currentStepIndex;
                  const isCurrent = st === ticket.status;

                  return (
                    <div key={st} className="flex items-center flex-1 last:flex-initial">
                      <div className="flex flex-col items-center gap-1.5 relative">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold text-xs select-none ${
                            isCurrent
                              ? "bg-primary border-primary text-primary-foreground pulse-ring-blue"
                              : isPassed
                              ? "bg-success/15 border-success/35 text-success"
                              : "bg-muted border-border text-muted-foreground"
                          }`}
                        >
                          {isPassed && !isCurrent ? <CheckCircle className="w-4.5 h-4.5" /> : sIdx + 1}
                        </div>
                        <span className={`font-sans font-bold text-[10px] uppercase tracking-wider ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                          {st}
                        </span>
                      </div>
                      {sIdx < steps.length - 1 && (
                        <div
                          className={`flex-1 h-[2px] mx-4 -mt-3.5 ${
                            sIdx < currentStepIndex ? "bg-success/50" : "bg-border/60"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Conversation logs timeline */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base font-bold">Activity Discussion Thread</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Message loop */}
              <div className="divide-y divide-border/25 bg-muted/5 max-h-[500px] overflow-y-auto">
                {ticket.messages.map((msg) => {
                  const isEngineer = msg.role === "engineer";
                  const isNote = msg.isInternal;

                  return (
                    <div
                      key={msg.id}
                      className={`p-5 flex flex-col gap-2 ${
                        isNote
                          ? "bg-amber-500/5 dark:bg-amber-500/10 border-l-4 border-amber-500"
                          : isEngineer
                          ? "bg-primary/5 dark:bg-primary/5 border-l-4 border-primary/40"
                          : "border-l-4 border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 uppercase ${
                            isEngineer ? "bg-primary text-primary-foreground" : "bg-emerald-600 text-white"
                          }`}>
                            {msg.author.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="font-bold text-xs text-foreground">{msg.author}</span>
                          {isNote && (
                            <Badge variant="warning" className="text-[8px] py-0 tracking-wide font-extrabold uppercase">Internal Note Only</Badge>
                          )}
                          {!isNote && isEngineer && (
                            <Badge variant="info" className="text-[8px] py-0 tracking-wide font-semibold">Support Engineer</Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap pl-8">
                        {msg.content}
                      </p>

                      {/* Attachments inside messages */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 pl-8 mt-2">
                          {msg.attachments.map((file, fIdx) => (
                            <a
                              key={fIdx}
                              href={file.url}
                              className="inline-flex items-center gap-2 p-1.5 border border-border bg-card rounded-lg hover:border-primary/60 transition-colors text-xs text-muted-foreground"
                            >
                              <File className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="font-semibold text-foreground truncate max-w-[120px]">{file.name}</span>
                              <span className="text-[9px]">({file.size})</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Message Composition box */}
              {ticket.status !== "Closed" ? (
                <div className="p-5 border-t border-border/40 bg-card print:hidden">
                  <form onSubmit={handleSendReply} className="space-y-4">
                    {userRole === "engineer" && (
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none font-semibold">
                          <input
                            type="radio"
                            name="msg-type"
                            checked={!isInternal}
                            onChange={() => setIsInternal(false)}
                            className="text-primary focus:ring-0"
                          />
                          Customer Reply
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none font-semibold">
                          <input
                            type="radio"
                            name="msg-type"
                            checked={isInternal}
                            onChange={() => setIsInternal(true)}
                            className="text-amber-500 focus:ring-0"
                          />
                          <span className="text-amber-600 dark:text-amber-400 font-bold">Internal Note (Yellow)</span>
                        </label>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <textarea
                        rows={4}
                        placeholder={
                          isInternal
                            ? "Document internal engineering log notes (not visible to customer)..."
                            : "Compose conversation reply to customer..."
                        }
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className={`w-full p-3 border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-1 focus:bg-card/50 transition-all ${
                          isInternal ? "border-amber-500/40 focus:ring-amber-500" : "border-border focus:ring-primary"
                        }`}
                      />
                    </div>

                    {/* File Attachment Drop Box */}
                    <div className="space-y-1.5">
                      <FileUpload onFilesChange={(files) => setMsgAttachments(files)} maxFiles={2} />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" className="text-xs font-bold">
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        {isInternal ? "Add Internal Note" : "Send Reply"}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground bg-muted/10 border-t border-border/40 font-semibold flex items-center justify-center gap-1.5">
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  This ticket has been locked. Reopen the incident registry status to resume conversation.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side information panel */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          {/* Support Actions Box (Engineer only) */}
          {userRole === "engineer" && (
            <Card className="border-border/60">
              <CardHeader className="pb-2 border-b border-border/30 bg-muted/20">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4.5 h-4.5 text-primary" />
                  <CardTitle className="text-sm font-bold">Support Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Assign Select */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider block">Assigned Engineer</label>
                  <select
                    value={assigneeSelect}
                    onChange={handleAssign}
                    className="w-full px-2 py-2 text-xs font-semibold rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Unassigned (Queue)</option>
                    <option value="Sarah Jenkins (Senior Support)">Sarah Jenkins</option>
                    <option value="David Kim (Integration Expert)">David Kim</option>
                    <option value="Carlos Martinez (Hardware Specialist)">Carlos Martinez</option>
                    <option value="Aisha Rahman (WMS Lead)">Aisha Rahman</option>
                  </select>
                </div>

                {/* Status Switch */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider block">System Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["In Progress", "Testing", "Waiting for Customer", "Resolved"].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          updateTicketStatus(ticketId, st as TicketStatus);
                          toast.success(`Status updated to ${st}.`);
                        }}
                        className={`p-1.5 border rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer truncate ${
                          ticket.status === st
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-card border-border text-muted-foreground hover:border-border/80"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Escalate & Reject */}
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/30 pt-3.5">
                  <Button
                    onClick={handleEscalate}
                    variant="outline"
                    className="w-full text-[10px] font-bold h-7 border-border hover:bg-warning/10 hover:text-warning"
                    disabled={ticket.status === "Escalated"}
                  >
                    Escalate incident
                  </Button>
                  <Button
                    onClick={() => {
                      updateTicketStatus(ticket.id, "Rejected");
                      toast.error("Incident marked as Rejected.");
                    }}
                    variant="outline"
                    className="w-full text-[10px] font-bold h-7 border-border hover:bg-destructive/10 hover:text-destructive"
                    disabled={ticket.status === "Rejected"}
                  >
                    Reject ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ticket Information */}
          <Card className="border-border/60">
            <CardHeader className="pb-2 border-b border-border/30 bg-muted/20">
              <CardTitle className="text-sm font-bold">Ticket Specifications</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              {[
                { label: "Plant Location", val: ticket.plant },
                { label: "Warehouse ID", val: ticket.warehouse },
                { label: "Module Affected", val: ticket.module },
                { label: "System Category", val: ticket.category },
                { label: "Incident Assigned", val: ticket.assignedEngineer || "Unassigned Queue" },
                { label: "Incident Category", val: ticket.category }
              ].map((info, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground tracking-wide uppercase text-[9px]">{info.label}</span>
                  <span className="font-semibold text-foreground truncate max-w-[170px]">{info.val}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card className="border-border/60">
            <CardHeader className="pb-2 border-b border-border/30 bg-muted/20">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4.5 h-4.5 text-primary shrink-0" />
                <CardTitle className="text-sm font-bold">Activity Logs History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="relative border-l-2 border-border/40 pl-4 space-y-4 ml-1">
                {ticket.activities.map((act) => (
                  <div key={act.id} className="relative text-xs">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-border border-2 border-card" />
                    <div className="font-bold text-foreground leading-snug">{act.action}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      By {act.actor} &bull; {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
