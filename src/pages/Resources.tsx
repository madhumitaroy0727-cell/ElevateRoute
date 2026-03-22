import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useResources, useBookmarks } from "@/hooks/use-data";
import { useQueryClient } from "@tanstack/react-query";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Star,
  Video,
  FileText,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  type: "course" | "article" | "video" | "guide" | "project";
  category: string | null;
  provider: string | null;
  is_free: boolean;
  rating: number | null;
}

const typeIcons: Record<string, React.ElementType> = {
  course: BookOpen,
  article: FileText,
  video: Video,
  guide: FileText,
  project: Wrench,
};

const Resources = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: resources = [], isLoading: resLoading } = useResources();
  const { data: bookmarks = new Set<string>(), isLoading: bkLoading } = useBookmarks();
  const [localBookmarks, setLocalBookmarks] = useState<Set<string> | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const loading = resLoading || bkLoading;
  const currentBookmarks = localBookmarks ?? bookmarks;

  const toggleBookmark = async (resourceId: string) => {
    if (!user) return;
    const isBookmarked = currentBookmarks.has(resourceId);

    if (isBookmarked) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("resource_id", resourceId);
      if (error) {
        toast.error("Failed to remove bookmark");
        return;
      }
      setLocalBookmarks((prev) => {
        const next = new Set(prev ?? bookmarks);
        next.delete(resourceId);
        return next;
      });
    } else {
      const { error } = await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, resource_id: resourceId });
      if (error) {
        toast.error("Failed to bookmark");
        return;
      }
      setLocalBookmarks((prev) => new Set(prev ?? bookmarks).add(resourceId));
      toast.success("Bookmarked!");
    }
    queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
  };

  const tabs = ["all", "course", "article", "video", "guide", "project"] as const;

  const filtered = useMemo(() => {
    let list = resources;
    if (activeTab !== "all") list = list.filter((r) => r.type === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.category?.toLowerCase().includes(q) ||
          r.provider?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [resources, activeTab, search]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pt-12 pb-2">
        <h1 className="text-xl font-bold">Resources</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Courses, guides, and projects for your path.
        </p>
      </div>

      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="w-full justify-start overflow-x-auto gap-1 bg-transparent p-0 h-auto flex-nowrap">
          {tabs.map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="rounded-full px-3 py-1.5 text-xs capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t === "all" ? "All" : t + "s"}
            </TabsTrigger>
          ))}
        </TabsList>

        {loading ? (
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-10 w-10 text-primary/30 mb-3" />
            <p className="text-sm font-semibold">No resources found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {resources.length === 0
                ? "Resources will appear once added to the library."
                : "Try a different search or category."}
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {filtered.map((r) => {
              const Icon = typeIcons[r.type] || BookOpen;
              const saved = currentBookmarks.has(r.id);

              return (
                <Card key={r.id} className="border transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-tight truncate">
                            {r.title}
                          </p>
                          <button
                            onClick={() => toggleBookmark(r.id)}
                            className="shrink-0 active:scale-95 transition-transform"
                          >
                            {saved ? (
                              <BookmarkCheck className="h-4 w-4 text-accent" />
                            ) : (
                              <Bookmark className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                        {r.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {r.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="secondary" className="text-[10px]">
                            {r.type}
                          </Badge>
                          {r.category && (
                            <Badge variant="outline" className="text-[10px]">
                              {r.category}
                            </Badge>
                          )}
                          {r.is_free && (
                            <Badge className="text-[10px] bg-accent/10 text-accent border-0">
                              Free
                            </Badge>
                          )}
                          {r.provider && (
                            <span className="text-[10px] text-muted-foreground">
                              {r.provider}
                            </span>
                          )}
                          {r.rating && (
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <Star className="h-3 w-3 fill-current text-accent" />
                              {r.rating}
                            </span>
                          )}
                        </div>
                        {r.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-7 px-2 text-xs gap-1"
                            asChild
                          >
                            <a href={r.url} target="_blank" rel="noopener noreferrer">
                              Open <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Tabs>

      <BottomNav />
    </div>
  );
};

export default Resources;
