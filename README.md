# Seat Genie

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite 7">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express 4">
  <img src="https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white" alt="SQLite 3">
  <img src="https://img.shields.io/badge/status-已完成-brightgreen" alt="Status">
</p>

<p align="center">
  <b>图书馆 / 自习室综合管理系统</b>
</p>

---

## 📖 项目简介

**Seat Genie** 是一个完整的图书馆/自习室综合管理系统，采用**前后端分离架构**，支持"座位预约 + 图书借阅 + 用户管理 + 通知公告 + 统计分析"的一体化管理流程。

### 核心特性

- 🪑 **座位预约系统** - 支持按时段预约自习室座位，实时冲突检测
- 📚 **图书借还管理** - 完整的图书借阅、归还、逾期追踪流程
- 👥 **多角色权限** - 管理员、馆员、学生三级权限体系
- 📊 **数据可视化** - 基于 Recharts 的统计图表与报表分析
- 🔔 **通知公告** - 系统公告发布与已读状态追踪
- 🔐 **安全可靠** - 基于角色的访问控制，数据校验与错误处理

---

## ✅ 项目状态：已完成并可用

这是一个**完整可用的前后端分离项目**，所有核心功能均已实现并通过 RESTful API 连接后端数据库。

### 功能清单

| 模块 | 功能描述 | 状态 |
|------|----------|------|
| **用户管理** | 三角色体系（管理员/馆员/学生），增删改查、密码管理、状态控制 | ✅ 已完成 |
| **自习室管理** | 房间信息管理、容量设置、开放时间配置 | ✅ 已完成 |
| **座位管理** | 座位分配、状态管理（可用/占用/维护） | ✅ 已完成 |
| **座位预约** | 按时段预约、实时冲突检测、取消预约 | ✅ 已完成 |
| **图书管理** | 图书录入、ISBN 管理、作者关联、分类检索 | ✅ 已完成 |
| **会员管理** | 会员注册、信息维护、借阅权限管理 | ✅ 已完成 |
| **借还管理** | 借阅登记、归还处理、逾期检测与提醒 | ✅ 已完成 |
| **统计看板** | 资源利用率、趋势图表、实时数据可视化 | ✅ 已完成 |
| **统计报表** | 座位使用率、图书流通率、逾期统计 | ✅ 已完成 |
| **通知公告** | 公告发布、分类管理、已读状态追踪 | ✅ 已完成 |

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### 启动步骤

```bash
# 1. 克隆项目并进入目录
git clone <repository-url>
cd seat-genie

# 2. 安装依赖（npm workspaces 会同时安装 frontend 与 backend）
npm install

# 3. 配置后端环境变量
cp backend/.env.example backend/.env
# 默认配置即可使用，生产环境请修改 JWT_SECRET

# 4. 启动前后端（一条命令同时启动）
npm run dev

# 5. 访问系统
# 前端: http://localhost:5173
# 后端 API: http://localhost:3001
```

### 重要说明

- **数据库懒加载**：SQLite 数据库与 schema、seed 数据会在**首次访问需要数据库的 API 时**自动创建，无需手动执行 SQL。`/health` 端点不会触发数据库初始化。
- **首次触发初始化**：启动后端后，可执行任意 API 请求（如登录）以触发数据库创建：
  ```bash
  curl http://localhost:3001/api/users/login -H 'Content-Type: application/json' -d '{"username":"admin","password":"TempPass123!"}'
  ```
- **登录失败**：若演示账号无法登录，可能是已提交的 `library.db` 中密码哈希与 seed 不一致。删除数据库文件后重启后端即可重新初始化：
  ```bash
  rm backend/data/library.db
  ```
- **密码策略**：创建用户时密码需满足：12+ 字符，含大小写、数字、特殊字符（如 `TempPass123!`）。

### 常用命令

| 任务 | 命令 |
|------|------|
| 安装依赖 | `npm install`（根目录，workspaces 自动处理） |
| 启动开发 | `npm run dev`（同时启动前后端） |
| 后端测试 | `npm run test:backend` |
| 前端测试 | `cd frontend && npx vitest run` |
| 前端构建 | `npm run build:frontend` |
| 前端 Lint | `cd frontend && npx eslint .` |

