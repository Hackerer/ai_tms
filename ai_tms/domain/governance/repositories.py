from abc import ABC, abstractmethod
from typing import Optional, List
from .models import Tenant, User, TrackingGroup, GroupMember

class IGovernanceRepository(ABC):
    """治理域仓储接口 (Abstract Repository)"""

    # --- Tenant ---
    @abstractmethod
    def save_tenant(self, tenant: Tenant) -> Tenant:
        pass

    @abstractmethod
    def get_tenant_by_id(self, tenant_id: str) -> Optional[Tenant]:
        pass

    # --- User ---
    @abstractmethod
    def save_user(self, user: User) -> User:
        pass

    @abstractmethod
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        pass

    @abstractmethod
    def get_user_by_username(self, tenant_id: str, username: str) -> Optional[User]:
        pass

    # --- TrackingGroup (Aggregate) ---
    @abstractmethod
    def save_group(self, group: TrackingGroup) -> TrackingGroup:
        """
        保存整个聚合根。
        注意：实现层需要同时处理 tracking_groups 表和 group_members 表。
        """
        pass

    @abstractmethod
    def get_group_by_id(self, group_id: str, tenant_id: str) -> Optional[TrackingGroup]:
        """
        获取聚合根。
        注意：实现层需要贪婪加载 group_members。
        """
        pass
    
    @abstractmethod
    def get_groups_by_app(self, app_id: str, tenant_id: str) -> List[TrackingGroup]:
        pass
    
    # --- ID Generator ---
    @abstractmethod
    def next_identity(self, prefix: str) -> str:
        """生成唯一 ID"""
        pass
