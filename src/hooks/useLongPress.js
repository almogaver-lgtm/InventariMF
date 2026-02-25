import { useRef } from 'react';

export const useLongPress = (callback, ms = 1000) => {
    const timerRef = useRef(null);

    const start = (e) => {
        timerRef.current = setTimeout(() => {
            if (navigator.vibrate) navigator.vibrate(50);
            callback(e);
        }, ms);
    };

    const stop = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    return {
        onMouseDown: start,
        onMouseUp: stop,
        onMouseLeave: stop,
        onTouchStart: start,
        onTouchEnd: stop,
        onContextMenu: (e) => e.preventDefault(),
    };
};
