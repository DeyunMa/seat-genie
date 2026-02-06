-- Library management schema for the Seat Genie backend.

-- Authors of books in the catalog.
CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  bio TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);

-- Books available in the library catalog. Includes UI-friendly metadata for the frontend.
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  isbn TEXT NOT NULL UNIQUE,
  author TEXT NOT NULL,
  publisher TEXT,
  category TEXT,
  location TEXT,
  author_id INTEGER,
  published_year INTEGER,
  status TEXT NOT NULL DEFAULT 'available',
  active_status TEXT NOT NULL DEFAULT 'Y',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_active_status ON books(active_status);
CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);

-- Library members who can borrow books.
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);

-- Loan records for books checked out by members.
CREATE TABLE IF NOT EXISTS loans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  loaned_at TEXT NOT NULL DEFAULT (datetime('now')),
  due_at TEXT NOT NULL,
  returned_at TEXT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_loans_book ON loans(book_id);
CREATE INDEX IF NOT EXISTS idx_loans_member ON loans(member_id);
-- Supports overdue and inventory health reporting.
CREATE INDEX IF NOT EXISTS idx_loans_due_at ON loans(due_at);
-- Supports most-active members and most-borrowed books reporting.
CREATE INDEX IF NOT EXISTS idx_loans_loaned_at ON loans(loaned_at);
CREATE INDEX IF NOT EXISTS idx_loans_member_loaned_at ON loans(member_id, loaned_at);
CREATE INDEX IF NOT EXISTS idx_loans_book_loaned_at ON loans(book_id, loaned_at);
-- Supports history/report filters on returned loans.
CREATE INDEX IF NOT EXISTS idx_loans_returned_at ON loans(returned_at);
