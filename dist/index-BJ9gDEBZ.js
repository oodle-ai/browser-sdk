const Fo = "__oodleOriginal";
function cr(e) {
  try {
    const t = console.warn;
    (t[Fo] ?? t).call(
      console,
      "[@oodle-ai/rum] " + e
    );
  } catch {
  }
}
const Xt = [
  "error",
  "warn"
];
function gs() {
  return {
    patterns: [],
    maskFn: null,
    referrer: "path",
    consoleLevels: Xt,
    messages: "full",
    actionText: "full",
    userAgent: "full",
    queryStrings: "events",
    userInfo: "full",
    keepParams: []
  };
}
let A = gs();
const Ln = "/:redacted", _s = 256, ct = /* @__PURE__ */ new Map();
let Fn = !1;
const Ae = cr;
function Re(e, t, n, r, o) {
  return t === void 0 ? r : typeof t == "string" && n.includes(t) ? t : (Ae(
    `${e} must be one of ${n.map((i) => `'${i}'`).join(", ")}. Using '${o}'.`
  ), o);
}
function vs(e) {
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
function ws(e) {
  if (e === void 0) return [];
  if (!Array.isArray(e))
    return Ae(
      "urlPathPatterns must be an array of path patterns such as '/projects/:id'. It is ignored."
    ), [];
  const t = [];
  for (const n of e) {
    const r = vs(n);
    r ? t.push(r) : Ae(
      `urlPathPatterns: ${JSON.stringify(n)} is not a valid pattern. Patterns start with '/', use ':name' for one segment and may end in '/*'. It is ignored.`
    );
  }
  return t;
}
function Es(e) {
  if (e === void 0) return Xt;
  if (!Array.isArray(e))
    return Ae(
      "consoleLevels must be an array such as ['error']. Console capture is off."
    ), [];
  const t = Xt.filter(
    (n) => e.includes(n)
  );
  return e.some(
    (n) => !Xt.includes(n)
  ) && Ae(
    "consoleLevels accepts only 'error' and 'warn'. Other values are ignored."
  ), t;
}
function Ss(e) {
  ct.clear(), Fn = !1;
  const t = e.maskUrlPath;
  t !== void 0 && typeof t != "function" && Ae("maskUrlPath must be a function. It is ignored."), A = {
    patterns: ws(e.urlPathPatterns),
    maskFn: typeof t == "function" ? t : null,
    referrer: Re(
      "referrerUrl",
      e.referrerUrl,
      ["path", "origin", "none"],
      "path",
      "none"
    ),
    consoleLevels: Es(
      e.consoleLevels
    ),
    messages: Re(
      "errorMessages",
      e.errorMessages,
      ["full", "scrub", "none"],
      "full",
      "none"
    ),
    // Text the replay masks must not reappear in click events.
    actionText: Re(
      "actionText",
      e.actionText,
      ["full", "mask"],
      e.privacyLevel === "mask" ? "mask" : "full",
      "mask"
    ),
    userAgent: Re(
      "userAgent",
      e.userAgent,
      ["full", "none"],
      "full",
      "none"
    ),
    queryStrings: Re(
      "stripQueryStrings",
      e.stripQueryStrings,
      ["events", "all"],
      "events",
      "all"
    ),
    userInfo: Re(
      "userInfo",
      e.userInfo,
      ["full", "id", "none"],
      "full",
      "none"
    ),
    keepParams: Array.isArray(e.viewUrlQueryParams) ? e.viewUrlQueryParams : []
  };
}
function ur() {
  return A.patterns.length > 0 || A.maskFn !== null;
}
function Ts(e) {
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
function bs(e) {
  let t = A.patterns.length > 0 ? Ts(e) : e;
  if (A.maskFn)
    try {
      const n = A.maskFn(t);
      t = typeof n == "string" ? n : Ln;
    } catch (n) {
      Fn || (Fn = !0, Ae(
        `maskUrlPath threw. Paths are sent as '${Ln}' until it is fixed: ${String(n)}`
      )), t = Ln;
    }
  return t;
}
function de(e) {
  if (!ur()) return e;
  const t = ct.get(e);
  if (t !== void 0) return t;
  const n = bs(e);
  return ct.size >= _s && ct.clear(), ct.set(e, n), n;
}
function As(e) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(e);
}
function Lt(e, t) {
  if (As(e)) {
    let n;
    try {
      n = new URL(e);
    } catch {
      return e;
    }
    return n.protocol !== "http:" && n.protocol !== "https:" ? n.protocol === "data:" ? "data:" : n.origin + n.pathname : n.origin + de(n.pathname);
  }
  try {
    const n = t ?? (typeof location < "u" ? location.href : "http://localhost/"), r = new URL(e, n);
    return r.origin === new URL(n).origin ? de(r.pathname) : r.origin + de(r.pathname);
  } catch {
    const n = e.search(/[?#]/);
    return n >= 0 ? e.slice(0, n) : e;
  }
}
function Bo(e) {
  return !ur() || typeof e != "string" ? e : lr(e, (t) => t.search + t.hash);
}
function Rl() {
  return ur() || A.queryStrings === "all";
}
function Is(e) {
  return A.queryStrings !== "all" ? Bo(e) : typeof e != "string" ? e : lr(e, (t) => {
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
function Ol(e) {
  return A.queryStrings !== "all" ? Bo(e) : typeof e != "string" ? e : lr(e, () => "");
}
function lr(e, t) {
  let n;
  try {
    n = new URL(e);
  } catch {
    return e;
  }
  return n.protocol !== "http:" && n.protocol !== "https:" ? e : n.origin + de(n.pathname) + t(n);
}
let jr = null, zr = "", Vr = null;
function ks(e) {
  if (e === jr && Vr === A)
    return zr;
  let t = "";
  if (e && A.referrer !== "none")
    try {
      const n = new URL(e);
      t = A.referrer === "origin" ? n.origin : n.origin + de(n.pathname);
    } catch {
      t = A.referrer === "origin" ? "" : e;
    }
  return jr = e, zr = t, Vr = A, t;
}
function Cs() {
  return A.consoleLevels;
}
function Ls() {
  return A.userAgent === "full";
}
function Ms(e, t, n) {
  switch (A.userInfo) {
    case "full":
      return { user_id: e, user_name: t, user_email: n };
    case "id":
      return { user_id: e, user_name: "", user_email: "" };
    default:
      return { user_id: "", user_name: "", user_email: "" };
  }
}
const Rs = [
  [/(^|[^\w])'(?:[^'\\\n]|\\.){0,500}'/g, "$1'?'"],
  [/(^|[^\w])"(?:[^"\\\n]|\\.){0,500}"/g, '$1"?"'],
  [/(^|[^\w])`(?:[^`\\\n]|\\.){0,500}`/g, "$1`?`"]
], Os = /\bhttps?:\/\/[^\s'"`<>()\]]+/g, xs = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, Ps = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, Ds = /\b(?=[0-9a-fA-F]*\d)(?=[0-9a-fA-F]*[a-fA-F])[0-9a-fA-F]{16,}\b/g, Ns = /\d{4,}/g, $r = 8192;
function Us(e) {
  if (!e) return e;
  let t = e.length > $r ? e.slice(0, $r) + "… [truncated]" : e;
  t = t.replace(Os, (n) => Lt(n)), t.includes("@") && (t = t.replace(xs, "<email>"));
  for (const [n, r] of Rs)
    t = t.replace(n, r);
  return t = t.replace(Ps, "<id>"), t = t.replace(Ds, "<id>"), t = t.replace(Ns, "<n>"), t;
}
const Hs = /^\s+at |^[^\s@]*@\S+:\d+(?::\d+)?$/m;
function Mt(e) {
  switch (A.messages) {
    case "full":
      return e;
    case "scrub":
      return Us(e);
    default:
      return "";
  }
}
function fr(e, t) {
  if (A.messages === "full" || !e || !t) return e;
  const n = Hs.exec(e), r = n ? n.index : e.length, o = e.indexOf(t);
  if (o < 0 || o + t.length > r)
    return e;
  const i = Mt(t);
  let s = e.slice(0, o) + i;
  return i || (s = s.replace(/:\s*$/, "")), s + e.slice(o + t.length);
}
const qo = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', jo = '[data-oodle-privacy="mask"],.oodle-privacy-mask', zo = qo + "," + jo + ",.rr-block,.rr-mask";
function Bn(e) {
  if (A.actionText === "mask") return !0;
  try {
    return typeof e.closest == "function" && e.closest(zo) !== null;
  } catch {
    return !0;
  }
}
let qn = null;
function Fs(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function Bs(e) {
  if (!Fs(e.endpoint))
    return console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    ), !1;
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  );
  const t = qs(
    e.viewUrlQueryParams
  );
  return Ss({ ...e, viewUrlQueryParams: t }), qn = { ...e, viewUrlQueryParams: t }, !0;
}
function qs(e) {
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
  if (!qn)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return qn;
}
const dr = "__oodle_session_v2", pr = "__oodle_tab", Xr = "__oodle_session", Vo = 900 * 1e3, mr = 14400 * 1e3, hr = 1e3;
function et() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
let lt = null, j = null;
function yr(e, t) {
  try {
    const n = e == null ? void 0 : e.getItem(t);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function gr(e, t, n) {
  try {
    e == null || e.setItem(t, JSON.stringify(n));
  } catch {
  }
}
function $o() {
  try {
    return typeof localStorage < "u" ? localStorage : void 0;
  } catch {
    return;
  }
}
function Rt() {
  try {
    return typeof sessionStorage < "u" ? sessionStorage : void 0;
  } catch {
    return;
  }
}
const js = 1e3;
let Ie = 0;
function te() {
  const e = Date.now();
  if (lt && e - Ie < js) return lt;
  Ie = e;
  const t = yr($o(), dr);
  return t && typeof t.id == "string" && t.id ? zs({
    id: t.id,
    createdAt: t.createdAt ?? Date.now(),
    lastActivity: t.lastActivity ?? Date.now(),
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: t.started ?? !0
  }) : lt;
}
const xe = /* @__PURE__ */ new Map();
function Xo(e) {
  const t = xe.get(e.id);
  if (xe.set(e.id, {
    lastActivity: Math.max((t == null ? void 0 : t.lastActivity) ?? 0, e.lastActivity),
    createdAt: e.createdAt
  }), xe.size > 20) {
    const n = xe.keys().next().value;
    n !== void 0 && xe.delete(n);
  }
}
function zs(e) {
  return e && (lt = e, Xo(e)), e;
}
function qt(e) {
  lt = e, Xo(e), Ie = Date.now(), gr($o(), dr, e);
}
function _r() {
  if (j) return j;
  const e = yr(Rt(), pr);
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
    return j = t, t;
  }
  return j;
}
function Vs(e) {
  j = e, gr(Rt(), pr, e);
}
let De = null;
function $s(e) {
  j = e, !De && (De = setTimeout(() => {
    De = null, j && gr(Rt(), pr, j);
  }, 1e3));
}
function jt(e) {
  De && (clearTimeout(De), De = null), Vs(e);
}
let Yo = 100, Wo = 100;
function Xs(e, t) {
  Yo = Math.max(0, Math.min(100, e)), Wo = Math.max(0, Math.min(100, t));
}
function Yr(e) {
  return Math.random() * 100 < e;
}
function Ot(e, t) {
  return !!e && t - e.lastActivity <= Vo && t - e.createdAt <= mr;
}
function Ys(e) {
  var r;
  const t = yr(Rt(), Xr);
  if (!t || typeof t.id != "string") return !1;
  const n = {
    id: t.id,
    createdAt: t.createdAt ?? e,
    lastActivity: t.lastActivity ?? e,
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: !0
  };
  if (e - n.lastActivity > 1800 * 1e3 || e - n.createdAt > mr)
    return !1;
  qt(n), jt({
    tabId: et(),
    sessionId: n.id,
    viewCount: t.viewCount ?? 0,
    errorCount: t.errorCount ?? 0,
    actionCount: t.actionCount ?? 0,
    replaySegmentSeq: t.replaySegmentSeq ?? 0,
    legacyReplay: !0
  });
  try {
    (r = Rt()) == null || r.removeItem(Xr);
  } catch {
  }
  return !0;
}
function Ws(e) {
  const t = Yr(Yo), n = {
    id: et(),
    createdAt: e,
    lastActivity: e,
    sampled: t,
    replaySampled: t && Yr(Wo),
    started: !1
  };
  return qt(n), n;
}
const jn = /* @__PURE__ */ new Set();
function Ks(e) {
  return jn.add(e), () => jn.delete(e);
}
function zt() {
  let e = _r();
  return e || (e = {
    tabId: et(),
    sessionId: "",
    viewCount: 0,
    errorCount: 0,
    actionCount: 0,
    replaySegmentSeq: 0,
    legacyReplay: !1
  }, jt(e)), e;
}
function vr(e) {
  const t = zt();
  if (t.sessionId === e) return;
  const n = t.sessionId;
  if (t.sessionId = e, t.viewCount = 0, t.errorCount = 0, t.actionCount = 0, t.replaySegmentSeq = 0, t.legacyReplay = !1, jt(t), n)
    for (const r of jn)
      try {
        r(n, e);
      } catch {
      }
}
let ft = 0;
function Wr() {
  const e = Date.now();
  Ie = 0;
  const t = te();
  Ot(t, e) && (e - ft >= hr && (t.lastActivity = Math.max(t.lastActivity, e), qt(t), ft = e), vr(t.id));
}
const Js = 6e4;
function Ko() {
  const e = Date.now();
  let t = te();
  Ot(t, e) || (Ie = 0, t = te()), Ot(t, e) ? e - ft >= hr && (t.lastActivity = Math.max(t.lastActivity, e), qt(t), ft = e) : (Ys(e) ? t = te() : t = Ws(e), ft = e), t && vr(t.id);
}
function se() {
  var r;
  const e = Date.now(), t = te();
  if (!Ot(t, e)) return "";
  const n = (r = _r()) == null ? void 0 : r.sessionId;
  return n && n !== t.id ? "" : (vr(t.id), t.id);
}
function Gs(e) {
  Ie = 0;
  const t = te(), n = t && t.id === e ? t : xe.get(e);
  if (!n) return t && t.id !== e ? Date.now() : null;
  const r = Math.min(
    n.lastActivity + Vo,
    n.createdAt + mr
  );
  return t && t.id !== e ? Math.min(r, Date.now()) : Date.now() > r ? r : null;
}
function Jo() {
  return zt().tabId;
}
function Qs() {
  return zt().legacyReplay;
}
function Zs() {
  const e = Date.now(), t = te();
  return !Ot(t, e) || t.started ? !1 : (t.started = !0, qt(t), !0);
}
function ea() {
  if (!se()) return 0;
  const e = zt(), t = e.replaySegmentSeq;
  return e.replaySegmentSeq = t + 1, jt(e), t;
}
function Go() {
  const e = te();
  return (e == null ? void 0 : e.sampled) ?? !0;
}
function Qo() {
  const e = te();
  return (e == null ? void 0 : e.replaySampled) ?? !0;
}
let dt = null, pt = null, Yt = null, mt = null;
const Zo = ["click", "keydown", "touchstart", "scroll"];
function ta() {
  if (typeof document > "u") return;
  ei();
  let e = 0;
  dt = () => {
    const t = Date.now();
    t - e < hr || (e = t, Ko());
  };
  for (const t of Zo)
    document.addEventListener(t, dt, {
      capture: !0,
      passive: !0
    });
  mt = (t) => {
    t.key === dr && (Ie = 0);
  }, window.addEventListener("storage", mt), pt = () => {
    document.visibilityState === "visible" ? Wr() : j && jt(j);
  }, document.addEventListener("visibilitychange", pt), Yt = setInterval(() => {
    document.visibilityState === "visible" && Wr();
  }, Js);
}
function ei() {
  if (!(typeof document > "u")) {
    if (dt) {
      for (const e of Zo)
        document.removeEventListener(e, dt, {
          capture: !0
        });
      dt = null;
    }
    pt && (document.removeEventListener("visibilitychange", pt), pt = null), Yt && (clearInterval(Yt), Yt = null), mt && (window.removeEventListener("storage", mt), mt = null);
  }
}
function ti(e) {
  if (!se()) return;
  const t = zt();
  e === "view" || e === "page_load" ? t.viewCount++ : e === "error" ? t.errorCount++ : e === "action" && t.actionCount++, $s(t);
}
function na() {
  const e = j ?? _r();
  return {
    viewCount: (e == null ? void 0 : e.viewCount) ?? 0,
    errorCount: (e == null ? void 0 : e.errorCount) ?? 0,
    actionCount: (e == null ? void 0 : e.actionCount) ?? 0
  };
}
let z = null;
function ra(e) {
  z = e;
}
function ni() {
  return (z == null ? void 0 : z.id) ?? "";
}
function oa() {
  return (z == null ? void 0 : z.name) ?? "";
}
function ia() {
  return (z == null ? void 0 : z.email) ?? "";
}
function sa() {
  return z ? "identified" : "anonymous";
}
const aa = 5e5;
function nn(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > aa) return n;
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
let xt = {};
function ca(e) {
  e && (xt = { ...e, ...xt });
}
function ua(e) {
  xt = { ...xt, ...e };
}
function la() {
  return xt;
}
const fa = 6e4, da = "sdk_telemetry", Ne = {
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
  Ne[e] += t;
}
function pa() {
  for (const e in Ne)
    if (Ne[e] > 0)
      return !0;
  return !1;
}
function zn() {
  if (!pa()) return;
  const e = { ...Ne };
  for (const t in Ne)
    Ne[t] = 0;
  br(da, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let ht = null, yt = null;
function ma() {
  ht || (ht = setInterval(
    zn,
    fa
  ), typeof document < "u" && (yt = () => {
    document.visibilityState === "hidden" && zn();
  }, document.addEventListener(
    "visibilitychange",
    yt
  )));
}
function ha() {
  ht && (clearInterval(ht), ht = null), yt && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    yt
  ), yt = null), zn();
}
var U = Uint8Array, D = Uint16Array, wr = Int32Array, Er = new U([
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
]), Sr = new U([
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
]), Kr = new U([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), ri = function(e, t) {
  for (var n = new D(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new wr(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, oi = ri(Er, 2), ya = oi.b, Vn = oi.r;
ya[28] = 258, Vn[258] = 28;
var ga = ri(Sr, 0), Jr = ga.r, $n = new D(32768);
for (var E = 0; E < 32768; ++E) {
  var ce = (E & 43690) >> 1 | (E & 21845) << 1;
  ce = (ce & 52428) >> 2 | (ce & 13107) << 2, ce = (ce & 61680) >> 4 | (ce & 3855) << 4, $n[E] = ((ce & 65280) >> 8 | (ce & 255) << 8) >> 1;
}
var gt = (function(e, t, n) {
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
          a[$n[f] >> c] = l;
  } else
    for (a = new D(r), o = 0; o < r; ++o)
      e[o] && (a[o] = $n[s[e[o] - 1]++] >> 15 - e[o]);
  return a;
}), ke = new U(288);
for (var E = 0; E < 144; ++E)
  ke[E] = 8;
for (var E = 144; E < 256; ++E)
  ke[E] = 9;
for (var E = 256; E < 280; ++E)
  ke[E] = 7;
for (var E = 280; E < 288; ++E)
  ke[E] = 8;
var rn = new U(32);
for (var E = 0; E < 32; ++E)
  rn[E] = 5;
var _a = /* @__PURE__ */ gt(ke, 9, 0), va = /* @__PURE__ */ gt(rn, 5, 0), ii = function(e) {
  return (e + 7) / 8 | 0;
}, si = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new U(e.subarray(t, n));
}, J = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, rt = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, Mn = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: ci, l: 0 };
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
  var y = new D(d + 1), m = Xn(n[u - 1], y, 0);
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
      var S = i[r].s;
      y[S] == t && (--y[S], ++w);
    }
    m = t;
  }
  return { t: new U(y), l: m };
}, Xn = function(e, t, n) {
  return e.s == -1 ? Math.max(Xn(e.l, t, n + 1), Xn(e.r, t, n + 1)) : t[e.s] = n;
}, Gr = function(e) {
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
}, ot = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, ai = function(e, t, n) {
  var r = n.length, o = ii(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, Qr = function(e, t, n, r, o, i, s, a, c, l, u) {
  J(t, u++, n), ++o[256];
  for (var f = Mn(o, 15), d = f.t, y = f.l, m = Mn(i, 15), w = m.t, k = m.l, C = Gr(d), I = C.c, b = C.n, S = Gr(w), L = S.c, _ = S.n, v = new D(19), h = 0; h < I.length; ++h)
    ++v[I[h] & 31];
  for (var h = 0; h < L.length; ++h)
    ++v[L[h] & 31];
  for (var p = Mn(v, 7), T = p.t, K = p.l, R = 19; R > 4 && !T[Kr[R - 1]]; --R)
    ;
  var Ce = l + 5 << 3, F = ot(o, ke) + ot(i, rn) + s, B = ot(o, d) + ot(i, w) + s + 14 + 3 * R + ot(v, T) + 2 * v[16] + 3 * v[17] + 7 * v[18];
  if (c >= 0 && Ce <= F && Ce <= B)
    return ai(t, u, e.subarray(c, c + l));
  var V, M, q, ae;
  if (J(t, u, 1 + (B < F)), u += 2, B < F) {
    V = gt(d, y, 0), M = d, q = gt(w, k, 0), ae = w;
    var An = gt(T, K, 0);
    J(t, u, b - 257), J(t, u + 5, _ - 1), J(t, u + 10, R - 4), u += 14;
    for (var h = 0; h < R; ++h)
      J(t, u + 3 * h, T[Kr[h]]);
    u += 3 * R;
    for (var $ = [I, L], nt = 0; nt < 2; ++nt)
      for (var Le = $[nt], h = 0; h < Le.length; ++h) {
        var X = Le[h] & 31;
        J(t, u, An[X]), u += T[X], X > 15 && (J(t, u, Le[h] >> 5 & 127), u += Le[h] >> 12);
      }
  } else
    V = _a, M = ke, q = va, ae = rn;
  for (var h = 0; h < a; ++h) {
    var O = r[h];
    if (O > 255) {
      var X = O >> 18 & 31;
      rt(t, u, V[X + 257]), u += M[X + 257], X > 7 && (J(t, u, O >> 23 & 31), u += Er[X]);
      var Me = O & 31;
      rt(t, u, q[Me]), u += ae[Me], Me > 3 && (rt(t, u, O >> 5 & 8191), u += Sr[Me]);
    } else
      rt(t, u, V[O]), u += M[O];
  }
  return rt(t, u, V[256]), u + M[256];
}, wa = /* @__PURE__ */ new wr([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), ci = /* @__PURE__ */ new U(0), Ea = function(e, t, n, r, o, i) {
  var s = i.z || e.length, a = new U(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), c = a.subarray(r, a.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (c[0] = i.r >> 3);
    for (var f = wa[t - 1], d = f >> 13, y = f & 8191, m = (1 << n) - 1, w = i.p || new D(32768), k = i.h || new D(m + 1), C = Math.ceil(n / 3), I = 2 * C, b = function(Cn) {
      return (e[Cn] ^ e[Cn + 1] << C ^ e[Cn + 2] << I) & m;
    }, S = new wr(25e3), L = new D(288), _ = new D(32), v = 0, h = 0, p = i.i || 0, T = 0, K = i.w || 0, R = 0; p + 2 < s; ++p) {
      var Ce = b(p), F = p & 32767, B = k[Ce];
      if (w[F] = B, k[Ce] = F, K <= p) {
        var V = s - p;
        if ((v > 7e3 || T > 24576) && (V > 423 || !l)) {
          u = Qr(e, c, 0, S, L, _, h, T, R, p - R, u), T = v = h = 0, R = p;
          for (var M = 0; M < 286; ++M)
            L[M] = 0;
          for (var M = 0; M < 30; ++M)
            _[M] = 0;
        }
        var q = 2, ae = 0, An = y, $ = F - B & 32767;
        if (V > 2 && Ce == b(p - $))
          for (var nt = Math.min(d, V) - 1, Le = Math.min(32767, p), X = Math.min(258, V); $ <= Le && --An && F != B; ) {
            if (e[p + q] == e[p + q - $]) {
              for (var O = 0; O < X && e[p + O] == e[p + O - $]; ++O)
                ;
              if (O > q) {
                if (q = O, ae = $, O > nt)
                  break;
                for (var Me = Math.min($, O - 2), Hr = 0, M = 0; M < Me; ++M) {
                  var In = p - $ + M & 32767, ys = w[In], Fr = In - ys & 32767;
                  Fr > Hr && (Hr = Fr, B = In);
                }
              }
            }
            F = B, B = w[F], $ += F - B & 32767;
          }
        if (ae) {
          S[T++] = 268435456 | Vn[q] << 18 | Jr[ae];
          var Br = Vn[q] & 31, qr = Jr[ae] & 31;
          h += Er[Br] + Sr[qr], ++L[257 + Br], ++_[qr], K = p + q, ++v;
        } else
          S[T++] = e[p], ++L[e[p]];
      }
    }
    for (p = Math.max(p, K); p < s; ++p)
      S[T++] = e[p], ++L[e[p]];
    u = Qr(e, c, l, S, L, _, h, T, R, p - R, u), l || (i.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, i.h = k, i.p = w, i.i = p, i.w = K);
  } else {
    for (var p = i.w || 0; p < s + l; p += 65535) {
      var kn = p + 65535;
      kn >= s && (c[u / 8 | 0] = l, kn = s), u = ai(c, u + 1, e.subarray(p, kn));
    }
    i.i = s;
  }
  return si(a, 0, r + ii(u) + o);
}, Sa = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), Ta = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = Sa[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, ba = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new U(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return Ea(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, Yn = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, Aa = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && Yn(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, Ia = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function ka(e, t) {
  t || (t = {});
  var n = Ta(), r = e.length;
  n.p(e);
  var o = ba(e, t, Ia(t), 8), i = o.length;
  return Aa(o, t), Yn(o, i - 8, n.d()), Yn(o, i - 4, r), o;
}
var Zr = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), Ca = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), La = 0;
try {
  Ca.decode(ci, { stream: !0 }), La = 1;
} catch {
}
function Ma(e, t) {
  var n;
  if (Zr)
    return Zr.encode(e);
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
  return si(o, 0, i);
}
function Wt(e) {
  try {
    return ka(Ma(e));
  } catch {
    return null;
  }
}
const Ra = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function Oa(e) {
  if (!Ra)
    return Wt(e);
  try {
    const t = new Response(e).body;
    if (!t) return Wt(e);
    const n = t.pipeThrough(
      new CompressionStream("gzip")
    ), r = await new Response(
      n
    ).arrayBuffer();
    return new Uint8Array(r);
  } catch {
    return Wt(e);
  }
}
const xa = "0.7.0", eo = 5e3, ui = 50, li = 5e5, to = 256e3, on = "replay", fi = 8e4, di = 32, Pa = 2e7, Da = 5, Na = 1e3, Ua = 6e4, Ha = 500, sn = 63e3;
let Ue = 0, He = 0, ue = [], _t = 0, Rn = null;
const an = /* @__PURE__ */ new Map();
let Fe = null, Be = null, Wn = null;
const Kn = /* @__PURE__ */ new Set();
function Fa(e) {
  return Kn.add(e), () => Kn.delete(e);
}
let vt = !1;
function Ba() {
  try {
    return x().flushIntervalMs ?? eo;
  } catch {
    return eo;
  }
}
function pi(e) {
  let t = an.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, an.set(e, t)), t;
}
function mi(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (P("compression_failures"), { body: t, encoding: "" });
}
async function hi(e) {
  return mi(await Oa(e), e);
}
function qa(e) {
  return mi(Wt(e), e);
}
const ja = 64e3;
function Jn(e, t, n) {
  if (e === on)
    return {
      bytes: n ?? nn(
        t,
        ja
      ),
      oversized: !1
    };
  const r = nn(
    t,
    to + 1
  );
  return {
    bytes: r,
    oversized: r > to
  };
}
let Gn = null;
function za(e) {
  Gn = e;
}
function En(e) {
  P("transport_drops"), e === on && Gn && Gn();
}
const Va = "/v1/rum/ingest";
function $a(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: xa
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
function Xa(e, t, n) {
  const r = x();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const c = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, l = new Blob([n], {
      type: "application/json"
    });
    if (l.size < sn && navigator.sendBeacon(c, l))
      return;
  }
  const { body: o, encoding: i } = qa(n), s = { ...t };
  i ? s["Content-Encoding"] = i : delete s["Content-Encoding"];
  const a = o instanceof Blob ? o.size : n.length;
  fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: a < sn,
    credentials: "omit"
  }).catch(() => {
    P("exit_send_failures");
  });
}
function On(e, t, n, r) {
  const o = n.length;
  if (_t + o > Pa) {
    P("retry_drops"), r && En(r);
    return;
  }
  const i = { ...t };
  delete i["Content-Encoding"], ue.push({
    url: e,
    headers: i,
    body: n,
    bytes: o,
    attempts: 0,
    batchKey: r
  }), _t += o, yi();
}
function yi() {
  if (Rn || ue.length === 0)
    return;
  const e = ue[0], t = Math.min(
    Na * Math.pow(2, e.attempts),
    Ua
  );
  Rn = setTimeout(() => {
    Rn = null, gi();
  }, t);
}
async function gi() {
  for (; ue.length > 0 && Ue < fi && He < di; ) {
    const e = ue.shift();
    if (_t -= e.bytes, e.attempts++, e.attempts > Da) {
      P("retry_drops"), e.batchKey && En(e.batchKey);
      continue;
    }
    const t = e.bytes;
    Ue += t, He++;
    try {
      const { body: n, encoding: r } = await hi(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < sn,
        credentials: "omit"
      });
      if (vi(i), i.status === 429 || i.status >= 500) {
        ue.unshift(e), _t += e.bytes;
        break;
      }
    } catch {
      ue.unshift(e), _t += e.bytes;
      break;
    } finally {
      Ue -= t, He--;
    }
  }
  ue.length > 0 && yi();
}
function Ya() {
  Fe && (clearTimeout(Fe), Fe = null), Be && (clearTimeout(Be), Be = null);
}
function Tr() {
  const e = Ba();
  Fe && clearTimeout(Fe), Fe = setTimeout(
    () => ie(),
    e
  ), Be || (Be = setTimeout(
    () => {
      Be = null, ie();
    },
    e + Ha
  ));
}
function br(e, t, n) {
  const { bytes: r, oversized: o } = Jn(
    e,
    t,
    n
  );
  if (o) {
    console.warn(
      `[@oodle-ai/rum] Dropping oversized ${e} payload (${r} bytes)`
    ), En(e);
    return;
  }
  const i = pi(e);
  if (i.items.push(t), i.bytesEstimate += r, !vt && (i.items.length >= ui || i.bytesEstimate >= li)) {
    ie();
    return;
  }
  Tr();
}
function Wa(e, t, n, r) {
  const { bytes: o, oversized: i } = Jn(
    e,
    n
  );
  if (i) {
    En(e);
    return;
  }
  const s = pi(e), a = s.upsertMap.get(t);
  if (a !== void 0) {
    const c = Jn(
      e,
      s.items[a]
    ).bytes;
    s.items[a] = r ? r(s.items[a], n) : n, s.bytesEstimate += o - c;
  } else {
    const c = s.items.length;
    s.items.push(n), s.upsertMap.set(t, c), s.bytesEstimate += o;
  }
  if (!vt && (s.items.length >= ui || s.bytesEstimate >= li)) {
    ie();
    return;
  }
  Tr();
}
function _i(e) {
  Wn = e;
}
const no = ["events", "replay"];
function ie(e = !1) {
  const t = x();
  if (e && Wn && !vt) {
    vt = !0;
    try {
      Wn();
    } catch {
    } finally {
      vt = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    Tr();
    return;
  }
  Ya();
  const n = la(), r = [], o = Array.from(
    an.keys()
  ).sort((l, u) => {
    const f = no.indexOf(l), d = no.indexOf(u), y = f >= 0 ? f : 999, m = d >= 0 ? d : 999;
    return y - m;
  });
  for (const l of o) {
    const u = an.get(l);
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
  const i = $a(r), s = `${t.endpoint}${Va}`, a = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, c = r.some(
    (l) => l.type === on
  );
  if (e) {
    Xa(s, a, i);
    return;
  }
  Ka(
    s,
    a,
    i,
    c ? on : void 0
  );
}
async function Ka(e, t, n, r) {
  const o = n.length;
  if (Ue >= fi || He >= di) {
    On(e, t, n, r);
    return;
  }
  Ue += o, He++;
  try {
    const { body: i, encoding: s } = await hi(n), a = { ...t };
    s && (a["Content-Encoding"] = s);
    const c = await fetch(e, {
      method: "POST",
      headers: a,
      body: i,
      keepalive: o < sn,
      credentials: "omit"
    });
    vi(c), (c.status === 429 || c.status >= 500) && On(e, t, n, r);
  } catch {
    P("send_failures"), On(e, t, n, r);
  } finally {
    Ue -= o, He--, gi();
  }
}
const Qn = /* @__PURE__ */ new Map();
function vi(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && Qn.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function Sn(e) {
  const t = Qn.get(e);
  return t ? Date.now() >= t ? (Qn.delete(e), !1) : !0 : !1;
}
let wt = null, Et = null, St = null, Zn = null;
function Ja(e) {
  Zn = e;
}
const wi = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function ro() {
  typeof document > "u" || (wt = () => {
    document.visibilityState === "hidden" && ie(!0);
  }, Et = () => {
    for (const e of Kn)
      try {
        e();
      } catch {
      }
    ie(!0);
  }, St = (e) => {
    e.persisted && Zn && Zn();
  }, document.addEventListener(
    "visibilitychange",
    wt
  ), window.addEventListener(
    wi,
    Et
  ), window.addEventListener(
    "pageshow",
    St
  ));
}
function Ga() {
  wt && (document.removeEventListener(
    "visibilitychange",
    wt
  ), wt = null), Et && (window.removeEventListener(
    wi,
    Et
  ), Et = null), St && (window.removeEventListener(
    "pageshow",
    St
  ), St = null);
}
const cn = /* @__PURE__ */ new Map();
function Qa(e, t) {
  cn.set(e, t);
}
function Za() {
  return cn.size === 0 ? {} : Object.fromEntries(cn);
}
function ec() {
  cn.clear();
}
const tc = 100, nc = 1e4, Se = /* @__PURE__ */ new Set();
let Ei = 0, qe = null;
function Ar(e) {
  for (const t of Se)
    try {
      t(e);
    } catch {
    }
}
const rc = { kind: "dom" }, oc = () => Ar(rc);
function Si() {
  qe || typeof MutationObserver > "u" || typeof document > "u" || !document.documentElement || (qe = new MutationObserver(oc), qe.observe(document.documentElement, {
    childList: !0,
    subtree: !0,
    attributes: !0,
    characterData: !0
  }));
}
function er() {
  Se.size > 0 || !qe || (qe.disconnect(), qe = null);
}
function Ti() {
  const e = Ei++;
  return Ar({ kind: "start", index: e }), e;
}
function bi(e) {
  Ar({ kind: "end", index: e });
}
function ic(e) {
  const t = (n) => {
    n.kind !== "end" && e();
  };
  return Se.add(t), Si(), () => {
    Se.delete(t), er();
  };
}
function Ai(e, t, n = nc) {
  let r = null;
  const o = Ei;
  let i = 0, s = null, a = null, c = !1;
  const l = (d) => {
    c || (c = !0, s && clearTimeout(s), a && clearTimeout(a), Se.delete(f), er(), t(d));
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
    }, tc);
  };
  function f(d) {
    if (d.kind !== "dom") {
      if (d.index < o) return;
      i = Math.max(0, i + (d.kind === "start" ? 1 : -1));
    }
    r = Date.now(), u();
  }
  return Se.add(f), Si(), u(), Number.isFinite(n) && (a = setTimeout(() => {
    l({
      endMs: r,
      hadActivity: r !== null,
      timedOut: !0
    });
  }, n)), () => {
    c = !0, s && clearTimeout(s), a && clearTimeout(a), Se.delete(f), er();
  };
}
var le, Tt, Ii, un, ki = -1, Vt = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (ki = t.timeStamp, e(t));
  }), !0);
}, Ir = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, Tn = function() {
  var e = Ir();
  return e && e.activationStart || 0;
}, me = function(e, t) {
  var n = Ir(), r = "navigate";
  return ki >= 0 ? r = "back-forward-cache" : n && (document.prerendering || Tn() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, kr = function(e, t, n) {
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
    t.value >= 0 && (s || r) && ((i = t.value - (o || 0)) || o === void 0) && (o = t.value, t.delta = i, t.rating = (function(a, c) {
      return a > c[1] ? "poor" : a > c[0] ? "needs-improvement" : "good";
    })(t.value, n), e(t));
  };
}, Ci = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, Cr = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, Lr = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Pe = -1, oo = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, ln = function(e) {
  document.visibilityState === "hidden" && Pe > -1 && (Pe = e.type === "visibilitychange" ? e.timeStamp : 0, sc());
}, io = function() {
  addEventListener("visibilitychange", ln, !0), addEventListener("prerenderingchange", ln, !0);
}, sc = function() {
  removeEventListener("visibilitychange", ln, !0), removeEventListener("prerenderingchange", ln, !0);
}, Mr = function() {
  return Pe < 0 && (Pe = oo(), io(), Vt((function() {
    setTimeout((function() {
      Pe = oo(), io();
    }), 0);
  }))), { get firstHiddenTime() {
    return Pe;
  } };
}, bn = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, so = [1800, 3e3], ac = function(e, t) {
  t = t || {}, bn((function() {
    var n, r = Mr(), o = me("FCP"), i = kr("paint", (function(s) {
      s.forEach((function(a) {
        a.name === "first-contentful-paint" && (i.disconnect(), a.startTime < r.firstHiddenTime && (o.value = Math.max(a.startTime - Tn(), 0), o.entries.push(a), n(!0)));
      }));
    }));
    i && (n = he(e, o, so, t.reportAllChanges), Vt((function(s) {
      o = me("FCP"), n = he(e, o, so, t.reportAllChanges), Ci((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, cc = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = Lr(e), document.visibilityState === "hidden" ? e() : (n = t(e), Cr(e)), n;
}, ao = [2500, 4e3], xn = {}, uc = function(e, t) {
  t = t || {}, bn((function() {
    var n, r = Mr(), o = me("LCP"), i = function(c) {
      t.reportAllChanges || (c = c.slice(-1)), c.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - Tn(), 0), o.entries = [l], n());
      }));
    }, s = kr("largest-contentful-paint", i);
    if (s) {
      n = he(e, o, ao, t.reportAllChanges);
      var a = Lr((function() {
        xn[o.id] || (i(s.takeRecords()), s.disconnect(), xn[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(c) {
        addEventListener(c, (function() {
          return cc(a);
        }), { once: !0, capture: !0 });
      })), Cr(a), Vt((function(c) {
        o = me("LCP"), n = he(e, o, ao, t.reportAllChanges), Ci((function() {
          o.value = performance.now() - c.timeStamp, xn[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, co = [800, 1800], lc = function e(t) {
  document.prerendering ? bn((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, fc = function(e, t) {
  t = t || {};
  var n = me("TTFB"), r = he(e, n, co, t.reportAllChanges);
  lc((function() {
    var o = Ir();
    o && (n.value = Math.max(o.responseStart - Tn(), 0), n.entries = [o], r(!0), Vt((function() {
      n = me("TTFB", 0), (r = he(e, n, co, t.reportAllChanges))(!0);
    })));
  }));
}, ut = { passive: !0, capture: !0 }, dc = /* @__PURE__ */ new Date(), uo = function(e, t) {
  le || (le = t, Tt = e, Ii = /* @__PURE__ */ new Date(), Mi(removeEventListener), Li());
}, Li = function() {
  if (Tt >= 0 && Tt < Ii - dc) {
    var e = { entryType: "first-input", name: le.type, target: le.target, cancelable: le.cancelable, startTime: le.timeStamp, processingStart: le.timeStamp + Tt };
    un.forEach((function(t) {
      t(e);
    })), un = [];
  }
}, pc = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        uo(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, ut), removeEventListener("pointercancel", i, ut);
      };
      addEventListener("pointerup", o, ut), addEventListener("pointercancel", i, ut);
    })(t, e) : uo(t, e);
  }
}, Mi = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, pc, ut);
  }));
}, lo = [100, 300], mc = function(e, t) {
  t = t || {}, bn((function() {
    var n, r = Mr(), o = me("FID"), i = function(c) {
      c.startTime < r.firstHiddenTime && (o.value = c.processingStart - c.startTime, o.entries.push(c), n(!0));
    }, s = function(c) {
      c.forEach(i);
    }, a = kr("first-input", s);
    n = he(e, o, lo, t.reportAllChanges), a && (Cr(Lr((function() {
      s(a.takeRecords()), a.disconnect();
    }))), Vt((function() {
      var c;
      o = me("FID"), n = he(e, o, lo, t.reportAllChanges), un = [], Tt = -1, le = null, Mi(addEventListener), c = i, un.push(c), Li();
    })));
  }));
};
const hc = 3e3;
let Pt = null, Ri = (e) => e.href, g = null, ne = null, fn = [];
function dn() {
  return typeof performance < "u" ? performance.now() : 0;
}
function yc() {
  return typeof performance < "u" && performance.timeOrigin ? performance.timeOrigin : Date.now();
}
function bt(e) {
  const t = e.hash ?? "", n = t.startsWith("#/") ? t.split("?")[0] : "";
  return e.pathname + n;
}
function Oi(e, t, n) {
  return {
    id: et(),
    sessionId: se(),
    loadingType: e,
    startEpoch: t,
    startPerf: n,
    url: Ri(window.location),
    urlPath: de(window.location.pathname),
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
function gc(e) {
  const t = Array.from(e.interactions.values()).sort((r, o) => o - r);
  if (t.length === 0) return 0;
  const n = Math.min(t.length - 1, Math.floor(t.length / 50));
  return t[n];
}
function _c(e) {
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
    inp_ms: gc(e),
    cls: Math.round(e.cls.value * 1e4) / 1e4,
    dns_ms: n.dns_ms ?? 0,
    connect_ms: n.connect_ms ?? 0,
    tls_ms: n.tls_ms ?? 0,
    download_ms: n.download_ms ?? 0,
    dom_interactive_ms: n.dom_interactive_ms ?? 0,
    dom_complete_ms: n.dom_complete_ms ?? 0
  };
}
function tt(e) {
  if (!(!Pt || !e.sessionId)) {
    if (e.endEpoch !== void 0) {
      if (e.expirySent) return;
      e.expirySent = !0;
    } else if (e.active) {
      const t = Gs(e.sessionId);
      t !== null && (e.active = !1, e.endEpoch = Math.max(e.startEpoch, t), e.expirySent = !0, e.cancelIdle && e.cancelIdle(), g === e && (g = null));
    }
    e.seq++, Pt(_c(e), e.sessionId);
  }
}
function xi() {
  ne && (clearTimeout(ne), ne = null), g && tt(g);
}
function Dt() {
  ne || !g || (ne = setTimeout(() => {
    ne = null, g && tt(g);
  }, hc));
}
const vc = 5 * 6e4, At = /* @__PURE__ */ new Map();
function wc(e) {
  const t = Date.now();
  for (const [n, r] of At) r.until <= t && At.delete(n);
  At.set(e.id, { v: e, until: t + vc });
}
function pn() {
  const e = g;
  e && (wc(e), e.cancelIdle && e.cancelIdle(), ne && (clearTimeout(ne), ne = null), e.active = !1, tt(e), g = null);
}
function Pi(e) {
  typeof document < "u" && document.visibilityState === "hidden" && (e.hiddenAt = e.startEpoch), e.cancelIdle = Ai(
    e.startEpoch,
    (t) => {
      if (e.cancelIdle = null, g !== e) return;
      let n = t.endMs !== null && t.hadActivity ? t.endMs - e.startEpoch : 0;
      e.loadingType === "initial_load" && (n = Math.max(n, e.vitals.load_event_ms ?? 0)), !(e.hiddenAt !== void 0 && e.startEpoch + n > e.hiddenAt) && (e.loadingTimeMs = Math.max(0, n), xi());
    },
    1 / 0
  );
}
function mn(e, t, n) {
  pn();
  const r = Oi(e, t, n);
  r.sessionId && (g = r, tt(r), Pi(r));
}
function Di() {
  return (g == null ? void 0 : g.id) ?? "";
}
function Ec() {
  return (g == null ? void 0 : g.urlPath) ?? "";
}
function Sc(e) {
  const t = typeof e.view_id == "string" ? e.view_id : "";
  let n = g, r = !1;
  if (t && (n == null ? void 0 : n.id) !== t) {
    const o = At.get(t);
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
    r ? tt(n) : Dt();
  }
}
function Tc(e) {
  var r, o;
  const t = (o = (r = performance.getEntriesByType) == null ? void 0 : r.call(performance, "navigation")) == null ? void 0 : o[0];
  if (!t || t.loadEventEnd <= 0) return !1;
  const n = Math.round;
  return e.vitals.load_event_ms = n(t.loadEventEnd - t.startTime), e.vitals.dns_ms = n(t.domainLookupEnd - t.domainLookupStart), e.vitals.connect_ms = n(t.connectEnd - t.connectStart), e.vitals.tls_ms = n(
    t.secureConnectionStart > 0 ? t.connectEnd - t.secureConnectionStart : 0
  ), e.vitals.download_ms = n(t.responseEnd - t.responseStart), e.vitals.dom_interactive_ms = n(t.domInteractive - t.startTime), e.vitals.dom_complete_ms = n(t.domComplete - t.startTime), !0;
}
function Pn(e, t, n = {}) {
  if (!(typeof PerformanceObserver > "u"))
    try {
      const r = new PerformanceObserver((o) => t(o.getEntries()));
      r.observe({ type: e, buffered: !0, ...n }), fn.push(() => r.disconnect());
    } catch {
    }
}
function bc(e, t, n) {
  const r = e.cls;
  r.windowValue > 0 && n - r.last < 1e3 && n - r.windowStart < 5e3 ? r.windowValue += t : (r.windowValue = t, r.windowStart = n), r.last = n, r.windowValue > r.value && (r.value = r.windowValue);
}
function Ac() {
  Pn("layout-shift", (t) => {
    const n = g;
    if (!n) return;
    let r = !1;
    for (const o of t)
      o.hadRecentInput || o.startTime < n.startPerf || (bc(n, o.value, o.startTime), r = !0);
    r && Dt();
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
    r && Dt();
  };
  Pn("event", e, { durationThreshold: 40 }), Pn("first-input", e);
}
function Ic(e) {
  const t = (o, i) => {
    g !== e && !e.active || (e.vitals[o] = Math.round(i * 100) / 100, g === e && Dt());
  };
  try {
    uc((o) => t("lcp", o.value)), ac((o) => t("fcp", o.value)), fc((o) => t("ttfb", o.value)), mc((o) => t("fid", o.value));
  } catch {
  }
  let n = 0;
  const r = () => {
    Tc(e) ? g === e && Dt() : ++n < 50 && setTimeout(r, 200);
  };
  document.readyState === "complete" ? setTimeout(r, 0) : window.addEventListener("load", () => setTimeout(r, 0), { once: !0 });
}
let je = "", Kt = !1;
function Oe() {
  const e = bt(window.location);
  e !== je && (je = e, mn("route_change", Date.now(), dn()));
}
function kc(e, t) {
  if (typeof window > "u") return;
  Ni(), Kt = !1, Pt = e, Ri = t, je = bt(window.location);
  const n = yc(), r = Oi("initial_load", n, 0);
  r.sessionId && (g = r, tt(r), Pi(r), Ic(r)), Ac();
  const o = history.pushState, i = history.replaceState;
  history.pushState = function(...u) {
    o.apply(this, u), Oe();
  }, history.replaceState = function(...u) {
    i.apply(this, u), Oe();
  }, window.addEventListener("popstate", Oe), window.addEventListener("hashchange", Oe);
  const s = () => {
    document.visibilityState === "hidden" && (g && g.hiddenAt === void 0 && (g.hiddenAt = Date.now()), xi());
  };
  document.addEventListener("visibilitychange", s);
  const a = () => {
    pn(), Kt = !0;
  };
  window.addEventListener("pagehide", a);
  const c = (u) => {
    u.persisted && (Kt = !1, je = bt(window.location), mn("bf_cache", Date.now(), dn()));
  };
  window.addEventListener("pageshow", c);
  const l = Ks((u) => {
    g && g.sessionId === u && pn(), je = bt(window.location), mn("route_change", Date.now(), dn());
  });
  fn.push(() => {
    history.pushState = o, history.replaceState = i, window.removeEventListener("popstate", Oe), window.removeEventListener("hashchange", Oe), document.removeEventListener("visibilitychange", s), window.removeEventListener("pagehide", a), window.removeEventListener("pageshow", c), l();
  });
}
function Cc() {
  g || Kt || !Pt || typeof window > "u" || (je = bt(window.location), mn("route_change", Date.now(), dn()));
}
function Ni() {
  pn(), At.clear();
  for (const e of fn) e();
  fn = [], Pt = null, g = null;
}
const Lc = 3, Mc = 1e3;
let hn = null, W = null;
const re = [], Rr = [];
let Jt = null;
function Rc() {
  for (let e = re.length - 1; e >= 0; e--)
    if (!re[e].done) return re[e].id;
  return "";
}
function Oc(e) {
  for (const t of re)
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
function Ui(e) {
  return e.deadCandidate && !e.selected && !e.hadActivity && !e.userInput;
}
function xc(e, t, n = !1) {
  const r = [];
  return t && r.push("rage_click"), (t ? n : Ui(e)) && r.push("dead_click"), e.errorCount > 0 && r.push("error_click"), r;
}
function fo(e, t, n = 1, r = !1) {
  if (!hn) return;
  const o = xc(e, t, r), i = t ? "rage_click" : o.includes("dead_click") ? "dead_click" : o.includes("error_click") ? "error_click" : "click", s = {
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
  hn(s);
}
function yn() {
  const e = W;
  if (W = null, !e) return;
  e.timer && clearTimeout(e.timer);
  const t = () => e.clicks.every((o) => o.done), n = () => {
    const o = e.clicks.some((i) => i.userInput || i.selected);
    if (e.clicks.length >= Lc && !o) {
      const i = e.clicks[0], s = e.clicks.some(Ui);
      for (const a of e.clicks.slice(1))
        i.errorCount += a.errorCount, i.resourceCount += a.resourceCount, i.longTaskCount += a.longTaskCount, i.hadActivity = i.hadActivity || a.hadActivity;
      fo(i, !0, e.clicks.length, s);
    } else
      for (const i of e.clicks) fo(i, !1);
    for (const i of e.clicks) {
      const s = re.indexOf(i);
      s >= 0 && re.splice(s, 1);
    }
  };
  if (t()) {
    n();
    return;
  }
  const r = { flush: n, poll: null };
  It.add(r), r.poll = setInterval(() => {
    t() && (clearInterval(r.poll), It.delete(r), n());
  }, 50), Rr.push(() => {
    clearInterval(r.poll), It.delete(r);
  });
}
const It = /* @__PURE__ */ new Set();
function Pc() {
  const e = Date.now();
  for (const t of re)
    t.done || (t.hadActivity = !0, t.userInput = Or >= t.startMs, t.loadingTimeMs = Math.max(0, e - t.startMs), t.done = !0);
  W && yn();
  for (const t of [...It])
    t.poll && clearInterval(t.poll), It.delete(t), t.flush();
}
function Dc(e) {
  if (e.tagName === "LABEL") {
    const t = e.getAttribute("for"), n = t ? document.getElementById(t) : null;
    if (n) return n;
  }
  return e;
}
function Nc() {
  var e;
  try {
    const t = (e = window.getSelection) == null ? void 0 : e.call(window);
    return !!t && !t.isCollapsed && t.toString().length > 0;
  } catch {
    return !1;
  }
}
const Uc = (
  // Text fields take the caret without changing the page; checkboxes,
  // radios and buttons must change something, so they stay candidates.
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="range"]),textarea,select,[contenteditable],[contenteditable] *,canvas,a[href],a[href] *'
), Hc = 10;
function _e(e) {
  const t = e.split(`
`).map((n) => n.trim()).find(Boolean) ?? "";
  return t.length > 80 ? t.slice(0, 79) + "…" : t;
}
function it(e, t) {
  return (e.getAttribute(t) ?? "").trim();
}
function Fc(e) {
  const t = e.tagName === "INPUT" || e.tagName === "SELECT" || e.tagName === "TEXTAREA" ? e.labels : null;
  if (t && t.length > 0) {
    const i = t[0];
    if (!Bn(i)) return _e(kt(i));
  }
  if (e.tagName === "INPUT") {
    const i = it(e, "type");
    if (i === "button" || i === "submit" || i === "reset")
      return _e(e.value ?? "");
  }
  const n = it(e, "role");
  if (["BUTTON", "LABEL", "A"].includes(e.tagName) || n === "button" || n === "link") {
    const i = _e(kt(e));
    if (i) return i;
  }
  const r = it(e, "aria-label");
  if (r) return _e(r);
  const o = it(e, "aria-labelledby");
  if (o) {
    const i = o.split(/\s+/).map((s) => document.getElementById(s)).filter((s) => !!s && !Bn(s)).map((s) => kt(s)).join(" ");
    if (i.trim()) return _e(i);
  }
  for (const i of ["alt", "title", "placeholder"]) {
    const s = it(e, i);
    if (s) return _e(s);
  }
  return "";
}
function Bc(e) {
  for (const t of [Fc, (n) => _e(kt(n))]) {
    let n = e;
    for (let r = 0; n && r <= Hc && n.tagName !== "BODY" && n.tagName !== "HTML"; r++) {
      const o = t(n);
      if (o) return { el: n, name: o };
      n = n.parentElement;
    }
  }
  return null;
}
const qc = zo + ",[contenteditable],input,textarea,select,script,style,template,noscript,[hidden]", jc = /* @__PURE__ */ new Set([
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
function kt(e, t = 200) {
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
          c = a.matches(qc);
        } catch {
          c = !0;
        }
        if (c) {
          o();
          continue;
        }
        const l = jc.has(a.tagName);
        if (l && o(), !i(a)) return !1;
        l && o();
      }
    }
    return !0;
  };
  return i(e), o(), n.slice(0, t);
}
let Or = 0, gn = !1, Gt = null, Qt = null;
function _n() {
  Gt && Gt(), Gt = null, Qt && clearTimeout(Qt), Qt = null;
}
function po() {
  _n(), gn = !1, Gt = ic(() => {
    gn = !0;
  }), Qt = setTimeout(_n, 1e3);
}
let st = null;
function zc(e) {
  const t = e.target;
  if (!t || typeof t.tagName != "string") return;
  if (st && t === st) {
    st = null;
    return;
  }
  const n = typeof t.closest == "function" ? t.closest("label") : null;
  if (n) {
    const m = n.control ?? (n.htmlFor ? document.getElementById(n.htmlFor) : null);
    m && m !== t && (st = m, setTimeout(() => {
      st = null;
    }, 0));
  }
  const r = gn;
  gn = !1, _n();
  const o = Wc(t), i = $c(t), s = i === null && Bn(t), a = i === null && !s ? Bc(t) : null, c = (a == null ? void 0 : a.el) ?? t, l = c.tagName.toLowerCase(), u = i ?? (a ? kt(c).slice(0, 200) : ""), f = i !== null ? `${l}[${i}]` : a ? `${l}[${a.name}]` : Yc(t, l), d = {
    id: et(),
    startMs: Date.now(),
    viewId: Di(),
    viewPath: Ec(),
    target: f,
    selector: o,
    text: u,
    x: e.clientX,
    y: e.clientY,
    deadCandidate: !Xc(Dc(t), Uc),
    selected: Nc(),
    errorCount: 0,
    resourceCount: 0,
    longTaskCount: 0,
    loadingTimeMs: 0,
    hadActivity: !1,
    userInput: !1,
    done: !1
  };
  re.push(d), Rr.push(
    Ai(d.startMs, (m) => {
      d.hadActivity = m.hadActivity || r, d.userInput = Or >= d.startMs, d.loadingTimeMs = m.endMs !== null && !m.timedOut ? Math.max(0, m.endMs - d.startMs) : 0, d.done = !0;
    })
  ), W && W.selector === o ? W.clicks.push(d) : (yn(), W = { selector: o, clicks: [d], timer: null });
  const y = W;
  y.timer && clearTimeout(y.timer), y.timer = setTimeout(() => {
    W === y && yn();
  }, Mc);
}
function Vc(e) {
  if (typeof document > "u") return;
  Hi(), hn = e;
  const t = (o) => zc(o), n = () => {
    Or = Date.now();
  }, r = Fa(Pc);
  document.addEventListener("pointerdown", po, { capture: !0, passive: !0 }), document.addEventListener("click", t, { capture: !0, passive: !0 }), document.addEventListener("input", n, { capture: !0, passive: !0 }), document.addEventListener("scroll", n, { capture: !0, passive: !0 }), Jt = () => {
    r(), _n(), document.removeEventListener("pointerdown", po, {
      capture: !0
    }), document.removeEventListener("click", t, {
      capture: !0
    }), document.removeEventListener("input", n, { capture: !0 }), document.removeEventListener("scroll", n, { capture: !0 });
  };
}
function Hi() {
  W && yn();
  for (const e of Rr.splice(0)) e();
  re.splice(0), Jt && Jt(), Jt = null, hn = null;
}
const mo = "data-oodle-action-name";
function $c(e) {
  var t;
  try {
    const n = typeof e.closest == "function" ? e.closest(`[${mo}]`) : null, r = (t = n == null ? void 0 : n.getAttribute(mo)) == null ? void 0 : t.trim();
    return r ? r.slice(0, 200) : null;
  } catch {
    return null;
  }
}
function Xc(e, t) {
  try {
    return typeof e.closest == "function" && e.closest(t) !== null;
  } catch {
    return !1;
  }
}
function Yc(e, t) {
  if (e.id) return `${t}#${e.id}`;
  const n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
function Wc(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
const ze = "[REDACTED]", Kc = /token|secret|auth|cookie|passw|api-?key|access-?key|session|csrf|xsrf|client-?ip|real-?ip|connecting-ip|(^|-)forwarded(-for)?$/, Jc = /passw|secret|token(?!s|count|limit|usage|type)|apikey|accesskey|privatekey|authorization|credential|cardnumber|creditcard|cardnum|^pan$|cvv|cvc|securitycode|^ssn$|socialsecurity|^ip$|ipaddr|clientip|remoteaddr|remoteip|^ipv[46]$/;
function Fi(e, t, n) {
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
function Bi(e) {
  return Fi(
    Kc,
    (t) => t.toLowerCase(),
    e
  );
}
function qi(e) {
  return Fi(
    Jc,
    (t) => t.toLowerCase().replace(/[-_.\s]/g, ""),
    e
  );
}
function Gc(e) {
  let t = 0, n = !1;
  for (let r = e.length - 1; r >= 0; r--) {
    let o = e.charCodeAt(r) - 48;
    n && (o *= 2, o > 9 && (o -= 9)), t += o, n = !n;
  }
  return t % 10 === 0;
}
const Qc = /\b\d(?:[ -]?\d){12,18}\b/g;
function Zc(e) {
  return e.replace(Qc, (t) => {
    const n = t.replace(/[ -]/g, "");
    return n.length >= 13 && n.length <= 19 && n[0] >= "2" && n[0] <= "6" && Gc(n) ? ze : t;
  });
}
function tr(e, t, n) {
  if (n > 32 || e === null || typeof e != "object")
    return;
  let r = !1;
  if (Array.isArray(e)) {
    const i = e.map((s) => {
      const a = tr(s, t, n + 1);
      return a === void 0 ? s : (r = !0, a);
    });
    return r ? i : void 0;
  }
  const o = /* @__PURE__ */ Object.create(null);
  for (const [i, s] of Object.entries(e)) {
    if (t(i) && s !== null && s !== "") {
      o[i] = ze, r = !0;
      continue;
    }
    const a = tr(s, t, n + 1);
    a === void 0 ? o[i] = s : (o[i] = a, r = !0);
  }
  return r ? o : void 0;
}
const Dn = /"((?:[^"\\]|\\.){1,200})"\s*:\s*/g, eu = /^("(?:[^"\\]|\\.)*"|[^\s,}\]{["]+)/;
function tu(e, t) {
  let n = "", r = 0;
  Dn.lastIndex = 0;
  let o;
  for (; (o = Dn.exec(e)) !== null; ) {
    if (!t(o[1])) continue;
    const i = o.index + o[0].length, s = e.slice(i);
    if (s[0] === "{" || s[0] === "[")
      return n + e.slice(r, i) + `"${ze}"`;
    const a = eu.exec(s);
    if (!a)
      return s[0] === '"' ? n + e.slice(r, i) + `"${ze}"` : n + e.slice(r);
    a[1] === '""' || a[1] === "null" || (n += e.slice(r, i) + `"${ze}"`, r = i + a[1].length, Dn.lastIndex = r);
  }
  return n + e.slice(r);
}
function nu(e) {
  return /^[\w.%+[\]-]+=[^&]*(&[\w.%+[\]-]+=[^&]*)*$/.test(e);
}
function ru(e, t) {
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
      const s = tr(o, t, 0);
      s !== void 0 && (r = JSON.stringify(s));
    } else
      r = tu(e, t);
  } else if (nu(n))
    try {
      const o = new URLSearchParams(e);
      let i = !1;
      if (o.forEach((s, a) => {
        t(a) && s && (i = !0);
      }), i) {
        const s = new URLSearchParams();
        o.forEach((a, c) => {
          s.append(c, t(c) && a ? ze : a);
        }), r = s.toString();
      }
    } catch {
    }
  return Zc(r);
}
const ou = 50, ho = 200, yo = /* @__PURE__ */ new Map();
function iu(e) {
  let t = yo.get(e);
  return t || (t = {
    tokens: ho,
    lastRefill: Date.now(),
    rate: ou,
    burst: ho
  }, yo.set(e, t)), t;
}
function su(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function au(e) {
  const t = iu(e);
  return su(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let nr = null, rr = null;
function xl(e, t) {
  nr = e, rr = t;
}
const cu = "00000000000000000000000000000000";
function ji() {
  if (!nr || !rr) return null;
  try {
    const e = nr.getSpan(
      rr.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === cu ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const go = 100, uu = 10, _o = 5e3, lu = 3, fu = 0;
function du(e, t = () => Date.now()) {
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
    return r.size < _o && r.set(c, u), u;
  }
  function s(c) {
    const l = i(c), u = t();
    let f = n.get(l);
    if (!f) {
      if (n.size >= _o)
        return !0;
      f = {
        tokens: go,
        lastRefillMs: u
      }, n.set(l, f);
    }
    const d = (u - f.lastRefillMs) / 1e3;
    return d > 0 && (f.tokens = Math.min(
      go,
      f.tokens + d * uu
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function a(c) {
    var m, w, k;
    if (c.type !== lu)
      return { event: c, dropped: 0 };
    const l = c.data;
    if (!l || l.source !== fu || !l.attributes || l.attributes.length === 0)
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
const vo = "replay", pu = 200, mu = 6e4, hu = 5e3, yu = 8e6, zi = 2, gu = 3, _u = 4, wo = 3e3, Vi = 5e3, vu = 3, wu = 3e4, Eu = 5e3, Su = 16, Tu = 100, bu = 4, Au = 30, Eo = 32, So = 250, Iu = 36e4;
function ku() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const Cu = 3e5, Lu = 9e5, Mu = 1e3;
let Te = null, oe = null, at = null, Je = [], Ge = 0, ve = "", $i = "", xr = !1, Xi = 0, Nn = "", Z = 0, be = Date.now(), ye = !1, Nt = 0, we = null, Qe = !1, Ve = null, Yi = 0, G = [], Y = 0, $e = null, fe = null, Zt = 0;
function Ze() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const Pr = du(
  () => (Te == null ? void 0 : Te.mirror) ?? null
);
let Xe = null, Ee = null, Ye = !1, Ut = !1, Dr = 0, en = null, ee = null;
function Ru() {
  $e && (clearTimeout($e), $e = null), fe && (fe(), fe = null);
}
function or(e, t) {
  Ru();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    Au
  ) : null, r = e ? Ze() + (n ?? bu) : Number.POSITIVE_INFINITY;
  for (; Y < G.length; ) {
    const o = Math.min(
      Y + Eo,
      G.length
    );
    for (; Y < o; )
      ir(
        G[Y++]
      );
    if (Ze() >= r) break;
  }
  if (Y >= G.length) {
    G = [], Y = 0;
    return;
  }
  Y >= Eo * 8 && (G = G.slice(Y), Y = 0), Wi();
}
function vn() {
  or(!1);
}
function Wi() {
  if (!$e) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          fe = null, or(!0, t);
        },
        { timeout: Tu }
      );
      fe = () => cancelIdleCallback(e);
    }
    $e = setTimeout(() => {
      $e = null, fe && (fe(), fe = null), or(!0);
    }, Su);
  }
}
function Ht(e = !1) {
  if (Qe = !0, Ve) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - be, r = Math.max(
      0,
      Vi - n
    ), o = Date.now() - Yi, i = Math.max(
      0,
      Eu - o
    );
    t = Math.max(
      r,
      i
    );
  }
  Ve = setTimeout(() => {
    Ve = null, Ou();
  }, t);
}
function Ou() {
  if (!Qe || !Te || !oe || ye) return;
  Nt++;
  const e = Zt > So ? 1 : vu;
  if (Nt > e) {
    Du();
    return;
  }
  Yi = Date.now(), Z = 0, be = Date.now();
  try {
    const t = Ze();
    Te.takeFullSnapshot(!0), Zt = Ze() - t, P("replay_rebases"), Zt > So && P(
      "replay_expensive_snapshots"
    );
  } catch {
    Bt(), Ft();
  }
}
function To() {
  P("replay_events_dropped");
}
function Ki() {
  if (ve) return !1;
  ve = se(), Xi = ea(), $i = Qs() ? "" : Jo();
  const e = Nn !== "" && Nn !== ve;
  return Nn = ve, e;
}
function $t() {
  if (Pu(), Je.length === 0) return;
  if (Sn(vo)) {
    xu(), Ji();
    return;
  }
  Ki();
  const e = ve, t = Xi, n = $i, r = Je.splice(0), o = Ge;
  Ge = 0, ve = "", xr = !0, br(
    vo,
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
function xu() {
  Ge <= yu || (P(
    "replay_events_dropped",
    Je.length
  ), Je.length = 0, Ge = 0, Ht());
}
let We = null;
function Pu() {
  We && (clearTimeout(We), We = null);
}
function Ji() {
  if (We) return;
  const e = x().replayFlushIntervalMs ?? hu;
  We = setTimeout(() => {
    We = null, $t();
  }, e);
}
function ir(e) {
  !ve && !se() || (Ki() && e.type !== zi && Ht(!0), Je.push(e), Ge += nn(e), Je.length >= pu || Ge >= mu ? $t() : Ji());
}
function Du() {
  ye = !0, P("replay_overload_pauses"), Bt(), we && clearTimeout(we), we = setTimeout(() => {
    we = null, ye = !1, Nt = 0, Z = 0, be = Date.now(), !Ye && !Ut && ee && Ft();
  }, wu);
}
function Nu(e) {
  if (ye) return;
  if (e.type === zi) {
    vn(), Qe = !1, Z = 0, be = Date.now(), ir(e);
    return;
  }
  if (e.type === _u) {
    const r = e.data;
    typeof r.href == "string" && (r.href = Is(r.href));
  }
  if (e.type !== gu) {
    vn(), ir(e);
    return;
  }
  if (Qe) {
    To(), Ht();
    return;
  }
  const t = Date.now();
  t - be > Vi && (Z <= wo && (Nt = 0), Z = 0, be = t);
  const n = Pr.throttle(e);
  if (n.dropped > 0 && P(
    "replay_attributes_throttled",
    n.dropped
  ), !!n.event) {
    if (Z++, Z > wo) {
      To(), Ht();
      return;
    }
    G.push(n.event), Wi();
  }
}
async function Ft() {
  if (ee && !ye && !oe)
    return at || (at = Uu().finally(
      () => {
        at = null;
      }
    ), at);
}
async function Uu() {
  if (!ee) return;
  const { record: e } = await import("./rrweb-SbAupvcM.js");
  !ee || ye || oe || (Te = e, Qe = !1, Z = 0, be = Date.now(), Pr.reset(), oe = e({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: ku() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: Iu,
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
        Nu(t);
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
    maskAllInputs: ee.maskAllInputs,
    maskInputOptions: ee.maskInputOptions,
    maskTextFn: ee.maskTextContent ? () => "•••" : void 0,
    blockSelector: qo,
    maskTextSelector: jo,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => $t(), 200));
}
function Bt() {
  oe && (oe(), oe = null), Ve && (clearTimeout(Ve), Ve = null), Qe = !1, vn(), $t();
}
function Hu() {
  const e = x(), t = e.replayIdlePauseMs ?? Cu, n = e.replayIdleExpireMs ?? Lu;
  Xe && clearTimeout(Xe), Ee && (clearTimeout(Ee), Ee = null), Xe = setTimeout(() => {
    Ye = !0, Bt();
  }, t), Ee = setTimeout(() => {
    Ut = !0, Bt();
  }, n);
}
function tn() {
  Dr = Ze(), Hu();
}
function Fu() {
  if (Ut) {
    if (!Qo()) return;
    Ut = !1, Ye = !1, Ft(), tn();
    return;
  }
  if (Ye) {
    Ye = !1, Ft(), tn();
    return;
  }
  Ze() - Dr >= Mu && tn();
}
function Bu() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => Fu(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  en = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function qu() {
  en && (en(), en = null), Xe && (clearTimeout(Xe), Xe = null), Ee && (clearTimeout(Ee), Ee = null);
}
function ju() {
  vn(), $t();
}
async function zu() {
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
  } : o = !1, ee = {
    privacyLevel: t,
    maskAllInputs: o,
    maskInputOptions: n,
    maskTextContent: r
  }, za(() => {
    oe && Ht();
  }), _i(ju), await Ft(), Bu(), tn();
}
function Vu() {
  return oe !== null && !ye;
}
function $u() {
  return xr;
}
function Xu() {
  Bt(), qu(), _i(null), we && (clearTimeout(we), we = null), Ye = !1, Ut = !1, Dr = 0, ye = !1, xr = !1, Nt = 0, Z = 0, Zt = 0, G = [], Y = 0, Pr.reset(), ee = null, Te = null;
}
let H = [], Q = null;
const Yu = [
  "error",
  "action",
  "console",
  "resource"
];
function Wu(e) {
  return Yu.includes(e) && (Sn(e) || !au(e)) ? (P("events_rate_limited"), !0) : !1;
}
function Gi(e, t) {
  const n = e.origin + de(e.pathname);
  if (!Array.isArray(t) || t.length === 0 || !e.search)
    return n;
  const r = new URLSearchParams(e.search), o = new URLSearchParams();
  r.forEach((s, a) => {
    t.includes(a) && o.append(a, s);
  });
  const i = o.toString();
  return i ? n + "?" + i : n;
}
function Ku() {
  if (!Q) {
    const e = navigator.userAgent;
    Q = {
      device_type: Al(e),
      browser_name: Il(e),
      browser_version: kl(e),
      os_name: Cl(e),
      os_version: Ll(e),
      user_agent: e,
      language: navigator.language
    };
  }
}
function Ju() {
  const e = navigator.connection;
  return typeof (e == null ? void 0 : e.effectiveType) == "string" ? e.effectiveType : "";
}
function Qi(e) {
  Ku();
  const t = na(), n = Za(), r = x(), o = e ?? se(), i = {
    event_id: et(),
    session_id: o,
    tab_id: Jo(),
    view_id: Di(),
    action_id: Rc(),
    ...Ms(
      ni(),
      oa(),
      ia()
    ),
    user_status: sa(),
    service: r.service,
    env: r.env ?? "",
    version: r.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: Gi(
      window.location,
      r.viewUrlQueryParams
    ),
    view_url_host: window.location.hostname,
    view_url_path: de(window.location.pathname),
    referrer_url: ks(document.referrer),
    device_type: Q.device_type,
    browser_name: Q.browser_name,
    browser_version: Q.browser_version,
    os_name: Q.os_name,
    os_version: Q.os_version,
    user_agent: Ls() ? Q.user_agent : "",
    language: Q.language,
    session_view_count: t.viewCount,
    session_error_count: t.errorCount,
    session_action_count: t.actionCount,
    replay_id: Vu() && $u() ? o : ""
  };
  return Object.keys(n).length > 0 && (i.feature_flags = n), i;
}
function Gu(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const Zi = "events", Qu = ["session_id", "event_type", "timestamp"];
let bo = !1;
function es(e) {
  const t = x().beforeSend;
  if (typeof t != "function") return e;
  const n = {};
  for (const r of Qu) n[r] = e[r];
  try {
    const r = t(e);
    if (r === null || r === !1) return null;
    if (us(r))
      throw new Error("it returned a promise; it must be synchronous");
    return { ...r && typeof r == "object" ? r : e, ...n };
  } catch (r) {
    return bo || (bo = !0, cr(
      `beforeSend failed. Events are dropped until it is fixed: ${String(r)}`
    )), null;
  }
}
function ts(e) {
  Zs() && (e.session_is_new = 1);
}
function N(e) {
  if (!se() || !Go() || Sn("events")) return;
  Cc();
  const t = e(), n = t.event_type;
  if (Wu(n)) return;
  n === "resource" && pl(t), ti(n), Sc(t), Oc(t);
  const r = { ...Qi(), ...t };
  ts(r);
  const o = es(r);
  o && br(Zi, o);
}
function Nr(e) {
  Gu(
    () => N(e)
  );
}
function Zu(e, t) {
  if (!Go() || Sn("events")) return;
  e.view_update_seq === 1 && ti("view");
  const n = {
    ...Qi(t),
    ...e,
    action_id: "",
    connection_type: Ju(),
    screen_width: typeof screen < "u" ? screen.width : 0,
    screen_height: typeof screen < "u" ? screen.height : 0
  };
  e.view_update_seq === 1 && (n.view_is_new = 1), t === se() && ts(n);
  const r = es(n);
  r && Wa(
    Zi,
    "view:" + String(e.view_id),
    r,
    (o, i) => {
      const s = { ...i }, a = o;
      return a.view_is_new === 1 && (s.view_is_new = 1), a.session_is_new === 1 && (s.session_is_new = 1), s;
    }
  );
}
function el(e) {
  N(() => e);
}
function tl() {
  kc(
    Zu,
    (e) => Gi(e, x().viewUrlQueryParams)
  ), Vc(el), nl(), sl(), ul(), vl(), wl(), El(), Sl();
}
function nl() {
  const e = (n) => {
    N(() => {
      var i, s, a;
      const r = n.message ?? "", o = typeof ((i = n.error) == null ? void 0 : i.message) == "string" ? n.error.message : r;
      return {
        event_type: "error",
        error_message: Mt(r),
        error_type: ((s = n.error) == null ? void 0 : s.name) ?? "Error",
        error_stack: fr(
          ((a = n.error) == null ? void 0 : a.stack) ?? "",
          o
        ),
        error_source: "source",
        error_handling: "unhandled"
      };
    });
  }, t = (n) => rs(n.reason);
  window.addEventListener("error", e), window.addEventListener(
    "unhandledrejection",
    t
  ), sr = !0, H.push(() => {
    window.removeEventListener("error", e), window.removeEventListener(
      "unhandledrejection",
      t
    ), sr = !1;
  });
}
let sr = !1;
const Ao = /* @__PURE__ */ new WeakSet(), ns = /* @__PURE__ */ new WeakSet();
function rs(e) {
  e !== null && typeof e == "object" && (Ao.has(e) || (Ao.add(e), ns.has(e))) || N(() => {
    const t = (e == null ? void 0 : e.message) ?? String(e);
    return {
      event_type: "error",
      error_message: Mt(t),
      error_type: (e == null ? void 0 : e.name) ?? "UnhandledRejection",
      error_stack: fr((e == null ? void 0 : e.stack) ?? "", t),
      error_source: "promise",
      error_handling: "unhandled"
    };
  });
}
let Io = !1;
function Pl() {
  const e = globalThis.Zone;
  if (Io || !e || typeof e.__symbol__ != "function")
    return;
  Io = !0;
  const t = e.__symbol__("unhandledPromiseRejectionHandler"), n = e[t];
  e[t] = function(r) {
    if (sr)
      try {
        rs(
          r && typeof r == "object" && "rejection" in r && "promise" in r ? r.rejection : r
        );
      } catch {
      }
    if (typeof n == "function")
      return n.call(this, r);
  };
}
function os(e) {
  return e instanceof Error || typeof e == "object" && e !== null && typeof e.message == "string" && typeof e.name == "string" && "stack" in e;
}
const Ke = 8192;
function rl(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${Ke} bytes omitted]`;
}
function ol(e) {
  if (typeof e == "string") return e;
  if (os(e))
    return e.message ? `${e.name}: ${e.message}` : e.name;
  if (nn(
    e,
    Ke + 1
  ) > Ke)
    return rl(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function il(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= Ke) break;
    t && (t += " "), t += ol(n);
  }
  return t.length > Ke ? t.slice(0, Ke) + "… [truncated]" : t;
}
function sl() {
  for (const e of Cs()) {
    const t = console[e], n = (...r) => {
      try {
        const o = Mt(il(r)), i = e === "error" ? r.find(os) : void 0;
        i && typeof i == "object" && ns.add(i), N(() => {
          const s = {
            event_type: "console",
            console_level: e,
            console_message: o
          };
          return i && (s.error_type = i.name, s.error_message = Mt(i.message), s.error_stack = fr(
            i.stack ?? "",
            i.message
          ), s.error_source = "console", s.error_handling = "handled"), s;
        });
      } catch {
      }
      t.apply(console, r);
    };
    n[Fo] = t, console[e] = n, H.push(() => {
      console[e] = t;
    });
  }
}
const ar = "oodle_rum_tab_hidden";
function ko(e) {
  try {
    e ? sessionStorage.setItem(ar, "1") : sessionStorage.removeItem(ar);
  } catch {
  }
}
function al() {
  try {
    return sessionStorage.getItem(ar) === "1";
  } catch {
    return !1;
  }
}
function cl() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && al() && (ko(!1), N(() => ({
    event_type: "visibility",
    action_type: "tab_visible"
  })));
  let e = document.visibilityState === "hidden";
  const t = () => {
    const n = document.visibilityState === "hidden";
    n !== e && (e = n, ko(n), N(() => ({
      event_type: "visibility",
      action_type: n ? "tab_hidden" : "tab_visible"
    })), n || ie());
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
function Ur(e) {
  const t = x().endpoint;
  return e.startsWith(t);
}
function ul() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || Ur(r.name))
          continue;
        const i = Lt(r.name), s = is(r), a = ll(o, r.name);
        Nr(
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
function ll(e, t) {
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
function is(e) {
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
function ss(e, t) {
  try {
    const n = performance.getEntriesByName(
      as(e),
      "resource"
    );
    for (let r = n.length - 1; r >= 0; r--) {
      const o = n[r];
      if (o.startTime >= t - 2)
        return {
          ...is(o),
          resource_size: o.transferSize ?? 0
        };
    }
  } catch {
  }
  return {};
}
function wn(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function as(e) {
  try {
    return new URL(e, location.href).href;
  } catch {
    return e;
  }
}
function Un(e, t, n) {
  return n.some(
    (r) => typeof r == "string" ? e.startsWith(r) || t.startsWith(r) : r.test(e) || r.test(t)
  );
}
function cs(e) {
  const t = as(e), n = x();
  let r = !1;
  const o = n.allowedTracingUrls;
  o && o.length > 0 && (r = Un(
    t,
    e,
    o
  ));
  let i = null;
  const s = n.forwardNetworkBodies;
  s && Un(
    t,
    e,
    s.urls
  ) && (i = s);
  let a = !1;
  const c = n.forwardNetworkHeaders;
  return c && (a = Un(
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
let Co = null, Lo = Bi(void 0);
function Ct(e) {
  const t = x().redactHeaders;
  return t !== Co && (Co = t, Lo = Bi(t)), Lo(e);
}
function fl(e) {
  const t = {};
  for (const n of Object.keys(e)) {
    const r = n.toLowerCase();
    Ct(r) || (t[r] = e[n]);
  }
  return t;
}
const Mo = [
  "request_headers",
  "response_headers",
  "request_body",
  "response_body"
];
let Ro = !1;
function us(e) {
  return !!e && (typeof e == "object" || typeof e == "function") && typeof e.then == "function";
}
function Oo(e) {
  if (!(typeof e != "string" || !e))
    try {
      const t = JSON.parse(e);
      return t && typeof t == "object" ? t : void 0;
    } catch {
      return;
    }
}
function xo(e) {
  if (!e || typeof e != "object") return "";
  const t = {};
  for (const [n, r] of Object.entries(e))
    r != null && (t[n.toLowerCase()] = String(r));
  return Object.keys(t).length > 0 ? JSON.stringify(t) : "";
}
let Po = null, Do = qi(void 0);
function dl() {
  const e = x().redactBodyKeys;
  return e !== Po && (Po = e, Do = qi(e)), Do;
}
function pl(e) {
  var a;
  if (!Mo.some((c) => e[c])) return;
  for (const c of ["request_body", "response_body"])
    typeof e[c] == "string" && e[c] && (e[c] = ru(e[c], dl()));
  const t = x().beforeSendNetwork;
  if (typeof t != "function") return;
  const n = {
    url: String(e.resource_url ?? ""),
    method: String(e.resource_method ?? ""),
    status: Number(e.resource_status ?? 0),
    requestHeaders: Oo(e.request_headers),
    responseHeaders: Oo(e.response_headers),
    requestBody: typeof e.request_body == "string" ? e.request_body : void 0,
    responseBody: typeof e.response_body == "string" ? e.response_body : void 0
  };
  let r;
  try {
    const c = t(n);
    if (us(c))
      throw new Error("it returned a promise; it must be synchronous");
    r = c === void 0 ? n : c;
  } catch (c) {
    Ro || (Ro = !0, cr(
      `beforeSendNetwork failed. Captured headers and bodies are dropped until it is fixed: ${String(c)}`
    )), r = null;
  }
  for (const c of Mo) delete e[c];
  if (!r || typeof r != "object") return;
  const o = ((a = x().forwardNetworkBodies) == null ? void 0 : a.maxBodySize) ?? 65536, i = xo(r.requestHeaders), s = xo(r.responseHeaders);
  i && (e.request_headers = i), s && (e.response_headers = s), typeof r.requestBody == "string" && r.requestBody && (e.request_body = pe(r.requestBody, o)), typeof r.responseBody == "string" && r.responseBody && (e.response_body = pe(r.responseBody, o));
}
function ls(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      Ct(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      Ct(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      Ct(r) || (t[r] = e[n]);
    }
  return t;
}
function ml(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    Ct(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function pe(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function hl(e, t) {
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
function yl(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function gl(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      ls(
        e
      )
    );
  } catch {
    return "";
  }
}
function No(e) {
  try {
    return JSON.stringify(
      ls(e)
    );
  } catch {
    return "";
  }
}
function fs(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function _l(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: pe(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: pe(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : fs(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => pe(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function ds(e, t, n) {
  const r = function(o, i) {
    const s = yl(o);
    if (Ur(s))
      return t.apply(e, [
        o,
        i
      ]);
    const a = fs(o), c = ((i == null ? void 0 : i.method) ?? (a ? o.method : "GET")).toUpperCase(), l = performance.now(), u = cs(s), f = Ti();
    let d = !1;
    const y = () => {
      d || (d = !0, bi(f));
    };
    let m = "", w = "";
    if (n.injectTracing) {
      const b = ji();
      if (b)
        m = b.traceId, w = b.spanId;
      else if (u.trace) {
        m = wn(16), w = wn(8);
        const S = new Headers(
          (i == null ? void 0 : i.headers) ?? {}
        );
        S.set(
          "traceparent",
          `00-${m}-${w}-01`
        ), i = { ...i, headers: S };
      }
    }
    let k = "", C = null;
    if (u.bodyCfg) {
      const b = u.bodyCfg.maxBodySize ?? 65536, S = _l(
        i,
        o,
        b
      );
      k = S.sync, C = S.asyncP;
    }
    let I = "";
    return u.captureHeaders && (i != null && i.headers ? I = gl(
      i.headers
    ) : a && (I = No(
      o.headers
    ))), t.apply(e, [o, i]).then((b) => {
      y();
      const S = b.status, L = Math.round(
        performance.now() - l
      );
      let _ = "";
      u.captureHeaders && (_ = No(
        b.headers
      ));
      const v = (p) => {
        const T = {
          event_type: "resource",
          resource_url: Lt(s),
          resource_method: c,
          resource_status: S,
          resource_duration_ms: L,
          resource_size: 0,
          resource_type: "fetch",
          ...ss(s, l)
        };
        return m && (T.trace_id = m, T.span_id = w), p && (T.request_body = p), I && (T.request_headers = I), _ && (T.response_headers = _), T;
      }, h = C || Promise.resolve(k);
      if (u.bodyCfg) {
        const p = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          h,
          hl(
            b.clone(),
            p
          ).catch(() => "")
        ]).then(([T, K]) => {
          N(() => {
            const R = v(T);
            return K && (R.response_body = K), R;
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
      const S = Math.round(
        performance.now() - l
      );
      throw (C || Promise.resolve(k)).then((_) => {
        N(() => {
          const v = {
            event_type: "resource",
            resource_url: Lt(s),
            resource_method: c,
            resource_status: 0,
            resource_duration_ms: S,
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
function ps(e, t, n) {
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
    if (Ur(a))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const c = cs(a);
    let l = "", u = "";
    if (n.injectTracing) {
      const _ = ji();
      _ ? (l = _.traceId, u = _.spanId) : c.trace && (l = wn(16), u = wn(8), i.call(
        this,
        "traceparent",
        `00-${l}-${u}-01`
      ));
    }
    let f = "";
    if (c.bodyCfg && s) {
      const _ = c.bodyCfg.maxBodySize ?? 65536;
      typeof s == "string" ? f = pe(
        s,
        _
      ) : typeof URLSearchParams < "u" && s instanceof URLSearchParams && (f = pe(
        s.toString(),
        _
      ));
    }
    let d = "";
    if (c.captureHeaders)
      try {
        const _ = this.__oodleReqHeaders, v = _ ? fl(_) : {};
        Object.keys(v).length > 0 && (d = JSON.stringify(v));
      } catch {
      }
    const y = performance.now(), m = this, w = Ti(), k = l, C = u, I = f, b = c.bodyCfg, S = d, L = c.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        bi(w);
        const _ = Math.round(
          performance.now() - y
        ), v = m.__oodleMethod ?? "GET";
        N(() => {
          const h = {
            event_type: "resource",
            resource_url: Lt(a),
            resource_method: v,
            resource_status: m.status,
            resource_duration_ms: _,
            resource_size: 0,
            resource_type: "xhr",
            ...ss(a, y)
          };
          if (k && (h.trace_id = k, h.span_id = C), I && (h.request_body = I), b)
            try {
              const p = m.responseText ?? "";
              h.response_body = pe(
                p,
                b.maxBodySize ?? 65536
              );
            } catch {
            }
          if (S && (h.request_headers = S), L)
            try {
              const p = m.getAllResponseHeaders();
              p && (h.response_headers = JSON.stringify(
                ml(p)
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
const ms = {
  injectTracing: !0
}, Uo = {
  injectTracing: !1
};
function vl() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = ds(
    window,
    window.fetch,
    ms
  );
  H.push(e);
}
function wl() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = ps(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    ms
  );
  H.push(e);
}
const Ho = /* @__PURE__ */ new WeakSet();
function Hn(e) {
  if (Ho.has(e)) return;
  Ho.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (ds(
        n,
        n.fetch,
        Uo
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (ps(
        r.prototype,
        r.prototype.setRequestHeader,
        Uo
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), H.push(() => {
    e.removeEventListener("load", t);
  });
}
function El() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach(Hn);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          r instanceof HTMLIFrameElement && Hn(r), r instanceof HTMLElement && r.childElementCount > 0 && r.querySelectorAll("iframe").forEach(Hn);
    }
  );
  e.observe(document.documentElement, {
    childList: !0,
    subtree: !0
  }), H.push(() => {
    e.disconnect();
  });
}
function Sl() {
  if (!(typeof PerformanceObserver > "u") && !Tl())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            Nr(() => ({
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
function Tl() {
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
          Nr(() => ({
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
function bl(e, t) {
  N(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function Al(e) {
  return /iPad|Tablet/i.test(e) || /Android/i.test(e) && !/Mobi/i.test(e) ? "tablet" : /Mobi|iPhone|iPod|Android/i.test(e) ? "mobile" : "desktop";
}
const hs = [
  ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
  ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
  ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
  ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
  ["Safari", /Version\/([\d.]+).*Safari/]
];
function Il(e) {
  for (const [t, n] of hs) if (n.test(e)) return t;
  return e.includes("Safari") ? "Safari" : "Other";
}
function kl(e) {
  for (const [, t] of hs) {
    const n = e.match(t);
    if (n) return n[1];
  }
  return "";
}
function Cl(e) {
  return /iPhone|iPad|iPod/.test(e) ? "iOS" : e.includes("Android") ? "Android" : e.includes("CrOS") ? "Chrome OS" : e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : "Other";
}
function Ll(e) {
  let t = e.match(/OS (\d+[_.]\d+(?:[_.]\d+)?) like Mac OS X/);
  return t ? t[1].replace(/_/g, ".") : (t = e.match(/Android ([\d.]+)/), t || (t = e.match(/Windows NT ([\d.]+)/), t) ? t[1] : (t = e.match(/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/), t ? t[1].replace(/_/g, ".") : ""));
}
function Ml() {
  Hi(), Ni();
  for (const e of H)
    e();
  H = [];
}
let ge = !1;
const Dl = {
  init(e) {
    ge || Bs(e) && (ca(e.tags), Xs(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), ge = !0, Ko(), cl(), ro(), ta(), ma(), Ja(() => {
      ro();
    }), e.sessionReplay !== !1 && Qo() && zu(), tl(), e.openTelemetry && import("./tracing-BaIH685y.js").then(
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
    ua(e);
  },
  identify(e) {
    ra(e);
  },
  trackEvent(e, t) {
    ge && bl(e, t);
  },
  addFeatureFlag(e, t) {
    Qa(e, t);
  },
  getSessionId() {
    return ge ? se() : "";
  },
  getUserId() {
    return ni();
  },
  flush() {
    ge && ie();
  },
  stop() {
    ge && (Xu(), Ml(), ha(), ei(), ie(!0), ec(), Ga(), ge = !1);
  }
};
export {
  Dl as O,
  Ol as a,
  Pl as c,
  Rl as r,
  xl as s
};
