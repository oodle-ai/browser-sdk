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
| `privacyLevel` | `string` | `'mask-user-input'` | `'mask-user-input'` masks password/email inputs; `'mask'` masks all text and inputs |
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

## License

Apache-2.0
