import unittest
from ai_tms.domain.governance.models import User, TrackingGroup, GroupRole, Role, PermissionPolicy

class TestGovernanceModels(unittest.TestCase):
    
    def test_user_flask_login_compatibility(self):
        """验证 User 实体必须兼容 Flask-Login"""
        user = User(
            id="USR_001", 
            tenant_id="T1", 
            username="alice", 
            email="a@test.com", 
            password_hash="***", 
            role_id="admin"
        )
        # 1. 验证 get_id() 返回字符串
        self.assertEqual(user.get_id(), "USR_001")
        # 2. 验证 is_active 属性
        self.assertTrue(user.is_active)
        # 3. 验证混合属性访问
        self.assertEqual(user.email, "a@test.com")

    def test_tracking_group_member_management(self):
        """验证 TrackingGroup 聚合根的成员管理逻辑"""
        group = TrackingGroup(
            id="GRP_001", 
            tenant_id="T1", 
            app_id="APP_X", 
            name="Test Group"
        )
        
        # 1. 初始为空
        self.assertEqual(len(group.members), 0)
        
        # 2. 添加成员 Bob 作为 Admin
        group.add_member("USER_BOB", GroupRole.ADMIN)
        self.assertEqual(len(group.members), 1)
        self.assertEqual(group.get_member_role("USER_BOB"), GroupRole.ADMIN)
        
        # 3. 更新成员 Bob 为 Member (覆盖逻辑验证)
        group.add_member("USER_BOB", GroupRole.MEMBER)
        self.assertEqual(len(group.members), 1) # 长度应仍为 1
        self.assertEqual(group.get_member_role("USER_BOB"), GroupRole.MEMBER) # 角色应变更
        
        # 4. 移除成员
        group.remove_member("USER_BOB")
        self.assertEqual(len(group.members), 0)

    def test_role_factory_policy(self):
        """验证 Role 实体的工厂方法与策略加载"""
        role = Role.create_default("ROLE_001", "T1", "admin")
        
        self.assertEqual(role.name, "admin")
        # 验证是否加载了默认权限
        expected_perms = PermissionPolicy.get_defaults()['admin']
        self.assertEqual(role.permissions, expected_perms)
        self.assertIn('manage_tenant', role.permissions)

if __name__ == '__main__':
    unittest.main()
