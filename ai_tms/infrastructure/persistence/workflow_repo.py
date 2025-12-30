import sqlite3
import uuid
import json
from typing import Optional, List, Dict
from ai_tms.domain.workflow.models import TrackingRequest, ApprovalNode, EventVersion, HistoryLog, EventRef
from ai_tms.domain.workflow.repositories import IWorkflowRepository

class SqliteWorkflowRepository(IWorkflowRepository):
    def __init__(self, db_manager):
        self.db_manager = db_manager

    def _get_conn(self):
        return self.db_manager.get_connection()

    def next_identity(self, prefix: str) -> str:
        return f"{prefix}-{uuid.uuid4().hex[:12]}"

    # --- Approval Nodes ---
    def save_approval_node(self, node: ApprovalNode) -> ApprovalNode:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO approval_tasks (id, request_id, node_name, approver_user_id, status, comment, processed_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?) "
                "ON CONFLICT(id) DO UPDATE SET status=excluded.status, comment=excluded.comment, processed_at=excluded.processed_at",
                (node.id, node.request_id, node.node_name, node.approver_user_id, node.status, node.comment, node.processed_at)
            )
            conn.commit()
            return node
        finally:
            conn.close()

    def get_approval_node(self, node_id: str) -> Optional[ApprovalNode]:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM approval_tasks WHERE id = ?", (node_id,))
            r = cursor.fetchone()
            if not r: return None
            return ApprovalNode(r['id'], r['request_id'], r['node_name'], r['approver_user_id'], r['status'], r['comment'], r['processed_at'])
        finally:
            conn.close()

    def get_approval_tasks_by_request(self, request_id: str) -> List[ApprovalNode]:
        """获取需求单下的所有审批任务"""
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM approval_tasks WHERE request_id = ?", (request_id,))
            return [ApprovalNode(r['id'], r['request_id'], r['node_name'], r['approver_user_id'], r['status'], r['comment'], r['processed_at']) for r in cursor.fetchall()]
        finally:
            conn.close()

    # --- Versioning ---
    def save_version(self, version: EventVersion) -> EventVersion:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            # 版本表通常只增不改
            cursor.execute(
                "INSERT INTO event_versions (event_id, request_id, tenant_id, version, event_data, change_description, created_user_id, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (version.event_id, version.request_id, version.tenant_id, version.version, version.event_data, version.change_description, version.created_user_id, version.created_at)
            )
            conn.commit()
            return version
        finally:
            conn.close()

    def get_latest_version(self, event_id: str) -> Optional[int]:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT MAX(version) as v FROM event_versions WHERE event_id = ?", (event_id,))
            row = cursor.fetchone()
            return row['v'] if row['v'] else 0
        finally:
            conn.close()

    # --- TrackingRequest (Complex JSON Handling) ---
    def save_request(self, request: TrackingRequest) -> TrackingRequest:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            
            # 1. Serialize Value Objects to JSON
            logs_json = json.dumps([log.to_dict() for log in request.history_logs])
            refs_json = json.dumps([ref.to_dict() for ref in request.event_references])
            
            cursor.execute(
                "INSERT INTO tracking_requests (id, tenant_id, group_id, title, created_user_id, status, event_references, history_logs, doc_url, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) "
                "ON CONFLICT(id) DO UPDATE SET status=excluded.status, event_references=excluded.event_references, history_logs=excluded.history_logs, doc_url=excluded.doc_url",
                (request.id, request.tenant_id, request.group_id, request.title, request.created_user_id, request.status, refs_json, logs_json, request.doc_url, request.created_at)
            )
            conn.commit()
            return request
        finally:
            conn.close()

    def get_request_by_id(self, request_id: str) -> Optional[TrackingRequest]:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tracking_requests WHERE id = ?", (request_id,))
            row = cursor.fetchone()
            if not row: return None
            
            # 2. Deserialize JSON to Domain Objects
            logs_data = json.loads(row['history_logs']) if row['history_logs'] else []
            history_logs = [HistoryLog(l['user_id'], l['action'], l['message'], l['timestamp']) for l in logs_data]
            
            refs_data = json.loads(row['event_references']) if row['event_references'] else []
            event_refs = [EventRef(r['event_id'], r['operation'], r['event_data']) for r in refs_data]
            
            return TrackingRequest(
                id=row['id'], title=row['title'], tenant_id=row['tenant_id'], group_id=row['group_id'], 
                created_user_id=row['created_user_id'], status=row['status'], created_at=row['created_at'],
                event_references=event_refs, history_logs=history_logs, doc_url=row['doc_url']
            )
        finally:
            conn.close()

    def get_requests_by_group(self, group_id: str) -> List[TrackingRequest]:
        """获取协作组下的所有需求单"""
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tracking_requests WHERE group_id = ?", (group_id,))
            requests = []
            for row in cursor.fetchall():
                logs_data = json.loads(row['history_logs']) if row['history_logs'] else []
                history_logs = [HistoryLog(l['user_id'], l['action'], l['message'], l['timestamp']) for l in logs_data]
                
                refs_data = json.loads(row['event_references']) if row['event_references'] else []
                event_refs = [EventRef(r['event_id'], r['operation'], r['event_data']) for r in refs_data]
                
                requests.append(TrackingRequest(
                    id=row['id'], title=row['title'], tenant_id=row['tenant_id'], group_id=row['group_id'], 
                    created_user_id=row['created_user_id'], status=row['status'], created_at=row['created_at'],
                    event_references=event_refs, history_logs=history_logs, doc_url=row['doc_url']
                ))
            return requests
        finally:
            conn.close()
