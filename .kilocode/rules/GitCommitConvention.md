# Git 提交信息规范

## 规则说明

当执行 `git commit` 命令时，应遵循 [Conventional Commits](https://www.conventionalcommits.org/) 标准提交规范。

## 基本格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## 常用 Type 类型

| 类型 | 说明 |
|------|------|
| `feat` | 新功能（feature） |
| `fix` | 修复 bug |
| `docs` | 文档更新 |
| `style` | 代码格式调整（不影响代码运行） |
| `refactor` | 代码重构（既不是新功能也不是修复 bug） |
| `perf` | 性能优化 |
| `test` | 添加或修改测试 |
| `chore` | 构建过程、工具配置等变更 |
| `ci` | 持续集成配置变更 |
| `build` | 构建系统或外部依赖变更 |
| `revert` | 回滚某次提交 |

## Scope（可选）

用于说明提交影响的范围，可以是模块名、组件名或文件名：
- `auth` - 认证模块
- `api` - 接口层
- `ui` - 用户界面
- `db` - 数据库
- `deps` - 依赖
- 或具体的组件名如 `UserList`、`SeatReservation` 等

## 格式要求

1. **type** 必须小写，后跟英文冒号 `:` 和一个空格
2. **scope** 可选，放在 type 后的括号中，如 `feat(auth):`
3. **description** 简洁描述变更内容，小写开头，不加句号
4. **body** 可选，详细描述变更原因和对比，可换行
5. **footer** 可选，用于关联 Issue 或 Breaking Changes

## 正确示例

```
feat(auth): add JWT token refresh mechanism

fix: resolve null pointer exception in login validation

docs(api): update user endpoints documentation

refactor(SeatReservation): optimize seat selection logic

perf(db): add index to loans table for faster queries

chore(deps): upgrade React to version 19

feat(UserList)!: remove deprecated user status field

fix: correct reservation time calculation

Closes #123
```

## 错误示例

```
更新代码                    # 缺少 type
Feat: add new feature       # type 大写了
feat:add feature            # 冒号后缺少空格
feat: 修改了文件.           # 描述以句号结尾
feat(): empty scope         # scope 为空
```

## 执行要求

- 每次执行 `execute_command` 进行 `git commit` 时，应遵循此规范
- 描述应准确、简洁地概括本次提交的核心变更
- 如有关联 Issue，在 footer 中使用 `Closes #issue号` 格式
