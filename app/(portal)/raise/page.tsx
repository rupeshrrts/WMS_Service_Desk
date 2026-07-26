"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useWMSStore } from "@/lib/store";
import { TicketPriority, TicketCategory, Attachment } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { toast } from "sonner";
import { FileText, CheckCircle2, RefreshCw, HelpCircle, ShieldAlert } from "lucide-react";

export default function RaiseTicketPage() {
  const router = useRouter();
  const { currentUser, addTicket } = useWMSStore();

  // Form Fields State
  const [plant, setPlant] = React.useState("Plant A (Chicago)");
  const [warehouse, setWarehouse] = React.useState("WH-East-1");
  const [module, setModule] = React.useState("Picking");
  const [priority, setPriority] = React.useState<TicketPriority>("Medium");
  const [category, setCategory] = React.useState<TicketCategory>("Inventory");
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);

  // Validation States
  const [errors, setErrors] = React.useState<{ subject?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleReset = () => {
    setPlant("Plant A (Chicago)");
    setWarehouse("WH-East-1");
    setModule("Picking");
    setPriority("Medium");
    setCategory("Inventory");
    setSubject("");
    setDescription("");
    setAttachments([]);
    setErrors({});
    toast.info("Form reset complete.");
  };

  const handleFilesChange = (uploadedFiles: Attachment[]) => {
    setAttachments(uploadedFiles);
  };

  const validateForm = () => {
    const tempErrors: { subject?: string; description?: string } = {};
    if (!subject.trim()) {
      tempErrors.subject = "Subject title is required.";
    } else if (subject.length < 8) {
      tempErrors.subject = "Subject must be at least 8 characters long.";
    }

    if (!description.trim()) {
      tempErrors.description = "Detailed description is required.";
    } else if (description.length < 20) {
      tempErrors.description = "Please provide more details (at least 20 characters).";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the form errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      // Add ticket to Zustand store
      const newTicket = addTicket({
        subject,
        description,
        plant,
        warehouse,
        module,
        priority,
        category,
        attachments,
      });

      setIsSubmitting(false);
      toast.success(`Ticket ${newTicket.id} created successfully! Routing to support queues.`);
      router.push(`/tickets/${newTicket.id}`);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Raise WMS Incident</h1>
        <p className="text-sm text-muted-foreground">
          File support requests for RF scanning issues, ERP interface sync faults, or picking blockages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Container Left */}
        <div className="lg:col-span-8">
          <Card className="border-border/60">
            <CardHeader className="border-b border-border/30 pb-4 mb-6">
              <CardTitle className="text-base font-bold">Incident Information Form</CardTitle>
              <CardDescription>Fill out all operational details to expedite resolution.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Identity Pre-fills */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Reporter Name</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.name}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-muted/40 text-xs font-semibold text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Company</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.company}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-muted/40 text-xs font-semibold text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.email}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-muted/40 text-xs font-semibold text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Warehouse Location Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Target Plant</label>
                    <select
                      value={plant}
                      onChange={(e) => setPlant(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option>Plant A (Chicago)</option>
                      <option>Plant B (Rotterdam)</option>
                      <option>Plant C (Singapore)</option>
                      <option>Plant D (Houston)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Target Warehouse</label>
                    <select
                      value={warehouse}
                      onChange={(e) => setWarehouse(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option>WH-East-1</option>
                      <option>WH-West-2</option>
                      <option>WH-Singapore-3</option>
                      <option>WH-South-4</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">WMS Module</label>
                    <select
                      value={module}
                      onChange={(e) => setModule(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option>Picking</option>
                      <option>Putaway</option>
                      <option>Receiving</option>
                      <option>RF Scanning</option>
                      <option>ERP Interface</option>
                      <option>Conveyor Routing</option>
                    </select>
                  </div>
                </div>

                {/* Priority & Category Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Severity Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TicketPriority)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Low">Low (Printers, labels settings)</option>
                      <option value="Medium">Medium (Minor process blockages)</option>
                      <option value="High">High (Severe warehouse bottleneck)</option>
                      <option value="Critical">Critical (Production completely halted)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">System Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TicketCategory)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Inventory">Inventory (Lock issues, mismatches)</option>
                      <option value="Inbound">Inbound (Receiving audits)</option>
                      <option value="Outbound">Outbound (Picking, Packing slips)</option>
                      <option value="Hardware">Hardware (Thermal printers, RF scales)</option>
                      <option value="Integration">Integration (SAP ERP API sync, database)</option>
                      <option value="Shipping">Shipping (FedEx, UPS templates)</option>
                      <option value="System">System (LDAP credentials, admin controls)</option>
                    </select>
                  </div>
                </div>

                {/* Subject Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Subject Title</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Briefly summarize the incident (e.g. Outbound picking stuck in PENDING status in Aisle 8)"
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary bg-card ${
                      errors.subject ? "border-destructive focus:ring-destructive" : "border-border"
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-xs font-semibold text-destructive mt-1">{errors.subject}</p>
                  )}
                </div>

                {/* Description details */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Detailed Description</label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details of the problem. Include transaction numbers, serial IDs, error messages, and what steps were taken prior to the error."
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-card ${
                      errors.description ? "border-destructive focus:ring-destructive" : "border-border"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs font-semibold text-destructive mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Attachment Upload widget */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Log & Screenshot Attachments</label>
                  <FileUpload onFilesChange={handleFilesChange} maxFiles={3} />
                </div>

                {/* Form Action buttons */}
                <div className="flex gap-3 justify-end border-t border-border/30 pt-4 mt-6">
                  <Button
                    type="button"
                    onClick={handleReset}
                    variant="ghost"
                    className="text-muted-foreground hover:bg-muted text-xs font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Reset Form
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="text-xs font-bold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Submit Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Guidelines panel Right */}
        <div className="lg:col-span-4 space-y-6">
          {/* Priority guidelines */}
          <Card className="border-border/60">
            <CardHeader className="pb-2 border-b border-border/30 bg-muted/20">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4.5 h-4.5 text-blue-500" />
                <CardTitle className="text-sm font-bold">Severity SLG Guidelines</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              {[
                { level: "Critical", time: "4 Hours SLA", desc: "Complete system stoppage (e.g. picker logins blocked completely, conveyor loops locked)." },
                { level: "High", time: "12 Hours SLA", desc: "Severe bottleneck with manual bypass available (e.g. single divert lane jamming)." },
                { level: "Medium", time: "24 Hours SLA", desc: "Normal operational failure (e.g. count sheet constraints, minor barcode decodes)." },
                { level: "Low", time: "72 Hours SLA", desc: "Minor administrative adjustments (e.g. report format alignment, scanner roaming config)." }
              ].map((sla, idx) => (
                <div key={idx} className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className={
                      sla.level === "Critical" ? "text-destructive" :
                      sla.level === "High" ? "text-warning" :
                      sla.level === "Medium" ? "text-primary" : "text-slate-500"
                    }>
                      {sla.level} Severity
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{sla.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">{sla.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick FAQ accordion */}
          <Card className="border-border/60">
            <CardHeader className="pb-2 border-b border-border/30 bg-muted/20">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4.5 h-4.5 text-amber-500" />
                <CardTitle className="text-sm font-bold">FAQ Helper</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>My scanner reports LDAP errors?</AccordionTrigger>
                  <AccordionContent>
                    This is commonly due to AD server updates enforcing SSL. Refer to article **KB-1049** regarding updating LDAP to LDAPS port bindings.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2">
                  <AccordionTrigger>Conveyor diverted lane is full?</AccordionTrigger>
                  <AccordionContent>
                    Check if the PLC re-polling interval matches 200ms. If it has lagged to 2000ms, the system will miss the lane telemetry blockages.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3">
                  <AccordionTrigger>What attachments should I add?</AccordionTrigger>
                  <AccordionContent>
                    Always add screenshots of the WMS error dialog box, and export the transaction history trace logs in CSV format if possible.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
