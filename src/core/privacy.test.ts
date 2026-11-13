import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  REDACTED_PATH,
  configurePrivacy,
  consoleLevels,
  isActionTextMasked,
  maskPath,
  maskUrlPathOnly,
  resetPrivacy,
  sanitizeMessage,
  sanitizeReferrer,
  sanitizeResourceUrl,
  sanitizeStack,
  scrubMessage,
  sendUserAgent,
} from './privacy';

afterEach(() => {
  resetPrivacy();
  vi.restoreAllMocks();
});

describe('defaults', () => {
  it('change nothing when no option is set', () => {
    configurePrivacy({});
    expect(maskPath('/projects/acme/tables/users')).toBe(
      '/projects/acme/tables/users',
    );
    expect(sanitizeReferrer('https://a.com/x/y?q=1')).toBe(
      'https://a.com/x/y',
    );
    expect(consoleLevels()).toEqual(['error', 'warn']);
    expect(sanitizeMessage("bad 'x' 12345")).toBe("bad 'x' 12345");
    expect(sendUserAgent()).toBe(true);
  });
});

describe('urlPathPatterns', () => {
  it('replaces named segments with the parameter name', () => {
    configurePrivacy({
      urlPathPatterns: ['/projects/:project/tables/:table'],
    });
    expect(maskPath('/projects/acme/tables/salaries')).toBe(
      '/projects/:project/tables/:table',
    );
  });

  it('requires literal segments and segment count to match', () => {
    configurePrivacy({ urlPathPatterns: ['/projects/:project'] });
    expect(maskPath('/projects/acme/settings')).toBe(
      '/projects/acme/settings',
    );
    expect(maskPath('/teams/acme')).toBe('/teams/acme');
    expect(maskPath('/projects/')).toBe('/projects/');
  });

  it('uses the first matching pattern', () => {
    configurePrivacy({
      urlPathPatterns: ['/p/new', '/p/:id'],
    });
    expect(maskPath('/p/new')).toBe('/p/new');
    expect(maskPath('/p/123')).toBe('/p/:id');
  });

  it('masks the rest of the path with a trailing *', () => {
    configurePrivacy({ urlPathPatterns: ['/projects/:id/*'] });
    expect(maskPath('/projects/acme/tables/users/rows')).toBe(
      '/projects/:id/*',
    );
    expect(maskPath('/projects/acme')).toBe('/projects/:id');
    configurePrivacy({ urlPathPatterns: ['/*'] });
    expect(maskPath('/anything/at/all')).toBe('/*');
  });

  it('keeps a trailing slash', () => {
    configurePrivacy({ urlPathPatterns: ['/p/:id'] });
    expect(maskPath('/p/acme/')).toBe('/p/:id/');
  });

  it('ignores invalid patterns with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    configurePrivacy({
      urlPathPatterns: ['projects/:id', '/a/*/b', 42 as any, '/ok/:id'],
    });
    expect(warn).toHaveBeenCalledTimes(3);
    expect(maskPath('/ok/1')).toBe('/ok/:id');
  });

  it('ignores a non-array value with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    configurePrivacy({ urlPathPatterns: '/p/:id' as any });
    expect(warn).toHaveBeenCalledOnce();
    expect(maskPath('/p/1')).toBe('/p/1');
  });
});

