import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Zap, Lightbulb, ExternalLink, RefreshCw, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill {
  id: string;
  name: string;
  category: string | null;
  proficiency_level: "beginner" | "intermediate" | "advanced";
}

interface Recommendation {
  skill: string;
  reason: string;
  priority: "high" | "medium" | "low";
  resource_url?: string;
  resource_title?: string;
}

const profColors: Record<string, string> = {
  beginner: "bg-muted text-muted-foreground",
  intermediate: "bg-primary/10 text-primary",
  advanced: "bg-accent/10 text-accent",
};

const priorityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-primary/10 text-primary",
  low: "bg-muted text-muted-foreground",
};

const Skills = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(false);
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    supabase
      .from("skills")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setSkills(data as Skill[]);
        setLoading(false);
      });
  }, [user]);

  const fetchRecommendations = async () => {
    setRecsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-skill-recommendations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to get recommendations");
        return;
      }

      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch {
      toast.error("Failed to fetch recommendations");
    } finally {
      setRecsLoading(false);
    }
  };

  const addSkillFromRec = async (rec: Recommendation) => {
    if (!user) return;
    const { error } = await supabase.from("skills").insert({
      user_id: user.id,
      name: rec.skill,
      proficiency_level: "beginner",
      category: null,
    });
    if (error) {
      toast.error("Failed to add skill");
      return;
    }
    const { data: newSkill } = await supabase
      .from("skills")
      .select("*")
      .eq("user_id", user.id)
      .eq("name", rec.skill)
      .single();
    if (newSkill) setSkills((prev) => [...prev, newSkill as Skill]);
    setAddedSkills((prev) => new Set(prev).add(rec.skill));
    toast.success(`${rec.skill} added!`);
  };

  const cycleProficiency = async (skill: Skill) => {
    const next =
      skill.proficiency_level === "beginner"
        ? "intermediate"
        : skill.proficiency_level === "intermediate"
        ? "advanced"
        : "beginner";

    const { error } = await supabase
      .from("skills")
      .update({ proficiency_level: next })
      .eq("id", skill.id);

    if (error) {
      toast.error("Failed to update");
      return;
    }
    setSkills((prev) =>
      prev.map((s) =>
        s.id === skill.id ? { ...s, proficiency_level: next as Skill["proficiency_level"] } : s
      )
    );
  };

  const categories = [...new Set(skills.map((s) => s.category || "Other"))];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold">Skills</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Assess and grow your skill set.</p>
      </div>

      {loading ? (
        <div className="px-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="px-4 space-y-6">
          {/* Current skills by category */}
          {skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Zap className="h-10 w-10 text-primary/30 mb-3" />
              <p className="text-sm font-semibold">No skills added yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add skills in your profile setup to see them here.
              </p>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat}>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {cat}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills
                    .filter((s) => (s.category || "Other") === cat)
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => cycleProficiency(s)}
                        className="active:scale-95 transition-transform"
                      >
                        <Badge
                          className={cn(
                            "text-xs px-3 py-1.5 cursor-pointer border-0",
                            profColors[s.proficiency_level]
                          )}
                        >
                          {s.name}
                          <span className="ml-1.5 opacity-60 capitalize text-[9px]">
                            {s.proficiency_level}
                          </span>
                        </Badge>
                      </button>
                    ))}
                </div>
              </div>
            ))
          )}

          {/* AI Recommended Skills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-accent" />
                AI Recommended
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={fetchRecommendations}
                disabled={recsLoading}
              >
                <RefreshCw className={cn("h-3 w-3", recsLoading && "animate-spin")} />
                {recommendations.length > 0 ? "Refresh" : "Analyze"}
              </Button>
            </div>

            {recsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <Card className="border border-dashed">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Tap "Analyze" to get AI-powered skill gap recommendations based on your profile
                    and career goals.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {recommendations.map((rec) => {
                  const alreadyAdded =
                    addedSkills.has(rec.skill) ||
                    skills.some((s) => s.name.toLowerCase() === rec.skill.toLowerCase());

                  return (
                    <Card key={rec.skill} className="border border-accent/20">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{rec.skill}</p>
                              <Badge
                                className={cn(
                                  "text-[9px] border-0 capitalize",
                                  priorityColors[rec.priority]
                                )}
                              >
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {rec.reason}
                            </p>
                            {rec.resource_url && (
                              <a
                                href={rec.resource_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-primary mt-1 hover:underline"
                              >
                                {rec.resource_title || "Learn more"}
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </div>
                          <button
                            onClick={() => !alreadyAdded && addSkillFromRec(rec)}
                            disabled={alreadyAdded}
                            className="shrink-0 active:scale-95 transition-transform"
                          >
                            {alreadyAdded ? (
                              <Check className="h-4 w-4 text-accent" />
                            ) : (
                              <Plus className="h-4 w-4 text-accent" />
                            )}
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Skills;
