"use client";

import * as React from "react";
import { useWMSStore } from "@/lib/store";
import { KBArticle, TicketCategory } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Search,
  BookOpen,
  ThumbsUp,
  Eye,
  Calendar,
  X,
  Tag,
  HelpCircle,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function KnowledgeBasePage() {
  const { articles } = useWMSStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [activeArticle, setActiveArticle] = React.useState<KBArticle | null>(null);

  // Filter Articles
  const filteredArticles = React.useMemo(() => {
    return articles.filter((art) => {
      const matchesSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory]);

  const categories = [
    "All",
    "Inventory",
    "Inbound",
    "Outbound",
    "Hardware",
    "Integration",
    "Shipping",
    "System",
  ];

  // Helper parser to render mock article markdown to premium HTML layout
  const parseMarkdown = (markdown: string) => {
    const lines = markdown.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-2xl font-black text-foreground border-b border-border/40 pb-2 mt-6 mb-3">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-lg font-bold text-foreground mt-5 mb-2.5">{line.replace("## ", "")}</h2>;
      }
      // Bullet points
      if (line.startsWith("* ")) {
        return (
          <ul key={idx} className="list-disc pl-5 my-1.5 text-xs text-muted-foreground space-y-1">
            <li className="font-semibold">{line.replace("* ", "")}</li>
          </ul>
        );
      }
      // Numbered items
      if (/^\d+\./.test(line)) {
        return (
          <ol key={idx} className="list-decimal pl-5 my-1.5 text-xs text-muted-foreground space-y-1">
            <li className="font-semibold">{line.replace(/^\d+\.\s*/, "")}</li>
          </ol>
        );
      }
      // Code lines
      if (line.startsWith("`") || line.startsWith("    ")) {
        return (
          <pre key={idx} className="p-3 my-3 bg-muted border border-border/40 rounded-lg text-xs text-foreground font-mono overflow-x-auto leading-relaxed">
            <code>{line.replace(/`/g, "")}</code>
          </pre>
        );
      }
      // Standard line
      if (line.trim() === "") return <div key={idx} className="h-2" />;
      return <p key={idx} className="text-xs text-muted-foreground leading-relaxed my-2">{line}</p>;
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Knowledge Base</h1>
        <p className="text-sm text-muted-foreground">
          Query self-service manuals, RF configuration guides, and ERP integration sync guidelines.
        </p>
      </div>

      {/* Main search and category grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left main articles column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Live Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by keyword, tag, or article text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold shadow-xs"
            />
          </div>

          {/* Articles list */}
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <Card className="p-12 text-center text-xs text-muted-foreground border-dashed">
                <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                No documentation matches your query. Try searching with alternative tags.
              </Card>
            ) : (
              filteredArticles.map((art) => (
                <Card
                  key={art.id}
                  onClick={() => setActiveArticle(art)}
                  className="border-border/60 hover:border-primary/40 hover:shadow-md cursor-pointer transition-all duration-200 group"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <Badge variant="secondary" className="text-[9px] font-bold py-0.5 tracking-wider">
                        {art.category}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(art.lastUpdated).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground mt-2 group-hover:text-primary transition-colors">
                      {art.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
                      {art.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 pt-1 flex items-center justify-between border-t border-border/10 mt-3">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 min-w-0">
                      {art.tags.slice(0, 3).map((t) => (
                        <span key={t} className="inline-flex items-center text-[9px] font-bold text-muted-foreground/80 bg-muted/60 px-1.5 py-0.5 rounded border border-border/20">
                          <Tag className="w-2 h-2 mr-0.5" />
                          {t}
                        </span>
                      ))}
                    </div>
                    {/* Stats */}
                    <div className="flex items-center gap-3 shrink-0 text-[10px] text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {art.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {art.likes}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right side category filtration */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-2 border-b border-border/30 bg-muted/20">
              <CardTitle className="text-sm font-bold">Category Navigator</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 p-2">
              <div className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick FAQ summary */}
          <Card className="border-border/60">
            <CardHeader className="pb-2 border-b border-border/30 bg-muted/20">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4.5 h-4.5 text-amber-500" />
                <CardTitle className="text-sm font-bold">Frequently Consulted</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              {[
                { q: "Scanner Roaming Settings", link: "Resolving Zebra Scanner Roaming Disconnections" },
                { q: "SAP Locking Parts", link: "Troubleshooting ERP Sync Failure (Error: SAP_LOCKED_PART)" },
                { q: "Dynamic Slotting", link: "Outbound Picking Bottlenecks: Dynamic Slotting Recommendations" }
              ].map((faq, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const art = articles.find((a) => a.title === faq.link);
                    if (art) setActiveArticle(art);
                  }}
                  className="group flex items-start gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary mt-0.5" />
                  <span className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors group-hover:underline">
                    {faq.q}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Article Read Modal Overlay */}
      {activeArticle && (
        <Dialog isOpen={!!activeArticle} onClose={() => setActiveArticle(null)}>
          <DialogHeader>
            <div className="flex items-center justify-between pb-2">
              <Badge variant="info">{activeArticle.category}</Badge>
              <span className="text-[10px] text-muted-foreground font-semibold">
                Updated {new Date(activeArticle.lastUpdated).toLocaleDateString()}
              </span>
            </div>
            <DialogTitle className="text-lg font-black leading-tight text-foreground pr-6">
              {activeArticle.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 border-b border-border/20">
            <div className="text-xs text-foreground bg-muted/30 border border-border/30 rounded-lg p-3 italic leading-relaxed">
              {activeArticle.summary}
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {parseMarkdown(activeArticle.content)}
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 text-[10px] text-muted-foreground font-semibold">
            <div className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>{activeArticle.tags.join(", ")}</span>
            </div>
            <Button
              onClick={() => {
                toast.success("Feedback recorded. Thanks!");
                setActiveArticle(null);
              }}
              variant="outline"
              size="sm"
              className="h-8 text-xs font-bold border-border text-foreground hover:bg-accent/40"
            >
              <ThumbsUp className="w-3.5 h-3.5 mr-1" />
              Helpful
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
