import nodemailer from "nodemailer";
import { config } from "../config/env";
import { logger } from "../logger";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter | null => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
};

const isEmailEnabled = (): boolean => {
  return getTransporter() !== null;
};

const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  const smtp = getTransporter();
  if (!smtp) {
    logger.debug("SMTP not configured, skipping email send");
    return false;
  }

  try {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    await smtp.sendMail({ from, to, subject, html });
    logger.info({ to, subject }, "Email sent successfully");
    return true;
  } catch (err) {
    logger.error({ err, to, subject }, "Failed to send email");
    return false;
  }
};

const sendReservationReminder = async (
  to: string,
  name: string,
  roomName: string,
  seatNumber: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> => {
  const subject = "Seat Genie - Reservation Reminder";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #6366f1;">Reservation Reminder</h2>
      <p>Hi ${name},</p>
      <p>This is a reminder for your upcoming seat reservation:</p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p><strong>Room:</strong> ${roomName}</p>
        <p><strong>Seat:</strong> ${seatNumber}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
      </div>
      <p>Please arrive on time. Thank you for using Seat Genie!</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

const sendOverdueAlert = async (
  to: string,
  name: string,
  bookTitle: string,
  dueDate: string
): Promise<boolean> => {
  const subject = "Seat Genie - Overdue Book Alert";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #ef4444;">Overdue Book Alert</h2>
      <p>Hi ${name},</p>
      <p>The following book is overdue and needs to be returned:</p>
      <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p><strong>Book:</strong> ${bookTitle}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
      </div>
      <p>Please return the book as soon as possible to avoid additional penalties.</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

export {
  isEmailEnabled,
  sendEmail,
  sendReservationReminder,
  sendOverdueAlert,
};
