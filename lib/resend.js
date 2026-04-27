const RESEND_API_URL = 'https://api.resend.com/emails';

const getFromAddress = () => {
  const from = (
    process.env.RESEND_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.NODEMAIL_SENDER ||
    ''
  ).trim();
  return from;
};

export const sendResendEmail = async ({ to, subject, html, text }) => {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const from = getFromAddress();

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  if (!from) {
    throw new Error('RESEND_FROM is not configured.');
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Resend request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return payload;
};

export const buildPasswordResetEmail = ({ resetUrl }) => {
  const safeUrl = String(resetUrl || '');

  return {
    subject: 'Reset your password',
    text: `Reset your password: ${safeUrl}`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#0f172a;">
        <h2 style="margin:0 0 12px;">Reset your password</h2>
        <p style="margin:0 0 16px;">
          Click the button below to reset your password. This link expires in 60 minutes.
        </p>
        <p style="margin:0 0 20px;">
          <a href="${safeUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:999px;">
            Reset password
          </a>
        </p>
        <p style="margin:0 0 8px;color:#475569;font-size:13px;">
          If the button does not work, paste this link into your browser:
        </p>
        <p style="margin:0;color:#2563eb;font-size:13px;word-break:break-all;">${safeUrl}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="margin:0;color:#64748b;font-size:12px;">
          Litecheats Technologies (litecheats.com) • All rights reserved.
        </p>
      </div>
    `,
  };
};
