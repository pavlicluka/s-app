import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify the user is authenticated and get their role
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - invalid or expired token' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's profile to check role
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch user profile' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is super_admin or admin
    if (profile.role !== 'super_admin' && profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - insufficient permissions' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body = await req.json()
    const { action, search, id, name, slug, description, subscription_tier, is_active, settings } = body

    // Create Supabase admin client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Handle different actions
    if (action === 'create') {
      // Validate required fields
      if (!name || !slug) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required fields: name and slug are required' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if slug already exists
      const { data: existingOrg } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (existingOrg) {
        return new Response(
          JSON.stringify({ success: false, error: `Organization with slug '${slug}' already exists` }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create organization
      const { data: newOrg, error: createError } = await supabaseAdmin
        .from('organizations')
        .insert({
          name,
          slug,
          description: description || null,
          subscription_tier: subscription_tier || 'free',
          is_active: true,
          settings: settings || {}
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating organization:', createError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create organization', details: createError.message }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data: newOrg, message: 'Organization created successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else if (action === 'update') {
      // Validate required fields
      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required field: id' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Build update object (only include provided fields)
      const updateData: any = {}
      if (name !== undefined) updateData.name = name
      if (slug !== undefined) updateData.slug = slug
      if (description !== undefined) updateData.description = description
      if (subscription_tier !== undefined) updateData.subscription_tier = subscription_tier
      if (is_active !== undefined) updateData.is_active = is_active
      if (settings !== undefined) updateData.settings = settings

      // Update organization
      const { data: updatedOrg, error: updateError } = await supabaseAdmin
        .from('organizations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating organization:', updateError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update organization', details: updateError.message }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data: updatedOrg, message: 'Organization updated successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else if (action === 'delete') {
      // Validate required fields
      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required field: id' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Delete organization (this will cascade delete related records)
      const { error: deleteError } = await supabaseAdmin
        .from('organizations')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('Error deleting organization:', deleteError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to delete organization', details: deleteError.message }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Organization deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else {
      // Default action: list organizations (with optional search)
      console.log('Starting list organizations action...')
      console.log('Request body:', JSON.stringify(body))
      
      // Verify admin client credentials
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      
      console.log('Environment check:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing'
      })
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing required environment variables')
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Server configuration error', 
            details: 'Missing required environment variables',
            env: {
              hasUrl: !!supabaseUrl,
              hasServiceKey: !!supabaseServiceKey
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      try {
        // Fetch organizations
        console.log('Fetching organizations from database...')
        let query = supabaseAdmin
          .from('organizations')
          .select('*')
          .order('created_at', { ascending: false })

        // Apply search filter if provided
        if (search) {
          console.log(`Applying search filter: "${search}"`)
          query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`)
        }

        const { data: organizations, error: fetchError } = await query

        if (fetchError) {
          console.error('Error fetching organizations:', fetchError)
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'Failed to fetch organizations', 
              details: fetchError.message,
              code: fetchError.code 
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log(`Found ${organizations?.length || 0} organizations`)

        // If no organizations found, return empty array
        if (!organizations || organizations.length === 0) {
          console.log('No organizations found, returning empty array')
          return new Response(
            JSON.stringify({ success: true, data: [] }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Fetch user counts for each organization
        console.log('Fetching user counts for each organization...')
        const organizationsWithCounts = await Promise.all(
          organizations.map(async (org) => {
            try {
              const { count, error: countError } = await supabaseAdmin
                .from('profiles')
                .select('id', { count: 'exact', head: true })
                .eq('organization_id', org.id)

              if (countError) {
                console.warn(`Error fetching profile count for org ${org.id}:`, countError)
                return { ...org, user_count: 0 }
              }

              return { ...org, user_count: count || 0 }
            } catch (err) {
              console.error(`Failed to get user count for org ${org.id}:`, err)
              return { ...org, user_count: 0 }
            }
          })
        )

        console.log(`Successfully prepared ${organizationsWithCounts.length} organizations with user counts`)

        return new Response(
          JSON.stringify({ success: true, data: organizationsWithCounts || [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (listError) {
        console.error('Error in list action:', listError)
        console.error('Error type:', listError?.constructor?.name)
        console.error('Error message:', listError instanceof Error ? listError.message : String(listError))
        console.error('Error stack:', listError instanceof Error ? listError.stack : 'No stack trace')
        
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Failed to fetch organizations', 
            details: listError instanceof Error ? listError.message : 'Unknown error',
            errorType: listError?.constructor?.name,
            stack: listError instanceof Error ? listError.stack : undefined
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
  } catch (error) {
    console.error('Unhandled error in admin-organizations function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
