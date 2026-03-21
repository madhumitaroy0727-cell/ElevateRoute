import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Save, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [course, setCourse] = useState("");
  const [institution, setInstitution] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [gpa, setGpa] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setFullName(data.full_name || "");
        setCourse(data.course || "");
        setInstitution(data.institution || "");
        setAcademicYear(data.academic_year || "");
        setGpa(data.gpa?.toString() || "");
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName,
      course,
      institution,
      academic_year: academicYear,
      gpa: gpa ? parseFloat(gpa) : null,
    }).eq("id", user.id);
    setLoading(false);
    if (error) toast.error("Failed to save");
    else toast.success("Profile updated!");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/welcome");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
      </div>

      <div className="px-4 space-y-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Input value={course} onChange={e => setCourse(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Institution</Label>
              <Input value={institution} onChange={e => setInstitution(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input value={academicYear} onChange={e => setAcademicYear(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>GPA</Label>
                <Input type="number" step="0.01" value={gpa} onChange={e => setGpa(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleSave} disabled={loading} className="w-full rounded-xl active:scale-[0.97] transition-transform">
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={async () => {
            toast.info("Regenerating roadmap...");
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
            if (res.ok) {
              const result = await res.json();
              toast.success(`Roadmap updated with ${result.milestone_count} milestones!`);
            } else {
              toast.error("Regeneration failed. Try again later.");
            }
          }}
        >
          <RefreshCw className="h-4 w-4" /> Regenerate Roadmap
        </Button>

        <Button variant="outline" className="w-full rounded-xl text-destructive hover:text-destructive" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
