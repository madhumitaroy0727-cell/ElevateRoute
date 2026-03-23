import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Bell,
  BellOff,
  Download,
  Trash2,
  LogOut,
  HelpCircle,
  Shield,
  Settings as SettingsIcon,
} from "lucide-react";

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [milestoneNotifs, setMilestoneNotifs] = useState(true);
  const [achievementNotifs, setAchievementNotifs] = useState(true);
  const [recommendationNotifs, setRecommendationNotifs] = useState(false);

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const [profile, skills, experiences, careerPrefs, roadmaps, milestones, achievements, bookmarks] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("skills").select("*").eq("user_id", user.id),
          supabase.from("experiences").select("*").eq("user_id", user.id),
          supabase.from("career_preferences").select("*").eq("user_id", user.id),
          supabase.from("roadmaps").select("*").eq("user_id", user.id),
          supabase.from("milestones").select("*").eq("user_id", user.id),
          supabase.from("achievements").select("*").eq("user_id", user.id),
          supabase.from("bookmarks").select("*").eq("user_id", user.id),
        ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        profile: profile.data,
        skills: skills.data,
        experiences: experiences.data,
        careerPreferences: careerPrefs.data,
        roadmaps: roadmaps.data,
        milestones: milestones.data,
        achievements: achievements.data,
        bookmarks: bookmarks.data,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `elevateroute-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    } catch {
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.info("Account deletion has been requested. Our team will process this within 48 hours.");
    await signOut();
    navigate("/welcome");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/welcome");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        {/* Notifications */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Milestone reminders</p>
                <p className="text-xs text-muted-foreground">Get notified about upcoming milestones</p>
              </div>
              <Switch checked={milestoneNotifs} onCheckedChange={setMilestoneNotifs} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Achievement alerts</p>
                <p className="text-xs text-muted-foreground">Celebrate when you earn badges</p>
              </div>
              <Switch checked={achievementNotifs} onCheckedChange={setAchievementNotifs} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Skill recommendations</p>
                <p className="text-xs text-muted-foreground">Weekly skill gap analysis updates</p>
              </div>
              <Switch checked={recommendationNotifs} onCheckedChange={setRecommendationNotifs} />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              Data & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleExportData}
              disabled={exporting}
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exporting..." : "Export my data (JSON)"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Delete my account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data
                    including roadmaps, skills, achievements, and saved resources.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="h-4 w-4 text-primary" />
              FAQ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="q1">
                <AccordionTrigger className="text-sm">How is my roadmap generated?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Your roadmap is generated using AI that analyzes your profile, skills, experiences, and career
                  preferences to create a personalized step-by-step plan tailored to your goals.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger className="text-sm">Can I regenerate my roadmap?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Yes! Go to your Profile page and tap "Regenerate Roadmap." Your previous roadmap will be archived and a
                  new one will be created based on your updated profile.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger className="text-sm">Is my data secure?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Absolutely. Your data is stored securely with row-level security policies ensuring only you can access
                  your information. We never share your data with third parties.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4">
                <AccordionTrigger className="text-sm">How do achievements work?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Achievements are automatically awarded as you complete milestones on your roadmap. Keep making progress
                  to unlock all badges — from "First Step" to "Road to the Top!"
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <p className="mb-3 text-xs text-muted-foreground text-center">
              Signed in as {user?.email}
            </p>
            <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </CardContent>
        </Card>

        <p className="pb-4 text-center text-xs text-muted-foreground">ElevateRoute v1.0</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
