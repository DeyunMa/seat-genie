import { getDb } from "../db";
import { NotFoundError, ConflictError } from "../utils/errors";
import type { Loan, CreateLoan, UpdateLoan } from "../types";

const listLoans = ({ limit, offset, status }: {
  limit: number;
  offset: number;
  status?: string;
}): Loan[] => {
  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (status === "open") {
    conditions.push("l.returned_at IS NULL");
  } else if (status === "returned") {
    conditions.push("l.returned_at IS NOT NULL");
  }
  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return db
    .prepare(
      `SELECT l.id, l.book_id, l.member_id, l.loaned_at, l.due_at, l.returned_at,
              b.title AS book_title, b.isbn AS book_isbn,
              m.name AS member_name, m.email AS member_email
       FROM loans l
       JOIN books b ON b.id = l.book_id
       JOIN members m ON m.id = l.member_id
       ${whereClause}
       ORDER BY l.id DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as Loan[];
};

const countLoans = (status?: string): number => {
  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (status === "open") {
    conditions.push("returned_at IS NULL");
  } else if (status === "returned") {
    conditions.push("returned_at IS NOT NULL");
  }
  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const row = db
    .prepare(`SELECT COUNT(1) AS total FROM loans ${whereClause}`)
    .get(...params) as { total: number } | undefined;
  return row?.total ?? 0;
};

const getLoan = (id: number): Loan | null => {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT l.id, l.book_id, l.member_id, l.loaned_at, l.due_at, l.returned_at,
              b.title AS book_title, b.isbn AS book_isbn,
              m.name AS member_name, m.email AS member_email
       FROM loans l
       JOIN books b ON b.id = l.book_id
       JOIN members m ON m.id = l.member_id
       WHERE l.id = ?`
    )
    .get(id) as Loan | undefined;
  return row || null;
};

const createLoan = ({ bookId, memberId, dueAt }: CreateLoan): Loan | null => {
  const db = getDb();
  const insertLoan = db.transaction(() => {
    const book = db
      .prepare(`SELECT id, status FROM books WHERE id = ?`)
      .get(bookId) as { id: number; status: string } | undefined;
    if (!book) {
      throw new NotFoundError("Book not found");
    }
    if (book.status !== "available") {
      throw new ConflictError("Book not available");
    }
    const member = db
      .prepare(`SELECT id FROM members WHERE id = ?`)
      .get(memberId) as { id: number } | undefined;
    if (!member) {
      throw new NotFoundError("Member not found");
    }
    const result = db
      .prepare(
        `INSERT INTO loans (book_id, member_id, due_at)
         VALUES (?, ?, ?)`
      )
      .run(bookId, memberId, dueAt);
    db.prepare(`UPDATE books SET status = 'checked_out' WHERE id = ?`).run(
      bookId
    );
    return result.lastInsertRowid as number;
  });

  const loanId = insertLoan();
  return getLoan(loanId);
};

const updateLoan = (id: number, { dueAt, returnedAt }: UpdateLoan): Loan | null => {
  const db = getDb();
  const updateTxn = db.transaction(() => {
    const existing = db
      .prepare(`SELECT id, book_id, returned_at FROM loans WHERE id = ?`)
      .get(id) as { id: number; book_id: number; returned_at: string | null } | undefined;
    if (!existing) {
      throw new NotFoundError("Loan not found");
    }
    const nextDueAt = dueAt ?? null;
    const nextReturnedAt = returnedAt ?? existing.returned_at;
    db.prepare(
      `UPDATE loans
       SET due_at = COALESCE(?, due_at),
           returned_at = ?
       WHERE id = ?`
    ).run(nextDueAt, nextReturnedAt, id);

    if (!existing.returned_at && nextReturnedAt) {
      db.prepare(`UPDATE books SET status = 'available' WHERE id = ?`).run(
        existing.book_id
      );
    }

    return getLoan(id);
  });

  return updateTxn();
};

const deleteLoan = (id: number): void => {
  const db = getDb();
  const deleteTxn = db.transaction(() => {
    const existing = db
      .prepare(`SELECT id, book_id, returned_at FROM loans WHERE id = ?`)
      .get(id) as { id: number; book_id: number; returned_at: string | null } | undefined;
    if (!existing) {
      throw new NotFoundError("Loan not found");
    }
    if (!existing.returned_at) {
      db.prepare(`UPDATE books SET status = 'available' WHERE id = ?`).run(
        existing.book_id
      );
    }
    db.prepare(`DELETE FROM loans WHERE id = ?`).run(id);
  });

  deleteTxn();
};

export {
  listLoans,
  countLoans,
  getLoan,
  createLoan,
  updateLoan,
  deleteLoan,
};
