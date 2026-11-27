const Qo = "__oodleOriginal";
function Er(e) {
  try {
    const t = console.warn;
    (t[Qo] ?? t).call(
      console,
      "[@oodle-ai/rum] " + e
    );
  } catch {
  }
}
const en = [
  "error",
  "warn"
];
function Us() {
  return {
    patterns: [],
    maskFn: null,
    referrer: "path",
    consoleLevels: en,
    messages: "full",
    actionText: "full",
    userAgent: "full",
    queryStrings: "events",
    userInfo: "full",
    keepParams: []
  };
}
let A = Us();
const Bn = "/:redacted", Hs = 256, wt = /* @__PURE__ */ new Map();
let Qn = !1;
const Me = Er;
function Fe(e, t, n, r, o) {
  return t === void 0 ? r : typeof t == "string" && n.includes(t) ? t : (Me(
    `${e} must be one of ${n.map((i) => `'${i}'`).join(", ")}. Using '${o}'.`
  ), o);
}
function Fs(e) {
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
function Bs(e) {
  if (e === void 0) return [];
  if (!Array.isArray(e))
    return Me(
      "urlPathPatterns must be an array of path patterns such as '/projects/:id'. It is ignored."
    ), [];
  const t = [];
  for (const n of e) {
    const r = Fs(n);
    r ? t.push(r) : Me(
      `urlPathPatterns: ${JSON.stringify(n)} is not a valid pattern. Patterns start with '/', use ':name' for one segment and may end in '/*'. It is ignored.`
    );
  }
  return t;
}
function qs(e) {
  if (e === void 0) return en;
  if (!Array.isArray(e))
    return Me(
      "consoleLevels must be an array such as ['error']. Console capture is off."
    ), [];
  const t = en.filter(
    (n) => e.includes(n)
  );
  return e.some(
    (n) => !en.includes(n)
  ) && Me(
    "consoleLevels accepts only 'error' and 'warn'. Other values are ignored."
  ), t;
}
function Vs(e) {
  wt.clear(), Qn = !1;
  const t = e.maskUrlPath;
  t !== void 0 && typeof t != "function" && Me("maskUrlPath must be a function. It is ignored."), A = {
    patterns: Bs(e.urlPathPatterns),
    maskFn: typeof t == "function" ? t : null,
    referrer: Fe(
      "referrerUrl",
      e.referrerUrl,
      ["path", "origin", "none"],
      "path",
      "none"
    ),
    consoleLevels: qs(
      e.consoleLevels
    ),
    messages: Fe(
      "errorMessages",
      e.errorMessages,
      ["full", "scrub", "none"],
      "full",
      "none"
    ),
    // Text the replay masks must not reappear in click events.
    actionText: Fe(
      "actionText",
      e.actionText,
      ["full", "mask"],
      e.privacyLevel === "mask" ? "mask" : "full",
      "mask"
    ),
    userAgent: Fe(
      "userAgent",
      e.userAgent,
      ["full", "none"],
      "full",
      "none"
    ),
    queryStrings: Fe(
      "stripQueryStrings",
      e.stripQueryStrings,
      ["events", "all"],
      "events",
      "all"
    ),
    userInfo: Fe(
      "userInfo",
      e.userInfo,
      ["full", "id", "none"],
      "full",
      "none"
    ),
    keepParams: Array.isArray(e.viewUrlQueryParams) ? e.viewUrlQueryParams : []
  };
}
function Tr() {
  return A.patterns.length > 0 || A.maskFn !== null;
}
function $s(e) {
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
function js(e) {
  let t = A.patterns.length > 0 ? $s(e) : e;
  if (A.maskFn)
    try {
      const n = A.maskFn(t);
      t = typeof n == "string" ? n : Bn;
    } catch (n) {
      Qn || (Qn = !0, Me(
        `maskUrlPath threw. Paths are sent as '${Bn}' until it is fixed: ${String(n)}`
      )), t = Bn;
    }
  return t;
}
function ye(e) {
  if (!Tr()) return e;
  const t = wt.get(e);
  if (t !== void 0) return t;
  const n = js(e);
  return wt.size >= Hs && wt.clear(), wt.set(e, n), n;
}
function zs(e) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(e);
}
function qt(e, t) {
  if (zs(e)) {
    let n;
    try {
      n = new URL(e);
    } catch {
      return e;
    }
    return n.protocol !== "http:" && n.protocol !== "https:" ? n.protocol === "data:" ? "data:" : n.origin + n.pathname : n.origin + ye(n.pathname);
  }
  try {
    const n = t ?? (typeof location < "u" ? location.href : "http://localhost/"), r = new URL(e, n);
    return r.origin === new URL(n).origin ? ye(r.pathname) : r.origin + ye(r.pathname);
  } catch {
    const n = e.search(/[?#]/);
    return n >= 0 ? e.slice(0, n) : e;
  }
}
function Zo(e) {
  return !Tr() || typeof e != "string" ? e : br(e, (t) => t.search + t.hash);
}
function df() {
  return Tr() || A.queryStrings === "all";
}
function Xs(e) {
  return A.queryStrings !== "all" ? Zo(e) : typeof e != "string" ? e : br(e, (t) => {
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
function pf(e) {
  return A.queryStrings !== "all" ? Zo(e) : typeof e != "string" ? e : br(e, () => "");
}
function br(e, t) {
  let n;
  try {
    n = new URL(e);
  } catch {
    return e;
  }
  return n.protocol !== "http:" && n.protocol !== "https:" ? e : n.origin + ye(n.pathname) + t(n);
}
let eo = null, to = "", no = null;
function Ys(e) {
  if (e === eo && no === A)
    return to;
  let t = "";
  if (e && A.referrer !== "none")
    try {
      const n = new URL(e);
      t = A.referrer === "origin" ? n.origin : n.origin + ye(n.pathname);
    } catch {
      t = A.referrer === "origin" ? "" : e;
    }
  return eo = e, to = t, no = A, t;
}
function Ws() {
  return A.consoleLevels;
}
function Ks() {
  return A.userAgent === "full";
}
function Js(e, t, n) {
  switch (A.userInfo) {
    case "full":
      return { user_id: e, user_name: t, user_email: n };
    case "id":
      return { user_id: e, user_name: "", user_email: "" };
    default:
      return { user_id: "", user_name: "", user_email: "" };
  }
}
const Gs = [
  [/(^|[^\w])'(?:[^'\\\n]|\\.){0,500}'/g, "$1'?'"],
  [/(^|[^\w])"(?:[^"\\\n]|\\.){0,500}"/g, '$1"?"'],
  [/(^|[^\w])`(?:[^`\\\n]|\\.){0,500}`/g, "$1`?`"]
], Qs = /\bhttps?:\/\/[^\s'"`<>()\]]+/g, Zs = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, ea = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, ta = /\b(?=[0-9a-fA-F]*\d)(?=[0-9a-fA-F]*[a-fA-F])[0-9a-fA-F]{16,}\b/g, na = /\d{4,}/g, ro = 8192;
function ra(e) {
  if (!e) return e;
  let t = e.length > ro ? e.slice(0, ro) + "… [truncated]" : e;
  t = t.replace(Qs, (n) => qt(n)), t.includes("@") && (t = t.replace(Zs, "<email>"));
  for (const [n, r] of Gs)
    t = t.replace(n, r);
  return t = t.replace(ea, "<id>"), t = t.replace(ta, "<id>"), t = t.replace(na, "<n>"), t;
}
const oa = /^\s+at |^[^\s@]*@\S+:\d+(?::\d+)?$/m;
function Vt(e) {
  switch (A.messages) {
    case "full":
      return e;
    case "scrub":
      return ra(e);
    default:
      return "";
  }
}
function Ar(e, t) {
  if (A.messages === "full" || !e || !t) return e;
  const n = oa.exec(e), r = n ? n.index : e.length, o = e.indexOf(t);
  if (o < 0 || o + t.length > r)
    return e;
  const i = Vt(t);
  let s = e.slice(0, o) + i;
  return i || (s = s.replace(/:\s*$/, "")), s + e.slice(o + t.length);
}
const ei = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', ti = '[data-oodle-privacy="mask"],.oodle-privacy-mask', ni = ei + "," + ti + ",.rr-block,.rr-mask";
function Zn(e) {
  if (A.actionText === "mask") return !0;
  try {
    return typeof e.closest == "function" && e.closest(ni) !== null;
  } catch {
    return !0;
  }
}
let er = null;
function ia(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function sa(e) {
  if (!ia(e.endpoint))
    return console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    ), !1;
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  );
  const t = aa(
    e.viewUrlQueryParams
  );
  return Vs({ ...e, viewUrlQueryParams: t }), er = { ...e, viewUrlQueryParams: t }, !0;
}
function aa(e) {
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
  if (!er)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return er;
}
const Ir = "__oodle_session_v2", kr = "__oodle_tab", oo = "__oodle_session", ri = 900 * 1e3, Cr = 14400 * 1e3, Lr = 1e3;
function Pe() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
let Et = null, V = null;
function Mr(e, t) {
  try {
    const n = e == null ? void 0 : e.getItem(t);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function Rr(e, t, n) {
  try {
    e == null || e.setItem(t, JSON.stringify(n));
  } catch {
  }
}
function oi() {
  try {
    return typeof localStorage < "u" ? localStorage : void 0;
  } catch {
    return;
  }
}
function $t() {
  try {
    return typeof sessionStorage < "u" ? sessionStorage : void 0;
  } catch {
    return;
  }
}
const ca = 1e3;
let ve = 0;
function Q() {
  const e = Date.now();
  if (Et && e - ve < ca) return Et;
  ve = e;
  const t = Mr(oi(), Ir);
  return t && typeof t.id == "string" && t.id ? ua({
    id: t.id,
    createdAt: t.createdAt ?? Date.now(),
    lastActivity: t.lastActivity ?? Date.now(),
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: t.started ?? !0
  }) : Et;
}
const qe = /* @__PURE__ */ new Map();
function ii(e) {
  const t = qe.get(e.id);
  if (qe.set(e.id, {
    lastActivity: Math.max((t == null ? void 0 : t.lastActivity) ?? 0, e.lastActivity),
    createdAt: e.createdAt
  }), qe.size > 20) {
    const n = qe.keys().next().value;
    n !== void 0 && qe.delete(n);
  }
}
function ua(e) {
  return e && (Et = e, ii(e)), e;
}
function Gt(e) {
  Et = e, ii(e), ve = Date.now(), Rr(oi(), Ir, e);
}
function Mn() {
  if (V) return V;
  const e = Mr($t(), kr);
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
    return V = t, t;
  }
  return V;
}
function la(e) {
  V = e, Rr($t(), kr, e);
}
let $e = null;
function fa(e) {
  V = e, !$e && ($e = setTimeout(() => {
    $e = null, V && Rr($t(), kr, V);
  }, 1e3));
}
function dt(e) {
  $e && (clearTimeout($e), $e = null), la(e);
}
let si = 100, ai = 100;
function da(e, t) {
  si = Math.max(0, Math.min(100, e)), ai = Math.max(0, Math.min(100, t));
}
function io(e) {
  return Math.random() * 100 < e;
}
function st(e, t) {
  return !!e && t - e.lastActivity <= ri && t - e.createdAt <= Cr;
}
function pa(e) {
  var r;
  const t = Mr($t(), oo);
  if (!t || typeof t.id != "string") return !1;
  const n = {
    id: t.id,
    createdAt: t.createdAt ?? e,
    lastActivity: t.lastActivity ?? e,
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: !0
  };
  if (e - n.lastActivity > 1800 * 1e3 || e - n.createdAt > Cr)
    return !1;
  Gt(n), dt({
    tabId: Pe(),
    sessionId: n.id,
    viewCount: t.viewCount ?? 0,
    errorCount: t.errorCount ?? 0,
    actionCount: t.actionCount ?? 0,
    replaySegmentSeq: t.replaySegmentSeq ?? 0,
    legacyReplay: !0
  });
  try {
    (r = $t()) == null || r.removeItem(oo);
  } catch {
  }
  return !0;
}
function ma(e) {
  const t = io(si), n = {
    id: Pe(),
    createdAt: e,
    lastActivity: e,
    sampled: t,
    replaySampled: t && io(ai),
    started: !1
  };
  return Gt(n), n;
}
const tr = /* @__PURE__ */ new Set();
function ha(e) {
  return tr.add(e), () => tr.delete(e);
}
function Re() {
  let e = Mn();
  return e || (e = {
    tabId: Pe(),
    sessionId: "",
    viewCount: 0,
    errorCount: 0,
    actionCount: 0,
    replaySegmentSeq: 0,
    legacyReplay: !1
  }, dt(e)), e;
}
function Rn(e) {
  const t = Re();
  if (t.sessionId === e) return;
  const n = t.sessionId;
  if (t.sessionId = e, t.viewCount = 0, t.errorCount = 0, t.actionCount = 0, t.replaySegmentSeq = 0, t.legacyReplay = !1, dt(t), n)
    for (const r of tr)
      try {
        r(n, e);
      } catch {
      }
}
let Tt = 0;
function so() {
  const e = Date.now();
  ve = 0;
  const t = Q();
  st(t, e) && (e - Tt >= Lr && (t.lastActivity = Math.max(t.lastActivity, e), Gt(t), Tt = e), Rn(t.id));
}
const ya = 6e4;
function ci() {
  const e = Date.now();
  let t = Q();
  st(t, e) || (ve = 0, t = Q()), st(t, e) ? e - Tt >= Lr && (t.lastActivity = Math.max(t.lastActivity, e), Gt(t), Tt = e) : (pa(e) ? t = Q() : (t = ma(e), va(t)), Tt = e), t && Rn(t.id);
}
const ga = 100, _a = 2e3;
function va(e) {
  setTimeout(() => {
    var n;
    ve = 0;
    const t = Q();
    t && t.id !== e.id && st(t, Date.now()) && Math.abs(t.createdAt - e.createdAt) <= _a && ((n = Mn()) == null ? void 0 : n.sessionId) === e.id && Rn(t.id);
  }, ga);
}
function le() {
  var r;
  const e = Date.now(), t = Q();
  if (!st(t, e)) return "";
  const n = (r = Mn()) == null ? void 0 : r.sessionId;
  return n && n !== t.id ? "" : (Rn(t.id), t.id);
}
function wa(e) {
  ve = 0;
  const t = Q(), n = t && t.id === e ? t : qe.get(e);
  if (!n) return t && t.id !== e ? Date.now() : null;
  const r = Math.min(
    n.lastActivity + ri,
    n.createdAt + Cr
  );
  return t && t.id !== e ? Math.min(r, Date.now()) : Date.now() > r ? r : null;
}
function ui() {
  return Re().tabId;
}
function Sa() {
  return Re().legacyReplay;
}
function Ea() {
  const e = Date.now(), t = Q();
  return !st(t, e) || t.started ? !1 : (t.started = !0, Gt(t), !0);
}
function Ta() {
  if (!le()) return 0;
  const e = Re(), t = e.replaySegmentSeq;
  return e.replaySegmentSeq = t + 1, dt(e), t;
}
function li() {
  const e = Q();
  return (e == null ? void 0 : e.sampled) ?? !0;
}
function fi() {
  const e = Q();
  return (e == null ? void 0 : e.replaySampled) ?? !0;
}
let bt = null, At = null, tn = null, It = null;
const di = ["click", "keydown", "touchstart", "scroll"];
let K = null;
function ba() {
  if (typeof BroadcastChannel > "u") return;
  try {
    K = new BroadcastChannel("oodle_rum_tabs");
  } catch {
    K = null;
    return;
  }
  const e = Re().tabId, t = Date.now();
  K.onmessage = (n) => {
    const r = n.data, o = Re();
    !r || r.tabId !== o.tabId || (r.type === "hello" ? K == null || K.postMessage({ type: "taken", tabId: o.tabId }) : r.type === "taken" && o.tabId === e && Date.now() - t < 5e3 && (o.tabId = Pe(), o.replaySegmentSeq = 0, dt(o)));
  }, K.postMessage({ type: "hello", tabId: e });
}
function Aa() {
  if (typeof document > "u") return;
  pi(), ba();
  let e = 0;
  bt = () => {
    const t = Date.now();
    t - e < Lr || (e = t, ci());
  };
  for (const t of di)
    document.addEventListener(t, bt, {
      capture: !0,
      passive: !0
    });
  It = (t) => {
    t.key === Ir && (ve = 0);
  }, window.addEventListener("storage", It), At = () => {
    document.visibilityState === "visible" ? so() : V && dt(V);
  }, document.addEventListener("visibilitychange", At), tn = setInterval(() => {
    document.visibilityState === "visible" && so();
  }, ya);
}
function pi() {
  if (!(typeof document > "u")) {
    if (bt) {
      for (const e of di)
        document.removeEventListener(e, bt, {
          capture: !0
        });
      bt = null;
    }
    At && (document.removeEventListener("visibilitychange", At), At = null), tn && (clearInterval(tn), tn = null), K && (K.close(), K = null), It && (window.removeEventListener("storage", It), It = null);
  }
}
function mi(e) {
  if (!le()) return;
  const t = Re();
  e === "view" || e === "page_load" ? t.viewCount++ : e === "error" ? t.errorCount++ : e === "action" && t.actionCount++, fa(t);
}
function Ia() {
  const e = V ?? Mn();
  return {
    viewCount: (e == null ? void 0 : e.viewCount) ?? 0,
    errorCount: (e == null ? void 0 : e.errorCount) ?? 0,
    actionCount: (e == null ? void 0 : e.actionCount) ?? 0
  };
}
let $ = null;
function ka(e) {
  $ = e;
}
function hi() {
  return ($ == null ? void 0 : $.id) ?? "";
}
function Ca() {
  return ($ == null ? void 0 : $.name) ?? "";
}
function La() {
  return ($ == null ? void 0 : $.email) ?? "";
}
function Ma() {
  return $ ? "identified" : "anonymous";
}
const Ra = 5e5;
function fn(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > Ra) return n;
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
let jt = {};
function Oa(e) {
  e && (jt = { ...e, ...jt });
}
function xa(e) {
  jt = { ...jt, ...e };
}
function Da() {
  return jt;
}
const Pa = 6e4, Na = "sdk_telemetry", G = {
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
  replay_emit_errors: 0,
  replay_full_snapshots: 0,
  replay_snapshot_ms_total: 0,
  replay_snapshot_ms_max: 0
};
function D(e, t = 1) {
  G[e] += t;
}
function yi(e) {
  const t = Math.round(e);
  G.replay_full_snapshots += 1, G.replay_snapshot_ms_total += t, t > G.replay_snapshot_ms_max && (G.replay_snapshot_ms_max = t);
}
function Ua() {
  for (const e in G)
    if (G[e] > 0)
      return !0;
  return !1;
}
function nr() {
  if (!Ua()) return;
  const e = { ...G };
  for (const t in G)
    G[t] = 0;
  Nr(Na, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let kt = null, Ct = null;
function Ha() {
  kt || (kt = setInterval(
    nr,
    Pa
  ), typeof document < "u" && (Ct = () => {
    document.visibilityState === "hidden" && nr();
  }, document.addEventListener(
    "visibilitychange",
    Ct
  )));
}
function Fa() {
  kt && (clearInterval(kt), kt = null), Ct && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    Ct
  ), Ct = null), nr();
}
var U = Uint8Array, P = Uint16Array, Or = Int32Array, xr = new U([
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
]), Dr = new U([
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
]), ao = new U([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), gi = function(e, t) {
  for (var n = new P(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new Or(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, _i = gi(xr, 2), Ba = _i.b, rr = _i.r;
Ba[28] = 258, rr[258] = 28;
var qa = gi(Dr, 0), co = qa.r, or = new P(32768);
for (var S = 0; S < 32768; ++S) {
  var de = (S & 43690) >> 1 | (S & 21845) << 1;
  de = (de & 52428) >> 2 | (de & 13107) << 2, de = (de & 61680) >> 4 | (de & 3855) << 4, or[S] = ((de & 65280) >> 8 | (de & 255) << 8) >> 1;
}
var Lt = (function(e, t, n) {
  for (var r = e.length, o = 0, i = new P(t); o < r; ++o)
    e[o] && ++i[e[o] - 1];
  var s = new P(t);
  for (o = 1; o < t; ++o)
    s[o] = s[o - 1] + i[o - 1] << 1;
  var a;
  if (n) {
    a = new P(1 << t);
    var c = 15 - t;
    for (o = 0; o < r; ++o)
      if (e[o])
        for (var l = o << 4 | e[o], u = t - e[o], f = s[e[o] - 1]++ << u, d = f | (1 << u) - 1; f <= d; ++f)
          a[or[f] >> c] = l;
  } else
    for (a = new P(r), o = 0; o < r; ++o)
      e[o] && (a[o] = or[s[e[o] - 1]++] >> 15 - e[o]);
  return a;
}), Oe = new U(288);
for (var S = 0; S < 144; ++S)
  Oe[S] = 8;
for (var S = 144; S < 256; ++S)
  Oe[S] = 9;
for (var S = 256; S < 280; ++S)
  Oe[S] = 7;
for (var S = 280; S < 288; ++S)
  Oe[S] = 8;
var dn = new U(32);
for (var S = 0; S < 32; ++S)
  dn[S] = 5;
var Va = /* @__PURE__ */ Lt(Oe, 9, 0), $a = /* @__PURE__ */ Lt(dn, 5, 0), vi = function(e) {
  return (e + 7) / 8 | 0;
}, wi = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new U(e.subarray(t, n));
}, ee = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, ht = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, qn = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: Ei, l: 0 };
  if (o == 1) {
    var s = new U(n[0].s + 1);
    return s[n[0].s] = 1, { t: s, l: 1 };
  }
  n.sort(function(L, _) {
    return L.f - _.f;
  }), n.push({ s: -1, f: 25001 });
  var a = n[0], c = n[1], l = 0, u = 1, f = 2;
  for (n[0] = { s: -1, f: a.f + c.f, l: a, r: c }; u != o - 1; )
    a = n[n[l].f < n[f].f ? l++ : f++], c = n[l != u && n[l].f < n[f].f ? l++ : f++], n[u++] = { s: -1, f: a.f + c.f, l: a, r: c };
  for (var d = i[0].s, r = 1; r < o; ++r)
    i[r].s > d && (d = i[r].s);
  var y = new P(d + 1), m = ir(n[u - 1], y, 0);
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
}, ir = function(e, t, n) {
  return e.s == -1 ? Math.max(ir(e.l, t, n + 1), ir(e.r, t, n + 1)) : t[e.s] = n;
}, uo = function(e) {
  for (var t = e.length; t && !e[--t]; )
    ;
  for (var n = new P(++t), r = 0, o = e[0], i = 1, s = function(c) {
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
}, yt = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, Si = function(e, t, n) {
  var r = n.length, o = vi(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, lo = function(e, t, n, r, o, i, s, a, c, l, u) {
  ee(t, u++, n), ++o[256];
  for (var f = qn(o, 15), d = f.t, y = f.l, m = qn(i, 15), w = m.t, k = m.l, C = uo(d), I = C.c, b = C.n, E = uo(w), L = E.c, _ = E.n, v = new P(19), h = 0; h < I.length; ++h)
    ++v[I[h] & 31];
  for (var h = 0; h < L.length; ++h)
    ++v[L[h] & 31];
  for (var p = qn(v, 7), T = p.t, Z = p.l, R = 19; R > 4 && !T[ao[R - 1]]; --R)
    ;
  var Ne = l + 5 << 3, F = yt(o, Oe) + yt(i, dn) + s, B = yt(o, d) + yt(i, w) + s + 14 + 3 * R + yt(v, T) + 2 * v[16] + 3 * v[17] + 7 * v[18];
  if (c >= 0 && Ne <= F && Ne <= B)
    return Si(t, u, e.subarray(c, c + l));
  var z, M, q, fe;
  if (ee(t, u, 1 + (B < F)), u += 2, B < F) {
    z = Lt(d, y, 0), M = d, q = Lt(w, k, 0), fe = w;
    var Nn = Lt(T, Z, 0);
    ee(t, u, b - 257), ee(t, u + 5, _ - 1), ee(t, u + 10, R - 4), u += 14;
    for (var h = 0; h < R; ++h)
      ee(t, u + 3 * h, T[ao[h]]);
    u += 3 * R;
    for (var X = [I, L], mt = 0; mt < 2; ++mt)
      for (var Ue = X[mt], h = 0; h < Ue.length; ++h) {
        var Y = Ue[h] & 31;
        ee(t, u, Nn[Y]), u += T[Y], Y > 15 && (ee(t, u, Ue[h] >> 5 & 127), u += Ue[h] >> 12);
      }
  } else
    z = Va, M = Oe, q = $a, fe = dn;
  for (var h = 0; h < a; ++h) {
    var O = r[h];
    if (O > 255) {
      var Y = O >> 18 & 31;
      ht(t, u, z[Y + 257]), u += M[Y + 257], Y > 7 && (ee(t, u, O >> 23 & 31), u += xr[Y]);
      var He = O & 31;
      ht(t, u, q[He]), u += fe[He], He > 3 && (ht(t, u, O >> 5 & 8191), u += Dr[He]);
    } else
      ht(t, u, z[O]), u += M[O];
  }
  return ht(t, u, z[256]), u + M[256];
}, ja = /* @__PURE__ */ new Or([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Ei = /* @__PURE__ */ new U(0), za = function(e, t, n, r, o, i) {
  var s = i.z || e.length, a = new U(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), c = a.subarray(r, a.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (c[0] = i.r >> 3);
    for (var f = ja[t - 1], d = f >> 13, y = f & 8191, m = (1 << n) - 1, w = i.p || new P(32768), k = i.h || new P(m + 1), C = Math.ceil(n / 3), I = 2 * C, b = function(Fn) {
      return (e[Fn] ^ e[Fn + 1] << C ^ e[Fn + 2] << I) & m;
    }, E = new Or(25e3), L = new P(288), _ = new P(32), v = 0, h = 0, p = i.i || 0, T = 0, Z = i.w || 0, R = 0; p + 2 < s; ++p) {
      var Ne = b(p), F = p & 32767, B = k[Ne];
      if (w[F] = B, k[Ne] = F, Z <= p) {
        var z = s - p;
        if ((v > 7e3 || T > 24576) && (z > 423 || !l)) {
          u = lo(e, c, 0, E, L, _, h, T, R, p - R, u), T = v = h = 0, R = p;
          for (var M = 0; M < 286; ++M)
            L[M] = 0;
          for (var M = 0; M < 30; ++M)
            _[M] = 0;
        }
        var q = 2, fe = 0, Nn = y, X = F - B & 32767;
        if (z > 2 && Ne == b(p - X))
          for (var mt = Math.min(d, z) - 1, Ue = Math.min(32767, p), Y = Math.min(258, z); X <= Ue && --Nn && F != B; ) {
            if (e[p + q] == e[p + q - X]) {
              for (var O = 0; O < Y && e[p + O] == e[p + O - X]; ++O)
                ;
              if (O > q) {
                if (q = O, fe = X, O > mt)
                  break;
                for (var He = Math.min(X, O - 2), Jr = 0, M = 0; M < He; ++M) {
                  var Un = p - X + M & 32767, Ns = w[Un], Gr = Un - Ns & 32767;
                  Gr > Jr && (Jr = Gr, B = Un);
                }
              }
            }
            F = B, B = w[F], X += F - B & 32767;
          }
        if (fe) {
          E[T++] = 268435456 | rr[q] << 18 | co[fe];
          var Qr = rr[q] & 31, Zr = co[fe] & 31;
          h += xr[Qr] + Dr[Zr], ++L[257 + Qr], ++_[Zr], Z = p + q, ++v;
        } else
          E[T++] = e[p], ++L[e[p]];
      }
    }
    for (p = Math.max(p, Z); p < s; ++p)
      E[T++] = e[p], ++L[e[p]];
    u = lo(e, c, l, E, L, _, h, T, R, p - R, u), l || (i.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, i.h = k, i.p = w, i.i = p, i.w = Z);
  } else {
    for (var p = i.w || 0; p < s + l; p += 65535) {
      var Hn = p + 65535;
      Hn >= s && (c[u / 8 | 0] = l, Hn = s), u = Si(c, u + 1, e.subarray(p, Hn));
    }
    i.i = s;
  }
  return wi(a, 0, r + vi(u) + o);
}, Xa = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), Ya = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = Xa[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, Wa = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new U(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return za(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, sr = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, Ka = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && sr(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, Ja = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function Ga(e, t) {
  t || (t = {});
  var n = Ya(), r = e.length;
  n.p(e);
  var o = Wa(e, t, Ja(t), 8), i = o.length;
  return Ka(o, t), sr(o, i - 8, n.d()), sr(o, i - 4, r), o;
}
var fo = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), Qa = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Za = 0;
try {
  Qa.decode(Ei, { stream: !0 }), Za = 1;
} catch {
}
function ec(e, t) {
  var n;
  if (fo)
    return fo.encode(e);
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
  return wi(o, 0, i);
}
function nn(e) {
  try {
    return Ga(ec(e));
  } catch {
    return null;
  }
}
const tc = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function nc(e) {
  if (!tc)
    return nn(e);
  try {
    const t = new Response(e).body;
    if (!t) return nn(e);
    const n = t.pipeThrough(
      new CompressionStream("gzip")
    ), r = await new Response(
      n
    ).arrayBuffer();
    return new Uint8Array(r);
  } catch {
    return nn(e);
  }
}
const rc = "0.7.0", po = 5e3, Ti = 50, bi = 5e5, mo = 256e3, pn = "replay", Ai = 8e4, Ii = 32, oc = 2e7, ic = 5, sc = 1e3, ac = 6e4, cc = 500, mn = 63e3;
let je = 0, ze = 0, pe = [], Mt = 0, Vn = null;
const hn = /* @__PURE__ */ new Map();
let Xe = null, Ye = null, ar = null;
const cr = /* @__PURE__ */ new Set();
function uc(e) {
  return cr.add(e), () => cr.delete(e);
}
let Rt = !1;
function lc() {
  try {
    return x().flushIntervalMs ?? po;
  } catch {
    return po;
  }
}
function ki(e) {
  let t = hn.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, hn.set(e, t)), t;
}
function Ci(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (D("compression_failures"), { body: t, encoding: "" });
}
async function Li(e) {
  return Ci(await nc(e), e);
}
function fc(e) {
  return Ci(nn(e), e);
}
const dc = 64e3;
function ur(e, t, n) {
  if (e === pn)
    return {
      bytes: n ?? fn(
        t,
        dc
      ),
      oversized: !1
    };
  const r = fn(
    t,
    mo + 1
  );
  return {
    bytes: r,
    oversized: r > mo
  };
}
let lr = null;
function pc(e) {
  lr = e;
}
function On(e) {
  D("transport_drops"), e === pn && lr && lr();
}
const mc = "/v1/rum/ingest";
function hc(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: rc
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
function yc(e, t, n) {
  const r = x();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const c = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, l = new Blob([n], {
      type: "application/json"
    });
    if (l.size < mn && navigator.sendBeacon(c, l))
      return;
  }
  const { body: o, encoding: i } = fc(n), s = { ...t };
  i ? s["Content-Encoding"] = i : delete s["Content-Encoding"];
  const a = o instanceof Blob ? o.size : n.length;
  fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: a < mn,
    credentials: "omit"
  }).catch(() => {
    D("exit_send_failures");
  });
}
function $n(e, t, n, r) {
  const o = n.length;
  if (Mt + o > oc) {
    D("retry_drops"), r && On(r);
    return;
  }
  const i = { ...t };
  delete i["Content-Encoding"], pe.push({
    url: e,
    headers: i,
    body: n,
    bytes: o,
    attempts: 0,
    batchKey: r
  }), Mt += o, Mi();
}
function Mi() {
  if (Vn || pe.length === 0)
    return;
  const e = pe[0], t = Math.min(
    sc * Math.pow(2, e.attempts),
    ac
  );
  Vn = setTimeout(() => {
    Vn = null, Ri();
  }, t);
}
async function Ri() {
  for (; pe.length > 0 && je < Ai && ze < Ii; ) {
    const e = pe.shift();
    if (Mt -= e.bytes, e.attempts++, e.attempts > ic) {
      D("retry_drops"), e.batchKey && On(e.batchKey);
      continue;
    }
    const t = e.bytes;
    je += t, ze++;
    try {
      const { body: n, encoding: r } = await Li(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < mn,
        credentials: "omit"
      });
      if (xi(i), i.status === 429 || i.status >= 500) {
        pe.unshift(e), Mt += e.bytes;
        break;
      }
    } catch {
      pe.unshift(e), Mt += e.bytes;
      break;
    } finally {
      je -= t, ze--;
    }
  }
  pe.length > 0 && Mi();
}
function gc() {
  Xe && (clearTimeout(Xe), Xe = null), Ye && (clearTimeout(Ye), Ye = null);
}
function Pr() {
  const e = lc();
  Xe && clearTimeout(Xe), Xe = setTimeout(
    () => ce(),
    e
  ), Ye || (Ye = setTimeout(
    () => {
      Ye = null, ce();
    },
    e + cc
  ));
}
function Nr(e, t, n) {
  const { bytes: r, oversized: o } = ur(
    e,
    t,
    n
  );
  if (o) {
    console.warn(
      `[@oodle-ai/rum] Dropping oversized ${e} payload (${r} bytes)`
    ), On(e);
    return;
  }
  const i = ki(e);
  if (i.items.push(t), i.bytesEstimate += r, !Rt && (i.items.length >= Ti || i.bytesEstimate >= bi)) {
    ce();
    return;
  }
  Pr();
}
function _c(e, t, n, r) {
  const { bytes: o, oversized: i } = ur(
    e,
    n
  );
  if (i) {
    On(e);
    return;
  }
  const s = ki(e), a = s.upsertMap.get(t);
  if (a !== void 0) {
    const c = ur(
      e,
      s.items[a]
    ).bytes;
    s.items[a] = r ? r(s.items[a], n) : n, s.bytesEstimate += o - c;
  } else {
    const c = s.items.length;
    s.items.push(n), s.upsertMap.set(t, c), s.bytesEstimate += o;
  }
  if (!Rt && (s.items.length >= Ti || s.bytesEstimate >= bi)) {
    ce();
    return;
  }
  Pr();
}
function Oi(e) {
  ar = e;
}
const ho = ["events", "replay"];
function ce(e = !1) {
  const t = x();
  if (e && ar && !Rt) {
    Rt = !0;
    try {
      ar();
    } catch {
    } finally {
      Rt = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    Pr();
    return;
  }
  gc();
  const n = Da(), r = [], o = Array.from(
    hn.keys()
  ).sort((l, u) => {
    const f = ho.indexOf(l), d = ho.indexOf(u), y = f >= 0 ? f : 999, m = d >= 0 ? d : 999;
    return y - m;
  });
  for (const l of o) {
    const u = hn.get(l);
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
  const i = hc(r), s = `${t.endpoint}${mc}`, a = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, c = r.some(
    (l) => l.type === pn
  );
  if (e) {
    yc(s, a, i);
    return;
  }
  vc(
    s,
    a,
    i,
    c ? pn : void 0
  );
}
async function vc(e, t, n, r) {
  const o = n.length;
  if (je >= Ai || ze >= Ii) {
    $n(e, t, n, r);
    return;
  }
  je += o, ze++;
  try {
    const { body: i, encoding: s } = await Li(n), a = { ...t };
    s && (a["Content-Encoding"] = s);
    const c = await fetch(e, {
      method: "POST",
      headers: a,
      body: i,
      keepalive: o < mn,
      credentials: "omit"
    });
    xi(c), (c.status === 429 || c.status >= 500) && $n(e, t, n, r);
  } catch {
    D("send_failures"), $n(e, t, n, r);
  } finally {
    je -= o, ze--, Ri();
  }
}
const fr = /* @__PURE__ */ new Map();
function xi(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && fr.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function xn(e) {
  const t = fr.get(e);
  return t ? Date.now() >= t ? (fr.delete(e), !1) : !0 : !1;
}
let Ot = null, xt = null, Dt = null, dr = null;
function wc(e) {
  dr = e;
}
const Di = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function yo() {
  typeof document > "u" || (Ot = () => {
    document.visibilityState === "hidden" && ce(!0);
  }, xt = () => {
    for (const e of cr)
      try {
        e();
      } catch {
      }
    ce(!0);
  }, Dt = (e) => {
    e.persisted && dr && dr();
  }, document.addEventListener(
    "visibilitychange",
    Ot
  ), window.addEventListener(
    Di,
    xt
  ), window.addEventListener(
    "pageshow",
    Dt
  ));
}
function Sc() {
  Ot && (document.removeEventListener(
    "visibilitychange",
    Ot
  ), Ot = null), xt && (window.removeEventListener(
    Di,
    xt
  ), xt = null), Dt && (window.removeEventListener(
    "pageshow",
    Dt
  ), Dt = null);
}
const yn = /* @__PURE__ */ new Map();
function Ec(e, t) {
  yn.set(e, t);
}
function Tc() {
  return yn.size === 0 ? {} : Object.fromEntries(yn);
}
function bc() {
  yn.clear();
}
const Ac = 100, Ic = 1e4, Ce = /* @__PURE__ */ new Set();
let Pi = 0, We = null;
function Ur(e) {
  for (const t of Ce)
    try {
      t(e);
    } catch {
    }
}
const kc = { kind: "dom" }, Cc = () => Ur(kc);
function Ni() {
  We || typeof MutationObserver > "u" || typeof document > "u" || !document.documentElement || (We = new MutationObserver(Cc), We.observe(document.documentElement, {
    childList: !0,
    subtree: !0,
    attributes: !0,
    characterData: !0
  }));
}
function pr() {
  Ce.size > 0 || !We || (We.disconnect(), We = null);
}
function Ui() {
  const e = Pi++;
  return Ur({ kind: "start", index: e }), e;
}
function Hi(e) {
  Ur({ kind: "end", index: e });
}
function Lc(e) {
  const t = (n) => {
    n.kind !== "end" && e();
  };
  return Ce.add(t), Ni(), () => {
    Ce.delete(t), pr();
  };
}
function Fi(e, t, n = Ic) {
  let r = null;
  const o = Pi;
  let i = 0, s = null, a = null, c = !1;
  const l = (d) => {
    c || (c = !0, s && clearTimeout(s), a && clearTimeout(a), Ce.delete(f), pr(), t(d));
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
    }, Ac);
  };
  function f(d) {
    if (d.kind !== "dom") {
      if (d.index < o) return;
      i = Math.max(0, i + (d.kind === "start" ? 1 : -1));
    }
    r = Date.now(), u();
  }
  return Ce.add(f), Ni(), u(), Number.isFinite(n) && (a = setTimeout(() => {
    l({
      endMs: r,
      hadActivity: r !== null,
      timedOut: !0
    });
  }, n)), () => {
    c = !0, s && clearTimeout(s), a && clearTimeout(a), Ce.delete(f), pr();
  };
}
var me, Pt, Bi, gn, qi = -1, Qt = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (qi = t.timeStamp, e(t));
  }), !0);
}, Hr = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, Dn = function() {
  var e = Hr();
  return e && e.activationStart || 0;
}, we = function(e, t) {
  var n = Hr(), r = "navigate";
  return qi >= 0 ? r = "back-forward-cache" : n && (document.prerendering || Dn() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, Fr = function(e, t, n) {
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
}, Se = function(e, t, n, r) {
  var o, i;
  return function(s) {
    t.value >= 0 && (s || r) && ((i = t.value - (o || 0)) || o === void 0) && (o = t.value, t.delta = i, t.rating = (function(a, c) {
      return a > c[1] ? "poor" : a > c[0] ? "needs-improvement" : "good";
    })(t.value, n), e(t));
  };
}, Vi = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, Br = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, qr = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Ve = -1, go = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, _n = function(e) {
  document.visibilityState === "hidden" && Ve > -1 && (Ve = e.type === "visibilitychange" ? e.timeStamp : 0, Mc());
}, _o = function() {
  addEventListener("visibilitychange", _n, !0), addEventListener("prerenderingchange", _n, !0);
}, Mc = function() {
  removeEventListener("visibilitychange", _n, !0), removeEventListener("prerenderingchange", _n, !0);
}, Vr = function() {
  return Ve < 0 && (Ve = go(), _o(), Qt((function() {
    setTimeout((function() {
      Ve = go(), _o();
    }), 0);
  }))), { get firstHiddenTime() {
    return Ve;
  } };
}, Pn = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, vo = [1800, 3e3], Rc = function(e, t) {
  t = t || {}, Pn((function() {
    var n, r = Vr(), o = we("FCP"), i = Fr("paint", (function(s) {
      s.forEach((function(a) {
        a.name === "first-contentful-paint" && (i.disconnect(), a.startTime < r.firstHiddenTime && (o.value = Math.max(a.startTime - Dn(), 0), o.entries.push(a), n(!0)));
      }));
    }));
    i && (n = Se(e, o, vo, t.reportAllChanges), Qt((function(s) {
      o = we("FCP"), n = Se(e, o, vo, t.reportAllChanges), Vi((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, Oc = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = qr(e), document.visibilityState === "hidden" ? e() : (n = t(e), Br(e)), n;
}, wo = [2500, 4e3], jn = {}, xc = function(e, t) {
  t = t || {}, Pn((function() {
    var n, r = Vr(), o = we("LCP"), i = function(c) {
      t.reportAllChanges || (c = c.slice(-1)), c.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - Dn(), 0), o.entries = [l], n());
      }));
    }, s = Fr("largest-contentful-paint", i);
    if (s) {
      n = Se(e, o, wo, t.reportAllChanges);
      var a = qr((function() {
        jn[o.id] || (i(s.takeRecords()), s.disconnect(), jn[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(c) {
        addEventListener(c, (function() {
          return Oc(a);
        }), { once: !0, capture: !0 });
      })), Br(a), Qt((function(c) {
        o = we("LCP"), n = Se(e, o, wo, t.reportAllChanges), Vi((function() {
          o.value = performance.now() - c.timeStamp, jn[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, So = [800, 1800], Dc = function e(t) {
  document.prerendering ? Pn((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, Pc = function(e, t) {
  t = t || {};
  var n = we("TTFB"), r = Se(e, n, So, t.reportAllChanges);
  Dc((function() {
    var o = Hr();
    o && (n.value = Math.max(o.responseStart - Dn(), 0), n.entries = [o], r(!0), Qt((function() {
      n = we("TTFB", 0), (r = Se(e, n, So, t.reportAllChanges))(!0);
    })));
  }));
}, St = { passive: !0, capture: !0 }, Nc = /* @__PURE__ */ new Date(), Eo = function(e, t) {
  me || (me = t, Pt = e, Bi = /* @__PURE__ */ new Date(), ji(removeEventListener), $i());
}, $i = function() {
  if (Pt >= 0 && Pt < Bi - Nc) {
    var e = { entryType: "first-input", name: me.type, target: me.target, cancelable: me.cancelable, startTime: me.timeStamp, processingStart: me.timeStamp + Pt };
    gn.forEach((function(t) {
      t(e);
    })), gn = [];
  }
}, Uc = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        Eo(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, St), removeEventListener("pointercancel", i, St);
      };
      addEventListener("pointerup", o, St), addEventListener("pointercancel", i, St);
    })(t, e) : Eo(t, e);
  }
}, ji = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, Uc, St);
  }));
}, To = [100, 300], Hc = function(e, t) {
  t = t || {}, Pn((function() {
    var n, r = Vr(), o = we("FID"), i = function(c) {
      c.startTime < r.firstHiddenTime && (o.value = c.processingStart - c.startTime, o.entries.push(c), n(!0));
    }, s = function(c) {
      c.forEach(i);
    }, a = Fr("first-input", s);
    n = Se(e, o, To, t.reportAllChanges), a && (Br(qr((function() {
      s(a.takeRecords()), a.disconnect();
    }))), Qt((function() {
      var c;
      o = we("FID"), n = Se(e, o, To, t.reportAllChanges), gn = [], Pt = -1, me = null, ji(addEventListener), c = i, gn.push(c), $i();
    })));
  }));
};
const Fc = 3e3;
let zt = null, zi = (e) => e.href, g = null, ie = null, vn = [];
function wn() {
  return typeof performance < "u" ? performance.now() : 0;
}
function Bc() {
  return typeof performance < "u" && performance.timeOrigin ? performance.timeOrigin : Date.now();
}
function Nt(e) {
  const t = e.hash ?? "", n = t.startsWith("#/") ? t.split("?")[0] : "";
  return e.pathname + n;
}
function Xi(e, t, n) {
  return {
    id: Pe(),
    sessionId: le(),
    loadingType: e,
    startEpoch: t,
    startPerf: n,
    url: zi(window.location),
    urlPath: ye(window.location.pathname),
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
function qc(e) {
  const t = Array.from(e.interactions.values()).sort((r, o) => o - r);
  if (t.length === 0) return 0;
  const n = Math.min(t.length - 1, Math.floor(t.length / 50));
  return t[n];
}
function Vc(e) {
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
    inp_ms: qc(e),
    cls: Math.round(e.cls.value * 1e4) / 1e4,
    dns_ms: n.dns_ms ?? 0,
    connect_ms: n.connect_ms ?? 0,
    tls_ms: n.tls_ms ?? 0,
    download_ms: n.download_ms ?? 0,
    dom_interactive_ms: n.dom_interactive_ms ?? 0,
    dom_complete_ms: n.dom_complete_ms ?? 0
  };
}
function pt(e) {
  if (!(!zt || !e.sessionId)) {
    if (e.endEpoch !== void 0) {
      if (e.expirySent) return;
      e.expirySent = !0;
    } else if (e.active) {
      const t = wa(e.sessionId);
      t !== null && (e.active = !1, e.endEpoch = Math.max(e.startEpoch, t), e.expirySent = !0, e.cancelIdle && e.cancelIdle(), g === e && (g = null));
    }
    e.seq++, zt(Vc(e), e.sessionId);
  }
}
function Yi() {
  ie && (clearTimeout(ie), ie = null), g && pt(g);
}
function Xt() {
  ie || !g || (ie = setTimeout(() => {
    ie = null, g && pt(g);
  }, Fc));
}
const $c = 5 * 6e4, Ut = /* @__PURE__ */ new Map();
function jc(e) {
  const t = Date.now();
  for (const [n, r] of Ut) r.until <= t && Ut.delete(n);
  Ut.set(e.id, { v: e, until: t + $c });
}
function Sn() {
  const e = g;
  e && (jc(e), e.cancelIdle && e.cancelIdle(), ie && (clearTimeout(ie), ie = null), e.active = !1, pt(e), g = null);
}
function Wi(e) {
  typeof document < "u" && document.visibilityState === "hidden" && (e.hiddenAt = e.startEpoch), e.cancelIdle = Fi(
    e.startEpoch,
    (t) => {
      if (e.cancelIdle = null, g !== e) return;
      let n = t.endMs !== null && t.hadActivity ? t.endMs - e.startEpoch : 0;
      e.loadingType === "initial_load" && (n = Math.max(n, e.vitals.load_event_ms ?? 0)), !(e.hiddenAt !== void 0 && e.startEpoch + n > e.hiddenAt) && (e.loadingTimeMs = Math.max(0, n), Yi());
    },
    1 / 0
  );
}
function En(e, t, n) {
  Sn();
  const r = Xi(e, t, n);
  r.sessionId && (g = r, pt(r), Wi(r));
}
function Ki() {
  return (g == null ? void 0 : g.id) ?? "";
}
function zc() {
  return (g == null ? void 0 : g.urlPath) ?? "";
}
function Xc(e) {
  const t = typeof e.view_id == "string" ? e.view_id : "";
  let n = g, r = !1;
  if (t && (n == null ? void 0 : n.id) !== t) {
    const o = Ut.get(t);
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
    r ? pt(n) : Xt();
  }
}
function Yc(e) {
  var r, o;
  const t = (o = (r = performance.getEntriesByType) == null ? void 0 : r.call(performance, "navigation")) == null ? void 0 : o[0];
  if (!t || t.loadEventEnd <= 0) return !1;
  const n = Math.round;
  return e.vitals.load_event_ms = n(t.loadEventEnd - t.startTime), e.vitals.dns_ms = n(t.domainLookupEnd - t.domainLookupStart), e.vitals.connect_ms = n(t.connectEnd - t.connectStart), e.vitals.tls_ms = n(
    t.secureConnectionStart > 0 ? t.connectEnd - t.secureConnectionStart : 0
  ), e.vitals.download_ms = n(t.responseEnd - t.responseStart), e.vitals.dom_interactive_ms = n(t.domInteractive - t.startTime), e.vitals.dom_complete_ms = n(t.domComplete - t.startTime), !0;
}
function zn(e, t, n = {}) {
  if (!(typeof PerformanceObserver > "u"))
    try {
      const r = new PerformanceObserver((o) => t(o.getEntries()));
      r.observe({ type: e, buffered: !0, ...n }), vn.push(() => r.disconnect());
    } catch {
    }
}
function Wc(e, t, n) {
  const r = e.cls;
  r.windowValue > 0 && n - r.last < 1e3 && n - r.windowStart < 5e3 ? r.windowValue += t : (r.windowValue = t, r.windowStart = n), r.last = n, r.windowValue > r.value && (r.value = r.windowValue);
}
function Kc() {
  zn("layout-shift", (t) => {
    const n = g;
    if (!n) return;
    let r = !1;
    for (const o of t)
      o.hadRecentInput || o.startTime < n.startPerf || (Wc(n, o.value, o.startTime), r = !0);
    r && Xt();
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
    r && Xt();
  };
  zn("event", e, { durationThreshold: 40 }), zn("first-input", e);
}
function Jc(e) {
  const t = (o, i) => {
    g !== e && !e.active || (e.vitals[o] = Math.round(i * 100) / 100, g === e && Xt());
  };
  try {
    xc((o) => t("lcp", o.value)), Rc((o) => t("fcp", o.value)), Pc((o) => t("ttfb", o.value)), Hc((o) => t("fid", o.value));
  } catch {
  }
  let n = 0;
  const r = () => {
    Yc(e) ? g === e && Xt() : ++n < 50 && setTimeout(r, 200);
  };
  document.readyState === "complete" ? setTimeout(r, 0) : window.addEventListener("load", () => setTimeout(r, 0), { once: !0 });
}
let Ke = "", rn = !1;
function Be() {
  const e = Nt(window.location);
  e !== Ke && (Ke = e, En("route_change", Date.now(), wn()));
}
function Gc(e, t) {
  if (typeof window > "u") return;
  Ji(), rn = !1, zt = e, zi = t, Ke = Nt(window.location);
  const n = Bc(), r = Xi("initial_load", n, 0);
  r.sessionId && (g = r, pt(r), Wi(r), Jc(r)), Kc();
  const o = history.pushState, i = history.replaceState;
  history.pushState = function(...u) {
    o.apply(this, u), Be();
  }, history.replaceState = function(...u) {
    i.apply(this, u), Be();
  }, window.addEventListener("popstate", Be), window.addEventListener("hashchange", Be);
  const s = () => {
    document.visibilityState === "hidden" && (g && g.hiddenAt === void 0 && (g.hiddenAt = Date.now()), Yi());
  };
  document.addEventListener("visibilitychange", s);
  const a = () => {
    Sn(), rn = !0;
  };
  window.addEventListener("pagehide", a);
  const c = (u) => {
    u.persisted && (rn = !1, Ke = Nt(window.location), En("bf_cache", Date.now(), wn()));
  };
  window.addEventListener("pageshow", c);
  const l = ha((u) => {
    g && g.sessionId === u && Sn(), Ke = Nt(window.location), En("route_change", Date.now(), wn());
  });
  vn.push(() => {
    history.pushState = o, history.replaceState = i, window.removeEventListener("popstate", Be), window.removeEventListener("hashchange", Be), document.removeEventListener("visibilitychange", s), window.removeEventListener("pagehide", a), window.removeEventListener("pageshow", c), l();
  });
}
function Qc() {
  g || rn || !zt || typeof window > "u" || (Ke = Nt(window.location), En("route_change", Date.now(), wn()));
}
function Ji() {
  Sn(), Ut.clear();
  for (const e of vn) e();
  vn = [], zt = null, g = null;
}
const Zc = 3, eu = 1e3;
let Tn = null, J = null;
const se = [], $r = [];
let on = null;
function tu() {
  for (let e = se.length - 1; e >= 0; e--)
    if (!se[e].done) return se[e].id;
  return "";
}
function nu(e) {
  for (const t of se)
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
function Gi(e) {
  return e.deadCandidate && !e.selected && !e.hadActivity && !e.userInput;
}
function ru(e, t, n = !1) {
  const r = [];
  return t && r.push("rage_click"), (t ? n : Gi(e)) && r.push("dead_click"), e.errorCount > 0 && r.push("error_click"), r;
}
function bo(e, t, n = 1, r = !1) {
  if (!Tn) return;
  const o = ru(e, t, r), i = t ? "rage_click" : o.includes("dead_click") ? "dead_click" : o.includes("error_click") ? "error_click" : "click", s = {
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
  Tn(s);
}
function bn() {
  const e = J;
  if (J = null, !e) return;
  e.timer && clearTimeout(e.timer);
  const t = () => e.clicks.every((o) => o.done), n = () => {
    const o = e.clicks.some((i) => i.userInput || i.selected);
    if (e.clicks.length >= Zc && !o) {
      const i = e.clicks[0], s = e.clicks.some(Gi);
      for (const a of e.clicks.slice(1))
        i.errorCount += a.errorCount, i.resourceCount += a.resourceCount, i.longTaskCount += a.longTaskCount, i.hadActivity = i.hadActivity || a.hadActivity;
      bo(i, !0, e.clicks.length, s);
    } else
      for (const i of e.clicks) bo(i, !1);
    for (const i of e.clicks) {
      const s = se.indexOf(i);
      s >= 0 && se.splice(s, 1);
    }
  };
  if (t()) {
    n();
    return;
  }
  const r = { flush: n, poll: null };
  Ht.add(r), r.poll = setInterval(() => {
    t() && (clearInterval(r.poll), Ht.delete(r), n());
  }, 50), $r.push(() => {
    clearInterval(r.poll), Ht.delete(r);
  });
}
const Ht = /* @__PURE__ */ new Set();
function ou() {
  const e = Date.now();
  for (const t of se)
    t.done || (t.hadActivity = !0, t.userInput = jr >= t.startMs, t.loadingTimeMs = Math.max(0, e - t.startMs), t.done = !0);
  J && bn();
  for (const t of [...Ht])
    t.poll && clearInterval(t.poll), Ht.delete(t), t.flush();
}
function iu(e) {
  if (e.tagName === "LABEL") {
    const t = e.getAttribute("for"), n = t ? document.getElementById(t) : null;
    if (n) return n;
  }
  return e;
}
function su() {
  var e;
  try {
    const t = (e = window.getSelection) == null ? void 0 : e.call(window);
    return !!t && !t.isCollapsed && t.toString().length > 0;
  } catch {
    return !1;
  }
}
const au = (
  // Text fields take the caret without changing the page; checkboxes,
  // radios and buttons must change something, so they stay candidates.
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="range"]),textarea,select,[contenteditable],[contenteditable] *,canvas,a[href],a[href] *'
), cu = 10;
function be(e) {
  const t = e.split(`
`).map((n) => n.trim()).find(Boolean) ?? "";
  return t.length > 80 ? t.slice(0, 79) + "…" : t;
}
function gt(e, t) {
  return (e.getAttribute(t) ?? "").trim();
}
function uu(e) {
  const t = e.tagName === "INPUT" || e.tagName === "SELECT" || e.tagName === "TEXTAREA" ? e.labels : null;
  if (t && t.length > 0) {
    const i = t[0];
    if (!Zn(i)) return be(Ft(i));
  }
  if (e.tagName === "INPUT") {
    const i = gt(e, "type");
    if (i === "button" || i === "submit" || i === "reset")
      return be(e.value ?? "");
  }
  const n = gt(e, "role");
  if (["BUTTON", "LABEL", "A"].includes(e.tagName) || n === "button" || n === "link") {
    const i = be(Ft(e));
    if (i) return i;
  }
  const r = gt(e, "aria-label");
  if (r) return be(r);
  const o = gt(e, "aria-labelledby");
  if (o) {
    const i = o.split(/\s+/).map((s) => document.getElementById(s)).filter((s) => !!s && !Zn(s)).map((s) => Ft(s)).join(" ");
    if (i.trim()) return be(i);
  }
  for (const i of ["alt", "title", "placeholder"]) {
    const s = gt(e, i);
    if (s) return be(s);
  }
  return "";
}
function lu(e) {
  for (const t of [uu, (n) => be(Ft(n))]) {
    let n = e;
    for (let r = 0; n && r <= cu && n.tagName !== "BODY" && n.tagName !== "HTML"; r++) {
      const o = t(n);
      if (o) return { el: n, name: o };
      n = n.parentElement;
    }
  }
  return null;
}
const fu = ni + ",[contenteditable],input,textarea,select,script,style,template,noscript,[hidden]", du = /* @__PURE__ */ new Set([
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
function Ft(e, t = 200) {
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
          c = a.matches(fu);
        } catch {
          c = !0;
        }
        if (c) {
          o();
          continue;
        }
        const l = du.has(a.tagName);
        if (l && o(), !i(a)) return !1;
        l && o();
      }
    }
    return !0;
  };
  return i(e), o(), n.slice(0, t);
}
let jr = 0, An = !1, sn = null, an = null;
function In() {
  sn && sn(), sn = null, an && clearTimeout(an), an = null;
}
function Ao() {
  In(), An = !1, sn = Lc(() => {
    An = !0;
  }), an = setTimeout(In, 1e3);
}
let _t = null;
function pu(e) {
  const t = e.target;
  if (!t || typeof t.tagName != "string") return;
  if (_t && t === _t) {
    _t = null;
    return;
  }
  const n = typeof t.closest == "function" ? t.closest("label") : null;
  if (n) {
    const m = n.control ?? (n.htmlFor ? document.getElementById(n.htmlFor) : null);
    m && m !== t && (_t = m, setTimeout(() => {
      _t = null;
    }, 0));
  }
  const r = An;
  An = !1, In();
  const o = _u(t), i = hu(t), s = i === null && Zn(t), a = i === null && !s ? lu(t) : null, c = (a == null ? void 0 : a.el) ?? t, l = c.tagName.toLowerCase(), u = i ?? (a ? Ft(c).slice(0, 200) : ""), f = i !== null ? `${l}[${i}]` : a ? `${l}[${a.name}]` : gu(t, l), d = {
    id: Pe(),
    startMs: Date.now(),
    viewId: Ki(),
    viewPath: zc(),
    target: f,
    selector: o,
    text: u,
    x: e.clientX,
    y: e.clientY,
    deadCandidate: !yu(iu(t), au),
    selected: su(),
    errorCount: 0,
    resourceCount: 0,
    longTaskCount: 0,
    loadingTimeMs: 0,
    hadActivity: !1,
    userInput: !1,
    done: !1
  };
  se.push(d), $r.push(
    Fi(d.startMs, (m) => {
      d.hadActivity = m.hadActivity || r, d.userInput = jr >= d.startMs, d.loadingTimeMs = m.endMs !== null && !m.timedOut ? Math.max(0, m.endMs - d.startMs) : 0, d.done = !0;
    })
  ), J && J.selector === o ? J.clicks.push(d) : (bn(), J = { selector: o, clicks: [d], timer: null });
  const y = J;
  y.timer && clearTimeout(y.timer), y.timer = setTimeout(() => {
    J === y && bn();
  }, eu);
}
function mu(e) {
  if (typeof document > "u") return;
  Qi(), Tn = e;
  const t = (o) => pu(o), n = () => {
    jr = Date.now();
  }, r = uc(ou);
  document.addEventListener("pointerdown", Ao, { capture: !0, passive: !0 }), document.addEventListener("click", t, { capture: !0, passive: !0 }), document.addEventListener("input", n, { capture: !0, passive: !0 }), document.addEventListener("scroll", n, { capture: !0, passive: !0 }), on = () => {
    r(), In(), document.removeEventListener("pointerdown", Ao, {
      capture: !0
    }), document.removeEventListener("click", t, {
      capture: !0
    }), document.removeEventListener("input", n, { capture: !0 }), document.removeEventListener("scroll", n, { capture: !0 });
  };
}
function Qi() {
  J && bn();
  for (const e of $r.splice(0)) e();
  se.splice(0), on && on(), on = null, Tn = null;
}
const Io = "data-oodle-action-name";
function hu(e) {
  var t;
  try {
    const n = typeof e.closest == "function" ? e.closest(`[${Io}]`) : null, r = (t = n == null ? void 0 : n.getAttribute(Io)) == null ? void 0 : t.trim();
    return r ? r.slice(0, 200) : null;
  } catch {
    return null;
  }
}
function yu(e, t) {
  try {
    return typeof e.closest == "function" && e.closest(t) !== null;
  } catch {
    return !1;
  }
}
function gu(e, t) {
  if (e.id) return `${t}#${e.id}`;
  const n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
function _u(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
const Je = "[REDACTED]", vu = /token|secret|auth|cookie|passw|api-?key|access-?key|session|csrf|xsrf|client-?ip|real-?ip|connecting-ip|(^|-)forwarded(-for)?$/, wu = /passw|secret|token(?!s|count|limit|usage|type)|apikey|accesskey|privatekey|authorization|credential|cardnumber|creditcard|cardnum|^pan$|cvv|cvc|securitycode|^ssn$|socialsecurity|^ip$|ipaddr|clientip|remoteaddr|remoteip|^ipv[46]$/;
function Zi(e, t, n) {
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
function es(e) {
  return Zi(
    vu,
    (t) => t.toLowerCase(),
    e
  );
}
function ts(e) {
  return Zi(
    wu,
    (t) => t.toLowerCase().replace(/[-_.\s]/g, ""),
    e
  );
}
function Su(e) {
  let t = 0, n = !1;
  for (let r = e.length - 1; r >= 0; r--) {
    let o = e.charCodeAt(r) - 48;
    n && (o *= 2, o > 9 && (o -= 9)), t += o, n = !n;
  }
  return t % 10 === 0;
}
const Eu = /\b\d(?:[ -]?\d){12,18}\b/g;
function Tu(e) {
  return e.replace(Eu, (t) => {
    const n = t.replace(/[ -]/g, "");
    return n.length >= 13 && n.length <= 19 && n[0] >= "2" && n[0] <= "6" && Su(n) ? Je : t;
  });
}
function mr(e, t, n) {
  if (n > 32 || e === null || typeof e != "object")
    return;
  let r = !1;
  if (Array.isArray(e)) {
    const i = e.map((s) => {
      const a = mr(s, t, n + 1);
      return a === void 0 ? s : (r = !0, a);
    });
    return r ? i : void 0;
  }
  const o = /* @__PURE__ */ Object.create(null);
  for (const [i, s] of Object.entries(e)) {
    if (t(i) && s !== null && s !== "") {
      o[i] = Je, r = !0;
      continue;
    }
    const a = mr(s, t, n + 1);
    a === void 0 ? o[i] = s : (o[i] = a, r = !0);
  }
  return r ? o : void 0;
}
const Xn = /"((?:[^"\\]|\\.){1,200})"\s*:\s*/g, bu = /^("(?:[^"\\]|\\.)*"|[^\s,}\]{["]+)/;
function Au(e, t) {
  let n = "", r = 0;
  Xn.lastIndex = 0;
  let o;
  for (; (o = Xn.exec(e)) !== null; ) {
    if (!t(o[1])) continue;
    const i = o.index + o[0].length, s = e.slice(i);
    if (s[0] === "{" || s[0] === "[")
      return n + e.slice(r, i) + `"${Je}"`;
    const a = bu.exec(s);
    if (!a)
      return s[0] === '"' ? n + e.slice(r, i) + `"${Je}"` : n + e.slice(r);
    a[1] === '""' || a[1] === "null" || (n += e.slice(r, i) + `"${Je}"`, r = i + a[1].length, Xn.lastIndex = r);
  }
  return n + e.slice(r);
}
function Iu(e) {
  return /^[\w.%+[\]-]+=[^&]*(&[\w.%+[\]-]+=[^&]*)*$/.test(e);
}
function ku(e, t) {
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
      const s = mr(o, t, 0);
      s !== void 0 && (r = JSON.stringify(s));
    } else
      r = Au(e, t);
  } else if (Iu(n))
    try {
      const o = new URLSearchParams(e);
      let i = !1;
      if (o.forEach((s, a) => {
        t(a) && s && (i = !0);
      }), i) {
        const s = new URLSearchParams();
        o.forEach((a, c) => {
          s.append(c, t(c) && a ? Je : a);
        }), r = s.toString();
      }
    } catch {
    }
  return Tu(r);
}
const Cu = 50, ko = 200, Co = /* @__PURE__ */ new Map();
function Lu(e) {
  let t = Co.get(e);
  return t || (t = {
    tokens: ko,
    lastRefill: Date.now(),
    rate: Cu,
    burst: ko
  }, Co.set(e, t)), t;
}
function Mu(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function Ru(e) {
  const t = Lu(e);
  return Mu(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let hr = null, yr = null;
function mf(e, t) {
  hr = e, yr = t;
}
const Ou = "00000000000000000000000000000000";
function ns() {
  if (!hr || !yr) return null;
  try {
    const e = hr.getSpan(
      yr.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === Ou ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const Lo = 100, xu = 10, Mo = 5e3, Du = 3, Pu = 0;
function Nu(e, t = () => Date.now()) {
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
    return r.size < Mo && r.set(c, u), u;
  }
  function s(c) {
    const l = i(c), u = t();
    let f = n.get(l);
    if (!f) {
      if (n.size >= Mo)
        return !0;
      f = {
        tokens: Lo,
        lastRefillMs: u
      }, n.set(l, f);
    }
    const d = (u - f.lastRefillMs) / 1e3;
    return d > 0 && (f.tokens = Math.min(
      Lo,
      f.tokens + d * xu
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function a(c) {
    var m, w, k;
    if (c.type !== Du)
      return { event: c, dropped: 0 };
    const l = c.data;
    if (!l || l.source !== Pu || !l.attributes || l.attributes.length === 0)
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
const Ro = 1, Yn = 2;
function Uu(e) {
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
    if (r[a] !== Yn)
      for (i.push(a); i.length > 0; ) {
        const c = i[i.length - 1];
        if (r[c] === Yn) {
          i.pop();
          continue;
        }
        if (r[c] === Ro) {
          r[c] = Yn, o.push(e[c]), i.pop();
          continue;
        }
        r[c] = Ro;
        const l = s(c);
        for (let u = l.length - 1; u >= 0; u--)
          r[l[u]] === 0 && i.push(l[u]);
      }
  return o;
}
const Hu = 100, Fu = 16, rs = [
  "pointerdown",
  "pointerup",
  "mousedown",
  "mouseup",
  "touchstart",
  "touchend",
  "click",
  "dblclick",
  "contextmenu",
  // `focus`, not `focusin`: Chrome fires `focus` first, and
  // rrweb records that one. It does not bubble, but these
  // listeners run in the capture phase, which it does have.
  "focus",
  "input",
  "change",
  "submit"
];
let cn = !1, ge = [], Ge = null, Qe = null, kn = !1, Wn = !1, gr = null;
function hf(e) {
  return (t, n) => {
    if (!cn) {
      e(t, n);
      return;
    }
    if (t.length === 0) return;
    const r = ge[ge.length - 1];
    if (r && r.cb === e && r.observer === n)
      for (const o of t) r.records.push(o);
    else
      ge.push({ cb: e, records: t, observer: n });
    qu();
  };
}
function at() {
  if (is(), !Wn) {
    Wn = !0;
    try {
      for (; ge.length > 0; ) {
        const e = ge;
        ge = [];
        for (const t of e)
          try {
            t.cb(t.records, t.observer);
          } catch {
          }
      }
    } finally {
      Wn = !1;
    }
  }
}
function Bu() {
  is(), ge = [];
}
function os(e, t) {
  if (gr = e ? t ?? null : null, e !== cn) {
    if (!e) {
      at(), $u(), cn = !1;
      return;
    }
    cn = !0, Vu();
  }
}
function qu() {
  if (!(Ge !== null || Qe !== null)) {
    if (typeof requestIdleCallback == "function") {
      Ge = requestIdleCallback(
        () => {
          Ge = null, at();
        },
        { timeout: Hu }
      );
      return;
    }
    Qe = setTimeout(() => {
      Qe = null, at();
    }, Fu);
  }
}
function is() {
  Ge !== null && (typeof cancelIdleCallback == "function" && cancelIdleCallback(Ge), Ge = null), Qe !== null && (clearTimeout(Qe), Qe = null);
}
function ss(e) {
  if (ge.length !== 0) {
    if (gr) {
      const n = (typeof e.composedPath == "function" ? e.composedPath() : [])[0] ?? e.target;
      try {
        if (n && gr(n)) return;
      } catch {
      }
    }
    at();
  }
}
const as = {
  capture: !0,
  passive: !0
};
function Vu() {
  if (!kn && !(typeof window > "u")) {
    for (const e of rs)
      window.addEventListener(
        e,
        ss,
        as
      );
    kn = !0;
  }
}
function $u() {
  if (kn) {
    for (const e of rs)
      window.removeEventListener(
        e,
        ss,
        as
      );
    kn = !1;
  }
}
const Oo = "replay", ju = 200, zu = 6e4, Xu = 5e3, Yu = 8e6, cs = 2, Wu = 3, Ku = 4, Ju = 0, xo = 3e3, us = 5e3, Gu = 3, Qu = 3e4, Zu = 5e3, el = 16, tl = 100, nl = 4, rl = 30, Do = 32, Po = 250, ol = 36e4;
function il() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const sl = 3e5, al = 9e5, cl = 1e3;
let ae = null, j = null, vt = null, ct = [], ut = 0, Ae = "", ls = "", zr = !1, fs = 0, Kn = "", re = 0, Le = Date.now(), ue = !1, Yt = 0, Ie = null, xe = !1, Ze = null, ds = 0, te = [], W = 0, et = null, he = null, De = 0, Wt = 0, tt = null;
function Ee() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const Xr = Nu(
  () => (ae == null ? void 0 : ae.mirror) ?? null
);
let nt = null, ke = null, rt = !1, Kt = !1, Yr = 0, un = null, oe = null;
function ul() {
  et && (clearTimeout(et), et = null), he && (he(), he = null);
}
function _r(e, t) {
  ul();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    rl
  ) : null, r = e ? Ee() + (n ?? nl) : Number.POSITIVE_INFINITY;
  for (; W < te.length; ) {
    const o = Math.min(
      W + Do,
      te.length
    );
    for (; W < o; )
      vr(
        te[W++]
      );
    if (Ee() >= r) break;
  }
  if (W >= te.length) {
    te = [], W = 0;
    return;
  }
  W >= Do * 8 && (te = te.slice(W), W = 0), ps();
}
function Cn() {
  _r(!1);
}
function ps() {
  if (!et) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          he = null, _r(!0, t);
        },
        { timeout: tl }
      );
      he = () => cancelIdleCallback(e);
    }
    et = setTimeout(() => {
      et = null, he && (he(), he = null), _r(!0);
    }, el);
  }
}
function Jt(e = !1) {
  if (xe = !0, Ze) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - Le, r = Math.max(
      0,
      us - n
    ), o = Date.now() - ds, i = Math.max(
      0,
      Zu - o
    );
    t = Math.max(
      r,
      i
    );
  }
  Ze = setTimeout(() => {
    Ze = null, ll();
  }, t);
}
function ll() {
  if (!xe || !ae || !j || ue) return;
  Yt++;
  const e = De > Po ? 1 : Gu;
  if (Yt > e) {
    hl();
    return;
  }
  ds = Date.now(), re = 0, Le = Date.now();
  try {
    ms(), D("replay_rebases"), De > Po && D(
      "replay_expensive_snapshots"
    );
  } catch {
    ft(), lt();
  }
}
function ms() {
  if (!ae) return;
  at();
  const e = Ee();
  ae.takeFullSnapshot(!0), De = Ee() - e, yi(De);
}
function fl() {
  tt || Wt !== 0 && (Date.now() - Wt <= ol || (tt = setTimeout(() => {
    if (tt = null, !(!ae || !j) && !(ue || xe))
      try {
        ms();
      } catch {
        ft(), lt();
      }
  }, 0)));
}
function dl() {
  tt && (clearTimeout(tt), tt = null);
}
function No() {
  D("replay_events_dropped");
}
function hs() {
  if (Ae) return !1;
  Ae = le(), fs = Ta(), ls = Sa() ? "" : ui();
  const e = Kn !== "" && Kn !== Ae;
  return Kn = Ae, e;
}
function Zt() {
  if (ml(), ct.length === 0) return;
  if (xn(Oo)) {
    pl(), ys();
    return;
  }
  hs();
  const e = Ae, t = fs, n = ls, r = ct.splice(0), o = ut;
  ut = 0, Ae = "", zr = !0, Nr(
    Oo,
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
function pl() {
  ut <= Yu || (D(
    "replay_events_dropped",
    ct.length
  ), ct.length = 0, ut = 0, Jt());
}
let ot = null;
function ml() {
  ot && (clearTimeout(ot), ot = null);
}
function ys() {
  if (ot) return;
  const e = x().replayFlushIntervalMs ?? Xu;
  ot = setTimeout(() => {
    ot = null, Zt();
  }, e);
}
function vr(e) {
  !Ae && !le() || (hs() && e.type !== cs && Jt(!0), ct.push(e), ut += fn(e), ct.length >= ju || ut >= zu ? Zt() : ys());
}
function hl() {
  ue = !0, D("replay_overload_pauses"), ft(), Ie && clearTimeout(Ie), Ie = setTimeout(() => {
    Ie = null, ue = !1, Yt = 0, re = 0, Le = Date.now(), !rt && !Kt && oe && lt();
  }, Qu);
}
function yl(e) {
  if (ue) return;
  if (e.type === cs) {
    Cn(), xe = !1, Wt = Date.now(), re = 0, Le = Date.now(), vr(e);
    return;
  }
  if (e.type === Ku) {
    const o = e.data;
    typeof o.href == "string" && (o.href = Xs(o.href));
  }
  if (e.type !== Wu) {
    Cn(), vr(e);
    return;
  }
  if (xe) {
    No(), Jt();
    return;
  }
  fl();
  const t = e.data;
  t && t.source === Ju && Array.isArray(t.adds) && t.adds.length > 1 && (t.adds = Uu(t.adds));
  const n = Date.now();
  n - Le > us && (re <= xo && (Yt = 0), re = 0, Le = n);
  const r = Xr.throttle(e);
  if (r.dropped > 0 && D(
    "replay_attributes_throttled",
    r.dropped
  ), !!r.event) {
    if (re++, re > xo) {
      No(), Jt();
      return;
    }
    te.push(r.event), ps();
  }
}
async function lt() {
  if (oe && !ue && !j)
    return vt || (vt = gl().finally(
      () => {
        vt = null;
      }
    ), vt);
}
async function gl() {
  if (!oe) return;
  const { record: e } = await import("./rrweb-Q3S9jFj2.js");
  if (!oe || ue || j) return;
  ae = e, xe = !1, re = 0, Le = Date.now(), Xr.reset(), Wt = 0, os(
    x().replayDeferMutations !== !1,
    (r) => e.mirror.getId(r) !== -1
  );
  const t = typeof document < "u" && document.readyState !== "loading", n = Ee();
  j = e({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: il() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    /**
     * rrweb runs this between `lock()` and `unlock()`
     * of its mutation buffers with no `try/finally`, so
     * an exception escaping here leaves the buffer
     * locked and every later DOM mutation is silently
     * discarded. Recording looks alive (mouse and
     * scroll still arrive) while the replay stays
     * frozen on the last snapshot.
     */
    emit(r) {
      try {
        yl(r);
      } catch {
        D("replay_emit_errors");
      }
    },
    /**
     * Applies the same containment to rrweb's own
     * observers, which are otherwise wrapped only when
     * a handler is supplied.
     */
    errorHandler: () => !0,
    maskAllInputs: oe.maskAllInputs,
    maskInputOptions: oe.maskInputOptions,
    maskTextFn: oe.maskTextContent ? () => "•••" : void 0,
    blockSelector: ei,
    maskTextSelector: ti,
    recordCrossOriginIframes: !1
  }) ?? null, j && t && (De = Ee() - n, yi(De)), setTimeout(() => Zt(), 200);
}
function ft() {
  dl(), os(!1), j && (j(), j = null), Bu(), Ze && (clearTimeout(Ze), Ze = null), xe = !1, Cn(), Zt();
}
function _l() {
  const e = x(), t = e.replayIdlePauseMs ?? sl, n = e.replayIdleExpireMs ?? al;
  nt && clearTimeout(nt), ke && (clearTimeout(ke), ke = null), nt = setTimeout(() => {
    rt = !0, ft();
  }, t), ke = setTimeout(() => {
    Kt = !0, ft();
  }, n);
}
function ln() {
  Yr = Ee(), _l();
}
function vl() {
  if (Kt) {
    if (!fi()) return;
    Kt = !1, rt = !1, lt(), ln();
    return;
  }
  if (rt) {
    rt = !1, lt(), ln();
    return;
  }
  Ee() - Yr >= cl && ln();
}
function wl() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => vl(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  un = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function Sl() {
  un && (un(), un = null), nt && (clearTimeout(nt), nt = null), ke && (clearTimeout(ke), ke = null);
}
function El() {
  at(), Cn(), Zt();
}
async function Tl() {
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
  } : o = !1, oe = {
    privacyLevel: t,
    maskAllInputs: o,
    maskInputOptions: n,
    maskTextContent: r
  }, pc(() => {
    j && Jt();
  }), Oi(El), await lt(), wl(), ln();
}
function bl() {
  return j !== null && !ue;
}
function Al() {
  return zr;
}
function Il() {
  ft(), Sl(), Oi(null), Ie && (clearTimeout(Ie), Ie = null), rt = !1, Kt = !1, Yr = 0, ue = !1, zr = !1, Yt = 0, re = 0, De = 0, Wt = 0, te = [], W = 0, Xr.reset(), oe = null, ae = null;
}
let H = [], ne = null;
const kl = [
  "error",
  "action",
  "console",
  "resource"
];
function Cl(e) {
  return kl.includes(e) && (xn(e) || !Ru(e)) ? (D("events_rate_limited"), !0) : !1;
}
function gs(e, t) {
  const n = e.origin + ye(e.pathname);
  if (!Array.isArray(t) || t.length === 0 || !e.search)
    return n;
  const r = new URLSearchParams(e.search), o = new URLSearchParams();
  r.forEach((s, a) => {
    t.includes(a) && o.append(a, s);
  });
  const i = o.toString();
  return i ? n + "?" + i : n;
}
function Ll() {
  if (!ne) {
    const e = navigator.userAgent;
    ne = {
      device_type: sf(e),
      browser_name: af(e),
      browser_version: cf(e),
      os_name: uf(e),
      os_version: lf(e),
      user_agent: e,
      language: navigator.language
    };
  }
}
function Ml() {
  const e = navigator.connection;
  return typeof (e == null ? void 0 : e.effectiveType) == "string" ? e.effectiveType : "";
}
function _s(e) {
  Ll();
  const t = Ia(), n = Tc(), r = x(), o = e ?? le(), i = {
    event_id: Pe(),
    session_id: o,
    tab_id: ui(),
    view_id: Ki(),
    action_id: tu(),
    ...Js(
      hi(),
      Ca(),
      La()
    ),
    user_status: Ma(),
    service: r.service,
    env: r.env ?? "",
    version: r.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: gs(
      window.location,
      r.viewUrlQueryParams
    ),
    view_url_host: window.location.hostname,
    view_url_path: ye(window.location.pathname),
    referrer_url: Ys(document.referrer),
    device_type: ne.device_type,
    browser_name: ne.browser_name,
    browser_version: ne.browser_version,
    os_name: ne.os_name,
    os_version: ne.os_version,
    user_agent: Ks() ? ne.user_agent : "",
    language: ne.language,
    session_view_count: t.viewCount,
    session_error_count: t.errorCount,
    session_action_count: t.actionCount,
    replay_id: bl() && Al() ? o : ""
  };
  return Object.keys(n).length > 0 && (i.feature_flags = n), i;
}
function Rl(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const vs = "events", Ol = ["session_id", "event_type", "timestamp"];
let Uo = !1;
function ws(e) {
  const t = x().beforeSend;
  if (typeof t != "function") return e;
  const n = {};
  for (const r of Ol) n[r] = e[r];
  try {
    const r = t(e);
    if (r === null || r === !1) return null;
    if (Ls(r))
      throw new Error("it returned a promise; it must be synchronous");
    return { ...r && typeof r == "object" ? r : e, ...n };
  } catch (r) {
    return Uo || (Uo = !0, Er(
      `beforeSend failed. Events are dropped until it is fixed: ${String(r)}`
    )), null;
  }
}
function Ss(e) {
  Ea() && (e.session_is_new = 1);
}
function N(e) {
  if (!le() || !li() || xn("events")) return;
  Qc();
  const t = e(), n = t.event_type;
  if (Cl(n)) return;
  n === "resource" && Yl(t), mi(n), Xc(t), nu(t);
  const r = { ..._s(), ...t };
  Ss(r);
  const o = ws(r);
  o && Nr(vs, o);
}
function Wr(e) {
  Rl(
    () => N(e)
  );
}
function xl(e, t) {
  if (!li() || xn("events")) return;
  e.view_update_seq === 1 && mi("view");
  const n = {
    ..._s(t),
    ...e,
    action_id: "",
    connection_type: Ml(),
    screen_width: typeof screen < "u" ? screen.width : 0,
    screen_height: typeof screen < "u" ? screen.height : 0
  };
  e.view_update_seq === 1 && (n.view_is_new = 1), t === le() && Ss(n);
  const r = ws(n);
  r && _c(
    vs,
    "view:" + String(e.view_id),
    r,
    (o, i) => {
      const s = { ...i }, a = o;
      return a.view_is_new === 1 && (s.view_is_new = 1), a.session_is_new === 1 && (s.session_is_new = 1), s;
    }
  );
}
function Dl(e) {
  N(() => e);
}
function Pl() {
  Gc(
    xl,
    (e) => gs(e, x().viewUrlQueryParams)
  ), mu(Dl), Nl(), Bl(), $l(), Zl(), ef(), tf(), nf();
}
function Nl() {
  const e = (n) => {
    N(() => {
      var i, s, a;
      const r = n.message ?? "", o = typeof ((i = n.error) == null ? void 0 : i.message) == "string" ? n.error.message : r;
      return {
        event_type: "error",
        error_message: Vt(r),
        error_type: ((s = n.error) == null ? void 0 : s.name) ?? "Error",
        error_stack: Ar(
          ((a = n.error) == null ? void 0 : a.stack) ?? "",
          o
        ),
        error_source: "source",
        error_handling: "unhandled"
      };
    });
  }, t = (n) => Ts(n.reason);
  window.addEventListener("error", e), window.addEventListener(
    "unhandledrejection",
    t
  ), wr = !0, H.push(() => {
    window.removeEventListener("error", e), window.removeEventListener(
      "unhandledrejection",
      t
    ), wr = !1;
  });
}
let wr = !1;
const Ho = /* @__PURE__ */ new WeakSet(), Es = /* @__PURE__ */ new WeakSet();
function Ts(e) {
  e !== null && typeof e == "object" && (Ho.has(e) || (Ho.add(e), Es.has(e))) || N(() => {
    const t = (e == null ? void 0 : e.message) ?? String(e);
    return {
      event_type: "error",
      error_message: Vt(t),
      error_type: (e == null ? void 0 : e.name) ?? "UnhandledRejection",
      error_stack: Ar((e == null ? void 0 : e.stack) ?? "", t),
      error_source: "promise",
      error_handling: "unhandled"
    };
  });
}
let Fo = !1;
function yf() {
  const e = globalThis.Zone;
  if (Fo || !e || typeof e.__symbol__ != "function")
    return;
  Fo = !0;
  const t = e.__symbol__("unhandledPromiseRejectionHandler"), n = e[t];
  e[t] = function(r) {
    if (wr)
      try {
        Ts(
          r && typeof r == "object" && "rejection" in r && "promise" in r ? r.rejection : r
        );
      } catch {
      }
    if (typeof n == "function")
      return n.call(this, r);
  };
}
function bs(e) {
  return e instanceof Error || typeof e == "object" && e !== null && typeof e.message == "string" && typeof e.name == "string" && "stack" in e;
}
const it = 8192;
function Ul(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${it} bytes omitted]`;
}
function Hl(e) {
  if (typeof e == "string") return e;
  if (bs(e))
    return e.message ? `${e.name}: ${e.message}` : e.name;
  if (fn(
    e,
    it + 1
  ) > it)
    return Ul(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function Fl(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= it) break;
    t && (t += " "), t += Hl(n);
  }
  return t.length > it ? t.slice(0, it) + "… [truncated]" : t;
}
function Bl() {
  for (const e of Ws()) {
    const t = console[e], n = (...r) => {
      try {
        const o = Vt(Fl(r)), i = e === "error" ? r.find(bs) : void 0;
        i && typeof i == "object" && Es.add(i), N(() => {
          const s = {
            event_type: "console",
            console_level: e,
            console_message: o
          };
          return i && (s.error_type = i.name, s.error_message = Vt(i.message), s.error_stack = Ar(
            i.stack ?? "",
            i.message
          ), s.error_source = "console", s.error_handling = "handled"), s;
        });
      } catch {
      }
      t.apply(console, r);
    };
    n[Qo] = t, console[e] = n, H.push(() => {
      console[e] = t;
    });
  }
}
const Sr = "oodle_rum_tab_hidden";
function Bo(e) {
  try {
    e ? sessionStorage.setItem(Sr, "1") : sessionStorage.removeItem(Sr);
  } catch {
  }
}
function ql() {
  try {
    return sessionStorage.getItem(Sr) === "1";
  } catch {
    return !1;
  }
}
function Vl() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && ql() && (Bo(!1), N(() => ({
    event_type: "visibility",
    action_type: "tab_visible"
  })));
  let e = document.visibilityState === "hidden";
  const t = () => {
    const n = document.visibilityState === "hidden";
    n !== e && (e = n, Bo(n), N(() => ({
      event_type: "visibility",
      action_type: n ? "tab_hidden" : "tab_visible"
    })), n || ce());
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
function Kr(e) {
  const t = x().endpoint;
  return e.startsWith(t);
}
function $l() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || Kr(r.name))
          continue;
        const i = qt(r.name), s = As(r), a = jl(o, r.name);
        Wr(
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
function jl(e, t) {
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
function As(e) {
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
function Is(e, t) {
  try {
    const n = performance.getEntriesByName(
      ks(e),
      "resource"
    );
    for (let r = n.length - 1; r >= 0; r--) {
      const o = n[r];
      if (o.startTime >= t - 2)
        return {
          ...As(o),
          resource_size: o.transferSize ?? 0
        };
    }
  } catch {
  }
  return {};
}
function Ln(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function ks(e) {
  try {
    return new URL(e, location.href).href;
  } catch {
    return e;
  }
}
function Jn(e, t, n) {
  return n.some(
    (r) => typeof r == "string" ? e.startsWith(r) || t.startsWith(r) : r.test(e) || r.test(t)
  );
}
function Cs(e) {
  const t = ks(e), n = x();
  let r = !1;
  const o = n.allowedTracingUrls;
  o && o.length > 0 && (r = Jn(
    t,
    e,
    o
  ));
  let i = null;
  const s = n.forwardNetworkBodies;
  s && Jn(
    t,
    e,
    s.urls
  ) && (i = s);
  let a = !1;
  const c = n.forwardNetworkHeaders;
  return c && (a = Jn(
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
let qo = null, Vo = es(void 0);
function Bt(e) {
  const t = x().redactHeaders;
  return t !== qo && (qo = t, Vo = es(t)), Vo(e);
}
function zl(e) {
  const t = {};
  for (const n of Object.keys(e)) {
    const r = n.toLowerCase();
    Bt(r) || (t[r] = e[n]);
  }
  return t;
}
const $o = [
  "request_headers",
  "response_headers",
  "request_body",
  "response_body"
];
let jo = !1;
function Ls(e) {
  return !!e && (typeof e == "object" || typeof e == "function") && typeof e.then == "function";
}
function zo(e) {
  if (!(typeof e != "string" || !e))
    try {
      const t = JSON.parse(e);
      return t && typeof t == "object" ? t : void 0;
    } catch {
      return;
    }
}
function Xo(e) {
  if (!e || typeof e != "object") return "";
  const t = {};
  for (const [n, r] of Object.entries(e))
    r != null && (t[n.toLowerCase()] = String(r));
  return Object.keys(t).length > 0 ? JSON.stringify(t) : "";
}
let Yo = null, Wo = ts(void 0);
function Xl() {
  const e = x().redactBodyKeys;
  return e !== Yo && (Yo = e, Wo = ts(e)), Wo;
}
function Yl(e) {
  var a;
  if (!$o.some((c) => e[c])) return;
  for (const c of ["request_body", "response_body"])
    typeof e[c] == "string" && e[c] && (e[c] = ku(e[c], Xl()));
  const t = x().beforeSendNetwork;
  if (typeof t != "function") return;
  const n = {
    url: String(e.resource_url ?? ""),
    method: String(e.resource_method ?? ""),
    status: Number(e.resource_status ?? 0),
    requestHeaders: zo(e.request_headers),
    responseHeaders: zo(e.response_headers),
    requestBody: typeof e.request_body == "string" ? e.request_body : void 0,
    responseBody: typeof e.response_body == "string" ? e.response_body : void 0
  };
  let r;
  try {
    const c = t(n);
    if (Ls(c))
      throw new Error("it returned a promise; it must be synchronous");
    r = c === void 0 ? n : c;
  } catch (c) {
    jo || (jo = !0, Er(
      `beforeSendNetwork failed. Captured headers and bodies are dropped until it is fixed: ${String(c)}`
    )), r = null;
  }
  for (const c of $o) delete e[c];
  if (!r || typeof r != "object") return;
  const o = ((a = x().forwardNetworkBodies) == null ? void 0 : a.maxBodySize) ?? 65536, i = Xo(r.requestHeaders), s = Xo(r.responseHeaders);
  i && (e.request_headers = i), s && (e.response_headers = s), typeof r.requestBody == "string" && r.requestBody && (e.request_body = _e(r.requestBody, o)), typeof r.responseBody == "string" && r.responseBody && (e.response_body = _e(r.responseBody, o));
}
function Ms(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      Bt(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      Bt(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      Bt(r) || (t[r] = e[n]);
    }
  return t;
}
function Wl(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    Bt(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function _e(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function Kl(e, t) {
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
function Jl(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function Gl(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      Ms(
        e
      )
    );
  } catch {
    return "";
  }
}
function Ko(e) {
  try {
    return JSON.stringify(
      Ms(e)
    );
  } catch {
    return "";
  }
}
function Rs(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function Ql(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: _e(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: _e(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : Rs(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => _e(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function Os(e, t, n) {
  const r = function(o, i) {
    const s = Jl(o);
    if (Kr(s))
      return t.apply(e, [
        o,
        i
      ]);
    const a = Rs(o), c = ((i == null ? void 0 : i.method) ?? (a ? o.method : "GET")).toUpperCase(), l = performance.now(), u = Cs(s), f = Ui();
    let d = !1;
    const y = () => {
      d || (d = !0, Hi(f));
    };
    let m = "", w = "";
    if (n.injectTracing) {
      const b = ns();
      if (b)
        m = b.traceId, w = b.spanId;
      else if (u.trace) {
        m = Ln(16), w = Ln(8);
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
      const b = u.bodyCfg.maxBodySize ?? 65536, E = Ql(
        i,
        o,
        b
      );
      k = E.sync, C = E.asyncP;
    }
    let I = "";
    return u.captureHeaders && (i != null && i.headers ? I = Gl(
      i.headers
    ) : a && (I = Ko(
      o.headers
    ))), t.apply(e, [o, i]).then((b) => {
      y();
      const E = b.status, L = Math.round(
        performance.now() - l
      );
      let _ = "";
      u.captureHeaders && (_ = Ko(
        b.headers
      ));
      const v = (p) => {
        const T = {
          event_type: "resource",
          resource_url: qt(s),
          resource_method: c,
          resource_status: E,
          resource_duration_ms: L,
          resource_size: 0,
          resource_type: "fetch",
          ...Is(s, l)
        };
        return m && (T.trace_id = m, T.span_id = w), p && (T.request_body = p), I && (T.request_headers = I), _ && (T.response_headers = _), T;
      }, h = C || Promise.resolve(k);
      if (u.bodyCfg) {
        const p = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          h,
          Kl(
            b.clone(),
            p
          ).catch(() => "")
        ]).then(([T, Z]) => {
          N(() => {
            const R = v(T);
            return Z && (R.response_body = Z), R;
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
            resource_url: qt(s),
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
function xs(e, t, n) {
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
    if (Kr(a))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const c = Cs(a);
    let l = "", u = "";
    if (n.injectTracing) {
      const _ = ns();
      _ ? (l = _.traceId, u = _.spanId) : c.trace && (l = Ln(16), u = Ln(8), i.call(
        this,
        "traceparent",
        `00-${l}-${u}-01`
      ));
    }
    let f = "";
    if (c.bodyCfg && s) {
      const _ = c.bodyCfg.maxBodySize ?? 65536;
      typeof s == "string" ? f = _e(
        s,
        _
      ) : typeof URLSearchParams < "u" && s instanceof URLSearchParams && (f = _e(
        s.toString(),
        _
      ));
    }
    let d = "";
    if (c.captureHeaders)
      try {
        const _ = this.__oodleReqHeaders, v = _ ? zl(_) : {};
        Object.keys(v).length > 0 && (d = JSON.stringify(v));
      } catch {
      }
    const y = performance.now(), m = this, w = Ui(), k = l, C = u, I = f, b = c.bodyCfg, E = d, L = c.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        Hi(w);
        const _ = Math.round(
          performance.now() - y
        ), v = m.__oodleMethod ?? "GET";
        N(() => {
          const h = {
            event_type: "resource",
            resource_url: qt(a),
            resource_method: v,
            resource_status: m.status,
            resource_duration_ms: _,
            resource_size: 0,
            resource_type: "xhr",
            ...Is(a, y)
          };
          if (k && (h.trace_id = k, h.span_id = C), I && (h.request_body = I), b)
            try {
              const p = m.responseText ?? "";
              h.response_body = _e(
                p,
                b.maxBodySize ?? 65536
              );
            } catch {
            }
          if (E && (h.request_headers = E), L)
            try {
              const p = m.getAllResponseHeaders();
              p && (h.response_headers = JSON.stringify(
                Wl(p)
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
const Ds = {
  injectTracing: !0
}, Jo = {
  injectTracing: !1
};
function Zl() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = Os(
    window,
    window.fetch,
    Ds
  );
  H.push(e);
}
function ef() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = xs(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    Ds
  );
  H.push(e);
}
const Go = /* @__PURE__ */ new WeakSet();
function Gn(e) {
  if (Go.has(e)) return;
  Go.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (Os(
        n,
        n.fetch,
        Jo
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (xs(
        r.prototype,
        r.prototype.setRequestHeader,
        Jo
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), H.push(() => {
    e.removeEventListener("load", t);
  });
}
function tf() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach(Gn);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          if (r instanceof HTMLIFrameElement && Gn(r), r instanceof HTMLElement && r.childElementCount > 0) {
            const o = r.getElementsByTagName("iframe");
            for (let i = 0; i < o.length; i++)
              Gn(o[i]);
          }
    }
  );
  e.observe(document, {
    childList: !0,
    subtree: !0
  }), H.push(() => {
    e.disconnect();
  });
}
function nf() {
  if (!(typeof PerformanceObserver > "u") && !rf())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            Wr(() => ({
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
function rf() {
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
          Wr(() => ({
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
function of(e, t) {
  N(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function sf(e) {
  return /iPad|Tablet/i.test(e) || /Android/i.test(e) && !/Mobi/i.test(e) ? "tablet" : /Mobi|iPhone|iPod|Android/i.test(e) ? "mobile" : "desktop";
}
const Ps = [
  ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
  ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
  ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
  ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
  ["Safari", /Version\/([\d.]+).*Safari/]
];
function af(e) {
  for (const [t, n] of Ps) if (n.test(e)) return t;
  return e.includes("Safari") ? "Safari" : "Other";
}
function cf(e) {
  for (const [, t] of Ps) {
    const n = e.match(t);
    if (n) return n[1];
  }
  return "";
}
function uf(e) {
  return /iPhone|iPad|iPod/.test(e) ? "iOS" : e.includes("Android") ? "Android" : e.includes("CrOS") ? "Chrome OS" : e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : "Other";
}
function lf(e) {
  let t = e.match(/OS (\d+[_.]\d+(?:[_.]\d+)?) like Mac OS X/);
  return t ? t[1].replace(/_/g, ".") : (t = e.match(/Android ([\d.]+)/), t || (t = e.match(/Windows NT ([\d.]+)/), t) ? t[1] : (t = e.match(/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/), t ? t[1].replace(/_/g, ".") : ""));
}
function ff() {
  Qi(), Ji();
  for (const e of H)
    e();
  H = [];
}
let Te = !1;
const gf = {
  init(e) {
    Te || sa(e) && (Oa(e.tags), da(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), Te = !0, ci(), Vl(), yo(), Aa(), Ha(), wc(() => {
      yo();
    }), e.sessionReplay !== !1 && fi() && Tl(), Pl(), e.openTelemetry && import("./tracing-DC5Vbv_s.js").then(
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
    xa(e);
  },
  identify(e) {
    ka(e);
  },
  trackEvent(e, t) {
    Te && of(e, t);
  },
  addFeatureFlag(e, t) {
    Ec(e, t);
  },
  getSessionId() {
    return Te ? le() : "";
  },
  getUserId() {
    return hi();
  },
  flush() {
    Te && ce();
  },
  stop() {
    Te && (Il(), ff(), Fa(), pi(), ce(!0), bc(), Sc(), Te = !1);
  }
};
export {
  gf as O,
  pf as a,
  yf as c,
  df as r,
  mf as s,
  hf as w
};
