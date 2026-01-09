import { Settings2 } from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { ConfigTabs } from '../components/configuration/ConfigTabs';
import { FeatureIcon } from '../components/FeatureIcon';

export const ConfigurationCenter = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 从URL路径确定当前激活的Tab
    const currentTab = location.pathname.split('/')[2] || 'parameters';

    const handleTabChange = (tabId: string) => {
        navigate(`/configuration/${tabId}`);
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background animate-in fade-in duration-700">
            {/* Header - 包含Tab导航 */}
            <div className="h-16 border-b border-border bg-background/60 backdrop-blur-md shrink-0">
                <div className="flex items-center justify-between px-8 h-full gap-6">
                    {/* 左侧：图标 + 标题 */}
                    <div className="flex items-center gap-3 shrink-0">
                        <FeatureIcon icon={Settings2} variant="primary" className="w-10 h-10 rounded-xl" />
                        <div>
                            <h1 className="text-xl font-bold text-foreground leading-tight">配置中心</h1>
                            <p className="text-xs text-muted-foreground">Configuration Center</p>
                        </div>
                    </div>

                    {/* 中间：Tab导航 */}
                    <div className="flex-1 flex items-center justify-center">
                        <ConfigTabs currentTab={currentTab} onTabChange={handleTabChange} compact={true} />
                    </div>

                    {/* 右侧：操作按钮区域 */}
                    <div className="flex gap-3 shrink-0">
                        {/* 根据currentTab动态显示操作按钮 */}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
                <Outlet />
            </div>
        </div>
    );
};
