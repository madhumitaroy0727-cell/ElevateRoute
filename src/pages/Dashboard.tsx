import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Map, ChevronRight, Trophy, User, Sparkles, Target
} from "lucide-react";

interface Profile {
  full_name: string | null;
  goal_type: string | null;
  onboarding_completed: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: string;
  phase: number;
  estimated_weeks: number | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, goal_type, onboarding_completed")
        .eq("id", user.id)
        .single();
      if (p) setProfile(p);

      if (p && !p.onboarding_completed) {
        navigate("/profile-setup", { replace: true });
        return;
      }

      const { data: ms } = await supabase
        .from("milestones")
        .select("id, title, description, status, phase, estimated_weeks")
        .eq("user_id", user.id)
        .order("order_index", { ascending: true });

      if (ms) {
        setMilestones(ms);
        setTotalCount(ms.length);
        setCompletedCount(ms.filter(m => m.status === "completed").length);
      }
    };

    fetchData();
  }, [user, navigate]);

  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const nextMilestone = milestones.find(m => m.status !== "completed");
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary px-6 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},</p>
            <h1 className="text-xl font-bold text-primary-foreground mt-0.5">{firstName} 👋</h1>
          </div>
          <button onClick={() => navigate("/profile")} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 active:scale-95 transition-transform">
            <User className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Progress Ring Card */}
        <Card className="border-0 shadow-lg shadow-primary/5">
          <CardContent className="flex items-center gap-5 p-5">
            <div className="relative flex-shrink-0">
              <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <circle
                  cx="48" cy="48" r="42" fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 48 48)"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                {Math.round(progress)}%
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold">Overall Progress</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedCount} of {totalCount} milestones completed
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 px-2 text-xs text-primary"
                onClick={() => navigate("/progress")}
              >
                View details <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Milestone */}
        {nextMilestone ? (
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold text-accent uppercase tracking-wide">Next Up</span>
              </div>
              <h3 className="font-semibold text-sm">{nextMilestone.title}</h3>
              {nextMilestone.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{nextMilestone.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-muted-foreground">Phase {nextMilestone.phase}</span>
                {nextMilestone.estimated_weeks && (
                  <span className="text-xs text-muted-foreground">· ~{nextMilestone.estimated_weeks} weeks</span>
                )}
              </div>
              <Button
                size="sm"
                className="mt-3 rounded-xl active:scale-[0.97] transition-transform"
                onClick={() => navigate("/roadmap")}
              >
                View Roadmap <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : totalCount === 0 ? (
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <Sparkles className="h-10 w-10 text-primary/40 mb-3" />
              <p className="font-semibold text-sm">No roadmap yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your AI-powered roadmap will appear here once generated.</p>
            </CardContent>
          </Card>
        ) : null}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 shadow-sm active:scale-[0.97] transition-transform"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-medium">Update Profile</span>
          </button>
          <button
            onClick={() => navigate("/resources")}
            className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 shadow-sm active:scale-[0.97] transition-transform"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Map className="h-5 w-5 text-accent" />
            </div>
            <span className="text-xs font-medium">Resources</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
