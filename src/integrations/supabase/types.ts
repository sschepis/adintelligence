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
      ab_test_results: {
        Row: {
          campaign_name: string | null
          concluded_at: string | null
          confidence_level: string | null
          control_clicks: number | null
          control_conversions: number | null
          control_ctr: number | null
          control_impressions: number | null
          created_at: string
          id: string
          started_at: string
          status: string
          suggestion_id: string
          suggestion_text: string
          suggestion_type: string
          traffic_percent: number
          updated_at: string
          user_id: string
          variant_clicks: number | null
          variant_conversions: number | null
          variant_ctr: number | null
          variant_impressions: number | null
          winner: string | null
        }
        Insert: {
          campaign_name?: string | null
          concluded_at?: string | null
          confidence_level?: string | null
          control_clicks?: number | null
          control_conversions?: number | null
          control_ctr?: number | null
          control_impressions?: number | null
          created_at?: string
          id?: string
          started_at?: string
          status?: string
          suggestion_id: string
          suggestion_text: string
          suggestion_type: string
          traffic_percent?: number
          updated_at?: string
          user_id: string
          variant_clicks?: number | null
          variant_conversions?: number | null
          variant_ctr?: number | null
          variant_impressions?: number | null
          winner?: string | null
        }
        Update: {
          campaign_name?: string | null
          concluded_at?: string | null
          confidence_level?: string | null
          control_clicks?: number | null
          control_conversions?: number | null
          control_ctr?: number | null
          control_impressions?: number | null
          created_at?: string
          id?: string
          started_at?: string
          status?: string
          suggestion_id?: string
          suggestion_text?: string
          suggestion_type?: string
          traffic_percent?: number
          updated_at?: string
          user_id?: string
          variant_clicks?: number | null
          variant_conversions?: number | null
          variant_ctr?: number | null
          variant_impressions?: number | null
          winner?: string | null
        }
        Relationships: []
      }
      ab_test_schedules: {
        Row: {
          audience_segments: string[] | null
          auto_conclude_hours: number | null
          created_at: string
          days_of_week: number[] | null
          enabled: boolean | null
          end_time: string | null
          id: string
          name: string
          schedule_type: string
          start_time: string | null
          traffic_percent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          audience_segments?: string[] | null
          auto_conclude_hours?: number | null
          created_at?: string
          days_of_week?: number[] | null
          enabled?: boolean | null
          end_time?: string | null
          id?: string
          name: string
          schedule_type?: string
          start_time?: string | null
          traffic_percent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          audience_segments?: string[] | null
          auto_conclude_hours?: number | null
          created_at?: string
          days_of_week?: number[] | null
          enabled?: boolean | null
          end_time?: string | null
          id?: string
          name?: string
          schedule_type?: string
          start_time?: string | null
          traffic_percent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      access_requests: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          status: string
          website_url: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          status?: string
          website_url: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          status?: string
          website_url?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      api_tokens: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          last_used_at: string | null
          name: string
          org_id: string
          rate_limit_requests: number | null
          rate_limit_reset_at: string | null
          rate_limit_window_seconds: number | null
          requests_count: number | null
          revoked_at: string | null
          revoked_by: string | null
          scopes: string[] | null
          token_hash: string
          token_prefix: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          org_id: string
          rate_limit_requests?: number | null
          rate_limit_reset_at?: string | null
          rate_limit_window_seconds?: number | null
          requests_count?: number | null
          revoked_at?: string | null
          revoked_by?: string | null
          scopes?: string[] | null
          token_hash: string
          token_prefix: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          org_id?: string
          rate_limit_requests?: number | null
          rate_limit_reset_at?: string | null
          rate_limit_window_seconds?: number | null
          requests_count?: number | null
          revoked_at?: string | null
          revoked_by?: string | null
          scopes?: string[] | null
          token_hash?: string
          token_prefix?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_tokens_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_logs: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          method: string
          org_id: string
          rate_limited: boolean | null
          response_time_ms: number | null
          status_code: number
          token_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          method: string
          org_id: string
          rate_limited?: boolean | null
          response_time_ms?: number | null
          status_code: number
          token_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          method?: string
          org_id?: string
          rate_limited?: boolean | null
          response_time_ms?: number | null
          status_code?: number
          token_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_usage_logs_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "api_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          accent_color: string | null
          background_color: string | null
          brand_dna_score: Json | null
          brand_guardrails: Json | null
          brand_personality: Json | null
          brand_story: Json | null
          brand_voice: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          metadata: Json | null
          name: string
          org_id: string
          primary_color: string | null
          products: Json | null
          raw_profile: Json | null
          secondary_color: string | null
          sidebar_visibility: Json | null
          taxonomy: Json | null
          text_color: string | null
          updated_at: string
          website_url: string
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          brand_dna_score?: Json | null
          brand_guardrails?: Json | null
          brand_personality?: Json | null
          brand_story?: Json | null
          brand_voice?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          metadata?: Json | null
          name: string
          org_id: string
          primary_color?: string | null
          products?: Json | null
          raw_profile?: Json | null
          secondary_color?: string | null
          sidebar_visibility?: Json | null
          taxonomy?: Json | null
          text_color?: string | null
          updated_at?: string
          website_url: string
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          brand_dna_score?: Json | null
          brand_guardrails?: Json | null
          brand_personality?: Json | null
          brand_story?: Json | null
          brand_voice?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          org_id?: string
          primary_color?: string | null
          products?: Json | null
          raw_profile?: Json | null
          secondary_color?: string | null
          sidebar_visibility?: Json | null
          taxonomy?: Json | null
          text_color?: string | null
          updated_at?: string
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_id: string | null
          clicks: number | null
          conversions: number | null
          created_at: string
          daily_budget: number
          id: string
          impressions: number | null
          name: string
          performance_score: number | null
          platform: string | null
          spent: number
          status: string
          total_budget: number
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          daily_budget?: number
          id?: string
          impressions?: number | null
          name: string
          performance_score?: number | null
          platform?: string | null
          spent?: number
          status?: string
          total_budget?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          daily_budget?: number
          id?: string
          impressions?: number | null
          name?: string
          performance_score?: number | null
          platform?: string | null
          spent?: number
          status?: string
          total_budget?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_time_entries: {
        Row: {
          created_at: string
          creative_id: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          notes: string | null
          request_id: string
          started_at: string
        }
        Insert: {
          created_at?: string
          creative_id: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          request_id: string
          started_at?: string
        }
        Update: {
          created_at?: string
          creative_id?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          request_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_time_entries_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "visual_forge_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verifications: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          user_id: string
          verification_code: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          user_id: string
          verification_code: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          user_id?: string
          verification_code?: string
          verified?: boolean
        }
        Relationships: []
      }
      organizations: {
        Row: {
          accent_color: string | null
          background_color: string | null
          brand_dna_score: Json | null
          brand_guardrails: Json | null
          brand_personality: Json | null
          brand_story: Json | null
          brand_voice: Json | null
          created_at: string
          id: string
          logo_url: string | null
          metadata: Json | null
          name: string
          owner_id: string
          primary_color: string | null
          products: Json | null
          secondary_color: string | null
          subscription_status: string | null
          taxonomy: Json | null
          text_color: string | null
          trial_ends_at: string | null
          updated_at: string
          website_url: string
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          brand_dna_score?: Json | null
          brand_guardrails?: Json | null
          brand_personality?: Json | null
          brand_story?: Json | null
          brand_voice?: Json | null
          created_at?: string
          id?: string
          logo_url?: string | null
          metadata?: Json | null
          name: string
          owner_id: string
          primary_color?: string | null
          products?: Json | null
          secondary_color?: string | null
          subscription_status?: string | null
          taxonomy?: Json | null
          text_color?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          website_url: string
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          brand_dna_score?: Json | null
          brand_guardrails?: Json | null
          brand_personality?: Json | null
          brand_story?: Json | null
          brand_voice?: Json | null
          created_at?: string
          id?: string
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          owner_id?: string
          primary_color?: string | null
          products?: Json | null
          secondary_color?: string | null
          subscription_status?: string | null
          taxonomy?: Json | null
          text_color?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          website_url?: string
        }
        Relationships: []
      }
      personas: {
        Row: {
          age: string | null
          avatar: string
          buying_behavior: string | null
          created_at: string
          id: string
          income: string | null
          is_template: boolean | null
          name: string
          occupation: string | null
          template_category: string | null
          traits: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: string | null
          avatar?: string
          buying_behavior?: string | null
          created_at?: string
          id?: string
          income?: string | null
          is_template?: boolean | null
          name: string
          occupation?: string | null
          template_category?: string | null
          traits?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: string | null
          avatar?: string
          buying_behavior?: string | null
          created_at?: string
          id?: string
          income?: string | null
          is_template?: boolean | null
          name?: string
          occupation?: string | null
          template_category?: string | null
          traits?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_usage: {
        Row: {
          action_type: string
          created_at: string
          feature_name: string
          id: string
          metadata: Json | null
          org_id: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          feature_name: string
          id?: string
          metadata?: Json | null
          org_id?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          feature_name?: string
          id?: string
          metadata?: Json | null
          org_id?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_brand_id: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email_verified: boolean | null
          id: string
          org_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_brand_id?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email_verified?: boolean | null
          id?: string
          org_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_brand_id?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email_verified?: boolean | null
          id?: string
          org_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_brand_id_fkey"
            columns: ["active_brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_trends: {
        Row: {
          ai_analysis: string | null
          id: string
          platform: string | null
          saved_at: string
          sentiment_score: number | null
          trend_name: string
          user_id: string
          velocity: string | null
          volume: string | null
        }
        Insert: {
          ai_analysis?: string | null
          id?: string
          platform?: string | null
          saved_at?: string
          sentiment_score?: number | null
          trend_name: string
          user_id: string
          velocity?: string | null
          volume?: string | null
        }
        Update: {
          ai_analysis?: string | null
          id?: string
          platform?: string | null
          saved_at?: string
          sentiment_score?: number | null
          trend_name?: string
          user_id?: string
          velocity?: string | null
          volume?: string | null
        }
        Relationships: []
      }
      shared_briefs: {
        Row: {
          brief: Json
          created_at: string
          expires_at: string | null
          feedback: Json | null
          id: string
          org_id: string | null
          share_code: string
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          brief: Json
          created_at?: string
          expires_at?: string | null
          feedback?: Json | null
          id?: string
          org_id?: string | null
          share_code: string
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          brief?: Json
          created_at?: string
          expires_at?: string | null
          feedback?: Json | null
          id?: string
          org_id?: string | null
          share_code?: string
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_briefs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_connections: {
        Row: {
          access_token: string
          created_at: string
          id: string
          org_id: string
          scope: string | null
          shop_domain: string
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          org_id: string
          scope?: string | null
          shop_domain: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          org_id?: string
          scope?: string | null
          shop_domain?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopify_connections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_results: {
        Row: {
          ad_body: string | null
          ad_headline: string
          ad_image_url: string | null
          created_at: string
          id: string
          overall_score: number | null
          personas: Json | null
          reactions: Json | null
          recommendation: string | null
          user_id: string
        }
        Insert: {
          ad_body?: string | null
          ad_headline: string
          ad_image_url?: string | null
          created_at?: string
          id?: string
          overall_score?: number | null
          personas?: Json | null
          reactions?: Json | null
          recommendation?: string | null
          user_id: string
        }
        Update: {
          ad_body?: string | null
          ad_headline?: string
          ad_image_url?: string | null
          created_at?: string
          id?: string
          overall_score?: number | null
          personas?: Json | null
          reactions?: Json | null
          recommendation?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sysadmin_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          alert_type: string
          created_at: string
          details: Json | null
          id: string
          message: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          service_name: string
          severity: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          details?: Json | null
          id?: string
          message: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          service_name: string
          severity?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          message?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          service_name?: string
          severity?: string
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          status: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          status?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          status?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      user_org_memberships: {
        Row: {
          brand_access: string[] | null
          created_at: string
          id: string
          org_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_access?: string[] | null
          created_at?: string
          id?: string
          org_id: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_access?: string[] | null
          created_at?: string
          id?: string
          org_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_org_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_ad_jobs: {
        Row: {
          brand_id: string | null
          brief: string | null
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          manifest: Json
          metadata: Json | null
          org_id: string
          output_url: string | null
          progress: number
          provider: string | null
          provider_job_id: string | null
          status: string
          storyboard_frames: Json
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          brief?: string | null
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          manifest?: Json
          metadata?: Json | null
          org_id: string
          output_url?: string | null
          progress?: number
          provider?: string | null
          provider_job_id?: string | null
          status?: string
          storyboard_frames?: Json
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          brief?: string | null
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          manifest?: Json
          metadata?: Json | null
          org_id?: string
          output_url?: string | null
          progress?: number
          provider?: string | null
          provider_job_id?: string | null
          status?: string
          storyboard_frames?: Json
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_ad_jobs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_ad_jobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      visual_analysis_cache: {
        Row: {
          aesthetic_style: string | null
          color_hex_codes: string[] | null
          color_match_score: number | null
          created_at: string
          dominant_colors: string[] | null
          id: string
          image_url: string
          luxury_score: number | null
          patterns: string[] | null
          product_id: string
          trend_colors: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aesthetic_style?: string | null
          color_hex_codes?: string[] | null
          color_match_score?: number | null
          created_at?: string
          dominant_colors?: string[] | null
          id?: string
          image_url: string
          luxury_score?: number | null
          patterns?: string[] | null
          product_id: string
          trend_colors?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aesthetic_style?: string | null
          color_hex_codes?: string[] | null
          color_match_score?: number | null
          created_at?: string
          dominant_colors?: string[] | null
          id?: string
          image_url?: string
          luxury_score?: number | null
          patterns?: string[] | null
          product_id?: string
          trend_colors?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      visual_forge_requests: {
        Row: {
          ai_generated_assets: Json | null
          ai_generation_prompt: string | null
          assigned_to: string | null
          brand_guidelines: Json | null
          completed_at: string | null
          created_at: string
          deliverables: Json | null
          description: string | null
          feedback: string | null
          hourly_rate: number | null
          id: string
          org_id: string | null
          priority: string | null
          reference_urls: string[] | null
          request_type: string
          status: string
          title: string
          total_cost: number | null
          total_time_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated_assets?: Json | null
          ai_generation_prompt?: string | null
          assigned_to?: string | null
          brand_guidelines?: Json | null
          completed_at?: string | null
          created_at?: string
          deliverables?: Json | null
          description?: string | null
          feedback?: string | null
          hourly_rate?: number | null
          id?: string
          org_id?: string | null
          priority?: string | null
          reference_urls?: string[] | null
          request_type: string
          status?: string
          title: string
          total_cost?: number | null
          total_time_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated_assets?: Json | null
          ai_generation_prompt?: string | null
          assigned_to?: string | null
          brand_guidelines?: Json | null
          completed_at?: string | null
          created_at?: string
          deliverables?: Json | null
          description?: string | null
          feedback?: string | null
          hourly_rate?: number | null
          id?: string
          org_id?: string | null
          priority?: string | null
          reference_urls?: string[] | null
          request_type?: string
          status?: string
          title?: string
          total_cost?: number | null
          total_time_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visual_forge_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          created_by: string
          events: string[]
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_status_code: number | null
          last_triggered_at: string | null
          name: string
          org_id: string
          secret: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by: string
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_status_code?: number | null
          last_triggered_at?: string | null
          name: string
          org_id: string
          secret: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_status_code?: number | null
          last_triggered_at?: string | null
          name?: string
          org_id?: string
          secret?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      writing_forge_content: {
        Row: {
          brief: string | null
          content_type: string
          created_at: string
          generated_content: Json | null
          id: string
          keywords: string[] | null
          org_id: string | null
          status: string
          target_audience: string | null
          title: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brief?: string | null
          content_type: string
          created_at?: string
          generated_content?: Json | null
          id?: string
          keywords?: string[] | null
          org_id?: string | null
          status?: string
          target_audience?: string | null
          title: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brief?: string | null
          content_type?: string
          created_at?: string
          generated_content?: Json | null
          id?: string
          keywords?: string[] | null
          org_id?: string | null
          status?: string
          target_audience?: string | null
          title?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "writing_forge_content_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_brand_access: {
        Args: { _brand_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_admin: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
