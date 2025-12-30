import unittest
from ai_tms.domain.governance.models import User, TrackingGroup, GroupRole
from ai_tms.domain.asset.models import App, Page, Event, EventType
from ai_tms.domain.workflow.models import TrackingRequest, ApprovalNode

class TestOverallDomainLogic(unittest.TestCase):
    
    def test_full_lifecycle_logic(self):
        """
        场景：
        1. [Gov] Alice 建组，加 Bob。
        2. [Asset] 建页，建点。
        3. [Workflow] Bob 提单改点，Alice 审批，系统应用。
        """
        # --- PHASE 1: Governance Setup ---
        alice = User("USR_ALICE", "T1", "alice", "a@t.com", "**", "admin")
        bob = User("USR_BOB", "T1", "bob", "b@t.com", "**", "user")
        
        # Aggregate: TrackingGroup
        group = TrackingGroup("GRP_1", "T1", "APP_1", "TradeGroup")
        group.add_member(alice.id, GroupRole.SUPER_ADMIN)
        group.add_member(bob.id, GroupRole.MEMBER)
        
        self.assertEqual(len(group.members), 2)
        
        # --- PHASE 2: Asset Definition ---
        app = App("APP_1", "T1", "Mall", "iOS", alice.id)
        page = Page("P_CART", "T1", app.id, "购物车", "/cart")
        
        # Aggregate: Event (Initial State)
        event = Event(id="EVT_1", tenant_id="T1", group_id=group.id, name="cart_pv", page_id=page.id, event_type=EventType.PV)
        self.assertEqual(event.status, "Online")
        
        # --- PHASE 3: Workflow Execution ---
        
        # 1. Bob 提单 (Draft)
        req = TrackingRequest("REQ_1", "Update PV", "T1", group.id, bob.id)
        
        # 2. 加入变更数据 (Verify Field Preservation)
        # 模拟业务：将 params 修改，保持 page_id 不变
        change_data = {
            "name": "cart_pv_v2", 
            "page_id": page.id, 
            "event_type": EventType.PV,
            "description": "Updated desc"
        }
        req.add_event_change(event.id, "edit", change_data)
        
        self.assertEqual(len(req.event_references), 1)
        self.assertEqual(req.event_references[0].event_data['name'], "cart_pv_v2")
        
        # 3. 提交 (State Transition)
        req.submit(bob.id)
        self.assertEqual(req.status, "Reviewing")
        # Verify Log
        self.assertEqual(req.history_logs[-1].action, "Submit")
        self.assertEqual(req.history_logs[-1].user_id, bob.id)
        
        # 4. 模拟 Alice 审批通过
        node = ApprovalNode("NODE_1", req.id, "PM Review", alice.id)
        req.approve_node(node, alice.id, "Looks good")
        self.assertEqual(node.status, "Approved")
        self.assertEqual(req.history_logs[-1].action, "Approval:Approved")
        
        # --- PHASE 4: Applying Changes (Cross-Domain Interaction) ---
        
        # 1. 锁定资产 (Asset Domain Logic)
        event.lock(req.id)
        self.assertEqual(event.status, "Editing")
        self.assertEqual(event.locked_by_request, req.id)
        
        # 2. 更新资产内容 (Asset Domain Logic)
        # 模拟从 req.event_references 中提取数据并更新 event
        ref_data = req.event_references[0].event_data
        event.update_content(
            name=ref_data['name'], 
            description=ref_data['description'], 
            domain_id=None, 
            page_id=ref_data['page_id'], 
            event_type=ref_data['event_type']
        )
        self.assertEqual(event.name, "cart_pv_v2")
        
        # 3. 标记单据完成 (Workflow Domain Logic)
        req.mark_applied("SYSTEM")
        self.assertEqual(req.status, "Applied")
        # Verify Final Log Preservation
        self.assertEqual(req.history_logs[-1].action, "Applied")
        self.assertIn("所有变更已同步", req.history_logs[-1].message)

if __name__ == '__main__':
    unittest.main()
