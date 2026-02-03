const { getDb } = require("../db");

const listLoans = () => {
  const db = getDb();
  return db
    .prepare(
      `SELECT l.id, l.book_id, l.member_id, l.loaned_at, l.due_at, l.returned_at,
              b.title AS book_title, b.isbn AS book_isbn,
              m.name AS member_name, m.email AS member_email
       FROM loans l
       JOIN books b ON b.id = l.book_id
       JOIN members m ON m.id = l.member_id
       ORDER BY l.id DESC`
    )
    .all();
};

const getLoan = (id) => {
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
    .get(id);
  return row || null;
};

const createLoan = ({ bookId, memberId, dueAt }) => {
  const db = getDb();
  const insertLoan = db.transaction(() => {
    const book = db
      .prepare(`SELECT id, status FROM books WHERE id = ?`)
      .get(bookId);
    if (!book) {
      return { error: "book_not_found" };
    }
    if (book.status !== "available") {
      return { error: "book_unavailable" };
    }
    const member = db
      .prepare(`SELECT id FROM members WHERE id = ?`)
      .get(memberId);
    if (!member) {
      return { error: "member_not_found" };
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
    return { loanId: result.lastInsertRowid };
  });

  const outcome = insertLoan();
  if (outcome.error) {
    return outcome;
  }
  return { data: getLoan(outcome.loanId) };
};

const updateLoan = (id, { dueAt, returnedAt }) => {
  const db = getDb();
  const updateTxn = db.transaction(() => {
    const existing = db
      .prepare(`SELECT id, book_id, returned_at FROM loans WHERE id = ?`)
      .get(id);
    if (!existing) {
      return { error: "loan_not_found" };
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

    return { data: getLoan(id) };
  });

  return updateTxn();
};

const deleteLoan = (id) => {
  const db = getDb();
  const deleteTxn = db.transaction(() => {
    const existing = db
      .prepare(`SELECT id, book_id, returned_at FROM loans WHERE id = ?`)
      .get(id);
    if (!existing) {
      return { deleted: false };
    }
    if (!existing.returned_at) {
      db.prepare(`UPDATE books SET status = 'available' WHERE id = ?`).run(
        existing.book_id
      );
    }
    const result = db.prepare(`DELETE FROM loans WHERE id = ?`).run(id);
    return { deleted: result.changes > 0 };
  });

  return deleteTxn();
};

module.exports = {
  listLoans,
  getLoan,
  createLoan,
  updateLoan,
  deleteLoan,
};
