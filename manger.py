from database.db_manager import DatabaseManager
from ai_tms.application.tracking_app_service import TrackingAppService
from config import DB_PATH

class TrackingManger:
    """
    """
    def __init__(self, db_path=DB_PATH):
        self.db_manager = DatabaseManager(db_path)
        self.app_service = TrackingAppService(self.db_manager)

    # === 治理域 API (Governance) ===
    
    def create_tenant(self, name, description):
        """创建租户"""
        return self.app_service.create_tenant(name, description)

    def get_tenants(self):
        """获取所有租户列表"""
        return self.app_service.get_tenants()

    def create_user(self, tenant_id, username, email, password, role_id):
        """创建用户"""
        return self.app_service.create_user(tenant_id, username, email, password, role_id)

    def get_users(self, tenant_id):
        """获取租户下的用户列表"""
        return self.app_service.get_users_by_tenant(tenant_id)

    def create_group(self, tenant_id, app_id, name, description, creator_id):
        """创建协作组"""
        return self.app_service.create_group(tenant_id, app_id, name, description, creator_id)

    def get_groups(self, app_id, tenant_id):
        """获取应用下的协作组列表"""
        return self.app_service.get_groups_by_app(app_id, tenant_id)

    def add_group_member(self, group_id, user_id, role):
        """添加协作组成员"""
        return self.app_service.add_group_member(group_id, user_id, role)

    # === 资产域 API (Asset) ===
    
    def create_app(self, tenant_id, name, platform, owner_id, app_key=None):
        """创建应用"""
        return self.app_service.create_app(tenant_id, name, platform, owner_id, app_key)

    def get_apps(self, tenant_id):
        """获取租户下的应用列表"""
        return self.app_service.get_apps(tenant_id)

    def create_domain(self, tenant_id, name, description, owner_id=None):
        """创建业务域"""
        return self.app_service.create_domain(tenant_id, name, description, owner_id)
        
    def create_page(self, tenant_id, app_id, name, path, parent_id=None, module="", description=""):
        """创建页面（支持树形结构）"""
        return self.app_service.create_page(tenant_id, app_id, name, path, parent_id, module, description)

    def get_pages_by_app(self, app_id, tenant_id):
        """获取应用下的所有页面"""
        return self.app_service.get_pages_by_app(app_id, tenant_id)

    def get_properties_by_event(self, event_id, tenant_id):
        """获取埋点的参数列表"""
        return self.app_service.get_properties_by_event(event_id, tenant_id)
        
    def get_events(self, group_id):
        """获取协作组下的埋点列表"""
        return self.app_service.get_events_by_group(group_id)

    def add_event_change_to_request(self, request_id, tenant_id, user_id, event_id, operation, event_data):
        """向需求单添加埋点变更项"""
        return self.app_service.add_event_change_to_request(request_id, tenant_id, user_id, event_id, operation, event_data)

    # === 工作流域 API (Workflow) ===
    
    def create_request(self, title, creator_id, tenant_id, group_id, doc_url=None):
        """创建需求单"""
        return self.app_service.create_request(tenant_id, group_id, title, creator_id, doc_url)

    def get_requests(self, group_id):
        """获取协作组下的需求单列表"""
        return self.app_service.get_requests_by_group(group_id)

    def create_approval_task(self, request_id, node_name, approver_id):
        """创建审批任务"""
        return self.app_service.create_approval_task(request_id, node_name, approver_id)

    def get_approval_tasks(self, request_id):
        """获取需求单的审批任务列表"""
        return self.app_service.get_approval_tasks_by_request(request_id)

    def process_approval(self, task_id, tenant_id, user_id, status, comment=None):
        """处理审批（通过/拒绝）"""
        return self.app_service.process_approval(task_id, tenant_id, user_id, status, comment)

    def _apply_request_changes_to_events(self, request_id, tenant_id, user_id):
        """应用需求单变更到埋点（核心业务流程）"""
        return self.app_service.apply_request(request_id, tenant_id, user_id)

    # === 工具方法 ===
    
    def _get_db_connection(self):
        """获取数据库连接（供高级用户直接操作）"""
        return self.db_manager.get_connection()

    def generate_id(self, prefix):
        """生成唯一 ID"""
        return self.app_service.generate_id(prefix)
