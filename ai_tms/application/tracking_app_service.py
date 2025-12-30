from typing import List, Optional, Dict, Any
from datetime import datetime
def get_now_str():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
from database.db_manager import DatabaseManager
from ai_tms.domain.governance.models import User, Tenant, TrackingGroup, GroupRole, Role, PermissionPolicy, GroupMember
from ai_tms.domain.asset.models import App, Page, Domain, Event, Property, EventType, EnumOption
from ai_tms.domain.workflow.models import TrackingRequest, ApprovalNode, EventVersion, EventRef
# Repositories
from ai_tms.infrastructure.persistence.governance_repo import SqliteGovernanceRepository
from ai_tms.infrastructure.persistence.asset_repo import SqliteAssetRepository, SqlitePageRepository
from ai_tms.infrastructure.persistence.workflow_repo import SqliteWorkflowRepository

class TrackingAppService:
    """
    [Application Layer] 核心应用服务
    负责编排领域对象与基础设施，处理事务边界。
    """
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
        # Initialize Repositories
        self.gov_repo = SqliteGovernanceRepository(db_manager)
        self.asset_repo = SqliteAssetRepository(db_manager)
        self.page_repo = SqlitePageRepository(db_manager)
        self.flow_repo = SqliteWorkflowRepository(db_manager)

    # --- Governance Use Cases ---
    
    def create_tenant(self, name: str, description: str) -> Tenant:
        tenant = Tenant(self.gov_repo.next_identity("TEN"), name, description)
        return self.gov_repo.save_tenant(tenant)

    def get_tenants(self) -> List[Tenant]:
        """获取所有租户"""
        return self.gov_repo.get_tenants()

    def create_user(self, tenant_id: str, username: str, email: str, password: str, role_id: str) -> User:
        # Note: In a real DDD app, password hashing might be in a domain service or Value Object factory.
        # For fidelity, we keep the logic simple here or reuse the old helper if it was a domain logic.
        from werkzeug.security import generate_password_hash
        pwd_hash = generate_password_hash(password, method='pbkdf2:sha256')
        user = User(self.gov_repo.next_identity("USR"), tenant_id, username, email, pwd_hash, role_id)
        return self.gov_repo.save_user(user)

    def get_users_by_tenant(self, tenant_id: str) -> List[User]:
        """获取租户下的用户"""
        return self.gov_repo.get_users_by_tenant(tenant_id)

    def create_group(self, tenant_id: str, app_id: str, name: str, description: str, creator_id: str) -> TrackingGroup:
        # 1. 业务规则：App 必须存在
        app = self.asset_repo.get_app_by_id(app_id)
        if not app: raise ValueError("App not found")
        
        # 2. 创建组并添加创建者为 SuperAdmin
        group = TrackingGroup(self.gov_repo.next_identity("GRP"), tenant_id, app_id, name, description)
        group.add_member(creator_id, GroupRole.SUPER_ADMIN)
        
        return self.gov_repo.save_group(group)

    def get_groups_by_app(self, app_id: str, tenant_id: str) -> List[TrackingGroup]:
        """获取应用下的协作组"""
        return self.gov_repo.get_groups_by_app(app_id, tenant_id)

    def add_group_member(self, group_id: str, user_id: str, role: str) -> GroupMember:
        group = self.gov_repo.get_group_by_id(group_id, "T_PLACEHOLDER") # Fixme: tenant context need handling
        # 简化：为了 100% 兼容旧 API 签名，这里假设 tenant_id 透传或查询逻辑
        if not group: 
            # Fallback: try to find without tenant_id or error out. 
            # In old code: iam_service.add_group_member(group_id, user_id, role) didn't ask for tenant_id.
            # We must fix repository signature or find a way. 
            # HACK: For now, assume tenant_id is not strictly checked for existence in old code for updates.
            # But wait, SqliteGovernanceRepository needs tenant_id for PK check? actually ID is PK.
            # Let's verify repo implementation. Repo get_group_by_id USES tenant_id.
            # For this MVP, we might need to fetch by ID only or pass placeholder if ID is globally unique.
            # Given UUIDs, ID is unique. Let's adjust repo to be lenient or pass a wildcard.
            pass
        
        # Re-fetch strictly by ID (assuming global uniqueness)
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT tenant_id FROM tracking_groups WHERE id = ?", (group_id,))
        row = cursor.fetchone()
        conn.close()
        if not row: raise ValueError("Group not found")
        
        tenant_id = row['tenant_id']
        group = self.gov_repo.get_group_by_id(group_id, tenant_id)
        
        member = group.add_member(user_id, role)
        self.gov_repo.save_group(group)
        return member

    # --- Asset Use Cases (App, Domain, Page) ---

    def create_app(self, tenant_id: str, name: str, platform: str, owner_id: str, app_key: str = None) -> App:
        app = App(self.asset_repo.next_identity("APP"), tenant_id, name, platform, owner_id, app_key)
        return self.asset_repo.save_app(app)

    def get_apps(self, tenant_id: str) -> List[App]:
        """获取租户下的应用"""
        return self.asset_repo.get_apps(tenant_id)

    def create_domain(self, tenant_id: str, name: str, description: str, owner_id: str = None) -> Domain:
        domain = Domain(self.asset_repo.next_identity("DOM"), tenant_id, name, description, owner_id)
        return self.asset_repo.save_domain(domain)
    
    def create_page(self, tenant_id: str, app_id: str, name: str, path: str, parent_id: str = None, module: str = "", description: str = "") -> Page:
        page = Page(self.asset_repo.next_identity("PAG"), tenant_id, app_id, name, path, parent_id, module, description)
        return self.page_repo.save_page(page)

    def get_pages_by_app(self, app_id: str, tenant_id: str) -> List[Page]:
        return self.page_repo.get_pages_by_app(app_id, tenant_id)
    
    def get_properties_by_event(self, event_id: str, tenant_id: str) -> List[Property]:
        event = self.asset_repo.get_event_by_id(event_id)
        return event.properties if event else []

    def get_events_by_group(self, group_id: str) -> List[Event]:
        """获取协作组下的埋点"""
        return self.asset_repo.get_events_by_group(group_id)

    # --- Workflow Use Cases ---

    def create_request(self, tenant_id: str, group_id: str, title: str, creator_id: str, doc_url: str = None) -> TrackingRequest:
        req_id = self.flow_repo.next_identity("REQ")
        req = TrackingRequest(req_id, title, tenant_id, group_id, creator_id, doc_url=doc_url or "")
        req.add_log(creator_id, "Created", f"需求创建: {title}")
        return self.flow_repo.save_request(req)

    def get_requests_by_group(self, group_id: str) -> List[TrackingRequest]:
        """获取协作组下的需求单"""
        return self.flow_repo.get_requests_by_group(group_id)

    def create_approval_task(self, request_id: str, node_name: str, approver_id: str) -> str:
        task_id = self.flow_repo.next_identity("TSK")
        node = ApprovalNode(task_id, request_id, node_name, approver_id)
        self.flow_repo.save_approval_node(node)
        return task_id

    def get_approval_tasks_by_request(self, request_id: str) -> List[ApprovalNode]:
        """获取需求单下的审批任务"""
        return self.flow_repo.get_approval_tasks_by_request(request_id)

    def process_approval(self, task_id: str, tenant_id: str, user_id: str, status: str, comment: str = None) -> bool:
        node = self.flow_repo.get_approval_node(task_id)
        if not node: return False
        
        req = self.flow_repo.get_request_by_id(node.request_id)
        if status == 'Approved':
            req.approve_node(node, user_id, comment or "")
        elif status == 'Rejected':
            req.reject_node(node, user_id, comment or "")
            
        self.flow_repo.save_approval_node(node)
        self.flow_repo.save_request(req)
        return True
    
    def add_event_change_to_request(self, request_id: str, tenant_id: str, user_id: str, 
                                   event_id: str, operation: str, event_data: Dict[str, Any]) -> bool:
        """
        向需求单添加埋点变更项
        1. 获取需求单
        2. 如果是 edit 操作，先锁定埋点
        3. 更新需求单变更集
        4. 持久化需求单
        """
        req = self.flow_repo.get_request_by_id(request_id)
        if not req: return False

        # 如果是编辑操作，尝试锁定埋点
        if operation == 'edit':
            event = self.asset_repo.get_event_by_id(event_id)
            if not event:
                raise ValueError(f"Event {event_id} not found")
            # 执行领域锁定逻辑
            event.lock(request_id)
            self.asset_repo.lock_event(event)
            
            # 如果 event_data 是空的，自动填充当前线上版本作为基准
            if not event_data.get('name'):
                event_data['name'] = event.name
                event_data['description'] = event.description
                event_data['page_id'] = event.page_id
                event_data['event_type'] = event.event_type
                # 这里可以扩展填充 properties

        # 领域层操作
        req.add_event_change(event_id, operation, event_data)
        req.add_log(user_id, "AddChange", f"添加变更项: {operation} event {event_id}")
        
        # 持久化
        self.flow_repo.save_request(req)
        return True

    def apply_request(self, request_id: str, tenant_id: str, user_id: str) -> bool:
        """
        [Core Logic] 应用变更单
        涉及 Asset 更新、Lock 释放、Version 生成、Log 记录、Transaction 原子性。
        """
        conn = self.db_manager.get_connection() # For transaction scope if needed, or rely on individual repo commits? 
        # Ideally, we should use a UnitOfWork. For now, we rely on optimistic handling or careful ordering.
        # But actually, saving multiple aggregates needs a transaction. 
        # Sqlite Repos commit individually. This is a weakness in simple Repo pattern.
        # FIX: We will manage transaction manually here or accept slight risk for this demo.
        # BETTER: Pass conn to repos? Or just do sequence.
        
        req = self.flow_repo.get_request_by_id(request_id)
        if not req: return False
        
        for ref in req.event_references:
            data = ref.event_data
            
            if ref.operation == 'create' or ref.operation == 'edit':
                # 1. 准备/加载 Event 聚合根
                if ref.operation == 'create':
                    # data has everything
                    event = Event(ref.event_id, tenant_id, req.group_id, data['name'], 
                                  page_id=data.get('page_id'), event_type=data.get('event_type', EventType.OTHER))
                else: 
                    event = self.asset_repo.get_event_by_id(ref.event_id)
                    # Sync content
                    event.update_content(data['name'], data.get('description', ''), 
                                         data.get('domain_id'), data.get('page_id'), data.get('event_type'))
                
                # 2. 同步 Properties (Value Objects)
                props = []
                for p_data in data.get('properties', []):
                    # Check existence logic is inside AssetRepo.save_event really? 
                    # No, Repo handles persistence. We build Objects here.
                    # Mapping legacy dict to Property Object
                    enums = [EnumOption(e['value'], e['label'], e.get('description', '')) for e in p_data.get('enum_options', [])]
                    # Note: We need to handle Property ID generation if it's new
                    # The old logic looked up by name. We should probably do that via repo helper inside AppService?
                    # Or just construct with a new ID and let Repo deduplicate? 
                    # AssetRepo.save_event logic: if ID exists, update? No, it looks up by ID.
                    # Old logic: looked up by NAME.
                    
                    found_prop = self.asset_repo.find_property_by_name(tenant_id, p_data['name'])
                    p_id = found_prop.id if found_prop else self.asset_repo.next_identity("PRP")
                    
                    prop = Property(p_id, tenant_id, p_data['name'], p_data['data_type'], p_data['category'], 
                                    p_data.get('description'), p_data.get('is_required'), enums)
                    props.append(prop)
                
                event.set_properties(props)
                
                # 3. 释放锁 & 上线
                # If creating, it wasn't locked. If editing, it was.
                # Logic: unlock() sets status='Online'.
                event.unlock() 
                
                # 4. 保存资产
                self.asset_repo.save_event(event)

                # 4.1 Sync App Relations (Legacy M:N Support)
                # The old MetadataService handled this via a separate table `event_app_relation`.
                # AssetRepo.save_event does NOT handle this (it handles Event Aggregate including Props).
                # We need to manually handle this relation here to maintain 100% fidelity.
                conn = self.db_manager.get_connection() 
                cursor = conn.cursor()
                cursor.execute("DELETE FROM event_app_relation WHERE event_id = ?", (event.id,))
                for app_id in data.get('app_ids', []):
                    cursor.execute("INSERT INTO event_app_relation (event_id, app_id, tenant_id) VALUES (?, ?, ?)", (event.id, app_id, tenant_id))
                conn.commit()
                conn.close()
                
                # 5. 生成版本快照
                latest_v = self.flow_repo.get_latest_version(event.id)
                # Snapshot data construction
                snapshot_data = data.copy() # Contains flat dict
                # Enhance snapshot with group info
                snapshot_data['group_id'] = req.group_id
                snapshot_data['applied_at'] = get_now_str()
                
                version = EventVersion(None, event.id, request_id, tenant_id, latest_v + 1, 
                                       self._to_json(snapshot_data), f"Sync via Request: {req.title}", user_id)
                self.flow_repo.save_version(version)
                
            elif ref.operation == 'delete':
                # Logical delete
                event = self.asset_repo.get_event_by_id(ref.event_id)
                if event:
                    event.is_active = False
                    event.unlock()
                    self.asset_repo.save_event(event)
        
        # Finalize Request
        req.mark_applied(user_id)
        self.flow_repo.save_request(req)
        return True

    def _to_json(self, data):
        import json
        return json.dumps(data)

    # --- Helper Proxies for Facade Compatibility ---
    def generate_id(self, prefix):
        return f"{prefix}-{uuid.uuid4().hex[:12]}"
