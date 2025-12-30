import sqlite3
import uuid
from typing import Optional, List
from ai_tms.domain.asset.models import App, Domain, Page, Event, Property, EventType, EnumOption
from ai_tms.domain.asset.repositories import IAssetRepository, IPageRepository

class SqlitePageRepository(IPageRepository):
    def __init__(self, db_manager):
        self.db_manager = db_manager

    def _get_conn(self):
        return self.db_manager.get_connection()

    def save_page(self, page: Page) -> Page:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO pages (id, tenant_id, app_id, parent_id, name, path, module, description, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) "
                "ON CONFLICT(id) DO UPDATE SET parent_id=excluded.parent_id, name=excluded.name, path=excluded.path, module=excluded.module",
                (page.id, page.tenant_id, page.app_id, page.parent_id, page.name, page.path, page.module, page.description, page.created_at)
            )
            conn.commit()
            return page
        finally:
            conn.close()

    def get_pages_by_app(self, app_id: str, tenant_id: str) -> List[Page]:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM pages WHERE app_id = ? AND tenant_id = ?", (app_id, tenant_id))
            return [Page(r['id'], r['tenant_id'], r['app_id'], r['name'], r['path'], r['parent_id'], r['module'], r['description'], r['created_at']) for r in cursor.fetchall()]
        finally:
            conn.close()

    def get_page_by_id(self, page_id: str) -> Optional[Page]:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM pages WHERE id = ?", (page_id,))
            r = cursor.fetchone()
            if not r: return None
            return Page(r['id'], r['tenant_id'], r['app_id'], r['name'], r['path'], r['parent_id'], r['module'], r['description'], r['created_at'])
        finally:
            conn.close()

