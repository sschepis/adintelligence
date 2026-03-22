CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;


--
-- Name: has_brand_access(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_brand_access(_user_id uuid, _brand_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.brands b
    JOIN public.user_org_memberships m ON m.org_id = b.org_id
    WHERE b.id = _brand_id
      AND m.user_id = _user_id
      AND (m.brand_access IS NULL OR _brand_id = ANY(m.brand_access))
  )
  OR EXISTS (
    SELECT 1
    FROM public.brands b
    JOIN public.organizations o ON o.id = b.org_id
    WHERE b.id = _brand_id
      AND o.owner_id = _user_id
  )
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_org_admin(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_org_admin(p_org_id uuid, p_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_org_memberships
    WHERE org_id = p_org_id
    AND user_id = p_user_id
    AND role IN ('owner', 'admin')
  );
$$;


--
-- Name: is_org_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_org_memberships
    WHERE user_id = _user_id
      AND org_id = _org_id
  )
  OR EXISTS (
    SELECT 1
    FROM public.organizations
    WHERE id = _org_id
      AND owner_id = _user_id
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: ab_test_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ab_test_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    suggestion_id text NOT NULL,
    suggestion_type text NOT NULL,
    suggestion_text text NOT NULL,
    campaign_name text,
    traffic_percent integer DEFAULT 50 NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    concluded_at timestamp with time zone,
    status text DEFAULT 'running'::text NOT NULL,
    control_impressions integer DEFAULT 0,
    control_clicks integer DEFAULT 0,
    control_conversions integer DEFAULT 0,
    control_ctr numeric(5,2) DEFAULT 0,
    variant_impressions integer DEFAULT 0,
    variant_clicks integer DEFAULT 0,
    variant_conversions integer DEFAULT 0,
    variant_ctr numeric(5,2) DEFAULT 0,
    winner text,
    confidence_level text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ab_test_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ab_test_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    enabled boolean DEFAULT true,
    schedule_type text DEFAULT 'time_of_day'::text NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    days_of_week integer[] DEFAULT '{1,2,3,4,5}'::integer[],
    audience_segments text[],
    traffic_percent integer DEFAULT 50 NOT NULL,
    auto_conclude_hours integer DEFAULT 24,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: access_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.access_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    website_url text NOT NULL,
    company_name text,
    message text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_id uuid NOT NULL,
    action text NOT NULL,
    target_type text NOT NULL,
    target_id text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: api_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    name text NOT NULL,
    token_hash text NOT NULL,
    token_prefix text NOT NULL,
    scopes text[] DEFAULT '{read}'::text[],
    last_used_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    revoked_at timestamp with time zone,
    revoked_by uuid,
    rate_limit_requests integer DEFAULT 1000,
    rate_limit_window_seconds integer DEFAULT 3600,
    requests_count integer DEFAULT 0,
    rate_limit_reset_at timestamp with time zone
);


--
-- Name: api_usage_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_usage_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    token_id uuid,
    endpoint text NOT NULL,
    method text NOT NULL,
    status_code integer NOT NULL,
    response_time_ms integer,
    rate_limited boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    name text NOT NULL,
    website_url text NOT NULL,
    logo_url text,
    primary_color text DEFAULT '#6366f1'::text,
    secondary_color text DEFAULT '#8b5cf6'::text,
    accent_color text DEFAULT '#ec4899'::text,
    background_color text DEFAULT '#0a0a0a'::text,
    text_color text DEFAULT '#ffffff'::text,
    brand_voice jsonb DEFAULT '{"analyzedAt": null, "vocabulary": {"avoided": [], "preferred": []}, "toneSpectrum": {"casual": 50, "formal": 50, "playful": 50, "friendly": 50, "professional": 50, "authoritative": 50}, "sentenceStyle": "medium", "emotionalSignature": [], "communicationPatterns": []}'::jsonb,
    brand_personality jsonb DEFAULT '{"traits": [], "values": [], "archetype": null, "completedAt": null, "emotionalTone": null, "secondaryArchetype": null}'::jsonb,
    brand_story jsonb DEFAULT '{"origin": null, "vision": null, "mission": null, "tagline": null, "enemyStatement": null, "transformationPromise": null}'::jsonb,
    brand_guardrails jsonb DEFAULT '{"enabled": true, "toneAvoid": [], "avoidTopics": [], "visualAvoid": [], "forbiddenWords": [], "competitorMentions": false}'::jsonb,
    brand_dna_score jsonb DEFAULT '{"overall": null, "driftAlerts": [], "scoreHistory": [], "lastCalculated": null, "voiceAlignment": null, "guardrailsCompliance": null, "personalityAlignment": null}'::jsonb,
    products jsonb DEFAULT '[]'::jsonb,
    taxonomy jsonb DEFAULT '[]'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    sidebar_visibility jsonb DEFAULT '{"brandDna": true, "products": true, "analytics": true, "aiInsights": true, "brandTheme": true, "categories": true, "aiDashboard": true, "visualForge": true, "brandCatalog": true, "commerceLoop": true, "optimization": true, "writingForge": true, "commandCenter": true, "documentation": true, "activeDeployment": true, "competitiveIntel": true, "simulationStudio": true, "signalIntelligence": true}'::jsonb
);


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    daily_budget numeric(10,2) DEFAULT 0 NOT NULL,
    total_budget numeric(10,2) DEFAULT 0 NOT NULL,
    spent numeric(10,2) DEFAULT 0 NOT NULL,
    platform text,
    performance_score integer DEFAULT 0,
    conversions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    impressions integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    brand_id uuid
);


