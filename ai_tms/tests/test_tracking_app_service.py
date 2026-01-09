import unittest
import os
from database.db_manager import DatabaseManager
from ai_tms.application.tracking_app_service import TrackingAppService

class TestTrackingAppService(unittest.TestCase):
    DB_FILE = "TestAppService.db"

    def setUp(self):
        if os.path.exists(self.DB_FILE): os.remove(self.DB_FILE)
        self.db_mgr = DatabaseManager(self.DB_FILE)
        self.app_service = TrackingAppService(self.db_mgr)
        
    def tearDown(self):
        if os.path.exists(self.DB_FILE): os.remove(self.DB_FILE)

    def test_full_business_workflow(self):
        """
        全业务流集成测试
        """
        # 1. 基础环境设置
        tenant = self.app_service.create_tenant("极客学院", "测试租户")
        user_admin = self.app_service.create_user(tenant.id, "admin", "admin@test.com", "123", "super_admin")
        user_pm = self.app_service.create_user(tenant.id, "pm_bob", "bob@test.com", "123", "pm")
        
        app = self.app_service.create_app(tenant.id, "课程App", "Web", user_pm.id)
        group = self.app_service.create_group(tenant.id, app.id, "课程组", "负责课程相关埋点", user_pm.id)
        page = self.app_service.create_page(tenant.id, app.id, "详情页", "/detail")
        
        # 2. 初始埋点 (Online)
        # 注意：这里我们模拟一个已存在的埋点，或者先通过 Request 创建一个。
        # 为了简化，我们假设直接创建了一个存量埋点（实际业务中应走 Request）
        # 这里我们直接操作 repo 来制造初始数据
        from ai_tms.domain.asset.models import Event
        init_event = Event("E1", tenant.id, group.id, "view_course", page_id=page.id)
        self.app_service.asset_repo.save_event(init_event)
        
        # 3. 创建需求单发起变更 (Edit)
        req = self.app_service.create_request(tenant.id, group.id, "修改埋点名称", user_pm.id)
        
        change_data = {"name": "view_course_v2", "page_id": page.id}
        success = self.app_service.add_event_change_to_request(req.id, tenant.id, user_pm.id, "E1", "edit", change_data)
        self.assertTrue(success)
        
        # 验证锁状态
        loaded_event = self.app_service.asset_repo.get_event_by_id("E1")
        self.assertEqual(loaded_event.status, "EDITING")
        self.assertEqual(loaded_event.locked_by_request, req.id)
        
        # 4. 审批流
        task_id = self.app_service.create_approval_task(req.id, "业务审批", user_admin.id)
        self.app_service.process_approval(task_id, tenant.id, user_admin.id, "APPROVED", "准许修改")
        
        # 5. 应用变更
        apply_success = self.app_service.apply_request(req.id, tenant.id, user_admin.id)
        self.assertTrue(apply_success)
        
        # 6. 最终验证
        final_event = self.app_service.asset_repo.get_event_by_id("E1")
        self.assertEqual(final_event.name, "view_course_v2")
        self.assertEqual(final_event.status, "ONLINE") # 自动解锁并回到在线状态
        self.assertIsNone(final_event.locked_by_request)
        
        final_req = self.app_service.flow_repo.get_request_by_id(req.id)
        self.assertEqual(final_req.status, "APPLIED")

if __name__ == '__main__':
    unittest.main()