describe('maskUrlPath', () => {
  it('runs after the patterns', () => {
    const fn = vi.fn((p: string) => p.replace(/\d+/g, ':n'));
    configurePrivacy({
      urlPathPatterns: ['/projects/:project/*'],
      maskUrlPath: fn,
    });
    expect(maskPath('/orders/42')).toBe('/orders/:n');
    expect(maskPath('/projects/acme/x')).toBe('/projects/:project/*');
    expect(fn).toHaveBeenCalledWith('/projects/:project/*');
  });

  it('fails closed when it throws or returns a non-string', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    configurePrivacy({
      maskUrlPath: () => {
        throw new Error('boom');
      },
    });
    expect(maskPath('/secret/a')).toBe(REDACTED_PATH);
    expect(maskPath('/secret/b')).toBe(REDACTED_PATH);
    expect(warn).toHaveBeenCalledOnce();

    configurePrivacy({ maskUrlPath: () => undefined as any });
    expect(maskPath('/secret')).toBe(REDACTED_PATH);
  });

  it('is cached per path', () => {
    const fn = vi.fn((p: string) => p.toUpperCase());
    configurePrivacy({ maskUrlPath: fn });
    maskPath('/a');
    maskPath('/a');
    maskPath('/b');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('sanitizeResourceUrl', () => {
  it('drops the query and fragment of an absolute URL', () => {
    expect(
      sanitizeResourceUrl('https://api.x.com/v1/q?token=s3cret#f'),
    ).toBe('https://api.x.com/v1/q');
  });

  it('drops the query of a relative URL', () => {
    // These failed to parse before and were sent as written.
    expect(
      sanitizeResourceUrl('/api/items?token=s3cret', 'https://app.x.com/p'),
    ).toBe('/api/items');
    expect(
      sanitizeResourceUrl('items?token=s3cret', 'https://app.x.com/a/b'),
    ).toBe('/a/items');
  });

  it('masks the path', () => {
    configurePrivacy({ urlPathPatterns: ['/api/projects/:id'] });
    expect(sanitizeResourceUrl('https://h.com/api/projects/acme?x=1')).toBe(
      'https://h.com/api/projects/:id',
    );
    expect(
      sanitizeResourceUrl('/api/projects/acme', 'https://h.com/'),
    ).toBe('/api/projects/:id');
  });

  it('sends no payload for a data: URL', () => {
    expect(sanitizeResourceUrl('data:text/plain,secret')).toBe('data:');
  });
});

describe('maskUrlPathOnly', () => {
  it('keeps the query and fragment', () => {
    configurePrivacy({ urlPathPatterns: ['/p/:id'] });
    expect(maskUrlPathOnly('https://h.com/p/acme?x=1#y')).toBe(
      'https://h.com/p/:id?x=1#y',
    );
  });

  it('returns the URL unchanged when no masking is set', () => {
    expect(maskUrlPathOnly('https://h.com/p/acme?x=1')).toBe(
      'https://h.com/p/acme?x=1',
    );
  });
});

describe('referrerUrl', () => {
  const ref = 'https://app.x.com/projects/acme?token=1';

  it("'path' keeps origin and masked path", () => {
    configurePrivacy({ urlPathPatterns: ['/projects/:id'] });
    expect(sanitizeReferrer(ref)).toBe('https://app.x.com/projects/:id');
  });

  it("'origin' keeps only the origin", () => {
    configurePrivacy({ referrerUrl: 'origin' });
    expect(sanitizeReferrer(ref)).toBe('https://app.x.com');
  });

  it("'none' sends nothing", () => {
    configurePrivacy({ referrerUrl: 'none' });
    expect(sanitizeReferrer(ref)).toBe('');
  });

  it('is empty for an empty referrer', () => {
    expect(sanitizeReferrer('')).toBe('');
  });

  it('follows a reconfiguration', () => {
    expect(sanitizeReferrer(ref)).toBe('https://app.x.com/projects/acme');
    configurePrivacy({ referrerUrl: 'none' });
    expect(sanitizeReferrer(ref)).toBe('');
  });
});

describe('unknown option values fail closed', () => {
  it('uses the most private mode with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    configurePrivacy({
      referrerUrl: 'full' as any,
      errorMessages: 'redact' as any,
      actionText: 'hide' as any,
      userAgent: false as any,
      consoleLevels: 'error' as any,
    });
    expect(warn).toHaveBeenCalledTimes(5);
    expect(sanitizeReferrer('https://a.com/b')).toBe('');
    expect(sanitizeMessage('x')).toBe('');
    expect(sendUserAgent()).toBe(false);
    expect(consoleLevels()).toEqual([]);
    expect(isActionTextMasked(document.createElement('button'))).toBe(true);
  });

  it('keeps only known console levels', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    configurePrivacy({ consoleLevels: ['warn', 'log' as any] });
    expect(consoleLevels()).toEqual(['warn']);
  });
});