--
-- Name: creative_time_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creative_time_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    creative_id uuid NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    duration_minutes integer,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    verification_code text NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '24:00:00'::interval) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    name text NOT NULL,
    website_url text NOT NULL,
    logo_url text,
    primary_color text DEFAULT '#6366f1'::text,
    secondary_color text DEFAULT '#8b5cf6'::text,
    accent_color text DEFAULT '#ec4899'::text,
    background_color text DEFAULT '#0a0a0a'::text,
    text_color text DEFAULT '#ffffff'::text,
    taxonomy jsonb DEFAULT '[]'::jsonb,
    products jsonb DEFAULT '[]'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    trial_ends_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
    subscription_status text DEFAULT 'trial'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    brand_voice jsonb DEFAULT '{"analyzedAt": null, "vocabulary": {"avoided": [], "preferred": []}, "toneSpectrum": {"casual": 50, "formal": 50, "playful": 50, "friendly": 50, "professional": 50, "authoritative": 50}, "sentenceStyle": "medium", "emotionalSignature": [], "communicationPatterns": []}'::jsonb,
    brand_personality jsonb DEFAULT '{"traits": [], "values": [], "archetype": null, "completedAt": null, "emotionalTone": null, "secondaryArchetype": null}'::jsonb,
    brand_story jsonb DEFAULT '{"origin": null, "vision": null, "mission": null, "tagline": null, "enemyStatement": null, "transformationPromise": null}'::jsonb,
    brand_guardrails jsonb DEFAULT '{"enabled": true, "toneAvoid": [], "avoidTopics": [], "visualAvoid": [], "forbiddenWords": [], "competitorMentions": false}'::jsonb,
    brand_dna_score jsonb DEFAULT '{"overall": null, "driftAlerts": [], "scoreHistory": [], "lastCalculated": null, "voiceAlignment": null, "guardrailsCompliance": null, "personalityAlignment": null}'::jsonb
);


--
-- Name: personas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    avatar text DEFAULT '👤'::text NOT NULL,
    age text,
    occupation text,
    income text,
    traits text[] DEFAULT '{}'::text[],
    buying_behavior text,
    is_template boolean DEFAULT false,
    template_category text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: platform_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    org_id uuid,
    feature_name text NOT NULL,
    action_type text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    session_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    display_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    org_id uuid,
    email_verified boolean DEFAULT false,
    active_brand_id uuid
);


