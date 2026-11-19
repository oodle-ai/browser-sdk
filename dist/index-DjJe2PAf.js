const bo = "__oodleOriginal";
function Jn(e) {
  try {
    const t = console.warn;
    (t[bo] ?? t).call(
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
function Qi() {
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
let T = Qi();
const gn = "/:redacted", Zi = 256, rt = /* @__PURE__ */ new Map();
let Cn = !1;
const be = Jn;
function Ie(e, t, n, r, o) {
  return t === void 0 ? r : typeof t == "string" && n.includes(t) ? t : (be(
    `${e} must be one of ${n.map((i) => `'${i}'`).join(", ")}. Using '${o}'.`
  ), o);
}
function es(e) {
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
function ts(e) {
  if (e === void 0) return [];
  if (!Array.isArray(e))
    return be(
      "urlPathPatterns must be an array of path patterns such as '/projects/:id'. It is ignored."
    ), [];
  const t = [];
  for (const n of e) {
    const r = es(n);
    r ? t.push(r) : be(
      `urlPathPatterns: ${JSON.stringify(n)} is not a valid pattern. Patterns start with '/', use ':name' for one segment and may end in '/*'. It is ignored.`
    );
  }
  return t;
}
function ns(e) {
  if (e === void 0) return Ht;
  if (!Array.isArray(e))
    return be(
      "consoleLevels must be an array such as ['error']. Console capture is off."
    ), [];
  const t = Ht.filter(
    (n) => e.includes(n)
  );
  return e.some(
    (n) => !Ht.includes(n)
  ) && be(
    "consoleLevels accepts only 'error' and 'warn'. Other values are ignored."
  ), t;
}
function rs(e) {
  rt.clear(), Cn = !1;
  const t = e.maskUrlPath;
  t !== void 0 && typeof t != "function" && be("maskUrlPath must be a function. It is ignored."), T = {
    patterns: ts(e.urlPathPatterns),
    maskFn: typeof t == "function" ? t : null,
    referrer: Ie(
      "referrerUrl",
      e.referrerUrl,
      ["path", "origin", "none"],
      "path",
      "none"
    ),
    consoleLevels: ns(
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
  return T.patterns.length > 0 || T.maskFn !== null;
}
function os(e) {
  const t = e.split("/").slice(1), n = t.length > 0 && t[t.length - 1] === "";
  n && t.pop();
  for (const r of T.patterns) {
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
function is(e) {
  let t = T.patterns.length > 0 ? os(e) : e;
  if (T.maskFn)
    try {
      const n = T.maskFn(t);
      t = typeof n == "string" ? n : gn;
    } catch (n) {
      Cn || (Cn = !0, be(
        `maskUrlPath threw. Paths are sent as '${gn}' until it is fixed: ${String(n)}`
      )), t = gn;
    }
  return t;
}
function le(e) {
  if (!Kn()) return e;
  const t = rt.get(e);
  if (t !== void 0) return t;
  const n = is(e);
  return rt.size >= Zi && rt.clear(), rt.set(e, n), n;
}
function ss(e) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(e);
}
function Et(e, t) {
  if (ss(e)) {
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
function sl() {
  return Kn() || T.queryStrings === "all";
}
function as(e) {
  return T.queryStrings !== "all" ? To(e) : typeof e != "string" ? e : Gn(e, (t) => {
    const n = T.keepParams;
    if (n.length === 0 || !t.search) return "";
    const r = new URLSearchParams();
    t.searchParams.forEach((i, s) => {
      n.includes(s) && r.append(s, i);
    });
    const o = r.toString();
    return o ? "?" + o : "";
  });
}
function al(e) {
  return T.queryStrings !== "all" ? To(e) : typeof e != "string" ? e : Gn(e, () => "");
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
let Ar = null, kr = "", Cr = null;
function cs(e) {
  if (e === Ar && Cr === T)
    return kr;
  let t = "";
  if (e && T.referrer !== "none")
    try {
      const n = new URL(e);
      t = T.referrer === "origin" ? n.origin : n.origin + le(n.pathname);
    } catch {
      t = T.referrer === "origin" ? "" : e;
    }
  return Ar = e, kr = t, Cr = T, t;
}
function us() {
  return T.consoleLevels;
}
function ls() {
  return T.userAgent === "full";
}
function fs(e, t, n) {
  switch (T.userInfo) {
    case "full":
      return { user_id: e, user_name: t, user_email: n };
    case "id":
      return { user_id: e, user_name: "", user_email: "" };
    default:
      return { user_id: "", user_name: "", user_email: "" };
  }
}
const ds = [
  [/(^|[^\w])'(?:[^'\\\n]|\\.){0,500}'/g, "$1'?'"],
  [/(^|[^\w])"(?:[^"\\\n]|\\.){0,500}"/g, '$1"?"'],
  [/(^|[^\w])`(?:[^`\\\n]|\\.){0,500}`/g, "$1`?`"]
], ps = /\bhttps?:\/\/[^\s'"`<>()\]]+/g, ms = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, hs = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, ys = /\b(?=[0-9a-fA-F]*\d)(?=[0-9a-fA-F]*[a-fA-F])[0-9a-fA-F]{16,}\b/g, gs = /\d{4,}/g, Ir = 8192;
function _s(e) {
  if (!e) return e;
  let t = e.length > Ir ? e.slice(0, Ir) + "… [truncated]" : e;
  t = t.replace(ps, (n) => Et(n)), t.includes("@") && (t = t.replace(ms, "<email>"));
  for (const [n, r] of ds)
    t = t.replace(n, r);
  return t = t.replace(hs, "<id>"), t = t.replace(ys, "<id>"), t = t.replace(gs, "<n>"), t;
}
const vs = /^\s+at |^[^\s@]*@\S+:\d+(?::\d+)?$/m;
function bt(e) {
  switch (T.messages) {
    case "full":
      return e;
    case "scrub":
      return _s(e);
    default:
      return "";
  }
}
function Qn(e, t) {
  if (T.messages === "full" || !e || !t) return e;
  const n = vs.exec(e), r = n ? n.index : e.length, o = e.indexOf(t);
  if (o < 0 || o + t.length > r)
    return e;
  const i = bt(t);
  let s = e.slice(0, o) + i;
  return i || (s = s.replace(/:\s*$/, "")), s + e.slice(o + t.length);
}
const Ao = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', ko = '[data-oodle-privacy="mask"],.oodle-privacy-mask', ws = Ao + "," + ko + ",.rr-block,.rr-mask";
function Ss(e) {
  if (T.actionText === "mask") return !0;
  try {
    return typeof e.closest == "function" && e.closest(ws) !== null;
  } catch {
    return !0;
  }
}
let In = null;
function Es(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function bs(e) {
  if (!Es(e.endpoint))
    return console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    ), !1;
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  );
  const t = Ts(
    e.viewUrlQueryParams
  );
  return rs({ ...e, viewUrlQueryParams: t }), In = { ...e, viewUrlQueryParams: t }, !0;
}
function Ts(e) {
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
const Zn = "__oodle_session_v2", er = "__oodle_tab", Lr = "__oodle_session", Co = 900 * 1e3, tr = 14400 * 1e3, Io = 1e3;
function Ge() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
let it = null, $ = null;
function nr(e, t) {
  try {
    const n = e == null ? void 0 : e.getItem(t);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function rr(e, t, n) {
  try {
    e == null || e.setItem(t, JSON.stringify(n));
  } catch {
  }
}
function Lo() {
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
const As = 1e3;
let Xe = 0;
function fe() {
  const e = Date.now();
  if (it && e - Xe < As) return it;
  Xe = e;
  const t = nr(Lo(), Zn);
  return t && typeof t.id == "string" && t.id ? ks({
    id: t.id,
    createdAt: t.createdAt ?? Date.now(),
    lastActivity: t.lastActivity ?? Date.now(),
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: t.started ?? !0
  }) : it;
}
function ks(e) {
  return e && (it = e), e;
}
function cn(e) {
  it = e, Xe = Date.now(), rr(Lo(), Zn, e);
}
function Mo() {
  if ($) return $;
  const e = nr(Tt(), er);
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
function Cs(e) {
  $ = e, rr(Tt(), er, e);
}
let Re = null;
function Is(e) {
  $ = e, !Re && (Re = setTimeout(() => {
    Re = null, $ && rr(Tt(), er, $);
  }, 1e3));
}
function Pt(e) {
  Re && (clearTimeout(Re), Re = null), Cs(e);
}
let Ro = 100, Oo = 100;
function Ls(e, t) {
  Ro = Math.max(0, Math.min(100, e)), Oo = Math.max(0, Math.min(100, t));
}
function Mr(e) {
  return Math.random() * 100 < e;
}
function Vt(e, t) {
  return !!e && t - e.lastActivity <= Co && t - e.createdAt <= tr;
}
function Ms(e) {
  var r;
  const t = nr(Tt(), Lr);
  if (!t || typeof t.id != "string") return !1;
  const n = {
    id: t.id,
    createdAt: t.createdAt ?? e,
    lastActivity: t.lastActivity ?? e,
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: !0
  };
  if (e - n.lastActivity > 1800 * 1e3 || e - n.createdAt > tr)
    return !1;
  cn(n), Pt({
    tabId: Ge(),
    sessionId: n.id,
    viewCount: t.viewCount ?? 0,
    errorCount: t.errorCount ?? 0,
    actionCount: t.actionCount ?? 0,
    replaySegmentSeq: t.replaySegmentSeq ?? 0,
    legacyReplay: !0
  });
  try {
    (r = Tt()) == null || r.removeItem(Lr);
  } catch {
  }
  return !0;
}
function Rs(e) {
  const t = Mr(Ro), n = {
    id: Ge(),
    createdAt: e,
    lastActivity: e,
    sampled: t,
    replaySampled: t && Mr(Oo),
    started: !1
  };
  return cn(n), n;
}
const Ln = /* @__PURE__ */ new Set();
function Os(e) {
  return Ln.add(e), () => Ln.delete(e);
}
function Ut() {
  let e = Mo();
  return e || (e = {
    tabId: Ge(),
    sessionId: "",
    viewCount: 0,
    errorCount: 0,
    actionCount: 0,
    replaySegmentSeq: 0,
    legacyReplay: !1
  }, Pt(e)), e;
}
function xo(e) {
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
  let t = fe();
  Vt(t, e) || (Xe = 0, t = fe()), Vt(t, e) ? e - _n >= Io && (t.lastActivity = Math.max(t.lastActivity, e), cn(t), _n = e) : (Ms(e) ? t = fe() : t = Rs(e), _n = e), t && xo(t.id);
}
function oe() {
  const e = Date.now(), t = fe();
  return Vt(t, e) ? (xo(t.id), t.id) : "";
}
function xs(e) {
  Xe = 0;
  const t = fe();
  if (!t || t.id !== e) return null;
  const n = Math.min(
    t.lastActivity + Co,
    t.createdAt + tr
  );
  return Date.now() > n ? n : null;
}
function Po() {
  return Ut().tabId;
}
function Ps() {
  return Ut().legacyReplay;
}
function Us() {
  const e = Date.now(), t = fe();
  return !Vt(t, e) || t.started ? !1 : (t.started = !0, cn(t), !0);
}
function Ds() {
  if (!oe()) return 0;
  const e = Ut(), t = e.replaySegmentSeq;
  return e.replaySegmentSeq = t + 1, Pt(e), t;
}
function Uo() {
  const e = fe();
  return (e == null ? void 0 : e.sampled) ?? !0;
}
function Do() {
  const e = fe();
  return (e == null ? void 0 : e.replaySampled) ?? !0;
}
let st = null, at = null, ct = null;
const No = ["click", "keydown", "touchstart", "scroll"];
function Ns() {
  if (typeof document > "u") return;
  Ho();
  let e = 0;
  st = () => {
    const t = Date.now();
    t - e < Io || (e = t, Mn());
  };
  for (const t of No)
    document.addEventListener(t, st, {
      capture: !0,
      passive: !0
    });
  ct = (t) => {
    t.key === Zn && (Xe = 0);
  }, window.addEventListener("storage", ct), at = () => {
    document.visibilityState === "visible" ? Mn() : $ && Pt($);
  }, document.addEventListener("visibilitychange", at);
}
function Ho() {
  if (!(typeof document > "u")) {
    if (st) {
      for (const e of No)
        document.removeEventListener(e, st, {
          capture: !0
        });
      st = null;
    }
    at && (document.removeEventListener("visibilitychange", at), at = null), ct && (window.removeEventListener("storage", ct), ct = null);
  }
}
function Fo(e) {
  if (!oe()) return;
  const t = Ut();
  e === "view" || e === "page_load" ? t.viewCount++ : e === "error" ? t.errorCount++ : e === "action" && t.actionCount++, Is(t);
}
function Hs() {
  const e = $ ?? Mo();
  return {
    viewCount: (e == null ? void 0 : e.viewCount) ?? 0,
    errorCount: (e == null ? void 0 : e.errorCount) ?? 0,
    actionCount: (e == null ? void 0 : e.actionCount) ?? 0
  };
}
let z = null;
function Fs(e) {
  z = e;
}
function Bo() {
  return (z == null ? void 0 : z.id) ?? "";
}
function Bs() {
  return (z == null ? void 0 : z.name) ?? "";
}
function qs() {
  return (z == null ? void 0 : z.email) ?? "";
}
function $s() {
  return z ? "identified" : "anonymous";
}
const zs = 5e5;
function Xt(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > zs) return n;
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
function js(e) {
  e && (At = { ...e, ...At });
}
function Vs(e) {
  At = { ...At, ...e };
}
function Xs() {
  return At;
}
const Ys = 6e4, Ws = "sdk_telemetry", Oe = {
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
function Js() {
  for (const e in Oe)
    if (Oe[e] > 0)
      return !0;
  return !1;
}
function Rn() {
  if (!Js()) return;
  const e = { ...Oe };
  for (const t in Oe)
    Oe[t] = 0;
  cr(Ws, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let ut = null, lt = null;
function Ks() {
  ut || (ut = setInterval(
    Rn,
    Ys
  ), typeof document < "u" && (lt = () => {
    document.visibilityState === "hidden" && Rn();
  }, document.addEventListener(
    "visibilitychange",
    lt
  )));
}
function Gs() {
  ut && (clearInterval(ut), ut = null), lt && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    lt
  ), lt = null), Rn();
}
var N = Uint8Array, U = Uint16Array, or = Int32Array, ir = new N([
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
]), sr = new N([
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
]), Rr = new N([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), qo = function(e, t) {
  for (var n = new U(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new or(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, $o = qo(ir, 2), Qs = $o.b, On = $o.r;
Qs[28] = 258, On[258] = 28;
var Zs = qo(sr, 0), Or = Zs.r, xn = new U(32768);
for (var b = 0; b < 32768; ++b) {
  var se = (b & 43690) >> 1 | (b & 21845) << 1;
  se = (se & 52428) >> 2 | (se & 13107) << 2, se = (se & 61680) >> 4 | (se & 3855) << 4, xn[b] = ((se & 65280) >> 8 | (se & 255) << 8) >> 1;
}
var ft = (function(e, t, n) {
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
        for (var l = o << 4 | e[o], u = t - e[o], f = s[e[o] - 1]++ << u, m = f | (1 << u) - 1; f <= m; ++f)
          c[xn[f] >> a] = l;
  } else
    for (c = new U(r), o = 0; o < r; ++o)
      e[o] && (c[o] = xn[s[e[o] - 1]++] >> 15 - e[o]);
  return c;
}), Te = new N(288);
for (var b = 0; b < 144; ++b)
  Te[b] = 8;
for (var b = 144; b < 256; ++b)
  Te[b] = 9;
for (var b = 256; b < 280; ++b)
  Te[b] = 7;
for (var b = 280; b < 288; ++b)
  Te[b] = 8;
var Yt = new N(32);
for (var b = 0; b < 32; ++b)
  Yt[b] = 5;
var ea = /* @__PURE__ */ ft(Te, 9, 0), ta = /* @__PURE__ */ ft(Yt, 5, 0), zo = function(e) {
  return (e + 7) / 8 | 0;
}, jo = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new N(e.subarray(t, n));
}, J = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, et = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, vn = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: Xo, l: 0 };
  if (o == 1) {
    var s = new N(n[0].s + 1);
    return s[n[0].s] = 1, { t: s, l: 1 };
  }
  n.sort(function(y, w) {
    return y.f - w.f;
  }), n.push({ s: -1, f: 25001 });
  var c = n[0], a = n[1], l = 0, u = 1, f = 2;
  for (n[0] = { s: -1, f: c.f + a.f, l: c, r: a }; u != o - 1; )
    c = n[n[l].f < n[f].f ? l++ : f++], a = n[l != u && n[l].f < n[f].f ? l++ : f++], n[u++] = { s: -1, f: c.f + a.f, l: c, r: a };
  for (var m = i[0].s, r = 1; r < o; ++r)
    i[r].s > m && (m = i[r].s);
  var h = new U(m + 1), g = Pn(n[u - 1], h, 0);
  if (g > t) {
    var r = 0, v = 0, k = g - t, C = 1 << k;
    for (i.sort(function(w, S) {
      return h[S.s] - h[w.s] || w.f - S.f;
    }); r < o; ++r) {
      var E = i[r].s;
      if (h[E] > t)
        v += C - (1 << g - h[E]), h[E] = t;
      else
        break;
    }
    for (v >>= k; v > 0; ) {
      var A = i[r].s;
      h[A] < t ? v -= 1 << t - h[A]++ - 1 : ++r;
    }
    for (; r >= 0 && v; --r) {
      var L = i[r].s;
      h[L] == t && (--h[L], ++v);
    }
    g = t;
  }
  return { t: new N(h), l: g };
}, Pn = function(e, t, n) {
  return e.s == -1 ? Math.max(Pn(e.l, t, n + 1), Pn(e.r, t, n + 1)) : t[e.s] = n;
}, xr = function(e) {
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
}, tt = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, Vo = function(e, t, n) {
  var r = n.length, o = zo(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, Pr = function(e, t, n, r, o, i, s, c, a, l, u) {
  J(t, u++, n), ++o[256];
  for (var f = vn(o, 15), m = f.t, h = f.l, g = vn(i, 15), v = g.t, k = g.l, C = xr(m), E = C.c, A = C.n, L = xr(v), y = L.c, w = L.n, S = new U(19), p = 0; p < E.length; ++p)
    ++S[E[p] & 31];
  for (var p = 0; p < y.length; ++p)
    ++S[y[p] & 31];
  for (var d = vn(S, 7), M = d.t, W = d.l, P = 19; P > 4 && !M[Rr[P - 1]]; --P)
    ;
  var Ae = l + 5 << 3, F = tt(o, Te) + tt(i, Yt) + s, B = tt(o, m) + tt(i, v) + s + 14 + 3 * P + tt(S, M) + 2 * S[16] + 3 * S[17] + 7 * S[18];
  if (a >= 0 && Ae <= F && Ae <= B)
    return Vo(t, u, e.subarray(a, a + l));
  var j, I, q, ie;
  if (J(t, u, 1 + (B < F)), u += 2, B < F) {
    j = ft(m, h, 0), I = m, q = ft(v, k, 0), ie = v;
    var pn = ft(M, W, 0);
    J(t, u, A - 257), J(t, u + 5, w - 1), J(t, u + 10, P - 4), u += 14;
    for (var p = 0; p < P; ++p)
      J(t, u + 3 * p, M[Rr[p]]);
    u += 3 * P;
    for (var V = [E, y], Ze = 0; Ze < 2; ++Ze)
      for (var ke = V[Ze], p = 0; p < ke.length; ++p) {
        var X = ke[p] & 31;
        J(t, u, pn[X]), u += M[X], X > 15 && (J(t, u, ke[p] >> 5 & 127), u += ke[p] >> 12);
      }
  } else
    j = ea, I = Te, q = ta, ie = Yt;
  for (var p = 0; p < c; ++p) {
    var R = r[p];
    if (R > 255) {
      var X = R >> 18 & 31;
      et(t, u, j[X + 257]), u += I[X + 257], X > 7 && (J(t, u, R >> 23 & 31), u += ir[X]);
      var Ce = R & 31;
      et(t, u, q[Ce]), u += ie[Ce], Ce > 3 && (et(t, u, R >> 5 & 8191), u += sr[Ce]);
    } else
      et(t, u, j[R]), u += I[R];
  }
  return et(t, u, j[256]), u + I[256];
}, na = /* @__PURE__ */ new or([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Xo = /* @__PURE__ */ new N(0), ra = function(e, t, n, r, o, i) {
  var s = i.z || e.length, c = new N(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = c.subarray(r, c.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (a[0] = i.r >> 3);
    for (var f = na[t - 1], m = f >> 13, h = f & 8191, g = (1 << n) - 1, v = i.p || new U(32768), k = i.h || new U(g + 1), C = Math.ceil(n / 3), E = 2 * C, A = function(yn) {
      return (e[yn] ^ e[yn + 1] << C ^ e[yn + 2] << E) & g;
    }, L = new or(25e3), y = new U(288), w = new U(32), S = 0, p = 0, d = i.i || 0, M = 0, W = i.w || 0, P = 0; d + 2 < s; ++d) {
      var Ae = A(d), F = d & 32767, B = k[Ae];
      if (v[F] = B, k[Ae] = F, W <= d) {
        var j = s - d;
        if ((S > 7e3 || M > 24576) && (j > 423 || !l)) {
          u = Pr(e, a, 0, L, y, w, p, M, P, d - P, u), M = S = p = 0, P = d;
          for (var I = 0; I < 286; ++I)
            y[I] = 0;
          for (var I = 0; I < 30; ++I)
            w[I] = 0;
        }
        var q = 2, ie = 0, pn = h, V = F - B & 32767;
        if (j > 2 && Ae == A(d - V))
          for (var Ze = Math.min(m, j) - 1, ke = Math.min(32767, d), X = Math.min(258, j); V <= ke && --pn && F != B; ) {
            if (e[d + q] == e[d + q - V]) {
              for (var R = 0; R < X && e[d + R] == e[d + R - V]; ++R)
                ;
              if (R > q) {
                if (q = R, ie = V, R > Ze)
                  break;
                for (var Ce = Math.min(V, R - 2), Sr = 0, I = 0; I < Ce; ++I) {
                  var mn = d - V + I & 32767, Gi = v[mn], Er = mn - Gi & 32767;
                  Er > Sr && (Sr = Er, B = mn);
                }
              }
            }
            F = B, B = v[F], V += F - B & 32767;
          }
        if (ie) {
          L[M++] = 268435456 | On[q] << 18 | Or[ie];
          var br = On[q] & 31, Tr = Or[ie] & 31;
          p += ir[br] + sr[Tr], ++y[257 + br], ++w[Tr], W = d + q, ++S;
        } else
          L[M++] = e[d], ++y[e[d]];
      }
    }
    for (d = Math.max(d, W); d < s; ++d)
      L[M++] = e[d], ++y[e[d]];
    u = Pr(e, a, l, L, y, w, p, M, P, d - P, u), l || (i.r = u & 7 | a[u / 8 | 0] << 3, u -= 7, i.h = k, i.p = v, i.i = d, i.w = W);
  } else {
    for (var d = i.w || 0; d < s + l; d += 65535) {
      var hn = d + 65535;
      hn >= s && (a[u / 8 | 0] = l, hn = s), u = Vo(a, u + 1, e.subarray(d, hn));
    }
    i.i = s;
  }
  return jo(c, 0, r + zo(u) + o);
}, oa = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), ia = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = oa[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, sa = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new N(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return ra(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, Un = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, aa = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && Un(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, ca = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function ua(e, t) {
  t || (t = {});
  var n = ia(), r = e.length;
  n.p(e);
  var o = sa(e, t, ca(t), 8), i = o.length;
  return aa(o, t), Un(o, i - 8, n.d()), Un(o, i - 4, r), o;
}
var Ur = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), la = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), fa = 0;
try {
  la.decode(Xo, { stream: !0 }), fa = 1;
} catch {
}
function da(e, t) {
  var n;
  if (Ur)
    return Ur.encode(e);
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
  return jo(o, 0, i);
}
function Ft(e) {
  try {
    return ua(da(e));
  } catch {
    return null;
  }
}
const pa = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function ma(e) {
  if (!pa)
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
const ha = "0.7.0", Dr = 5e3, Yo = 50, Wo = 5e5, Nr = 256e3, Wt = "replay", Jo = 8e4, Ko = 32, ya = 2e7, ga = 5, _a = 1e3, va = 6e4, wa = 500, Jt = 63e3;
let xe = 0, Pe = 0, ae = [], dt = 0, wn = null;
const Kt = /* @__PURE__ */ new Map();
let Ue = null, De = null, Dn = null, pt = !1;
function Sa() {
  try {
    return O().flushIntervalMs ?? Dr;
  } catch {
    return Dr;
  }
}
function Go(e) {
  let t = Kt.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, Kt.set(e, t)), t;
}
function Qo(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (x("compression_failures"), { body: t, encoding: "" });
}
async function Zo(e) {
  return Qo(await ma(e), e);
}
function Ea(e) {
  return Qo(Ft(e), e);
}
const ba = 64e3;
function Nn(e, t, n) {
  if (e === Wt)
    return {
      bytes: n ?? Xt(
        t,
        ba
      ),
      oversized: !1
    };
  const r = Xt(
    t,
    Nr + 1
  );
  return {
    bytes: r,
    oversized: r > Nr
  };
}
let Hn = null;
function Ta(e) {
  Hn = e;
}
function un(e) {
  x("transport_drops"), e === Wt && Hn && Hn();
}
const Aa = "/v1/rum/ingest";
function ka(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: ha
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
function Ca(e, t, n) {
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
  const { body: o, encoding: i } = Ea(n), s = { ...t };
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
  if (dt + o > ya) {
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
  }), dt += o, ei();
}
function ei() {
  if (wn || ae.length === 0)
    return;
  const e = ae[0], t = Math.min(
    _a * Math.pow(2, e.attempts),
    va
  );
  wn = setTimeout(() => {
    wn = null, ti();
  }, t);
}
async function ti() {
  for (; ae.length > 0 && xe < Jo && Pe < Ko; ) {
    const e = ae.shift();
    if (dt -= e.bytes, e.attempts++, e.attempts > ga) {
      x("retry_drops"), e.batchKey && un(e.batchKey);
      continue;
    }
    const t = e.bytes;
    xe += t, Pe++;
    try {
      const { body: n, encoding: r } = await Zo(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < Jt,
        credentials: "omit"
      });
      if (ri(i), i.status === 429 || i.status >= 500) {
        ae.unshift(e), dt += e.bytes;
        break;
      }
    } catch {
      ae.unshift(e), dt += e.bytes;
      break;
    } finally {
      xe -= t, Pe--;
    }
  }
  ae.length > 0 && ei();
}
function Ia() {
  Ue && (clearTimeout(Ue), Ue = null), De && (clearTimeout(De), De = null);
}
function ar() {
  const e = Sa();
  Ue && clearTimeout(Ue), Ue = setTimeout(
    () => re(),
    e
  ), De || (De = setTimeout(
    () => {
      De = null, re();
    },
    e + wa
  ));
}
function cr(e, t, n) {
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
  const i = Go(e);
  if (i.items.push(t), i.bytesEstimate += r, !pt && (i.items.length >= Yo || i.bytesEstimate >= Wo)) {
    re();
    return;
  }
  ar();
}
function La(e, t, n, r) {
  const { bytes: o, oversized: i } = Nn(
    e,
    n
  );
  if (i) {
    un(e);
    return;
  }
  const s = Go(e), c = s.upsertMap.get(t);
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
  if (!pt && (s.items.length >= Yo || s.bytesEstimate >= Wo)) {
    re();
    return;
  }
  ar();
}
function ni(e) {
  Dn = e;
}
const Hr = ["events", "replay"];
function re(e = !1) {
  const t = O();
  if (e && Dn && !pt) {
    pt = !0;
    try {
      Dn();
    } catch {
    } finally {
      pt = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    ar();
    return;
  }
  Ia();
  const n = Xs(), r = [], o = Array.from(
    Kt.keys()
  ).sort((l, u) => {
    const f = Hr.indexOf(l), m = Hr.indexOf(u), h = f >= 0 ? f : 999, g = m >= 0 ? m : 999;
    return h - g;
  });
  for (const l of o) {
    const u = Kt.get(l);
    if (!u || u.items.length === 0) continue;
    const f = u.items.splice(0);
    u.upsertMap.clear(), u.bytesEstimate = 0;
    const m = f.map((h) => ({
      ...h,
      tags: n
    }));
    r.push({
      type: u.batchKey,
      items: m
    });
  }
  if (r.length === 0) return;
  const i = ka(r), s = `${t.endpoint}${Aa}`, c = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, a = r.some(
    (l) => l.type === Wt
  );
  if (e) {
    Ca(s, c, i);
    return;
  }
  Ma(
    s,
    c,
    i,
    a ? Wt : void 0
  );
}
async function Ma(e, t, n, r) {
  const o = n.length;
  if (xe >= Jo || Pe >= Ko) {
    Sn(e, t, n, r);
    return;
  }
  xe += o, Pe++;
  try {
    const { body: i, encoding: s } = await Zo(n), c = { ...t };
    s && (c["Content-Encoding"] = s);
    const a = await fetch(e, {
      method: "POST",
      headers: c,
      body: i,
      keepalive: o < Jt,
      credentials: "omit"
    });
    ri(a), (a.status === 429 || a.status >= 500) && Sn(e, t, n, r);
  } catch {
    x("send_failures"), Sn(e, t, n, r);
  } finally {
    xe -= o, Pe--, ti();
  }
}
const Fn = /* @__PURE__ */ new Map();
function ri(e) {
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
let mt = null, ht = null, yt = null, Bn = null;
function Ra(e) {
  Bn = e;
}
const oi = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function Fr() {
  typeof document > "u" || (mt = () => {
    document.visibilityState === "hidden" && re(!0);
  }, ht = () => re(!0), yt = (e) => {
    e.persisted && Bn && Bn();
  }, document.addEventListener(
    "visibilitychange",
    mt
  ), window.addEventListener(
    oi,
    ht
  ), window.addEventListener(
    "pageshow",
    yt
  ));
}
function Oa() {
  mt && (document.removeEventListener(
    "visibilitychange",
    mt
  ), mt = null), ht && (window.removeEventListener(
    oi,
    ht
  ), ht = null), yt && (window.removeEventListener(
    "pageshow",
    yt
  ), yt = null);
}
const Gt = /* @__PURE__ */ new Map();
function xa(e, t) {
  Gt.set(e, t);
}
function Pa() {
  return Gt.size === 0 ? {} : Object.fromEntries(Gt);
}
function Ua() {
  Gt.clear();
}
const Da = 100, Na = 1e4, gt = /* @__PURE__ */ new Set();
let kt = 0, Ne = null;
function ur() {
  for (const e of gt)
    try {
      e();
    } catch {
    }
}
function Ha() {
  Ne || typeof MutationObserver > "u" || typeof document > "u" || !document.documentElement || (Ne = new MutationObserver(ur), Ne.observe(document.documentElement, {
    childList: !0,
    subtree: !0,
    attributes: !0,
    characterData: !0
  }));
}
function Br() {
  gt.size > 0 || !Ne || (Ne.disconnect(), Ne = null);
}
function ii() {
  kt++, ur();
}
function si() {
  kt = Math.max(0, kt - 1), ur();
}
function ai(e, t, n = Na) {
  let r = null, o = null, i = null, s = !1;
  const c = (u) => {
    s || (s = !0, o && clearTimeout(o), i && clearTimeout(i), gt.delete(l), Br(), t(u));
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
    }, Da);
  };
  function l() {
    r = Date.now(), a();
  }
  return gt.add(l), Ha(), kt > 0 && (r = e), a(), i = setTimeout(() => {
    c({
      endMs: r,
      hadActivity: r !== null,
      timedOut: !0
    });
  }, n), () => {
    s = !0, o && clearTimeout(o), i && clearTimeout(i), gt.delete(l), Br();
  };
}
var ce, _t, ci, Qt, ui = -1, Dt = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (ui = t.timeStamp, e(t));
  }), !0);
}, lr = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, fn = function() {
  var e = lr();
  return e && e.activationStart || 0;
}, me = function(e, t) {
  var n = lr(), r = "navigate";
  return ui >= 0 ? r = "back-forward-cache" : n && (document.prerendering || fn() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, fr = function(e, t, n) {
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
}, he = function(e, t, n, r) {
  var o, i;
  return function(s) {
    t.value >= 0 && (s || r) && ((i = t.value - (o || 0)) || o === void 0) && (o = t.value, t.delta = i, t.rating = (function(c, a) {
      return c > a[1] ? "poor" : c > a[0] ? "needs-improvement" : "good";
    })(t.value, n), e(t));
  };
}, li = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, dr = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, pr = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Me = -1, qr = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, Zt = function(e) {
  document.visibilityState === "hidden" && Me > -1 && (Me = e.type === "visibilitychange" ? e.timeStamp : 0, Fa());
}, $r = function() {
  addEventListener("visibilitychange", Zt, !0), addEventListener("prerenderingchange", Zt, !0);
}, Fa = function() {
  removeEventListener("visibilitychange", Zt, !0), removeEventListener("prerenderingchange", Zt, !0);
}, mr = function() {
  return Me < 0 && (Me = qr(), $r(), Dt((function() {
    setTimeout((function() {
      Me = qr(), $r();
    }), 0);
  }))), { get firstHiddenTime() {
    return Me;
  } };
}, dn = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, zr = [1800, 3e3], Ba = function(e, t) {
  t = t || {}, dn((function() {
    var n, r = mr(), o = me("FCP"), i = fr("paint", (function(s) {
      s.forEach((function(c) {
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < r.firstHiddenTime && (o.value = Math.max(c.startTime - fn(), 0), o.entries.push(c), n(!0)));
      }));
    }));
    i && (n = he(e, o, zr, t.reportAllChanges), Dt((function(s) {
      o = me("FCP"), n = he(e, o, zr, t.reportAllChanges), li((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, qa = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = pr(e), document.visibilityState === "hidden" ? e() : (n = t(e), dr(e)), n;
}, jr = [2500, 4e3], En = {}, $a = function(e, t) {
  t = t || {}, dn((function() {
    var n, r = mr(), o = me("LCP"), i = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - fn(), 0), o.entries = [l], n());
      }));
    }, s = fr("largest-contentful-paint", i);
    if (s) {
      n = he(e, o, jr, t.reportAllChanges);
      var c = pr((function() {
        En[o.id] || (i(s.takeRecords()), s.disconnect(), En[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(a) {
        addEventListener(a, (function() {
          return qa(c);
        }), { once: !0, capture: !0 });
      })), dr(c), Dt((function(a) {
        o = me("LCP"), n = he(e, o, jr, t.reportAllChanges), li((function() {
          o.value = performance.now() - a.timeStamp, En[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, Vr = [800, 1800], za = function e(t) {
  document.prerendering ? dn((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, ja = function(e, t) {
  t = t || {};
  var n = me("TTFB"), r = he(e, n, Vr, t.reportAllChanges);
  za((function() {
    var o = lr();
    o && (n.value = Math.max(o.responseStart - fn(), 0), n.entries = [o], r(!0), Dt((function() {
      n = me("TTFB", 0), (r = he(e, n, Vr, t.reportAllChanges))(!0);
    })));
  }));
}, ot = { passive: !0, capture: !0 }, Va = /* @__PURE__ */ new Date(), Xr = function(e, t) {
  ce || (ce = t, _t = e, ci = /* @__PURE__ */ new Date(), di(removeEventListener), fi());
}, fi = function() {
  if (_t >= 0 && _t < ci - Va) {
    var e = { entryType: "first-input", name: ce.type, target: ce.target, cancelable: ce.cancelable, startTime: ce.timeStamp, processingStart: ce.timeStamp + _t };
    Qt.forEach((function(t) {
      t(e);
    })), Qt = [];
  }
}, Xa = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        Xr(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, ot), removeEventListener("pointercancel", i, ot);
      };
      addEventListener("pointerup", o, ot), addEventListener("pointercancel", i, ot);
    })(t, e) : Xr(t, e);
  }
}, di = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, Xa, ot);
  }));
}, Yr = [100, 300], Ya = function(e, t) {
  t = t || {}, dn((function() {
    var n, r = mr(), o = me("FID"), i = function(a) {
      a.startTime < r.firstHiddenTime && (o.value = a.processingStart - a.startTime, o.entries.push(a), n(!0));
    }, s = function(a) {
      a.forEach(i);
    }, c = fr("first-input", s);
    n = he(e, o, Yr, t.reportAllChanges), c && (dr(pr((function() {
      s(c.takeRecords()), c.disconnect();
    }))), Dt((function() {
      var a;
      o = me("FID"), n = he(e, o, Yr, t.reportAllChanges), Qt = [], _t = -1, ce = null, di(addEventListener), a = i, Qt.push(a), fi();
    })));
  }));
};
const Wa = 3e3;
let Ct = null, pi = (e) => e.href, _ = null, te = null, en = [];
function tn() {
  return typeof performance < "u" ? performance.now() : 0;
}
function Ja() {
  return typeof performance < "u" && performance.timeOrigin ? performance.timeOrigin : Date.now();
}
function vt(e) {
  const t = e.hash ?? "", n = t.startsWith("#/") ? t.split("?")[0] : "";
  return e.pathname + n;
}
function mi(e, t, n) {
  return {
    id: Ge(),
    sessionId: oe(),
    loadingType: e,
    startEpoch: t,
    startPerf: n,
    url: pi(window.location),
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
function Ka(e) {
  const t = Array.from(e.interactions.values()).sort((r, o) => o - r);
  if (t.length === 0) return 0;
  const n = Math.min(t.length - 1, Math.floor(t.length / 50));
  return t[n];
}
function Ga(e) {
  const t = e.endEpoch ?? Date.now(), n = e.vitals;
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
    inp_ms: Ka(e),
    cls: Math.round(e.cls.value * 1e4) / 1e4,
    dns_ms: n.dns_ms ?? 0,
    connect_ms: n.connect_ms ?? 0,
    tls_ms: n.tls_ms ?? 0,
    download_ms: n.download_ms ?? 0,
    dom_interactive_ms: n.dom_interactive_ms ?? 0,
    dom_complete_ms: n.dom_complete_ms ?? 0
  };
}
function Qe(e) {
  if (!(!Ct || !e.sessionId)) {
    if (e.endEpoch !== void 0) {
      if (e.expirySent) return;
      e.expirySent = !0;
    } else if (e.active) {
      const t = xs(e.sessionId);
      t !== null && (e.active = !1, e.endEpoch = Math.max(e.startEpoch, t), e.expirySent = !0, e.cancelIdle && e.cancelIdle(), _ === e && (_ = null));
    }
    e.seq++, Ct(Ga(e), e.sessionId);
  }
}
function hi() {
  te && (clearTimeout(te), te = null), _ && Qe(_);
}
function It() {
  te || !_ || (te = setTimeout(() => {
    te = null, _ && Qe(_);
  }, Wa));
}
const Qa = 5 * 6e4, wt = /* @__PURE__ */ new Map();
function Za(e) {
  const t = Date.now();
  for (const [n, r] of wt) r.until <= t && wt.delete(n);
  wt.set(e.id, { v: e, until: t + Qa });
}
function nn() {
  const e = _;
  e && (Za(e), e.cancelIdle && e.cancelIdle(), te && (clearTimeout(te), te = null), e.active = !1, Qe(e), _ = null);
}
function yi(e) {
  e.cancelIdle = ai(e.startEpoch, (t) => {
    if (e.cancelIdle = null, _ !== e) return;
    let n = t.endMs !== null && !t.timedOut ? t.endMs - e.startEpoch : 0;
    e.loadingType === "initial_load" && (n = Math.max(n, e.vitals.load_event_ms ?? 0)), e.loadingTimeMs = Math.max(0, n), hi();
  });
}
function rn(e, t, n) {
  nn();
  const r = mi(e, t, n);
  r.sessionId && (_ = r, Qe(r), yi(r));
}
function gi() {
  return (_ == null ? void 0 : _.id) ?? "";
}
function ec() {
  return (_ == null ? void 0 : _.urlPath) ?? "";
}
function tc(e) {
  const t = typeof e.view_id == "string" ? e.view_id : "";
  let n = _, r = !1;
  if (t && (n == null ? void 0 : n.id) !== t) {
    const o = wt.get(t);
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
    r ? Qe(n) : It();
  }
}
function nc(e) {
  var r, o;
  const t = (o = (r = performance.getEntriesByType) == null ? void 0 : r.call(performance, "navigation")) == null ? void 0 : o[0];
  if (!t || t.loadEventEnd <= 0) return !1;
  const n = Math.round;
  return e.vitals.load_event_ms = n(t.loadEventEnd - t.startTime), e.vitals.dns_ms = n(t.domainLookupEnd - t.domainLookupStart), e.vitals.connect_ms = n(t.connectEnd - t.connectStart), e.vitals.tls_ms = n(
    t.secureConnectionStart > 0 ? t.connectEnd - t.secureConnectionStart : 0
  ), e.vitals.download_ms = n(t.responseEnd - t.responseStart), e.vitals.dom_interactive_ms = n(t.domInteractive - t.startTime), e.vitals.dom_complete_ms = n(t.domComplete - t.startTime), !0;
}
function Wr(e, t, n = {}) {
  if (!(typeof PerformanceObserver > "u"))
    try {
      const r = new PerformanceObserver((o) => t(o.getEntries()));
      r.observe({ type: e, buffered: !0, ...n }), en.push(() => r.disconnect());
    } catch {
    }
}
function rc(e, t, n) {
  const r = e.cls;
  r.windowValue > 0 && n - r.last < 1e3 && n - r.windowStart < 5e3 ? r.windowValue += t : (r.windowValue = t, r.windowStart = n), r.last = n, r.windowValue > r.value && (r.value = r.windowValue);
}
function oc() {
  Wr("layout-shift", (e) => {
    const t = _;
    if (!t) return;
    let n = !1;
    for (const r of e)
      r.hadRecentInput || r.startTime < t.startPerf || (rc(t, r.value, r.startTime), n = !0);
    n && It();
  }), Wr(
    "event",
    (e) => {
      const t = _;
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
function ic(e) {
  const t = (o, i) => {
    _ !== e && !e.active || (e.vitals[o] = Math.round(i * 100) / 100, _ === e && It());
  };
  try {
    $a((o) => t("lcp", o.value)), Ba((o) => t("fcp", o.value)), ja((o) => t("ttfb", o.value)), Ya((o) => t("fid", o.value));
  } catch {
  }
  let n = 0;
  const r = () => {
    nc(e) ? _ === e && It() : ++n < 50 && setTimeout(r, 200);
  };
  document.readyState === "complete" ? setTimeout(r, 0) : window.addEventListener("load", () => setTimeout(r, 0), { once: !0 });
}
let He = "", Bt = !1;
function Le() {
  const e = vt(window.location);
  e !== He && (He = e, rn("route_change", Date.now(), tn()));
}
function sc(e, t) {
  if (typeof window > "u") return;
  _i(), Bt = !1, Ct = e, pi = t, He = vt(window.location);
  const n = Ja(), r = mi("initial_load", n, 0);
  r.sessionId && (_ = r, Qe(r), yi(r), ic(r)), oc();
  const o = history.pushState, i = history.replaceState;
  history.pushState = function(...u) {
    o.apply(this, u), Le();
  }, history.replaceState = function(...u) {
    i.apply(this, u), Le();
  }, window.addEventListener("popstate", Le), window.addEventListener("hashchange", Le);
  const s = () => {
    document.visibilityState === "hidden" && hi();
  };
  document.addEventListener("visibilitychange", s);
  const c = () => {
    nn(), Bt = !0;
  };
  window.addEventListener("pagehide", c);
  const a = (u) => {
    u.persisted && (Bt = !1, He = vt(window.location), rn("bf_cache", Date.now(), tn()));
  };
  window.addEventListener("pageshow", a);
  const l = Os((u) => {
    _ && _.sessionId === u && nn(), He = vt(window.location), rn("route_change", Date.now(), tn());
  });
  en.push(() => {
    history.pushState = o, history.replaceState = i, window.removeEventListener("popstate", Le), window.removeEventListener("hashchange", Le), document.removeEventListener("visibilitychange", s), window.removeEventListener("pagehide", c), window.removeEventListener("pageshow", a), l();
  });
}
function ac() {
  _ || Bt || !Ct || typeof window > "u" || (He = vt(window.location), rn("route_change", Date.now(), tn()));
}
function _i() {
  nn(), wt.clear();
  for (const e of en) e();
  en = [], Ct = null, _ = null;
}
const cc = 3, uc = 1e3;
let on = null, Q = null;
const de = [], hr = [];
let qt = null;
function lc() {
  for (let e = de.length - 1; e >= 0; e--)
    if (!de[e].done) return de[e].id;
  return "";
}
function fc(e) {
  for (const t of de)
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
function dc(e, t) {
  const n = [];
  return t && n.push("rage_click"), e.deadCandidate && !e.hadActivity && !e.userInput && n.push("dead_click"), e.errorCount > 0 && n.push("error_click"), n;
}
function Jr(e, t, n = 1) {
  if (!on) return;
  const r = dc(e, t), o = t ? "rage_click" : r.includes("dead_click") ? "dead_click" : r.includes("error_click") ? "error_click" : "click", i = {
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
    if (e.clicks.length >= cc) {
      const o = e.clicks[0];
      for (const i of e.clicks.slice(1))
        o.errorCount += i.errorCount, o.resourceCount += i.resourceCount, o.longTaskCount += i.longTaskCount, o.hadActivity = o.hadActivity || i.hadActivity;
      Jr(o, !0, e.clicks.length);
    } else
      for (const o of e.clicks) Jr(o, !1);
    for (const o of e.clicks) {
      const i = de.indexOf(o);
      i >= 0 && de.splice(i, 1);
    }
  };
  if (t()) {
    n();
    return;
  }
  const r = setInterval(() => {
    t() && (clearInterval(r), n());
  }, 50);
  hr.push(() => clearInterval(r));
}
function pc(e) {
  var n;
  const t = ((n = e.tagName) == null ? void 0 : n.toLowerCase()) ?? "";
  return t === "input" || t === "textarea" || t === "select" || t === "label" || e.isContentEditable ? !0 : typeof e.closest == "function" && e.closest("label") !== null;
}
function mc() {
  var e;
  try {
    const t = (e = window.getSelection) == null ? void 0 : e.call(window);
    return !!t && !t.isCollapsed && t.toString().length > 0;
  } catch {
    return !1;
  }
}
const hc = 'button,a[href],[role="button"],[role="link"],[role="tab"],[role="menuitem"],[role="option"],summary,label', yc = "a[href],canvas,[contenteditable],[contenteditable] *";
function gc(e) {
  const t = e.innerText;
  return (typeof t == "string" && t ? t : e.textContent ?? "").trim();
}
let vi = 0;
function _c(e) {
  const t = e.target;
  if (!t || typeof t.tagName != "string") return;
  const n = bc(t);
  let r = null;
  try {
    r = typeof t.closest == "function" ? t.closest(hc) : null;
  } catch {
    r = null;
  }
  const o = r ?? t, i = o.tagName.toLowerCase(), s = wc(t), c = s === null && Ss(o), a = s ?? (c ? "" : gc(o).slice(0, 200)), l = s !== null ? `${i}[${s}]` : Sc(o, i, a, c), u = {
    id: Ge(),
    startMs: Date.now(),
    viewId: gi(),
    viewPath: ec(),
    target: l,
    selector: n,
    text: a,
    x: e.clientX,
    y: e.clientY,
    deadCandidate: !pc(t) && !mc() && !Ec(t, yc),
    errorCount: 0,
    resourceCount: 0,
    longTaskCount: 0,
    loadingTimeMs: 0,
    hadActivity: !1,
    userInput: !1,
    done: !1
  };
  de.push(u), hr.push(
    ai(u.startMs, (m) => {
      u.hadActivity = m.hadActivity, u.userInput = vi >= u.startMs, u.loadingTimeMs = m.endMs !== null && !m.timedOut ? Math.max(0, m.endMs - u.startMs) : 0, u.done = !0;
    })
  ), Q && Q.selector === n ? Q.clicks.push(u) : (qn(), Q = { selector: n, clicks: [u], timer: null });
  const f = Q;
  f.timer && clearTimeout(f.timer), f.timer = setTimeout(() => {
    Q === f && qn();
  }, uc);
}
function vc(e) {
  if (typeof document > "u") return;
  wi(), on = e;
  const t = (r) => _c(r), n = () => {
    vi = Date.now();
  };
  document.addEventListener("click", t, { capture: !0, passive: !0 }), document.addEventListener("keydown", n, { capture: !0, passive: !0 }), document.addEventListener("scroll", n, { capture: !0, passive: !0 }), qt = () => {
    document.removeEventListener("click", t, {
      capture: !0
    }), document.removeEventListener("keydown", n, { capture: !0 }), document.removeEventListener("scroll", n, { capture: !0 });
  };
}
function wi() {
  Q && qn();
  for (const e of hr.splice(0)) e();
  de.splice(0), qt && qt(), qt = null, on = null;
}
const Kr = "data-oodle-action-name";
function wc(e) {
  var t;
  try {
    const n = typeof e.closest == "function" ? e.closest(`[${Kr}]`) : null, r = (t = n == null ? void 0 : n.getAttribute(Kr)) == null ? void 0 : t.trim();
    return r ? r.slice(0, 200) : null;
  } catch {
    return null;
  }
}
function Sc(e, t, n, r = !1) {
  if (r) return Gr(e, t);
  const o = e.getAttribute("aria-label");
  if (o) return `${t}[${o}]`;
  const i = e.getAttribute("title");
  if (i) return `${t}[${i}]`;
  const s = n.split(`
`).map((c) => c.trim()).find(Boolean) ?? "";
  return s ? `${t}[${s.length > 80 ? s.slice(0, 79) + "…" : s}]` : Gr(e, t);
}
function Ec(e, t) {
  try {
    return typeof e.closest == "function" && e.closest(t) !== null;
  } catch {
    return !1;
  }
}
function Gr(e, t) {
  if (e.id) return `${t}#${e.id}`;
  const n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
function bc(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
const Fe = "[REDACTED]", Tc = /token|secret|auth|cookie|passw|api-?key|access-?key|session|csrf|xsrf|client-?ip|real-?ip|connecting-ip|(^|-)forwarded(-for)?$/, Ac = /passw|secret|token(?!s|count|limit|usage|type)|apikey|accesskey|privatekey|authorization|credential|cardnumber|creditcard|cardnum|^pan$|cvv|cvc|securitycode|^ssn$|socialsecurity|^ip$|ipaddr|clientip|remoteaddr|remoteip|^ipv[46]$/;
function Si(e, t, n) {
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
function Ei(e) {
  return Si(
    Tc,
    (t) => t.toLowerCase(),
    e
  );
}
function bi(e) {
  return Si(
    Ac,
    (t) => t.toLowerCase().replace(/[-_.\s]/g, ""),
    e
  );
}
function kc(e) {
  let t = 0, n = !1;
  for (let r = e.length - 1; r >= 0; r--) {
    let o = e.charCodeAt(r) - 48;
    n && (o *= 2, o > 9 && (o -= 9)), t += o, n = !n;
  }
  return t % 10 === 0;
}
const Cc = /\b\d(?:[ -]?\d){12,18}\b/g;
function Ic(e) {
  return e.replace(Cc, (t) => {
    const n = t.replace(/[ -]/g, "");
    return n.length >= 13 && n.length <= 19 && n[0] >= "2" && n[0] <= "6" && kc(n) ? Fe : t;
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
const bn = /"((?:[^"\\]|\\.){1,200})"\s*:\s*/g, Lc = /^("(?:[^"\\]|\\.)*"|[^\s,}\]{["]+)/;
function Mc(e, t) {
  let n = "", r = 0;
  bn.lastIndex = 0;
  let o;
  for (; (o = bn.exec(e)) !== null; ) {
    if (!t(o[1])) continue;
    const i = o.index + o[0].length, s = e.slice(i);
    if (s[0] === "{" || s[0] === "[")
      return n + e.slice(r, i) + `"${Fe}"`;
    const c = Lc.exec(s);
    if (!c)
      return s[0] === '"' ? n + e.slice(r, i) + `"${Fe}"` : n + e.slice(r);
    c[1] === '""' || c[1] === "null" || (n += e.slice(r, i) + `"${Fe}"`, r = i + c[1].length, bn.lastIndex = r);
  }
  return n + e.slice(r);
}
function Rc(e) {
  return /^[\w.%+[\]-]+=[^&]*(&[\w.%+[\]-]+=[^&]*)*$/.test(e);
}
function Oc(e, t) {
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
      r = Mc(e, t);
  } else if (Rc(n))
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
  return Ic(r);
}
const xc = 50, Qr = 200, Zr = /* @__PURE__ */ new Map();
function Pc(e) {
  let t = Zr.get(e);
  return t || (t = {
    tokens: Qr,
    lastRefill: Date.now(),
    rate: xc,
    burst: Qr
  }, Zr.set(e, t)), t;
}
function Uc(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function Dc(e) {
  const t = Pc(e);
  return Uc(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let zn = null, jn = null;
function cl(e, t) {
  zn = e, jn = t;
}
const Nc = "00000000000000000000000000000000";
function Ti() {
  if (!zn || !jn) return null;
  try {
    const e = zn.getSpan(
      jn.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === Nc ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const eo = 100, Hc = 10, to = 5e3, Fc = 3, Bc = 0;
function qc(e, t = () => Date.now()) {
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
        const m = f.getNode(a), h = m && m.closest ? m.closest("svg") : null;
        if (h) {
          const g = f.getId(h);
          g !== -1 && (u = g);
        }
      } catch {
      }
    return r.size < to && r.set(a, u), u;
  }
  function s(a) {
    const l = i(a), u = t();
    let f = n.get(l);
    if (!f) {
      if (n.size >= to)
        return !0;
      f = {
        tokens: eo,
        lastRefillMs: u
      }, n.set(l, f);
    }
    const m = (u - f.lastRefillMs) / 1e3;
    return m > 0 && (f.tokens = Math.min(
      eo,
      f.tokens + m * Hc
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function c(a) {
    var g, v, k;
    if (a.type !== Fc)
      return { event: a, dropped: 0 };
    const l = a.data;
    if (!l || l.source !== Bc || !l.attributes || l.attributes.length === 0)
      return { event: a, dropped: 0 };
    const u = l.attributes.length, f = l.attributes.filter(
      (C) => s(C.id)
    ), m = u - f.length;
    return m === 0 ? { event: a, dropped: 0 } : (l.attributes = f, {
      event: f.length > 0 || (((g = l.adds) == null ? void 0 : g.length) ?? 0) > 0 || (((v = l.removes) == null ? void 0 : v.length) ?? 0) > 0 || (((k = l.texts) == null ? void 0 : k.length) ?? 0) > 0 ? a : null,
      dropped: m
    });
  }
  return { throttle: c, reset: o };
}
const no = "replay", $c = 200, zc = 6e4, jc = 5e3, Vc = 8e6, Ai = 2, Xc = 3, Yc = 4, ro = 3e3, ki = 5e3, Wc = 3, Jc = 3e4, Kc = 5e3, Gc = 16, Qc = 100, Zc = 4, eu = 30, oo = 32, io = 250, tu = 36e4;
function nu() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const ru = 3e5, ou = 9e5, iu = 1e3;
let Se = null, ne = null, nt = null, Ye = [], We = 0, _e = "", Ci = "", yr = !1, Ii = 0, Tn = "", Z = 0, Ee = Date.now(), ye = !1, Lt = 0, ve = null, Je = !1, Be = null, Li = 0, K = [], Y = 0, qe = null, ue = null, $t = 0;
function Ke() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const gr = qc(
  () => (Se == null ? void 0 : Se.mirror) ?? null
);
let $e = null, we = null, ze = !1, Mt = !1, _r = 0, zt = null, ee = null;
function su() {
  qe && (clearTimeout(qe), qe = null), ue && (ue(), ue = null);
}
function Vn(e, t) {
  su();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    eu
  ) : null, r = e ? Ke() + (n ?? Zc) : Number.POSITIVE_INFINITY;
  for (; Y < K.length; ) {
    const o = Math.min(
      Y + oo,
      K.length
    );
    for (; Y < o; )
      Xn(
        K[Y++]
      );
    if (Ke() >= r) break;
  }
  if (Y >= K.length) {
    K = [], Y = 0;
    return;
  }
  Y >= oo * 8 && (K = K.slice(Y), Y = 0), Mi();
}
function sn() {
  Vn(!1);
}
function Mi() {
  if (!qe) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          ue = null, Vn(!0, t);
        },
        { timeout: Qc }
      );
      ue = () => cancelIdleCallback(e);
    }
    qe = setTimeout(() => {
      qe = null, ue && (ue(), ue = null), Vn(!0);
    }, Gc);
  }
}
function Rt(e = !1) {
  if (Je = !0, Be) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - Ee, r = Math.max(
      0,
      ki - n
    ), o = Date.now() - Li, i = Math.max(
      0,
      Kc - o
    );
    t = Math.max(
      r,
      i
    );
  }
  Be = setTimeout(() => {
    Be = null, au();
  }, t);
}
function au() {
  if (!Je || !Se || !ne || ye) return;
  Lt++;
  const e = $t > io ? 1 : Wc;
  if (Lt > e) {
    lu();
    return;
  }
  Li = Date.now(), Z = 0, Ee = Date.now();
  try {
    const t = Ke();
    Se.takeFullSnapshot(!0), $t = Ke() - t, x("replay_rebases"), $t > io && x(
      "replay_expensive_snapshots"
    );
  } catch {
    xt(), Ot();
  }
}
function so() {
  x("replay_events_dropped");
}
function Ri() {
  if (_e) return !1;
  _e = oe(), Ii = Ds(), Ci = Ps() ? "" : Po();
  const e = Tn !== "" && Tn !== _e;
  return Tn = _e, e;
}
function Nt() {
  if (uu(), Ye.length === 0) return;
  if (ln(no)) {
    cu(), Oi();
    return;
  }
  Ri();
  const e = _e, t = Ii, n = Ci, r = Ye.splice(0), o = We;
  We = 0, _e = "", yr = !0, cr(
    no,
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
function cu() {
  We <= Vc || (x(
    "replay_events_dropped",
    Ye.length
  ), Ye.length = 0, We = 0, Rt());
}
let je = null;
function uu() {
  je && (clearTimeout(je), je = null);
}
function Oi() {
  if (je) return;
  const e = O().replayFlushIntervalMs ?? jc;
  je = setTimeout(() => {
    je = null, Nt();
  }, e);
}
function Xn(e) {
  !_e && !oe() || (Ri() && e.type !== Ai && Rt(!0), Ye.push(e), We += Xt(e), Ye.length >= $c || We >= zc ? Nt() : Oi());
}
function lu() {
  ye = !0, x("replay_overload_pauses"), xt(), ve && clearTimeout(ve), ve = setTimeout(() => {
    ve = null, ye = !1, Lt = 0, Z = 0, Ee = Date.now(), !ze && !Mt && ee && Ot();
  }, Jc);
}
function fu(e) {
  if (ye) return;
  if (e.type === Ai) {
    sn(), Je = !1, Z = 0, Ee = Date.now(), Xn(e);
    return;
  }
  if (e.type === Yc) {
    const r = e.data;
    typeof r.href == "string" && (r.href = as(r.href));
  }
  if (e.type !== Xc) {
    sn(), Xn(e);
    return;
  }
  if (Je) {
    so(), Rt();
    return;
  }
  const t = Date.now();
  t - Ee > ki && (Z <= ro && (Lt = 0), Z = 0, Ee = t);
  const n = gr.throttle(e);
  if (n.dropped > 0 && x(
    "replay_attributes_throttled",
    n.dropped
  ), !!n.event) {
    if (Z++, Z > ro) {
      so(), Rt();
      return;
    }
    K.push(n.event), Mi();
  }
}
async function Ot() {
  if (ee && !ye && !ne)
    return nt || (nt = du().finally(
      () => {
        nt = null;
      }
    ), nt);
}
async function du() {
  if (!ee) return;
  const { record: e } = await import("./rrweb-SbAupvcM.js");
  !ee || ye || ne || (Se = e, Je = !1, Z = 0, Ee = Date.now(), gr.reset(), ne = e({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: nu() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: tu,
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
        fu(t);
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
    blockSelector: Ao,
    maskTextSelector: ko,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => Nt(), 200));
}
function xt() {
  ne && (ne(), ne = null), Be && (clearTimeout(Be), Be = null), Je = !1, sn(), Nt();
}
function pu() {
  const e = O(), t = e.replayIdlePauseMs ?? ru, n = e.replayIdleExpireMs ?? ou;
  $e && clearTimeout($e), we && (clearTimeout(we), we = null), $e = setTimeout(() => {
    ze = !0, xt();
  }, t), we = setTimeout(() => {
    Mt = !0, xt();
  }, n);
}
function jt() {
  _r = Ke(), pu();
}
function mu() {
  if (Mt) {
    if (!Do()) return;
    Mt = !1, ze = !1, Ot(), jt();
    return;
  }
  if (ze) {
    ze = !1, Ot(), jt();
    return;
  }
  Ke() - _r >= iu && jt();
}
function hu() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => mu(), n = { passive: !0, capture: !0 };
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
function yu() {
  zt && (zt(), zt = null), $e && (clearTimeout($e), $e = null), we && (clearTimeout(we), we = null);
}
function gu() {
  sn(), Nt();
}
async function _u() {
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
  }, Ta(() => {
    ne && Rt();
  }), ni(gu), await Ot(), hu(), jt();
}
function vu() {
  return ne !== null && !ye;
}
function wu() {
  return yr;
}
function Su() {
  xt(), yu(), ni(null), ve && (clearTimeout(ve), ve = null), ze = !1, Mt = !1, _r = 0, ye = !1, yr = !1, Lt = 0, Z = 0, $t = 0, K = [], Y = 0, gr.reset(), ee = null, Se = null;
}
let H = [], G = null;
const Eu = [
  "error",
  "action",
  "console",
  "resource"
];
function bu(e) {
  return Eu.includes(e) && (ln(e) || !Dc(e)) ? (x("events_rate_limited"), !0) : !1;
}
function xi(e, t) {
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
function Tu() {
  if (!G) {
    const e = navigator.userAgent;
    G = {
      device_type: el(e),
      browser_name: tl(e),
      browser_version: nl(e),
      os_name: rl(e),
      os_version: ol(e),
      user_agent: e,
      language: navigator.language
    };
  }
}
function Au() {
  const e = navigator.connection;
  return typeof (e == null ? void 0 : e.effectiveType) == "string" ? e.effectiveType : "";
}
function Pi(e) {
  Tu();
  const t = Hs(), n = Pa(), r = O(), o = e ?? oe(), i = {
    event_id: Ge(),
    session_id: o,
    tab_id: Po(),
    view_id: gi(),
    action_id: lc(),
    ...fs(
      Bo(),
      Bs(),
      qs()
    ),
    user_status: $s(),
    service: r.service,
    env: r.env ?? "",
    version: r.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: xi(
      window.location,
      r.viewUrlQueryParams
    ),
    view_url_host: window.location.hostname,
    view_url_path: le(window.location.pathname),
    referrer_url: cs(document.referrer),
    device_type: G.device_type,
    browser_name: G.browser_name,
    browser_version: G.browser_version,
    os_name: G.os_name,
    os_version: G.os_version,
    user_agent: ls() ? G.user_agent : "",
    language: G.language,
    session_view_count: t.viewCount,
    session_error_count: t.errorCount,
    session_action_count: t.actionCount,
    replay_id: vu() && wu() ? o : ""
  };
  return Object.keys(n).length > 0 && (i.feature_flags = n), i;
}
function ku(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const Ui = "events", Cu = ["session_id", "event_type", "timestamp"];
let ao = !1;
function Di(e) {
  const t = O().beforeSend;
  if (typeof t != "function") return e;
  const n = {};
  for (const r of Cu) n[r] = e[r];
  try {
    const r = t(e);
    if (r === null || r === !1) return null;
    if (ji(r))
      throw new Error("it returned a promise; it must be synchronous");
    return { ...r && typeof r == "object" ? r : e, ...n };
  } catch (r) {
    return ao || (ao = !0, Jn(
      `beforeSend failed. Events are dropped until it is fixed: ${String(r)}`
    )), null;
  }
}
function Ni(e) {
  Us() && (e.session_is_new = 1);
}
function D(e) {
  if (!oe() || !Uo() || ln("events")) return;
  ac();
  const t = e(), n = t.event_type;
  if (bu(n)) return;
  n === "resource" && $u(t), Fo(n), tc(t), fc(t);
  const r = { ...Pi(), ...t };
  Ni(r);
  const o = Di(r);
  o && cr(Ui, o);
}
function vr(e) {
  ku(
    () => D(e)
  );
}
function Iu(e, t) {
  if (!Uo() || ln("events")) return;
  e.view_update_seq === 1 && Fo("view");
  const n = {
    ...Pi(t),
    ...e,
    action_id: "",
    connection_type: Au(),
    screen_width: typeof screen < "u" ? screen.width : 0,
    screen_height: typeof screen < "u" ? screen.height : 0
  };
  e.view_update_seq === 1 && (n.view_is_new = 1), t === oe() && Ni(n);
  const r = Di(n);
  r && La(
    Ui,
    "view:" + String(e.view_id),
    r,
    (o, i) => {
      const s = { ...i }, c = o;
      return c.view_is_new === 1 && (s.view_is_new = 1), c.session_is_new === 1 && (s.session_is_new = 1), s;
    }
  );
}
function Lu(e) {
  D(() => e);
}
function Mu() {
  sc(
    Iu,
    (e) => xi(e, O().viewUrlQueryParams)
  ), vc(Lu), Ru(), Uu(), Hu(), Wu(), Ju(), Ku(), Gu();
}
function Ru() {
  const e = (n) => {
    D(() => {
      var i, s, c;
      const r = n.message ?? "", o = typeof ((i = n.error) == null ? void 0 : i.message) == "string" ? n.error.message : r;
      return {
        event_type: "error",
        error_message: bt(r),
        error_type: ((s = n.error) == null ? void 0 : s.name) ?? "Error",
        error_stack: Qn(
          ((c = n.error) == null ? void 0 : c.stack) ?? "",
          o
        ),
        error_source: "source",
        error_handling: "unhandled"
      };
    });
  }, t = (n) => Hi(n.reason);
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
const co = /* @__PURE__ */ new WeakSet();
function Hi(e) {
  if (e !== null && typeof e == "object") {
    if (co.has(e)) return;
    co.add(e);
  }
  D(() => {
    const t = (e == null ? void 0 : e.message) ?? String(e);
    return {
      event_type: "error",
      error_message: bt(t),
      error_type: (e == null ? void 0 : e.name) ?? "UnhandledRejection",
      error_stack: Qn((e == null ? void 0 : e.stack) ?? "", t),
      error_source: "promise",
      error_handling: "unhandled"
    };
  });
}
let uo = !1;
function ul() {
  const e = globalThis.Zone;
  if (uo || !e || typeof e.__symbol__ != "function")
    return;
  uo = !0;
  const t = e.__symbol__("unhandledPromiseRejectionHandler"), n = e[t];
  e[t] = function(r) {
    if (Yn)
      try {
        Hi(
          r && typeof r == "object" && "rejection" in r && "promise" in r ? r.rejection : r
        );
      } catch {
      }
    if (typeof n == "function")
      return n.call(this, r);
  };
}
function Fi(e) {
  return e instanceof Error || typeof e == "object" && e !== null && typeof e.message == "string" && typeof e.name == "string" && "stack" in e;
}
const Ve = 8192;
function Ou(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${Ve} bytes omitted]`;
}
function xu(e) {
  if (typeof e == "string") return e;
  if (Fi(e))
    return e.message ? `${e.name}: ${e.message}` : e.name;
  if (Xt(
    e,
    Ve + 1
  ) > Ve)
    return Ou(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function Pu(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= Ve) break;
    t && (t += " "), t += xu(n);
  }
  return t.length > Ve ? t.slice(0, Ve) + "… [truncated]" : t;
}
function Uu() {
  for (const e of us()) {
    const t = console[e], n = (...r) => {
      try {
        const o = bt(Pu(r)), i = e === "error" ? r.find(Fi) : void 0;
        D(() => {
          const s = {
            event_type: "console",
            console_level: e,
            console_message: o
          };
          return i && (s.error_type = i.name, s.error_message = bt(i.message), s.error_stack = Qn(
            i.stack ?? "",
            i.message
          ), s.error_source = "console", s.error_handling = "handled"), s;
        });
      } catch {
      }
      t.apply(console, r);
    };
    n[bo] = t, console[e] = n, H.push(() => {
      console[e] = t;
    });
  }
}
const Wn = "oodle_rum_tab_hidden";
function lo(e) {
  try {
    e ? sessionStorage.setItem(Wn, "1") : sessionStorage.removeItem(Wn);
  } catch {
  }
}
function Du() {
  try {
    return sessionStorage.getItem(Wn) === "1";
  } catch {
    return !1;
  }
}
function Nu() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && Du() && (lo(!1), D(() => ({
    event_type: "visibility",
    action_type: "tab_visible"
  })));
  let e = document.visibilityState === "hidden";
  const t = () => {
    const n = document.visibilityState === "hidden";
    n !== e && (e = n, lo(n), D(() => ({
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
function wr(e) {
  const t = O().endpoint;
  return e.startsWith(t);
}
function Hu() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || wr(r.name))
          continue;
        const i = Et(r.name), s = Bi(r), c = Fu(o, r.name);
        vr(
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
function Fu(e, t) {
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
function Bi(e) {
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
function qi(e, t) {
  try {
    const n = performance.getEntriesByName(
      $i(e),
      "resource"
    );
    for (let r = n.length - 1; r >= 0; r--) {
      const o = n[r];
      if (o.startTime >= t - 2)
        return {
          ...Bi(o),
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
function $i(e) {
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
function zi(e) {
  const t = $i(e), n = O();
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
let fo = null, po = Ei(void 0);
function St(e) {
  const t = O().redactHeaders;
  return t !== fo && (fo = t, po = Ei(t)), po(e);
}
function Bu(e) {
  const t = {};
  for (const n of Object.keys(e)) {
    const r = n.toLowerCase();
    St(r) || (t[r] = e[n]);
  }
  return t;
}
const mo = [
  "request_headers",
  "response_headers",
  "request_body",
  "response_body"
];
let ho = !1;
function ji(e) {
  return !!e && (typeof e == "object" || typeof e == "function") && typeof e.then == "function";
}
function yo(e) {
  if (!(typeof e != "string" || !e))
    try {
      const t = JSON.parse(e);
      return t && typeof t == "object" ? t : void 0;
    } catch {
      return;
    }
}
function go(e) {
  if (!e || typeof e != "object") return "";
  const t = {};
  for (const [n, r] of Object.entries(e))
    r != null && (t[n.toLowerCase()] = String(r));
  return Object.keys(t).length > 0 ? JSON.stringify(t) : "";
}
let _o = null, vo = bi(void 0);
function qu() {
  const e = O().redactBodyKeys;
  return e !== _o && (_o = e, vo = bi(e)), vo;
}
function $u(e) {
  var c;
  if (!mo.some((a) => e[a])) return;
  for (const a of ["request_body", "response_body"])
    typeof e[a] == "string" && e[a] && (e[a] = Oc(e[a], qu()));
  const t = O().beforeSendNetwork;
  if (typeof t != "function") return;
  const n = {
    url: String(e.resource_url ?? ""),
    method: String(e.resource_method ?? ""),
    status: Number(e.resource_status ?? 0),
    requestHeaders: yo(e.request_headers),
    responseHeaders: yo(e.response_headers),
    requestBody: typeof e.request_body == "string" ? e.request_body : void 0,
    responseBody: typeof e.response_body == "string" ? e.response_body : void 0
  };
  let r;
  try {
    const a = t(n);
    if (ji(a))
      throw new Error("it returned a promise; it must be synchronous");
    r = a === void 0 ? n : a;
  } catch (a) {
    ho || (ho = !0, Jn(
      `beforeSendNetwork failed. Captured headers and bodies are dropped until it is fixed: ${String(a)}`
    )), r = null;
  }
  for (const a of mo) delete e[a];
  if (!r || typeof r != "object") return;
  const o = ((c = O().forwardNetworkBodies) == null ? void 0 : c.maxBodySize) ?? 65536, i = go(r.requestHeaders), s = go(r.responseHeaders);
  i && (e.request_headers = i), s && (e.response_headers = s), typeof r.requestBody == "string" && r.requestBody && (e.request_body = pe(r.requestBody, o)), typeof r.responseBody == "string" && r.responseBody && (e.response_body = pe(r.responseBody, o));
}
function Vi(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      St(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      St(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      St(r) || (t[r] = e[n]);
    }
  return t;
}
function zu(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    St(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function pe(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function ju(e, t) {
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
function Vu(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function Xu(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      Vi(
        e
      )
    );
  } catch {
    return "";
  }
}
function wo(e) {
  try {
    return JSON.stringify(
      Vi(e)
    );
  } catch {
    return "";
  }
}
function Xi(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function Yu(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: pe(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: pe(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : Xi(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => pe(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function Yi(e, t, n) {
  const r = function(o, i) {
    const s = Vu(o);
    if (wr(s))
      return t.apply(e, [
        o,
        i
      ]);
    const c = Xi(o), a = ((i == null ? void 0 : i.method) ?? (c ? o.method : "GET")).toUpperCase(), l = performance.now(), u = zi(s);
    ii();
    let f = !1;
    const m = () => {
      f || (f = !0, si());
    };
    let h = "", g = "";
    if (n.injectTracing) {
      const E = Ti();
      if (E)
        h = E.traceId, g = E.spanId;
      else if (u.trace) {
        h = an(16), g = an(8);
        const A = new Headers(
          (i == null ? void 0 : i.headers) ?? {}
        );
        A.set(
          "traceparent",
          `00-${h}-${g}-01`
        ), i = { ...i, headers: A };
      }
    }
    let v = "", k = null;
    if (u.bodyCfg) {
      const E = u.bodyCfg.maxBodySize ?? 65536, A = Yu(
        i,
        o,
        E
      );
      v = A.sync, k = A.asyncP;
    }
    let C = "";
    return u.captureHeaders && (i != null && i.headers ? C = Xu(
      i.headers
    ) : c && (C = wo(
      o.headers
    ))), t.apply(e, [o, i]).then((E) => {
      m();
      const A = E.status, L = Math.round(
        performance.now() - l
      );
      let y = "";
      u.captureHeaders && (y = wo(
        E.headers
      ));
      const w = (p) => {
        const d = {
          event_type: "resource",
          resource_url: Et(s),
          resource_method: a,
          resource_status: A,
          resource_duration_ms: L,
          resource_size: 0,
          resource_type: "fetch",
          ...qi(s, l)
        };
        return h && (d.trace_id = h, d.span_id = g), p && (d.request_body = p), C && (d.request_headers = C), y && (d.response_headers = y), d;
      }, S = k || Promise.resolve(v);
      if (u.bodyCfg) {
        const p = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          S,
          ju(
            E.clone(),
            p
          ).catch(() => "")
        ]).then(([d, M]) => {
          D(() => {
            const W = w(d);
            return M && (W.response_body = M), W;
          });
        }).catch(() => {
          S.then((d) => {
            D(
              () => w(d)
            );
          });
        });
      } else
        S.then((p) => {
          D(() => w(p));
        });
      return E;
    }).catch((E) => {
      m();
      const A = Math.round(
        performance.now() - l
      );
      throw (k || Promise.resolve(v)).then((y) => {
        D(() => {
          const w = {
            event_type: "resource",
            resource_url: Et(s),
            resource_method: a,
            resource_status: 0,
            resource_duration_ms: A,
            resource_size: 0,
            resource_type: "fetch"
          };
          return h && (w.trace_id = h, w.span_id = g), y && (w.request_body = y), C && (w.request_headers = C), w;
        });
      }), E;
    });
  };
  return e.fetch = r, () => {
    e.fetch = t;
  };
}
function Wi(e, t, n) {
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
    if (wr(c))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const a = zi(c);
    let l = "", u = "";
    if (n.injectTracing) {
      const y = Ti();
      y ? (l = y.traceId, u = y.spanId) : a.trace && (l = an(16), u = an(8), i.call(
        this,
        "traceparent",
        `00-${l}-${u}-01`
      ));
    }
    let f = "";
    if (a.bodyCfg && s) {
      const y = a.bodyCfg.maxBodySize ?? 65536;
      typeof s == "string" ? f = pe(
        s,
        y
      ) : typeof URLSearchParams < "u" && s instanceof URLSearchParams && (f = pe(
        s.toString(),
        y
      ));
    }
    let m = "";
    if (a.captureHeaders)
      try {
        const y = this.__oodleReqHeaders, w = y ? Bu(y) : {};
        Object.keys(w).length > 0 && (m = JSON.stringify(w));
      } catch {
      }
    const h = performance.now(), g = this;
    ii();
    const v = l, k = u, C = f, E = a.bodyCfg, A = m, L = a.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        si();
        const y = Math.round(
          performance.now() - h
        ), w = g.__oodleMethod ?? "GET";
        D(() => {
          const S = {
            event_type: "resource",
            resource_url: Et(c),
            resource_method: w,
            resource_status: g.status,
            resource_duration_ms: y,
            resource_size: 0,
            resource_type: "xhr",
            ...qi(c, h)
          };
          if (v && (S.trace_id = v, S.span_id = k), C && (S.request_body = C), E)
            try {
              const p = g.responseText ?? "";
              S.response_body = pe(
                p,
                E.maxBodySize ?? 65536
              );
            } catch {
            }
          if (A && (S.request_headers = A), L)
            try {
              const p = g.getAllResponseHeaders();
              p && (S.response_headers = JSON.stringify(
                zu(p)
              ));
            } catch {
            }
          return S;
        });
      }
    ), o.apply(this, [s]);
  }, () => {
    e.open = r, e.send = o, e.setRequestHeader = i;
  };
}
const Ji = {
  injectTracing: !0
}, So = {
  injectTracing: !1
};
function Wu() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = Yi(
    window,
    window.fetch,
    Ji
  );
  H.push(e);
}
function Ju() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = Wi(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    Ji
  );
  H.push(e);
}
const Eo = /* @__PURE__ */ new WeakSet();
function kn(e) {
  if (Eo.has(e)) return;
  Eo.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (Yi(
        n,
        n.fetch,
        So
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (Wi(
        r.prototype,
        r.prototype.setRequestHeader,
        So
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), H.push(() => {
    e.removeEventListener("load", t);
  });
}
function Ku() {
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
function Gu() {
  if (!(typeof PerformanceObserver > "u") && !Qu())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            vr(() => ({
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
function Qu() {
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
          vr(() => ({
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
function Zu(e, t) {
  D(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function el(e) {
  return /iPad|Tablet/i.test(e) || /Android/i.test(e) && !/Mobi/i.test(e) ? "tablet" : /Mobi|iPhone|iPod|Android/i.test(e) ? "mobile" : "desktop";
}
const Ki = [
  ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
  ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
  ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
  ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
  ["Safari", /Version\/([\d.]+).*Safari/]
];
function tl(e) {
  for (const [t, n] of Ki) if (n.test(e)) return t;
  return e.includes("Safari") ? "Safari" : "Other";
}
function nl(e) {
  for (const [, t] of Ki) {
    const n = e.match(t);
    if (n) return n[1];
  }
  return "";
}
function rl(e) {
  return /iPhone|iPad|iPod/.test(e) ? "iOS" : e.includes("Android") ? "Android" : e.includes("CrOS") ? "Chrome OS" : e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : "Other";
}
function ol(e) {
  let t = e.match(/OS (\d+[_.]\d+(?:[_.]\d+)?) like Mac OS X/);
  return t ? t[1].replace(/_/g, ".") : (t = e.match(/Android ([\d.]+)/), t || (t = e.match(/Windows NT ([\d.]+)/), t) ? t[1] : (t = e.match(/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/), t ? t[1].replace(/_/g, ".") : ""));
}
function il() {
  wi(), _i();
  for (const e of H)
    e();
  H = [];
}
let ge = !1;
const ll = {
  init(e) {
    ge || bs(e) && (js(e.tags), Ls(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), ge = !0, Mn(), Nu(), Fr(), Ns(), Ks(), Ra(() => {
      Fr();
    }), e.sessionReplay !== !1 && Do() && _u(), Mu(), e.openTelemetry && import("./tracing-XMq3B9ec.js").then(
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
    Vs(e);
  },
  identify(e) {
    Fs(e);
  },
  trackEvent(e, t) {
    ge && Zu(e, t);
  },
  addFeatureFlag(e, t) {
    xa(e, t);
  },
  getSessionId() {
    return ge ? oe() : "";
  },
  getUserId() {
    return Bo();
  },
  flush() {
    ge && re();
  },
  stop() {
    ge && (Su(), il(), Gs(), Ho(), re(!0), Ua(), Oa(), ge = !1);
  }
};
export {
  ll as O,
  al as a,
  ul as c,
  sl as r,
  cl as s
};
