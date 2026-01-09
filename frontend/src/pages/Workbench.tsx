import { useState, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    LayoutList,
    Grid3X3,
    LayoutGrid,
    Eye
} from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { EventScreenshot } from '../components/EventScreenshot';
import { cn } from '../lib/utils';
import { useUI } from '../context/UIContext';
import { EventDiffModal } from '../components/modals/EventDiffModal';
import { useWorkbench } from '../hooks/useWorkbench';
import type { EventChange, WorkflowParameter as Parameter } from '../types/workflow';
import { AssetLibrarySidebar } from '../components/AssetLibrarySidebar';
import { AssetCombobox } from '../components/AssetCombobox';
import { SubmitConfirmModal } from '../components/modals/SubmitConfirmModal';
import { BatchAddParameterModal } from '../components/modals/BatchAddParameterModal';
import { ParameterFinderModal } from '../components/modals/ParameterFinderModal';
import { NewParameterModal } from '../components/modals/NewParameterModal';
import { ParameterTable } from '../components/ParameterTable';
import { EventGrid } from '../components/EventGrid';
import { FeatureIcon } from '../components/FeatureIcon';
import { WorkflowSteps } from '../components/WorkflowSteps';


// --- Main Workbench Component ---

export const Workbench = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useUI();

    // 使用工作台 Hook 管理状态和业务逻辑
    const {
        request,
        isReadOnly,
        conflictInfo,
        canSubmit,
        toggleExpand,
        addEventFromAsset,
        createNewEvent,
        copyEvent,
        deleteEvent,
        updateEventField,
        deleteEventsByIds,
        addParameterToEvents,
        updateParameter,
        addParameter,
        deleteParameter,
        saveDraft,
        submitForReview,
    } = useWorkbench(id || '');

    // UI 状态
    const [isComboboxOpen, setIsComboboxOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // 搜索关键词
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isBatchParamModalOpen, setIsBatchParamModalOpen] = useState(false);
    const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
    const [selectedEventForDiff, setSelectedEventForDiff] = useState<EventChange | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [rowSelection, setRowSelection] = useState({});

    // Parameter Selector State
    const [activeEventIndex, setActiveEventIndex] = useState<number | null>(null);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [isCreateParamOpen, setIsCreateParamOpen] = useState(false);
    const [createParamKeyword, setCreateParamKeyword] = useState('');

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

    // 事件处理器
    const handleAssetSelect = (asset: any) => {
        const newChange = addEventFromAsset(asset);
        showToast(`已添加 ${newChange.name} 到变更集`, 'success');
    };

    const handleSubmit = () => {
        if (!canSubmit) {
            showToast('变更集不能为空或存在冲突', 'error');
            return;
        }
        setIsSubmitModalOpen(true);
    };

    const confirmSubmit = async () => {
        await submitForReview();
        showToast('需求已提交审批,状态变更为 Reviewing', 'success');
        setIsSubmitModalOpen(false);
    };

    const handleSaveDraft = async () => {
        const savedTime = await saveDraft();
        showToast(`草稿已保存 (${savedTime})`, 'success');
    };

    const handleDirectCreate = () => {
        createNewEvent();
        showToast('已添加新事件到变更集', 'success');
    };

    const handleCopyEvent = (index: number) => {
        const copied = copyEvent(index);
        showToast(`已复制: ${copied.name}`, 'success');
    };

    const handleBatchDelete = () => {
        const ids = Object.keys(rowSelection);
        if (ids.length === 0) return;

        if (window.confirm(`确认删除选中的 ${ids.length} 个事件吗？`)) {
            deleteEventsByIds(ids);
            setRowSelection({});
            showToast(`已批量删除 ${ids.length} 个事件`, 'success');
        }
    };

    const handleOpenBatchAddParam = () => {
        setIsBatchParamModalOpen(true);
    };

    const handleBatchAddParamConfirm = (param: any) => {
        const ids = Object.keys(rowSelection);
        addParameterToEvents(ids, param);
        setIsBatchParamModalOpen(false);
        setRowSelection({});
        showToast(`已为 ${ids.length} 个事件添加参数: ${param.key}`, 'success');
    };


    const handleDeleteEvent = (index: number) => {
        const deleted = deleteEvent(index);
        showToast(`已移除事件: ${deleted.name}`, 'success');
    };

    const handleParamChange = (eventIdx: number, paramIdx: number, field: keyof Parameter, value: any) => {
        updateParameter(eventIdx, paramIdx, field, value);
    };

    const handleParamAdd = (eventIdx: number) => {
        setActiveEventIndex(eventIdx);
        setIsSelectorOpen(true);
    };

    const handleSelectorSelect = (param: Parameter) => {
        if (activeEventIndex !== null) {
            addParameter(activeEventIndex, param);
            showToast(`已引用参数: ${param.key}`, 'success');
        }
        // Keep modal open for multi-select
        // setIsSelectorOpen(false);
        // setActiveEventIndex(null);
    };

    const handleSelectorCreate = (keyword: string) => {
        setCreateParamKeyword(keyword);
        setIsSelectorOpen(false);
        setIsCreateParamOpen(true);
    };

    const handleCreateConfirm = (param: Parameter) => {
        if (activeEventIndex !== null) {
            addParameter(activeEventIndex, param);
            showToast(`已创建并引用参数: ${param.key}`, 'success');
        }
        setIsCreateParamOpen(false);
        setActiveEventIndex(null);
    };

    const handleParamDelete = (eventIdx: number, paramIdx: number) => {
        deleteParameter(eventIdx, paramIdx);
        showToast('已删除参数', 'success');
    };

    const hasConflicts = conflictInfo.hasDuplicates;
    const duplicates = conflictInfo.duplicateNames;

    const statusMap = {
        'create': { label: 'NEW', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
        'edit': { label: 'EDIT', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
        'delete': { label: 'DEL', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background">
            {/* Header */}
            {/* Top Navigation & Breadcrumbs */}
            <div className="h-14 border-b border-border bg-muted/5 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0 gap-2">
                {/* 左侧：返回按钮 + 标题（可截断） */}
                <div className="flex items-center gap-2 lg:gap-4 min-w-0 shrink-0">
                    <button
                        onClick={() => navigate('/workflows')}
                        className="p-2 -ml-2 hover:bg-muted/10 rounded-lg text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-sm text-foreground truncate max-w-[120px] lg:max-w-[200px] xl:max-w-none">{request.title}</span>
                            <span className="px-1.5 py-0.5 rounded bg-muted/5 text-muted-foreground text-[10px] font-mono border border-border shrink-0">
                                {request.id}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 中部：WorkflowSteps（响应式显示/隐藏） */}
                <div className="hidden lg:flex flex-1 justify-center max-w-md xl:max-w-2xl mx-2 xl:mx-8 min-w-0">
                    <WorkflowSteps currentStatus={request.status} />
                </div>

                {/* 右侧：按钮组 */}
                <div className="flex items-center gap-2 lg:gap-3 shrink-0">

                    {/* 操作按钮 */}
                    {!isReadOnly && (
                        <>
                            <button
                                onClick={handleSaveDraft}
                                className="px-2 lg:px-3 py-1.5 rounded-md border border-border bg-muted/5 text-xs font-medium text-foreground hover:bg-muted/10 transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">保存</span>
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-2 lg:px-3 py-1.5 rounded-md bg-blue-600/90 text-white text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">提交</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            {!isReadOnly && (
                <div className="px-6 py-4 bg-surface-container border-b border-border flex items-center justify-between sticky top-14 z-50">{/* z-50确保在backdrop(z-40)之上 */}
                    <div className="flex items-center gap-3 flex-1 max-w-3xl">
                        <div className="relative flex-1 group">
                            <SearchCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsComboboxOpen(true)}
                                placeholder="搜索资产库添加已有埋点..."
                                className="w-full bg-surface-container-high border border-border rounded-xl pl-10 pr-20 py-2 text-sm text-left text-foreground placeholder:text-muted-foreground hover:bg-surface-container-highest transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-surface-container px-1.5 py-0.5 rounded border border-border text-muted-foreground pointer-events-none">
                                添加已有
                            </span>
                            {/* AssetCombobox - 紧贴input下方 */}
                            <AssetCombobox
                                open={isComboboxOpen}
                                onOpenChange={(open) => {
                                    setIsComboboxOpen(open);
                                    if (!open) setSearchQuery(''); // 关闭时清空
                                }}
                                onSelect={(assets) => {
                                    assets.forEach(asset => addEventFromAsset(asset));
                                    showToast(`成功添加 ${assets.length} 个埋点`, 'success');
                                }}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                availableAssets={[
                                    { id: 'EVT-10023', name: 'hot_sale_click', type: 'Click', page: '热销看板', params: 5 },
                                    { id: 'EVT-10024', name: 'banner_show', type: 'Exposure', page: '热销看板', params: 3 },
                                    { id: 'EVT-10027', name: 'cart_add_click', type: 'Click', page: '购物车', params: 4 },
                                    { id: 'EVT-10028', name: 'cart_checkout_click', type: 'Click', page: '购物车', params: 6 },
                                ]}
                            />
                        </div>
                        <button
                            onClick={handleDirectCreate}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/90 border border-blue-600/50 text-white text-xs font-bold hover:bg-blue-600 transition-all shrink-0 active:scale-95 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            注册新埋点
                        </button>
                    </div>

                    {/* 视图切换按钮 */}
                    <div className="flex bg-muted/5 rounded-lg p-1 border border-border items-center">
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-1.5 rounded-md transition-all flex items-center gap-1.5 px-2",
                                viewMode === 'list' ? "bg-surface-container text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutList className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium hidden xl:inline">列表</span>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-1.5 rounded-md transition-all flex items-center gap-1.5 px-2",
                                viewMode === 'grid' ? "bg-surface-container text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Grid3X3 className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium hidden xl:inline">概览</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 bg-muted/5">
                <div className="mx-auto w-full max-w-[1366px] xl:max-w-[1440px] 2xl:max-w-[1720px] space-y-6">
                    {/* Error Alert */}
                    {hasConflicts && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="p-2 bg-red-500/20 rounded-full">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-red-600">检测到事件冲突</h4>
                                <p className="text-xs text-red-500/80 mt-0.5">有 {duplicates.length} 个事件名称重复，请修改后提交。</p>
                            </div>
                        </div>
                    )}

                    {viewMode === 'list' ? (
                        <div className="card-standard p-0 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="w-12 py-4"></th>
                                        <th className="px-6 py-4 text-label">Status</th>
                                        <th className="px-6 py-4 text-label w-20">截图</th>
                                        <th className="px-6 py-4 text-label w-1/4">Event Code</th>
                                        <th className="px-6 py-4 text-label">Description</th>
                                        <th className="px-6 py-4 text-label text-right w-32">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {request.event_references.map((change, idx) => (
                                        <Fragment key={change.id}>
                                            <tr
                                                className={cn(
                                                    "transition-colors group",
                                                    change.isExpanded ? "bg-muted/5" : "hover:bg-muted/5",
                                                    // Add left border indicator based on status
                                                    change.operation === 'create' ? "border-l-[3px] border-l-green-500" :
                                                        change.operation === 'edit' ? "border-l-[3px] border-l-blue-500" :
                                                            "border-l-[3px] border-l-red-500"
                                                )}
                                            >
                                                <td className="pl-4 py-4 align-top">
                                                    <button
                                                        onClick={() => toggleExpand(idx)}
                                                        className="p-1 hover:bg-muted/20 rounded transition-colors text-muted-foreground mt-1"
                                                    >
                                                        {change.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border tracking-tighter inline-block mt-1.5", statusMap[change.operation].color)}>
                                                        {statusMap[change.operation].label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <EventScreenshot
                                                        url={change.screenshot_url || null}
                                                        eventId={change.id}
                                                        size="small"
                                                        editable={!isReadOnly}
                                                        onUpload={(url) => updateEventField(idx, 'screenshot_url', url)}
                                                        onDelete={() => updateEventField(idx, 'screenshot_url', null)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                defaultValue={change.name}
                                                                disabled={isReadOnly}
                                                                className={cn(
                                                                    "bg-transparent border border-transparent focus:border-primary/30 text-sm font-bold font-mono w-full px-2 py-1 rounded transition-all",
                                                                    isReadOnly ? "cursor-not-allowed text-muted-foreground" : "hover:bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/10 text-foreground"
                                                                )}
                                                            />
                                                            {duplicates.includes(change.name) && (
                                                                <span title="事件名重复">
                                                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground px-2 font-mono">{change.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <textarea
                                                        defaultValue={change.description}
                                                        disabled={isReadOnly}
                                                        rows={2}
                                                        className={cn(
                                                            "bg-transparent border border-transparent focus:border-primary/30 text-sm text-foreground/80 w-full px-2 py-1 rounded resize-none transition-all",
                                                            isReadOnly ? "cursor-not-allowed text-muted-foreground" : "hover:bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/10"
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right align-top">
                                                    {!isReadOnly && (
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                                                            {change.operation === 'edit' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedEventForDiff(change);
                                                                        setIsDiffModalOpen(true);
                                                                    }}
                                                                    className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                                                                    title="Diff View"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCopyEvent(idx);
                                                                }}
                                                                className="p-2 hover:bg-muted/10 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                                                title="Clone"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteEvent(idx);
                                                                }}
                                                                className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                            {change.isExpanded && (
                                                <tr className="bg-muted/5 border-b border-border shadow-inner">
                                                    <td colSpan={5} className="py-4 px-10">
                                                        <div className="relative pl-8 border-l-2 border-border/50 ml-4">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <div className="p-1.5 rounded bg-muted/20 text-muted-foreground">
                                                                    <Layers className="w-3.5 h-3.5" />
                                                                </div>
                                                                <h4 className="text-xs font-bold text-foreground">参数结构映射 (Parameter Mapping)</h4>
                                                            </div>
                                                            <ParameterTable
                                                                params={change.parameters}
                                                                eventIndex={idx}
                                                                isReadOnly={isReadOnly}
                                                                onParamChange={handleParamChange}
                                                                onParamAdd={handleParamAdd}
                                                                onParamDelete={handleParamDelete}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                    {request.event_references.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center">
                                                <FeatureIcon icon={LayoutList} className="w-12 h-12 mx-auto mb-4 opacity-50" variant="primary" scale={1.2} />
                                                <p className="text-muted-foreground font-medium">暂无变更事件</p>
                                                <p className="text-xs text-muted-foreground mt-1 mb-4">搜索资产库添加已有埋点，或直接新建埋点。</p>
                                                <button
                                                    onClick={handleDirectCreate}
                                                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:brightness-110"
                                                >
                                                    立即新建
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {!isReadOnly && request.event_references.length > 0 && (
                                <div className="p-3 bg-muted/5 border-t border-border flex items-center justify-center">
                                    <button
                                        onClick={() => setIsComboboxOpen(true)}
                                        className="w-full py-2 border border-dashed border-border rounded-lg text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        点击此处添加更多变更项
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        /* Grid视图：卡片布局 */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {request.event_references.length > 0 ? (
                                request.event_references.map((event, idx) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        eventIndex={idx}
                                        isReadOnly={isReadOnly}
                                        onUpdate={updateEventField}
                                        onCopy={handleCopyEvent}
                                        onDelete={handleDeleteEvent}
                                        onViewDiff={(evt) => {
                                            setSelectedEventForDiff(evt);
                                            setIsDiffModalOpen(true);
                                        }}
                                        onClick={() => toggleExpand(idx)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-16">
                                    <LayoutGrid className="w-12 h-12 text-muted-foreground/50 mb-4" />
                                    <p className="text-muted-foreground font-medium">暂无变更事件</p>
                                    <p className="text-xs text-muted-foreground mt-1 mb-4">搜索资产库添加已有埋点，或直接新建埋点。</p>
                                    <button
                                        onClick={handleDirectCreate}
                                        className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:brightness-110"
                                    >
                                        立即新建
                                    </button>
                                </div>
                            )}
                            {!isReadOnly && request.event_references.length > 0 && (
                                <div className="card-standard p-0 border-2 border-dashed border-border overflow-hidden flex flex-col">
                                    {/* 上方：注册新埋点 */}
                                    <button
                                        onClick={handleDirectCreate}
                                        className="flex-1 p-6 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary group cursor-pointer border-b border-dashed border-border"
                                    >
                                        <Plus className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-sm font-medium">注册新埋点</span>
                                    </button>

                                    {/* 下方：添加已有事件 */}
                                    <button
                                        onClick={() => setIsComboboxOpen(true)}
                                        className="flex-1 p-6 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary group cursor-pointer"
                                    >
                                        <SearchCode className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-sm font-medium">添加已有事件</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Table视图：EventGrid表格 */
                        <EventGrid
                            data={request.event_references}
                            onUpdate={updateEventField}
                            isReadOnly={isReadOnly}
                            rowSelection={rowSelection}
                            setRowSelection={setRowSelection}
                        />
                    )}

                    {/* Footer Legend */}
                    {viewMode === 'list' && (
                        <div className="flex items-center gap-8 px-2 py-4 border-t border-border mt-8">
                            <span className="text-xs font-bold text-muted-foreground uppercase opacity-50">Legend:</span>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <div className="w-2 h-2 rounded bg-green-500" />
                                <span>[NEW] 新增埋点</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <div className="w-2 h-2 rounded bg-blue-500" />
                                <span>[EDIT] 存量修改</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <div className="w-2 h-2 rounded bg-red-500" />
                                <span>[DEL] 申请下线</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Batch Action Bar */}
            {Object.keys(rowSelection).length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl border border-border z-50 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-2 border-r border-background/20 pr-6">
                        <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {Object.keys(rowSelection).length}
                        </div>
                        <span className="text-sm font-bold">已选择</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleOpenBatchAddParam}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-background/20 transition-colors text-xs font-bold"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            批量添加参数
                        </button>
                        <button
                            onClick={handleBatchDelete}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors text-xs font-bold"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            删除
                        </button>
                        <button
                            onClick={() => setRowSelection({})}
                            className="ml-2 text-xs opacity-70 hover:opacity-100 transition-colors"
                        >
                            取消
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <SubmitConfirmModal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                onConfirm={confirmSubmit}
                changes={request.event_references}
            />
            <BatchAddParameterModal
                isOpen={isBatchParamModalOpen}
                onClose={() => setIsBatchParamModalOpen(false)}
                onConfirm={handleBatchAddParamConfirm}
                selectedCount={Object.keys(rowSelection).length}
            />
            <ParameterFinderModal
                isOpen={isSelectorOpen}
                onClose={() => { setIsSelectorOpen(false); setActiveEventIndex(null); }}
                onSelect={handleSelectorSelect}
                onCreate={handleSelectorCreate}
            />
            <NewParameterModal
                isOpen={isCreateParamOpen}
                initialKey={createParamKeyword}
                onConfirm={handleCreateConfirm}
                onClose={() => setIsCreateParamOpen(false)}
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
