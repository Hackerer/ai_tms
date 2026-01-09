from abc import ABC, abstractmethod
from typing import Optional, List
from .models import App, Domain, Page, Event, Parameter

class IPageRepository(ABC):
    """页面仓储接口"""
    @abstractmethod
    def save_page(self, page: Page) -> Page:
        pass

    @abstractmethod
    def get_pages_by_app(self, app_id: str, tenant_id: str) -> List[Page]:
        pass

    @abstractmethod
    def get_page_by_id(self, page_id: str) -> Optional[Page]:
        pass

class IAssetRepository(ABC):
    """
    资产仓储接口 (Event & App)
    负责 Event Aggregate Root 的完整存取。
    """
    
    # --- App & Domain ---
    @abstractmethod
    def save_app(self, app: App) -> App:
        pass
    
    @abstractmethod
    def get_app_by_id(self, app_id: str) -> Optional[App]:
        pass

    @abstractmethod
    def save_domain(self, domain: Domain) -> Domain:
        pass

    @abstractmethod
    def get_domains(self, tenant_id: str) -> List[Domain]:
        pass

    # --- Event Aggregate ---
    @abstractmethod
    def save_event(self, event: Event) -> Event:
        """
        保存埋点聚合根。
        注意：实现层必须同时处理 event_property_relation，保证参数列表的一致性。
        """
        pass

    @abstractmethod
    def get_event_by_id(self, event_id: str) -> Optional[Event]:
        """
        获取埋点聚合根。
        注意：实现层必须贪婪加载 properties 及 enum_options。
        """
        pass
    
    @abstractmethod
    def lock_event(self, event: Event):
        """仅持久化 Event 的锁定状态 (轻量级 UPDATE)"""
        pass

    @abstractmethod
    def unlock_event(self, event: Event):
        pass

    @abstractmethod
    def get_event_by_name(self, tenant_id: str, name: str) -> Optional[Event]:
        """根据租户和名称获取埋点聚合根"""
        pass

    # --- Parameter Value Objects ---
    @abstractmethod
    def find_property_by_name(self, tenant_id: str, name: str) -> Optional[Parameter]:
        pass

    # --- ID Generation ---
    @abstractmethod
    def next_identity(self, prefix: str) -> str:
        pass
