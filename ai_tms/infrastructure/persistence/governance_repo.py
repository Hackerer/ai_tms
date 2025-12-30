import sqlite3
import uuid
from typing import Optional, List
from ai_tms.domain.governance.models import Tenant, User, TrackingGroup, GroupMember, Role, GroupRole
from ai_tms.domain.governance.repositories import IGovernanceRepository

class SqliteGovernanceRepository(IGovernanceRepository):
    """
    治理域仓储的 SQLite 实现
    负责将充血模型映射到关系型数据库表。
    """
    def __init__(self, db_manager):
        self.db_manager = db_manager

    def _get_conn(self):
        # 依赖外部 db_manager 获取连接，保证连接池管理一致性
        return self.db_manager.get_connection()

    # --- ID Generation ---
    def next_identity(self, prefix: str) -> str:
        return f"{prefix}-{uuid.uuid4().hex[:12]}"

    # --- Tenant ---
    def save_tenant(self, tenant: Tenant) -> Tenant:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO tenants (id, name, description, created_at, is_active) VALUES (?, ?, ?, ?, ?) "
                "ON CONFLICT(id) DO UPDATE SET name=excluded.name, description=excluded.description, is_active=excluded.is_active",
                (tenant.id, tenant.name, tenant.description, tenant.created_at, tenant.is_active)
            )
            conn.commit()
            return tenant
        finally:
            conn.close()

    def get_tenant_by_id(self, tenant_id: str) -> Optional[Tenant]:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tenants WHERE id = ?", (tenant_id,))
            row = cursor.fetchone()
            if not row: return None
            return Tenant(row['id'], row['name'], row['description'], row['created_at'], bool(row['is_active']))
        finally:
            conn.close()

    def get_tenants(self) -> List[Tenant]:
        """获取全量租户列表"""
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tenants")
            return [Tenant(row['id'], row['name'], row['description'], row['created_at'], bool(row['is_active'])) for row in cursor.fetchall()]
        finally:
            conn.close()

    # --- User ---
    def save_user(self, user: User) -> User:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (id, tenant_id, username, email, password_hash, role_id, is_active, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?) "
                "ON CONFLICT(id) DO UPDATE SET email=excluded.email, role_id=excluded.role_id, is_active=excluded.is_active",
                (user.id, user.tenant_id, user.username, user.email, user.password_hash, user.role_id, user.is_active, user.created_at)
            )
            conn.commit()
            return user
        finally:
            conn.close()

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if not row: return None
            return User(row['id'], row['tenant_id'], row['username'], row['email'], row['password_hash'], 
                        row['role_id'], bool(row['is_active']), row['created_at'])
        finally:
            conn.close()
            
    def get_user_by_username(self, tenant_id: str, username: str) -> Optional[User]:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE tenant_id = ? AND username = ?", (tenant_id, username))
            row = cursor.fetchone()
            if not row: return None
            return User(row['id'], row['tenant_id'], row['username'], row['email'], row['password_hash'], 
                        row['role_id'], bool(row['is_active']), row['created_at'])
        finally:
            conn.close()

    def get_users_by_tenant(self, tenant_id: str) -> List[User]:
        """获取租户下的所有用户"""
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE tenant_id = ?", (tenant_id,))
            return [User(row['id'], row['tenant_id'], row['username'], row['email'], row['password_hash'], 
                        row['role_id'], bool(row['is_active']), row['created_at']) for row in cursor.fetchall()]
        finally:
            conn.close()

    # --- TrackingGroup (Aggregate Root) ---
    def save_group(self, group: TrackingGroup) -> TrackingGroup:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            # 1. 保存聚合根实体
            cursor.execute(
                "INSERT INTO tracking_groups (id, tenant_id, app_id, name, description, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?) "
                "ON CONFLICT(id) DO UPDATE SET name=excluded.name, description=excluded.description",
                (group.id, group.tenant_id, group.app_id, group.name, group.description, group.created_at)
            )
            
            # 2. 保存聚合内部实体 (全量替换策略保障一致性)
            cursor.execute("DELETE FROM group_members WHERE group_id = ?", (group.id,))
            for member in group.members:
                cursor.execute(
                    "INSERT INTO group_members (group_id, user_id, group_role, joined_at) VALUES (?, ?, ?, ?)",
                    (group.id, member.user_id, member.group_role, member.joined_at)
                )
            
            conn.commit()
            return group
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def get_group_by_id(self, group_id: str, tenant_id: str) -> Optional[TrackingGroup]:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            # 1. 加载聚合根
            cursor.execute("SELECT * FROM tracking_groups WHERE id = ? AND tenant_id = ?", (group_id, tenant_id))
            row = cursor.fetchone()
            if not row: return None
            
            # 2. 贪婪加载成员
            cursor.execute("SELECT * FROM group_members WHERE group_id = ?", (group_id,))
            members = [GroupMember(r['group_id'], r['user_id'], r['group_role'], r['joined_at']) for r in cursor.fetchall()]
            
            return TrackingGroup(row['id'], row['tenant_id'], row['app_id'], row['name'], row['description'], row['created_at'], members)
        finally:
            conn.close()
            
    def get_groups_by_app(self, app_id: str, tenant_id: str) -> List[TrackingGroup]:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tracking_groups WHERE app_id = ? AND tenant_id = ?", (app_id, tenant_id))
            groups = []
            for row in cursor.fetchall():
                # 针对列表查询，同样需要加载成员信息 (或者使用延迟加载，但在 SQLite 下直接贪婪加载更简单一致)
                g_id = row['id']
                cursor.execute("SELECT * FROM group_members WHERE group_id = ?", (g_id,))
                members = [GroupMember(r['group_id'], r['user_id'], r['group_role'], r['joined_at']) for r in cursor.fetchall()]
                groups.append(TrackingGroup(row['id'], row['tenant_id'], row['app_id'], row['name'], row['description'], row['created_at'], members))
            return groups
        finally:
            conn.close()
