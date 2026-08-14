/**
 * Config tags are the base, not a reset: an app that gates
 * init() on environment still calls setTags() from shared
 * code, and those calls can land first. Explicit setTags()
 * wins on a key both of them set.
 */
export declare function initTags(tags?: Record<string, string>): void;
export declare function setTags(tags: Record<string, string>): void;
export declare function getTags(): Record<string, string>;
