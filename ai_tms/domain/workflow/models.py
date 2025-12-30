from datetime import datetime
from typing import List, Optional, Dict, Any
import json

def get_now_str():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# --- Value Objects ---

class HistoryLog:
    """审计日志值对象"""
    def __init__(self, user_id: str, action: str, message: str, timestamp: str = None):
        self.user_id = user_id
        self.action = action
        self.message = message
        self.timestamp = timestamp or get_now_str()

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "action": self.action,
            "message": self.message,
            "timestamp": self.timestamp
        }

class EventRef:
    """变更引用值对象 (对应 event_references JSON 中的一项)"""
    def __init__(self, event_id: str, operation: str, event_data: Dict[str, Any]):
        self.event_id = event_id
        self.operation = operation # 'create', 'edit', 'delete'
        self.event_data = event_data # 包含 page_id, event_type 等全量数据

    def to_dict(self):
        return {
            "event_id": self.event_id,
            "operation": self.operation,
            "event_data": self.event_data
        }

# --- Entities ---

class ApprovalNode:
    """审批节点实体"""
    def __init__(self, id: str, request_id: str, node_name: str, approver_user_id: str, 
                 status: str = 'Pending', comment: str = "", processed_at: str = None):
        self.id = id
        self.request_id = request_id
        self.node_name = node_name
        self.approver_user_id = approver_user_id
        self.status = status
        self.comment = comment
        self.processed_at = processed_at

class EventVersion:
    """版本快照实体"""
    def __init__(self, id: Optional[int], event_id: str, request_id: str, tenant_id: str, 
                 version: int, event_data: str, change_description: str, 
                 created_user_id: str, created_at: str = None):
        self.id = id
        self.event_id = event_id
        self.request_id = request_id
        self.tenant_id = tenant_id
        self.version = version
        self.event_data = event_data # JSON string
        self.change_description = change_description
        self.created_user_id = created_user_id
        self.created_at = created_at or get_now_str()

# --- Aggregate Root: TrackingRequest ---

class TrackingRequest:
    """
    埋点需求单 (Aggregate Root)
    核心亮点：
    1. 自我管理审计日志 (history_logs)
    2. 自我管理变更集 (event_references)
    3. 内聚状态流转逻辑
    """
    def __init__(self, id: str, title: str, tenant_id: str, group_id: str, created_user_id: str, 
                 status: str = 'Draft', created_at: str = None, 
                 event_references: List[EventRef] = None, 
                 history_logs: List[HistoryLog] = None, 
                 doc_url: str = ""):
        self.id = id
        self.title = title
        self.tenant_id = tenant_id
        self.group_id = group_id
        self.created_user_id = created_user_id
        self.status = status
        self.created_at = created_at or get_now_str()
        self._event_references = event_references or []
        self._history_logs = history_logs or []
        self.doc_url = doc_url

    @property
    def event_references(self) -> List[EventRef]:
        return self._event_references
    
    @property
    def history_logs(self) -> List[HistoryLog]:
        return self._history_logs

    # --- Domain Logic ---

    def add_log(self, user_id: str, action: str, message: str):
        """核心：追加审计日志"""
        log = HistoryLog(user_id, action, message)
        self._history_logs.append(log)

    def add_event_change(self, event_id: str, operation: str, data: Dict[str, Any]):
        """核心：增加变更项"""
        # 简单去重逻辑：如果已存在同ID的操作，则覆盖（或根据业务需求抛错）
        self._event_references = [ref for ref in self._event_references if ref.event_id != event_id]
        new_ref = EventRef(event_id, operation, data)
        self._event_references.append(new_ref)

    def submit(self, user_id: str):
        if self.status != 'Draft':
            raise ValueError("Only Draft requests can be submitted")
        self.status = 'Reviewing'
        self.add_log(user_id, "Submit", "需求提交审批")

    def approve_node(self, node: ApprovalNode, user_id: str, comment: str):
        """审批节点通过逻辑"""
        node.status = 'Approved'
        node.comment = comment
        node.processed_at = get_now_str()
        self.add_log(user_id, "Approval:Approved", f"节点 {node.node_name} 审批通过: {comment}")

    def reject_node(self, node: ApprovalNode, user_id: str, comment: str):
        """审批节点拒绝逻辑"""
        node.status = 'Rejected'
        node.comment = comment
        node.processed_at = get_now_str()
        self.status = 'Rejected' # 整个需求单打回
        self.add_log(user_id, "Approval:Rejected", f"节点 {node.node_name} 审批拒绝: {comment}")

    def mark_applied(self, user_id: str):
        """
        标记需求单为已应用状态
        注意：实际的应用逻辑（数据写入）由应用服务协调，但状态变更和日志记录在此处内聚。
        """
        if self.status != 'Reviewing' and self.status != 'Approved':
             # 实际业务中可能需要严格校验 'Approved'，这里为兼容旧逻辑放宽到 Reviewing
             pass 
        
        self.status = 'Applied'
        self.add_log(user_id, "Applied", "所有变更已同步至生产环境，版本已归档。")
