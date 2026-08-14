let _tags: Record<string, string> = {};

/**
 * Config tags are the base, not a reset: an app that gates
 * init() on environment still calls setTags() from shared
 * code, and those calls can land first. Explicit setTags()
 * wins on a key both of them set.
 */
export function initTags(
  tags?: Record<string, string>,
) {
  if (tags) {
    _tags = { ...tags, ..._tags };
  }
}

export function setTags(
  tags: Record<string, string>,
) {
  _tags = { ..._tags, ...tags };
}

export function getTags(): Record<string, string> {
  return _tags;
}
