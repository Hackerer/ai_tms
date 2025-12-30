# TMS 埋点管理系统

一个基于 DDD（领域驱动设计）架构的埋点管理系统，支持通过 CLI 进行完整的埋点生命周期管理。

## 快速开始

### 1. 初始化系统
```bash
python3 cli.py init
```

### 2. 创建租户和用户
```bash
# 创建租户
python3 cli.py tenant create --name "我的公司" --desc "测试租户"

# 创建用户（需要替换 <TENANT_ID> 为上一步返回的 ID）
python3 cli.py user create \
  --tenant <TENANT_ID> \
  --username alice \
  --email alice@example.com \
  --password test123 \
  --role admin
```

### 3. 创建应用和页面
```bash
# 创建应用
python3 cli.py app create \
  --tenant <TENANT_ID> \
  --name "电商App" \
  --platform iOS \
  --owner <USER_ID>

# 创建页面
python3 cli.py page create \
  --tenant <TENANT_ID> \
  --app <APP_ID> \
  --name "首页" \
  --path "/home"
```

## 核心功能

- ✅ **多租户隔离**: 支持多个租户独立管理埋点
- ✅ **页面树形结构**: 页面支持父子关系，便于组织管理
- ✅ **协作组权限**: 通过协作组实现细粒度权限控制
- ✅ **需求单审批**: 埋点变更需要经过审批流程
- ✅ **参数复用**: 参数定义可跨埋点复用
- ✅ **版本快照**: 自动记录每次变更的版本快照
- ✅ **审计日志**: 完整的操作历史追溯

## 架构设计

系统采用 DDD 分层架构：

```
ai_tms/
├── domain/              # 领域层（核心业务逻辑）
│   ├── governance/      # 治理域（用户、租户、协作组）
│   ├── asset/           # 资产域（应用、页面、埋点）
│   └── workflow/        # 工作流域（需求单、审批）
├── application/         # 应用层（业务编排）
├── infrastructure/      # 基础设施层（数据持久化）
└── tests/               # 单元测试

database/                # 数据库管理
manger.py                # 外观接口（Facade）
cli.py                   # CLI 命令行工具
```

## 可用命令

```bash
# 系统管理
python3 cli.py init                    # 初始化系统

# 租户管理
python3 cli.py tenant create           # 创建租户

# 用户管理
python3 cli.py user create             # 创建用户

# 应用管理
python3 cli.py app create              # 创建应用

# 页面管理
python3 cli.py page create             # 创建页面
python3 cli.py page list               # 列出页面

# 协作组管理
python3 cli.py group create            # 创建协作组

# 需求单管理
python3 cli.py request create          # 创建需求单
```

## 设计原则

1. **单一职责**: 每个类只负责一个明确的职责
2. **依赖倒置**: 高层模块不依赖低层模块，都依赖抽象
3. **开闭原则**: 对扩展开放，对修改封闭
4. **充血模型**: 业务逻辑封装在领域对象内部

## 学习建议

如果你是编程初学者，建议按以下顺序学习：

1. **理解数据库**: 查看 `database/db_manager.py` 的表结构设计
2. **理解领域模型**: 查看 `ai_tms/domain/asset/models.py` 中的 `Event` 类
3. **理解分层架构**: 跟踪一个 CLI 命令的完整调用链
4. **动手实践**: 尝试添加新的 CLI 命令（如查询埋点列表）

## 技术栈

- **语言**: Python 3
- **数据库**: SQLite
- **架构**: DDD (Domain-Driven Design)
- **CLI 框架**: argparse

## 许可证

本项目仅供学习使用。
