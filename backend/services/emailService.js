import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465');
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || 'darshhgowda03@gmail.com';
  const pass = process.env.SMTP_PASSWORD ? String(process.env.SMTP_PASSWORD).replace(/"/g, '') : '';
  const from = process.env.EMAIL_FROM || 'Bosch Sales Dashboard <darshhgowda03@gmail.com>';

  return { host, port, secure, user, pass, from };
}

let transporter = null;

export function getTransporter() {
  if (!transporter) {
    const config = getSmtpConfig();
    const isGmail = config.host?.includes('gmail') || config.user?.includes('gmail');

    transporter = nodemailer.createTransport({
      ...(isGmail ? { service: 'gmail' } : { host: config.host, port: config.port, secure: config.secure }),
      auth: {
        user: config.user,
        pass: config.pass
      },
      family: 4, // Force IPv4 to prevent ENETUNREACH IPv6 connection failure on cloud platforms
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return transporter;
}

/**
 * Formats a clean HTML & Plain Text email template for BOQ notifications
 */
export function renderBoqEmailTemplate({ isNew, boq, actorName, reviewUrl }) {
  const config = getSmtpConfig();
  const subject = isNew 
    ? 'New BOQ Created - Review Required' 
    : 'BOQ Updated - Review Required';

  const appName = 'Bosch Sales Dashboard';
  const actionText = isNew ? 'created' : 'updated';
  const formattedDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const totals = typeof boq.totals === 'string' ? JSON.parse(boq.totals) : (boq.totals || {});
  const salesVal = parseFloat(totals.grandTotalSales || totals.grand_sales_total) || 0;
  const formattedSales = `₹${salesVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: #0f172a; padding: 24px 32px; border-bottom: 4px solid #005691; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; tracking-tight: true; }
    .header p { color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; }
    .badge { display: inline-block; padding: 4px 12px; background: #eff6ff; color: #1d4ed8; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid #bfdbfe; margin-top: 12px; }
    .content { padding: 32px; }
    .meta-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .meta-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .meta-table td.label { font-weight: 700; color: #64748b; width: 35%; }
    .meta-table td.value { font-weight: 600; color: #0f172a; }
    .button-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
    .btn { display: inline-block; padding: 14px 28px; background: #005691; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 13px; shadow: 0 4px 12px rgba(0,86,145,0.25); }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${appName}</h1>
      <p>Management Notification System</p>
      <div class="badge">${subject}</div>
    </div>
    
    <div class="content">
      <p style="font-size: 14px; margin-top: 0;">Hello Super Admin,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.5;">
        A BOQ quotation has been <strong>${actionText}</strong> by <strong>${actorName}</strong> and requires your internal review.
      </p>

      <table class="meta-table">
        <tr>
          <td class="label">Project Name:</td>
          <td class="value">${boq.projectName || boq.project_name || 'N/A'}</td>
        </tr>
        <tr>
          <td class="label">Location / Customer:</td>
          <td class="value">${boq.projectLocation || boq.project_location || 'N/A'}</td>
        </tr>
        <tr>
          <td class="label">Quotation Number:</td>
          <td class="value">${boq.quotationNumber || boq.quotation_number || 'N/A'}</td>
        </tr>
        <tr>
          <td class="label">Solution Title:</td>
          <td class="value">${boq.solutionTitle || boq.solution_title || 'Custom Integrated Solution'}</td>
        </tr>
        <tr>
          <td class="label">Quoted Sales Value:</td>
          <td class="value" style="color: #005691; font-weight: 800;">${formattedSales}</td>
        </tr>
        <tr>
          <td class="label">${isNew ? 'Created By:' : 'Updated By:'}</td>
          <td class="value">${actorName}</td>
        </tr>
        <tr>
          <td class="label">Date & Time:</td>
          <td class="value">${formattedDate}</td>
        </tr>
        <tr>
          <td class="label">Review Status:</td>
          <td class="value"><span style="color: #d97706; font-weight: 700;">PENDING_REVIEW</span></td>
        </tr>
      </table>

      <div class="button-container">
        <a href="${reviewUrl}" class="btn">Open BOQ Solution Review</a>
      </div>
    </div>

    <div class="footer">
      This is an automated management notification generated by ${appName}.<br>
      Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${appName} - ${subject}

Hello Super Admin,

A BOQ quotation has been ${actionText} by ${actorName} and requires your internal review.

Project Name: ${boq.projectName || boq.project_name || 'N/A'}
Location / Customer: ${boq.projectLocation || boq.project_location || 'N/A'}
Quotation Number: ${boq.quotationNumber || boq.quotation_number || 'N/A'}
Solution Title: ${boq.solutionTitle || boq.solution_title || 'Custom Integrated Solution'}
Quoted Sales Value: ${formattedSales}
${isNew ? 'Created By:' : 'Updated By:'} ${actorName}
Date & Time: ${formattedDate}
Review Status: PENDING_REVIEW

Review BOQ Link: ${reviewUrl}

---
${appName} System Notification
  `;

  return { subject, html, text };
}

/**
 * Dispatches email using Resend HTTP API (Primary), Brevo HTTP API (Secondary), or IPv4 Nodemailer (Fallback)
 */
export async function sendEmail({ to, subject, html, text }) {
  // 1. Resend HTTP API Transport (HTTPS port 443 - Never blocked by Render)
  if (process.env.RESEND_API_KEY) {
    try {
      const resendFrom = process.env.RESEND_FROM || process.env.EMAIL_FROM || 'Bosch Sales Dashboard <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: resendFrom,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Resend API error (${res.status}): ${JSON.stringify(data)}`);
      }

      console.log(`[EmailService/Resend] Email delivered successfully to ${to} (Message ID: ${data.id})`);
      return { success: true, messageId: data.id, provider: 'resend' };
    } catch (apiErr) {
      console.error(`[EmailService/Resend] Error sending via Resend API:`, apiErr.message);
      throw apiErr;
    }
  }

  // 2. Brevo HTTP API Transport (HTTPS port 443 - Never blocked by Render)
  if (process.env.BREVO_API_KEY) {
    try {
      const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'darshhgowda03@gmail.com';
      const senderName = process.env.BREVO_SENDER_NAME || 'Bosch Sales Dashboard';

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Brevo API error (${res.status}): ${JSON.stringify(data)}`);
      }

      console.log(`[EmailService/Brevo] Email delivered successfully to ${to} (Message ID: ${data.messageId})`);
      return { success: true, messageId: data.messageId, provider: 'brevo' };
    } catch (brevoErr) {
      console.error(`[EmailService/Brevo] Error sending via Brevo API:`, brevoErr.message);
      throw brevoErr;
    }
  }

  // 3. Fallback: Direct Nodemailer Transport (with IPv4 enforcement & service preset)
  const config = getSmtpConfig();
  const mailTransporter = getTransporter();

  const mailOptions = {
    from: config.from || '"Bosch Sales Dashboard" <darshhgowda03@gmail.com>',
    to,
    replyTo: config.user || 'darshhgowda03@gmail.com',
    subject,
    html,
    text,
    headers: {
      'X-Priority': '1 (Highest)',
      'X-MSMail-Priority': 'High',
      'Importance': 'High'
    }
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`[EmailService/SMTP] Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId, provider: 'smtp' };
  } catch (error) {
    console.error(`[EmailService/SMTP] Error dispatching email to ${to}:`, error);
    throw error;
  }
}
