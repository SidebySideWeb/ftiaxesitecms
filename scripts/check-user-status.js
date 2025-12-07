/**
 * Script to check user status and verify account setup
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const userEmail = 'dgeronikolos@sidebysideweb.gr';

async function checkUserStatus() {
  console.log('🔍 Checking user status...\n');

  try {
    // Find the user
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }

    const user = users?.users.find(u => u.email === userEmail);
    
    if (!user) {
      console.error('❌ User not found:', userEmail);
      process.exit(1);
    }

    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Email confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
    console.log('   Created:', user.created_at);
    console.log('   Last sign in:', user.last_sign_in_at || 'Never');
    console.log('   Confirmed at:', user.confirmed_at || 'Not confirmed');

    // Check tenant link
    console.log('\n🔗 Checking tenant link...');
    const { data: tenantLink, error: linkError } = await supabase
      .from('tenant_users')
      .select('*, tenants(*)')
      .eq('user_id', user.id)
      .single();

    if (linkError || !tenantLink) {
      console.log('   ⚠️  No tenant link found');
    } else {
      console.log('   ✓ Linked to tenant:', tenantLink.tenants?.name);
      console.log('   ✓ Role:', tenantLink.role);
    }

    // If email not confirmed, confirm it
    if (!user.email_confirmed_at) {
      console.log('\n🔄 Confirming email...');
      const { error: confirmError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      );

      if (confirmError) {
        console.error('   ❌ Error confirming email:', confirmError.message);
      } else {
        console.log('   ✓ Email confirmed');
      }
    }

    console.log('\n✅ User status check complete!');

  } catch (error) {
    console.error('\n❌ Error checking user status:');
    console.error(error.message);
    process.exit(1);
  }
}

checkUserStatus();

