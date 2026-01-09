from typing import List, Dict, Optional
from ai_tms.domain.asset.models import Event

class ValidationResult:
    """验证结果值对象"""
    def __init__(self, status: str, errors: List[Dict] = None, event_id: str = None):
        self.status = status # 'success', 'failed', 'warning'
        self.errors = errors or []
        self.event_id = event_id

    def to_dict(self):
        return {
            "status": self.status,
            "errors": self.errors,
            "event_id": self.event_id
        }

class ValidationService:
    """
    埋点验证应用服务 (Application Service)
    核心亮点：支持多种验证模式，并能从元数据仓库中提取规则进性校验。
    """
    def __init__(self, asset_repo, workflow_repo=None):
        self.asset_repo = asset_repo
        self.workflow_repo = workflow_repo

    def validate_event(self, tenant_id: str, event_name: str, properties: Dict, mode: str, request_id: Optional[str] = None):
        """
        验证上报的事件
        
        Args:
            tenant_id: 租户ID
            event_name: 上报的事件名称
            properties: 上报的事件属性
            mode: 验证模式 (quick/metadata/request)
            request_id: 需求单ID（按需求模式时使用）
        """
        if mode == 'quick':
            # 快速模式：不进行实质校验，仅透传
            return ValidationResult(status='success')
        
        # 1. 获取定义 (元数据 or 需求单变更集)
        event_meta = self.asset_repo.get_event_by_name(tenant_id, event_name)
        
        # 如果是需求模式，需要合并需求单中的变更预览
        props_meta = []
        event_id = None
        
        if mode == 'request' and request_id and self.workflow_repo:
            request = self.workflow_repo.get_request_by_id(request_id)
            if request:
                # 查找变更集中是否有该事件
                change_ref = next((ref for ref in request.event_references if ref.event_data.get('name') == event_name), None)
                if change_ref:
                    # 使用需求单中的临时定义
                    event_id = change_ref.event_id
                    props_meta = change_ref.event_data.get('properties', [])
                elif event_meta:
                    # 如果需求单里没改这个事件，回退到线上定义
                    event_id = event_meta.id
                    props_meta = [self._prop_to_dict(p) for p in event_meta.properties]
                else:
                    return ValidationResult(
                        status='failed', 
                        errors=[{"type": "event_not_found", "message": f"需求单中未定义事件 {event_name} 且线上无此事件", "severity": "error"}]
                    )
            else:
                return ValidationResult(
                    status='failed', 
                    errors=[{"type": "request_not_found", "message": f"需求单 {request_id} 不存在", "severity": "error"}]
                )
        else:
            if not event_meta:
                return ValidationResult(
                    status='failed',
                    errors=[{
                        "type": "event_not_found", 
                        "message": f"未在元数据中找到事件: {event_name}",
                        "severity": "error"
                    }]
                )
            event_id = event_meta.id
            props_meta = [self._prop_to_dict(p) for p in event_meta.properties]

        errors = []
        
        # 2. 校验参数
        for prop in props_meta:
            prop_name = prop.get('name')
            is_required = prop.get('is_required', False)
            data_type = prop.get('data_type')
            
            # 必传检查
            if is_required and prop_name not in properties:
                errors.append({
                    "type": "missing_parameter",
                    "message": f"缺少必传参数: {prop_name}",
                    "severity": "error"
                })
                continue
            
            if prop_name in properties:
                val = properties[prop_name]
                # 类型检查
                type_err = self._check_type(prop_name, val, data_type)
                if type_err:
                    errors.append(type_err)
                    continue
                
                # 枚举值检查
                enum_options = prop.get('enum_options', [])
                if enum_options:
                    valid_values = [str(opt.get('value')) for opt in enum_options]
                    if str(val) not in valid_values:
                        options_str = ", ".join(valid_values)
                        errors.append({
                            "type": "invalid_enum",
                            "message": f"参数 {prop_name} 取值非法 (上报: {val}, 期待选项: [{options_str}])",
                            "severity": "error"
                        })

        # 3. 检查额外未定义参数 (可选：标记为 warning)
        meta_prop_names = [p.get('name') for p in props_meta]
        for key in properties.keys():
            if key not in meta_prop_names:
                errors.append({
                    "type": "undefined_parameter",
                    "message": f"参数 {key} 未在元数据中定义",
                    "severity": "warning"
                })

        # 判定最终状态
        final_status = 'success'
        if any(e['severity'] == 'error' for e in errors):
            final_status = 'failed'
        elif any(e['severity'] == 'warning' for e in errors):
            final_status = 'warning'

        return ValidationResult(
            status=final_status, 
            errors=errors, 
            event_id=event_id
        ), meta_prop_names

    def _prop_to_dict(self, prop):
        """将领域对象 Property 转为内部字典方便统一处理"""
        return {
            "name": prop.name,
            "data_type": prop.data_type,
            "is_required": prop.is_required,
            "enum_options": [{"value": o.value, "label": o.label} for o in prop.enum_options]
        }

    def _check_type(self, name, val, expected_type):
        if expected_type == 'Number' and not isinstance(val, (int, float)):
            return {"type": "type_mismatch", "message": f"参数 {name} 类型不符 (期待 Number)", "severity": "error"}
        if expected_type == 'String' and not isinstance(val, str):
            return {"type": "type_mismatch", "message": f"参数 {name} 类型不符 (期待 String)", "severity": "error"}
        if expected_type == 'Boolean' and not isinstance(val, bool):
            return {"type": "type_mismatch", "message": f"参数 {name} 类型不符 (期待 Boolean)", "severity": "error"}
        return None
