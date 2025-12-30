import unittest
import sys
import os

def run_tests():
    # 将项目根目录加入 path
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))
    
    loader = unittest.TestLoader()
    # 自动发现 ai_tms/tests 下的所有测试
    suite = loader.discover('ai_tms/tests')
    
    print("🚀 启动 TMS 系统全自动化测试套件...")
    print("=" * 50)
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "=" * 50)
    if result.wasSuccessful():
        print("✅ 测试全部通过！系统运行稳定。")
        return 0
    else:
        print(f"❌ 测试失败！失败数: {len(result.failures)}, 错误数: {len(result.errors)}")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
