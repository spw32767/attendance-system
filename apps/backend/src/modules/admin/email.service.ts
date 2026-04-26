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
    qrSection += `<li style="margin-bottom:12px;"><p style="margin:0 0 6px;"><strong>${qrRow.label}</strong><br/>Token: <code>${qrRow.token}</code></p><img src="cid:${cid}" alt="QR ${qrRow.label}" style="width:180px;height:180px;border:1px solid #ddd;padding:6px;border-radius:8px;"/></li>`;
  }

  const htmlWithQr = qrSection
    ? `${input.html}<hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb;"/><h3 style="margin:0 0 10px;">QR สำหรับรับของรางวัล</h3><ul style="padding-left:18px;margin:0;">${qrSection}</ul>`
    : input.html;

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
