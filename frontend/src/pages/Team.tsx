import {
    Users,
    UserPlus,
    Shield,
    Settings,
    MoreHorizontal,
    Mail,
    UserCheck,
    Building2,
    Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { useUI } from '../context/UIContext';

const UserRow = ({ name, email, role, status }: any) => {
    const { openModal } = useUI();
    return (
        <tr
            className="border-b border-border hover:bg-muted/5 transition-colors group cursor-pointer"
            onClick={() => openModal('USER_JOURNEY_DEMO')}
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-border flex items-center justify-center text-xs font-bold text-primary">
                        {name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{name}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {email}
                        </span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <Shield className={cn("w-3.5 h-3.5", role === 'Admin' ? "text-orange-400" : "text-blue-400")} />
                    <span className="text-xs">{role === 'Admin' ? '系统管理员' : '项目编辑者'}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full", status === 'Active' ? "bg-green-500" : "bg-muted-foreground")} />
                    <span className="text-[10px] font-medium uppercase tracking-wider">{status === 'Active' ? '活跃' : '离线'}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <button
                    className="p-1 hover:bg-muted/10 rounded-md transition-colors text-muted-foreground group-hover:text-foreground"
                    onClick={(e) => { e.stopPropagation(); }}
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
};

const GroupCard = ({ name, description, memberCount, appCount }: any) => {
    const { openModal } = useUI();
    return (
        <div
            className="glass-card p-6 rounded-2xl border-border hover:border-primary/30 transition-all hover:translate-y-[-2px] group cursor-pointer relative overflow-hidden"
            onClick={() => openModal('USER_JOURNEY_DEMO')}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Building2 className="w-12 h-12" />
            </div>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Building2 className="w-6 h-6" />
                </div>
                <button
                    className="p-1 hover:bg-muted/10 rounded-md text-muted-foreground"
                    onClick={(e) => { e.stopPropagation(); }}
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>
            <h4 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{name}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-6">{description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold">{memberCount}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest text-shadow-sm">成员</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold">{appCount}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest text-shadow-sm">应用</span>
                    </div>
                </div>
                <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-br from-primary/30 to-purple-500/30" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const Team = () => {
    const [activeTab, setActiveTab] = useState('groups');
    const { showToast } = useUI();

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background animate-in fade-in duration-700">
            {/* Header */}
            <div className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/20">
                        <Users className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">团队与协作管理</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex rounded-lg bg-muted/10 p-1 border border-border shadow-inner">
                        <button
                            onClick={() => { setActiveTab('groups'); showToast('已切换至协作组管理', 'info'); }}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-xs font-semibold transition-all",
                                activeTab === 'groups' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            协作组 (Groups)
                        </button>
                        <button
                            onClick={() => { setActiveTab('members'); showToast('已切换至全员名单', 'info'); }}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-xs font-semibold transition-all",
                                activeTab === 'members' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            全员名单
                        </button>
                    </div>
                    <button
                        onClick={() => showToast(activeTab === 'groups' ? '正在开启协作组创建向导...' : '正在同步企业内部通讯录...', 'info')}
                        className="glass-button px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold border-none flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:brightness-110 active:scale-95 transition-all"
                    >
                        {activeTab === 'groups' ? <Plus className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                        {activeTab === 'groups' ? '创建协作组' : '邀请成员'}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/5 via-background to-background">
                <div className="max-w-6xl mx-auto">
                    {activeTab === 'groups' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <GroupCard
                                name="交易链路组"
                                description="负责 iOS/Android 客户端支付、加购、结算流程的埋点治理与质量监控。"
                                memberCount={12}
                                appCount={2}
                            />
                            <GroupCard
                                name="营销增长组"
                                description="聚焦于新年大促、红包、裂变活动的数据追踪与转化效率分析。"
                                memberCount={8}
                                appCount={1}
                            />
                            <GroupCard
                                name="搜索质量组"
                                description="管理全平台搜索建议、搜索结果页、排序算法的效果评估埋点。"
                                memberCount={5}
                                appCount={3}
                            />
                            <GroupCard
                                name="基础架构组"
                                description="负责公共参数池、通用 SDK 埋点规范以及底层链路稳定性。"
                                memberCount={4}
                                appCount={5}
                            />
                            <div
                                className="border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-8 text-muted-foreground hover:border-foreground/10 transition-colors cursor-pointer group"
                                onClick={() => showToast('创建向导正在加载...', 'info')}
                            >
                                <div className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <p className="text-sm font-medium">创建新的协作组</p>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-primary" />
                                    <h4 className="font-semibold text-sm">成员列表 (24)</h4>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-muted/10 border border-border">仅展示当前租户</div>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border">
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">成员</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">角色权限</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">状态</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border text-shadow-sm">
                                    <UserRow name="Alex Chen" email="alex.c@nexus.com" role="Admin" status="Active" />
                                    <UserRow name="Sarah Zhao" email="sarah.z@nexus.com" role="Editor" status="Active" />
                                    <UserRow name="Mike Sun" email="mike.s@nexus.com" role="Editor" status="Offline" />
                                    <UserRow name="Lisa Li" email="lisa.l@nexus.com" role="Editor" status="Active" />
                                    <UserRow name="John Doe" email="john.d@nexus.com" role="Viewer" status="Offline" />
                                    <UserRow name="Emily Wang" email="emily.w@nexus.com" role="Editor" status="Active" />
                                </tbody>
                            </table>
                            <div className="px-6 py-3 bg-muted/5 border-t border-border text-center">
                                <button className="text-xs text-primary hover:underline font-medium" onClick={() => showToast('正在加载全量名单...', 'info')}>查看更多成员...</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
