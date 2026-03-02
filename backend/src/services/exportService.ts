import ExcelJS from "exceljs";
import { getDb } from "../db";
import type { BookRow, UserRow, ReservationRow, LoanRow } from "../types";

const exportBooksToExcel = async (): Promise<ExcelJS.Buffer> => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, title, isbn, author, publisher, category, location,
              published_year, status, active_status, created_at
       FROM books WHERE active_status = 'Y'
       ORDER BY id ASC`
    )
    .all() as BookRow[];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Seat Genie";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Books");
  sheet.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "ISBN", key: "isbn", width: 20 },
    { header: "Title", key: "title", width: 30 },
    { header: "Author", key: "author", width: 20 },
    { header: "Publisher", key: "publisher", width: 20 },
    { header: "Category", key: "category", width: 15 },
    { header: "Location", key: "location", width: 15 },
    { header: "Published Year", key: "published_year", width: 15 },
    { header: "Status", key: "status", width: 12 },
    { header: "Created At", key: "created_at", width: 22 },
  ];

  styleHeaderRow(sheet);

  for (const row of rows) {
    sheet.addRow({
      id: row.id,
      isbn: row.isbn,
      title: row.title,
      author: row.author,
      publisher: row.publisher,
      category: row.category,
      location: row.location,
      published_year: row.published_year,
      status: row.status,
      created_at: row.created_at,
    });
  }

  return workbook.xlsx.writeBuffer();
};

const exportUsersToExcel = async (): Promise<ExcelJS.Buffer> => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, username, name, role, email, phone, student_id, active_status, created_at
       FROM users WHERE active_status = 'Y'
       ORDER BY id ASC`
    )
    .all() as UserRow[];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Seat Genie";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Users");
  sheet.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "Username", key: "username", width: 18 },
    { header: "Name", key: "name", width: 18 },
    { header: "Role", key: "role", width: 12 },
    { header: "Email", key: "email", width: 25 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Student ID", key: "student_id", width: 15 },
    { header: "Created At", key: "created_at", width: 22 },
  ];

  styleHeaderRow(sheet);

  for (const row of rows) {
    sheet.addRow({
      id: row.id,
      username: row.username,
      name: row.name,
      role: row.role,
      email: row.email,
      phone: row.phone,
      student_id: row.student_id,
      created_at: row.created_at,
    });
  }

  return workbook.xlsx.writeBuffer();
};

const exportReservationsToExcel = async (): Promise<ExcelJS.Buffer> => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT r.id, r.date, r.start_time, r.end_time, r.status, r.created_at,
              u.username AS user_name, s.seat_number, rm.name AS room_name
       FROM reservations r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN seats s ON r.seat_id = s.id
       LEFT JOIN rooms rm ON s.room_id = rm.id
       ORDER BY r.id DESC`
    )
    .all() as (ReservationRow & { user_name: string; seat_number: string; room_name: string })[];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Seat Genie";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Reservations");
  sheet.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "User", key: "user_name", width: 18 },
    { header: "Room", key: "room_name", width: 18 },
    { header: "Seat", key: "seat_number", width: 12 },
    { header: "Date", key: "date", width: 14 },
    { header: "Start Time", key: "start_time", width: 12 },
    { header: "End Time", key: "end_time", width: 12 },
    { header: "Status", key: "status", width: 12 },
    { header: "Created At", key: "created_at", width: 22 },
  ];

  styleHeaderRow(sheet);

  for (const row of rows) {
    sheet.addRow({
      id: row.id,
      user_name: row.user_name,
      room_name: row.room_name,
      seat_number: row.seat_number,
      date: row.date,
      start_time: row.start_time,
      end_time: row.end_time,
      status: row.status,
      created_at: row.created_at,
    });
  }

  return workbook.xlsx.writeBuffer();
};

const exportLoansToExcel = async (): Promise<ExcelJS.Buffer> => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT l.id, l.loaned_at, l.due_at, l.returned_at,
              b.title AS book_title, b.isbn AS book_isbn,
              m.name AS member_name, m.email AS member_email
       FROM loans l
       LEFT JOIN books b ON l.book_id = b.id
       LEFT JOIN members m ON l.member_id = m.id
       ORDER BY l.id DESC`
    )
    .all() as (LoanRow & { book_title: string; book_isbn: string; member_name: string; member_email: string })[];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Seat Genie";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Loans");
  sheet.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "Book Title", key: "book_title", width: 30 },
    { header: "Book ISBN", key: "book_isbn", width: 20 },
    { header: "Member", key: "member_name", width: 18 },
    { header: "Email", key: "member_email", width: 25 },
    { header: "Loaned At", key: "loaned_at", width: 22 },
    { header: "Due At", key: "due_at", width: 22 },
    { header: "Returned At", key: "returned_at", width: 22 },
  ];

  styleHeaderRow(sheet);

  for (const row of rows) {
    sheet.addRow({
      id: row.id,
      book_title: row.book_title,
      book_isbn: row.book_isbn,
      member_name: row.member_name,
      member_email: row.member_email,
      loaned_at: row.loaned_at,
      due_at: row.due_at,
      returned_at: row.returned_at,
    });
  }

  return workbook.xlsx.writeBuffer();
};

