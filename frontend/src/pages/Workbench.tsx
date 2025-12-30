import {
    ArrowLeft,
    Save,
    Send,
    Plus,
    Trash2,
    ChevronDown,
    ChevronRight,
    SearchCode,
    Layers,
    AlertTriangle,
    Copy,
    X,
    FileText,
    Eye
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { EventDiffModal } from '../components/EventDiffModal';


// --- Types (基于后端 TrackingRequest 模型) ---

interface Parameter {
    key: string;
    type: string;
    desc: string;
    isRequired: boolean;
}

interface EventChange {
    id: string;
    name: string;
    operation: 'create' | 'edit' | 'delete'; // 对应后端 EventRef.operation
    description: string;
    page_id?: string;
    event_type?: string;
    parameters: Parameter[];
    isExpanded: boolean;
}

interface TrackingRequest {
    id: string;
    title: string;
    status: 'Draft' | 'Reviewing' | 'Approved' | 'Rejected' | 'Applied';
    created_user_id: string;
    event_references: EventChange[];
    doc_url: string;
}

// --- Asset Library Sidebar Component ---

const AssetLibrarySidebar = ({ isOpen, onClose, onSelect }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (event: any) => void;
}) => {
    const [search, setSearch] = useState('');

    // Mock 资产库数据
    const mockAssets = [
        { id: 'EVT-10023', name: 'hot_sale_click', type: 'Click', page: '热销看板', params: 5 },
        { id: 'EVT-10024', name: 'banner_show', type: 'Exposure', page: '热销看板', params: 3 },
        { id: 'EVT-10027', name: 'cart_add_click', type: 'Click', page: '购物车', params: 4 },
        { id: 'EVT-10028', name: 'cart_checkout_click', type: 'Click', page: '购物车', params: 6 },
    ];

    const filteredAssets = mockAssets.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.page.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
            <div className="w-[500px] bg-background border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/20">
                    <h3 className="text-lg font-bold">从资产库拉取</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-white/10">
                    <div className="relative">
                        <SearchCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="搜索事件名或页面..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                    </div>
                </div>

                {/* Asset List */}
                <div className="flex-1 overflow-auto p-4 space-y-2">
                    {filteredAssets.map(asset => (
                        <div
                            key={asset.id}
                            onClick={() => onSelect(asset)}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-white/10 cursor-pointer transition-all group"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="text-sm font-mono font-bold group-hover:text-primary transition-colors">{asset.name}</h4>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{asset.id} • {asset.page}</p>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                    {asset.params} 参数
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/10 font-bold">
                                    {asset.type}
                                </span>
                            </div>
                        </div>
                    ))}
                    {filteredAssets.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">未找到匹配的事件</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Submit Confirmation Modal ---

const SubmitConfirmModal = ({ isOpen, onClose, onConfirm, changes }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    changes: EventChange[];
}) => {
    if (!isOpen) return null;

    const newCount = changes.filter(c => c.operation === 'create').length;
    const editCount = changes.filter(c => c.operation === 'edit').length;
    const deleteCount = changes.filter(c => c.operation === 'delete').length;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
            <div className="w-[500px] glass-card rounded-2xl border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                    <h3 className="text-lg font-bold">确认提交审批?</h3>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-muted-foreground">本次变更包含:</p>
                    <div className="space-y-2">
                        {newCount > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                                <span className="text-sm text-green-400">• 新建事件</span>
                                <span className="text-lg font-bold text-green-400">{newCount} 个</span>
                            </div>
                        )}
                        {editCount > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                <span className="text-sm text-blue-400">• 编辑事件</span>
                                <span className="text-lg font-bold text-blue-400">{editCount} 个</span>
                            </div>
                        )}
                        {deleteCount > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                <span className="text-sm text-red-400">• 删除事件</span>
                                <span className="text-lg font-bold text-red-400">{deleteCount} 个</span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-xs text-muted-foreground">
                            <span className="font-bold text-primary">审批流程:</span> 数据负责人 → 技术负责人
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:brightness-110 active:scale-95 transition-all"
                    >
                        确认提交
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Parameter Table Component ---

interface ParameterTableProps {
    params: Parameter[];
    eventIndex: number;
    isReadOnly: boolean;
    onParamChange: (eventIdx: number, paramIdx: number, field: keyof Parameter, value: any) => void;
    onParamAdd: (eventIdx: number) => void;
    onParamDelete: (eventIdx: number, paramIdx: number) => void;
}

const ParameterTable = ({ params, eventIndex, isReadOnly, onParamChange, onParamAdd, onParamDelete }: ParameterTableProps) => {
    const [editingCell, setEditingCell] = useState<{ paramIdx: number; field: string } | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    const DATA_TYPES = ['String', 'Number', 'Boolean', 'Object', 'Array'];

    const startEdit = (paramIdx: number, field: string, currentValue: any) => {
        setEditingCell({ paramIdx, field });
        setEditValue(String(currentValue));
    };

    const saveEdit = () => {
        if (editingCell) {
            const field = editingCell.field as keyof Parameter;
            let value: any = editValue;

            // 验证参数名格式
            if (field === 'key') {
                if (!/^[a-z_][a-z0-9_]*$/.test(editValue)) {
                    alert('参数名只能包含小写字母、数字和下划线,且必须以字母或下划线开头');
                    return;
                }
            }

            onParamChange(eventIndex, editingCell.paramIdx, field, value);
            setEditingCell(null);
        }
    };

    const cancelEdit = () => {
        setEditingCell(null);
        setEditValue('');
    };

    return (
        <div className="mx-6 mb-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 shadow-inner">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-white/5">
                        <th className="pb-2 text-[10px] font-bold uppercase text-muted-foreground">参数键名 (Key)</th>
                        <th className="pb-2 text-[10px] font-bold uppercase text-muted-foreground">数据类型</th>
                        <th className="pb-2 text-[10px] font-bold uppercase text-muted-foreground">含义说明</th>
                        <th className="pb-2 text-[10px] font-bold uppercase text-muted-foreground">必填</th>
                        <th className="pb-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {params.map((p, i) => (
                        <tr key={i} className="group hover:bg-white/[0.01]">
                            <td className="py-2 text-xs font-mono">
                                {!isReadOnly && editingCell?.paramIdx === i && editingCell?.field === 'key' ? (
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={saveEdit}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEdit();
                                            if (e.key === 'Escape') cancelEdit();
                                        }}
                                        autoFocus
                                        className="w-full bg-white/5 border border-primary/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                                    />
                                ) : (
                                    <span
                                        onClick={() => !isReadOnly && startEdit(i, 'key', p.key)}
                                        className={!isReadOnly ? 'cursor-pointer hover:text-primary transition-colors' : ''}
                                    >
                                        {p.key}
                                    </span>
                                )}
                            </td>
                            <td className="py-2">
                                {!isReadOnly && editingCell?.paramIdx === i && editingCell?.field === 'type' ? (
                                    <select
                                        value={editValue}
                                        onChange={(e) => {
                                            setEditValue(e.target.value);
                                            onParamChange(eventIndex, i, 'type', e.target.value);
                                            setEditingCell(null);
                                        }}
                                        autoFocus
                                        className="bg-white/5 border border-primary/30 rounded px-2 py-1 text-[10px] font-bold uppercase focus:outline-none focus:border-primary/60"
                                    >
                                        {DATA_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span
                                        onClick={() => !isReadOnly && startEdit(i, 'type', p.type)}
                                        className={cn(
                                            "text-[10px] px-2 py-0.5 rounded border font-bold uppercase",
                                            p.type === 'String' && "bg-blue-500/10 text-blue-400 border-blue-500/10",
                                            p.type === 'Number' && "bg-green-500/10 text-green-400 border-green-500/10",
                                            p.type === 'Boolean' && "bg-purple-500/10 text-purple-400 border-purple-500/10",
                                            p.type === 'Object' && "bg-orange-500/10 text-orange-400 border-orange-500/10",
                                            p.type === 'Array' && "bg-pink-500/10 text-pink-400 border-pink-500/10",
                                            !isReadOnly && "cursor-pointer hover:brightness-125 transition-all"
                                        )}
                                    >
                                        {p.type}
                                    </span>
                                )}
                            </td>
                            <td className="py-2 text-xs text-muted-foreground">
                                {!isReadOnly && editingCell?.paramIdx === i && editingCell?.field === 'desc' ? (
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={saveEdit}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEdit();
                                            if (e.key === 'Escape') cancelEdit();
                                        }}
                                        autoFocus
                                        className="w-full bg-white/5 border border-primary/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                                    />
                                ) : (
                                    <span
                                        onClick={() => !isReadOnly && startEdit(i, 'desc', p.desc)}
                                        className={!isReadOnly ? 'cursor-pointer hover:text-primary transition-colors' : ''}
                                    >
                                        {p.desc}
                                    </span>
                                )}
                            </td>
                            <td className="py-2">
                                <div
                                    onClick={() => !isReadOnly && onParamChange(eventIndex, i, 'isRequired', !p.isRequired)}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all",
                                        p.isRequired ? "bg-orange-400" : "bg-white/10",
                                        !isReadOnly && "cursor-pointer hover:scale-150"
                                    )}
                                />
                            </td>
                            <td className="py-2 text-right">
                                {!isReadOnly && (
                                    <button
                                        onClick={() => onParamDelete(eventIndex, i)}
                                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {!isReadOnly && (
                        <tr className="border-t border-white/5">
                            <td colSpan={5} className="pt-2">
                                <button
                                    onClick={() => onParamAdd(eventIndex)}
                                    className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                                >
                                    <Plus className="w-3 h-3" /> 新增字段
                                </button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};


// --- Main Workbench Component ---

export const Workbench = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useUI();

    const [request, setRequest] = useState<TrackingRequest>({
        id: id || 'REQ-001',
        title: '2025Q1 支付环节漏斗治理',
        status: 'Draft',
        created_user_id: 'USER-001',
        doc_url: '',
        event_references: [
            {
                id: 'EVT-001',
                name: 'cart_add_click',
                operation: 'edit',
                description: '购物车添加按钮点击，需增加优惠券核销字段',
                isExpanded: true,
                parameters: [
                    { key: 'item_id', type: 'String', desc: '商品唯一ID', isRequired: true },
                    { key: 'coupon_code', type: 'String', desc: '核销券码', isRequired: false },
                    { key: 'price', type: 'Number', desc: '券后价格', isRequired: true }
                ]
            },
            {
                id: 'EVT-NEW-001',
                name: 'banner_recommend_show',
                operation: 'create',
                description: '首页智能瀑布流曝光统计',
                isExpanded: false,
                parameters: [
                    { key: 'pos_id', type: 'Number', desc: '展示坑位', isRequired: true },
                    { key: 'rec_id', type: 'String', desc: '算法推荐引擎ID', isRequired: true }
                ]
            }
        ]
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
    const [selectedEventForDiff, setSelectedEventForDiff] = useState<EventChange | null>(null);

    // Mock 旧版本数据 (用于 Diff 对比)
    const mockOldVersions: Record<string, any> = {
        'EVT-001': {
            name: 'cart_add_click',
            description: '购物车添加按钮点击',
            event_type: 'Click',
            page: '购物车',
            parameters: [
                { key: 'item_id', type: 'String', desc: '商品唯一ID', isRequired: true },
                { key: 'price', type: 'String', desc: '商品价格', isRequired: true },
                { key: 'old_field', type: 'String', desc: '旧字段(将被删除)', isRequired: false }
            ]
        }
    };

    const toggleExpand = (index: number) => {
        const newRefs = [...request.event_references];
        newRefs[index].isExpanded = !newRefs[index].isExpanded;
        setRequest({ ...request, event_references: newRefs });
    };

    const handleAssetSelect = (asset: any) => {
        // 从资产库拉取事件,标记为 EDIT
        const newChange: EventChange = {
            id: asset.id,
            name: asset.name,
            operation: 'edit',
            description: `从资产库拉取: ${asset.page}`,
            isExpanded: false,
            parameters: [] // TODO: 从 API 获取完整参数
        };
        setRequest({
            ...request,
            event_references: [...request.event_references, newChange]
        });
        setIsSidebarOpen(false);
        showToast(`已添加 ${asset.name} 到变更集`, 'success');
    };

    const handleSubmit = () => {
        // 校验
        if (request.event_references.length === 0) {
            showToast('变更集不能为空', 'error');
            return;
        }
        setIsSubmitModalOpen(true);
    };

    const confirmSubmit = () => {
        // TODO: 调用后端 API POST /api/requests/{id}/submit
        showToast('需求已提交审批,状态变更为 Reviewing', 'success');
        setIsSubmitModalOpen(false);
        // 模拟状态变更
        setRequest({ ...request, status: 'Reviewing' });
    };

    const [lastSaved, setLastSaved] = useState<string | null>(null);

    const handleSaveDraft = () => {
        // TODO: 调用后端 API PUT /api/requests/{id}
        const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        setLastSaved(now);
        showToast(`草稿已保存 (${now})`, 'success');
    };

    const handleDirectCreate = () => {
        const newEvent: EventChange = {
            id: `EVT-NEW-${Date.now()}`,
            name: 'new_event_name',
            operation: 'create',
            description: '新建事件描述',
            isExpanded: true,
            parameters: [
                { key: 'param_1', type: 'String', desc: '参数描述', isRequired: true }
            ]
        };
        setRequest({
            ...request,
            event_references: [...request.event_references, newEvent]
        });
        showToast('已添加新事件到变更集', 'success');
    };

    const handleCopyEvent = (index: number) => {
        const eventToCopy = request.event_references[index];
        const copiedEvent: EventChange = {
            ...eventToCopy,
            id: `${eventToCopy.id}-COPY-${Date.now()}`,
            name: `${eventToCopy.name}_copy`,
            isExpanded: false
        };
        setRequest({
            ...request,
            event_references: [...request.event_references, copiedEvent]
        });
        showToast(`已复制事件: ${eventToCopy.name}`, 'success');
    };

    const handleDeleteEvent = (index: number) => {
        const eventToDelete = request.event_references[index];
        const newRefs = request.event_references.filter((_, i) => i !== index);
        setRequest({
            ...request,
            event_references: newRefs
        });
        showToast(`已移除事件: ${eventToDelete.name}`, 'success');
    };

    const handleParamChange = (eventIdx: number, paramIdx: number, field: keyof Parameter, value: any) => {
        const newRefs = [...request.event_references];
        newRefs[eventIdx].parameters[paramIdx] = {
            ...newRefs[eventIdx].parameters[paramIdx],
            [field]: value
        };
        setRequest({ ...request, event_references: newRefs });
    };

    const handleParamAdd = (eventIdx: number) => {
        const newRefs = [...request.event_references];
        const newParam: Parameter = {
            key: `param_${newRefs[eventIdx].parameters.length + 1}`,
            type: 'String',
            desc: '参数描述',
            isRequired: false
        };
        newRefs[eventIdx].parameters.push(newParam);
        setRequest({ ...request, event_references: newRefs });
        showToast('已添加新参数', 'success');
    };

    const handleParamDelete = (eventIdx: number, paramIdx: number) => {
        const newRefs = [...request.event_references];
        const paramName = newRefs[eventIdx].parameters[paramIdx].key;
        newRefs[eventIdx].parameters = newRefs[eventIdx].parameters.filter((_, i) => i !== paramIdx);
        setRequest({ ...request, event_references: newRefs });
        showToast(`已删除参数: ${paramName}`, 'success');
    };


    // 冲突检测
    const eventNames = request.event_references.map(r => r.name);
    const duplicates = eventNames.filter((name, index) => eventNames.indexOf(name) !== index);
    const hasConflicts = duplicates.length > 0;

    const statusMap = {
        'create': { label: 'NEW', color: 'bg-green-500/20 text-green-400 border-green-500/20' },
        'edit': { label: 'EDIT', color: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
        'delete': { label: 'DEL', color: 'bg-red-500/20 text-red-400 border-red-500/20' },
    };

    const isReadOnly = request.status !== 'Draft' && request.status !== 'Rejected';

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
            {/* Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/workflows')}
                        className="p-2 hover:bg-white/5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold tracking-tight">{request.title}</h2>
                            <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold tracking-widest border",
                                request.status === 'Draft' ? "bg-orange-500/20 text-orange-400 border-orange-500/10" :
                                    request.status === 'Reviewing' ? "bg-blue-500/20 text-blue-400 border-blue-500/10" :
                                        request.status === 'Approved' ? "bg-green-500/20 text-green-400 border-green-500/10" :
                                            "bg-red-500/20 text-red-400 border-red-500/10"
                            )}>
                                {request.status.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase">
                            Requirement # {request.id} • Created by Alex Chen
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!isReadOnly && (
                        <>
                            <button
                                onClick={handleSaveDraft}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-bold hover:bg-white/10 transition-colors"
                            >
                                <Save className="w-3.5 h-3.5" />
                                保存草稿
                                {lastSaved && (
                                    <span className="text-[10px] text-muted-foreground ml-1">({lastSaved})</span>
                                )}
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:brightness-110 active:scale-95 transition-all"
                            >
                                <Send className="w-3.5 h-3.5" />
                                提交审批
                            </button>
                        </>
                    )}
                    {request.status === 'Reviewing' && (
                        <div className="text-xs text-muted-foreground">
                            审批中,工作台为只读模式
                        </div>
                    )}
                </div>
            </div>

            {/* Toolbar / Search Engine */}
            {!isReadOnly && (
                <div className="px-8 py-4 bg-white/[0.01] border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 max-w-2xl">
                        <div className="relative flex-1">
                            <SearchCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-pulse" />
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-left text-muted-foreground hover:bg-white/10 transition-all"
                            >
                                搜索资产库以检索现有埋点进行修改 (EDIT)...
                            </button>
                        </div>
                        <button
                            onClick={handleDirectCreate}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors shrink-0"
                        >
                            <Plus className="w-4 h-4 text-primary" />
                            直接新建 (NEW)
                        </button>
                    </div>
                    {hasConflicts && (
                        <div className="flex items-center gap-2 px-4">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/10 text-red-400">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">检测到事件名冲突</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Workbench Grid Editor */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="glass-card rounded-2xl overflow-hidden border-white/[0.05] shadow-xl">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="w-12"></th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">状态</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-1/4">事件名称 (Event Code)</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">业务描述</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {request.event_references.map((change, idx) => (
                                    <Fragment key={change.id}>
                                        <tr
                                            className={cn(
                                                "transition-colors group",
                                                change.isExpanded ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
                                            )}
                                        >
                                            <td className="pl-4 py-4">
                                                <button
                                                    onClick={() => toggleExpand(idx)}
                                                    className="p-1 hover:bg-white/10 rounded transition-colors text-muted-foreground"
                                                >
                                                    {change.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded border tracking-tighter", statusMap[change.operation].color)}>
                                                    {statusMap[change.operation].label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        defaultValue={change.name}
                                                        disabled={isReadOnly}
                                                        className={cn(
                                                            "bg-transparent border-none focus:outline-none text-sm font-mono w-full p-1 rounded",
                                                            isReadOnly ? "cursor-not-allowed" : "hover:bg-white/5 transition-colors"
                                                        )}
                                                    />
                                                    {duplicates.includes(change.name) && (
                                                        <span title="事件名重复">
                                                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    defaultValue={change.description}
                                                    disabled={isReadOnly}
                                                    className={cn(
                                                        "bg-transparent border-none focus:outline-none text-xs text-muted-foreground w-full p-1 rounded",
                                                        isReadOnly ? "cursor-not-allowed" : "hover:bg-white/5 transition-colors"
                                                    )}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {!isReadOnly && (
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {change.operation === 'edit' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedEventForDiff(change);
                                                                    setIsDiffModalOpen(true);
                                                                }}
                                                                className="p-2 hover:bg-primary/10 rounded-lg text-primary"
                                                                title="查看变更"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopyEvent(idx);
                                                            }}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground"
                                                            title="复制"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteEvent(idx);
                                                            }}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-red-500/70"
                                                            title="移除"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}

                                            </td>
                                        </tr>
                                        {change.isExpanded && (
                                            <tr className="bg-white/[0.02] border-b border-white/5">
                                                <td colSpan={5}>
                                                    <div className="flex items-center gap-2 px-8 py-3 text-xs font-bold text-muted-foreground">
                                                        <Layers className="w-3.5 h-3.5" />
                                                        参数映射表
                                                    </div>
                                                    <ParameterTable
                                                        params={change.parameters}
                                                        eventIndex={idx}
                                                        isReadOnly={isReadOnly}
                                                        onParamChange={handleParamChange}
                                                        onParamAdd={handleParamAdd}
                                                        onParamDelete={handleParamDelete}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                        {!isReadOnly && (
                            <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-center">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    点击此处添加更多变更项
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Legend / Tips Area */}
                    <div className="flex items-center gap-6 px-4">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <div className="w-2 h-2 rounded bg-green-500/40" />
                            <span>[NEW] 新增埋点</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <div className="w-2 h-2 rounded bg-blue-500/40" />
                            <span>[EDIT] 存量修改</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <div className="w-2 h-2 rounded bg-red-500/40" />
                            <span>[DEL] 申请下线</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AssetLibrarySidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onSelect={handleAssetSelect}
            />
            <SubmitConfirmModal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                onConfirm={confirmSubmit}
                changes={request.event_references}
            />
            <EventDiffModal
                isOpen={isDiffModalOpen}
                onClose={() => setIsDiffModalOpen(false)}
                eventDiff={selectedEventForDiff ? {
                    eventId: selectedEventForDiff.id,
                    eventName: selectedEventForDiff.name,
                    oldVersion: mockOldVersions[selectedEventForDiff.id],
                    newVersion: {
                        name: selectedEventForDiff.name,
                        description: selectedEventForDiff.description,
                        event_type: selectedEventForDiff.event_type || 'Click',
                        page: selectedEventForDiff.page_id || '购物车',
                        parameters: selectedEventForDiff.parameters
                    }
                } : null}
            />

        </div>
    );
};
