import os
import sys
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io
import csv
import json

# 将项目根目录加入 sys.path 以便导入 manger.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from manger import TrackingManger

app = Flask(__name__)
# 启用跨域支持，允许 Vite 开发服务器访问
CORS(app)

# 初始化业务管理器
manager = TrackingManger()

@app.route('/api/tracking/requests', methods=['GET'])
def get_requests():
    """获取需求单列表"""
    is_all = request.args.get('all') == 'true'
    group_id = request.args.get('group_id')
    
    # 如果 all=true，忽略 group_id 查全量
    if is_all:
        requests = manager.get_requests()
    else:
        requests = manager.get_requests(group_id)
        
    return jsonify([{
        'id': r.id,
        'title': r.title,
        'status': r.status,
        'created_at': r.created_at
    } for r in requests])

@app.route('/api/tracking/export', methods=['POST'])
def export_report():
    """导出测试报告"""
    data = request.json
    events = data.get('events', [])
    format = data.get('format', 'csv')
    
    if format == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        # 表头
        writer.writerow(['Timestamp', 'EventName', 'Status', 'Errors', 'Properties'])
        
        for event in events:
            # 简化错误信息
            err_msg = "; ".join([f"{e['type']}: {e['message']}" for e in event.get('errors', [])])
            writer.writerow([
                event.get('timestamp'),
                event.get('eventName'),
                event.get('status'),
                err_msg,
                json.dumps(event.get('properties', {}))
            ])
            
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8-sig')),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f"tracking_report_{os.urandom(4).hex()}.csv"
        )
    
    # 默认返回 JSON
    return jsonify({"events": events})

if __name__ == '__main__':
    # 启动在 5001 端口，避免与 Vite (5173) 或 WebSocket (8765) 冲突
    print("🚀 TMS REST API Server starting on http://localhost:5001")
    app.run(port=5001, debug=True)
