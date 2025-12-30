import unittest
import os
import sqlite3
from database.db_manager import DatabaseManager
from ai_tms.domain.workflow.models import TrackingRequest, HistoryLog, EventRef
from ai_tms.infrastructure.persistence.workflow_repo import SqliteWorkflowRepository

class TestWorkflowInfrastructure(unittest.TestCase):
    DB_FILE = "TestInfraFlow.db"

    def setUp(self):
        if os.path.exists(self.DB_FILE): os.remove(self.DB_FILE)
        self.db_mgr = DatabaseManager(self.DB_FILE)
        self.repo = SqliteWorkflowRepository(self.db_mgr)
        
    def tearDown(self):
        if os.path.exists(self.DB_FILE): os.remove(self.DB_FILE)

    def test_request_json_serialization(self):
        """验证 TrackingRequest 的复杂 JSON 字段持久化"""
        req = TrackingRequest("REQ_1", "Test Req", "T1", "G1", "USER_A")
        
        # 1. 增加 logs 和 refs
        req.add_log("USER_A", "Created", "Start")
        req.add_log("USER_B", "Edited", "More info")
        
        req.add_event_change("EVT_1", "edit", {"name": "new_name", "page_id": "P1"})
        
        # 2. 保存
        self.repo.save_request(req)
        
        # 3. 读取并验证
        loaded = self.repo.get_request_by_id("REQ_1")
        
        # 验证 Logs
        self.assertEqual(len(loaded.history_logs), 2)
        self.assertEqual(loaded.history_logs[0].action, "Created")
        self.assertEqual(loaded.history_logs[1].user_id, "USER_B")
        
        # 验证 Refs
        self.assertEqual(len(loaded.event_references), 1)
        self.assertEqual(loaded.event_references[0].event_data['name'], "new_name")
        self.assertEqual(loaded.event_references[0].event_data['page_id'], "P1")

    def test_list_queries(self):
        """验证新加入的列表查询方法"""
        # 1. Requests List
        self.repo.save_request(TrackingRequest("R1", "Title1", "T1", "G1", "U1"))
        self.repo.save_request(TrackingRequest("R2", "Title2", "T1", "G1", "U1"))
        reqs = self.repo.get_requests_by_group("G1")
        self.assertEqual(len(reqs), 2)
        
        # 2. Approval Tasks List
        from ai_tms.domain.workflow.models import ApprovalNode
        self.repo.save_approval_node(ApprovalNode("TSK1", "R1", "Node1", "U1"))
        self.repo.save_approval_node(ApprovalNode("TSK2", "R1", "Node2", "U2"))
        tasks = self.repo.get_approval_tasks_by_request("R1")
        self.assertEqual(len(tasks), 2)

if __name__ == '__main__':
    unittest.main()
