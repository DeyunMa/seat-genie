# Seat Genie

Seat Genie 是一个面向图书馆/自习室场景的综合管理系统，支持"座位预约 + 图书借阅 + 通知公告 + 统计分析"的一体化管理流程。项目采用前后端分离架构，所有数据通过后端 API 持久化到 SQLite 数据库，适合用于快速原型、课程作业、内部演示或二次开发。

---

## 特性概览

| 模块 | 功能 | 数据存储 |
|------|------|----------|
| 多角色权限 | 管理员、馆员、学生三级权限控制 | SQLite |
| 座位预约 | 按时间段预约、冲突检测、取消预约 | SQLite |
| 自习室管理 | 维护自习室信息、开放时间、容量、座位状态 | SQLite |
| 图书管理 | 图书录入、作者管理、分类、馆藏位置 | SQLite |
| 借还管理 | 借阅/归还记录、到期检测、逾期提醒 | SQLite |
| 统计看板 | 座位利用率、借阅趋势、热门图书等可视化 | SQLite |
| 通知公告 | 公告发布与已读状态统计 | SQLite |

---

## 技术栈

### 前端
- **React 19** - UI 组件
- **React Router 7** - 路由管理
- **Vite 7** - 构建与开发服务器
- **Zustand 5** - 全局状态管理
- **Recharts** - 统计图表
- **uuid** - 数据主键生成

### 后端
- **Express.js** - Web 框架
- **better-sqlite3** - SQLite 数据库
- **zod** - 数据校验
- **cors / helmet / pino** - 安全与日志

### 工程化
- **ESLint** - 代码规范
- **Jest + Supertest** - 后端测试

---

## 快速开始

### 1. 克隆与安装

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend && npm install && cd ..
```

### 2. 初始化数据库

```bash
# 创建数据目录并初始化 SQLite 数据库
mkdir -p backend/data
sqlite3 backend/data/library.db < backend/sql/schema.sql
```

### 3. 配置环境变量

**后端**（`backend/.env`）：
```env
PORT=3001
DATABASE_FILE=backend/data/library.db
LOG_LEVEL=info
```

**前端**（项目根目录 `.env`）：
```env
VITE_API_BASE_URL=http://localhost:3001
```

### 4. 启动服务

```bash
# 终端 1：启动后端
cd backend
npm run dev

# 终端 2：启动前端（在项目根目录）
npm run dev
```

前端默认运行在 `http://localhost:5173`，后端 API 在 `http://localhost:3001`。

---

## 演示账号

项目首次启动后，需要手动创建演示用户。使用以下 SQL 插入演示数据：

```sql
INSERT INTO users (username, password, name, role, email, phone, active_status) VALUES
('admin', 'admin123', '系统管理员', 'admin', 'admin@library.edu', '13800000001', 'Y'),
('staff1', 'staff123', '张图书管理员', 'staff', 'staff1@library.edu', '13800000002', 'Y'),
('student1', 'student123', '李明', 'student', 'liming@student.edu', '13800000003', 'Y'),
('student2', 'student123', '王芳', 'student', 'wangfang@student.edu', '13800000004', 'Y'),
('student3', 'student123', '张伟', 'student', 'zhangwei@student.edu', '13800000005', 'Y');
```

或使用管理员账号登录后，在"用户管理"页面创建用户。

---

## 项目结构

```
seat-genie/
├── src/                          # 前端源代码
│   ├── components/               # 公共组件
│   │   ├── common/               # 通用组件（Modal、Toast）
│   │   └── layout/               # 布局组件（Header、Sidebar、MainLayout）
│   ├── pages/                    # 业务页面
│   │   ├── BookManagement/       # 图书管理、借还管理
│   │   ├── Dashboard/            # 首页仪表盘
│   │   ├── Login/                # 登录页
│   │   ├── Notification/         # 通知公告
│   │   ├── Reservation/          # 座位预约
│   │   ├── SeatManagement/       # 自习室/座位管理
│   │   ├── Settings/             # 设置（修改密码）
│   │   ├── Statistics/           # 统计看板
│   │   └── UserManagement/       # 用户管理
│   ├── services/                 # 数据服务层
│   │   ├── apiClient.js          # API 客户端
│   │   ├── booksApi.js           # 图书 API
│   │   ├── loansApi.js           # 借阅 API
│   │   ├── membersApi.js         # 会员 API
│   │   ├── usersApi.js           # 用户 API
│   │   ├── roomsApi.js           # 房间 API
│   │   ├── seatsApi.js           # 座位 API
│   │   ├── reservationsApi.js    # 预约 API
│   │   ├── notificationsApi.js   # 通知 API
│   │   └── storage.js            # 存储工具
│   ├── stores/                   # Zustand 状态管理
│   │   ├── authStore.js          # 认证状态
│   │   └── dataStore.js          # 业务数据状态
│   ├── App.jsx                   # 路由与权限入口
│   └── main.jsx                  # 应用启动
├── backend/                      # 后端服务
│   ├── src/
│   │   ├── config/               # 环境配置
│   │   ├── db/                   # 数据库连接
│   │   ├── middleware/           # 中间件（错误处理、校验）
│   │   ├── routes/               # API 路由
│   │   │   ├── users.js          # 用户管理
│   │   │   ├── rooms.js          # 房间管理
│   │   │   ├── seats.js          # 座位管理
│   │   │   ├── reservations.js   # 预约管理
│   │   │   ├── notifications.js  # 通知管理
│   │   │   ├── authors.js        # 作者管理
│   │   │   ├── books.js          # 图书管理
│   │   │   ├── health.js         # 健康检查
│   │   │   ├── loans.js          # 借还管理
│   │   │   ├── members.js        # 会员管理
│   │   │   └── reports.js        # 统计报表
│   │   ├── services/             # 业务逻辑层
│   │   ├── utils/                # 工具函数
│   │   ├── app.js                # Express 应用
│   │   └── index.js              # 服务入口
│   ├── sql/
│   │   └── schema.sql            # 数据库表结构
│   └── tests/                    # 集成测试
├── public/                       # 静态资源
├── index.html
├── vite.config.js
└── package.json
```

