/**
 * Script to reset password for existing user
 * 
 * Run with: node scripts/reset-user-password.js
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
const userPassword = 'D3v0psAdmin2025!';

async function resetPassword() {
  console.log('🔐 Resetting user password...\n');

  try {
    // Find the user
    console.log('1. Finding user...');
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }

    const user = users?.users.find(u => u.email === userEmail);
    
    if (!user) {
      console.error('❌ User not found:', userEmail);
      process.exit(1);
    }

    console.log('   ✓ Found user:', user.id);
    console.log('   ✓ Email:', user.email);

    // Update the user's password
    console.log('\n2. Updating password...');
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        password: userPassword,
        email_confirm: true, // Ensure email is confirmed
      }
    );

    if (updateError) {
      throw updateError;
    }

    console.log('   ✓ Password updated successfully');
    console.log('\n✅ User credentials:');
    console.log('   Email:', userEmail);
    console.log('   Password:', userPassword);
    console.log('   Status: Email confirmed, password set');

  } catch (error) {
    console.error('\n❌ Error resetting password:');
    console.error(error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    process.exit(1);
  }
}

resetPassword();

