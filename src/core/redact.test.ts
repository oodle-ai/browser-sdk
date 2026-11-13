import { describe, expect, it } from 'vitest';
import {
  REDACTED,
  makeHeaderMatcher,
  makeKeyMatcher,
  redactBody,
  redactCardNumbers,
} from './redact';

const builtIn = makeKeyMatcher(undefined);
const isBuiltInSensitiveHeader = makeHeaderMatcher(undefined);

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
      'forwarded',
      'x-forwarded-for',
      'x-original-forwarded-for',
      'proxy-authorization',
      'set-cookie',
      'x-api-key',
      'x-real-ip',
      'true-client-ip',
      'fastly-client-ip',
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
      // Hold no address: only forwarded and *-forwarded-for do.
      'x-forwarded-proto',
      'x-forwarded-host',
      'x-forwarded-port',
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

  it('returns a body with nothing sensitive exactly as captured', () => {
    for (const body of [
      '{"q":"salaries","page":2}',
      // Re-serializing would round this integer...
      '{"id":1234567890123456789}',
      // ...flatten this formatting...
      '{\n  "a": 1,\n  "b": [1, 2]\n}',
      // ...and drop this key.
      '{"__proto__":{"x":1},"a":1}',
    ]) {
      expect(redactBody(body, builtIn)).toBe(body);
    }
  });

  it('keeps a __proto__ key when something else is redacted', () => {
    expect(
      JSON.parse(redactBody('{"__proto__":{"x":1},"password":"p"}', builtIn)),
    ).toEqual(JSON.parse('{"__proto__":{"x":1},"password":"[REDACTED]"}'));
  });

  it('keeps LLM token counts and limits', () => {
    const body =
      '{"usage":{"total_tokens":120,"prompt_tokens":20},"max_tokens":256,"token_count":3,"tokenLimit":9,"token_type":"bearer"}';
    expect(redactBody(body, builtIn)).toBe(body);
    expect(
      JSON.parse(redactBody('{"access_token":"a","refresh_token":"r","token":"t","nextPageToken":"n"}', builtIn)),
    ).toEqual({
      access_token: REDACTED,
      refresh_token: REDACTED,
      token: REDACTED,
      nextPageToken: REDACTED,
    });
  });

  it('handles JSON cut short by maxBodySize', () => {
    const cut = '{"name":"Jane","password":"hunter2","items":[{"to';
    expect(redactBody(cut, builtIn)).toBe(
      `{"name":"Jane","password":"${REDACTED}","items":[{"to`,
    );
  });

  it('reaches keys inside nested objects of cut JSON', () => {
    expect(
      redactBody('{"user":{"password":"hunter2","name":"bob"},"x":"ab', builtIn),
    ).toBe(`{"user":{"password":"${REDACTED}","name":"bob"},"x":"ab`);
  });

  it('ends cut JSON at a sensitive object or array value', () => {
    expect(redactBody('{"a":1,"secrets":["s1","s2"],"b":"x', builtIn)).toBe(
      `{"a":1,"secrets":"${REDACTED}"`,
    );
    expect(redactBody('{"a":1,"credentials":{"k":"v"},"b', builtIn)).toBe(
      `{"a":1,"credentials":"${REDACTED}"`,
    );
  });

  it('ends cut JSON inside an unfinished sensitive string', () => {
    expect(redactBody('{"a":1,"password":"hunt', builtIn)).toBe(
      `{"a":1,"password":"${REDACTED}"`,
    );
  });

  it('redacts form-encoded bodies by key', () => {
    expect(redactBody('user=jane&password=hunter2&x=1', builtIn)).toBe(
      'user=jane&password=%5BREDACTED%5D&x=1',
    );
    expect(redactBody('user=jane&x=1', builtIn)).toBe('user=jane&x=1');
    expect(redactBody('user[name]=jane&user[password]=x', builtIn)).toBe(
      'user%5Bname%5D=jane&user%5Bpassword%5D=%5BREDACTED%5D',
    );
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
