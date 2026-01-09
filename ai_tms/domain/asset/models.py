from datetime import datetime
from typing import List, Optional, Dict
from enum import Enum

def get_now_str():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# --- Value Objects ---

class EventType:
    """事件语义类型值对象"""
    IMP = "EXPOSURE"
    CLK = "CLICK"
    PV  = "PAGE_VIEW"
    OTHER = "OTHER"

class EnumOption:
    """枚举选项值对象"""
    def __init__(self, value: str, label: str, description: str = ""):
        self.value = value
        self.label = label
        self.description = description

class Parameter:
    """参数值对象 (Value Object within Asset)"""
    def __init__(self, id: str, tenant_id: str, name: str, data_type: str, category: str, 
                 description: str = "", is_required: bool = False, enum_options: List[EnumOption] = None, 
                 created_at: str = None):
        self.id = id
        self.tenant_id = tenant_id
        self.name = name
        self.data_type = data_type
        self.category = category
        self.description = description
        self.is_required = is_required
        self.enum_options = enum_options or []
        self.created_at = created_at or get_now_str()

# --- Entities ---

class Domain:
    """业务域实体"""
    def __init__(self, id: str, tenant_id: str, name: str, description: str = "", 
                 owner_user_id: str = None, created_at: str = None):
        self.id = id
        self.tenant_id = tenant_id
        self.name = name
        self.description = description
        self.owner_user_id = owner_user_id
        self.created_at = created_at or get_now_str()

class App:
    """应用资产实体 (App Asset)"""
    def __init__(self, id: str, tenant_id: str, name: str, platform: str, 
                 owner_user_id: str, app_key: str = None, created_at: str = None):
        self.id = id
        self.tenant_id = tenant_id
        self.owner_user_id = owner_user_id
        self.name = name
        self.platform = platform
        self.app_key = app_key
        self.created_at = created_at or get_now_str()

class Page:
    """
    页面实体 (Page Entity)
    支持树形结构的自我描述。
    """
    def __init__(self, id: str, tenant_id: str, app_id: str, name: str, path: str, 
                 parent_id: str = None, module: str = "", description: str = "", created_at: str = None):
        self.id = id
        self.tenant_id = tenant_id
        self.app_id = app_id
        self.parent_id = parent_id
        self.name = name
        self.path = path
        self.module = module
        self.description = description
        self.created_at = created_at or get_now_str()

    def is_root(self) -> bool:
        return self.parent_id is None

# --- Aggregate Root: Event ---

class Event:
    """
    埋点事件 (Aggregate Root)
    核心亮点：充血模型，内聚了状态流转与锁定逻辑。
    """
    def __init__(self, id: str, tenant_id: str, group_id: str, name: str, 
                 description: str = "", is_active: bool = True, status: str = 'ONLINE', 
                 locked_by_request: str = None, domain_id: str = None, 
                 page_id: str = None, event_type: str = EventType.OTHER,
                 created_at: str = None, updated_at: str = None, 
                 properties: List[Parameter] = None):
        self.id = id
        self.tenant_id = tenant_id
        self.group_id = group_id
        self.name = name
        self.description = description
        self.is_active = is_active
        self.status = status
        self.locked_by_request = locked_by_request
        self.domain_id = domain_id
        self.page_id = page_id
        self.event_type = event_type
        self.created_at = created_at or get_now_str()
        self.updated_at = updated_at or get_now_str()
        self._properties = properties or [] # 聚合内持有的参数列表

    @property
    def properties(self) -> List[Parameter]:
        return self._properties
    
    def set_properties(self, props: List[Parameter]):
        self._properties = props

    # --- Domain Logic: Locking Mechanism ---
    
    def lock(self, request_id: str):
        """
        [业务核心] 尝试锁定埋点
        如果已被其他请求锁定，则抛出异常。这是 DDD 领域不变性保护的典型应用。
        """
        if self.locked_by_request and self.locked_by_request != request_id:
            raise ValueError(f"Event {self.name} is already locked by request {self.locked_by_request}")
        
        self.status = 'EDITING'
        self.locked_by_request = request_id
        self.updated_at = get_now_str()

    def unlock(self):
        """释放锁定"""
        self.status = 'ONLINE'
        self.locked_by_request = None
        self.updated_at = get_now_str()

    def update_content(self, name: str, description: str, domain_id: str, page_id: str, event_type: str):
        """更新埋点核心内容"""
        # 1. 语义校验：PV事件必须绑定页面
        if event_type == EventType.PV and not page_id:
            raise ValueError("PageView event must bind to a specific page")
            
        self.name = name
        self.description = description
        self.domain_id = domain_id
        self.page_id = page_id
        self.event_type = event_type
        self.updated_at = get_now_str()
