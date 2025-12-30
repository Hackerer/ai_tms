import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Library,
    GitBranch,
    Settings,
    Users,
    Bell,
    ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    to: string;
}

const NavItem = ({ icon: Icon, label, to }: NavItemProps) => (
    <NavLink
        to={to}
        className={({ isActive }) => cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
            isActive
                ? "bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
        )}
    >
        <Icon className="w-5 h-5 group-[.active]:text-primary group-hover:text-foreground" />
        <span className="font-medium flex-1 text-left">{label}</span>
        <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-[.active]:opacity-100 transition-opacity" />
    </NavLink>
);

export const Sidebar = () => {
    return (
        <aside className="w-64 h-full flex flex-col glass-nav p-6 shrink-0 z-20">
            <div className="flex items-center gap-3 mb-10 px-2 pointer-events-none">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                    <GitBranch className="text-white w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    NEXUS TMS
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
                    主菜单
                </div>
                <NavItem icon={LayoutDashboard} label="仪表盘" to="/dashboard" />
                <NavItem icon={Library} label="资产库" to="/assets" />
                <NavItem icon={GitBranch} label="工作流" to="/workflows" />
                <NavItem icon={Users} label="团队成员" to="/team" />

                <div className="pt-8 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
                    设置
                </div>
                <NavItem icon={Bell} label="通知中心" to="/notifications" />
                <NavItem icon={Settings} label="系统设置" to="/settings" />
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">管理员</span>
                        <span className="text-xs text-muted-foreground">admin@nexus.com</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
