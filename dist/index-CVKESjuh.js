const So = "__oodleOriginal";
function Wn(e) {
  try {
    const t = console.warn;
    (t[So] ?? t).call(
      console,
      "[@oodle-ai/rum] " + e
    );
  } catch {
  }
}
const Dt = [
  "error",
  "warn"
];
function Ji() {
  return {
    patterns: [],
    maskFn: null,
    referrer: "path",
    consoleLevels: Dt,
    messages: "full",
    actionText: "full",
    userAgent: "full",
    queryStrings: "events",
    userInfo: "full",
    keepParams: []
  };
}
let b = Ji();
const yn = "/:redacted", Ki = 256, tt = /* @__PURE__ */ new Map();
let kn = !1;
const Te = Wn;
function Ie(e, t, n, r, o) {
  return t === void 0 ? r : typeof t == "string" && n.includes(t) ? t : (Te(
    `${e} must be one of ${n.map((i) => `'${i}'`).join(", ")}. Using '${o}'.`
  ), o);
}
function Gi(e) {
  if (typeof e != "string" || !e.startsWith("/")) return null;
  const t = e.split("/").slice(1);
  t.length > 0 && t[t.length - 1] === "" && t.pop();
  let n = !1;
  t.length > 0 && t[t.length - 1] === "*" && (n = !0, t.pop());
  for (const r of t)
    if (r === "" || r === ":" || r.includes("*"))
      return null;
  return { segs: t, rest: n };
}
function Qi(e) {
  if (e === void 0) return [];
  if (!Array.isArray(e))
    return Te(
      "urlPathPatterns must be an array of path patterns such as '/projects/:id'. It is ignored."
    ), [];
  const t = [];
  for (const n of e) {
    const r = Gi(n);
    r ? t.push(r) : Te(
      `urlPathPatterns: ${JSON.stringify(n)} is not a valid pattern. Patterns start with '/', use ':name' for one segment and may end in '/*'. It is ignored.`
    );
  }
  return t;
}
function Zi(e) {
  if (e === void 0) return Dt;
  if (!Array.isArray(e))
    return Te(
      "consoleLevels must be an array such as ['error']. Console capture is off."
    ), [];
  const t = Dt.filter(
    (n) => e.includes(n)
  );
  return e.some(
    (n) => !Dt.includes(n)
  ) && Te(
    "consoleLevels accepts only 'error' and 'warn'. Other values are ignored."
  ), t;
}
function es(e) {
  tt.clear(), kn = !1;
  const t = e.maskUrlPath;
  t !== void 0 && typeof t != "function" && Te("maskUrlPath must be a function. It is ignored."), b = {
    patterns: Qi(e.urlPathPatterns),
    maskFn: typeof t == "function" ? t : null,
    referrer: Ie(
      "referrerUrl",
      e.referrerUrl,
      ["path", "origin", "none"],
      "path",
      "none"
    ),
    consoleLevels: Zi(
      e.consoleLevels
    ),
    messages: Ie(
      "errorMessages",
      e.errorMessages,
      ["full", "scrub", "none"],
      "full",
      "none"
    ),
    // Text the replay masks must not reappear in click events.
    actionText: Ie(
      "actionText",
      e.actionText,
      ["full", "mask"],
      e.privacyLevel === "mask" ? "mask" : "full",
      "mask"
    ),
    userAgent: Ie(
      "userAgent",
      e.userAgent,
      ["full", "none"],
      "full",
      "none"
    ),
    queryStrings: Ie(
      "stripQueryStrings",
      e.stripQueryStrings,
      ["events", "all"],
      "events",
      "all"
    ),
    userInfo: Ie(
      "userInfo",
      e.userInfo,
      ["full", "id", "none"],
      "full",
      "none"
    ),
    keepParams: Array.isArray(e.viewUrlQueryParams) ? e.viewUrlQueryParams : []
  };
}
function Jn() {
  return b.patterns.length > 0 || b.maskFn !== null;
}
function ts(e) {
  const t = e.split("/").slice(1), n = t.length > 0 && t[t.length - 1] === "";
  n && t.pop();
  for (const r of b.patterns) {
    if (r.rest) {
      if (t.length < r.segs.length) continue;
    } else if (t.length !== r.segs.length)
      continue;
    let o = !0;
    for (let s = 0; s < r.segs.length; s++) {
      const c = r.segs[s];
      if (c[0] === ":") {
        if (t[s] === "") {
          o = !1;
          break;
        }
      } else if (c !== t[s]) {
        o = !1;
        break;
      }
    }
    if (!o) continue;
    let i = "/" + r.segs.join("/");
    return r.rest && t.length > r.segs.length && (i += (r.segs.length > 0 ? "/" : "") + "*"), n && !i.endsWith("/") && (i += "/"), i;
  }
  return e;
}
function ns(e) {
  let t = b.patterns.length > 0 ? ts(e) : e;
  if (b.maskFn)
    try {
      const n = b.maskFn(t);
      t = typeof n == "string" ? n : yn;
    } catch (n) {
      kn || (kn = !0, Te(
        `maskUrlPath threw. Paths are sent as '${yn}' until it is fixed: ${String(n)}`
      )), t = yn;
    }
  return t;
}
function le(e) {
  if (!Jn()) return e;
  const t = tt.get(e);
  if (t !== void 0) return t;
  const n = ns(e);
  return tt.size >= Ki && tt.clear(), tt.set(e, n), n;
}
function rs(e) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(e);
}
function vt(e, t) {
  if (rs(e)) {
    let n;
    try {
      n = new URL(e);
    } catch {
      return e;
    }
    return n.protocol !== "http:" && n.protocol !== "https:" ? n.protocol === "data:" ? "data:" : n.origin + n.pathname : n.origin + le(n.pathname);
  }
  try {
    const n = t ?? (typeof location < "u" ? location.href : "http://localhost/"), r = new URL(e, n);
    return r.origin === new URL(n).origin ? le(r.pathname) : r.origin + le(r.pathname);
  } catch {
    const n = e.search(/[?#]/);
    return n >= 0 ? e.slice(0, n) : e;
  }
}
function Eo(e) {
  return !Jn() || typeof e != "string" ? e : Kn(e, (t) => t.search + t.hash);
}
function Gu() {
  return Jn() || b.queryStrings === "all";
}
function os(e) {
  return b.queryStrings !== "all" ? Eo(e) : typeof e != "string" ? e : Kn(e, (t) => {
    const n = b.keepParams;
    if (n.length === 0 || !t.search) return "";
    const r = new URLSearchParams();
    t.searchParams.forEach((i, s) => {
      n.includes(s) && r.append(s, i);
    });
    const o = r.toString();
    return o ? "?" + o : "";
  });
}
function Qu(e) {
  return b.queryStrings !== "all" ? Eo(e) : typeof e != "string" ? e : Kn(e, () => "");
}
function Kn(e, t) {
  let n;
  try {
    n = new URL(e);
  } catch {
    return e;
  }
  return n.protocol !== "http:" && n.protocol !== "https:" ? e : n.origin + le(n.pathname) + t(n);
}
let Tr = null, br = "", Ar = null;
function is(e) {
  if (e === Tr && Ar === b)
    return br;
  let t = "";
  if (e && b.referrer !== "none")
    try {
      const n = new URL(e);
      t = b.referrer === "origin" ? n.origin : n.origin + le(n.pathname);
    } catch {
      t = b.referrer === "origin" ? "" : e;
    }
  return Tr = e, br = t, Ar = b, t;
}
function ss() {
  return b.consoleLevels;
}
function as() {
  return b.userAgent === "full";
}
function cs(e, t, n) {
  switch (b.userInfo) {
    case "full":
      return { user_id: e, user_name: t, user_email: n };
    case "id":
      return { user_id: e, user_name: "", user_email: "" };
    default:
      return { user_id: "", user_name: "", user_email: "" };
  }
}
const us = [
  [/(^|[^\w])'(?:[^'\\\n]|\\.){0,500}'/g, "$1'?'"],
  [/(^|[^\w])"(?:[^"\\\n]|\\.){0,500}"/g, '$1"?"'],
  [/(^|[^\w])`(?:[^`\\\n]|\\.){0,500}`/g, "$1`?`"]
], ls = /\bhttps?:\/\/[^\s'"`<>()\]]+/g, fs = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, ds = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, ps = /\b(?=[0-9a-fA-F]*\d)(?=[0-9a-fA-F]*[a-fA-F])[0-9a-fA-F]{16,}\b/g, ms = /\d{4,}/g, kr = 8192;
function hs(e) {
  if (!e) return e;
  let t = e.length > kr ? e.slice(0, kr) + "… [truncated]" : e;
  t = t.replace(ls, (n) => vt(n)), t.includes("@") && (t = t.replace(fs, "<email>"));
  for (const [n, r] of us)
    t = t.replace(n, r);
  return t = t.replace(ds, "<id>"), t = t.replace(ps, "<id>"), t = t.replace(ms, "<n>"), t;
}
const ys = /^\s+at |^[^\s@]*@\S+:\d+(?::\d+)?$/m;
function wt(e) {
  switch (b.messages) {
    case "full":
      return e;
    case "scrub":
      return hs(e);
    default:
      return "";
  }
}
function Gn(e, t) {
  if (b.messages === "full" || !e || !t) return e;
  const n = ys.exec(e), r = n ? n.index : e.length, o = e.indexOf(t);
  if (o < 0 || o + t.length > r)
    return e;
  const i = wt(t);
  let s = e.slice(0, o) + i;
  return i || (s = s.replace(/:\s*$/, "")), s + e.slice(o + t.length);
}
const To = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', bo = '[data-oodle-privacy="mask"],.oodle-privacy-mask', gs = To + "," + bo + ",.rr-block,.rr-mask";
function _s(e) {
  if (b.actionText === "mask") return !0;
  try {
    return typeof e.closest == "function" && e.closest(gs) !== null;
  } catch {
    return !0;
  }
}
let Cn = null;
function vs(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function ws(e) {
  if (!vs(e.endpoint))
    return console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    ), !1;
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  );
  const t = Ss(
    e.viewUrlQueryParams
  );
  return es({ ...e, viewUrlQueryParams: t }), Cn = { ...e, viewUrlQueryParams: t }, !0;
}
function Ss(e) {
  if (e === void 0) return;
  if (!Array.isArray(e)) {
    console.warn(
      "[@oodle-ai/rum] viewUrlQueryParams must be an array of parameter names. It is ignored."
    );
    return;
  }
  const t = e.filter(
    (n) => typeof n == "string" && n !== ""
  );
  return t.length !== e.length && console.warn(
    "[@oodle-ai/rum] viewUrlQueryParams holds values that are not parameter names. They are ignored."
  ), t;
}
function O() {
  if (!Cn)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return Cn;
}
const Qn = "__oodle_session_v2", Zn = "__oodle_tab", Cr = "__oodle_session", Es = 900 * 1e3, Ao = 14400 * 1e3, ko = 1e3;
function Ke() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
let rt = null, $ = null;
function er(e, t) {
  try {
    const n = e == null ? void 0 : e.getItem(t);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function tr(e, t, n) {
  try {
    e == null || e.setItem(t, JSON.stringify(n));
  } catch {
  }
}
function Co() {
  try {
    return typeof localStorage < "u" ? localStorage : void 0;
  } catch {
    return;
  }
}
function St() {
  try {
    return typeof sessionStorage < "u" ? sessionStorage : void 0;
  } catch {
    return;
  }
}
const Ts = 1e3;
let Et = 0;
function we() {
  const e = Date.now();
  if (rt && e - Et < Ts) return rt;
  Et = e;
  const t = er(Co(), Qn);
  return t && typeof t.id == "string" && t.id ? bs({
    id: t.id,
    createdAt: t.createdAt ?? Date.now(),
    lastActivity: t.lastActivity ?? Date.now(),
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: t.started ?? !0
  }) : rt;
}
function bs(e) {
  return e && (rt = e), e;
}
function an(e) {
  rt = e, Et = Date.now(), tr(Co(), Qn, e);
}
function Io() {
  if ($) return $;
  const e = er(St(), Zn);
  if (e && typeof e.tabId == "string") {
    const t = {
      tabId: e.tabId,
      sessionId: e.sessionId ?? "",
      viewCount: e.viewCount ?? 0,
      errorCount: e.errorCount ?? 0,
      actionCount: e.actionCount ?? 0,
      replaySegmentSeq: e.replaySegmentSeq ?? 0,
      legacyReplay: e.legacyReplay ?? !1
    };
    return $ = t, t;
  }
  return $;
}
function As(e) {
  $ = e, tr(St(), Zn, e);
}
let Re = null;
function ks(e) {
  $ = e, !Re && (Re = setTimeout(() => {
    Re = null, $ && tr(St(), Zn, $);
  }, 1e3));
}
function Ot(e) {
  Re && (clearTimeout(Re), Re = null), As(e);
}
let Lo = 100, Mo = 100;
function Cs(e, t) {
  Lo = Math.max(0, Math.min(100, e)), Mo = Math.max(0, Math.min(100, t));
}
function Ir(e) {
  return Math.random() * 100 < e;
}
function jt(e, t) {
  return !!e && t - e.lastActivity <= Es && t - e.createdAt <= Ao;
}
function Is(e) {
  var r;
  const t = er(St(), Cr);
  if (!t || typeof t.id != "string") return !1;
  const n = {
    id: t.id,
    createdAt: t.createdAt ?? e,
    lastActivity: t.lastActivity ?? e,
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: !0
  };
  if (e - n.lastActivity > 1800 * 1e3 || e - n.createdAt > Ao)
    return !1;
  an(n), Ot({
    tabId: Ke(),
    sessionId: n.id,
    viewCount: t.viewCount ?? 0,
    errorCount: t.errorCount ?? 0,
    actionCount: t.actionCount ?? 0,
    replaySegmentSeq: t.replaySegmentSeq ?? 0,
    legacyReplay: !0
  });
  try {
    (r = St()) == null || r.removeItem(Cr);
  } catch {
  }
  return !0;
}
function Ls(e) {
  const t = Ir(Lo), n = {
    id: Ke(),
    createdAt: e,
    lastActivity: e,
    sampled: t,
    replaySampled: t && Ir(Mo),
    started: !1
  };
  return an(n), n;
}
const In = /* @__PURE__ */ new Set();
function Ms(e) {
  return In.add(e), () => In.delete(e);
}
function xt() {
  let e = Io();
  return e || (e = {
    tabId: Ke(),
    sessionId: "",
    viewCount: 0,
    errorCount: 0,
    actionCount: 0,
    replaySegmentSeq: 0,
    legacyReplay: !1
  }, Ot(e)), e;
}
function Ro(e) {
  const t = xt();
  if (t.sessionId === e) return;
  const n = t.sessionId;
  if (t.sessionId = e, t.viewCount = 0, t.errorCount = 0, t.actionCount = 0, t.replaySegmentSeq = 0, t.legacyReplay = !1, Ot(t), n)
    for (const r of In)
      try {
        r(n, e);
      } catch {
      }
}
let gn = 0;
function Ln() {
  const e = Date.now();
  let t = we();
  jt(t, e) || (Et = 0, t = we()), jt(t, e) ? e - gn >= ko && (t.lastActivity = Math.max(t.lastActivity, e), an(t), gn = e) : (Is(e) ? t = we() : t = Ls(e), gn = e), t && Ro(t.id);
}
function oe() {
  const e = Date.now(), t = we();
  return jt(t, e) ? (Ro(t.id), t.id) : "";
}
function Oo() {
  return xt().tabId;
}
function Rs() {
  return xt().legacyReplay;
}
function Os() {
  const e = Date.now(), t = we();
  return !jt(t, e) || t.started ? !1 : (t.started = !0, an(t), !0);
}
function xs() {
  if (!oe()) return 0;
  const e = xt(), t = e.replaySegmentSeq;
  return e.replaySegmentSeq = t + 1, Ot(e), t;
}
function xo() {
  const e = we();
  return (e == null ? void 0 : e.sampled) ?? !0;
}
function Po() {
  const e = we();
  return (e == null ? void 0 : e.replaySampled) ?? !0;
}
let ot = null, it = null, st = null;
const Uo = ["click", "keydown", "touchstart", "scroll"];
function Ps() {
  if (typeof document > "u") return;
  No();
  let e = 0;
  ot = () => {
    const t = Date.now();
    t - e < ko || (e = t, Ln());
  };
  for (const t of Uo)
    document.addEventListener(t, ot, {
      capture: !0,
      passive: !0
    });
  st = (t) => {
    t.key === Qn && (Et = 0);
  }, window.addEventListener("storage", st), it = () => {
    document.visibilityState === "visible" ? Ln() : $ && Ot($);
  }, document.addEventListener("visibilitychange", it);
}
function No() {
  if (!(typeof document > "u")) {
    if (ot) {
      for (const e of Uo)
        document.removeEventListener(e, ot, {
          capture: !0
        });
      ot = null;
    }
    it && (document.removeEventListener("visibilitychange", it), it = null), st && (window.removeEventListener("storage", st), st = null);
  }
}
function Do(e) {
  if (!oe()) return;
  const t = xt();
  e === "view" || e === "page_load" ? t.viewCount++ : e === "error" ? t.errorCount++ : e === "action" && t.actionCount++, ks(t);
}
function Us() {
  const e = $ ?? Io();
  return {
    viewCount: (e == null ? void 0 : e.viewCount) ?? 0,
    errorCount: (e == null ? void 0 : e.errorCount) ?? 0,
    actionCount: (e == null ? void 0 : e.actionCount) ?? 0
  };
}
let z = null;
function Ns(e) {
  z = e;
}
function Ho() {
  return (z == null ? void 0 : z.id) ?? "";
}
function Ds() {
  return (z == null ? void 0 : z.name) ?? "";
}
function Hs() {
  return (z == null ? void 0 : z.email) ?? "";
}
function Fs() {
  return z ? "identified" : "anonymous";
}
const Bs = 5e5;
function Vt(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > Bs) return n;
    const i = o.pop();
    if (i == null) {
      n += 4;
      continue;
    }
    switch (typeof i) {
      case "string":
        n += i.length + 2;
        break;
      case "number":
        n += 8;
        break;
      case "boolean":
        n += 5;
        break;
      case "object": {
        if (Array.isArray(i)) {
          n += 2 + i.length;
          for (let s = 0; s < i.length; s++)
            o.push(i[s]);
        } else {
          n += 2;
          for (const s in i)
            Object.prototype.hasOwnProperty.call(
              i,
              s
            ) && (n += s.length + 4, o.push(
              i[s]
            ));
        }
        break;
      }
    }
  }
  return n;
}
let Tt = {};
function qs(e) {
  e && (Tt = { ...e, ...Tt });
}
function $s(e) {
  Tt = { ...Tt, ...e };
}
function zs() {
  return Tt;
}
const js = 6e4, Vs = "sdk_telemetry", Oe = {
  events_rate_limited: 0,
  events_should_send_dropped: 0,
  send_failures: 0,
  compression_failures: 0,
  retry_drops: 0,
  transport_drops: 0,
  exit_send_failures: 0,
  replay_events_dropped: 0,
  replay_rebases: 0,
  replay_overload_pauses: 0,
  replay_expensive_snapshots: 0,
  replay_attributes_throttled: 0,
  replay_emit_errors: 0
};
function x(e, t = 1) {
  Oe[e] += t;
}
function Xs() {
  for (const e in Oe)
    if (Oe[e] > 0)
      return !0;
  return !1;
}
function Mn() {
  if (!Xs()) return;
  const e = { ...Oe };
  for (const t in Oe)
    Oe[t] = 0;
  sr(Vs, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let at = null, ct = null;
function Ys() {
  at || (at = setInterval(
    Mn,
    js
  ), typeof document < "u" && (ct = () => {
    document.visibilityState === "hidden" && Mn();
  }, document.addEventListener(
    "visibilitychange",
    ct
  )));
}
function Ws() {
  at && (clearInterval(at), at = null), ct && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    ct
  ), ct = null), Mn();
}
var D = Uint8Array, U = Uint16Array, nr = Int32Array, rr = new D([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]), or = new D([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]), Lr = new D([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Fo = function(e, t) {
  for (var n = new U(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new nr(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, Bo = Fo(rr, 2), Js = Bo.b, Rn = Bo.r;
Js[28] = 258, Rn[258] = 28;
var Ks = Fo(or, 0), Mr = Ks.r, On = new U(32768);
for (var T = 0; T < 32768; ++T) {
  var se = (T & 43690) >> 1 | (T & 21845) << 1;
  se = (se & 52428) >> 2 | (se & 13107) << 2, se = (se & 61680) >> 4 | (se & 3855) << 4, On[T] = ((se & 65280) >> 8 | (se & 255) << 8) >> 1;
}
var ut = (function(e, t, n) {
  for (var r = e.length, o = 0, i = new U(t); o < r; ++o)
    e[o] && ++i[e[o] - 1];
  var s = new U(t);
  for (o = 1; o < t; ++o)
    s[o] = s[o - 1] + i[o - 1] << 1;
  var c;
  if (n) {
    c = new U(1 << t);
    var a = 15 - t;
    for (o = 0; o < r; ++o)
      if (e[o])
        for (var l = o << 4 | e[o], u = t - e[o], f = s[e[o] - 1]++ << u, h = f | (1 << u) - 1; f <= h; ++f)
          c[On[f] >> a] = l;
  } else
    for (c = new U(r), o = 0; o < r; ++o)
      e[o] && (c[o] = On[s[e[o] - 1]++] >> 15 - e[o]);
  return c;
}), be = new D(288);
for (var T = 0; T < 144; ++T)
  be[T] = 8;
for (var T = 144; T < 256; ++T)
  be[T] = 9;
for (var T = 256; T < 280; ++T)
  be[T] = 7;
for (var T = 280; T < 288; ++T)
  be[T] = 8;
var Xt = new D(32);
for (var T = 0; T < 32; ++T)
  Xt[T] = 5;
var Gs = /* @__PURE__ */ ut(be, 9, 0), Qs = /* @__PURE__ */ ut(Xt, 5, 0), qo = function(e) {
  return (e + 7) / 8 | 0;
}, $o = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new D(e.subarray(t, n));
}, J = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, Qe = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, _n = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: jo, l: 0 };
  if (o == 1) {
    var s = new D(n[0].s + 1);
    return s[n[0].s] = 1, { t: s, l: 1 };
  }
  n.sort(function(y, v) {
    return y.f - v.f;
  }), n.push({ s: -1, f: 25001 });
  var c = n[0], a = n[1], l = 0, u = 1, f = 2;
  for (n[0] = { s: -1, f: c.f + a.f, l: c, r: a }; u != o - 1; )
    c = n[n[l].f < n[f].f ? l++ : f++], a = n[l != u && n[l].f < n[f].f ? l++ : f++], n[u++] = { s: -1, f: c.f + a.f, l: c, r: a };
  for (var h = i[0].s, r = 1; r < o; ++r)
    i[r].s > h && (h = i[r].s);
  var m = new U(h + 1), g = xn(n[u - 1], m, 0);
  if (g > t) {
    var r = 0, _ = 0, k = g - t, C = 1 << k;
    for (i.sort(function(v, w) {
      return m[w.s] - m[v.s] || v.f - w.f;
    }); r < o; ++r) {
      var E = i[r].s;
      if (m[E] > t)
        _ += C - (1 << g - m[E]), m[E] = t;
      else
        break;
    }
    for (_ >>= k; _ > 0; ) {
      var A = i[r].s;
      m[A] < t ? _ -= 1 << t - m[A]++ - 1 : ++r;
    }
    for (; r >= 0 && _; --r) {
      var L = i[r].s;
      m[L] == t && (--m[L], ++_);
    }
    g = t;
  }
  return { t: new D(m), l: g };
}, xn = function(e, t, n) {
  return e.s == -1 ? Math.max(xn(e.l, t, n + 1), xn(e.r, t, n + 1)) : t[e.s] = n;
}, Rr = function(e) {
  for (var t = e.length; t && !e[--t]; )
    ;
  for (var n = new U(++t), r = 0, o = e[0], i = 1, s = function(a) {
    n[r++] = a;
  }, c = 1; c <= t; ++c)
    if (e[c] == o && c != t)
      ++i;
    else {
      if (!o && i > 2) {
        for (; i > 138; i -= 138)
          s(32754);
        i > 2 && (s(i > 10 ? i - 11 << 5 | 28690 : i - 3 << 5 | 12305), i = 0);
      } else if (i > 3) {
        for (s(o), --i; i > 6; i -= 6)
          s(8304);
        i > 2 && (s(i - 3 << 5 | 8208), i = 0);
      }
      for (; i--; )
        s(o);
      i = 1, o = e[c];
    }
  return { c: n.subarray(0, r), n: t };
}, Ze = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, zo = function(e, t, n) {
  var r = n.length, o = qo(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, Or = function(e, t, n, r, o, i, s, c, a, l, u) {
  J(t, u++, n), ++o[256];
  for (var f = _n(o, 15), h = f.t, m = f.l, g = _n(i, 15), _ = g.t, k = g.l, C = Rr(h), E = C.c, A = C.n, L = Rr(_), y = L.c, v = L.n, w = new U(19), p = 0; p < E.length; ++p)
    ++w[E[p] & 31];
  for (var p = 0; p < y.length; ++p)
    ++w[y[p] & 31];
  for (var d = _n(w, 7), M = d.t, W = d.l, P = 19; P > 4 && !M[Lr[P - 1]]; --P)
    ;
  var Ae = l + 5 << 3, F = Ze(o, be) + Ze(i, Xt) + s, B = Ze(o, h) + Ze(i, _) + s + 14 + 3 * P + Ze(w, M) + 2 * w[16] + 3 * w[17] + 7 * w[18];
  if (a >= 0 && Ae <= F && Ae <= B)
    return zo(t, u, e.subarray(a, a + l));
  var j, I, q, ie;
  if (J(t, u, 1 + (B < F)), u += 2, B < F) {
    j = ut(h, m, 0), I = h, q = ut(_, k, 0), ie = _;
    var dn = ut(M, W, 0);
    J(t, u, A - 257), J(t, u + 5, v - 1), J(t, u + 10, P - 4), u += 14;
    for (var p = 0; p < P; ++p)
      J(t, u + 3 * p, M[Lr[p]]);
    u += 3 * P;
    for (var V = [E, y], Ge = 0; Ge < 2; ++Ge)
      for (var ke = V[Ge], p = 0; p < ke.length; ++p) {
        var X = ke[p] & 31;
        J(t, u, dn[X]), u += M[X], X > 15 && (J(t, u, ke[p] >> 5 & 127), u += ke[p] >> 12);
      }
  } else
    j = Gs, I = be, q = Qs, ie = Xt;
  for (var p = 0; p < c; ++p) {
    var R = r[p];
    if (R > 255) {
      var X = R >> 18 & 31;
      Qe(t, u, j[X + 257]), u += I[X + 257], X > 7 && (J(t, u, R >> 23 & 31), u += rr[X]);
      var Ce = R & 31;
      Qe(t, u, q[Ce]), u += ie[Ce], Ce > 3 && (Qe(t, u, R >> 5 & 8191), u += or[Ce]);
    } else
      Qe(t, u, j[R]), u += I[R];
  }
  return Qe(t, u, j[256]), u + I[256];
}, Zs = /* @__PURE__ */ new nr([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), jo = /* @__PURE__ */ new D(0), ea = function(e, t, n, r, o, i) {
  var s = i.z || e.length, c = new D(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = c.subarray(r, c.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (a[0] = i.r >> 3);
    for (var f = Zs[t - 1], h = f >> 13, m = f & 8191, g = (1 << n) - 1, _ = i.p || new U(32768), k = i.h || new U(g + 1), C = Math.ceil(n / 3), E = 2 * C, A = function(hn) {
      return (e[hn] ^ e[hn + 1] << C ^ e[hn + 2] << E) & g;
    }, L = new nr(25e3), y = new U(288), v = new U(32), w = 0, p = 0, d = i.i || 0, M = 0, W = i.w || 0, P = 0; d + 2 < s; ++d) {
      var Ae = A(d), F = d & 32767, B = k[Ae];
      if (_[F] = B, k[Ae] = F, W <= d) {
        var j = s - d;
        if ((w > 7e3 || M > 24576) && (j > 423 || !l)) {
          u = Or(e, a, 0, L, y, v, p, M, P, d - P, u), M = w = p = 0, P = d;
          for (var I = 0; I < 286; ++I)
            y[I] = 0;
          for (var I = 0; I < 30; ++I)
            v[I] = 0;
        }
        var q = 2, ie = 0, dn = m, V = F - B & 32767;
        if (j > 2 && Ae == A(d - V))
          for (var Ge = Math.min(h, j) - 1, ke = Math.min(32767, d), X = Math.min(258, j); V <= ke && --dn && F != B; ) {
            if (e[d + q] == e[d + q - V]) {
              for (var R = 0; R < X && e[d + R] == e[d + R - V]; ++R)
                ;
              if (R > q) {
                if (q = R, ie = V, R > Ge)
                  break;
                for (var Ce = Math.min(V, R - 2), vr = 0, I = 0; I < Ce; ++I) {
                  var pn = d - V + I & 32767, Wi = _[pn], wr = pn - Wi & 32767;
                  wr > vr && (vr = wr, B = pn);
                }
              }
            }
            F = B, B = _[F], V += F - B & 32767;
          }
        if (ie) {
          L[M++] = 268435456 | Rn[q] << 18 | Mr[ie];
          var Sr = Rn[q] & 31, Er = Mr[ie] & 31;
          p += rr[Sr] + or[Er], ++y[257 + Sr], ++v[Er], W = d + q, ++w;
        } else
          L[M++] = e[d], ++y[e[d]];
      }
    }
    for (d = Math.max(d, W); d < s; ++d)
      L[M++] = e[d], ++y[e[d]];
    u = Or(e, a, l, L, y, v, p, M, P, d - P, u), l || (i.r = u & 7 | a[u / 8 | 0] << 3, u -= 7, i.h = k, i.p = _, i.i = d, i.w = W);
  } else {
    for (var d = i.w || 0; d < s + l; d += 65535) {
      var mn = d + 65535;
      mn >= s && (a[u / 8 | 0] = l, mn = s), u = zo(a, u + 1, e.subarray(d, mn));
    }
    i.i = s;
  }
  return $o(c, 0, r + qo(u) + o);
}, ta = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), na = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = ta[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, ra = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new D(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return ea(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, Pn = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, oa = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && Pn(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, ia = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function sa(e, t) {
  t || (t = {});
  var n = na(), r = e.length;
  n.p(e);
  var o = ra(e, t, ia(t), 8), i = o.length;
  return oa(o, t), Pn(o, i - 8, n.d()), Pn(o, i - 4, r), o;
}
var xr = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), aa = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), ca = 0;
try {
  aa.decode(jo, { stream: !0 }), ca = 1;
} catch {
}
function ua(e, t) {
  var n;
  if (xr)
    return xr.encode(e);
  for (var r = e.length, o = new D(e.length + (e.length >> 1)), i = 0, s = function(l) {
    o[i++] = l;
  }, n = 0; n < r; ++n) {
    if (i + 5 > o.length) {
      var c = new D(i + 8 + (r - n << 1));
      c.set(o), o = c;
    }
    var a = e.charCodeAt(n);
    a < 128 || t ? s(a) : a < 2048 ? (s(192 | a >> 6), s(128 | a & 63)) : a > 55295 && a < 57344 ? (a = 65536 + (a & 1047552) | e.charCodeAt(++n) & 1023, s(240 | a >> 18), s(128 | a >> 12 & 63), s(128 | a >> 6 & 63), s(128 | a & 63)) : (s(224 | a >> 12), s(128 | a >> 6 & 63), s(128 | a & 63));
  }
  return $o(o, 0, i);
}
function Ht(e) {
  try {
    return sa(ua(e));
  } catch {
    return null;
  }
}
const la = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function fa(e) {
  if (!la)
    return Ht(e);
  try {
    const t = new Response(e).body;
    if (!t) return Ht(e);
    const n = t.pipeThrough(
      new CompressionStream("gzip")
    ), r = await new Response(
      n
    ).arrayBuffer();
    return new Uint8Array(r);
  } catch {
    return Ht(e);
  }
}
const da = "0.6.0", Pr = 5e3, Vo = 50, Xo = 5e5, Ur = 256e3, Yt = "replay", Yo = 8e4, Wo = 32, pa = 2e7, ma = 5, ha = 1e3, ya = 6e4, ga = 500, Wt = 63e3;
let xe = 0, Pe = 0, ae = [], lt = 0, vn = null;
const Jt = /* @__PURE__ */ new Map();
let Ue = null, Ne = null, Un = null, ft = !1;
function _a() {
  try {
    return O().flushIntervalMs ?? Pr;
  } catch {
    return Pr;
  }
}
function Jo(e) {
  let t = Jt.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, Jt.set(e, t)), t;
}
function Ko(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (x("compression_failures"), { body: t, encoding: "" });
}
async function Go(e) {
  return Ko(await fa(e), e);
}
function va(e) {
  return Ko(Ht(e), e);
}
const wa = 64e3;
function Nn(e, t, n) {
  if (e === Yt)
    return {
      bytes: n ?? Vt(
        t,
        wa
      ),
      oversized: !1
    };
  const r = Vt(
    t,
    Ur + 1
  );
  return {
    bytes: r,
    oversized: r > Ur
  };
}
let Dn = null;
function Sa(e) {
  Dn = e;
}
function cn(e) {
  x("transport_drops"), e === Yt && Dn && Dn();
}
const Ea = "/v1/rum/ingest";
function Ta(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: da
    })
  );
  for (const i of e)
    n.push(
      JSON.stringify({
        type: i.type,
        count: i.items.length
      })
    ), n.push(JSON.stringify(i.items));
  return n.join(`
`);
}
function ba(e, t, n) {
  const r = O();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const a = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, l = new Blob([n], {
      type: "application/json"
    });
    if (l.size < Wt && navigator.sendBeacon(a, l))
      return;
  }
  const { body: o, encoding: i } = va(n), s = { ...t };
  i ? s["Content-Encoding"] = i : delete s["Content-Encoding"];
  const c = o instanceof Blob ? o.size : n.length;
  fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: c < Wt,
    credentials: "omit"
  }).catch(() => {
    x("exit_send_failures");
  });
}
function wn(e, t, n, r) {
  const o = n.length;
  if (lt + o > pa) {
    x("retry_drops"), r && cn(r);
    return;
  }
  const i = { ...t };
  delete i["Content-Encoding"], ae.push({
    url: e,
    headers: i,
    body: n,
    bytes: o,
    attempts: 0,
    batchKey: r
  }), lt += o, Qo();
}
function Qo() {
  if (vn || ae.length === 0)
    return;
  const e = ae[0], t = Math.min(
    ha * Math.pow(2, e.attempts),
    ya
  );
  vn = setTimeout(() => {
    vn = null, Zo();
  }, t);
}
async function Zo() {
  for (; ae.length > 0 && xe < Yo && Pe < Wo; ) {
    const e = ae.shift();
    if (lt -= e.bytes, e.attempts++, e.attempts > ma) {
      x("retry_drops"), e.batchKey && cn(e.batchKey);
      continue;
    }
    const t = e.bytes;
    xe += t, Pe++;
    try {
      const { body: n, encoding: r } = await Go(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < Wt,
        credentials: "omit"
      });
      if (ti(i), i.status === 429 || i.status >= 500) {
        ae.unshift(e), lt += e.bytes;
        break;
      }
    } catch {
      ae.unshift(e), lt += e.bytes;
      break;
    } finally {
      xe -= t, Pe--;
    }
  }
  ae.length > 0 && Qo();
}
function Aa() {
  Ue && (clearTimeout(Ue), Ue = null), Ne && (clearTimeout(Ne), Ne = null);
}
function ir() {
  const e = _a();
  Ue && clearTimeout(Ue), Ue = setTimeout(
    () => re(),
    e
  ), Ne || (Ne = setTimeout(
    () => {
      Ne = null, re();
    },
    e + ga
  ));
}
function sr(e, t, n) {
  const { bytes: r, oversized: o } = Nn(
    e,
    t,
    n
  );
  if (o) {
    console.warn(
      `[@oodle-ai/rum] Dropping oversized ${e} payload (${r} bytes)`
    ), cn(e);
    return;
  }
  const i = Jo(e);
  if (i.items.push(t), i.bytesEstimate += r, !ft && (i.items.length >= Vo || i.bytesEstimate >= Xo)) {
    re();
    return;
  }
  ir();
}
function ka(e, t, n, r) {
  const { bytes: o, oversized: i } = Nn(
    e,
    n
  );
  if (i) {
    cn(e);
    return;
  }
  const s = Jo(e), c = s.upsertMap.get(t);
  if (c !== void 0) {
    const a = Nn(
      e,
      s.items[c]
    ).bytes;
    s.items[c] = r ? r(s.items[c], n) : n, s.bytesEstimate += o - a;
  } else {
    const a = s.items.length;
    s.items.push(n), s.upsertMap.set(t, a), s.bytesEstimate += o;
  }
  if (!ft && (s.items.length >= Vo || s.bytesEstimate >= Xo)) {
    re();
    return;
  }
  ir();
}
function ei(e) {
  Un = e;
}
const Nr = ["events", "replay"];
function re(e = !1) {
  const t = O();
  if (e && Un && !ft) {
    ft = !0;
    try {
      Un();
    } catch {
    } finally {
      ft = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    ir();
    return;
  }
  Aa();
  const n = zs(), r = [], o = Array.from(
    Jt.keys()
  ).sort((l, u) => {
    const f = Nr.indexOf(l), h = Nr.indexOf(u), m = f >= 0 ? f : 999, g = h >= 0 ? h : 999;
    return m - g;
  });
  for (const l of o) {
    const u = Jt.get(l);
    if (!u || u.items.length === 0) continue;
    const f = u.items.splice(0);
    u.upsertMap.clear(), u.bytesEstimate = 0;
    const h = f.map((m) => ({
      ...m,
      tags: n
    }));
    r.push({
      type: u.batchKey,
      items: h
    });
  }
  if (r.length === 0) return;
  const i = Ta(r), s = `${t.endpoint}${Ea}`, c = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, a = r.some(
    (l) => l.type === Yt
  );
  if (e) {
    ba(s, c, i);
    return;
  }
  Ca(
    s,
    c,
    i,
    a ? Yt : void 0
  );
}
async function Ca(e, t, n, r) {
  const o = n.length;
  if (xe >= Yo || Pe >= Wo) {
    wn(e, t, n, r);
    return;
  }
  xe += o, Pe++;
  try {
    const { body: i, encoding: s } = await Go(n), c = { ...t };
    s && (c["Content-Encoding"] = s);
    const a = await fetch(e, {
      method: "POST",
      headers: c,
      body: i,
      keepalive: o < Wt,
      credentials: "omit"
    });
    ti(a), (a.status === 429 || a.status >= 500) && wn(e, t, n, r);
  } catch {
    x("send_failures"), wn(e, t, n, r);
  } finally {
    xe -= o, Pe--, Zo();
  }
}
const Hn = /* @__PURE__ */ new Map();
function ti(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && Hn.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function un(e) {
  const t = Hn.get(e);
  return t ? Date.now() >= t ? (Hn.delete(e), !1) : !0 : !1;
}
let dt = null, pt = null, mt = null, Fn = null;
function Ia(e) {
  Fn = e;
}
const ni = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function Dr() {
  typeof document > "u" || (dt = () => {
    document.visibilityState === "hidden" && re(!0);
  }, pt = () => re(!0), mt = (e) => {
    e.persisted && Fn && Fn();
  }, document.addEventListener(
    "visibilitychange",
    dt
  ), window.addEventListener(
    ni,
    pt
  ), window.addEventListener(
    "pageshow",
    mt
  ));
}
function La() {
  dt && (document.removeEventListener(
    "visibilitychange",
    dt
  ), dt = null), pt && (window.removeEventListener(
    ni,
    pt
  ), pt = null), mt && (window.removeEventListener(
    "pageshow",
    mt
  ), mt = null);
}
const Kt = /* @__PURE__ */ new Map();
function Ma(e, t) {
  Kt.set(e, t);
}
function Ra() {
  return Kt.size === 0 ? {} : Object.fromEntries(Kt);
}
function Oa() {
  Kt.clear();
}
const xa = 100, Pa = 1e4, ht = /* @__PURE__ */ new Set();
let bt = 0, De = null;
function ar() {
  for (const e of ht)
    try {
      e();
    } catch {
    }
}
function Ua() {
  De || typeof MutationObserver > "u" || typeof document > "u" || !document.documentElement || (De = new MutationObserver(ar), De.observe(document.documentElement, {
    childList: !0,
    subtree: !0,
    attributes: !0,
    characterData: !0
  }));
}
function Hr() {
  ht.size > 0 || !De || (De.disconnect(), De = null);
}
function ri() {
  bt++, ar();
}
function oi() {
  bt = Math.max(0, bt - 1), ar();
}
function ii(e, t, n = Pa) {
  let r = null, o = null, i = null, s = !1;
  const c = (u) => {
    s || (s = !0, o && clearTimeout(o), i && clearTimeout(i), ht.delete(l), Hr(), t(u));
  }, a = () => {
    o && clearTimeout(o), o = setTimeout(() => {
      if (bt > 0) {
        a();
        return;
      }
      c({
        endMs: r,
        hadActivity: r !== null,
        timedOut: !1
      });
    }, xa);
  };
  function l() {
    r = Date.now(), a();
  }
  return ht.add(l), Ua(), bt > 0 && (r = e), a(), i = setTimeout(() => {
    c({
      endMs: r,
      hadActivity: r !== null,
      timedOut: !0
    });
  }, n), () => {
    s = !0, o && clearTimeout(o), i && clearTimeout(i), ht.delete(l), Hr();
  };
}
var ce, yt, si, Gt, ai = -1, Pt = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (ai = t.timeStamp, e(t));
  }), !0);
}, cr = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, ln = function() {
  var e = cr();
  return e && e.activationStart || 0;
}, pe = function(e, t) {
  var n = cr(), r = "navigate";
  return ai >= 0 ? r = "back-forward-cache" : n && (document.prerendering || ln() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, ur = function(e, t, n) {
  try {
    if (PerformanceObserver.supportedEntryTypes.includes(e)) {
      var r = new PerformanceObserver((function(o) {
        Promise.resolve().then((function() {
          t(o.getEntries());
        }));
      }));
      return r.observe(Object.assign({ type: e, buffered: !0 }, n || {})), r;
    }
  } catch {
  }
}, me = function(e, t, n, r) {
  var o, i;
  return function(s) {
    t.value >= 0 && (s || r) && ((i = t.value - (o || 0)) || o === void 0) && (o = t.value, t.delta = i, t.rating = (function(c, a) {
      return c > a[1] ? "poor" : c > a[0] ? "needs-improvement" : "good";
    })(t.value, n), e(t));
  };
}, ci = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, lr = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, fr = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Me = -1, Fr = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, Qt = function(e) {
  document.visibilityState === "hidden" && Me > -1 && (Me = e.type === "visibilitychange" ? e.timeStamp : 0, Na());
}, Br = function() {
  addEventListener("visibilitychange", Qt, !0), addEventListener("prerenderingchange", Qt, !0);
}, Na = function() {
  removeEventListener("visibilitychange", Qt, !0), removeEventListener("prerenderingchange", Qt, !0);
}, dr = function() {
  return Me < 0 && (Me = Fr(), Br(), Pt((function() {
    setTimeout((function() {
      Me = Fr(), Br();
    }), 0);
  }))), { get firstHiddenTime() {
    return Me;
  } };
}, fn = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, qr = [1800, 3e3], Da = function(e, t) {
  t = t || {}, fn((function() {
    var n, r = dr(), o = pe("FCP"), i = ur("paint", (function(s) {
      s.forEach((function(c) {
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < r.firstHiddenTime && (o.value = Math.max(c.startTime - ln(), 0), o.entries.push(c), n(!0)));
      }));
    }));
    i && (n = me(e, o, qr, t.reportAllChanges), Pt((function(s) {
      o = pe("FCP"), n = me(e, o, qr, t.reportAllChanges), ci((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, Ha = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = fr(e), document.visibilityState === "hidden" ? e() : (n = t(e), lr(e)), n;
}, $r = [2500, 4e3], Sn = {}, Fa = function(e, t) {
  t = t || {}, fn((function() {
    var n, r = dr(), o = pe("LCP"), i = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - ln(), 0), o.entries = [l], n());
      }));
    }, s = ur("largest-contentful-paint", i);
    if (s) {
      n = me(e, o, $r, t.reportAllChanges);
      var c = fr((function() {
        Sn[o.id] || (i(s.takeRecords()), s.disconnect(), Sn[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(a) {
        addEventListener(a, (function() {
          return Ha(c);
        }), { once: !0, capture: !0 });
      })), lr(c), Pt((function(a) {
        o = pe("LCP"), n = me(e, o, $r, t.reportAllChanges), ci((function() {
          o.value = performance.now() - a.timeStamp, Sn[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, zr = [800, 1800], Ba = function e(t) {
  document.prerendering ? fn((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, qa = function(e, t) {
  t = t || {};
  var n = pe("TTFB"), r = me(e, n, zr, t.reportAllChanges);
  Ba((function() {
    var o = cr();
    o && (n.value = Math.max(o.responseStart - ln(), 0), n.entries = [o], r(!0), Pt((function() {
      n = pe("TTFB", 0), (r = me(e, n, zr, t.reportAllChanges))(!0);
    })));
  }));
}, nt = { passive: !0, capture: !0 }, $a = /* @__PURE__ */ new Date(), jr = function(e, t) {
  ce || (ce = t, yt = e, si = /* @__PURE__ */ new Date(), li(removeEventListener), ui());
}, ui = function() {
  if (yt >= 0 && yt < si - $a) {
    var e = { entryType: "first-input", name: ce.type, target: ce.target, cancelable: ce.cancelable, startTime: ce.timeStamp, processingStart: ce.timeStamp + yt };
    Gt.forEach((function(t) {
      t(e);
    })), Gt = [];
  }
}, za = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        jr(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, nt), removeEventListener("pointercancel", i, nt);
      };
      addEventListener("pointerup", o, nt), addEventListener("pointercancel", i, nt);
    })(t, e) : jr(t, e);
  }
}, li = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, za, nt);
  }));
}, Vr = [100, 300], ja = function(e, t) {
  t = t || {}, fn((function() {
    var n, r = dr(), o = pe("FID"), i = function(a) {
      a.startTime < r.firstHiddenTime && (o.value = a.processingStart - a.startTime, o.entries.push(a), n(!0));
    }, s = function(a) {
      a.forEach(i);
    }, c = ur("first-input", s);
    n = me(e, o, Vr, t.reportAllChanges), c && (lr(fr((function() {
      s(c.takeRecords()), c.disconnect();
    }))), Pt((function() {
      var a;
      o = pe("FID"), n = me(e, o, Vr, t.reportAllChanges), Gt = [], yt = -1, ce = null, li(addEventListener), a = i, Gt.push(a), ui();
    })));
  }));
};
const Va = 3e3;
let At = null, fi = (e) => e.href, S = null, te = null, Zt = [];
function en() {
  return typeof performance < "u" ? performance.now() : 0;
}
function Xa() {
  return typeof performance < "u" && performance.timeOrigin ? performance.timeOrigin : Date.now();
}
function gt(e) {
  const t = e.hash ?? "", n = t.startsWith("#/") ? t.split("?")[0] : "";
  return e.pathname + n;
}
function di(e, t, n) {
  return {
    id: Ke(),
    sessionId: oe(),
    loadingType: e,
    startEpoch: t,
    startPerf: n,
    url: fi(window.location),
    urlPath: le(window.location.pathname),
    seq: 0,
    active: !0,
    actionCount: 0,
    errorCount: 0,
    resourceCount: 0,
    longTaskCount: 0,
    frustrationCount: 0,
    loadingTimeMs: 0,
    vitals: {},
    cls: { value: 0, windowValue: 0, windowStart: 0, last: 0 },
    interactions: /* @__PURE__ */ new Map(),
    cancelIdle: null
  };
}
function Ya(e) {
  const t = Array.from(e.interactions.values()).sort((r, o) => o - r);
  if (t.length === 0) return 0;
  const n = Math.min(t.length - 1, Math.floor(t.length / 50));
  return t[n];
}
function Wa(e) {
  const t = Date.now(), n = e.vitals;
  return {
    // `page_load` keeps backends that predate view ids
    // counting the page load as before.
    event_type: e.loadingType === "initial_load" && e.loadingTimeMs > 0 ? "page_load" : "view",
    timestamp: new Date(t).toISOString(),
    view_id: e.id,
    view_loading_type: e.loadingType,
    view_update_seq: e.seq,
    view_is_active: e.active ? 1 : 0,
    view_start: new Date(e.startEpoch).toISOString(),
    view_time_spent_ms: Math.max(0, Math.round(t - e.startEpoch)),
    view_loading_time_ms: Math.round(e.loadingTimeMs),
    view_action_count: e.actionCount,
    view_error_count: e.errorCount,
    view_resource_count: e.resourceCount,
    view_long_task_count: e.longTaskCount,
    view_frustration_count: e.frustrationCount,
    view_url: e.url,
    view_url_path: e.urlPath,
    page_load_ms: Math.round(e.loadingTimeMs),
    lcp_ms: n.lcp ?? 0,
    fcp_ms: n.fcp ?? 0,
    ttfb_ms: n.ttfb ?? 0,
    fid_ms: n.fid ?? 0,
    inp_ms: Ya(e),
    cls: Math.round(e.cls.value * 1e4) / 1e4,
    dns_ms: n.dns_ms ?? 0,
    connect_ms: n.connect_ms ?? 0,
    tls_ms: n.tls_ms ?? 0,
    download_ms: n.download_ms ?? 0,
    dom_interactive_ms: n.dom_interactive_ms ?? 0,
    dom_complete_ms: n.dom_complete_ms ?? 0
  };
}
function Ut(e) {
  !At || !e.sessionId || (e.seq++, At(Wa(e), e.sessionId));
}
function pi() {
  te && (clearTimeout(te), te = null), S && Ut(S);
}
function kt() {
  te || !S || (te = setTimeout(() => {
    te = null, S && Ut(S);
  }, Va));
}
function tn() {
  const e = S;
  e && (e.cancelIdle && e.cancelIdle(), te && (clearTimeout(te), te = null), e.active = !1, Ut(e), S = null);
}
function mi(e) {
  e.cancelIdle = ii(e.startEpoch, (t) => {
    if (e.cancelIdle = null, S !== e) return;
    let n = t.endMs !== null && !t.timedOut ? t.endMs - e.startEpoch : 0;
    e.loadingType === "initial_load" && (n = Math.max(n, e.vitals.load_event_ms ?? 0)), e.loadingTimeMs = Math.max(0, n), pi();
  });
}
function nn(e, t, n) {
  tn();
  const r = di(e, t, n);
  r.sessionId && (S = r, Ut(r), mi(r));
}
function hi() {
  return (S == null ? void 0 : S.id) ?? "";
}
function Ja() {
  return (S == null ? void 0 : S.urlPath) ?? "";
}
function Ka(e) {
  const t = S;
  if (t) {
    switch (e.event_type) {
      case "action":
        t.actionCount++, e.is_frustration === 1 && t.frustrationCount++;
        break;
      case "error":
        t.errorCount++;
        break;
      case "console":
        e.console_level === "error" && t.errorCount++;
        break;
      case "resource":
        t.resourceCount++;
        break;
      case "long_task":
        t.longTaskCount++;
        break;
      default:
        return;
    }
    kt();
  }
}
function Ga(e) {
  var r, o;
  const t = (o = (r = performance.getEntriesByType) == null ? void 0 : r.call(performance, "navigation")) == null ? void 0 : o[0];
  if (!t || t.loadEventEnd <= 0) return !1;
  const n = Math.round;
  return e.vitals.load_event_ms = n(t.loadEventEnd - t.startTime), e.vitals.dns_ms = n(t.domainLookupEnd - t.domainLookupStart), e.vitals.connect_ms = n(t.connectEnd - t.connectStart), e.vitals.tls_ms = n(
    t.secureConnectionStart > 0 ? t.connectEnd - t.secureConnectionStart : 0
  ), e.vitals.download_ms = n(t.responseEnd - t.responseStart), e.vitals.dom_interactive_ms = n(t.domInteractive - t.startTime), e.vitals.dom_complete_ms = n(t.domComplete - t.startTime), !0;
}
function Xr(e, t, n = {}) {
  if (!(typeof PerformanceObserver > "u"))
    try {
      const r = new PerformanceObserver((o) => t(o.getEntries()));
      r.observe({ type: e, buffered: !0, ...n }), Zt.push(() => r.disconnect());
    } catch {
    }
}
function Qa(e, t, n) {
  const r = e.cls;
  r.windowValue > 0 && n - r.last < 1e3 && n - r.windowStart < 5e3 ? r.windowValue += t : (r.windowValue = t, r.windowStart = n), r.last = n, r.windowValue > r.value && (r.value = r.windowValue);
}
function Za() {
  Xr("layout-shift", (e) => {
    const t = S;
    if (!t) return;
    let n = !1;
    for (const r of e)
      r.hadRecentInput || r.startTime < t.startPerf || (Qa(t, r.value, r.startTime), n = !0);
    n && kt();
  }), Xr(
    "event",
    (e) => {
      const t = S;
      if (!t) return;
      let n = !1;
      for (const r of e) {
        if (!r.interactionId || r.startTime < t.startPerf) continue;
        const o = t.interactions.get(r.interactionId) ?? 0;
        r.duration > o && (t.interactions.set(r.interactionId, r.duration), n = !0);
      }
      n && kt();
    },
    { durationThreshold: 40 }
  );
}
function ec(e) {
  const t = (o, i) => {
    S !== e && !e.active || (e.vitals[o] = Math.round(i * 100) / 100, S === e && kt());
  };
  try {
    Fa((o) => t("lcp", o.value)), Da((o) => t("fcp", o.value)), qa((o) => t("ttfb", o.value)), ja((o) => t("fid", o.value));
  } catch {
  }
  let n = 0;
  const r = () => {
    Ga(e) ? S === e && kt() : ++n < 50 && setTimeout(r, 200);
  };
  document.readyState === "complete" ? setTimeout(r, 0) : window.addEventListener("load", () => setTimeout(r, 0), { once: !0 });
}
let He = "", Ft = !1;
function Le() {
  const e = gt(window.location);
  e !== He && (He = e, nn("route_change", Date.now(), en()));
}
function tc(e, t) {
  if (typeof window > "u") return;
  yi(), Ft = !1, At = e, fi = t, He = gt(window.location);
  const n = Xa(), r = di("initial_load", n, 0);
  r.sessionId && (S = r, Ut(r), mi(r), ec(r)), Za();
  const o = history.pushState, i = history.replaceState;
  history.pushState = function(...u) {
    o.apply(this, u), Le();
  }, history.replaceState = function(...u) {
    i.apply(this, u), Le();
  }, window.addEventListener("popstate", Le), window.addEventListener("hashchange", Le);
  const s = () => {
    document.visibilityState === "hidden" && pi();
  };
  document.addEventListener("visibilitychange", s);
  const c = () => {
    tn(), Ft = !0;
  };
  window.addEventListener("pagehide", c);
  const a = (u) => {
    u.persisted && (Ft = !1, He = gt(window.location), nn("bf_cache", Date.now(), en()));
  };
  window.addEventListener("pageshow", a);
  const l = Ms((u) => {
    S && S.sessionId === u && tn(), He = gt(window.location), nn("route_change", Date.now(), en());
  });
  Zt.push(() => {
    history.pushState = o, history.replaceState = i, window.removeEventListener("popstate", Le), window.removeEventListener("hashchange", Le), document.removeEventListener("visibilitychange", s), window.removeEventListener("pagehide", c), window.removeEventListener("pageshow", a), l();
  });
}
function nc() {
  S || Ft || !At || typeof window > "u" || (He = gt(window.location), nn("route_change", Date.now(), en()));
}
function yi() {
  tn();
  for (const e of Zt) e();
  Zt = [], At = null, S = null;
}
const rc = 3, oc = 1e3;
let rn = null, Q = null;
const fe = [], pr = [];
let Bt = null;
function ic() {
  for (let e = fe.length - 1; e >= 0; e--)
    if (!fe[e].done) return fe[e].id;
  return "";
}
function sc(e) {
  for (const t of fe)
    if (!t.done)
      switch (e.event_type) {
        case "error":
          t.errorCount++;
          break;
        case "console":
          e.console_level === "error" && t.errorCount++;
          break;
        case "resource":
          t.resourceCount++;
          break;
        case "long_task":
          t.longTaskCount++;
          break;
      }
}
function ac(e, t) {
  const n = [];
  return t && n.push("rage_click"), e.deadCandidate && !e.hadActivity && n.push("dead_click"), e.errorCount > 0 && n.push("error_click"), n;
}
function Yr(e, t, n = 1) {
  if (!rn) return;
  const r = ac(e, t), o = t ? "rage_click" : r.includes("dead_click") ? "dead_click" : r.includes("error_click") ? "error_click" : "click", i = {
    event_type: "action",
    timestamp: new Date(e.startMs).toISOString(),
    action_id: e.id,
    action_type: o,
    action_target: e.target,
    action_selector: e.selector,
    action_text: e.text,
    action_name: e.target,
    action_frustration_types: r.join(","),
    is_frustration: r.length > 0 ? 1 : 0,
    action_loading_time_ms: Math.round(e.loadingTimeMs),
    action_error_count: e.errorCount,
    action_resource_count: e.resourceCount,
    action_long_task_count: e.longTaskCount,
    action_click_count: n,
    view_id: e.viewId,
    view_url_path: e.viewPath,
    click_x: e.x,
    click_y: e.y,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight
  };
  rn(i);
}
function Bn() {
  const e = Q;
  if (Q = null, !e) return;
  e.timer && clearTimeout(e.timer);
  const t = () => e.clicks.every((o) => o.done), n = () => {
    if (e.clicks.length >= rc) {
      const o = e.clicks[0];
      for (const i of e.clicks.slice(1))
        o.errorCount += i.errorCount, o.resourceCount += i.resourceCount, o.longTaskCount += i.longTaskCount, o.hadActivity = o.hadActivity || i.hadActivity;
      Yr(o, !0, e.clicks.length);
    } else
      for (const o of e.clicks) Yr(o, !1);
    for (const o of e.clicks) {
      const i = fe.indexOf(o);
      i >= 0 && fe.splice(i, 1);
    }
  };
  if (t()) {
    n();
    return;
  }
  const r = setInterval(() => {
    t() && (clearInterval(r), n());
  }, 50);
  pr.push(() => clearInterval(r));
}
function cc(e) {
  var n;
  const t = ((n = e.tagName) == null ? void 0 : n.toLowerCase()) ?? "";
  return t === "input" || t === "textarea" || t === "select" || t === "label" || e.isContentEditable ? !0 : typeof e.closest == "function" && e.closest("label") !== null;
}
function uc() {
  var e;
  try {
    const t = (e = window.getSelection) == null ? void 0 : e.call(window);
    return !!t && !t.isCollapsed && t.toString().length > 0;
  } catch {
    return !1;
  }
}
function lc(e) {
  const t = e.target;
  if (!t || typeof t.tagName != "string") return;
  const n = mc(t), r = t.tagName.toLowerCase(), o = dc(t), i = o === null && _s(t), s = o ?? (i ? "" : (t.textContent ?? "").trim().slice(0, 200)), c = o !== null ? `${r}[${o}]` : pc(t, r, s, i), a = {
    id: Ke(),
    startMs: Date.now(),
    viewId: hi(),
    viewPath: Ja(),
    target: c,
    selector: n,
    text: s,
    x: e.clientX,
    y: e.clientY,
    deadCandidate: !cc(t) && !uc(),
    errorCount: 0,
    resourceCount: 0,
    longTaskCount: 0,
    loadingTimeMs: 0,
    hadActivity: !1,
    done: !1
  };
  fe.push(a), pr.push(
    ii(a.startMs, (u) => {
      a.hadActivity = u.hadActivity, a.loadingTimeMs = u.endMs !== null && !u.timedOut ? Math.max(0, u.endMs - a.startMs) : 0, a.done = !0;
    })
  ), Q && Q.selector === n ? Q.clicks.push(a) : (Bn(), Q = { selector: n, clicks: [a], timer: null });
  const l = Q;
  l.timer && clearTimeout(l.timer), l.timer = setTimeout(() => {
    Q === l && Bn();
  }, oc);
}
function fc(e) {
  if (typeof document > "u") return;
  gi(), rn = e;
  const t = (n) => lc(n);
  document.addEventListener("click", t, { capture: !0, passive: !0 }), Bt = () => document.removeEventListener("click", t, {
    capture: !0
  });
}
function gi() {
  Q && Bn();
  for (const e of pr.splice(0)) e();
  fe.splice(0), Bt && Bt(), Bt = null, rn = null;
}
const Wr = "data-oodle-action-name";
function dc(e) {
  var t;
  try {
    const n = typeof e.closest == "function" ? e.closest(`[${Wr}]`) : null, r = (t = n == null ? void 0 : n.getAttribute(Wr)) == null ? void 0 : t.trim();
    return r ? r.slice(0, 200) : null;
  } catch {
    return null;
  }
}
function pc(e, t, n, r = !1) {
  if (r) return Jr(e, t);
  const o = e.getAttribute("aria-label");
  if (o) return `${t}[${o}]`;
  const i = e.getAttribute("title");
  if (i) return `${t}[${i}]`;
  const s = n.split(`
`)[0].trim();
  return s && s.length <= 80 ? `${t}[${s}]` : Jr(e, t);
}
function Jr(e, t) {
  if (e.id) return `${t}#${e.id}`;
  const n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
function mc(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
const Fe = "[REDACTED]", hc = /token|secret|auth|cookie|passw|api-?key|access-?key|session|csrf|xsrf|client-?ip|real-?ip|connecting-ip|(^|-)forwarded(-for)?$/, yc = /passw|secret|token(?!s|count|limit|usage|type)|apikey|accesskey|privatekey|authorization|credential|cardnumber|creditcard|cardnum|^pan$|cvv|cvc|securitycode|^ssn$|socialsecurity|^ip$|ipaddr|clientip|remoteaddr|remoteip|^ipv[46]$/;
function _i(e, t, n) {
  const r = /* @__PURE__ */ new Set(), o = [];
  if (Array.isArray(n))
    for (const i of n)
      typeof i == "string" ? r.add(t(i)) : i instanceof RegExp && o.push(i);
  return (i) => {
    const s = t(i);
    if (e.test(s) || r.has(s)) return !0;
    for (const c of o)
      if (c.lastIndex = 0, c.test(i)) return !0;
    return !1;
  };
}
function vi(e) {
  return _i(
    hc,
    (t) => t.toLowerCase(),
    e
  );
}
function wi(e) {
  return _i(
    yc,
    (t) => t.toLowerCase().replace(/[-_.\s]/g, ""),
    e
  );
}
function gc(e) {
  let t = 0, n = !1;
  for (let r = e.length - 1; r >= 0; r--) {
    let o = e.charCodeAt(r) - 48;
    n && (o *= 2, o > 9 && (o -= 9)), t += o, n = !n;
  }
  return t % 10 === 0;
}
const _c = /\b\d(?:[ -]?\d){12,18}\b/g;
function vc(e) {
  return e.replace(_c, (t) => {
    const n = t.replace(/[ -]/g, "");
    return n.length >= 13 && n.length <= 19 && n[0] >= "2" && n[0] <= "6" && gc(n) ? Fe : t;
  });
}
function qn(e, t, n) {
  if (n > 32 || e === null || typeof e != "object")
    return;
  let r = !1;
  if (Array.isArray(e)) {
    const i = e.map((s) => {
      const c = qn(s, t, n + 1);
      return c === void 0 ? s : (r = !0, c);
    });
    return r ? i : void 0;
  }
  const o = /* @__PURE__ */ Object.create(null);
  for (const [i, s] of Object.entries(e)) {
    if (t(i) && s !== null && s !== "") {
      o[i] = Fe, r = !0;
      continue;
    }
    const c = qn(s, t, n + 1);
    c === void 0 ? o[i] = s : (o[i] = c, r = !0);
  }
  return r ? o : void 0;
}
const En = /"((?:[^"\\]|\\.){1,200})"\s*:\s*/g, wc = /^("(?:[^"\\]|\\.)*"|[^\s,}\]{["]+)/;
function Sc(e, t) {
  let n = "", r = 0;
  En.lastIndex = 0;
  let o;
  for (; (o = En.exec(e)) !== null; ) {
    if (!t(o[1])) continue;
    const i = o.index + o[0].length, s = e.slice(i);
    if (s[0] === "{" || s[0] === "[")
      return n + e.slice(r, i) + `"${Fe}"`;
    const c = wc.exec(s);
    if (!c)
      return s[0] === '"' ? n + e.slice(r, i) + `"${Fe}"` : n + e.slice(r);
    c[1] === '""' || c[1] === "null" || (n += e.slice(r, i) + `"${Fe}"`, r = i + c[1].length, En.lastIndex = r);
  }
  return n + e.slice(r);
}
function Ec(e) {
  return /^[\w.%+[\]-]+=[^&]*(&[\w.%+[\]-]+=[^&]*)*$/.test(e);
}
function Tc(e, t) {
  if (!e) return e;
  const n = e.trimStart();
  let r = e;
  if (n[0] === "{" || n[0] === "[") {
    let o, i = !0;
    try {
      o = JSON.parse(e);
    } catch {
      i = !1;
    }
    if (i) {
      const s = qn(o, t, 0);
      s !== void 0 && (r = JSON.stringify(s));
    } else
      r = Sc(e, t);
  } else if (Ec(n))
    try {
      const o = new URLSearchParams(e);
      let i = !1;
      if (o.forEach((s, c) => {
        t(c) && s && (i = !0);
      }), i) {
        const s = new URLSearchParams();
        o.forEach((c, a) => {
          s.append(a, t(a) && c ? Fe : c);
        }), r = s.toString();
      }
    } catch {
    }
  return vc(r);
}
const bc = 50, Kr = 200, Gr = /* @__PURE__ */ new Map();
function Ac(e) {
  let t = Gr.get(e);
  return t || (t = {
    tokens: Kr,
    lastRefill: Date.now(),
    rate: bc,
    burst: Kr
  }, Gr.set(e, t)), t;
}
function kc(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function Cc(e) {
  const t = Ac(e);
  return kc(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let $n = null, zn = null;
function Zu(e, t) {
  $n = e, zn = t;
}
const Ic = "00000000000000000000000000000000";
function Si() {
  if (!$n || !zn) return null;
  try {
    const e = $n.getSpan(
      zn.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === Ic ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const Qr = 100, Lc = 10, Zr = 5e3, Mc = 3, Rc = 0;
function Oc(e, t = () => Date.now()) {
  const n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  function o() {
    n.clear(), r.clear();
  }
  function i(a) {
    const l = r.get(a);
    if (l !== void 0) return l;
    let u = a;
    const f = e();
    if (f)
      try {
        const h = f.getNode(a), m = h && h.closest ? h.closest("svg") : null;
        if (m) {
          const g = f.getId(m);
          g !== -1 && (u = g);
        }
      } catch {
      }
    return r.size < Zr && r.set(a, u), u;
  }
  function s(a) {
    const l = i(a), u = t();
    let f = n.get(l);
    if (!f) {
      if (n.size >= Zr)
        return !0;
      f = {
        tokens: Qr,
        lastRefillMs: u
      }, n.set(l, f);
    }
    const h = (u - f.lastRefillMs) / 1e3;
    return h > 0 && (f.tokens = Math.min(
      Qr,
      f.tokens + h * Lc
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function c(a) {
    var g, _, k;
    if (a.type !== Mc)
      return { event: a, dropped: 0 };
    const l = a.data;
    if (!l || l.source !== Rc || !l.attributes || l.attributes.length === 0)
      return { event: a, dropped: 0 };
    const u = l.attributes.length, f = l.attributes.filter(
      (C) => s(C.id)
    ), h = u - f.length;
    return h === 0 ? { event: a, dropped: 0 } : (l.attributes = f, {
      event: f.length > 0 || (((g = l.adds) == null ? void 0 : g.length) ?? 0) > 0 || (((_ = l.removes) == null ? void 0 : _.length) ?? 0) > 0 || (((k = l.texts) == null ? void 0 : k.length) ?? 0) > 0 ? a : null,
      dropped: h
    });
  }
  return { throttle: c, reset: o };
}
const eo = "replay", xc = 200, Pc = 6e4, Uc = 5e3, Nc = 8e6, Ei = 2, Dc = 3, Hc = 4, to = 3e3, Ti = 5e3, Fc = 3, Bc = 3e4, qc = 5e3, $c = 16, zc = 100, jc = 4, Vc = 30, no = 32, ro = 250, Xc = 36e4;
function Yc() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const Wc = 3e5, Jc = 9e5, Kc = 1e3;
let Se = null, ne = null, et = null, Xe = [], Ye = 0, ge = "", bi = "", mr = !1, Ai = 0, Tn = "", Z = 0, Ee = Date.now(), he = !1, Ct = 0, _e = null, We = !1, Be = null, ki = 0, K = [], Y = 0, qe = null, ue = null, qt = 0;
function Je() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const hr = Oc(
  () => (Se == null ? void 0 : Se.mirror) ?? null
);
let $e = null, ve = null, ze = !1, It = !1, yr = 0, $t = null, ee = null;
function Gc() {
  qe && (clearTimeout(qe), qe = null), ue && (ue(), ue = null);
}
function jn(e, t) {
  Gc();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    Vc
  ) : null, r = e ? Je() + (n ?? jc) : Number.POSITIVE_INFINITY;
  for (; Y < K.length; ) {
    const o = Math.min(
      Y + no,
      K.length
    );
    for (; Y < o; )
      Vn(
        K[Y++]
      );
    if (Je() >= r) break;
  }
  if (Y >= K.length) {
    K = [], Y = 0;
    return;
  }
  Y >= no * 8 && (K = K.slice(Y), Y = 0), Ci();
}
function on() {
  jn(!1);
}
function Ci() {
  if (!qe) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          ue = null, jn(!0, t);
        },
        { timeout: zc }
      );
      ue = () => cancelIdleCallback(e);
    }
    qe = setTimeout(() => {
      qe = null, ue && (ue(), ue = null), jn(!0);
    }, $c);
  }
}
function Lt(e = !1) {
  if (We = !0, Be) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - Ee, r = Math.max(
      0,
      Ti - n
    ), o = Date.now() - ki, i = Math.max(
      0,
      qc - o
    );
    t = Math.max(
      r,
      i
    );
  }
  Be = setTimeout(() => {
    Be = null, Qc();
  }, t);
}
function Qc() {
  if (!We || !Se || !ne || he) return;
  Ct++;
  const e = qt > ro ? 1 : Fc;
  if (Ct > e) {
    tu();
    return;
  }
  ki = Date.now(), Z = 0, Ee = Date.now();
  try {
    const t = Je();
    Se.takeFullSnapshot(!0), qt = Je() - t, x("replay_rebases"), qt > ro && x(
      "replay_expensive_snapshots"
    );
  } catch {
    Rt(), Mt();
  }
}
function oo() {
  x("replay_events_dropped");
}
function Ii() {
  if (ge) return !1;
  ge = oe(), Ai = xs(), bi = Rs() ? "" : Oo();
  const e = Tn !== "" && Tn !== ge;
  return Tn = ge, e;
}
function Nt() {
  if (eu(), Xe.length === 0) return;
  if (un(eo)) {
    Zc(), Li();
    return;
  }
  Ii();
  const e = ge, t = Ai, n = bi, r = Xe.splice(0), o = Ye;
  Ye = 0, ge = "", mr = !0, sr(
    eo,
    {
      session_id: e,
      // Segments are keyed by tab: tabs share a session. A tab
      // that adopted a session from an older SDK sends none, so
      // its segments stay where the old ones are.
      ...n ? { tab_id: n } : {},
      segment_index: t,
      events: r
    },
    o
  );
}
function Zc() {
  Ye <= Nc || (x(
    "replay_events_dropped",
    Xe.length
  ), Xe.length = 0, Ye = 0, Lt());
}
let je = null;
function eu() {
  je && (clearTimeout(je), je = null);
}
function Li() {
  if (je) return;
  const e = O().replayFlushIntervalMs ?? Uc;
  je = setTimeout(() => {
    je = null, Nt();
  }, e);
}
function Vn(e) {
  !ge && !oe() || (Ii() && e.type !== Ei && Lt(!0), Xe.push(e), Ye += Vt(e), Xe.length >= xc || Ye >= Pc ? Nt() : Li());
}
function tu() {
  he = !0, x("replay_overload_pauses"), Rt(), _e && clearTimeout(_e), _e = setTimeout(() => {
    _e = null, he = !1, Ct = 0, Z = 0, Ee = Date.now(), !ze && !It && ee && Mt();
  }, Bc);
}
function nu(e) {
  if (he) return;
  if (e.type === Ei) {
    on(), We = !1, Z = 0, Ee = Date.now(), Vn(e);
    return;
  }
  if (e.type === Hc) {
    const r = e.data;
    typeof r.href == "string" && (r.href = os(r.href));
  }
  if (e.type !== Dc) {
    on(), Vn(e);
    return;
  }
  if (We) {
    oo(), Lt();
    return;
  }
  const t = Date.now();
  t - Ee > Ti && (Z <= to && (Ct = 0), Z = 0, Ee = t);
  const n = hr.throttle(e);
  if (n.dropped > 0 && x(
    "replay_attributes_throttled",
    n.dropped
  ), !!n.event) {
    if (Z++, Z > to) {
      oo(), Lt();
      return;
    }
    K.push(n.event), Ci();
  }
}
async function Mt() {
  if (ee && !he && !ne)
    return et || (et = ru().finally(
      () => {
        et = null;
      }
    ), et);
}
async function ru() {
  if (!ee) return;
  const { record: e } = await import("./rrweb-SbAupvcM.js");
  !ee || he || ne || (Se = e, We = !1, Z = 0, Ee = Date.now(), hr.reset(), ne = e({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: Yc() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: Xc,
    /**
     * rrweb runs this between `lock()` and `unlock()`
     * of its mutation buffers with no `try/finally`, so
     * an exception escaping here leaves the buffer
     * locked and every later DOM mutation is silently
     * discarded. Recording looks alive (mouse and
     * scroll still arrive) while the replay stays
     * frozen on the last snapshot.
     */
    emit(t) {
      try {
        nu(t);
      } catch {
        x("replay_emit_errors");
      }
    },
    /**
     * Applies the same containment to rrweb's own
     * observers, which are otherwise wrapped only when
     * a handler is supplied.
     */
    errorHandler: () => !0,
    maskAllInputs: ee.maskAllInputs,
    maskInputOptions: ee.maskInputOptions,
    maskTextFn: ee.maskTextContent ? () => "•••" : void 0,
    blockSelector: To,
    maskTextSelector: bo,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => Nt(), 200));
}
function Rt() {
  ne && (ne(), ne = null), Be && (clearTimeout(Be), Be = null), We = !1, on(), Nt();
}
function ou() {
  const e = O(), t = e.replayIdlePauseMs ?? Wc, n = e.replayIdleExpireMs ?? Jc;
  $e && clearTimeout($e), ve && (clearTimeout(ve), ve = null), $e = setTimeout(() => {
    ze = !0, Rt();
  }, t), ve = setTimeout(() => {
    It = !0, Rt();
  }, n);
}
function zt() {
  yr = Je(), ou();
}
function iu() {
  if (It) {
    if (!Po()) return;
    It = !1, ze = !1, Mt(), zt();
    return;
  }
  if (ze) {
    ze = !1, Mt(), zt();
    return;
  }
  Je() - yr >= Kc && zt();
}
function su() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => iu(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  $t = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function au() {
  $t && ($t(), $t = null), $e && (clearTimeout($e), $e = null), ve && (clearTimeout(ve), ve = null);
}
function cu() {
  on(), Nt();
}
async function uu() {
  const t = O().privacyLevel ?? "mask-user-input";
  let n = {}, r = !1, o = !0;
  t === "mask" ? (r = !0, n = {
    password: !0,
    email: !0,
    text: !0,
    tel: !0,
    url: !0,
    search: !0,
    number: !0
  }) : t === "mask-user-input" ? n = {
    password: !0,
    email: !0
  } : o = !1, ee = {
    privacyLevel: t,
    maskAllInputs: o,
    maskInputOptions: n,
    maskTextContent: r
  }, Sa(() => {
    ne && Lt();
  }), ei(cu), await Mt(), su(), zt();
}
function lu() {
  return ne !== null && !he;
}
function fu() {
  return mr;
}
function du() {
  Rt(), au(), ei(null), _e && (clearTimeout(_e), _e = null), ze = !1, It = !1, yr = 0, he = !1, mr = !1, Ct = 0, Z = 0, qt = 0, K = [], Y = 0, hr.reset(), ee = null, Se = null;
}
let H = [], G = null;
const pu = [
  "error",
  "action",
  "console",
  "resource"
];
function mu(e) {
  return pu.includes(e) && (un(e) || !Cc(e)) ? (x("events_rate_limited"), !0) : !1;
}
function Mi(e, t) {
  const n = e.origin + le(e.pathname);
  if (!Array.isArray(t) || t.length === 0 || !e.search)
    return n;
  const r = new URLSearchParams(e.search), o = new URLSearchParams();
  r.forEach((s, c) => {
    t.includes(c) && o.append(c, s);
  });
  const i = o.toString();
  return i ? n + "?" + i : n;
}
function hu() {
  if (!G) {
    const e = navigator.userAgent;
    G = {
      device_type: Vu(e),
      browser_name: Xu(e),
      browser_version: Yu(e),
      os_name: Wu(e),
      os_version: Ju(e),
      user_agent: e,
      language: navigator.language
    };
  }
}
function yu() {
  const e = navigator.connection;
  return typeof (e == null ? void 0 : e.effectiveType) == "string" ? e.effectiveType : "";
}
function Ri(e) {
  hu();
  const t = Us(), n = Ra(), r = O(), o = e ?? oe(), i = {
    event_id: Ke(),
    session_id: o,
    tab_id: Oo(),
    view_id: hi(),
    action_id: ic(),
    ...cs(
      Ho(),
      Ds(),
      Hs()
    ),
    user_status: Fs(),
    service: r.service,
    env: r.env ?? "",
    version: r.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: Mi(
      window.location,
      r.viewUrlQueryParams
    ),
    view_url_host: window.location.hostname,
    view_url_path: le(window.location.pathname),
    referrer_url: is(document.referrer),
    device_type: G.device_type,
    browser_name: G.browser_name,
    browser_version: G.browser_version,
    os_name: G.os_name,
    os_version: G.os_version,
    user_agent: as() ? G.user_agent : "",
    language: G.language,
    session_view_count: t.viewCount,
    session_error_count: t.errorCount,
    session_action_count: t.actionCount,
    replay_id: lu() && fu() ? o : ""
  };
  return Object.keys(n).length > 0 && (i.feature_flags = n), i;
}
function gu(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const Oi = "events", _u = ["session_id", "event_type", "timestamp"];
let io = !1;
function xi(e) {
  const t = O().beforeSend;
  if (typeof t != "function") return e;
  const n = {};
  for (const r of _u) n[r] = e[r];
  try {
    const r = t(e);
    if (r === null || r === !1) return null;
    if (qi(r))
      throw new Error("it returned a promise; it must be synchronous");
    return { ...r && typeof r == "object" ? r : e, ...n };
  } catch (r) {
    return io || (io = !0, Wn(
      `beforeSend failed. Events are dropped until it is fixed: ${String(r)}`
    )), null;
  }
}
function Pi(e) {
  Os() && (e.session_is_new = 1);
}
function N(e) {
  if (!oe() || !xo() || un("events")) return;
  nc();
  const t = e(), n = t.event_type;
  if (mu(n)) return;
  n === "resource" && xu(t), Do(n), Ka(t), sc(t);
  const r = { ...Ri(), ...t };
  Pi(r);
  const o = xi(r);
  o && sr(Oi, o);
}
function gr(e) {
  gu(
    () => N(e)
  );
}
function vu(e, t) {
  if (!xo() || un("events")) return;
  e.view_update_seq === 1 && Do("view");
  const n = {
    ...Ri(t),
    ...e,
    action_id: "",
    connection_type: yu(),
    screen_width: typeof screen < "u" ? screen.width : 0,
    screen_height: typeof screen < "u" ? screen.height : 0
  };
  e.view_update_seq === 1 && (n.view_is_new = 1), t === oe() && Pi(n);
  const r = xi(n);
  r && ka(
    Oi,
    "view:" + String(e.view_id),
    r,
    (o, i) => {
      const s = { ...i }, c = o;
      return c.view_is_new === 1 && (s.view_is_new = 1), c.session_is_new === 1 && (s.session_is_new = 1), s;
    }
  );
}
function wu(e) {
  N(() => e);
}
function Su() {
  tc(
    vu,
    (e) => Mi(e, O().viewUrlQueryParams)
  ), fc(wu), Eu(), ku(), Lu(), Fu(), Bu(), qu(), $u();
}
function Eu() {
  const e = (n) => {
    N(() => {
      var i, s, c;
      const r = n.message ?? "", o = typeof ((i = n.error) == null ? void 0 : i.message) == "string" ? n.error.message : r;
      return {
        event_type: "error",
        error_message: wt(r),
        error_type: ((s = n.error) == null ? void 0 : s.name) ?? "Error",
        error_stack: Gn(
          ((c = n.error) == null ? void 0 : c.stack) ?? "",
          o
        ),
        error_source: "source",
        error_handling: "unhandled"
      };
    });
  }, t = (n) => Ui(n.reason);
  window.addEventListener("error", e), window.addEventListener(
    "unhandledrejection",
    t
  ), Xn = !0, H.push(() => {
    window.removeEventListener("error", e), window.removeEventListener(
      "unhandledrejection",
      t
    ), Xn = !1;
  });
}
let Xn = !1;
const so = /* @__PURE__ */ new WeakSet();
function Ui(e) {
  if (e !== null && typeof e == "object") {
    if (so.has(e)) return;
    so.add(e);
  }
  N(() => {
    const t = (e == null ? void 0 : e.message) ?? String(e);
    return {
      event_type: "error",
      error_message: wt(t),
      error_type: (e == null ? void 0 : e.name) ?? "UnhandledRejection",
      error_stack: Gn((e == null ? void 0 : e.stack) ?? "", t),
      error_source: "promise",
      error_handling: "unhandled"
    };
  });
}
let ao = !1;
function el() {
  const e = globalThis.Zone;
  if (ao || !e || typeof e.__symbol__ != "function")
    return;
  ao = !0;
  const t = e.__symbol__("unhandledPromiseRejectionHandler"), n = e[t];
  e[t] = function(r) {
    if (Xn)
      try {
        Ui(
          r && typeof r == "object" && "rejection" in r && "promise" in r ? r.rejection : r
        );
      } catch {
      }
    if (typeof n == "function")
      return n.call(this, r);
  };
}
function Ni(e) {
  return e instanceof Error || typeof e == "object" && e !== null && typeof e.message == "string" && typeof e.name == "string" && "stack" in e;
}
const Ve = 8192;
function Tu(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${Ve} bytes omitted]`;
}
function bu(e) {
  if (typeof e == "string") return e;
  if (Ni(e))
    return e.message ? `${e.name}: ${e.message}` : e.name;
  if (Vt(
    e,
    Ve + 1
  ) > Ve)
    return Tu(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function Au(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= Ve) break;
    t && (t += " "), t += bu(n);
  }
  return t.length > Ve ? t.slice(0, Ve) + "… [truncated]" : t;
}
function ku() {
  for (const e of ss()) {
    const t = console[e], n = (...r) => {
      try {
        const o = wt(Au(r)), i = e === "error" ? r.find(Ni) : void 0;
        N(() => {
          const s = {
            event_type: "console",
            console_level: e,
            console_message: o
          };
          return i && (s.error_type = i.name, s.error_message = wt(i.message), s.error_stack = Gn(
            i.stack ?? "",
            i.message
          ), s.error_source = "console", s.error_handling = "handled"), s;
        });
      } catch {
      }
      t.apply(console, r);
    };
    n[So] = t, console[e] = n, H.push(() => {
      console[e] = t;
    });
  }
}
const Yn = "oodle_rum_tab_hidden";
function co(e) {
  try {
    e ? sessionStorage.setItem(Yn, "1") : sessionStorage.removeItem(Yn);
  } catch {
  }
}
function Cu() {
  try {
    return sessionStorage.getItem(Yn) === "1";
  } catch {
    return !1;
  }
}
function Iu() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && Cu() && (co(!1), N(() => ({
    event_type: "visibility",
    action_type: "tab_visible"
  })));
  let e = document.visibilityState === "hidden";
  const t = () => {
    const n = document.visibilityState === "hidden";
    n !== e && (e = n, co(n), N(() => ({
      event_type: "visibility",
      action_type: n ? "tab_hidden" : "tab_visible"
    })), n || re());
  };
  document.addEventListener(
    "visibilitychange",
    t
  ), H.push(() => {
    document.removeEventListener(
      "visibilitychange",
      t
    );
  });
}
function _r(e) {
  const t = O().endpoint;
  return e.startsWith(t);
}
function Lu() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || _r(r.name))
          continue;
        const i = vt(r.name), s = Di(r), c = Mu(o, r.name);
        gr(
          () => ({
            event_type: "resource",
            resource_url: i,
            resource_method: "",
            resource_duration_ms: Math.round(r.duration),
            resource_size: r.transferSize ?? 0,
            resource_type: c,
            resource_status: r.responseStatus ?? 0,
            ...s
          })
        );
      }
    }
  );
  if (e.observe({
    type: "resource",
    buffered: !0
  }), H.push(() => e.disconnect()), typeof performance < "u") {
    const t = () => {
      performance.clearResourceTimings();
    };
    performance.addEventListener(
      "resourcetimingbufferfull",
      t
    ), H.push(() => {
      performance.removeEventListener(
        "resourcetimingbufferfull",
        t
      );
    });
  }
}
function Mu(e, t) {
  var o;
  if (e === "xmlhttprequest") return "xhr";
  if (e === "fetch") return "fetch";
  if (e === "beacon") return "beacon";
  let n = t;
  try {
    n = new URL(t, "http://x").pathname;
  } catch {
  }
  const r = ((o = n.split(".").pop()) == null ? void 0 : o.toLowerCase()) ?? "";
  return ["woff", "woff2", "ttf", "otf", "eot"].includes(r) ? "font" : ["png", "jpg", "jpeg", "gif", "svg", "webp", "avif", "ico", "bmp"].includes(r) ? "image" : ["mp4", "webm", "mp3", "ogg", "wav", "m4a"].includes(r) ? "media" : ["js", "mjs", "cjs"].includes(r) ? "js" : r === "css" ? "css" : e === "script" ? "js" : e === "img" || e === "image" ? "image" : e === "video" || e === "audio" ? "media" : e === "link" || e === "css" ? "css" : e === "navigation" || e === "iframe" ? "document" : "other";
}
function Di(e) {
  const t = (n, r) => n > 0 && r > 0 && r >= n ? Math.round(r - n) : 0;
  return {
    resource_redirect_ms: t(e.redirectStart, e.redirectEnd),
    resource_dns_ms: t(e.domainLookupStart, e.domainLookupEnd),
    resource_connect_ms: t(e.connectStart, e.connectEnd),
    resource_ssl_ms: t(e.secureConnectionStart, e.connectEnd),
    resource_first_byte_ms: t(e.requestStart, e.responseStart),
    resource_download_ms: t(e.responseStart, e.responseEnd),
    resource_start_ms: Math.round(e.startTime),
    resource_encoded_size: e.encodedBodySize ?? 0,
    resource_decoded_size: e.decodedBodySize ?? 0,
    resource_render_blocking: e.renderBlockingStatus === "blocking" ? 1 : 0
  };
}
function Hi(e, t) {
  try {
    const n = performance.getEntriesByName(
      Fi(e),
      "resource"
    );
    for (let r = n.length - 1; r >= 0; r--) {
      const o = n[r];
      if (o.startTime >= t - 2)
        return {
          ...Di(o),
          resource_size: o.transferSize ?? 0
        };
    }
  } catch {
  }
  return {};
}
function sn(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function Fi(e) {
  try {
    return new URL(e, location.href).href;
  } catch {
    return e;
  }
}
function bn(e, t, n) {
  return n.some(
    (r) => typeof r == "string" ? e.startsWith(r) || t.startsWith(r) : r.test(e) || r.test(t)
  );
}
function Bi(e) {
  const t = Fi(e), n = O();
  let r = !1;
  const o = n.allowedTracingUrls;
  o && o.length > 0 && (r = bn(
    t,
    e,
    o
  ));
  let i = null;
  const s = n.forwardNetworkBodies;
  s && bn(
    t,
    e,
    s.urls
  ) && (i = s);
  let c = !1;
  const a = n.forwardNetworkHeaders;
  return a && (c = bn(
    t,
    e,
    a.urls
  )), {
    resolved: t,
    trace: r,
    bodyCfg: i,
    captureHeaders: c
  };
}
let uo = null, lo = vi(void 0);
function _t(e) {
  const t = O().redactHeaders;
  return t !== uo && (uo = t, lo = vi(t)), lo(e);
}
function Ru(e) {
  const t = {};
  for (const n of Object.keys(e)) {
    const r = n.toLowerCase();
    _t(r) || (t[r] = e[n]);
  }
  return t;
}
const fo = [
  "request_headers",
  "response_headers",
  "request_body",
  "response_body"
];
let po = !1;
function qi(e) {
  return !!e && (typeof e == "object" || typeof e == "function") && typeof e.then == "function";
}
function mo(e) {
  if (!(typeof e != "string" || !e))
    try {
      const t = JSON.parse(e);
      return t && typeof t == "object" ? t : void 0;
    } catch {
      return;
    }
}
function ho(e) {
  if (!e || typeof e != "object") return "";
  const t = {};
  for (const [n, r] of Object.entries(e))
    r != null && (t[n.toLowerCase()] = String(r));
  return Object.keys(t).length > 0 ? JSON.stringify(t) : "";
}
let yo = null, go = wi(void 0);
function Ou() {
  const e = O().redactBodyKeys;
  return e !== yo && (yo = e, go = wi(e)), go;
}
function xu(e) {
  var c;
  if (!fo.some((a) => e[a])) return;
  for (const a of ["request_body", "response_body"])
    typeof e[a] == "string" && e[a] && (e[a] = Tc(e[a], Ou()));
  const t = O().beforeSendNetwork;
  if (typeof t != "function") return;
  const n = {
    url: String(e.resource_url ?? ""),
    method: String(e.resource_method ?? ""),
    status: Number(e.resource_status ?? 0),
    requestHeaders: mo(e.request_headers),
    responseHeaders: mo(e.response_headers),
    requestBody: typeof e.request_body == "string" ? e.request_body : void 0,
    responseBody: typeof e.response_body == "string" ? e.response_body : void 0
  };
  let r;
  try {
    const a = t(n);
    if (qi(a))
      throw new Error("it returned a promise; it must be synchronous");
    r = a === void 0 ? n : a;
  } catch (a) {
    po || (po = !0, Wn(
      `beforeSendNetwork failed. Captured headers and bodies are dropped until it is fixed: ${String(a)}`
    )), r = null;
  }
  for (const a of fo) delete e[a];
  if (!r || typeof r != "object") return;
  const o = ((c = O().forwardNetworkBodies) == null ? void 0 : c.maxBodySize) ?? 65536, i = ho(r.requestHeaders), s = ho(r.responseHeaders);
  i && (e.request_headers = i), s && (e.response_headers = s), typeof r.requestBody == "string" && r.requestBody && (e.request_body = de(r.requestBody, o)), typeof r.responseBody == "string" && r.responseBody && (e.response_body = de(r.responseBody, o));
}
function $i(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      _t(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      _t(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      _t(r) || (t[r] = e[n]);
    }
  return t;
}
function Pu(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    _t(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function de(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function Uu(e, t) {
  var i;
  const n = (i = e.body) == null ? void 0 : i.getReader();
  if (!n)
    return (await e.text()).slice(0, t);
  const r = new TextDecoder();
  let o = "";
  for (; o.length < t; ) {
    const { done: s, value: c } = await n.read();
    if (s) break;
    o += r.decode(c, {
      stream: !0
    });
  }
  return n.cancel(), o.slice(0, t);
}
function Nu(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function Du(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      $i(
        e
      )
    );
  } catch {
    return "";
  }
}
function _o(e) {
  try {
    return JSON.stringify(
      $i(e)
    );
  } catch {
    return "";
  }
}
function zi(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function Hu(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: de(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: de(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : zi(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => de(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function ji(e, t, n) {
  const r = function(o, i) {
    const s = Nu(o);
    if (_r(s))
      return t.apply(e, [
        o,
        i
      ]);
    const c = zi(o), a = ((i == null ? void 0 : i.method) ?? (c ? o.method : "GET")).toUpperCase(), l = performance.now(), u = Bi(s);
    ri();
    let f = !1;
    const h = () => {
      f || (f = !0, oi());
    };
    let m = "", g = "";
    if (n.injectTracing) {
      const E = Si();
      if (E)
        m = E.traceId, g = E.spanId;
      else if (u.trace) {
        m = sn(16), g = sn(8);
        const A = new Headers(
          (i == null ? void 0 : i.headers) ?? {}
        );
        A.set(
          "traceparent",
          `00-${m}-${g}-01`
        ), i = { ...i, headers: A };
      }
    }
    let _ = "", k = null;
    if (u.bodyCfg) {
      const E = u.bodyCfg.maxBodySize ?? 65536, A = Hu(
        i,
        o,
        E
      );
      _ = A.sync, k = A.asyncP;
    }
    let C = "";
    return u.captureHeaders && (i != null && i.headers ? C = Du(
      i.headers
    ) : c && (C = _o(
      o.headers
    ))), t.apply(e, [o, i]).then((E) => {
      h();
      const A = E.status, L = Math.round(
        performance.now() - l
      );
      let y = "";
      u.captureHeaders && (y = _o(
        E.headers
      ));
      const v = (p) => {
        const d = {
          event_type: "resource",
          resource_url: vt(s),
          resource_method: a,
          resource_status: A,
          resource_duration_ms: L,
          resource_size: 0,
          resource_type: "fetch",
          ...Hi(s, l)
        };
        return m && (d.trace_id = m, d.span_id = g), p && (d.request_body = p), C && (d.request_headers = C), y && (d.response_headers = y), d;
      }, w = k || Promise.resolve(_);
      if (u.bodyCfg) {
        const p = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          w,
          Uu(
            E.clone(),
            p
          ).catch(() => "")
        ]).then(([d, M]) => {
          N(() => {
            const W = v(d);
            return M && (W.response_body = M), W;
          });
        }).catch(() => {
          w.then((d) => {
            N(
              () => v(d)
            );
          });
        });
      } else
        w.then((p) => {
          N(() => v(p));
        });
      return E;
    }).catch((E) => {
      h();
      const A = Math.round(
        performance.now() - l
      );
      throw (k || Promise.resolve(_)).then((y) => {
        N(() => {
          const v = {
            event_type: "resource",
            resource_url: vt(s),
            resource_method: a,
            resource_status: 0,
            resource_duration_ms: A,
            resource_size: 0,
            resource_type: "fetch"
          };
          return m && (v.trace_id = m, v.span_id = g), y && (v.request_body = y), C && (v.request_headers = C), v;
        });
      }), E;
    });
  };
  return e.fetch = r, () => {
    e.fetch = t;
  };
}
function Vi(e, t, n) {
  const r = e.open, o = e.send, i = t;
  return e.open = function(s, c, a, l, u) {
    return this.__oodleMethod = s.toUpperCase(), this.__oodleUrl = typeof c == "string" ? c : c.href, this.__oodleReqHeaders = {}, r.call(
      this,
      s,
      c,
      a ?? !0,
      l,
      u
    );
  }, e.setRequestHeader = function(s, c) {
    const a = this.__oodleReqHeaders;
    return a && (a[s.toLowerCase()] = c), i.call(this, s, c);
  }, e.send = function(s) {
    const c = this.__oodleUrl ?? "";
    if (_r(c))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const a = Bi(c);
    let l = "", u = "";
    if (n.injectTracing) {
      const y = Si();
      y ? (l = y.traceId, u = y.spanId) : a.trace && (l = sn(16), u = sn(8), i.call(
        this,
        "traceparent",
        `00-${l}-${u}-01`
      ));
    }
    let f = "";
    if (a.bodyCfg && s) {
      const y = a.bodyCfg.maxBodySize ?? 65536;
      typeof s == "string" ? f = de(
        s,
        y
      ) : typeof URLSearchParams < "u" && s instanceof URLSearchParams && (f = de(
        s.toString(),
        y
      ));
    }
    let h = "";
    if (a.captureHeaders)
      try {
        const y = this.__oodleReqHeaders, v = y ? Ru(y) : {};
        Object.keys(v).length > 0 && (h = JSON.stringify(v));
      } catch {
      }
    const m = performance.now(), g = this;
    ri();
    const _ = l, k = u, C = f, E = a.bodyCfg, A = h, L = a.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        oi();
        const y = Math.round(
          performance.now() - m
        ), v = g.__oodleMethod ?? "GET";
        N(() => {
          const w = {
            event_type: "resource",
            resource_url: vt(c),
            resource_method: v,
            resource_status: g.status,
            resource_duration_ms: y,
            resource_size: 0,
            resource_type: "xhr",
            ...Hi(c, m)
          };
          if (_ && (w.trace_id = _, w.span_id = k), C && (w.request_body = C), E)
            try {
              const p = g.responseText ?? "";
              w.response_body = de(
                p,
                E.maxBodySize ?? 65536
              );
            } catch {
            }
          if (A && (w.request_headers = A), L)
            try {
              const p = g.getAllResponseHeaders();
              p && (w.response_headers = JSON.stringify(
                Pu(p)
              ));
            } catch {
            }
          return w;
        });
      }
    ), o.apply(this, [s]);
  }, () => {
    e.open = r, e.send = o, e.setRequestHeader = i;
  };
}
const Xi = {
  injectTracing: !0
}, vo = {
  injectTracing: !1
};
function Fu() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = ji(
    window,
    window.fetch,
    Xi
  );
  H.push(e);
}
function Bu() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = Vi(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    Xi
  );
  H.push(e);
}
const wo = /* @__PURE__ */ new WeakSet();
function An(e) {
  if (wo.has(e)) return;
  wo.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (ji(
        n,
        n.fetch,
        vo
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (Vi(
        r.prototype,
        r.prototype.setRequestHeader,
        vo
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), H.push(() => {
    e.removeEventListener("load", t);
  });
}
function qu() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach(An);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          r instanceof HTMLIFrameElement && An(r), r instanceof HTMLElement && r.childElementCount > 0 && r.querySelectorAll("iframe").forEach(An);
    }
  );
  e.observe(document.documentElement, {
    childList: !0,
    subtree: !0
  }), H.push(() => {
    e.disconnect();
  });
}
function $u() {
  if (!(typeof PerformanceObserver > "u") && !zu())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            gr(() => ({
              event_type: "long_task",
              long_task_duration_ms: r
            }));
          }
        }
      );
      e.observe({
        type: "longtask",
        buffered: !0
      }), H.push(
        () => e.disconnect()
      );
    } catch {
    }
}
function zu() {
  try {
    const e = new PerformanceObserver(
      (t) => {
        for (const n of t.getEntries()) {
          if (n.duration < 50) continue;
          const r = n, o = r.scripts ?? [], i = o.length > 0 ? o[0] : null, s = Math.round(
            n.duration
          ), c = Math.round(
            r.blockingDuration ?? 0
          ), a = (i == null ? void 0 : i.sourceURL) ?? "", l = (i == null ? void 0 : i.sourceFunctionName) ?? "", u = (i == null ? void 0 : i.invokerType) ?? "";
          gr(() => ({
            event_type: "long_task",
            long_task_duration_ms: s,
            long_task_blocking_ms: c,
            long_task_script_url: a,
            long_task_script_fn: l,
            long_task_invoker: u
          }));
        }
      }
    );
    return e.observe({
      type: "long-animation-frame",
      buffered: !0
    }), H.push(
      () => e.disconnect()
    ), !0;
  } catch {
    return !1;
  }
}
function ju(e, t) {
  N(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function Vu(e) {
  return /iPad|Tablet/i.test(e) || /Android/i.test(e) && !/Mobi/i.test(e) ? "tablet" : /Mobi|iPhone|iPod|Android/i.test(e) ? "mobile" : "desktop";
}
const Yi = [
  ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
  ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
  ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
  ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
  ["Safari", /Version\/([\d.]+).*Safari/]
];
function Xu(e) {
  for (const [t, n] of Yi) if (n.test(e)) return t;
  return e.includes("Safari") ? "Safari" : "Other";
}
function Yu(e) {
  for (const [, t] of Yi) {
    const n = e.match(t);
    if (n) return n[1];
  }
  return "";
}
function Wu(e) {
  return /iPhone|iPad|iPod/.test(e) ? "iOS" : e.includes("Android") ? "Android" : e.includes("CrOS") ? "Chrome OS" : e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : "Other";
}
function Ju(e) {
  let t = e.match(/OS (\d+[_.]\d+(?:[_.]\d+)?) like Mac OS X/);
  return t ? t[1].replace(/_/g, ".") : (t = e.match(/Android ([\d.]+)/), t || (t = e.match(/Windows NT ([\d.]+)/), t) ? t[1] : (t = e.match(/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/), t ? t[1].replace(/_/g, ".") : ""));
}
function Ku() {
  gi(), yi();
  for (const e of H)
    e();
  H = [];
}
let ye = !1;
const tl = {
  init(e) {
    ye || ws(e) && (qs(e.tags), Cs(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), ye = !0, Ln(), Iu(), Dr(), Ps(), Ys(), Ia(() => {
      Dr();
    }), e.sessionReplay !== !1 && Po() && uu(), Su(), e.openTelemetry && import("./tracing-DaxwHFsd.js").then(
      (t) => t.initOtelTracing(e)
    ).catch((t) => {
      console.warn(
        "[@oodle-ai/rum] Failed to init OpenTelemetry:",
        t
      );
    }));
  },
  // The methods below are safe to call whether or not
  // init() ran. Apps commonly gate init() on environment
  // (production only) while calling identify/trackEvent
  // unconditionally from shared code; those calls go
  // nowhere instead of throwing.
  //
  // setTags/identify/addFeatureFlag stay live even when
  // uninitialized, so state recorded before an init() that
  // comes later still applies once it does.
  setTags(e) {
    $s(e);
  },
  identify(e) {
    Ns(e);
  },
  trackEvent(e, t) {
    ye && ju(e, t);
  },
  addFeatureFlag(e, t) {
    Ma(e, t);
  },
  getSessionId() {
    return ye ? oe() : "";
  },
  getUserId() {
    return Ho();
  },
  flush() {
    ye && re();
  },
  stop() {
    ye && (du(), Ku(), Ws(), No(), re(!0), Oa(), La(), ye = !1);
  }
};
export {
  tl as O,
  Qu as a,
  el as c,
  Gu as r,
  Zu as s
};
