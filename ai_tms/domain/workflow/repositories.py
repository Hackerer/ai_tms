from abc import ABC, abstractmethod
from typing import Optional, List
from .models import TrackingRequest, ApprovalNode, EventVersion

class IWorkflowRepository(ABC):
    """
    工作流仓储接口
    负责 TrackingRequest Aggregate Root 的完整存取。
    """
    
    @abstractmethod
    def save_request(self, request: TrackingRequest) -> TrackingRequest:
        """
        保存需求单。
        注意：实现层必须序列化 history_logs 和 event_references 为 JSON 字符串存入 SQLite。
        """
        pass

    @abstractmethod
    def get_request_by_id(self, request_id: str) -> Optional[TrackingRequest]:
        """
        获取需求单。
        注意：实现层必须反序列化 JSON 字段为对象列表。
        """
        pass

    # --- Approval Nodes ---
    @abstractmethod
    def save_approval_node(self, node: ApprovalNode) -> ApprovalNode:
        pass
    
    @abstractmethod
    def get_approval_node(self, node_id: str) -> Optional[ApprovalNode]:
        pass

    # --- Versioning ---
    @abstractmethod
    def save_version(self, version: EventVersion) -> EventVersion:
        """保存版本快照"""
        pass

    @abstractmethod
    def get_latest_version(self, event_id: str) -> Optional[int]:
        """获取特定埋点的最新版本号"""
        pass

    # --- ID Generation ---
    @abstractmethod
    def next_identity(self, prefix: str) -> str:
        pass
