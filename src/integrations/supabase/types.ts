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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          background_image: string | null
          created_at: string
          description: string | null
          downloads: number
          frame_image: string
          frame_image_landscape: string | null
          frame_image_portrait: string | null
          hashtags: string[]
          id: string
          is_demo: boolean
          slug: string | null
          text_elements: Json
          title: string
          type: string
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          background_image?: string | null
          created_at?: string
          description?: string | null
          downloads?: number
          frame_image: string
          frame_image_landscape?: string | null
          frame_image_portrait?: string | null
          hashtags?: string[]
          id?: string
          is_demo?: boolean
          slug?: string | null
          text_elements?: Json
          title: string
          type: string
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          background_image?: string | null
          created_at?: string
          description?: string | null
          downloads?: number
          frame_image?: string
          frame_image_landscape?: string | null
          frame_image_portrait?: string | null
          hashtags?: string[]
          id?: string
          is_demo?: boolean
          slug?: string | null
          text_elements?: Json
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          city: string
          cover_image: string | null
          created_at: string
          currency: string | null
          description: string | null
          event_date: string
          frame_image: string
          id: string
          is_active: boolean | null
          max_tickets: number | null
          qr_position_x: number | null
          qr_position_y: number | null
          ticket_price: number | null
          title: string
          updated_at: string
          user_id: string
          venue: string
        }
        Insert: {
          city: string
          cover_image?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          event_date: string
          frame_image: string
          id?: string
          is_active?: boolean | null
          max_tickets?: number | null
          qr_position_x?: number | null
          qr_position_y?: number | null
          ticket_price?: number | null
          title: string
          updated_at?: string
          user_id: string
          venue: string
        }
        Update: {
          city?: string
          cover_image?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          event_date?: string
          frame_image?: string
          id?: string
          is_active?: boolean | null
          max_tickets?: number | null
          qr_position_x?: number | null
          qr_position_y?: number | null
          ticket_price?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      public_visuals: {
        Row: {
          created_at: string
          creator_name: string
          creator_photo: string | null
          event_id: string
          id: string
          is_approved: boolean | null
          user_id: string | null
          views: number | null
          visual_url: string
        }
        Insert: {
          created_at?: string
          creator_name: string
          creator_photo?: string | null
          event_id: string
          id?: string
          is_approved?: boolean | null
          user_id?: string | null
          views?: number | null
          visual_url: string
        }
        Update: {
          created_at?: string
          creator_name?: string
          creator_photo?: string | null
          event_id?: string
          id?: string
          is_approved?: boolean | null
          user_id?: string | null
          views?: number | null
          visual_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_visuals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_visuals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string
          currency: string
          event_id: string
          id: string
          is_gift: boolean
          owner_id: string | null
          price: number
          purchaser_id: string
          qr_code: string
          recipient_email: string | null
          recipient_name: string | null
          recipient_phone: string | null
          scanned_at: string | null
          scanned_by: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          event_id: string
          id?: string
          is_gift?: boolean
          owner_id?: string | null
          price: number
          purchaser_id: string
          qr_code: string
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          scanned_at?: string | null
          scanned_by?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          event_id?: string
          id?: string
          is_gift?: boolean
          owner_id?: string | null
          price?: number
          purchaser_id?: string
          qr_code?: string
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          scanned_at?: string | null
          scanned_by?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_phone: string | null
          payment_reference: string | null
          status: string
          ticket_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_phone?: string | null
          payment_reference?: string | null
          status?: string
          ticket_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_phone?: string | null
          payment_reference?: string | null
          status?: string
          ticket_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_slug_availability: {
        Args: { check_slug: string; exclude_id?: string }
        Returns: boolean
      }
      generate_ticket_qr_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _event_id?: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_campaign_views: {
        Args: { campaign_id: string }
        Returns: undefined
      }
      is_admin_or_promoter: { Args: { _user_id: string }; Returns: boolean }
      is_event_staff: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "promoter" | "staff" | "scanner" | "user"
      payment_method:
        | "orange_money"
        | "mtn_money"
        | "moov_money"
        | "wave"
        | "card"
        | "free"
      ticket_status: "pending" | "paid" | "used" | "cancelled" | "expired"
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
      app_role: ["admin", "promoter", "staff", "scanner", "user"],
      payment_method: [
        "orange_money",
        "mtn_money",
        "moov_money",
        "wave",
        "card",
        "free",
      ],
      ticket_status: ["pending", "paid", "used", "cancelled", "expired"],
    },
  },
} as const
