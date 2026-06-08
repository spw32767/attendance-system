import nodemailer, { Transporter } from "nodemailer";
import QRCode from "qrcode";
import { env } from "../../config/env";

type QrToken = {
  label: string;
  token: string;
};

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  qrTokens?: QrToken[];
};

type SendEmailResult = {
  messageId: string;
};

let cachedTransporter: Transporter | null = null;

const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (!env.smtpHost || !env.smtpFromEmail) {
    return null;
  }

  const hasAuth = Boolean(env.smtpUser) && Boolean(env.smtpPassword);

  cachedTransporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: hasAuth
      ? {
          user: env.smtpUser,
          pass: env.smtpPassword
        }
      : undefined
  });

  return cachedTransporter;
};

// Wraps message content in a responsive, email-client-safe shell (table
// layout + inline styles): dark header band, white card, muted footer.
// Used for every outgoing email so check-in and submission mails share a look.
const renderEmailShell = (inner: string) => `<!DOCTYPE html>
<html lang="th"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#eef1f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f5;padding:24px 12px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(15,23,42,0.08);">
      <tr><td style="background:#0f172a;padding:22px 32px;">
        <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.3px;">ระบบลงทะเบียนและเช็กอิน</span>
      </td></tr>
      <tr><td style="padding:32px;font-size:15px;line-height:1.7;color:#374151;">${inner}</td></tr>
      <tr><td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #eef0f3;font-size:12px;color:#94a3b8;line-height:1.6;">
        อีเมลฉบับนี้ส่งโดยอัตโนมัติจากระบบลงทะเบียน กรุณาอย่าตอบกลับ
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

export const sendEmailWithQr = async (input: SendEmailInput): Promise<SendEmailResult> => {
  const transporter = getTransporter();

  if (!transporter) {
    throw new Error("SMTP is not configured");
  }

  const qrTokens = (input.qrTokens || []).filter((row) => row.token);
  const attachments: Array<{ filename: string; content: Buffer; cid: string }> = [];
  let qrSection = "";

  for (let index = 0; index < qrTokens.length; index += 1) {
    const qrRow = qrTokens[index];
    const cid = `claim_qr_${index}`;
    const dataUrl = await QRCode.toDataURL(qrRow.token, {
      width: 320,
      margin: 1
    });
    const base64Payload = dataUrl.split(",")[1] || "";
    attachments.push({
      filename: `claim-${index + 1}.png`,
      content: Buffer.from(base64Payload, "base64"),
      cid
    });
    qrSection +=
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;">` +
      `<tr><td style="border:1px solid #e5e7eb;border-radius:12px;padding:18px;text-align:center;background:#ffffff;">` +
      `<div style="font-size:15px;font-weight:600;color:#111827;margin:0 0 12px;">${qrRow.label}</div>` +
      `<img src="cid:${cid}" alt="QR ${qrRow.label}" width="180" height="180" style="display:block;margin:0 auto;width:180px;height:180px;border:1px solid #e5e7eb;border-radius:10px;padding:8px;background:#ffffff;"/>` +
      `<div style="margin:12px 0 0;font-size:12px;color:#6b7280;">รหัส: <code style="background:#f1f5f9;padding:3px 8px;border-radius:6px;color:#334155;font-size:12px;">${qrRow.token}</code></div>` +
      `</td></tr></table>`;
  }

  const bodyWithQr = qrSection
    ? `${input.html}<h3 style="font-size:15px;color:#0f172a;margin:28px 0 14px;font-weight:700;">รายการ QR สำหรับรับของรางวัล</h3>${qrSection}`
    : input.html;

  const htmlWithQr = renderEmailShell(bodyWithQr);

  const result = await transporter.sendMail({
    from: `${env.smtpFromName} <${env.smtpFromEmail}>`,
    to: input.to,
    subject: input.subject,
    html: htmlWithQr,
    attachments
  });

  return {
    messageId: result.messageId
  };
};
