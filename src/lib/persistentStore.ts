"use client";

// Same-tab subscribers. The browser only fires the "storage" event in *other*
// tabs, so we keep our own listener set to notify the current tab after a write.
const listeners = new Set<() => void>();

/**
 * Subscribe to localStorage changes from this tab (via notifyStorage) or from
 * other tabs (via the native "storage" event). Designed for useSyncExternalStore.
 */
export function subscribeStorage(callback: () => void) {
    listeners.add(callback);
    window.addEventListener("storage", callback);
    return () => {
        listeners.delete(callback);
        window.removeEventListener("storage", callback);
    };
}

/** Notify same-tab subscribers after writing to localStorage. */
export function notifyStorage() {
    for (const listener of listeners) listener();
}
