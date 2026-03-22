import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface ApiToken {
  id: string;
  org_id: string;
  token_hash: string;
  scopes: string[];
  expires_at: string | null;
  revoked_at: string | null;
  rate_limit_requests: number;
  rate_limit_window_seconds: number;
  requests_count: number;
  rate_limit_reset_at: string | null;
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Extract API key from header
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Missing API key', code: 'UNAUTHORIZED' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Extract token prefix and hash
  const tokenPrefix = apiKey.substring(0, 8);
  const tokenHash = await hashToken(apiKey);

  // Look up token
  const { data: token, error: tokenError } = await supabase
    .from('api_tokens')
    .select('*')
    .eq('token_prefix', tokenPrefix)
    .eq('token_hash', tokenHash)
    .is('revoked_at', null)
    .single();

  if (tokenError || !token) {
    console.log('[API-GATEWAY] Invalid token:', tokenPrefix);
    return new Response(
      JSON.stringify({ error: 'Invalid API key', code: 'UNAUTHORIZED' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const apiToken = token as ApiToken;

  // Check if token is expired
  if (apiToken.expires_at && new Date(apiToken.expires_at) < new Date()) {
    console.log('[API-GATEWAY] Token expired:', tokenPrefix);
    return new Response(
      JSON.stringify({ error: 'API key expired', code: 'TOKEN_EXPIRED' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Check rate limits
  const now = new Date();
  let requestsCount = apiToken.requests_count || 0;
  let resetAt = apiToken.rate_limit_reset_at ? new Date(apiToken.rate_limit_reset_at) : null;
  const windowSeconds = apiToken.rate_limit_window_seconds || 3600;
  const maxRequests = apiToken.rate_limit_requests || 1000;

  // Reset counter if window has passed
  if (!resetAt || resetAt < now) {
    requestsCount = 0;
    resetAt = new Date(now.getTime() + windowSeconds * 1000);
  }

  // Check if rate limited
  const isRateLimited = requestsCount >= maxRequests;
  
  // Parse request details
  const url = new URL(req.url);
  const endpoint = url.pathname.replace('/api-gateway', '') || '/';
  const method = req.method;

  // Log the request
  const responseTimeMs = Date.now() - startTime;
  
  await supabase.from('api_usage_logs').insert({
    org_id: apiToken.org_id,
    token_id: apiToken.id,
    endpoint,
    method,
    status_code: isRateLimited ? 429 : 200,
    response_time_ms: responseTimeMs,
    rate_limited: isRateLimited,
  });

  // Update token usage
  await supabase
    .from('api_tokens')
    .update({
      requests_count: requestsCount + 1,
      rate_limit_reset_at: resetAt.toISOString(),
      last_used_at: now.toISOString(),
    })
    .eq('id', apiToken.id);

  if (isRateLimited) {
    const retryAfter = Math.ceil((resetAt.getTime() - now.getTime()) / 1000);
    console.log('[API-GATEWAY] Rate limited:', tokenPrefix, 'retry after:', retryAfter);
    
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded', 
        code: 'RATE_LIMITED',
        retry_after: retryAfter 
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetAt.toISOString(),
          'Retry-After': retryAfter.toString(),
        } 
      }
    );
  }

  // Parse request body if present
  let body = null;
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      body = await req.json();
    } catch {
      // No body or invalid JSON
    }
  }

  // Calculate remaining requests
  const remaining = Math.max(0, maxRequests - requestsCount - 1);

  // Route to internal functions based on endpoint
  const routeResult = await routeToInternalFunction(
    endpoint, 
    method, 
    body, 
    apiToken.org_id, 
    apiToken.scopes || [],
    supabase
  );

  // Update response time after routing
  const finalResponseTime = Date.now() - startTime;
  
  // Update the log with actual status code
  await supabase
    .from('api_usage_logs')
    .update({ 
      status_code: routeResult.status,
      response_time_ms: finalResponseTime 
    })
    .eq('org_id', apiToken.org_id)
    .eq('endpoint', endpoint)
    .order('created_at', { ascending: false })
    .limit(1);

  console.log('[API-GATEWAY] Request routed:', {
    tokenPrefix,
    endpoint,
    method,
    status: routeResult.status,
    responseTimeMs: finalResponseTime,
  });

  return new Response(
    JSON.stringify(routeResult.data),
    { 
      status: routeResult.status, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetAt.toISOString(),
      } 
    }
  );
});

// Endpoint routing configuration
const ENDPOINT_ROUTES: Record<string, {
  requiredScopes: string[];
  handler: (method: string, body: any, orgId: string, supabase: any) => Promise<{ status: number; data: any }>;
}> = {
  '/campaigns': {
    requiredScopes: ['campaigns:read', 'campaigns:write'],
    handler: handleCampaignsEndpoint,
  },
  '/inventory': {
    requiredScopes: ['inventory:read', 'inventory:write'],
    handler: handleInventoryEndpoint,
  },
  '/analytics': {
    requiredScopes: ['analytics:read'],
    handler: handleAnalyticsEndpoint,
  },
  '/trends': {
    requiredScopes: ['trends:read'],
    handler: handleTrendsEndpoint,
  },
  '/brands': {
    requiredScopes: ['brands:read', 'brands:write'],
    handler: handleBrandsEndpoint,
  },
};

async function routeToInternalFunction(
  endpoint: string,
  method: string,
  body: any,
  orgId: string,
  scopes: string[],
  supabase: any
): Promise<{ status: number; data: any }> {
  // Find matching route
  const routeKey = Object.keys(ENDPOINT_ROUTES).find(key => 
    endpoint === key || endpoint.startsWith(key + '/')
  );

  if (!routeKey) {
    return {
      status: 404,
      data: { error: 'Endpoint not found', code: 'NOT_FOUND' }
    };
  }

  const route = ENDPOINT_ROUTES[routeKey];

  // Check scope permissions
  const hasRequiredScope = route.requiredScopes.some(required => {
    const [resource, action] = required.split(':');
    return scopes.includes(required) || 
           scopes.includes(`${resource}:*`) || 
           scopes.includes('*');
  });

  if (!hasRequiredScope) {
    return {
      status: 403,
      data: { error: 'Insufficient permissions', code: 'FORBIDDEN', required_scopes: route.requiredScopes }
    };
  }

  // Extract sub-path for resource IDs
  const subPath = endpoint.replace(routeKey, '').replace(/^\//, '');

  try {
    return await route.handler(method, { ...body, _subPath: subPath }, orgId, supabase);
  } catch (error) {
    console.error('[API-GATEWAY] Handler error:', error);
    return {
      status: 500,
      data: { error: 'Internal server error', code: 'INTERNAL_ERROR' }
    };
  }
}

// Campaign endpoint handler
async function handleCampaignsEndpoint(
  method: string,
  body: any,
  orgId: string,
  supabase: any
): Promise<{ status: number; data: any }> {
  const { _subPath, ...requestBody } = body || {};

  if (method === 'GET') {
    const query = supabase
      .from('campaigns')
      .select('*')
      .eq('brand_id', orgId);
    
    if (_subPath) {
      const { data, error } = await query.eq('id', _subPath).single();
      if (error) return { status: 404, data: { error: 'Campaign not found' } };
      return { status: 200, data };
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return { status: 500, data: { error: error.message } };
    return { status: 200, data };
  }

  if (method === 'POST') {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({ ...requestBody, brand_id: orgId })
      .select()
      .single();
    if (error) return { status: 400, data: { error: error.message } };
    return { status: 201, data };
  }

  if (method === 'PUT' || method === 'PATCH') {
    if (!_subPath) return { status: 400, data: { error: 'Campaign ID required' } };
    const { data, error } = await supabase
      .from('campaigns')
      .update(requestBody)
      .eq('id', _subPath)
      .eq('brand_id', orgId)
      .select()
      .single();
    if (error) return { status: 400, data: { error: error.message } };
    return { status: 200, data };
  }

  if (method === 'DELETE') {
    if (!_subPath) return { status: 400, data: { error: 'Campaign ID required' } };
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', _subPath)
      .eq('brand_id', orgId);
    if (error) return { status: 400, data: { error: error.message } };
    return { status: 204, data: null };
  }

  return { status: 405, data: { error: 'Method not allowed' } };
}

// Inventory endpoint handler
async function handleInventoryEndpoint(
  method: string,
  body: any,
  orgId: string,
  supabase: any
): Promise<{ status: number; data: any }> {
  // Get brand data which contains products
  const { data: brand, error } = await supabase
    .from('brands')
    .select('products, taxonomy')
    .eq('org_id', orgId)
    .single();

  if (error) return { status: 500, data: { error: error.message } };

  if (method === 'GET') {
    return { 
      status: 200, 
      data: { 
        products: brand?.products || [],
        taxonomy: brand?.taxonomy || []
      }
    };
  }

  if (method === 'PUT' || method === 'PATCH') {
    const { products, taxonomy } = body || {};
    const updates: any = {};
    if (products) updates.products = products;
    if (taxonomy) updates.taxonomy = taxonomy;

    const { data: updated, error: updateError } = await supabase
      .from('brands')
      .update(updates)
      .eq('org_id', orgId)
      .select('products, taxonomy')
      .single();

    if (updateError) return { status: 400, data: { error: updateError.message } };
    return { status: 200, data: updated };
  }

  return { status: 405, data: { error: 'Method not allowed' } };
}

// Analytics endpoint handler
async function handleAnalyticsEndpoint(
  method: string,
  body: any,
  orgId: string,
  supabase: any
): Promise<{ status: number; data: any }> {
  if (method !== 'GET') {
    return { status: 405, data: { error: 'Method not allowed' } };
  }

  // Get campaign metrics
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .select('impressions, clicks, conversions, spent, status')
    .eq('brand_id', orgId);

  if (campaignsError) return { status: 500, data: { error: campaignsError.message } };

  const totals = (campaigns || []).reduce((acc: any, c: any) => ({
    impressions: acc.impressions + (c.impressions || 0),
    clicks: acc.clicks + (c.clicks || 0),
    conversions: acc.conversions + (c.conversions || 0),
    spent: acc.spent + (c.spent || 0),
    active_campaigns: acc.active_campaigns + (c.status === 'active' ? 1 : 0),
  }), { impressions: 0, clicks: 0, conversions: 0, spent: 0, active_campaigns: 0 });

  return {
    status: 200,
    data: {
      ...totals,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions * 100).toFixed(2) : 0,
      conversion_rate: totals.clicks > 0 ? (totals.conversions / totals.clicks * 100).toFixed(2) : 0,
    }
  };
}

// Trends endpoint handler
async function handleTrendsEndpoint(
  method: string,
  body: any,
  orgId: string,
  supabase: any
): Promise<{ status: number; data: any }> {
  if (method !== 'GET') {
    return { status: 405, data: { error: 'Method not allowed' } };
  }

  // Get org owner's user_id for saved trends
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', orgId)
    .single();

  if (orgError) return { status: 500, data: { error: orgError.message } };

  const { data: trends, error: trendsError } = await supabase
    .from('saved_trends')
    .select('*')
    .eq('user_id', org.owner_id)
    .order('saved_at', { ascending: false });

  if (trendsError) return { status: 500, data: { error: trendsError.message } };

  return { status: 200, data: trends || [] };
}

// Brands endpoint handler
async function handleBrandsEndpoint(
  method: string,
  body: any,
  orgId: string,
  supabase: any
): Promise<{ status: number; data: any }> {
  const { _subPath, ...requestBody } = body || {};

  if (method === 'GET') {
    const query = supabase
      .from('brands')
      .select('id, name, website_url, logo_url, primary_color, secondary_color, accent_color, is_active, created_at')
      .eq('org_id', orgId);

    if (_subPath) {
      const { data, error } = await query.eq('id', _subPath).single();
      if (error) return { status: 404, data: { error: 'Brand not found' } };
      return { status: 200, data };
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return { status: 500, data: { error: error.message } };
    return { status: 200, data };
  }

  if (method === 'PUT' || method === 'PATCH') {
    if (!_subPath) return { status: 400, data: { error: 'Brand ID required' } };
    const { data, error } = await supabase
      .from('brands')
      .update(requestBody)
      .eq('id', _subPath)
      .eq('org_id', orgId)
      .select()
      .single();
    if (error) return { status: 400, data: { error: error.message } };
    return { status: 200, data };
  }

  return { status: 405, data: { error: 'Method not allowed' } };
}
