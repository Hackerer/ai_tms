import { useState } from 'react';
import { Plus, Search, Tag, Trash2, Edit, ArrowLeft, Copy, Filter, Sliders } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAssets } from '../hooks/useAssets';
import { FeatureIcon } from '../components/FeatureIcon';

export const ParameterPool = () => {
    const { showToast, openModal } = useUI();
    const navigate = useNavigate();
    const { parameters, isLoading } = useAssets();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredParams = parameters.filter(p =>
        (selectedCategory === 'all' || p.category === selectedCategory) &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const categories = [
        { id: 'all', label: '全部参数', count: parameters.length },
        { id: 'global', label: '公共参数', count: parameters.filter(p => p.category === 'global').length },
        { id: 'domain', label: '业务域参数', count: parameters.filter(p => p.category === 'domain').length },
        { id: 'app', label: '应用参数', count: parameters.filter(p => p.category === 'app').length },
    ];

    const dataTypes = {
        'STRING': { label: '文本', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
        'NUMBER': { label: '数值', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
        'BOOLEAN': { label: '布尔', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
        'ARRAY': { label: '数组', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
        'OBJECT': { label: '对象', color: 'bg-pink-500/10 text-pink-600 border-pink-500/20' },
    };

    return (
        <div className="flex h-full bg-background overflow-hidden animate-in fade-in duration-500">
            {/* 左侧分类 Sidebar */}
            <div className="w-72 border-r border-border bg-background/50 backdrop-blur-sm flex flex-col pt-6 px-4 z-20">
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/assets')}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        返回资产库
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <FeatureIcon icon={Sliders} variant="primary" className="w-10 h-10 rounded-lg" />
                        <div>
                            <h2 className="text-lg font-bold text-foreground leading-tight">参数分类</h2>
                            <p className="text-xs text-muted-foreground">Parameter Categories</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5 flex-1">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group",
                                selectedCategory === cat.id
                                    ? "bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20"
                                    : "hover:bg-muted/5 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span>{cat.label}</span>
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold",
                                selectedCategory === cat.id
                                    ? "bg-primary/20 text-primary"
                                    : "bg-muted/10 text-muted-foreground group-hover:bg-muted/20"
                            )}>
                                {cat.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="pt-4 border-t border-border pb-6">
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex gap-2 mb-2">
                            <Tag className="w-4 h-4 text-primary shrink-0" />
                            <p className="text-xs font-bold text-primary">小贴士</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            参数池是全局共享的，修改公共参数定义可能会影响其引用的所有埋点事件，请谨慎操作。
                        </p>
                    </div>
                </div>
            </div>

            {/* 右侧参数列表 */}
            <div className="flex-1 flex flex-col bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
                {/* 顶部工具栏 */}
                <div className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/60 backdrop-blur-md z-10 transition-all">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-extrabold text-foreground tracking-tight">参数池管理</h2>
                        <div className="bg-muted/10 px-2 py-0.5 rounded text-xs font-mono text-muted-foreground">
                            {filteredParams.length} Items
                        </div>
                        <div className="h-4 w-[1px] bg-border mx-2" />
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="搜索参数名 (Key) 或描述..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-muted/10 border border-transparent rounded-lg pl-9 pr-3 py-1.5 text-xs w-72 focus:bg-background focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground/60 shadow-inner"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background/50 text-xs font-medium hover:bg-muted/10 transition-colors text-foreground shadow-sm">
                            <Filter className="w-3.5 h-3.5" />
                            高级筛选
                        </button>
                        <button
                            onClick={() => openModal('NEW_PARAMETER')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-lg hover:shadow-primary/25 hover:brightness-110 active:scale-95 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            新建参数
                        </button>
                    </div>
                </div>

                {/* 参数表格 */}
                <div className="flex-1 overflow-auto p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : filteredParams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <FeatureIcon icon={Tag} className="w-16 h-16 mb-4 opacity-50" variant="warning" scale={1.2} />
                            <p className="text-lg font-bold text-muted-foreground">暂无参数</p>
                            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                                该分类下还没有参数定义，您可以点击右上角新建按钮添加参数。
                            </p>
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl overflow-hidden border-border shadow-sm ring-1 ring-black/5">
                            <table className="w-full text-left">
                                <thead className="bg-muted/30 backdrop-blur-sm">
                                    <tr className="border-b border-border">
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">参数名 (Key)</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">数据类型</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">分类</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">业务描述</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 text-center">必填</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 text-center">引用</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {filteredParams.map(param => (
                                        <tr key={param.id} className="hover:bg-muted/5 group transition-colors h-14">
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col justify-center h-full">
                                                    <span className="font-mono text-sm font-bold text-foreground group-hover:text-primary transition-colors">{param.name}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{param.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded border font-bold uppercase",
                                                    dataTypes[param.data_type as keyof typeof dataTypes]?.color || "bg-muted/10 text-muted-foreground border-border"
                                                )}>
                                                    {dataTypes[param.data_type as keyof typeof dataTypes]?.label || param.data_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-muted/10 border border-border font-medium text-muted-foreground">
                                                    {param.category === 'global' ? '公共' : param.category === 'domain' ? '业务域' : '应用'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col max-w-md justify-center h-full">
                                                    <span className="text-sm text-foreground/80 line-clamp-1">{param.description}</span>
                                                    {param.enum_options.length > 0 && (
                                                        <span className="text-[10px] text-primary/70 mt-0.5 font-mono">
                                                            Enum: {param.enum_options.map(o => o.label).join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full mx-auto",
                                                    param.is_required ? "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]" : "bg-muted/30"
                                                )} />
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="text-xs font-bold text-foreground/70 bg-muted/10 px-2 py-1 rounded-full border border-border/50">
                                                    {param.used_by_events || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                                    <button
                                                        onClick={() => showToast(`已复制参数 ${param.name}`, 'success')}
                                                        className="p-1.5 hover:bg-background border border-transparent hover:border-border rounded transition-all shadow-sm"
                                                        title="复制参数名"
                                                    >
                                                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </button>
                                                    <button
                                                        onClick={() => showToast('编辑功能开发中...', 'info')}
                                                        className="p-1.5 hover:bg-background border border-transparent hover:border-border rounded transition-all shadow-sm"
                                                        title="编辑参数"
                                                    >
                                                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </button>
                                                    <button
                                                        onClick={() => showToast('删除功能开发中...', 'info')}
                                                        className="p-1.5 hover:bg-red-50 border border-transparent hover:border-red-100 rounded transition-all shadow-sm"
                                                        title="删除参数"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
