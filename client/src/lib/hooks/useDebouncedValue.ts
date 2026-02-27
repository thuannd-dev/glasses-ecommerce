import { useEffect, useState } from "react";

/**
 * Trả về giá trị chỉ cập nhật sau `delay` ms khi `value` không đổi.
 * Dùng để tránh gọi API liên tục khi user kéo slider / gõ search.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => window.clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
