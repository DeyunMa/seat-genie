-- Library management schema for the Seat Genie backend.

-- Users of the system (admin, staff, student)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'student')),
  email TEXT UNIQUE,
  phone TEXT,
  student_id TEXT,
  email_notifications TEXT NOT NULL DEFAULT 'N',
  active_status TEXT NOT NULL DEFAULT 'Y',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active_status ON users(active_status);

-- Campuses (multi-campus support)
CREATE TABLE IF NOT EXISTS campuses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  description TEXT,
  active_status TEXT NOT NULL DEFAULT 'Y',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_campuses_name ON campuses(name);
CREATE INDEX IF NOT EXISTS idx_campuses_active_status ON campuses(active_status);

-- Study rooms
CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  floor INTEGER,
  capacity INTEGER NOT NULL DEFAULT 0,
  open_time TEXT,
  close_time TEXT,
  campus_id INTEGER,
  active_status TEXT NOT NULL DEFAULT 'Y',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (campus_id) REFERENCES campuses(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_rooms_name ON rooms(name);
CREATE INDEX IF NOT EXISTS idx_rooms_active_status ON rooms(active_status);
CREATE INDEX IF NOT EXISTS idx_rooms_campus_id ON rooms(campus_id);

-- Seats in study rooms (with grid position for seat map visualization)
CREATE TABLE IF NOT EXISTS seats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  seat_number TEXT NOT NULL,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  active_status TEXT NOT NULL DEFAULT 'Y',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_seats_room_id ON seats(room_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);
CREATE INDEX IF NOT EXISTS idx_seats_active_status ON seats(active_status);

-- Seat reservations
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  seat_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_seat_id ON reservations(seat_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_seat_date ON reservations(seat_id, date);

-- Notifications/Announcements
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'announcement' CHECK (type IN ('system', 'announcement')),
  created_by INTEGER,
  active_status TEXT NOT NULL DEFAULT 'Y',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_active_status ON notifications(active_status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Notification read status
CREATE TABLE IF NOT EXISTS notification_reads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notification_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  read_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(notification_id, user_id),
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notification_reads_notification_id ON notification_reads(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON notification_reads(user_id);

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
