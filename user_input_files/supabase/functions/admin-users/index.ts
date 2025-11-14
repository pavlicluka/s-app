import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Send JSON response with CORS headers
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ success: false, error: 'Missing authorization header' }, 200)
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
      return jsonResponse({ success: false, error: 'Unauthorized - invalid or expired token' }, 200)
    }

    // Get user's profile to check role
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return jsonResponse({ success: false, error: 'Failed to fetch user profile' }, 200)
    }

    // Check if user is super_admin or admin
    if (profile.role !== 'super_admin' && profile.role !== 'admin') {
      return jsonResponse({ success: false, error: 'Forbidden - insufficient permissions' }, 200)
    }

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

    // Parse request body
    const body = await req.json()
    const { action, search, id, email, password, full_name, role, organization_id, module_permissions, userIds, operation, data: bulkData } = body

    // Handle different actions
    if (action === 'create') {
      // Validate required fields
      if (!email || !password) {
        return jsonResponse({ success: false, error: 'Missing required fields: email and password are required' }, 200)
      }

      try {
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        })

        if (authError) {
          throw new Error(authError.message || 'Failed to create auth user')
        }

        // Create profile in profiles table
        const { data: newProfile, error: profileCreateError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            full_name: full_name || '',
            role: role || 'user',
            organization_id: organization_id || null,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (profileCreateError) {
          throw new Error(profileCreateError.message || 'Failed to create user profile')
        }

        return jsonResponse({ success: true, data: newProfile, message: 'User created successfully' }, 200)
      } catch (error) {
        console.error('Error creating user:', error)
        return jsonResponse({ success: false, error: error instanceof Error ? error.message : 'Failed to create user' }, 200)
      }
    } 
    else if (action === 'update') {
      // Validate required fields
      if (!id) {
        return jsonResponse({ success: false, error: 'Missing required field: id' }, 200)
      }

      try {
        // Build update object (only include provided fields)
        const updateData: any = {}
        if (email !== undefined) updateData.email = email
        if (full_name !== undefined) updateData.full_name = full_name
        if (role !== undefined) updateData.role = role
        if (organization_id !== undefined) updateData.organization_id = organization_id
        if (module_permissions !== undefined) updateData.module_permissions = module_permissions

        // Update user profile
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from('profiles')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (updateError) {
          throw new Error(updateError.message || 'Failed to update user')
        }

        return jsonResponse({ success: true, data: updatedUser, message: 'User updated successfully' }, 200)
      } catch (error) {
        console.error('Error updating user:', error)
        return jsonResponse({ success: false, error: error instanceof Error ? error.message : 'Failed to update user' }, 200)
      }
    } 
    else if (action === 'delete') {
      // Validate required fields
      if (!id) {
        return jsonResponse({ success: false, error: 'Missing required field: id' }, 200)
      }

      try {
        // Delete from profiles table
        const { error: deleteProfileError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', id)

        if (deleteProfileError) {
          throw new Error(deleteProfileError.message || 'Failed to delete user profile')
        }

        // Delete from auth
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(id)

        if (deleteAuthError) {
          throw new Error(deleteAuthError.message || 'Failed to delete auth user')
        }

        return jsonResponse({ success: true, message: 'User deleted successfully' }, 200)
      } catch (error) {
        console.error('Error deleting user:', error)
        return jsonResponse({ success: false, error: error instanceof Error ? error.message : 'Failed to delete user' }, 200)
      }
    }
    else if (action === 'bulk') {
      // Validate required fields
      if (!operation || !userIds || !Array.isArray(userIds)) {
        return jsonResponse({ success: false, error: 'Missing or invalid operation or userIds' }, 200)
      }

      try {
        if (operation === 'delete') {
          for (const userId of userIds) {
            await supabaseAdmin
              .from('profiles')
              .delete()
              .eq('id', userId)

            await supabaseAdmin.auth.admin.deleteUser(userId)
          }
          return jsonResponse({ success: true, count: userIds.length, message: 'Users deleted successfully' }, 200)
        } else if (operation === 'update_organization') {
          if (!bulkData?.organization_id) {
            return jsonResponse({ success: false, error: 'Missing organization_id in data' }, 200)
          }

          for (const userId of userIds) {
            await supabaseAdmin
              .from('profiles')
              .update({ organization_id: bulkData.organization_id })
              .eq('id', userId)
          }
          return jsonResponse({ success: true, count: userIds.length, message: 'Users updated successfully' }, 200)
        } else {
          return jsonResponse({ success: false, error: 'Unknown bulk operation' }, 200)
        }
      } catch (error) {
        console.error('Error in bulk operation:', error)
        return jsonResponse({ success: false, error: error instanceof Error ? error.message : 'Bulk operation failed' }, 200)
      }
    }
    else {
      // Default action: list users (with optional search)
      console.log('Starting list users action...')
      console.log('Request body:', JSON.stringify(body))

      try {
        // Fetch users
        console.log('Fetching users from database...')
        let query = supabaseAdmin
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        // Apply filters if provided
        if (search) {
          console.log(`Applying search filter: "${search}"`)
          query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
        }

        if (organization_id) {
          query = query.eq('organization_id', organization_id)
        }

        if (role) {
          query = query.eq('role', role)
        }

        const { data: users, error: fetchError } = await query

        if (fetchError) {
          console.error('Error fetching users:', fetchError)
          return jsonResponse({ 
            success: false,
            error: 'Failed to fetch users', 
            details: fetchError.message,
            code: fetchError.code 
          }, 200)
        }

        console.log(`Successfully fetched ${users?.length || 0} users`)

        // If no users found, return empty array
        if (!users || users.length === 0) {
          console.log('No users found, returning empty array')
          return jsonResponse({ success: true, data: [] }, 200)
        }

        return jsonResponse({ success: true, data: users || [] }, 200)
      } catch (error) {
        console.error('Error in list action:', error)
        console.error('Error type:', error?.constructor?.name)
        console.error('Error message:', error instanceof Error ? error.message : String(error))

        return jsonResponse({ 
          success: false,
          error: 'Failed to fetch users', 
          details: error instanceof Error ? error.message : 'Unknown error',
          errorType: error?.constructor?.name,
        }, 200)
      }
    }
  } catch (error) {
    console.error('Unhandled error in admin-users function:', error)
    return jsonResponse(
      { 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      200
    )
  }
})
