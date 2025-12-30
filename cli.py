#!/usr/bin/env python3
"""
TMS (Tracking Management System) CLI 工具

使用示例：
    # 初始化系统
    python cli.py init
    
    # 创建租户
    python cli.py tenant create --name "我的公司" --desc "测试租户"
    
    # 创建用户
    python cli.py user create --tenant T1 --username alice --email a@test.com --password 123456 --role admin
    
    # 创建应用
    python cli.py app create --tenant T1 --name "电商App" --platform iOS --owner USR_1
    
    # 创建页面
    python cli.py page create --tenant T1 --app APP_1 --name "首页" --path "/home"
    
    # 创建协作组
    python cli.py group create --tenant T1 --app APP_1 --name "交易组" --desc "负责交易埋点" --creator USR_1
    
    # 创建需求单
    python cli.py request create --tenant T1 --group GRP_1 --title "新增购物车埋点" --creator USR_1
    
    # 创建审批任务
    python cli.py approval create --request REQ_1 --name "业务评审" --approver USR_2
    
    # 处理审批
    python cli.py approval process --task TSK_1 --tenant T1 --user USR_2 --status Approved --comment "同意"
    
    # 应用变更
    python cli.py request apply --request REQ_1 --tenant T1 --user USR_1
"""

EXAMPLE_USAGE = __doc__

import argparse
import sys
from manger import TrackingManger
from config import DB_PATH

def init_system(args):
    """初始化系统（创建数据库表）"""
    mgr = TrackingManger(args.db)
    print(f"✅ 系统初始化成功！数据库文件：{args.db}")

def create_tenant(args):
    """创建租户"""
    mgr = TrackingManger(args.db)
    tenant = mgr.create_tenant(args.name, args.description or "")
    print(f"✅ 租户创建成功！ID: {tenant.id}, 名称: {tenant.name}")

def list_tenants(args):
    """获取租户列表"""
    mgr = TrackingManger(args.db)
    tenants = mgr.get_tenants()
    if not tenants:
        print("📭 暂无租户")
        return
    print(f"{'ID':<20} | {'名称':<20} | {'创建时间'}")
    print("-" * 60)
    for t in tenants:
        print(f"{t.id:<20} | {t.name:<20} | {t.created_at}")

def create_user(args):
    """创建用户"""
    mgr = TrackingManger(args.db)
    user = mgr.create_user(args.tenant, args.username, args.email, args.password, args.role)
    print(f"✅ 用户创建成功！ID: {user.id}, 账号: {user.username}")

def list_users(args):
    """获取用户列表"""
    mgr = TrackingManger(args.db)
    users = mgr.get_users(args.tenant)
    if not users:
        print(f"📭 租户 {args.tenant} 下暂无用户")
        return
    print(f"{'ID':<20} | {'用户名':<20} | {'邮箱'}")
    print("-" * 60)
    for u in users:
        print(f"{u.id:<20} | {u.username:<20} | {u.email}")

def create_app(args):
    """创建应用"""
    mgr = TrackingManger(args.db)
    app = mgr.create_app(args.tenant, args.name, args.platform, args.owner)
    print(f"✅ 应用创建成功！ID: {app.id}, AppKey: {app.app_key}")

def list_apps(args):
    """获取应用列表"""
    mgr = TrackingManger(args.db)
    apps = mgr.get_apps(args.tenant)
    if not apps:
        print(f"📭 租户 {args.tenant} 下暂无应用")
        return
    print(f"{'ID':<20} | {'名称':<20} | {'平台'}")
    print("-" * 60)
    for a in apps:
        print(f"{a.id:<20} | {a.name:<20} | {a.platform}")

def create_page(args):
    """创建页面"""
    mgr = TrackingManger(args.db)
    page = mgr.create_page(args.tenant, args.app, args.name, args.path, args.parent, args.module or "", args.desc or "")
    print(f"✅ 页面创建成功！ID: {page.id}, 名称: {page.name}, 路径: {page.path}")

def list_pages(args):
    """列出应用的所有页面"""
    mgr = TrackingManger(args.db)
    pages = mgr.get_pages_by_app(args.app, args.tenant)
    if not pages:
        print("📭 该应用下暂无页面")
        return
    print(f"📄 应用 {args.app} 的页面列表：")
    for p in pages:
        parent_info = f" (父页面: {p.parent_id})" if p.parent_id else ""
        print(f"  - {p.name} ({p.id}): {p.path}{parent_info}")

def create_group(args):
    """创建协作组"""
    mgr = TrackingManger(args.db)
    group = mgr.create_group(args.tenant, args.app, args.name, args.description or "", args.creator)
    print(f"✅ 协作组创建成功！ID: {group.id}, 成员数: {len(group.members)}")

