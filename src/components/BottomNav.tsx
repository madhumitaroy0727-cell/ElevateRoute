import { useState } from "react";
import { Home, Map, BarChart3, BookOpen, User, Menu, X, Zap, Briefcase, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Map, label: "Roadmap", path: "/roadmap" },
  { icon: BarChart3, label: "Progress", path: "/progress" },
  { icon: BookOpen, label: "Resources", path: "/resources" },
  { icon: User, label: "Profile", path: "/profile" },
];

const menuItems = [
  { icon: Zap, label: "Skills Assessment", path: "/skills" },
  { icon: Briefcase, label: "Job Opportunities", path: "/opportunities" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Hamburger menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute bottom-20 right-4 w-56 rounded-2xl border bg-card shadow-lg p-2 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems.map(({ icon: Icon, label, path }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => {
                    navigate(path);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors active:scale-[0.97]",
                    active ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm safe-area-bottom">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
          {tabs.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs transition-colors active:scale-95",
                  active
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span>{label}</span>
              </button>
            );
          })}
          {/* More menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs transition-colors active:scale-95",
              menuOpen ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {menuOpen ? <X className="h-5 w-5 stroke-[2.5]" /> : <Menu className="h-5 w-5" />}
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
