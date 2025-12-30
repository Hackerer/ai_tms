import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type ModalType = 'NEW_REQUEST' | 'NEW_EVENT' | 'EDIT_EVENT' | 'USER_JOURNEY_DEMO' | null;

interface UIContextType {
    activeModal: ModalType;
    openModal: (type: ModalType) => void;
    closeModal: () => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    toast: { message: string, type: string } | null;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [toast, setToast] = useState<{ message: string, type: string } | null>(null);

    const openModal = useCallback((type: ModalType) => setActiveModal(type), []);
    const closeModal = useCallback(() => setActiveModal(null), []);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    return (
        <UIContext.Provider value={{ activeModal, openModal, closeModal, showToast, toast }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within a UIProvider');
    return context;
};
