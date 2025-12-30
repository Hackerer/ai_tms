import unittest
from ai_tms.domain.asset.models import Event, EventType, Property

class TestAssetModels(unittest.TestCase):
    
    def test_event_locking_mechanism(self):
        """验证 Event 领域模型的互斥锁逻辑"""
        event = Event(id="EVT_1", tenant_id="T1", group_id="G1", name="test_evt", status="Online")
        
        # 1. 正常锁定
        event.lock("REQ_A")
        self.assertEqual(event.status, "Editing")
        self.assertEqual(event.locked_by_request, "REQ_A")
        
        # 2. 重复锁定（同一个请求）- 应当允许或忽略，目前实现是允许且无副作用
        event.lock("REQ_A")
        
        # 3. 冲突锁定（被 Request B 尝试锁定）- 应当抛出异常
        with self.assertRaises(ValueError):
            event.lock("REQ_B")
            
        # 4. 解锁
        event.unlock()
        self.assertEqual(event.status, "Online")
        self.assertIsNone(event.locked_by_request)

    def test_event_semantic_validation(self):
        """验证 PV 事件必须绑定 Page"""
        event = Event(id="EVT_2", tenant_id="T1", group_id="G1", name="pv_evt")
        
        # 1. 尝试设为 PV 但不给 page_id
        with self.assertRaises(ValueError):
            event.update_content(name="pv_evt", description="", domain_id=None, page_id=None, event_type=EventType.PV)
            
        # 2. 正常设置 PV
        event.update_content(name="pv_evt", description="", domain_id=None, page_id="PAGE_HOME", event_type=EventType.PV)
        self.assertEqual(event.event_type, EventType.PV)
        self.assertEqual(event.page_id, "PAGE_HOME")

if __name__ == '__main__':
    unittest.main()
