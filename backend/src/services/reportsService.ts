import { getDb } from "../db";
import { NotFoundError } from "../utils/errors";

interface OverdueLoan {
  id: number;
  book_id: number;
  member_id: number;
  loaned_at: string;
  due_at: string;
  returned_at: string | null;
  book_title: string;
  book_isbn: string;
  member_name: string;
  member_email: string;
  days_overdue: number;
}

interface ActiveMember {
  id: number;
  name: string;
  email: string;
  loan_count: number;
  last_loaned_at: string;
}

interface BorrowedBook {
  id: number;
  title: string;
  isbn: string;
  author_name: string | null;
  loan_count: number;
  last_loaned_at: string;
}

interface InventoryHealth {
  asOf: string;
  totalBooks: number;
  statusCounts: {
    available: number;
    borrowed: number;
    maintenance: number;
    lost: number;
  };
  overdue: {
    loans: number;
    books: number;
  };
}

interface InventoryHealthRow {
  total_books: number;
  available_count: number;
  borrowed_count: number;
  maintenance_count: number;
  lost_count: number;
  overdue_loans: number;
  overdue_books: number;
}

interface MemberLoanHistoryLoan {
  id: number;
  book_id: number;
  loaned_at: string;
  due_at: string;
  returned_at: string | null;
  book_title: string;
  book_isbn: string;
  author_name: string | null;
}

