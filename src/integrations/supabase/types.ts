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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          active: boolean
          created_at: string
          cta_text: string | null
          id: string
          image_url: string | null
          link_to: string | null
          link_type: string
          order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_text?: string | null
          id?: string
          image_url?: string | null
          link_to?: string | null
          link_type?: string
          order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_text?: string | null
          id?: string
          image_url?: string | null
          link_to?: string | null
          link_type?: string
          order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          has_dedicated_page: boolean | null
          icon: string
          id: string
          name: string
          order: number
          page_config: Json | null
          show_in_main_menu: boolean | null
          slug: string
          subcategories: Json | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          has_dedicated_page?: boolean | null
          icon?: string
          id?: string
          name: string
          order?: number
          page_config?: Json | null
          show_in_main_menu?: boolean | null
          slug: string
          subcategories?: Json | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          has_dedicated_page?: boolean | null
          icon?: string
          id?: string
          name?: string
          order?: number
          page_config?: Json | null
          show_in_main_menu?: boolean | null
          slug?: string
          subcategories?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          created_at: string
          id: string
          lesson_id: string | null
          likes: number
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          likes?: number
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          likes?: number
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          category_ids: string[] | null
          course_type: string | null
          created_at: string
          description: string | null
          id: string
          instructor_id: string | null
          is_new: boolean | null
          level: string
          locked: boolean
          modules: Json
          roadmap_config: Json | null
          sequence_config: Json | null
          status: string
          subcategory_id: string | null
          subtitle: string | null
          thumbnail: string | null
          title: string
          total_duration: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          category_ids?: string[] | null
          course_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor_id?: string | null
          is_new?: boolean | null
          level?: string
          locked?: boolean
          modules?: Json
          roadmap_config?: Json | null
          sequence_config?: Json | null
          status?: string
          subcategory_id?: string | null
          subtitle?: string | null
          thumbnail?: string | null
          title: string
          total_duration?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          category_ids?: string[] | null
          course_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor_id?: string | null
          is_new?: boolean | null
          level?: string
          locked?: boolean
          modules?: Json
          roadmap_config?: Json | null
          sequence_config?: Json | null
          status?: string
          subcategory_id?: string | null
          subtitle?: string | null
          thumbnail?: string | null
          title?: string
          total_duration?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          locked: boolean
          module_id: string
          order: number
          resources: Json | null
          title: string
          updated_at: string
          vimeo_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          locked?: boolean
          module_id: string
          order?: number
          resources?: Json | null
          title: string
          updated_at?: string
          vimeo_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          locked?: boolean
          module_id?: string
          order?: number
          resources?: Json | null
          title?: string
          updated_at?: string
          vimeo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activation_plan: Json | null
          avatar: string | null
          bio: string | null
          created_at: string
          id: string
          instagram: string | null
          name: string
          prescribed_map: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          unlocked_courses: string[] | null
          updated_at: string
          user_id: string
          visible_challenges: string[] | null
        }
        Insert: {
          activation_plan?: Json | null
          avatar?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          instagram?: string | null
          name: string
          prescribed_map?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          unlocked_courses?: string[] | null
          updated_at?: string
          user_id: string
          visible_challenges?: string[] | null
        }
        Update: {
          activation_plan?: Json | null
          avatar?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          instagram?: string | null
          name?: string
          prescribed_map?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          unlocked_courses?: string[] | null
          updated_at?: string
          user_id?: string
          visible_challenges?: string[] | null
        }
        Relationships: []
      }
      swipe_file_categories: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      swipe_file_favorites: {
        Row: {
          created_at: string
          id: string
          material_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipe_file_favorites_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "swipe_file_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      swipe_file_materials: {
        Row: {
          category_id: string | null
          content: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          links: Json | null
          pdfs: Json | null
          tags: string[] | null
          title: string
          type_id: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          links?: Json | null
          pdfs?: Json | null
          tags?: string[] | null
          title: string
          type_id?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          links?: Json | null
          pdfs?: Json | null
          tags?: string[] | null
          title?: string
          type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipe_file_materials_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "swipe_file_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipe_file_materials_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "swipe_file_types"
            referencedColumns: ["id"]
          },
        ]
      }
      swipe_file_types: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          category_progress: Json | null
          completed_lessons: string[] | null
          course_id: string | null
          current_lesson: string | null
          disliked: string[] | null
          favorites: string[] | null
          id: string
          last_access_at: string
          liked: string[] | null
          progress: number
          started_at: string
          user_id: string
        }
        Insert: {
          category_progress?: Json | null
          completed_lessons?: string[] | null
          course_id?: string | null
          current_lesson?: string | null
          disliked?: string[] | null
          favorites?: string[] | null
          id?: string
          last_access_at?: string
          liked?: string[] | null
          progress?: number
          started_at?: string
          user_id: string
        }
        Update: {
          category_progress?: Json | null
          completed_lessons?: string[] | null
          course_id?: string | null
          current_lesson?: string | null
          disliked?: string[] | null
          favorites?: string[] | null
          id?: string
          last_access_at?: string
          liked?: string[] | null
          progress?: number
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "instructor" | "user"
      user_status:
        | "iniciante"
        | "primeiras-vendas"
        | "intermediario"
        | "avancado"
        | "elite"
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
      app_role: ["admin", "instructor", "user"],
      user_status: [
        "iniciante",
        "primeiras-vendas",
        "intermediario",
        "avancado",
        "elite",
      ],
    },
  },
} as const
