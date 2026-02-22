# Seat Genie

Seat Genie 是一个完整的图书馆/自习室综合管理系统，采用前后端分离架构，支持"座位预约 + 图书借阅 + 用户管理 + 通知公告 + 统计分析"的一体化管理流程。

---

## ✅ 项目状态：已完成

这是一个**完整可用的前后端分离项目**，所有功能均已实现并通过 API 连接后端数据库。

### 已完成功能

| 模块 | 功能 | 状态 |
|------|------|------|
| 用户管理 | 管理员/馆员/学生三角色，增删改查、密码管理 | ✅ |
| 自习室管理 | 房间信息管理、容量设置、开放时间 | ✅ |
| 座位管理 | 座位分配、状态管理（可用/占用/维护）| ✅ |
| 座位预约 | 按时段预约、实时冲突检测、取消预约 | ✅ |
| 图书管理 | 图书录入、分类、状态管理 | ✅ |
| 借还管理 | 借阅登记、归还处理、逾期检测 | ✅ |
| 统计看板 | 资源利用率、趋势图表、数据可视化 | ✅ |
| 通知公告 | 公告发布、已读状态追踪 | ✅ |

---

## 🚀 快速开始

### 方式一：完整启动（推荐）

```bash
# 1. 安装依赖
npm install
cd backend && npm install && cd ..

# 2. 初始化数据库（如尚未创建）
mkdir -p backend/data
sqlite3 backend/data/library.db < backend/sql/schema.sql

# 3. 创建管理员账号（如尚未创建）
sqlite3 backend/data/library.db "INSERT INTO users (username, password, name, role, email, active_status) VALUES ('admin', 'admin123', '系统管理员', 'admin', 'admin@library.edu', 'Y');"

# 4. 启动后端（终端1）
cd backend
npm run dev

# 5. 启动前端（终端2，在项目根目录）
npm run dev

# 6. 访问系统
# 打开 http://localhost:5173
# 使用 admin/admin123 登录
```

### 方式二：使用演示数据

```bash
# 导入完整演示数据（包含用户、自习室、座位、图书）
sqlite3 backend/data/library.db < backend/sql/demo_data.sql
```

---

## 🔑 演示账号

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 管理员 | `admin` | `admin123` | 全部功能 |
| 馆员 | `staff1` | `staff123` | 图书/座位管理 |
| 学生 | `student1` | `student123` | 预约/借阅/查看 |

---

## 🏗️ 技术架构

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI框架 |
| React Router | 7 | 路由管理 |
| Vite | 7 | 构建工具 |
| Zustand | 5 | 状态管理 |
| Recharts | - | 数据可视化 |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Express.js | 4.x | Web框架 |
| better-sqlite3 | 9.x | 数据库驱动 |
| Zod | 3.x | 数据校验 |
| CORS/Helmet/Pino | - | 安全/日志 |

### 数据库
- **类型**: SQLite 3
- **文件**: `backend/data/library.db`
- **特点**: 零配置、单文件、便携

---

## 📁 项目结构

```
seat-genie/
├── src/                          # 前端源代码
│   ├── components/               # 公共组件
│   │   ├── common/               # Modal、Toast
│   │   └── layout/               # Header、Sidebar、MainLayout
│   ├── pages/                    # 业务页面
│   │   ├── BookManagement/       # 图书管理、借还管理
│   │   ├── Dashboard/            # 统计看板
│   │   ├── Login/                # 登录页
│   │   ├── Notification/         # 通知公告
│   │   ├── Reservation/          # 座位预约
│   │   ├── SeatManagement/       # 自习室/座位管理
│   │   ├── Settings/             # 设置
│   │   ├── Statistics/           # 统计报表
│   │   └── UserManagement/       # 用户管理
│   ├── services/                 # API客户端
│   │   ├── apiClient.js          # HTTP请求基类
│   │   ├── booksApi.js           # 图书API
│   │   ├── loansApi.js           # 借阅API
│   │   ├── membersApi.js         # 会员API
│   │   ├── usersApi.js           # 用户API
│   │   ├── roomsApi.js           # 房间API
│   │   ├── seatsApi.js           # 座位API
│   │   ├── reservationsApi.js    # 预约API
│   │   └── notificationsApi.js   # 通知API
│   ├── stores/                   # 状态管理
│   │   ├── authStore.js          # 认证状态
│   │   └── dataStore.js          # 业务数据状态
│   ├── App.jsx                   # 路由配置
│   └── main.jsx                  # 应用入口
├── backend/                      # 后端服务
│   ├── src/
│   │   ├── config/               # 环境配置
│   │   ├── db/                   # 数据库连接
│   │   ├── middleware/           # 中间件
│   │   ├── routes/               # API路由（10个模块）
│   │   │   ├── users.js
│   │   │   ├── rooms.js
│   │   │   ├── seats.js
│   │   │   ├── reservations.js
│   │   │   ├── notifications.js
│   │   │   ├── books.js
│   │   │   ├── authors.js
│   │   │   ├── members.js
│   │   │   ├── loans.js
│   │   │   └── reports.js
│   │   ├── services/             # 业务逻辑层
│   │   ├── utils/                # 工具函数
│   │   ├── app.js                # Express应用
│   │   └── index.js              # 服务入口
│   ├── sql/
│   │   ├── schema.sql            # 数据库表结构
│   │   └── demo_data.sql         # 演示数据
│   └── data/
│       └── library.db            # SQLite数据库文件
├── public/                       # 静态资源
├── index.html
├── vite.config.js
└── package.json
```

