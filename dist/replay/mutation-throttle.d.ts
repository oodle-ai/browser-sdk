import type { eventWithTime } from '@rrweb/types';
export interface MirrorLike {
    getNode(id: number): Node | null;
    getId(node: Node): number;
}
export interface ThrottleResult {
    /**
     * The event to buffer, or null when throttling emptied
     * it and there is nothing left worth sending.
     */
    event: eventWithTime | null;
    /** Attribute entries removed by the budget. */
    dropped: number;
}
export declare function createMutationThrottler(getMirror: () => MirrorLike | null, nowMs?: () => number): {
    throttle: (event: eventWithTime) => ThrottleResult;
    reset: () => void;
};
