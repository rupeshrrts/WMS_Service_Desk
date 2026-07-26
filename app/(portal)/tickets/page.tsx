"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useWMSStore } from "@/lib/store";
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from "lucide-react";

type SortField = "id" | "priority" | "createdDate" | "updatedDate";
type SortOrder = "asc" | "desc";

export default function MyTicketsPage() {
  const router = useRouter();
  const { tickets, userRole } = useWMSStore();

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("All");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("All");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All");

  // Sorting State
  const [sortField, setSortField] = React.useState<SortField>("createdDate");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Priority mapping value for numeric sorting
  const priorityWeight = (p: TicketPriority) => {
    switch (p) {
      case "Critical": return 4;
      case "High": return 3;
      case "Medium": return 2;
      case "Low": return 1;
      default: return 0;
    }
  };

  // Filter Tickets
  const filteredTickets = React.useMemo(() => {
    return tickets.filter((ticket) => {
      // Search term match
      const matchesSearch =
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter matches
      const matchesStatus = statusFilter === "All" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === "All" || ticket.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Sort Tickets
  const sortedTickets = React.useMemo(() => {
    const sorted = [...filteredTickets];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortField === "id") {
        comparison = a.id.localeCompare(b.id);
      } else if (sortField === "priority") {
        comparison = priorityWeight(a.priority) - priorityWeight(b.priority);
      } else if (sortField === "createdDate" || sortField === "updatedDate") {
        comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [filteredTickets, sortField, sortOrder]);

  // Paginated Tickets
  const paginatedTickets = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedTickets.slice(startIndex, startIndex + pageSize);
  }, [sortedTickets, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedTickets.length / pageSize) || 1;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleExportCSV = () => {
    toast.info("Preparing export file...");
    setTimeout(() => {
      const headers = ["ID", "Subject", "Reporter", "Company", "Category", "Priority", "Status", "Created Date", "Updated Date"];
      const rows = sortedTickets.map((t) => [
        t.id,
        `"${t.subject.replace(/"/g, '""')}"`,
        `"${t.customerName}"`,
        `"${t.company}"`,
        t.category,
        t.priority,
        t.status,
        t.createdDate,
        t.updatedDate,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `wms_service_tickets_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${sortedTickets.length} tickets successfully exported to CSV!`);
    }, 1000);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 text-muted-foreground/60 shrink-0" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 ml-1 text-primary shrink-0" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 ml-1 text-primary shrink-0" />
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Incident Logs</h1>
          <p className="text-sm text-muted-foreground">
            Search, sort, and filter historical and current warehouse system tickets.
          </p>
        </div>
        {userRole === "customer" && (
          <Button onClick={() => router.push("/raise")} className="h-9 font-semibold mt-3 md:mt-0">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Raise New Incident
          </Button>
        )}
      </div>

      {/* Main Table Card */}
      <Card className="border-border/60 overflow-hidden shadow-xs">
        <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base font-bold">Enterprise Incident Registry</CardTitle>
              <CardDescription>
                Found {sortedTickets.length} matching incident logs.
              </CardDescription>
            </div>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="text-xs font-bold text-foreground border-border hover:bg-accent/40 h-8 self-start md:self-auto"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Export Records
            </Button>
          </div>
        </CardHeader>

        {/* Filter Controls Row */}
        <div className="p-4 border-b border-border/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-muted/5">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ID, subject, desc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-card text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2 py-2 text-xs font-semibold rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">Status: All</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting for Customer">Waiting for Customer</option>
              <option value="Testing">Testing</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Rejected">Rejected</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-2 py-2 text-xs font-semibold rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">Priority: All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2 py-2 text-xs font-semibold rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">Category: All</option>
              <option value="Inventory">Inventory</option>
              <option value="Inbound">Inbound</option>
              <option value="Outbound">Outbound</option>
              <option value="Hardware">Hardware</option>
              <option value="Integration">Integration</option>
              <option value="Shipping">Shipping</option>
              <option value="System">System</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground text-[10px] uppercase font-bold tracking-wider text-left bg-muted/15 select-none">
                  <th
                    onClick={() => handleSort("id")}
                    className="py-3 px-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <span>Ticket ID</span>
                      {renderSortIndicator("id")}
                    </div>
                  </th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th
                    onClick={() => handleSort("priority")}
                    className="py-3 px-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <span>Priority</span>
                      {renderSortIndicator("priority")}
                    </div>
                  </th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Tech</th>
                  <th
                    onClick={() => handleSort("createdDate")}
                    className="py-3 px-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <span>Created Date</span>
                      {renderSortIndicator("createdDate")}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                      No records matched the active filter requirements.
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => router.push(`/tickets/${t.id}`)}
                      className="border-b border-border/20 last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors group"
                    >
                      {/* Ticket ID */}
                      <td className="py-3.5 px-4 font-bold text-foreground group-hover:text-primary transition-colors">
                        {t.id}
                      </td>

                      {/* Subject */}
                      <td className="py-3.5 px-4 min-w-[200px] max-w-[300px]">
                        <div className="flex flex-col">
                          <span className="font-semibold truncate text-foreground">{t.subject}</span>
                          <span className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
                            {t.plant} &bull; {t.warehouse}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-muted-foreground">
                        {t.category}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
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

                      {/* Status */}
                      <td className="py-3.5 px-4">
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

                      {/* Assigned Engineer */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-muted-foreground truncate max-w-[120px]">
                        {t.assignedEngineer ? t.assignedEngineer.split(" (")[0] : "Queue"}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-muted-foreground">
                        {new Date(t.createdDate).toLocaleDateString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Action trigger */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          onClick={() => router.push(`/tickets/${t.id}`)}
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 hover:bg-primary/10 hover:text-primary transition-all rounded-md"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Pagination Row */}
        <div className="border-t border-border/40 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-muted/15 font-sans">
          {/* Page Size selector */}
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-1.5 py-1 text-xs rounded border border-border bg-card font-bold text-foreground focus:outline-none"
            >
              <option value={5}>5 records</option>
              <option value={10}>10 records</option>
              <option value={15}>15 records</option>
            </select>
            <span>per page</span>
          </div>

          {/* Page Index Navigation */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <span className="text-xs font-semibold text-muted-foreground">
              Page <span className="text-foreground font-bold">{currentPage}</span> of{" "}
              <span className="text-foreground font-bold">{totalPages}</span>
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="w-7 h-7 text-foreground border-border hover:bg-accent/40"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-7 h-7 text-foreground border-border hover:bg-accent/40"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
