import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * TrackingPlanV2Layout - V2 模块的根布局组件
 * 提供统一的页面容器和可能的上下文 Provider
 */
export const TrackingPlanV2Layout: React.FC = () => {
    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            <Outlet />
        </div>
    );
};

export default TrackingPlanV2Layout;
