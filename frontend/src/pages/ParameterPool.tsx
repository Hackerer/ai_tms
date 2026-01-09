import { useState } from 'react';
import { Plus, Search, Trash2, Edit, Copy, Sliders } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';
import { useAssets } from '../hooks/useAssets';

export const ParameterPool = () => {
    const { showToast, openModal } = useUI();
    const { parameters, isLoading } = useAssets();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = [
        { id: 'all', label: '全部', count: parameters.length },
        { id: 'sdk', label: 'SDK公参', count: parameters.filter(p => p.category === 'global').length },
        { id: 'business', label: '业务公参', count: parameters.filter(p => p.category === 'domain').length },
        { id: 'custom', label: '自定义参数', count: parameters.filter(p => p.category === 'app').length },
    ];

    const filteredParams = parameters.filter(p => {
        let categoryMatch = selectedCategory === 'all';
        if (!categoryMatch) {
            if (selectedCategory === 'sdk') categoryMatch = p.category === 'global';
            if (selectedCategory === 'business') categoryMatch = p.category === 'domain';
            if (selectedCategory === 'custom') categoryMatch = p.category === 'app';
        }

        const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase());

        return categoryMatch && searchMatch;
    });

    const dataTypes = {
        'STRING': { label: '文本', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
        'NUMBER': { label: '数值', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
        'BOOLEAN': { label: '布尔', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
        'ARRAY': { label: '数组', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
        'OBJECT': { label: '对象', color: 'bg-pink-500/10 text-pink-600 border-pink-500/20' },
    };

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden">

            {/* Toolbar - 两行布局 */}
            <div className="border-b border-border bg-muted/20 px-8 py-4 shrink-0">
                {/* 第一行：搜索框 + 新建按钮 */}
                <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="搜索参数名或描述..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        />
                    </div>

                    <button
                        onClick={() => openModal('createParameter')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        新建参数
                    </button>
                </div>

                {/* 第二行：分类筛选器 */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground shrink-0">分类：</span>
                    <div className="flex gap-1">
                        {categories.map(cat => {
                            const isActive = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    {cat.label}
                                    <span className={cn(
                                        "text-xs font-mono",
                                        isActive ? "opacity-80" : "opacity-60"
                                    )}>
                                        {cat.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 数据表格 */}
            <div className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
                <div className="p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-sm text-muted-foreground">加载中...</div>
                        </div>
                    ) : filteredParams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="text-sm text-muted-foreground mb-2">
                                {searchTerm ? '未找到匹配的参数' : '暂无参数'}
                            </div>
                            <button
                                onClick={() => openModal('createParameter')}
                                className="text-sm text-primary hover:underline"
                            >
                                创建第一个参数
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-md">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3.5">
                                            参数名 (KEY)
                                        </th>
                                        <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3.5">
                                            数据类型
                                        </th>
                                        <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3.5">
                                            业务描述
                                        </th>
                                        <th className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3.5">
                                            引用
                                        </th>
                                        <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3.5">
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredParams.map((param) => (
                                        <tr
                                            key={param.id}
                                            className="group hover:bg-muted/5 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-mono font-bold text-sm text-foreground">
                                                        {param.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {param.id}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex px-2.5 py-1 rounded text-xs font-bold border",
                                                    dataTypes[param.data_type]?.color || 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                                                )}>
                                                    {dataTypes[param.data_type]?.label || param.data_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                                                    {param.description}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                    {param.used_by_events || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="p-1.5 rounded hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors"
                                                        title="复制"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-1.5 rounded hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors"
                                                        title="编辑"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-600 transition-colors"
                                                        title="删除"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
