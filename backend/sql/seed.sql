-- Seed data for Seat Genie library management system

-- Users (admin, staff, students)
-- Passwords are bcrypt hashed (rounds=10). Plaintext: admin123, staff123, student123
INSERT INTO users (username, password, name, role, email, phone, student_id, active_status, created_at, updated_at) VALUES
('admin', '$2b$10$ytyBPxaOSnQg1b4tX5XONuPHizHkpd9eVqYW74SIPPz7DSzUbcxRO', '系统管理员', 'admin', 'admin@library.edu', '13800000001', NULL, 'Y', datetime('now'), datetime('now')),
('staff1', '$2b$10$FX0BkVA7UkPtFV9kRSVQ.OHvqsUXXfHDDBsCRHhDGxJj7hFE2KwHO', '张图书管理员', 'staff', 'staff1@library.edu', '13800000002', NULL, 'Y', datetime('now'), datetime('now')),
('student1', '$2b$10$5wL2GO4.WYrgcCUTvE4OK.PLKnRo4fZ1Y0LrsXT1.DnIs26/EAIJm', '李明', 'student', 'liming@student.edu', '13800000003', '2024001001', 'Y', datetime('now'), datetime('now')),
('student2', '$2b$10$5wL2GO4.WYrgcCUTvE4OK.PLKnRo4fZ1Y0LrsXT1.DnIs26/EAIJm', '王芳', 'student', 'wangfang@student.edu', '13800000004', '2024001002', 'Y', datetime('now'), datetime('now')),
('student3', '$2b$10$5wL2GO4.WYrgcCUTvE4OK.PLKnRo4fZ1Y0LrsXT1.DnIs26/EAIJm', '张伟', 'student', 'zhangwei@student.edu', '13800000005', '2024001003', 'Y', datetime('now'), datetime('now'));

-- Study rooms
INSERT INTO rooms (name, floor, capacity, open_time, close_time, active_status, created_at, updated_at) VALUES
('一楼自习室A', 1, 50, '08:00', '22:00', 'Y', datetime('now'), datetime('now')),
('一楼自习室B', 1, 40, '08:00', '22:00', 'Y', datetime('now'), datetime('now')),
('二楼阅览室', 2, 60, '08:00', '21:00', 'Y', datetime('now'), datetime('now')),
('三楼研讨室', 3, 20, '09:00', '20:00', 'Y', datetime('now'), datetime('now'));

-- Seats (will be generated programmatically in init script)
-- Initial sample seats for each room
INSERT INTO seats (room_id, seat_number, status, active_status, created_at, updated_at) VALUES
(1, 'A01', 'available', 'Y', datetime('now'), datetime('now')),
(1, 'A02', 'available', 'Y', datetime('now'), datetime('now')),
(1, 'A03', 'available', 'Y', datetime('now'), datetime('now')),
(1, 'A04', 'occupied', 'Y', datetime('now'), datetime('now')),
(1, 'A05', 'available', 'Y', datetime('now'), datetime('now')),
(2, 'B01', 'available', 'Y', datetime('now'), datetime('now')),
(2, 'B02', 'available', 'Y', datetime('now'), datetime('now')),
(2, 'B03', 'maintenance', 'Y', datetime('now'), datetime('now')),
(2, 'B04', 'available', 'Y', datetime('now'), datetime('now')),
(3, 'C01', 'available', 'Y', datetime('now'), datetime('now')),
(3, 'C02', 'occupied', 'Y', datetime('now'), datetime('now')),
(3, 'C03', 'available', 'Y', datetime('now'), datetime('now')),
(4, 'D01', 'available', 'Y', datetime('now'), datetime('now')),
(4, 'D02', 'available', 'Y', datetime('now'), datetime('now'));

-- Books
INSERT INTO books (title, isbn, author, publisher, category, location, status, active_status, created_at, updated_at) VALUES
('数据结构与算法分析', '978-7-302-52083-3', '马克·艾伦·维斯', '清华大学出版社', '计算机科学', 'A区-01-03', 'available', 'Y', datetime('now'), datetime('now')),
('计算机网络：自顶向下方法', '978-7-111-40701-0', 'James F.Kurose', '机械工业出版社', '计算机科学', 'A区-01-05', 'available', 'Y', datetime('now'), datetime('now')),
('人类简史：从动物到上帝', '978-7-5086-8698-4', '尤瓦尔·赫拉利', '中信出版社', '历史', 'B区-02-01', 'checked_out', 'Y', datetime('now'), datetime('now')),
('百年孤独', '978-7-5447-7380-8', '加西亚·马尔克斯', '南海出版公司', '文学', 'B区-03-02', 'available', 'Y', datetime('now'), datetime('now')),
('三体', '978-7-5327-6781-8', '刘慈欣', '重庆出版社', '科幻', 'C区-01-01', 'available', 'Y', datetime('now'), datetime('now')),
('活着', '978-7-5442-9168-5', '余华', '作家出版社', '文学', 'B区-03-05', 'available', 'Y', datetime('now'), datetime('now')),
('深入理解计算机系统', '978-7-111-61381-8', 'Randal E. Bryant', '机械工业出版社', '计算机科学', 'A区-02-01', 'available', 'Y', datetime('now'), datetime('now')),
('经济学原理', '978-7-208-16113-6', '曼昆', '上海人民出版社', '经济学', 'D区-01-03', 'available', 'Y', datetime('now'), datetime('now'));

-- Notifications
INSERT INTO notifications (title, content, type, created_by, active_status, created_at, updated_at) VALUES
('图书馆系统升级公告', '尊敬的读者，图书馆座位预约系统已于本周完成全面升级，新增了预约提醒、借阅到期通知等功能。如有任何问题，请联系管理员。', 'system', 1, 'Y', datetime('now', '-2 days'), datetime('now', '-2 days')),
('春节放假通知', '图书馆将于1月25日至2月2日期间闭馆，期间暂停座位预约和图书借还服务。请各位读者提前做好安排，祝大家新春快乐！', 'announcement', 1, 'Y', datetime('now', '-5 days'), datetime('now', '-5 days')),
('新书到馆通知', '本月新到图书200余册，涵盖计算机科学、经济管理、文学艺术等多个领域，欢迎各位读者前来借阅！', 'announcement', 2, 'Y', datetime('now', '-1 days'), datetime('now', '-1 days'));

-- Sample reservations
INSERT INTO reservations (user_id, seat_id, date, start_time, end_time, status, created_at, updated_at) VALUES
(3, 4, date('now'), '09:00', '12:00', 'active', datetime('now'), datetime('now')),
(4, 11, date('now'), '14:00', '17:00', 'active', datetime('now'), datetime('now'));

-- Members (linked to users via email for this seed)
INSERT INTO members (name, email, phone, created_at) VALUES
('李明', 'liming@student.edu', '13800000003', datetime('now')),
('王芳', 'wangfang@student.edu', '13800000004', datetime('now')),
('张伟', 'zhangwei@student.edu', '13800000005', datetime('now'));

-- Loans
INSERT INTO loans (book_id, member_id, loaned_at, due_at, returned_at) VALUES
(3, 1, datetime('now', '-5 days'), datetime('now', '+9 days'), NULL),
(1, 2, datetime('now', '-10 days'), datetime('now', '+4 days'), datetime('now', '-2 days'));
