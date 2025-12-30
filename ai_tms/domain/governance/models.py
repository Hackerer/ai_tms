from datetime import datetime
from typing import List, Optional, Dict
from flask_login import UserMixin

# Shared Value Object for Time
def get_now_str():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# --- Value Objects ---

class GroupRole:
    """协作组角色值对象"""
    SUPER_ADMIN = "SuperAdmin"
    ADMIN = "Admin"
    REVIEWER = "Reviewer"
    MEMBER = "Member"
    GUEST = "Guest"

class PermissionPolicy:
    """
    [补全细节] 权限策略值对象
    将原 iam_service.py 中的 ROLE_PERMISSIONS 逻辑迁移至此。
    """
    _DEFAULTS = {
        'admin': ['create', 'read', 'update', 'delete', 'manage_tenant'],
        'user': ['create', 'read', 'update'],
        'guest': ['read']
    }

    @classmethod
    def get_defaults(cls) -> Dict[str, List[str]]:
        return cls._DEFAULTS

# --- Entities ---

class Tenant:
    """租户实体"""
    def __init__(self, id: str, name: str, description: str = "", created_at: str = None, is_active: bool = True):
        self.id = id
        self.name = name
        self.description = description
        self.created_at = created_at or get_now_str()
        self.is_active = is_active

    def activate(self):
        self.is_active = True

    def deactivate(self):
        self.is_active = False

class Role:
    """
    全局系统角色实体
    """
    def __init__(self, id: str, tenant_id: str, name: str, permissions: List[str]):
        self.id = id
        self.tenant_id = tenant_id
        self.name = name
        self.permissions = permissions
    
    @classmethod
    def create_default(cls, id: str, tenant_id: str, role_name_key: str) -> 'Role':
        """工厂方法：根据默认策略创建角色"""
        perms = PermissionPolicy.get_defaults().get(role_name_key, [])
        return cls(id, tenant_id, role_name_key, perms)

class User(UserMixin):
    """
    用户实体 (User Aggregate Root)
    保留 UserMixin 以兼容现有的 Flask-Login 逻辑。
    """
    def __init__(self, id: str, tenant_id: str, username: str, email: str, password_hash: str, role_id: str, 
                 is_active: bool = True, created_at: str = None):
        self.id = id
        self.tenant_id = tenant_id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role_id = role_id
        self._is_active = is_active 
        self.created_at = created_at or get_now_str()

    @property
    def is_active(self): 
        return self._is_active
    
    def get_id(self): 
        return self.id

    def change_role(self, new_role_id: str):
        self.role_id = new_role_id

    # [补全细节] 增加领域层的权限校验辅助方法
    def can_access_tenant(self, check_tenant_id: str) -> bool:
        return self.tenant_id == check_tenant_id

# --- Aggregate Root: TrackingGroup ---

class GroupMember:
    """协作组成员 (Entity within TrackingGroup Aggregate)"""
    def __init__(self, group_id: str, user_id: str, group_role: str, joined_at: str = None):
        self.group_id = group_id
        self.user_id = user_id
        self.group_role = group_role
        self.joined_at = joined_at or get_now_str()

class TrackingGroup:
    """
    协作组 (Aggregate Root)
    核心业务字段: app_id (归属资产)
    """
    def __init__(self, id: str, tenant_id: str, app_id: str, name: str, description: str = "", 
                 created_at: str = None, members: List[GroupMember] = None):
        self.id = id
        self.tenant_id = tenant_id
        self.app_id = app_id
        self.name = name
        self.description = description
        self.created_at = created_at or get_now_str()
        self._members = members or []

    @property
    def members(self) -> List[GroupMember]:
        return self._members

    def add_member(self, user_id: str, role: str = GroupRole.MEMBER):
        """核心领域行为：添加或更新成员"""
        self._members = [m for m in self._members if m.user_id != user_id]
        new_member = GroupMember(self.id, user_id, role, get_now_str())
        self._members.append(new_member)
        return new_member

    def remove_member(self, user_id: str):
        self._members = [m for m in self._members if m.user_id != user_id]

    def get_member_role(self, user_id: str) -> Optional[str]:
        for m in self._members:
            if m.user_id == user_id:
                return m.group_role
        return None
