import os
import random
import uuid
from manger import TrackingManger
from config import DB_PATH

def seed_data():
    print("🚗 启动『滴滴出行』全链路模拟数据生成引擎...")
    
    # 初始化外观模式类
    mgr = TrackingManger(DB_PATH)
    
    # 1. 租户层: 滴滴出行
    tenant_name = "滴滴出行 (DiDi Global)"
    # 模拟幂等: 简单模拟，实际可通过 get_tenants 判断
    tenant = mgr.create_tenant(tenant_name, "领先的一站式移动出行平台")
    tid = tenant.id
    print(f"✅ 已创建租户: {tenant_name} [{tid}]")

    # 2. 用户与角色层
    users = {
        "admin": mgr.create_user(tid, "didi_admin", "admin@didiglobal.com", "admin123", "super_admin"),
        "pm_ride": mgr.create_user(tid, "pm_ride_hailing", "ride@didiglobal.com", "pw123", "pm"),
        "pm_bike": mgr.create_user(tid, "pm_bike", "bike@didiglobal.com", "pw123", "pm"),
        "pm_pay": mgr.create_user(tid, "pm_pay", "pay@didiglobal.com", "pw123", "pm"),
        "rd_dev": mgr.create_user(tid, "rd_engineer", "rd@didiglobal.com", "pw123", "developer")
    }
    print(f"✅ 已同步 5 位核心成员角色")

    # 3. 资产层: App 与 核心页面
    app = mgr.create_app(tid, "DiDi APP", "Mobile", users["pm_ride"].id)
    aid = app.id
    
    pages = [
        mgr.create_page(tid, aid, "首页 (Home)", "/main/home"),
        mgr.create_page(tid, aid, "呼叫页 (Calling)", "/ride/calling"),
        mgr.create_page(tid, aid, "行程中 (In-Trip)", "/ride/on_trip"),
        mgr.create_page(tid, aid, "单车首页 (Bike-Main)", "/bike/home"),
        mgr.create_page(tid, aid, "扫码开锁 (Unlock)", "/bike/unlock"),
        mgr.create_page(tid, aid, "支付页 (Payment)", "/pay/checkout")
    ]
    pids = [p.id for p in pages]
    print(f"✅ 已模拟 DiDi APP 及其 {len(pages)} 个核心业务页面")

    # 4. 协作组层: 按业务线划分
    groups = {
        "Ride": mgr.create_group(tid, aid, "网约车事业部", "负责快车、专车、豪华车业务", users["pm_ride"].id),
        "Bike": mgr.create_group(tid, aid, "两轮车事业部", "负责青桔单车、电单车业务", users["pm_bike"].id),
        "Pay": mgr.create_group(tid, aid, "金融支付中心", "负责滴滴支付、代金券、结算", users["pm_pay"].id)
    }
    print(f"✅ 已划分 {len(groups)} 个独立业务协作组")

    # 5. 核心：大批量生成埋点事件 (模拟 100+ 事件)
    # 我们将通过循环模拟不同部门的埋点
    total_events = 0
    event_types = ["Click", "PV", "Impression", "BizAction"]
    
    for g_name, group in groups.items():
        print(f"📦 正在为『{group.name}』批量注册埋点...")
        
        # 场景一：直接创建存量埋点 (通过 Repo 直接操作，模拟存量资产)
        # 这里为了符合逻辑，我们模拟通过 Request 应用生成
        req_title = f"{g_name} 业务线 Q4 存量埋点录入"
        creator_id = users[f"pm_{g_name.lower()}"].id
        request = mgr.create_request(req_title, creator_id, tid, group.id)
        
        # 每个组生成 35 个左右的埋点，总计超过 100
        for i in range(1, 40):
            evt_id = f"EVT_{g_name.upper()}_{i:03d}"
            evt_name = f"{g_name.lower()}_{random.choice(['btn', 'view', 'link', 'step'])}_{i}"
            evt_type = random.choice(event_types)
            page_id = random.choice(pids)
            
            # 丰富的参数模拟
            data = {
                "name": evt_name,
                "event_type": evt_type,
                "page_id": page_id,
                "description": f"模拟数据: {group.name} 的第 {i} 个核心指标",
                "custom_params": {
                    "city_id": random.randint(1, 500),
                    "is_new_user": random.choice([True, False]),
                    "strategy_id": f"STR_{random.randint(1000, 9999)}",
                    "device_level": random.choice(["High", "Mid", "Low"])
                }
            }
            # 如果是网约车，增加订单相关参数
            if g_name == "Ride":
                data["custom_params"].update({"order_type": random.randint(1, 10), "estimate_price": random.random()*100})
            
            mgr.add_event_change_to_request(request.id, tid, creator_id, evt_id, "create", data)
            total_events += 1

        # 模拟全流程：提交审批 -> 审批通过 -> 应用
        mgr.create_approval_task(request.id, "部门总监审批", users["admin"].id)
        # 获取任务 ID (实际中需从库里查，这里由于是模拟脚本，我们知道逻辑)
        tasks = mgr.get_approval_tasks(request.id)
        for t in tasks:
            mgr.process_approval(t.id, tid, users["admin"].id, "Approved", "自动批量录入确认")
        
        # 执行应用，埋点正式入库进入 Online 状态
        mgr._apply_request_changes_to_events(request.id, tid, users["admin"].id)
        
    print(f"🏁 任务完成！总计生成 {total_events} 个埋点。")
    print("-" * 50)
    print(f"💡 建议执行以下命令查看结果:")
    print(f"python3 cli.py event list --group {groups['Ride'].id}")
    print(f"python3 cli.py request list --group {groups['Pay'].id}")

if __name__ == "__main__":
    seed_data()