---

## 🔌 API 接口

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
| 预约 | `POST /api/reservations/:id/cancel` | 取消预约 |
| 通知 | `GET/POST /api/notifications` | 通知列表/创建 |
| 图书 | `GET/POST /api/books` | 图书列表/创建 |
| 借阅 | `GET/POST /api/loans` | 借阅列表/创建 |
| 报表 | `GET /api/reports/overdue-loans` | 逾期统计 |

### 通用查询参数

- `limit` / `offset` - 分页（默认25，最大100）
- `sortBy` / `sortOrder` - 排序（`asc`/`desc`）
- `q` - 关键词搜索

---

## 🔐 权限矩阵

| 功能 | 管理员 | 馆员 | 学生 |
|------|--------|------|------|
| 用户管理 | ✅ | ❌ | ❌ |
| 自习室/座位管理 | ✅ | ✅ | ❌ |
| 图书管理 | ✅ | ✅ | ❌ |
| 借还登记 | ✅ | ✅ | ❌ |
| 座位预约 | ❌ | ❌ | ✅ |
| 我的预约/借阅 | ✅ | ✅ | ✅ |
| 统计看板 | ✅ | ✅ | ❌ |
| 通知公告 | ✅ | ✅ | ✅ |

---

## 🗄️ 数据库

### 表结构

```sql
users               # 用户表
rooms               # 自习室表
seats               # 座位表
reservations        # 预约表
notifications       # 通知表
notification_reads  # 通知已读表
authors             # 作者表
books               # 图书表
members             # 会员表
loans               # 借阅表
```

### 数据库工具

```bash
# 命令行访问
sqlite3 backend/data/library.db

# 常用命令
.tables              # 查看所有表
.schema users        # 查看表结构
SELECT * FROM users; # 查询数据
.quit                # 退出
```

图形化工具推荐：[DB Browser for SQLite](https://sqlitebrowser.org/)

---

## 🧪 测试

### 后端测试

```bash
cd backend
npm test
```

### API测试

```bash
# 健康检查
curl http://localhost:3001/health

# 获取用户列表
curl http://localhost:3001/api/users

# 创建用户
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","name":"测试","role":"student"}'
```

---

## 📦 部署

### 开发环境

```bash
# 前端
npm run dev

# 后端
cd backend && npm run dev
```

### 生产构建

```bash
# 构建前端
npm run build

# 生产模式启动后端
cd backend
npm start
```

---

## 🛣️ 开发路线图

- [x] 用户管理
- [x] 自习室/座位管理
- [x] 座位预约系统
- [x] 图书管理系统
- [x] 借还管理系统
- [x] 统计看板
- [x] 通知公告
- [ ] JWT认证（当前为Session模拟）
- [ ] 座位地图可视化
- [ ] 消息推送（邮件/短信）
- [ ] 多校区支持
- [ ] 数据库迁移（MySQL/PostgreSQL）

---

## 📝 License

本项目仅用于学习与演示用途，如需商用请自行完善与审查相关合规要求。

---

## 🤝 贡献

欢迎提交 Issue 和 PR！

---

**项目状态**: ✅ 已完成并可用 | **最后更新**: 2026-02-22
