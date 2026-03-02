import cron from "node-cron";
import { getDb } from "../db";
import { logger } from "../logger";

interface UpcomingReservation {
  id: number;
  user_id: number;
  seat_number: string;
  room_name: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface OverdueLoan {
  id: number;
  book_title: string;
  member_name: string;
  member_id: number;
  due_at: string;
}

const checkUpcomingReservations = (): void => {
  try {
    const db = getDb();
    const today = new Date().toISOString().slice(0, 10);

    const upcoming = db
      .prepare(
        `SELECT r.id, r.user_id, r.date, r.start_time, r.end_time,
                s.seat_number, rm.name AS room_name
         FROM reservations r
         LEFT JOIN seats s ON r.seat_id = s.id
         LEFT JOIN rooms rm ON s.room_id = rm.id
         WHERE r.status = 'active' AND r.date = ?`
      )
      .all(today) as UpcomingReservation[];

    if (upcoming.length === 0) return;

    const now = new Date().toISOString();
    const insertStmt = db.prepare(
      `INSERT INTO notifications (title, content, type, created_by, active_status, created_at, updated_at)
       VALUES (?, ?, 'system', NULL, 'Y', ?, ?)`
    );

    const existingCheck = db.prepare(
      `SELECT id FROM notifications
       WHERE title = ? AND content LIKE ? AND DATE(created_at) = ?`
    );

    for (const res of upcoming) {
      const title = "Reservation Reminder";
      const content = `You have a seat reservation today: ${res.room_name} - ${res.seat_number}, ${res.start_time} - ${res.end_time}`;
      const contentPattern = `%${res.room_name} - ${res.seat_number}%${res.start_time}%`;

      const existing = existingCheck.get(title, contentPattern, today);
      if (existing) continue;

      insertStmt.run(title, content, now, now);
    }

    if (upcoming.length > 0) {
      logger.info({ count: upcoming.length }, "Processed reservation reminders");
    }
  } catch (err) {
    logger.error({ err }, "Failed to check upcoming reservations");
  }
};

const checkOverdueLoans = (): void => {
  try {
    const db = getDb();
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    const overdue = db
      .prepare(
        `SELECT l.id, l.due_at, l.member_id,
                b.title AS book_title, m.name AS member_name
         FROM loans l
         LEFT JOIN books b ON l.book_id = b.id
         LEFT JOIN members m ON l.member_id = m.id
         WHERE l.returned_at IS NULL AND DATE(l.due_at) < ?`
      )
      .all(today) as OverdueLoan[];

    if (overdue.length === 0) return;

    const insertStmt = db.prepare(
      `INSERT INTO notifications (title, content, type, created_by, active_status, created_at, updated_at)
       VALUES (?, ?, 'system', NULL, 'Y', ?, ?)`
    );

    const existingCheck = db.prepare(
      `SELECT id FROM notifications
       WHERE title = 'Overdue Loan Alert' AND content LIKE ? AND DATE(created_at) = ?`
    );

    for (const loan of overdue) {
      const content = `Overdue book: "${loan.book_title}" borrowed by ${loan.member_name}, was due on ${loan.due_at}`;
      const contentPattern = `%${loan.book_title}%${loan.member_name}%`;

      const existing = existingCheck.get(contentPattern, today);
      if (existing) continue;

      insertStmt.run("Overdue Loan Alert", content, now, now);
    }

    logger.info({ count: overdue.length }, "Processed overdue loan alerts");
  } catch (err) {
    logger.error({ err }, "Failed to check overdue loans");
  }
};

let reservationTask: cron.ScheduledTask | null = null;
let overdueTask: cron.ScheduledTask | null = null;

const startScheduler = (): void => {
  // 每天早上 8:00 检查当天预约并发送提醒
  reservationTask = cron.schedule("0 8 * * *", () => {
    logger.info("Running reservation reminder check...");
    checkUpcomingReservations();
  });

  // 每天早上 9:00 检查逾期借阅
  overdueTask = cron.schedule("0 9 * * *", () => {
    logger.info("Running overdue loan check...");
    checkOverdueLoans();
  });

  logger.info("Scheduler started: reservation reminders at 08:00, overdue checks at 09:00");
};

const stopScheduler = (): void => {
  if (reservationTask) {
    reservationTask.stop();
    reservationTask = null;
  }
  if (overdueTask) {
    overdueTask.stop();
    overdueTask = null;
  }
  logger.info("Scheduler stopped");
};

const runNow = (): { reservations: string; overdueLoans: string } => {
  checkUpcomingReservations();
  checkOverdueLoans();
  return {
    reservations: "Reservation reminder check completed",
    overdueLoans: "Overdue loan check completed",
  };
};

export { startScheduler, stopScheduler, runNow, checkUpcomingReservations, checkOverdueLoans };
