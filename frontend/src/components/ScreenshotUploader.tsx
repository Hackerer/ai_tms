import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ScreenshotUploaderProps {
    eventId: string;
    currentUrl?: string | null;
    onUploadSuccess: (url: string) => void;
    onUploadError?: (error: Error) => void;
    onDelete?: () => void;
    variant?: 'inline' | 'modal' | 'dropzone';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/**
 * 截图上传组件
 * 
 * 支持三种上传方式：
 * 1. 本地文件选择
 * 2. 粘贴上传（Ctrl+V）
 * 3. 拖拽上传
 * 
 * @example
 * <ScreenshotUploader 
 *   eventId="EVT-001"
 *   variant="dropzone"
 *   onUploadSuccess={(url) => updateEventField(idx, 'screenshot_url', url)}
 * />
 */
export const ScreenshotUploader = ({
    eventId,
    currentUrl,
    onUploadSuccess,
    onUploadError,
    onDelete,
    variant = 'inline',
    size = 'medium',
    disabled = false
}: ScreenshotUploaderProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 文件校验
    const validateFile = (file: File): { valid: boolean; error?: string } => {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: '仅支持 PNG/JPEG/WebP 格式' };
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return { valid: false, error: '图片大小不能超过 5MB' };
        }

        return { valid: true };
    };

    // 上传逻辑
    const handleUpload = async (file: File) => {
        // 校验
        const validation = validateFile(file);
        if (!validation.valid) {
            setUploadStatus('error');
            setErrorMessage(validation.error || '文件校验失败');
            setTimeout(() => setUploadStatus('idle'), 3000);
            return;
        }

        setUploadStatus('uploading');
        setUploadProgress(0);
        setErrorMessage('');

        // TODO: 替换为真实API调用
        // 当前使用模拟上传（创建本地URL）
        try {
            // 模拟上传延迟
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                setUploadProgress(i);
            }

            // 创建本地预览URL（实际应该是服务器返回的URL）
            const localUrl = URL.createObjectURL(file);
            setUploadStatus('success');
            onUploadSuccess(localUrl);

            setTimeout(() => setUploadStatus('idle'), 2000);
        } catch (error) {
            setUploadStatus('error');
            setErrorMessage('上传失败，请重试');
            onUploadError?.(error as Error);
            setTimeout(() => setUploadStatus('idle'), 3000);
        }
    };

    // 文件选择
    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    // 拖拽事件
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleUpload(file);
        }
    };

    // 粘贴上传
    useEffect(() => {
        if (disabled || variant === 'inline') return; // inline模式不监听全局粘贴

        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            // 检查是否在输入框中
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        handleUpload(blob);
                        e.preventDefault();
                    }
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [disabled, variant]);

    // 渲染：Dropzone模式
    if (variant === 'dropzone') {
        return (
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative border-2 border-dashed rounded-lg transition-all cursor-pointer overflow-hidden",
                    size === 'small' && "h-24",
                    size === 'medium' && "h-32",
                    size === 'large' && "h-48",
                    isDragging
                        ? "border-primary bg-primary/5 scale-105"
                        : "border-border hover:border-primary/50",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={disabled}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                    {uploadStatus === 'uploading' ? (
                        <>
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            <p className="text-xs text-muted-foreground">上传中 {uploadProgress}%</p>
                        </>
                    ) : uploadStatus === 'success' ? (
                        <>
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <p className="text-xs text-green-600">上传成功</p>
                        </>
                    ) : uploadStatus === 'error' ? (
                        <>
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            <p className="text-xs text-red-600">{errorMessage}</p>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <p className="text-sm font-medium text-foreground">
                                {isDragging ? '松开鼠标上传' : '点击或拖拽上传截图'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                支持 PNG/JPEG/WebP，最大 5MB
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // 渲染：Inline按钮模式
    if (variant === 'inline') {
        return (
            <>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={disabled}
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || uploadStatus === 'uploading'}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium",
                        "bg-surface-container hover:bg-surface-container-high border border-border",
                        "text-foreground hover:text-primary",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    title="上传截图"
                >
                    {uploadStatus === 'uploading' ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{uploadProgress}%</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            <span>上传截图</span>
                        </>
                    )}
                </button>

                {uploadStatus === 'error' && (
                    <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
                )}
            </>
        );
    }

    // 渲染：Modal模式（带预览）
    return (
        <div className="space-y-3">
            {currentUrl && (
                <div className="relative group">
                    <img
                        src={currentUrl}
                        alt="Current screenshot"
                        className="w-full max-h-64 object-contain rounded-lg border border-border"
                    />
                    {onDelete && !disabled && (
                        <button
                            onClick={onDelete}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="删除截图"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer",
                    isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={disabled}
                />

                <div className="flex flex-col items-center gap-2">
                    {uploadStatus === 'uploading' ? (
                        <>
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">上传中 {uploadProgress}%</p>
                        </>
                    ) : uploadStatus === 'error' ? (
                        <>
                            <AlertCircle className="w-8 h-8 text-red-500" />
                            <p className="text-sm text-red-600">{errorMessage}</p>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <p className="text-sm font-medium text-foreground">
                                点击、拖拽或粘贴上传
                            </p>
                            <p className="text-xs text-muted-foreground">
                                PNG/JPEG/WebP，最大 5MB
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
