const _flags = new Map<string, string>();

export function addFeatureFlag(
  name: string,
  value: string,
): void {
  _flags.set(name, value);
}

export function getFeatureFlags(): Record<
  string,
  string
> {
  if (_flags.size === 0) return {};
  return Object.fromEntries(_flags);
}

export function clearFeatureFlags(): void {
  _flags.clear();
}
