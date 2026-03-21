import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user from JWT
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || ""
    ).auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Fetch profile, skills, experiences, career_preferences
    const [profileRes, skillsRes, expRes, prefsRes] = await Promise.all([
      supabaseUser.from("profiles").select("*").eq("id", userId).single(),
      supabaseUser.from("skills").select("*").eq("user_id", userId),
      supabaseUser.from("experiences").select("*").eq("user_id", userId),
      supabaseUser.from("career_preferences").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    const profile = profileRes.data;
    const skills = skillsRes.data || [];
    const experiences = expRes.data || [];
    const preferences = prefsRes.data;

    const profileSummary = `
Student Profile:
- Name: ${profile?.full_name || "Unknown"}
- Goal: ${profile?.goal_type === "placements" ? "Get placed in a top company" : "Pursue higher studies (MS/PhD)"}
- Course: ${profile?.course || "Not specified"}, Year: ${profile?.academic_year || "Not specified"}
- Institution: ${profile?.institution || "Not specified"}, GPA: ${profile?.gpa || "Not specified"}

Skills: ${skills.length > 0 ? skills.map((s: any) => `${s.name} (${s.proficiency_level})`).join(", ") : "None listed"}

Experience: ${experiences.length > 0 ? experiences.map((e: any) => `${e.title} at ${e.organization || "Unknown"} (${e.type})`).join("; ") : "None"}

Career Preferences:
- Dream Role: ${preferences?.dream_role || "Not specified"}
- Dream Company: ${preferences?.dream_company || "Not specified"}
- Location: ${preferences?.preferred_location || "Flexible"}
- Company Type: ${preferences?.company_type || "Any"}
- Work Mode: ${preferences?.work_mode || "Any"}
`;

    const systemPrompt = `You are an expert career coach for Indian engineering students. Create a structured, actionable career roadmap.

Output ONLY a valid JSON object with this exact structure (no markdown, no code fences):
{
  "title": "Roadmap title",
  "description": "Brief description",
  "total_duration_weeks": number,
  "milestones": [
    {
      "title": "Milestone title",
      "description": "Detailed actionable description (2-3 sentences)",
      "phase": 1,
      "estimated_weeks": 2,
      "order_index": 0
    }
  ]
}

Rules:
- Create 8-15 milestones across 3-5 phases
- Phase 1: Foundation/basics, Phase 2: Core skills, Phase 3: Projects/practice, Phase 4: Applications/interviews, Phase 5: Final prep
- Each milestone must be specific and actionable
- Estimated weeks should be realistic (1-4 weeks each)
- order_index starts at 0 and increments
- Total duration typically 16-32 weeks
- Identify skill gaps between current skills and dream role
- Include specific technologies, certifications, or projects to build`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: profileSummary },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const body = await aiResponse.text();
      console.error("AI gateway error:", status, body);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "Empty AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse JSON from response (strip code fences if present)
    let roadmapData;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      roadmapData = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete existing roadmap and milestones for this user
    const { data: existingRoadmaps } = await supabaseUser
      .from("roadmaps")
      .select("id")
      .eq("user_id", userId);

    if (existingRoadmaps && existingRoadmaps.length > 0) {
      const roadmapIds = existingRoadmaps.map((r: any) => r.id);
      await supabaseUser.from("milestones").delete().in("roadmap_id", roadmapIds);
      await supabaseUser.from("roadmaps").delete().eq("user_id", userId);
    }

    // Insert new roadmap
    const { data: roadmap, error: roadmapError } = await supabaseUser
      .from("roadmaps")
      .insert({
        user_id: userId,
        title: roadmapData.title,
        description: roadmapData.description,
        goal_type: profile?.goal_type || "placements",
        total_duration_weeks: roadmapData.total_duration_weeks,
        status: "active",
        ai_generated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (roadmapError || !roadmap) {
      console.error("Roadmap insert error:", roadmapError);
      return new Response(JSON.stringify({ error: "Failed to save roadmap" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert milestones
    const milestones = roadmapData.milestones.map((m: any) => ({
      roadmap_id: roadmap.id,
      user_id: userId,
      title: m.title,
      description: m.description,
      phase: m.phase,
      estimated_weeks: m.estimated_weeks,
      order_index: m.order_index,
      status: "pending",
    }));

    const { error: msError } = await supabaseUser
      .from("milestones")
      .insert(milestones);

    if (msError) {
      console.error("Milestones insert error:", msError);
      return new Response(JSON.stringify({ error: "Failed to save milestones" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Award first achievement
    await supabaseUser.from("achievements").insert({
      user_id: userId,
      title: "Roadmap Generated",
      description: "Created your first AI-powered career roadmap!",
      badge_icon: "🗺️",
    });

    return new Response(
      JSON.stringify({ success: true, roadmap_id: roadmap.id, milestone_count: milestones.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-roadmap error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
