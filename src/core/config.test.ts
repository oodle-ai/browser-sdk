import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getConfig,
  normalizeQueryParamNames,
  setConfig,
} from './config';

/**
 * viewUrlQueryParams is read for every event. A wrong type must be
 * dropped when the config is set: a string would match parameter
 * names by substring, and any other non-array value would throw
 * inside every event.
 */
describe('viewUrlQueryParams normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps an array of names', () => {
    expect(normalizeQueryParamNames(['traceId', 'spanId'])).toEqual([
      'traceId',
      'spanId',
    ]);
  });

  it('keeps undefined when the option is not set', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(normalizeQueryParamNames(undefined)).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it.each([['traceId'], [42], [{ traceId: true }], [null]])(
    'drops the non-array value %j and warns',
    (value) => {
      const warn = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      expect(normalizeQueryParamNames(value)).toBeUndefined();
      expect(warn).toHaveBeenCalledOnce();
    },
  );

  it('drops entries that are not names and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(
      normalizeQueryParamNames(['traceId', 3, '', null, 'spanId']),
    ).toEqual(['traceId', 'spanId']);
    expect(warn).toHaveBeenCalledOnce();
  });

  it('stores the normalized value in the config', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    setConfig({
      instanceId: 'inst',
      apiKey: 'key',
      endpoint: 'https://localhost',
      service: 'test',
      viewUrlQueryParams: 'traceId' as unknown as string[],
    });
    expect(getConfig().viewUrlQueryParams).toBeUndefined();
  });
});
