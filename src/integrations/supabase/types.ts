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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          event_id: string
          id: string
          scanned_at: string
          scanned_by: string | null
          student_id: string
        }
        Insert: {
          event_id: string
          id?: string
          scanned_at?: string
          scanned_by?: string | null
          student_id: string
        }
        Update: {
          event_id?: string
          id?: string
          scanned_at?: string
          scanned_by?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          created_by: string | null
          grade_level: Database["public"]["Enums"]["grade_level"]
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          grade_level: Database["public"]["Enums"]["grade_level"]
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          grade_level?: Database["public"]["Enums"]["grade_level"]
          id?: string
          name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          custom_days: string[]
          end_time: string
          event_type: Database["public"]["Enums"]["event_type"]
          grade_level: Database["public"]["Enums"]["grade_level"] | null
          id: string
          recurrence: Database["public"]["Enums"]["recurrence_type"]
          start_time: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          custom_days?: string[]
          end_time: string
          event_type?: Database["public"]["Enums"]["event_type"]
          grade_level?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          recurrence?: Database["public"]["Enums"]["recurrence_type"]
          start_time: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          custom_days?: string[]
          end_time?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          grade_level?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          recurrence?: Database["public"]["Enums"]["recurrence_type"]
          start_time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      followup_notes: {
        Row: {
          created_at: string
          id: string
          note: string
          servant_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note: string
          servant_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          servant_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followup_notes_servant_id_fkey"
            columns: ["servant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followup_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spiritual_journal: {
        Row: {
          bible_book: string | null
          bible_chapter: number | null
          bible_testament: Database["public"]["Enums"]["testament"] | null
          created_at: string
          date: string
          id: string
          other_readings: string | null
          prayers: Json
          student_id: string
        }
        Insert: {
          bible_book?: string | null
          bible_chapter?: number | null
          bible_testament?: Database["public"]["Enums"]["testament"] | null
          created_at?: string
          date?: string
          id?: string
          other_readings?: string | null
          prayers?: Json
          student_id: string
        }
        Update: {
          bible_book?: string | null
          bible_chapter?: number | null
          bible_testament?: Database["public"]["Enums"]["testament"] | null
          created_at?: string
          date?: string
          id?: string
          other_readings?: string | null
          prayers?: Json
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spiritual_journal_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          class_id: string | null
          created_at: string
          email: string | null
          full_name: string
          grade_level: Database["public"]["Enums"]["grade_level"] | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          grade_level?: Database["public"]["Enums"]["grade_level"] | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          class_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          grade_level?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "users_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "servant"
      event_type:
        | "sunday_school"
        | "activity"
        | "recreation"
        | "liturgy"
        | "tasbeha"
      grade_level: "1st_sec" | "2nd_sec" | "3rd_sec"
      recurrence_type: "once" | "weekly" | "custom"
      testament: "old" | "new"
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
      app_role: ["student", "servant"],
      event_type: [
        "sunday_school",
        "activity",
        "recreation",
        "liturgy",
        "tasbeha",
      ],
      grade_level: ["1st_sec", "2nd_sec", "3rd_sec"],
      recurrence_type: ["once", "weekly", "custom"],
      testament: ["old", "new"],
    },
  },
} as const