--
-- Name: saved_trends; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_trends (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    trend_name text NOT NULL,
    platform text,
    velocity text,
    volume text,
    sentiment_score integer,
    ai_analysis text,
    saved_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: shared_briefs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shared_briefs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    share_code character varying(12) NOT NULL,
    user_id uuid NOT NULL,
    org_id uuid,
    title text NOT NULL,
    brief jsonb NOT NULL,
    feedback jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '30 days'::interval),
    view_count integer DEFAULT 0
);


--
-- Name: shopify_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shopify_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    shop_domain text NOT NULL,
    access_token text NOT NULL,
    scope text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: simulation_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.simulation_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    ad_headline text NOT NULL,
    ad_body text,
    ad_image_url text,
    personas jsonb,
    reactions jsonb,
    overall_score integer,
    recommendation text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sysadmin_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sysadmin_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key text NOT NULL,
    setting_value jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: system_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    alert_type text NOT NULL,
    service_name text NOT NULL,
    message text NOT NULL,
    details jsonb,
    severity text DEFAULT 'warning'::text NOT NULL,
    resolved boolean DEFAULT false,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    invited_by uuid NOT NULL,
    token text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    used_at timestamp with time zone
);


--
-- Name: user_org_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_org_memberships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    org_id uuid NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    brand_access uuid[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_org_memberships_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text, 'viewer'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: visual_analysis_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visual_analysis_cache (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product_id text NOT NULL,
    image_url text NOT NULL,
    dominant_colors text[] DEFAULT '{}'::text[],
    color_hex_codes text[] DEFAULT '{}'::text[],
    patterns text[] DEFAULT '{}'::text[],
    aesthetic_style text,
    luxury_score integer DEFAULT 0,
    color_match_score integer DEFAULT 0,
    trend_colors text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: visual_forge_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visual_forge_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    org_id uuid,
    request_type text NOT NULL,
    title text NOT NULL,
    description text,
    brand_guidelines jsonb,
    reference_urls text[],
    status text DEFAULT 'pending'::text NOT NULL,
    priority text DEFAULT 'normal'::text,
    assigned_to uuid,
    deliverables jsonb,
    feedback text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    hourly_rate numeric DEFAULT 75,
    total_time_minutes integer DEFAULT 0,
    total_cost numeric DEFAULT 0,
    ai_generated_assets jsonb DEFAULT '[]'::jsonb,
    ai_generation_prompt text
);


--
-- Name: webhooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    secret text NOT NULL,
    events text[] DEFAULT '{}'::text[] NOT NULL,
    is_active boolean DEFAULT true,
    last_triggered_at timestamp with time zone,
    last_status_code integer,
    failure_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL
);


--
-- Name: writing_forge_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.writing_forge_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    org_id uuid,
    content_type text NOT NULL,
    title text NOT NULL,
    brief text,
    tone text,
    target_audience text,
    keywords text[],
    generated_content jsonb,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ab_test_results ab_test_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ab_test_results
    ADD CONSTRAINT ab_test_results_pkey PRIMARY KEY (id);


--
-- Name: ab_test_schedules ab_test_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ab_test_schedules
    ADD CONSTRAINT ab_test_schedules_pkey PRIMARY KEY (id);


--
-- Name: access_requests access_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.access_requests
    ADD CONSTRAINT access_requests_pkey PRIMARY KEY (id);


--
-- Name: admin_audit_logs admin_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_logs
    ADD CONSTRAINT admin_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: api_tokens api_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_tokens
    ADD CONSTRAINT api_tokens_pkey PRIMARY KEY (id);


