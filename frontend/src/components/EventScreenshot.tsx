import { useState } from 'react';
import { ImageOff, Upload, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { ScreenshotUploader } from './ScreenshotUploader';

interface EventScreenshotProps {
    url: string | null;
    eventId: string;
    size?: 'small' | 'medium';
    className?: string;
    editable?: boolean;
    onUpload?: (url: string) => void;
    onDelete?: () => void;
}

/**
 * 埋点截图缩略图组件
 * 
 * 功能：
 * - 显示48x48缩略图
 * - Hover时展示完整图片预览
 * - 无截图时显示占位图标
 * - 编辑模式：hover显示上传/删除操作
 */
export const EventScreenshot = ({
    url,
    eventId,
    size = 'small',
    className,
    editable = false,
    onUpload,
    onDelete
}: EventScreenshotProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showUploadModal, setShowUploadModal] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // 无截图状态
    if (!url) {
        return (
            <>
                <div
                    className={cn(
                        "relative flex items-center justify-center rounded border-2 border-dashed border-border/50 bg-muted/5 group",
                        size === 'small' ? "w-12 h-12" : "w-16 h-16",
                        editable && "cursor-pointer hover:border-primary/50 hover:bg-primary/5",
                        className
                    )}
                    title={editable ? "点击上传截图" : "暂无截图"}
                    onClick={() => editable && setShowUploadModal(true)}
                >
                    <ImageOff className={cn(
                        "text-muted-foreground/40",
                        size === 'small' ? "w-4 h-4" : "w-5 h-5"
                    )} />

                    {/* 编辑模式：Hover显示上传图标 */}
                    {editable && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white" />
                        </div>
                    )}
                </div>

                {/* 上传Modal */}
                {showUploadModal && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
                        onClick={() => setShowUploadModal(false)}
                    >
                        <div
                            className="card-standard p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold mb-4">上传截图</h3>
                            <ScreenshotUploader
                                eventId={eventId}
                                variant="dropzone"
                                size="large"
                                onUploadSuccess={(uploadedUrl) => {
                                    onUpload?.(uploadedUrl);
                                    setShowUploadModal(false);
                                }}
                            />
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="mt-4 w-full btn-secondary"
                            >
                                取消
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // 有截图状态
    return (
        <>
            <div
                className={cn("relative inline-block group", editable && "cursor-pointer")}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={handleMouseMove}
            >
                {/* 缩略图 */}
                <img
                    src={url}
                    alt={`Event ${eventId} screenshot`}
                    className={cn(
                        "object-cover rounded border border-border transition-all hover:border-primary/50 hover:shadow-md",
                        size === 'small' ? "w-12 h-12" : "w-16 h-16",
                        className
                    )}
                    loading="lazy"
                />

                {/* 编辑模式：Hover渐变层 + 操作按钮 */}
                {editable && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex gap-1 items-center justify-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowUploadModal(true);
                            }}
                            className="p-1.5 bg-white/20 hover:bg-white/30 rounded transition-colors"
                            title="重新上传"
                        >
                            <Upload className="w-3.5 h-3.5 text-white" />
                        </button>
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('确定删除此截图？')) {
                                        onDelete();
                                    }
                                }}
                                className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded transition-colors"
                                title="删除截图"
                            >
                                <X className="w-3.5 h-3.5 text-white" />
                            </button>
                        )}
                    </div>
                )}

                {/* Hover预览 - 仅在非编辑交互时显示 */}
                {isHovered && !editable && (
                    <div
                        className="fixed z-[100] pointer-events-none animate-in fade-in duration-150"
                        style={{
                            left: `${mousePosition.x + 20}px`,
                            top: `${mousePosition.y - 50}px`,
                        }}
                    >
                        <div className="relative">
                            <img
                                src={url}
                                alt={`Event ${eventId} full screenshot`}
                                className="max-w-sm max-h-96 rounded-lg border-2 border-primary shadow-elevation-3 bg-surface-container"
                                style={{
                                    objectFit: 'contain',
                                }}
                            />
                            {/* 小箭头指示器 */}
                            <div className="absolute -left-2 top-12 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-primary"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 上传Modal */}
            {showUploadModal && (
                <div
                    className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
                    onClick={() => setShowUploadModal(false)}
                >
                    <div
                        className="card-standard p-6 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold mb-4">更新截图</h3>
                        <ScreenshotUploader
                            eventId={eventId}
                            currentUrl={url}
                            variant="modal"
                            onUploadSuccess={(uploadedUrl) => {
                                onUpload?.(uploadedUrl);
                                setShowUploadModal(false);
                            }}
                            onDelete={() => {
                                if (confirm('确定删除此截图？')) {
                                    onDelete?.();
                                    setShowUploadModal(false);
                                }
                            }}
                        />
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="mt-4 w-full btn-secondary"
                        >
                            取消
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
