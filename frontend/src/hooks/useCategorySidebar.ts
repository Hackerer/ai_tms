import { useState, useEffect, useRef } from 'react';

interface UseCategorySidebarReturn {
    isExpanded: boolean;
    countdown: number;
    showCountdown: boolean;
    toggle: () => void;
}

export const useCategorySidebar = (): UseCategorySidebarReturn => {
    const [isExpanded, setIsExpanded] = useState(true); // 首次进入默认展开
    const [countdown, setCountdown] = useState(60); // 首次60秒
    const [showCountdown, setShowCountdown] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const timerRef = useRef<number | null>(null);

    // 启动倒计时
    const startTimer = (duration: number) => {
        clearTimer();
        setCountdown(duration);

        const threshold = duration === 60 ? 10 : 5; // 60秒时最后10秒提示，15秒时最后5秒提示

        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                const next = prev - 1;

                // 显示倒计时提示
                setShowCountdown(next <= threshold && next > 0);

                // 倒计时结束，自动折叠
                if (next === 0) {
                    setIsExpanded(false);
                    clearTimer();
                    setShowCountdown(false);
                }

                return next;
            });
        }, 1000);
    };

    // 清除计时器
    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setShowCountdown(false);
    };

    // 首次进入页面：60秒倒计时
    useEffect(() => {
        if (isFirstLoad) {
            startTimer(60);
            setIsFirstLoad(false);
        }

        return () => clearTimer();
    }, []);

    // 手动切换
    const toggle = () => {
        setIsExpanded(prev => {
            const next = !prev;

            if (next) {
                // 展开时，启动15秒倒计时
                startTimer(15);
            } else {
                // 折叠时，清除计时器
                clearTimer();
            }

            return next;
        });
    };

    return {
        isExpanded,
        countdown,
        showCountdown,
        toggle
    };
};
