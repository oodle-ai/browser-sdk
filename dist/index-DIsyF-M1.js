const Lo = "__oodleOriginal";
function Qn(e) {
  try {
    const t = console.warn;
    (t[Lo] ?? t).call(
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
function os() {
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
let T = os();
const En = "/:redacted", is = 256, it = /* @__PURE__ */ new Map();
let Rn = !1;
const Te = Qn;
function Me(e, t, n, r, o) {
  return t === void 0 ? r : typeof t == "string" && n.includes(t) ? t : (Te(
    `${e} must be one of ${n.map((i) => `'${i}'`).join(", ")}. Using '${o}'.`
  ), o);
}
function ss(e) {
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
function as(e) {
  if (e === void 0) return [];
  if (!Array.isArray(e))
    return Te(
      "urlPathPatterns must be an array of path patterns such as '/projects/:id'. It is ignored."
    ), [];
  const t = [];
  for (const n of e) {
    const r = ss(n);
    r ? t.push(r) : Te(
      `urlPathPatterns: ${JSON.stringify(n)} is not a valid pattern. Patterns start with '/', use ':name' for one segment and may end in '/*'. It is ignored.`
    );
  }
  return t;
}
function cs(e) {
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
function us(e) {
  it.clear(), Rn = !1;
  const t = e.maskUrlPath;
  t !== void 0 && typeof t != "function" && Te("maskUrlPath must be a function. It is ignored."), T = {
    patterns: as(e.urlPathPatterns),
    maskFn: typeof t == "function" ? t : null,
    referrer: Me(
      "referrerUrl",
      e.referrerUrl,
      ["path", "origin", "none"],
      "path",
      "none"
    ),
    consoleLevels: cs(
      e.consoleLevels
    ),
    messages: Me(
      "errorMessages",
      e.errorMessages,
      ["full", "scrub", "none"],
      "full",
      "none"
    ),
    // Text the replay masks must not reappear in click events.
    actionText: Me(
      "actionText",
      e.actionText,
      ["full", "mask"],
      e.privacyLevel === "mask" ? "mask" : "full",
      "mask"
    ),
    userAgent: Me(
      "userAgent",
      e.userAgent,
      ["full", "none"],
      "full",
      "none"
    ),
    queryStrings: Me(
      "stripQueryStrings",
      e.stripQueryStrings,
      ["events", "all"],
      "events",
      "all"
    ),
    userInfo: Me(
      "userInfo",
      e.userInfo,
      ["full", "id", "none"],
      "full",
      "none"
    ),
    keepParams: Array.isArray(e.viewUrlQueryParams) ? e.viewUrlQueryParams : []
  };
}
function Zn() {
  return T.patterns.length > 0 || T.maskFn !== null;
}
function ls(e) {
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
function fs(e) {
  let t = T.patterns.length > 0 ? ls(e) : e;
  if (T.maskFn)
    try {
      const n = T.maskFn(t);
      t = typeof n == "string" ? n : En;
    } catch (n) {
      Rn || (Rn = !0, Te(
        `maskUrlPath threw. Paths are sent as '${En}' until it is fixed: ${String(n)}`
      )), t = En;
    }
  return t;
}
function fe(e) {
  if (!Zn()) return e;
  const t = it.get(e);
  if (t !== void 0) return t;
  const n = fs(e);
  return it.size >= is && it.clear(), it.set(e, n), n;
}
function ds(e) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(e);
}
function kt(e, t) {
  if (ds(e)) {
    let n;
    try {
      n = new URL(e);
    } catch {
      return e;
    }
    return n.protocol !== "http:" && n.protocol !== "https:" ? n.protocol === "data:" ? "data:" : n.origin + n.pathname : n.origin + fe(n.pathname);
  }
  try {
    const n = t ?? (typeof location < "u" ? location.href : "http://localhost/"), r = new URL(e, n);
    return r.origin === new URL(n).origin ? fe(r.pathname) : r.origin + fe(r.pathname);
  } catch {
    const n = e.search(/[?#]/);
    return n >= 0 ? e.slice(0, n) : e;
  }
}
function Mo(e) {
  return !Zn() || typeof e != "string" ? e : er(e, (t) => t.search + t.hash);
}
function pl() {
  return Zn() || T.queryStrings === "all";
}
function ps(e) {
  return T.queryStrings !== "all" ? Mo(e) : typeof e != "string" ? e : er(e, (t) => {
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
function ml(e) {
  return T.queryStrings !== "all" ? Mo(e) : typeof e != "string" ? e : er(e, () => "");
}
function er(e, t) {
  let n;
  try {
    n = new URL(e);
  } catch {
    return e;
  }
  return n.protocol !== "http:" && n.protocol !== "https:" ? e : n.origin + fe(n.pathname) + t(n);
}
let Mr = null, Rr = "", Or = null;
function ms(e) {
  if (e === Mr && Or === T)
    return Rr;
  let t = "";
  if (e && T.referrer !== "none")
    try {
      const n = new URL(e);
      t = T.referrer === "origin" ? n.origin : n.origin + fe(n.pathname);
    } catch {
      t = T.referrer === "origin" ? "" : e;
    }
  return Mr = e, Rr = t, Or = T, t;
}
function hs() {
  return T.consoleLevels;
}
function ys() {
  return T.userAgent === "full";
}
function gs(e, t, n) {
  switch (T.userInfo) {
    case "full":
      return { user_id: e, user_name: t, user_email: n };
    case "id":
      return { user_id: e, user_name: "", user_email: "" };
    default:
      return { user_id: "", user_name: "", user_email: "" };
  }
}
const _s = [
  [/(^|[^\w])'(?:[^'\\\n]|\\.){0,500}'/g, "$1'?'"],
  [/(^|[^\w])"(?:[^"\\\n]|\\.){0,500}"/g, '$1"?"'],
  [/(^|[^\w])`(?:[^`\\\n]|\\.){0,500}`/g, "$1`?`"]
], vs = /\bhttps?:\/\/[^\s'"`<>()\]]+/g, ws = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, Ss = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, Es = /\b(?=[0-9a-fA-F]*\d)(?=[0-9a-fA-F]*[a-fA-F])[0-9a-fA-F]{16,}\b/g, bs = /\d{4,}/g, xr = 8192;
function Ts(e) {
  if (!e) return e;
  let t = e.length > xr ? e.slice(0, xr) + "… [truncated]" : e;
  t = t.replace(vs, (n) => kt(n)), t.includes("@") && (t = t.replace(ws, "<email>"));
  for (const [n, r] of _s)
    t = t.replace(n, r);
  return t = t.replace(Ss, "<id>"), t = t.replace(Es, "<id>"), t = t.replace(bs, "<n>"), t;
}
const As = /^\s+at |^[^\s@]*@\S+:\d+(?::\d+)?$/m;
function It(e) {
  switch (T.messages) {
    case "full":
      return e;
    case "scrub":
      return Ts(e);
    default:
      return "";
  }
}
function tr(e, t) {
  if (T.messages === "full" || !e || !t) return e;
  const n = As.exec(e), r = n ? n.index : e.length, o = e.indexOf(t);
  if (o < 0 || o + t.length > r)
    return e;
  const i = It(t);
  let s = e.slice(0, o) + i;
  return i || (s = s.replace(/:\s*$/, "")), s + e.slice(o + t.length);
}
const Ro = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', Oo = '[data-oodle-privacy="mask"],.oodle-privacy-mask', ks = Ro + "," + Oo + ",.rr-block,.rr-mask";
function Is(e) {
  if (T.actionText === "mask") return !0;
  try {
    return typeof e.closest == "function" && e.closest(ks) !== null;
  } catch {
    return !0;
  }
}
let On = null;
function Cs(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function Ls(e) {
  if (!Cs(e.endpoint))
    return console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    ), !1;
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  );
  const t = Ms(
    e.viewUrlQueryParams
  );
  return us({ ...e, viewUrlQueryParams: t }), On = { ...e, viewUrlQueryParams: t }, !0;
}
function Ms(e) {
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
  if (!On)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return On;
}
const nr = "__oodle_session_v2", rr = "__oodle_tab", Pr = "__oodle_session", xo = 900 * 1e3, or = 14400 * 1e3, ir = 1e3;
function Qe() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
let at = null, $ = null;
function sr(e, t) {
  try {
    const n = e == null ? void 0 : e.getItem(t);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function ar(e, t, n) {
  try {
    e == null || e.setItem(t, JSON.stringify(n));
  } catch {
  }
}
function Po() {
  try {
    return typeof localStorage < "u" ? localStorage : void 0;
  } catch {
    return;
  }
}
function Ct() {
  try {
    return typeof sessionStorage < "u" ? sessionStorage : void 0;
  } catch {
    return;
  }
}
const Rs = 1e3;
let Ae = 0;
function te() {
  const e = Date.now();
  if (at && e - Ae < Rs) return at;
  Ae = e;
  const t = sr(Po(), nr);
  return t && typeof t.id == "string" && t.id ? Os({
    id: t.id,
    createdAt: t.createdAt ?? Date.now(),
    lastActivity: t.lastActivity ?? Date.now(),
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: t.started ?? !0
  }) : at;
}
function Os(e) {
  return e && (at = e), e;
}
function Ft(e) {
  at = e, Ae = Date.now(), ar(Po(), nr, e);
}
function No() {
  if ($) return $;
  const e = sr(Ct(), rr);
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
function xs(e) {
  $ = e, ar(Ct(), rr, e);
}
let xe = null;
function Ps(e) {
  $ = e, !xe && (xe = setTimeout(() => {
    xe = null, $ && ar(Ct(), rr, $);
  }, 1e3));
}
function Bt(e) {
  xe && (clearTimeout(xe), xe = null), xs(e);
}
let Do = 100, Uo = 100;
function Ns(e, t) {
  Do = Math.max(0, Math.min(100, e)), Uo = Math.max(0, Math.min(100, t));
}
function Nr(e) {
  return Math.random() * 100 < e;
}
function Lt(e, t) {
  return !!e && t - e.lastActivity <= xo && t - e.createdAt <= or;
}
function Ds(e) {
  var r;
  const t = sr(Ct(), Pr);
  if (!t || typeof t.id != "string") return !1;
  const n = {
    id: t.id,
    createdAt: t.createdAt ?? e,
    lastActivity: t.lastActivity ?? e,
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: !0
  };
  if (e - n.lastActivity > 1800 * 1e3 || e - n.createdAt > or)
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
    (r = Ct()) == null || r.removeItem(Pr);
  } catch {
  }
  return !0;
}
function Us(e) {
  const t = Nr(Do), n = {
    id: Qe(),
    createdAt: e,
    lastActivity: e,
    sampled: t,
    replaySampled: t && Nr(Uo),
    started: !1
  };
  return Ft(n), n;
}
const xn = /* @__PURE__ */ new Set();
function Hs(e) {
  return xn.add(e), () => xn.delete(e);
}
function qt() {
  let e = No();
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
function cr(e) {
  const t = qt();
  if (t.sessionId === e) return;
  const n = t.sessionId;
  if (t.sessionId = e, t.viewCount = 0, t.errorCount = 0, t.actionCount = 0, t.replaySegmentSeq = 0, t.legacyReplay = !1, Bt(t), n)
    for (const r of xn)
      try {
        r(n, e);
      } catch {
      }
}
let ct = 0;
function Dr() {
  const e = Date.now();
  Ae = 0;
  const t = te();
  Lt(t, e) && (e - ct >= ir && (t.lastActivity = Math.max(t.lastActivity, e), Ft(t), ct = e), cr(t.id));
}
const Fs = 6e4;
function Ho() {
  const e = Date.now();
  let t = te();
  Lt(t, e) || (Ae = 0, t = te()), Lt(t, e) ? e - ct >= ir && (t.lastActivity = Math.max(t.lastActivity, e), Ft(t), ct = e) : (Ds(e) ? t = te() : t = Us(e), ct = e), t && cr(t.id);
}
function ie() {
  const e = Date.now(), t = te();
  return Lt(t, e) ? (cr(t.id), t.id) : "";
}
function Bs(e) {
  Ae = 0;
  const t = te();
  if (!t || t.id !== e) return null;
  const n = Math.min(
    t.lastActivity + xo,
    t.createdAt + or
  );
  return Date.now() > n ? n : null;
}
function Fo() {
  return qt().tabId;
}
function qs() {
  return qt().legacyReplay;
}
function $s() {
  const e = Date.now(), t = te();
  return !Lt(t, e) || t.started ? !1 : (t.started = !0, Ft(t), !0);
}
function js() {
  if (!ie()) return 0;
  const e = qt(), t = e.replaySegmentSeq;
  return e.replaySegmentSeq = t + 1, Bt(e), t;
}
function Bo() {
  const e = te();
  return (e == null ? void 0 : e.sampled) ?? !0;
}
function qo() {
  const e = te();
  return (e == null ? void 0 : e.replaySampled) ?? !0;
}
let ut = null, lt = null, Vt = null, ft = null;
const $o = ["click", "keydown", "touchstart", "scroll"];
function zs() {
  if (typeof document > "u") return;
  jo();
  let e = 0;
  ut = () => {
    const t = Date.now();
    t - e < ir || (e = t, Ho());
  };
  for (const t of $o)
    document.addEventListener(t, ut, {
      capture: !0,
      passive: !0
    });
  ft = (t) => {
    t.key === nr && (Ae = 0);
  }, window.addEventListener("storage", ft), lt = () => {
    document.visibilityState === "visible" ? Dr() : $ && Bt($);
  }, document.addEventListener("visibilitychange", lt), Vt = setInterval(() => {
    document.visibilityState === "visible" && Dr();
  }, Fs);
}
function jo() {
  if (!(typeof document > "u")) {
    if (ut) {
      for (const e of $o)
        document.removeEventListener(e, ut, {
          capture: !0
        });
      ut = null;
    }
    lt && (document.removeEventListener("visibilitychange", lt), lt = null), Vt && (clearInterval(Vt), Vt = null), ft && (window.removeEventListener("storage", ft), ft = null);
  }
}
function zo(e) {
  if (!ie()) return;
  const t = qt();
  e === "view" || e === "page_load" ? t.viewCount++ : e === "error" ? t.errorCount++ : e === "action" && t.actionCount++, Ps(t);
}
function Vs() {
  const e = $ ?? No();
  return {
    viewCount: (e == null ? void 0 : e.viewCount) ?? 0,
    errorCount: (e == null ? void 0 : e.errorCount) ?? 0,
    actionCount: (e == null ? void 0 : e.actionCount) ?? 0
  };
}
let j = null;
function Xs(e) {
  j = e;
}
function Vo() {
  return (j == null ? void 0 : j.id) ?? "";
}
function Ys() {
  return (j == null ? void 0 : j.name) ?? "";
}
function Ws() {
  return (j == null ? void 0 : j.email) ?? "";
}
function Js() {
  return j ? "identified" : "anonymous";
}
const Ks = 5e5;
function Qt(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > Ks) return n;
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
let Mt = {};
function Gs(e) {
  e && (Mt = { ...e, ...Mt });
}
function Qs(e) {
  Mt = { ...Mt, ...e };
}
function Zs() {
  return Mt;
}
const ea = 6e4, ta = "sdk_telemetry", Pe = {
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
  Pe[e] += t;
}
function na() {
  for (const e in Pe)
    if (Pe[e] > 0)
      return !0;
  return !1;
}
function Pn() {
  if (!na()) return;
  const e = { ...Pe };
  for (const t in Pe)
    Pe[t] = 0;
  pr(ta, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let dt = null, pt = null;
function ra() {
  dt || (dt = setInterval(
    Pn,
    ea
  ), typeof document < "u" && (pt = () => {
    document.visibilityState === "hidden" && Pn();
  }, document.addEventListener(
    "visibilitychange",
    pt
  )));
}
function oa() {
  dt && (clearInterval(dt), dt = null), pt && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    pt
  ), pt = null), Pn();
}
var U = Uint8Array, N = Uint16Array, ur = Int32Array, lr = new U([
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
]), fr = new U([
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
]), Ur = new U([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Xo = function(e, t) {
  for (var n = new N(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new ur(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, Yo = Xo(lr, 2), ia = Yo.b, Nn = Yo.r;
ia[28] = 258, Nn[258] = 28;
var sa = Xo(fr, 0), Hr = sa.r, Dn = new N(32768);
for (var b = 0; b < 32768; ++b) {
  var ae = (b & 43690) >> 1 | (b & 21845) << 1;
  ae = (ae & 52428) >> 2 | (ae & 13107) << 2, ae = (ae & 61680) >> 4 | (ae & 3855) << 4, Dn[b] = ((ae & 65280) >> 8 | (ae & 255) << 8) >> 1;
}
var mt = (function(e, t, n) {
  for (var r = e.length, o = 0, i = new N(t); o < r; ++o)
    e[o] && ++i[e[o] - 1];
  var s = new N(t);
  for (o = 1; o < t; ++o)
    s[o] = s[o - 1] + i[o - 1] << 1;
  var c;
  if (n) {
    c = new N(1 << t);
    var a = 15 - t;
    for (o = 0; o < r; ++o)
      if (e[o])
        for (var l = o << 4 | e[o], u = t - e[o], f = s[e[o] - 1]++ << u, m = f | (1 << u) - 1; f <= m; ++f)
          c[Dn[f] >> a] = l;
  } else
    for (c = new N(r), o = 0; o < r; ++o)
      e[o] && (c[o] = Dn[s[e[o] - 1]++] >> 15 - e[o]);
  return c;
}), ke = new U(288);
for (var b = 0; b < 144; ++b)
  ke[b] = 8;
for (var b = 144; b < 256; ++b)
  ke[b] = 9;
for (var b = 256; b < 280; ++b)
  ke[b] = 7;
for (var b = 280; b < 288; ++b)
  ke[b] = 8;
var Zt = new U(32);
for (var b = 0; b < 32; ++b)
  Zt[b] = 5;
var aa = /* @__PURE__ */ mt(ke, 9, 0), ca = /* @__PURE__ */ mt(Zt, 5, 0), Wo = function(e) {
  return (e + 7) / 8 | 0;
}, Jo = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new U(e.subarray(t, n));
}, J = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, tt = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, bn = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: Go, l: 0 };
  if (o == 1) {
    var s = new U(n[0].s + 1);
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
  var h = new N(m + 1), g = Un(n[u - 1], h, 0);
  if (g > t) {
    var r = 0, v = 0, k = g - t, I = 1 << k;
    for (i.sort(function(w, S) {
      return h[S.s] - h[w.s] || w.f - S.f;
    }); r < o; ++r) {
      var E = i[r].s;
      if (h[E] > t)
        v += I - (1 << g - h[E]), h[E] = t;
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
  return { t: new U(h), l: g };
}, Un = function(e, t, n) {
  return e.s == -1 ? Math.max(Un(e.l, t, n + 1), Un(e.r, t, n + 1)) : t[e.s] = n;
}, Fr = function(e) {
  for (var t = e.length; t && !e[--t]; )
    ;
  for (var n = new N(++t), r = 0, o = e[0], i = 1, s = function(a) {
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
}, nt = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, Ko = function(e, t, n) {
  var r = n.length, o = Wo(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, Br = function(e, t, n, r, o, i, s, c, a, l, u) {
  J(t, u++, n), ++o[256];
  for (var f = bn(o, 15), m = f.t, h = f.l, g = bn(i, 15), v = g.t, k = g.l, I = Fr(m), E = I.c, A = I.n, L = Fr(v), y = L.c, w = L.n, S = new N(19), p = 0; p < E.length; ++p)
    ++S[E[p] & 31];
  for (var p = 0; p < y.length; ++p)
    ++S[y[p] & 31];
  for (var d = bn(S, 7), M = d.t, W = d.l, P = 19; P > 4 && !M[Ur[P - 1]]; --P)
    ;
  var Ie = l + 5 << 3, F = nt(o, ke) + nt(i, Zt) + s, B = nt(o, m) + nt(i, v) + s + 14 + 3 * P + nt(S, M) + 2 * S[16] + 3 * S[17] + 7 * S[18];
  if (a >= 0 && Ie <= F && Ie <= B)
    return Ko(t, u, e.subarray(a, a + l));
  var z, C, q, se;
  if (J(t, u, 1 + (B < F)), u += 2, B < F) {
    z = mt(m, h, 0), C = m, q = mt(v, k, 0), se = v;
    var _n = mt(M, W, 0);
    J(t, u, A - 257), J(t, u + 5, w - 1), J(t, u + 10, P - 4), u += 14;
    for (var p = 0; p < P; ++p)
      J(t, u + 3 * p, M[Ur[p]]);
    u += 3 * P;
    for (var V = [E, y], et = 0; et < 2; ++et)
      for (var Ce = V[et], p = 0; p < Ce.length; ++p) {
        var X = Ce[p] & 31;
        J(t, u, _n[X]), u += M[X], X > 15 && (J(t, u, Ce[p] >> 5 & 127), u += Ce[p] >> 12);
      }
  } else
    z = aa, C = ke, q = ca, se = Zt;
  for (var p = 0; p < c; ++p) {
    var R = r[p];
    if (R > 255) {
      var X = R >> 18 & 31;
      tt(t, u, z[X + 257]), u += C[X + 257], X > 7 && (J(t, u, R >> 23 & 31), u += lr[X]);
      var Le = R & 31;
      tt(t, u, q[Le]), u += se[Le], Le > 3 && (tt(t, u, R >> 5 & 8191), u += fr[Le]);
    } else
      tt(t, u, z[R]), u += C[R];
  }
  return tt(t, u, z[256]), u + C[256];
}, ua = /* @__PURE__ */ new ur([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Go = /* @__PURE__ */ new U(0), la = function(e, t, n, r, o, i) {
  var s = i.z || e.length, c = new U(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = c.subarray(r, c.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (a[0] = i.r >> 3);
    for (var f = ua[t - 1], m = f >> 13, h = f & 8191, g = (1 << n) - 1, v = i.p || new N(32768), k = i.h || new N(g + 1), I = Math.ceil(n / 3), E = 2 * I, A = function(Sn) {
      return (e[Sn] ^ e[Sn + 1] << I ^ e[Sn + 2] << E) & g;
    }, L = new ur(25e3), y = new N(288), w = new N(32), S = 0, p = 0, d = i.i || 0, M = 0, W = i.w || 0, P = 0; d + 2 < s; ++d) {
      var Ie = A(d), F = d & 32767, B = k[Ie];
      if (v[F] = B, k[Ie] = F, W <= d) {
        var z = s - d;
        if ((S > 7e3 || M > 24576) && (z > 423 || !l)) {
          u = Br(e, a, 0, L, y, w, p, M, P, d - P, u), M = S = p = 0, P = d;
          for (var C = 0; C < 286; ++C)
            y[C] = 0;
          for (var C = 0; C < 30; ++C)
            w[C] = 0;
        }
        var q = 2, se = 0, _n = h, V = F - B & 32767;
        if (z > 2 && Ie == A(d - V))
          for (var et = Math.min(m, z) - 1, Ce = Math.min(32767, d), X = Math.min(258, z); V <= Ce && --_n && F != B; ) {
            if (e[d + q] == e[d + q - V]) {
              for (var R = 0; R < X && e[d + R] == e[d + R - V]; ++R)
                ;
              if (R > q) {
                if (q = R, se = V, R > et)
                  break;
                for (var Le = Math.min(V, R - 2), kr = 0, C = 0; C < Le; ++C) {
                  var vn = d - V + C & 32767, rs = v[vn], Ir = vn - rs & 32767;
                  Ir > kr && (kr = Ir, B = vn);
                }
              }
            }
            F = B, B = v[F], V += F - B & 32767;
          }
        if (se) {
          L[M++] = 268435456 | Nn[q] << 18 | Hr[se];
          var Cr = Nn[q] & 31, Lr = Hr[se] & 31;
          p += lr[Cr] + fr[Lr], ++y[257 + Cr], ++w[Lr], W = d + q, ++S;
        } else
          L[M++] = e[d], ++y[e[d]];
      }
    }
    for (d = Math.max(d, W); d < s; ++d)
      L[M++] = e[d], ++y[e[d]];
    u = Br(e, a, l, L, y, w, p, M, P, d - P, u), l || (i.r = u & 7 | a[u / 8 | 0] << 3, u -= 7, i.h = k, i.p = v, i.i = d, i.w = W);
  } else {
    for (var d = i.w || 0; d < s + l; d += 65535) {
      var wn = d + 65535;
      wn >= s && (a[u / 8 | 0] = l, wn = s), u = Ko(a, u + 1, e.subarray(d, wn));
    }
    i.i = s;
  }
  return Jo(c, 0, r + Wo(u) + o);
}, fa = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), da = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = fa[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, pa = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new U(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return la(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, Hn = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, ma = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && Hn(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, ha = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function ya(e, t) {
  t || (t = {});
  var n = da(), r = e.length;
  n.p(e);
  var o = pa(e, t, ha(t), 8), i = o.length;
  return ma(o, t), Hn(o, i - 8, n.d()), Hn(o, i - 4, r), o;
}
var qr = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), ga = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), _a = 0;
try {
  ga.decode(Go, { stream: !0 }), _a = 1;
} catch {
}
function va(e, t) {
  var n;
  if (qr)
    return qr.encode(e);
  for (var r = e.length, o = new U(e.length + (e.length >> 1)), i = 0, s = function(l) {
    o[i++] = l;
  }, n = 0; n < r; ++n) {
    if (i + 5 > o.length) {
      var c = new U(i + 8 + (r - n << 1));
      c.set(o), o = c;
    }
    var a = e.charCodeAt(n);
    a < 128 || t ? s(a) : a < 2048 ? (s(192 | a >> 6), s(128 | a & 63)) : a > 55295 && a < 57344 ? (a = 65536 + (a & 1047552) | e.charCodeAt(++n) & 1023, s(240 | a >> 18), s(128 | a >> 12 & 63), s(128 | a >> 6 & 63), s(128 | a & 63)) : (s(224 | a >> 12), s(128 | a >> 6 & 63), s(128 | a & 63));
  }
  return Jo(o, 0, i);
}
function Xt(e) {
  try {
    return ya(va(e));
  } catch {
    return null;
  }
}
const wa = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function Sa(e) {
  if (!wa)
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
const Ea = "0.7.0", $r = 5e3, Qo = 50, Zo = 5e5, jr = 256e3, en = "replay", ei = 8e4, ti = 32, ba = 2e7, Ta = 5, Aa = 1e3, ka = 6e4, Ia = 500, tn = 63e3;
let Ne = 0, De = 0, ce = [], ht = 0, Tn = null;
const nn = /* @__PURE__ */ new Map();
let Ue = null, He = null, Fn = null, yt = !1;
function Ca() {
  try {
    return O().flushIntervalMs ?? $r;
  } catch {
    return $r;
  }
}
function ni(e) {
  let t = nn.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, nn.set(e, t)), t;
}
function ri(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (x("compression_failures"), { body: t, encoding: "" });
}
async function oi(e) {
  return ri(await Sa(e), e);
}
function La(e) {
  return ri(Xt(e), e);
}
const Ma = 64e3;
function Bn(e, t, n) {
  if (e === en)
    return {
      bytes: n ?? Qt(
        t,
        Ma
      ),
      oversized: !1
    };
  const r = Qt(
    t,
    jr + 1
  );
  return {
    bytes: r,
    oversized: r > jr
  };
}
let qn = null;
function Ra(e) {
  qn = e;
}
function mn(e) {
  x("transport_drops"), e === en && qn && qn();
}
const Oa = "/v1/rum/ingest";
function xa(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: Ea
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
function Pa(e, t, n) {
  const r = O();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const a = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, l = new Blob([n], {
      type: "application/json"
    });
    if (l.size < tn && navigator.sendBeacon(a, l))
      return;
  }
  const { body: o, encoding: i } = La(n), s = { ...t };
  i ? s["Content-Encoding"] = i : delete s["Content-Encoding"];
  const c = o instanceof Blob ? o.size : n.length;
  fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: c < tn,
    credentials: "omit"
  }).catch(() => {
    x("exit_send_failures");
  });
}
function An(e, t, n, r) {
  const o = n.length;
  if (ht + o > ba) {
    x("retry_drops"), r && mn(r);
    return;
  }
  const i = { ...t };
  delete i["Content-Encoding"], ce.push({
    url: e,
    headers: i,
    body: n,
    bytes: o,
    attempts: 0,
    batchKey: r
  }), ht += o, ii();
}
function ii() {
  if (Tn || ce.length === 0)
    return;
  const e = ce[0], t = Math.min(
    Aa * Math.pow(2, e.attempts),
    ka
  );
  Tn = setTimeout(() => {
    Tn = null, si();
  }, t);
}
async function si() {
  for (; ce.length > 0 && Ne < ei && De < ti; ) {
    const e = ce.shift();
    if (ht -= e.bytes, e.attempts++, e.attempts > Ta) {
      x("retry_drops"), e.batchKey && mn(e.batchKey);
      continue;
    }
    const t = e.bytes;
    Ne += t, De++;
    try {
      const { body: n, encoding: r } = await oi(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < tn,
        credentials: "omit"
      });
      if (ci(i), i.status === 429 || i.status >= 500) {
        ce.unshift(e), ht += e.bytes;
        break;
      }
    } catch {
      ce.unshift(e), ht += e.bytes;
      break;
    } finally {
      Ne -= t, De--;
    }
  }
  ce.length > 0 && ii();
}
function Na() {
  Ue && (clearTimeout(Ue), Ue = null), He && (clearTimeout(He), He = null);
}
function dr() {
  const e = Ca();
  Ue && clearTimeout(Ue), Ue = setTimeout(
    () => oe(),
    e
  ), He || (He = setTimeout(
    () => {
      He = null, oe();
    },
    e + Ia
  ));
}
function pr(e, t, n) {
  const { bytes: r, oversized: o } = Bn(
    e,
    t,
    n
  );
  if (o) {
    console.warn(
      `[@oodle-ai/rum] Dropping oversized ${e} payload (${r} bytes)`
    ), mn(e);
    return;
  }
  const i = ni(e);
  if (i.items.push(t), i.bytesEstimate += r, !yt && (i.items.length >= Qo || i.bytesEstimate >= Zo)) {
    oe();
    return;
  }
  dr();
}
function Da(e, t, n, r) {
  const { bytes: o, oversized: i } = Bn(
    e,
    n
  );
  if (i) {
    mn(e);
    return;
  }
  const s = ni(e), c = s.upsertMap.get(t);
  if (c !== void 0) {
    const a = Bn(
      e,
      s.items[c]
    ).bytes;
    s.items[c] = r ? r(s.items[c], n) : n, s.bytesEstimate += o - a;
  } else {
    const a = s.items.length;
    s.items.push(n), s.upsertMap.set(t, a), s.bytesEstimate += o;
  }
  if (!yt && (s.items.length >= Qo || s.bytesEstimate >= Zo)) {
    oe();
    return;
  }
  dr();
}
function ai(e) {
  Fn = e;
}
const zr = ["events", "replay"];
function oe(e = !1) {
  const t = O();
  if (e && Fn && !yt) {
    yt = !0;
    try {
      Fn();
    } catch {
    } finally {
      yt = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    dr();
    return;
  }
  Na();
  const n = Zs(), r = [], o = Array.from(
    nn.keys()
  ).sort((l, u) => {
    const f = zr.indexOf(l), m = zr.indexOf(u), h = f >= 0 ? f : 999, g = m >= 0 ? m : 999;
    return h - g;
  });
  for (const l of o) {
    const u = nn.get(l);
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
  const i = xa(r), s = `${t.endpoint}${Oa}`, c = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, a = r.some(
    (l) => l.type === en
  );
  if (e) {
    Pa(s, c, i);
    return;
  }
  Ua(
    s,
    c,
    i,
    a ? en : void 0
  );
}
async function Ua(e, t, n, r) {
  const o = n.length;
  if (Ne >= ei || De >= ti) {
    An(e, t, n, r);
    return;
  }
  Ne += o, De++;
  try {
    const { body: i, encoding: s } = await oi(n), c = { ...t };
    s && (c["Content-Encoding"] = s);
    const a = await fetch(e, {
      method: "POST",
      headers: c,
      body: i,
      keepalive: o < tn,
      credentials: "omit"
    });
    ci(a), (a.status === 429 || a.status >= 500) && An(e, t, n, r);
  } catch {
    x("send_failures"), An(e, t, n, r);
  } finally {
    Ne -= o, De--, si();
  }
}
const $n = /* @__PURE__ */ new Map();
function ci(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && $n.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function hn(e) {
  const t = $n.get(e);
  return t ? Date.now() >= t ? ($n.delete(e), !1) : !0 : !1;
}
let gt = null, _t = null, vt = null, jn = null;
function Ha(e) {
  jn = e;
}
const ui = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function Vr() {
  typeof document > "u" || (gt = () => {
    document.visibilityState === "hidden" && oe(!0);
  }, _t = () => oe(!0), vt = (e) => {
    e.persisted && jn && jn();
  }, document.addEventListener(
    "visibilitychange",
    gt
  ), window.addEventListener(
    ui,
    _t
  ), window.addEventListener(
    "pageshow",
    vt
  ));
}
function Fa() {
  gt && (document.removeEventListener(
    "visibilitychange",
    gt
  ), gt = null), _t && (window.removeEventListener(
    ui,
    _t
  ), _t = null), vt && (window.removeEventListener(
    "pageshow",
    vt
  ), vt = null);
}
const rn = /* @__PURE__ */ new Map();
function Ba(e, t) {
  rn.set(e, t);
}
function qa() {
  return rn.size === 0 ? {} : Object.fromEntries(rn);
}
function $a() {
  rn.clear();
}
const ja = 100, za = 1e4, wt = /* @__PURE__ */ new Set();
let Rt = 0, Fe = null;
function mr() {
  for (const e of wt)
    try {
      e();
    } catch {
    }
}
function Va() {
  Fe || typeof MutationObserver > "u" || typeof document > "u" || !document.documentElement || (Fe = new MutationObserver(mr), Fe.observe(document.documentElement, {
    childList: !0,
    subtree: !0,
    attributes: !0,
    characterData: !0
  }));
}
function Xr() {
  wt.size > 0 || !Fe || (Fe.disconnect(), Fe = null);
}
function li() {
  Rt++, mr();
}
function fi() {
  Rt = Math.max(0, Rt - 1), mr();
}
function di(e, t, n = za) {
  let r = null, o = null, i = null, s = !1;
  const c = (u) => {
    s || (s = !0, o && clearTimeout(o), i && clearTimeout(i), wt.delete(l), Xr(), t(u));
  }, a = () => {
    o && clearTimeout(o), o = setTimeout(() => {
      if (Rt > 0) {
        a();
        return;
      }
      c({
        endMs: r,
        hadActivity: r !== null,
        timedOut: !1
      });
    }, ja);
  };
  function l() {
    r = Date.now(), a();
  }
  return wt.add(l), Va(), Rt > 0 && (r = e), a(), i = setTimeout(() => {
    c({
      endMs: r,
      hadActivity: r !== null,
      timedOut: !0
    });
  }, n), () => {
    s = !0, o && clearTimeout(o), i && clearTimeout(i), wt.delete(l), Xr();
  };
}
var ue, St, pi, on, mi = -1, $t = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (mi = t.timeStamp, e(t));
  }), !0);
}, hr = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, yn = function() {
  var e = hr();
  return e && e.activationStart || 0;
}, me = function(e, t) {
  var n = hr(), r = "navigate";
  return mi >= 0 ? r = "back-forward-cache" : n && (document.prerendering || yn() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, yr = function(e, t, n) {
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
}, hi = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, gr = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, _r = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Oe = -1, Yr = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, sn = function(e) {
  document.visibilityState === "hidden" && Oe > -1 && (Oe = e.type === "visibilitychange" ? e.timeStamp : 0, Xa());
}, Wr = function() {
  addEventListener("visibilitychange", sn, !0), addEventListener("prerenderingchange", sn, !0);
}, Xa = function() {
  removeEventListener("visibilitychange", sn, !0), removeEventListener("prerenderingchange", sn, !0);
}, vr = function() {
  return Oe < 0 && (Oe = Yr(), Wr(), $t((function() {
    setTimeout((function() {
      Oe = Yr(), Wr();
    }), 0);
  }))), { get firstHiddenTime() {
    return Oe;
  } };
}, gn = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, Jr = [1800, 3e3], Ya = function(e, t) {
  t = t || {}, gn((function() {
    var n, r = vr(), o = me("FCP"), i = yr("paint", (function(s) {
      s.forEach((function(c) {
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < r.firstHiddenTime && (o.value = Math.max(c.startTime - yn(), 0), o.entries.push(c), n(!0)));
      }));
    }));
    i && (n = he(e, o, Jr, t.reportAllChanges), $t((function(s) {
      o = me("FCP"), n = he(e, o, Jr, t.reportAllChanges), hi((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, Wa = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = _r(e), document.visibilityState === "hidden" ? e() : (n = t(e), gr(e)), n;
}, Kr = [2500, 4e3], kn = {}, Ja = function(e, t) {
  t = t || {}, gn((function() {
    var n, r = vr(), o = me("LCP"), i = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - yn(), 0), o.entries = [l], n());
      }));
    }, s = yr("largest-contentful-paint", i);
    if (s) {
      n = he(e, o, Kr, t.reportAllChanges);
      var c = _r((function() {
        kn[o.id] || (i(s.takeRecords()), s.disconnect(), kn[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(a) {
        addEventListener(a, (function() {
          return Wa(c);
        }), { once: !0, capture: !0 });
      })), gr(c), $t((function(a) {
        o = me("LCP"), n = he(e, o, Kr, t.reportAllChanges), hi((function() {
          o.value = performance.now() - a.timeStamp, kn[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, Gr = [800, 1800], Ka = function e(t) {
  document.prerendering ? gn((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, Ga = function(e, t) {
  t = t || {};
  var n = me("TTFB"), r = he(e, n, Gr, t.reportAllChanges);
  Ka((function() {
    var o = hr();
    o && (n.value = Math.max(o.responseStart - yn(), 0), n.entries = [o], r(!0), $t((function() {
      n = me("TTFB", 0), (r = he(e, n, Gr, t.reportAllChanges))(!0);
    })));
  }));
}, st = { passive: !0, capture: !0 }, Qa = /* @__PURE__ */ new Date(), Qr = function(e, t) {
  ue || (ue = t, St = e, pi = /* @__PURE__ */ new Date(), gi(removeEventListener), yi());
}, yi = function() {
  if (St >= 0 && St < pi - Qa) {
    var e = { entryType: "first-input", name: ue.type, target: ue.target, cancelable: ue.cancelable, startTime: ue.timeStamp, processingStart: ue.timeStamp + St };
    on.forEach((function(t) {
      t(e);
    })), on = [];
  }
}, Za = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        Qr(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, st), removeEventListener("pointercancel", i, st);
      };
      addEventListener("pointerup", o, st), addEventListener("pointercancel", i, st);
    })(t, e) : Qr(t, e);
  }
}, gi = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, Za, st);
  }));
}, Zr = [100, 300], ec = function(e, t) {
  t = t || {}, gn((function() {
    var n, r = vr(), o = me("FID"), i = function(a) {
      a.startTime < r.firstHiddenTime && (o.value = a.processingStart - a.startTime, o.entries.push(a), n(!0));
    }, s = function(a) {
      a.forEach(i);
    }, c = yr("first-input", s);
    n = he(e, o, Zr, t.reportAllChanges), c && (gr(_r((function() {
      s(c.takeRecords()), c.disconnect();
    }))), $t((function() {
      var a;
      o = me("FID"), n = he(e, o, Zr, t.reportAllChanges), on = [], St = -1, ue = null, gi(addEventListener), a = i, on.push(a), yi();
    })));
  }));
};
const tc = 3e3;
let Ot = null, _i = (e) => e.href, _ = null, ne = null, an = [];
function cn() {
  return typeof performance < "u" ? performance.now() : 0;
}
function nc() {
  return typeof performance < "u" && performance.timeOrigin ? performance.timeOrigin : Date.now();
}
function Et(e) {
  const t = e.hash ?? "", n = t.startsWith("#/") ? t.split("?")[0] : "";
  return e.pathname + n;
}
function vi(e, t, n) {
  return {
    id: Qe(),
    sessionId: ie(),
    loadingType: e,
    startEpoch: t,
    startPerf: n,
    url: _i(window.location),
    urlPath: fe(window.location.pathname),
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
function rc(e) {
  const t = Array.from(e.interactions.values()).sort((r, o) => o - r);
  if (t.length === 0) return 0;
  const n = Math.min(t.length - 1, Math.floor(t.length / 50));
  return t[n];
}
function oc(e) {
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
    inp_ms: rc(e),
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
  if (!(!Ot || !e.sessionId)) {
    if (e.endEpoch !== void 0) {
      if (e.expirySent) return;
      e.expirySent = !0;
    } else if (e.active) {
      const t = Bs(e.sessionId);
      t !== null && (e.active = !1, e.endEpoch = Math.max(e.startEpoch, t), e.expirySent = !0, e.cancelIdle && e.cancelIdle(), _ === e && (_ = null));
    }
    e.seq++, Ot(oc(e), e.sessionId);
  }
}
function wi() {
  ne && (clearTimeout(ne), ne = null), _ && Ze(_);
}
function xt() {
  ne || !_ || (ne = setTimeout(() => {
    ne = null, _ && Ze(_);
  }, tc));
}
const ic = 5 * 6e4, bt = /* @__PURE__ */ new Map();
function sc(e) {
  const t = Date.now();
  for (const [n, r] of bt) r.until <= t && bt.delete(n);
  bt.set(e.id, { v: e, until: t + ic });
}
function un() {
  const e = _;
  e && (sc(e), e.cancelIdle && e.cancelIdle(), ne && (clearTimeout(ne), ne = null), e.active = !1, Ze(e), _ = null);
}
function Si(e) {
  e.cancelIdle = di(e.startEpoch, (t) => {
    if (e.cancelIdle = null, _ !== e) return;
    let n = t.endMs !== null && !t.timedOut ? t.endMs - e.startEpoch : 0;
    e.loadingType === "initial_load" && (n = Math.max(n, e.vitals.load_event_ms ?? 0)), e.loadingTimeMs = Math.max(0, n), wi();
  });
}
function ln(e, t, n) {
  un();
  const r = vi(e, t, n);
  r.sessionId && (_ = r, Ze(r), Si(r));
}
function Ei() {
  return (_ == null ? void 0 : _.id) ?? "";
}
function ac() {
  return (_ == null ? void 0 : _.urlPath) ?? "";
}
function cc(e) {
  const t = typeof e.view_id == "string" ? e.view_id : "";
  let n = _, r = !1;
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
    r ? Ze(n) : xt();
  }
}
function uc(e) {
  var r, o;
  const t = (o = (r = performance.getEntriesByType) == null ? void 0 : r.call(performance, "navigation")) == null ? void 0 : o[0];
  if (!t || t.loadEventEnd <= 0) return !1;
  const n = Math.round;
  return e.vitals.load_event_ms = n(t.loadEventEnd - t.startTime), e.vitals.dns_ms = n(t.domainLookupEnd - t.domainLookupStart), e.vitals.connect_ms = n(t.connectEnd - t.connectStart), e.vitals.tls_ms = n(
    t.secureConnectionStart > 0 ? t.connectEnd - t.secureConnectionStart : 0
  ), e.vitals.download_ms = n(t.responseEnd - t.responseStart), e.vitals.dom_interactive_ms = n(t.domInteractive - t.startTime), e.vitals.dom_complete_ms = n(t.domComplete - t.startTime), !0;
}
function eo(e, t, n = {}) {
  if (!(typeof PerformanceObserver > "u"))
    try {
      const r = new PerformanceObserver((o) => t(o.getEntries()));
      r.observe({ type: e, buffered: !0, ...n }), an.push(() => r.disconnect());
    } catch {
    }
}
function lc(e, t, n) {
  const r = e.cls;
  r.windowValue > 0 && n - r.last < 1e3 && n - r.windowStart < 5e3 ? r.windowValue += t : (r.windowValue = t, r.windowStart = n), r.last = n, r.windowValue > r.value && (r.value = r.windowValue);
}
function fc() {
  eo("layout-shift", (e) => {
    const t = _;
    if (!t) return;
    let n = !1;
    for (const r of e)
      r.hadRecentInput || r.startTime < t.startPerf || (lc(t, r.value, r.startTime), n = !0);
    n && xt();
  }), eo(
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
      n && xt();
    },
    { durationThreshold: 40 }
  );
}
function dc(e) {
  const t = (o, i) => {
    _ !== e && !e.active || (e.vitals[o] = Math.round(i * 100) / 100, _ === e && xt());
  };
  try {
    Ja((o) => t("lcp", o.value)), Ya((o) => t("fcp", o.value)), Ga((o) => t("ttfb", o.value)), ec((o) => t("fid", o.value));
  } catch {
  }
  let n = 0;
  const r = () => {
    uc(e) ? _ === e && xt() : ++n < 50 && setTimeout(r, 200);
  };
  document.readyState === "complete" ? setTimeout(r, 0) : window.addEventListener("load", () => setTimeout(r, 0), { once: !0 });
}
let Be = "", Yt = !1;
function Re() {
  const e = Et(window.location);
  e !== Be && (Be = e, ln("route_change", Date.now(), cn()));
}
function pc(e, t) {
  if (typeof window > "u") return;
  bi(), Yt = !1, Ot = e, _i = t, Be = Et(window.location);
  const n = nc(), r = vi("initial_load", n, 0);
  r.sessionId && (_ = r, Ze(r), Si(r), dc(r)), fc();
  const o = history.pushState, i = history.replaceState;
  history.pushState = function(...u) {
    o.apply(this, u), Re();
  }, history.replaceState = function(...u) {
    i.apply(this, u), Re();
  }, window.addEventListener("popstate", Re), window.addEventListener("hashchange", Re);
  const s = () => {
    document.visibilityState === "hidden" && wi();
  };
  document.addEventListener("visibilitychange", s);
  const c = () => {
    un(), Yt = !0;
  };
  window.addEventListener("pagehide", c);
  const a = (u) => {
    u.persisted && (Yt = !1, Be = Et(window.location), ln("bf_cache", Date.now(), cn()));
  };
  window.addEventListener("pageshow", a);
  const l = Hs((u) => {
    _ && _.sessionId === u && un(), Be = Et(window.location), ln("route_change", Date.now(), cn());
  });
  an.push(() => {
    history.pushState = o, history.replaceState = i, window.removeEventListener("popstate", Re), window.removeEventListener("hashchange", Re), document.removeEventListener("visibilitychange", s), window.removeEventListener("pagehide", c), window.removeEventListener("pageshow", a), l();
  });
}
function mc() {
  _ || Yt || !Ot || typeof window > "u" || (Be = Et(window.location), ln("route_change", Date.now(), cn()));
}
function bi() {
  un(), bt.clear();
  for (const e of an) e();
  an = [], Ot = null, _ = null;
}
const hc = 3, yc = 1e3;
let fn = null, Q = null;
const de = [], wr = [];
let Wt = null;
function gc() {
  for (let e = de.length - 1; e >= 0; e--)
    if (!de[e].done) return de[e].id;
  return "";
}
function _c(e) {
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
function Ti(e) {
  return e.deadCandidate && !e.selected && !e.hadActivity && !e.userInput;
}
function vc(e, t, n = !1) {
  const r = [];
  return t && r.push("rage_click"), (t ? n : Ti(e)) && r.push("dead_click"), e.errorCount > 0 && r.push("error_click"), r;
}
function to(e, t, n = 1, r = !1) {
  if (!fn) return;
  const o = vc(e, t, r), i = t ? "rage_click" : o.includes("dead_click") ? "dead_click" : o.includes("error_click") ? "error_click" : "click", s = {
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
function zn() {
  const e = Q;
  if (Q = null, !e) return;
  e.timer && clearTimeout(e.timer);
  const t = () => e.clicks.every((o) => o.done), n = () => {
    const o = e.clicks.some((i) => i.userInput || i.selected);
    if (e.clicks.length >= hc && !o) {
      const i = e.clicks[0], s = e.clicks.some(Ti);
      for (const c of e.clicks.slice(1))
        i.errorCount += c.errorCount, i.resourceCount += c.resourceCount, i.longTaskCount += c.longTaskCount, i.hadActivity = i.hadActivity || c.hadActivity;
      to(i, !0, e.clicks.length, s);
    } else
      for (const i of e.clicks) to(i, !1);
    for (const i of e.clicks) {
      const s = de.indexOf(i);
      s >= 0 && de.splice(s, 1);
    }
  };
  if (t()) {
    n();
    return;
  }
  const r = setInterval(() => {
    t() && (clearInterval(r), n());
  }, 50);
  wr.push(() => clearInterval(r));
}
function wc(e) {
  if (e.tagName === "LABEL") {
    const t = e.getAttribute("for"), n = t ? document.getElementById(t) : null;
    if (n) return n;
  }
  return e;
}
function Sc() {
  var e;
  try {
    const t = (e = window.getSelection) == null ? void 0 : e.call(window);
    return !!t && !t.isCollapsed && t.toString().length > 0;
  } catch {
    return !1;
  }
}
const Ec = (
  // Text fields take the caret without changing the page; checkboxes,
  // radios and buttons must change something, so they stay candidates.
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="range"]),textarea,select,[contenteditable],[contenteditable] *,canvas,a[href],a[href] *'
), bc = 10;
function _e(e) {
  const t = e.split(`
`).map((n) => n.trim()).find(Boolean) ?? "";
  return t.length > 80 ? t.slice(0, 79) + "…" : t;
}
function rt(e, t) {
  return (e.getAttribute(t) ?? "").trim();
}
function Tc(e) {
  const t = e.labels;
  if (t && t.length > 0) return _e(Tt(t[0]));
  if (e.tagName === "INPUT") {
    const i = rt(e, "type");
    if (i === "button" || i === "submit" || i === "reset")
      return _e(e.value ?? "");
  }
  const n = rt(e, "role");
  if (["BUTTON", "LABEL", "A"].includes(e.tagName) || n === "button" || n === "link") {
    const i = _e(Tt(e));
    if (i) return i;
  }
  const r = rt(e, "aria-label");
  if (r) return _e(r);
  const o = rt(e, "aria-labelledby");
  if (o) {
    const i = o.split(/\s+/).map((s) => document.getElementById(s)).filter((s) => !!s).map((s) => Tt(s)).join(" ");
    if (i.trim()) return _e(i);
  }
  for (const i of ["alt", "title", "placeholder"]) {
    const s = rt(e, i);
    if (s) return _e(s);
  }
  return "";
}
function Ac(e) {
  for (const t of [Tc, (n) => _e(Tt(n))]) {
    let n = e;
    for (let r = 0; n && r <= bc && n.tagName !== "BODY" && n.tagName !== "HTML"; r++) {
      const o = t(n);
      if (o) return { el: n, name: o };
      n = n.parentElement;
    }
  }
  return null;
}
function Tt(e) {
  const t = e.innerText;
  return (typeof t == "string" && t ? t : e.textContent ?? "").trim();
}
let Ai = 0;
function kc(e) {
  const t = e.target;
  if (!t || typeof t.tagName != "string") return;
  const n = Mc(t), r = Cc(t), o = r === null ? Ac(t) : null, i = (o == null ? void 0 : o.el) ?? t, s = i.tagName.toLowerCase(), c = r === null && Is(i), a = r ?? (c ? "" : Tt(i).slice(0, 200)), l = r !== null ? `${s}[${r}]` : c ? ro(i, s) : o ? `${s}[${o.name}]` : ro(t, t.tagName.toLowerCase()), u = {
    id: Qe(),
    startMs: Date.now(),
    viewId: Ei(),
    viewPath: ac(),
    target: l,
    selector: n,
    text: a,
    x: e.clientX,
    y: e.clientY,
    deadCandidate: !Lc(wc(t), Ec),
    selected: Sc(),
    errorCount: 0,
    resourceCount: 0,
    longTaskCount: 0,
    loadingTimeMs: 0,
    hadActivity: !1,
    userInput: !1,
    done: !1
  };
  de.push(u), wr.push(
    di(u.startMs, (m) => {
      u.hadActivity = m.hadActivity, u.userInput = Ai >= u.startMs, u.loadingTimeMs = m.endMs !== null && !m.timedOut ? Math.max(0, m.endMs - u.startMs) : 0, u.done = !0;
    })
  ), Q && Q.selector === n ? Q.clicks.push(u) : (zn(), Q = { selector: n, clicks: [u], timer: null });
  const f = Q;
  f.timer && clearTimeout(f.timer), f.timer = setTimeout(() => {
    Q === f && zn();
  }, yc);
}
function Ic(e) {
  if (typeof document > "u") return;
  ki(), fn = e;
  const t = (r) => kc(r), n = () => {
    Ai = Date.now();
  };
  document.addEventListener("click", t, { capture: !0, passive: !0 }), document.addEventListener("input", n, { capture: !0, passive: !0 }), document.addEventListener("scroll", n, { capture: !0, passive: !0 }), Wt = () => {
    document.removeEventListener("click", t, {
      capture: !0
    }), document.removeEventListener("input", n, { capture: !0 }), document.removeEventListener("scroll", n, { capture: !0 });
  };
}
function ki() {
  Q && zn();
  for (const e of wr.splice(0)) e();
  de.splice(0), Wt && Wt(), Wt = null, fn = null;
}
const no = "data-oodle-action-name";
function Cc(e) {
  var t;
  try {
    const n = typeof e.closest == "function" ? e.closest(`[${no}]`) : null, r = (t = n == null ? void 0 : n.getAttribute(no)) == null ? void 0 : t.trim();
    return r ? r.slice(0, 200) : null;
  } catch {
    return null;
  }
}
function Lc(e, t) {
  try {
    return typeof e.closest == "function" && e.closest(t) !== null;
  } catch {
    return !1;
  }
}
function ro(e, t) {
  if (e.id) return `${t}#${e.id}`;
  const n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
function Mc(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
const qe = "[REDACTED]", Rc = /token|secret|auth|cookie|passw|api-?key|access-?key|session|csrf|xsrf|client-?ip|real-?ip|connecting-ip|(^|-)forwarded(-for)?$/, Oc = /passw|secret|token(?!s|count|limit|usage|type)|apikey|accesskey|privatekey|authorization|credential|cardnumber|creditcard|cardnum|^pan$|cvv|cvc|securitycode|^ssn$|socialsecurity|^ip$|ipaddr|clientip|remoteaddr|remoteip|^ipv[46]$/;
function Ii(e, t, n) {
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
function Ci(e) {
  return Ii(
    Rc,
    (t) => t.toLowerCase(),
    e
  );
}
function Li(e) {
  return Ii(
    Oc,
    (t) => t.toLowerCase().replace(/[-_.\s]/g, ""),
    e
  );
}
function xc(e) {
  let t = 0, n = !1;
  for (let r = e.length - 1; r >= 0; r--) {
    let o = e.charCodeAt(r) - 48;
    n && (o *= 2, o > 9 && (o -= 9)), t += o, n = !n;
  }
  return t % 10 === 0;
}
const Pc = /\b\d(?:[ -]?\d){12,18}\b/g;
function Nc(e) {
  return e.replace(Pc, (t) => {
    const n = t.replace(/[ -]/g, "");
    return n.length >= 13 && n.length <= 19 && n[0] >= "2" && n[0] <= "6" && xc(n) ? qe : t;
  });
}
function Vn(e, t, n) {
  if (n > 32 || e === null || typeof e != "object")
    return;
  let r = !1;
  if (Array.isArray(e)) {
    const i = e.map((s) => {
      const c = Vn(s, t, n + 1);
      return c === void 0 ? s : (r = !0, c);
    });
    return r ? i : void 0;
  }
  const o = /* @__PURE__ */ Object.create(null);
  for (const [i, s] of Object.entries(e)) {
    if (t(i) && s !== null && s !== "") {
      o[i] = qe, r = !0;
      continue;
    }
    const c = Vn(s, t, n + 1);
    c === void 0 ? o[i] = s : (o[i] = c, r = !0);
  }
  return r ? o : void 0;
}
const In = /"((?:[^"\\]|\\.){1,200})"\s*:\s*/g, Dc = /^("(?:[^"\\]|\\.)*"|[^\s,}\]{["]+)/;
function Uc(e, t) {
  let n = "", r = 0;
  In.lastIndex = 0;
  let o;
  for (; (o = In.exec(e)) !== null; ) {
    if (!t(o[1])) continue;
    const i = o.index + o[0].length, s = e.slice(i);
    if (s[0] === "{" || s[0] === "[")
      return n + e.slice(r, i) + `"${qe}"`;
    const c = Dc.exec(s);
    if (!c)
      return s[0] === '"' ? n + e.slice(r, i) + `"${qe}"` : n + e.slice(r);
    c[1] === '""' || c[1] === "null" || (n += e.slice(r, i) + `"${qe}"`, r = i + c[1].length, In.lastIndex = r);
  }
  return n + e.slice(r);
}
function Hc(e) {
  return /^[\w.%+[\]-]+=[^&]*(&[\w.%+[\]-]+=[^&]*)*$/.test(e);
}
function Fc(e, t) {
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
      const s = Vn(o, t, 0);
      s !== void 0 && (r = JSON.stringify(s));
    } else
      r = Uc(e, t);
  } else if (Hc(n))
    try {
      const o = new URLSearchParams(e);
      let i = !1;
      if (o.forEach((s, c) => {
        t(c) && s && (i = !0);
      }), i) {
        const s = new URLSearchParams();
        o.forEach((c, a) => {
          s.append(a, t(a) && c ? qe : c);
        }), r = s.toString();
      }
    } catch {
    }
  return Nc(r);
}
const Bc = 50, oo = 200, io = /* @__PURE__ */ new Map();
function qc(e) {
  let t = io.get(e);
  return t || (t = {
    tokens: oo,
    lastRefill: Date.now(),
    rate: Bc,
    burst: oo
  }, io.set(e, t)), t;
}
function $c(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function jc(e) {
  const t = qc(e);
  return $c(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let Xn = null, Yn = null;
function hl(e, t) {
  Xn = e, Yn = t;
}
const zc = "00000000000000000000000000000000";
function Mi() {
  if (!Xn || !Yn) return null;
  try {
    const e = Xn.getSpan(
      Yn.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === zc ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const so = 100, Vc = 10, ao = 5e3, Xc = 3, Yc = 0;
function Wc(e, t = () => Date.now()) {
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
    return r.size < ao && r.set(a, u), u;
  }
  function s(a) {
    const l = i(a), u = t();
    let f = n.get(l);
    if (!f) {
      if (n.size >= ao)
        return !0;
      f = {
        tokens: so,
        lastRefillMs: u
      }, n.set(l, f);
    }
    const m = (u - f.lastRefillMs) / 1e3;
    return m > 0 && (f.tokens = Math.min(
      so,
      f.tokens + m * Vc
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function c(a) {
    var g, v, k;
    if (a.type !== Xc)
      return { event: a, dropped: 0 };
    const l = a.data;
    if (!l || l.source !== Yc || !l.attributes || l.attributes.length === 0)
      return { event: a, dropped: 0 };
    const u = l.attributes.length, f = l.attributes.filter(
      (I) => s(I.id)
    ), m = u - f.length;
    return m === 0 ? { event: a, dropped: 0 } : (l.attributes = f, {
      event: f.length > 0 || (((g = l.adds) == null ? void 0 : g.length) ?? 0) > 0 || (((v = l.removes) == null ? void 0 : v.length) ?? 0) > 0 || (((k = l.texts) == null ? void 0 : k.length) ?? 0) > 0 ? a : null,
      dropped: m
    });
  }
  return { throttle: c, reset: o };
}
const co = "replay", Jc = 200, Kc = 6e4, Gc = 5e3, Qc = 8e6, Ri = 2, Zc = 3, eu = 4, uo = 3e3, Oi = 5e3, tu = 3, nu = 3e4, ru = 5e3, ou = 16, iu = 100, su = 4, au = 30, lo = 32, fo = 250, cu = 36e4;
function uu() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const lu = 3e5, fu = 9e5, du = 1e3;
let Ee = null, re = null, ot = null, We = [], Je = 0, ve = "", xi = "", Sr = !1, Pi = 0, Cn = "", Z = 0, be = Date.now(), ye = !1, Pt = 0, we = null, Ke = !1, $e = null, Ni = 0, K = [], Y = 0, je = null, le = null, Jt = 0;
function Ge() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const Er = Wc(
  () => (Ee == null ? void 0 : Ee.mirror) ?? null
);
let ze = null, Se = null, Ve = !1, Nt = !1, br = 0, Kt = null, ee = null;
function pu() {
  je && (clearTimeout(je), je = null), le && (le(), le = null);
}
function Wn(e, t) {
  pu();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    au
  ) : null, r = e ? Ge() + (n ?? su) : Number.POSITIVE_INFINITY;
  for (; Y < K.length; ) {
    const o = Math.min(
      Y + lo,
      K.length
    );
    for (; Y < o; )
      Jn(
        K[Y++]
      );
    if (Ge() >= r) break;
  }
  if (Y >= K.length) {
    K = [], Y = 0;
    return;
  }
  Y >= lo * 8 && (K = K.slice(Y), Y = 0), Di();
}
function dn() {
  Wn(!1);
}
function Di() {
  if (!je) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          le = null, Wn(!0, t);
        },
        { timeout: iu }
      );
      le = () => cancelIdleCallback(e);
    }
    je = setTimeout(() => {
      je = null, le && (le(), le = null), Wn(!0);
    }, ou);
  }
}
function Dt(e = !1) {
  if (Ke = !0, $e) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - be, r = Math.max(
      0,
      Oi - n
    ), o = Date.now() - Ni, i = Math.max(
      0,
      ru - o
    );
    t = Math.max(
      r,
      i
    );
  }
  $e = setTimeout(() => {
    $e = null, mu();
  }, t);
}
function mu() {
  if (!Ke || !Ee || !re || ye) return;
  Pt++;
  const e = Jt > fo ? 1 : tu;
  if (Pt > e) {
    gu();
    return;
  }
  Ni = Date.now(), Z = 0, be = Date.now();
  try {
    const t = Ge();
    Ee.takeFullSnapshot(!0), Jt = Ge() - t, x("replay_rebases"), Jt > fo && x(
      "replay_expensive_snapshots"
    );
  } catch {
    Ht(), Ut();
  }
}
function po() {
  x("replay_events_dropped");
}
function Ui() {
  if (ve) return !1;
  ve = ie(), Pi = js(), xi = qs() ? "" : Fo();
  const e = Cn !== "" && Cn !== ve;
  return Cn = ve, e;
}
function jt() {
  if (yu(), We.length === 0) return;
  if (hn(co)) {
    hu(), Hi();
    return;
  }
  Ui();
  const e = ve, t = Pi, n = xi, r = We.splice(0), o = Je;
  Je = 0, ve = "", Sr = !0, pr(
    co,
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
function hu() {
  Je <= Qc || (x(
    "replay_events_dropped",
    We.length
  ), We.length = 0, Je = 0, Dt());
}
let Xe = null;
function yu() {
  Xe && (clearTimeout(Xe), Xe = null);
}
function Hi() {
  if (Xe) return;
  const e = O().replayFlushIntervalMs ?? Gc;
  Xe = setTimeout(() => {
    Xe = null, jt();
  }, e);
}
function Jn(e) {
  !ve && !ie() || (Ui() && e.type !== Ri && Dt(!0), We.push(e), Je += Qt(e), We.length >= Jc || Je >= Kc ? jt() : Hi());
}
function gu() {
  ye = !0, x("replay_overload_pauses"), Ht(), we && clearTimeout(we), we = setTimeout(() => {
    we = null, ye = !1, Pt = 0, Z = 0, be = Date.now(), !Ve && !Nt && ee && Ut();
  }, nu);
}
function _u(e) {
  if (ye) return;
  if (e.type === Ri) {
    dn(), Ke = !1, Z = 0, be = Date.now(), Jn(e);
    return;
  }
  if (e.type === eu) {
    const r = e.data;
    typeof r.href == "string" && (r.href = ps(r.href));
  }
  if (e.type !== Zc) {
    dn(), Jn(e);
    return;
  }
  if (Ke) {
    po(), Dt();
    return;
  }
  const t = Date.now();
  t - be > Oi && (Z <= uo && (Pt = 0), Z = 0, be = t);
  const n = Er.throttle(e);
  if (n.dropped > 0 && x(
    "replay_attributes_throttled",
    n.dropped
  ), !!n.event) {
    if (Z++, Z > uo) {
      po(), Dt();
      return;
    }
    K.push(n.event), Di();
  }
}
async function Ut() {
  if (ee && !ye && !re)
    return ot || (ot = vu().finally(
      () => {
        ot = null;
      }
    ), ot);
}
async function vu() {
  if (!ee) return;
  const { record: e } = await import("./rrweb-SbAupvcM.js");
  !ee || ye || re || (Ee = e, Ke = !1, Z = 0, be = Date.now(), Er.reset(), re = e({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: uu() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: cu,
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
        _u(t);
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
    blockSelector: Ro,
    maskTextSelector: Oo,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => jt(), 200));
}
function Ht() {
  re && (re(), re = null), $e && (clearTimeout($e), $e = null), Ke = !1, dn(), jt();
}
function wu() {
  const e = O(), t = e.replayIdlePauseMs ?? lu, n = e.replayIdleExpireMs ?? fu;
  ze && clearTimeout(ze), Se && (clearTimeout(Se), Se = null), ze = setTimeout(() => {
    Ve = !0, Ht();
  }, t), Se = setTimeout(() => {
    Nt = !0, Ht();
  }, n);
}
function Gt() {
  br = Ge(), wu();
}
function Su() {
  if (Nt) {
    if (!qo()) return;
    Nt = !1, Ve = !1, Ut(), Gt();
    return;
  }
  if (Ve) {
    Ve = !1, Ut(), Gt();
    return;
  }
  Ge() - br >= du && Gt();
}
function Eu() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => Su(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  Kt = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function bu() {
  Kt && (Kt(), Kt = null), ze && (clearTimeout(ze), ze = null), Se && (clearTimeout(Se), Se = null);
}
function Tu() {
  dn(), jt();
}
async function Au() {
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
  }, Ra(() => {
    re && Dt();
  }), ai(Tu), await Ut(), Eu(), Gt();
}
function ku() {
  return re !== null && !ye;
}
function Iu() {
  return Sr;
}
function Cu() {
  Ht(), bu(), ai(null), we && (clearTimeout(we), we = null), Ve = !1, Nt = !1, br = 0, ye = !1, Sr = !1, Pt = 0, Z = 0, Jt = 0, K = [], Y = 0, Er.reset(), ee = null, Ee = null;
}
let H = [], G = null;
const Lu = [
  "error",
  "action",
  "console",
  "resource"
];
function Mu(e) {
  return Lu.includes(e) && (hn(e) || !jc(e)) ? (x("events_rate_limited"), !0) : !1;
}
function Fi(e, t) {
  const n = e.origin + fe(e.pathname);
  if (!Array.isArray(t) || t.length === 0 || !e.search)
    return n;
  const r = new URLSearchParams(e.search), o = new URLSearchParams();
  r.forEach((s, c) => {
    t.includes(c) && o.append(c, s);
  });
  const i = o.toString();
  return i ? n + "?" + i : n;
}
function Ru() {
  if (!G) {
    const e = navigator.userAgent;
    G = {
      device_type: al(e),
      browser_name: cl(e),
      browser_version: ul(e),
      os_name: ll(e),
      os_version: fl(e),
      user_agent: e,
      language: navigator.language
    };
  }
}
function Ou() {
  const e = navigator.connection;
  return typeof (e == null ? void 0 : e.effectiveType) == "string" ? e.effectiveType : "";
}
function Bi(e) {
  Ru();
  const t = Vs(), n = qa(), r = O(), o = e ?? ie(), i = {
    event_id: Qe(),
    session_id: o,
    tab_id: Fo(),
    view_id: Ei(),
    action_id: gc(),
    ...gs(
      Vo(),
      Ys(),
      Ws()
    ),
    user_status: Js(),
    service: r.service,
    env: r.env ?? "",
    version: r.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: Fi(
      window.location,
      r.viewUrlQueryParams
    ),
    view_url_host: window.location.hostname,
    view_url_path: fe(window.location.pathname),
    referrer_url: ms(document.referrer),
    device_type: G.device_type,
    browser_name: G.browser_name,
    browser_version: G.browser_version,
    os_name: G.os_name,
    os_version: G.os_version,
    user_agent: ys() ? G.user_agent : "",
    language: G.language,
    session_view_count: t.viewCount,
    session_error_count: t.errorCount,
    session_action_count: t.actionCount,
    replay_id: ku() && Iu() ? o : ""
  };
  return Object.keys(n).length > 0 && (i.feature_flags = n), i;
}
function xu(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const qi = "events", Pu = ["session_id", "event_type", "timestamp"];
let mo = !1;
function $i(e) {
  const t = O().beforeSend;
  if (typeof t != "function") return e;
  const n = {};
  for (const r of Pu) n[r] = e[r];
  try {
    const r = t(e);
    if (r === null || r === !1) return null;
    if (Ki(r))
      throw new Error("it returned a promise; it must be synchronous");
    return { ...r && typeof r == "object" ? r : e, ...n };
  } catch (r) {
    return mo || (mo = !0, Qn(
      `beforeSend failed. Events are dropped until it is fixed: ${String(r)}`
    )), null;
  }
}
function ji(e) {
  $s() && (e.session_is_new = 1);
}
function D(e) {
  if (!ie() || !Bo() || hn("events")) return;
  mc();
  const t = e(), n = t.event_type;
  if (Mu(n)) return;
  n === "resource" && Ju(t), zo(n), cc(t), _c(t);
  const r = { ...Bi(), ...t };
  ji(r);
  const o = $i(r);
  o && pr(qi, o);
}
function Tr(e) {
  xu(
    () => D(e)
  );
}
function Nu(e, t) {
  if (!Bo() || hn("events")) return;
  e.view_update_seq === 1 && zo("view");
  const n = {
    ...Bi(t),
    ...e,
    action_id: "",
    connection_type: Ou(),
    screen_width: typeof screen < "u" ? screen.width : 0,
    screen_height: typeof screen < "u" ? screen.height : 0
  };
  e.view_update_seq === 1 && (n.view_is_new = 1), t === ie() && ji(n);
  const r = $i(n);
  r && Da(
    qi,
    "view:" + String(e.view_id),
    r,
    (o, i) => {
      const s = { ...i }, c = o;
      return c.view_is_new === 1 && (s.view_is_new = 1), c.session_is_new === 1 && (s.session_is_new = 1), s;
    }
  );
}
function Du(e) {
  D(() => e);
}
function Uu() {
  pc(
    Nu,
    (e) => Fi(e, O().viewUrlQueryParams)
  ), Ic(Du), Hu(), $u(), Vu(), tl(), nl(), rl(), ol();
}
function Hu() {
  const e = (n) => {
    D(() => {
      var i, s, c;
      const r = n.message ?? "", o = typeof ((i = n.error) == null ? void 0 : i.message) == "string" ? n.error.message : r;
      return {
        event_type: "error",
        error_message: It(r),
        error_type: ((s = n.error) == null ? void 0 : s.name) ?? "Error",
        error_stack: tr(
          ((c = n.error) == null ? void 0 : c.stack) ?? "",
          o
        ),
        error_source: "source",
        error_handling: "unhandled"
      };
    });
  }, t = (n) => zi(n.reason);
  window.addEventListener("error", e), window.addEventListener(
    "unhandledrejection",
    t
  ), Kn = !0, H.push(() => {
    window.removeEventListener("error", e), window.removeEventListener(
      "unhandledrejection",
      t
    ), Kn = !1;
  });
}
let Kn = !1;
const ho = /* @__PURE__ */ new WeakSet();
function zi(e) {
  if (e !== null && typeof e == "object") {
    if (ho.has(e)) return;
    ho.add(e);
  }
  D(() => {
    const t = (e == null ? void 0 : e.message) ?? String(e);
    return {
      event_type: "error",
      error_message: It(t),
      error_type: (e == null ? void 0 : e.name) ?? "UnhandledRejection",
      error_stack: tr((e == null ? void 0 : e.stack) ?? "", t),
      error_source: "promise",
      error_handling: "unhandled"
    };
  });
}
let yo = !1;
function yl() {
  const e = globalThis.Zone;
  if (yo || !e || typeof e.__symbol__ != "function")
    return;
  yo = !0;
  const t = e.__symbol__("unhandledPromiseRejectionHandler"), n = e[t];
  e[t] = function(r) {
    if (Kn)
      try {
        zi(
          r && typeof r == "object" && "rejection" in r && "promise" in r ? r.rejection : r
        );
      } catch {
      }
    if (typeof n == "function")
      return n.call(this, r);
  };
}
function Vi(e) {
  return e instanceof Error || typeof e == "object" && e !== null && typeof e.message == "string" && typeof e.name == "string" && "stack" in e;
}
const Ye = 8192;
function Fu(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${Ye} bytes omitted]`;
}
function Bu(e) {
  if (typeof e == "string") return e;
  if (Vi(e))
    return e.message ? `${e.name}: ${e.message}` : e.name;
  if (Qt(
    e,
    Ye + 1
  ) > Ye)
    return Fu(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function qu(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= Ye) break;
    t && (t += " "), t += Bu(n);
  }
  return t.length > Ye ? t.slice(0, Ye) + "… [truncated]" : t;
}
function $u() {
  for (const e of hs()) {
    const t = console[e], n = (...r) => {
      try {
        const o = It(qu(r)), i = e === "error" ? r.find(Vi) : void 0;
        D(() => {
          const s = {
            event_type: "console",
            console_level: e,
            console_message: o
          };
          return i && (s.error_type = i.name, s.error_message = It(i.message), s.error_stack = tr(
            i.stack ?? "",
            i.message
          ), s.error_source = "console", s.error_handling = "handled"), s;
        });
      } catch {
      }
      t.apply(console, r);
    };
    n[Lo] = t, console[e] = n, H.push(() => {
      console[e] = t;
    });
  }
}
const Gn = "oodle_rum_tab_hidden";
function go(e) {
  try {
    e ? sessionStorage.setItem(Gn, "1") : sessionStorage.removeItem(Gn);
  } catch {
  }
}
function ju() {
  try {
    return sessionStorage.getItem(Gn) === "1";
  } catch {
    return !1;
  }
}
function zu() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && ju() && (go(!1), D(() => ({
    event_type: "visibility",
    action_type: "tab_visible"
  })));
  let e = document.visibilityState === "hidden";
  const t = () => {
    const n = document.visibilityState === "hidden";
    n !== e && (e = n, go(n), D(() => ({
      event_type: "visibility",
      action_type: n ? "tab_hidden" : "tab_visible"
    })), n || oe());
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
function Ar(e) {
  const t = O().endpoint;
  return e.startsWith(t);
}
function Vu() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || Ar(r.name))
          continue;
        const i = kt(r.name), s = Xi(r), c = Xu(o, r.name);
        Tr(
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
function Xu(e, t) {
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
function Xi(e) {
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
function Yi(e, t) {
  try {
    const n = performance.getEntriesByName(
      Wi(e),
      "resource"
    );
    for (let r = n.length - 1; r >= 0; r--) {
      const o = n[r];
      if (o.startTime >= t - 2)
        return {
          ...Xi(o),
          resource_size: o.transferSize ?? 0
        };
    }
  } catch {
  }
  return {};
}
function pn(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function Wi(e) {
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
function Ji(e) {
  const t = Wi(e), n = O();
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
  let c = !1;
  const a = n.forwardNetworkHeaders;
  return a && (c = Ln(
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
let _o = null, vo = Ci(void 0);
function At(e) {
  const t = O().redactHeaders;
  return t !== _o && (_o = t, vo = Ci(t)), vo(e);
}
function Yu(e) {
  const t = {};
  for (const n of Object.keys(e)) {
    const r = n.toLowerCase();
    At(r) || (t[r] = e[n]);
  }
  return t;
}
const wo = [
  "request_headers",
  "response_headers",
  "request_body",
  "response_body"
];
let So = !1;
function Ki(e) {
  return !!e && (typeof e == "object" || typeof e == "function") && typeof e.then == "function";
}
function Eo(e) {
  if (!(typeof e != "string" || !e))
    try {
      const t = JSON.parse(e);
      return t && typeof t == "object" ? t : void 0;
    } catch {
      return;
    }
}
function bo(e) {
  if (!e || typeof e != "object") return "";
  const t = {};
  for (const [n, r] of Object.entries(e))
    r != null && (t[n.toLowerCase()] = String(r));
  return Object.keys(t).length > 0 ? JSON.stringify(t) : "";
}
let To = null, Ao = Li(void 0);
function Wu() {
  const e = O().redactBodyKeys;
  return e !== To && (To = e, Ao = Li(e)), Ao;
}
function Ju(e) {
  var c;
  if (!wo.some((a) => e[a])) return;
  for (const a of ["request_body", "response_body"])
    typeof e[a] == "string" && e[a] && (e[a] = Fc(e[a], Wu()));
  const t = O().beforeSendNetwork;
  if (typeof t != "function") return;
  const n = {
    url: String(e.resource_url ?? ""),
    method: String(e.resource_method ?? ""),
    status: Number(e.resource_status ?? 0),
    requestHeaders: Eo(e.request_headers),
    responseHeaders: Eo(e.response_headers),
    requestBody: typeof e.request_body == "string" ? e.request_body : void 0,
    responseBody: typeof e.response_body == "string" ? e.response_body : void 0
  };
  let r;
  try {
    const a = t(n);
    if (Ki(a))
      throw new Error("it returned a promise; it must be synchronous");
    r = a === void 0 ? n : a;
  } catch (a) {
    So || (So = !0, Qn(
      `beforeSendNetwork failed. Captured headers and bodies are dropped until it is fixed: ${String(a)}`
    )), r = null;
  }
  for (const a of wo) delete e[a];
  if (!r || typeof r != "object") return;
  const o = ((c = O().forwardNetworkBodies) == null ? void 0 : c.maxBodySize) ?? 65536, i = bo(r.requestHeaders), s = bo(r.responseHeaders);
  i && (e.request_headers = i), s && (e.response_headers = s), typeof r.requestBody == "string" && r.requestBody && (e.request_body = pe(r.requestBody, o)), typeof r.responseBody == "string" && r.responseBody && (e.response_body = pe(r.responseBody, o));
}
function Gi(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      At(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      At(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      At(r) || (t[r] = e[n]);
    }
  return t;
}
function Ku(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    At(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function pe(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function Gu(e, t) {
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
function Qu(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function Zu(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      Gi(
        e
      )
    );
  } catch {
    return "";
  }
}
function ko(e) {
  try {
    return JSON.stringify(
      Gi(e)
    );
  } catch {
    return "";
  }
}
function Qi(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function el(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: pe(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: pe(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : Qi(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => pe(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function Zi(e, t, n) {
  const r = function(o, i) {
    const s = Qu(o);
    if (Ar(s))
      return t.apply(e, [
        o,
        i
      ]);
    const c = Qi(o), a = ((i == null ? void 0 : i.method) ?? (c ? o.method : "GET")).toUpperCase(), l = performance.now(), u = Ji(s);
    li();
    let f = !1;
    const m = () => {
      f || (f = !0, fi());
    };
    let h = "", g = "";
    if (n.injectTracing) {
      const E = Mi();
      if (E)
        h = E.traceId, g = E.spanId;
      else if (u.trace) {
        h = pn(16), g = pn(8);
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
      const E = u.bodyCfg.maxBodySize ?? 65536, A = el(
        i,
        o,
        E
      );
      v = A.sync, k = A.asyncP;
    }
    let I = "";
    return u.captureHeaders && (i != null && i.headers ? I = Zu(
      i.headers
    ) : c && (I = ko(
      o.headers
    ))), t.apply(e, [o, i]).then((E) => {
      m();
      const A = E.status, L = Math.round(
        performance.now() - l
      );
      let y = "";
      u.captureHeaders && (y = ko(
        E.headers
      ));
      const w = (p) => {
        const d = {
          event_type: "resource",
          resource_url: kt(s),
          resource_method: a,
          resource_status: A,
          resource_duration_ms: L,
          resource_size: 0,
          resource_type: "fetch",
          ...Yi(s, l)
        };
        return h && (d.trace_id = h, d.span_id = g), p && (d.request_body = p), I && (d.request_headers = I), y && (d.response_headers = y), d;
      }, S = k || Promise.resolve(v);
      if (u.bodyCfg) {
        const p = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          S,
          Gu(
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
            resource_url: kt(s),
            resource_method: a,
            resource_status: 0,
            resource_duration_ms: A,
            resource_size: 0,
            resource_type: "fetch"
          };
          return h && (w.trace_id = h, w.span_id = g), y && (w.request_body = y), I && (w.request_headers = I), w;
        });
      }), E;
    });
  };
  return e.fetch = r, () => {
    e.fetch = t;
  };
}
function es(e, t, n) {
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
    if (Ar(c))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const a = Ji(c);
    let l = "", u = "";
    if (n.injectTracing) {
      const y = Mi();
      y ? (l = y.traceId, u = y.spanId) : a.trace && (l = pn(16), u = pn(8), i.call(
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
        const y = this.__oodleReqHeaders, w = y ? Yu(y) : {};
        Object.keys(w).length > 0 && (m = JSON.stringify(w));
      } catch {
      }
    const h = performance.now(), g = this;
    li();
    const v = l, k = u, I = f, E = a.bodyCfg, A = m, L = a.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        fi();
        const y = Math.round(
          performance.now() - h
        ), w = g.__oodleMethod ?? "GET";
        D(() => {
          const S = {
            event_type: "resource",
            resource_url: kt(c),
            resource_method: w,
            resource_status: g.status,
            resource_duration_ms: y,
            resource_size: 0,
            resource_type: "xhr",
            ...Yi(c, h)
          };
          if (v && (S.trace_id = v, S.span_id = k), I && (S.request_body = I), E)
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
                Ku(p)
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
const ts = {
  injectTracing: !0
}, Io = {
  injectTracing: !1
};
function tl() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = Zi(
    window,
    window.fetch,
    ts
  );
  H.push(e);
}
function nl() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = es(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    ts
  );
  H.push(e);
}
const Co = /* @__PURE__ */ new WeakSet();
function Mn(e) {
  if (Co.has(e)) return;
  Co.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (Zi(
        n,
        n.fetch,
        Io
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (es(
        r.prototype,
        r.prototype.setRequestHeader,
        Io
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), H.push(() => {
    e.removeEventListener("load", t);
  });
}
function rl() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach(Mn);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          r instanceof HTMLIFrameElement && Mn(r), r instanceof HTMLElement && r.childElementCount > 0 && r.querySelectorAll("iframe").forEach(Mn);
    }
  );
  e.observe(document.documentElement, {
    childList: !0,
    subtree: !0
  }), H.push(() => {
    e.disconnect();
  });
}
function ol() {
  if (!(typeof PerformanceObserver > "u") && !il())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            Tr(() => ({
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
function il() {
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
          Tr(() => ({
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
function sl(e, t) {
  D(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function al(e) {
  return /iPad|Tablet/i.test(e) || /Android/i.test(e) && !/Mobi/i.test(e) ? "tablet" : /Mobi|iPhone|iPod|Android/i.test(e) ? "mobile" : "desktop";
}
const ns = [
  ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
  ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
  ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
  ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
  ["Safari", /Version\/([\d.]+).*Safari/]
];
function cl(e) {
  for (const [t, n] of ns) if (n.test(e)) return t;
  return e.includes("Safari") ? "Safari" : "Other";
}
function ul(e) {
  for (const [, t] of ns) {
    const n = e.match(t);
    if (n) return n[1];
  }
  return "";
}
function ll(e) {
  return /iPhone|iPad|iPod/.test(e) ? "iOS" : e.includes("Android") ? "Android" : e.includes("CrOS") ? "Chrome OS" : e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : "Other";
}
function fl(e) {
  let t = e.match(/OS (\d+[_.]\d+(?:[_.]\d+)?) like Mac OS X/);
  return t ? t[1].replace(/_/g, ".") : (t = e.match(/Android ([\d.]+)/), t || (t = e.match(/Windows NT ([\d.]+)/), t) ? t[1] : (t = e.match(/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/), t ? t[1].replace(/_/g, ".") : ""));
}
function dl() {
  ki(), bi();
  for (const e of H)
    e();
  H = [];
}
let ge = !1;
const gl = {
  init(e) {
    ge || Ls(e) && (Gs(e.tags), Ns(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), ge = !0, Ho(), zu(), Vr(), zs(), ra(), Ha(() => {
      Vr();
    }), e.sessionReplay !== !1 && qo() && Au(), Uu(), e.openTelemetry && import("./tracing-B0S6ILPw.js").then(
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
    Qs(e);
  },
  identify(e) {
    Xs(e);
  },
  trackEvent(e, t) {
    ge && sl(e, t);
  },
  addFeatureFlag(e, t) {
    Ba(e, t);
  },
  getSessionId() {
    return ge ? ie() : "";
  },
  getUserId() {
    return Vo();
  },
  flush() {
    ge && oe();
  },
  stop() {
    ge && (Cu(), dl(), oa(), jo(), oe(!0), $a(), Fa(), ge = !1);
  }
};
export {
  gl as O,
  ml as a,
  yl as c,
  pl as r,
  hl as s
};
