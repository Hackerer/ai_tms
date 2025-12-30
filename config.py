import os

# --- 环境配置 ---
# 可选值: 'production', 'staging', 'test'
APP_ENV = os.getenv("APP_ENV", "production").lower()

# --- 数据库配置 ---
# 根据环境选择数据库文件名
DB_ENV_MAP = {
    "production": "Tracking.db",
    "staging": "Tracking_pre.db",
    "test": "Tracking_test.db"
}

DB_NAME = DB_ENV_MAP.get(APP_ENV, "Tracking.db")

# 数据库绝对路径 (默认当前目录下)
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), DB_NAME)

# --- 系统日志 ---
LOG_LEVEL = "DEBUG" if APP_ENV != "production" else "INFO"

# --- 业务常量 ---
ID_PREFIXES = {
    "TENANT": "TEN",
    "USER": "USR",
    "APP": "APP",
    "PAGE": "PAG",
    "GROUP": "GRP",
    "REQUEST": "REQ",
    "EVENT": "EVT",
    "PROPERTY": "PRP",
    "TASK": "TSK"
}