def list_groups(args):
    """获取协作组列表"""
    mgr = TrackingManger(args.db)
    groups = mgr.get_groups(args.app, args.tenant)
    if not groups:
        print(f"📭 应用 {args.app} 下暂无协作组")
        return
    print(f"{'ID':<20} | {'名称':<20} | {'成员数'}")
    print("-" * 60)
    for g in groups:
        print(f"{g.id:<20} | {g.name:<20} | {len(g.members)}")

def list_events(args):
    """获取埋点列表"""
    mgr = TrackingManger(args.db)
    events = mgr.get_events(args.group)
    if not events:
        print(f"📭 协作组 {args.group} 下暂无埋点")
        return
    print(f"{'ID':<20} | {'名称':<25} | {'类型':<10} | {'状态'}")
    print("-" * 75)
    for e in events:
        print(f"{e.id:<20} | {e.name:<25} | {e.event_type:<10} | {e.status}")
        if args.show_props and e.properties:
            for p in e.properties:
                print(f"  └─ {p.name} ({p.data_type})")

def get_event_detail(args):
    """查看埋点详情（包含绑定的参数）"""
    mgr = TrackingManger(args.db)
    # 稍微复用下，mgr.app_service 拿到 event
    event = mgr.app_service.asset_repo.get_event_by_id(args.event)
    if not event:
        print(f"❌ 未找到 ID 为 {args.event} 的埋点")
        return
    
    print(f"🔍 埋点详情: {event.name} ({event.id})")
    print("-" * 50)
    print(f"类型: {event.event_type}")
    print(f"状态: {event.status}")
    print(f"页面 ID: {event.page_id}")
    if event.locked_by_request:
        print(f"锁状态: 被需求单 {event.locked_by_request} 锁定")
    
    print(f"\n📊 绑定参数 ({len(event.properties)} 个):")
    if not event.properties:
        print("  (无参数)")
    else:
        print(f"  {'参数 ID':<20} | {'名称':<20} | {'数据类型':<10}")
        print("  " + "-" * 55)
        for p in event.properties:
            print(f"  {p.id:<20} | {p.name:<20} | {p.data_type:<10}")
            if p.enum_options:
                options = ", ".join([f"{o.value}({o.label})" for o in p.enum_options])
                print(f"    └─ 枚举值: {options}")

def create_request(args):
    """创建需求单"""
    mgr = TrackingManger(args.db)
    req = mgr.create_request(args.title, args.creator, args.tenant, args.group, args.doc)
    print(f"✅ 需求单创建成功！ID: {req.id}, 标题: {req.title}, 状态: {req.status}")

def list_requests(args):
    """获取需求单列表"""
    mgr = TrackingManger(args.db)
    requests = mgr.get_requests(args.group)
    if not requests:
        print(f"📭 协作组 {args.group} 下暂无需求单")
        return
    print(f"{'ID':<20} | {'标题':<30} | {'状态':<15} | {'创建时间'}")
    print("-" * 85)
    for r in requests:
        print(f"{r.id:<20} | {r.title[:28]:<30} | {r.status:<15} | {r.created_at}")

def add_request_change(args):
    """向需求单添加变更项"""
    import json
    mgr = TrackingManger(args.db)
    # 构造基本的 event_data
    event_data = {}
    if args.data:
        event_data = json.loads(args.data)
    else:
        # 提供简易参数支持
        if args.name: event_data['name'] = args.name
        if args.type: event_data['event_type'] = args.type
        if args.page: event_data['page_id'] = args.page

    success = mgr.add_event_change_to_request(args.request, args.tenant, args.user, args.event, args.op, event_data)
    if success:
        print(f"✅ 变更项已成功添加到需求单 {args.request}。操作: {args.op}")
    else:
        print(f"❌ 添加变更项失败。")

def apply_request(args):
    """应用需求单变更"""
    mgr = TrackingManger(args.db)
    success = mgr._apply_request_changes_to_events(args.request, args.tenant, args.user)
    if success:
        print(f"✅ 需求单 {args.request} 变更应用成功！所有埋点已生效。")
    else:
        print(f"❌ 需求单 {args.request} 变更应用失败。")

def create_approval(args):
    """创建审批任务"""
    mgr = TrackingManger(args.db)
    task_id = mgr.create_approval_task(args.request, args.name, args.approver)
    print(f"✅ 审批任务创建成功！ID: {task_id}")

def list_approvals(args):
    """获取审批任务列表"""
    mgr = TrackingManger(args.db)
    tasks = mgr.get_approval_tasks(args.request)
    if not tasks:
        print(f"📭 需求单 {args.request} 暂无审批任务")
        return
    print(f"{'ID':<20} | {'节点':<20} | {'审批人':<20} | {'状态'}")
    print("-" * 80)
    for t in tasks:
        print(f"{t.id:<20} | {t.node_name:<20} | {t.approver_user_id:<20} | {t.status}")