--
-- Name: api_usage_logs api_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_usage_logs
    ADD CONSTRAINT api_usage_logs_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: creative_time_entries creative_time_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creative_time_entries
    ADD CONSTRAINT creative_time_entries_pkey PRIMARY KEY (id);


--
-- Name: email_verifications email_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: personas personas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_pkey PRIMARY KEY (id);


--
-- Name: platform_usage platform_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_usage
    ADD CONSTRAINT platform_usage_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: saved_trends saved_trends_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_trends
    ADD CONSTRAINT saved_trends_pkey PRIMARY KEY (id);


--
-- Name: shared_briefs shared_briefs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_briefs
    ADD CONSTRAINT shared_briefs_pkey PRIMARY KEY (id);


--
-- Name: shared_briefs shared_briefs_share_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_briefs
    ADD CONSTRAINT shared_briefs_share_code_key UNIQUE (share_code);


--
-- Name: shopify_connections shopify_connections_org_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopify_connections
    ADD CONSTRAINT shopify_connections_org_id_key UNIQUE (org_id);


--
-- Name: shopify_connections shopify_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopify_connections
    ADD CONSTRAINT shopify_connections_pkey PRIMARY KEY (id);


--
-- Name: simulation_results simulation_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulation_results
    ADD CONSTRAINT simulation_results_pkey PRIMARY KEY (id);


--
-- Name: sysadmin_settings sysadmin_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sysadmin_settings
    ADD CONSTRAINT sysadmin_settings_pkey PRIMARY KEY (id);


--
-- Name: sysadmin_settings sysadmin_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sysadmin_settings
    ADD CONSTRAINT sysadmin_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: system_alerts system_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_alerts
    ADD CONSTRAINT system_alerts_pkey PRIMARY KEY (id);


--
-- Name: user_invitations user_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_invitations
    ADD CONSTRAINT user_invitations_pkey PRIMARY KEY (id);


--
-- Name: user_invitations user_invitations_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_invitations
    ADD CONSTRAINT user_invitations_token_key UNIQUE (token);


--
-- Name: user_org_memberships user_org_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_org_memberships
    ADD CONSTRAINT user_org_memberships_pkey PRIMARY KEY (id);


--
-- Name: user_org_memberships user_org_memberships_user_id_org_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_org_memberships
    ADD CONSTRAINT user_org_memberships_user_id_org_id_key UNIQUE (user_id, org_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: visual_analysis_cache visual_analysis_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visual_analysis_cache
    ADD CONSTRAINT visual_analysis_cache_pkey PRIMARY KEY (id);


--
-- Name: visual_analysis_cache visual_analysis_cache_user_id_product_id_image_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visual_analysis_cache
    ADD CONSTRAINT visual_analysis_cache_user_id_product_id_image_url_key UNIQUE (user_id, product_id, image_url);


--
-- Name: visual_forge_requests visual_forge_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visual_forge_requests
    ADD CONSTRAINT visual_forge_requests_pkey PRIMARY KEY (id);


--
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);


--
-- Name: writing_forge_content writing_forge_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.writing_forge_content
    ADD CONSTRAINT writing_forge_content_pkey PRIMARY KEY (id);


--
-- Name: idx_api_usage_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_usage_logs_created_at ON public.api_usage_logs USING btree (created_at DESC);


--
-- Name: idx_api_usage_logs_endpoint; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_usage_logs_endpoint ON public.api_usage_logs USING btree (endpoint);


--
-- Name: idx_api_usage_logs_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_usage_logs_org_id ON public.api_usage_logs USING btree (org_id);


--
-- Name: idx_api_usage_logs_token_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_usage_logs_token_id ON public.api_usage_logs USING btree (token_id);


--
-- Name: idx_audit_logs_admin_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_admin_id ON public.admin_audit_logs USING btree (admin_id);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.admin_audit_logs USING btree (created_at DESC);


--
-- Name: idx_campaigns_brand_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaigns_brand_id ON public.campaigns USING btree (brand_id);


