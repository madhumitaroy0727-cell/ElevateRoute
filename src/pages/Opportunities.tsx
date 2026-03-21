import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Briefcase,
  Search,
  MapPin,
  ExternalLink,
  BookmarkCheck,
  Bookmark,
  Building2,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string | null;
  work_mode: string | null;
  opportunity_type: string;
  url: string | null;
  description: string | null;
  category: string | null;
}

const workModeLabel: Record<string, string> = {
  remote: "Remote",
  onsite: "On-site",
  hybrid: "Hybrid",
};

const Opportunities = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: opps }, { data: savedOps }] = await Promise.all([
        supabase.from("opportunities").select("*").order("created_at", { ascending: false }),
        user
          ? supabase.from("saved_opportunities").select("opportunity_id").eq("user_id", user.id)
          : Promise.resolve({ data: [] }),
      ]);
      if (opps) setOpportunities(opps as Opportunity[]);
      if (savedOps) setSaved(new Set(savedOps.map((s: any) => s.opportunity_id)));
      setLoading(false);
    };
    load();
  }, [user]);

  const toggleSave = async (id: string) => {
    if (!user) return;
    const isSaved = saved.has(id);
    if (isSaved) {
      await supabase.from("saved_opportunities").delete().eq("user_id", user.id).eq("opportunity_id", id);
      setSaved((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      await supabase.from("saved_opportunities").insert({ user_id: user.id, opportunity_id: id });
      setSaved((prev) => new Set(prev).add(id));
      toast.success("Saved!");
    }
  };

  const types = ["all", "internship", "full-time", "research"];

  const filtered = useMemo(() => {
    let list = opportunities;
    if (filterType !== "all") list = list.filter((o) => o.opportunity_type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.company.toLowerCase().includes(q) ||
          o.category?.toLowerCase().includes(q) ||
          o.location?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [opportunities, filterType, search]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pt-12 pb-2">
        <h1 className="text-xl font-bold">Opportunities</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Roles, internships, and research openings.</p>
      </div>

      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search roles, companies…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>
      </div>

      <div className="px-4 flex gap-2 overflow-x-auto pb-2">
        {types.map((t) => (
          <Button
            key={t}
            variant={filterType === t ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs capitalize shrink-0"
            onClick={() => setFilterType(t)}
          >
            {t === "all" ? "All" : t}
          </Button>
        ))}
      </div>

      <div className="px-4 mt-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Briefcase className="h-10 w-10 text-primary/30 mb-3" />
            <p className="text-sm font-semibold">No opportunities found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => (
              <Card key={o.id} className="border transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight">{o.title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{o.company}</span>
                      </div>
                    </div>
                    <button onClick={() => toggleSave(o.id)} className="shrink-0 active:scale-95 transition-transform">
                      {saved.has(o.id) ? (
                        <BookmarkCheck className="h-4 w-4 text-accent" />
                      ) : (
                        <Bookmark className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  {o.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{o.description}</p>
                  )}

                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <Badge variant="secondary" className="text-[10px] capitalize">{o.opportunity_type}</Badge>
                    {o.category && <Badge variant="outline" className="text-[10px]">{o.category}</Badge>}
                    {o.location && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {o.location}
                      </span>
                    )}
                    {o.work_mode && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Monitor className="h-3 w-3" /> {workModeLabel[o.work_mode] || o.work_mode}
                      </span>
                    )}
                  </div>

                  {o.url && (
                    <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs gap-1" asChild>
                      <a href={o.url} target="_blank" rel="noopener noreferrer">
                        Apply <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Opportunities;
