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
      activation_plan_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tasks: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tasks?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tasks?: Json
          updated_at?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_resource_id: string | null
          target_resource_type: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_resource_id?: string | null
          target_resource_type?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_resource_id?: string | null
          target_resource_type?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
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
      certificates: {
        Row: {
          certificate_number: string | null
          certificate_url: string | null
          course_id: string | null
          id: string
          issued_at: string | null
          user_id: string
        }
        Insert: {
          certificate_number?: string | null
          certificate_url?: string | null
          course_id?: string | null
          id?: string
          issued_at?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string | null
          certificate_url?: string | null
          course_id?: string | null
          id?: string
          issued_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_progress: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          progress: number
          updated_at: string
          user_id: string
          watched_videos: string[]
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          progress?: number
          updated_at?: string
          user_id: string
          watched_videos?: string[]
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          progress?: number
          updated_at?: string
          user_id?: string
          watched_videos?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "hof_challenges"
            referencedColumns: ["id"]
          },
        ]
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
      commercial_tracking: {
        Row: {
          appointments: number
          attendance: number
          created_at: string
          deals: number
          id: string
          observations: string | null
          revenue: number
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          appointments?: number
          attendance?: number
          created_at?: string
          deals?: number
          id?: string
          observations?: string | null
          revenue?: number
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          appointments?: number
          attendance?: number
          created_at?: string
          deals?: number
          id?: string
          observations?: string | null
          revenue?: number
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      course_completions: {
        Row: {
          completed_at: string | null
          course_id: string | null
          final_score: number | null
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          final_score?: number | null
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          final_score?: number | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_completions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string | null
          enrolled_at: string | null
          id: string
          last_accessed_at: string | null
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
      customization_settings: {
        Row: {
          id: string
          settings: Json
          updated_at: string
        }
        Insert: {
          id?: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      financial_data: {
        Row: {
          created_at: string
          data: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hof_challenges: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          support_material_title: string | null
          support_material_url: string | null
          total_duration: number
          updated_at: string
          videos: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          support_material_title?: string | null
          support_material_url?: string | null
          total_duration?: number
          updated_at?: string
          videos?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          support_material_title?: string | null
          support_material_url?: string | null
          total_duration?: number
          updated_at?: string
          videos?: Json
        }
        Relationships: []
      }
      hof_maps: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          support_material_title: string | null
          support_material_url: string | null
          total_duration: number
          updated_at: string
          videos: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          support_material_title?: string | null
          support_material_url?: string | null
          total_duration?: number
          updated_at?: string
          videos?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          support_material_title?: string | null
          support_material_url?: string | null
          total_duration?: number
          updated_at?: string
          videos?: Json
        }
        Relationships: []
      }
      home_blocks: {
        Row: {
          created_at: string
          data: Json
          id: string
          order_index: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          order_index?: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          order_index?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_watch_progress: {
        Row: {
          completed: boolean | null
          id: string
          last_watched_at: string | null
          lesson_id: string | null
          total_duration: number | null
          user_id: string
          watched_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          id?: string
          last_watched_at?: string | null
          lesson_id?: string | null
          total_duration?: number | null
          user_id: string
          watched_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          id?: string
          last_watched_at?: string | null
          lesson_id?: string | null
          total_duration?: number | null
          user_id?: string
          watched_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_watch_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
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
          blocked: boolean
          created_at: string
          email: string | null
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
          blocked?: boolean
          created_at?: string
          email?: string | null
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
          blocked?: boolean
          created_at?: string
          email?: string | null
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
          featured_folder_ids: string[] | null
          featured_process_ids: string[] | null
          id: string
          links: Json | null
          parent_folder_ids: string[] | null
          pdfs: Json | null
          related_process_ids: string[] | null
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
          featured_folder_ids?: string[] | null
          featured_process_ids?: string[] | null
          id?: string
          links?: Json | null
          parent_folder_ids?: string[] | null
          pdfs?: Json | null
          related_process_ids?: string[] | null
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
          featured_folder_ids?: string[] | null
          featured_process_ids?: string[] | null
          id?: string
          links?: Json | null
          parent_folder_ids?: string[] | null
          pdfs?: Json | null
          related_process_ids?: string[] | null
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
      traffic_tracking: {
        Row: {
          appointments: number
          attendance: number
          average_ticket: number
          created_at: string
          deals: number
          id: string
          investment: number
          leads_generated: number
          revenue: number
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          appointments?: number
          attendance?: number
          average_ticket?: number
          created_at?: string
          deals?: number
          id?: string
          investment?: number
          leads_generated?: number
          revenue?: number
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          appointments?: number
          attendance?: number
          average_ticket?: number
          created_at?: string
          deals?: number
          id?: string
          investment?: number
          leads_generated?: number
          revenue?: number
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string
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
      public_profiles: {
        Row: {
          avatar: string | null
          name: string | null
          user_id: string | null
        }
        Insert: {
          avatar?: string | null
          name?: string | null
          user_id?: string | null
        }
        Update: {
          avatar?: string | null
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