---

## 🔑 演示账号

| 角色 | 用户名 | 密码 | 权限说明 |
|------|--------|------|----------|
| **管理员** | `admin` | `TempPass123!` | 全部功能：用户管理、系统配置、数据统计 |
| **馆员** | `staff1` | `TempPass123!` | 图书/座位管理、借还登记、通知发布 |
| **学生** | `student1` | `TempPass123!` | 座位预约、图书借阅、个人中心 |

> 💡 **提示**: 数据库首次初始化时会自动导入 seed 数据，可直接使用上述账号登录。

---

## 🏗️ 技术架构

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [React](https://react.dev/) | 19.2.0 | UI 框架，构建用户界面 |
| [React Router](https://reactrouter.com/) | 7.12.0 | 路由管理，支持嵌套路由与导航守卫 |
| [Vite](https://vitejs.dev/) | 7.2.4 | 构建工具，提供快速开发与热更新 |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5.0.9 | 状态管理，轻量级、无样板代码 |
| [Recharts](https://recharts.org/) | 3.6.0 | 数据可视化，统计图表库 |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [Express.js](https://expressjs.com/) | 4.19.2 | Web 框架，RESTful API 服务 |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | 9.4.3 | SQLite 驱动，同步高性能数据库操作 |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | 9.0.x | JWT 认证 |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 3.0.x | 密码哈希 |
| [Zod](https://zod.dev/) | 3.23.8 | 数据校验，运行时类型检查 |
| [CORS](https://github.com/expressjs/cors) | 2.8.5 | 跨域资源共享支持 |
| [Helmet](https://helmetjs.github.io/) | 7.1.0 | 安全中间件，HTTP 头保护 |
| [Pino](https://getpino.io/) | 9.2.0 | 高性能日志记录 |

### 数据库

- **类型**: SQLite 3
- **文件位置**: `backend/data/library.db`
- **特点**: 零配置、单文件、便携、适合中小型应用

---

## 📁 项目结构

本项目为 **npm workspaces monorepo**，前后端均为 **TypeScript** 实现。

```
seat-genie/
├── frontend/                         # 前端应用（React 19 + Vite + TypeScript）
│   ├── src/
│   │   ├── components/               # 公共组件（common/, layout/）
│   │   ├── pages/                    # 业务页面（Login, Dashboard, UserManagement 等）
│   │   ├── services/                 # API 服务层
│   │   ├── stores/                   # 状态管理（Zustand）
│   │   ├── hooks/                    # 自定义 Hooks
│   │   ├── utils/                    # 工具函数
│   │   ├── App.tsx                   # 路由与权限
│   │   └── main.tsx                  # 应用入口
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/                          # 后端服务（Express + SQLite + TypeScript）
│   ├── src/
│   │   ├── config/                   # 环境配置
│   │   ├── db/                       # 数据库连接与懒加载初始化
│   │   ├── middleware/               # 中间件（auth, authorize, validate, errorHandler）
│   │   ├── routes/                   # API 路由（10 个模块）
│   │   ├── services/                 # 业务逻辑层
│   │   ├── utils/                    # 工具函数
│   │   ├── app.ts                    # Express 应用配置
│   │   └── index.ts                  # 服务入口
│   ├── sql/
│   │   ├── schema.sql                # 数据库表结构
│   │   └── seed.sql                  # 种子数据（首次 DB 访问时自动导入）
│   ├── data/                         # 数据目录（library.db 自动创建）
│   └── package.json
├── package.json                      # 根 package（workspaces 配置）
└── AGENTS.md                         # 开发环境说明
```

---

## 🔌 API 接口文档

### 基础信息

- **基础 URL**: `http://localhost:3001`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: JWT Bearer Token（登录后获取，除 `/api/users/login` 外大部分接口需在请求头携带 `Authorization: Bearer <token>`）

### 核心端点

#### 系统
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查，返回服务状态 |

#### 用户管理
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/users/login` | 用户登录（返回 JWT） |
| GET | `/api/users` | 获取用户列表（支持分页、搜索） |
| POST | `/api/users` | 创建新用户 |
| GET | `/api/users/:id` | 获取用户详情 |
| PUT | `/api/users/:id` | 更新用户信息 |
| DELETE | `/api/users/:id` | 删除用户 |

#### 自习室与座位
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/rooms` | 获取自习室列表 |
| POST | `/api/rooms` | 创建自习室 |
| GET | `/api/rooms/:id` | 获取自习室详情 |
| GET | `/api/seats` | 获取座位列表（可按房间筛选） |
| POST | `/api/seats` | 创建座位 |
| PUT | `/api/seats/:id` | 更新座位信息/状态 |

#### 座位预约
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/reservations` | 获取预约列表 |
| POST | `/api/reservations` | 创建预约（自动冲突检测） |
| POST | `/api/reservations/:id/cancel` | 取消预约 |

#### 图书与借阅
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/books` | 获取图书列表（支持搜索、筛选） |
| POST | `/api/books` | 录入新图书 |
| GET | `/api/loans` | 获取借阅记录 |
| POST | `/api/loans` | 登记借阅 |
| POST | `/api/loans/:id/return` | 归还图书 |

#### 通知公告
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/notifications` | 获取通知列表 |
| POST | `/api/notifications` | 发布通知 |
| POST | `/api/notifications/:id/read` | 标记已读 |

#### 统计报表
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/reports/seat-usage` | 座位使用率报表 |
| GET | `/api/reports/book-circulation` | 图书流通率报表 |
| GET | `/api/reports/overdue-loans` | 逾期借阅统计 |

### 通用查询参数

所有列表接口支持以下参数：

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `limit` | number | 每页数量 | 25 |
| `offset` | number | 偏移量 | 0 |
| `sortBy` | string | 排序字段 | id |
| `sortOrder` | string | 排序方向（`asc`/`desc`） | asc |
| `q` | string | 关键词搜索 | - |

### 响应格式

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "limit": 25,
    "offset": 0
  }
}
```

---

## 🔐 权限矩阵

| 功能模块 | 管理员 | 馆员 | 学生 |
|----------|--------|------|------|
| **用户管理** | ✅ 完整权限 | ❌ 无权限 | ❌ 无权限 |
| **自习室/座位管理** | ✅ 完整权限 | ✅ 完整权限 | ❌ 仅查看 |
| **图书管理** | ✅ 完整权限 | ✅ 完整权限 | ❌ 仅查看 |
| **借还登记** | ✅ 完整权限 | ✅ 完整权限 | ❌ 无权限 |
| **座位预约** | ❌ 无权限 | ❌ 无权限 | ✅ 完整权限 |
| **我的预约** | ✅ 查看自己 | ✅ 查看自己 | ✅ 完整权限 |
| **我的借阅** | ✅ 查看自己 | ✅ 查看自己 | ✅ 完整权限 |
| **统计看板** | ✅ 完整权限 | ✅ 完整权限 | ❌ 无权限 |
| **通知公告** | ✅ 发布/查看 | ✅ 发布/查看 | ✅ 仅查看 |

---

## 🗄️ 数据库设计

### 表结构

```sql
users                 -- 用户表（管理员/馆员/学生）
├── id, username, password, name, role, email, phone, active_status

rooms                 -- 自习室表
├── id, name, location, capacity, open_time, close_time, description, status

seats                 -- 座位表
├── id, room_id, seat_number, status (available/occupied/maintenance)

reservations          -- 预约表
├── id, seat_id, user_id, start_time, end_time, status, created_at

notifications         -- 通知公告表
├── id, title, content, type, priority, publisher_id, publish_time

notification_reads    -- 通知已读状态表
├── id, notification_id, user_id, read_time

authors               -- 作者表
├── id, name, bio, birth_date, nationality

books                 -- 图书表
├── id, isbn, title, author_id, category, publisher, publish_year, status

members               -- 会员表
├── id, user_id, membership_number, expiry_date, max_books, status

loans                 -- 借阅记录表
├── id, book_id, member_id, loan_date, due_date, return_date, status
```

### E-R 关系图

```
users (1) ────────< (N) reservations >──────── (N) seats
   │                                              │
   │                                              │
   │ (1)                                    (N) rooms
   │
   └───────< (N) members >────────< (N) loans >──────── (N) books
                                              │
                                              │
                                         (N) authors
```

### 数据库工具

```bash
# 命令行访问数据库
sqlite3 backend/data/library.db

# 常用命令
.tables                    # 查看所有表
.schema users              # 查看表结构
.schema --indent users     # 格式化查看表结构
SELECT * FROM users;       # 查询数据
.headers on                # 开启表头显示
.mode column               # 列对齐显示
.quit                      # 退出
```

**图形化工具推荐**: [DB Browser for SQLite](https://sqlitebrowser.org/)

---

## 🧪 测试

### 后端单元测试

```bash
npm run test:backend
```

测试覆盖：CRUD 错误场景、列表查询参数验证、报表统计准确性等（约 191 个用例）。

### 前端单元测试

```bash
cd frontend && npx vitest run
```

约 49 个用例，覆盖组件、stores、工具函数等。

### API 接口测试示例

```bash
# 健康检查
curl http://localhost:3001/health

# 获取用户列表（带分页）
curl "http://localhost:3001/api/users?limit=10&offset=0"

# 登录获取 JWT
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"TempPass123!"}'

# 创建用户（需满足密码策略：12+ 字符，含大小写、数字、特殊字符）
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TempPass123!",
    "name": "Test User",
    "role": "student",
    "email": "test@example.edu"
  }'

# 获取图书列表（带搜索）
curl "http://localhost:3001/api/books?q=JavaScript&limit=5"
```

---

## 📦 部署指南

### 开发环境

```bash
# 同时启动前后端（concurrently）
npm run dev
# 前端: http://localhost:5173
# 后端: http://localhost:3001
```

### 生产构建

```bash
# 1. 构建前端静态文件
npm run build:frontend
# 输出目录: frontend/dist/

# 2. 生产模式启动后端
cd backend
NODE_ENV=production npm start
```

### 环境变量

后端支持以下环境变量（复制 `backend/.env.example` 到 `backend/.env`）：

```env
PORT=3001                           # 服务端口
DATABASE_FILE=data/library.db       # 数据库路径（相对于 backend 目录）
LOG_LEVEL=info                      # 日志级别
JWT_SECRET=change-this-in-production # 生产环境必填，开发环境可省略（使用默认值）
```

---

## 🛣️ 开发路线图

### 已实现 ✅

- [x] 用户管理（三角色权限体系）
- [x] JWT 认证与基于角色的访问控制
- [x] 自习室/座位管理
- [x] 座位预约系统（含冲突检测）
- [x] 图书管理系统
- [x] 会员管理系统
- [x] 借还管理系统（含逾期追踪）
- [x] 统计看板与报表
- [x] 通知公告系统
- [x] RESTful API 完整实现
- [x] 前后端 TypeScript 全栈
- [x] 单元测试（后端 Jest、前端 Vitest）

### 规划中 📋

- [x] 座位地图可视化（拖拽选座）
- [x] 消息推送（邮件/短信提醒）
- [x] 多校区/多馆支持
- [ ] 数据库迁移（MySQL/PostgreSQL）
- [x] 移动端适配/PWA
- [x] 预约提醒定时任务
- [x] 数据导入/导出（Excel）

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交规范

- **Bug 报告**: 使用 [Bug] 前缀，描述复现步骤
- **功能建议**: 使用 [Feature] 前缀，说明使用场景
- **代码提交**: 遵循 [Conventional Commits](https://www.conventionalcommits.org/)

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 📝 许可证

本项目仅用于**学习与演示用途**，如需商用请自行完善与审查相关合规要求。

---

## 📧 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](../../issues)
- 发送邮件至项目维护者

---

<p align="center">
  <b>项目状态</b>: ✅ 已完成并可用 &nbsp;|&nbsp; <b>最后更新</b>: 2026-03-02
</p>
