import { X } from 'lucide-react';
import { ParameterSelector } from '../ParameterSelector';
import type { WorkflowParameter } from '../../types/workflow';
import type { Parameter as AssetParameter } from '../../types/asset';

interface ParameterFinderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (param: WorkflowParameter) => void;
    onCreate: (keyword: string) => void;
}

export const ParameterFinderModal = ({ isOpen, onClose, onSelect, onCreate }: ParameterFinderModalProps) => {
    if (!isOpen) return null;

    const handleSelect = (assetParam: AssetParameter) => {
        onSelect({
            key: assetParam.name,
            type: assetParam.data_type,
            desc: assetParam.description,
            isRequired: assetParam.is_required,
            ref_id: assetParam.id,
            category: assetParam.category as 'global' | 'business'
        });
        // onClose(); // Removed to allow multi-select
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative animate-in zoom-in-95 duration-200">
                <ParameterSelector
                    onSelect={handleSelect}
                    onCreate={onCreate}
                    autoFocus
                    className="border-primary/20 shadow-[0_0_50px_rgba(59,130,246,0.1)]"
                />

                {/* Close Button specific for this modal style if needed,
                    but ParameterSelector is self-contained.
                    Adding a top-right close cross outside the selector. */}
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 p-2 text-white/50 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};
