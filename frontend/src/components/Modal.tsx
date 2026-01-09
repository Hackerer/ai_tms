import { X, CheckCircle2 } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { NewEventModal } from './modals/NewEventModal';
import { NewParameterModal } from './modals/NewParameterModal';
import { NewPageModal } from './modals/NewPageModal';
import { NewRequestModal } from './modals/NewRequestModal';

export const Modal = () => {
    const { activeModal, closeModal } = useUI();

    if (!activeModal) return null;

    const renderModalContent = () => {
        switch (activeModal) {
            case 'NEW_REQUEST':
                return <NewRequestModal />;
            case 'NEW_EVENT':
                return <NewEventModal />;
            case 'NEW_PARAMETER':
                return <NewParameterModal />;
            case 'NEW_PAGE':
                return <NewPageModal />;
            case 'USER_JOURNEY_DEMO':
                return (
                    <div className="p-8 text-center child-transition">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">交互效果验证</h3>
                        <p className="text-muted-foreground text-sm mb-8">
                            您刚才点击了界面上的交互元素。在最终版本中，这里将对接后端逻辑或下钻至深度详情。
                        </p>
                        <button onClick={closeModal} className="px-8 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">
                            已知晓
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop - Enhanced contrast for light mode */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={closeModal}
            />

            {/* Modal Container - Solid white in light mode for better contrast */}
            <div className="relative w-full max-w-2xl bg-background rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <button
                    onClick={closeModal}
                    className="absolute top-5 right-5 p-2 hover:bg-muted/20 rounded-lg transition-colors z-50 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-5 h-5" />
                </button>

                {renderModalContent()}
            </div>
        </div>
    );
};