class SqliteAssetRepository(IAssetRepository):
    def __init__(self, db_manager):
        self.db_manager = db_manager

    def _get_conn(self):
        return self.db_manager.get_connection()

    def next_identity(self, prefix: str) -> str:
        return f"{prefix}-{uuid.uuid4().hex[:12]}"

    # --- App ---
    def save_app(self, app: App) -> App:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO apps (id, tenant_id, owner_user_id, name, platform, app_key, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?) "
                "ON CONFLICT(id) DO UPDATE SET name=excluded.name",
                (app.id, app.tenant_id, app.owner_user_id, app.name, app.platform, app.app_key, app.created_at)
            )
            conn.commit()
            return app
        finally:
            conn.close()

    def get_app_by_id(self, app_id: str) -> Optional[App]:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM apps WHERE id = ?", (app_id,))
            r = cursor.fetchone()
            if not r: return None
            return App(r['id'], r['tenant_id'], r['name'], r['platform'], r['owner_user_id'], r['app_key'], r['created_at'])
        finally:
            conn.close()

    def get_apps(self, tenant_id: str) -> List[App]:
        """获取租户下的所有应用"""
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM apps WHERE tenant_id = ?", (tenant_id,))
            return [App(r['id'], r['tenant_id'], r['name'], r['platform'], r['owner_user_id'], r['app_key'], r['created_at']) for r in cursor.fetchall()]
        finally:
            conn.close()
            
    # --- Domain ---
    def save_domain(self, domain: Domain) -> Domain:
        conn = self._get_conn() 
        try:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO domains (id, tenant_id, name, description, owner_user_id, created_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name", 
                           (domain.id, domain.tenant_id, domain.name, domain.description, domain.owner_user_id, domain.created_at))
            conn.commit()
            return domain
        finally:
            conn.close()
            
    def get_domains(self, tenant_id: str) -> List[Domain]:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM domains WHERE tenant_id = ?", (tenant_id,))
            return [Domain(r['id'], r['tenant_id'], r['name'], r['description'], r['owner_user_id'], r['created_at']) for r in cursor.fetchall()]
        finally:
            conn.close()

    # --- Property Helper ---
    def find_property_by_name(self, tenant_id: str, name: str) -> Optional[Property]:
        # 从 DB 读取 Property 定义，用于复用
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM properties WHERE tenant_id = ? AND name = ?", (tenant_id, name))
            r = cursor.fetchone()
            if not r: return None
            
            # Load Enums
            cursor.execute("SELECT * FROM property_enums WHERE property_id = ?", (r['id'],))
            enums = [EnumOption(e['value'], e['label'], e['description']) for e in cursor.fetchall()]
            
            return Property(r['id'], r['tenant_id'], r['name'], r['data_type'], r['category'], r['description'], False, enums, r['created_at'])
        finally:
            conn.close()

    # --- Event Aggregate (Complex) ---
    def save_event(self, event: Event) -> Event:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            # 1. Save Event Root
            cursor.execute(
                "INSERT INTO events (id, tenant_id, group_id, domain_id, page_id, event_type, name, description, is_active, status, locked_by_request, created_at, updated_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) "
                "ON CONFLICT(id) DO UPDATE SET group_id=excluded.group_id, name=excluded.name, description=excluded.description, "
                "status=excluded.status, locked_by_request=excluded.locked_by_request, updated_at=excluded.updated_at, page_id=excluded.page_id, event_type=excluded.event_type",
                (event.id, event.tenant_id, event.group_id, event.domain_id, event.page_id, event.event_type, event.name, event.description, event.is_active, event.status, event.locked_by_request, event.created_at, event.updated_at)
            )
            
            # 2. Sync Properties (Complex: Reuse Policy)
            # 先清空关联
            cursor.execute("DELETE FROM event_property_relation WHERE event_id = ?", (event.id,))
            
            for prop in event.properties:
                # 检查只有已存在的属性才复用，如果是新的（ID在内存中生成但未落库），则插入
                cursor.execute("SELECT id FROM properties WHERE id = ?", (prop.id,))
                if not cursor.fetchone():
                    cursor.execute("INSERT INTO properties (id, tenant_id, name, data_type, category, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                                   (prop.id, prop.tenant_id, prop.name, prop.data_type, prop.category, prop.description, prop.created_at))
                    # Insert enums
                    for opt in prop.enum_options:
                        cursor.execute("INSERT INTO property_enums (property_id, value, label, description) VALUES (?, ?, ?, ?)", 
                                       (prop.id, opt.value, opt.label, opt.description))
                
                # 建立关联
                cursor.execute("INSERT INTO event_property_relation (event_id, property_id, tenant_id, is_required) VALUES (?, ?, ?, ?)",
                               (event.id, prop.id, prop.tenant_id, prop.is_required))

            conn.commit()
            return event
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def get_event_by_id(self, event_id: str) -> Optional[Event]:
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
            r = cursor.fetchone()
            if not r: return None
            
            event = Event(r['id'], r['tenant_id'], r['group_id'], r['name'], r['description'], bool(r['is_active']), 
                          r['status'], r['locked_by_request'], r['domain_id'], r['page_id'], r['event_type'], r['created_at'], r['updated_at'])
            
            # Load Properties
            cursor.execute("""
                SELECT p.*, r.is_required 
                FROM properties p JOIN event_property_relation r ON p.id = r.property_id 
                WHERE r.event_id = ?
            """, (event_id,))
            props = []
            for prow in cursor.fetchall():
                p_id = prow['id']
                cursor.execute("SELECT * FROM property_enums WHERE property_id = ?", (p_id,))
                enums = [EnumOption(e['value'], e['label'], e['description']) for e in cursor.fetchall()]
                props.append(Property(p_id, prow['tenant_id'], prow['name'], prow['data_type'], prow['category'], prow['description'], bool(prow['is_required']), enums, prow['created_at']))
            
            event.set_properties(props)
            return event
        finally:
            conn.close()

    def get_events_by_group(self, group_id: str) -> List[Event]:
        """获取协作组下的所有埋点事件"""
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM events WHERE group_id = ?", (group_id,))
            ids = [r['id'] for r in cursor.fetchall()]
            # 复用 get_event_by_id 逻辑处理聚合加载（简单起见，后续可优化性能）
            events = []
            for eid in ids:
                event = self.get_event_by_id(eid)
                if event: events.append(event)
            return events
        finally:
            conn.close()

    def lock_event(self, event: Event):
        conn = self._get_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("UPDATE events SET status=?, locked_by_request=?, updated_at=? WHERE id=?", 
                           (event.status, event.locked_by_request, event.updated_at, event.id))
            conn.commit()
        finally:
            conn.close()

    def unlock_event(self, event: Event):
        self.lock_event(event) # Same logic
