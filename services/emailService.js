import nodemailer from 'nodemailer';
import AppSettings from '../models/AppSettings.js';

/**
 * Fetches current SMTP settings from AppSettings collection.
 * Creates a nodemailer transporter with those settings.
 */
const getTransporter = async () => {
  const settings = await AppSettings.findOne();
  if (!settings || !settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
    throw new Error('SMTP settings are not configured in AppSettings.');
  }

  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass,
    },
  });
};

/**
 * Generic function to send an email.
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const settings = await AppSettings.findOne();
    const transporter = await getTransporter();
    
    const mailOptions = {
      from: settings.smtpFromEmail || settings.smtpUser,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Helper to replace placeholders like {{name}} in templates.
 */
const replacePlaceholders = (template, data) => {
  let content = template;
  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(regex, data[key]);
  }
  return content;
};

/**
 * Sends a welcome email using the template from AppSettings.
 */
export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const settings = await AppSettings.findOne();
    if (!settings || !settings.welcomeEmailTemplate) return;

    const subject = replacePlaceholders(settings.welcomeEmailTemplate.subject, { name: userName });
    const body = replacePlaceholders(settings.welcomeEmailTemplate.body, { name: userName });

    // Simple HTML wrapper
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #6200EE;">Lotus</h2>
        <p>${body.replace(/\n/g, '<br>')}</p>
        <hr />
        <p style="font-size: 12px; color: #777;">Sent via Lotus Business Solutions</p>
      </div>
    `;

    return await sendEmail({ to: userEmail, subject, html });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

/**
 * Sends a purchase confirmation email using the template from AppSettings.
 */
export const sendPurchaseEmail = async (userEmail, userName, planName) => {
  try {
    const settings = await AppSettings.findOne();
    if (!settings || !settings.purchaseEmailTemplate) return;

    const subject = replacePlaceholders(settings.purchaseEmailTemplate.subject, { name: userName, planName });
    const body = replacePlaceholders(settings.purchaseEmailTemplate.body, { name: userName, planName });

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #6200EE;">Lotus Pro Activated</h2>
        <p>${body.replace(/\n/g, '<br>')}</p>
        <p>You now have full access to all premium features!</p>
        <hr />
        <p style="font-size: 12px; color: #777;">Sent via Lotus Business Solutions</p>
      </div>
    `;

    return await sendEmail({ to: userEmail, subject, html });
  } catch (error) {
    console.error('Failed to send purchase email:', error);
  }
};
