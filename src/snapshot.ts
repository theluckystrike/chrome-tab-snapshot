/**
 * Tab Snapshot — Capture and diff tab states
 */
export interface Snapshot { id: string; timestamp: number; tabs: Array<{ id: number; url: string; title: string; pinned: boolean; groupId: number }>; }

export class TabSnapshot {
    private snapshots: Snapshot[] = [];

    /** Take a snapshot of current tabs */
    async take(label?: string): Promise<Snapshot> {
        const tabs = await chrome.tabs.query({});
        const snap: Snapshot = {
            id: label || `snap_${Date.now()}`, timestamp: Date.now(),
            tabs: tabs.map((t) => ({ id: t.id || 0, url: t.url || '', title: t.title || '', pinned: t.pinned || false, groupId: t.groupId || -1 })),
        };
        this.snapshots.push(snap);
        return snap;
    }

    /** Diff two snapshots */
    diff(a: Snapshot, b: Snapshot): { added: string[]; removed: string[]; changed: number } {
        const urlsA = new Set(a.tabs.map((t) => t.url));
        const urlsB = new Set(b.tabs.map((t) => t.url));
        return {
            added: b.tabs.filter((t) => !urlsA.has(t.url)).map((t) => t.url),
            removed: a.tabs.filter((t) => !urlsB.has(t.url)).map((t) => t.url),
            changed: Math.abs(a.tabs.length - b.tabs.length),
        };
    }

    /** Restore tabs from a snapshot */
    async restore(snapshot: Snapshot): Promise<number> {
        let count = 0;
        for (const tab of snapshot.tabs) {
            if (tab.url && !tab.url.startsWith('chrome://')) {
                await chrome.tabs.create({ url: tab.url, pinned: tab.pinned });
                count++;
            }
        }
        return count;
    }

    /** Get all snapshots */
    getAll(): Snapshot[] { return [...this.snapshots]; }

    /** Save snapshots to storage */
    async save(key: string = '__tab_snapshots__'): Promise<void> {
        await chrome.storage.local.set({ [key]: this.snapshots });
    }

    /** Load snapshots from storage */
    async load(key: string = '__tab_snapshots__'): Promise<void> {
        const result = await chrome.storage.local.get(key);
        this.snapshots = (result[key] as Snapshot[]) || [];
    }

    /** Get latest snapshot */
    getLatest(): Snapshot | null { return this.snapshots[this.snapshots.length - 1] || null; }

    /** Delete snapshot by id */
    delete(id: string): void { this.snapshots = this.snapshots.filter((s) => s.id !== id); }
}
