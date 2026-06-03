export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      exercise_library: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          muscle_group: string;
          equipment: string;
          is_compound: boolean;
          weight_increment: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          muscle_group: string;
          equipment: string;
          is_compound?: boolean;
          weight_increment?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          muscle_group?: string;
          equipment?: string;
          is_compound?: boolean;
          weight_increment?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      programs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workout_templates: {
        Row: {
          id: string;
          program_id: string;
          day_number: number;
          name: string;
          focus_areas: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          day_number: number;
          name: string;
          focus_areas?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          program_id?: string;
          day_number?: number;
          name?: string;
          focus_areas?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      template_exercises: {
        Row: {
          id: string;
          template_id: string;
          exercise_id: string;
          sort_order: number;
          sets: number;
          min_reps: number;
          max_reps: number;
          is_backoff_set: boolean;
          rest_seconds: number;
          notes: string | null;
          superset_group: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          exercise_id: string;
          sort_order: number;
          sets: number;
          min_reps: number;
          max_reps: number;
          is_backoff_set?: boolean;
          rest_seconds?: number;
          notes?: string | null;
          superset_group?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          exercise_id?: string;
          sort_order?: number;
          sets?: number;
          min_reps?: number;
          max_reps?: number;
          is_backoff_set?: boolean;
          rest_seconds?: number;
          notes?: string | null;
          superset_group?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          template_id: string;
          started_at: string;
          completed_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id: string;
          started_at?: string;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_id?: string;
          started_at?: string;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth_key: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth_key?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          enabled: boolean;
          schedule_type: string;
          fixed_days: number[] | null;
          days_interval: number | null;
          reminder_hour: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          enabled?: boolean;
          schedule_type?: string;
          fixed_days?: number[] | null;
          days_interval?: number | null;
          reminder_hour?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          enabled?: boolean;
          schedule_type?: string;
          fixed_days?: number[] | null;
          days_interval?: number | null;
          reminder_hour?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      set_logs: {
        Row: {
          id: string;
          session_id: string;
          exercise_id: string;
          template_exercise_id: string;
          set_number: number;
          prescribed_weight: number | null;
          prescribed_reps: number | null;
          actual_weight: number | null;
          actual_reps: number | null;
          difficulty: string | null;
          completed: boolean;
          completed_at: string | null;
          is_banded: boolean;
          went_to_failure: boolean;
          equipment_used: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          exercise_id: string;
          template_exercise_id: string;
          set_number: number;
          prescribed_weight?: number | null;
          prescribed_reps?: number | null;
          actual_weight?: number | null;
          actual_reps?: number | null;
          difficulty?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          is_banded?: boolean;
          went_to_failure?: boolean;
          equipment_used?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          exercise_id?: string;
          template_exercise_id?: string;
          set_number?: number;
          prescribed_weight?: number | null;
          prescribed_reps?: number | null;
          actual_weight?: number | null;
          actual_reps?: number | null;
          difficulty?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          is_banded?: boolean;
          went_to_failure?: boolean;
          equipment_used?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Enum types
export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "abs"
  | "forearms";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "bodyweight";

export type Difficulty = "easy" | "challenging" | "hard";

// Convenience types
export type Exercise = Database["public"]["Tables"]["exercise_library"]["Row"];
export type Program = Database["public"]["Tables"]["programs"]["Row"];
export type WorkoutTemplate = Database["public"]["Tables"]["workout_templates"]["Row"];
export type TemplateExercise = Database["public"]["Tables"]["template_exercises"]["Row"];
export type WorkoutSession = Database["public"]["Tables"]["workout_sessions"]["Row"];
export type SetLog = Database["public"]["Tables"]["set_logs"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type PushSubscription = Database["public"]["Tables"]["push_subscriptions"]["Row"];
export type NotificationPreference = Database["public"]["Tables"]["notification_preferences"]["Row"];
