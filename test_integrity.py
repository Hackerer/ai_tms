import os
import sys
import sqlite3
from manger import TrackingManger

def test_integrity():
    TEST_DB = "test_tms.db"
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)
    
    print("🚀 开始 TMS 功能完整性测试...")
    
    # 1. 初始化 Manager
    manager = TrackingManger(db_path=TEST_DB)
    
    # 初始化数据库表结构 (调用 TrackingAppService 的内部 init)
    # 假设 DatabaseManager 已经处理了表创建，或者我们需要显示调用
    manager.db_manager._init_db()
    print("✅ 数据库初始化完成")

    # 2. 创建租户
    tenant_name = "测试租户_Integrity"
    tenant_desc = "用于完整性测试的租户"
    tenant_obj = manager.create_tenant(tenant_name, tenant_desc)
    tenant_id = tenant_obj.id if hasattr(tenant_obj, 'id') else tenant_obj
    print(f"✅ 创建租户成功: ID={tenant_id}")

    # 3. 创建用户
    user_obj = manager.create_user(
        tenant_id=tenant_id,
        username="tester_admin",
        email="integrity@test.com",
        password="password123",
        role_id="admin"
    )
    user_id = user_obj.id if hasattr(user_obj, 'id') else user_obj
    print(f"✅ 创建用户成功: ID={user_id}")

    # 4. 创建应用
    app_obj = manager.create_app(
        tenant_id=tenant_id,
        name="测试应用",
        platform="Web",
        owner_id=user_id
    )
    app_id = app_obj.id if hasattr(app_obj, 'id') else app_obj
    print(f"✅ 创建应用成功: ID={app_id}")

    # 5. 创建协作组
    group_obj = manager.create_group(
        tenant_id=tenant_id,
        app_id=app_id,
        name="核心开发组",
        description="负责核心功能的协作组",
        creator_id=user_id
    )
    group_id = group_obj.id if hasattr(group_obj, 'id') else group_obj
    print(f"✅ 创建协作组成功: ID={group_id}")

    # 6. 创建页面
    page_obj = manager.create_page(
        tenant_id=tenant_id,
        app_id=app_id,
        name="首页",
        path="/home",
        module="Market"
    )
    page_id = page_obj.id if hasattr(page_obj, 'id') else page_obj
    print(f"✅ 创建页面成功: ID={page_id}")

    # 7. 创建需求单
    request_obj = manager.create_request(
        title="2025Q1 数据治理需求",
        creator_id=user_id,
        tenant_id=tenant_id,
        group_id=group_id,
        doc_url="http://wiki.test.com/req/123"
    )
    request_id = request_obj.id if hasattr(request_obj, 'id') else request_obj
    print(f"✅ 创建需求单成功: ID={request_id}")

    # 8. 添加埋点变更
    event_data = {
        "name": "login_click",
        "description": "登录按钮点击",
        "page_id": page_id,
        "app_ids": [app_id], # 添加应用关联
        "properties": [
            {"name": "button_color", "data_type": "string", "category": "common", "description": "按钮颜色"},
            {"name": "timestamp", "data_type": "number", "category": "common", "description": "点击时间戳"}
        ]
    }
    
    change_id = manager.add_event_change_to_request(
        request_id=request_id,
        tenant_id=tenant_id,
        user_id=user_id,
        event_id=manager.generate_id("EVT"), # 新增埋点需要一个 ID
        operation="create", # 注意：domain 层期待小写 'create'
        event_data=event_data
    )
    print(f"✅ 添加埋点变更成功: ChangeID={change_id}")

    # 9. 创建审批任务
    task_id = manager.create_approval_task(
        request_id=request_id,
        node_name="技术评审",
        approver_id=user_id
    )
    print(f"✅ 创建审批任务成功: TaskID={task_id}")

    # 10. 处理审批 - 通过
    manager.process_approval(
        task_id=task_id,
        tenant_id=tenant_id,
        user_id=user_id,
        status="Approved", # 注意：domain 层可能期待 'Approved'
        comment="逻辑正确，准予上线"
    )
    print("✅ 审批通过")

    # 11. 应用变更 (此步骤通常由 System 或 Admin 在审批通过后触发，或在 process_approval 内部自动触发)
    # 查看 manger.py 第 98 行: _apply_request_changes_to_events
    manager._apply_request_changes_to_events(request_id, tenant_id, user_id)
    print("✅ 需求单变更已应用到资产库")

    # 12. 最终验证
    events = manager.get_events(group_id)
    assert len(events) > 0, "资产库中应至少有一个埋点"
    
    target_event = next((e for e in events if e.name == "login_click"), None)
    assert target_event is not None, "未找到名为 login_click 的埋点"
    print(f"✅ 资产库验证成功: 发现埋点 '{target_event.name}'")

    props = manager.get_properties_by_event(target_event.id, tenant_id)
    assert len(props) == 2, f"参数数量应为 2，实际为 {len(props)}"
    print(f"✅ 参数验证成功: 发现 {len(props)} 个关联参数")

    print("\n🎉 TMS 功能完整性测试通过！")

if __name__ == "__main__":
    try:
        test_integrity()
    except Exception as e:
        print(f"\n❌ 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
