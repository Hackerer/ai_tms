#!/bin/bash
# TMS 多环境一键初始化脚本

echo "🛠️  正在执行 TMS 环境初始化..."

# 1. 检查 Python
if ! command -v python3 &> /dev/null
then
    echo "❌ 错误: 未找到 python3，请先安装。"
    exit 1
fi

# 2. 安装必要依赖
echo "📦 正在安装依赖..."
pip install werkzeug -q

# 3. 初始化三大环境数据库
envs=("test" "staging" "production")

for env in "${envs[@]}"
do
    echo "🗄️  初始化环境: $env ..."
    APP_ENV=$env python3 cli.py init
done

echo "✅ 初始化完成！"
echo "------------------------------------------------"
echo "💡 使用提示:"
echo "1. 运行测试: APP_ENV=test python3 run_all_tests.py"
echo "2. 预发查询: APP_ENV=staging python3 cli.py tenant list"
echo "3. 线上运行: python3 cli.py (默认就是 production)"
echo "------------------------------------------------"