describe('scrubMessage', () => {
  it('replaces quoted strings', () => {
    expect(
      scrubMessage(`Cannot read properties of undefined (reading 'salary')`),
    ).toBe(`Cannot read properties of undefined (reading '?')`);
    expect(scrubMessage('Table "customers" not found')).toBe(
      'Table "?" not found',
    );
    expect(scrubMessage('bad `x`')).toBe('bad `?`');
  });

  it('leaves apostrophes inside words alone', () => {
    expect(scrubMessage("Can't load the user's table")).toBe(
      "Can't load the user's table",
    );
  });

  it('replaces emails, URLs, IDs and long numbers', () => {
    expect(
      scrubMessage(
        'user jane.doe@acme.io failed GET https://api.x.com/p/9?t=1 ' +
          'id 123e4567-e89b-12d3-a456-426614174000 hash ' +
          'a3f9c2d1e4b5a6c7d8e9 acct 4111111111111111 code 42',
      ),
    ).toBe(
      'user <email> failed GET https://api.x.com/p/9 id <id> hash <id> ' +
        'acct <n> code 42',
    );
  });

  it('masks URL paths with the configured patterns', () => {
    configurePrivacy({ urlPathPatterns: ['/p/:id'] });
    expect(scrubMessage('at https://x.com/p/acme')).toBe(
      'at https://x.com/p/:id',
    );
  });

  it('is linear on long hostile input', () => {
    const s = "'".repeat(1) + 'a\\'.repeat(20000);
    const t = performance.now();
    scrubMessage(s + '"'.repeat(5000) + '`'.repeat(5000));
    expect(performance.now() - t).toBeLessThan(200);
  });
});

describe('sanitizeStack', () => {
  const stack =
    "TypeError: no table 'salaries'\n" +
    '    at load (https://app.x.com/assets/index-abc.js:1:23456)\n' +
    '    at run (https://app.x.com/assets/index-abc.js:2:10)';
  const msg = "no table 'salaries'";

  it('leaves the stack alone in full mode', () => {
    expect(sanitizeStack(stack, msg)).toBe(stack);
  });

  it('scrubs the header and keeps frames intact', () => {
    configurePrivacy({ errorMessages: 'scrub' });
    const out = sanitizeStack(stack, msg);
    expect(out.split('\n')[0]).toBe("TypeError: no table '?'");
    expect(out).toContain('index-abc.js:1:23456');
  });

  it('drops the message in none mode', () => {
    configurePrivacy({ errorMessages: 'none' });
    expect(sanitizeStack(stack, msg).split('\n')[0]).toBe('TypeError');
  });

  it('does not touch a frame that happens to contain the message', () => {
    configurePrivacy({ errorMessages: 'none' });
    const ff = 'load@https://app.x.com/run.js:1:1\nrun@https://x/y.js:2:2';
    expect(sanitizeStack(ff, 'run')).toBe(ff);
  });

  it('treats a header with an @ in it as a header', () => {
    configurePrivacy({ errorMessages: 'none' });
    const s = 'Error: jane@acme.io\n    at f (https://x/a.js:1:1)';
    expect(sanitizeStack(s, 'jane@acme.io')).toBe(
      'Error\n    at f (https://x/a.js:1:1)',
    );
  });
});

describe('isActionTextMasked', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('masks inside replay privacy markers', () => {
    document.body.innerHTML =
      '<div data-oodle-privacy="mask"><button id="a">Acme</button></div>' +
      '<div class="oodle-privacy-hidden"><span id="b">x</span></div>' +
      '<div class="rr-mask"><span id="c">x</span></div>' +
      '<button id="d">Open</button>';
    const $ = (id: string) => document.getElementById(id)!;
    expect(isActionTextMasked($('a'))).toBe(true);
    expect(isActionTextMasked($('b'))).toBe(true);
    expect(isActionTextMasked($('c'))).toBe(true);
    expect(isActionTextMasked($('d'))).toBe(false);
  });

  it("defaults to 'mask' under privacyLevel 'mask'", () => {
    configurePrivacy({ privacyLevel: 'mask' });
    expect(isActionTextMasked(document.createElement('button'))).toBe(true);
    configurePrivacy({ privacyLevel: 'mask', actionText: 'full' });
    expect(isActionTextMasked(document.createElement('button'))).toBe(false);
  });
});