interface ImportBookRow {
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  category?: string;
  location?: string;
  publishedYear?: number;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const importBooksFromExcel = async (buffer: Buffer): Promise<ImportResult> => {
  const db = getDb();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.getWorksheet(1);
  if (!sheet) {
    return { success: 0, failed: 0, errors: ["No worksheet found in file"] };
  }

  const headerRow = sheet.getRow(1);
  const headers: Record<string, number> = {};
  headerRow.eachCell((cell, colNumber) => {
    const val = String(cell.value || "").toLowerCase().trim();
    headers[val] = colNumber;
  });

  const requiredHeaders = ["isbn", "title", "author"];
  const missing = requiredHeaders.filter((h) => !(h in headers));
  if (missing.length > 0) {
    return { success: 0, failed: 0, errors: [`Missing required columns: ${missing.join(", ")}`] };
  }

  const now = new Date().toISOString();
  const insertStmt = db.prepare(
    `INSERT INTO books (title, isbn, author, publisher, category, location,
                        published_year, status, active_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'available', 'Y', ?)`
  );

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  const getCellStr = (row: ExcelJS.Row, col: number | undefined): string =>
    col ? String(row.getCell(col).value || "").trim() : "";

  const getCellNum = (row: ExcelJS.Row, col: number | undefined): number | null => {
    if (!col) return null;
    const val = row.getCell(col).value;
    if (val === null || val === undefined || val === "") return null;
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
  };

  for (let i = 2; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    const bookData: ImportBookRow = {
      isbn: getCellStr(row, headers["isbn"]),
      title: getCellStr(row, headers["title"]),
      author: getCellStr(row, headers["author"]),
      publisher: getCellStr(row, headers["publisher"]) || undefined,
      category: getCellStr(row, headers["category"]) || undefined,
      location: getCellStr(row, headers["location"]) || undefined,
      publishedYear: getCellNum(row, headers["published year"]) ?? undefined,
    };

    if (!bookData.isbn || !bookData.title || !bookData.author) {
      if (bookData.isbn || bookData.title || bookData.author) {
        errors.push(`Row ${i}: missing required fields (isbn, title, author)`);
        failed++;
      }
      continue;
    }

    try {
      insertStmt.run(
        bookData.title,
        bookData.isbn,
        bookData.author,
        bookData.publisher || null,
        bookData.category || null,
        bookData.location || null,
        bookData.publishedYear ?? null,
        now
      );
      success++;
    } catch (err) {
      errors.push(`Row ${i}: ${(err as Error).message}`);
      failed++;
    }
  }

  return { success, failed, errors };
};

const styleHeaderRow = (sheet: ExcelJS.Worksheet): void => {
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" },
  };
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
};

export {
  exportBooksToExcel,
  exportUsersToExcel,
  exportReservationsToExcel,
  exportLoansToExcel,
  importBooksFromExcel,
};
