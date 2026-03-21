import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  GraduationCap, Briefcase, ArrowRight, ArrowLeft, Check, Plus, X, Sparkles,
  Target, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

type GoalType = "placements" | "higher_studies";
type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface SkillEntry { name: string; proficiency: "beginner" | "intermediate" | "advanced"; }
interface ExperienceEntry { type: "internship" | "job" | "research" | "project"; title: string; organization: string; }

const ProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  // Step 2
  const [academicYear, setAcademicYear] = useState("");
  const [course, setCourse] = useState("");
  const [institution, setInstitution] = useState("");
  const [gpa, setGpa] = useState("");
  // Step 3
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [newSkill, setNewSkill] = useState("");
  // Step 4
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);
  const [expTitle, setExpTitle] = useState("");
  const [expOrg, setExpOrg] = useState("");
  const [expType, setExpType] = useState<ExperienceEntry["type"]>("project");
  // Step 5
  const [dreamRole, setDreamRole] = useState("");
  const [dreamCompany, setDreamCompany] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills([...skills, { name: newSkill.trim(), proficiency: "beginner" }]);
    setNewSkill("");
  };

  const addExperience = () => {
    if (!expTitle.trim()) return;
    setExperiences([...experiences, { type: expType, title: expTitle.trim(), organization: expOrg.trim() }]);
    setExpTitle("");
    setExpOrg("");
  };

  const careerTips = [
    "💡 Tip: Side projects demonstrate initiative better than coursework alone.",
    "🎯 Did you know? 85% of jobs are filled through networking.",
    "📚 Consistency beats intensity — 1 hour daily > 7 hours on weekends.",
    "🚀 Open source contributions are highly valued by top tech companies.",
    "🧠 Learning in public (blogs, talks) accelerates career growth.",
  ];
  const [currentTip, setCurrentTip] = useState(0);

  const handleFinish = async () => {
    if (!user || !goalType) return;
    setLoading(true);

    // Rotate tips during loading
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % careerTips.length);
    }, 3000);

    try {
      // Update profile
      await supabase.from("profiles").update({
        goal_type: goalType,
        academic_year: academicYear,
        course,
        institution,
        gpa: gpa ? parseFloat(gpa) : null,
        onboarding_completed: true,
      }).eq("id", user.id);

      // Insert skills
      if (skills.length > 0) {
        await supabase.from("skills").insert(
          skills.map((s) => ({ user_id: user.id, name: s.name, proficiency_level: s.proficiency }))
        );
      }

      // Insert experiences
      if (experiences.length > 0) {
        await supabase.from("experiences").insert(
          experiences.map((e) => ({ user_id: user.id, type: e.type, title: e.title, organization: e.organization }))
        );
      }

      // Insert career prefs
      await supabase.from("career_preferences").insert({
        user_id: user.id,
        dream_role: dreamRole,
        dream_company: dreamCompany,
        preferred_location: preferredLocation,
      });

      // Call AI to generate roadmap
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-roadmap`,
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
        console.error("Roadmap generation failed:", err);
        toast.error(err.error || "Roadmap generation failed, but your profile is saved.");
      } else {
        const result = await res.json();
        toast.success(`Roadmap generated with ${result.milestone_count} milestones! 🎉`);
      }

      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      clearInterval(tipInterval);
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!goalType;
      case 2: return !!course;
      case 3: return true;
      case 4: return true;
      case 5: return !!dreamRole;
      default: return true;
    }
  };

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-background px-4 pt-6 pb-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Step {step} of {totalSteps}</span>
          <span className="text-xs font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step 1: Goal Selection */}
      {step === 1 && (
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-xl font-bold">What's your goal?</h2>
            <p className="text-sm text-muted-foreground mt-1">We'll tailor your roadmap accordingly.</p>
          </div>
          <div className="space-y-3">
            {[
              { value: "placements" as GoalType, icon: Briefcase, label: "Placements", desc: "Land your dream job or internship" },
              { value: "higher_studies" as GoalType, icon: GraduationCap, label: "Higher Studies", desc: "Prepare for masters, PhD, or research" },
            ].map(({ value, icon: Icon, label, desc }) => (
              <button
                key={value}
                onClick={() => setGoalType(value)}
                className={cn(
                  "w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.97]",
                  goalType === value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  goalType === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                {goalType === value && <Check className="ml-auto h-5 w-5 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Academics */}
      {step === 2 && (
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-xl font-bold">Academic details</h2>
            <p className="text-sm text-muted-foreground mt-1">Help us understand your background.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course / Degree</Label>
              <Input placeholder="e.g. B.Tech Computer Science" value={course} onChange={e => setCourse(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Institution</Label>
              <Input placeholder="Your university or college" value={institution} onChange={e => setInstitution(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input placeholder="e.g. 3rd Year" value={academicYear} onChange={e => setAcademicYear(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>GPA (optional)</Label>
                <Input type="number" step="0.01" placeholder="e.g. 8.5" value={gpa} onChange={e => setGpa(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Skills */}
      {step === 3 && (
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-xl font-bold">Your skills</h2>
            <p className="text-sm text-muted-foreground mt-1">Add skills you currently have.</p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Python, React, SQL..."
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
            />
            <Button size="icon" onClick={addSkill} variant="outline"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
              >
                {s.name}
                <button onClick={() => setSkills(skills.filter((_, j) => j !== i))} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          {skills.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No skills added yet. That's okay — you can add them later too.</p>
          )}
        </div>
      )}

      {/* Step 4: Experience */}
      {step === 4 && (
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-xl font-bold">Experience</h2>
            <p className="text-sm text-muted-foreground mt-1">Add internships, projects, or jobs.</p>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              {(["project", "internship", "job", "research"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setExpType(t)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                    expType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <Input placeholder="Title" value={expTitle} onChange={e => setExpTitle(e.target.value)} />
            <Input placeholder="Organization (optional)" value={expOrg} onChange={e => setExpOrg(e.target.value)} />
            <Button variant="outline" onClick={addExperience} disabled={!expTitle.trim()} className="w-full">
              <Plus className="h-4 w-4" /> Add Experience
            </Button>
          </div>
          <div className="space-y-2">
            {experiences.map((e, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-card p-3 shadow-sm">
                <div>
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{e.type}{e.organization ? ` · ${e.organization}` : ""}</p>
                </div>
                <button onClick={() => setExperiences(experiences.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Career Preferences */}
      {step === 5 && (
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-xl font-bold">Career preferences</h2>
            <p className="text-sm text-muted-foreground mt-1">Where do you want to end up?</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Dream Role</Label>
              <Input placeholder="e.g. Software Engineer at FAANG" value={dreamRole} onChange={e => setDreamRole(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Dream Company (optional)</Label>
              <Input placeholder="e.g. Google, Microsoft..." value={dreamCompany} onChange={e => setDreamCompany(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Preferred Location (optional)</Label>
              <Input placeholder="e.g. Bangalore, Remote" value={preferredLocation} onChange={e => setPreferredLocation(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Step 6: AI Generation */}
      {step === 6 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center space-y-6">
          {loading ? (
            <>
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Building your roadmap...</h2>
                <p className="text-sm text-muted-foreground mt-2">Our AI is analyzing your profile and creating a personalized career plan.</p>
              </div>
              <div className="max-w-xs mx-auto rounded-xl bg-muted/50 p-4 transition-all duration-500">
                <p className="text-xs text-muted-foreground leading-relaxed">{careerTips[currentTip]}</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/10">
                <Sparkles className="h-10 w-10 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Ready to generate!</h2>
                <p className="text-sm text-muted-foreground mt-2">We'll use AI to create your personalized career roadmap based on everything you've shared.</p>
              </div>
              <Button size="lg" className="rounded-2xl h-12 px-8 active:scale-[0.97] transition-transform" onClick={handleFinish}>
                <Sparkles className="h-5 w-5" />
                Generate My Roadmap
              </Button>
            </>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      {step < 6 && (
        <div className="flex gap-3 pt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((step - 1) as Step)} className="rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Button
            className="flex-1 rounded-xl h-11 active:scale-[0.97] transition-transform"
            onClick={() => setStep((step + 1) as Step)}
            disabled={!canProceed()}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileSetup;
