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

## What's collected

- **Web Vitals** — LCP, FID, CLS, INP, TTFB, FCP
- **Page views** and navigation timing
- **JavaScript errors** and unhandled rejections
- **Network requests** — fetch and XHR with timing
- **User actions** — clicks, rage clicks, dead clicks
- **Console errors**
- **Session Replay** — pixel-perfect DOM recordings

## Privacy

Query strings are automatically stripped from all captured URLs to prevent
token and PII leakage. The `privacyLevel` setting controls input masking
in session replay:

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