--
-- Name: idx_creative_time_entries_creative; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_creative_time_entries_creative ON public.creative_time_entries USING btree (creative_id);


--
-- Name: idx_creative_time_entries_request; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_creative_time_entries_request ON public.creative_time_entries USING btree (request_id);


--
-- Name: idx_invitations_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invitations_email ON public.user_invitations USING btree (email);


--
-- Name: idx_invitations_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invitations_token ON public.user_invitations USING btree (token);


--
-- Name: idx_platform_usage_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_platform_usage_created_at ON public.platform_usage USING btree (created_at);


--
-- Name: idx_platform_usage_feature; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_platform_usage_feature ON public.platform_usage USING btree (feature_name);


--
-- Name: idx_platform_usage_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_platform_usage_org_id ON public.platform_usage USING btree (org_id);


--
-- Name: idx_platform_usage_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_platform_usage_user_id ON public.platform_usage USING btree (user_id);


--
-- Name: idx_system_alerts_resolved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_alerts_resolved ON public.system_alerts USING btree (resolved, created_at DESC);


--
-- Name: idx_system_alerts_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_alerts_service ON public.system_alerts USING btree (service_name, created_at DESC);


--
-- Name: idx_visual_forge_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_visual_forge_status ON public.visual_forge_requests USING btree (status);


--
-- Name: idx_visual_forge_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_visual_forge_user_id ON public.visual_forge_requests USING btree (user_id);


--
-- Name: idx_writing_forge_content_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_writing_forge_content_type ON public.writing_forge_content USING btree (content_type);


--
-- Name: idx_writing_forge_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_writing_forge_user_id ON public.writing_forge_content USING btree (user_id);


--
-- Name: ab_test_results update_ab_test_results_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ab_test_results_updated_at BEFORE UPDATE ON public.ab_test_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ab_test_schedules update_ab_test_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ab_test_schedules_updated_at BEFORE UPDATE ON public.ab_test_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: brands update_brands_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: campaigns update_campaigns_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: organizations update_organizations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: personas update_personas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON public.personas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shared_briefs update_shared_briefs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_shared_briefs_updated_at BEFORE UPDATE ON public.shared_briefs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shopify_connections update_shopify_connections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_shopify_connections_updated_at BEFORE UPDATE ON public.shopify_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sysadmin_settings update_sysadmin_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sysadmin_settings_updated_at BEFORE UPDATE ON public.sysadmin_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_org_memberships update_user_org_memberships_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_org_memberships_updated_at BEFORE UPDATE ON public.user_org_memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: visual_analysis_cache update_visual_analysis_cache_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_visual_analysis_cache_updated_at BEFORE UPDATE ON public.visual_analysis_cache FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: visual_forge_requests update_visual_forge_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_visual_forge_updated_at BEFORE UPDATE ON public.visual_forge_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: webhooks update_webhooks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: writing_forge_content update_writing_forge_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_writing_forge_updated_at BEFORE UPDATE ON public.writing_forge_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: api_tokens api_tokens_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_tokens
    ADD CONSTRAINT api_tokens_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: api_usage_logs api_usage_logs_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_usage_logs
    ADD CONSTRAINT api_usage_logs_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: api_usage_logs api_usage_logs_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_usage_logs
    ADD CONSTRAINT api_usage_logs_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.api_tokens(id) ON DELETE SET NULL;


--
-- Name: brands brands_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


--
-- Name: campaigns campaigns_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: creative_time_entries creative_time_entries_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creative_time_entries
    ADD CONSTRAINT creative_time_entries_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.visual_forge_requests(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_active_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_active_brand_id_fkey FOREIGN KEY (active_brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id);


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: saved_trends saved_trends_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_trends
    ADD CONSTRAINT saved_trends_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: shared_briefs shared_briefs_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_briefs
    ADD CONSTRAINT shared_briefs_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id);


