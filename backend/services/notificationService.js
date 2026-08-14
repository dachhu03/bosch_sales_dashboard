import supabase from '../utils/supabase.js';
import { sendEmail, renderBoqEmailTemplate } from './emailService.js';

/**
 * Dynamically queries active Super Admin email accounts EXCLUSIVELY from Supabase auth_user table.
 */
export async function getSuperAdminEmails() {
  const emails = new Set();

  try {
    const { data: users, error } = await supabase
      .from('auth_user')
      .select('email, role, is_superuser, is_active');

    if (!error && users && users.length > 0) {
      users.forEach(u => {
        const isSuper = u.is_superuser === 1 || u.role === 'super_admin';
        const isActive = u.is_active === undefined || u.is_active === 1;
        if (isSuper && isActive && u.email && String(u.email).trim().length > 0) {
          emails.add(String(u.email).trim().toLowerCase());
        }
      });
    } else if (error) {
      console.warn('[NotificationService] Warning: Could not query auth_user table:', error.message);
    }
  } catch (err) {
    console.warn('[NotificationService] Exception querying super admins:', err.message);
  }

  // Fallback to SMTP_USER ONLY if no active Super Admin accounts exist in auth_user
  if (emails.size === 0 && process.env.SMTP_USER) {
    emails.add(String(process.env.SMTP_USER).trim().toLowerCase());
  }

  return Array.from(emails);
}

/**
 * Checks if an event_id has already been processed to prevent duplicate emails
 */
export async function isDuplicateEvent(eventId) {
  if (!eventId) return false;

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .eq('event_id', String(eventId))
      .eq('status', 'SENT')
      .limit(1);

    if (!error && data && data.length > 0) {
      return true;
    }
  } catch (err) {
    console.warn('[NotificationService] Exception checking event deduplication:', err.message);
  }

  return false;
}

/**
 * Core notification trigger executed after successful BOQ save.
 * Sends dedicated emails to all Super Admin recipient addresses found in auth_user.
 */
export async function sendBoqSaveNotification({ boqId, boqData, isNew = false, actorName = 'Sales Member', eventId = null }) {
  if (!boqId || !boqData) {
    console.warn('[NotificationService] Missing boqId or boqData for notification.');
    return { success: false, reason: 'Invalid arguments' };
  }

  // 1. Deduplication Check
  if (eventId) {
    const duplicate = await isDuplicateEvent(eventId);
    if (duplicate) {
      console.log(`[NotificationService] Duplicate event_id detected (${eventId}). Skipping email dispatch.`);
      return { success: true, duplicate: true };
    }
  }

  // 2. Query Super Admin recipients exclusively from auth_user database table
  const recipients = await getSuperAdminEmails();
  if (!recipients || recipients.length === 0) {
    console.warn('[NotificationService] No Super Admin recipients found.');
    return { success: false, reason: 'No recipients' };
  }

  const reviewUrl = `${process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173'}/admin`;

  // 3. Render email template
  const { subject, html, text } = renderBoqEmailTemplate({
    isNew,
    boq: boqData,
    actorName,
    reviewUrl
  });

  const notificationType = isNew ? 'BOQ_CREATED' : 'BOQ_UPDATED';

  // 4. Send dedicated email FROM darshhgowda03@gmail.com TO each Super Admin recipient address
  const results = await Promise.allSettled(
    recipients.map(recipient => sendEmail({ to: recipient, subject, html, text }))
  );

  const successfulDispatches = [];
  const failedDispatches = [];

  results.forEach((res, idx) => {
    const recipient = recipients[idx];
    if (res.status === 'fulfilled') {
      successfulDispatches.push({ recipient, messageId: res.value.messageId });
    } else {
      failedDispatches.push({ recipient, error: res.reason?.message || res.reason });
    }
  });

  const allRecipientsStr = recipients.join(', ');

  // Log audit row in notifications table
  try {
    await supabase
      .from('notifications')
      .insert([{
        boq_id: parseInt(boqId),
        event_id: eventId ? String(eventId) : null,
        recipient: allRecipientsStr,
        notification_type: notificationType,
        status: successfulDispatches.length > 0 ? 'SENT' : 'FAILED',
        sent_at: successfulDispatches.length > 0 ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        error_message: failedDispatches.length > 0 ? JSON.stringify(failedDispatches) : null
      }]);
  } catch (auditErr) {
    console.warn('[NotificationService] Audit log write warning:', auditErr.message);
  }

  console.log(`[NotificationService] Dispatched BOQ save email FROM darshhgowda03@gmail.com TO ${successfulDispatches.length}/${recipients.length} Super Admins (${recipients.join(', ')}).`);

  return {
    success: successfulDispatches.length > 0,
    successfulCount: successfulDispatches.length,
    recipients: recipients
  };
}
