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
    Eye
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { EventDiffModal } from '../components/modals/EventDiffModal';
import { useWorkbench } from '../hooks/useWorkbench';
import type { EventChange, WorkflowParameter as Parameter } from '../types/workflow';
import { AssetLibrarySidebar } from '../components/AssetLibrarySidebar';
import { SubmitConfirmModal } from '../components/modals/SubmitConfirmModal';
import { BatchAddParameterModal } from '../components/modals/BatchAddParameterModal';
import { ParameterFinderModal } from '../components/modals/ParameterFinderModal';
import { NewParameterModal } from '../components/modals/NewParameterModal';
import { ParameterTable } from '../components/ParameterTable';
import { EventGrid } from '../components/EventGrid';
import { FeatureIcon } from '../components/FeatureIcon';


// --- Main Workbench Component ---

export const Workbench = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useUI();

    // 使用工作台 Hook 管理状态和业务逻辑
    const {
        request,
        lastSaved,
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
        setIsSidebarOpen(false);
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
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
            {/* Header - Fixed & Glass - MD3 Standard */}
            <div className="h-18 border-b-0 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md sticky top-0 z-30 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/workflows')}
                        className="p-3 hover:bg-muted/10 rounded-full text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">{request.title}</h2>
                            <span className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest border uppercase",
                                request.status === 'Draft' ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                                    request.status === 'Reviewing' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                        request.status === 'Approved' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                            "bg-red-500/10 text-red-600 border-red-500/20"
                            )}>
                                {request.status}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 uppercase tracking-wide opacity-70">
                            REQ #{request.id} • Alex Chen
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-muted/10 rounded-lg p-1 border border-border mr-2 items-center">
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-1.5 rounded-md transition-all flex items-center gap-2 px-2",
                                viewMode === 'list' ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutList className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">List</span>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-1.5 rounded-md transition-all flex items-center gap-2 px-2",
                                viewMode === 'grid' ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Grid3X3 className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Grid</span>
                        </button>
                    </div>

                    {!isReadOnly && (
                        <>
                            <button
                                onClick={handleSaveDraft}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted/5 text-xs font-bold text-foreground transition-all shadow-sm"
                            >
                                <Save className="w-3.5 h-3.5 text-muted-foreground" />
                                Save Draft
                                {lastSaved && <span className="text-[9px] font-normal opacity-70 ml-1">{lastSaved}</span>}
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
                            >
                                <Send className="w-3.5 h-3.5" />
                                Submit
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Toolbar - Sticky below header */}
            {!isReadOnly && (
                <div className="px-6 py-4 bg-background/50 border-b border-border flex items-center justify-between sticky top-16 z-20 backdrop-blur-sm">
                    <div className="flex items-center gap-3 flex-1 max-w-3xl">
                        <div className="relative flex-1 group">
                            <SearchCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="w-full bg-muted/10 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-left text-muted-foreground hover:bg-background hover:shadow-sm hover:border-primary/30 transition-all flex items-center justify-between"
                            >
                                <span>搜索资产库以检索现有埋点进行修改 (EDIT)...</span>
                                <span className="text-xs bg-muted/20 px-1.5 py-0.5 rounded border border-border">⌘+K</span>
                            </button>
                        </div>
                        <button
                            onClick={handleDirectCreate}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all shrink-0 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            直接新建 (NEW)
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 bg-muted/5">
                <div className="max-w-7xl mx-auto space-y-6">
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
                        <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-muted/10 border-b border-border">
                                        <th className="w-12 py-3"></th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-1/4">Event Code</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right w-32">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
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
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="w-full py-2 border border-dashed border-border rounded-lg text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        点击此处添加更多变更项
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
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
