const wo = "__oodleOriginal";
function Vn(e) {
  try {
    const t = console.warn;
    (t[wo] ?? t).call(
      console,
      "[@oodle-ai/rum] " + e
    );
  } catch {
  }
}
const Nt = [
  "error",
  "warn"
];
function Wi() {
  return {
    patterns: [],
    maskFn: null,
    referrer: "path",
    consoleLevels: Nt,
    messages: "full",
    actionText: "full",
    userAgent: "full",
    queryStrings: "events",
    userInfo: "full",
    keepParams: []
  };
}
let b = Wi();
const pn = "/:redacted", Ji = 256, et = /* @__PURE__ */ new Map();
let Tn = !1;
const Te = Vn;
function Ie(e, t, n, r, o) {
  return t === void 0 ? r : typeof t == "string" && n.includes(t) ? t : (Te(
    `${e} must be one of ${n.map((i) => `'${i}'`).join(", ")}. Using '${o}'.`
  ), o);
}
function Ki(e) {
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
function Gi(e) {
  if (e === void 0) return [];
  if (!Array.isArray(e))
    return Te(
      "urlPathPatterns must be an array of path patterns such as '/projects/:id'. It is ignored."
    ), [];
  const t = [];
  for (const n of e) {
    const r = Ki(n);
    r ? t.push(r) : Te(
      `urlPathPatterns: ${JSON.stringify(n)} is not a valid pattern. Patterns start with '/', use ':name' for one segment and may end in '/*'. It is ignored.`
    );
  }
  return t;
}
function Qi(e) {
  if (e === void 0) return Nt;
  if (!Array.isArray(e))
    return Te(
      "consoleLevels must be an array such as ['error']. Console capture is off."
    ), [];
  const t = Nt.filter(
    (n) => e.includes(n)
  );
  return e.some(
    (n) => !Nt.includes(n)
  ) && Te(
    "consoleLevels accepts only 'error' and 'warn'. Other values are ignored."
  ), t;
}
function Zi(e) {
  et.clear(), Tn = !1;
  const t = e.maskUrlPath;
  t !== void 0 && typeof t != "function" && Te("maskUrlPath must be a function. It is ignored."), b = {
    patterns: Gi(e.urlPathPatterns),
    maskFn: typeof t == "function" ? t : null,
    referrer: Ie(
      "referrerUrl",
      e.referrerUrl,
      ["path", "origin", "none"],
      "path",
      "none"
    ),
    consoleLevels: Qi(
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
function Xn() {
  return b.patterns.length > 0 || b.maskFn !== null;
}
function es(e) {
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
function ts(e) {
  let t = b.patterns.length > 0 ? es(e) : e;
  if (b.maskFn)
    try {
      const n = b.maskFn(t);
      t = typeof n == "string" ? n : pn;
    } catch (n) {
      Tn || (Tn = !0, Te(
        `maskUrlPath threw. Paths are sent as '${pn}' until it is fixed: ${String(n)}`
      )), t = pn;
    }
  return t;
}
function le(e) {
  if (!Xn()) return e;
  const t = et.get(e);
  if (t !== void 0) return t;
  const n = ts(e);
  return et.size >= Ji && et.clear(), et.set(e, n), n;
}
function ns(e) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(e);
}
function gt(e, t) {
  if (ns(e)) {
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
function So(e) {
  return !Xn() || typeof e != "string" ? e : Yn(e, (t) => t.search + t.hash);
}
function Ku() {
  return Xn() || b.queryStrings === "all";
}
function rs(e) {
  return b.queryStrings !== "all" ? So(e) : typeof e != "string" ? e : Yn(e, (t) => {
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
function Gu(e) {
  return b.queryStrings !== "all" ? So(e) : typeof e != "string" ? e : Yn(e, () => "");
}
function Yn(e, t) {
  let n;
  try {
    n = new URL(e);
  } catch {
    return e;
  }
  return n.protocol !== "http:" && n.protocol !== "https:" ? e : n.origin + le(n.pathname) + t(n);
}
let Er = null, Tr = "", br = null;
function os(e) {
  if (e === Er && br === b)
    return Tr;
  let t = "";
  if (e && b.referrer !== "none")
    try {
      const n = new URL(e);
      t = b.referrer === "origin" ? n.origin : n.origin + le(n.pathname);
    } catch {
      t = b.referrer === "origin" ? "" : e;
    }
  return Er = e, Tr = t, br = b, t;
}
function is() {
  return b.consoleLevels;
}
function ss() {
  return b.userAgent === "full";
}
function as(e, t, n) {
  switch (b.userInfo) {
    case "full":
      return { user_id: e, user_name: t, user_email: n };
    case "id":
      return { user_id: e, user_name: "", user_email: "" };
    default:
      return { user_id: "", user_name: "", user_email: "" };
  }
}
const cs = [
  [/(^|[^\w])'(?:[^'\\\n]|\\.){0,500}'/g, "$1'?'"],
  [/(^|[^\w])"(?:[^"\\\n]|\\.){0,500}"/g, '$1"?"'],
  [/(^|[^\w])`(?:[^`\\\n]|\\.){0,500}`/g, "$1`?`"]
], us = /\bhttps?:\/\/[^\s'"`<>()\]]+/g, ls = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, fs = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, ds = /\b(?=[0-9a-fA-F]*\d)(?=[0-9a-fA-F]*[a-fA-F])[0-9a-fA-F]{16,}\b/g, ps = /\d{4,}/g, Ar = 8192;
function ms(e) {
  if (!e) return e;
  let t = e.length > Ar ? e.slice(0, Ar) + "… [truncated]" : e;
  t = t.replace(us, (n) => gt(n)), t.includes("@") && (t = t.replace(ls, "<email>"));
  for (const [n, r] of cs)
    t = t.replace(n, r);
  return t = t.replace(fs, "<id>"), t = t.replace(ds, "<id>"), t = t.replace(ps, "<n>"), t;
}
const hs = /^\s+at |^[^\s@]*@\S+:\d+(?::\d+)?$/m;
function _t(e) {
  switch (b.messages) {
    case "full":
      return e;
    case "scrub":
      return ms(e);
    default:
      return "";
  }
}
function Wn(e, t) {
  if (b.messages === "full" || !e || !t) return e;
  const n = hs.exec(e), r = n ? n.index : e.length, o = e.indexOf(t);
  if (o < 0 || o + t.length > r)
    return e;
  const i = _t(t);
  let s = e.slice(0, o) + i;
  return i || (s = s.replace(/:\s*$/, "")), s + e.slice(o + t.length);
}
const Eo = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', To = '[data-oodle-privacy="mask"],.oodle-privacy-mask', ys = Eo + "," + To + ",.rr-block,.rr-mask";
function gs(e) {
  if (b.actionText === "mask") return !0;
  try {
    return typeof e.closest == "function" && e.closest(ys) !== null;
  } catch {
    return !0;
  }
}
let bn = null;
function _s(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function vs(e) {
  if (!_s(e.endpoint))
    return console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    ), !1;
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  );
  const t = ws(
    e.viewUrlQueryParams
  );
  return Zi({ ...e, viewUrlQueryParams: t }), bn = { ...e, viewUrlQueryParams: t }, !0;
}
function ws(e) {
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
  if (!bn)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return bn;
}
const Jn = "__oodle_session_v2", Kn = "__oodle_tab", kr = "__oodle_session", Ss = 900 * 1e3, bo = 14400 * 1e3, Ao = 1e3;
function Je() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
let nt = null, $ = null;
function Gn(e, t) {
  try {
    const n = e == null ? void 0 : e.getItem(t);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function Qn(e, t, n) {
  try {
    e == null || e.setItem(t, JSON.stringify(n));
  } catch {
  }
}
function ko() {
  try {
    return typeof localStorage < "u" ? localStorage : void 0;
  } catch {
    return;
  }
}
function vt() {
  try {
    return typeof sessionStorage < "u" ? sessionStorage : void 0;
  } catch {
    return;
  }
}
const Es = 1e3;
let wt = 0;
function we() {
  const e = Date.now();
  if (nt && e - wt < Es) return nt;
  wt = e;
  const t = Gn(ko(), Jn);
  return t && typeof t.id == "string" && t.id ? Ts({
    id: t.id,
    createdAt: t.createdAt ?? Date.now(),
    lastActivity: t.lastActivity ?? Date.now(),
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: t.started ?? !0
  }) : nt;
}
function Ts(e) {
  return e && (nt = e), e;
}
function rn(e) {
  nt = e, wt = Date.now(), Qn(ko(), Jn, e);
}
function Co() {
  if ($) return $;
  const e = Gn(vt(), Kn);
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
function bs(e) {
  $ = e, Qn(vt(), Kn, e);
}
let Re = null;
function As(e) {
  $ = e, !Re && (Re = setTimeout(() => {
    Re = null, $ && Qn(vt(), Kn, $);
  }, 1e3));
}
function Rt(e) {
  Re && (clearTimeout(Re), Re = null), bs(e);
}
let Io = 100, Mo = 100;
function ks(e, t) {
  Io = Math.max(0, Math.min(100, e)), Mo = Math.max(0, Math.min(100, t));
}
function Cr(e) {
  return Math.random() * 100 < e;
}
function $t(e, t) {
  return !!e && t - e.lastActivity <= Ss && t - e.createdAt <= bo;
}
function Cs(e) {
  var r;
  const t = Gn(vt(), kr);
  if (!t || typeof t.id != "string") return !1;
  const n = {
    id: t.id,
    createdAt: t.createdAt ?? e,
    lastActivity: t.lastActivity ?? e,
    sampled: t.sampled ?? !0,
    replaySampled: t.replaySampled ?? !0,
    started: !0
  };
  if (e - n.lastActivity > 1800 * 1e3 || e - n.createdAt > bo)
    return !1;
  rn(n), Rt({
    tabId: Je(),
    sessionId: n.id,
    viewCount: t.viewCount ?? 0,
    errorCount: t.errorCount ?? 0,
    actionCount: t.actionCount ?? 0,
    replaySegmentSeq: t.replaySegmentSeq ?? 0,
    legacyReplay: !0
  });
  try {
    (r = vt()) == null || r.removeItem(kr);
  } catch {
  }
  return !0;
}
function Is(e) {
  const t = Cr(Io), n = {
    id: Je(),
    createdAt: e,
    lastActivity: e,
    sampled: t,
    replaySampled: t && Cr(Mo),
    started: !1
  };
  return rn(n), n;
}
const An = /* @__PURE__ */ new Set();
function Ms(e) {
  return An.add(e), () => An.delete(e);
}
function Ot() {
  let e = Co();
  return e || (e = {
    tabId: Je(),
    sessionId: "",
    viewCount: 0,
    errorCount: 0,
    actionCount: 0,
    replaySegmentSeq: 0,
    legacyReplay: !1
  }, Rt(e)), e;
}
function Lo(e) {
  const t = Ot();
  if (t.sessionId === e) return;
  const n = t.sessionId;
  if (t.sessionId = e, t.viewCount = 0, t.errorCount = 0, t.actionCount = 0, t.replaySegmentSeq = 0, t.legacyReplay = !1, Rt(t), n)
    for (const r of An)
      try {
        r(n, e);
      } catch {
      }
}
let mn = 0;
function kn() {
  const e = Date.now();
  let t = we();
  $t(t, e) || (wt = 0, t = we()), $t(t, e) ? e - mn >= Ao && (t.lastActivity = Math.max(t.lastActivity, e), rn(t), mn = e) : (Cs(e) ? t = we() : t = Is(e), mn = e), t && Lo(t.id);
}
function oe() {
  const e = Date.now(), t = we();
  return $t(t, e) ? (Lo(t.id), t.id) : "";
}
function Ro() {
  return Ot().tabId;
}
function Ls() {
  return Ot().legacyReplay;
}
function Rs() {
  const e = Date.now(), t = we();
  return !$t(t, e) || t.started ? !1 : (t.started = !0, rn(t), !0);
}
function Os() {
  if (!oe()) return 0;
  const e = Ot(), t = e.replaySegmentSeq;
  return e.replaySegmentSeq = t + 1, Rt(e), t;
}
function Oo() {
  const e = we();
  return (e == null ? void 0 : e.sampled) ?? !0;
}
function xo() {
  const e = we();
  return (e == null ? void 0 : e.replaySampled) ?? !0;
}
let rt = null, ot = null, it = null;
const Po = ["click", "keydown", "touchstart", "scroll"];
function xs() {
  if (typeof document > "u") return;
  Uo();
  let e = 0;
  rt = () => {
    const t = Date.now();
    t - e < Ao || (e = t, kn());
  };
  for (const t of Po)
    document.addEventListener(t, rt, {
      capture: !0,
      passive: !0
    });
  it = (t) => {
    t.key === Jn && (wt = 0);
  }, window.addEventListener("storage", it), ot = () => {
    document.visibilityState === "visible" ? kn() : $ && Rt($);
  }, document.addEventListener("visibilitychange", ot);
}
function Uo() {
  if (!(typeof document > "u")) {
    if (rt) {
      for (const e of Po)
        document.removeEventListener(e, rt, {
          capture: !0
        });
      rt = null;
    }
    ot && (document.removeEventListener("visibilitychange", ot), ot = null), it && (window.removeEventListener("storage", it), it = null);
  }
}
function No(e) {
  if (!oe()) return;
  const t = Ot();
  e === "view" || e === "page_load" ? t.viewCount++ : e === "error" ? t.errorCount++ : e === "action" && t.actionCount++, As(t);
}
function Ps() {
  const e = $ ?? Co();
  return {
    viewCount: (e == null ? void 0 : e.viewCount) ?? 0,
    errorCount: (e == null ? void 0 : e.errorCount) ?? 0,
    actionCount: (e == null ? void 0 : e.actionCount) ?? 0
  };
}
let z = null;
function Us(e) {
  z = e;
}
function Do() {
  return (z == null ? void 0 : z.id) ?? "";
}
function Ns() {
  return (z == null ? void 0 : z.name) ?? "";
}
function Ds() {
  return (z == null ? void 0 : z.email) ?? "";
}
function Hs() {
  return z ? "identified" : "anonymous";
}
const Fs = 5e5;
function zt(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > Fs) return n;
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
let St = {};
function Bs(e) {
  e && (St = { ...e, ...St });
}
function qs(e) {
  St = { ...St, ...e };
}
function $s() {
  return St;
}
const zs = 6e4, js = "sdk_telemetry", Oe = {
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
function Vs() {
  for (const e in Oe)
    if (Oe[e] > 0)
      return !0;
  return !1;
}
function Cn() {
  if (!Vs()) return;
  const e = { ...Oe };
  for (const t in Oe)
    Oe[t] = 0;
  rr(js, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let st = null, at = null;
function Xs() {
  st || (st = setInterval(
    Cn,
    zs
  ), typeof document < "u" && (at = () => {
    document.visibilityState === "hidden" && Cn();
  }, document.addEventListener(
    "visibilitychange",
    at
  )));
}
function Ys() {
  st && (clearInterval(st), st = null), at && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    at
  ), at = null), Cn();
}
var D = Uint8Array, U = Uint16Array, Zn = Int32Array, er = new D([
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
]), tr = new D([
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
]), Ir = new D([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Ho = function(e, t) {
  for (var n = new U(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new Zn(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, Fo = Ho(er, 2), Ws = Fo.b, In = Fo.r;
Ws[28] = 258, In[258] = 28;
var Js = Ho(tr, 0), Mr = Js.r, Mn = new U(32768);
for (var T = 0; T < 32768; ++T) {
  var se = (T & 43690) >> 1 | (T & 21845) << 1;
  se = (se & 52428) >> 2 | (se & 13107) << 2, se = (se & 61680) >> 4 | (se & 3855) << 4, Mn[T] = ((se & 65280) >> 8 | (se & 255) << 8) >> 1;
}
var ct = (function(e, t, n) {
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
          c[Mn[f] >> a] = l;
  } else
    for (c = new U(r), o = 0; o < r; ++o)
      e[o] && (c[o] = Mn[s[e[o] - 1]++] >> 15 - e[o]);
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
var jt = new D(32);
for (var T = 0; T < 32; ++T)
  jt[T] = 5;
var Ks = /* @__PURE__ */ ct(be, 9, 0), Gs = /* @__PURE__ */ ct(jt, 5, 0), Bo = function(e) {
  return (e + 7) / 8 | 0;
}, qo = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new D(e.subarray(t, n));
}, J = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, Ge = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, hn = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: zo, l: 0 };
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
  var m = new U(h + 1), g = Ln(n[u - 1], m, 0);
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
      var M = i[r].s;
      m[M] == t && (--m[M], ++_);
    }
    g = t;
  }
  return { t: new D(m), l: g };
}, Ln = function(e, t, n) {
  return e.s == -1 ? Math.max(Ln(e.l, t, n + 1), Ln(e.r, t, n + 1)) : t[e.s] = n;
}, Lr = function(e) {
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
}, Qe = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, $o = function(e, t, n) {
  var r = n.length, o = Bo(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, Rr = function(e, t, n, r, o, i, s, c, a, l, u) {
  J(t, u++, n), ++o[256];
  for (var f = hn(o, 15), h = f.t, m = f.l, g = hn(i, 15), _ = g.t, k = g.l, C = Lr(h), E = C.c, A = C.n, M = Lr(_), y = M.c, v = M.n, w = new U(19), p = 0; p < E.length; ++p)
    ++w[E[p] & 31];
  for (var p = 0; p < y.length; ++p)
    ++w[y[p] & 31];
  for (var d = hn(w, 7), L = d.t, W = d.l, P = 19; P > 4 && !L[Ir[P - 1]]; --P)
    ;
  var Ae = l + 5 << 3, F = Qe(o, be) + Qe(i, jt) + s, B = Qe(o, h) + Qe(i, _) + s + 14 + 3 * P + Qe(w, L) + 2 * w[16] + 3 * w[17] + 7 * w[18];
  if (a >= 0 && Ae <= F && Ae <= B)
    return $o(t, u, e.subarray(a, a + l));
  var j, I, q, ie;
  if (J(t, u, 1 + (B < F)), u += 2, B < F) {
    j = ct(h, m, 0), I = h, q = ct(_, k, 0), ie = _;
    var un = ct(L, W, 0);
    J(t, u, A - 257), J(t, u + 5, v - 1), J(t, u + 10, P - 4), u += 14;
    for (var p = 0; p < P; ++p)
      J(t, u + 3 * p, L[Ir[p]]);
    u += 3 * P;
    for (var V = [E, y], Ke = 0; Ke < 2; ++Ke)
      for (var ke = V[Ke], p = 0; p < ke.length; ++p) {
        var X = ke[p] & 31;
        J(t, u, un[X]), u += L[X], X > 15 && (J(t, u, ke[p] >> 5 & 127), u += ke[p] >> 12);
      }
  } else
    j = Ks, I = be, q = Gs, ie = jt;
  for (var p = 0; p < c; ++p) {
    var R = r[p];
    if (R > 255) {
      var X = R >> 18 & 31;
      Ge(t, u, j[X + 257]), u += I[X + 257], X > 7 && (J(t, u, R >> 23 & 31), u += er[X]);
      var Ce = R & 31;
      Ge(t, u, q[Ce]), u += ie[Ce], Ce > 3 && (Ge(t, u, R >> 5 & 8191), u += tr[Ce]);
    } else
      Ge(t, u, j[R]), u += I[R];
  }
  return Ge(t, u, j[256]), u + I[256];
}, Qs = /* @__PURE__ */ new Zn([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), zo = /* @__PURE__ */ new D(0), Zs = function(e, t, n, r, o, i) {
  var s = i.z || e.length, c = new D(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = c.subarray(r, c.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (a[0] = i.r >> 3);
    for (var f = Qs[t - 1], h = f >> 13, m = f & 8191, g = (1 << n) - 1, _ = i.p || new U(32768), k = i.h || new U(g + 1), C = Math.ceil(n / 3), E = 2 * C, A = function(dn) {
      return (e[dn] ^ e[dn + 1] << C ^ e[dn + 2] << E) & g;
    }, M = new Zn(25e3), y = new U(288), v = new U(32), w = 0, p = 0, d = i.i || 0, L = 0, W = i.w || 0, P = 0; d + 2 < s; ++d) {
      var Ae = A(d), F = d & 32767, B = k[Ae];
      if (_[F] = B, k[Ae] = F, W <= d) {
        var j = s - d;
        if ((w > 7e3 || L > 24576) && (j > 423 || !l)) {
          u = Rr(e, a, 0, M, y, v, p, L, P, d - P, u), L = w = p = 0, P = d;
          for (var I = 0; I < 286; ++I)
            y[I] = 0;
          for (var I = 0; I < 30; ++I)
            v[I] = 0;
        }
        var q = 2, ie = 0, un = m, V = F - B & 32767;
        if (j > 2 && Ae == A(d - V))
          for (var Ke = Math.min(h, j) - 1, ke = Math.min(32767, d), X = Math.min(258, j); V <= ke && --un && F != B; ) {
            if (e[d + q] == e[d + q - V]) {
              for (var R = 0; R < X && e[d + R] == e[d + R - V]; ++R)
                ;
              if (R > q) {
                if (q = R, ie = V, R > Ke)
                  break;
                for (var Ce = Math.min(V, R - 2), _r = 0, I = 0; I < Ce; ++I) {
                  var ln = d - V + I & 32767, Yi = _[ln], vr = ln - Yi & 32767;
                  vr > _r && (_r = vr, B = ln);
                }
              }
            }
            F = B, B = _[F], V += F - B & 32767;
          }
        if (ie) {
          M[L++] = 268435456 | In[q] << 18 | Mr[ie];
          var wr = In[q] & 31, Sr = Mr[ie] & 31;
          p += er[wr] + tr[Sr], ++y[257 + wr], ++v[Sr], W = d + q, ++w;
        } else
          M[L++] = e[d], ++y[e[d]];
      }
    }
    for (d = Math.max(d, W); d < s; ++d)
      M[L++] = e[d], ++y[e[d]];
    u = Rr(e, a, l, M, y, v, p, L, P, d - P, u), l || (i.r = u & 7 | a[u / 8 | 0] << 3, u -= 7, i.h = k, i.p = _, i.i = d, i.w = W);
  } else {
    for (var d = i.w || 0; d < s + l; d += 65535) {
      var fn = d + 65535;
      fn >= s && (a[u / 8 | 0] = l, fn = s), u = $o(a, u + 1, e.subarray(d, fn));
    }
    i.i = s;
  }
  return qo(c, 0, r + Bo(u) + o);
}, ea = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), ta = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = ea[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, na = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new D(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return Zs(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, Rn = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, ra = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && Rn(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, oa = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function ia(e, t) {
  t || (t = {});
  var n = ta(), r = e.length;
  n.p(e);
  var o = na(e, t, oa(t), 8), i = o.length;
  return ra(o, t), Rn(o, i - 8, n.d()), Rn(o, i - 4, r), o;
}
var Or = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), sa = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), aa = 0;
try {
  sa.decode(zo, { stream: !0 }), aa = 1;
} catch {
}
function ca(e, t) {
  var n;
  if (Or)
    return Or.encode(e);
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
  return qo(o, 0, i);
}
function Dt(e) {
  try {
    return ia(ca(e));
  } catch {
    return null;
  }
}
const ua = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function la(e) {
  if (!ua)
    return Dt(e);
  try {
    const t = new Response(e).body;
    if (!t) return Dt(e);
    const n = t.pipeThrough(
      new CompressionStream("gzip")
    ), r = await new Response(
      n
    ).arrayBuffer();
    return new Uint8Array(r);
  } catch {
    return Dt(e);
  }
}
const fa = "0.6.0", xr = 5e3, jo = 50, Vo = 5e5, Pr = 256e3, Vt = "replay", Xo = 8e4, Yo = 32, da = 2e7, pa = 5, ma = 1e3, ha = 6e4, ya = 500, Xt = 63e3;
let xe = 0, Pe = 0, ae = [], ut = 0, yn = null;
const Yt = /* @__PURE__ */ new Map();
let Ue = null, Ne = null, On = null, lt = !1;
function ga() {
  try {
    return O().flushIntervalMs ?? xr;
  } catch {
    return xr;
  }
}
function Wo(e) {
  let t = Yt.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, Yt.set(e, t)), t;
}
function Jo(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (x("compression_failures"), { body: t, encoding: "" });
}
async function Ko(e) {
  return Jo(await la(e), e);
}
function _a(e) {
  return Jo(Dt(e), e);
}
const va = 64e3;
function xn(e, t, n) {
  if (e === Vt)
    return {
      bytes: n ?? zt(
        t,
        va
      ),
      oversized: !1
    };
  const r = zt(
    t,
    Pr + 1
  );
  return {
    bytes: r,
    oversized: r > Pr
  };
}
let Pn = null;
function wa(e) {
  Pn = e;
}
function on(e) {
  x("transport_drops"), e === Vt && Pn && Pn();
}
const Sa = "/v1/rum/ingest";
function Ea(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: fa
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
function Ta(e, t, n) {
  const r = O();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const a = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, l = new Blob([n], {
      type: "application/json"
    });
    if (l.size < Xt && navigator.sendBeacon(a, l))
      return;
  }
  const { body: o, encoding: i } = _a(n), s = { ...t };
  i ? s["Content-Encoding"] = i : delete s["Content-Encoding"];
  const c = o instanceof Blob ? o.size : n.length;
  fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: c < Xt,
    credentials: "omit"
  }).catch(() => {
    x("exit_send_failures");
  });
}
function gn(e, t, n, r) {
  const o = n.length;
  if (ut + o > da) {
    x("retry_drops"), r && on(r);
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
  }), ut += o, Go();
}
function Go() {
  if (yn || ae.length === 0)
    return;
  const e = ae[0], t = Math.min(
    ma * Math.pow(2, e.attempts),
    ha
  );
  yn = setTimeout(() => {
    yn = null, Qo();
  }, t);
}
async function Qo() {
  for (; ae.length > 0 && xe < Xo && Pe < Yo; ) {
    const e = ae.shift();
    if (ut -= e.bytes, e.attempts++, e.attempts > pa) {
      x("retry_drops"), e.batchKey && on(e.batchKey);
      continue;
    }
    const t = e.bytes;
    xe += t, Pe++;
    try {
      const { body: n, encoding: r } = await Ko(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < Xt,
        credentials: "omit"
      });
      if (ei(i), i.status === 429 || i.status >= 500) {
        ae.unshift(e), ut += e.bytes;
        break;
      }
    } catch {
      ae.unshift(e), ut += e.bytes;
      break;
    } finally {
      xe -= t, Pe--;
    }
  }
  ae.length > 0 && Go();
}
function ba() {
  Ue && (clearTimeout(Ue), Ue = null), Ne && (clearTimeout(Ne), Ne = null);
}
function nr() {
  const e = ga();
  Ue && clearTimeout(Ue), Ue = setTimeout(
    () => re(),
    e
  ), Ne || (Ne = setTimeout(
    () => {
      Ne = null, re();
    },
    e + ya
  ));
}
function rr(e, t, n) {
  const { bytes: r, oversized: o } = xn(
    e,
    t,
    n
  );
  if (o) {
    console.warn(
      `[@oodle-ai/rum] Dropping oversized ${e} payload (${r} bytes)`
    ), on(e);
    return;
  }
  const i = Wo(e);
  if (i.items.push(t), i.bytesEstimate += r, !lt && (i.items.length >= jo || i.bytesEstimate >= Vo)) {
    re();
    return;
  }
  nr();
}
function Aa(e, t, n, r) {
  const { bytes: o, oversized: i } = xn(
    e,
    n
  );
  if (i) {
    on(e);
    return;
  }
  const s = Wo(e), c = s.upsertMap.get(t);
  if (c !== void 0) {
    const a = xn(
      e,
      s.items[c]
    ).bytes;
    s.items[c] = r ? r(s.items[c], n) : n, s.bytesEstimate += o - a;
  } else {
    const a = s.items.length;
    s.items.push(n), s.upsertMap.set(t, a), s.bytesEstimate += o;
  }
  if (!lt && (s.items.length >= jo || s.bytesEstimate >= Vo)) {
    re();
    return;
  }
  nr();
}
function Zo(e) {
  On = e;
}
const Ur = ["events", "replay"];
function re(e = !1) {
  const t = O();
  if (e && On && !lt) {
    lt = !0;
    try {
      On();
    } catch {
    } finally {
      lt = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    nr();
    return;
  }
  ba();
  const n = $s(), r = [], o = Array.from(
    Yt.keys()
  ).sort((l, u) => {
    const f = Ur.indexOf(l), h = Ur.indexOf(u), m = f >= 0 ? f : 999, g = h >= 0 ? h : 999;
    return m - g;
  });
  for (const l of o) {
    const u = Yt.get(l);
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
  const i = Ea(r), s = `${t.endpoint}${Sa}`, c = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, a = r.some(
    (l) => l.type === Vt
  );
  if (e) {
    Ta(s, c, i);
    return;
  }
  ka(
    s,
    c,
    i,
    a ? Vt : void 0
  );
}
async function ka(e, t, n, r) {
  const o = n.length;
  if (xe >= Xo || Pe >= Yo) {
    gn(e, t, n, r);
    return;
  }
  xe += o, Pe++;
  try {
    const { body: i, encoding: s } = await Ko(n), c = { ...t };
    s && (c["Content-Encoding"] = s);
    const a = await fetch(e, {
      method: "POST",
      headers: c,
      body: i,
      keepalive: o < Xt,
      credentials: "omit"
    });
    ei(a), (a.status === 429 || a.status >= 500) && gn(e, t, n, r);
  } catch {
    x("send_failures"), gn(e, t, n, r);
  } finally {
    xe -= o, Pe--, Qo();
  }
}
const Un = /* @__PURE__ */ new Map();
function ei(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && Un.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function sn(e) {
  const t = Un.get(e);
  return t ? Date.now() >= t ? (Un.delete(e), !1) : !0 : !1;
}
let ft = null, dt = null, pt = null, Nn = null;
function Ca(e) {
  Nn = e;
}
const ti = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function Nr() {
  typeof document > "u" || (ft = () => {
    document.visibilityState === "hidden" && re(!0);
  }, dt = () => re(!0), pt = (e) => {
    e.persisted && Nn && Nn();
  }, document.addEventListener(
    "visibilitychange",
    ft
  ), window.addEventListener(
    ti,
    dt
  ), window.addEventListener(
    "pageshow",
    pt
  ));
}
function Ia() {
  ft && (document.removeEventListener(
    "visibilitychange",
    ft
  ), ft = null), dt && (window.removeEventListener(
    ti,
    dt
  ), dt = null), pt && (window.removeEventListener(
    "pageshow",
    pt
  ), pt = null);
}
const Wt = /* @__PURE__ */ new Map();
function Ma(e, t) {
  Wt.set(e, t);
}
function La() {
  return Wt.size === 0 ? {} : Object.fromEntries(Wt);
}
function Ra() {
  Wt.clear();
}
const Oa = 100, xa = 1e4, mt = /* @__PURE__ */ new Set();
let Et = 0, De = null;
function or() {
  for (const e of mt)
    try {
      e();
    } catch {
    }
}
function Pa() {
  De || typeof MutationObserver > "u" || typeof document > "u" || !document.documentElement || (De = new MutationObserver(or), De.observe(document.documentElement, {
    childList: !0,
    subtree: !0,
    attributes: !0,
    characterData: !0
  }));
}
function Dr() {
  mt.size > 0 || !De || (De.disconnect(), De = null);
}
function ni() {
  Et++, or();
}
function ri() {
  Et = Math.max(0, Et - 1), or();
}
function oi(e, t, n = xa) {
  let r = null, o = null, i = null, s = !1;
  const c = (u) => {
    s || (s = !0, o && clearTimeout(o), i && clearTimeout(i), mt.delete(l), Dr(), t(u));
  }, a = () => {
    o && clearTimeout(o), o = setTimeout(() => {
      if (Et > 0) {
        a();
        return;
      }
      c({
        endMs: r,
        hadActivity: r !== null,
        timedOut: !1
      });
    }, Oa);
  };
  function l() {
    r = Date.now(), a();
  }
  return mt.add(l), Pa(), Et > 0 && (r = e), a(), i = setTimeout(() => {
    c({
      endMs: r,
      hadActivity: r !== null,
      timedOut: !0
    });
  }, n), () => {
    s = !0, o && clearTimeout(o), i && clearTimeout(i), mt.delete(l), Dr();
  };
}
var ce, ht, ii, Jt, si = -1, xt = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (si = t.timeStamp, e(t));
  }), !0);
}, ir = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, an = function() {
  var e = ir();
  return e && e.activationStart || 0;
}, pe = function(e, t) {
  var n = ir(), r = "navigate";
  return si >= 0 ? r = "back-forward-cache" : n && (document.prerendering || an() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, sr = function(e, t, n) {
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
}, ai = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, ar = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, cr = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Le = -1, Hr = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, Kt = function(e) {
  document.visibilityState === "hidden" && Le > -1 && (Le = e.type === "visibilitychange" ? e.timeStamp : 0, Ua());
}, Fr = function() {
  addEventListener("visibilitychange", Kt, !0), addEventListener("prerenderingchange", Kt, !0);
}, Ua = function() {
  removeEventListener("visibilitychange", Kt, !0), removeEventListener("prerenderingchange", Kt, !0);
}, ur = function() {
  return Le < 0 && (Le = Hr(), Fr(), xt((function() {
    setTimeout((function() {
      Le = Hr(), Fr();
    }), 0);
  }))), { get firstHiddenTime() {
    return Le;
  } };
}, cn = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, Br = [1800, 3e3], Na = function(e, t) {
  t = t || {}, cn((function() {
    var n, r = ur(), o = pe("FCP"), i = sr("paint", (function(s) {
      s.forEach((function(c) {
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < r.firstHiddenTime && (o.value = Math.max(c.startTime - an(), 0), o.entries.push(c), n(!0)));
      }));
    }));
    i && (n = me(e, o, Br, t.reportAllChanges), xt((function(s) {
      o = pe("FCP"), n = me(e, o, Br, t.reportAllChanges), ai((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, Da = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = cr(e), document.visibilityState === "hidden" ? e() : (n = t(e), ar(e)), n;
}, qr = [2500, 4e3], _n = {}, Ha = function(e, t) {
  t = t || {}, cn((function() {
    var n, r = ur(), o = pe("LCP"), i = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - an(), 0), o.entries = [l], n());
      }));
    }, s = sr("largest-contentful-paint", i);
    if (s) {
      n = me(e, o, qr, t.reportAllChanges);
      var c = cr((function() {
        _n[o.id] || (i(s.takeRecords()), s.disconnect(), _n[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(a) {
        addEventListener(a, (function() {
          return Da(c);
        }), { once: !0, capture: !0 });
      })), ar(c), xt((function(a) {
        o = pe("LCP"), n = me(e, o, qr, t.reportAllChanges), ai((function() {
          o.value = performance.now() - a.timeStamp, _n[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, $r = [800, 1800], Fa = function e(t) {
  document.prerendering ? cn((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, Ba = function(e, t) {
  t = t || {};
  var n = pe("TTFB"), r = me(e, n, $r, t.reportAllChanges);
  Fa((function() {
    var o = ir();
    o && (n.value = Math.max(o.responseStart - an(), 0), n.entries = [o], r(!0), xt((function() {
      n = pe("TTFB", 0), (r = me(e, n, $r, t.reportAllChanges))(!0);
    })));
  }));
}, tt = { passive: !0, capture: !0 }, qa = /* @__PURE__ */ new Date(), zr = function(e, t) {
  ce || (ce = t, ht = e, ii = /* @__PURE__ */ new Date(), ui(removeEventListener), ci());
}, ci = function() {
  if (ht >= 0 && ht < ii - qa) {
    var e = { entryType: "first-input", name: ce.type, target: ce.target, cancelable: ce.cancelable, startTime: ce.timeStamp, processingStart: ce.timeStamp + ht };
    Jt.forEach((function(t) {
      t(e);
    })), Jt = [];
  }
}, $a = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        zr(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, tt), removeEventListener("pointercancel", i, tt);
      };
      addEventListener("pointerup", o, tt), addEventListener("pointercancel", i, tt);
    })(t, e) : zr(t, e);
  }
}, ui = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, $a, tt);
  }));
}, jr = [100, 300], za = function(e, t) {
  t = t || {}, cn((function() {
    var n, r = ur(), o = pe("FID"), i = function(a) {
      a.startTime < r.firstHiddenTime && (o.value = a.processingStart - a.startTime, o.entries.push(a), n(!0));
    }, s = function(a) {
      a.forEach(i);
    }, c = sr("first-input", s);
    n = me(e, o, jr, t.reportAllChanges), c && (ar(cr((function() {
      s(c.takeRecords()), c.disconnect();
    }))), xt((function() {
      var a;
      o = pe("FID"), n = me(e, o, jr, t.reportAllChanges), Jt = [], ht = -1, ce = null, ui(addEventListener), a = i, Jt.push(a), ci();
    })));
  }));
};
const ja = 3e3;
let Tt = null, li = (e) => e.href, S = null, te = null, Gt = [];
function lr() {
  return typeof performance < "u" ? performance.now() : 0;
}
function Va() {
  return typeof performance < "u" && performance.timeOrigin ? performance.timeOrigin : Date.now();
}
function Qt(e) {
  const t = e.hash ?? "", n = t.startsWith("#/") ? t.split("?")[0] : "";
  return e.pathname + n;
}
function fi(e, t, n) {
  return {
    id: Je(),
    sessionId: oe(),
    loadingType: e,
    startEpoch: t,
    startPerf: n,
    url: li(window.location),
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
function Xa(e) {
  const t = Array.from(e.interactions.values()).sort((r, o) => o - r);
  if (t.length === 0) return 0;
  const n = Math.min(t.length - 1, Math.floor(t.length / 50));
  return t[n];
}
function Ya(e) {
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
    inp_ms: Xa(e),
    cls: Math.round(e.cls.value * 1e4) / 1e4,
    dns_ms: n.dns_ms ?? 0,
    connect_ms: n.connect_ms ?? 0,
    tls_ms: n.tls_ms ?? 0,
    download_ms: n.download_ms ?? 0,
    dom_interactive_ms: n.dom_interactive_ms ?? 0,
    dom_complete_ms: n.dom_complete_ms ?? 0
  };
}
function Pt(e) {
  !Tt || !e.sessionId || (e.seq++, Tt(Ya(e), e.sessionId));
}
function di() {
  te && (clearTimeout(te), te = null), S && Pt(S);
}
function bt() {
  te || !S || (te = setTimeout(() => {
    te = null, S && Pt(S);
  }, ja));
}
function Zt() {
  const e = S;
  e && (e.cancelIdle && e.cancelIdle(), te && (clearTimeout(te), te = null), e.active = !1, Pt(e), S = null);
}
function pi(e) {
  e.cancelIdle = oi(e.startEpoch, (t) => {
    if (e.cancelIdle = null, S !== e) return;
    let n = t.endMs !== null && !t.timedOut ? t.endMs - e.startEpoch : 0;
    e.loadingType === "initial_load" && (n = Math.max(n, e.vitals.load_event_ms ?? 0)), e.loadingTimeMs = Math.max(0, n), di();
  });
}
function fr(e, t, n) {
  Zt();
  const r = fi(e, t, n);
  r.sessionId && (S = r, Pt(r), pi(r));
}
function mi() {
  return (S == null ? void 0 : S.id) ?? "";
}
function Wa() {
  return (S == null ? void 0 : S.urlPath) ?? "";
}
function Ja(e) {
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
    bt();
  }
}
function Ka(e) {
  var r, o;
  const t = (o = (r = performance.getEntriesByType) == null ? void 0 : r.call(performance, "navigation")) == null ? void 0 : o[0];
  if (!t || t.loadEventEnd <= 0) return !1;
  const n = Math.round;
  return e.vitals.load_event_ms = n(t.loadEventEnd - t.startTime), e.vitals.dns_ms = n(t.domainLookupEnd - t.domainLookupStart), e.vitals.connect_ms = n(t.connectEnd - t.connectStart), e.vitals.tls_ms = n(
    t.secureConnectionStart > 0 ? t.connectEnd - t.secureConnectionStart : 0
  ), e.vitals.download_ms = n(t.responseEnd - t.responseStart), e.vitals.dom_interactive_ms = n(t.domInteractive - t.startTime), e.vitals.dom_complete_ms = n(t.domComplete - t.startTime), !0;
}
function Vr(e, t, n = {}) {
  if (!(typeof PerformanceObserver > "u"))
    try {
      const r = new PerformanceObserver((o) => t(o.getEntries()));
      r.observe({ type: e, buffered: !0, ...n }), Gt.push(() => r.disconnect());
    } catch {
    }
}
function Ga(e, t, n) {
  const r = e.cls;
  r.windowValue > 0 && n - r.last < 1e3 && n - r.windowStart < 5e3 ? r.windowValue += t : (r.windowValue = t, r.windowStart = n), r.last = n, r.windowValue > r.value && (r.value = r.windowValue);
}
function Qa() {
  Vr("layout-shift", (e) => {
    const t = S;
    if (!t) return;
    let n = !1;
    for (const r of e)
      r.hadRecentInput || r.startTime < t.startPerf || (Ga(t, r.value, r.startTime), n = !0);
    n && bt();
  }), Vr(
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
      n && bt();
    },
    { durationThreshold: 40 }
  );
}
function Za(e) {
  const t = (o, i) => {
    S !== e && !e.active || (e.vitals[o] = Math.round(i * 100) / 100, S === e && bt());
  };
  try {
    Ha((o) => t("lcp", o.value)), Na((o) => t("fcp", o.value)), Ba((o) => t("ttfb", o.value)), za((o) => t("fid", o.value));
  } catch {
  }
  let n = 0;
  const r = () => {
    Ka(e) ? S === e && bt() : ++n < 50 && setTimeout(r, 200);
  };
  document.readyState === "complete" ? setTimeout(r, 0) : window.addEventListener("load", () => setTimeout(r, 0), { once: !0 });
}
let At = "";
function Me() {
  const e = Qt(window.location);
  e !== At && (At = e, fr("route_change", Date.now(), lr()));
}
function ec(e, t) {
  if (typeof window > "u") return;
  hi(), Tt = e, li = t, At = Qt(window.location);
  const n = Va(), r = fi("initial_load", n, 0);
  r.sessionId && (S = r, Pt(r), pi(r), Za(r)), Qa();
  const o = history.pushState, i = history.replaceState;
  history.pushState = function(...l) {
    o.apply(this, l), Me();
  }, history.replaceState = function(...l) {
    i.apply(this, l), Me();
  }, window.addEventListener("popstate", Me), window.addEventListener("hashchange", Me);
  const s = () => {
    document.visibilityState === "hidden" && di();
  };
  document.addEventListener("visibilitychange", s);
  const c = () => Zt();
  window.addEventListener("pagehide", c);
  const a = Ms((l) => {
    S && S.sessionId === l && Zt(), At = Qt(window.location), fr("route_change", Date.now(), lr());
  });
  Gt.push(() => {
    history.pushState = o, history.replaceState = i, window.removeEventListener("popstate", Me), window.removeEventListener("hashchange", Me), document.removeEventListener("visibilitychange", s), window.removeEventListener("pagehide", c), a();
  });
}
function tc() {
  S || !Tt || typeof window > "u" || (At = Qt(window.location), fr("route_change", Date.now(), lr()));
}
function hi() {
  Zt();
  for (const e of Gt) e();
  Gt = [], Tt = null, S = null;
}
const nc = 3, rc = 1e3;
let en = null, Q = null;
const fe = [], dr = [];
let Ht = null;
function oc() {
  for (let e = fe.length - 1; e >= 0; e--)
    if (!fe[e].done) return fe[e].id;
  return "";
}
function ic(e) {
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
function sc(e, t) {
  const n = [];
  return t && n.push("rage_click"), e.deadCandidate && !e.hadActivity && n.push("dead_click"), e.errorCount > 0 && n.push("error_click"), n;
}
function Xr(e, t, n = 1) {
  if (!en) return;
  const r = sc(e, t), o = t ? "rage_click" : r.includes("dead_click") ? "dead_click" : r.includes("error_click") ? "error_click" : "click", i = {
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
  en(i);
}
function Dn() {
  const e = Q;
  if (Q = null, !e) return;
  e.timer && clearTimeout(e.timer);
  const t = () => e.clicks.every((o) => o.done), n = () => {
    if (e.clicks.length >= nc) {
      const o = e.clicks[0];
      for (const i of e.clicks.slice(1))
        o.errorCount += i.errorCount, o.resourceCount += i.resourceCount, o.longTaskCount += i.longTaskCount, o.hadActivity = o.hadActivity || i.hadActivity;
      Xr(o, !0, e.clicks.length);
    } else
      for (const o of e.clicks) Xr(o, !1);
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
  dr.push(() => clearInterval(r));
}
function ac(e) {
  var n;
  const t = ((n = e.tagName) == null ? void 0 : n.toLowerCase()) ?? "";
  return t === "input" || t === "textarea" || t === "select" || t === "label" || e.isContentEditable ? !0 : typeof e.closest == "function" && e.closest("label") !== null;
}
function cc() {
  var e;
  try {
    const t = (e = window.getSelection) == null ? void 0 : e.call(window);
    return !!t && !t.isCollapsed && t.toString().length > 0;
  } catch {
    return !1;
  }
}
function uc(e) {
  const t = e.target;
  if (!t || typeof t.tagName != "string") return;
  const n = pc(t), r = t.tagName.toLowerCase(), o = fc(t), i = o === null && gs(t), s = o ?? (i ? "" : (t.textContent ?? "").trim().slice(0, 200)), c = o !== null ? `${r}[${o}]` : dc(t, r, s, i), a = {
    id: Je(),
    startMs: Date.now(),
    viewId: mi(),
    viewPath: Wa(),
    target: c,
    selector: n,
    text: s,
    x: e.clientX,
    y: e.clientY,
    deadCandidate: !ac(t) && !cc(),
    errorCount: 0,
    resourceCount: 0,
    longTaskCount: 0,
    loadingTimeMs: 0,
    hadActivity: !1,
    done: !1
  };
  fe.push(a), dr.push(
    oi(a.startMs, (u) => {
      a.hadActivity = u.hadActivity, a.loadingTimeMs = u.endMs !== null && !u.timedOut ? Math.max(0, u.endMs - a.startMs) : 0, a.done = !0;
    })
  ), Q && Q.selector === n ? Q.clicks.push(a) : (Dn(), Q = { selector: n, clicks: [a], timer: null });
  const l = Q;
  l.timer && clearTimeout(l.timer), l.timer = setTimeout(() => {
    Q === l && Dn();
  }, rc);
}
function lc(e) {
  if (typeof document > "u") return;
  yi(), en = e;
  const t = (n) => uc(n);
  document.addEventListener("click", t, { capture: !0, passive: !0 }), Ht = () => document.removeEventListener("click", t, {
    capture: !0
  });
}
function yi() {
  Q && Dn();
  for (const e of dr.splice(0)) e();
  fe.splice(0), Ht && Ht(), Ht = null, en = null;
}
const Yr = "data-oodle-action-name";
function fc(e) {
  var t;
  try {
    const n = typeof e.closest == "function" ? e.closest(`[${Yr}]`) : null, r = (t = n == null ? void 0 : n.getAttribute(Yr)) == null ? void 0 : t.trim();
    return r ? r.slice(0, 200) : null;
  } catch {
    return null;
  }
}
function dc(e, t, n, r = !1) {
  if (r) return Wr(e, t);
  const o = e.getAttribute("aria-label");
  if (o) return `${t}[${o}]`;
  const i = e.getAttribute("title");
  if (i) return `${t}[${i}]`;
  const s = n.split(`
`)[0].trim();
  return s && s.length <= 80 ? `${t}[${s}]` : Wr(e, t);
}
function Wr(e, t) {
  if (e.id) return `${t}#${e.id}`;
  const n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
function pc(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(e.classList ?? []).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
const He = "[REDACTED]", mc = /token|secret|auth|cookie|passw|api-?key|access-?key|session|csrf|xsrf|client-?ip|real-?ip|connecting-ip|(^|-)forwarded(-for)?$/, hc = /passw|secret|token(?!s|count|limit|usage|type)|apikey|accesskey|privatekey|authorization|credential|cardnumber|creditcard|cardnum|^pan$|cvv|cvc|securitycode|^ssn$|socialsecurity|^ip$|ipaddr|clientip|remoteaddr|remoteip|^ipv[46]$/;
function gi(e, t, n) {
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
function _i(e) {
  return gi(
    mc,
    (t) => t.toLowerCase(),
    e
  );
}
function vi(e) {
  return gi(
    hc,
    (t) => t.toLowerCase().replace(/[-_.\s]/g, ""),
    e
  );
}
function yc(e) {
  let t = 0, n = !1;
  for (let r = e.length - 1; r >= 0; r--) {
    let o = e.charCodeAt(r) - 48;
    n && (o *= 2, o > 9 && (o -= 9)), t += o, n = !n;
  }
  return t % 10 === 0;
}
const gc = /\b\d(?:[ -]?\d){12,18}\b/g;
function _c(e) {
  return e.replace(gc, (t) => {
    const n = t.replace(/[ -]/g, "");
    return n.length >= 13 && n.length <= 19 && n[0] >= "2" && n[0] <= "6" && yc(n) ? He : t;
  });
}
function Hn(e, t, n) {
  if (n > 32 || e === null || typeof e != "object")
    return;
  let r = !1;
  if (Array.isArray(e)) {
    const i = e.map((s) => {
      const c = Hn(s, t, n + 1);
      return c === void 0 ? s : (r = !0, c);
    });
    return r ? i : void 0;
  }
  const o = /* @__PURE__ */ Object.create(null);
  for (const [i, s] of Object.entries(e)) {
    if (t(i) && s !== null && s !== "") {
      o[i] = He, r = !0;
      continue;
    }
    const c = Hn(s, t, n + 1);
    c === void 0 ? o[i] = s : (o[i] = c, r = !0);
  }
  return r ? o : void 0;
}
const vn = /"((?:[^"\\]|\\.){1,200})"\s*:\s*/g, vc = /^("(?:[^"\\]|\\.)*"|[^\s,}\]{["]+)/;
function wc(e, t) {
  let n = "", r = 0;
  vn.lastIndex = 0;
  let o;
  for (; (o = vn.exec(e)) !== null; ) {
    if (!t(o[1])) continue;
    const i = o.index + o[0].length, s = e.slice(i);
    if (s[0] === "{" || s[0] === "[")
      return n + e.slice(r, i) + `"${He}"`;
    const c = vc.exec(s);
    if (!c)
      return s[0] === '"' ? n + e.slice(r, i) + `"${He}"` : n + e.slice(r);
    c[1] === '""' || c[1] === "null" || (n += e.slice(r, i) + `"${He}"`, r = i + c[1].length, vn.lastIndex = r);
  }
  return n + e.slice(r);
}
function Sc(e) {
  return /^[\w.%+[\]-]+=[^&]*(&[\w.%+[\]-]+=[^&]*)*$/.test(e);
}
function Ec(e, t) {
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
      const s = Hn(o, t, 0);
      s !== void 0 && (r = JSON.stringify(s));
    } else
      r = wc(e, t);
  } else if (Sc(n))
    try {
      const o = new URLSearchParams(e);
      let i = !1;
      if (o.forEach((s, c) => {
        t(c) && s && (i = !0);
      }), i) {
        const s = new URLSearchParams();
        o.forEach((c, a) => {
          s.append(a, t(a) && c ? He : c);
        }), r = s.toString();
      }
    } catch {
    }
  return _c(r);
}
const Tc = 50, Jr = 200, Kr = /* @__PURE__ */ new Map();
function bc(e) {
  let t = Kr.get(e);
  return t || (t = {
    tokens: Jr,
    lastRefill: Date.now(),
    rate: Tc,
    burst: Jr
  }, Kr.set(e, t)), t;
}
function Ac(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function kc(e) {
  const t = bc(e);
  return Ac(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let Fn = null, Bn = null;
function Qu(e, t) {
  Fn = e, Bn = t;
}
const Cc = "00000000000000000000000000000000";
function wi() {
  if (!Fn || !Bn) return null;
  try {
    const e = Fn.getSpan(
      Bn.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === Cc ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const Gr = 100, Ic = 10, Qr = 5e3, Mc = 3, Lc = 0;
function Rc(e, t = () => Date.now()) {
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
    return r.size < Qr && r.set(a, u), u;
  }
  function s(a) {
    const l = i(a), u = t();
    let f = n.get(l);
    if (!f) {
      if (n.size >= Qr)
        return !0;
      f = {
        tokens: Gr,
        lastRefillMs: u
      }, n.set(l, f);
    }
    const h = (u - f.lastRefillMs) / 1e3;
    return h > 0 && (f.tokens = Math.min(
      Gr,
      f.tokens + h * Ic
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function c(a) {
    var g, _, k;
    if (a.type !== Mc)
      return { event: a, dropped: 0 };
    const l = a.data;
    if (!l || l.source !== Lc || !l.attributes || l.attributes.length === 0)
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
const Zr = "replay", Oc = 200, xc = 6e4, Pc = 5e3, Uc = 8e6, Si = 2, Nc = 3, Dc = 4, eo = 3e3, Ei = 5e3, Hc = 3, Fc = 3e4, Bc = 5e3, qc = 16, $c = 100, zc = 4, jc = 30, to = 32, no = 250, Vc = 36e4;
function Xc() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const Yc = 3e5, Wc = 9e5, Jc = 1e3;
let Se = null, ne = null, Ze = null, Ve = [], Xe = 0, ge = "", Ti = "", pr = !1, bi = 0, wn = "", Z = 0, Ee = Date.now(), he = !1, kt = 0, _e = null, Ye = !1, Fe = null, Ai = 0, K = [], Y = 0, Be = null, ue = null, Ft = 0;
function We() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const mr = Rc(
  () => (Se == null ? void 0 : Se.mirror) ?? null
);
let qe = null, ve = null, $e = !1, Ct = !1, hr = 0, Bt = null, ee = null;
function Kc() {
  Be && (clearTimeout(Be), Be = null), ue && (ue(), ue = null);
}
function qn(e, t) {
  Kc();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    jc
  ) : null, r = e ? We() + (n ?? zc) : Number.POSITIVE_INFINITY;
  for (; Y < K.length; ) {
    const o = Math.min(
      Y + to,
      K.length
    );
    for (; Y < o; )
      $n(
        K[Y++]
      );
    if (We() >= r) break;
  }
  if (Y >= K.length) {
    K = [], Y = 0;
    return;
  }
  Y >= to * 8 && (K = K.slice(Y), Y = 0), ki();
}
function tn() {
  qn(!1);
}
function ki() {
  if (!Be) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          ue = null, qn(!0, t);
        },
        { timeout: $c }
      );
      ue = () => cancelIdleCallback(e);
    }
    Be = setTimeout(() => {
      Be = null, ue && (ue(), ue = null), qn(!0);
    }, qc);
  }
}
function It(e = !1) {
  if (Ye = !0, Fe) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - Ee, r = Math.max(
      0,
      Ei - n
    ), o = Date.now() - Ai, i = Math.max(
      0,
      Bc - o
    );
    t = Math.max(
      r,
      i
    );
  }
  Fe = setTimeout(() => {
    Fe = null, Gc();
  }, t);
}
function Gc() {
  if (!Ye || !Se || !ne || he) return;
  kt++;
  const e = Ft > no ? 1 : Hc;
  if (kt > e) {
    eu();
    return;
  }
  Ai = Date.now(), Z = 0, Ee = Date.now();
  try {
    const t = We();
    Se.takeFullSnapshot(!0), Ft = We() - t, x("replay_rebases"), Ft > no && x(
      "replay_expensive_snapshots"
    );
  } catch {
    Lt(), Mt();
  }
}
function ro() {
  x("replay_events_dropped");
}
function Ci() {
  if (ge) return !1;
  ge = oe(), bi = Os(), Ti = Ls() ? "" : Ro();
  const e = wn !== "" && wn !== ge;
  return wn = ge, e;
}
function Ut() {
  if (Zc(), Ve.length === 0) return;
  if (sn(Zr)) {
    Qc(), Ii();
    return;
  }
  Ci();
  const e = ge, t = bi, n = Ti, r = Ve.splice(0), o = Xe;
  Xe = 0, ge = "", pr = !0, rr(
    Zr,
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
function Qc() {
  Xe <= Uc || (x(
    "replay_events_dropped",
    Ve.length
  ), Ve.length = 0, Xe = 0, It());
}
let ze = null;
function Zc() {
  ze && (clearTimeout(ze), ze = null);
}
function Ii() {
  if (ze) return;
  const e = O().replayFlushIntervalMs ?? Pc;
  ze = setTimeout(() => {
    ze = null, Ut();
  }, e);
}
function $n(e) {
  !ge && !oe() || (Ci() && e.type !== Si && It(!0), Ve.push(e), Xe += zt(e), Ve.length >= Oc || Xe >= xc ? Ut() : Ii());
}
function eu() {
  he = !0, x("replay_overload_pauses"), Lt(), _e && clearTimeout(_e), _e = setTimeout(() => {
    _e = null, he = !1, kt = 0, Z = 0, Ee = Date.now(), !$e && !Ct && ee && Mt();
  }, Fc);
}
function tu(e) {
  if (he) return;
  if (e.type === Si) {
    tn(), Ye = !1, Z = 0, Ee = Date.now(), $n(e);
    return;
  }
  if (e.type === Dc) {
    const r = e.data;
    typeof r.href == "string" && (r.href = rs(r.href));
  }
  if (e.type !== Nc) {
    tn(), $n(e);
    return;
  }
  if (Ye) {
    ro(), It();
    return;
  }
  const t = Date.now();
  t - Ee > Ei && (Z <= eo && (kt = 0), Z = 0, Ee = t);
  const n = mr.throttle(e);
  if (n.dropped > 0 && x(
    "replay_attributes_throttled",
    n.dropped
  ), !!n.event) {
    if (Z++, Z > eo) {
      ro(), It();
      return;
    }
    K.push(n.event), ki();
  }
}
async function Mt() {
  if (ee && !he && !ne)
    return Ze || (Ze = nu().finally(
      () => {
        Ze = null;
      }
    ), Ze);
}
async function nu() {
  if (!ee) return;
  const { record: e } = await import("./rrweb-SbAupvcM.js");
  !ee || he || ne || (Se = e, Ye = !1, Z = 0, Ee = Date.now(), mr.reset(), ne = e({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: Xc() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: Vc,
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
        tu(t);
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
    blockSelector: Eo,
    maskTextSelector: To,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => Ut(), 200));
}
function Lt() {
  ne && (ne(), ne = null), Fe && (clearTimeout(Fe), Fe = null), Ye = !1, tn(), Ut();
}
function ru() {
  const e = O(), t = e.replayIdlePauseMs ?? Yc, n = e.replayIdleExpireMs ?? Wc;
  qe && clearTimeout(qe), ve && (clearTimeout(ve), ve = null), qe = setTimeout(() => {
    $e = !0, Lt();
  }, t), ve = setTimeout(() => {
    Ct = !0, Lt();
  }, n);
}
function qt() {
  hr = We(), ru();
}
function ou() {
  if (Ct) {
    if (!xo()) return;
    Ct = !1, $e = !1, Mt(), qt();
    return;
  }
  if ($e) {
    $e = !1, Mt(), qt();
    return;
  }
  We() - hr >= Jc && qt();
}
function iu() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => ou(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  Bt = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function su() {
  Bt && (Bt(), Bt = null), qe && (clearTimeout(qe), qe = null), ve && (clearTimeout(ve), ve = null);
}
function au() {
  tn(), Ut();
}
async function cu() {
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
  }, wa(() => {
    ne && It();
  }), Zo(au), await Mt(), iu(), qt();
}
function uu() {
  return ne !== null && !he;
}
function lu() {
  return pr;
}
function fu() {
  Lt(), su(), Zo(null), _e && (clearTimeout(_e), _e = null), $e = !1, Ct = !1, hr = 0, he = !1, pr = !1, kt = 0, Z = 0, Ft = 0, K = [], Y = 0, mr.reset(), ee = null, Se = null;
}
let H = [], G = null;
const du = [
  "error",
  "action",
  "console",
  "resource"
];
function pu(e) {
  return du.includes(e) && (sn(e) || !kc(e)) ? (x("events_rate_limited"), !0) : !1;
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
function mu() {
  if (!G) {
    const e = navigator.userAgent;
    G = {
      device_type: ju(e),
      browser_name: Vu(e),
      browser_version: Xu(e),
      os_name: Yu(e),
      os_version: Wu(e),
      user_agent: e,
      language: navigator.language
    };
  }
}
function hu() {
  const e = navigator.connection;
  return typeof (e == null ? void 0 : e.effectiveType) == "string" ? e.effectiveType : "";
}
function Li(e) {
  mu();
  const t = Ps(), n = La(), r = O(), o = e ?? oe(), i = {
    event_id: Je(),
    session_id: o,
    tab_id: Ro(),
    view_id: mi(),
    action_id: oc(),
    ...as(
      Do(),
      Ns(),
      Ds()
    ),
    user_status: Hs(),
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
    referrer_url: os(document.referrer),
    device_type: G.device_type,
    browser_name: G.browser_name,
    browser_version: G.browser_version,
    os_name: G.os_name,
    os_version: G.os_version,
    user_agent: ss() ? G.user_agent : "",
    language: G.language,
    session_view_count: t.viewCount,
    session_error_count: t.errorCount,
    session_action_count: t.actionCount,
    replay_id: uu() && lu() ? o : ""
  };
  return Object.keys(n).length > 0 && (i.feature_flags = n), i;
}
function yu(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const Ri = "events", gu = ["session_id", "event_type", "timestamp"];
let oo = !1;
function Oi(e) {
  const t = O().beforeSend;
  if (typeof t != "function") return e;
  const n = {};
  for (const r of gu) n[r] = e[r];
  try {
    const r = t(e);
    if (r === null || r === !1) return null;
    if (Bi(r))
      throw new Error("it returned a promise; it must be synchronous");
    return { ...r && typeof r == "object" ? r : e, ...n };
  } catch (r) {
    return oo || (oo = !0, Vn(
      `beforeSend failed. Events are dropped until it is fixed: ${String(r)}`
    )), null;
  }
}
function xi(e) {
  Rs() && (e.session_is_new = 1);
}
function N(e) {
  if (!oe() || !Oo() || sn("events")) return;
  tc();
  const t = e(), n = t.event_type;
  if (pu(n)) return;
  n === "resource" && Ou(t), No(n), Ja(t), ic(t);
  const r = { ...Li(), ...t };
  xi(r);
  const o = Oi(r);
  o && rr(Ri, o);
}
function yr(e) {
  yu(
    () => N(e)
  );
}
function _u(e, t) {
  if (!Oo() || sn("events")) return;
  e.view_update_seq === 1 && No("view");
  const n = {
    ...Li(t),
    ...e,
    action_id: "",
    connection_type: hu(),
    screen_width: typeof screen < "u" ? screen.width : 0,
    screen_height: typeof screen < "u" ? screen.height : 0
  };
  e.view_update_seq === 1 && (n.view_is_new = 1), t === oe() && xi(n);
  const r = Oi(n);
  r && Aa(
    Ri,
    "view:" + String(e.view_id),
    r,
    (o, i) => {
      const s = { ...i }, c = o;
      return c.view_is_new === 1 && (s.view_is_new = 1), c.session_is_new === 1 && (s.session_is_new = 1), s;
    }
  );
}
function vu(e) {
  N(() => e);
}
function wu() {
  ec(
    _u,
    (e) => Mi(e, O().viewUrlQueryParams)
  ), lc(vu), Su(), Au(), Iu(), Hu(), Fu(), Bu(), qu();
}
function Su() {
  const e = (n) => {
    N(() => {
      var i, s, c;
      const r = n.message ?? "", o = typeof ((i = n.error) == null ? void 0 : i.message) == "string" ? n.error.message : r;
      return {
        event_type: "error",
        error_message: _t(r),
        error_type: ((s = n.error) == null ? void 0 : s.name) ?? "Error",
        error_stack: Wn(
          ((c = n.error) == null ? void 0 : c.stack) ?? "",
          o
        ),
        error_source: "source",
        error_handling: "unhandled"
      };
    });
  }, t = (n) => Pi(n.reason);
  window.addEventListener("error", e), window.addEventListener(
    "unhandledrejection",
    t
  ), zn = !0, H.push(() => {
    window.removeEventListener("error", e), window.removeEventListener(
      "unhandledrejection",
      t
    ), zn = !1;
  });
}
let zn = !1;
const io = /* @__PURE__ */ new WeakSet();
function Pi(e) {
  if (e !== null && typeof e == "object") {
    if (io.has(e)) return;
    io.add(e);
  }
  N(() => {
    const t = (e == null ? void 0 : e.message) ?? String(e);
    return {
      event_type: "error",
      error_message: _t(t),
      error_type: (e == null ? void 0 : e.name) ?? "UnhandledRejection",
      error_stack: Wn((e == null ? void 0 : e.stack) ?? "", t),
      error_source: "promise",
      error_handling: "unhandled"
    };
  });
}
let so = !1;
function Zu() {
  const e = globalThis.Zone;
  if (so || !e || typeof e.__symbol__ != "function")
    return;
  so = !0;
  const t = e.__symbol__("unhandledPromiseRejectionHandler"), n = e[t];
  e[t] = function(r) {
    if (zn)
      try {
        Pi(
          r && typeof r == "object" && "rejection" in r && "promise" in r ? r.rejection : r
        );
      } catch {
      }
    if (typeof n == "function")
      return n.call(this, r);
  };
}
function Ui(e) {
  return e instanceof Error || typeof e == "object" && e !== null && typeof e.message == "string" && typeof e.name == "string" && "stack" in e;
}
const je = 8192;
function Eu(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${je} bytes omitted]`;
}
function Tu(e) {
  if (typeof e == "string") return e;
  if (Ui(e))
    return e.message ? `${e.name}: ${e.message}` : e.name;
  if (zt(
    e,
    je + 1
  ) > je)
    return Eu(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function bu(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= je) break;
    t && (t += " "), t += Tu(n);
  }
  return t.length > je ? t.slice(0, je) + "… [truncated]" : t;
}
function Au() {
  for (const e of is()) {
    const t = console[e], n = (...r) => {
      try {
        const o = _t(bu(r)), i = e === "error" ? r.find(Ui) : void 0;
        N(() => {
          const s = {
            event_type: "console",
            console_level: e,
            console_message: o
          };
          return i && (s.error_type = i.name, s.error_message = _t(i.message), s.error_stack = Wn(
            i.stack ?? "",
            i.message
          ), s.error_source = "console", s.error_handling = "handled"), s;
        });
      } catch {
      }
      t.apply(console, r);
    };
    n[wo] = t, console[e] = n, H.push(() => {
      console[e] = t;
    });
  }
}
const jn = "oodle_rum_tab_hidden";
function ao(e) {
  try {
    e ? sessionStorage.setItem(jn, "1") : sessionStorage.removeItem(jn);
  } catch {
  }
}
function ku() {
  try {
    return sessionStorage.getItem(jn) === "1";
  } catch {
    return !1;
  }
}
function Cu() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && ku() && (ao(!1), N(() => ({
    event_type: "visibility",
    action_type: "tab_visible"
  })));
  let e = document.visibilityState === "hidden";
  const t = () => {
    const n = document.visibilityState === "hidden";
    n !== e && (e = n, ao(n), N(() => ({
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
function gr(e) {
  const t = O().endpoint;
  return e.startsWith(t);
}
function Iu() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || gr(r.name))
          continue;
        const i = gt(r.name), s = Ni(r), c = Mu(o, r.name);
        yr(
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
function Ni(e) {
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
function Di(e, t) {
  try {
    const n = performance.getEntriesByName(
      Hi(e),
      "resource"
    );
    for (let r = n.length - 1; r >= 0; r--) {
      const o = n[r];
      if (o.startTime >= t - 2)
        return {
          ...Ni(o),
          resource_size: o.transferSize ?? 0
        };
    }
  } catch {
  }
  return {};
}
function nn(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function Hi(e) {
  try {
    return new URL(e, location.href).href;
  } catch {
    return e;
  }
}
function Sn(e, t, n) {
  return n.some(
    (r) => typeof r == "string" ? e.startsWith(r) || t.startsWith(r) : r.test(e) || r.test(t)
  );
}
function Fi(e) {
  const t = Hi(e), n = O();
  let r = !1;
  const o = n.allowedTracingUrls;
  o && o.length > 0 && (r = Sn(
    t,
    e,
    o
  ));
  let i = null;
  const s = n.forwardNetworkBodies;
  s && Sn(
    t,
    e,
    s.urls
  ) && (i = s);
  let c = !1;
  const a = n.forwardNetworkHeaders;
  return a && (c = Sn(
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
let co = null, uo = _i(void 0);
function yt(e) {
  const t = O().redactHeaders;
  return t !== co && (co = t, uo = _i(t)), uo(e);
}
function Lu(e) {
  const t = {};
  for (const n of Object.keys(e)) {
    const r = n.toLowerCase();
    yt(r) || (t[r] = e[n]);
  }
  return t;
}
const lo = [
  "request_headers",
  "response_headers",
  "request_body",
  "response_body"
];
let fo = !1;
function Bi(e) {
  return !!e && (typeof e == "object" || typeof e == "function") && typeof e.then == "function";
}
function po(e) {
  if (!(typeof e != "string" || !e))
    try {
      const t = JSON.parse(e);
      return t && typeof t == "object" ? t : void 0;
    } catch {
      return;
    }
}
function mo(e) {
  if (!e || typeof e != "object") return "";
  const t = {};
  for (const [n, r] of Object.entries(e))
    r != null && (t[n.toLowerCase()] = String(r));
  return Object.keys(t).length > 0 ? JSON.stringify(t) : "";
}
let ho = null, yo = vi(void 0);
function Ru() {
  const e = O().redactBodyKeys;
  return e !== ho && (ho = e, yo = vi(e)), yo;
}
function Ou(e) {
  var c;
  if (!lo.some((a) => e[a])) return;
  for (const a of ["request_body", "response_body"])
    typeof e[a] == "string" && e[a] && (e[a] = Ec(e[a], Ru()));
  const t = O().beforeSendNetwork;
  if (typeof t != "function") return;
  const n = {
    url: String(e.resource_url ?? ""),
    method: String(e.resource_method ?? ""),
    status: Number(e.resource_status ?? 0),
    requestHeaders: po(e.request_headers),
    responseHeaders: po(e.response_headers),
    requestBody: typeof e.request_body == "string" ? e.request_body : void 0,
    responseBody: typeof e.response_body == "string" ? e.response_body : void 0
  };
  let r;
  try {
    const a = t(n);
    if (Bi(a))
      throw new Error("it returned a promise; it must be synchronous");
    r = a === void 0 ? n : a;
  } catch (a) {
    fo || (fo = !0, Vn(
      `beforeSendNetwork failed. Captured headers and bodies are dropped until it is fixed: ${String(a)}`
    )), r = null;
  }
  for (const a of lo) delete e[a];
  if (!r || typeof r != "object") return;
  const o = ((c = O().forwardNetworkBodies) == null ? void 0 : c.maxBodySize) ?? 65536, i = mo(r.requestHeaders), s = mo(r.responseHeaders);
  i && (e.request_headers = i), s && (e.response_headers = s), typeof r.requestBody == "string" && r.requestBody && (e.request_body = de(r.requestBody, o)), typeof r.responseBody == "string" && r.responseBody && (e.response_body = de(r.responseBody, o));
}
function qi(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      yt(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      yt(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      yt(r) || (t[r] = e[n]);
    }
  return t;
}
function xu(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    yt(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function de(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function Pu(e, t) {
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
function Uu(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function Nu(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      qi(
        e
      )
    );
  } catch {
    return "";
  }
}
function go(e) {
  try {
    return JSON.stringify(
      qi(e)
    );
  } catch {
    return "";
  }
}
function $i(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function Du(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: de(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: de(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : $i(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => de(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function zi(e, t, n) {
  const r = function(o, i) {
    const s = Uu(o);
    if (gr(s))
      return t.apply(e, [
        o,
        i
      ]);
    const c = $i(o), a = ((i == null ? void 0 : i.method) ?? (c ? o.method : "GET")).toUpperCase(), l = performance.now(), u = Fi(s);
    ni();
    let f = !1;
    const h = () => {
      f || (f = !0, ri());
    };
    let m = "", g = "";
    if (n.injectTracing) {
      const E = wi();
      if (E)
        m = E.traceId, g = E.spanId;
      else if (u.trace) {
        m = nn(16), g = nn(8);
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
      const E = u.bodyCfg.maxBodySize ?? 65536, A = Du(
        i,
        o,
        E
      );
      _ = A.sync, k = A.asyncP;
    }
    let C = "";
    return u.captureHeaders && (i != null && i.headers ? C = Nu(
      i.headers
    ) : c && (C = go(
      o.headers
    ))), t.apply(e, [o, i]).then((E) => {
      h();
      const A = E.status, M = Math.round(
        performance.now() - l
      );
      let y = "";
      u.captureHeaders && (y = go(
        E.headers
      ));
      const v = (p) => {
        const d = {
          event_type: "resource",
          resource_url: gt(s),
          resource_method: a,
          resource_status: A,
          resource_duration_ms: M,
          resource_size: 0,
          resource_type: "fetch",
          ...Di(s, l)
        };
        return m && (d.trace_id = m, d.span_id = g), p && (d.request_body = p), C && (d.request_headers = C), y && (d.response_headers = y), d;
      }, w = k || Promise.resolve(_);
      if (u.bodyCfg) {
        const p = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          w,
          Pu(
            E.clone(),
            p
          ).catch(() => "")
        ]).then(([d, L]) => {
          N(() => {
            const W = v(d);
            return L && (W.response_body = L), W;
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
            resource_url: gt(s),
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
function ji(e, t, n) {
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
    if (gr(c))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const a = Fi(c);
    let l = "", u = "";
    if (n.injectTracing) {
      const y = wi();
      y ? (l = y.traceId, u = y.spanId) : a.trace && (l = nn(16), u = nn(8), i.call(
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
        const y = this.__oodleReqHeaders, v = y ? Lu(y) : {};
        Object.keys(v).length > 0 && (h = JSON.stringify(v));
      } catch {
      }
    const m = performance.now(), g = this;
    ni();
    const _ = l, k = u, C = f, E = a.bodyCfg, A = h, M = a.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        ri();
        const y = Math.round(
          performance.now() - m
        ), v = g.__oodleMethod ?? "GET";
        N(() => {
          const w = {
            event_type: "resource",
            resource_url: gt(c),
            resource_method: v,
            resource_status: g.status,
            resource_duration_ms: y,
            resource_size: 0,
            resource_type: "xhr",
            ...Di(c, m)
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
          if (A && (w.request_headers = A), M)
            try {
              const p = g.getAllResponseHeaders();
              p && (w.response_headers = JSON.stringify(
                xu(p)
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
const Vi = {
  injectTracing: !0
}, _o = {
  injectTracing: !1
};
function Hu() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = zi(
    window,
    window.fetch,
    Vi
  );
  H.push(e);
}
function Fu() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = ji(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    Vi
  );
  H.push(e);
}
const vo = /* @__PURE__ */ new WeakSet();
function En(e) {
  if (vo.has(e)) return;
  vo.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (zi(
        n,
        n.fetch,
        _o
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (ji(
        r.prototype,
        r.prototype.setRequestHeader,
        _o
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), H.push(() => {
    e.removeEventListener("load", t);
  });
}
function Bu() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach(En);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          r instanceof HTMLIFrameElement && En(r), r instanceof HTMLElement && r.childElementCount > 0 && r.querySelectorAll("iframe").forEach(En);
    }
  );
  e.observe(document.documentElement, {
    childList: !0,
    subtree: !0
  }), H.push(() => {
    e.disconnect();
  });
}
function qu() {
  if (!(typeof PerformanceObserver > "u") && !$u())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            yr(() => ({
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
function $u() {
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
          yr(() => ({
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
function zu(e, t) {
  N(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function ju(e) {
  return /iPad|Tablet/i.test(e) || /Android/i.test(e) && !/Mobi/i.test(e) ? "tablet" : /Mobi|iPhone|iPod|Android/i.test(e) ? "mobile" : "desktop";
}
const Xi = [
  ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
  ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
  ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
  ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
  ["Safari", /Version\/([\d.]+).*Safari/]
];
function Vu(e) {
  for (const [t, n] of Xi) if (n.test(e)) return t;
  return e.includes("Safari") ? "Safari" : "Other";
}
function Xu(e) {
  for (const [, t] of Xi) {
    const n = e.match(t);
    if (n) return n[1];
  }
  return "";
}
function Yu(e) {
  return /iPhone|iPad|iPod/.test(e) ? "iOS" : e.includes("Android") ? "Android" : e.includes("CrOS") ? "Chrome OS" : e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : "Other";
}
function Wu(e) {
  let t = e.match(/OS (\d+[_.]\d+(?:[_.]\d+)?) like Mac OS X/);
  return t ? t[1].replace(/_/g, ".") : (t = e.match(/Android ([\d.]+)/), t || (t = e.match(/Windows NT ([\d.]+)/), t) ? t[1] : (t = e.match(/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/), t ? t[1].replace(/_/g, ".") : ""));
}
function Ju() {
  yi(), hi();
  for (const e of H)
    e();
  H = [];
}
let ye = !1;
const el = {
  init(e) {
    ye || vs(e) && (Bs(e.tags), ks(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), ye = !0, kn(), Cu(), Nr(), xs(), Xs(), Ca(() => {
      Nr();
    }), e.sessionReplay !== !1 && xo() && cu(), wu(), e.openTelemetry && import("./tracing-BoStEzKn.js").then(
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
    qs(e);
  },
  identify(e) {
    Us(e);
  },
  trackEvent(e, t) {
    ye && zu(e, t);
  },
  addFeatureFlag(e, t) {
    Ma(e, t);
  },
  getSessionId() {
    return ye ? oe() : "";
  },
  getUserId() {
    return Do();
  },
  flush() {
    ye && re();
  },
  stop() {
    ye && (fu(), Ju(), Ys(), Uo(), re(!0), Ra(), Ia(), ye = !1);
  }
};
export {
  el as O,
  Gu as a,
  Zu as c,
  Ku as r,
  Qu as s
};
