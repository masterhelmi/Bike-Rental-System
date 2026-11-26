// Test script untuk cek koneksi Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yffztwvrdhbuccdilsfd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZnp0d3ZyZGhidWNjZGlsc2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MjMwOTIsImV4cCI6MjEwNjI5OTA5Mn0.ZgAjo9A-HXV5hbC5EpumUeF-LjSPoiXIX0nis_U0H9c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);

  try {
    // Test 1: Cek koneksi dengan simple query
    console.log('\nTest 1: Simple ping...');
    const { data, error } = await supabase.from('bike_types').select('count').limit(1);
    if (error) {
      console.error('❌ Query failed:', error.message);
    } else {
      console.log('✅ Query successful:', data);
    }

    // Test 2: Cek auth connection
    console.log('\nTest 2: Auth connection...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ Auth failed:', sessionError.message);
    } else {
      console.log('✅ Auth successful:', sessionData);
    }

  } catch (err) {
    console.error('❌ Connection error:', err.message);
    console.error('Error details:', err);
  }
}

testConnection();
