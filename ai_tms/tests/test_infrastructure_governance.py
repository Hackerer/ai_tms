import unittest
import os
import sqlite3
from database.db_manager import DatabaseManager
from ai_tms.domain.governance.models import User, TrackingGroup, GroupRole, GroupMember, Tenant
from ai_tms.infrastructure.persistence.governance_repo import SqliteGovernanceRepository

class TestGovernanceInfrastructure(unittest.TestCase):
    DB_FILE = "TestInfraGov.db"

    def setUp(self):
        if os.path.exists(self.DB_FILE): os.remove(self.DB_FILE)
        self.db_mgr = DatabaseManager(self.DB_FILE)
        self.repo = SqliteGovernanceRepository(self.db_mgr)
        
    def tearDown(self):
        if os.path.exists(self.DB_FILE): os.remove(self.DB_FILE)

    def test_save_and_load_aggregate(self):
        """验证 TrackingGroup 聚合根的完整持久化"""
        # 1. 准备数据
        group = TrackingGroup("GRP_1", "T1", "APP_1", "TradeGroup")
        group.add_member("USER_A", GroupRole.ADMIN)
        group.add_member("USER_B", GroupRole.MEMBER)
        
        # 2. 保存
        saved_group = self.repo.save_group(group)
        self.assertEqual(len(saved_group.members), 2)
        
        # 3. 读取 (从新连接)
        loaded_group = self.repo.get_group_by_id("GRP_1", "T1")
        self.assertIsNotNone(loaded_group)
        self.assertEqual(loaded_group.name, "TradeGroup")
        self.assertEqual(len(loaded_group.members), 2)
        
        # 4. 验证成员细节
        role_a = loaded_group.get_member_role("USER_A")
        self.assertEqual(role_a, GroupRole.ADMIN)

    def test_user_persistence(self):
        """验证 User 实体的持久化"""
        user = User("U1", "T1", "bob", "b@t.com", "***", "guest")
        self.repo.save_user(user)
        
        loaded = self.repo.get_user_by_username("T1", "bob")
        self.assertEqual(loaded.email, "b@t.com")
        self.assertTrue(loaded.is_active)

    def test_list_queries(self):
        """验证新加入的列表查询方法"""
        # 1. Tenants List
        self.repo.save_tenant(Tenant("T1", "Tenant1", "desc"))
        self.repo.save_tenant(Tenant("T2", "Tenant2", "desc"))
        tenants = self.repo.get_tenants()
        self.assertEqual(len(tenants), 2)
        
        # 2. Users List
        self.repo.save_user(User("U1", "T1", "alice", "a@t.com", "pw", "role"))
        self.repo.save_user(User("U2", "T1", "bob", "b@t.com", "pw", "role"))
        users = self.repo.get_users_by_tenant("T1")
        self.assertEqual(len(users), 2)

if __name__ == '__main__':
    unittest.main()
