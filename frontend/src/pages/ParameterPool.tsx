import { useState, useEffect } from 'react';
import { Plus, Search, Tag, Trash2, Edit, ArrowLeft, Copy, Filter } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

// 基于后端 Property 模型的字段定义
interface Parameter {
    id: string;
    tenant_id: string;
    name: string;
    data_type: string; // STRING, NUMBER, BOOLEAN, ARRAY, OBJECT
    category: string; // global, domain, app
    description: string;
    is_required: boolean;
    enum_options: Array<{ value: string; label: string; description: string }>;
    created_at: string;
    used_by_events?: number; // 扩展字段:被多少个事件引用
}

export const ParameterPool = () => {
    const { showToast, openModal } = useUI();
    const navigate = useNavigate();
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchParameters();
    }, []);

    const fetchParameters = async () => {
        setIsLoading(true);
        try {
            // TODO: 替换为真实 API
            // const response = await fetch('/api/properties');
            // const data = await response.json();

            // Mock 数据
            const mockData: Parameter[] = [
                {
                    id: 'PROP-001',
                    tenant_id: 'TENANT-001',
                    name: 'user_id',
                    data_type: 'STRING',
                    category: 'global',
                    description: '用户唯一标识符',
                    is_required: true,
                    enum_options: [],
                    created_at: '2025-01-01 10:00:00',
                    used_by_events: 156,
                },
                {
                    id: 'PROP-002',
                    tenant_id: 'TENANT-001',
                    name: 'timestamp',
                    data_type: 'NUMBER',
                    category: 'global',
                    description: '事件发生时间戳(毫秒)',
                    is_required: true,
                    enum_options: [],
                    created_at: '2025-01-01 10:00:00',
                    used_by_events: 156,
                },
                {
                    id: 'PROP-003',
                    tenant_id: 'TENANT-001',
                    name: 'platform',
                    data_type: 'STRING',
                    category: 'global',
                    description: '终端平台类型',
                    is_required: true,
                    enum_options: [
                        { value: 'iOS', label: 'iOS', description: 'Apple iOS 设备' },
                        { value: 'Android', label: 'Android', description: 'Android 设备' },
                        { value: 'Web', label: 'Web', description: '网页端' },
                    ],
                    created_at: '2025-01-01 10:00:00',
                    used_by_events: 156,
                },
                {
                    id: 'PROP-004',
                    tenant_id: 'TENANT-001',
                    name: 'order_id',
                    data_type: 'STRING',
                    category: 'domain',
                    description: '订单唯一ID',
                    is_required: true,
                    enum_options: [],
                    created_at: '2025-01-15 14:30:00',
                    used_by_events: 23,
                },
                {
                    id: 'PROP-005',
                    tenant_id: 'TENANT-001',
                    name: 'payment_method',
                    data_type: 'STRING',
                    category: 'domain',
                    description: '支付方式',
                    is_required: false,
                    enum_options: [
                        { value: 'alipay', label: '支付宝', description: '' },
                        { value: 'wechat', label: '微信支付', description: '' },
                        { value: 'card', label: '银行卡', description: '' },
                    ],
                    created_at: '2025-01-15 14:30:00',
                    used_by_events: 12,
                },
                {
                    id: 'PROP-006',
                    tenant_id: 'TENANT-001',
                    name: 'device_model',
                    data_type: 'STRING',
                    category: 'app',
                    description: '设备型号',
                    is_required: false,
                    enum_options: [],
                    created_at: '2025-01-20 09:15:00',
                    used_by_events: 45,
                },
            ];

            setParameters(mockData);
        } catch (error) {
            console.error('Failed to fetch parameters:', error);
            showToast('加载参数失败', 'error');
        } finally {
            setIsLoading(false);
        }
    };

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
        'STRING': { label: '文本', color: 'bg-blue-500/10 text-blue-400 border-blue-500/10' },
        'NUMBER': { label: '数值', color: 'bg-green-500/10 text-green-400 border-green-500/10' },
        'BOOLEAN': { label: '布尔', color: 'bg-purple-500/10 text-purple-400 border-purple-500/10' },
        'ARRAY': { label: '数组', color: 'bg-orange-500/10 text-orange-400 border-orange-500/10' },
        'OBJECT': { label: '对象', color: 'bg-pink-500/10 text-pink-400 border-pink-500/10' },
    };

    return (
        <div className="flex h-full bg-background overflow-hidden">
            {/* 左侧分类 */}
            <div className="w-64 border-r border-white/10 bg-black/20 p-4 flex flex-col">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/assets')}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        返回资产库
                    </button>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        参数分类
                    </h3>
                </div>
                <div className="space-y-1 flex-1">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group",
                                selectedCategory === cat.id
                                    ? "bg-primary/20 text-primary font-bold shadow-sm"
                                    : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span>{cat.label}</span>
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
                                selectedCategory === cat.id
                                    ? "bg-primary/30 text-primary"
                                    : "bg-white/5 text-muted-foreground group-hover:bg-white/10"
                            )}>
                                {cat.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="pt-4 border-t border-white/10">
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-[10px] text-primary/70 leading-relaxed">
                            💡 参数池是全局共享的,可被多个事件复用。修改参数定义会影响所有引用该参数的事件。
                        </p>
                    </div>
                </div>
            </div>

            {/* 右侧参数列表 */}
            <div className="flex-1 flex flex-col">
                {/* 顶部工具栏 */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-extrabold">参数池管理</h2>
                        <span className="text-xs text-muted-foreground font-mono">
                            {filteredParams.length} 个参数
                        </span>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="搜索参数名或描述..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium hover:bg-white/10 transition-colors">
                            <Filter className="w-3.5 h-3.5" />
                            高级筛选
                        </button>
                        <button
                            onClick={() => openModal('NEW_PARAMETER')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:brightness-110 active:scale-95 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            新建参数
                        </button>
                    </div>
                </div>

                {/* 参数表格 */}
                <div className="flex-1 overflow-auto p-8 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-sm text-muted-foreground">加载中...</div>
                        </div>
                    ) : filteredParams.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-lg font-bold text-muted-foreground">暂无参数</p>
                                <p className="text-sm text-muted-foreground mt-2">该分类下还没有参数定义</p>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl overflow-hidden border-white/[0.05]">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">参数名 (Key)</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">数据类型</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">分类</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">业务描述</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">必填</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">引用次数</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredParams.map(param => (
                                        <tr key={param.id} className="hover:bg-white/[0.02] group transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-sm font-bold">{param.name}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{param.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded border font-bold uppercase",
                                                    dataTypes[param.data_type as keyof typeof dataTypes]?.color || "bg-white/5 text-muted-foreground border-white/10"
                                                )}>
                                                    {dataTypes[param.data_type as keyof typeof dataTypes]?.label || param.data_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 font-medium">
                                                    {param.category === 'global' ? '公共' : param.category === 'domain' ? '业务域' : '应用'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col max-w-md">
                                                    <span className="text-sm text-muted-foreground line-clamp-1">{param.description}</span>
                                                    {param.enum_options.length > 0 && (
                                                        <span className="text-[10px] text-primary mt-1">
                                                            枚举: {param.enum_options.map(o => o.label).join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full mx-auto",
                                                    param.is_required ? "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]" : "bg-white/10"
                                                )} />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-xs font-bold text-primary">{param.used_by_events || 0}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => showToast(`已复制参数 ${param.name}`, 'success')}
                                                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                                        title="复制参数名"
                                                    >
                                                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </button>
                                                    <button
                                                        onClick={() => showToast('编辑功能开发中...', 'info')}
                                                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                                        title="编辑参数"
                                                    >
                                                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </button>
                                                    <button
                                                        onClick={() => showToast('删除功能开发中...', 'info')}
                                                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                                        title="删除参数"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
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
