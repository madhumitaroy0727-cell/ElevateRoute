export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_icon: string | null
          description: string | null
          earned_at: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          badge_icon?: string | null
          description?: string | null
          earned_at?: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          badge_icon?: string | null
          description?: string | null
          earned_at?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          resource_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resource_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      career_preferences: {
        Row: {
          company_type: Database["public"]["Enums"]["company_type"] | null
          created_at: string
          dream_company: string | null
          dream_role: string | null
          id: string
          preferred_location: string | null
          updated_at: string
          user_id: string
          work_mode: Database["public"]["Enums"]["work_mode"] | null
        }
        Insert: {
          company_type?: Database["public"]["Enums"]["company_type"] | null
          created_at?: string
          dream_company?: string | null
          dream_role?: string | null
          id?: string
          preferred_location?: string | null
          updated_at?: string
          user_id: string
          work_mode?: Database["public"]["Enums"]["work_mode"] | null
        }
        Update: {
          company_type?: Database["public"]["Enums"]["company_type"] | null
          created_at?: string
          dream_company?: string | null
          dream_role?: string | null
          id?: string
          preferred_location?: string | null
          updated_at?: string
          user_id?: string
          work_mode?: Database["public"]["Enums"]["work_mode"] | null
        }
        Relationships: []
      }
      experiences: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean
          organization: string | null
          start_date: string | null
          title: string
          type: Database["public"]["Enums"]["experience_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          organization?: string | null
          start_date?: string | null
          title: string
          type: Database["public"]["Enums"]["experience_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          organization?: string | null
          start_date?: string | null
          title?: string
          type?: Database["public"]["Enums"]["experience_type"]
          user_id?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          estimated_weeks: number | null
          id: string
          order_index: number
          phase: number
          roadmap_id: string
          status: Database["public"]["Enums"]["milestone_status"]
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_weeks?: number | null
          id?: string
          order_index?: number
          phase?: number
          roadmap_id: string
          status?: Database["public"]["Enums"]["milestone_status"]
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_weeks?: number | null
          id?: string
          order_index?: number
          phase?: number
          roadmap_id?: string
          status?: Database["public"]["Enums"]["milestone_status"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          category: string | null
          company: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          location: string | null
          opportunity_type: string
          title: string
          url: string | null
          work_mode: Database["public"]["Enums"]["work_mode"] | null
        }
        Insert: {
          category?: string | null
          company: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          opportunity_type?: string
          title: string
          url?: string | null
          work_mode?: Database["public"]["Enums"]["work_mode"] | null
        }
        Update: {
          category?: string | null
          company?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          opportunity_type?: string
          title?: string
          url?: string | null
          work_mode?: Database["public"]["Enums"]["work_mode"] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_year: string | null
          avatar_url: string | null
          course: string | null
          created_at: string
          email: string | null
          full_name: string | null
          goal_type: Database["public"]["Enums"]["goal_type"] | null
          gpa: number | null
          id: string
          institution: string | null
          onboarding_completed: boolean
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          avatar_url?: string | null
          course?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"] | null
          gpa?: number | null
          id: string
          institution?: string | null
          onboarding_completed?: boolean
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          avatar_url?: string | null
          course?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"] | null
          gpa?: number | null
          id?: string
          institution?: string | null
          onboarding_completed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_free: boolean
          provider: string | null
          rating: number | null
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          provider?: string | null
          rating?: number | null
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          provider?: string | null
          rating?: number | null
          title?: string
          type?: Database["public"]["Enums"]["resource_type"]
          url?: string | null
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          ai_generated_at: string | null
          created_at: string
          description: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id: string
          status: Database["public"]["Enums"]["roadmap_status"]
          title: string
          total_duration_weeks: number | null
          user_id: string
        }
        Insert: {
          ai_generated_at?: string | null
          created_at?: string
          description?: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id?: string
          status?: Database["public"]["Enums"]["roadmap_status"]
          title: string
          total_duration_weeks?: number | null
          user_id: string
        }
        Update: {
          ai_generated_at?: string | null
          created_at?: string
          description?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          status?: Database["public"]["Enums"]["roadmap_status"]
          title?: string
          total_duration_weeks?: number | null
          user_id?: string
        }
        Relationships: []
      }
      saved_opportunities: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          proficiency_level: Database["public"]["Enums"]["proficiency_level"]
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          proficiency_level?: Database["public"]["Enums"]["proficiency_level"]
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          proficiency_level?: Database["public"]["Enums"]["proficiency_level"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      company_type: "startup" | "enterprise" | "research"
      experience_type: "internship" | "job" | "research" | "project"
      goal_type: "placements" | "higher_studies"
      milestone_status: "pending" | "in_progress" | "completed"
      proficiency_level: "beginner" | "intermediate" | "advanced"
      resource_type: "course" | "article" | "video" | "guide" | "project"
      roadmap_status: "active" | "completed"
      work_mode: "remote" | "onsite" | "hybrid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      company_type: ["startup", "enterprise", "research"],
      experience_type: ["internship", "job", "research", "project"],
      goal_type: ["placements", "higher_studies"],
      milestone_status: ["pending", "in_progress", "completed"],
      proficiency_level: ["beginner", "intermediate", "advanced"],
      resource_type: ["course", "article", "video", "guide", "project"],
      roadmap_status: ["active", "completed"],
      work_mode: ["remote", "onsite", "hybrid"],
    },
  },
} as const
