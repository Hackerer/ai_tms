import unittest
from ai_tms.domain.governance.models import User, TrackingGroup, GroupRole
from ai_tms.domain.asset.models import App, Page, Event, EventType

class TestPhase1And2Integration(unittest.TestCase):
    
    def test_governance_asset_linkage(self):
        """
        联合验证：治理域与资产域的逻辑链路
        场景：Alice (Governance) 在 App (Asset) 下创建 Group (Governance)，并负责 Event (Asset)。
        """
        # 1. Governance: 创建用户 Alice
        alice = User("USR_ALICE", "T1", "alice", "alice@test.com", "***", "admin")
        
        # 2. Asset: 创建 App
        # 验证点：App 的 owner_user_id 必须能对应到 User.id
        app = App("APP_01", "T1", "ShopApp", "iOS", owner_user_id=alice.id)
        self.assertEqual(app.owner_user_id, alice.id)
        
        # 3. Asset: 创建 Page 树
        home_page = Page("P_HOME", "T1", app.id, "首页", "/home", module="Main")
        cart_page = Page("P_CART", "T1", app.id, "购物车", "/cart", parent_id=home_page.id, module="Trade")
        
        # 验证点：Page 必须归属于正确的 App
        self.assertEqual(cart_page.app_id, app.id)
        self.assertEqual(cart_page.parent_id, home_page.id)
        
        # 4. Governance: 创建协作组 TrackingGroup
        # 验证点：Group 必须绑定到 App
        group = TrackingGroup("GRP_TRADE", "T1", app.id, "交易组")
        group.add_member(alice.id, GroupRole.SUPER_ADMIN)
        
        self.assertEqual(group.app_id, app.id)
        self.assertEqual(group.members[0].user_id, alice.id)
        
        # 5. Asset: 创建PV埋点
        # 验证点：Event 必须绑定到 Group (Governance) 和 Page (Asset)
        pv_event = Event(
            id="EVT_PV_CART",
            tenant_id="T1", 
            group_id=group.id,  # 跨域外键
            name="cart_view",
            page_id=cart_page.id, # 域内关联
            event_type=EventType.PV
        )
        
        # 6. 逻辑闭环断言
        # 确保 Event 能够通过 group_id 找到协作组上下文（模拟）
        self.assertEqual(pv_event.group_id, group.id)
        # 确保 Event 的页面关联有效
        self.assertEqual(pv_event.page_id, cart_page.id)
        
        # 7. 模拟业务校验：PV 事件必须要有 Page
        # 这是 Asset 域内部的逻辑，但需要外部 Governance 数据的配合（如 group_id）
        pv_event.update_content("cart_view_v2", "升级版", None, cart_page.id, EventType.PV)
        self.assertEqual(pv_event.name, "cart_view_v2")

if __name__ == '__main__':
    unittest.main()
