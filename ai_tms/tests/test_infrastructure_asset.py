import unittest
import os
import sqlite3
from database.db_manager import DatabaseManager
from ai_tms.domain.asset.models import Event, EventType, Parameter, EnumOption, Page, App
from ai_tms.infrastructure.persistence.asset_repo import SqliteAssetRepository, SqlitePageRepository

class TestAssetInfrastructure(unittest.TestCase):
    DB_FILE = "TestInfraAsset.db"

    def setUp(self):
        if os.path.exists(self.DB_FILE): os.remove(self.DB_FILE)
        self.db_mgr = DatabaseManager(self.DB_FILE)
        self.asset_repo = SqliteAssetRepository(self.db_mgr)
        self.page_repo = SqlitePageRepository(self.db_mgr)
        
    def tearDown(self):
        if os.path.exists(self.DB_FILE): os.remove(self.DB_FILE)

    def test_page_tree_persistence(self):
        """验证 Page 树形存取"""
        p1 = Page("P1", "T1", "APP1", "Root", "/root")
        p2 = Page("P2", "T1", "APP1", "Child", "/child", parent_id=p1.id)
        
        self.page_repo.save_page(p1)
        self.page_repo.save_page(p2)
        
        loaded_p2 = self.page_repo.get_page_by_id("P2")
        self.assertEqual(loaded_p2.parent_id, "P1")
        
        pages = self.page_repo.get_pages_by_app("APP1", "T1")
        self.assertEqual(len(pages), 2)

    def test_event_aggregate_persistence(self):
        """验证 Event 聚合根（包含 Property 级联）"""
        # 1. 构造复杂 Event
        prop = Parameter("PRP_1", "T1", "Status", "string", "Basic", description="Test Prop")
        prop.enum_options = [EnumOption("1", "Active", "Descr")]
        
        event = Event("E1", "T1", "G1", "test_evt", page_id="P1", event_type=EventType.CLK)
        event.set_properties([prop])
        
        # 2. 保存
        self.asset_repo.save_event(event)
        
        # 3. 读取并验证
        loaded = self.asset_repo.get_event_by_id("E1")
        self.assertEqual(loaded.event_type, EventType.CLK)
        self.assertEqual(len(loaded.properties), 1)
        self.assertEqual(loaded.properties[0].name, "Status")
        self.assertEqual(loaded.properties[0].enum_options[0].label, "Active")
        # 验证枚举细节保留
        self.assertEqual(loaded.properties[0].enum_options[0].description, "Descr")

    def test_lock_persistence(self):
        """验证锁状态变更的轻量级更新"""
        event = Event("E2", "T1", "G1", "lock_test")
        self.asset_repo.save_event(event)
        
        event.lock("REQ_999")
        self.asset_repo.lock_event(event) # 只更新状态
        
        loaded = self.asset_repo.get_event_by_id("E2")
        self.assertEqual(loaded.status, "EDITING")
        self.assertEqual(loaded.locked_by_request, "REQ_999")

    def test_list_queries(self):
        """验证新加入的列表查询方法"""
        # 1. Apps List
        self.asset_repo.save_app(App("A1", "T1", "App1", "iOS", "U1"))
        self.asset_repo.save_app(App("A2", "T1", "App2", "Android", "U1"))
        apps = self.asset_repo.get_apps("T1")
        self.assertEqual(len(apps), 2)
        
        # 2. Events List
        self.asset_repo.save_event(Event("E1", "T1", "G1", "evt1"))
        self.asset_repo.save_event(Event("E2", "T1", "G1", "evt2"))
        self.asset_repo.save_event(Event("E3", "T1", "G2", "evt3"))
        
        events_g1 = self.asset_repo.get_events_by_group("G1")
        self.assertEqual(len(events_g1), 2)
        self.assertEqual(set(e.id for e in events_g1), {"E1", "E2"})

if __name__ == '__main__':
    unittest.main()
