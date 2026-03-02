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
      activities: {
        Row: {
          completed_at: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          id: string
          scheduled_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          id?: string
          scheduled_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          id?: string
          scheduled_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          contact_id: string | null
          created_at: string
          direction: string
          duration: number | null
          id: string
          phone_number: string | null
          recording_url: string | null
          status: string
          transcript: string | null
          twilio_call_sid: string | null
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          direction?: string
          duration?: number | null
          id?: string
          phone_number?: string | null
          recording_url?: string | null
          status?: string
          transcript?: string | null
          twilio_call_sid?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          direction?: string
          duration?: number | null
          id?: string
          phone_number?: string | null
          recording_url?: string | null
          status?: string
          transcript?: string | null
          twilio_call_sid?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          channel: string
          contact_id: string | null
          content: string
          created_at: string
          direction: string
          id: string
          metadata: Json
          user_id: string
        }
        Insert: {
          channel: string
          contact_id?: string | null
          content: string
          created_at?: string
          direction?: string
          id?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          channel?: string
          contact_id?: string | null
          content?: string
          created_at?: string
          direction?: string
          id?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_documents: {
        Row: {
          contact_id: string
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_documents_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_rag_chunks: {
        Row: {
          contact_id: string
          content: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json
        }
        Insert: {
          contact_id: string
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          contact_id?: string
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "contact_rag_chunks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_social_handles: {
        Row: {
          contact_id: string
          created_at: string
          handle: string
          id: string
          platform: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          handle: string
          id?: string
          platform: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          handle?: string
          id?: string
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_social_handles_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          title: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      credit_ledger: {
        Row: {
          amount: number
          created_at: string
          credit_source: string | null
          credit_type: string
          description: string | null
          id: string
          model: string | null
          openai_request_id: string | null
          stripe_event_id: string | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credit_source?: string | null
          credit_type: string
          description?: string | null
          id?: string
          model?: string | null
          openai_request_id?: string | null
          stripe_event_id?: string | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credit_source?: string | null
          credit_type?: string
          description?: string | null
          id?: string
          model?: string | null
          openai_request_id?: string | null
          stripe_event_id?: string | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          contact_id: string | null
          created_at: string
          currency: string
          expected_close_date: string | null
          id: string
          notes: string | null
          pipeline_id: string
          stage_id: string
          status: string
          title: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          currency?: string
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          pipeline_id: string
          stage_id: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          currency?: string
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          pipeline_id?: string
          stage_id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          contact_id: string | null
          created_at: string
          daily_room_name: string | null
          daily_room_url: string | null
          ended_at: string | null
          id: string
          mom: string | null
          started_at: string | null
          status: string
          transcript: string | null
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          daily_room_name?: string | null
          daily_room_url?: string | null
          ended_at?: string | null
          id?: string
          mom?: string | null
          started_at?: string | null
          status?: string
          transcript?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          daily_room_name?: string | null
          daily_room_url?: string | null
          ended_at?: string | null
          id?: string
          mom?: string | null
          started_at?: string | null
          status?: string
          transcript?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          pipeline_id: string
          position: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          pipeline_id: string
          position?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          pipeline_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      product_rag_chunks: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json
          product_id: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          product_id: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_rag_chunks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          currency: string
          description: string | null
          documents: string[]
          id: string
          is_active: boolean
          name: string
          photos: string[]
          price: number | null
          sku: string | null
          specifications: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          documents?: string[]
          id?: string
          is_active?: boolean
          name: string
          photos?: string[]
          price?: number | null
          sku?: string | null
          specifications?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          documents?: string[]
          id?: string
          is_active?: boolean
          name?: string
          photos?: string[]
          price?: number | null
          sku?: string | null
          specifications?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          credits: number
          id: string
          name: string
          price_usd: number
          stripe_price_id: string
        }
        Insert: {
          credits: number
          id: string
          name: string
          price_usd: number
          stripe_price_id: string
        }
        Update: {
          credits?: number
          id?: string
          name?: string
          price_usd?: number
          stripe_price_id?: string
        }
        Relationships: []
      }
      support_ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string | null
          created_at: string
          description: string
          id: string
          priority: string
          screenshot_url: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          screenshot_url?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          screenshot_url?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      credit_balance: {
        Row: {
          balance: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      match_contact_rag: {
        Args: {
          match_contact_id: string
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      match_product_rag: {
        Args: {
          match_count: number
          match_threshold: number
          match_user_id: string
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
