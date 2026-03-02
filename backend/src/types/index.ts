/* ------------------------------------------------------------------ */
/*  Row types – mirror the SQLite column names (snake_case)           */
/* ------------------------------------------------------------------ */

export interface UserRow {
  id: number;
  username: string;
  password: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  student_id: string | null;
  active_status: string;
  created_at: string;
  updated_at: string | null;
}

export interface RoomRow {
  id: number;
  name: string;
  floor: number | null;
  capacity: number;
  open_time: string | null;
  close_time: string | null;
  active_status: string;
  created_at: string;
  updated_at: string | null;
}

export interface SeatRow {
  id: number;
  room_id: number;
  seat_number: string;
  status: string;
  active_status: string;
  created_at: string;
  updated_at: string | null;
}

export interface ReservationRow {
  id: number;
  user_id: number;
  seat_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  updated_at: string | null;
}

export interface NotificationRow {
  id: number;
  title: string;
  content: string;
  type: string;
  created_by: number | null;
  active_status: string;
  created_at: string;
  updated_at: string | null;
}

export interface NotificationReadRow {
  notification_id: number;
  user_id: number;
  read_at: string;
}

export interface AuthorRow {
  id: number;
  name: string;
  bio: string | null;
  created_at: string;
}

export interface BookRow {
  id: number;
  title: string;
  isbn: string;
  author: string;
  publisher: string | null;
  category: string | null;
  location: string | null;
  author_id: number | null;
  published_year: number | null;
  status: string;
  active_status: string;
  created_at: string;
  updated_at: string | null;
}

export interface MemberRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface LoanRow {
  id: number;
  book_id: number;
  member_id: number;
  loaned_at: string;
  due_at: string;
  returned_at: string | null;
}

/* ------------------------------------------------------------------ */
/*  Mapped / API types (camelCase)                                    */
/* ------------------------------------------------------------------ */

export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  studentId: string | null;
  activeStatus: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Room {
  id: number;
  name: string;
  floor: number | null;
  capacity: number;
  openTime: string | null;
  closeTime: string | null;
  activeStatus: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Seat {
  id: number;
  roomId: number;
  seatNumber: string;
  status: string;
  activeStatus: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Reservation {
  id: number;
  userId: number;
  seatId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  createdBy: number | null;
  activeStatus: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Book {
  id: number;
  title: string;
  isbn: string;
  author: string;
  publisher: string | null;
  category: string | null;
  location: string | null;
  authorId: number | null;
  publishedYear: number | null;
  status: string;
  activeStatus: string;
}

export interface Author {
  id: number;
  name: string;
  bio: string | null;
  created_at: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface Loan {
  id: number;
  book_id: number;
  member_id: number;
  loaned_at: string;
  due_at: string;
  returned_at: string | null;
  book_title?: string;
  book_isbn?: string;
  member_name?: string;
  member_email?: string;
}

/* ------------------------------------------------------------------ */
/*  Create / Update payload types                                     */
/* ------------------------------------------------------------------ */

export interface CreateUser {
  username: string;
  password: string;
  name: string;
  role: string;
  email?: string | null;
  phone?: string | null;
  studentId?: string | null;
}

export interface UpdateUser {
  username?: string;
  password?: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  studentId?: string;
  activeStatus?: string;
}

export interface CreateRoom {
  name: string;
  floor?: number | null;
  capacity?: number;
  openTime?: string | null;
  closeTime?: string | null;
}

export interface UpdateRoom {
  name?: string;
  floor?: number;
  capacity?: number;
  openTime?: string;
  closeTime?: string;
  activeStatus?: string;
}

export interface CreateSeat {
  roomId: number;
  seatNumber: string;
  status?: string;
}

export interface UpdateSeat {
  roomId?: number;
  seatNumber?: string;
  status?: string;
  activeStatus?: string;
}

export interface CreateReservation {
  userId: number;
  seatId: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface UpdateReservation {
  userId?: number;
  seatId?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}

export interface CreateNotification {
  title: string;
  content: string;
  type?: string;
  createdBy?: number | null;
}

export interface UpdateNotification {
  title?: string;
  content?: string;
  type?: string;
  activeStatus?: string;
}

export interface CreateBook {
  title: string;
  isbn: string;
  author: string;
  publisher: string;
  category: string;
  location: string;
  authorId?: number | null;
  publishedYear?: number | null;
  status: string;
  activeStatus: string;
}

export interface UpdateBook {
  title: string;
  isbn: string;
  author: string;
  publisher: string;
  category: string;
  location: string;
  authorId?: number | null;
  publishedYear?: number | null;
  status: string;
  activeStatus: string;
}

export interface CreateAuthor {
  name: string;
  bio?: string | null;
}

export interface UpdateAuthor {
  name: string;
  bio?: string | null;
}

export interface CreateMember {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateMember {
  name: string;
  email: string;
  phone: string;
}

export interface CreateLoan {
  bookId: number;
  memberId: number;
  dueAt: string;
}

export interface UpdateLoan {
  dueAt?: string | null;
  returnedAt?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Pagination helpers                                                */
/* ------------------------------------------------------------------ */

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface ListResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ListQuery {
  limit: number;
  offset: number;
  sortBy?: string;
  sortOrder?: string;
  [key: string]: unknown;
}

// ─── Config ──────────────────────────────────────────────────────────────────

export interface AppConfig {
  port: number;
  logLevel: string;
  databaseFile: string;
  jwtSecret: string;
  isProduction: boolean;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "staff" | "student";
export type ActiveStatus = "Y" | "N";
export type SeatStatus = "available" | "occupied" | "maintenance";
export type ReservationStatus = "active" | "cancelled" | "completed";
export type NotificationType = "system" | "announcement";

export interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─── Error ───────────────────────────────────────────────────────────────────

export interface ErrorPayload {
  error: string;
  code?: string;
  details?: unknown;
}