---

## API 接口

后端提供完整的 RESTful API。

### 核心端点

| 资源 | 端点 | 说明 |
|------|------|------|
| 健康检查 | `GET /health` | 服务状态 |
| 用户 | `GET/POST /api/users` | 用户列表/创建 |
| 用户 | `GET/PUT/DELETE /api/users/:id` | 用户详情/更新/删除 |
| 房间 | `GET/POST /api/rooms` | 房间列表/创建 |
| 房间 | `GET/PUT/DELETE /api/rooms/:id` | 房间详情/更新/删除 |
| 座位 | `GET/POST /api/seats` | 座位列表/创建 |
| 座位 | `GET/PUT/DELETE /api/seats/:id` | 座位详情/更新/删除 |
| 预约 | `GET/POST /api/reservations` | 预约列表/创建 |
| 预约 | `GET/PUT/DELETE /api/reservations/:id` | 预约详情/更新/删除 |
| 预约 | `POST /api/reservations/:id/cancel` | 取消预约 |
| 通知 | `GET/POST /api/notifications` | 通知列表/创建 |
| 通知 | `GET/PUT/DELETE /api/notifications/:id` | 通知详情/更新/删除 |
| 通知 | `POST /api/notifications/:id/read` | 标记已读 |
| 图书 | `GET/POST /api/books` | 图书列表/创建 |
| 图书 | `GET/PUT/DELETE /api/books/:id` | 图书详情/更新/删除 |
| 作者 | `GET/POST /api/authors` | 作者列表/创建 |
| 作者 | `GET/PUT/DELETE /api/authors/:id` | 作者详情/更新/删除 |
| 会员 | `GET/POST /api/members` | 会员列表/创建 |
| 会员 | `GET/PUT/DELETE /api/members/:id` | 会员详情/更新/删除 |
| 借阅 | `GET/POST /api/loans` | 借阅列表/创建 |
| 借阅 | `GET/PUT/DELETE /api/loans/:id` | 借阅详情/更新/删除 |
| 报表 | `GET /api/reports/overdue-loans` | 逾期借阅 |
| 报表 | `GET /api/reports/most-active-members` | 活跃会员 |
| 报表 | `GET /api/reports/most-borrowed-books` | 热门图书 |
| 报表 | `GET /api/reports/inventory-health` | 库存健康度 |

### 通用查询参数

列表接口支持分页、过滤和排序：

- `limit` / `offset` - 分页（默认 25，最大 100）
- `sortBy` / `sortOrder` - 排序（`asc`/`desc`）
- `q` - 关键词搜索

示例：
```
GET /api/books?status=available&category=计算机科学&sortBy=title&sortOrder=asc&limit=10
```

---

## 权限矩阵

| 功能 | 管理员 | 馆员 | 学生 |
|------|--------|------|------|
| 用户管理 | ✅ | ❌ | ❌ |
| 自习室/座位管理 | ✅ | ✅ | ❌ |
| 图书管理 | ✅ | ✅ | ❌ |
| 借还登记 | ✅ | ✅ | ❌ |
| 座位预约 | ❌ | ❌ | ✅ |
| 我的预约/借阅 | ✅ | ✅ | ✅ |
| 统计看板 | ✅ | ✅ | ❌ |
| 公告查看 | ✅ | ✅ | ✅ |
| 修改密码 | ✅ | ✅ | ✅ |

---

## 测试

### 后端测试

```bash
cd backend
npm test
```

包含：
- 列表查询中间件测试
- 报表端点测试
- CRUD 错误场景测试

---

## 数据重置

如需重置所有数据：

```bash
# 删除 SQLite 数据库
rm backend/data/library.db

# 重新初始化数据库
sqlite3 backend/data/library.db < backend/sql/schema.sql

# 重新插入演示数据（可选）
```

---

## 常见问题

**Q: 如何创建第一个管理员账号？**  
A: 首次启动时需要手动插入管理员数据到数据库，或使用 SQLite 工具直接添加。

**Q: 数据安全吗？**  
A: 所有数据保存在本地 SQLite 文件中。本项目仅供演示和学习使用，不适用于生产环境。

**Q: 支持多用户并发吗？**  
A: SQLite 支持并发读取，但写入是串行的。对于开发和演示场景足够使用。

---

## 二次开发建议

1. **认证升级**：接入 JWT/Session 认证替代前端模拟登录
2. **座位可视化**：支持座位地图可视化选座
3. **审批流程**：学生预约需管理员审核
4. **消息推送**：接入邮件/短信通知
5. **多校区支持**：支持多馆区、多校区管理
6. **数据库升级**：将 SQLite 升级为 PostgreSQL/MySQL 以支持更高并发

---

## License

本项目仅用于学习与演示用途，如需商用请自行完善与审查相关合规要求。
