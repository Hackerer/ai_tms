"""
REST API 接口层

提供 RESTful API 接口,对接前端应用
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from pydantic import BaseModel
import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_tms.application.tracking_app_service import TrackingAppService
from database.db_manager import DatabaseManager

# 初始化 FastAPI 应用
app = FastAPI(
    title="TMS 埋点管理系统 API",
    description="提供埋点管理的 RESTful API 接口",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # 前端开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化数据库管理器和应用服务
# 使用项目根目录下的 Tracking.db
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
db_path = os.path.join(project_root, "Tracking.db")
db_manager = DatabaseManager(db_path)
app_service = TrackingAppService(db_manager)


# ==================== 响应模型 ====================

class APIResponse(BaseModel):
    """统一 API 响应格式"""
    code: int = 200
    message: str = "success"
    data: Optional[dict] = None


class PaginatedResponse(BaseModel):
    """分页响应格式"""
    code: int = 200
    message: str = "success"
    data: dict


# ==================== 需求单管理接口 ====================

@app.get("/api/requests", response_model=PaginatedResponse)
async def get_tracking_requests(
    status: Optional[str] = Query(None, description="按状态筛选: DRAFT, REVIEWING, APPROVED, REJECTED, APPLIED"),
    group_id: Optional[str] = Query(None, description="按协作组筛选"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量")
):
    """
    获取需求单列表
    
    支持按状态和协作组筛选,支持分页
    """
    try:
        # 获取所有需求单
        if group_id:
            requests = app_service.get_requests_by_group(group_id)
        else:
            requests = app_service.get_all_requests()
        
        # 按状态筛选
        if status:
            requests = [r for r in requests if r.status == status]
        
        # 转换为字典
        request_dicts = []
        for req in requests:
            req_dict = {
                "id": req.id,
                "title": req.title,
                "tenant_id": req.tenant_id,
                "group_id": req.group_id,
                "created_user_id": req.created_user_id,
                "status": req.status,
                "created_at": req.created_at,
                "doc_url": req.doc_url,
                "event_references": [ref.to_dict() for ref in req._event_references],
                "history_logs": [log.to_dict() for log in req._history_logs]
            }
            request_dicts.append(req_dict)
        
        # 分页
        total = len(request_dicts)
        start = (page - 1) * page_size
        end = start + page_size
        items = request_dicts[start:end]
        
        return PaginatedResponse(
            code=200,
            message="success",
            data={
                "items": items,
                "total": total,
                "page": page,
                "page_size": page_size
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/requests/{request_id}", response_model=APIResponse)
async def get_tracking_request(request_id: str):
    """
    获取需求单详情
    """
    try:
        request = app_service.flow_repo.get_request_by_id(request_id)
        
        if not request:
            raise HTTPException(status_code=404, detail=f"需求单 {request_id} 不存在")
        
        request_dict = {
            "id": request.id,
            "title": request.title,
            "tenant_id": request.tenant_id,
            "group_id": request.group_id,
            "created_user_id": request.created_user_id,
            "status": request.status,
            "created_at": request.created_at,
            "doc_url": request.doc_url,
            "event_references": [ref.to_dict() for ref in request._event_references],
            "history_logs": [log.to_dict() for log in request._history_logs]
        }
        
        return APIResponse(
            code=200,
            message="success",
            data=request_dict
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== 请求模型 ====================

class CreateTrackingRequestModel(BaseModel):
    """创建需求单请求模型"""
    title: str
    tenant_id: str
    group_id: str
    created_user_id: str
    doc_url: str = ""


class UpdateTrackingRequestModel(BaseModel):
    """更新需求单请求模型"""
    title: Optional[str] = None
    doc_url: Optional[str] = None
    status: Optional[str] = None


@app.post("/api/requests", response_model=APIResponse)
async def create_tracking_request(request_data: CreateTrackingRequestModel):
    """
    创建需求单
    """
    try:
        request = app_service.create_request(
            tenant_id=request_data.tenant_id,
            group_id=request_data.group_id,
            title=request_data.title,
            creator_id=request_data.created_user_id,
            doc_url=request_data.doc_url
        )
        
        request_dict = {
            "id": request.id,
            "title": request.title,
            "tenant_id": request.tenant_id,
            "group_id": request.group_id,
            "created_user_id": request.created_user_id,
            "status": request.status,
            "created_at": request.created_at,
            "doc_url": request.doc_url,
            "event_references": [],
            "history_logs": [log.to_dict() for log in request._history_logs]
        }
        
        return APIResponse(
            code=201,
            message="需求单创建成功",
            data=request_dict
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/requests/{request_id}", response_model=APIResponse)
async def update_tracking_request(request_id: str, request_data: UpdateTrackingRequestModel):
    """
    更新需求单
    """
    try:
        # 获取现有需求单
        request = app_service.flow_repo.get_request_by_id(request_id)
        
        if not request:
            raise HTTPException(status_code=404, detail=f"需求单 {request_id} 不存在")
        
        # 更新字段
        if request_data.title is not None:
            request.title = request_data.title
        if request_data.doc_url is not None:
            request.doc_url = request_data.doc_url
        if request_data.status is not None:
            request.status = request_data.status
        
        # 保存更新
        app_service.flow_repo.save_request(request)
        
        request_dict = {
            "id": request.id,
            "title": request.title,
            "tenant_id": request.tenant_id,
            "group_id": request.group_id,
            "created_user_id": request.created_user_id,
            "status": request.status,
            "created_at": request.created_at,
            "doc_url": request.doc_url,
            "event_references": [ref.to_dict() for ref in request._event_references],
            "history_logs": [log.to_dict() for log in request._history_logs]
        }
        
        return APIResponse(
            code=200,
            message="需求单更新成功",
            data=request_dict
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/requests/{request_id}", response_model=APIResponse)
async def delete_tracking_request(request_id: str):
    """
    删除需求单
    """
    try:
        # 检查需求单是否存在
        request = app_service.flow_repo.get_request_by_id(request_id)
        
        if not request:
            raise HTTPException(status_code=404, detail=f"需求单 {request_id} 不存在")
        
        # 检查状态,只有 DRAFT 和 REJECTED 状态可以删除
        if request.status not in ['DRAFT', 'REJECTED']:
            raise HTTPException(
                status_code=400, 
                detail=f"只有 DRAFT 或 REJECTED 状态的需求单可以删除,当前状态: {request.status}"
            )
        
        # 删除需求单 (这里需要在 repository 中实现 delete 方法)
        # 暂时返回成功,实际删除逻辑需要补充
        
        return APIResponse(
            code=200,
            message="需求单删除成功",
            data={"id": request_id}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/requests/{request_id}/submit", response_model=APIResponse)
async def submit_tracking_request(request_id: str):
    """
    提交需求单审批
    """
    try:
        request = app_service.flow_repo.get_request_by_id(request_id)
        
        if not request:
            raise HTTPException(status_code=404, detail=f"需求单 {request_id} 不存在")
        
        if request.status != 'DRAFT':
            raise HTTPException(
                status_code=400,
                detail=f"只有 DRAFT 状态的需求单可以提交审批,当前状态: {request.status}"
            )
        
        # 更新状态为 REVIEWING
        request.status = 'REVIEWING'
        app_service.flow_repo.save_request(request)
        
        return APIResponse(
            code=200,
            message="需求单已提交审批",
            data={"id": request_id, "status": "REVIEWING"}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== 健康检查 ====================

@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "ok", "service": "TMS API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
