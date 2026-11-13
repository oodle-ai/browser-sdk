import { describe, expect, it } from 'vitest';
import {
  REDACTED,
  isBuiltInSensitiveHeader,
  makeKeyMatcher,
  redactBody,
  redactCardNumbers,
} from './redact';

const builtIn = makeKeyMatcher(undefined);

describe('isBuiltInSensitiveHeader', () => {
  it('matches exact names and name patterns', () => {
    for (const h of [
      'authorization',
      'cookie',
      'x-forwarded-for',
      'cf-connecting-ip',
      'x-auth-token',
      'x-csrf-token',
      'x-xsrf-token',
      'x-session-id',
      'x-amz-security-token',
      'x-goog-api-key',
      'x-client-secret',
      'x-debug-client-ip',
      'x-forwarded-host',
    ]) {
      expect(isBuiltInSensitiveHeader(h), h).toBe(true);
    }
  });

  it('keeps ordinary headers', () => {
    for (const h of [
      'content-type',
      'content-length',
      'accept',
      'cache-control',
      'etag',
      'x-request-id',
      'traceparent',
      'server-timing',
      'x-ratelimit-remaining',
    ]) {
      expect(isBuiltInSensitiveHeader(h), h).toBe(false);
    }
  });
});

describe('redactBody', () => {
  it('replaces sensitive JSON values at any depth', () => {
    const body = JSON.stringify({
      user: { name: 'Jane', password: 'p', ip_address: '1.2.3.4' },
      items: [{ access_token: 'a', id: 7 }],
      clientIp: '5.6.7.8',
      cardNumber: '4111 1111 1111 1111',
      ok: true,
    });
    expect(JSON.parse(redactBody(body, builtIn))).toEqual({
      user: { name: 'Jane', password: REDACTED, ip_address: REDACTED },
      items: [{ access_token: REDACTED, id: 7 }],
      clientIp: REDACTED,
      cardNumber: REDACTED,
      ok: true,
    });
  });

  it('keeps empty and null values as they are', () => {
    expect(redactBody('{"password":"","token":null}', builtIn)).toBe(
      '{"password":"","token":null}',
    );
  });

  it('does not change a body with nothing sensitive', () => {
    const body = '{"q":"salaries","page":2}';
    expect(redactBody(body, builtIn)).toBe(body);
  });

  it('handles JSON cut short by maxBodySize', () => {
    const cut = '{"name":"Jane","password":"hunter2","items":[{"to';
    expect(redactBody(cut, builtIn)).toBe(
      `{"name":"Jane","password":"${REDACTED}","items":[{"to`,
    );
  });

  it('redacts form-encoded bodies by key', () => {
    expect(redactBody('user=jane&password=hunter2&x=1', builtIn)).toBe(
      'user=jane&password=%5BREDACTED%5D&x=1',
    );
    expect(redactBody('user=jane&x=1', builtIn)).toBe('user=jane&x=1');
  });

  it('uses the extra keys', () => {
    const m = makeKeyMatcher(['employee-id', /^salary/]);
    expect(
      JSON.parse(redactBody('{"employee_id":5,"salaryUsd":9,"a":1}', m)),
    ).toEqual({ employee_id: REDACTED, salaryUsd: REDACTED, a: 1 });
  });
});

describe('redactCardNumbers', () => {
  it('replaces numbers that pass the card checksum', () => {
    expect(redactCardNumbers('card 4111111111111111 ok')).toBe(
      `card ${REDACTED} ok`,
    );
    expect(redactCardNumbers('card 4111-1111-1111-1111')).toBe(
      `card ${REDACTED}`,
    );
  });

  it('keeps long numbers that fail it', () => {
    expect(redactCardNumbers('order 4111111111111112')).toBe(
      'order 4111111111111112',
    );
    // A tenth of these pass the checksum by chance; the prefix
    // check keeps all of them.
    for (let i = 0; i < 200; i++) {
      const ts = String(1731528000000 + i * 7919);
      expect(redactCardNumbers(ts)).toBe(ts);
    }
  });
});
