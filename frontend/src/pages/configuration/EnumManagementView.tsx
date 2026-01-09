import { Package } from 'lucide-react';
import { FeatureIcon } from '../../components/FeatureIcon';

export const EnumManagementView = () => {
    return (
        <div className="flex-1 flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
            <div className="text-center max-w-md">
                <FeatureIcon
                    icon={Package}
                    variant="warning"
                    className="w-24 h-24 mx-auto mb-6 opacity-80"
                    scale={1.3}
                />
                <h3 className="text-2xl font-bold text-foreground mb-3">🚧 功能开发中</h3>
                <p className="text-base text-muted-foreground mb-6">
                    枚举值管理功能即将上线
                </p>
                <div className="card-standard p-6 text-left">
                    <h4 className="text-sm font-bold text-foreground mb-3">即将支持的功能</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            枚举类型定义与管理
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            枚举值可视化编辑
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            枚举值复用与引用关系
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            批量导入与导出
                        </li>
                    </ul>
                </div>
                <p className="text-xs text-muted-foreground mt-6">
                    敬请期待 • Coming Soon
                </p>
            </div>
        </div>
    );
};
