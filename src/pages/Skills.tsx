import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Zap, Plus, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill {
  id: string;
  name: string;
  category: string | null;
  proficiency_level: "beginner" | "intermediate" | "advanced";
}

const profColors: Record<string, string> = {
  beginner: "bg-muted text-muted-foreground",
  intermediate: "bg-primary/10 text-primary",
  advanced: "bg-accent/10 text-accent",
};

const Skills = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

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

  const categories = [...new Set(skills.map((s) => s.category || "Other"))];

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
      prev.map((s) => (s.id === skill.id ? { ...s, proficiency_level: next as Skill["proficiency_level"] } : s))
    );
  };

  // AI recommended skills placeholder (could be powered by edge function)
  const recommendedSkills = [
    { name: "System Design", reason: "Essential for senior engineering roles" },
    { name: "Docker & Kubernetes", reason: "Required by 78% of backend roles" },
    { name: "SQL & Database Design", reason: "Core skill gap identified" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold">Skills</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Assess and grow your skill set.</p>
      </div>

      {loading ? (
        <div className="px-4 space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="px-4 space-y-6">
          {/* Current skills by category */}
          {skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
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

          {/* AI Recommended */}
          <div>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-accent" />
              AI Recommended
            </h2>
            <div className="space-y-2">
              {recommendedSkills.map((r) => (
                <Card key={r.name} className="border border-accent/20">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground">{r.reason}</p>
                    </div>
                    <Plus className="h-4 w-4 text-accent shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Skills;
