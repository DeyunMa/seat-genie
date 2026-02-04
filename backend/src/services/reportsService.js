const { getDb } = require("../db");

const listOverdueLoans = (asOf) => {
  const db = getDb();
  const effectiveAsOf = asOf ?? new Date().toISOString();
  return db
    .prepare(
      `SELECT l.id, l.book_id, l.member_id, l.loaned_at, l.due_at, l.returned_at,
              b.title AS book_title, b.isbn AS book_isbn,
              m.name AS member_name, m.email AS member_email,
              CAST((julianday(?) - julianday(l.due_at)) AS INTEGER) AS days_overdue
       FROM loans l
       JOIN books b ON b.id = l.book_id
       JOIN members m ON m.id = l.member_id
       WHERE l.returned_at IS NULL
         AND l.due_at < ?
       ORDER BY l.due_at ASC`
    )
    .all(effectiveAsOf, effectiveAsOf);
};

module.exports = {
  listOverdueLoans,
};