def process_approval(args):
    """处理审批任务"""
    mgr = TrackingManger(args.db)
    success = mgr.process_approval(args.task, args.tenant, args.user, args.status, args.comment)
    if success:
        print(f"✅ 审批任务 {args.task} 处理成功！状态: {args.status}")
    else:
        print(f"❌ 审批任务 {args.task} 处理失败。")

def gen_id(args):
    """生成唯一 ID"""
    mgr = TrackingManger(args.db)
    new_id = mgr.generate_id(args.prefix)
    print(f"🆔 生成 ID: {new_id}")

def main():
    parser = argparse.ArgumentParser(
        description="TMS 埋点管理系统 CLI 工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=EXAMPLE_USAGE
    )
    
    parser.add_argument('--db', default=DB_PATH, help=f'数据库路径 (默认: {DB_PATH})')
    
    subparsers = parser.add_subparsers(dest='command', help='可用命令')
    
    # === init 命令 ===
    parser_init = subparsers.add_parser('init', help='初始化系统')
    parser_init.set_defaults(func=init_system)
    
    # === tenant 命令组 ===
    parser_tenant = subparsers.add_parser('tenant', help='租户管理')
    tenant_sub = parser_tenant.add_subparsers(dest='action')
    
    tenant_create = tenant_sub.add_parser('create', help='创建租户')
    tenant_create.add_argument('--name', required=True, help='租户名称')
    tenant_create.add_argument('--description', help='备注')
    tenant_create.set_defaults(func=create_tenant)

    tenant_list = tenant_sub.add_parser('list', help='获取租户列表')
    tenant_list.set_defaults(func=list_tenants)
    
    # === user 命令组 ===
    parser_user = subparsers.add_parser('user', help='用户管理')
    user_sub = parser_user.add_subparsers(dest='action')
    
    user_create = user_sub.add_parser('create', help='创建用户')
    user_create.add_argument('--tenant', required=True, help='租户 ID')
    user_create.add_argument('--username', required=True, help='用户名')
    user_create.add_argument('--email', required=True, help='邮箱')
    user_create.add_argument('--password', required=True, help='密码')
    user_create.add_argument('--role', required=True, help='角色 ID')
    user_create.set_defaults(func=create_user)

    user_list = user_sub.add_parser('list', help='获取用户列表')
    user_list.add_argument('--tenant', required=True, help='租户 ID')
    user_list.set_defaults(func=list_users)
    
    # === app 命令组 ===
    parser_app = subparsers.add_parser('app', help='应用管理')
    app_sub = parser_app.add_subparsers(dest='action')
    
    app_create = app_sub.add_parser('create', help='创建应用')
    app_create.add_argument('--tenant', required=True, help='租户 ID')
    app_create.add_argument('--name', required=True, help='应用名称')
    app_create.add_argument('--platform', required=True, help='平台（iOS/Android/Web）')
    app_create.add_argument('--owner', required=True, help='负责人用户 ID')
    app_create.set_defaults(func=create_app)

    app_list = app_sub.add_parser('list', help='获取应用列表')
    app_list.add_argument('--tenant', required=True, help='租户 ID')
    app_list.set_defaults(func=list_apps)
    
    # === page 命令组 ===
    parser_page = subparsers.add_parser('page', help='页面管理')
    page_sub = parser_page.add_subparsers(dest='action')
    
    page_create = page_sub.add_parser('create', help='创建页面')
    page_create.add_argument('--tenant', required=True, help='租户 ID')
    page_create.add_argument('--app', required=True, help='应用 ID')
    page_create.add_argument('--name', required=True, help='页面名称')
    page_create.add_argument('--path', required=True, help='页面路径')
    page_create.add_argument('--parent', help='父页面 ID（用于树形结构）')
    page_create.add_argument('--module', help='所属模块')
    page_create.add_argument('--desc', help='页面描述')
    page_create.set_defaults(func=create_page)
    
    page_list = page_sub.add_parser('list', help='列出应用的所有页面')
    page_list.add_argument('--tenant', required=True, help='租户 ID')
    page_list.add_argument('--app', required=True, help='应用 ID')
    page_list.set_defaults(func=list_pages)
    
    # === group 命令组 ===
    parser_group = subparsers.add_parser('group', help='协作组管理')
    group_sub = parser_group.add_subparsers(dest='action')
    
    group_create = group_sub.add_parser('create', help='创建协作组')
    group_create.add_argument('--tenant', required=True, help='租户 ID')
    group_create.add_argument('--app', required=True, help='应用 ID')
    group_create.add_argument('--name', required=True, help='协作组名称')
    group_create.add_argument('--desc', help='协作组描述')
    group_create.add_argument('--creator', required=True, help='创建者用户 ID')
    group_create.set_defaults(func=create_group)

    group_list = group_sub.add_parser('list', help='获取协作组列表')
    group_list.add_argument('--tenant', required=True, help='租户 ID')
    group_list.add_argument('--app', required=True, help='应用 ID')
    group_list.set_defaults(func=list_groups)

    # === event 子命令组 (在 group 下或独立?) ===
    # 为了简化，我们在 group 下增加 event 浏览
    parser_event = subparsers.add_parser('event', help='埋点事件管理')
    event_sub = parser_event.add_subparsers(dest='action')
    event_list = event_sub.add_parser('list', help='查看协作组下的埋点')
    event_list.add_argument('--group', required=True, help='协作组 ID')
    event_list.add_argument('--show-props', action='store_true', help='显示关联参数')
    event_list.set_defaults(func=list_events)

    event_detail = event_sub.add_parser('detail', help='查看埋点详情及其参数')
    event_detail.add_argument('--event', required=True, help='埋点 ID')
    event_detail.set_defaults(func=get_event_detail)
    
    # === request 命令组 ===
    parser_request = subparsers.add_parser('request', help='需求单管理')
    request_sub = parser_request.add_subparsers(dest='action')
    
    request_create = request_sub.add_parser('create', help='创建需求单')
    request_create.add_argument('--tenant', required=True, help='租户 ID')
    request_create.add_argument('--group', required=True, help='协作组 ID')
    request_create.add_argument('--title', required=True, help='需求标题')
    request_create.add_argument('--creator', required=True, help='创建者用户 ID')
    request_create.add_argument('--doc', help='文档链接')
    request_create.set_defaults(func=create_request)

    request_list = request_sub.add_parser('list', help='获取需求单列表')
    request_list.add_argument('--group', required=True, help='协作组 ID')
    request_list.set_defaults(func=list_requests)
    
    request_add = request_sub.add_parser('add-change', help='向需求单添加变更项')
    request_add.add_argument('--request', required=True, help='需求单 ID')
    request_add.add_argument('--tenant', required=True, help='租户 ID')
    request_add.add_argument('--user', required=True, help='操作用户 ID')
    request_add.add_argument('--event', required=True, help='埋点 ID (如果是新创建，可输入临时 ID)')
    request_add.add_argument('--op', required=True, choices=['create', 'edit', 'delete'], help='操作类型')
    request_add.add_argument('--name', help='埋点名称')
    request_add.add_argument('--type', help='埋点类型 (PV/Click/etc)')
    request_add.add_argument('--page', help='页面 ID')
    request_add.add_argument('--data', help='完整变更 JSON 数据 (可选，用于复杂变更)')
    request_add.set_defaults(func=add_request_change)

    request_apply = request_sub.add_parser('apply', help='应用需求单变更')
    request_apply.add_argument('--request', required=True, help='需求单 ID')
    request_apply.add_argument('--tenant', required=True, help='租户 ID')
    request_apply.add_argument('--user', required=True, help='执行者用户 ID')
    request_apply.set_defaults(func=apply_request)
    
    # === approval 命令组 ===
    parser_approval = subparsers.add_parser('approval', help='审批管理')
    approval_sub = parser_approval.add_subparsers(dest='action')
    
    approval_create = approval_sub.add_parser('create', help='创建审批任务')
    approval_create.add_argument('--request', required=True, help='需求单 ID')
    approval_create.add_argument('--name', required=True, help='节点名称（如：业务评审）')
    approval_create.add_argument('--approver', required=True, help='审批人用户 ID')
    approval_create.set_defaults(func=create_approval)

    approval_list = approval_sub.add_parser('list', help='查看需求单的审批进度')
    approval_list.add_argument('--request', required=True, help='需求单 ID')
    approval_list.set_defaults(func=list_approvals)
    
    approval_process = approval_sub.add_parser('process', help='处理审批任务')
    approval_process.add_argument('--task', required=True, help='任务 ID')
    approval_process.add_argument('--tenant', required=True, help='租户 ID')
    approval_process.add_argument('--user', required=True, help='操作用户 ID')
    approval_process.add_argument('--status', required=True, choices=['Approved', 'Rejected'], help='审批状态')
    approval_process.add_argument('--comment', help='审批备注')
    approval_process.set_defaults(func=process_approval)

    # === tool 命令组 ===
    parser_tool = subparsers.add_parser('tool', help='工具方法')
    tool_sub = parser_tool.add_subparsers(dest='action')
    tool_gen = tool_sub.add_parser('gen-id', help='生成唯一 ID')
    tool_gen.add_argument('--prefix', required=True, help='前缀（如：USR, EVT）')
    tool_gen.set_defaults(func=gen_id)
    
    # 解析参数
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # 执行对应的函数
    if hasattr(args, 'func'):
        try:
            args.func(args)
        except Exception as e:
            print(f"❌ 执行失败：{e}")
            sys.exit(1)
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == '__main__':
    main()
