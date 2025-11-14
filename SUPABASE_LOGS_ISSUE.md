# Supabase Logs Query Issue

## Problem

When querying Supabase Edge Function logs using the `supabase_function_logs` tool, the following SQL error occurs:

```
ERROR: 42883: function unnest(jsonb) does not exist
LINE 11: CROSS JOIN UNNEST(metadata) AS metadata
HINT: No function matches the given name and argument types. You might need to add explicit type casts.
```

## Root Cause

This is a **Supabase platform issue**, not an application code issue. Supabase's log querying system is using `UNNEST(metadata)` on a JSONB column, which is incorrect PostgreSQL syntax.

### Technical Details

- `UNNEST()` is designed for PostgreSQL arrays (`[]`), not JSONB objects
- For JSONB data, PostgreSQL provides different functions:
  - `jsonb_each()` - expands JSONB object to key-value pairs
  - `jsonb_array_elements()` - expands JSONB array to elements
  - Direct JSONB field access - `metadata->>'field_name'`

### Correct SQL Approach

Instead of:
```sql
CROSS JOIN UNNEST(metadata) AS metadata  -- ❌ Wrong for JSONB
```

Should be one of:
```sql
-- Option 1: Expand JSONB object to rows
CROSS JOIN LATERAL jsonb_each(metadata) AS metadata(key, value)

-- Option 2: Expand JSONB array to elements
CROSS JOIN LATERAL jsonb_array_elements(metadata) AS metadata_element

-- Option 3: Direct field access (no join needed)
WHERE metadata->>'field_name' = 'value'
```

## Impact

- Cannot query Supabase Edge Function logs through the Supabase API
- The `supabase_function_logs` tool returns 400 errors
- Log debugging must be done through Supabase Dashboard UI instead

## Workarounds

### 1. Use Supabase Dashboard (Recommended)

Navigate to:
```
https://supabase.com/dashboard/project/{projectId}/functions/{functionName}/logs
```

For this project:
- Project ID: `ckxlbiiirfdogobccmjs`
- Admin Organizations: https://supabase.com/dashboard/project/ckxlbiiirfdogobccmjs/functions/admin-organizations/logs
- Admin Users: https://supabase.com/dashboard/project/ckxlbiiirfdogobccmjs/functions/admin-users/logs
- MISP Feed: https://supabase.com/dashboard/project/ckxlbiiirfdogobccmjs/functions/fetch-misp-feed/logs

### 2. Query edge_logs Table Directly

If you have direct database access, you can query the `edge_logs` table:

```sql
-- Get recent error logs for admin-organizations function
SELECT 
  id,
  event_message,
  metadata,
  timestamp,
  level
FROM edge_logs
WHERE 
  function_id = 'admin-organizations'
  AND level = 'error'
  AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC
LIMIT 10;

-- Access specific JSONB fields
SELECT 
  id,
  event_message,
  metadata->>'status_code' as status_code,
  metadata->>'error_message' as error_message,
  timestamp
FROM edge_logs
WHERE function_id = 'admin-organizations';
```

### 3. Add Custom Logging

Implement custom logging in edge functions that writes to a separate table:

```typescript
// In edge function
const logError = async (error: any) => {
  await supabase.from('function_error_logs').insert({
    function_name: 'admin-organizations',
    error_message: error.message,
    stack_trace: error.stack,
    request_data: JSON.stringify(request),
    timestamp: new Date().toISOString()
  })
}
```

## Solution

This issue must be fixed by Supabase. The proper solution would be for Supabase to:

1. Update their log querying SQL to use appropriate JSONB functions
2. Use `jsonb_each()` or `jsonb_array_elements()` instead of `unnest()`
3. Or avoid the CROSS JOIN altogether and use direct JSONB field access

## Reporting to Supabase

This issue should be reported to Supabase through:
- GitHub Issues: https://github.com/supabase/supabase/issues
- Discord: https://discord.supabase.com
- Support: https://supabase.com/support

### Issue Template

```
**Bug Report: Edge Function Logs Query Error**

**Describe the bug**
The Supabase API endpoint for querying edge function logs returns a 400 error with SQL error: "function unnest(jsonb) does not exist"

**To Reproduce**
1. Create a Supabase project with edge functions
2. Call the logs API endpoint: `POST /functions/v1/{function_id}/logs`
3. Observe SQL error in response

**Expected behavior**
Logs should be returned without SQL errors

**Error Message**
```
ERROR: 42883: function unnest(jsonb) does not exist
LINE 11: CROSS JOIN UNNEST(metadata) AS metadata
```

**Root Cause**
The internal SQL query uses `UNNEST(metadata)` on a JSONB column, which is invalid. Should use `jsonb_each()` or `jsonb_array_elements()` instead.

**Environment**
- Supabase project region: us-east-1
- Function runtime: Deno
- API version: v1
```

## Status

**Issue Status:** Open (Supabase platform bug)
**Our Status:** Documented workarounds in place
**Impact:** Low - Dashboard UI still works for log viewing
**Resolution:** Waiting for Supabase to fix backend SQL query

---

**Last Updated:** 2025-11-13
**Created By:** Blink Agent
**Issue Type:** Third-party platform limitation