interface MemberSummary {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface BookSummary {
  id: number;
  title: string;
  isbn: string;
  status: string;
  published_year: number | null;
  author_id: number | null;
  author_name: string | null;
}

interface BookLoanHistoryLoan {
  id: number;
  member_id: number;
  loaned_at: string;
  due_at: string;
  returned_at: string | null;
  member_name: string;
  member_email: string;
}

const listOverdueLoans = (asOf?: string): OverdueLoan[] => {
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
    .all(effectiveAsOf, effectiveAsOf) as OverdueLoan[];
};

const listMostActiveMembers = ({ limit, since, status }: {
  limit: number;
  since?: string;
  status?: string;
}): ActiveMember[] => {
  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (since) {
    conditions.push("l.loaned_at >= ?");
    params.push(since);
  }
  if (status === "open") {
    conditions.push("l.returned_at IS NULL");
  } else if (status === "returned") {
    conditions.push("l.returned_at IS NOT NULL");
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
    .all(...params, limit) as ActiveMember[];
};

const listMostBorrowedBooks = ({ limit, since, status }: {
  limit: number;
  since?: string;
  status?: string;
}): BorrowedBook[] => {
  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (since) {
    conditions.push("l.loaned_at >= ?");
    params.push(since);
  }
  if (status === "open") {
    conditions.push("l.returned_at IS NULL");
  } else if (status === "returned") {
    conditions.push("l.returned_at IS NOT NULL");
  }
  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return db
    .prepare(
      `SELECT b.id, b.title, b.isbn,
              a.name AS author_name,
              COUNT(l.id) AS loan_count,
              MAX(l.loaned_at) AS last_loaned_at
       FROM loans l
       JOIN books b ON b.id = l.book_id
       LEFT JOIN authors a ON a.id = b.author_id
       ${whereClause}
       GROUP BY b.id, b.title, b.isbn, a.name
       ORDER BY loan_count DESC, last_loaned_at DESC
       LIMIT ?`
    )
    .all(...params, limit) as BorrowedBook[];
};

const getInventoryHealth = (asOf?: string): InventoryHealth => {
  const db = getDb();
  const effectiveAsOf = asOf ?? new Date().toISOString();
  const row = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM books) AS total_books,
         (SELECT COUNT(*) FROM books WHERE status = 'available') AS available_count,
         (SELECT COUNT(*) FROM books WHERE status IN ('borrowed', 'checked_out')) AS borrowed_count,
         (SELECT COUNT(*) FROM books WHERE status = 'maintenance') AS maintenance_count,
         (SELECT COUNT(*) FROM books WHERE status = 'lost') AS lost_count,
         (SELECT COUNT(*) FROM loans WHERE returned_at IS NULL AND due_at < ?) AS overdue_loans,
         (SELECT COUNT(DISTINCT book_id) FROM loans WHERE returned_at IS NULL AND due_at < ?) AS overdue_books`
    )
    .get(effectiveAsOf, effectiveAsOf) as InventoryHealthRow;

  return {
    asOf: effectiveAsOf,
    totalBooks: row.total_books,
    statusCounts: {
      available: row.available_count,
      borrowed: row.borrowed_count,
      maintenance: row.maintenance_count,
      lost: row.lost_count,
    },
    overdue: {
      loans: row.overdue_loans,
      books: row.overdue_books,
    },
  };
};

const getMemberLoanHistory = ({
  memberId,
  since,
  until,
  limit,
  offset,
  status,
}: {
  memberId: number;
  since?: string;
  until?: string;
  limit: number;
  offset: number;
  status?: string;
}): { member: MemberSummary; loans: MemberLoanHistoryLoan[]; total: number } => {
  const db = getDb();
  const member = db
    .prepare("SELECT id, name, email, created_at FROM members WHERE id = ?")
    .get(memberId) as MemberSummary | undefined;
  if (!member) {
    throw new NotFoundError("Member not found");
  }

  const conditions: string[] = ["l.member_id = ?"];
  const params: unknown[] = [memberId];
  if (since) {
    conditions.push("l.loaned_at >= ?");
    params.push(since);
  }
  if (until) {
    conditions.push("l.loaned_at <= ?");
    params.push(until);
  }
  if (status === "open") {
    conditions.push("l.returned_at IS NULL");
  } else if (status === "returned") {
    conditions.push("l.returned_at IS NOT NULL");
  }
  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const loans = db
    .prepare(
      `SELECT l.id, l.book_id, l.loaned_at, l.due_at, l.returned_at,
              b.title AS book_title, b.isbn AS book_isbn,
              a.name AS author_name
       FROM loans l
       JOIN books b ON b.id = l.book_id
       LEFT JOIN authors a ON a.id = b.author_id
       ${whereClause}
       ORDER BY l.loaned_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as MemberLoanHistoryLoan[];

  const total = (db
    .prepare(`SELECT COUNT(*) AS total FROM loans l ${whereClause}`)
    .get(...params) as { total: number }).total;

  return { member, loans, total };
};

const getBookLoanHistory = ({
  bookId,
  since,
  until,
  limit,
  offset,
  status,
}: {
  bookId: number;
  since?: string;
  until?: string;
  limit: number;
  offset: number;
  status?: string;
}): { book: BookSummary; loans: BookLoanHistoryLoan[]; total: number } => {
  const db = getDb();
  const book = db
    .prepare(
      `SELECT b.id, b.title, b.isbn, b.status, b.published_year, b.author_id,
              a.name AS author_name
       FROM books b
       LEFT JOIN authors a ON a.id = b.author_id
       WHERE b.id = ?`
    )
    .get(bookId) as BookSummary | undefined;
  if (!book) {
    throw new NotFoundError("Book not found");
  }

  const conditions: string[] = ["l.book_id = ?"];
  const params: unknown[] = [bookId];
  if (since) {
    conditions.push("l.loaned_at >= ?");
    params.push(since);
  }
  if (until) {
    conditions.push("l.loaned_at <= ?");
    params.push(until);
  }
  if (status === "open") {
    conditions.push("l.returned_at IS NULL");
  } else if (status === "returned") {
    conditions.push("l.returned_at IS NOT NULL");
  }
  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const loans = db
    .prepare(
      `SELECT l.id, l.member_id, l.loaned_at, l.due_at, l.returned_at,
              m.name AS member_name, m.email AS member_email
       FROM loans l
       JOIN members m ON m.id = l.member_id
       ${whereClause}
       ORDER BY l.loaned_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as BookLoanHistoryLoan[];

  const total = (db
    .prepare(`SELECT COUNT(*) AS total FROM loans l ${whereClause}`)
    .get(...params) as { total: number }).total;

  return { book, loans, total };
};

export {
  listOverdueLoans,
  listMostActiveMembers,
  listMostBorrowedBooks,
  getInventoryHealth,
  getMemberLoanHistory,
  getBookLoanHistory,
};
