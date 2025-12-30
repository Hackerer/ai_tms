import sqlite3
import os

class DatabaseManager:
    """
    数据库连接管理器
    职责：
    1. 提供统一的数据库连接获取接口
    2. 初始化数据库表结构（Schema）
    3. 配置 Row Factory 以支持字典式访问
    """
    def __init__(self, db_path='Tracking.db'):
        self.db_path = db_path
        self._init_db()

    def get_connection(self):
        """
        获取一个配置好的数据库连接
        
        Returns:
            sqlite3.Connection: 配置了 row_factory 的连接对象
        """
        conn = sqlite3.connect(self.db_path)
        # 关键配置：允许通过字段名访问数据 row['username'] 而非 row[0]
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """
        初始化数据库表结构
        如果表不存在则创建，确保系统首次运行时能自动建表
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # === 1. 治理域 (Governance Context) ===
        
        # 租户表
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS tenants (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            created_at DATETIME,
            is_active INTEGER DEFAULT 1
        )''')

        # 用户表
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            tenant_id TEXT,
            username TEXT NOT NULL,
            email TEXT,
            password_hash TEXT,
            role_id TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME,
            FOREIGN KEY (tenant_id) REFERENCES tenants(id)
        )''')

        # 协作组表
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS tracking_groups (
            id TEXT PRIMARY KEY,
            tenant_id TEXT,
            app_id TEXT,
            name TEXT NOT NULL,
            description TEXT,
            created_at DATETIME,
            FOREIGN KEY (app_id) REFERENCES apps(id)
        )''')

        # 协作组成员表
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS group_members (
            group_id TEXT,
            user_id TEXT,
            group_role TEXT,
            joined_at DATETIME,
            PRIMARY KEY (group_id, user_id)
        )''')

        # === 2. 资产域 (Asset Context) ===
        
        # 业务域表
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS domains (
            id TEXT PRIMARY KEY,
            tenant_id TEXT,
            name TEXT NOT NULL,
            description TEXT,
            owner_user_id TEXT,
            created_at DATETIME
        )''')

        # 应用表
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS apps (
            id TEXT PRIMARY KEY,
            tenant_id TEXT,
            owner_user_id TEXT,
            name TEXT NOT NULL,
            platform TEXT,
            app_key TEXT,
            created_at DATETIME
        )''')

        # 页面表（树形结构）
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS pages (
            id TEXT PRIMARY KEY,
            tenant_id TEXT,
            app_id TEXT,
            parent_id TEXT,
            name TEXT NOT NULL,
            path TEXT,
            module TEXT,
            description TEXT,
            created_at DATETIME,
            FOREIGN KEY (app_id) REFERENCES apps(id),
            FOREIGN KEY (parent_id) REFERENCES pages(id)
        )''')

        # 埋点事件表（核心）
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            tenant_id TEXT,
            group_id TEXT,
            domain_id TEXT,
            page_id TEXT,
            event_type TEXT,
            name TEXT NOT NULL,
            description TEXT,
            is_active INTEGER DEFAULT 1,
            status TEXT DEFAULT 'Online',
            locked_by_request TEXT,
            created_at DATETIME,
            updated_at DATETIME,
            FOREIGN KEY (group_id) REFERENCES tracking_groups(id),
            FOREIGN KEY (page_id) REFERENCES pages(id)
        )''')

        # 参数定义表
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS properties (
            id TEXT PRIMARY KEY,
            tenant_id TEXT,
            name TEXT NOT NULL,
            data_type TEXT,
            category TEXT,
            description TEXT,
            created_at DATETIME
        )''')

        # 事件-参数关联表（M:N）
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS event_property_relation (
            event_id TEXT,
            property_id TEXT,
            tenant_id TEXT,
            is_required INTEGER DEFAULT 0,
            PRIMARY KEY (event_id, property_id)
        )''')

        # 参数枚举值表
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS property_enums (
            property_id TEXT,
            value TEXT,
            label TEXT,
            description TEXT,
            PRIMARY KEY (property_id, value)
        )''')

        # 事件-应用关联表（M:N，支持跨应用复用）
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS event_app_relation (
            event_id TEXT,
            app_id TEXT,
            tenant_id TEXT,
            PRIMARY KEY (event_id, app_id)
        )''')

        # === 3. 工作流域 (Workflow Context) ===
        
        # 需求单表
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS tracking_requests (
            id TEXT PRIMARY KEY,
            tenant_id TEXT,
            group_id TEXT,
            title TEXT,
            created_user_id TEXT,
            status TEXT DEFAULT 'Draft',
            event_references TEXT,
            history_logs TEXT,
            doc_url TEXT,
            created_at DATETIME
        )''')

        # 审批任务表
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS approval_tasks (
            id TEXT PRIMARY KEY,
            request_id TEXT,
            node_name TEXT,
            approver_user_id TEXT,
            status TEXT DEFAULT 'Pending',
            comment TEXT,
            processed_at DATETIME,
            FOREIGN KEY (request_id) REFERENCES tracking_requests(id)
        )''')

        # 版本快照表
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS event_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id TEXT,
            request_id TEXT,
            tenant_id TEXT,
            version INTEGER,
            event_data TEXT,
            change_description TEXT,
            created_user_id TEXT,
            created_at DATETIME
        )''')

        conn.commit()
        conn.close()
