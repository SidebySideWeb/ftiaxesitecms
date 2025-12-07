/**
 * Script to create a demo user with superadmin rights
 * 
 * Run with: node scripts/create-demo-user.js
 * 
 * This script:
 * 1. Creates a user in Supabase Auth
 * 2. Links the user to the default tenant with 'owner' role
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE:', serviceRoleKey ? '✓' : '✗');
  console.error('\nPlease ensure .env.local contains these variables.');
  process.exit(1);
}

// Create Supabase client with service role (admin access)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const userEmail = 'dgeronikolos@sidebysideweb.gr';
const userPassword = 'D3v0psAdmin2025!';
const defaultTenantId = '00000000-0000-0000-0000-000000000001'; // Kalitechnia tenant

async function createDemoUser() {
  console.log('🚀 Creating demo user...\n');

  try {
    // Step 1: Create user in Supabase Auth
    console.log('1. Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userEmail,
      password: userPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        username: 'side-admin',
        full_name: 'Side Admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        console.log('   ⚠️  User already exists, fetching existing user...');
        // User exists, fetch it
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.error('   ❌ Error listing users:', listError.message);
          throw listError;
        }
        
        const existingUser = existingUsers?.users.find(u => u.email === userEmail);
        
        if (!existingUser) {
          console.error('   ❌ Could not find existing user');
          process.exit(1);
        }
        
        console.log('   ✓ Found existing user:', existingUser.id);
        
        // Update password and confirm email
        console.log('   🔄 Resetting password...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          {
            password: userPassword,
            email_confirm: true,
          }
        );
        
        if (updateError) {
          console.error('   ⚠️  Could not update password:', updateError.message);
        } else {
          console.log('   ✓ Password reset successfully');
        }
        
        await linkUserToTenant(existingUser.id);
        return;
      }
      throw authError;
    }

    if (!authData?.user) {
      throw new Error('Failed to create user: no user data returned');
    }

    console.log('   ✓ User created:', authData.user.id);
    console.log('   ✓ Email:', authData.user.email);

    // Step 2: Link user to tenant with 'owner' role
    await linkUserToTenant(authData.user.id);

    console.log('\n✅ Demo user created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Email:', userEmail);
    console.log('   Password:', userPassword);
    console.log('   Role: owner (superadmin)');
    console.log('   Tenant: Kalitechnia');

  } catch (error) {
    console.error('\n❌ Error creating demo user:');
    console.error(error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    process.exit(1);
  }
}

async function linkUserToTenant(userId) {
  console.log('\n2. Linking user to tenant...');
  
  // Check if link already exists
  const { data: existingLink } = await supabase
    .from('tenant_users')
    .select('*')
    .eq('tenant_id', defaultTenantId)
    .eq('user_id', userId)
    .single();

  if (existingLink) {
    console.log('   ⚠️  User already linked to tenant, updating role to owner...');
    const { error: updateError } = await supabase
      .from('tenant_users')
      .update({ role: 'owner' })
      .eq('id', existingLink.id);

    if (updateError) throw updateError;
    console.log('   ✓ Role updated to owner');
    return;
  }

  // Create new link
  const { error: linkError } = await supabase
    .from('tenant_users')
    .insert({
      tenant_id: defaultTenantId,
      user_id: userId,
      role: 'owner' // Superadmin role
    });

  if (linkError) {
    // If tenant doesn't exist, create it first
    if (linkError.message.includes('violates foreign key constraint')) {
      console.log('   ⚠️  Tenant not found, creating default tenant...');
      const { error: tenantError } = await supabase
        .from('tenants')
        .insert({
          id: defaultTenantId,
          name: 'Kalitechnia',
          slug: 'kalitechnia'
        });

      if (tenantError && !tenantError.message.includes('duplicate')) {
        throw tenantError;
      }

      // Retry linking
      const { error: retryError } = await supabase
        .from('tenant_users')
        .insert({
          tenant_id: defaultTenantId,
          user_id: userId,
          role: 'owner'
        });

      if (retryError) throw retryError;
    } else {
      throw linkError;
    }
  }

  console.log('   ✓ User linked to tenant with owner role');
}

// Run the script
createDemoUser();