--
-- Name: shopify_connections shopify_connections_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopify_connections
    ADD CONSTRAINT shopify_connections_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: simulation_results simulation_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulation_results
    ADD CONSTRAINT simulation_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_org_memberships user_org_memberships_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_org_memberships
    ADD CONSTRAINT user_org_memberships_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: user_org_memberships user_org_memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_org_memberships
    ADD CONSTRAINT user_org_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: visual_forge_requests visual_forge_requests_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visual_forge_requests
    ADD CONSTRAINT visual_forge_requests_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id);


--
-- Name: webhooks webhooks_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: writing_forge_content writing_forge_content_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.writing_forge_content
    ADD CONSTRAINT writing_forge_content_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id);


--
-- Name: admin_audit_logs Admins can create audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create audit logs" ON public.admin_audit_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_invitations Admins can create invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create invitations" ON public.user_invitations FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: access_requests Admins can delete access requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete access requests" ON public.access_requests FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_invitations Admins can delete invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete invitations" ON public.user_invitations FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: sysadmin_settings Admins can insert sysadmin settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert sysadmin settings" ON public.sysadmin_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: visual_forge_requests Admins can manage all visual requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all visual requests" ON public.visual_forge_requests USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: creative_time_entries Admins can manage time entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage time entries" ON public.creative_time_entries USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: access_requests Admins can update access requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update access requests" ON public.access_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_invitations Admins can update invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update invitations" ON public.user_invitations FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: sysadmin_settings Admins can update sysadmin settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update sysadmin settings" ON public.sysadmin_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: system_alerts Admins can update system alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update system alerts" ON public.system_alerts FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: access_requests Admins can view access requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view access requests" ON public.access_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: platform_usage Admins can view all usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all usage" ON public.platform_usage FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_audit_logs Admins can view audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_invitations Admins can view invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view invitations" ON public.user_invitations FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: sysadmin_settings Admins can view sysadmin settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view sysadmin settings" ON public.sysadmin_settings FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: system_alerts Admins can view system alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view system alerts" ON public.system_alerts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: access_requests Anyone can submit access request; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit access request" ON public.access_requests FOR INSERT WITH CHECK (true);


--
-- Name: shared_briefs Anyone can view shared briefs by code; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view shared briefs by code" ON public.shared_briefs FOR SELECT USING (true);


--
-- Name: user_org_memberships Org admins can manage memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Org admins can manage memberships" ON public.user_org_memberships USING (public.is_org_admin(org_id, auth.uid()));


--
-- Name: user_org_memberships Org members can view other members in their org; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Org members can view other members in their org" ON public.user_org_memberships FOR SELECT USING (public.is_org_member(auth.uid(), org_id));


--
-- Name: brands Org owners and admins can create brands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Org owners and admins can create brands" ON public.brands FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.organizations
  WHERE ((organizations.id = brands.org_id) AND (organizations.owner_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.user_org_memberships
  WHERE ((user_org_memberships.org_id = brands.org_id) AND (user_org_memberships.user_id = auth.uid()) AND (user_org_memberships.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));


--
-- Name: brands Org owners and admins can update brands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Org owners and admins can update brands" ON public.brands FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM public.organizations
  WHERE ((organizations.id = brands.org_id) AND (organizations.owner_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.user_org_memberships
  WHERE ((user_org_memberships.org_id = brands.org_id) AND (user_org_memberships.user_id = auth.uid()) AND (user_org_memberships.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));


--
-- Name: brands Org owners can delete brands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Org owners can delete brands" ON public.brands FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.organizations
  WHERE ((organizations.id = brands.org_id) AND (organizations.owner_id = auth.uid())))));


--
-- Name: user_org_memberships Org owners can manage memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Org owners can manage memberships" ON public.user_org_memberships USING ((EXISTS ( SELECT 1
   FROM public.organizations
  WHERE ((organizations.id = user_org_memberships.org_id) AND (organizations.owner_id = auth.uid())))));


