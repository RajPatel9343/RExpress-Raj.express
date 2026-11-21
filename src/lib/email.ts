import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    // Dev mode: log to console
    console.log('\n==== EMAIL (Dev Mode - Not Sent) ====');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Body (HTML stripped):', options.html.replace(/<[^>]*>/g, ' ').substring(0, 500));
    console.log('=====================================\n');
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: smtpUser, pass: smtpPass },
    });
    await transporter.sendMail({
      from: `"Rexpresso" <${smtpUser}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (err) {
    console.error('Email sending failed:', err);
    return false;
  }
}

export function passwordResetEmailHtml(resetUrl: string, userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Inter, sans-serif; background: #F9FAFB; padding: 40px 0;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #E5E7EB;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; background: #2563EB; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 20px;">R</div>
          <h2 style="color: #111827; margin-top: 16px; font-size: 22px;">Password Reset Request</h2>
        </div>
        <p style="color: #374151; font-size: 14px; line-height: 1.6;">Hi ${userName},</p>
        <p style="color: #374151; font-size: 14px; line-height: 1.6;">We received a request to reset your password for your Rexpresso account. Click the button below to create a new password. This link will expire in <strong>1 hour</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px;">Reset My Password</a>
        </div>
        <p style="color: #6B7280; font-size: 12px;">If you didn't request this, please ignore this email. Your password will not change.</p>
        <p style="color: #6B7280; font-size: 12px;">Link not working? Copy and paste this URL: <br/><span style="color: #2563EB;">${resetUrl}</span></p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;"/>
        <p style="color: #9CA3AF; font-size: 11px; text-align: center;">© 2026 Rexpresso. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}
