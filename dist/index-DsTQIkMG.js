const $o = "__oodleOriginal";
function dr(e) {
  try {
    const t = console.warn;
    (t[$o] ?? t).call(
      console,
      "[@oodle-ai/rum] " + e
    );
  } catch {
  }
}
const Yt = [
  "error",
  "warn"
];
function ws() {
  return {
    patterns: [],
    maskFn: null,
    referrer: "path",
    consoleLevels: Yt,
    messages: "full",
    actionText: "full",
    userAgent: "full",
    queryStrings: "events",
    userInfo: "full",
    keepParams: []
  };
}
let A = ws();
const On = "/:redacted", Ss = 256, dt = /* @__PURE__ */ new Map();
let jn = !1;
const ke = dr;
function Pe(e, t, n, r, o) {
  return t === void 0 ? r : typeof t == "string" && n.includes(t) ? t : (ke(
    `${e} must be one of ${n.map((i) => `'${i}'`).join(", ")}. Using '${o}'.`
  ), o);
}
function Es(e) {
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
function Ts(e) {
  if (e === void 0) return [];
  if (!Array.isArray(e))
    return ke(
      "urlPathPatterns must be an array of path patterns such as '/projects/:id'. It is ignored."
    ), [];
  const t = [];
  for (const n of e) {
    const r = Es(n);
    r ? t.push(r) : ke(
      `urlPathPatterns: ${JSON.stringify(n)} is not a valid pattern. Patterns start with '/', use ':name' for one segment and may end in '/*'. It is ignored.`
    );
  }
  return t;
}
function bs(e) {
  if (e === void 0) return Yt;
  if (!Array.isArray(e))
    return ke(
      "consoleLevels must be an array such as ['error']. Console capture is off."
    ), [];
  const t = Yt.filter(
    (n) => e.includes(n)
  );
  return e.some(
    (n) => !Yt.includes(n)
  ) && ke(
    "consoleLevels accepts only 'error' and 'warn'. Other values are ignored."
  ), t;
}
function As(e) {
  dt.clear(), jn = !1;
  const t = e.maskUrlPath;
  t !== void 0 && typeof t != "function" && ke("maskUrlPath must be a function. It is ignored."), A = {
    patterns: Ts(e.urlPathPatterns),
    maskFn: typeof t == "function" ? t : null,
    referrer: Pe(
      "referrerUrl",
      e.referrerUrl,
      ["path", "origin", "none"],
      "path",
      "none"
    ),
    consoleLevels: bs(
      e.consoleLevels
    ),
    messages: Pe(
      "errorMessages",
      e.errorMessages,
      ["full", "scrub", "none"],
      "full",
      "none"
    ),
    // Text the replay masks must not reappear in click events.
    actionText: Pe(
      "actionText",
      e.actionText,
      ["full", "mask"],
      e.privacyLevel === "mask" ? "mask" : "full",
      "mask"
    ),
    userAgent: Pe(
      "userAgent",
      e.userAgent,
      ["full", "none"],
      "full",
      "none"
    ),
    queryStrings: Pe(
      "stripQueryStrings",
      e.stripQueryStrings,
      ["events", "all"],
      "events",
      "all"
    ),
    userInfo: Pe(
      "userInfo",
      e.userInfo,
      ["full", "id", "none"],
      "full",
      "none"
    ),
    keepParams: Array.isArray(e.viewUrlQueryParams) ? e.viewUrlQueryParams : []
  };
}
function pr() {
  return A.patterns.length > 0 || A.maskFn !== null;
}
function Is(e) {
  const t = e.split("/").slice(1), n = t.length > 0 && t[t.length - 1] === "";
  n && t.pop();
  for (const r of A.patterns) {
    if (r.rest) {
      if (t.length < r.segs.length) continue;
    } else if (t.length !== r.segs.length)
      continue;
    let o = !0;
    for (let s = 0; s < r.segs.length; s++) {
      const a = r.segs[s];
      if (a[0] === ":") {
        if (t[s] === "") {
          o = !1;
          break;
        }
      } else if (a !== t[s]) {
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
function ks(e) {
  let t = A.patterns.length > 0 ? Is(e) : e;
  if (A.maskFn)
    try {
      const n = A.maskFn(t);
      t = typeof n == "string" ? n : On;
    } catch (n) {
      jn || (jn = !0, ke(
        `maskUrlPath threw. Paths are sent as '${On}' until it is fixed: ${String(n)}`
      )), t = On;
    }
  return t;
}
function pe(e) {
  if (!pr()) return e;
  const t = dt.get(e);
  if (t !== void 0) return t;
  const n = ks(e);
  return dt.size >= Ss && dt.clear(), dt.set(e, n), n;
}
function Cs(e) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(e);
}
function xt(e, t) {
  if (Cs(e)) {
    let n;
    try {
      n = new URL(e);
    } catch {
      return e;
    }
    return n.protocol !== "http:" && n.protocol !== "https:" ? n.protocol === "data:" ? "data:" : n.origin + n.pathname : n.origin + pe(n.pathname);
  }
  try {
    const n = t ?? (typeof location < "u" ? location.href : "http://localhost/"), r = new URL(e, n);
    return r.origin === new URL(n).origin ? pe(r.pathname) : r.origin + pe(r.pathname);
  } catch {
    const n = e.search(/[?#]/);
    return n >= 0 ? e.slice(0, n) : e;
  }
}
function jo(e) {
  return !pr() || typeof e != "string" ? e : mr(e, (t) => t.search + t.hash);
}
function Bl() {
  return pr() || A.queryStrings === "all";
}
function Ms(e) {
  return A.queryStrings !== "all" ? jo(e) : typeof e != "string" ? e : mr(e, (t) => {
    const n = A.keepParams;
    if (n.length === 0 || !t.search) return "";
    const r = new URLSearchParams();
    t.searchParams.forEach((i, s) => {
      n.includes(s) && r.append(s, i);
    });
    const o = r.toString();
    return o ? "?" + o : "";
  });
}
function ql(e) {
  return A.queryStrings !== "all" ? jo(e) : typeof e != "string" ? e : mr(e, () => "");
}
function mr(e, t) {
  let n;
  try {
    n = new URL(e);
  } catch {
    return e;
  }
  return n.protocol !== "http:" && n.protocol !== "https:" ? e : n.origin + pe(n.pathname) + t(n);
}
let zr = null, Vr = "", Xr = null;
function Ls(e) {
  if (e === zr && Xr === A)
    return Vr;
  let t = "";
  if (e && A.referrer !== "none")
    try {
      const n = new URL(e);
      t = A.referrer === "origin" ? n.origin : n.origin + pe(n.pathname);
    } catch {
      t = A.referrer === "origin" ? "" : e;
    }
  return zr = e, Vr = t, Xr = A, t;
}
function Rs() {
  return A.consoleLevels;
}
function Os() {
  return A.userAgent === "full";
}
function xs(e, t, n) {
  switch (A.userInfo) {
    case "full":
      return { user_id: e, user_name: t, user_email: n };
    case "id":
      return { user_id: e, user_name: "", user_email: "" };
    default:
      return { user_id: "", user_name: "", user_email: "" };
  }
}
const Ps = [
  [/(^|[^\w])'(?:[^'\\\n]|\\.){0,500}'/g, "$1'?'"],
  [/(^|[^\w])"(?:[^"\\\n]|\\.){0,500}"/g, '$1"?"'],
  [/(^|[^\w])`(?:[^`\\\n]|\\.){0,500}`/g, "$1`?`"]
], Ds = /\bhttps?:\/\/[^\s'"`<>()\]]+/g, Ns = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, Us = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, Hs = /\b(?=[0-9a-fA-F]*\d)(?=[0-9a-fA-F]*[a-fA-F])[0-9a-fA-F]{16,}\b/g, Fs = /\d{4,}/g, Yr = 8192;
function Bs(e) {
  if (!e) return e;
  let t = e.length > Yr ? e.slice(0, Yr) + "… [truncated]" : e;
  t = t.replace(Ds, (n) => xt(n)), t.includes("@") && (t = t.replace(Ns, "<email>"));
  for (const [n, r] of Ps)
    t = t.replace(n, r);
  return t = t.replace(Us, "<id>"), t = t.replace(Hs, "<id>"), t = t.replace(Fs, "<n>"), t;
}
const qs = /^\s+at |^[^\s@]*@\S+:\d+(?::\d+)?$/m;
function Pt(e) {
  switch (A.messages) {
    case "full":
      return e;
    case "scrub":
      return Bs(e);
    default:
      return "";
  }
}
function hr(e, t) {
  if (A.messages === "full" || !e || !t) return e;
  const n = qs.exec(e), r = n ? n.index : e.length, o = e.indexOf(t);
  if (o < 0 || o + t.length > r)
    return e;
  const i = Pt(t);
  let s = e.slice(0, o) + i;
  return i || (s = s.replace(/:\s*$/, "")), s + e.slice(o + t.length);
}
const zo = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', Vo = '[data-oodle-privacy="mask"],.oodle-privacy-mask', Xo = zo + "," + Vo + ",.rr-block,.rr-mask";
function zn(e) {
  if (A.actionText === "mask") return !0;
  try {
    return typeof e.closest == "function" && e.closest(Xo) !== null;
  } catch {
    return !0;
  }
}
let Vn = null;
function $s(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function js(e) {
  if (!$s(e.endpoint))
    return console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    ), !1;
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  );
  const t = zs(
    e.viewUrlQueryParams
  );
  return As({ ...e, viewUrlQueryParams: t }), Vn = { ...e, viewUrlQueryParams: t }, !0;
}
function zs(e) {
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
function x() {
  if (!Vn)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return Vn;
}
const yr = "__oodle_session_v2", gr = "__oodle_tab", Wr = "__oodle_session", Yo = 900 * 1e3, _r = 14400 * 1e3, vr = 1e3;
function Le() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
let mt = null, $ = null;
function wr(e, t) {
  try {
    const n = e == null ? void 0 : e.getItem(t);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function Sr(e, t, n) {
  try {
    e == null || e.setItem(t, JSON.stringify(n));
  } catch {
  }
}
function Wo() {
  try {
    return typeof localStorage < "u" ? localStorage : void 0;
  } catch {
    return;
  }
}
function Dt() {
  try {
    return typeof sessionStorage < "u" ? sessionStorage : void 0;
  } catch {
    return;
  }
}
const Vs = 1e3;
let he = 0;
function J() {
  const e = Date.now();
  if (mt && e - he < Vs) return mt;
  he = e;
  const t = wr(Wo(), yr);
  return t && typeof t.id == "string" && t.id ? Xs({
    id: t.id,
    createdAt: t.createdAt ?? Date.now(),
    lastActivity: t.lastActivity ?? Date.now(),
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: t.started ?? !0
  }) : mt;
}
const Ne = /* @__PURE__ */ new Map();
function Ko(e) {
  const t = Ne.get(e.id);
  if (Ne.set(e.id, {
    lastActivity: Math.max((t == null ? void 0 : t.lastActivity) ?? 0, e.lastActivity),
    createdAt: e.createdAt
  }), Ne.size > 20) {
    const n = Ne.keys().next().value;
    n !== void 0 && Ne.delete(n);
  }
}
function Xs(e) {
  return e && (mt = e, Ko(e)), e;
}
function zt(e) {
  mt = e, Ko(e), he = Date.now(), Sr(Wo(), yr, e);
}
function En() {
  if ($) return $;
  const e = wr(Dt(), gr);
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
function Ys(e) {
  $ = e, Sr(Dt(), gr, e);
}
let He = null;
function Ws(e) {
  $ = e, !He && (He = setTimeout(() => {
    He = null, $ && Sr(Dt(), gr, $);
  }, 1e3));
}
function ot(e) {
  He && (clearTimeout(He), He = null), Ys(e);
}
let Jo = 100, Go = 100;
function Ks(e, t) {
  Jo = Math.max(0, Math.min(100, e)), Go = Math.max(0, Math.min(100, t));
}
function Kr(e) {
  return Math.random() * 100 < e;
}
function Ze(e, t) {
  return !!e && t - e.lastActivity <= Yo && t - e.createdAt <= _r;
}
function Js(e) {
  var r;
  const t = wr(Dt(), Wr);
  if (!t || typeof t.id != "string") return !1;
  const n = {
    id: t.id,
    createdAt: t.createdAt ?? e,
    lastActivity: t.lastActivity ?? e,
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: !0
  };
  if (e - n.lastActivity > 1800 * 1e3 || e - n.createdAt > _r)
    return !1;
  zt(n), ot({
    tabId: Le(),
    sessionId: n.id,
    viewCount: t.viewCount ?? 0,
    errorCount: t.errorCount ?? 0,
    actionCount: t.actionCount ?? 0,
    replaySegmentSeq: t.replaySegmentSeq ?? 0,
    legacyReplay: !0
  });
  try {
    (r = Dt()) == null || r.removeItem(Wr);
  } catch {
  }
  return !0;
}
function Gs(e) {
  const t = Kr(Jo), n = {
    id: Le(),
    createdAt: e,
    lastActivity: e,
    sampled: t,
    replaySampled: t && Kr(Go),
    started: !1
  };
  return zt(n), n;
}
const Xn = /* @__PURE__ */ new Set();
function Qs(e) {
  return Xn.add(e), () => Xn.delete(e);
}
function Ce() {
  let e = En();
  return e || (e = {
    tabId: Le(),
    sessionId: "",
    viewCount: 0,
    errorCount: 0,
    actionCount: 0,
    replaySegmentSeq: 0,
    legacyReplay: !1
  }, ot(e)), e;
}
function Tn(e) {
  const t = Ce();
  if (t.sessionId === e) return;
  const n = t.sessionId;
  if (t.sessionId = e, t.viewCount = 0, t.errorCount = 0, t.actionCount = 0, t.replaySegmentSeq = 0, t.legacyReplay = !1, ot(t), n)
    for (const r of Xn)
      try {
        r(n, e);
      } catch {
      }
}
let ht = 0;
function Jr() {
  const e = Date.now();
  he = 0;
  const t = J();
  Ze(t, e) && (e - ht >= vr && (t.lastActivity = Math.max(t.lastActivity, e), zt(t), ht = e), Tn(t.id));
}
const Zs = 6e4;
function Qo() {
  const e = Date.now();
  let t = J();
  Ze(t, e) || (he = 0, t = J()), Ze(t, e) ? e - ht >= vr && (t.lastActivity = Math.max(t.lastActivity, e), zt(t), ht = e) : (Js(e) ? t = J() : (t = Gs(e), na(t)), ht = e), t && Tn(t.id);
}
const ea = 100, ta = 2e3;
function na(e) {
  setTimeout(() => {
    var n;
    he = 0;
    const t = J();
    t && t.id !== e.id && Ze(t, Date.now()) && Math.abs(t.createdAt - e.createdAt) <= ta && ((n = En()) == null ? void 0 : n.sessionId) === e.id && Tn(t.id);
  }, ea);
}
function ae() {
  var r;
  const e = Date.now(), t = J();
  if (!Ze(t, e)) return "";
  const n = (r = En()) == null ? void 0 : r.sessionId;
  return n && n !== t.id ? "" : (Tn(t.id), t.id);
}
function ra(e) {
  he = 0;
  const t = J(), n = t && t.id === e ? t : Ne.get(e);
  if (!n) return t && t.id !== e ? Date.now() : null;
  const r = Math.min(
    n.lastActivity + Yo,
    n.createdAt + _r
  );
  return t && t.id !== e ? Math.min(r, Date.now()) : Date.now() > r ? r : null;
}
function Zo() {
  return Ce().tabId;
}
function oa() {
  return Ce().legacyReplay;
}
function ia() {
  const e = Date.now(), t = J();
  return !Ze(t, e) || t.started ? !1 : (t.started = !0, zt(t), !0);
}
function sa() {
  if (!ae()) return 0;
  const e = Ce(), t = e.replaySegmentSeq;
  return e.replaySegmentSeq = t + 1, ot(e), t;
}
function ei() {
  const e = J();
  return (e == null ? void 0 : e.sampled) ?? !0;
}
function ti() {
  const e = J();
  return (e == null ? void 0 : e.replaySampled) ?? !0;
}
let yt = null, gt = null, Wt = null, _t = null;
const ni = ["click", "keydown", "touchstart", "scroll"];
let W = null;
function aa() {
  if (typeof BroadcastChannel > "u") return;
  try {
    W = new BroadcastChannel("oodle_rum_tabs");
  } catch {
    W = null;
    return;
  }
  const e = Ce().tabId, t = Date.now();
  W.onmessage = (n) => {
    const r = n.data, o = Ce();
    !r || r.tabId !== o.tabId || (r.type === "hello" ? W == null || W.postMessage({ type: "taken", tabId: o.tabId }) : r.type === "taken" && o.tabId === e && Date.now() - t < 5e3 && (o.tabId = Le(), o.replaySegmentSeq = 0, ot(o)));
  }, W.postMessage({ type: "hello", tabId: e });
}
function ca() {
  if (typeof document > "u") return;
  ri(), aa();
  let e = 0;
  yt = () => {
    const t = Date.now();
    t - e < vr || (e = t, Qo());
  };
  for (const t of ni)
    document.addEventListener(t, yt, {
      capture: !0,
      passive: !0
    });
  _t = (t) => {
    t.key === yr && (he = 0);
  }, window.addEventListener("storage", _t), gt = () => {
    document.visibilityState === "visible" ? Jr() : $ && ot($);
  }, document.addEventListener("visibilitychange", gt), Wt = setInterval(() => {
    document.visibilityState === "visible" && Jr();
  }, Zs);
}
function ri() {
  if (!(typeof document > "u")) {
    if (yt) {
      for (const e of ni)
        document.removeEventListener(e, yt, {
          capture: !0
        });
      yt = null;
    }
    gt && (document.removeEventListener("visibilitychange", gt), gt = null), Wt && (clearInterval(Wt), Wt = null), W && (W.close(), W = null), _t && (window.removeEventListener("storage", _t), _t = null);
  }
}
function oi(e) {
  if (!ae()) return;
  const t = Ce();
  e === "view" || e === "page_load" ? t.viewCount++ : e === "error" ? t.errorCount++ : e === "action" && t.actionCount++, Ws(t);
}
function ua() {
  const e = $ ?? En();
  return {
    viewCount: (e == null ? void 0 : e.viewCount) ?? 0,
    errorCount: (e == null ? void 0 : e.errorCount) ?? 0,
    actionCount: (e == null ? void 0 : e.actionCount) ?? 0
  };
}
let j = null;
function la(e) {
  j = e;
}
function ii() {
  return (j == null ? void 0 : j.id) ?? "";
}
function fa() {
  return (j == null ? void 0 : j.name) ?? "";
}
function da() {
  return (j == null ? void 0 : j.email) ?? "";
}
function pa() {
  return j ? "identified" : "anonymous";
}
const ma = 5e5;
function rn(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > ma) return n;
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
let Nt = {};
function ha(e) {
  e && (Nt = { ...e, ...Nt });
}
function ya(e) {
  Nt = { ...Nt, ...e };
}
function ga() {
  return Nt;
}
const _a = 6e4, va = "sdk_telemetry", Fe = {
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
function P(e, t = 1) {
  Fe[e] += t;
}
function wa() {
  for (const e in Fe)
    if (Fe[e] > 0)
      return !0;
  return !1;
}
function Yn() {
  if (!wa()) return;
  const e = { ...Fe };
  for (const t in Fe)
    Fe[t] = 0;
  Ir(va, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let vt = null, wt = null;
function Sa() {
  vt || (vt = setInterval(
    Yn,
    _a
  ), typeof document < "u" && (wt = () => {
    document.visibilityState === "hidden" && Yn();
  }, document.addEventListener(
    "visibilitychange",
    wt
  )));
}
function Ea() {
  vt && (clearInterval(vt), vt = null), wt && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    wt
  ), wt = null), Yn();
}
var U = Uint8Array, D = Uint16Array, Er = Int32Array, Tr = new U([
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
]), br = new U([
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
]), Gr = new U([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), si = function(e, t) {
  for (var n = new D(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new Er(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, ai = si(Tr, 2), Ta = ai.b, Wn = ai.r;
Ta[28] = 258, Wn[258] = 28;
var ba = si(br, 0), Qr = ba.r, Kn = new D(32768);
for (var S = 0; S < 32768; ++S) {
  var ue = (S & 43690) >> 1 | (S & 21845) << 1;
  ue = (ue & 52428) >> 2 | (ue & 13107) << 2, ue = (ue & 61680) >> 4 | (ue & 3855) << 4, Kn[S] = ((ue & 65280) >> 8 | (ue & 255) << 8) >> 1;
}
var St = (function(e, t, n) {
  for (var r = e.length, o = 0, i = new D(t); o < r; ++o)
    e[o] && ++i[e[o] - 1];
  var s = new D(t);
  for (o = 1; o < t; ++o)
    s[o] = s[o - 1] + i[o - 1] << 1;
  var a;
  if (n) {
    a = new D(1 << t);
    var c = 15 - t;
    for (o = 0; o < r; ++o)
      if (e[o])
        for (var l = o << 4 | e[o], u = t - e[o], f = s[e[o] - 1]++ << u, d = f | (1 << u) - 1; f <= d; ++f)
          a[Kn[f] >> c] = l;
  } else
    for (a = new D(r), o = 0; o < r; ++o)
      e[o] && (a[o] = Kn[s[e[o] - 1]++] >> 15 - e[o]);
  return a;
}), Me = new U(288);
for (var S = 0; S < 144; ++S)
  Me[S] = 8;
for (var S = 144; S < 256; ++S)
  Me[S] = 9;
for (var S = 256; S < 280; ++S)
  Me[S] = 7;
for (var S = 280; S < 288; ++S)
  Me[S] = 8;
var on = new U(32);
for (var S = 0; S < 32; ++S)
  on[S] = 5;
var Aa = /* @__PURE__ */ St(Me, 9, 0), Ia = /* @__PURE__ */ St(on, 5, 0), ci = function(e) {
  return (e + 7) / 8 | 0;
}, ui = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new U(e.subarray(t, n));
}, Q = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, at = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, xn = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: fi, l: 0 };
  if (o == 1) {
    var s = new U(n[0].s + 1);
    return s[n[0].s] = 1, { t: s, l: 1 };
  }
  n.sort(function(M, _) {
    return M.f - _.f;
  }), n.push({ s: -1, f: 25001 });
  var a = n[0], c = n[1], l = 0, u = 1, f = 2;
  for (n[0] = { s: -1, f: a.f + c.f, l: a, r: c }; u != o - 1; )
    a = n[n[l].f < n[f].f ? l++ : f++], c = n[l != u && n[l].f < n[f].f ? l++ : f++], n[u++] = { s: -1, f: a.f + c.f, l: a, r: c };
  for (var d = i[0].s, r = 1; r < o; ++r)
    i[r].s > d && (d = i[r].s);
  var y = new D(d + 1), m = Jn(n[u - 1], y, 0);
  if (m > t) {
    var r = 0, w = 0, k = m - t, C = 1 << k;
    for (i.sort(function(_, v) {
      return y[v.s] - y[_.s] || _.f - v.f;
    }); r < o; ++r) {
      var I = i[r].s;
      if (y[I] > t)
        w += C - (1 << m - y[I]), y[I] = t;
      else
        break;
    }
    for (w >>= k; w > 0; ) {
      var b = i[r].s;
      y[b] < t ? w -= 1 << t - y[b]++ - 1 : ++r;
    }
    for (; r >= 0 && w; --r) {
      var E = i[r].s;
      y[E] == t && (--y[E], ++w);
    }
    m = t;
  }
  return { t: new U(y), l: m };
}, Jn = function(e, t, n) {
  return e.s == -1 ? Math.max(Jn(e.l, t, n + 1), Jn(e.r, t, n + 1)) : t[e.s] = n;
}, Zr = function(e) {
  for (var t = e.length; t && !e[--t]; )
    ;
  for (var n = new D(++t), r = 0, o = e[0], i = 1, s = function(c) {
    n[r++] = c;
  }, a = 1; a <= t; ++a)
    if (e[a] == o && a != t)
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
      i = 1, o = e[a];
    }
  return { c: n.subarray(0, r), n: t };
}, ct = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, li = function(e, t, n) {
  var r = n.length, o = ci(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, eo = function(e, t, n, r, o, i, s, a, c, l, u) {
  Q(t, u++, n), ++o[256];
  for (var f = xn(o, 15), d = f.t, y = f.l, m = xn(i, 15), w = m.t, k = m.l, C = Zr(d), I = C.c, b = C.n, E = Zr(w), M = E.c, _ = E.n, v = new D(19), h = 0; h < I.length; ++h)
    ++v[I[h] & 31];
  for (var h = 0; h < M.length; ++h)
    ++v[M[h] & 31];
  for (var p = xn(v, 7), T = p.t, G = p.l, R = 19; R > 4 && !T[Gr[R - 1]]; --R)
    ;
  var Re = l + 5 << 3, F = ct(o, Me) + ct(i, on) + s, B = ct(o, d) + ct(i, w) + s + 14 + 3 * R + ct(v, T) + 2 * v[16] + 3 * v[17] + 7 * v[18];
  if (c >= 0 && Re <= F && Re <= B)
    return li(t, u, e.subarray(c, c + l));
  var z, L, q, ce;
  if (Q(t, u, 1 + (B < F)), u += 2, B < F) {
    z = St(d, y, 0), L = d, q = St(w, k, 0), ce = w;
    var Cn = St(T, G, 0);
    Q(t, u, b - 257), Q(t, u + 5, _ - 1), Q(t, u + 10, R - 4), u += 14;
    for (var h = 0; h < R; ++h)
      Q(t, u + 3 * h, T[Gr[h]]);
    u += 3 * R;
    for (var V = [I, M], st = 0; st < 2; ++st)
      for (var Oe = V[st], h = 0; h < Oe.length; ++h) {
        var X = Oe[h] & 31;
        Q(t, u, Cn[X]), u += T[X], X > 15 && (Q(t, u, Oe[h] >> 5 & 127), u += Oe[h] >> 12);
      }
  } else
    z = Aa, L = Me, q = Ia, ce = on;
  for (var h = 0; h < a; ++h) {
    var O = r[h];
    if (O > 255) {
      var X = O >> 18 & 31;
      at(t, u, z[X + 257]), u += L[X + 257], X > 7 && (Q(t, u, O >> 23 & 31), u += Tr[X]);
      var xe = O & 31;
      at(t, u, q[xe]), u += ce[xe], xe > 3 && (at(t, u, O >> 5 & 8191), u += br[xe]);
    } else
      at(t, u, z[O]), u += L[O];
  }
  return at(t, u, z[256]), u + L[256];
}, ka = /* @__PURE__ */ new Er([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), fi = /* @__PURE__ */ new U(0), Ca = function(e, t, n, r, o, i) {
  var s = i.z || e.length, a = new U(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), c = a.subarray(r, a.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (c[0] = i.r >> 3);
    for (var f = ka[t - 1], d = f >> 13, y = f & 8191, m = (1 << n) - 1, w = i.p || new D(32768), k = i.h || new D(m + 1), C = Math.ceil(n / 3), I = 2 * C, b = function(Rn) {
      return (e[Rn] ^ e[Rn + 1] << C ^ e[Rn + 2] << I) & m;
    }, E = new Er(25e3), M = new D(288), _ = new D(32), v = 0, h = 0, p = i.i || 0, T = 0, G = i.w || 0, R = 0; p + 2 < s; ++p) {
      var Re = b(p), F = p & 32767, B = k[Re];
      if (w[F] = B, k[Re] = F, G <= p) {
        var z = s - p;
        if ((v > 7e3 || T > 24576) && (z > 423 || !l)) {
          u = eo(e, c, 0, E, M, _, h, T, R, p - R, u), T = v = h = 0, R = p;
          for (var L = 0; L < 286; ++L)
            M[L] = 0;
          for (var L = 0; L < 30; ++L)
            _[L] = 0;
        }
        var q = 2, ce = 0, Cn = y, V = F - B & 32767;
        if (z > 2 && Re == b(p - V))
          for (var st = Math.min(d, z) - 1, Oe = Math.min(32767, p), X = Math.min(258, z); V <= Oe && --Cn && F != B; ) {
            if (e[p + q] == e[p + q - V]) {
              for (var O = 0; O < X && e[p + O] == e[p + O - V]; ++O)
                ;
              if (O > q) {
                if (q = O, ce = V, O > st)
                  break;
                for (var xe = Math.min(V, O - 2), Br = 0, L = 0; L < xe; ++L) {
                  var Mn = p - V + L & 32767, vs = w[Mn], qr = Mn - vs & 32767;
                  qr > Br && (Br = qr, B = Mn);
                }
              }
            }
            F = B, B = w[F], V += F - B & 32767;
          }
        if (ce) {
          E[T++] = 268435456 | Wn[q] << 18 | Qr[ce];
          var $r = Wn[q] & 31, jr = Qr[ce] & 31;
          h += Tr[$r] + br[jr], ++M[257 + $r], ++_[jr], G = p + q, ++v;
        } else
          E[T++] = e[p], ++M[e[p]];
      }
    }
    for (p = Math.max(p, G); p < s; ++p)
      E[T++] = e[p], ++M[e[p]];
    u = eo(e, c, l, E, M, _, h, T, R, p - R, u), l || (i.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, i.h = k, i.p = w, i.i = p, i.w = G);
  } else {
    for (var p = i.w || 0; p < s + l; p += 65535) {
      var Ln = p + 65535;
      Ln >= s && (c[u / 8 | 0] = l, Ln = s), u = li(c, u + 1, e.subarray(p, Ln));
    }
    i.i = s;
  }
  return ui(a, 0, r + ci(u) + o);
}, Ma = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), La = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = Ma[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, Ra = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new U(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return Ca(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, Gn = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, Oa = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && Gn(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, xa = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function Pa(e, t) {
  t || (t = {});
  var n = La(), r = e.length;
  n.p(e);
  var o = Ra(e, t, xa(t), 8), i = o.length;
  return Oa(o, t), Gn(o, i - 8, n.d()), Gn(o, i - 4, r), o;
}
var to = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), Da = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Na = 0;
try {
  Da.decode(fi, { stream: !0 }), Na = 1;
} catch {
}
function Ua(e, t) {
  var n;
  if (to)
    return to.encode(e);
  for (var r = e.length, o = new U(e.length + (e.length >> 1)), i = 0, s = function(l) {
    o[i++] = l;
  }, n = 0; n < r; ++n) {
    if (i + 5 > o.length) {
      var a = new U(i + 8 + (r - n << 1));
      a.set(o), o = a;
    }
    var c = e.charCodeAt(n);
    c < 128 || t ? s(c) : c < 2048 ? (s(192 | c >> 6), s(128 | c & 63)) : c > 55295 && c < 57344 ? (c = 65536 + (c & 1047552) | e.charCodeAt(++n) & 1023, s(240 | c >> 18), s(128 | c >> 12 & 63), s(128 | c >> 6 & 63), s(128 | c & 63)) : (s(224 | c >> 12), s(128 | c >> 6 & 63), s(128 | c & 63));
  }
  return ui(o, 0, i);
}
function Kt(e) {
  try {
    return Pa(Ua(e));
  } catch {
    return null;
  }
}
const Ha = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function Fa(e) {
  if (!Ha)
    return Kt(e);
  try {
    const t = new Response(e).body;
    if (!t) return Kt(e);
    const n = t.pipeThrough(
      new CompressionStream("gzip")
    ), r = await new Response(
      n
    ).arrayBuffer();
    return new Uint8Array(r);
  } catch {
    return Kt(e);
  }
}
const Ba = "0.7.0", no = 5e3, di = 50, pi = 5e5, ro = 256e3, sn = "replay", mi = 8e4, hi = 32, qa = 2e7, $a = 5, ja = 1e3, za = 6e4, Va = 500, an = 63e3;
let Be = 0, qe = 0, le = [], Et = 0, Pn = null;
const cn = /* @__PURE__ */ new Map();
let $e = null, je = null, Qn = null;
const Zn = /* @__PURE__ */ new Set();
function Xa(e) {
  return Zn.add(e), () => Zn.delete(e);
}
let Tt = !1;
function Ya() {
  try {
    return x().flushIntervalMs ?? no;
  } catch {
    return no;
  }
}
function yi(e) {
  let t = cn.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, cn.set(e, t)), t;
}
function gi(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (P("compression_failures"), { body: t, encoding: "" });
}
async function _i(e) {
  return gi(await Fa(e), e);
}
function Wa(e) {
  return gi(Kt(e), e);
}
const Ka = 64e3;
function er(e, t, n) {
  if (e === sn)
    return {
      bytes: n ?? rn(
        t,
        Ka
      ),
      oversized: !1
    };
  const r = rn(
    t,
    ro + 1
  );
  return {
    bytes: r,
    oversized: r > ro
  };
}
let tr = null;
function Ja(e) {
  tr = e;
}
function bn(e) {
  P("transport_drops"), e === sn && tr && tr();
}
const Ga = "/v1/rum/ingest";
function Qa(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: Ba
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
function Za(e, t, n) {
  const r = x();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const c = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, l = new Blob([n], {
      type: "application/json"
    });
    if (l.size < an && navigator.sendBeacon(c, l))
      return;
  }
  const { body: o, encoding: i } = Wa(n), s = { ...t };
  i ? s["Content-Encoding"] = i : delete s["Content-Encoding"];
  const a = o instanceof Blob ? o.size : n.length;
  fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: a < an,
    credentials: "omit"
  }).catch(() => {
    P("exit_send_failures");
  });
}
function Dn(e, t, n, r) {
  const o = n.length;
  if (Et + o > qa) {
    P("retry_drops"), r && bn(r);
    return;
  }
  const i = { ...t };
  delete i["Content-Encoding"], le.push({
    url: e,
    headers: i,
    body: n,
    bytes: o,
    attempts: 0,
    batchKey: r
  }), Et += o, vi();
}
function vi() {
  if (Pn || le.length === 0)
    return;
  const e = le[0], t = Math.min(
    ja * Math.pow(2, e.attempts),
    za
  );
  Pn = setTimeout(() => {
    Pn = null, wi();
  }, t);
}
async function wi() {
  for (; le.length > 0 && Be < mi && qe < hi; ) {
    const e = le.shift();
    if (Et -= e.bytes, e.attempts++, e.attempts > $a) {
      P("retry_drops"), e.batchKey && bn(e.batchKey);
      continue;
    }
    const t = e.bytes;
    Be += t, qe++;
    try {
      const { body: n, encoding: r } = await _i(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < an,
        credentials: "omit"
      });
      if (Ei(i), i.status === 429 || i.status >= 500) {
        le.unshift(e), Et += e.bytes;
        break;
      }
    } catch {
      le.unshift(e), Et += e.bytes;
      break;
    } finally {
      Be -= t, qe--;
    }
  }
  le.length > 0 && vi();
}
function ec() {
  $e && (clearTimeout($e), $e = null), je && (clearTimeout(je), je = null);
}
function Ar() {
  const e = Ya();
  $e && clearTimeout($e), $e = setTimeout(
    () => se(),
    e
  ), je || (je = setTimeout(
    () => {
      je = null, se();
    },
    e + Va
  ));
}
function Ir(e, t, n) {
  const { bytes: r, oversized: o } = er(
    e,
    t,
    n
  );
  if (o) {
    console.warn(
      `[@oodle-ai/rum] Dropping oversized ${e} payload (${r} bytes)`
    ), bn(e);
    return;
  }
  const i = yi(e);
  if (i.items.push(t), i.bytesEstimate += r, !Tt && (i.items.length >= di || i.bytesEstimate >= pi)) {
    se();
    return;
  }
  Ar();
}
function tc(e, t, n, r) {
  const { bytes: o, oversized: i } = er(
    e,
    n
  );
  if (i) {
    bn(e);
    return;
  }
  const s = yi(e), a = s.upsertMap.get(t);
  if (a !== void 0) {
    const c = er(
      e,
      s.items[a]
    ).bytes;
    s.items[a] = r ? r(s.items[a], n) : n, s.bytesEstimate += o - c;
  } else {
    const c = s.items.length;
    s.items.push(n), s.upsertMap.set(t, c), s.bytesEstimate += o;
  }
  if (!Tt && (s.items.length >= di || s.bytesEstimate >= pi)) {
    se();
    return;
  }
  Ar();
}
function Si(e) {
  Qn = e;
}
const oo = ["events", "replay"];
function se(e = !1) {
  const t = x();
  if (e && Qn && !Tt) {
    Tt = !0;
    try {
      Qn();
    } catch {
    } finally {
      Tt = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    Ar();
    return;
  }
  ec();
  const n = ga(), r = [], o = Array.from(
    cn.keys()
  ).sort((l, u) => {
    const f = oo.indexOf(l), d = oo.indexOf(u), y = f >= 0 ? f : 999, m = d >= 0 ? d : 999;
    return y - m;
  });
  for (const l of o) {
    const u = cn.get(l);
    if (!u || u.items.length === 0) continue;
    const f = u.items.splice(0);
    u.upsertMap.clear(), u.bytesEstimate = 0;
    const d = f.map((y) => ({
      ...y,
      tags: n
    }));
    r.push({
      type: u.batchKey,
      items: d
    });
  }
  if (r.length === 0) return;
  const i = Qa(r), s = `${t.endpoint}${Ga}`, a = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, c = r.some(
    (l) => l.type === sn
  );
  if (e) {
    Za(s, a, i);
    return;
  }
  nc(
    s,
    a,
    i,
    c ? sn : void 0
  );
}
async function nc(e, t, n, r) {
  const o = n.length;
  if (Be >= mi || qe >= hi) {
    Dn(e, t, n, r);
    return;
  }
  Be += o, qe++;
  try {
    const { body: i, encoding: s } = await _i(n), a = { ...t };
    s && (a["Content-Encoding"] = s);
    const c = await fetch(e, {
      method: "POST",
      headers: a,
      body: i,
      keepalive: o < an,
      credentials: "omit"
    });
    Ei(c), (c.status === 429 || c.status >= 500) && Dn(e, t, n, r);
  } catch {
    P("send_failures"), Dn(e, t, n, r);
  } finally {
    Be -= o, qe--, wi();
  }
}
const nr = /* @__PURE__ */ new Map();
function Ei(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && nr.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function An(e) {
  const t = nr.get(e);
  return t ? Date.now() >= t ? (nr.delete(e), !1) : !0 : !1;
}
let bt = null, At = null, It = null, rr = null;
function rc(e) {
  rr = e;
}
const Ti = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function io() {
  typeof document > "u" || (bt = () => {
    document.visibilityState === "hidden" && se(!0);
  }, At = () => {
    for (const e of Zn)
      try {
        e();
      } catch {
      }
    se(!0);
  }, It = (e) => {
    e.persisted && rr && rr();
  }, document.addEventListener(
    "visibilitychange",
    bt
  ), window.addEventListener(
    Ti,
    At
  ), window.addEventListener(
    "pageshow",
    It
  ));
}
function oc() {
  bt && (document.removeEventListener(
    "visibilitychange",
    bt
  ), bt = null), At && (window.removeEventListener(
    Ti,
    At
  ), At = null), It && (window.removeEventListener(
    "pageshow",
    It
  ), It = null);
}
const un = /* @__PURE__ */ new Map();
function ic(e, t) {
  un.set(e, t);
}
function sc() {
  return un.size === 0 ? {} : Object.fromEntries(un);
}
function ac() {
  un.clear();
}
const cc = 100, uc = 1e4, be = /* @__PURE__ */ new Set();
let bi = 0, ze = null;
function kr(e) {
  for (const t of be)
    try {
      t(e);
    } catch {
    }
}
const lc = { kind: "dom" }, fc = () => kr(lc);
function Ai() {
  ze || typeof MutationObserver > "u" || typeof document > "u" || !document.documentElement || (ze = new MutationObserver(fc), ze.observe(document.documentElement, {
    childList: !0,
    subtree: !0,
    attributes: !0,
    characterData: !0
  }));
}
function or() {
  be.size > 0 || !ze || (ze.disconnect(), ze = null);
}
function Ii() {
  const e = bi++;
  return kr({ kind: "start", index: e }), e;
}
function ki(e) {
  kr({ kind: "end", index: e });
}
function dc(e) {
  const t = (n) => {
    n.kind !== "end" && e();
  };
  return be.add(t), Ai(), () => {
    be.delete(t), or();
  };
}
function Ci(e, t, n = uc) {
  let r = null;
  const o = bi;
  let i = 0, s = null, a = null, c = !1;
  const l = (d) => {
    c || (c = !0, s && clearTimeout(s), a && clearTimeout(a), be.delete(f), or(), t(d));
  }, u = () => {
    s && clearTimeout(s), s = setTimeout(() => {
      if (i > 0) {
        u();
        return;
      }
      l({
        endMs: r,
        hadActivity: r !== null,
        timedOut: !1
      });
    }, cc);
  };
  function f(d) {
    if (d.kind !== "dom") {
      if (d.index < o) return;
      i = Math.max(0, i + (d.kind === "start" ? 1 : -1));
    }
    r = Date.now(), u();
  }
  return be.add(f), Ai(), u(), Number.isFinite(n) && (a = setTimeout(() => {
    l({
      endMs: r,
      hadActivity: r !== null,
      timedOut: !0
    });
  }, n)), () => {
    c = !0, s && clearTimeout(s), a && clearTimeout(a), be.delete(f), or();
  };
}
var fe, kt, Mi, ln, Li = -1, Vt = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (Li = t.timeStamp, e(t));
  }), !0);
}, Cr = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, In = function() {
  var e = Cr();
  return e && e.activationStart || 0;
}, ye = function(e, t) {
  var n = Cr(), r = "navigate";
  return Li >= 0 ? r = "back-forward-cache" : n && (document.prerendering || In() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, Mr = function(e, t, n) {
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
}, ge = function(e, t, n, r) {
  var o, i;
  return function(s) {
    t.value >= 0 && (s || r) && ((i = t.value - (o || 0)) || o === void 0) && (o = t.value, t.delta = i, t.rating = (function(a, c) {
      return a > c[1] ? "poor" : a > c[0] ? "needs-improvement" : "good";
    })(t.value, n), e(t));
  };
}, Ri = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, Lr = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, Rr = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Ue = -1, so = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, fn = function(e) {
  document.visibilityState === "hidden" && Ue > -1 && (Ue = e.type === "visibilitychange" ? e.timeStamp : 0, pc());
}, ao = function() {
  addEventListener("visibilitychange", fn, !0), addEventListener("prerenderingchange", fn, !0);
}, pc = function() {
  removeEventListener("visibilitychange", fn, !0), removeEventListener("prerenderingchange", fn, !0);
}, Or = function() {
  return Ue < 0 && (Ue = so(), ao(), Vt((function() {
    setTimeout((function() {
      Ue = so(), ao();
    }), 0);
  }))), { get firstHiddenTime() {
    return Ue;
  } };
}, kn = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, co = [1800, 3e3], mc = function(e, t) {
  t = t || {}, kn((function() {
    var n, r = Or(), o = ye("FCP"), i = Mr("paint", (function(s) {
      s.forEach((function(a) {
        a.name === "first-contentful-paint" && (i.disconnect(), a.startTime < r.firstHiddenTime && (o.value = Math.max(a.startTime - In(), 0), o.entries.push(a), n(!0)));
      }));
    }));
    i && (n = ge(e, o, co, t.reportAllChanges), Vt((function(s) {
      o = ye("FCP"), n = ge(e, o, co, t.reportAllChanges), Ri((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, hc = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = Rr(e), document.visibilityState === "hidden" ? e() : (n = t(e), Lr(e)), n;
}, uo = [2500, 4e3], Nn = {}, yc = function(e, t) {
  t = t || {}, kn((function() {
    var n, r = Or(), o = ye("LCP"), i = function(c) {
      t.reportAllChanges || (c = c.slice(-1)), c.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - In(), 0), o.entries = [l], n());
      }));
    }, s = Mr("largest-contentful-paint", i);
    if (s) {
      n = ge(e, o, uo, t.reportAllChanges);
      var a = Rr((function() {
        Nn[o.id] || (i(s.takeRecords()), s.disconnect(), Nn[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(c) {
        addEventListener(c, (function() {
          return hc(a);
        }), { once: !0, capture: !0 });
      })), Lr(a), Vt((function(c) {
        o = ye("LCP"), n = ge(e, o, uo, t.reportAllChanges), Ri((function() {
          o.value = performance.now() - c.timeStamp, Nn[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, lo = [800, 1800], gc = function e(t) {
  document.prerendering ? kn((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, _c = function(e, t) {
  t = t || {};
  var n = ye("TTFB"), r = ge(e, n, lo, t.reportAllChanges);
  gc((function() {
    var o = Cr();
    o && (n.value = Math.max(o.responseStart - In(), 0), n.entries = [o], r(!0), Vt((function() {
      n = ye("TTFB", 0), (r = ge(e, n, lo, t.reportAllChanges))(!0);
    })));
  }));
}, pt = { passive: !0, capture: !0 }, vc = /* @__PURE__ */ new Date(), fo = function(e, t) {
  fe || (fe = t, kt = e, Mi = /* @__PURE__ */ new Date(), xi(removeEventListener), Oi());
}, Oi = function() {
  if (kt >= 0 && kt < Mi - vc) {
    var e = { entryType: "first-input", name: fe.type, target: fe.target, cancelable: fe.cancelable, startTime: fe.timeStamp, processingStart: fe.timeStamp + kt };
    ln.forEach((function(t) {
      t(e);
    })), ln = [];
  }
}, wc = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        fo(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, pt), removeEventListener("pointercancel", i, pt);
      };
      addEventListener("pointerup", o, pt), addEventListener("pointercancel", i, pt);
    })(t, e) : fo(t, e);
  }
}, xi = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, wc, pt);
  }));
}, po = [100, 300], Sc = function(e, t) {
  t = t || {}, kn((function() {
    var n, r = Or(), o = ye("FID"), i = function(c) {
      c.startTime < r.firstHiddenTime && (o.value = c.processingStart - c.startTime, o.entries.push(c), n(!0));
    }, s = function(c) {
      c.forEach(i);
    }, a = Mr("first-input", s);
    n = ge(e, o, po, t.reportAllChanges), a && (Lr(Rr((function() {
      s(a.takeRecords()), a.disconnect();
    }))), Vt((function() {
      var c;
      o = ye("FID"), n = ge(e, o, po, t.reportAllChanges), ln = [], kt = -1, fe = null, xi(addEventListener), c = i, ln.push(c), Oi();
    })));
  }));
};
const Ec = 3e3;
let Ut = null, Pi = (e) => e.href, g = null, re = null, dn = [];
function pn() {
  return typeof performance < "u" ? performance.now() : 0;
}
function Tc() {
  return typeof performance < "u" && performance.timeOrigin ? performance.timeOrigin : Date.now();
}
function Ct(e) {
  const t = e.hash ?? "", n = t.startsWith("#/") ? t.split("?")[0] : "";
  return e.pathname + n;
}
function Di(e, t, n) {
  return {
    id: Le(),
    sessionId: ae(),
    loadingType: e,
    startEpoch: t,
    startPerf: n,
    url: Pi(window.location),
    urlPath: pe(window.location.pathname),
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
function bc(e) {
  const t = Array.from(e.interactions.values()).sort((r, o) => o - r);
  if (t.length === 0) return 0;
  const n = Math.min(t.length - 1, Math.floor(t.length / 50));
  return t[n];
}
function Ac(e) {
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
    inp_ms: bc(e),
    cls: Math.round(e.cls.value * 1e4) / 1e4,
    dns_ms: n.dns_ms ?? 0,
    connect_ms: n.connect_ms ?? 0,
    tls_ms: n.tls_ms ?? 0,
    download_ms: n.download_ms ?? 0,
    dom_interactive_ms: n.dom_interactive_ms ?? 0,
    dom_complete_ms: n.dom_complete_ms ?? 0
  };
}
function it(e) {
  if (!(!Ut || !e.sessionId)) {
    if (e.endEpoch !== void 0) {
      if (e.expirySent) return;
      e.expirySent = !0;
    } else if (e.active) {
      const t = ra(e.sessionId);
      t !== null && (e.active = !1, e.endEpoch = Math.max(e.startEpoch, t), e.expirySent = !0, e.cancelIdle && e.cancelIdle(), g === e && (g = null));
    }
    e.seq++, Ut(Ac(e), e.sessionId);
  }
}
function Ni() {
  re && (clearTimeout(re), re = null), g && it(g);
}
function Ht() {
  re || !g || (re = setTimeout(() => {
    re = null, g && it(g);
  }, Ec));
}
const Ic = 5 * 6e4, Mt = /* @__PURE__ */ new Map();
function kc(e) {
  const t = Date.now();
  for (const [n, r] of Mt) r.until <= t && Mt.delete(n);
  Mt.set(e.id, { v: e, until: t + Ic });
}
function mn() {
  const e = g;
  e && (kc(e), e.cancelIdle && e.cancelIdle(), re && (clearTimeout(re), re = null), e.active = !1, it(e), g = null);
}
function Ui(e) {
  typeof document < "u" && document.visibilityState === "hidden" && (e.hiddenAt = e.startEpoch), e.cancelIdle = Ci(
    e.startEpoch,
    (t) => {
      if (e.cancelIdle = null, g !== e) return;
      let n = t.endMs !== null && t.hadActivity ? t.endMs - e.startEpoch : 0;
      e.loadingType === "initial_load" && (n = Math.max(n, e.vitals.load_event_ms ?? 0)), !(e.hiddenAt !== void 0 && e.startEpoch + n > e.hiddenAt) && (e.loadingTimeMs = Math.max(0, n), Ni());
    },
    1 / 0
  );
}
function hn(e, t, n) {
  mn();
  const r = Di(e, t, n);
  r.sessionId && (g = r, it(r), Ui(r));
}
function Hi() {
  return (g == null ? void 0 : g.id) ?? "";
}
function Cc() {
  return (g == null ? void 0 : g.urlPath) ?? "";
}
function Mc(e) {
  const t = typeof e.view_id == "string" ? e.view_id : "";
  let n = g, r = !1;
  if (t && (n == null ? void 0 : n.id) !== t) {
    const o = Mt.get(t);
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
    r ? it(n) : Ht();
  }
}
function Lc(e) {
  var r, o;
  const t = (o = (r = performance.getEntriesByType) == null ? void 0 : r.call(performance, "navigation")) == null ? void 0 : o[0];
  if (!t || t.loadEventEnd <= 0) return !1;
  const n = Math.round;
  return e.vitals.load_event_ms = n(t.loadEventEnd - t.startTime), e.vitals.dns_ms = n(t.domainLookupEnd - t.domainLookupStart), e.vitals.connect_ms = n(t.connectEnd - t.connectStart), e.vitals.tls_ms = n(
    t.secureConnectionStart > 0 ? t.connectEnd - t.secureConnectionStart : 0
  ), e.vitals.download_ms = n(t.responseEnd - t.responseStart), e.vitals.dom_interactive_ms = n(t.domInteractive - t.startTime), e.vitals.dom_complete_ms = n(t.domComplete - t.startTime), !0;
}
function Un(e, t, n = {}) {
  if (!(typeof PerformanceObserver > "u"))
    try {
      const r = new PerformanceObserver((o) => t(o.getEntries()));
      r.observe({ type: e, buffered: !0, ...n }), dn.push(() => r.disconnect());
    } catch {
    }
}
function Rc(e, t, n) {
  const r = e.cls;
  r.windowValue > 0 && n - r.last < 1e3 && n - r.windowStart < 5e3 ? r.windowValue += t : (r.windowValue = t, r.windowStart = n), r.last = n, r.windowValue > r.value && (r.value = r.windowValue);
}
function Oc() {
  Un("layout-shift", (t) => {
    const n = g;
    if (!n) return;
    let r = !1;
    for (const o of t)
      o.hadRecentInput || o.startTime < n.startPerf || (Rc(n, o.value, o.startTime), r = !0);
    r && Ht();
  });
  const e = (t) => {
    const n = g;
    if (!n) return;
    let r = !1;
    for (const o of t) {
      if (!o.interactionId || o.startTime < n.startPerf) continue;
      const i = n.interactions.get(o.interactionId) ?? 0;
      o.duration > i && (n.interactions.set(o.interactionId, o.duration), r = !0);
    }
    r && Ht();
  };
  Un("event", e, { durationThreshold: 40 }), Un("first-input", e);
}
function xc(e) {
  const t = (o, i) => {
    g !== e && !e.active || (e.vitals[o] = Math.round(i * 100) / 100, g === e && Ht());
  };
  try {
    yc((o) => t("lcp", o.value)), mc((o) => t("fcp", o.value)), _c((o) => t("ttfb", o.value)), Sc((o) => t("fid", o.value));
  } catch {
  }
  let n = 0;
  const r = () => {
    Lc(e) ? g === e && Ht() : ++n < 50 && setTimeout(r, 200);
  };
  document.readyState === "complete" ? setTimeout(r, 0) : window.addEventListener("load", () => setTimeout(r, 0), { once: !0 });
}
let Ve = "", Jt = !1;
function De() {
  const e = Ct(window.location);
  e !== Ve && (Ve = e, hn("route_change", Date.now(), pn()));
}
function Pc(e, t) {
  if (typeof window > "u") return;
  Fi(), Jt = !1, Ut = e, Pi = t, Ve = Ct(window.location);
  const n = Tc(), r = Di("initial_load", n, 0);
  r.sessionId && (g = r, it(r), Ui(r), xc(r)), Oc();
  const o = history.pushState, i = history.replaceState;
  history.pushState = function(...u) {
    o.apply(this, u), De();
  }, history.replaceState = function(...u) {
    i.apply(this, u), De();
  }, window.addEventListener("popstate", De), window.addEventListener("hashchange", De);
  const s = () => {
    document.visibilityState === "hidden" && (g && g.hiddenAt === void 0 && (g.hiddenAt = Date.now()), Ni());
  };
  document.addEventListener("visibilitychange", s);
  const a = () => {
    mn(), Jt = !0;
  };
  window.addEventListener("pagehide", a);
  const c = (u) => {
    u.persisted && (Jt = !1, Ve = Ct(window.location), hn("bf_cache", Date.now(), pn()));
  };
  window.addEventListener("pageshow", c);
  const l = Qs((u) => {
    g && g.sessionId === u && mn(), Ve = Ct(window.location), hn("route_change", Date.now(), pn());
  });
  dn.push(() => {
    history.pushState = o, history.replaceState = i, window.removeEventListener("popstate", De), window.removeEventListener("hashchange", De), document.removeEventListener("visibilitychange", s), window.removeEventListener("pagehide", a), window.removeEventListener("pageshow", c), l();
  });
}
function Dc() {
  g || Jt || !Ut || typeof window > "u" || (Ve = Ct(window.location), hn("route_change", Date.now(), pn()));
}
function Fi() {
  mn(), Mt.clear();
  for (const e of dn) e();
  dn = [], Ut = null, g = null;
}
const Nc = 3, Uc = 1e3;
let yn = null, K = null;
const oe = [], xr = [];
let Gt = null;
function Hc() {
  for (let e = oe.length - 1; e >= 0; e--)
    if (!oe[e].done) return oe[e].id;
  return "";
}
function Fc(e) {
  for (const t of oe)
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
function Bi(e) {
  return e.deadCandidate && !e.selected && !e.hadActivity && !e.userInput;
}
function Bc(e, t, n = !1) {
  const r = [];
  return t && r.push("rage_click"), (t ? n : Bi(e)) && r.push("dead_click"), e.errorCount > 0 && r.push("error_click"), r;
}
function mo(e, t, n = 1, r = !1) {
  if (!yn) return;
  const o = Bc(e, t, r), i = t ? "rage_click" : o.includes("dead_click") ? "dead_click" : o.includes("error_click") ? "error_click" : "click", s = {
    event_type: "action",
    timestamp: new Date(e.startMs).toISOString(),
    action_id: e.id,
    action_type: i,
    action_target: e.target,
    action_selector: e.selector,
    action_text: e.text,
    action_name: e.target,
    action_frustration_types: o.join(","),
    is_frustration: o.length > 0 ? 1 : 0,
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
  yn(s);
}
function gn() {
  const e = K;
  if (K = null, !e) return;
  e.timer && clearTimeout(e.timer);
  const t = () => e.clicks.every((o) => o.done), n = () => {
    const o = e.clicks.some((i) => i.userInput || i.selected);
    if (e.clicks.length >= Nc && !o) {
      const i = e.clicks[0], s = e.clicks.some(Bi);
      for (const a of e.clicks.slice(1))
        i.errorCount += a.errorCount, i.resourceCount += a.resourceCount, i.longTaskCount += a.longTaskCount, i.hadActivity = i.hadActivity || a.hadActivity;
      mo(i, !0, e.clicks.length, s);
    } else
      for (const i of e.clicks) mo(i, !1);
    for (const i of e.clicks) {
      const s = oe.indexOf(i);
      s >= 0 && oe.splice(s, 1);
    }
  };
  if (t()) {
    n();
    return;
  }
  const r = { flush: n, poll: null };
  Lt.add(r), r.poll = setInterval(() => {
    t() && (clearInterval(r.poll), Lt.delete(r), n());
  }, 50), xr.push(() => {
    clearInterval(r.poll), Lt.delete(r);
  });
}
const Lt = /* @__PURE__ */ new Set();
function qc() {
  const e = Date.now();
  for (const t of oe)
    t.done || (t.hadActivity = !0, t.userInput = Pr >= t.startMs, t.loadingTimeMs = Math.max(0, e - t.startMs), t.done = !0);
  K && gn();
  for (const t of [...Lt])
    t.poll && clearInterval(t.poll), Lt.delete(t), t.flush();
}
function $c(e) {
  if (e.tagName === "LABEL") {
    const t = e.getAttribute("for"), n = t ? document.getElementById(t) : null;
    if (n) return n;
  }
  return e;
}
function jc() {
  var e;
  try {
    const t = (e = window.getSelection) == null ? void 0 : e.call(window);
    return !!t && !t.isCollapsed && t.toString().length > 0;
  } catch {
    return !1;
  }
}
const zc = (
  // Text fields take the caret without changing the page; checkboxes,
  // radios and buttons must change something, so they stay candidates.
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="range"]),textarea,select,[contenteditable],[contenteditable] *,canvas,a[href],a[href] *'
), Vc = 10;
function we(e) {
  const t = e.split(`
`).map((n) => n.trim()).find(Boolean) ?? "";
  return t.length > 80 ? t.slice(0, 79) + "…" : t;
}
function ut(e, t) {
  return (e.getAttribute(t) ?? "").trim();
}
function Xc(e) {
  const t = e.tagName === "INPUT" || e.tagName === "SELECT" || e.tagName === "TEXTAREA" ? e.labels : null;
  if (t && t.length > 0) {
    const i = t[0];
    if (!zn(i)) return we(Rt(i));
  }
  if (e.tagName === "INPUT") {
    const i = ut(e, "type");
    if (i === "button" || i === "submit" || i === "reset")
      return we(e.value ?? "");
  }
  const n = ut(e, "role");
  if (["BUTTON", "LABEL", "A"].includes(e.tagName) || n === "button" || n === "link") {
    const i = we(Rt(e));
    if (i) return i;
  }
  const r = ut(e, "aria-label");
  if (r) return we(r);
  const o = ut(e, "aria-labelledby");
  if (o) {
    const i = o.split(/\s+/).map((s) => document.getElementById(s)).filter((s) => !!s && !zn(s)).map((s) => Rt(s)).join(" ");
    if (i.trim()) return we(i);
  }
  for (const i of ["alt", "title", "placeholder"]) {
    const s = ut(e, i);
    if (s) return we(s);
  }
  return "";
}
function Yc(e) {
  for (const t of [Xc, (n) => we(Rt(n))]) {
    let n = e;
    for (let r = 0; n && r <= Vc && n.tagName !== "BODY" && n.tagName !== "HTML"; r++) {
      const o = t(n);
      if (o) return { el: n, name: o };
      n = n.parentElement;
    }
  }
  return null;
}
const Wc = Xo + ",[contenteditable],input,textarea,select,script,style,template,noscript,[hidden]", Kc = /* @__PURE__ */ new Set([
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "BR",
  "DD",
  "DETAILS",
  "DIV",
  "DL",
  "DT",
  "FIELDSET",
  "FIGCAPTION",
  "FIGURE",
  "FOOTER",
  "FORM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "HR",
  "LI",
  "MAIN",
  "NAV",
  "OL",
  "P",
  "PRE",
  "SECTION",
  "SUMMARY",
  "TABLE",
  "TBODY",
  "TD",
  "TFOOT",
  "TH",
  "THEAD",
  "TR",
  "UL"
]);
function Rt(e, t = 200) {
  let n = "", r = "";
  const o = () => {
    const s = r.replace(/\s+/g, " ").trim();
    s && (n += (n ? `
` : "") + s), r = "";
  }, i = (s) => {
    for (let a = s.firstChild; a; a = a.nextSibling) {
      if (n.length + r.length >= t) return !1;
      if (a.nodeType === 3)
        r += a.nodeValue ?? "";
      else if (a.nodeType === 1) {
        let c = !0;
        try {
          c = a.matches(Wc);
        } catch {
          c = !0;
        }
        if (c) {
          o();
          continue;
        }
        const l = Kc.has(a.tagName);
        if (l && o(), !i(a)) return !1;
        l && o();
      }
    }
    return !0;
  };
  return i(e), o(), n.slice(0, t);
}
let Pr = 0, _n = !1, Qt = null, Zt = null;
function vn() {
  Qt && Qt(), Qt = null, Zt && clearTimeout(Zt), Zt = null;
}
function ho() {
  vn(), _n = !1, Qt = dc(() => {
    _n = !0;
  }), Zt = setTimeout(vn, 1e3);
}
let lt = null;
function Jc(e) {
  const t = e.target;
  if (!t || typeof t.tagName != "string") return;
  if (lt && t === lt) {
    lt = null;
    return;
  }
  const n = typeof t.closest == "function" ? t.closest("label") : null;
  if (n) {
    const m = n.control ?? (n.htmlFor ? document.getElementById(n.htmlFor) : null);
    m && m !== t && (lt = m, setTimeout(() => {
      lt = null;
    }, 0));
  }
  const r = _n;
  _n = !1, vn();
  const o = tu(t), i = Qc(t), s = i === null && zn(t), a = i === null && !s ? Yc(t) : null, c = (a == null ? void 0 : a.el) ?? t, l = c.tagName.toLowerCase(), u = i ?? (a ? Rt(c).slice(0, 200) : ""), f = i !== null ? `${l}[${i}]` : a ? `${l}[${a.name}]` : eu(t, l), d = {
    id: Le(),
    startMs: Date.now(),
    viewId: Hi(),
    viewPath: Cc(),
    target: f,
    selector: o,
    text: u,
    x: e.clientX,
    y: e.clientY,
    deadCandidate: !Zc($c(t), zc),
    selected: jc(),
    errorCount: 0,
    resourceCount: 0,
    longTaskCount: 0,
    loadingTimeMs: 0,
    hadActivity: !1,
    userInput: !1,
    done: !1
  };
  oe.push(d), xr.push(
    Ci(d.startMs, (m) => {
      d.hadActivity = m.hadActivity || r, d.userInput = Pr >= d.startMs, d.loadingTimeMs = m.endMs !== null && !m.timedOut ? Math.max(0, m.endMs - d.startMs) : 0, d.done = !0;
    })
  ), K && K.selector === o ? K.clicks.push(d) : (gn(), K = { selector: o, clicks: [d], timer: null });
  const y = K;
  y.timer && clearTimeout(y.timer), y.timer = setTimeout(() => {
    K === y && gn();
  }, Uc);
}
function Gc(e) {
  if (typeof document > "u") return;
  qi(), yn = e;
  const t = (o) => Jc(o), n = () => {
    Pr = Date.now();
  }, r = Xa(qc);
  document.addEventListener("pointerdown", ho, { capture: !0, passive: !0 }), document.addEventListener("click", t, { capture: !0, passive: !0 }), document.addEventListener("input", n, { capture: !0, passive: !0 }), document.addEventListener("scroll", n, { capture: !0, passive: !0 }), Gt = () => {
    r(), vn(), document.removeEventListener("pointerdown", ho, {
      capture: !0
    }), document.removeEventListener("click", t, {
      capture: !0
    }), document.removeEventListener("input", n, { capture: !0 }), document.removeEventListener("scroll", n, { capture: !0 });
  };
}
function qi() {
  K && gn();
  for (const e of xr.splice(0)) e();
  oe.splice(0), Gt && Gt(), Gt = null, yn = null;
}
const yo = "data-oodle-action-name";
function Qc(e) {
  var t;
  try {
    const n = typeof e.closest == "function" ? e.closest(`[${yo}]`) : null, r = (t = n == null ? void 0 : n.getAttribute(yo)) == null ? void 0 : t.trim();
    return r ? r.slice(0, 200) : null;
  } catch {
    return null;
  }
}
function Zc(e, t) {
  try {
    return typeof e.closest == "function" && e.closest(t) !== null;
  } catch {
    return !1;
  }
}
function eu(e, t) {
  if (e.id) return `${t}#${e.id}`;
  const n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
function tu(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
const Xe = "[REDACTED]", nu = /token|secret|auth|cookie|passw|api-?key|access-?key|session|csrf|xsrf|client-?ip|real-?ip|connecting-ip|(^|-)forwarded(-for)?$/, ru = /passw|secret|token(?!s|count|limit|usage|type)|apikey|accesskey|privatekey|authorization|credential|cardnumber|creditcard|cardnum|^pan$|cvv|cvc|securitycode|^ssn$|socialsecurity|^ip$|ipaddr|clientip|remoteaddr|remoteip|^ipv[46]$/;
function $i(e, t, n) {
  const r = /* @__PURE__ */ new Set(), o = [];
  if (Array.isArray(n))
    for (const i of n)
      typeof i == "string" ? r.add(t(i)) : i instanceof RegExp && o.push(i);
  return (i) => {
    const s = t(i);
    if (e.test(s) || r.has(s)) return !0;
    for (const a of o)
      if (a.lastIndex = 0, a.test(i)) return !0;
    return !1;
  };
}
function ji(e) {
  return $i(
    nu,
    (t) => t.toLowerCase(),
    e
  );
}
function zi(e) {
  return $i(
    ru,
    (t) => t.toLowerCase().replace(/[-_.\s]/g, ""),
    e
  );
}
function ou(e) {
  let t = 0, n = !1;
  for (let r = e.length - 1; r >= 0; r--) {
    let o = e.charCodeAt(r) - 48;
    n && (o *= 2, o > 9 && (o -= 9)), t += o, n = !n;
  }
  return t % 10 === 0;
}
const iu = /\b\d(?:[ -]?\d){12,18}\b/g;
function su(e) {
  return e.replace(iu, (t) => {
    const n = t.replace(/[ -]/g, "");
    return n.length >= 13 && n.length <= 19 && n[0] >= "2" && n[0] <= "6" && ou(n) ? Xe : t;
  });
}
function ir(e, t, n) {
  if (n > 32 || e === null || typeof e != "object")
    return;
  let r = !1;
  if (Array.isArray(e)) {
    const i = e.map((s) => {
      const a = ir(s, t, n + 1);
      return a === void 0 ? s : (r = !0, a);
    });
    return r ? i : void 0;
  }
  const o = /* @__PURE__ */ Object.create(null);
  for (const [i, s] of Object.entries(e)) {
    if (t(i) && s !== null && s !== "") {
      o[i] = Xe, r = !0;
      continue;
    }
    const a = ir(s, t, n + 1);
    a === void 0 ? o[i] = s : (o[i] = a, r = !0);
  }
  return r ? o : void 0;
}
const Hn = /"((?:[^"\\]|\\.){1,200})"\s*:\s*/g, au = /^("(?:[^"\\]|\\.)*"|[^\s,}\]{["]+)/;
function cu(e, t) {
  let n = "", r = 0;
  Hn.lastIndex = 0;
  let o;
  for (; (o = Hn.exec(e)) !== null; ) {
    if (!t(o[1])) continue;
    const i = o.index + o[0].length, s = e.slice(i);
    if (s[0] === "{" || s[0] === "[")
      return n + e.slice(r, i) + `"${Xe}"`;
    const a = au.exec(s);
    if (!a)
      return s[0] === '"' ? n + e.slice(r, i) + `"${Xe}"` : n + e.slice(r);
    a[1] === '""' || a[1] === "null" || (n += e.slice(r, i) + `"${Xe}"`, r = i + a[1].length, Hn.lastIndex = r);
  }
  return n + e.slice(r);
}
function uu(e) {
  return /^[\w.%+[\]-]+=[^&]*(&[\w.%+[\]-]+=[^&]*)*$/.test(e);
}
function lu(e, t) {
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
      const s = ir(o, t, 0);
      s !== void 0 && (r = JSON.stringify(s));
    } else
      r = cu(e, t);
  } else if (uu(n))
    try {
      const o = new URLSearchParams(e);
      let i = !1;
      if (o.forEach((s, a) => {
        t(a) && s && (i = !0);
      }), i) {
        const s = new URLSearchParams();
        o.forEach((a, c) => {
          s.append(c, t(c) && a ? Xe : a);
        }), r = s.toString();
      }
    } catch {
    }
  return su(r);
}
const fu = 50, go = 200, _o = /* @__PURE__ */ new Map();
function du(e) {
  let t = _o.get(e);
  return t || (t = {
    tokens: go,
    lastRefill: Date.now(),
    rate: fu,
    burst: go
  }, _o.set(e, t)), t;
}
function pu(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function mu(e) {
  const t = du(e);
  return pu(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let sr = null, ar = null;
function $l(e, t) {
  sr = e, ar = t;
}
const hu = "00000000000000000000000000000000";
function Vi() {
  if (!sr || !ar) return null;
  try {
    const e = sr.getSpan(
      ar.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === hu ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const vo = 100, yu = 10, wo = 5e3, gu = 3, _u = 0;
function vu(e, t = () => Date.now()) {
  const n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  function o() {
    n.clear(), r.clear();
  }
  function i(c) {
    const l = r.get(c);
    if (l !== void 0) return l;
    let u = c;
    const f = e();
    if (f)
      try {
        const d = f.getNode(c), y = d && d.closest ? d.closest("svg") : null;
        if (y) {
          const m = f.getId(y);
          m !== -1 && (u = m);
        }
      } catch {
      }
    return r.size < wo && r.set(c, u), u;
  }
  function s(c) {
    const l = i(c), u = t();
    let f = n.get(l);
    if (!f) {
      if (n.size >= wo)
        return !0;
      f = {
        tokens: vo,
        lastRefillMs: u
      }, n.set(l, f);
    }
    const d = (u - f.lastRefillMs) / 1e3;
    return d > 0 && (f.tokens = Math.min(
      vo,
      f.tokens + d * yu
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function a(c) {
    var m, w, k;
    if (c.type !== gu)
      return { event: c, dropped: 0 };
    const l = c.data;
    if (!l || l.source !== _u || !l.attributes || l.attributes.length === 0)
      return { event: c, dropped: 0 };
    const u = l.attributes.length, f = l.attributes.filter(
      (C) => s(C.id)
    ), d = u - f.length;
    return d === 0 ? { event: c, dropped: 0 } : (l.attributes = f, {
      event: f.length > 0 || (((m = l.adds) == null ? void 0 : m.length) ?? 0) > 0 || (((w = l.removes) == null ? void 0 : w.length) ?? 0) > 0 || (((k = l.texts) == null ? void 0 : k.length) ?? 0) > 0 ? c : null,
      dropped: d
    });
  }
  return { throttle: a, reset: o };
}
const So = 1, Fn = 2;
function wu(e) {
  if (e.length < 2) return e;
  const t = /* @__PURE__ */ new Map();
  for (let a = 0; a < e.length; a++)
    t.set(e[a].node.id, a);
  let n = !1;
  for (let a = 0; a < e.length && !n; a++) {
    const c = e[a], l = t.get(c.parentId), u = c.nextId != null ? t.get(c.nextId) : void 0;
    (l !== void 0 && l > a || u !== void 0 && u > a) && (n = !0);
  }
  if (!n) return e;
  const r = new Uint8Array(e.length), o = [], i = [], s = (a) => {
    const c = e[a], l = [], u = t.get(c.parentId);
    if (u !== void 0 && u !== a && l.push(u), c.nextId != null) {
      const f = t.get(c.nextId);
      f !== void 0 && f !== a && l.push(f);
    }
    return l;
  };
  for (let a = 0; a < e.length; a++)
    if (r[a] !== Fn)
      for (i.push(a); i.length > 0; ) {
        const c = i[i.length - 1];
        if (r[c] === Fn) {
          i.pop();
          continue;
        }
        if (r[c] === So) {
          r[c] = Fn, o.push(e[c]), i.pop();
          continue;
        }
        r[c] = So;
        const l = s(c);
        for (let u = l.length - 1; u >= 0; u--)
          r[l[u]] === 0 && i.push(l[u]);
      }
  return o;
}
const Eo = "replay", Su = 200, Eu = 6e4, Tu = 5e3, bu = 8e6, Xi = 2, Au = 3, Iu = 4, ku = 0, To = 3e3, Yi = 5e3, Cu = 3, Mu = 3e4, Lu = 5e3, Ru = 16, Ou = 100, xu = 4, Pu = 30, bo = 32, Ao = 250, Du = 36e4;
function Nu() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const Uu = 3e5, Hu = 9e5, Fu = 1e3;
let Ae = null, ie = null, ft = null, et = [], tt = 0, Se = "", Wi = "", Dr = !1, Ki = 0, Bn = "", te = 0, Ie = Date.now(), _e = !1, Ft = 0, Ee = null, nt = !1, Ye = null, Ji = 0, Z = [], Y = 0, We = null, de = null, en = 0;
function rt() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const Nr = vu(
  () => (Ae == null ? void 0 : Ae.mirror) ?? null
);
let Ke = null, Te = null, Je = !1, Bt = !1, Ur = 0, tn = null, ne = null;
function Bu() {
  We && (clearTimeout(We), We = null), de && (de(), de = null);
}
function cr(e, t) {
  Bu();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    Pu
  ) : null, r = e ? rt() + (n ?? xu) : Number.POSITIVE_INFINITY;
  for (; Y < Z.length; ) {
    const o = Math.min(
      Y + bo,
      Z.length
    );
    for (; Y < o; )
      ur(
        Z[Y++]
      );
    if (rt() >= r) break;
  }
  if (Y >= Z.length) {
    Z = [], Y = 0;
    return;
  }
  Y >= bo * 8 && (Z = Z.slice(Y), Y = 0), Gi();
}
function wn() {
  cr(!1);
}
function Gi() {
  if (!We) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          de = null, cr(!0, t);
        },
        { timeout: Ou }
      );
      de = () => cancelIdleCallback(e);
    }
    We = setTimeout(() => {
      We = null, de && (de(), de = null), cr(!0);
    }, Ru);
  }
}
function qt(e = !1) {
  if (nt = !0, Ye) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - Ie, r = Math.max(
      0,
      Yi - n
    ), o = Date.now() - Ji, i = Math.max(
      0,
      Lu - o
    );
    t = Math.max(
      r,
      i
    );
  }
  Ye = setTimeout(() => {
    Ye = null, qu();
  }, t);
}
function qu() {
  if (!nt || !Ae || !ie || _e) return;
  Ft++;
  const e = en > Ao ? 1 : Cu;
  if (Ft > e) {
    zu();
    return;
  }
  Ji = Date.now(), te = 0, Ie = Date.now();
  try {
    const t = rt();
    Ae.takeFullSnapshot(!0), en = rt() - t, P("replay_rebases"), en > Ao && P(
      "replay_expensive_snapshots"
    );
  } catch {
    jt(), $t();
  }
}
function Io() {
  P("replay_events_dropped");
}
function Qi() {
  if (Se) return !1;
  Se = ae(), Ki = sa(), Wi = oa() ? "" : Zo();
  const e = Bn !== "" && Bn !== Se;
  return Bn = Se, e;
}
function Xt() {
  if (ju(), et.length === 0) return;
  if (An(Eo)) {
    $u(), Zi();
    return;
  }
  Qi();
  const e = Se, t = Ki, n = Wi, r = et.splice(0), o = tt;
  tt = 0, Se = "", Dr = !0, Ir(
    Eo,
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
function $u() {
  tt <= bu || (P(
    "replay_events_dropped",
    et.length
  ), et.length = 0, tt = 0, qt());
}
let Ge = null;
function ju() {
  Ge && (clearTimeout(Ge), Ge = null);
}
function Zi() {
  if (Ge) return;
  const e = x().replayFlushIntervalMs ?? Tu;
  Ge = setTimeout(() => {
    Ge = null, Xt();
  }, e);
}
function ur(e) {
  !Se && !ae() || (Qi() && e.type !== Xi && qt(!0), et.push(e), tt += rn(e), et.length >= Su || tt >= Eu ? Xt() : Zi());
}
function zu() {
  _e = !0, P("replay_overload_pauses"), jt(), Ee && clearTimeout(Ee), Ee = setTimeout(() => {
    Ee = null, _e = !1, Ft = 0, te = 0, Ie = Date.now(), !Je && !Bt && ne && $t();
  }, Mu);
}
function Vu(e) {
  if (_e) return;
  if (e.type === Xi) {
    wn(), nt = !1, te = 0, Ie = Date.now(), ur(e);
    return;
  }
  if (e.type === Iu) {
    const o = e.data;
    typeof o.href == "string" && (o.href = Ms(o.href));
  }
  if (e.type !== Au) {
    wn(), ur(e);
    return;
  }
  if (nt) {
    Io(), qt();
    return;
  }
  const t = e.data;
  t && t.source === ku && Array.isArray(t.adds) && t.adds.length > 1 && (t.adds = wu(t.adds));
  const n = Date.now();
  n - Ie > Yi && (te <= To && (Ft = 0), te = 0, Ie = n);
  const r = Nr.throttle(e);
  if (r.dropped > 0 && P(
    "replay_attributes_throttled",
    r.dropped
  ), !!r.event) {
    if (te++, te > To) {
      Io(), qt();
      return;
    }
    Z.push(r.event), Gi();
  }
}
async function $t() {
  if (ne && !_e && !ie)
    return ft || (ft = Xu().finally(
      () => {
        ft = null;
      }
    ), ft);
}
async function Xu() {
  if (!ne) return;
  const { record: e } = await import("./rrweb-SbAupvcM.js");
  !ne || _e || ie || (Ae = e, nt = !1, te = 0, Ie = Date.now(), Nr.reset(), ie = e({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: Nu() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: Du,
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
        Vu(t);
      } catch {
        P("replay_emit_errors");
      }
    },
    /**
     * Applies the same containment to rrweb's own
     * observers, which are otherwise wrapped only when
     * a handler is supplied.
     */
    errorHandler: () => !0,
    maskAllInputs: ne.maskAllInputs,
    maskInputOptions: ne.maskInputOptions,
    maskTextFn: ne.maskTextContent ? () => "•••" : void 0,
    blockSelector: zo,
    maskTextSelector: Vo,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => Xt(), 200));
}
function jt() {
  ie && (ie(), ie = null), Ye && (clearTimeout(Ye), Ye = null), nt = !1, wn(), Xt();
}
function Yu() {
  const e = x(), t = e.replayIdlePauseMs ?? Uu, n = e.replayIdleExpireMs ?? Hu;
  Ke && clearTimeout(Ke), Te && (clearTimeout(Te), Te = null), Ke = setTimeout(() => {
    Je = !0, jt();
  }, t), Te = setTimeout(() => {
    Bt = !0, jt();
  }, n);
}
function nn() {
  Ur = rt(), Yu();
}
function Wu() {
  if (Bt) {
    if (!ti()) return;
    Bt = !1, Je = !1, $t(), nn();
    return;
  }
  if (Je) {
    Je = !1, $t(), nn();
    return;
  }
  rt() - Ur >= Fu && nn();
}
function Ku() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => Wu(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  tn = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function Ju() {
  tn && (tn(), tn = null), Ke && (clearTimeout(Ke), Ke = null), Te && (clearTimeout(Te), Te = null);
}
function Gu() {
  wn(), Xt();
}
async function Qu() {
  const t = x().privacyLevel ?? "mask-user-input";
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
  } : o = !1, ne = {
    privacyLevel: t,
    maskAllInputs: o,
    maskInputOptions: n,
    maskTextContent: r
  }, Ja(() => {
    ie && qt();
  }), Si(Gu), await $t(), Ku(), nn();
}
function Zu() {
  return ie !== null && !_e;
}
function el() {
  return Dr;
}
function tl() {
  jt(), Ju(), Si(null), Ee && (clearTimeout(Ee), Ee = null), Je = !1, Bt = !1, Ur = 0, _e = !1, Dr = !1, Ft = 0, te = 0, en = 0, Z = [], Y = 0, Nr.reset(), ne = null, Ae = null;
}
let H = [], ee = null;
const nl = [
  "error",
  "action",
  "console",
  "resource"
];
function rl(e) {
  return nl.includes(e) && (An(e) || !mu(e)) ? (P("events_rate_limited"), !0) : !1;
}
function es(e, t) {
  const n = e.origin + pe(e.pathname);
  if (!Array.isArray(t) || t.length === 0 || !e.search)
    return n;
  const r = new URLSearchParams(e.search), o = new URLSearchParams();
  r.forEach((s, a) => {
    t.includes(a) && o.append(a, s);
  });
  const i = o.toString();
  return i ? n + "?" + i : n;
}
function ol() {
  if (!ee) {
    const e = navigator.userAgent;
    ee = {
      device_type: Pl(e),
      browser_name: Dl(e),
      browser_version: Nl(e),
      os_name: Ul(e),
      os_version: Hl(e),
      user_agent: e,
      language: navigator.language
    };
  }
}
function il() {
  const e = navigator.connection;
  return typeof (e == null ? void 0 : e.effectiveType) == "string" ? e.effectiveType : "";
}
function ts(e) {
  ol();
  const t = ua(), n = sc(), r = x(), o = e ?? ae(), i = {
    event_id: Le(),
    session_id: o,
    tab_id: Zo(),
    view_id: Hi(),
    action_id: Hc(),
    ...xs(
      ii(),
      fa(),
      da()
    ),
    user_status: pa(),
    service: r.service,
    env: r.env ?? "",
    version: r.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: es(
      window.location,
      r.viewUrlQueryParams
    ),
    view_url_host: window.location.hostname,
    view_url_path: pe(window.location.pathname),
    referrer_url: Ls(document.referrer),
    device_type: ee.device_type,
    browser_name: ee.browser_name,
    browser_version: ee.browser_version,
    os_name: ee.os_name,
    os_version: ee.os_version,
    user_agent: Os() ? ee.user_agent : "",
    language: ee.language,
    session_view_count: t.viewCount,
    session_error_count: t.errorCount,
    session_action_count: t.actionCount,
    replay_id: Zu() && el() ? o : ""
  };
  return Object.keys(n).length > 0 && (i.feature_flags = n), i;
}
function sl(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const ns = "events", al = ["session_id", "event_type", "timestamp"];
let ko = !1;
function rs(e) {
  const t = x().beforeSend;
  if (typeof t != "function") return e;
  const n = {};
  for (const r of al) n[r] = e[r];
  try {
    const r = t(e);
    if (r === null || r === !1) return null;
    if (ds(r))
      throw new Error("it returned a promise; it must be synchronous");
    return { ...r && typeof r == "object" ? r : e, ...n };
  } catch (r) {
    return ko || (ko = !0, dr(
      `beforeSend failed. Events are dropped until it is fixed: ${String(r)}`
    )), null;
  }
}
function os(e) {
  ia() && (e.session_is_new = 1);
}
function N(e) {
  if (!ae() || !ei() || An("events")) return;
  Dc();
  const t = e(), n = t.event_type;
  if (rl(n)) return;
  n === "resource" && El(t), oi(n), Mc(t), Fc(t);
  const r = { ...ts(), ...t };
  os(r);
  const o = rs(r);
  o && Ir(ns, o);
}
function Hr(e) {
  sl(
    () => N(e)
  );
}
function cl(e, t) {
  if (!ei() || An("events")) return;
  e.view_update_seq === 1 && oi("view");
  const n = {
    ...ts(t),
    ...e,
    action_id: "",
    connection_type: il(),
    screen_width: typeof screen < "u" ? screen.width : 0,
    screen_height: typeof screen < "u" ? screen.height : 0
  };
  e.view_update_seq === 1 && (n.view_is_new = 1), t === ae() && os(n);
  const r = rs(n);
  r && tc(
    ns,
    "view:" + String(e.view_id),
    r,
    (o, i) => {
      const s = { ...i }, a = o;
      return a.view_is_new === 1 && (s.view_is_new = 1), a.session_is_new === 1 && (s.session_is_new = 1), s;
    }
  );
}
function ul(e) {
  N(() => e);
}
function ll() {
  Pc(
    cl,
    (e) => es(e, x().viewUrlQueryParams)
  ), Gc(ul), fl(), hl(), _l(), Cl(), Ml(), Ll(), Rl();
}
function fl() {
  const e = (n) => {
    N(() => {
      var i, s, a;
      const r = n.message ?? "", o = typeof ((i = n.error) == null ? void 0 : i.message) == "string" ? n.error.message : r;
      return {
        event_type: "error",
        error_message: Pt(r),
        error_type: ((s = n.error) == null ? void 0 : s.name) ?? "Error",
        error_stack: hr(
          ((a = n.error) == null ? void 0 : a.stack) ?? "",
          o
        ),
        error_source: "source",
        error_handling: "unhandled"
      };
    });
  }, t = (n) => ss(n.reason);
  window.addEventListener("error", e), window.addEventListener(
    "unhandledrejection",
    t
  ), lr = !0, H.push(() => {
    window.removeEventListener("error", e), window.removeEventListener(
      "unhandledrejection",
      t
    ), lr = !1;
  });
}
let lr = !1;
const Co = /* @__PURE__ */ new WeakSet(), is = /* @__PURE__ */ new WeakSet();
function ss(e) {
  e !== null && typeof e == "object" && (Co.has(e) || (Co.add(e), is.has(e))) || N(() => {
    const t = (e == null ? void 0 : e.message) ?? String(e);
    return {
      event_type: "error",
      error_message: Pt(t),
      error_type: (e == null ? void 0 : e.name) ?? "UnhandledRejection",
      error_stack: hr((e == null ? void 0 : e.stack) ?? "", t),
      error_source: "promise",
      error_handling: "unhandled"
    };
  });
}
let Mo = !1;
function jl() {
  const e = globalThis.Zone;
  if (Mo || !e || typeof e.__symbol__ != "function")
    return;
  Mo = !0;
  const t = e.__symbol__("unhandledPromiseRejectionHandler"), n = e[t];
  e[t] = function(r) {
    if (lr)
      try {
        ss(
          r && typeof r == "object" && "rejection" in r && "promise" in r ? r.rejection : r
        );
      } catch {
      }
    if (typeof n == "function")
      return n.call(this, r);
  };
}
function as(e) {
  return e instanceof Error || typeof e == "object" && e !== null && typeof e.message == "string" && typeof e.name == "string" && "stack" in e;
}
const Qe = 8192;
function dl(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${Qe} bytes omitted]`;
}
function pl(e) {
  if (typeof e == "string") return e;
  if (as(e))
    return e.message ? `${e.name}: ${e.message}` : e.name;
  if (rn(
    e,
    Qe + 1
  ) > Qe)
    return dl(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function ml(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= Qe) break;
    t && (t += " "), t += pl(n);
  }
  return t.length > Qe ? t.slice(0, Qe) + "… [truncated]" : t;
}
function hl() {
  for (const e of Rs()) {
    const t = console[e], n = (...r) => {
      try {
        const o = Pt(ml(r)), i = e === "error" ? r.find(as) : void 0;
        i && typeof i == "object" && is.add(i), N(() => {
          const s = {
            event_type: "console",
            console_level: e,
            console_message: o
          };
          return i && (s.error_type = i.name, s.error_message = Pt(i.message), s.error_stack = hr(
            i.stack ?? "",
            i.message
          ), s.error_source = "console", s.error_handling = "handled"), s;
        });
      } catch {
      }
      t.apply(console, r);
    };
    n[$o] = t, console[e] = n, H.push(() => {
      console[e] = t;
    });
  }
}
const fr = "oodle_rum_tab_hidden";
function Lo(e) {
  try {
    e ? sessionStorage.setItem(fr, "1") : sessionStorage.removeItem(fr);
  } catch {
  }
}
function yl() {
  try {
    return sessionStorage.getItem(fr) === "1";
  } catch {
    return !1;
  }
}
function gl() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && yl() && (Lo(!1), N(() => ({
    event_type: "visibility",
    action_type: "tab_visible"
  })));
  let e = document.visibilityState === "hidden";
  const t = () => {
    const n = document.visibilityState === "hidden";
    n !== e && (e = n, Lo(n), N(() => ({
      event_type: "visibility",
      action_type: n ? "tab_hidden" : "tab_visible"
    })), n || se());
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
function Fr(e) {
  const t = x().endpoint;
  return e.startsWith(t);
}
function _l() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || Fr(r.name))
          continue;
        const i = xt(r.name), s = cs(r), a = vl(o, r.name);
        Hr(
          () => ({
            event_type: "resource",
            resource_url: i,
            resource_method: "",
            resource_duration_ms: Math.round(r.duration),
            resource_size: r.transferSize ?? 0,
            resource_type: a,
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
function vl(e, t) {
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
function cs(e) {
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
function us(e, t) {
  try {
    const n = performance.getEntriesByName(
      ls(e),
      "resource"
    );
    for (let r = n.length - 1; r >= 0; r--) {
      const o = n[r];
      if (o.startTime >= t - 2)
        return {
          ...cs(o),
          resource_size: o.transferSize ?? 0
        };
    }
  } catch {
  }
  return {};
}
function Sn(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function ls(e) {
  try {
    return new URL(e, location.href).href;
  } catch {
    return e;
  }
}
function qn(e, t, n) {
  return n.some(
    (r) => typeof r == "string" ? e.startsWith(r) || t.startsWith(r) : r.test(e) || r.test(t)
  );
}
function fs(e) {
  const t = ls(e), n = x();
  let r = !1;
  const o = n.allowedTracingUrls;
  o && o.length > 0 && (r = qn(
    t,
    e,
    o
  ));
  let i = null;
  const s = n.forwardNetworkBodies;
  s && qn(
    t,
    e,
    s.urls
  ) && (i = s);
  let a = !1;
  const c = n.forwardNetworkHeaders;
  return c && (a = qn(
    t,
    e,
    c.urls
  )), {
    resolved: t,
    trace: r,
    bodyCfg: i,
    captureHeaders: a
  };
}
let Ro = null, Oo = ji(void 0);
function Ot(e) {
  const t = x().redactHeaders;
  return t !== Ro && (Ro = t, Oo = ji(t)), Oo(e);
}
function wl(e) {
  const t = {};
  for (const n of Object.keys(e)) {
    const r = n.toLowerCase();
    Ot(r) || (t[r] = e[n]);
  }
  return t;
}
const xo = [
  "request_headers",
  "response_headers",
  "request_body",
  "response_body"
];
let Po = !1;
function ds(e) {
  return !!e && (typeof e == "object" || typeof e == "function") && typeof e.then == "function";
}
function Do(e) {
  if (!(typeof e != "string" || !e))
    try {
      const t = JSON.parse(e);
      return t && typeof t == "object" ? t : void 0;
    } catch {
      return;
    }
}
function No(e) {
  if (!e || typeof e != "object") return "";
  const t = {};
  for (const [n, r] of Object.entries(e))
    r != null && (t[n.toLowerCase()] = String(r));
  return Object.keys(t).length > 0 ? JSON.stringify(t) : "";
}
let Uo = null, Ho = zi(void 0);
function Sl() {
  const e = x().redactBodyKeys;
  return e !== Uo && (Uo = e, Ho = zi(e)), Ho;
}
function El(e) {
  var a;
  if (!xo.some((c) => e[c])) return;
  for (const c of ["request_body", "response_body"])
    typeof e[c] == "string" && e[c] && (e[c] = lu(e[c], Sl()));
  const t = x().beforeSendNetwork;
  if (typeof t != "function") return;
  const n = {
    url: String(e.resource_url ?? ""),
    method: String(e.resource_method ?? ""),
    status: Number(e.resource_status ?? 0),
    requestHeaders: Do(e.request_headers),
    responseHeaders: Do(e.response_headers),
    requestBody: typeof e.request_body == "string" ? e.request_body : void 0,
    responseBody: typeof e.response_body == "string" ? e.response_body : void 0
  };
  let r;
  try {
    const c = t(n);
    if (ds(c))
      throw new Error("it returned a promise; it must be synchronous");
    r = c === void 0 ? n : c;
  } catch (c) {
    Po || (Po = !0, dr(
      `beforeSendNetwork failed. Captured headers and bodies are dropped until it is fixed: ${String(c)}`
    )), r = null;
  }
  for (const c of xo) delete e[c];
  if (!r || typeof r != "object") return;
  const o = ((a = x().forwardNetworkBodies) == null ? void 0 : a.maxBodySize) ?? 65536, i = No(r.requestHeaders), s = No(r.responseHeaders);
  i && (e.request_headers = i), s && (e.response_headers = s), typeof r.requestBody == "string" && r.requestBody && (e.request_body = me(r.requestBody, o)), typeof r.responseBody == "string" && r.responseBody && (e.response_body = me(r.responseBody, o));
}
function ps(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      Ot(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      Ot(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      Ot(r) || (t[r] = e[n]);
    }
  return t;
}
function Tl(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    Ot(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function me(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function bl(e, t) {
  var i;
  const n = (i = e.body) == null ? void 0 : i.getReader();
  if (!n)
    return (await e.text()).slice(0, t);
  const r = new TextDecoder();
  let o = "";
  for (; o.length < t; ) {
    const { done: s, value: a } = await n.read();
    if (s) break;
    o += r.decode(a, {
      stream: !0
    });
  }
  return n.cancel(), o.slice(0, t);
}
function Al(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function Il(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      ps(
        e
      )
    );
  } catch {
    return "";
  }
}
function Fo(e) {
  try {
    return JSON.stringify(
      ps(e)
    );
  } catch {
    return "";
  }
}
function ms(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function kl(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: me(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: me(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : ms(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => me(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function hs(e, t, n) {
  const r = function(o, i) {
    const s = Al(o);
    if (Fr(s))
      return t.apply(e, [
        o,
        i
      ]);
    const a = ms(o), c = ((i == null ? void 0 : i.method) ?? (a ? o.method : "GET")).toUpperCase(), l = performance.now(), u = fs(s), f = Ii();
    let d = !1;
    const y = () => {
      d || (d = !0, ki(f));
    };
    let m = "", w = "";
    if (n.injectTracing) {
      const b = Vi();
      if (b)
        m = b.traceId, w = b.spanId;
      else if (u.trace) {
        m = Sn(16), w = Sn(8);
        const E = new Headers(
          (i == null ? void 0 : i.headers) ?? {}
        );
        E.set(
          "traceparent",
          `00-${m}-${w}-01`
        ), i = { ...i, headers: E };
      }
    }
    let k = "", C = null;
    if (u.bodyCfg) {
      const b = u.bodyCfg.maxBodySize ?? 65536, E = kl(
        i,
        o,
        b
      );
      k = E.sync, C = E.asyncP;
    }
    let I = "";
    return u.captureHeaders && (i != null && i.headers ? I = Il(
      i.headers
    ) : a && (I = Fo(
      o.headers
    ))), t.apply(e, [o, i]).then((b) => {
      y();
      const E = b.status, M = Math.round(
        performance.now() - l
      );
      let _ = "";
      u.captureHeaders && (_ = Fo(
        b.headers
      ));
      const v = (p) => {
        const T = {
          event_type: "resource",
          resource_url: xt(s),
          resource_method: c,
          resource_status: E,
          resource_duration_ms: M,
          resource_size: 0,
          resource_type: "fetch",
          ...us(s, l)
        };
        return m && (T.trace_id = m, T.span_id = w), p && (T.request_body = p), I && (T.request_headers = I), _ && (T.response_headers = _), T;
      }, h = C || Promise.resolve(k);
      if (u.bodyCfg) {
        const p = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          h,
          bl(
            b.clone(),
            p
          ).catch(() => "")
        ]).then(([T, G]) => {
          N(() => {
            const R = v(T);
            return G && (R.response_body = G), R;
          });
        }).catch(() => {
          h.then((T) => {
            N(
              () => v(T)
            );
          });
        });
      } else
        h.then((p) => {
          N(() => v(p));
        });
      return b;
    }).catch((b) => {
      y();
      const E = Math.round(
        performance.now() - l
      );
      throw (C || Promise.resolve(k)).then((_) => {
        N(() => {
          const v = {
            event_type: "resource",
            resource_url: xt(s),
            resource_method: c,
            resource_status: 0,
            resource_duration_ms: E,
            resource_size: 0,
            resource_type: "fetch"
          };
          return m && (v.trace_id = m, v.span_id = w), _ && (v.request_body = _), I && (v.request_headers = I), v;
        });
      }), b;
    });
  };
  return e.fetch = r, () => {
    e.fetch = t;
  };
}
function ys(e, t, n) {
  const r = e.open, o = e.send, i = t;
  return e.open = function(s, a, c, l, u) {
    return this.__oodleMethod = s.toUpperCase(), this.__oodleUrl = typeof a == "string" ? a : a.href, this.__oodleReqHeaders = {}, r.call(
      this,
      s,
      a,
      c ?? !0,
      l,
      u
    );
  }, e.setRequestHeader = function(s, a) {
    const c = this.__oodleReqHeaders;
    return c && (c[s.toLowerCase()] = a), i.call(this, s, a);
  }, e.send = function(s) {
    const a = this.__oodleUrl ?? "";
    if (Fr(a))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const c = fs(a);
    let l = "", u = "";
    if (n.injectTracing) {
      const _ = Vi();
      _ ? (l = _.traceId, u = _.spanId) : c.trace && (l = Sn(16), u = Sn(8), i.call(
        this,
        "traceparent",
        `00-${l}-${u}-01`
      ));
    }
    let f = "";
    if (c.bodyCfg && s) {
      const _ = c.bodyCfg.maxBodySize ?? 65536;
      typeof s == "string" ? f = me(
        s,
        _
      ) : typeof URLSearchParams < "u" && s instanceof URLSearchParams && (f = me(
        s.toString(),
        _
      ));
    }
    let d = "";
    if (c.captureHeaders)
      try {
        const _ = this.__oodleReqHeaders, v = _ ? wl(_) : {};
        Object.keys(v).length > 0 && (d = JSON.stringify(v));
      } catch {
      }
    const y = performance.now(), m = this, w = Ii(), k = l, C = u, I = f, b = c.bodyCfg, E = d, M = c.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        ki(w);
        const _ = Math.round(
          performance.now() - y
        ), v = m.__oodleMethod ?? "GET";
        N(() => {
          const h = {
            event_type: "resource",
            resource_url: xt(a),
            resource_method: v,
            resource_status: m.status,
            resource_duration_ms: _,
            resource_size: 0,
            resource_type: "xhr",
            ...us(a, y)
          };
          if (k && (h.trace_id = k, h.span_id = C), I && (h.request_body = I), b)
            try {
              const p = m.responseText ?? "";
              h.response_body = me(
                p,
                b.maxBodySize ?? 65536
              );
            } catch {
            }
          if (E && (h.request_headers = E), M)
            try {
              const p = m.getAllResponseHeaders();
              p && (h.response_headers = JSON.stringify(
                Tl(p)
              ));
            } catch {
            }
          return h;
        });
      }
    ), o.apply(this, [s]);
  }, () => {
    e.open = r, e.send = o, e.setRequestHeader = i;
  };
}
const gs = {
  injectTracing: !0
}, Bo = {
  injectTracing: !1
};
function Cl() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = hs(
    window,
    window.fetch,
    gs
  );
  H.push(e);
}
function Ml() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = ys(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    gs
  );
  H.push(e);
}
const qo = /* @__PURE__ */ new WeakSet();
function $n(e) {
  if (qo.has(e)) return;
  qo.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (hs(
        n,
        n.fetch,
        Bo
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (ys(
        r.prototype,
        r.prototype.setRequestHeader,
        Bo
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), H.push(() => {
    e.removeEventListener("load", t);
  });
}
function Ll() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach($n);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          r instanceof HTMLIFrameElement && $n(r), r instanceof HTMLElement && r.childElementCount > 0 && r.querySelectorAll("iframe").forEach($n);
    }
  );
  e.observe(document, {
    childList: !0,
    subtree: !0
  }), H.push(() => {
    e.disconnect();
  });
}
function Rl() {
  if (!(typeof PerformanceObserver > "u") && !Ol())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            Hr(() => ({
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
function Ol() {
  try {
    const e = new PerformanceObserver(
      (t) => {
        for (const n of t.getEntries()) {
          if (n.duration < 50) continue;
          const r = n, o = r.scripts ?? [], i = o.length > 0 ? o[0] : null, s = Math.round(
            n.duration
          ), a = Math.round(
            r.blockingDuration ?? 0
          ), c = (i == null ? void 0 : i.sourceURL) ?? "", l = (i == null ? void 0 : i.sourceFunctionName) ?? "", u = (i == null ? void 0 : i.invokerType) ?? "";
          Hr(() => ({
            event_type: "long_task",
            long_task_duration_ms: s,
            long_task_blocking_ms: a,
            long_task_script_url: c,
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
function xl(e, t) {
  N(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function Pl(e) {
  return /iPad|Tablet/i.test(e) || /Android/i.test(e) && !/Mobi/i.test(e) ? "tablet" : /Mobi|iPhone|iPod|Android/i.test(e) ? "mobile" : "desktop";
}
const _s = [
  ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
  ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
  ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
  ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
  ["Safari", /Version\/([\d.]+).*Safari/]
];
function Dl(e) {
  for (const [t, n] of _s) if (n.test(e)) return t;
  return e.includes("Safari") ? "Safari" : "Other";
}
function Nl(e) {
  for (const [, t] of _s) {
    const n = e.match(t);
    if (n) return n[1];
  }
  return "";
}
function Ul(e) {
  return /iPhone|iPad|iPod/.test(e) ? "iOS" : e.includes("Android") ? "Android" : e.includes("CrOS") ? "Chrome OS" : e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : "Other";
}
function Hl(e) {
  let t = e.match(/OS (\d+[_.]\d+(?:[_.]\d+)?) like Mac OS X/);
  return t ? t[1].replace(/_/g, ".") : (t = e.match(/Android ([\d.]+)/), t || (t = e.match(/Windows NT ([\d.]+)/), t) ? t[1] : (t = e.match(/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/), t ? t[1].replace(/_/g, ".") : ""));
}
function Fl() {
  qi(), Fi();
  for (const e of H)
    e();
  H = [];
}
let ve = !1;
const zl = {
  init(e) {
    ve || js(e) && (ha(e.tags), Ks(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), ve = !0, Qo(), gl(), io(), ca(), Sa(), rc(() => {
      io();
    }), e.sessionReplay !== !1 && ti() && Qu(), ll(), e.openTelemetry && import("./tracing-54HXx7Md.js").then(
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
    ya(e);
  },
  identify(e) {
    la(e);
  },
  trackEvent(e, t) {
    ve && xl(e, t);
  },
  addFeatureFlag(e, t) {
    ic(e, t);
  },
  getSessionId() {
    return ve ? ae() : "";
  },
  getUserId() {
    return ii();
  },
  flush() {
    ve && se();
  },
  stop() {
    ve && (tl(), Fl(), Ea(), ri(), se(!0), ac(), oc(), ve = !1);
  }
};
export {
  zl as O,
  ql as a,
  jl as c,
  Bl as r,
  $l as s
};
