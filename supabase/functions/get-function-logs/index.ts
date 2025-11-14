import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Check authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const body = await req.json();
    const { functionName, hoursBack = 24, limit = 100 } = body;

    if (!functionName) {
      return new Response(
        JSON.stringify({ error: 'Missing functionName parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate time range
    const now = new Date();
    const sinceTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

    // Query edge_logs table
    const response = await fetch(`${supabaseUrl}/rest/v1/edge_logs`, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      // Build query string
    });

    // Build query URL with parameters
    const queryParams = new URLSearchParams({
      'function_name': `eq.${functionName}`,
      'created_at': `gte.${sinceTime.toISOString()}`,
      'order': 'created_at.desc',
      'limit': limit.toString(),
    });

    const logsUrl = `${supabaseUrl}/rest/v1/edge_logs?${queryParams}`;

    const logsResponse = await fetch(logsUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!logsResponse.ok) {
      const errorText = await logsResponse.text();
      console.error(`Error fetching logs: ${logsResponse.status}`, errorText);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch logs: ${logsResponse.statusText}`,
          details: errorText,
          status: logsResponse.status,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const logs = await logsResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        data: logs,
        count: Array.isArray(logs) ? logs.length : 0,
        functionName,
        hoursBack,
        sinceTime: sinceTime.toISOString(),
        timestamp: now.toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in get-function-logs:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
