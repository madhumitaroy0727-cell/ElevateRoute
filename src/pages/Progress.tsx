import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMilestones, useAchievements } from "@/hooks/use-data";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, Target, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PHASE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(221, 83%, 53%)",
  "hsl(262, 83%, 58%)",
  "hsl(25, 95%, 53%)",
];

const Progress = () => {
  const { data: milestones = [], isLoading: msLoading } = useMilestones();
  const { data: achievements = [], isLoading: achLoading } = useAchievements();

  const loading = msLoading || achLoading;
  const total = milestones.length;
  const completed = milestones.filter((m) => m.status === "completed").length;
  const inProgress = milestones.filter((m) => m.status === "in_progress").length;
  const pending = milestones.filter((m) => m.status === "pending").length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const phases = [...new Set(milestones.map((m) => m.phase))].sort((a, b) => a - b);
  const areaData = phases.map((phase) => {
    const inPhase = milestones.filter((m) => m.phase <= phase);
    const done = inPhase.filter((m) => m.status === "completed").length;
    return { name: `Phase ${phase}`, completed: done, total: inPhase.length };
  });

  const pieData = phases
    .map((phase) => ({
      name: `Phase ${phase}`,
      value: milestones.filter((m) => m.phase === phase && m.status === "completed").length,
      total: milestones.filter((m) => m.phase === phase).length,
    }))
    .filter((d) => d.total > 0);

  const hasData = total > 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold">Progress</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track your growth over time.</p>
      </div>

      {loading ? (
        <div className="px-4 space-y-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <TrendingUp className="h-12 w-12 text-primary/30 mb-4" />
          <p className="font-semibold">No progress yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your profile setup to generate a roadmap and start tracking.
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-5">
          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Done", value: completed, icon: Trophy, color: "text-accent" },
              { label: "Active", value: inProgress, icon: Target, color: "text-primary" },
              { label: "Pending", value: pending, icon: TrendingUp, color: "text-muted-foreground" },
            ].map((s) => (
              <Card key={s.label} className="border">
                <CardContent className="p-3 flex flex-col items-center gap-1">
                  <s.icon className={cn("h-4 w-4", s.color)} />
                  <span className="text-lg font-bold tabular-nums">{s.value}</span>
                  <span className="text-[11px] text-muted-foreground">{s.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Overall progress */}
          <Card className="border">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm font-semibold">Overall Completion</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold tabular-nums">{pct}%</span>
                <span className="text-xs text-muted-foreground mb-1">
                  {completed}/{total} milestones
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Area chart */}
          {areaData.length > 1 && (
            <Card className="border">
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-semibold">Cumulative Progress</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={areaData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="completed" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#progressGrad)" name="Completed" />
                    <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="4 4" fill="none" name="Total" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Pie chart */}
          {pieData.length > 0 && (
            <Card className="border">
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-semibold">Completion by Phase</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center pb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value, total }) => `${name}: ${value}/${total}`}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PHASE_COLORS[i % PHASE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          <div>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" />
              Achievements
            </h2>
            {achievements.length === 0 ? (
              <Card className="border">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Complete milestones to earn achievements!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((a) => (
                  <Card key={a.id} className="border">
                    <CardContent className="p-3 flex flex-col items-center text-center gap-1">
                      <span className="text-2xl">{a.badge_icon || "🏆"}</span>
                      <p className="text-xs font-semibold leading-tight">{a.title}</p>
                      {a.description && (
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          {a.description}
                        </p>
                      )}
                      <Badge variant="secondary" className="text-[9px] mt-1">
                        {new Date(a.earned_at).toLocaleDateString()}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Progress;
