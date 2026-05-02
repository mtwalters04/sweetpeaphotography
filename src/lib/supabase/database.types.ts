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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      available_slots: {
        Row: {
          created_at: string
          duration_minutes: number
          held_by_user: string | null
          hold_expires_at: string | null
          id: string
          location_label: string | null
          notes: string | null
          photographer_id: string | null
          price_cents: number
          private_for_user: string | null
          private_request_id: string | null
          session_type_id: string
          starts_at: string
          status: Database["public"]["Enums"]["slot_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          held_by_user?: string | null
          hold_expires_at?: string | null
          id?: string
          location_label?: string | null
          notes?: string | null
          photographer_id?: string | null
          price_cents: number
          private_for_user?: string | null
          private_request_id?: string | null
          session_type_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["slot_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          held_by_user?: string | null
          hold_expires_at?: string | null
          id?: string
          location_label?: string | null
          notes?: string | null
          photographer_id?: string | null
          price_cents?: number
          private_for_user?: string | null
          private_request_id?: string | null
          session_type_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["slot_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "available_slots_held_by_user_fkey"
            columns: ["held_by_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "available_slots_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "available_slots_private_for_user_fkey"
            columns: ["private_for_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "available_slots_private_request_id_fkey"
            columns: ["private_request_id"]
            isOneToOne: false
            referencedRelation: "custom_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "available_slots_session_type_id_fkey"
            columns: ["session_type_id"]
            isOneToOne: false
            referencedRelation: "session_types"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          body_md: string
          canonical_url: string | null
          created_at: string
          dek: string | null
          hero_image_alt: string | null
          hero_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          related_service_slug: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"]
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body_md?: string
          canonical_url?: string | null
          created_at?: string
          dek?: string | null
          hero_image_alt?: string | null
          hero_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          related_service_slug?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body_md?: string
          canonical_url?: string | null
          created_at?: string
          dek?: string | null
          hero_image_alt?: string | null
          hero_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          related_service_slug?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount_cents: number
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: Database["public"]["Enums"]["cancelled_by"] | null
          created_at: string
          credit_applied_cents: number
          customer_id: string
          deposit_cents: number
          id: string
          notes: string | null
          photographer_id: string | null
          pipeline_stage: Database["public"]["Enums"]["pipeline_stage"]
          session_type_id: string | null
          slot_id: string
          starts_at: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: Database["public"]["Enums"]["cancelled_by"] | null
          created_at?: string
          credit_applied_cents?: number
          customer_id: string
          deposit_cents: number
          id?: string
          notes?: string | null
          photographer_id?: string | null
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"]
          session_type_id?: string | null
          slot_id: string
          starts_at: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: Database["public"]["Enums"]["cancelled_by"] | null
          created_at?: string
          credit_applied_cents?: number
          customer_id?: string
          deposit_cents?: number
          id?: string
          notes?: string | null
          photographer_id?: string | null
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"]
          session_type_id?: string | null
          slot_id?: string
          starts_at?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_session_type_id_fkey"
            columns: ["session_type_id"]
            isOneToOne: false
            referencedRelation: "session_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: true
            referencedRelation: "available_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_ledger: {
        Row: {
          amount_cents: number
          booking_id: string | null
          created_at: string
          customer_id: string
          id: string
          issued_by: string | null
          notes: string | null
          reason: string
        }
        Insert: {
          amount_cents: number
          booking_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          issued_by?: string | null
          notes?: string | null
          reason: string
        }
        Update: {
          amount_cents?: number
          booking_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          issued_by?: string | null
          notes?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_requests: {
        Row: {
          accepted_at: string | null
          assigned_admin_id: string | null
          converted_at: string | null
          created_at: string
          customer_id: string
          declined_at: string | null
          declined_reason: string | null
          id: string
          location_hint: string | null
          message: string
          photographer_pref: Database["public"]["Enums"]["photographer_pref"]
          preferred_date: string | null
          preferred_session_type_slug: string | null
          preferred_time: string | null
          quote_amount_cents: number | null
          quote_message: string | null
          quote_slot_id: string | null
          quoted_at: string | null
          reference_image_keys: string[]
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          withdrawn_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          assigned_admin_id?: string | null
          converted_at?: string | null
          created_at?: string
          customer_id: string
          declined_at?: string | null
          declined_reason?: string | null
          id?: string
          location_hint?: string | null
          message: string
          photographer_pref?: Database["public"]["Enums"]["photographer_pref"]
          preferred_date?: string | null
          preferred_session_type_slug?: string | null
          preferred_time?: string | null
          quote_amount_cents?: number | null
          quote_message?: string | null
          quote_slot_id?: string | null
          quoted_at?: string | null
          reference_image_keys?: string[]
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          withdrawn_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          assigned_admin_id?: string | null
          converted_at?: string | null
          created_at?: string
          customer_id?: string
          declined_at?: string | null
          declined_reason?: string | null
          id?: string
          location_hint?: string | null
          message?: string
          photographer_pref?: Database["public"]["Enums"]["photographer_pref"]
          preferred_date?: string | null
          preferred_session_type_slug?: string | null
          preferred_time?: string | null
          quote_amount_cents?: number | null
          quote_message?: string | null
          quote_slot_id?: string | null
          quoted_at?: string | null
          reference_image_keys?: string[]
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_requests_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_requests_quote_slot_id_fkey"
            columns: ["quote_slot_id"]
            isOneToOne: false
            referencedRelation: "available_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      email_log: {
        Row: {
          booking_id: string | null
          error: string | null
          id: string
          request_id: string | null
          resend_id: string | null
          sent_at: string
          subject: string
          template: string
          to_email: string
        }
        Insert: {
          booking_id?: string | null
          error?: string | null
          id?: string
          request_id?: string | null
          resend_id?: string | null
          sent_at?: string
          subject: string
          template: string
          to_email: string
        }
        Update: {
          booking_id?: string | null
          error?: string | null
          id?: string
          request_id?: string | null
          resend_id?: string | null
          sent_at?: string
          subject?: string
          template?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_log_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "custom_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          booking_id: string
          content_type: string | null
          created_at: string
          file_name: string | null
          id: string
          kind: Database["public"]["Enums"]["gallery_kind"]
          order_index: number
          r2_key: string
          size_bytes: number | null
        }
        Insert: {
          booking_id: string
          content_type?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["gallery_kind"]
          order_index?: number
          r2_key: string
          size_bytes?: number | null
        }
        Update: {
          booking_id?: string
          content_type?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["gallery_kind"]
          order_index?: number
          r2_key?: string
          size_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_collections: {
        Row: {
          cover_image_alt: string | null
          cover_image_key: string | null
          created_at: string
          eyebrow: string | null
          id: string
          order_index: number
          published: boolean
          slug: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_alt?: string | null
          cover_image_key?: string | null
          created_at?: string
          eyebrow?: string | null
          id?: string
          order_index?: number
          published?: boolean
          slug: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_alt?: string | null
          cover_image_key?: string | null
          created_at?: string
          eyebrow?: string | null
          id?: string
          order_index?: number
          published?: boolean
          slug?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          alt: string | null
          collection_id: string
          content_type: string | null
          created_at: string
          file_name: string | null
          id: string
          orientation: string
          order_index: number
          r2_key: string
          size_bytes: number | null
        }
        Insert: {
          alt?: string | null
          collection_id: string
          content_type?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          orientation?: string
          order_index?: number
          r2_key: string
          size_bytes?: number | null
        }
        Update: {
          alt?: string | null
          collection_id?: string
          content_type?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          orientation?: string
          order_index?: number
          r2_key?: string
          size_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "portfolio_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      photographers: {
        Row: {
          active: boolean
          created_at: string
          id: string
          order_index: number
          profile_id: string | null
          public_bio: string | null
          public_name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          order_index?: number
          profile_id?: string | null
          public_bio?: string | null
          public_name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          order_index?: number
          profile_id?: string | null
          public_bio?: string | null
          public_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "photographers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          internal_notes: string | null
          last_contact_at: string | null
          lifecycle_stage: Database["public"]["Enums"]["lifecycle_stage"] | null
          phone: string | null
          role: Database["public"]["Enums"]["profile_role"]
          tags: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          internal_notes?: string | null
          last_contact_at?: string | null
          lifecycle_stage?:
            | Database["public"]["Enums"]["lifecycle_stage"]
            | null
          phone?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          tags?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          internal_notes?: string | null
          last_contact_at?: string | null
          lifecycle_stage?:
            | Database["public"]["Enums"]["lifecycle_stage"]
            | null
          phone?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      request_messages: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          internal: boolean
          request_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          internal?: boolean
          request_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          internal?: boolean
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "custom_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      session_types: {
        Row: {
          active: boolean
          created_at: string
          deposit_pct: number
          description: string | null
          duration_minutes: number
          eyebrow: string | null
          id: string
          includes: string[]
          name: string
          order_index: number
          slug: string
          starting_at_cents: number
          summary: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          deposit_pct?: number
          description?: string | null
          duration_minutes?: number
          eyebrow?: string | null
          id?: string
          includes?: string[]
          name: string
          order_index?: number
          slug: string
          starting_at_cents: number
          summary?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          deposit_pct?: number
          description?: string | null
          duration_minutes?: number
          eyebrow?: string | null
          id?: string
          includes?: string[]
          name?: string
          order_index?: number
          slug?: string
          starting_at_cents?: number
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          approved: boolean
          attribution: string
          booking_id: string | null
          context: string | null
          created_at: string
          featured: boolean
          id: string
          order_index: number
          quote: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          attribution: string
          booking_id?: string | null
          context?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          order_index?: number
          quote: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          attribution?: string
          booking_id?: string | null
          context?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          order_index?: number
          quote?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      credit_balances: {
        Row: {
          balance_cents: number | null
          customer_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      confirm_booking_with_credit_only: {
        Args: { p_slot_id: string }
        Returns: string
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["profile_role"]
      }
      rate_limit_check: {
        Args: { p_key: string; p_window_seconds: number; p_max: number }
        Returns: { allowed: boolean; retry_after_seconds: number }[]
      }
      rate_limit_prune: {
        Args: { p_older_than_seconds?: number }
        Returns: number
      }
    }
    Enums: {
      cancelled_by: "customer" | "studio" | "system"
      gallery_kind: "original" | "web" | "delivery_zip"
      lifecycle_stage: "lead" | "active" | "past_client" | "dormant"
      photographer_pref: "a" | "b" | "either" | "none"
      pipeline_stage:
        | "booked"
        | "shoot_scheduled"
        | "shoot_complete"
        | "editing"
        | "delivered"
        | "archived"
        | "cancelled"
      post_status: "draft" | "published" | "archived"
      profile_role: "customer" | "photographer" | "super_admin"
      request_status:
        | "pending"
        | "quoted"
        | "accepted"
        | "declined"
        | "withdrawn"
        | "converted"
      slot_status: "open" | "held" | "booked" | "cancelled"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      cancelled_by: ["customer", "studio", "system"],
      gallery_kind: ["original", "web", "delivery_zip"],
      lifecycle_stage: ["lead", "active", "past_client", "dormant"],
      photographer_pref: ["a", "b", "either", "none"],
      pipeline_stage: [
        "booked",
        "shoot_scheduled",
        "shoot_complete",
        "editing",
        "delivered",
        "archived",
        "cancelled",
      ],
      post_status: ["draft", "published", "archived"],
      profile_role: ["customer", "photographer", "super_admin"],
      request_status: [
        "pending",
        "quoted",
        "accepted",
        "declined",
        "withdrawn",
        "converted",
      ],
      slot_status: ["open", "held", "booked", "cancelled"],
    },
  },
} as const
