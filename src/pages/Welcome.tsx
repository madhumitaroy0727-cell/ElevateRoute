import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Map, Target, TrendingUp, BookOpen, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const features = [
  { icon: Target, title: "Set Your Goal", desc: "Placements or Higher Studies — we build around you." },
  { icon: TrendingUp, title: "AI Roadmap", desc: "Get a personalized, week-by-week career plan." },
  { icon: BookOpen, title: "Curated Resources", desc: "Courses, guides, and projects picked for your path." },
];

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-16 pb-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary shadow-lg shadow-primary/25">
          <Map className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-balance" style={{ lineHeight: '1.1' }}>
          Your Career,<br />Mapped Out
        </h1>
        <p className="mt-3 max-w-xs text-muted-foreground text-balance">
          AI-powered roadmaps that turn your ambitions into actionable weekly milestones.
        </p>
      </div>

      {/* Features */}
      <div className="space-y-3 px-6 pb-8">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-2xl bg-card p-4 shadow-sm"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 pb-8 space-y-3">
        <Button
          size="lg"
          className="w-full text-base font-semibold h-12 rounded-2xl active:scale-[0.97] transition-transform"
          onClick={() => navigate("/register")}
        >
          Get Started
          <ArrowRight className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => navigate("/login")}
        >
          I already have an account
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
