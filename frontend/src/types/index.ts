// API response types matching backend
export interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'staff' | 'student';
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
  status: 'available' | 'occupied' | 'maintenance';
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
  status: 'active' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string | null;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: 'system' | 'announcement';
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
  published_year: number | null;
  status: string;
  activeStatus: string;
  authorId: number | null;
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
  book_title: string;
  book_isbn: string;
  member_name: string;
  member_email: string;
}

export interface Borrowing {
  id: string;
  userId: number | null;
  memberId: number;
  memberName: string;
  memberEmail: string;
  bookId: number;
  bookTitle: string;
  borrowDate: string | null;
  dueDate: string | null;
  returnDate: string | null;
  status: 'borrowed' | 'returned';
  createdAt: string;
  updatedAt: string;
}

export interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}
