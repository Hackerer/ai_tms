import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Library,
    GitBranch,
    Settings,
    Users,
    Bell
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
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
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
            isActive
                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-muted/5 hover:text-foreground"
        )}
    >
        {({ isActive }) => (
            <>
                <Icon className="w-5 h-5 group-[.active]:text-primary group-hover:text-foreground transition-colors" />
                <span className="flex-1 text-left">{label}</span>
                {isActive && <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 rounded-r-full bg-primary" />}
            </>
        )}
    </NavLink>
);

export const Sidebar = () => {
    return (
        <aside className="w-64 h-full flex flex-col glass-nav p-6 shrink-0 z-20 border-r border-border">
            <div className="flex items-center gap-3 mb-10 px-2 pointer-events-none">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <GitBranch className="text-primary-foreground w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                    NEXUS TMS
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                <div className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-4 px-2">
                    主菜单
                </div>
                <NavItem icon={LayoutDashboard} label="仪表盘" to="/dashboard" />
                <NavItem icon={Library} label="资产库" to="/assets" />
                <NavItem icon={GitBranch} label="工作流" to="/workflows" />
                <NavItem icon={Users} label="团队成员" to="/team" />

                <div className="pt-8 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-4 px-2">
                    设置
                </div>
                <NavItem icon={Bell} label="通知中心" to="/notifications" />
                <NavItem icon={Settings} label="系统设置" to="/settings" />
            </nav>

            <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-border" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">管理员</span>
                        <span className="text-xs text-muted-foreground">admin@nexus.com</span>
                    </div>
                </div>
                <ThemeToggle />
            </div>
        </aside>
    );
};
