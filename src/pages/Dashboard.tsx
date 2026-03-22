import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useMilestones, useProfile } from "@/hooks/use-data";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Map, ChevronRight, Trophy, User, Sparkles, Target, Zap, Briefcase,
} from "lucide-react";
import { useEffect } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: milestones = [], isLoading: msLoading } = useMilestones();

  useEffect(() => {
    if (profile && !profile.onboarding_completed) {
      navigate("/profile-setup", { replace: true });
    }
  }, [profile, navigate]);

  const totalCount = milestones.length;
  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const nextMilestone = milestones.find((m) => m.status !== "completed");
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const loading = profileLoading || msLoading;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="px-4 pt-12 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            Hey, {loading ? "..." : firstName}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profile?.goal_type === "higher_studies"
              ? "Prepping for higher studies"
              : "On the path to your dream role"}
          </p>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 active:scale-95 transition-transform"
        >
          <User className="h-5 w-5 text-primary" />
        </button>
      </div>

      <div className="px-4 space-y-4 mt-2">
        {/* Progress Ring */}
        {loading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : (
          <button
            onClick={() => navigate("/progress")}
            className="w-full active:scale-[0.98] transition-transform"
          >
            <Card className="border-0 shadow-lg shadow-primary/5">
              <CardContent className="flex items-center gap-6 p-6">
                <div className="relative">
                  <svg width="96" height="96" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="42" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
                    <circle
                      cx="48" cy="48" r="42"
                      stroke="hsl(var(--primary))"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      transform="rotate(-90 48 48)"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold tabular-nums">{Math.round(progress)}%</span>
                    <span className="text-[10px] text-muted-foreground">complete</span>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">Roadmap Progress</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {completedCount} of {totalCount} milestones done
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-primary text-xs font-medium">
                    View details <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        )}

        {/* Next Milestone */}
        {loading ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : nextMilestone ? (
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary">Next Up</span>
              </div>
              <p className="text-sm font-semibold">{nextMilestone.title}</p>
              {nextMilestone.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {nextMilestone.description}
                </p>
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
          {[
            { label: "Update Profile", path: "/profile", icon: User, color: "bg-primary/10 text-primary" },
            { label: "Resources", path: "/resources", icon: Map, color: "bg-accent/10 text-accent" },
            { label: "Skills", path: "/skills", icon: Zap, color: "bg-muted text-muted-foreground" },
            { label: "Opportunities", path: "/opportunities", icon: Briefcase, color: "bg-primary/10 text-primary" },
          ].map(({ label, path, icon: Icon, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 shadow-sm active:scale-[0.97] transition-transform"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