--
-- Name: api_usage_logs Service role can insert API logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert API logs" ON public.api_usage_logs FOR INSERT WITH CHECK (true);


--
-- Name: system_alerts Service role can insert alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert alerts" ON public.system_alerts FOR INSERT WITH CHECK (true);


--
-- Name: api_tokens Users can create API tokens for their org; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create API tokens for their org" ON public.api_tokens FOR INSERT WITH CHECK ((org_id IN ( SELECT profiles.org_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: shopify_connections Users can create Shopify connection for their org; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create Shopify connection for their org" ON public.shopify_connections FOR INSERT WITH CHECK ((org_id IN ( SELECT profiles.org_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: ab_test_schedules Users can create schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create schedules" ON public.ab_test_schedules FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: shared_briefs Users can create shared briefs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create shared briefs" ON public.shared_briefs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ab_test_results Users can create test results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create test results" ON public.ab_test_results FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: campaigns Users can create their own campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own campaigns" ON public.campaigns FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: organizations Users can create their own organizations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own organizations" ON public.organizations FOR INSERT WITH CHECK ((auth.uid() = owner_id));


--
-- Name: personas Users can create their own personas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own personas" ON public.personas FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: visual_forge_requests Users can create visual requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create visual requests" ON public.visual_forge_requests FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: webhooks Users can create webhooks for their org; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create webhooks for their org" ON public.webhooks FOR INSERT WITH CHECK ((org_id IN ( SELECT profiles.org_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: writing_forge_content Users can create writing content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create writing content" ON public.writing_forge_content FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: shared_briefs Users can delete own shared briefs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own shared briefs" ON public.shared_briefs FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: api_tokens Users can delete their org's API tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their org's API tokens" ON public.api_tokens FOR DELETE USING ((org_id IN ( SELECT profiles.org_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: shopify_connections Users can delete their org's Shopify connection; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their org's Shopify connection" ON public.shopify_connections FOR DELETE USING ((org_id IN ( SELECT profiles.org_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: webhooks Users can delete their org's webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their org's webhooks" ON public.webhooks FOR DELETE USING ((org_id IN ( SELECT profiles.org_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: visual_analysis_cache Users can delete their own analysis cache; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own analysis cache" ON public.visual_analysis_cache FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: campaigns Users can delete their own campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own campaigns" ON public.campaigns FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: personas Users can delete their own personas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own personas" ON public.personas FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: ab_test_schedules Users can delete their own schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own schedules" ON public.ab_test_schedules FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: ab_test_results Users can delete their own test results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own test results" ON public.ab_test_results FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: writing_forge_content Users can delete their own writing content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own writing content" ON public.writing_forge_content FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: saved_trends Users can delete their saved trends; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their saved trends" ON public.saved_trends FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: simulation_results Users can delete their simulation results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their simulation results" ON public.simulation_results FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: visual_analysis_cache Users can insert their own analysis cache; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own analysis cache" ON public.visual_analysis_cache FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: platform_usage Users can insert their own usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own usage" ON public.platform_usage FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: email_verifications Users can insert their own verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own verifications" ON public.email_verifications FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: simulation_results Users can save simulation results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can save simulation results" ON public.simulation_results FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: saved_trends Users can save trends; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can save trends" ON public.saved_trends FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: shared_briefs Users can update own shared briefs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own shared briefs" ON public.shared_briefs FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: api_tokens Users can update their org's API tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their org's API tokens" ON public.api_tokens FOR UPDATE USING ((org_id IN ( SELECT profiles.org_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: shopify_connections Users can update their org's Shopify connection; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their org's Shopify connection" ON public.shopify_connections FOR UPDATE USING ((org_id IN ( SELECT profiles.org_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: webhooks Users can update their org's webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their org's webhooks" ON public.webhooks FOR UPDATE USING ((org_id IN ( SELECT profiles.org_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: visual_analysis_cache Users can update their own analysis cache; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own analysis cache" ON public.visual_analysis_cache FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: campaigns Users can update their own campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own campaigns" ON public.campaigns FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: organizations Users can update their own organizations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own organizations" ON public.organizations FOR UPDATE USING ((auth.uid() = owner_id));


--
-- Name: visual_forge_requests Users can update their own pending requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own pending requests" ON public.visual_forge_requests FOR UPDATE USING (((auth.uid() = user_id) AND (status = 'pending'::text)));


--
-- Name: personas Users can update their own personas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own personas" ON public.personas FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: ab_test_schedules Users can update their own schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own schedules" ON public.ab_test_schedules FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: ab_test_results Users can update their own test results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own test results" ON public.ab_test_results FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: email_verifications Users can update their own verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own verifications" ON public.email_verifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: writing_forge_content Users can update their own writing content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own writing content" ON public.writing_forge_content FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: brands Users can view brands they have access to; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view brands they have access to" ON public.brands FOR SELECT USING (public.has_brand_access(auth.uid(), id));


--
-- Name: api_tokens Users can view their org's API tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their org's API tokens" ON public.api_tokens FOR SELECT USING ((org_id IN ( SELECT profiles.org_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: api_usage_logs Users can view their org's API usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their org's API usage" ON public.api_usage_logs FOR SELECT USING ((org_id IN ( SELECT profiles.org_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: shopify_connections Users can view their org's Shopify connection; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their org's Shopify connection" ON public.shopify_connections FOR SELECT USING ((org_id IN ( SELECT profiles.org_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: webhooks Users can view their org's webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their org's webhooks" ON public.webhooks FOR SELECT USING ((org_id IN ( SELECT profiles.org_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: visual_analysis_cache Users can view their own analysis cache; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own analysis cache" ON public.visual_analysis_cache FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: campaigns Users can view their own campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own campaigns" ON public.campaigns FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_org_memberships Users can view their own memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own memberships" ON public.user_org_memberships FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: organizations Users can view their own organizations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own organizations" ON public.organizations FOR SELECT USING ((auth.uid() = owner_id));


--
-- Name: personas Users can view their own personas and templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own personas and templates" ON public.personas FOR SELECT USING (((auth.uid() = user_id) OR (is_template = true)));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: saved_trends Users can view their own saved trends; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own saved trends" ON public.saved_trends FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ab_test_schedules Users can view their own schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own schedules" ON public.ab_test_schedules FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: simulation_results Users can view their own simulation results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own simulation results" ON public.simulation_results FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ab_test_results Users can view their own test results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own test results" ON public.ab_test_results FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: email_verifications Users can view their own verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own verifications" ON public.email_verifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: visual_forge_requests Users can view their own visual requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own visual requests" ON public.visual_forge_requests FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: writing_forge_content Users can view their own writing content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own writing content" ON public.writing_forge_content FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ab_test_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;

--
-- Name: ab_test_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ab_test_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: access_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: api_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: api_usage_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: brands; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

--
-- Name: campaigns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: creative_time_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.creative_time_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: email_verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: organizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

--
-- Name: personas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: saved_trends; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_trends ENABLE ROW LEVEL SECURITY;

--
-- Name: shared_briefs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shared_briefs ENABLE ROW LEVEL SECURITY;

--
-- Name: shopify_connections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shopify_connections ENABLE ROW LEVEL SECURITY;

--
-- Name: simulation_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;

--
-- Name: sysadmin_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sysadmin_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: system_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: user_invitations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: user_org_memberships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_org_memberships ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: visual_analysis_cache; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.visual_analysis_cache ENABLE ROW LEVEL SECURITY;

--
-- Name: visual_forge_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.visual_forge_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: webhooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

--
-- Name: writing_forge_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.writing_forge_content ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;