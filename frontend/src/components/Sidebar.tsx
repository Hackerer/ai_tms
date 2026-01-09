import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Library,
    GitBranch,
    Settings,
    Settings2,
    Users,
    Bell,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Radar
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../lib/utils';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    to: string;
    collapsed?: boolean;
}

const NavItem = ({ icon: Icon, label, to, collapsed }: NavItemProps) => (
    <div className={cn("mx-3 my-1", collapsed && "mx-2")}>
        <NavLink
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-full transition-all duration-300 group relative overflow-hidden",
                collapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
                isActive
                    ? "bg-primary/15 text-primary font-bold shadow-sm"
                    : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
            )}
        >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="flex-1 text-sm font-medium">{label}</span>}
        </NavLink>
    </div>
);

// 屏幕宽度断点：小于此值时自动折叠
const AUTO_COLLAPSE_BREAKPOINT = 1280;

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false); // 首次展开
    const [countdown, setCountdown] = useState(60);
    const [showCountdown, setShowCountdown] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const timerRef = useRef<number | null>(null);

    // 启动倒计时
    const startTimer = (duration: number) => {
        clearTimer();
        setCountdown(duration);

        const threshold = duration === 60 ? 10 : 5; // 60秒时最后10秒提示，15秒时最后5秒提示

        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                const next = prev - 1;

                // 显示倒计时提示
                setShowCountdown(next <= threshold && next > 0);

                // 倒计时结束，自动折叠
                if (next === 0) {
                    setCollapsed(true);
                    clearTimer();
                    setShowCountdown(false);
                }

                return next;
            });
        }, 1000);
    };

    // 清除计时器
    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setShowCountdown(false);
    };

    // 首次进入系统：60秒倒计时
    useEffect(() => {
        if (isFirstLoad) {
            // 检查是否首次访问
            const hasVisited = localStorage.getItem('sidebar-visited');

            if (!hasVisited) {
                // 首次访问：展开60秒
                setCollapsed(false);
                startTimer(60);
                localStorage.setItem('sidebar-visited', 'true');
            }

            setIsFirstLoad(false);
        }

        return () => clearTimer();
    }, []);

    // 监听窗口尺寸变化，小屏自动折叠
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < AUTO_COLLAPSE_BREAKPOINT) {
                setCollapsed(true);
                clearTimer(); // 小屏幕时清除自动折叠计时器
            }
        };

        // 初始化检查
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 用户手动切换折叠状态
    const handleToggle = () => {
        setCollapsed(prev => {
            const next = !prev;

            if (next) {
                // 折叠时，清除计时器
                clearTimer();
            } else {
                // 展开时，启动15秒倒计时
                startTimer(15);
            }

            return next;
        });
    };

    return (
        <>
            <aside className={cn(
                "h-full flex flex-col bg-muted/5 backdrop-blur-xl p-4 shrink-0 z-20 border-r border-border transition-all duration-300 relative",
                collapsed ? "w-[72px]" : "w-[280px]"
            )}>
                {/* Collapse Toggle Button */}
                <button
                    onClick={handleToggle}
                    className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-background border border-border shadow-sm flex items-center justify-center hover:bg-muted/20 transition-colors z-30"
                    title={collapsed ? "展开菜单" : "折叠菜单"}
                >
                    {collapsed ? (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                        <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                </button>

                {/* Logo */}
                <div className={cn(
                    "flex items-center gap-3 mb-10 pointer-events-none transition-all duration-300",
                    collapsed ? "justify-center px-0" : "px-2"
                )}>
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <GitBranch className="text-primary-foreground w-6 h-6" />
                    </div>
                    {!collapsed && (
                        <h1 className="text-xl font-bold tracking-tight text-foreground whitespace-nowrap">
                            NEXUS TMS
                        </h1>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {!collapsed && (
                        <div className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-4 px-2">
                            主菜单
                        </div>
                    )}
                    <NavItem icon={LayoutDashboard} label="总览" to="/dashboard" collapsed={collapsed} />
                    <NavItem icon={Library} label="事件管理" to="/assets" collapsed={collapsed} />
                    <NavItem icon={Settings2} label="参数管理" to="/configuration" collapsed={collapsed} />
                    <NavItem icon={GitBranch} label="埋点需求" to="/workflows" collapsed={collapsed} />
                    <NavItem icon={Users} label="协作组管理" to="/team" collapsed={collapsed} />
                    <NavItem icon={Sparkles} label="埋点方案 V2" to="/tracking-v2" collapsed={collapsed} />
                    <NavItem icon={Radar} label="埋点实时测试" to="/tracking-test" collapsed={collapsed} />

                    {!collapsed && (
                        <div className="pt-8 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-4 px-2">
                            设置
                        </div>
                    )}
                    {collapsed && <div className="pt-4" />}
                    <NavItem icon={Bell} label="通知中心" to="/notifications" collapsed={collapsed} />
                    <NavItem icon={Settings} label="设置" to="/settings" collapsed={collapsed} />
                </nav>

                {/* Footer */}
                <div className={cn(
                    "mt-auto pt-6 border-t border-border flex items-center transition-all duration-300",
                    collapsed ? "justify-center" : "justify-between"
                )}>
                    {!collapsed ? (
                        <>
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-border shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-foreground">管理员</span>
                                    <span className="text-xs text-muted-foreground">admin@nexus.com</span>
                                </div>
                            </div>
                            <ThemeToggle />
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-border" title="管理员" />
                            <ThemeToggle />
                        </div>
                    )}
                </div>
            </aside>

            {/* 倒计时提示 */}
            {showCountdown && !collapsed && (
                <div className="fixed bottom-20 left-[296px] p-3 rounded-lg bg-surface-container shadow-lg border border-border animate-in slide-in-from-left duration-300 z-50">
                    <p className="text-sm text-muted-foreground">
                        侧边栏将在 <span className="font-bold text-foreground">{countdown}秒</span> 后自动折叠
                    </p>
                </div>
            )}
        </>
    );
};
