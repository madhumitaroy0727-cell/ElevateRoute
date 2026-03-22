import { supabase } from "@/integrations/supabase/client";

interface AchievementCheck {
  id: string;
  title: string;
  description: string;
  badge_icon: string;
  condition: (completedCount: number, totalCount: number) => boolean;
}

const ACHIEVEMENT_DEFINITIONS: AchievementCheck[] = [
  {
    id: "first_step",
    title: "First Step",
    description: "Completed your first milestone!",
    badge_icon: "👣",
    condition: (completed) => completed >= 1,
  },
  {
    id: "on_a_roll",
    title: "On a Roll",
    description: "Completed 3 milestones — momentum is building!",
    badge_icon: "🔥",
    condition: (completed) => completed >= 3,
  },
  {
    id: "halfway_there",
    title: "Halfway There",
    description: "You've completed half your roadmap!",
    badge_icon: "⭐",
    condition: (completed, total) => total > 0 && completed >= Math.ceil(total / 2),
  },
  {
    id: "skill_builder",
    title: "Skill Builder",
    description: "Completed 5 milestones — skills are growing!",
    badge_icon: "🛠️",
    condition: (completed) => completed >= 5,
  },
  {
    id: "almost_there",
    title: "Almost There",
    description: "75% of your roadmap is done!",
    badge_icon: "🏃",
    condition: (completed, total) => total > 0 && completed >= Math.ceil(total * 0.75),
  },
  {
    id: "road_to_the_top",
    title: "Road to the Top",
    description: "Completed your entire roadmap! 🎓",
    badge_icon: "🏆",
    condition: (completed, total) => total > 0 && completed >= total,
  },
];

export async function checkAndAwardAchievements(
  userId: string,
  completedCount: number,
  totalCount: number
): Promise<string[]> {
  // Get existing achievements for this user
  const { data: existing } = await supabase
    .from("achievements")
    .select("title")
    .eq("user_id", userId);

  const existingTitles = new Set(existing?.map((a) => a.title) || []);
  const newlyEarned: string[] = [];

  for (const achievement of ACHIEVEMENT_DEFINITIONS) {
    if (existingTitles.has(achievement.title)) continue;
    if (!achievement.condition(completedCount, totalCount)) continue;

    const { error } = await supabase.from("achievements").insert({
      user_id: userId,
      title: achievement.title,
      description: achievement.description,
      badge_icon: achievement.badge_icon,
    });

    if (!error) {
      newlyEarned.push(`${achievement.badge_icon} ${achievement.title}`);
    }
  }

  return newlyEarned;
}
