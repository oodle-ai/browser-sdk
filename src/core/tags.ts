let _tags: Record<string, string> = {};

export function initTags(
  tags?: Record<string, string>,
) {
  if (tags) {
    _tags = { ...tags };
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
