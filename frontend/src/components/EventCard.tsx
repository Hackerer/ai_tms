import { useState } from 'react';
import { MoreVertical, Copy, Trash2, Eye, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { EventScreenshot } from './EventScreenshot';
import type { EventChange } from '../types/workflow';

interface EventCardProps {
    event: EventChange;
    eventIndex: number;
    isReadOnly?: boolean;
    onUpdate: (index: number, field: keyof EventChange, value: any) => void;
    onCopy?: (index: number) => void;
    onDelete?: (index: number) => void;
    onViewDiff?: (event: EventChange) => void;
    onClick?: () => void;
}

/**
 * 事件卡片组件 (Grid View)
 * 
 * 布局结构：
 * ┌─────────────────┐
 * │  Screenshot     │ ← 截图区域（可上传）
 * ├─────────────────┤
 * │  EVT-001        │ ← ID + 操作菜单
 * │  event_name     │ ← 事件名称
 * │  描述...        │ ← 描述
 * │  [edit][create] │ ← 操作类型badge
 * │  参数: 3        │ ← 参数数量
 * └─────────────────┘
 */
export const EventCard = ({
    event,
    eventIndex,
    isReadOnly = false,
    onUpdate,
    onCopy,
    onDelete,
    onViewDiff,
    onClick
}: EventCardProps) => {
    const [showMenu, setShowMenu] = useState(false);

    const getOperationBadge = (operation: string) => {
        const badges = {
            create: { label: '新增', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
            edit: { label: '修改', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
            delete: { label: '删除', className: 'bg-red-500/10 text-red-600 border-red-500/20' }
        };
        return badges[operation as keyof typeof badges] || { label: operation, className: 'bg-muted' };
    };

    const badge = getOperationBadge(event.operation);

    return (
        <div
            className={cn(
                "card-standard p-0 overflow-hidden transition-all hover:shadow-elevation-2",
                onClick && "cursor-pointer"
            )}
            onClick={onClick}
        >
            {/* 截图区域 */}
            <div className="relative bg-muted/5 border-b border-border">
                {event.screenshot_url ? (
                    <div className="relative w-full h-48 group">
                        <img
                            src={event.screenshot_url}
                            alt={`${event.id} screenshot`}
                            className="w-full h-full object-cover"
                        />
                        {/* 编辑模式：Hover渐变层 */}
                        {!isReadOnly && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <EventScreenshot
                                    url={event.screenshot_url}
                                    eventId={event.id}
                                    editable={!isReadOnly}
                                    onUpload={(url) => onUpdate(eventIndex, 'screenshot_url', url)}
                                    onDelete={() => onUpdate(eventIndex, 'screenshot_url', null)}
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    // 无截图：Dropzone上传区
                    <div className="w-full h-48 flex items-center justify-center">
                        {!isReadOnly ? (
                            <EventScreenshot
                                url={null}
                                eventId={event.id}
                                size="medium"
                                editable={!isReadOnly}
                                onUpload={(url) => onUpdate(eventIndex, 'screenshot_url', url)}
                                className="w-full h-full"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                                    <Plus className="w-8 h-8" />
                                </div>
                                <p className="text-sm">暂无截图</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 内容区域 */}
            <div className="p-4 space-y-3">
                {/* Header: ID + 菜单 */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{event.id}</span>
                    {!isReadOnly && (onCopy || onDelete || onViewDiff) && (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-1 hover:bg-muted rounded transition-colors"
                            >
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 top-6 w-32 card-standard p-1 z-10 shadow-elevation-3">
                                    {event.operation === 'edit' && onViewDiff && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDiff(event);
                                                setShowMenu(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Diff
                                        </button>
                                    )}
                                    {onCopy && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCopy(eventIndex);
                                                setShowMenu(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded transition-colors"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            复制
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(eventIndex);
                                                setShowMenu(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 rounded transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            删除
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Event Name */}
                <h3 className="font-mono font-semibold text-foreground truncate">
                    {event.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {event.description || '暂无描述'}
                </p>

                {/* Footer: Operation Badge + 参数数量 */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium border",
                        badge.className
                    )}>
                        {badge.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        参数: {event.parameters?.length || 0}
                    </span>
                </div>
            </div>
        </div>
    );
};
