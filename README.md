# @oodle-ai/rum

Real User Monitoring SDK for [Oodle](https://oodle.ai). Captures browser
performance data, user sessions, errors, and session replay.

## Install

```bash
npm install @oodle-ai/rum
```

## Quick start

```javascript
import { OodleRum } from '@oodle-ai/rum';

OodleRum.init({
  instanceId: '<OODLE_INSTANCE_ID>',
  apiKey: '<OODLE_RUM_API_KEY>',
  endpoint: 'https://<COLLECTOR_DOMAIN>',
  service: 'my-app',
  env: 'production',
  version: '1.0.0',
  sessionReplay: true,
  sessionSampleRate: 100,
  replaySampleRate: 100,
  privacyLevel: 'mask-user-input',
});
```

### Enabling it per environment

Gate `init()` alone — the rest of the API is safe to call
unconditionally from shared code:

```javascript
if (import.meta.env.PROD) {
  OodleRum.init({ /* ... */ });
}

// No environment check needed here or at any other call site.
OodleRum.identify({ id: user.id });
OodleRum.trackEvent('checkout_completed');
```

Without `init()`, nothing is recorded and nothing is sent:
`trackEvent` and `flush` do nothing, and `getSessionId()`
returns `''`. `identify`, `setTags`, and `addFeatureFlag`
keep working, so state set before a later `init()` still
applies once it runs — a `setTags` call takes precedence
over the `tags` passed to `init()` on any key both set.

## User identification

```javascript
OodleRum.identify({
  id: 'user-123',
  name: 'Jane Doe',
  email: 'jane@example.com',
});
```

The user fields are sent on every event. To send less, set `userInfo`:

- `'full'` (default): `user_id`, `user_name` and `user_email`.
- `'id'`: `user_id` only. `user_name` and `user_email` are sent empty.
- `'none'`: none of the three.

`user_status` (`identified` or `anonymous`) is sent in every mode.

## Custom events

```javascript
OodleRum.trackEvent('checkout_completed', {
  orderId: '12345',
  total: 99.99,
});
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `instanceId` | `string` | **required** | Oodle instance ID |
| `apiKey` | `string` | **required** | RUM API key (write-only, safe for client-side) |
| `endpoint` | `string` | **required** | Collector URL (must be HTTPS in production) |
| `service` | `string` | **required** | Application name |
| `env` | `string` | `''` | Environment (e.g. production, staging) |
| `version` | `string` | `''` | Application version |
| `sessionReplay` | `boolean` | `true` | Enable session replay recording |
| `sessionSampleRate` | `number` | `100` | Percentage of sessions to track (0-100) |
| `replaySampleRate` | `number` | `100` | Percentage of tracked sessions to record replay (0-100) |
| `privacyLevel` | `string` | `'mask-user-input'` | `'mask-user-input'` masks password/email inputs; `'mask'` masks all text and inputs; `'allow'` masks nothing |
| `tags` | `object` | `undefined` | Custom key-value tags attached to all events |
| `viewUrlQueryParams` | `string[]` | `undefined` | Query parameter names to keep in `view_url` on every event (for example `['traceId']`). All other parameters are dropped. See [Privacy](#privacy) |
| `urlPathPatterns` | `string[]` | `undefined` | Route templates such as `'/projects/:id/tables/:table'`. Matching path segments are replaced by the `:name` before they are sent. See [Masking URL paths](#masking-url-paths) |
| `maskUrlPath` | `(path) => string` | `undefined` | Rewrites URL paths before they are sent, after `urlPathPatterns` |
| `referrerUrl` | `'path' \| 'origin' \| 'none'` | `'path'` | What `referrer_url` holds |
| `consoleLevels` | `('error' \| 'warn')[]` | `['error', 'warn']` | Console levels recorded. `[]` records none |
| `errorMessages` | `'full' \| 'scrub' \| 'none'` | `'full'` | What error and console messages hold. See [Error and console messages](#error-and-console-messages) |
| `actionText` | `'full' \| 'mask'` | `'mask'` with `privacyLevel: 'mask'`, else `'full'` | `'mask'` sends no element text with click events |
| `userAgent` | `'full' \| 'none'` | `'full'` | `'none'` sends `user_agent` empty. `browser_name`, `os_name` and `device_type` are still sent |
| `stripQueryStrings` | `'events' \| 'all'` | `'events'` | `'all'` also removes query strings from the replay page URL and span `url.full`. See [Query strings](#query-strings) |
| `userInfo` | `'full' \| 'id' \| 'none'` | `'full'` | Which `identify()` fields are sent on events. See [User identification](#user-identification) |
| `beforeSend` | `(event) => event \| null \| false \| void` | `undefined` | Change or drop any event before it is sent. See [Changing or dropping events](#changing-or-dropping-events) |
| `openTelemetry` | `boolean \| object` | `undefined` | Send browser traces for fetch and XHR calls. See [Browser tracing](#browser-tracing) |
| `allowedTracingUrls` | `(string \| RegExp)[]` | all URLs | URLs that get the `traceparent` header |
| `forwardNetworkHeaders` | `{ urls }` | `undefined` | Capture request and response headers for matching URLs. See [Network headers and bodies](#network-headers-and-bodies) |
| `forwardNetworkBodies` | `{ urls, maxBodySize? }` | `undefined` | Capture request and response bodies for matching URLs, up to `maxBodySize` characters (default 65536) |
| `redactHeaders` | `(string \| RegExp)[]` | `undefined` | More header names never sent, on top of the built-in list |
| `redactBodyKeys` | `(string \| RegExp)[]` | `undefined` | More JSON or form body keys whose values are replaced, on top of the built-in list |
| `beforeSendNetwork` | `(capture) => capture \| null \| void` | `undefined` | Change or remove captured headers and bodies before they are sent |

## Browser tracing

Set `openTelemetry: true` to send browser traces. You do not install
other packages: the OpenTelemetry packages are dependencies of
`@oodle-ai/rum`. The SDK loads them in separate chunks only when
`openTelemetry` is on, so an app without tracing does not download them.

```javascript
OodleRum.init({ /* ... */, openTelemetry: true });
```

Tracing uses zone.js, which replaces the global `Promise` when tracing
starts. A rejected promise created after that does not fire the browser's
`unhandledrejection` event, so no listener for that event hears about it.
The SDK records these rejections through zone.js's own handler, so RUM still
gets them. If your app has its own `unhandledrejection` listener, it misses
them while tracing is on.

`console.error(err)` with an `Error` object is recorded as
`Name: message`.

## What's collected

- **Web Vitals** — LCP, FID, CLS, INP, TTFB, FCP
- **Page views** and navigation timing
- **JavaScript errors** and unhandled rejections
- **Network requests** — fetch and XHR with timing
- **User actions** — clicks, rage clicks, dead clicks
- **Console errors and warnings**
- **Session Replay** — pixel-perfect DOM recordings

## Privacy

Every privacy option below is off by default, except where noted, so the
SDK sends the same data as before until you set one.

### What each option changes

| Data | Sent by default | Option to change it |
|------|-----------------|---------------------|
| URL paths (`view_url`, `view_url_path`, `referrer_url`, `resource_url`, replay page URL, span `url.full`) | As in the address bar | `urlPathPatterns`, `maskUrlPath` |
| URL query strings | Dropped, except on the replay page URL and span `url.full` | `stripQueryStrings`, `viewUrlQueryParams` |
| Referrer | Origin and path | `referrerUrl` |
| Console output | `console.error` and `console.warn` | `consoleLevels` |
| Error and console messages | As written | `errorMessages` |
| Clicked element text, `aria-label`, `title` | Sent, except under `privacyLevel: 'mask'` or inside masked elements | `actionText` |
| User agent string | Sent | `userAgent` |
| User name and email from `identify()` | Sent on every event | `userInfo` |
| Request and response headers and bodies | Not captured unless `forwardNetworkHeaders` / `forwardNetworkBodies` is set. Credential, session and client IP headers, and sensitive body fields, are never sent | `redactHeaders`, `redactBodyKeys`, `beforeSendNetwork` |
| Anything else in an event | Sent | `beforeSend` |

A configuration that sends as little as possible:

```javascript
OodleRum.init({
  /* ... */
  privacyLevel: 'mask',
  urlPathPatterns: ['/projects/:project/tables/:table', '/projects/:project/*'],
  referrerUrl: 'none',
  consoleLevels: ['error'],
  errorMessages: 'none',
  actionText: 'mask',
  userAgent: 'none',
  stripQueryStrings: 'all',
  userInfo: 'id',
  // Only if forwardNetworkHeaders or forwardNetworkBodies is set:
  beforeSendNetwork: () => null,
});
```

An option given a value it does not accept falls back to its most private
setting, with a console warning, so a misspelled setting does not send the
data it was meant to hold back.

### Masking URL paths

Paths often name the records a user opens, such as
`/projects/acme/tables/salaries`. List the app's routes in
`urlPathPatterns`, and the matching segments are replaced by their names:

```javascript
urlPathPatterns: [
  '/projects/:project/tables/:table', // -> /projects/:project/tables/:table
  '/projects/:project/*',             // -> /projects/:project/*
  '/api/projects/:project/*',
],
```

- A `:name` segment matches any one segment. Other segments must match
  exactly (case-sensitive).
- A pattern matches only a path with the same number of segments, unless it
  ends in `/*`, which also matches all further segments and sends them as `*`.
- The first matching pattern wins. A path that matches none is sent unchanged.
- The patterns apply to the page path and to network request paths, so list
  API routes too.
- A path that matches no pattern, such as a not-found page or a route added
  later, is sent unchanged. End each section with a catch-all such as
  `'/projects/:project/*'` so those paths are masked too.
- `view_url_path` is masked too, so views of different records group under
  one route.

For rules a pattern cannot express, set `maskUrlPath`. It gets the path after
`urlPathPatterns` and returns the path to send:

```javascript
maskUrlPath: (path) => path.replace(/\/users\/[^/]+/, '/users/:id'),
```

If `maskUrlPath` throws or returns something other than a string, the path is
sent as `/:redacted`.

Path masking changes only the path of the replay page URL and span
`url.full`. To remove their query strings too, set `stripQueryStrings: 'all'`.

### Error and console messages

Messages often include the data that failed, such as a table name, an email
or an ID. `errorMessages` controls `error_message`, the message at the top of
`error_stack` and `console_message`:

- `'full'` (default): sent as written.
- `'scrub'`: quoted strings, URLs, emails, UUIDs, long hex IDs and numbers of
  4 or more digits are replaced, for example
  `Table 'salaries' not found` becomes `Table '?' not found`. Errors of the
  same kind still group together. Unquoted words are kept, so use `'none'`
  if messages can name records without quotes.
- `'none'`: no message text. `error_type` and the stack frames are still sent.

Stack frames (script URLs, line and column numbers) are sent in every mode,
so stacks still map to source.

To stop recording console output, set `consoleLevels` to `['error']` or `[]`.
A level that is not listed is not wrapped at all.

### Click events

Click events carry the clicked element's text, or its `aria-label` or
`title`, as `action_text` and `action_target`. Set `actionText: 'mask'` to
send only the tag, id and classes, for example `button#delete-btn`.

This is the default under `privacyLevel: 'mask'`. Elements marked to be
masked or hidden in replay (`data-oodle-privacy`, `.oodle-privacy-*`,
`.rr-mask`, `.rr-block`) never have their text sent, whatever the setting.

To give an element a name of your choice, set `data-oodle-action-name` on
it or on an ancestor. The name is sent instead of the element's text, even
when text is masked, because you wrote it to be sent:

```html
<button data-oodle-action-name="Delete table">Delete table salaries</button>
<!-- Sent as button[Delete table] -->
```

### Query strings

The SDK removes the query string from `view_url`, `referrer_url` and
`resource_url`, because a query string can hold tokens or personal data.
By default, two places keep the full query string: the page URL that
session replay records, and the `url.full` attribute on browser trace spans.
Set `stripQueryStrings: 'all'` to remove it there too:

- The replay page URL then matches `view_url`: only the parameters in
  `viewUrlQueryParams` are kept, and the `#` fragment is dropped.
- Span `url.full` then matches `resource_url`: no query string or fragment.

To keep a parameter that only identifies page state, such as the ID of the
record a page shows, list its name in `viewUrlQueryParams`:

- Every event (views, actions, errors, resources, console) carries
  `view_url`, so every event keeps the listed parameters.
  `view_url_path` and `referrer_url` never contain a query string.
- The SDK keeps the value of a listed parameter as it is. Do not list
  a parameter that can hold personal data or a token.
- `view_url` gets one value for each record ID. To count or group
  views by page, use `view_url_path`.
- Names match exactly and are case-sensitive.
- The kept parameters are encoded again, so `view_url` can differ from
  the address bar (for example, `%3A` for `:` and `+` for a space).
  Decode the value before you compare it with an ID.
- Parameters after `#` in hash-based routes are not kept.
- A value that is not an array of strings is ignored, with a console
  warning.

### Network headers and bodies

Headers and bodies are captured only for the URLs listed in
`forwardNetworkHeaders` and `forwardNetworkBodies`. They often hold
personal data, such as the end user's IP address in a proxy header or
in a JSON response, so check what an API returns before you list it.

These headers are never sent, whatever the settings:

- Credentials: `authorization`, `proxy-authorization`, `cookie`,
  `set-cookie`, `x-api-key`
- Client IP addresses: `forwarded`, `x-forwarded-for`,
  `x-original-forwarded-for`, `x-real-ip`, `x-client-ip`,
  `x-cluster-client-ip`, `cf-connecting-ip`, `true-client-ip`,
  `fastly-client-ip`
- Any header whose name contains `token`, `secret`, `auth`, `cookie`,
  `passw`, `api-key`, `apikey`, `access-key`, `session`, `csrf`, `xsrf`,
  `client-ip`, `real-ip` or `connecting-ip`, or ends in `-forwarded-for`,
  such as `x-auth-token`, `x-csrf-token` or `x-session-id`.
  `x-forwarded-proto` and `x-forwarded-host` are kept.

In captured bodies, the values of these keys are replaced with
`[REDACTED]`, at any depth in JSON and in form-encoded bodies:

- Keys whose name contains `passw`, `secret`, `token` (but not token
  counts and limits such as `total_tokens` or `max_tokens`), `apikey`,
  `accesskey`, `privatekey`, `authorization`, `credential`, `cardnumber`,
  `creditcard`, `cvv`, `cvc`, `securitycode`, `socialsecurity`, `ipaddr`,
  `clientip`, `remoteaddr` or `remoteip`, and the keys `ip`, `ipv4`,
  `ipv6`, `ssn` and `pan`. Case, `-`, `_` and `.` are ignored, so
  `access_token`, `ipAddress` and `card-number` all match.
- Payment card numbers anywhere in a body, found by their checksum.

Built-in redaction runs before `beforeSendNetwork` and `beforeSend`, so
neither hook sees the removed values. A body with nothing to redact is sent
exactly as captured.

To keep more headers out, list them in `redactHeaders`. A string matches
the whole name, ignoring case, and a RegExp is tested against the
lowercase name:

```javascript
redactHeaders: ['x-debug-client-ip', /^x-internal-/],
```

To redact more body fields, list their keys in `redactBodyKeys`. A string
matches the whole key, ignoring case, `-`, `_` and `.`, and a RegExp is
tested against the key as written:

```javascript
redactBodyKeys: ['email', 'phone', /^salary/],
```

To change what is sent, set `beforeSendNetwork`. It runs once for each
request that captured headers or a body. It gets the request's `url` (as
sent: no query string, path masked), `method`, `status`, and
`requestHeaders`, `responseHeaders`, `requestBody` and `responseBody`.
Change the object and return nothing, return a new object, or return
`null` to send no headers or bodies for that request:

```javascript
beforeSendNetwork: (capture) => {
  const ip = /\b\d{1,3}(\.\d{1,3}){3}\b/g;
  if (capture.responseBody) {
    capture.responseBody = capture.responseBody.replace(ip, '<ip>');
  }
  if (capture.url.endsWith('/auth/token')) return null;
},
```

- The request's timing event (URL, method, status, duration) is sent
  in every case. Only the captured headers and bodies change.
- `url`, `method` and `status` are for reading. Changes to them are
  ignored.
- If the function throws or returns a promise, no headers or bodies are
  sent for that request, and the SDK logs one console warning. The
  function must be synchronous.
- The built-in redaction, `redactHeaders` and `redactBodyKeys` are
  applied before the function runs, so it never sees those values.

### Changing or dropping events

`beforeSend` is called with every event before it is queued: views,
actions, errors, console, resources, long tasks, custom events and tab
visibility. Use it for anything the options above do not cover:

```javascript
beforeSend: (event) => {
  // Drop console events from a noisy library.
  if (event.event_type === 'console' && /\[vendor\]/.test(event.console_message)) {
    return null;
  }
  // Remove a field.
  delete event.custom_event_properties;
},
```

- Change the event and return nothing, return a new object, or return
  `null` or `false` to drop the event.
- `session_id`, `event_type` and `timestamp` cannot be changed.
- If the function throws or returns a promise, the event is dropped and the
  SDK logs one console warning, so a broken hook does not send what it was
  meant to remove. The function must be synchronous.
- It runs after every other option, so it sees events as they would be
  sent.
- Session replay data does not pass through it. Use `privacyLevel` and
  the replay markers for replay.
- A dropped event still counts in the session's event counts.

### Session replay

The `privacyLevel` setting controls input masking in session replay:

- `'mask-user-input'` (default) — masks password and email fields
- `'mask'` — masks all text content and all input types
- `'allow'` — masks nothing

### Excluding specific elements

`privacyLevel` applies to the whole page. To exclude individual elements,
mark them in your markup. Both an attribute and a class are accepted for
each level, so you can use whichever fits your templates:

```html
<!-- Not recorded at all. The element and its subtree are replaced by an
     empty placeholder of the same size, so layout is preserved. -->
<div data-oodle-privacy="hidden">...</div>
<div class="oodle-privacy-hidden">...</div>

<!-- Recorded, but text is replaced with dots. Structure and styling are
     kept, so the replay still shows the shape of the page. -->
<span data-oodle-privacy="mask">alice@example.com</span>
<span class="oodle-privacy-mask">...</span>
```

Use `hidden` when the element itself is sensitive, and `mask` when only its
contents are. `hidden` is also the way to keep a subtree that is very large
or mutates constantly (a canvas, a virtualized log view) out of the
recording — the cost of recording it is skipped along with the content.

Marking works in both directions relative to `privacyLevel`: an element
marked `mask` is masked even under `'allow'`, and unmarked elements still
follow whatever the global level says.

rrweb's own class names work too, since the SDK leaves them at their
defaults:

- `.rr-block` — same effect as `.oodle-privacy-hidden`
- `.rr-mask` — same effect as `.oodle-privacy-mask`
- `.rr-ignore` — records the input element, but never its typed value

Elements are matched live, so toggling a class at runtime takes effect from
the next DOM mutation onward. Content recorded before the class was added is
already in the replay, so apply the marker before the sensitive value is
rendered rather than after.

## License

Apache-2.0
