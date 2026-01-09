import asyncio
import json
import logging
import websockets
import os
import sys

# 将项目根目录添加到 python 路径，确保可以导入 ai_tms 和 database
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if project_root not in sys.path:
    sys.path.append(project_root)

from ai_tms.application.validation_service import ValidationService
from ai_tms.infrastructure.persistence.asset_repo import SqliteAssetRepository
from ai_tms.infrastructure.persistence.workflow_repo import SqliteWorkflowRepository
from database.db_manager import DatabaseManager
from config import DB_PATH

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("WS-Server")

class ValidationWebSocketServer:
    """
    埋点实时验证 WebSocket 服务器 (Infrastructure 层)
    负责建立与测试设备/浏览器的长连接，并将流量转发至 ValidationService。
    """
    def __init__(self, port=8765):
        self.port = port
        self.db_manager = DatabaseManager(DB_PATH)
        self.asset_repo = SqliteAssetRepository(self.db_manager)
        self.workflow_repo = SqliteWorkflowRepository(self.db_manager)
        self.validation_service = ValidationService(self.asset_repo, self.workflow_repo)
        self.active_connections = {}  # {device_id: websocket}

    async def handle_message(self, websocket, message):
        try:
            data = json.loads(message)
            action = data.get("action")
            payload = data.get("payload", {})

            if action == "start_validation":
                device_id = payload.get("deviceId")
                if not device_id:
                    await websocket.send(json.dumps({
                        "type": "error", 
                        "message": "Missing deviceId"
                    }))
                    return
                
                self.active_connections[device_id] = websocket
                logger.info(f"设备已连接并开始测试: {device_id}")
                await websocket.send(json.dumps({
                    "type": "connected",
                    "data": {"deviceId": device_id}
                }))

            elif action == "track_event":
                device_id = payload.get("deviceId")
                event_data = payload.get("event", {})
                event_name = event_data.get("name")
                properties = event_data.get("properties", {})
                mode = payload.get("mode", "quick")
                request_id = payload.get("requestId")
                tenant_id = payload.get("tenantId", "TEN-DEFAULT")
                
                logger.info(f"收到埋点上报 [{device_id}] -> {event_name} (Mode: {mode}, RequestId: {request_id})")
                
                # 调用应用层服务进行校验
                result, expected_props = self.validation_service.validate_event(
                    tenant_id=tenant_id,
                    event_name=event_name,
                    properties=properties,
                    mode=mode,
                    request_id=request_id
                )
                
                # 组装返回给前端的消息
                response = {
                    "type": "validation_result",
                    "data": {
                        "eventName": event_name,
                        "properties": properties,
                        "expectedProps": expected_props,
                        "timestamp": event_data.get("timestamp"),
                        **result.to_dict()
                    }
                }
                await websocket.send(json.dumps(response))
            
            elif action == "ping":
                await websocket.send(json.dumps({"type": "pong"}))

        except json.JSONDecodeError:
            logger.error("非法 JSON 格式消息")
        except Exception as e:
            logger.error(f"处理消息异常: {str(e)}")
            await websocket.send(json.dumps({
                "type": "error", 
                "message": "Internal server error"
            }))

    async def server_handler(self, websocket, path):
        """Websocket 连接处理器"""
        try:
            async for message in websocket:
                await self.handle_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            # 清理失效连接
            disconnected_ids = [d for d, ws in self.active_connections.items() if ws == websocket]
            for d in disconnected_ids:
                del self.active_connections[d]
                logger.info(f"设备断开连接: {d}")

    async def start(self):
        logger.info(f"🚀 埋点实时验证服务器启动中...")
        logger.info(f"📍 地址: ws://localhost:{self.port}")
        logger.info(f"🗄️ 使用数据库: {DB_PATH}")
        
        async with websockets.serve(self.server_handler, "localhost", self.port):
            await asyncio.Future()  # run forever

if __name__ == "__main__":
    # 允许通过环境变量修改端口
    port = int(os.getenv("WS_PORT", 8765))
    server = ValidationWebSocketServer(port=port)
    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        logger.info("服务器已手动停止")
