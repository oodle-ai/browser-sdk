let e = null, r = null;
function i(t, n) {
  e = t, r = n;
}
const a = "00000000000000000000000000000000";
function l() {
  if (!e || !r) return null;
  try {
    const t = e.getSpan(
      r.active()
    );
    if (!t) return null;
    const n = t.spanContext();
    return !n.traceId || n.traceId === a ? null : {
      traceId: n.traceId,
      spanId: n.spanId
    };
  } catch {
    return null;
  }
}
let c;
function u(t) {
  c = t;
}
function s() {
  return c;
}
export {
  s as a,
  u as b,
  l as g,
  i as s
};
