let _trace: any = null;
let _context: any = null;

export function setOtelApi(
  traceApi: any,
  contextApi: any,
): void {
  _trace = traceApi;
  _context = contextApi;
}

const ZERO_TRACE =
  '00000000000000000000000000000000';

export function getActiveTraceContext(): {
  traceId: string;
  spanId: string;
} | null {
  if (!_trace || !_context) return null;
  try {
    const span = _trace.getSpan(
      _context.active(),
    );
    if (!span) return null;
    const ctx = span.spanContext();
    if (
      !ctx.traceId ||
      ctx.traceId === ZERO_TRACE
    ) {
      return null;
    }
    return {
      traceId: ctx.traceId,
      spanId: ctx.spanId,
    };
  } catch {
    return null;
  }
}
