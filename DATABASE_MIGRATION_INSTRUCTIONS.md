# Database Migration Instructions

This guide will help you migrate your horse stable management system database from your old Supabase account to a new one.

## Export Summary

**Export Date:** 2026-01-06
**Total Tables:** 23
**Total Records:** 73 rows

### Data Breakdown:
- **3** User profiles (super_admin, admin, user)
- **1** Team member
- **6** Horse owners
- **6** Veterinarians
- **6** Farriers
- **9** Horses
- **10** Stalls
- **6** Boarding assignments
- **2** Farms
- **2** Yards
- **2** Barns
- **5** Horse breeds, colours, genders
- **4** Horse statuses
- **1** Activity record
- **2** Home Assistant configuration entries

## Migration Steps

### Step 1: Create New Supabase Project

1. Go to https://supabase.com and sign in with your new account
2. Click "New Project"
3. Fill in the project details:
   - Project name: Choose a name for your project
   - Database password: Create a strong password
   - Region: Select the closest region to you
4. Wait for the project to be created (this may take a few minutes)

### Step 2: Get Your New Credentials

1. Once the project is created, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under Project URL)
   - **anon/public key** (under Project API keys)

### Step 3: Update Your .env File

Replace the following values in your project's `.env` file:

```
VITE_SUPABASE_URL=your_new_project_url_here
VITE_SUPABASE_ANON_KEY=your_new_anon_key_here
```

### Step 4: Apply Database Migrations

Your project has several migration files in the `supabase/migrations/` directory. These need to be applied in order to recreate the database schema.

**Option A: Using the Supabase Dashboard**

1. Go to your new Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in chronological order (sorted by filename):
   - `20260103175344_create_horse_list_tables.sql`
   - `20260104150547_add_missing_tables.sql`
   - `20260104155247_fix_rls_performance_and_security.sql`
   - `20260104162925_create_locations_tables.sql`
   - `20260104174020_create_floorplans_table.sql`
   - `20260104180446_add_markings_image_to_horses.sql`
   - `20260104184905_create_horse_media_table.sql`
   - `20260104191352_fix_floorplans_rls_policies.sql`
   - `20260104191429_fix_horse_media_rls_policies.sql`
   - `20260104191446_fix_activities_rls_policies.sql`
   - `20260104192740_create_barns_table.sql`
   - `20260104193654_add_barn_paddock_to_stalls.sql`
   - `20260105100632_fix_rls_policies_for_backend_auth.sql`
   - `20260105100652_fix_boarding_assignments_rls.sql`
   - `20260105191947_fix_security_and_performance_issues.sql`

**Option B: Using Supabase CLI (if you have it installed)**

```bash
supabase db push
```

### Step 5: Import Your Data

Now that your database schema is set up, you can import your data.

**Option A: Using SQL Import (Recommended)**

1. Go to your Supabase Dashboard → **SQL Editor**
2. Open the `database_export.sql` file from this project
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run** to execute the import

**Important Notes:**
- The SQL file includes INSERT statements for all your data
- Foreign key relationships are maintained
- UUIDs are preserved to maintain data integrity

**Option B: Using JSON Import (Alternative)**

If you prefer to import the data programmatically, you can use the `database_export.json` file with a custom script or the Supabase JavaScript client.

### Step 6: Verify Your Data

After importing, verify that all data has been imported correctly:

1. Go to **Table Editor** in your Supabase dashboard
2. Check each table to ensure data is present:
   - `profiles` - Should have 3 users
   - `horses` - Should have 9 horses
   - `owners` - Should have 6 owners
   - `stalls` - Should have 10 stalls
   - `boarding_assignments` - Should have 6 assignments
   - `vets` - Should have 6 vets
   - `farriers` - Should have 6 farriers
   - `farms` - Should have 2 farms
   - `yards` - Should have 2 yards
   - `barns` - Should have 2 barns

### Step 7: Test Your Application

1. Restart your application server
2. Try logging in with your existing credentials
3. Verify that all data displays correctly:
   - Check horses page
   - Check owners page
   - Check stalls page
   - Check boarding assignments
   - Check activities/schedule

### Step 8: Recreate User Accounts

**Important:** The `auth.users` table is managed by Supabase authentication and cannot be directly imported. You'll need to:

1. Have each user reset their password using the "Forgot Password" flow
2. Or, create new accounts for existing users
3. Their profile data (in the `profiles` table) will automatically link once they sign in

For admin users, you may need to:
1. Create the account in your new Supabase project
2. Update their role in the `profiles` table manually using SQL:

```sql
UPDATE profiles
SET role = 'super_admin', account_status = 'enabled'
WHERE email = 'your_email@example.com';
```

## Troubleshooting

### Issue: "Foreign key constraint violation"
**Solution:** Make sure all migrations are applied in order before importing data.

### Issue: "User not found" after importing
**Solution:** User authentication data is separate from profile data. Users need to sign up or reset their password in the new system.

### Issue: "RLS policy prevents insert"
**Solution:** Temporarily disable RLS for data import:
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
-- Run your imports
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Issue: Data appears but can't access it
**Solution:** Check RLS policies are correctly set up. Your migrations should have created these automatically.

## Files Included

1. **database_export.sql** - Complete SQL export with INSERT statements
2. **database_export.json** - JSON format export for programmatic import
3. **DATABASE_MIGRATION_INSTRUCTIONS.md** - This file

## Support

If you encounter any issues during migration:
1. Check that all migrations were applied successfully
2. Verify your Supabase credentials are correct in `.env`
3. Check the browser console and server logs for error messages
4. Ensure RLS policies are properly configured

## Home Assistant Integration

Your Home Assistant configuration has been exported and is included in the `config` table. After migration, you may need to:
1. Verify the Home Assistant token is still valid
2. Test the Home Assistant connection from the application
3. If needed, regenerate the token in your Home Assistant instance and update it in the application

## Post-Migration Checklist

- [ ] New Supabase project created
- [ ] Credentials updated in `.env` file
- [ ] All migrations applied successfully
- [ ] Data imported from SQL file
- [ ] Data verified in Supabase dashboard
- [ ] Application tested and working
- [ ] User accounts recreated/reset
- [ ] Admin roles assigned correctly
- [ ] Home Assistant integration tested (if used)
- [ ] Old Supabase project decommissioned (after confirming everything works)

---

**Backup Note:** Keep the export files (`database_export.sql` and `database_export.json`) in a safe place as backups until you've confirmed everything is working correctly in your new Supabase account.
