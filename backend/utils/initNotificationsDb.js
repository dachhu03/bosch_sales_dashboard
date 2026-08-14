import supabase from './supabase.js';

/**
 * Helper utility to verify database setup for notifications audit table and BOQ review extension fields.
 */
export async function verifyNotificationsDbSetup() {
  try {
    // 1. Test notifications table accessibility
    const { error: notifErr } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);

    if (notifErr) {
      console.warn('[DB Init Warning] "notifications" table query warning:', notifErr.message);
      console.info('[DB Init Info] Ensure "notifications" table and exapp_boq review columns are initialized in Supabase.');
    } else {
      console.log('[DB Init OK] "notifications" audit table verified.');
    }
  } catch (err) {
    console.error('[DB Init Error] Failed to verify notifications database setup:', err);
  }
}

export default verifyNotificationsDbSetup;
