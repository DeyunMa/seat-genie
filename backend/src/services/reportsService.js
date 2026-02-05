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

const listMostActiveMembers = ({ limit, since }) => {
  const db = getDb();
  const conditions = [];
  const params = [];
  if (since) {
    conditions.push("l.loaned_at >= ?");
    params.push(since);
  }
  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return db
    .prepare(
      `SELECT m.id, m.name, m.email,
              COUNT(l.id) AS loan_count,
              MAX(l.loaned_at) AS last_loaned_at
       FROM loans l
       JOIN members m ON m.id = l.member_id
       ${whereClause}
       GROUP BY m.id, m.name, m.email
       ORDER BY loan_count DESC, last_loaned_at DESC
       LIMIT ?`
    )
    .all(...params, limit);
};

const getInventoryHealth = (asOf) => {
  const db = getDb();
  const effectiveAsOf = asOf ?? new Date().toISOString();
  const row = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM books) AS total_books,
         (SELECT COUNT(*) FROM books WHERE status = 'available') AS available_count,
         (SELECT COUNT(*) FROM books WHERE status = 'checked_out') AS checked_out_count,
         (SELECT COUNT(*) FROM books WHERE status = 'lost') AS lost_count,
         (SELECT COUNT(*) FROM loans WHERE returned_at IS NULL AND due_at < ?) AS overdue_loans,
         (SELECT COUNT(DISTINCT book_id) FROM loans WHERE returned_at IS NULL AND due_at < ?) AS overdue_books`
    )
    .get(effectiveAsOf, effectiveAsOf);

  return {
    asOf: effectiveAsOf,
    totalBooks: row.total_books,
    statusCounts: {
      available: row.available_count,
      checkedOut: row.checked_out_count,
      lost: row.lost_count,
    },
    overdue: {
      loans: row.overdue_loans,
      books: row.overdue_books,
    },
  };
};

module.exports = {
  listOverdueLoans,
  listMostActiveMembers,
  getInventoryHealth,
};
