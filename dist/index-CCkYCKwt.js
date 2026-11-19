const xo = "__oodleOriginal";
function er(e) {
  try {
    const t = console.warn;
    (t[xo] ?? t).call(
      console,
      "[@oodle-ai/rum] " + e
    );
  } catch {
  }
}
const zt = [
  "error",
  "warn"
];
function cs() {
  return {
    patterns: [],
    maskFn: null,
    referrer: "path",
    consoleLevels: zt,
    messages: "full",
    actionText: "full",
    userAgent: "full",
    queryStrings: "events",
    userInfo: "full",
    keepParams: []
  };
}
let A = cs();
const bn = "/:redacted", us = 256, it = /* @__PURE__ */ new Map();
let xn = !1;
const Te = er;
function Le(e, t, n, r, o) {
  return t === void 0 ? r : typeof t == "string" && n.includes(t) ? t : (Te(
    `${e} must be one of ${n.map((i) => `'${i}'`).join(", ")}. Using '${o}'.`
  ), o);
}
function ls(e) {
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
function fs(e) {
  if (e === void 0) return [];
  if (!Array.isArray(e))
    return Te(
      "urlPathPatterns must be an array of path patterns such as '/projects/:id'. It is ignored."
    ), [];
  const t = [];
  for (const n of e) {
    const r = ls(n);
    r ? t.push(r) : Te(
      `urlPathPatterns: ${JSON.stringify(n)} is not a valid pattern. Patterns start with '/', use ':name' for one segment and may end in '/*'. It is ignored.`
    );
  }
  return t;
}
function ds(e) {
  if (e === void 0) return zt;
  if (!Array.isArray(e))
    return Te(
      "consoleLevels must be an array such as ['error']. Console capture is off."
    ), [];
  const t = zt.filter(
    (n) => e.includes(n)
  );
  return e.some(
    (n) => !zt.includes(n)
  ) && Te(
    "consoleLevels accepts only 'error' and 'warn'. Other values are ignored."
  ), t;
}
function ps(e) {
  it.clear(), xn = !1;
  const t = e.maskUrlPath;
  t !== void 0 && typeof t != "function" && Te("maskUrlPath must be a function. It is ignored."), A = {
    patterns: fs(e.urlPathPatterns),
    maskFn: typeof t == "function" ? t : null,
    referrer: Le(
      "referrerUrl",
      e.referrerUrl,
      ["path", "origin", "none"],
      "path",
      "none"
    ),
    consoleLevels: ds(
      e.consoleLevels
    ),
    messages: Le(
      "errorMessages",
      e.errorMessages,
      ["full", "scrub", "none"],
      "full",
      "none"
    ),
    // Text the replay masks must not reappear in click events.
    actionText: Le(
      "actionText",
      e.actionText,
      ["full", "mask"],
      e.privacyLevel === "mask" ? "mask" : "full",
      "mask"
    ),
    userAgent: Le(
      "userAgent",
      e.userAgent,
      ["full", "none"],
      "full",
      "none"
    ),
    queryStrings: Le(
      "stripQueryStrings",
      e.stripQueryStrings,
      ["events", "all"],
      "events",
      "all"
    ),
    userInfo: Le(
      "userInfo",
      e.userInfo,
      ["full", "id", "none"],
      "full",
      "none"
    ),
    keepParams: Array.isArray(e.viewUrlQueryParams) ? e.viewUrlQueryParams : []
  };
}
function tr() {
  return A.patterns.length > 0 || A.maskFn !== null;
}
function ms(e) {
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
function hs(e) {
  let t = A.patterns.length > 0 ? ms(e) : e;
  if (A.maskFn)
    try {
      const n = A.maskFn(t);
      t = typeof n == "string" ? n : bn;
    } catch (n) {
      xn || (xn = !0, Te(
        `maskUrlPath threw. Paths are sent as '${bn}' until it is fixed: ${String(n)}`
      )), t = bn;
    }
  return t;
}
function de(e) {
  if (!tr()) return e;
  const t = it.get(e);
  if (t !== void 0) return t;
  const n = hs(e);
  return it.size >= us && it.clear(), it.set(e, n), n;
}
function ys(e) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(e);
}
function It(e, t) {
  if (ys(e)) {
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
function Oo(e) {
  return !tr() || typeof e != "string" ? e : nr(e, (t) => t.search + t.hash);
}
function vl() {
  return tr() || A.queryStrings === "all";
}
function gs(e) {
  return A.queryStrings !== "all" ? Oo(e) : typeof e != "string" ? e : nr(e, (t) => {
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
function wl(e) {
  return A.queryStrings !== "all" ? Oo(e) : typeof e != "string" ? e : nr(e, () => "");
}
function nr(e, t) {
  let n;
  try {
    n = new URL(e);
  } catch {
    return e;
  }
  return n.protocol !== "http:" && n.protocol !== "https:" ? e : n.origin + de(n.pathname) + t(n);
}
let Or = null, Pr = "", Nr = null;
function _s(e) {
  if (e === Or && Nr === A)
    return Pr;
  let t = "";
  if (e && A.referrer !== "none")
    try {
      const n = new URL(e);
      t = A.referrer === "origin" ? n.origin : n.origin + de(n.pathname);
    } catch {
      t = A.referrer === "origin" ? "" : e;
    }
  return Or = e, Pr = t, Nr = A, t;
}
function vs() {
  return A.consoleLevels;
}
function ws() {
  return A.userAgent === "full";
}
function Ss(e, t, n) {
  switch (A.userInfo) {
    case "full":
      return { user_id: e, user_name: t, user_email: n };
    case "id":
      return { user_id: e, user_name: "", user_email: "" };
    default:
      return { user_id: "", user_name: "", user_email: "" };
  }
}
const Es = [
  [/(^|[^\w])'(?:[^'\\\n]|\\.){0,500}'/g, "$1'?'"],
  [/(^|[^\w])"(?:[^"\\\n]|\\.){0,500}"/g, '$1"?"'],
  [/(^|[^\w])`(?:[^`\\\n]|\\.){0,500}`/g, "$1`?`"]
], bs = /\bhttps?:\/\/[^\s'"`<>()\]]+/g, Ts = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, As = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, ks = /\b(?=[0-9a-fA-F]*\d)(?=[0-9a-fA-F]*[a-fA-F])[0-9a-fA-F]{16,}\b/g, Is = /\d{4,}/g, Dr = 8192;
function Cs(e) {
  if (!e) return e;
  let t = e.length > Dr ? e.slice(0, Dr) + "… [truncated]" : e;
  t = t.replace(bs, (n) => It(n)), t.includes("@") && (t = t.replace(Ts, "<email>"));
  for (const [n, r] of Es)
    t = t.replace(n, r);
  return t = t.replace(As, "<id>"), t = t.replace(ks, "<id>"), t = t.replace(Is, "<n>"), t;
}
const Ms = /^\s+at |^[^\s@]*@\S+:\d+(?::\d+)?$/m;
function Ct(e) {
  switch (A.messages) {
    case "full":
      return e;
    case "scrub":
      return Cs(e);
    default:
      return "";
  }
}
function rr(e, t) {
  if (A.messages === "full" || !e || !t) return e;
  const n = Ms.exec(e), r = n ? n.index : e.length, o = e.indexOf(t);
  if (o < 0 || o + t.length > r)
    return e;
  const i = Ct(t);
  let s = e.slice(0, o) + i;
  return i || (s = s.replace(/:\s*$/, "")), s + e.slice(o + t.length);
}
const Po = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', No = '[data-oodle-privacy="mask"],.oodle-privacy-mask', Do = Po + "," + No + ",.rr-block,.rr-mask";
function On(e) {
  if (A.actionText === "mask") return !0;
  try {
    return typeof e.closest == "function" && e.closest(Do) !== null;
  } catch {
    return !0;
  }
}
let Pn = null;
function Ls(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function Rs(e) {
  if (!Ls(e.endpoint))
    return console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    ), !1;
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  );
  const t = xs(
    e.viewUrlQueryParams
  );
  return ps({ ...e, viewUrlQueryParams: t }), Pn = { ...e, viewUrlQueryParams: t }, !0;
}
function xs(e) {
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
  if (!Pn)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return Pn;
}
const or = "__oodle_session_v2", ir = "__oodle_tab", Ur = "__oodle_session", Uo = 900 * 1e3, sr = 14400 * 1e3, ar = 1e3;
function Qe() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
let at = null, j = null;
function cr(e, t) {
  try {
    const n = e == null ? void 0 : e.getItem(t);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function ur(e, t, n) {
  try {
    e == null || e.setItem(t, JSON.stringify(n));
  } catch {
  }
}
function Ho() {
  try {
    return typeof localStorage < "u" ? localStorage : void 0;
  } catch {
    return;
  }
}
function Mt() {
  try {
    return typeof sessionStorage < "u" ? sessionStorage : void 0;
  } catch {
    return;
  }
}
const Os = 1e3;
let Ae = 0;
function te() {
  const e = Date.now();
  if (at && e - Ae < Os) return at;
  Ae = e;
  const t = cr(Ho(), or);
  return t && typeof t.id == "string" && t.id ? Ps({
    id: t.id,
    createdAt: t.createdAt ?? Date.now(),
    lastActivity: t.lastActivity ?? Date.now(),
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: t.started ?? !0
  }) : at;
}
function Ps(e) {
  return e && (at = e), e;
}
function Ft(e) {
  at = e, Ae = Date.now(), ur(Ho(), or, e);
}
function Fo() {
  if (j) return j;
  const e = cr(Mt(), ir);
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
function Ns(e) {
  j = e, ur(Mt(), ir, e);
}
let Oe = null;
function Ds(e) {
  j = e, !Oe && (Oe = setTimeout(() => {
    Oe = null, j && ur(Mt(), ir, j);
  }, 1e3));
}
function Bt(e) {
  Oe && (clearTimeout(Oe), Oe = null), Ns(e);
}
let Bo = 100, qo = 100;
function Us(e, t) {
  Bo = Math.max(0, Math.min(100, e)), qo = Math.max(0, Math.min(100, t));
}
function Hr(e) {
  return Math.random() * 100 < e;
}
function Lt(e, t) {
  return !!e && t - e.lastActivity <= Uo && t - e.createdAt <= sr;
}
function Hs(e) {
  var r;
  const t = cr(Mt(), Ur);
  if (!t || typeof t.id != "string") return !1;
  const n = {
    id: t.id,
    createdAt: t.createdAt ?? e,
    lastActivity: t.lastActivity ?? e,
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: !0
  };
  if (e - n.lastActivity > 1800 * 1e3 || e - n.createdAt > sr)
    return !1;
  Ft(n), Bt({
    tabId: Qe(),
    sessionId: n.id,
    viewCount: t.viewCount ?? 0,
    errorCount: t.errorCount ?? 0,
    actionCount: t.actionCount ?? 0,
    replaySegmentSeq: t.replaySegmentSeq ?? 0,
    legacyReplay: !0
  });
  try {
    (r = Mt()) == null || r.removeItem(Ur);
  } catch {
  }
  return !0;
}
function Fs(e) {
  const t = Hr(Bo), n = {
    id: Qe(),
    createdAt: e,
    lastActivity: e,
    sampled: t,
    replaySampled: t && Hr(qo),
    started: !1
  };
  return Ft(n), n;
}
const Nn = /* @__PURE__ */ new Set();
function Bs(e) {
  return Nn.add(e), () => Nn.delete(e);
}
function qt() {
  let e = Fo();
  return e || (e = {
    tabId: Qe(),
    sessionId: "",
    viewCount: 0,
    errorCount: 0,
    actionCount: 0,
    replaySegmentSeq: 0,
    legacyReplay: !1
  }, Bt(e)), e;
}
function lr(e) {
  const t = qt();
  if (t.sessionId === e) return;
  const n = t.sessionId;
  if (t.sessionId = e, t.viewCount = 0, t.errorCount = 0, t.actionCount = 0, t.replaySegmentSeq = 0, t.legacyReplay = !1, Bt(t), n)
    for (const r of Nn)
      try {
        r(n, e);
      } catch {
      }
}
let ct = 0;
function Fr() {
  const e = Date.now();
  Ae = 0;
  const t = te();
  Lt(t, e) && (e - ct >= ar && (t.lastActivity = Math.max(t.lastActivity, e), Ft(t), ct = e), lr(t.id));
}
const qs = 6e4;
function jo() {
  const e = Date.now();
  let t = te();
  Lt(t, e) || (Ae = 0, t = te()), Lt(t, e) ? e - ct >= ar && (t.lastActivity = Math.max(t.lastActivity, e), Ft(t), ct = e) : (Hs(e) ? t = te() : t = Fs(e), ct = e), t && lr(t.id);
}
function se() {
  const e = Date.now(), t = te();
  return Lt(t, e) ? (lr(t.id), t.id) : "";
}
function js(e) {
  Ae = 0;
  const t = te();
  if (!t || t.id !== e) return null;
  const n = Math.min(
    t.lastActivity + Uo,
    t.createdAt + sr
  );
  return Date.now() > n ? n : null;
}
function $o() {
  return qt().tabId;
}
function $s() {
  return qt().legacyReplay;
}
function zs() {
  const e = Date.now(), t = te();
  return !Lt(t, e) || t.started ? !1 : (t.started = !0, Ft(t), !0);
}
function Vs() {
  if (!se()) return 0;
  const e = qt(), t = e.replaySegmentSeq;
  return e.replaySegmentSeq = t + 1, Bt(e), t;
}
function zo() {
  const e = te();
  return (e == null ? void 0 : e.sampled) ?? !0;
}
function Vo() {
  const e = te();
  return (e == null ? void 0 : e.replaySampled) ?? !0;
}
let ut = null, lt = null, Vt = null, ft = null;
const Xo = ["click", "keydown", "touchstart", "scroll"];
function Xs() {
  if (typeof document > "u") return;
  Yo();
  let e = 0;
  ut = () => {
    const t = Date.now();
    t - e < ar || (e = t, jo());
  };
  for (const t of Xo)
    document.addEventListener(t, ut, {
      capture: !0,
      passive: !0
    });
  ft = (t) => {
    t.key === or && (Ae = 0);
  }, window.addEventListener("storage", ft), lt = () => {
    document.visibilityState === "visible" ? Fr() : j && Bt(j);
  }, document.addEventListener("visibilitychange", lt), Vt = setInterval(() => {
    document.visibilityState === "visible" && Fr();
  }, qs);
}
function Yo() {
  if (!(typeof document > "u")) {
    if (ut) {
      for (const e of Xo)
        document.removeEventListener(e, ut, {
          capture: !0
        });
      ut = null;
    }
    lt && (document.removeEventListener("visibilitychange", lt), lt = null), Vt && (clearInterval(Vt), Vt = null), ft && (window.removeEventListener("storage", ft), ft = null);
  }
}
function Wo(e) {
  if (!se()) return;
  const t = qt();
  e === "view" || e === "page_load" ? t.viewCount++ : e === "error" ? t.errorCount++ : e === "action" && t.actionCount++, Ds(t);
}
function Ys() {
  const e = j ?? Fo();
  return {
    viewCount: (e == null ? void 0 : e.viewCount) ?? 0,
    errorCount: (e == null ? void 0 : e.errorCount) ?? 0,
    actionCount: (e == null ? void 0 : e.actionCount) ?? 0
  };
}
let $ = null;
function Ws(e) {
  $ = e;
}
function Ko() {
  return ($ == null ? void 0 : $.id) ?? "";
}
function Ks() {
  return ($ == null ? void 0 : $.name) ?? "";
}
function Js() {
  return ($ == null ? void 0 : $.email) ?? "";
}
function Gs() {
  return $ ? "identified" : "anonymous";
}
const Qs = 5e5;
function Qt(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > Qs) return n;
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
let Rt = {};
function Zs(e) {
  e && (Rt = { ...e, ...Rt });
}
function ea(e) {
  Rt = { ...Rt, ...e };
}
function ta() {
  return Rt;
}
const na = 6e4, ra = "sdk_telemetry", Pe = {
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
  Pe[e] += t;
}
function oa() {
  for (const e in Pe)
    if (Pe[e] > 0)
      return !0;
  return !1;
}
function Dn() {
  if (!oa()) return;
  const e = { ...Pe };
  for (const t in Pe)
    Pe[t] = 0;
  hr(ra, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let dt = null, pt = null;
function ia() {
  dt || (dt = setInterval(
    Dn,
    na
  ), typeof document < "u" && (pt = () => {
    document.visibilityState === "hidden" && Dn();
  }, document.addEventListener(
    "visibilitychange",
    pt
  )));
}
function sa() {
  dt && (clearInterval(dt), dt = null), pt && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    pt
  ), pt = null), Dn();
}
var U = Uint8Array, N = Uint16Array, fr = Int32Array, dr = new U([
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
]), pr = new U([
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
]), Br = new U([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Jo = function(e, t) {
  for (var n = new N(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new fr(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, Go = Jo(dr, 2), aa = Go.b, Un = Go.r;
aa[28] = 258, Un[258] = 28;
var ca = Jo(pr, 0), qr = ca.r, Hn = new N(32768);
for (var S = 0; S < 32768; ++S) {
  var ce = (S & 43690) >> 1 | (S & 21845) << 1;
  ce = (ce & 52428) >> 2 | (ce & 13107) << 2, ce = (ce & 61680) >> 4 | (ce & 3855) << 4, Hn[S] = ((ce & 65280) >> 8 | (ce & 255) << 8) >> 1;
}
var mt = (function(e, t, n) {
  for (var r = e.length, o = 0, i = new N(t); o < r; ++o)
    e[o] && ++i[e[o] - 1];
  var s = new N(t);
  for (o = 1; o < t; ++o)
    s[o] = s[o - 1] + i[o - 1] << 1;
  var a;
  if (n) {
    a = new N(1 << t);
    var c = 15 - t;
    for (o = 0; o < r; ++o)
      if (e[o])
        for (var l = o << 4 | e[o], u = t - e[o], f = s[e[o] - 1]++ << u, p = f | (1 << u) - 1; f <= p; ++f)
          a[Hn[f] >> c] = l;
  } else
    for (a = new N(r), o = 0; o < r; ++o)
      e[o] && (a[o] = Hn[s[e[o] - 1]++] >> 15 - e[o]);
  return a;
}), ke = new U(288);
for (var S = 0; S < 144; ++S)
  ke[S] = 8;
for (var S = 144; S < 256; ++S)
  ke[S] = 9;
for (var S = 256; S < 280; ++S)
  ke[S] = 7;
for (var S = 280; S < 288; ++S)
  ke[S] = 8;
var Zt = new U(32);
for (var S = 0; S < 32; ++S)
  Zt[S] = 5;
var ua = /* @__PURE__ */ mt(ke, 9, 0), la = /* @__PURE__ */ mt(Zt, 5, 0), Qo = function(e) {
  return (e + 7) / 8 | 0;
}, Zo = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new U(e.subarray(t, n));
}, J = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, tt = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, Tn = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: ti, l: 0 };
  if (o == 1) {
    var s = new U(n[0].s + 1);
    return s[n[0].s] = 1, { t: s, l: 1 };
  }
  n.sort(function(M, y) {
    return M.f - y.f;
  }), n.push({ s: -1, f: 25001 });
  var a = n[0], c = n[1], l = 0, u = 1, f = 2;
  for (n[0] = { s: -1, f: a.f + c.f, l: a, r: c }; u != o - 1; )
    a = n[n[l].f < n[f].f ? l++ : f++], c = n[l != u && n[l].f < n[f].f ? l++ : f++], n[u++] = { s: -1, f: a.f + c.f, l: a, r: c };
  for (var p = i[0].s, r = 1; r < o; ++r)
    i[r].s > p && (p = i[r].s);
  var g = new N(p + 1), h = Fn(n[u - 1], g, 0);
  if (h > t) {
    var r = 0, w = 0, I = h - t, C = 1 << I;
    for (i.sort(function(y, _) {
      return g[_.s] - g[y.s] || y.f - _.f;
    }); r < o; ++r) {
      var k = i[r].s;
      if (g[k] > t)
        w += C - (1 << h - g[k]), g[k] = t;
      else
        break;
    }
    for (w >>= I; w > 0; ) {
      var T = i[r].s;
      g[T] < t ? w -= 1 << t - g[T]++ - 1 : ++r;
    }
    for (; r >= 0 && w; --r) {
      var E = i[r].s;
      g[E] == t && (--g[E], ++w);
    }
    h = t;
  }
  return { t: new U(g), l: h };
}, Fn = function(e, t, n) {
  return e.s == -1 ? Math.max(Fn(e.l, t, n + 1), Fn(e.r, t, n + 1)) : t[e.s] = n;
}, jr = function(e) {
  for (var t = e.length; t && !e[--t]; )
    ;
  for (var n = new N(++t), r = 0, o = e[0], i = 1, s = function(c) {
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
}, nt = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, ei = function(e, t, n) {
  var r = n.length, o = Qo(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, $r = function(e, t, n, r, o, i, s, a, c, l, u) {
  J(t, u++, n), ++o[256];
  for (var f = Tn(o, 15), p = f.t, g = f.l, h = Tn(i, 15), w = h.t, I = h.l, C = jr(p), k = C.c, T = C.n, E = jr(w), M = E.c, y = E.n, _ = new N(19), m = 0; m < k.length; ++m)
    ++_[k[m] & 31];
  for (var m = 0; m < M.length; ++m)
    ++_[M[m] & 31];
  for (var d = Tn(_, 7), b = d.t, K = d.l, R = 19; R > 4 && !b[Br[R - 1]]; --R)
    ;
  var Ie = l + 5 << 3, F = nt(o, ke) + nt(i, Zt) + s, B = nt(o, p) + nt(i, w) + s + 14 + 3 * R + nt(_, b) + 2 * _[16] + 3 * _[17] + 7 * _[18];
  if (c >= 0 && Ie <= F && Ie <= B)
    return ei(t, u, e.subarray(c, c + l));
  var z, L, q, ae;
  if (J(t, u, 1 + (B < F)), u += 2, B < F) {
    z = mt(p, g, 0), L = p, q = mt(w, I, 0), ae = w;
    var vn = mt(b, K, 0);
    J(t, u, T - 257), J(t, u + 5, y - 1), J(t, u + 10, R - 4), u += 14;
    for (var m = 0; m < R; ++m)
      J(t, u + 3 * m, b[Br[m]]);
    u += 3 * R;
    for (var V = [k, M], et = 0; et < 2; ++et)
      for (var Ce = V[et], m = 0; m < Ce.length; ++m) {
        var X = Ce[m] & 31;
        J(t, u, vn[X]), u += b[X], X > 15 && (J(t, u, Ce[m] >> 5 & 127), u += Ce[m] >> 12);
      }
  } else
    z = ua, L = ke, q = la, ae = Zt;
  for (var m = 0; m < a; ++m) {
    var x = r[m];
    if (x > 255) {
      var X = x >> 18 & 31;
      tt(t, u, z[X + 257]), u += L[X + 257], X > 7 && (J(t, u, x >> 23 & 31), u += dr[X]);
      var Me = x & 31;
      tt(t, u, q[Me]), u += ae[Me], Me > 3 && (tt(t, u, x >> 5 & 8191), u += pr[Me]);
    } else
      tt(t, u, z[x]), u += L[x];
  }
  return tt(t, u, z[256]), u + L[256];
}, fa = /* @__PURE__ */ new fr([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), ti = /* @__PURE__ */ new U(0), da = function(e, t, n, r, o, i) {
  var s = i.z || e.length, a = new U(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), c = a.subarray(r, a.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (c[0] = i.r >> 3);
    for (var f = fa[t - 1], p = f >> 13, g = f & 8191, h = (1 << n) - 1, w = i.p || new N(32768), I = i.h || new N(h + 1), C = Math.ceil(n / 3), k = 2 * C, T = function(En) {
      return (e[En] ^ e[En + 1] << C ^ e[En + 2] << k) & h;
    }, E = new fr(25e3), M = new N(288), y = new N(32), _ = 0, m = 0, d = i.i || 0, b = 0, K = i.w || 0, R = 0; d + 2 < s; ++d) {
      var Ie = T(d), F = d & 32767, B = I[Ie];
      if (w[F] = B, I[Ie] = F, K <= d) {
        var z = s - d;
        if ((_ > 7e3 || b > 24576) && (z > 423 || !l)) {
          u = $r(e, c, 0, E, M, y, m, b, R, d - R, u), b = _ = m = 0, R = d;
          for (var L = 0; L < 286; ++L)
            M[L] = 0;
          for (var L = 0; L < 30; ++L)
            y[L] = 0;
        }
        var q = 2, ae = 0, vn = g, V = F - B & 32767;
        if (z > 2 && Ie == T(d - V))
          for (var et = Math.min(p, z) - 1, Ce = Math.min(32767, d), X = Math.min(258, z); V <= Ce && --vn && F != B; ) {
            if (e[d + q] == e[d + q - V]) {
              for (var x = 0; x < X && e[d + x] == e[d + x - V]; ++x)
                ;
              if (x > q) {
                if (q = x, ae = V, x > et)
                  break;
                for (var Me = Math.min(V, x - 2), Mr = 0, L = 0; L < Me; ++L) {
                  var wn = d - V + L & 32767, as = w[wn], Lr = wn - as & 32767;
                  Lr > Mr && (Mr = Lr, B = wn);
                }
              }
            }
            F = B, B = w[F], V += F - B & 32767;
          }
        if (ae) {
          E[b++] = 268435456 | Un[q] << 18 | qr[ae];
          var Rr = Un[q] & 31, xr = qr[ae] & 31;
          m += dr[Rr] + pr[xr], ++M[257 + Rr], ++y[xr], K = d + q, ++_;
        } else
          E[b++] = e[d], ++M[e[d]];
      }
    }
    for (d = Math.max(d, K); d < s; ++d)
      E[b++] = e[d], ++M[e[d]];
    u = $r(e, c, l, E, M, y, m, b, R, d - R, u), l || (i.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, i.h = I, i.p = w, i.i = d, i.w = K);
  } else {
    for (var d = i.w || 0; d < s + l; d += 65535) {
      var Sn = d + 65535;
      Sn >= s && (c[u / 8 | 0] = l, Sn = s), u = ei(c, u + 1, e.subarray(d, Sn));
    }
    i.i = s;
  }
  return Zo(a, 0, r + Qo(u) + o);
}, pa = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), ma = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = pa[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, ha = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new U(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return da(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, Bn = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, ya = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && Bn(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, ga = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function _a(e, t) {
  t || (t = {});
  var n = ma(), r = e.length;
  n.p(e);
  var o = ha(e, t, ga(t), 8), i = o.length;
  return ya(o, t), Bn(o, i - 8, n.d()), Bn(o, i - 4, r), o;
}
var zr = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), va = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), wa = 0;
try {
  va.decode(ti, { stream: !0 }), wa = 1;
} catch {
}
function Sa(e, t) {
  var n;
  if (zr)
    return zr.encode(e);
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
  return Zo(o, 0, i);
}
function Xt(e) {
  try {
    return _a(Sa(e));
  } catch {
    return null;
  }
}
const Ea = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function ba(e) {
  if (!Ea)
    return Xt(e);
  try {
    const t = new Response(e).body;
    if (!t) return Xt(e);
    const n = t.pipeThrough(
      new CompressionStream("gzip")
    ), r = await new Response(
      n
    ).arrayBuffer();
    return new Uint8Array(r);
  } catch {
    return Xt(e);
  }
}
const Ta = "0.7.0", Vr = 5e3, ni = 50, ri = 5e5, Xr = 256e3, en = "replay", oi = 8e4, ii = 32, Aa = 2e7, ka = 5, Ia = 1e3, Ca = 6e4, Ma = 500, tn = 63e3;
let Ne = 0, De = 0, ue = [], ht = 0, An = null;
const nn = /* @__PURE__ */ new Map();
let Ue = null, He = null, qn = null;
const jn = /* @__PURE__ */ new Set();
function La(e) {
  return jn.add(e), () => jn.delete(e);
}
let yt = !1;
function Ra() {
  try {
    return O().flushIntervalMs ?? Vr;
  } catch {
    return Vr;
  }
}
function si(e) {
  let t = nn.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, nn.set(e, t)), t;
}
function ai(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (P("compression_failures"), { body: t, encoding: "" });
}
async function ci(e) {
  return ai(await ba(e), e);
}
function xa(e) {
  return ai(Xt(e), e);
}
const Oa = 64e3;
function $n(e, t, n) {
  if (e === en)
    return {
      bytes: n ?? Qt(
        t,
        Oa
      ),
      oversized: !1
    };
  const r = Qt(
    t,
    Xr + 1
  );
  return {
    bytes: r,
    oversized: r > Xr
  };
}
let zn = null;
function Pa(e) {
  zn = e;
}
function hn(e) {
  P("transport_drops"), e === en && zn && zn();
}
const Na = "/v1/rum/ingest";
function Da(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: Ta
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
function Ua(e, t, n) {
  const r = O();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const c = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, l = new Blob([n], {
      type: "application/json"
    });
    if (l.size < tn && navigator.sendBeacon(c, l))
      return;
  }
  const { body: o, encoding: i } = xa(n), s = { ...t };
  i ? s["Content-Encoding"] = i : delete s["Content-Encoding"];
  const a = o instanceof Blob ? o.size : n.length;
  fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: a < tn,
    credentials: "omit"
  }).catch(() => {
    P("exit_send_failures");
  });
}
function kn(e, t, n, r) {
  const o = n.length;
  if (ht + o > Aa) {
    P("retry_drops"), r && hn(r);
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
  }), ht += o, ui();
}
function ui() {
  if (An || ue.length === 0)
    return;
  const e = ue[0], t = Math.min(
    Ia * Math.pow(2, e.attempts),
    Ca
  );
  An = setTimeout(() => {
    An = null, li();
  }, t);
}
async function li() {
  for (; ue.length > 0 && Ne < oi && De < ii; ) {
    const e = ue.shift();
    if (ht -= e.bytes, e.attempts++, e.attempts > ka) {
      P("retry_drops"), e.batchKey && hn(e.batchKey);
      continue;
    }
    const t = e.bytes;
    Ne += t, De++;
    try {
      const { body: n, encoding: r } = await ci(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < tn,
        credentials: "omit"
      });
      if (di(i), i.status === 429 || i.status >= 500) {
        ue.unshift(e), ht += e.bytes;
        break;
      }
    } catch {
      ue.unshift(e), ht += e.bytes;
      break;
    } finally {
      Ne -= t, De--;
    }
  }
  ue.length > 0 && ui();
}
function Ha() {
  Ue && (clearTimeout(Ue), Ue = null), He && (clearTimeout(He), He = null);
}
function mr() {
  const e = Ra();
  Ue && clearTimeout(Ue), Ue = setTimeout(
    () => ie(),
    e
  ), He || (He = setTimeout(
    () => {
      He = null, ie();
    },
    e + Ma
  ));
}
function hr(e, t, n) {
  const { bytes: r, oversized: o } = $n(
    e,
    t,
    n
  );
  if (o) {
    console.warn(
      `[@oodle-ai/rum] Dropping oversized ${e} payload (${r} bytes)`
    ), hn(e);
    return;
  }
  const i = si(e);
  if (i.items.push(t), i.bytesEstimate += r, !yt && (i.items.length >= ni || i.bytesEstimate >= ri)) {
    ie();
    return;
  }
  mr();
}
function Fa(e, t, n, r) {
  const { bytes: o, oversized: i } = $n(
    e,
    n
  );
  if (i) {
    hn(e);
    return;
  }
  const s = si(e), a = s.upsertMap.get(t);
  if (a !== void 0) {
    const c = $n(
      e,
      s.items[a]
    ).bytes;
    s.items[a] = r ? r(s.items[a], n) : n, s.bytesEstimate += o - c;
  } else {
    const c = s.items.length;
    s.items.push(n), s.upsertMap.set(t, c), s.bytesEstimate += o;
  }
  if (!yt && (s.items.length >= ni || s.bytesEstimate >= ri)) {
    ie();
    return;
  }
  mr();
}
function fi(e) {
  qn = e;
}
const Yr = ["events", "replay"];
function ie(e = !1) {
  const t = O();
  if (e && qn && !yt) {
    yt = !0;
    try {
      qn();
    } catch {
    } finally {
      yt = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    mr();
    return;
  }
  Ha();
  const n = ta(), r = [], o = Array.from(
    nn.keys()
  ).sort((l, u) => {
    const f = Yr.indexOf(l), p = Yr.indexOf(u), g = f >= 0 ? f : 999, h = p >= 0 ? p : 999;
    return g - h;
  });
  for (const l of o) {
    const u = nn.get(l);
    if (!u || u.items.length === 0) continue;
    const f = u.items.splice(0);
    u.upsertMap.clear(), u.bytesEstimate = 0;
    const p = f.map((g) => ({
      ...g,
      tags: n
    }));
    r.push({
      type: u.batchKey,
      items: p
    });
  }
  if (r.length === 0) return;
  const i = Da(r), s = `${t.endpoint}${Na}`, a = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, c = r.some(
    (l) => l.type === en
  );
  if (e) {
    Ua(s, a, i);
    return;
  }
  Ba(
    s,
    a,
    i,
    c ? en : void 0
  );
}
async function Ba(e, t, n, r) {
  const o = n.length;
  if (Ne >= oi || De >= ii) {
    kn(e, t, n, r);
    return;
  }
  Ne += o, De++;
  try {
    const { body: i, encoding: s } = await ci(n), a = { ...t };
    s && (a["Content-Encoding"] = s);
    const c = await fetch(e, {
      method: "POST",
      headers: a,
      body: i,
      keepalive: o < tn,
      credentials: "omit"
    });
    di(c), (c.status === 429 || c.status >= 500) && kn(e, t, n, r);
  } catch {
    P("send_failures"), kn(e, t, n, r);
  } finally {
    Ne -= o, De--, li();
  }
}
const Vn = /* @__PURE__ */ new Map();
function di(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && Vn.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function yn(e) {
  const t = Vn.get(e);
  return t ? Date.now() >= t ? (Vn.delete(e), !1) : !0 : !1;
}
let gt = null, _t = null, vt = null, Xn = null;
function qa(e) {
  Xn = e;
}
const pi = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function Wr() {
  typeof document > "u" || (gt = () => {
    document.visibilityState === "hidden" && ie(!0);
  }, _t = () => {
    for (const e of jn)
      try {
        e();
      } catch {
      }
    ie(!0);
  }, vt = (e) => {
    e.persisted && Xn && Xn();
  }, document.addEventListener(
    "visibilitychange",
    gt
  ), window.addEventListener(
    pi,
    _t
  ), window.addEventListener(
    "pageshow",
    vt
  ));
}
function ja() {
  gt && (document.removeEventListener(
    "visibilitychange",
    gt
  ), gt = null), _t && (window.removeEventListener(
    pi,
    _t
  ), _t = null), vt && (window.removeEventListener(
    "pageshow",
    vt
  ), vt = null);
}
const rn = /* @__PURE__ */ new Map();
function $a(e, t) {
  rn.set(e, t);
}
function za() {
  return rn.size === 0 ? {} : Object.fromEntries(rn);
}
function Va() {
  rn.clear();
}
const Xa = 100, Ya = 1e4, wt = /* @__PURE__ */ new Set();
let mi = 0, Fe = null;
function yr(e) {
  for (const t of wt)
    try {
      t(e);
    } catch {
    }
}
const Wa = () => yr({ kind: "dom" });
function Ka() {
  Fe || typeof MutationObserver > "u" || typeof document > "u" || !document.documentElement || (Fe = new MutationObserver(Wa), Fe.observe(document.documentElement, {
    childList: !0,
    subtree: !0,
    attributes: !0,
    characterData: !0
  }));
}
function Kr() {
  wt.size > 0 || !Fe || (Fe.disconnect(), Fe = null);
}
function hi() {
  const e = mi++;
  return yr({ kind: "start", index: e }), e;
}
function yi(e) {
  yr({ kind: "end", index: e });
}
function gi(e, t, n = Ya) {
  let r = null;
  const o = mi;
  let i = 0, s = null, a = null, c = !1;
  const l = (p) => {
    c || (c = !0, s && clearTimeout(s), a && clearTimeout(a), wt.delete(f), Kr(), t(p));
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
    }, Xa);
  };
  function f(p) {
    if (p.kind !== "dom") {
      if (p.index < o) return;
      i = Math.max(0, i + (p.kind === "start" ? 1 : -1));
    }
    r = Date.now(), u();
  }
  return wt.add(f), Ka(), u(), a = setTimeout(() => {
    l({
      endMs: r,
      hadActivity: r !== null,
      timedOut: !0
    });
  }, n), () => {
    c = !0, s && clearTimeout(s), a && clearTimeout(a), wt.delete(f), Kr();
  };
}
var le, St, _i, on, vi = -1, jt = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (vi = t.timeStamp, e(t));
  }), !0);
}, gr = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, gn = function() {
  var e = gr();
  return e && e.activationStart || 0;
}, me = function(e, t) {
  var n = gr(), r = "navigate";
  return vi >= 0 ? r = "back-forward-cache" : n && (document.prerendering || gn() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, _r = function(e, t, n) {
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
}, wi = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, vr = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, wr = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, xe = -1, Jr = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, sn = function(e) {
  document.visibilityState === "hidden" && xe > -1 && (xe = e.type === "visibilitychange" ? e.timeStamp : 0, Ja());
}, Gr = function() {
  addEventListener("visibilitychange", sn, !0), addEventListener("prerenderingchange", sn, !0);
}, Ja = function() {
  removeEventListener("visibilitychange", sn, !0), removeEventListener("prerenderingchange", sn, !0);
}, Sr = function() {
  return xe < 0 && (xe = Jr(), Gr(), jt((function() {
    setTimeout((function() {
      xe = Jr(), Gr();
    }), 0);
  }))), { get firstHiddenTime() {
    return xe;
  } };
}, _n = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, Qr = [1800, 3e3], Ga = function(e, t) {
  t = t || {}, _n((function() {
    var n, r = Sr(), o = me("FCP"), i = _r("paint", (function(s) {
      s.forEach((function(a) {
        a.name === "first-contentful-paint" && (i.disconnect(), a.startTime < r.firstHiddenTime && (o.value = Math.max(a.startTime - gn(), 0), o.entries.push(a), n(!0)));
      }));
    }));
    i && (n = he(e, o, Qr, t.reportAllChanges), jt((function(s) {
      o = me("FCP"), n = he(e, o, Qr, t.reportAllChanges), wi((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, Qa = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = wr(e), document.visibilityState === "hidden" ? e() : (n = t(e), vr(e)), n;
}, Zr = [2500, 4e3], In = {}, Za = function(e, t) {
  t = t || {}, _n((function() {
    var n, r = Sr(), o = me("LCP"), i = function(c) {
      t.reportAllChanges || (c = c.slice(-1)), c.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - gn(), 0), o.entries = [l], n());
      }));
    }, s = _r("largest-contentful-paint", i);
    if (s) {
      n = he(e, o, Zr, t.reportAllChanges);
      var a = wr((function() {
        In[o.id] || (i(s.takeRecords()), s.disconnect(), In[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(c) {
        addEventListener(c, (function() {
          return Qa(a);
        }), { once: !0, capture: !0 });
      })), vr(a), jt((function(c) {
        o = me("LCP"), n = he(e, o, Zr, t.reportAllChanges), wi((function() {
          o.value = performance.now() - c.timeStamp, In[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, eo = [800, 1800], ec = function e(t) {
  document.prerendering ? _n((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, tc = function(e, t) {
  t = t || {};
  var n = me("TTFB"), r = he(e, n, eo, t.reportAllChanges);
  ec((function() {
    var o = gr();
    o && (n.value = Math.max(o.responseStart - gn(), 0), n.entries = [o], r(!0), jt((function() {
      n = me("TTFB", 0), (r = he(e, n, eo, t.reportAllChanges))(!0);
    })));
  }));
}, st = { passive: !0, capture: !0 }, nc = /* @__PURE__ */ new Date(), to = function(e, t) {
  le || (le = t, St = e, _i = /* @__PURE__ */ new Date(), Ei(removeEventListener), Si());
}, Si = function() {
  if (St >= 0 && St < _i - nc) {
    var e = { entryType: "first-input", name: le.type, target: le.target, cancelable: le.cancelable, startTime: le.timeStamp, processingStart: le.timeStamp + St };
    on.forEach((function(t) {
      t(e);
    })), on = [];
  }
}, rc = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        to(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, st), removeEventListener("pointercancel", i, st);
      };
      addEventListener("pointerup", o, st), addEventListener("pointercancel", i, st);
    })(t, e) : to(t, e);
  }
}, Ei = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, rc, st);
  }));
}, no = [100, 300], oc = function(e, t) {
  t = t || {}, _n((function() {
    var n, r = Sr(), o = me("FID"), i = function(c) {
      c.startTime < r.firstHiddenTime && (o.value = c.processingStart - c.startTime, o.entries.push(c), n(!0));
    }, s = function(c) {
      c.forEach(i);
    }, a = _r("first-input", s);
    n = he(e, o, no, t.reportAllChanges), a && (vr(wr((function() {
      s(a.takeRecords()), a.disconnect();
    }))), jt((function() {
      var c;
      o = me("FID"), n = he(e, o, no, t.reportAllChanges), on = [], St = -1, le = null, Ei(addEventListener), c = i, on.push(c), Si();
    })));
  }));
};
const ic = 3e3;
let xt = null, bi = (e) => e.href, v = null, ne = null, an = [];
function cn() {
  return typeof performance < "u" ? performance.now() : 0;
}
function sc() {
  return typeof performance < "u" && performance.timeOrigin ? performance.timeOrigin : Date.now();
}
function Et(e) {
  const t = e.hash ?? "", n = t.startsWith("#/") ? t.split("?")[0] : "";
  return e.pathname + n;
}
function Ti(e, t, n) {
  return {
    id: Qe(),
    sessionId: se(),
    loadingType: e,
    startEpoch: t,
    startPerf: n,
    url: bi(window.location),
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
function ac(e) {
  const t = Array.from(e.interactions.values()).sort((r, o) => o - r);
  if (t.length === 0) return 0;
  const n = Math.min(t.length - 1, Math.floor(t.length / 50));
  return t[n];
}
function cc(e) {
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
    inp_ms: ac(e),
    cls: Math.round(e.cls.value * 1e4) / 1e4,
    dns_ms: n.dns_ms ?? 0,
    connect_ms: n.connect_ms ?? 0,
    tls_ms: n.tls_ms ?? 0,
    download_ms: n.download_ms ?? 0,
    dom_interactive_ms: n.dom_interactive_ms ?? 0,
    dom_complete_ms: n.dom_complete_ms ?? 0
  };
}
function Ze(e) {
  if (!(!xt || !e.sessionId)) {
    if (e.endEpoch !== void 0) {
      if (e.expirySent) return;
      e.expirySent = !0;
    } else if (e.active) {
      const t = js(e.sessionId);
      t !== null && (e.active = !1, e.endEpoch = Math.max(e.startEpoch, t), e.expirySent = !0, e.cancelIdle && e.cancelIdle(), v === e && (v = null));
    }
    e.seq++, xt(cc(e), e.sessionId);
  }
}
function Ai() {
  ne && (clearTimeout(ne), ne = null), v && Ze(v);
}
function Ot() {
  ne || !v || (ne = setTimeout(() => {
    ne = null, v && Ze(v);
  }, ic));
}
const uc = 5 * 6e4, bt = /* @__PURE__ */ new Map();
function lc(e) {
  const t = Date.now();
  for (const [n, r] of bt) r.until <= t && bt.delete(n);
  bt.set(e.id, { v: e, until: t + uc });
}
function un() {
  const e = v;
  e && (lc(e), e.cancelIdle && e.cancelIdle(), ne && (clearTimeout(ne), ne = null), e.active = !1, Ze(e), v = null);
}
function ki(e) {
  e.cancelIdle = gi(e.startEpoch, (t) => {
    if (e.cancelIdle = null, v !== e) return;
    let n = t.endMs !== null && !t.timedOut ? t.endMs - e.startEpoch : 0;
    e.loadingType === "initial_load" && (n = Math.max(n, e.vitals.load_event_ms ?? 0)), e.loadingTimeMs = Math.max(0, n), Ai();
  });
}
function ln(e, t, n) {
  un();
  const r = Ti(e, t, n);
  r.sessionId && (v = r, Ze(r), ki(r));
}
function Ii() {
  return (v == null ? void 0 : v.id) ?? "";
}
function fc() {
  return (v == null ? void 0 : v.urlPath) ?? "";
}
function dc(e) {
  const t = typeof e.view_id == "string" ? e.view_id : "";
  let n = v, r = !1;
  if (t && (n == null ? void 0 : n.id) !== t) {
    const o = bt.get(t);
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
    r ? Ze(n) : Ot();
  }
}
function pc(e) {
  var r, o;
  const t = (o = (r = performance.getEntriesByType) == null ? void 0 : r.call(performance, "navigation")) == null ? void 0 : o[0];
  if (!t || t.loadEventEnd <= 0) return !1;
  const n = Math.round;
  return e.vitals.load_event_ms = n(t.loadEventEnd - t.startTime), e.vitals.dns_ms = n(t.domainLookupEnd - t.domainLookupStart), e.vitals.connect_ms = n(t.connectEnd - t.connectStart), e.vitals.tls_ms = n(
    t.secureConnectionStart > 0 ? t.connectEnd - t.secureConnectionStart : 0
  ), e.vitals.download_ms = n(t.responseEnd - t.responseStart), e.vitals.dom_interactive_ms = n(t.domInteractive - t.startTime), e.vitals.dom_complete_ms = n(t.domComplete - t.startTime), !0;
}
function ro(e, t, n = {}) {
  if (!(typeof PerformanceObserver > "u"))
    try {
      const r = new PerformanceObserver((o) => t(o.getEntries()));
      r.observe({ type: e, buffered: !0, ...n }), an.push(() => r.disconnect());
    } catch {
    }
}
function mc(e, t, n) {
  const r = e.cls;
  r.windowValue > 0 && n - r.last < 1e3 && n - r.windowStart < 5e3 ? r.windowValue += t : (r.windowValue = t, r.windowStart = n), r.last = n, r.windowValue > r.value && (r.value = r.windowValue);
}
function hc() {
  ro("layout-shift", (e) => {
    const t = v;
    if (!t) return;
    let n = !1;
    for (const r of e)
      r.hadRecentInput || r.startTime < t.startPerf || (mc(t, r.value, r.startTime), n = !0);
    n && Ot();
  }), ro(
    "event",
    (e) => {
      const t = v;
      if (!t) return;
      let n = !1;
      for (const r of e) {
        if (!r.interactionId || r.startTime < t.startPerf) continue;
        const o = t.interactions.get(r.interactionId) ?? 0;
        r.duration > o && (t.interactions.set(r.interactionId, r.duration), n = !0);
      }
      n && Ot();
    },
    { durationThreshold: 40 }
  );
}
function yc(e) {
  const t = (o, i) => {
    v !== e && !e.active || (e.vitals[o] = Math.round(i * 100) / 100, v === e && Ot());
  };
  try {
    Za((o) => t("lcp", o.value)), Ga((o) => t("fcp", o.value)), tc((o) => t("ttfb", o.value)), oc((o) => t("fid", o.value));
  } catch {
  }
  let n = 0;
  const r = () => {
    pc(e) ? v === e && Ot() : ++n < 50 && setTimeout(r, 200);
  };
  document.readyState === "complete" ? setTimeout(r, 0) : window.addEventListener("load", () => setTimeout(r, 0), { once: !0 });
}
let Be = "", Yt = !1;
function Re() {
  const e = Et(window.location);
  e !== Be && (Be = e, ln("route_change", Date.now(), cn()));
}
function gc(e, t) {
  if (typeof window > "u") return;
  Ci(), Yt = !1, xt = e, bi = t, Be = Et(window.location);
  const n = sc(), r = Ti("initial_load", n, 0);
  r.sessionId && (v = r, Ze(r), ki(r), yc(r)), hc();
  const o = history.pushState, i = history.replaceState;
  history.pushState = function(...u) {
    o.apply(this, u), Re();
  }, history.replaceState = function(...u) {
    i.apply(this, u), Re();
  }, window.addEventListener("popstate", Re), window.addEventListener("hashchange", Re);
  const s = () => {
    document.visibilityState === "hidden" && Ai();
  };
  document.addEventListener("visibilitychange", s);
  const a = () => {
    un(), Yt = !0;
  };
  window.addEventListener("pagehide", a);
  const c = (u) => {
    u.persisted && (Yt = !1, Be = Et(window.location), ln("bf_cache", Date.now(), cn()));
  };
  window.addEventListener("pageshow", c);
  const l = Bs((u) => {
    v && v.sessionId === u && un(), Be = Et(window.location), ln("route_change", Date.now(), cn());
  });
  an.push(() => {
    history.pushState = o, history.replaceState = i, window.removeEventListener("popstate", Re), window.removeEventListener("hashchange", Re), document.removeEventListener("visibilitychange", s), window.removeEventListener("pagehide", a), window.removeEventListener("pageshow", c), l();
  });
}
function _c() {
  v || Yt || !xt || typeof window > "u" || (Be = Et(window.location), ln("route_change", Date.now(), cn()));
}
function Ci() {
  un(), bt.clear();
  for (const e of an) e();
  an = [], xt = null, v = null;
}
const vc = 3, wc = 1e3;
let fn = null, W = null;
const re = [], Er = [];
let Wt = null;
function Sc() {
  for (let e = re.length - 1; e >= 0; e--)
    if (!re[e].done) return re[e].id;
  return "";
}
function Ec(e) {
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
function Mi(e) {
  return e.deadCandidate && !e.selected && !e.hadActivity && !e.userInput;
}
function bc(e, t, n = !1) {
  const r = [];
  return t && r.push("rage_click"), (t ? n : Mi(e)) && r.push("dead_click"), e.errorCount > 0 && r.push("error_click"), r;
}
function oo(e, t, n = 1, r = !1) {
  if (!fn) return;
  const o = bc(e, t, r), i = t ? "rage_click" : o.includes("dead_click") ? "dead_click" : o.includes("error_click") ? "error_click" : "click", s = {
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
  fn(s);
}
function dn() {
  const e = W;
  if (W = null, !e) return;
  e.timer && clearTimeout(e.timer);
  const t = () => e.clicks.every((o) => o.done), n = () => {
    const o = e.clicks.some((i) => i.userInput || i.selected);
    if (e.clicks.length >= vc && !o) {
      const i = e.clicks[0], s = e.clicks.some(Mi);
      for (const a of e.clicks.slice(1))
        i.errorCount += a.errorCount, i.resourceCount += a.resourceCount, i.longTaskCount += a.longTaskCount, i.hadActivity = i.hadActivity || a.hadActivity;
      oo(i, !0, e.clicks.length, s);
    } else
      for (const i of e.clicks) oo(i, !1);
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
  Tt.add(r), r.poll = setInterval(() => {
    t() && (clearInterval(r.poll), Tt.delete(r), n());
  }, 50), Er.push(() => {
    clearInterval(r.poll), Tt.delete(r);
  });
}
const Tt = /* @__PURE__ */ new Set();
function Tc() {
  const e = Date.now();
  for (const t of re)
    t.done || (t.hadActivity = !0, t.userInput = br >= t.startMs, t.loadingTimeMs = Math.max(0, e - t.startMs), t.done = !0);
  W && dn();
  for (const t of [...Tt])
    t.poll && clearInterval(t.poll), Tt.delete(t), t.flush();
}
function Ac(e) {
  if (e.tagName === "LABEL") {
    const t = e.getAttribute("for"), n = t ? document.getElementById(t) : null;
    if (n) return n;
  }
  return e;
}
function kc() {
  var e;
  try {
    const t = (e = window.getSelection) == null ? void 0 : e.call(window);
    return !!t && !t.isCollapsed && t.toString().length > 0;
  } catch {
    return !1;
  }
}
const Ic = (
  // Text fields take the caret without changing the page; checkboxes,
  // radios and buttons must change something, so they stay candidates.
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="range"]),textarea,select,[contenteditable],[contenteditable] *,canvas,a[href],a[href] *'
), Cc = 10;
function _e(e) {
  const t = e.split(`
`).map((n) => n.trim()).find(Boolean) ?? "";
  return t.length > 80 ? t.slice(0, 79) + "…" : t;
}
function rt(e, t) {
  return (e.getAttribute(t) ?? "").trim();
}
function Mc(e) {
  const t = e.labels;
  if (t && t.length > 0) {
    const i = t[0];
    if (!On(i)) return _e(At(i));
  }
  if (e.tagName === "INPUT") {
    const i = rt(e, "type");
    if (i === "button" || i === "submit" || i === "reset")
      return _e(e.value ?? "");
  }
  const n = rt(e, "role");
  if (["BUTTON", "LABEL", "A"].includes(e.tagName) || n === "button" || n === "link") {
    const i = _e(At(e));
    if (i) return i;
  }
  const r = rt(e, "aria-label");
  if (r) return _e(r);
  const o = rt(e, "aria-labelledby");
  if (o) {
    const i = o.split(/\s+/).map((s) => document.getElementById(s)).filter((s) => !!s && !On(s)).map((s) => At(s)).join(" ");
    if (i.trim()) return _e(i);
  }
  for (const i of ["alt", "title", "placeholder"]) {
    const s = rt(e, i);
    if (s) return _e(s);
  }
  return "";
}
function Lc(e) {
  for (const t of [Mc, (n) => _e(At(n))]) {
    let n = e;
    for (let r = 0; n && r <= Cc && n.tagName !== "BODY" && n.tagName !== "HTML"; r++) {
      const o = t(n);
      if (o) return { el: n, name: o };
      n = n.parentElement;
    }
  }
  return null;
}
const io = Do + ",[contenteditable],input,textarea,select,script,style";
function At(e) {
  let t = !0;
  try {
    t = e.querySelector(io) !== null;
  } catch {
    t = !0;
  }
  if (!t) {
    const o = e.innerText;
    return (typeof o == "string" && o ? o : e.textContent ?? "").trim();
  }
  const n = [], r = (o) => {
    for (let i = o.firstChild; i; i = i.nextSibling)
      if (i.nodeType === 3) {
        const s = (i.nodeValue ?? "").trim();
        s && n.push(s);
      } else if (i.nodeType === 1) {
        let s = !0;
        try {
          s = i.matches(io);
        } catch {
          s = !0;
        }
        s || r(i);
      }
  };
  return r(e), n.join(`
`);
}
let br = 0;
function Rc(e) {
  const t = e.target;
  if (!t || typeof t.tagName != "string") return;
  const n = Dc(t), r = Oc(t), o = r === null && On(t), i = r === null && !o ? Lc(t) : null, s = (i == null ? void 0 : i.el) ?? t, a = s.tagName.toLowerCase(), c = r ?? (i ? At(s).slice(0, 200) : ""), l = r !== null ? `${a}[${r}]` : i ? `${a}[${i.name}]` : Nc(t, a), u = {
    id: Qe(),
    startMs: Date.now(),
    viewId: Ii(),
    viewPath: fc(),
    target: l,
    selector: n,
    text: c,
    x: e.clientX,
    y: e.clientY,
    deadCandidate: !Pc(Ac(t), Ic),
    selected: kc(),
    errorCount: 0,
    resourceCount: 0,
    longTaskCount: 0,
    loadingTimeMs: 0,
    hadActivity: !1,
    userInput: !1,
    done: !1
  };
  re.push(u), Er.push(
    gi(u.startMs, (p) => {
      u.hadActivity = p.hadActivity, u.userInput = br >= u.startMs, u.loadingTimeMs = p.endMs !== null && !p.timedOut ? Math.max(0, p.endMs - u.startMs) : 0, u.done = !0;
    })
  ), W && W.selector === n ? W.clicks.push(u) : (dn(), W = { selector: n, clicks: [u], timer: null });
  const f = W;
  f.timer && clearTimeout(f.timer), f.timer = setTimeout(() => {
    W === f && dn();
  }, wc);
}
function xc(e) {
  if (typeof document > "u") return;
  Li(), fn = e;
  const t = (o) => Rc(o), n = () => {
    br = Date.now();
  }, r = La(Tc);
  document.addEventListener("click", t, { capture: !0, passive: !0 }), document.addEventListener("input", n, { capture: !0, passive: !0 }), document.addEventListener("scroll", n, { capture: !0, passive: !0 }), Wt = () => {
    r(), document.removeEventListener("click", t, {
      capture: !0
    }), document.removeEventListener("input", n, { capture: !0 }), document.removeEventListener("scroll", n, { capture: !0 });
  };
}
function Li() {
  W && dn();
  for (const e of Er.splice(0)) e();
  re.splice(0), Wt && Wt(), Wt = null, fn = null;
}
const so = "data-oodle-action-name";
function Oc(e) {
  var t;
  try {
    const n = typeof e.closest == "function" ? e.closest(`[${so}]`) : null, r = (t = n == null ? void 0 : n.getAttribute(so)) == null ? void 0 : t.trim();
    return r ? r.slice(0, 200) : null;
  } catch {
    return null;
  }
}
function Pc(e, t) {
  try {
    return typeof e.closest == "function" && e.closest(t) !== null;
  } catch {
    return !1;
  }
}
function Nc(e, t) {
  if (e.id) return `${t}#${e.id}`;
  const n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
function Dc(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
const qe = "[REDACTED]", Uc = /token|secret|auth|cookie|passw|api-?key|access-?key|session|csrf|xsrf|client-?ip|real-?ip|connecting-ip|(^|-)forwarded(-for)?$/, Hc = /passw|secret|token(?!s|count|limit|usage|type)|apikey|accesskey|privatekey|authorization|credential|cardnumber|creditcard|cardnum|^pan$|cvv|cvc|securitycode|^ssn$|socialsecurity|^ip$|ipaddr|clientip|remoteaddr|remoteip|^ipv[46]$/;
function Ri(e, t, n) {
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
function xi(e) {
  return Ri(
    Uc,
    (t) => t.toLowerCase(),
    e
  );
}
function Oi(e) {
  return Ri(
    Hc,
    (t) => t.toLowerCase().replace(/[-_.\s]/g, ""),
    e
  );
}
function Fc(e) {
  let t = 0, n = !1;
  for (let r = e.length - 1; r >= 0; r--) {
    let o = e.charCodeAt(r) - 48;
    n && (o *= 2, o > 9 && (o -= 9)), t += o, n = !n;
  }
  return t % 10 === 0;
}
const Bc = /\b\d(?:[ -]?\d){12,18}\b/g;
function qc(e) {
  return e.replace(Bc, (t) => {
    const n = t.replace(/[ -]/g, "");
    return n.length >= 13 && n.length <= 19 && n[0] >= "2" && n[0] <= "6" && Fc(n) ? qe : t;
  });
}
function Yn(e, t, n) {
  if (n > 32 || e === null || typeof e != "object")
    return;
  let r = !1;
  if (Array.isArray(e)) {
    const i = e.map((s) => {
      const a = Yn(s, t, n + 1);
      return a === void 0 ? s : (r = !0, a);
    });
    return r ? i : void 0;
  }
  const o = /* @__PURE__ */ Object.create(null);
  for (const [i, s] of Object.entries(e)) {
    if (t(i) && s !== null && s !== "") {
      o[i] = qe, r = !0;
      continue;
    }
    const a = Yn(s, t, n + 1);
    a === void 0 ? o[i] = s : (o[i] = a, r = !0);
  }
  return r ? o : void 0;
}
const Cn = /"((?:[^"\\]|\\.){1,200})"\s*:\s*/g, jc = /^("(?:[^"\\]|\\.)*"|[^\s,}\]{["]+)/;
function $c(e, t) {
  let n = "", r = 0;
  Cn.lastIndex = 0;
  let o;
  for (; (o = Cn.exec(e)) !== null; ) {
    if (!t(o[1])) continue;
    const i = o.index + o[0].length, s = e.slice(i);
    if (s[0] === "{" || s[0] === "[")
      return n + e.slice(r, i) + `"${qe}"`;
    const a = jc.exec(s);
    if (!a)
      return s[0] === '"' ? n + e.slice(r, i) + `"${qe}"` : n + e.slice(r);
    a[1] === '""' || a[1] === "null" || (n += e.slice(r, i) + `"${qe}"`, r = i + a[1].length, Cn.lastIndex = r);
  }
  return n + e.slice(r);
}
function zc(e) {
  return /^[\w.%+[\]-]+=[^&]*(&[\w.%+[\]-]+=[^&]*)*$/.test(e);
}
function Vc(e, t) {
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
      const s = Yn(o, t, 0);
      s !== void 0 && (r = JSON.stringify(s));
    } else
      r = $c(e, t);
  } else if (zc(n))
    try {
      const o = new URLSearchParams(e);
      let i = !1;
      if (o.forEach((s, a) => {
        t(a) && s && (i = !0);
      }), i) {
        const s = new URLSearchParams();
        o.forEach((a, c) => {
          s.append(c, t(c) && a ? qe : a);
        }), r = s.toString();
      }
    } catch {
    }
  return qc(r);
}
const Xc = 50, ao = 200, co = /* @__PURE__ */ new Map();
function Yc(e) {
  let t = co.get(e);
  return t || (t = {
    tokens: ao,
    lastRefill: Date.now(),
    rate: Xc,
    burst: ao
  }, co.set(e, t)), t;
}
function Wc(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function Kc(e) {
  const t = Yc(e);
  return Wc(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let Wn = null, Kn = null;
function Sl(e, t) {
  Wn = e, Kn = t;
}
const Jc = "00000000000000000000000000000000";
function Pi() {
  if (!Wn || !Kn) return null;
  try {
    const e = Wn.getSpan(
      Kn.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === Jc ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const uo = 100, Gc = 10, lo = 5e3, Qc = 3, Zc = 0;
function eu(e, t = () => Date.now()) {
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
        const p = f.getNode(c), g = p && p.closest ? p.closest("svg") : null;
        if (g) {
          const h = f.getId(g);
          h !== -1 && (u = h);
        }
      } catch {
      }
    return r.size < lo && r.set(c, u), u;
  }
  function s(c) {
    const l = i(c), u = t();
    let f = n.get(l);
    if (!f) {
      if (n.size >= lo)
        return !0;
      f = {
        tokens: uo,
        lastRefillMs: u
      }, n.set(l, f);
    }
    const p = (u - f.lastRefillMs) / 1e3;
    return p > 0 && (f.tokens = Math.min(
      uo,
      f.tokens + p * Gc
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function a(c) {
    var h, w, I;
    if (c.type !== Qc)
      return { event: c, dropped: 0 };
    const l = c.data;
    if (!l || l.source !== Zc || !l.attributes || l.attributes.length === 0)
      return { event: c, dropped: 0 };
    const u = l.attributes.length, f = l.attributes.filter(
      (C) => s(C.id)
    ), p = u - f.length;
    return p === 0 ? { event: c, dropped: 0 } : (l.attributes = f, {
      event: f.length > 0 || (((h = l.adds) == null ? void 0 : h.length) ?? 0) > 0 || (((w = l.removes) == null ? void 0 : w.length) ?? 0) > 0 || (((I = l.texts) == null ? void 0 : I.length) ?? 0) > 0 ? c : null,
      dropped: p
    });
  }
  return { throttle: a, reset: o };
}
const fo = "replay", tu = 200, nu = 6e4, ru = 5e3, ou = 8e6, Ni = 2, iu = 3, su = 4, po = 3e3, Di = 5e3, au = 3, cu = 3e4, uu = 5e3, lu = 16, fu = 100, du = 4, pu = 30, mo = 32, ho = 250, mu = 36e4;
function hu() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const yu = 3e5, gu = 9e5, _u = 1e3;
let Ee = null, oe = null, ot = null, We = [], Ke = 0, ve = "", Ui = "", Tr = !1, Hi = 0, Mn = "", Z = 0, be = Date.now(), ye = !1, Pt = 0, we = null, Je = !1, je = null, Fi = 0, G = [], Y = 0, $e = null, fe = null, Kt = 0;
function Ge() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const Ar = eu(
  () => (Ee == null ? void 0 : Ee.mirror) ?? null
);
let ze = null, Se = null, Ve = !1, Nt = !1, kr = 0, Jt = null, ee = null;
function vu() {
  $e && (clearTimeout($e), $e = null), fe && (fe(), fe = null);
}
function Jn(e, t) {
  vu();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    pu
  ) : null, r = e ? Ge() + (n ?? du) : Number.POSITIVE_INFINITY;
  for (; Y < G.length; ) {
    const o = Math.min(
      Y + mo,
      G.length
    );
    for (; Y < o; )
      Gn(
        G[Y++]
      );
    if (Ge() >= r) break;
  }
  if (Y >= G.length) {
    G = [], Y = 0;
    return;
  }
  Y >= mo * 8 && (G = G.slice(Y), Y = 0), Bi();
}
function pn() {
  Jn(!1);
}
function Bi() {
  if (!$e) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          fe = null, Jn(!0, t);
        },
        { timeout: fu }
      );
      fe = () => cancelIdleCallback(e);
    }
    $e = setTimeout(() => {
      $e = null, fe && (fe(), fe = null), Jn(!0);
    }, lu);
  }
}
function Dt(e = !1) {
  if (Je = !0, je) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - be, r = Math.max(
      0,
      Di - n
    ), o = Date.now() - Fi, i = Math.max(
      0,
      uu - o
    );
    t = Math.max(
      r,
      i
    );
  }
  je = setTimeout(() => {
    je = null, wu();
  }, t);
}
function wu() {
  if (!Je || !Ee || !oe || ye) return;
  Pt++;
  const e = Kt > ho ? 1 : au;
  if (Pt > e) {
    bu();
    return;
  }
  Fi = Date.now(), Z = 0, be = Date.now();
  try {
    const t = Ge();
    Ee.takeFullSnapshot(!0), Kt = Ge() - t, P("replay_rebases"), Kt > ho && P(
      "replay_expensive_snapshots"
    );
  } catch {
    Ht(), Ut();
  }
}
function yo() {
  P("replay_events_dropped");
}
function qi() {
  if (ve) return !1;
  ve = se(), Hi = Vs(), Ui = $s() ? "" : $o();
  const e = Mn !== "" && Mn !== ve;
  return Mn = ve, e;
}
function $t() {
  if (Eu(), We.length === 0) return;
  if (yn(fo)) {
    Su(), ji();
    return;
  }
  qi();
  const e = ve, t = Hi, n = Ui, r = We.splice(0), o = Ke;
  Ke = 0, ve = "", Tr = !0, hr(
    fo,
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
function Su() {
  Ke <= ou || (P(
    "replay_events_dropped",
    We.length
  ), We.length = 0, Ke = 0, Dt());
}
let Xe = null;
function Eu() {
  Xe && (clearTimeout(Xe), Xe = null);
}
function ji() {
  if (Xe) return;
  const e = O().replayFlushIntervalMs ?? ru;
  Xe = setTimeout(() => {
    Xe = null, $t();
  }, e);
}
function Gn(e) {
  !ve && !se() || (qi() && e.type !== Ni && Dt(!0), We.push(e), Ke += Qt(e), We.length >= tu || Ke >= nu ? $t() : ji());
}
function bu() {
  ye = !0, P("replay_overload_pauses"), Ht(), we && clearTimeout(we), we = setTimeout(() => {
    we = null, ye = !1, Pt = 0, Z = 0, be = Date.now(), !Ve && !Nt && ee && Ut();
  }, cu);
}
function Tu(e) {
  if (ye) return;
  if (e.type === Ni) {
    pn(), Je = !1, Z = 0, be = Date.now(), Gn(e);
    return;
  }
  if (e.type === su) {
    const r = e.data;
    typeof r.href == "string" && (r.href = gs(r.href));
  }
  if (e.type !== iu) {
    pn(), Gn(e);
    return;
  }
  if (Je) {
    yo(), Dt();
    return;
  }
  const t = Date.now();
  t - be > Di && (Z <= po && (Pt = 0), Z = 0, be = t);
  const n = Ar.throttle(e);
  if (n.dropped > 0 && P(
    "replay_attributes_throttled",
    n.dropped
  ), !!n.event) {
    if (Z++, Z > po) {
      yo(), Dt();
      return;
    }
    G.push(n.event), Bi();
  }
}
async function Ut() {
  if (ee && !ye && !oe)
    return ot || (ot = Au().finally(
      () => {
        ot = null;
      }
    ), ot);
}
async function Au() {
  if (!ee) return;
  const { record: e } = await import("./rrweb-SbAupvcM.js");
  !ee || ye || oe || (Ee = e, Je = !1, Z = 0, be = Date.now(), Ar.reset(), oe = e({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: hu() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: mu,
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
        Tu(t);
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
    blockSelector: Po,
    maskTextSelector: No,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => $t(), 200));
}
function Ht() {
  oe && (oe(), oe = null), je && (clearTimeout(je), je = null), Je = !1, pn(), $t();
}
function ku() {
  const e = O(), t = e.replayIdlePauseMs ?? yu, n = e.replayIdleExpireMs ?? gu;
  ze && clearTimeout(ze), Se && (clearTimeout(Se), Se = null), ze = setTimeout(() => {
    Ve = !0, Ht();
  }, t), Se = setTimeout(() => {
    Nt = !0, Ht();
  }, n);
}
function Gt() {
  kr = Ge(), ku();
}
function Iu() {
  if (Nt) {
    if (!Vo()) return;
    Nt = !1, Ve = !1, Ut(), Gt();
    return;
  }
  if (Ve) {
    Ve = !1, Ut(), Gt();
    return;
  }
  Ge() - kr >= _u && Gt();
}
function Cu() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => Iu(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  Jt = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function Mu() {
  Jt && (Jt(), Jt = null), ze && (clearTimeout(ze), ze = null), Se && (clearTimeout(Se), Se = null);
}
function Lu() {
  pn(), $t();
}
async function Ru() {
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
  }, Pa(() => {
    oe && Dt();
  }), fi(Lu), await Ut(), Cu(), Gt();
}
function xu() {
  return oe !== null && !ye;
}
function Ou() {
  return Tr;
}
function Pu() {
  Ht(), Mu(), fi(null), we && (clearTimeout(we), we = null), Ve = !1, Nt = !1, kr = 0, ye = !1, Tr = !1, Pt = 0, Z = 0, Kt = 0, G = [], Y = 0, Ar.reset(), ee = null, Ee = null;
}
let H = [], Q = null;
const Nu = [
  "error",
  "action",
  "console",
  "resource"
];
function Du(e) {
  return Nu.includes(e) && (yn(e) || !Kc(e)) ? (P("events_rate_limited"), !0) : !1;
}
function $i(e, t) {
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
function Uu() {
  if (!Q) {
    const e = navigator.userAgent;
    Q = {
      device_type: pl(e),
      browser_name: ml(e),
      browser_version: hl(e),
      os_name: yl(e),
      os_version: gl(e),
      user_agent: e,
      language: navigator.language
    };
  }
}
function Hu() {
  const e = navigator.connection;
  return typeof (e == null ? void 0 : e.effectiveType) == "string" ? e.effectiveType : "";
}
function zi(e) {
  Uu();
  const t = Ys(), n = za(), r = O(), o = e ?? se(), i = {
    event_id: Qe(),
    session_id: o,
    tab_id: $o(),
    view_id: Ii(),
    action_id: Sc(),
    ...Ss(
      Ko(),
      Ks(),
      Js()
    ),
    user_status: Gs(),
    service: r.service,
    env: r.env ?? "",
    version: r.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: $i(
      window.location,
      r.viewUrlQueryParams
    ),
    view_url_host: window.location.hostname,
    view_url_path: de(window.location.pathname),
    referrer_url: _s(document.referrer),
    device_type: Q.device_type,
    browser_name: Q.browser_name,
    browser_version: Q.browser_version,
    os_name: Q.os_name,
    os_version: Q.os_version,
    user_agent: ws() ? Q.user_agent : "",
    language: Q.language,
    session_view_count: t.viewCount,
    session_error_count: t.errorCount,
    session_action_count: t.actionCount,
    replay_id: xu() && Ou() ? o : ""
  };
  return Object.keys(n).length > 0 && (i.feature_flags = n), i;
}
function Fu(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const Vi = "events", Bu = ["session_id", "event_type", "timestamp"];
let go = !1;
function Xi(e) {
  const t = O().beforeSend;
  if (typeof t != "function") return e;
  const n = {};
  for (const r of Bu) n[r] = e[r];
  try {
    const r = t(e);
    if (r === null || r === !1) return null;
    if (es(r))
      throw new Error("it returned a promise; it must be synchronous");
    return { ...r && typeof r == "object" ? r : e, ...n };
  } catch (r) {
    return go || (go = !0, er(
      `beforeSend failed. Events are dropped until it is fixed: ${String(r)}`
    )), null;
  }
}
function Yi(e) {
  zs() && (e.session_is_new = 1);
}
function D(e) {
  if (!se() || !zo() || yn("events")) return;
  _c();
  const t = e(), n = t.event_type;
  if (Du(n)) return;
  n === "resource" && tl(t), Wo(n), dc(t), Ec(t);
  const r = { ...zi(), ...t };
  Yi(r);
  const o = Xi(r);
  o && hr(Vi, o);
}
function Ir(e) {
  Fu(
    () => D(e)
  );
}
function qu(e, t) {
  if (!zo() || yn("events")) return;
  e.view_update_seq === 1 && Wo("view");
  const n = {
    ...zi(t),
    ...e,
    action_id: "",
    connection_type: Hu(),
    screen_width: typeof screen < "u" ? screen.width : 0,
    screen_height: typeof screen < "u" ? screen.height : 0
  };
  e.view_update_seq === 1 && (n.view_is_new = 1), t === se() && Yi(n);
  const r = Xi(n);
  r && Fa(
    Vi,
    "view:" + String(e.view_id),
    r,
    (o, i) => {
      const s = { ...i }, a = o;
      return a.view_is_new === 1 && (s.view_is_new = 1), a.session_is_new === 1 && (s.session_is_new = 1), s;
    }
  );
}
function ju(e) {
  D(() => e);
}
function $u() {
  gc(
    qu,
    (e) => $i(e, O().viewUrlQueryParams)
  ), xc(ju), zu(), Wu(), Gu(), al(), cl(), ul(), ll();
}
function zu() {
  const e = (n) => {
    D(() => {
      var i, s, a;
      const r = n.message ?? "", o = typeof ((i = n.error) == null ? void 0 : i.message) == "string" ? n.error.message : r;
      return {
        event_type: "error",
        error_message: Ct(r),
        error_type: ((s = n.error) == null ? void 0 : s.name) ?? "Error",
        error_stack: rr(
          ((a = n.error) == null ? void 0 : a.stack) ?? "",
          o
        ),
        error_source: "source",
        error_handling: "unhandled"
      };
    });
  }, t = (n) => Wi(n.reason);
  window.addEventListener("error", e), window.addEventListener(
    "unhandledrejection",
    t
  ), Qn = !0, H.push(() => {
    window.removeEventListener("error", e), window.removeEventListener(
      "unhandledrejection",
      t
    ), Qn = !1;
  });
}
let Qn = !1;
const _o = /* @__PURE__ */ new WeakSet();
function Wi(e) {
  if (e !== null && typeof e == "object") {
    if (_o.has(e)) return;
    _o.add(e);
  }
  D(() => {
    const t = (e == null ? void 0 : e.message) ?? String(e);
    return {
      event_type: "error",
      error_message: Ct(t),
      error_type: (e == null ? void 0 : e.name) ?? "UnhandledRejection",
      error_stack: rr((e == null ? void 0 : e.stack) ?? "", t),
      error_source: "promise",
      error_handling: "unhandled"
    };
  });
}
let vo = !1;
function El() {
  const e = globalThis.Zone;
  if (vo || !e || typeof e.__symbol__ != "function")
    return;
  vo = !0;
  const t = e.__symbol__("unhandledPromiseRejectionHandler"), n = e[t];
  e[t] = function(r) {
    if (Qn)
      try {
        Wi(
          r && typeof r == "object" && "rejection" in r && "promise" in r ? r.rejection : r
        );
      } catch {
      }
    if (typeof n == "function")
      return n.call(this, r);
  };
}
function Ki(e) {
  return e instanceof Error || typeof e == "object" && e !== null && typeof e.message == "string" && typeof e.name == "string" && "stack" in e;
}
const Ye = 8192;
function Vu(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${Ye} bytes omitted]`;
}
function Xu(e) {
  if (typeof e == "string") return e;
  if (Ki(e))
    return e.message ? `${e.name}: ${e.message}` : e.name;
  if (Qt(
    e,
    Ye + 1
  ) > Ye)
    return Vu(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function Yu(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= Ye) break;
    t && (t += " "), t += Xu(n);
  }
  return t.length > Ye ? t.slice(0, Ye) + "… [truncated]" : t;
}
function Wu() {
  for (const e of vs()) {
    const t = console[e], n = (...r) => {
      try {
        const o = Ct(Yu(r)), i = e === "error" ? r.find(Ki) : void 0;
        D(() => {
          const s = {
            event_type: "console",
            console_level: e,
            console_message: o
          };
          return i && (s.error_type = i.name, s.error_message = Ct(i.message), s.error_stack = rr(
            i.stack ?? "",
            i.message
          ), s.error_source = "console", s.error_handling = "handled"), s;
        });
      } catch {
      }
      t.apply(console, r);
    };
    n[xo] = t, console[e] = n, H.push(() => {
      console[e] = t;
    });
  }
}
const Zn = "oodle_rum_tab_hidden";
function wo(e) {
  try {
    e ? sessionStorage.setItem(Zn, "1") : sessionStorage.removeItem(Zn);
  } catch {
  }
}
function Ku() {
  try {
    return sessionStorage.getItem(Zn) === "1";
  } catch {
    return !1;
  }
}
function Ju() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && Ku() && (wo(!1), D(() => ({
    event_type: "visibility",
    action_type: "tab_visible"
  })));
  let e = document.visibilityState === "hidden";
  const t = () => {
    const n = document.visibilityState === "hidden";
    n !== e && (e = n, wo(n), D(() => ({
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
function Cr(e) {
  const t = O().endpoint;
  return e.startsWith(t);
}
function Gu() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || Cr(r.name))
          continue;
        const i = It(r.name), s = Ji(r), a = Qu(o, r.name);
        Ir(
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
function Qu(e, t) {
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
function Ji(e) {
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
function Gi(e, t) {
  try {
    const n = performance.getEntriesByName(
      Qi(e),
      "resource"
    );
    for (let r = n.length - 1; r >= 0; r--) {
      const o = n[r];
      if (o.startTime >= t - 2)
        return {
          ...Ji(o),
          resource_size: o.transferSize ?? 0
        };
    }
  } catch {
  }
  return {};
}
function mn(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function Qi(e) {
  try {
    return new URL(e, location.href).href;
  } catch {
    return e;
  }
}
function Ln(e, t, n) {
  return n.some(
    (r) => typeof r == "string" ? e.startsWith(r) || t.startsWith(r) : r.test(e) || r.test(t)
  );
}
function Zi(e) {
  const t = Qi(e), n = O();
  let r = !1;
  const o = n.allowedTracingUrls;
  o && o.length > 0 && (r = Ln(
    t,
    e,
    o
  ));
  let i = null;
  const s = n.forwardNetworkBodies;
  s && Ln(
    t,
    e,
    s.urls
  ) && (i = s);
  let a = !1;
  const c = n.forwardNetworkHeaders;
  return c && (a = Ln(
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
let So = null, Eo = xi(void 0);
function kt(e) {
  const t = O().redactHeaders;
  return t !== So && (So = t, Eo = xi(t)), Eo(e);
}
function Zu(e) {
  const t = {};
  for (const n of Object.keys(e)) {
    const r = n.toLowerCase();
    kt(r) || (t[r] = e[n]);
  }
  return t;
}
const bo = [
  "request_headers",
  "response_headers",
  "request_body",
  "response_body"
];
let To = !1;
function es(e) {
  return !!e && (typeof e == "object" || typeof e == "function") && typeof e.then == "function";
}
function Ao(e) {
  if (!(typeof e != "string" || !e))
    try {
      const t = JSON.parse(e);
      return t && typeof t == "object" ? t : void 0;
    } catch {
      return;
    }
}
function ko(e) {
  if (!e || typeof e != "object") return "";
  const t = {};
  for (const [n, r] of Object.entries(e))
    r != null && (t[n.toLowerCase()] = String(r));
  return Object.keys(t).length > 0 ? JSON.stringify(t) : "";
}
let Io = null, Co = Oi(void 0);
function el() {
  const e = O().redactBodyKeys;
  return e !== Io && (Io = e, Co = Oi(e)), Co;
}
function tl(e) {
  var a;
  if (!bo.some((c) => e[c])) return;
  for (const c of ["request_body", "response_body"])
    typeof e[c] == "string" && e[c] && (e[c] = Vc(e[c], el()));
  const t = O().beforeSendNetwork;
  if (typeof t != "function") return;
  const n = {
    url: String(e.resource_url ?? ""),
    method: String(e.resource_method ?? ""),
    status: Number(e.resource_status ?? 0),
    requestHeaders: Ao(e.request_headers),
    responseHeaders: Ao(e.response_headers),
    requestBody: typeof e.request_body == "string" ? e.request_body : void 0,
    responseBody: typeof e.response_body == "string" ? e.response_body : void 0
  };
  let r;
  try {
    const c = t(n);
    if (es(c))
      throw new Error("it returned a promise; it must be synchronous");
    r = c === void 0 ? n : c;
  } catch (c) {
    To || (To = !0, er(
      `beforeSendNetwork failed. Captured headers and bodies are dropped until it is fixed: ${String(c)}`
    )), r = null;
  }
  for (const c of bo) delete e[c];
  if (!r || typeof r != "object") return;
  const o = ((a = O().forwardNetworkBodies) == null ? void 0 : a.maxBodySize) ?? 65536, i = ko(r.requestHeaders), s = ko(r.responseHeaders);
  i && (e.request_headers = i), s && (e.response_headers = s), typeof r.requestBody == "string" && r.requestBody && (e.request_body = pe(r.requestBody, o)), typeof r.responseBody == "string" && r.responseBody && (e.response_body = pe(r.responseBody, o));
}
function ts(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      kt(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      kt(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      kt(r) || (t[r] = e[n]);
    }
  return t;
}
function nl(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    kt(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function pe(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function rl(e, t) {
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
function ol(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function il(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      ts(
        e
      )
    );
  } catch {
    return "";
  }
}
function Mo(e) {
  try {
    return JSON.stringify(
      ts(e)
    );
  } catch {
    return "";
  }
}
function ns(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function sl(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: pe(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: pe(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : ns(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => pe(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function rs(e, t, n) {
  const r = function(o, i) {
    const s = ol(o);
    if (Cr(s))
      return t.apply(e, [
        o,
        i
      ]);
    const a = ns(o), c = ((i == null ? void 0 : i.method) ?? (a ? o.method : "GET")).toUpperCase(), l = performance.now(), u = Zi(s), f = hi();
    let p = !1;
    const g = () => {
      p || (p = !0, yi(f));
    };
    let h = "", w = "";
    if (n.injectTracing) {
      const T = Pi();
      if (T)
        h = T.traceId, w = T.spanId;
      else if (u.trace) {
        h = mn(16), w = mn(8);
        const E = new Headers(
          (i == null ? void 0 : i.headers) ?? {}
        );
        E.set(
          "traceparent",
          `00-${h}-${w}-01`
        ), i = { ...i, headers: E };
      }
    }
    let I = "", C = null;
    if (u.bodyCfg) {
      const T = u.bodyCfg.maxBodySize ?? 65536, E = sl(
        i,
        o,
        T
      );
      I = E.sync, C = E.asyncP;
    }
    let k = "";
    return u.captureHeaders && (i != null && i.headers ? k = il(
      i.headers
    ) : a && (k = Mo(
      o.headers
    ))), t.apply(e, [o, i]).then((T) => {
      g();
      const E = T.status, M = Math.round(
        performance.now() - l
      );
      let y = "";
      u.captureHeaders && (y = Mo(
        T.headers
      ));
      const _ = (d) => {
        const b = {
          event_type: "resource",
          resource_url: It(s),
          resource_method: c,
          resource_status: E,
          resource_duration_ms: M,
          resource_size: 0,
          resource_type: "fetch",
          ...Gi(s, l)
        };
        return h && (b.trace_id = h, b.span_id = w), d && (b.request_body = d), k && (b.request_headers = k), y && (b.response_headers = y), b;
      }, m = C || Promise.resolve(I);
      if (u.bodyCfg) {
        const d = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          m,
          rl(
            T.clone(),
            d
          ).catch(() => "")
        ]).then(([b, K]) => {
          D(() => {
            const R = _(b);
            return K && (R.response_body = K), R;
          });
        }).catch(() => {
          m.then((b) => {
            D(
              () => _(b)
            );
          });
        });
      } else
        m.then((d) => {
          D(() => _(d));
        });
      return T;
    }).catch((T) => {
      g();
      const E = Math.round(
        performance.now() - l
      );
      throw (C || Promise.resolve(I)).then((y) => {
        D(() => {
          const _ = {
            event_type: "resource",
            resource_url: It(s),
            resource_method: c,
            resource_status: 0,
            resource_duration_ms: E,
            resource_size: 0,
            resource_type: "fetch"
          };
          return h && (_.trace_id = h, _.span_id = w), y && (_.request_body = y), k && (_.request_headers = k), _;
        });
      }), T;
    });
  };
  return e.fetch = r, () => {
    e.fetch = t;
  };
}
function os(e, t, n) {
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
    if (Cr(a))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const c = Zi(a);
    let l = "", u = "";
    if (n.injectTracing) {
      const y = Pi();
      y ? (l = y.traceId, u = y.spanId) : c.trace && (l = mn(16), u = mn(8), i.call(
        this,
        "traceparent",
        `00-${l}-${u}-01`
      ));
    }
    let f = "";
    if (c.bodyCfg && s) {
      const y = c.bodyCfg.maxBodySize ?? 65536;
      typeof s == "string" ? f = pe(
        s,
        y
      ) : typeof URLSearchParams < "u" && s instanceof URLSearchParams && (f = pe(
        s.toString(),
        y
      ));
    }
    let p = "";
    if (c.captureHeaders)
      try {
        const y = this.__oodleReqHeaders, _ = y ? Zu(y) : {};
        Object.keys(_).length > 0 && (p = JSON.stringify(_));
      } catch {
      }
    const g = performance.now(), h = this, w = hi(), I = l, C = u, k = f, T = c.bodyCfg, E = p, M = c.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        yi(w);
        const y = Math.round(
          performance.now() - g
        ), _ = h.__oodleMethod ?? "GET";
        D(() => {
          const m = {
            event_type: "resource",
            resource_url: It(a),
            resource_method: _,
            resource_status: h.status,
            resource_duration_ms: y,
            resource_size: 0,
            resource_type: "xhr",
            ...Gi(a, g)
          };
          if (I && (m.trace_id = I, m.span_id = C), k && (m.request_body = k), T)
            try {
              const d = h.responseText ?? "";
              m.response_body = pe(
                d,
                T.maxBodySize ?? 65536
              );
            } catch {
            }
          if (E && (m.request_headers = E), M)
            try {
              const d = h.getAllResponseHeaders();
              d && (m.response_headers = JSON.stringify(
                nl(d)
              ));
            } catch {
            }
          return m;
        });
      }
    ), o.apply(this, [s]);
  }, () => {
    e.open = r, e.send = o, e.setRequestHeader = i;
  };
}
const is = {
  injectTracing: !0
}, Lo = {
  injectTracing: !1
};
function al() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = rs(
    window,
    window.fetch,
    is
  );
  H.push(e);
}
function cl() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = os(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    is
  );
  H.push(e);
}
const Ro = /* @__PURE__ */ new WeakSet();
function Rn(e) {
  if (Ro.has(e)) return;
  Ro.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (rs(
        n,
        n.fetch,
        Lo
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (os(
        r.prototype,
        r.prototype.setRequestHeader,
        Lo
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), H.push(() => {
    e.removeEventListener("load", t);
  });
}
function ul() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach(Rn);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          r instanceof HTMLIFrameElement && Rn(r), r instanceof HTMLElement && r.childElementCount > 0 && r.querySelectorAll("iframe").forEach(Rn);
    }
  );
  e.observe(document.documentElement, {
    childList: !0,
    subtree: !0
  }), H.push(() => {
    e.disconnect();
  });
}
function ll() {
  if (!(typeof PerformanceObserver > "u") && !fl())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            Ir(() => ({
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
function fl() {
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
          Ir(() => ({
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
function dl(e, t) {
  D(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function pl(e) {
  return /iPad|Tablet/i.test(e) || /Android/i.test(e) && !/Mobi/i.test(e) ? "tablet" : /Mobi|iPhone|iPod|Android/i.test(e) ? "mobile" : "desktop";
}
const ss = [
  ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
  ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
  ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
  ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
  ["Safari", /Version\/([\d.]+).*Safari/]
];
function ml(e) {
  for (const [t, n] of ss) if (n.test(e)) return t;
  return e.includes("Safari") ? "Safari" : "Other";
}
function hl(e) {
  for (const [, t] of ss) {
    const n = e.match(t);
    if (n) return n[1];
  }
  return "";
}
function yl(e) {
  return /iPhone|iPad|iPod/.test(e) ? "iOS" : e.includes("Android") ? "Android" : e.includes("CrOS") ? "Chrome OS" : e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : "Other";
}
function gl(e) {
  let t = e.match(/OS (\d+[_.]\d+(?:[_.]\d+)?) like Mac OS X/);
  return t ? t[1].replace(/_/g, ".") : (t = e.match(/Android ([\d.]+)/), t || (t = e.match(/Windows NT ([\d.]+)/), t) ? t[1] : (t = e.match(/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/), t ? t[1].replace(/_/g, ".") : ""));
}
function _l() {
  Li(), Ci();
  for (const e of H)
    e();
  H = [];
}
let ge = !1;
const bl = {
  init(e) {
    ge || Rs(e) && (Zs(e.tags), Us(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), ge = !0, jo(), Ju(), Wr(), Xs(), ia(), qa(() => {
      Wr();
    }), e.sessionReplay !== !1 && Vo() && Ru(), $u(), e.openTelemetry && import("./tracing-BELnmqDB.js").then(
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
    ea(e);
  },
  identify(e) {
    Ws(e);
  },
  trackEvent(e, t) {
    ge && dl(e, t);
  },
  addFeatureFlag(e, t) {
    $a(e, t);
  },
  getSessionId() {
    return ge ? se() : "";
  },
  getUserId() {
    return Ko();
  },
  flush() {
    ge && ie();
  },
  stop() {
    ge && (Pu(), _l(), sa(), Yo(), ie(!0), Va(), ja(), ge = !1);
  }
};
export {
  bl as O,
  wl as a,
  El as c,
  vl as r,
  Sl as s
};
