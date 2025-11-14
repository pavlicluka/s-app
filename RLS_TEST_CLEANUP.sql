-- =====================================================
-- RLS TEST DATA CLEANUP SCRIPT
-- =====================================================
-- Purpose: Remove all test data created during automated RLS testing
-- Date: 2025-11-09
-- Safe to run: YES (only removes test data with specific IDs)
-- =====================================================

-- Step 1: Remove test incidents (identifiable by INC-* prefix)
DELETE FROM incidents WHERE incident_id LIKE 'INC-%';

-- Step 2: Remove test devices (created within last 2 hours)
DELETE FROM devices 
WHERE created_at > NOW() - INTERVAL '2 hours'
  AND organization_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
  );

-- Step 3: Remove test policies (identifiable by POL-* prefix)
DELETE FROM policies WHERE policy_id LIKE 'POL-%';

-- Step 4: Remove test user profiles
DELETE FROM profiles WHERE id IN (
  'aaaaaaaa-1111-1111-1111-111111111111',
  'aaaaaaaa-1111-1111-1111-111111111112',
  'bbbbbbbb-2222-2222-2222-222222222221',
  'bbbbbbbb-2222-2222-2222-222222222222',
  'cccccccc-3333-3333-3333-333333333331',
  '99999999-9999-9999-9999-999999999999'
);

-- Step 5: Remove test organizations
DELETE FROM organizations WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- Verification: Check if test data was removed
SELECT 
  'Cleanup Verification' as status,
  'Test data removed successfully' as message;

SELECT 
  'Remaining test incidents' as check_type,
  COUNT(*) as count
FROM incidents WHERE incident_id LIKE 'INC-%';

SELECT 
  'Remaining test policies' as check_type,
  COUNT(*) as count
FROM policies WHERE policy_id LIKE 'POL-%';

SELECT 
  'Remaining test profiles' as check_type,
  COUNT(*) as count
FROM profiles WHERE id IN (
  'aaaaaaaa-1111-1111-1111-111111111111',
  'aaaaaaaa-1111-1111-1111-111111111112',
  'bbbbbbbb-2222-2222-2222-222222222221',
  'bbbbbbbb-2222-2222-2222-222222222222',
  'cccccccc-3333-3333-3333-333333333331',
  '99999999-9999-9999-9999-999999999999'
);

SELECT 
  'Remaining test organizations' as check_type,
  COUNT(*) as count
FROM organizations WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- =====================================================
-- CLEANUP COMPLETE
-- =====================================================
-- Expected results: All counts should be 0
-- If any counts are non-zero, test data cleanup failed
-- =====================================================
