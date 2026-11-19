const Eo = "__oodleOriginal";
function Jn(e) {
  try {
    const t = console.warn;
    (t[Eo] ?? t).call(
      console,
      "[@oodle-ai/rum] " + e
    );
  } catch {
  }
}
const Ht = [
  "error",
  "warn"
];
function Ki() {
  return {
    patterns: [],
    maskFn: null,
    referrer: "path",
    consoleLevels: Ht,
    messages: "full",
    actionText: "full",
    userAgent: "full",
    queryStrings: "events",
    userInfo: "full",
    keepParams: []
  };
}
let b = Ki();
const gn = "/:redacted", Gi = 256, nt = /* @__PURE__ */ new Map();
let Cn = !1;
const Te = Jn;
function Ie(e, t, n, r, o) {
  return t === void 0 ? r : typeof t == "string" && n.includes(t) ? t : (Te(
    `${e} must be one of ${n.map((i) => `'${i}'`).join(", ")}. Using '${o}'.`
  ), o);
}
function Qi(e) {
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
function Zi(e) {
  if (e === void 0) return [];
  if (!Array.isArray(e))
    return Te(
      "urlPathPatterns must be an array of path patterns such as '/projects/:id'. It is ignored."
    ), [];
  const t = [];
  for (const n of e) {
    const r = Qi(n);
    r ? t.push(r) : Te(
      `urlPathPatterns: ${JSON.stringify(n)} is not a valid pattern. Patterns start with '/', use ':name' for one segment and may end in '/*'. It is ignored.`
    );
  }
  return t;
}
function es(e) {
  if (e === void 0) return Ht;
  if (!Array.isArray(e))
    return Te(
      "consoleLevels must be an array such as ['error']. Console capture is off."
    ), [];
  const t = Ht.filter(
    (n) => e.includes(n)
  );
  return e.some(
    (n) => !Ht.includes(n)
  ) && Te(
    "consoleLevels accepts only 'error' and 'warn'. Other values are ignored."
  ), t;
}
function ts(e) {
  nt.clear(), Cn = !1;
  const t = e.maskUrlPath;
  t !== void 0 && typeof t != "function" && Te("maskUrlPath must be a function. It is ignored."), b = {
    patterns: Zi(e.urlPathPatterns),
    maskFn: typeof t == "function" ? t : null,
    referrer: Ie(
      "referrerUrl",
      e.referrerUrl,
      ["path", "origin", "none"],
      "path",
      "none"
    ),
    consoleLevels: es(
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
function Kn() {
  return b.patterns.length > 0 || b.maskFn !== null;
}
function ns(e) {
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
function rs(e) {
  let t = b.patterns.length > 0 ? ns(e) : e;
  if (b.maskFn)
    try {
      const n = b.maskFn(t);
      t = typeof n == "string" ? n : gn;
    } catch (n) {
      Cn || (Cn = !0, Te(
        `maskUrlPath threw. Paths are sent as '${gn}' until it is fixed: ${String(n)}`
      )), t = gn;
    }
  return t;
}
function le(e) {
  if (!Kn()) return e;
  const t = nt.get(e);
  if (t !== void 0) return t;
  const n = rs(e);
  return nt.size >= Gi && nt.clear(), nt.set(e, n), n;
}
function os(e) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(e);
}
function St(e, t) {
  if (os(e)) {
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
function To(e) {
  return !Kn() || typeof e != "string" ? e : Gn(e, (t) => t.search + t.hash);
}
function el() {
  return Kn() || b.queryStrings === "all";
}
function is(e) {
  return b.queryStrings !== "all" ? To(e) : typeof e != "string" ? e : Gn(e, (t) => {
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
function tl(e) {
  return b.queryStrings !== "all" ? To(e) : typeof e != "string" ? e : Gn(e, () => "");
}
function Gn(e, t) {
  let n;
  try {
    n = new URL(e);
  } catch {
    return e;
  }
  return n.protocol !== "http:" && n.protocol !== "https:" ? e : n.origin + le(n.pathname) + t(n);
}
let br = null, Ar = "", kr = null;
function ss(e) {
  if (e === br && kr === b)
    return Ar;
  let t = "";
  if (e && b.referrer !== "none")
    try {
      const n = new URL(e);
      t = b.referrer === "origin" ? n.origin : n.origin + le(n.pathname);
    } catch {
      t = b.referrer === "origin" ? "" : e;
    }
  return br = e, Ar = t, kr = b, t;
}
function as() {
  return b.consoleLevels;
}
function cs() {
  return b.userAgent === "full";
}
function us(e, t, n) {
  switch (b.userInfo) {
    case "full":
      return { user_id: e, user_name: t, user_email: n };
    case "id":
      return { user_id: e, user_name: "", user_email: "" };
    default:
      return { user_id: "", user_name: "", user_email: "" };
  }
}
const ls = [
  [/(^|[^\w])'(?:[^'\\\n]|\\.){0,500}'/g, "$1'?'"],
  [/(^|[^\w])"(?:[^"\\\n]|\\.){0,500}"/g, '$1"?"'],
  [/(^|[^\w])`(?:[^`\\\n]|\\.){0,500}`/g, "$1`?`"]
], fs = /\bhttps?:\/\/[^\s'"`<>()\]]+/g, ds = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, ps = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, ms = /\b(?=[0-9a-fA-F]*\d)(?=[0-9a-fA-F]*[a-fA-F])[0-9a-fA-F]{16,}\b/g, hs = /\d{4,}/g, Cr = 8192;
function ys(e) {
  if (!e) return e;
  let t = e.length > Cr ? e.slice(0, Cr) + "… [truncated]" : e;
  t = t.replace(fs, (n) => St(n)), t.includes("@") && (t = t.replace(ds, "<email>"));
  for (const [n, r] of ls)
    t = t.replace(n, r);
  return t = t.replace(ps, "<id>"), t = t.replace(ms, "<id>"), t = t.replace(hs, "<n>"), t;
}
const gs = /^\s+at |^[^\s@]*@\S+:\d+(?::\d+)?$/m;
function Et(e) {
  switch (b.messages) {
    case "full":
      return e;
    case "scrub":
      return ys(e);
    default:
      return "";
  }
}
function Qn(e, t) {
  if (b.messages === "full" || !e || !t) return e;
  const n = gs.exec(e), r = n ? n.index : e.length, o = e.indexOf(t);
  if (o < 0 || o + t.length > r)
    return e;
  const i = Et(t);
  let s = e.slice(0, o) + i;
  return i || (s = s.replace(/:\s*$/, "")), s + e.slice(o + t.length);
}
const bo = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', Ao = '[data-oodle-privacy="mask"],.oodle-privacy-mask', _s = bo + "," + Ao + ",.rr-block,.rr-mask";
function vs(e) {
  if (b.actionText === "mask") return !0;
  try {
    return typeof e.closest == "function" && e.closest(_s) !== null;
  } catch {
    return !0;
  }
}
let In = null;
function ws(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function Ss(e) {
  if (!ws(e.endpoint))
    return console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    ), !1;
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  );
  const t = Es(
    e.viewUrlQueryParams
  );
  return ts({ ...e, viewUrlQueryParams: t }), In = { ...e, viewUrlQueryParams: t }, !0;
}
function Es(e) {
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
  if (!In)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return In;
}
const Zn = "__oodle_session_v2", er = "__oodle_tab", Ir = "__oodle_session", Ts = 900 * 1e3, ko = 14400 * 1e3, Co = 1e3;
function Ke() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
let ot = null, $ = null;
function tr(e, t) {
  try {
    const n = e == null ? void 0 : e.getItem(t);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function nr(e, t, n) {
  try {
    e == null || e.setItem(t, JSON.stringify(n));
  } catch {
  }
}
function Io() {
  try {
    return typeof localStorage < "u" ? localStorage : void 0;
  } catch {
    return;
  }
}
function Tt() {
  try {
    return typeof sessionStorage < "u" ? sessionStorage : void 0;
  } catch {
    return;
  }
}
const bs = 1e3;
let bt = 0;
function we() {
  const e = Date.now();
  if (ot && e - bt < bs) return ot;
  bt = e;
  const t = tr(Io(), Zn);
  return t && typeof t.id == "string" && t.id ? As({
    id: t.id,
    createdAt: t.createdAt ?? Date.now(),
    lastActivity: t.lastActivity ?? Date.now(),
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: t.started ?? !0
  }) : ot;
}
function As(e) {
  return e && (ot = e), e;
}
function cn(e) {
  ot = e, bt = Date.now(), nr(Io(), Zn, e);
}
function Lo() {
  if ($) return $;
  const e = tr(Tt(), er);
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
function ks(e) {
  $ = e, nr(Tt(), er, e);
}
let Re = null;
function Cs(e) {
  $ = e, !Re && (Re = setTimeout(() => {
    Re = null, $ && nr(Tt(), er, $);
  }, 1e3));
}
function Pt(e) {
  Re && (clearTimeout(Re), Re = null), ks(e);
}
let Mo = 100, Ro = 100;
function Is(e, t) {
  Mo = Math.max(0, Math.min(100, e)), Ro = Math.max(0, Math.min(100, t));
}
function Lr(e) {
  return Math.random() * 100 < e;
}
function Vt(e, t) {
  return !!e && t - e.lastActivity <= Ts && t - e.createdAt <= ko;
}
function Ls(e) {
  var r;
  const t = tr(Tt(), Ir);
  if (!t || typeof t.id != "string") return !1;
  const n = {
    id: t.id,
    createdAt: t.createdAt ?? e,
    lastActivity: t.lastActivity ?? e,
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: !0
  };
  if (e - n.lastActivity > 1800 * 1e3 || e - n.createdAt > ko)
    return !1;
  cn(n), Pt({
    tabId: Ke(),
    sessionId: n.id,
    viewCount: t.viewCount ?? 0,
    errorCount: t.errorCount ?? 0,
    actionCount: t.actionCount ?? 0,
    replaySegmentSeq: t.replaySegmentSeq ?? 0,
    legacyReplay: !0
  });
  try {
    (r = Tt()) == null || r.removeItem(Ir);
  } catch {
  }
  return !0;
}
function Ms(e) {
  const t = Lr(Mo), n = {
    id: Ke(),
    createdAt: e,
    lastActivity: e,
    sampled: t,
    replaySampled: t && Lr(Ro),
    started: !1
  };
  return cn(n), n;
}
const Ln = /* @__PURE__ */ new Set();
function Rs(e) {
  return Ln.add(e), () => Ln.delete(e);
}
function Ut() {
  let e = Lo();
  return e || (e = {
    tabId: Ke(),
    sessionId: "",
    viewCount: 0,
    errorCount: 0,
    actionCount: 0,
    replaySegmentSeq: 0,
    legacyReplay: !1
  }, Pt(e)), e;
}
function Oo(e) {
  const t = Ut();
  if (t.sessionId === e) return;
  const n = t.sessionId;
  if (t.sessionId = e, t.viewCount = 0, t.errorCount = 0, t.actionCount = 0, t.replaySegmentSeq = 0, t.legacyReplay = !1, Pt(t), n)
    for (const r of Ln)
      try {
        r(n, e);
      } catch {
      }
}
let _n = 0;
function Mn() {
  const e = Date.now();
  let t = we();
  Vt(t, e) || (bt = 0, t = we()), Vt(t, e) ? e - _n >= Co && (t.lastActivity = Math.max(t.lastActivity, e), cn(t), _n = e) : (Ls(e) ? t = we() : t = Ms(e), _n = e), t && Oo(t.id);
}
function oe() {
  const e = Date.now(), t = we();
  return Vt(t, e) ? (Oo(t.id), t.id) : "";
}
function xo() {
  return Ut().tabId;
}
function Os() {
  return Ut().legacyReplay;
}
function xs() {
  const e = Date.now(), t = we();
  return !Vt(t, e) || t.started ? !1 : (t.started = !0, cn(t), !0);
}
function Ps() {
  if (!oe()) return 0;
  const e = Ut(), t = e.replaySegmentSeq;
  return e.replaySegmentSeq = t + 1, Pt(e), t;
}
function Po() {
  const e = we();
  return (e == null ? void 0 : e.sampled) ?? !0;
}
function Uo() {
  const e = we();
  return (e == null ? void 0 : e.replaySampled) ?? !0;
}
let it = null, st = null, at = null;
const Do = ["click", "keydown", "touchstart", "scroll"];
function Us() {
  if (typeof document > "u") return;
  No();
  let e = 0;
  it = () => {
    const t = Date.now();
    t - e < Co || (e = t, Mn());
  };
  for (const t of Do)
    document.addEventListener(t, it, {
      capture: !0,
      passive: !0
    });
  at = (t) => {
    t.key === Zn && (bt = 0);
  }, window.addEventListener("storage", at), st = () => {
    document.visibilityState === "visible" ? Mn() : $ && Pt($);
  }, document.addEventListener("visibilitychange", st);
}
function No() {
  if (!(typeof document > "u")) {
    if (it) {
      for (const e of Do)
        document.removeEventListener(e, it, {
          capture: !0
        });
      it = null;
    }
    st && (document.removeEventListener("visibilitychange", st), st = null), at && (window.removeEventListener("storage", at), at = null);
  }
}
function Ho(e) {
  if (!oe()) return;
  const t = Ut();
  e === "view" || e === "page_load" ? t.viewCount++ : e === "error" ? t.errorCount++ : e === "action" && t.actionCount++, Cs(t);
}
function Ds() {
  const e = $ ?? Lo();
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
function Fo() {
  return (z == null ? void 0 : z.id) ?? "";
}
function Hs() {
  return (z == null ? void 0 : z.name) ?? "";
}
function Fs() {
  return (z == null ? void 0 : z.email) ?? "";
}
function Bs() {
  return z ? "identified" : "anonymous";
}
const qs = 5e5;
function Xt(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > qs) return n;
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
let At = {};
function $s(e) {
  e && (At = { ...e, ...At });
}
function zs(e) {
  At = { ...At, ...e };
}
function js() {
  return At;
}
const Vs = 6e4, Xs = "sdk_telemetry", Oe = {
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
function Ys() {
  for (const e in Oe)
    if (Oe[e] > 0)
      return !0;
  return !1;
}
function Rn() {
  if (!Ys()) return;
  const e = { ...Oe };
  for (const t in Oe)
    Oe[t] = 0;
  ar(Xs, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let ct = null, ut = null;
function Ws() {
  ct || (ct = setInterval(
    Rn,
    Vs
  ), typeof document < "u" && (ut = () => {
    document.visibilityState === "hidden" && Rn();
  }, document.addEventListener(
    "visibilitychange",
    ut
  )));
}
function Js() {
  ct && (clearInterval(ct), ct = null), ut && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    ut
  ), ut = null), Rn();
}
var N = Uint8Array, U = Uint16Array, rr = Int32Array, or = new N([
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
]), ir = new N([
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
]), Mr = new N([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Bo = function(e, t) {
  for (var n = new U(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new rr(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, qo = Bo(or, 2), Ks = qo.b, On = qo.r;
Ks[28] = 258, On[258] = 28;
var Gs = Bo(ir, 0), Rr = Gs.r, xn = new U(32768);
for (var T = 0; T < 32768; ++T) {
  var se = (T & 43690) >> 1 | (T & 21845) << 1;
  se = (se & 52428) >> 2 | (se & 13107) << 2, se = (se & 61680) >> 4 | (se & 3855) << 4, xn[T] = ((se & 65280) >> 8 | (se & 255) << 8) >> 1;
}
var lt = (function(e, t, n) {
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
          c[xn[f] >> a] = l;
  } else
    for (c = new U(r), o = 0; o < r; ++o)
      e[o] && (c[o] = xn[s[e[o] - 1]++] >> 15 - e[o]);
  return c;
}), be = new N(288);
for (var T = 0; T < 144; ++T)
  be[T] = 8;
for (var T = 144; T < 256; ++T)
  be[T] = 9;
for (var T = 256; T < 280; ++T)
  be[T] = 7;
for (var T = 280; T < 288; ++T)
  be[T] = 8;
var Yt = new N(32);
for (var T = 0; T < 32; ++T)
  Yt[T] = 5;
var Qs = /* @__PURE__ */ lt(be, 9, 0), Zs = /* @__PURE__ */ lt(Yt, 5, 0), $o = function(e) {
  return (e + 7) / 8 | 0;
}, zo = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new N(e.subarray(t, n));
}, J = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, Ze = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, vn = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: Vo, l: 0 };
  if (o == 1) {
    var s = new N(n[0].s + 1);
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
  var m = new U(h + 1), g = Pn(n[u - 1], m, 0);
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
  return { t: new N(m), l: g };
}, Pn = function(e, t, n) {
  return e.s == -1 ? Math.max(Pn(e.l, t, n + 1), Pn(e.r, t, n + 1)) : t[e.s] = n;
}, Or = function(e) {
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
}, et = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, jo = function(e, t, n) {
  var r = n.length, o = $o(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, xr = function(e, t, n, r, o, i, s, c, a, l, u) {
  J(t, u++, n), ++o[256];
  for (var f = vn(o, 15), h = f.t, m = f.l, g = vn(i, 15), _ = g.t, k = g.l, C = Or(h), E = C.c, A = C.n, L = Or(_), y = L.c, v = L.n, w = new U(19), p = 0; p < E.length; ++p)
    ++w[E[p] & 31];
  for (var p = 0; p < y.length; ++p)
    ++w[y[p] & 31];
  for (var d = vn(w, 7), M = d.t, W = d.l, P = 19; P > 4 && !M[Mr[P - 1]]; --P)
    ;
  var Ae = l + 5 << 3, F = et(o, be) + et(i, Yt) + s, B = et(o, h) + et(i, _) + s + 14 + 3 * P + et(w, M) + 2 * w[16] + 3 * w[17] + 7 * w[18];
  if (a >= 0 && Ae <= F && Ae <= B)
    return jo(t, u, e.subarray(a, a + l));
  var j, I, q, ie;
  if (J(t, u, 1 + (B < F)), u += 2, B < F) {
    j = lt(h, m, 0), I = h, q = lt(_, k, 0), ie = _;
    var pn = lt(M, W, 0);
    J(t, u, A - 257), J(t, u + 5, v - 1), J(t, u + 10, P - 4), u += 14;
    for (var p = 0; p < P; ++p)
      J(t, u + 3 * p, M[Mr[p]]);
    u += 3 * P;
    for (var V = [E, y], Qe = 0; Qe < 2; ++Qe)
      for (var ke = V[Qe], p = 0; p < ke.length; ++p) {
        var X = ke[p] & 31;
        J(t, u, pn[X]), u += M[X], X > 15 && (J(t, u, ke[p] >> 5 & 127), u += ke[p] >> 12);
      }
  } else
    j = Qs, I = be, q = Zs, ie = Yt;
  for (var p = 0; p < c; ++p) {
    var R = r[p];
    if (R > 255) {
      var X = R >> 18 & 31;
      Ze(t, u, j[X + 257]), u += I[X + 257], X > 7 && (J(t, u, R >> 23 & 31), u += or[X]);
      var Ce = R & 31;
      Ze(t, u, q[Ce]), u += ie[Ce], Ce > 3 && (Ze(t, u, R >> 5 & 8191), u += ir[Ce]);
    } else
      Ze(t, u, j[R]), u += I[R];
  }
  return Ze(t, u, j[256]), u + I[256];
}, ea = /* @__PURE__ */ new rr([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Vo = /* @__PURE__ */ new N(0), ta = function(e, t, n, r, o, i) {
  var s = i.z || e.length, c = new N(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = c.subarray(r, c.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (a[0] = i.r >> 3);
    for (var f = ea[t - 1], h = f >> 13, m = f & 8191, g = (1 << n) - 1, _ = i.p || new U(32768), k = i.h || new U(g + 1), C = Math.ceil(n / 3), E = 2 * C, A = function(yn) {
      return (e[yn] ^ e[yn + 1] << C ^ e[yn + 2] << E) & g;
    }, L = new rr(25e3), y = new U(288), v = new U(32), w = 0, p = 0, d = i.i || 0, M = 0, W = i.w || 0, P = 0; d + 2 < s; ++d) {
      var Ae = A(d), F = d & 32767, B = k[Ae];
      if (_[F] = B, k[Ae] = F, W <= d) {
        var j = s - d;
        if ((w > 7e3 || M > 24576) && (j > 423 || !l)) {
          u = xr(e, a, 0, L, y, v, p, M, P, d - P, u), M = w = p = 0, P = d;
          for (var I = 0; I < 286; ++I)
            y[I] = 0;
          for (var I = 0; I < 30; ++I)
            v[I] = 0;
        }
        var q = 2, ie = 0, pn = m, V = F - B & 32767;
        if (j > 2 && Ae == A(d - V))
          for (var Qe = Math.min(h, j) - 1, ke = Math.min(32767, d), X = Math.min(258, j); V <= ke && --pn && F != B; ) {
            if (e[d + q] == e[d + q - V]) {
              for (var R = 0; R < X && e[d + R] == e[d + R - V]; ++R)
                ;
              if (R > q) {
                if (q = R, ie = V, R > Qe)
                  break;
                for (var Ce = Math.min(V, R - 2), wr = 0, I = 0; I < Ce; ++I) {
                  var mn = d - V + I & 32767, Ji = _[mn], Sr = mn - Ji & 32767;
                  Sr > wr && (wr = Sr, B = mn);
                }
              }
            }
            F = B, B = _[F], V += F - B & 32767;
          }
        if (ie) {
          L[M++] = 268435456 | On[q] << 18 | Rr[ie];
          var Er = On[q] & 31, Tr = Rr[ie] & 31;
          p += or[Er] + ir[Tr], ++y[257 + Er], ++v[Tr], W = d + q, ++w;
        } else
          L[M++] = e[d], ++y[e[d]];
      }
    }
    for (d = Math.max(d, W); d < s; ++d)
      L[M++] = e[d], ++y[e[d]];
    u = xr(e, a, l, L, y, v, p, M, P, d - P, u), l || (i.r = u & 7 | a[u / 8 | 0] << 3, u -= 7, i.h = k, i.p = _, i.i = d, i.w = W);
  } else {
    for (var d = i.w || 0; d < s + l; d += 65535) {
      var hn = d + 65535;
      hn >= s && (a[u / 8 | 0] = l, hn = s), u = jo(a, u + 1, e.subarray(d, hn));
    }
    i.i = s;
  }
  return zo(c, 0, r + $o(u) + o);
}, na = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), ra = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = na[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, oa = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new N(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return ta(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, Un = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, ia = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && Un(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, sa = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function aa(e, t) {
  t || (t = {});
  var n = ra(), r = e.length;
  n.p(e);
  var o = oa(e, t, sa(t), 8), i = o.length;
  return ia(o, t), Un(o, i - 8, n.d()), Un(o, i - 4, r), o;
}
var Pr = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), ca = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), ua = 0;
try {
  ca.decode(Vo, { stream: !0 }), ua = 1;
} catch {
}
function la(e, t) {
  var n;
  if (Pr)
    return Pr.encode(e);
  for (var r = e.length, o = new N(e.length + (e.length >> 1)), i = 0, s = function(l) {
    o[i++] = l;
  }, n = 0; n < r; ++n) {
    if (i + 5 > o.length) {
      var c = new N(i + 8 + (r - n << 1));
      c.set(o), o = c;
    }
    var a = e.charCodeAt(n);
    a < 128 || t ? s(a) : a < 2048 ? (s(192 | a >> 6), s(128 | a & 63)) : a > 55295 && a < 57344 ? (a = 65536 + (a & 1047552) | e.charCodeAt(++n) & 1023, s(240 | a >> 18), s(128 | a >> 12 & 63), s(128 | a >> 6 & 63), s(128 | a & 63)) : (s(224 | a >> 12), s(128 | a >> 6 & 63), s(128 | a & 63));
  }
  return zo(o, 0, i);
}
function Ft(e) {
  try {
    return aa(la(e));
  } catch {
    return null;
  }
}
const fa = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function da(e) {
  if (!fa)
    return Ft(e);
  try {
    const t = new Response(e).body;
    if (!t) return Ft(e);
    const n = t.pipeThrough(
      new CompressionStream("gzip")
    ), r = await new Response(
      n
    ).arrayBuffer();
    return new Uint8Array(r);
  } catch {
    return Ft(e);
  }
}
const pa = "0.6.0", Ur = 5e3, Xo = 50, Yo = 5e5, Dr = 256e3, Wt = "replay", Wo = 8e4, Jo = 32, ma = 2e7, ha = 5, ya = 1e3, ga = 6e4, _a = 500, Jt = 63e3;
let xe = 0, Pe = 0, ae = [], ft = 0, wn = null;
const Kt = /* @__PURE__ */ new Map();
let Ue = null, De = null, Dn = null, dt = !1;
function va() {
  try {
    return O().flushIntervalMs ?? Ur;
  } catch {
    return Ur;
  }
}
function Ko(e) {
  let t = Kt.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, Kt.set(e, t)), t;
}
function Go(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (x("compression_failures"), { body: t, encoding: "" });
}
async function Qo(e) {
  return Go(await da(e), e);
}
function wa(e) {
  return Go(Ft(e), e);
}
const Sa = 64e3;
function Nn(e, t, n) {
  if (e === Wt)
    return {
      bytes: n ?? Xt(
        t,
        Sa
      ),
      oversized: !1
    };
  const r = Xt(
    t,
    Dr + 1
  );
  return {
    bytes: r,
    oversized: r > Dr
  };
}
let Hn = null;
function Ea(e) {
  Hn = e;
}
function un(e) {
  x("transport_drops"), e === Wt && Hn && Hn();
}
const Ta = "/v1/rum/ingest";
function ba(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: pa
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
function Aa(e, t, n) {
  const r = O();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const a = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, l = new Blob([n], {
      type: "application/json"
    });
    if (l.size < Jt && navigator.sendBeacon(a, l))
      return;
  }
  const { body: o, encoding: i } = wa(n), s = { ...t };
  i ? s["Content-Encoding"] = i : delete s["Content-Encoding"];
  const c = o instanceof Blob ? o.size : n.length;
  fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: c < Jt,
    credentials: "omit"
  }).catch(() => {
    x("exit_send_failures");
  });
}
function Sn(e, t, n, r) {
  const o = n.length;
  if (ft + o > ma) {
    x("retry_drops"), r && un(r);
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
  }), ft += o, Zo();
}
function Zo() {
  if (wn || ae.length === 0)
    return;
  const e = ae[0], t = Math.min(
    ya * Math.pow(2, e.attempts),
    ga
  );
  wn = setTimeout(() => {
    wn = null, ei();
  }, t);
}
async function ei() {
  for (; ae.length > 0 && xe < Wo && Pe < Jo; ) {
    const e = ae.shift();
    if (ft -= e.bytes, e.attempts++, e.attempts > ha) {
      x("retry_drops"), e.batchKey && un(e.batchKey);
      continue;
    }
    const t = e.bytes;
    xe += t, Pe++;
    try {
      const { body: n, encoding: r } = await Qo(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < Jt,
        credentials: "omit"
      });
      if (ni(i), i.status === 429 || i.status >= 500) {
        ae.unshift(e), ft += e.bytes;
        break;
      }
    } catch {
      ae.unshift(e), ft += e.bytes;
      break;
    } finally {
      xe -= t, Pe--;
    }
  }
  ae.length > 0 && Zo();
}
function ka() {
  Ue && (clearTimeout(Ue), Ue = null), De && (clearTimeout(De), De = null);
}
function sr() {
  const e = va();
  Ue && clearTimeout(Ue), Ue = setTimeout(
    () => re(),
    e
  ), De || (De = setTimeout(
    () => {
      De = null, re();
    },
    e + _a
  ));
}
function ar(e, t, n) {
  const { bytes: r, oversized: o } = Nn(
    e,
    t,
    n
  );
  if (o) {
    console.warn(
      `[@oodle-ai/rum] Dropping oversized ${e} payload (${r} bytes)`
    ), un(e);
    return;
  }
  const i = Ko(e);
  if (i.items.push(t), i.bytesEstimate += r, !dt && (i.items.length >= Xo || i.bytesEstimate >= Yo)) {
    re();
    return;
  }
  sr();
}
function Ca(e, t, n, r) {
  const { bytes: o, oversized: i } = Nn(
    e,
    n
  );
  if (i) {
    un(e);
    return;
  }
  const s = Ko(e), c = s.upsertMap.get(t);
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
  if (!dt && (s.items.length >= Xo || s.bytesEstimate >= Yo)) {
    re();
    return;
  }
  sr();
}
function ti(e) {
  Dn = e;
}
const Nr = ["events", "replay"];
function re(e = !1) {
  const t = O();
  if (e && Dn && !dt) {
    dt = !0;
    try {
      Dn();
    } catch {
    } finally {
      dt = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    sr();
    return;
  }
  ka();
  const n = js(), r = [], o = Array.from(
    Kt.keys()
  ).sort((l, u) => {
    const f = Nr.indexOf(l), h = Nr.indexOf(u), m = f >= 0 ? f : 999, g = h >= 0 ? h : 999;
    return m - g;
  });
  for (const l of o) {
    const u = Kt.get(l);
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
  const i = ba(r), s = `${t.endpoint}${Ta}`, c = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, a = r.some(
    (l) => l.type === Wt
  );
  if (e) {
    Aa(s, c, i);
    return;
  }
  Ia(
    s,
    c,
    i,
    a ? Wt : void 0
  );
}
async function Ia(e, t, n, r) {
  const o = n.length;
  if (xe >= Wo || Pe >= Jo) {
    Sn(e, t, n, r);
    return;
  }
  xe += o, Pe++;
  try {
    const { body: i, encoding: s } = await Qo(n), c = { ...t };
    s && (c["Content-Encoding"] = s);
    const a = await fetch(e, {
      method: "POST",
      headers: c,
      body: i,
      keepalive: o < Jt,
      credentials: "omit"
    });
    ni(a), (a.status === 429 || a.status >= 500) && Sn(e, t, n, r);
  } catch {
    x("send_failures"), Sn(e, t, n, r);
  } finally {
    xe -= o, Pe--, ei();
  }
}
const Fn = /* @__PURE__ */ new Map();
function ni(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && Fn.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function ln(e) {
  const t = Fn.get(e);
  return t ? Date.now() >= t ? (Fn.delete(e), !1) : !0 : !1;
}
let pt = null, mt = null, ht = null, Bn = null;
function La(e) {
  Bn = e;
}
const ri = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function Hr() {
  typeof document > "u" || (pt = () => {
    document.visibilityState === "hidden" && re(!0);
  }, mt = () => re(!0), ht = (e) => {
    e.persisted && Bn && Bn();
  }, document.addEventListener(
    "visibilitychange",
    pt
  ), window.addEventListener(
    ri,
    mt
  ), window.addEventListener(
    "pageshow",
    ht
  ));
}
function Ma() {
  pt && (document.removeEventListener(
    "visibilitychange",
    pt
  ), pt = null), mt && (window.removeEventListener(
    ri,
    mt
  ), mt = null), ht && (window.removeEventListener(
    "pageshow",
    ht
  ), ht = null);
}
const Gt = /* @__PURE__ */ new Map();
function Ra(e, t) {
  Gt.set(e, t);
}
function Oa() {
  return Gt.size === 0 ? {} : Object.fromEntries(Gt);
}
function xa() {
  Gt.clear();
}
const Pa = 100, Ua = 1e4, yt = /* @__PURE__ */ new Set();
let kt = 0, Ne = null;
function cr() {
  for (const e of yt)
    try {
      e();
    } catch {
    }
}
function Da() {
  Ne || typeof MutationObserver > "u" || typeof document > "u" || !document.documentElement || (Ne = new MutationObserver(cr), Ne.observe(document.documentElement, {
    childList: !0,
    subtree: !0,
    attributes: !0,
    characterData: !0
  }));
}
function Fr() {
  yt.size > 0 || !Ne || (Ne.disconnect(), Ne = null);
}
function oi() {
  kt++, cr();
}
function ii() {
  kt = Math.max(0, kt - 1), cr();
}
function si(e, t, n = Ua) {
  let r = null, o = null, i = null, s = !1;
  const c = (u) => {
    s || (s = !0, o && clearTimeout(o), i && clearTimeout(i), yt.delete(l), Fr(), t(u));
  }, a = () => {
    o && clearTimeout(o), o = setTimeout(() => {
      if (kt > 0) {
        a();
        return;
      }
      c({
        endMs: r,
        hadActivity: r !== null,
        timedOut: !1
      });
    }, Pa);
  };
  function l() {
    r = Date.now(), a();
  }
  return yt.add(l), Da(), kt > 0 && (r = e), a(), i = setTimeout(() => {
    c({
      endMs: r,
      hadActivity: r !== null,
      timedOut: !0
    });
  }, n), () => {
    s = !0, o && clearTimeout(o), i && clearTimeout(i), yt.delete(l), Fr();
  };
}
var ce, gt, ai, Qt, ci = -1, Dt = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (ci = t.timeStamp, e(t));
  }), !0);
}, ur = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, fn = function() {
  var e = ur();
  return e && e.activationStart || 0;
}, pe = function(e, t) {
  var n = ur(), r = "navigate";
  return ci >= 0 ? r = "back-forward-cache" : n && (document.prerendering || fn() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, lr = function(e, t, n) {
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
}, ui = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, fr = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, dr = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Me = -1, Br = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, Zt = function(e) {
  document.visibilityState === "hidden" && Me > -1 && (Me = e.type === "visibilitychange" ? e.timeStamp : 0, Na());
}, qr = function() {
  addEventListener("visibilitychange", Zt, !0), addEventListener("prerenderingchange", Zt, !0);
}, Na = function() {
  removeEventListener("visibilitychange", Zt, !0), removeEventListener("prerenderingchange", Zt, !0);
}, pr = function() {
  return Me < 0 && (Me = Br(), qr(), Dt((function() {
    setTimeout((function() {
      Me = Br(), qr();
    }), 0);
  }))), { get firstHiddenTime() {
    return Me;
  } };
}, dn = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, $r = [1800, 3e3], Ha = function(e, t) {
  t = t || {}, dn((function() {
    var n, r = pr(), o = pe("FCP"), i = lr("paint", (function(s) {
      s.forEach((function(c) {
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < r.firstHiddenTime && (o.value = Math.max(c.startTime - fn(), 0), o.entries.push(c), n(!0)));
      }));
    }));
    i && (n = me(e, o, $r, t.reportAllChanges), Dt((function(s) {
      o = pe("FCP"), n = me(e, o, $r, t.reportAllChanges), ui((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, Fa = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = dr(e), document.visibilityState === "hidden" ? e() : (n = t(e), fr(e)), n;
}, zr = [2500, 4e3], En = {}, Ba = function(e, t) {
  t = t || {}, dn((function() {
    var n, r = pr(), o = pe("LCP"), i = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - fn(), 0), o.entries = [l], n());
      }));
    }, s = lr("largest-contentful-paint", i);
    if (s) {
      n = me(e, o, zr, t.reportAllChanges);
      var c = dr((function() {
        En[o.id] || (i(s.takeRecords()), s.disconnect(), En[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(a) {
        addEventListener(a, (function() {
          return Fa(c);
        }), { once: !0, capture: !0 });
      })), fr(c), Dt((function(a) {
        o = pe("LCP"), n = me(e, o, zr, t.reportAllChanges), ui((function() {
          o.value = performance.now() - a.timeStamp, En[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, jr = [800, 1800], qa = function e(t) {
  document.prerendering ? dn((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, $a = function(e, t) {
  t = t || {};
  var n = pe("TTFB"), r = me(e, n, jr, t.reportAllChanges);
  qa((function() {
    var o = ur();
    o && (n.value = Math.max(o.responseStart - fn(), 0), n.entries = [o], r(!0), Dt((function() {
      n = pe("TTFB", 0), (r = me(e, n, jr, t.reportAllChanges))(!0);
    })));
  }));
}, rt = { passive: !0, capture: !0 }, za = /* @__PURE__ */ new Date(), Vr = function(e, t) {
  ce || (ce = t, gt = e, ai = /* @__PURE__ */ new Date(), fi(removeEventListener), li());
}, li = function() {
  if (gt >= 0 && gt < ai - za) {
    var e = { entryType: "first-input", name: ce.type, target: ce.target, cancelable: ce.cancelable, startTime: ce.timeStamp, processingStart: ce.timeStamp + gt };
    Qt.forEach((function(t) {
      t(e);
    })), Qt = [];
  }
}, ja = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        Vr(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, rt), removeEventListener("pointercancel", i, rt);
      };
      addEventListener("pointerup", o, rt), addEventListener("pointercancel", i, rt);
    })(t, e) : Vr(t, e);
  }
}, fi = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, ja, rt);
  }));
}, Xr = [100, 300], Va = function(e, t) {
  t = t || {}, dn((function() {
    var n, r = pr(), o = pe("FID"), i = function(a) {
      a.startTime < r.firstHiddenTime && (o.value = a.processingStart - a.startTime, o.entries.push(a), n(!0));
    }, s = function(a) {
      a.forEach(i);
    }, c = lr("first-input", s);
    n = me(e, o, Xr, t.reportAllChanges), c && (fr(dr((function() {
      s(c.takeRecords()), c.disconnect();
    }))), Dt((function() {
      var a;
      o = pe("FID"), n = me(e, o, Xr, t.reportAllChanges), Qt = [], gt = -1, ce = null, fi(addEventListener), a = i, Qt.push(a), li();
    })));
  }));
};
const Xa = 3e3;
let Ct = null, di = (e) => e.href, S = null, te = null, en = [];
function tn() {
  return typeof performance < "u" ? performance.now() : 0;
}
function Ya() {
  return typeof performance < "u" && performance.timeOrigin ? performance.timeOrigin : Date.now();
}
function _t(e) {
  const t = e.hash ?? "", n = t.startsWith("#/") ? t.split("?")[0] : "";
  return e.pathname + n;
}
function pi(e, t, n) {
  return {
    id: Ke(),
    sessionId: oe(),
    loadingType: e,
    startEpoch: t,
    startPerf: n,
    url: di(window.location),
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
function Wa(e) {
  const t = Array.from(e.interactions.values()).sort((r, o) => o - r);
  if (t.length === 0) return 0;
  const n = Math.min(t.length - 1, Math.floor(t.length / 50));
  return t[n];
}
function Ja(e) {
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
    inp_ms: Wa(e),
    cls: Math.round(e.cls.value * 1e4) / 1e4,
    dns_ms: n.dns_ms ?? 0,
    connect_ms: n.connect_ms ?? 0,
    tls_ms: n.tls_ms ?? 0,
    download_ms: n.download_ms ?? 0,
    dom_interactive_ms: n.dom_interactive_ms ?? 0,
    dom_complete_ms: n.dom_complete_ms ?? 0
  };
}
function Ge(e) {
  !Ct || !e.sessionId || (e.seq++, Ct(Ja(e), e.sessionId));
}
function mi() {
  te && (clearTimeout(te), te = null), S && Ge(S);
}
function It() {
  te || !S || (te = setTimeout(() => {
    te = null, S && Ge(S);
  }, Xa));
}
const Ka = 5 * 6e4, vt = /* @__PURE__ */ new Map();
function Ga(e) {
  const t = Date.now();
  for (const [n, r] of vt) r.until <= t && vt.delete(n);
  vt.set(e.id, { v: e, until: t + Ka });
}
function nn() {
  const e = S;
  e && (Ga(e), e.cancelIdle && e.cancelIdle(), te && (clearTimeout(te), te = null), e.active = !1, Ge(e), S = null);
}
function hi(e) {
  e.cancelIdle = si(e.startEpoch, (t) => {
    if (e.cancelIdle = null, S !== e) return;
    let n = t.endMs !== null && !t.timedOut ? t.endMs - e.startEpoch : 0;
    e.loadingType === "initial_load" && (n = Math.max(n, e.vitals.load_event_ms ?? 0)), e.loadingTimeMs = Math.max(0, n), mi();
  });
}
function rn(e, t, n) {
  nn();
  const r = pi(e, t, n);
  r.sessionId && (S = r, Ge(r), hi(r));
}
function yi() {
  return (S == null ? void 0 : S.id) ?? "";
}
function Qa() {
  return (S == null ? void 0 : S.urlPath) ?? "";
}
function Za(e) {
  const t = typeof e.view_id == "string" ? e.view_id : "";
  let n = S, r = !1;
  if (t && (n == null ? void 0 : n.id) !== t) {
    const o = vt.get(t);
    if (!o || o.until <= Date.now()) return;
    n = o.v, r = !0;
  }
  if (n) {
    switch (e.event_type) {
      case "action":
        n.actionCount++, e.is_frustration === 1 && n.frustrationCount++;
        break;
      case "error":
        n.errorCount++;
        break;
      case "console":
        e.console_level === "error" && n.errorCount++;
        break;
      case "resource":
        n.resourceCount++;
        break;
      case "long_task":
        n.longTaskCount++;
        break;
      default:
        return;
    }
    r ? Ge(n) : It();
  }
}
function ec(e) {
  var r, o;
  const t = (o = (r = performance.getEntriesByType) == null ? void 0 : r.call(performance, "navigation")) == null ? void 0 : o[0];
  if (!t || t.loadEventEnd <= 0) return !1;
  const n = Math.round;
  return e.vitals.load_event_ms = n(t.loadEventEnd - t.startTime), e.vitals.dns_ms = n(t.domainLookupEnd - t.domainLookupStart), e.vitals.connect_ms = n(t.connectEnd - t.connectStart), e.vitals.tls_ms = n(
    t.secureConnectionStart > 0 ? t.connectEnd - t.secureConnectionStart : 0
  ), e.vitals.download_ms = n(t.responseEnd - t.responseStart), e.vitals.dom_interactive_ms = n(t.domInteractive - t.startTime), e.vitals.dom_complete_ms = n(t.domComplete - t.startTime), !0;
}
function Yr(e, t, n = {}) {
  if (!(typeof PerformanceObserver > "u"))
    try {
      const r = new PerformanceObserver((o) => t(o.getEntries()));
      r.observe({ type: e, buffered: !0, ...n }), en.push(() => r.disconnect());
    } catch {
    }
}
function tc(e, t, n) {
  const r = e.cls;
  r.windowValue > 0 && n - r.last < 1e3 && n - r.windowStart < 5e3 ? r.windowValue += t : (r.windowValue = t, r.windowStart = n), r.last = n, r.windowValue > r.value && (r.value = r.windowValue);
}
function nc() {
  Yr("layout-shift", (e) => {
    const t = S;
    if (!t) return;
    let n = !1;
    for (const r of e)
      r.hadRecentInput || r.startTime < t.startPerf || (tc(t, r.value, r.startTime), n = !0);
    n && It();
  }), Yr(
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
      n && It();
    },
    { durationThreshold: 40 }
  );
}
function rc(e) {
  const t = (o, i) => {
    S !== e && !e.active || (e.vitals[o] = Math.round(i * 100) / 100, S === e && It());
  };
  try {
    Ba((o) => t("lcp", o.value)), Ha((o) => t("fcp", o.value)), $a((o) => t("ttfb", o.value)), Va((o) => t("fid", o.value));
  } catch {
  }
  let n = 0;
  const r = () => {
    ec(e) ? S === e && It() : ++n < 50 && setTimeout(r, 200);
  };
  document.readyState === "complete" ? setTimeout(r, 0) : window.addEventListener("load", () => setTimeout(r, 0), { once: !0 });
}
let He = "", Bt = !1;
function Le() {
  const e = _t(window.location);
  e !== He && (He = e, rn("route_change", Date.now(), tn()));
}
function oc(e, t) {
  if (typeof window > "u") return;
  gi(), Bt = !1, Ct = e, di = t, He = _t(window.location);
  const n = Ya(), r = pi("initial_load", n, 0);
  r.sessionId && (S = r, Ge(r), hi(r), rc(r)), nc();
  const o = history.pushState, i = history.replaceState;
  history.pushState = function(...u) {
    o.apply(this, u), Le();
  }, history.replaceState = function(...u) {
    i.apply(this, u), Le();
  }, window.addEventListener("popstate", Le), window.addEventListener("hashchange", Le);
  const s = () => {
    document.visibilityState === "hidden" && mi();
  };
  document.addEventListener("visibilitychange", s);
  const c = () => {
    nn(), Bt = !0;
  };
  window.addEventListener("pagehide", c);
  const a = (u) => {
    u.persisted && (Bt = !1, He = _t(window.location), rn("bf_cache", Date.now(), tn()));
  };
  window.addEventListener("pageshow", a);
  const l = Rs((u) => {
    S && S.sessionId === u && nn(), He = _t(window.location), rn("route_change", Date.now(), tn());
  });
  en.push(() => {
    history.pushState = o, history.replaceState = i, window.removeEventListener("popstate", Le), window.removeEventListener("hashchange", Le), document.removeEventListener("visibilitychange", s), window.removeEventListener("pagehide", c), window.removeEventListener("pageshow", a), l();
  });
}
function ic() {
  S || Bt || !Ct || typeof window > "u" || (He = _t(window.location), rn("route_change", Date.now(), tn()));
}
function gi() {
  nn(), vt.clear();
  for (const e of en) e();
  en = [], Ct = null, S = null;
}
const sc = 3, ac = 1e3;
let on = null, Q = null;
const fe = [], mr = [];
let qt = null;
function cc() {
  for (let e = fe.length - 1; e >= 0; e--)
    if (!fe[e].done) return fe[e].id;
  return "";
}
function uc(e) {
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
function lc(e, t) {
  const n = [];
  return t && n.push("rage_click"), e.deadCandidate && !e.hadActivity && n.push("dead_click"), e.errorCount > 0 && n.push("error_click"), n;
}
function Wr(e, t, n = 1) {
  if (!on) return;
  const r = lc(e, t), o = t ? "rage_click" : r.includes("dead_click") ? "dead_click" : r.includes("error_click") ? "error_click" : "click", i = {
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
  on(i);
}
function qn() {
  const e = Q;
  if (Q = null, !e) return;
  e.timer && clearTimeout(e.timer);
  const t = () => e.clicks.every((o) => o.done), n = () => {
    if (e.clicks.length >= sc) {
      const o = e.clicks[0];
      for (const i of e.clicks.slice(1))
        o.errorCount += i.errorCount, o.resourceCount += i.resourceCount, o.longTaskCount += i.longTaskCount, o.hadActivity = o.hadActivity || i.hadActivity;
      Wr(o, !0, e.clicks.length);
    } else
      for (const o of e.clicks) Wr(o, !1);
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
  mr.push(() => clearInterval(r));
}
function fc(e) {
  var n;
  const t = ((n = e.tagName) == null ? void 0 : n.toLowerCase()) ?? "";
  return t === "input" || t === "textarea" || t === "select" || t === "label" || e.isContentEditable ? !0 : typeof e.closest == "function" && e.closest("label") !== null;
}
function dc() {
  var e;
  try {
    const t = (e = window.getSelection) == null ? void 0 : e.call(window);
    return !!t && !t.isCollapsed && t.toString().length > 0;
  } catch {
    return !1;
  }
}
function pc(e) {
  const t = e.target;
  if (!t || typeof t.tagName != "string") return;
  const n = gc(t), r = t.tagName.toLowerCase(), o = hc(t), i = o === null && vs(t), s = o ?? (i ? "" : (t.textContent ?? "").trim().slice(0, 200)), c = o !== null ? `${r}[${o}]` : yc(t, r, s, i), a = {
    id: Ke(),
    startMs: Date.now(),
    viewId: yi(),
    viewPath: Qa(),
    target: c,
    selector: n,
    text: s,
    x: e.clientX,
    y: e.clientY,
    deadCandidate: !fc(t) && !dc(),
    errorCount: 0,
    resourceCount: 0,
    longTaskCount: 0,
    loadingTimeMs: 0,
    hadActivity: !1,
    done: !1
  };
  fe.push(a), mr.push(
    si(a.startMs, (u) => {
      a.hadActivity = u.hadActivity, a.loadingTimeMs = u.endMs !== null && !u.timedOut ? Math.max(0, u.endMs - a.startMs) : 0, a.done = !0;
    })
  ), Q && Q.selector === n ? Q.clicks.push(a) : (qn(), Q = { selector: n, clicks: [a], timer: null });
  const l = Q;
  l.timer && clearTimeout(l.timer), l.timer = setTimeout(() => {
    Q === l && qn();
  }, ac);
}
function mc(e) {
  if (typeof document > "u") return;
  _i(), on = e;
  const t = (n) => pc(n);
  document.addEventListener("click", t, { capture: !0, passive: !0 }), qt = () => document.removeEventListener("click", t, {
    capture: !0
  });
}
function _i() {
  Q && qn();
  for (const e of mr.splice(0)) e();
  fe.splice(0), qt && qt(), qt = null, on = null;
}
const Jr = "data-oodle-action-name";
function hc(e) {
  var t;
  try {
    const n = typeof e.closest == "function" ? e.closest(`[${Jr}]`) : null, r = (t = n == null ? void 0 : n.getAttribute(Jr)) == null ? void 0 : t.trim();
    return r ? r.slice(0, 200) : null;
  } catch {
    return null;
  }
}
function yc(e, t, n, r = !1) {
  if (r) return Kr(e, t);
  const o = e.getAttribute("aria-label");
  if (o) return `${t}[${o}]`;
  const i = e.getAttribute("title");
  if (i) return `${t}[${i}]`;
  const s = n.split(`
`)[0].trim();
  return s && s.length <= 80 ? `${t}[${s}]` : Kr(e, t);
}
function Kr(e, t) {
  if (e.id) return `${t}#${e.id}`;
  const n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
function gc(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
const Fe = "[REDACTED]", _c = /token|secret|auth|cookie|passw|api-?key|access-?key|session|csrf|xsrf|client-?ip|real-?ip|connecting-ip|(^|-)forwarded(-for)?$/, vc = /passw|secret|token(?!s|count|limit|usage|type)|apikey|accesskey|privatekey|authorization|credential|cardnumber|creditcard|cardnum|^pan$|cvv|cvc|securitycode|^ssn$|socialsecurity|^ip$|ipaddr|clientip|remoteaddr|remoteip|^ipv[46]$/;
function vi(e, t, n) {
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
function wi(e) {
  return vi(
    _c,
    (t) => t.toLowerCase(),
    e
  );
}
function Si(e) {
  return vi(
    vc,
    (t) => t.toLowerCase().replace(/[-_.\s]/g, ""),
    e
  );
}
function wc(e) {
  let t = 0, n = !1;
  for (let r = e.length - 1; r >= 0; r--) {
    let o = e.charCodeAt(r) - 48;
    n && (o *= 2, o > 9 && (o -= 9)), t += o, n = !n;
  }
  return t % 10 === 0;
}
const Sc = /\b\d(?:[ -]?\d){12,18}\b/g;
function Ec(e) {
  return e.replace(Sc, (t) => {
    const n = t.replace(/[ -]/g, "");
    return n.length >= 13 && n.length <= 19 && n[0] >= "2" && n[0] <= "6" && wc(n) ? Fe : t;
  });
}
function $n(e, t, n) {
  if (n > 32 || e === null || typeof e != "object")
    return;
  let r = !1;
  if (Array.isArray(e)) {
    const i = e.map((s) => {
      const c = $n(s, t, n + 1);
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
    const c = $n(s, t, n + 1);
    c === void 0 ? o[i] = s : (o[i] = c, r = !0);
  }
  return r ? o : void 0;
}
const Tn = /"((?:[^"\\]|\\.){1,200})"\s*:\s*/g, Tc = /^("(?:[^"\\]|\\.)*"|[^\s,}\]{["]+)/;
function bc(e, t) {
  let n = "", r = 0;
  Tn.lastIndex = 0;
  let o;
  for (; (o = Tn.exec(e)) !== null; ) {
    if (!t(o[1])) continue;
    const i = o.index + o[0].length, s = e.slice(i);
    if (s[0] === "{" || s[0] === "[")
      return n + e.slice(r, i) + `"${Fe}"`;
    const c = Tc.exec(s);
    if (!c)
      return s[0] === '"' ? n + e.slice(r, i) + `"${Fe}"` : n + e.slice(r);
    c[1] === '""' || c[1] === "null" || (n += e.slice(r, i) + `"${Fe}"`, r = i + c[1].length, Tn.lastIndex = r);
  }
  return n + e.slice(r);
}
function Ac(e) {
  return /^[\w.%+[\]-]+=[^&]*(&[\w.%+[\]-]+=[^&]*)*$/.test(e);
}
function kc(e, t) {
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
      const s = $n(o, t, 0);
      s !== void 0 && (r = JSON.stringify(s));
    } else
      r = bc(e, t);
  } else if (Ac(n))
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
  return Ec(r);
}
const Cc = 50, Gr = 200, Qr = /* @__PURE__ */ new Map();
function Ic(e) {
  let t = Qr.get(e);
  return t || (t = {
    tokens: Gr,
    lastRefill: Date.now(),
    rate: Cc,
    burst: Gr
  }, Qr.set(e, t)), t;
}
function Lc(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function Mc(e) {
  const t = Ic(e);
  return Lc(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let zn = null, jn = null;
function nl(e, t) {
  zn = e, jn = t;
}
const Rc = "00000000000000000000000000000000";
function Ei() {
  if (!zn || !jn) return null;
  try {
    const e = zn.getSpan(
      jn.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === Rc ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const Zr = 100, Oc = 10, eo = 5e3, xc = 3, Pc = 0;
function Uc(e, t = () => Date.now()) {
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
    return r.size < eo && r.set(a, u), u;
  }
  function s(a) {
    const l = i(a), u = t();
    let f = n.get(l);
    if (!f) {
      if (n.size >= eo)
        return !0;
      f = {
        tokens: Zr,
        lastRefillMs: u
      }, n.set(l, f);
    }
    const h = (u - f.lastRefillMs) / 1e3;
    return h > 0 && (f.tokens = Math.min(
      Zr,
      f.tokens + h * Oc
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function c(a) {
    var g, _, k;
    if (a.type !== xc)
      return { event: a, dropped: 0 };
    const l = a.data;
    if (!l || l.source !== Pc || !l.attributes || l.attributes.length === 0)
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
const to = "replay", Dc = 200, Nc = 6e4, Hc = 5e3, Fc = 8e6, Ti = 2, Bc = 3, qc = 4, no = 3e3, bi = 5e3, $c = 3, zc = 3e4, jc = 5e3, Vc = 16, Xc = 100, Yc = 4, Wc = 30, ro = 32, oo = 250, Jc = 36e4;
function Kc() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const Gc = 3e5, Qc = 9e5, Zc = 1e3;
let Se = null, ne = null, tt = null, Xe = [], Ye = 0, ge = "", Ai = "", hr = !1, ki = 0, bn = "", Z = 0, Ee = Date.now(), he = !1, Lt = 0, _e = null, We = !1, Be = null, Ci = 0, K = [], Y = 0, qe = null, ue = null, $t = 0;
function Je() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const yr = Uc(
  () => (Se == null ? void 0 : Se.mirror) ?? null
);
let $e = null, ve = null, ze = !1, Mt = !1, gr = 0, zt = null, ee = null;
function eu() {
  qe && (clearTimeout(qe), qe = null), ue && (ue(), ue = null);
}
function Vn(e, t) {
  eu();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    Wc
  ) : null, r = e ? Je() + (n ?? Yc) : Number.POSITIVE_INFINITY;
  for (; Y < K.length; ) {
    const o = Math.min(
      Y + ro,
      K.length
    );
    for (; Y < o; )
      Xn(
        K[Y++]
      );
    if (Je() >= r) break;
  }
  if (Y >= K.length) {
    K = [], Y = 0;
    return;
  }
  Y >= ro * 8 && (K = K.slice(Y), Y = 0), Ii();
}
function sn() {
  Vn(!1);
}
function Ii() {
  if (!qe) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          ue = null, Vn(!0, t);
        },
        { timeout: Xc }
      );
      ue = () => cancelIdleCallback(e);
    }
    qe = setTimeout(() => {
      qe = null, ue && (ue(), ue = null), Vn(!0);
    }, Vc);
  }
}
function Rt(e = !1) {
  if (We = !0, Be) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - Ee, r = Math.max(
      0,
      bi - n
    ), o = Date.now() - Ci, i = Math.max(
      0,
      jc - o
    );
    t = Math.max(
      r,
      i
    );
  }
  Be = setTimeout(() => {
    Be = null, tu();
  }, t);
}
function tu() {
  if (!We || !Se || !ne || he) return;
  Lt++;
  const e = $t > oo ? 1 : $c;
  if (Lt > e) {
    ou();
    return;
  }
  Ci = Date.now(), Z = 0, Ee = Date.now();
  try {
    const t = Je();
    Se.takeFullSnapshot(!0), $t = Je() - t, x("replay_rebases"), $t > oo && x(
      "replay_expensive_snapshots"
    );
  } catch {
    xt(), Ot();
  }
}
function io() {
  x("replay_events_dropped");
}
function Li() {
  if (ge) return !1;
  ge = oe(), ki = Ps(), Ai = Os() ? "" : xo();
  const e = bn !== "" && bn !== ge;
  return bn = ge, e;
}
function Nt() {
  if (ru(), Xe.length === 0) return;
  if (ln(to)) {
    nu(), Mi();
    return;
  }
  Li();
  const e = ge, t = ki, n = Ai, r = Xe.splice(0), o = Ye;
  Ye = 0, ge = "", hr = !0, ar(
    to,
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
function nu() {
  Ye <= Fc || (x(
    "replay_events_dropped",
    Xe.length
  ), Xe.length = 0, Ye = 0, Rt());
}
let je = null;
function ru() {
  je && (clearTimeout(je), je = null);
}
function Mi() {
  if (je) return;
  const e = O().replayFlushIntervalMs ?? Hc;
  je = setTimeout(() => {
    je = null, Nt();
  }, e);
}
function Xn(e) {
  !ge && !oe() || (Li() && e.type !== Ti && Rt(!0), Xe.push(e), Ye += Xt(e), Xe.length >= Dc || Ye >= Nc ? Nt() : Mi());
}
function ou() {
  he = !0, x("replay_overload_pauses"), xt(), _e && clearTimeout(_e), _e = setTimeout(() => {
    _e = null, he = !1, Lt = 0, Z = 0, Ee = Date.now(), !ze && !Mt && ee && Ot();
  }, zc);
}
function iu(e) {
  if (he) return;
  if (e.type === Ti) {
    sn(), We = !1, Z = 0, Ee = Date.now(), Xn(e);
    return;
  }
  if (e.type === qc) {
    const r = e.data;
    typeof r.href == "string" && (r.href = is(r.href));
  }
  if (e.type !== Bc) {
    sn(), Xn(e);
    return;
  }
  if (We) {
    io(), Rt();
    return;
  }
  const t = Date.now();
  t - Ee > bi && (Z <= no && (Lt = 0), Z = 0, Ee = t);
  const n = yr.throttle(e);
  if (n.dropped > 0 && x(
    "replay_attributes_throttled",
    n.dropped
  ), !!n.event) {
    if (Z++, Z > no) {
      io(), Rt();
      return;
    }
    K.push(n.event), Ii();
  }
}
async function Ot() {
  if (ee && !he && !ne)
    return tt || (tt = su().finally(
      () => {
        tt = null;
      }
    ), tt);
}
async function su() {
  if (!ee) return;
  const { record: e } = await import("./rrweb-SbAupvcM.js");
  !ee || he || ne || (Se = e, We = !1, Z = 0, Ee = Date.now(), yr.reset(), ne = e({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: Kc() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: Jc,
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
        iu(t);
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
    blockSelector: bo,
    maskTextSelector: Ao,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => Nt(), 200));
}
function xt() {
  ne && (ne(), ne = null), Be && (clearTimeout(Be), Be = null), We = !1, sn(), Nt();
}
function au() {
  const e = O(), t = e.replayIdlePauseMs ?? Gc, n = e.replayIdleExpireMs ?? Qc;
  $e && clearTimeout($e), ve && (clearTimeout(ve), ve = null), $e = setTimeout(() => {
    ze = !0, xt();
  }, t), ve = setTimeout(() => {
    Mt = !0, xt();
  }, n);
}
function jt() {
  gr = Je(), au();
}
function cu() {
  if (Mt) {
    if (!Uo()) return;
    Mt = !1, ze = !1, Ot(), jt();
    return;
  }
  if (ze) {
    ze = !1, Ot(), jt();
    return;
  }
  Je() - gr >= Zc && jt();
}
function uu() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => cu(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  zt = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function lu() {
  zt && (zt(), zt = null), $e && (clearTimeout($e), $e = null), ve && (clearTimeout(ve), ve = null);
}
function fu() {
  sn(), Nt();
}
async function du() {
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
  }, Ea(() => {
    ne && Rt();
  }), ti(fu), await Ot(), uu(), jt();
}
function pu() {
  return ne !== null && !he;
}
function mu() {
  return hr;
}
function hu() {
  xt(), lu(), ti(null), _e && (clearTimeout(_e), _e = null), ze = !1, Mt = !1, gr = 0, he = !1, hr = !1, Lt = 0, Z = 0, $t = 0, K = [], Y = 0, yr.reset(), ee = null, Se = null;
}
let H = [], G = null;
const yu = [
  "error",
  "action",
  "console",
  "resource"
];
function gu(e) {
  return yu.includes(e) && (ln(e) || !Mc(e)) ? (x("events_rate_limited"), !0) : !1;
}
function Ri(e, t) {
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
function _u() {
  if (!G) {
    const e = navigator.userAgent;
    G = {
      device_type: Wu(e),
      browser_name: Ju(e),
      browser_version: Ku(e),
      os_name: Gu(e),
      os_version: Qu(e),
      user_agent: e,
      language: navigator.language
    };
  }
}
function vu() {
  const e = navigator.connection;
  return typeof (e == null ? void 0 : e.effectiveType) == "string" ? e.effectiveType : "";
}
function Oi(e) {
  _u();
  const t = Ds(), n = Oa(), r = O(), o = e ?? oe(), i = {
    event_id: Ke(),
    session_id: o,
    tab_id: xo(),
    view_id: yi(),
    action_id: cc(),
    ...us(
      Fo(),
      Hs(),
      Fs()
    ),
    user_status: Bs(),
    service: r.service,
    env: r.env ?? "",
    version: r.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: Ri(
      window.location,
      r.viewUrlQueryParams
    ),
    view_url_host: window.location.hostname,
    view_url_path: le(window.location.pathname),
    referrer_url: ss(document.referrer),
    device_type: G.device_type,
    browser_name: G.browser_name,
    browser_version: G.browser_version,
    os_name: G.os_name,
    os_version: G.os_version,
    user_agent: cs() ? G.user_agent : "",
    language: G.language,
    session_view_count: t.viewCount,
    session_error_count: t.errorCount,
    session_action_count: t.actionCount,
    replay_id: pu() && mu() ? o : ""
  };
  return Object.keys(n).length > 0 && (i.feature_flags = n), i;
}
function wu(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const xi = "events", Su = ["session_id", "event_type", "timestamp"];
let so = !1;
function Pi(e) {
  const t = O().beforeSend;
  if (typeof t != "function") return e;
  const n = {};
  for (const r of Su) n[r] = e[r];
  try {
    const r = t(e);
    if (r === null || r === !1) return null;
    if ($i(r))
      throw new Error("it returned a promise; it must be synchronous");
    return { ...r && typeof r == "object" ? r : e, ...n };
  } catch (r) {
    return so || (so = !0, Jn(
      `beforeSend failed. Events are dropped until it is fixed: ${String(r)}`
    )), null;
  }
}
function Ui(e) {
  xs() && (e.session_is_new = 1);
}
function D(e) {
  if (!oe() || !Po() || ln("events")) return;
  ic();
  const t = e(), n = t.event_type;
  if (gu(n)) return;
  n === "resource" && Du(t), Ho(n), Za(t), uc(t);
  const r = { ...Oi(), ...t };
  Ui(r);
  const o = Pi(r);
  o && ar(xi, o);
}
function _r(e) {
  wu(
    () => D(e)
  );
}
function Eu(e, t) {
  if (!Po() || ln("events")) return;
  e.view_update_seq === 1 && Ho("view");
  const n = {
    ...Oi(t),
    ...e,
    action_id: "",
    connection_type: vu(),
    screen_width: typeof screen < "u" ? screen.width : 0,
    screen_height: typeof screen < "u" ? screen.height : 0
  };
  e.view_update_seq === 1 && (n.view_is_new = 1), t === oe() && Ui(n);
  const r = Pi(n);
  r && Ca(
    xi,
    "view:" + String(e.view_id),
    r,
    (o, i) => {
      const s = { ...i }, c = o;
      return c.view_is_new === 1 && (s.view_is_new = 1), c.session_is_new === 1 && (s.session_is_new = 1), s;
    }
  );
}
function Tu(e) {
  D(() => e);
}
function bu() {
  oc(
    Eu,
    (e) => Ri(e, O().viewUrlQueryParams)
  ), mc(Tu), Au(), Lu(), Ou(), $u(), zu(), ju(), Vu();
}
function Au() {
  const e = (n) => {
    D(() => {
      var i, s, c;
      const r = n.message ?? "", o = typeof ((i = n.error) == null ? void 0 : i.message) == "string" ? n.error.message : r;
      return {
        event_type: "error",
        error_message: Et(r),
        error_type: ((s = n.error) == null ? void 0 : s.name) ?? "Error",
        error_stack: Qn(
          ((c = n.error) == null ? void 0 : c.stack) ?? "",
          o
        ),
        error_source: "source",
        error_handling: "unhandled"
      };
    });
  }, t = (n) => Di(n.reason);
  window.addEventListener("error", e), window.addEventListener(
    "unhandledrejection",
    t
  ), Yn = !0, H.push(() => {
    window.removeEventListener("error", e), window.removeEventListener(
      "unhandledrejection",
      t
    ), Yn = !1;
  });
}
let Yn = !1;
const ao = /* @__PURE__ */ new WeakSet();
function Di(e) {
  if (e !== null && typeof e == "object") {
    if (ao.has(e)) return;
    ao.add(e);
  }
  D(() => {
    const t = (e == null ? void 0 : e.message) ?? String(e);
    return {
      event_type: "error",
      error_message: Et(t),
      error_type: (e == null ? void 0 : e.name) ?? "UnhandledRejection",
      error_stack: Qn((e == null ? void 0 : e.stack) ?? "", t),
      error_source: "promise",
      error_handling: "unhandled"
    };
  });
}
let co = !1;
function rl() {
  const e = globalThis.Zone;
  if (co || !e || typeof e.__symbol__ != "function")
    return;
  co = !0;
  const t = e.__symbol__("unhandledPromiseRejectionHandler"), n = e[t];
  e[t] = function(r) {
    if (Yn)
      try {
        Di(
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
function ku(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${Ve} bytes omitted]`;
}
function Cu(e) {
  if (typeof e == "string") return e;
  if (Ni(e))
    return e.message ? `${e.name}: ${e.message}` : e.name;
  if (Xt(
    e,
    Ve + 1
  ) > Ve)
    return ku(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function Iu(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= Ve) break;
    t && (t += " "), t += Cu(n);
  }
  return t.length > Ve ? t.slice(0, Ve) + "… [truncated]" : t;
}
function Lu() {
  for (const e of as()) {
    const t = console[e], n = (...r) => {
      try {
        const o = Et(Iu(r)), i = e === "error" ? r.find(Ni) : void 0;
        D(() => {
          const s = {
            event_type: "console",
            console_level: e,
            console_message: o
          };
          return i && (s.error_type = i.name, s.error_message = Et(i.message), s.error_stack = Qn(
            i.stack ?? "",
            i.message
          ), s.error_source = "console", s.error_handling = "handled"), s;
        });
      } catch {
      }
      t.apply(console, r);
    };
    n[Eo] = t, console[e] = n, H.push(() => {
      console[e] = t;
    });
  }
}
const Wn = "oodle_rum_tab_hidden";
function uo(e) {
  try {
    e ? sessionStorage.setItem(Wn, "1") : sessionStorage.removeItem(Wn);
  } catch {
  }
}
function Mu() {
  try {
    return sessionStorage.getItem(Wn) === "1";
  } catch {
    return !1;
  }
}
function Ru() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && Mu() && (uo(!1), D(() => ({
    event_type: "visibility",
    action_type: "tab_visible"
  })));
  let e = document.visibilityState === "hidden";
  const t = () => {
    const n = document.visibilityState === "hidden";
    n !== e && (e = n, uo(n), D(() => ({
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
function vr(e) {
  const t = O().endpoint;
  return e.startsWith(t);
}
function Ou() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || vr(r.name))
          continue;
        const i = St(r.name), s = Hi(r), c = xu(o, r.name);
        _r(
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
function xu(e, t) {
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
function Hi(e) {
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
function Fi(e, t) {
  try {
    const n = performance.getEntriesByName(
      Bi(e),
      "resource"
    );
    for (let r = n.length - 1; r >= 0; r--) {
      const o = n[r];
      if (o.startTime >= t - 2)
        return {
          ...Hi(o),
          resource_size: o.transferSize ?? 0
        };
    }
  } catch {
  }
  return {};
}
function an(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function Bi(e) {
  try {
    return new URL(e, location.href).href;
  } catch {
    return e;
  }
}
function An(e, t, n) {
  return n.some(
    (r) => typeof r == "string" ? e.startsWith(r) || t.startsWith(r) : r.test(e) || r.test(t)
  );
}
function qi(e) {
  const t = Bi(e), n = O();
  let r = !1;
  const o = n.allowedTracingUrls;
  o && o.length > 0 && (r = An(
    t,
    e,
    o
  ));
  let i = null;
  const s = n.forwardNetworkBodies;
  s && An(
    t,
    e,
    s.urls
  ) && (i = s);
  let c = !1;
  const a = n.forwardNetworkHeaders;
  return a && (c = An(
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
let lo = null, fo = wi(void 0);
function wt(e) {
  const t = O().redactHeaders;
  return t !== lo && (lo = t, fo = wi(t)), fo(e);
}
function Pu(e) {
  const t = {};
  for (const n of Object.keys(e)) {
    const r = n.toLowerCase();
    wt(r) || (t[r] = e[n]);
  }
  return t;
}
const po = [
  "request_headers",
  "response_headers",
  "request_body",
  "response_body"
];
let mo = !1;
function $i(e) {
  return !!e && (typeof e == "object" || typeof e == "function") && typeof e.then == "function";
}
function ho(e) {
  if (!(typeof e != "string" || !e))
    try {
      const t = JSON.parse(e);
      return t && typeof t == "object" ? t : void 0;
    } catch {
      return;
    }
}
function yo(e) {
  if (!e || typeof e != "object") return "";
  const t = {};
  for (const [n, r] of Object.entries(e))
    r != null && (t[n.toLowerCase()] = String(r));
  return Object.keys(t).length > 0 ? JSON.stringify(t) : "";
}
let go = null, _o = Si(void 0);
function Uu() {
  const e = O().redactBodyKeys;
  return e !== go && (go = e, _o = Si(e)), _o;
}
function Du(e) {
  var c;
  if (!po.some((a) => e[a])) return;
  for (const a of ["request_body", "response_body"])
    typeof e[a] == "string" && e[a] && (e[a] = kc(e[a], Uu()));
  const t = O().beforeSendNetwork;
  if (typeof t != "function") return;
  const n = {
    url: String(e.resource_url ?? ""),
    method: String(e.resource_method ?? ""),
    status: Number(e.resource_status ?? 0),
    requestHeaders: ho(e.request_headers),
    responseHeaders: ho(e.response_headers),
    requestBody: typeof e.request_body == "string" ? e.request_body : void 0,
    responseBody: typeof e.response_body == "string" ? e.response_body : void 0
  };
  let r;
  try {
    const a = t(n);
    if ($i(a))
      throw new Error("it returned a promise; it must be synchronous");
    r = a === void 0 ? n : a;
  } catch (a) {
    mo || (mo = !0, Jn(
      `beforeSendNetwork failed. Captured headers and bodies are dropped until it is fixed: ${String(a)}`
    )), r = null;
  }
  for (const a of po) delete e[a];
  if (!r || typeof r != "object") return;
  const o = ((c = O().forwardNetworkBodies) == null ? void 0 : c.maxBodySize) ?? 65536, i = yo(r.requestHeaders), s = yo(r.responseHeaders);
  i && (e.request_headers = i), s && (e.response_headers = s), typeof r.requestBody == "string" && r.requestBody && (e.request_body = de(r.requestBody, o)), typeof r.responseBody == "string" && r.responseBody && (e.response_body = de(r.responseBody, o));
}
function zi(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      wt(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      wt(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      wt(r) || (t[r] = e[n]);
    }
  return t;
}
function Nu(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    wt(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function de(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function Hu(e, t) {
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
function Fu(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function Bu(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      zi(
        e
      )
    );
  } catch {
    return "";
  }
}
function vo(e) {
  try {
    return JSON.stringify(
      zi(e)
    );
  } catch {
    return "";
  }
}
function ji(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function qu(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: de(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: de(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : ji(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => de(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function Vi(e, t, n) {
  const r = function(o, i) {
    const s = Fu(o);
    if (vr(s))
      return t.apply(e, [
        o,
        i
      ]);
    const c = ji(o), a = ((i == null ? void 0 : i.method) ?? (c ? o.method : "GET")).toUpperCase(), l = performance.now(), u = qi(s);
    oi();
    let f = !1;
    const h = () => {
      f || (f = !0, ii());
    };
    let m = "", g = "";
    if (n.injectTracing) {
      const E = Ei();
      if (E)
        m = E.traceId, g = E.spanId;
      else if (u.trace) {
        m = an(16), g = an(8);
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
      const E = u.bodyCfg.maxBodySize ?? 65536, A = qu(
        i,
        o,
        E
      );
      _ = A.sync, k = A.asyncP;
    }
    let C = "";
    return u.captureHeaders && (i != null && i.headers ? C = Bu(
      i.headers
    ) : c && (C = vo(
      o.headers
    ))), t.apply(e, [o, i]).then((E) => {
      h();
      const A = E.status, L = Math.round(
        performance.now() - l
      );
      let y = "";
      u.captureHeaders && (y = vo(
        E.headers
      ));
      const v = (p) => {
        const d = {
          event_type: "resource",
          resource_url: St(s),
          resource_method: a,
          resource_status: A,
          resource_duration_ms: L,
          resource_size: 0,
          resource_type: "fetch",
          ...Fi(s, l)
        };
        return m && (d.trace_id = m, d.span_id = g), p && (d.request_body = p), C && (d.request_headers = C), y && (d.response_headers = y), d;
      }, w = k || Promise.resolve(_);
      if (u.bodyCfg) {
        const p = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          w,
          Hu(
            E.clone(),
            p
          ).catch(() => "")
        ]).then(([d, M]) => {
          D(() => {
            const W = v(d);
            return M && (W.response_body = M), W;
          });
        }).catch(() => {
          w.then((d) => {
            D(
              () => v(d)
            );
          });
        });
      } else
        w.then((p) => {
          D(() => v(p));
        });
      return E;
    }).catch((E) => {
      h();
      const A = Math.round(
        performance.now() - l
      );
      throw (k || Promise.resolve(_)).then((y) => {
        D(() => {
          const v = {
            event_type: "resource",
            resource_url: St(s),
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
function Xi(e, t, n) {
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
    if (vr(c))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const a = qi(c);
    let l = "", u = "";
    if (n.injectTracing) {
      const y = Ei();
      y ? (l = y.traceId, u = y.spanId) : a.trace && (l = an(16), u = an(8), i.call(
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
        const y = this.__oodleReqHeaders, v = y ? Pu(y) : {};
        Object.keys(v).length > 0 && (h = JSON.stringify(v));
      } catch {
      }
    const m = performance.now(), g = this;
    oi();
    const _ = l, k = u, C = f, E = a.bodyCfg, A = h, L = a.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        ii();
        const y = Math.round(
          performance.now() - m
        ), v = g.__oodleMethod ?? "GET";
        D(() => {
          const w = {
            event_type: "resource",
            resource_url: St(c),
            resource_method: v,
            resource_status: g.status,
            resource_duration_ms: y,
            resource_size: 0,
            resource_type: "xhr",
            ...Fi(c, m)
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
                Nu(p)
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
const Yi = {
  injectTracing: !0
}, wo = {
  injectTracing: !1
};
function $u() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = Vi(
    window,
    window.fetch,
    Yi
  );
  H.push(e);
}
function zu() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = Xi(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    Yi
  );
  H.push(e);
}
const So = /* @__PURE__ */ new WeakSet();
function kn(e) {
  if (So.has(e)) return;
  So.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (Vi(
        n,
        n.fetch,
        wo
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (Xi(
        r.prototype,
        r.prototype.setRequestHeader,
        wo
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), H.push(() => {
    e.removeEventListener("load", t);
  });
}
function ju() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach(kn);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          r instanceof HTMLIFrameElement && kn(r), r instanceof HTMLElement && r.childElementCount > 0 && r.querySelectorAll("iframe").forEach(kn);
    }
  );
  e.observe(document.documentElement, {
    childList: !0,
    subtree: !0
  }), H.push(() => {
    e.disconnect();
  });
}
function Vu() {
  if (!(typeof PerformanceObserver > "u") && !Xu())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            _r(() => ({
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
function Xu() {
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
          _r(() => ({
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
function Yu(e, t) {
  D(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function Wu(e) {
  return /iPad|Tablet/i.test(e) || /Android/i.test(e) && !/Mobi/i.test(e) ? "tablet" : /Mobi|iPhone|iPod|Android/i.test(e) ? "mobile" : "desktop";
}
const Wi = [
  ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
  ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
  ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
  ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
  ["Safari", /Version\/([\d.]+).*Safari/]
];
function Ju(e) {
  for (const [t, n] of Wi) if (n.test(e)) return t;
  return e.includes("Safari") ? "Safari" : "Other";
}
function Ku(e) {
  for (const [, t] of Wi) {
    const n = e.match(t);
    if (n) return n[1];
  }
  return "";
}
function Gu(e) {
  return /iPhone|iPad|iPod/.test(e) ? "iOS" : e.includes("Android") ? "Android" : e.includes("CrOS") ? "Chrome OS" : e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : "Other";
}
function Qu(e) {
  let t = e.match(/OS (\d+[_.]\d+(?:[_.]\d+)?) like Mac OS X/);
  return t ? t[1].replace(/_/g, ".") : (t = e.match(/Android ([\d.]+)/), t || (t = e.match(/Windows NT ([\d.]+)/), t) ? t[1] : (t = e.match(/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/), t ? t[1].replace(/_/g, ".") : ""));
}
function Zu() {
  _i(), gi();
  for (const e of H)
    e();
  H = [];
}
let ye = !1;
const ol = {
  init(e) {
    ye || Ss(e) && ($s(e.tags), Is(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), ye = !0, Mn(), Ru(), Hr(), Us(), Ws(), La(() => {
      Hr();
    }), e.sessionReplay !== !1 && Uo() && du(), bu(), e.openTelemetry && import("./tracing-CpmRfDmC.js").then(
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
    zs(e);
  },
  identify(e) {
    Ns(e);
  },
  trackEvent(e, t) {
    ye && Yu(e, t);
  },
  addFeatureFlag(e, t) {
    Ra(e, t);
  },
  getSessionId() {
    return ye ? oe() : "";
  },
  getUserId() {
    return Fo();
  },
  flush() {
    ye && re();
  },
  stop() {
    ye && (hu(), Zu(), Js(), No(), re(!0), xa(), Ma(), ye = !1);
  }
};
export {
  ol as O,
  tl as a,
  rl as c,
  el as r,
  nl as s
};
