// 1. Дебаунс (Debounce)
function debounce(fn, delay) {
    let timer = null; // Живет в замыкании

    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            console.log(`[${new Date().toLocaleTimeString()}] Debounce сработал`);
            fn.apply(this, args);
        }, delay);
    };
}

// 2. Троттл (Throttle)
function throttle(fn, limit) {
    let inThrottle = false;

    return function (...args) {
        if (!inThrottle) {
            console.log(`[${new Date().toLocaleTimeString()}] Throttle сработал`);
            fn.apply(this, args);
            inThrottle = true;
            
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}