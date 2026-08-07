import supabase from './utils/supabase.js';
import bcrypt from 'bcryptjs';

async function debug() {
  console.log('Connecting to Supabase at:', process.env.SUPABASE_URL);
  
  try {
    // 1. Check User table count
    const { count, data, error } = await supabase
      .from('User')
      .select('*', { count: 'exact' });
      
    if (error) {
      console.error('Error querying User table:', error);
    } else {
      console.log('User table count:', count);
      console.log('Users in database:', data);
    }

    // 2. Try inserting default admin manually
    if (!error && count === 0) {
      console.log('User table is empty. Attempting manual insert...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const { data: inserted, error: insertErr } = await supabase
        .from('User')
        .insert([{ username: 'admin', password: hashedPassword }])
        .select();
        
      if (insertErr) {
        console.error('Manual insert failed:', insertErr);
      } else {
        console.log('Manual insert succeeded:', inserted);
      }
    }
  } catch (err) {
    console.error('Exception during debug:', err);
  }
}

debug();
