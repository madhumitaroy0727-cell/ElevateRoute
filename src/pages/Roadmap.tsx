import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Clock, Circle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkAndAwardAchievements } from "@/lib/achievements";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  phase: number;
  estimated_weeks: number | null;
  status: "pending" | "in_progress" | "completed";
  order_index: number;
}

const statusConfig = {
  completed: { icon: Check, color: "text-accent", bg: "bg-accent", label: "Done" },
  in_progress: { icon: Clock, color: "text-primary", bg: "bg-primary", label: "In Progress" },
  pending: { icon: Circle, color: "text-muted-foreground", bg: "bg-muted", label: "Pending" },
};

const Roadmap = () => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("milestones")
        .select("id, title, description, phase, estimated_weeks, status, order_index")
        .eq("user_id", user.id)
        .order("order_index", { ascending: true });
      if (data) setMilestones(data as Milestone[]);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const toggleStatus = async (milestone: Milestone) => {
    const nextStatus = milestone.status === "pending" ? "in_progress"
      : milestone.status === "in_progress" ? "completed" : "pending";
    
    const { error } = await supabase
      .from("milestones")
      .update({ status: nextStatus })
      .eq("id", milestone.id);
    
    if (error) { toast.error("Failed to update"); return; }
    
    setMilestones(ms => ms.map(m => m.id === milestone.id ? { ...m, status: nextStatus as Milestone["status"] } : m));
    if (nextStatus === "completed") toast.success("Milestone completed! 🎉");
  };

  const phases = [...new Set(milestones.map(m => m.phase))].sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold">Your Roadmap</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track your milestones step by step.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : milestones.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <Sparkles className="h-12 w-12 text-primary/30 mb-4" />
          <p className="font-semibold">No roadmap generated yet</p>
          <p className="text-sm text-muted-foreground mt-1">Complete your profile setup to generate an AI-powered roadmap.</p>
        </div>
      ) : (
        <div className="px-4 space-y-6">
          {phases.map(phase => (
            <div key={phase}>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {phase}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">Phase {phase}</span>
              </div>

              <div className="relative ml-3 border-l-2 border-muted pl-6 space-y-3">
                {milestones.filter(m => m.phase === phase).map(milestone => {
                  const config = statusConfig[milestone.status];
                  const Icon = config.icon;
                  const expanded = expandedId === milestone.id;

                  return (
                    <div key={milestone.id} className="relative">
                      {/* Timeline dot */}
                      <div className={cn(
                        "absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full",
                        milestone.status === "completed" ? "bg-accent" : milestone.status === "in_progress" ? "bg-primary" : "bg-muted"
                      )}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>

                      <Card className={cn(
                        "border transition-shadow",
                        milestone.status === "in_progress" && "border-primary/30 shadow-md shadow-primary/5"
                      )}>
                        <CardContent className="p-4">
                          <button
                            className="flex w-full items-start justify-between text-left"
                            onClick={() => setExpandedId(expanded ? null : milestone.id)}
                          >
                            <div className="flex-1">
                              <p className={cn(
                                "text-sm font-semibold",
                                milestone.status === "completed" && "line-through text-muted-foreground"
                              )}>
                                {milestone.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
                                {milestone.estimated_weeks && (
                                  <span className="text-xs text-muted-foreground">· ~{milestone.estimated_weeks}w</span>
                                )}
                              </div>
                            </div>
                            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </button>

                          {expanded && (
                            <div className="mt-3 pt-3 border-t space-y-3">
                              {milestone.description && (
                                <p className="text-xs text-muted-foreground">{milestone.description}</p>
                              )}
                              <Button
                                size="sm"
                                variant={milestone.status === "completed" ? "outline" : "default"}
                                className="w-full rounded-xl active:scale-[0.97] transition-transform"
                                onClick={() => toggleStatus(milestone)}
                              >
                                {milestone.status === "pending" && "Start This Milestone"}
                                {milestone.status === "in_progress" && "Mark as Complete"}
                                {milestone.status === "completed" && "Reset to Pending"}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Roadmap;
