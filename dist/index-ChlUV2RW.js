const Gr = "__oodleOriginal";
function xn(e) {
  try {
    const t = console.warn;
    (t[Gr] ?? t).call(
      console,
      "[@oodle-ai/rum] " + e
    );
  } catch {
  }
}
const Ct = [
  "error",
  "warn"
];
function ui() {
  return {
    patterns: [],
    maskFn: null,
    referrer: "path",
    consoleLevels: Ct,
    messages: "full",
    actionText: "full",
    userAgent: "full",
    queryStrings: "events",
    userInfo: "full",
    keepParams: []
  };
}
let C = ui();
const en = "/:redacted", li = 256, Qe = /* @__PURE__ */ new Map();
let dn = !1;
const we = xn;
function Ce(e, t, n, r, o) {
  return t === void 0 ? r : typeof t == "string" && n.includes(t) ? t : (we(
    `${e} must be one of ${n.map((i) => `'${i}'`).join(", ")}. Using '${o}'.`
  ), o);
}
function fi(e) {
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
function di(e) {
  if (e === void 0) return [];
  if (!Array.isArray(e))
    return we(
      "urlPathPatterns must be an array of path patterns such as '/projects/:id'. It is ignored."
    ), [];
  const t = [];
  for (const n of e) {
    const r = fi(n);
    r ? t.push(r) : we(
      `urlPathPatterns: ${JSON.stringify(n)} is not a valid pattern. Patterns start with '/', use ':name' for one segment and may end in '/*'. It is ignored.`
    );
  }
  return t;
}
function pi(e) {
  if (e === void 0) return Ct;
  if (!Array.isArray(e))
    return we(
      "consoleLevels must be an array such as ['error']. Console capture is off."
    ), [];
  const t = Ct.filter(
    (n) => e.includes(n)
  );
  return e.some(
    (n) => !Ct.includes(n)
  ) && we(
    "consoleLevels accepts only 'error' and 'warn'. Other values are ignored."
  ), t;
}
function hi(e) {
  Qe.clear(), dn = !1;
  const t = e.maskUrlPath;
  t !== void 0 && typeof t != "function" && we("maskUrlPath must be a function. It is ignored."), C = {
    patterns: di(e.urlPathPatterns),
    maskFn: typeof t == "function" ? t : null,
    referrer: Ce(
      "referrerUrl",
      e.referrerUrl,
      ["path", "origin", "none"],
      "path",
      "none"
    ),
    consoleLevels: pi(
      e.consoleLevels
    ),
    messages: Ce(
      "errorMessages",
      e.errorMessages,
      ["full", "scrub", "none"],
      "full",
      "none"
    ),
    // Text the replay masks must not reappear in click events.
    actionText: Ce(
      "actionText",
      e.actionText,
      ["full", "mask"],
      e.privacyLevel === "mask" ? "mask" : "full",
      "mask"
    ),
    userAgent: Ce(
      "userAgent",
      e.userAgent,
      ["full", "none"],
      "full",
      "none"
    ),
    queryStrings: Ce(
      "stripQueryStrings",
      e.stripQueryStrings,
      ["events", "all"],
      "events",
      "all"
    ),
    userInfo: Ce(
      "userInfo",
      e.userInfo,
      ["full", "id", "none"],
      "full",
      "none"
    ),
    keepParams: Array.isArray(e.viewUrlQueryParams) ? e.viewUrlQueryParams : []
  };
}
function On() {
  return C.patterns.length > 0 || C.maskFn !== null;
}
function mi(e) {
  const t = e.split("/").slice(1), n = t.length > 0 && t[t.length - 1] === "";
  n && t.pop();
  for (const r of C.patterns) {
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
function yi(e) {
  let t = C.patterns.length > 0 ? mi(e) : e;
  if (C.maskFn)
    try {
      const n = C.maskFn(t);
      t = typeof n == "string" ? n : en;
    } catch (n) {
      dn || (dn = !0, we(
        `maskUrlPath threw. Paths are sent as '${en}' until it is fixed: ${String(n)}`
      )), t = en;
    }
  return t;
}
function ve(e) {
  if (!On()) return e;
  const t = Qe.get(e);
  if (t !== void 0) return t;
  const n = yi(e);
  return Qe.size >= li && Qe.clear(), Qe.set(e, n), n;
}
function vi(e) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(e);
}
function pt(e, t) {
  if (vi(e)) {
    let n;
    try {
      n = new URL(e);
    } catch {
      return e;
    }
    return n.protocol !== "http:" && n.protocol !== "https:" ? n.protocol === "data:" ? "data:" : n.origin + n.pathname : n.origin + ve(n.pathname);
  }
  try {
    const n = t ?? (typeof location < "u" ? location.href : "http://localhost/"), r = new URL(e, n);
    return r.origin === new URL(n).origin ? ve(r.pathname) : r.origin + ve(r.pathname);
  } catch {
    const n = e.search(/[?#]/);
    return n >= 0 ? e.slice(0, n) : e;
  }
}
function Kr(e) {
  return !On() || typeof e != "string" ? e : Pn(e, (t) => t.search + t.hash);
}
function zc() {
  return On() || C.queryStrings === "all";
}
function gi(e) {
  return C.queryStrings !== "all" ? Kr(e) : typeof e != "string" ? e : Pn(e, (t) => {
    const n = C.keepParams;
    if (n.length === 0 || !t.search) return "";
    const r = new URLSearchParams();
    t.searchParams.forEach((i, s) => {
      n.includes(s) && r.append(s, i);
    });
    const o = r.toString();
    return o ? "?" + o : "";
  });
}
function jc(e) {
  return C.queryStrings !== "all" ? Kr(e) : typeof e != "string" ? e : Pn(e, () => "");
}
function Pn(e, t) {
  let n;
  try {
    n = new URL(e);
  } catch {
    return e;
  }
  return n.protocol !== "http:" && n.protocol !== "https:" ? e : n.origin + ve(n.pathname) + t(n);
}
let Zn = null, er = "", tr = null;
function _i(e) {
  if (e === Zn && tr === C)
    return er;
  let t = "";
  if (e && C.referrer !== "none")
    try {
      const n = new URL(e);
      t = C.referrer === "origin" ? n.origin : n.origin + ve(n.pathname);
    } catch {
      t = C.referrer === "origin" ? "" : e;
    }
  return Zn = e, er = t, tr = C, t;
}
function wi() {
  return C.consoleLevels;
}
function Ei() {
  return C.userAgent === "full";
}
function Si(e, t, n) {
  switch (C.userInfo) {
    case "full":
      return { user_id: e, user_name: t, user_email: n };
    case "id":
      return { user_id: e, user_name: "", user_email: "" };
    default:
      return { user_id: "", user_name: "", user_email: "" };
  }
}
const Ti = [
  [/(^|[^\w])'(?:[^'\\\n]|\\.){0,500}'/g, "$1'?'"],
  [/(^|[^\w])"(?:[^"\\\n]|\\.){0,500}"/g, '$1"?"'],
  [/(^|[^\w])`(?:[^`\\\n]|\\.){0,500}`/g, "$1`?`"]
], bi = /\bhttps?:\/\/[^\s'"`<>()\]]+/g, Ai = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, ki = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, Ci = /\b(?=[0-9a-fA-F]*\d)(?=[0-9a-fA-F]*[a-fA-F])[0-9a-fA-F]{16,}\b/g, Ii = /\d{4,}/g, nr = 8192;
function Ri(e) {
  if (!e) return e;
  let t = e.length > nr ? e.slice(0, nr) + "… [truncated]" : e;
  t = t.replace(bi, (n) => pt(n)), t.includes("@") && (t = t.replace(Ai, "<email>"));
  for (const [n, r] of Ti)
    t = t.replace(n, r);
  return t = t.replace(ki, "<id>"), t = t.replace(Ci, "<id>"), t = t.replace(Ii, "<n>"), t;
}
const Li = /^\s+at |^[^\s@]*@\S+:\d+(?::\d+)?$/m;
function Xt(e) {
  switch (C.messages) {
    case "full":
      return e;
    case "scrub":
      return Ri(e);
    default:
      return "";
  }
}
function Qr(e, t) {
  if (C.messages === "full" || !e || !t) return e;
  const n = Li.exec(e), r = n ? n.index : e.length, o = e.indexOf(t);
  if (o < 0 || o + t.length > r)
    return e;
  const i = Xt(t);
  let s = e.slice(0, o) + i;
  return i || (s = s.replace(/:\s*$/, "")), s + e.slice(o + t.length);
}
const Zr = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', eo = '[data-oodle-privacy="mask"],.oodle-privacy-mask', Mi = Zr + "," + eo + ",.rr-block,.rr-mask";
function xi(e) {
  if (C.actionText === "mask") return !0;
  try {
    return typeof e.closest == "function" && e.closest(Mi) !== null;
  } catch {
    return !0;
  }
}
let pn = null;
function Oi(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function Pi(e) {
  if (!Oi(e.endpoint))
    return console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    ), !1;
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  );
  const t = Ui(
    e.viewUrlQueryParams
  );
  return hi({ ...e, viewUrlQueryParams: t }), pn = { ...e, viewUrlQueryParams: t }, !0;
}
function Ui(e) {
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
function P() {
  if (!pn)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return pn;
}
const to = "__oodle_session", Ni = 1800 * 1e3, Hi = 14400 * 1e3;
function Fi() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
function Di() {
  try {
    const e = sessionStorage.getItem(to);
    if (!e) return null;
    const t = JSON.parse(e);
    return {
      id: t.id,
      createdAt: t.createdAt ?? Date.now(),
      lastActivity: t.lastActivity ?? Date.now(),
      viewCount: t.viewCount ?? 0,
      errorCount: t.errorCount ?? 0,
      actionCount: t.actionCount ?? 0,
      sampled: t.sampled ?? !0,
      replaySampled: t.replaySampled ?? !0,
      replaySegmentSeq: t.replaySegmentSeq ?? 0
    };
  } catch {
    return null;
  }
}
function no(e) {
  try {
    sessionStorage.setItem(
      to,
      JSON.stringify(e)
    );
  } catch {
  }
}
let Le = null;
function ro(e) {
  Le || (Le = setTimeout(() => {
    Le = null, no(e);
  }, 1e3));
}
function Un(e) {
  Le && (clearTimeout(Le), Le = null), no(e);
}
let m = null, oo = 100, io = 100;
function Bi(e, t) {
  oo = Math.max(
    0,
    Math.min(100, e)
  ), io = Math.max(
    0,
    Math.min(100, t)
  );
}
function rr(e) {
  return Math.random() * 100 < e;
}
function ne() {
  const e = Date.now();
  if (m || (m = Di()), !m || e - m.lastActivity > Ni || e - m.createdAt > Hi) {
    const t = rr(oo);
    m = {
      id: Fi(),
      createdAt: e,
      lastActivity: e,
      viewCount: 0,
      errorCount: 0,
      actionCount: 0,
      sampled: t,
      replaySampled: t && rr(io),
      replaySegmentSeq: 0
    }, Un(m);
  } else
    m.lastActivity = e, ro(m);
  return m.id;
}
function qi() {
  if (ne(), !m) return 0;
  const e = m.replaySegmentSeq;
  return m.replaySegmentSeq = e + 1, Un(m), e;
}
function so() {
  return ne(), (m == null ? void 0 : m.sampled) ?? !0;
}
function ao() {
  return ne(), (m == null ? void 0 : m.replaySampled) ?? !0;
}
let tt = null;
function $i() {
  typeof document > "u" || (co(), tt = () => {
    document.visibilityState === "hidden" && m && Un(m);
  }, document.addEventListener(
    "visibilitychange",
    tt
  ));
}
function co() {
  tt && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    tt
  ), tt = null);
}
function uo(e) {
  ne(), m && (e === "view" || e === "page_load" ? m.viewCount++ : e === "error" ? m.errorCount++ : e === "action" && m.actionCount++, ro(m));
}
function zi() {
  return ne(), {
    viewCount: (m == null ? void 0 : m.viewCount) ?? 0,
    errorCount: (m == null ? void 0 : m.errorCount) ?? 0,
    actionCount: (m == null ? void 0 : m.actionCount) ?? 0
  };
}
let X = null;
function ji(e) {
  X = e;
}
function lo() {
  return (X == null ? void 0 : X.id) ?? "";
}
function Xi() {
  return (X == null ? void 0 : X.name) ?? "";
}
function Yi() {
  return (X == null ? void 0 : X.email) ?? "";
}
function Vi() {
  return X ? "identified" : "anonymous";
}
const Wi = 5e5;
function Ut(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > Wi) return n;
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
let ht = {};
function Ji(e) {
  e && (ht = { ...e, ...ht });
}
function Gi(e) {
  ht = { ...ht, ...e };
}
function Ki() {
  return ht;
}
const Qi = 6e4, Zi = "sdk_telemetry", Me = {
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
  Me[e] += t;
}
function es() {
  for (const e in Me)
    if (Me[e] > 0)
      return !0;
  return !1;
}
function hn() {
  if (!es()) return;
  const e = { ...Me };
  for (const t in Me)
    Me[t] = 0;
  Bn(Zi, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let nt = null, rt = null;
function ts() {
  nt || (nt = setInterval(
    hn,
    Qi
  ), typeof document < "u" && (rt = () => {
    document.visibilityState === "hidden" && hn();
  }, document.addEventListener(
    "visibilitychange",
    rt
  )));
}
function ns() {
  nt && (clearInterval(nt), nt = null), rt && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    rt
  ), rt = null), hn();
}
var D = Uint8Array, F = Uint16Array, Nn = Int32Array, Hn = new D([
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
]), Fn = new D([
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
]), or = new D([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), fo = function(e, t) {
  for (var n = new F(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new Nn(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, po = fo(Hn, 2), rs = po.b, mn = po.r;
rs[28] = 258, mn[258] = 28;
var os = fo(Fn, 0), ir = os.r, yn = new F(32768);
for (var T = 0; T < 32768; ++T) {
  var ie = (T & 43690) >> 1 | (T & 21845) << 1;
  ie = (ie & 52428) >> 2 | (ie & 13107) << 2, ie = (ie & 61680) >> 4 | (ie & 3855) << 4, yn[T] = ((ie & 65280) >> 8 | (ie & 255) << 8) >> 1;
}
var ot = (function(e, t, n) {
  for (var r = e.length, o = 0, i = new F(t); o < r; ++o)
    e[o] && ++i[e[o] - 1];
  var s = new F(t);
  for (o = 1; o < t; ++o)
    s[o] = s[o - 1] + i[o - 1] << 1;
  var c;
  if (n) {
    c = new F(1 << t);
    var a = 15 - t;
    for (o = 0; o < r; ++o)
      if (e[o])
        for (var l = o << 4 | e[o], u = t - e[o], f = s[e[o] - 1]++ << u, d = f | (1 << u) - 1; f <= d; ++f)
          c[yn[f] >> a] = l;
  } else
    for (c = new F(r), o = 0; o < r; ++o)
      e[o] && (c[o] = yn[s[e[o] - 1]++] >> 15 - e[o]);
  return c;
}), Ee = new D(288);
for (var T = 0; T < 144; ++T)
  Ee[T] = 8;
for (var T = 144; T < 256; ++T)
  Ee[T] = 9;
for (var T = 256; T < 280; ++T)
  Ee[T] = 7;
for (var T = 280; T < 288; ++T)
  Ee[T] = 8;
var Nt = new D(32);
for (var T = 0; T < 32; ++T)
  Nt[T] = 5;
var is = /* @__PURE__ */ ot(Ee, 9, 0), ss = /* @__PURE__ */ ot(Nt, 5, 0), ho = function(e) {
  return (e + 7) / 8 | 0;
}, mo = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new D(e.subarray(t, n));
}, K = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, Je = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, tn = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: vo, l: 0 };
  if (o == 1) {
    var s = new D(n[0].s + 1);
    return s[n[0].s] = 1, { t: s, l: 1 };
  }
  n.sort(function(E, k) {
    return E.f - k.f;
  }), n.push({ s: -1, f: 25001 });
  var c = n[0], a = n[1], l = 0, u = 1, f = 2;
  for (n[0] = { s: -1, f: c.f + a.f, l: c, r: a }; u != o - 1; )
    c = n[n[l].f < n[f].f ? l++ : f++], a = n[l != u && n[l].f < n[f].f ? l++ : f++], n[u++] = { s: -1, f: c.f + a.f, l: c, r: a };
  for (var d = i[0].s, r = 1; r < o; ++r)
    i[r].s > d && (d = i[r].s);
  var v = new F(d + 1), h = vn(n[u - 1], v, 0);
  if (h > t) {
    var r = 0, _ = 0, w = h - t, b = 1 << w;
    for (i.sort(function(k, g) {
      return v[g.s] - v[k.s] || k.f - g.f;
    }); r < o; ++r) {
      var R = i[r].s;
      if (v[R] > t)
        _ += b - (1 << h - v[R]), v[R] = t;
      else
        break;
    }
    for (_ >>= w; _ > 0; ) {
      var I = i[r].s;
      v[I] < t ? _ -= 1 << t - v[I]++ - 1 : ++r;
    }
    for (; r >= 0 && _; --r) {
      var A = i[r].s;
      v[A] == t && (--v[A], ++_);
    }
    h = t;
  }
  return { t: new D(v), l: h };
}, vn = function(e, t, n) {
  return e.s == -1 ? Math.max(vn(e.l, t, n + 1), vn(e.r, t, n + 1)) : t[e.s] = n;
}, sr = function(e) {
  for (var t = e.length; t && !e[--t]; )
    ;
  for (var n = new F(++t), r = 0, o = e[0], i = 1, s = function(a) {
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
}, Ge = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, yo = function(e, t, n) {
  var r = n.length, o = ho(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, ar = function(e, t, n, r, o, i, s, c, a, l, u) {
  K(t, u++, n), ++o[256];
  for (var f = tn(o, 15), d = f.t, v = f.l, h = tn(i, 15), _ = h.t, w = h.l, b = sr(d), R = b.c, I = b.n, A = sr(_), E = A.c, k = A.n, g = new F(19), y = 0; y < R.length; ++y)
    ++g[R[y] & 31];
  for (var y = 0; y < E.length; ++y)
    ++g[E[y] & 31];
  for (var p = tn(g, 7), N = p.t, Te = p.l, H = 19; H > 4 && !N[or[H - 1]]; --H)
    ;
  var be = l + 5 << 3, $ = Ge(o, Ee) + Ge(i, Nt) + s, z = Ge(o, d) + Ge(i, _) + s + 14 + 3 * H + Ge(g, N) + 2 * g[16] + 3 * g[17] + 7 * g[18];
  if (a >= 0 && be <= $ && be <= z)
    return yo(t, u, e.subarray(a, a + l));
  var Y, L, j, oe;
  if (K(t, u, 1 + (z < $)), u += 2, z < $) {
    Y = ot(d, v, 0), L = d, j = ot(_, w, 0), oe = _;
    var Gt = ot(N, Te, 0);
    K(t, u, I - 257), K(t, u + 5, k - 1), K(t, u + 10, H - 4), u += 14;
    for (var y = 0; y < H; ++y)
      K(t, u + 3 * y, N[or[y]]);
    u += 3 * H;
    for (var V = [R, E], We = 0; We < 2; ++We)
      for (var Ae = V[We], y = 0; y < Ae.length; ++y) {
        var W = Ae[y] & 31;
        K(t, u, Gt[W]), u += N[W], W > 15 && (K(t, u, Ae[y] >> 5 & 127), u += Ae[y] >> 12);
      }
  } else
    Y = is, L = Ee, j = ss, oe = Nt;
  for (var y = 0; y < c; ++y) {
    var M = r[y];
    if (M > 255) {
      var W = M >> 18 & 31;
      Je(t, u, Y[W + 257]), u += L[W + 257], W > 7 && (K(t, u, M >> 23 & 31), u += Hn[W]);
      var ke = M & 31;
      Je(t, u, j[ke]), u += oe[ke], ke > 3 && (Je(t, u, M >> 5 & 8191), u += Fn[ke]);
    } else
      Je(t, u, Y[M]), u += L[M];
  }
  return Je(t, u, Y[256]), u + L[256];
}, as = /* @__PURE__ */ new Nn([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), vo = /* @__PURE__ */ new D(0), cs = function(e, t, n, r, o, i) {
  var s = i.z || e.length, c = new D(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = c.subarray(r, c.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (a[0] = i.r >> 3);
    for (var f = as[t - 1], d = f >> 13, v = f & 8191, h = (1 << n) - 1, _ = i.p || new F(32768), w = i.h || new F(h + 1), b = Math.ceil(n / 3), R = 2 * b, I = function(Zt) {
      return (e[Zt] ^ e[Zt + 1] << b ^ e[Zt + 2] << R) & h;
    }, A = new Nn(25e3), E = new F(288), k = new F(32), g = 0, y = 0, p = i.i || 0, N = 0, Te = i.w || 0, H = 0; p + 2 < s; ++p) {
      var be = I(p), $ = p & 32767, z = w[be];
      if (_[$] = z, w[be] = $, Te <= p) {
        var Y = s - p;
        if ((g > 7e3 || N > 24576) && (Y > 423 || !l)) {
          u = ar(e, a, 0, A, E, k, y, N, H, p - H, u), N = g = y = 0, H = p;
          for (var L = 0; L < 286; ++L)
            E[L] = 0;
          for (var L = 0; L < 30; ++L)
            k[L] = 0;
        }
        var j = 2, oe = 0, Gt = v, V = $ - z & 32767;
        if (Y > 2 && be == I(p - V))
          for (var We = Math.min(d, Y) - 1, Ae = Math.min(32767, p), W = Math.min(258, Y); V <= Ae && --Gt && $ != z; ) {
            if (e[p + j] == e[p + j - V]) {
              for (var M = 0; M < W && e[p + M] == e[p + M - V]; ++M)
                ;
              if (M > j) {
                if (j = M, oe = V, M > We)
                  break;
                for (var ke = Math.min(V, M - 2), Jn = 0, L = 0; L < ke; ++L) {
                  var Kt = p - V + L & 32767, ci = _[Kt], Gn = Kt - ci & 32767;
                  Gn > Jn && (Jn = Gn, z = Kt);
                }
              }
            }
            $ = z, z = _[$], V += $ - z & 32767;
          }
        if (oe) {
          A[N++] = 268435456 | mn[j] << 18 | ir[oe];
          var Kn = mn[j] & 31, Qn = ir[oe] & 31;
          y += Hn[Kn] + Fn[Qn], ++E[257 + Kn], ++k[Qn], Te = p + j, ++g;
        } else
          A[N++] = e[p], ++E[e[p]];
      }
    }
    for (p = Math.max(p, Te); p < s; ++p)
      A[N++] = e[p], ++E[e[p]];
    u = ar(e, a, l, A, E, k, y, N, H, p - H, u), l || (i.r = u & 7 | a[u / 8 | 0] << 3, u -= 7, i.h = w, i.p = _, i.i = p, i.w = Te);
  } else {
    for (var p = i.w || 0; p < s + l; p += 65535) {
      var Qt = p + 65535;
      Qt >= s && (a[u / 8 | 0] = l, Qt = s), u = yo(a, u + 1, e.subarray(p, Qt));
    }
    i.i = s;
  }
  return mo(c, 0, r + ho(u) + o);
}, us = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), ls = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = us[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, fs = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new D(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return cs(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, gn = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, ds = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && gn(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, ps = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function hs(e, t) {
  t || (t = {});
  var n = ls(), r = e.length;
  n.p(e);
  var o = fs(e, t, ps(t), 8), i = o.length;
  return ds(o, t), gn(o, i - 8, n.d()), gn(o, i - 4, r), o;
}
var cr = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), ms = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), ys = 0;
try {
  ms.decode(vo, { stream: !0 }), ys = 1;
} catch {
}
function vs(e, t) {
  var n;
  if (cr)
    return cr.encode(e);
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
  return mo(o, 0, i);
}
function It(e) {
  try {
    return hs(vs(e));
  } catch {
    return null;
  }
}
const gs = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function _s(e) {
  if (!gs)
    return It(e);
  try {
    const t = new Response(e).body;
    if (!t) return It(e);
    const n = t.pipeThrough(
      new CompressionStream("gzip")
    ), r = await new Response(
      n
    ).arrayBuffer();
    return new Uint8Array(r);
  } catch {
    return It(e);
  }
}
const ws = "0.6.0", ur = 5e3, go = 50, _o = 5e5, lr = 256e3, Ht = "replay", wo = 8e4, Eo = 32, Es = 2e7, Ss = 5, Ts = 1e3, bs = 6e4, As = 500, Ft = 63e3;
let xe = 0, Oe = 0, se = [], it = 0, nn = null;
const Dt = /* @__PURE__ */ new Map();
let Pe = null, Ue = null, _n = null, st = !1;
function ks() {
  try {
    return P().flushIntervalMs ?? ur;
  } catch {
    return ur;
  }
}
function So(e) {
  let t = Dt.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, Dt.set(e, t)), t;
}
function To(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (x("compression_failures"), { body: t, encoding: "" });
}
async function bo(e) {
  return To(await _s(e), e);
}
function Cs(e) {
  return To(It(e), e);
}
const Is = 64e3;
function wn(e, t, n) {
  if (e === Ht)
    return {
      bytes: n ?? Ut(
        t,
        Is
      ),
      oversized: !1
    };
  const r = Ut(
    t,
    lr + 1
  );
  return {
    bytes: r,
    oversized: r > lr
  };
}
let En = null;
function Rs(e) {
  En = e;
}
function Yt(e) {
  x("transport_drops"), e === Ht && En && En();
}
const Ls = "/v1/rum/ingest";
function Ms(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: ws
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
function xs(e, t, n) {
  const r = P();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const a = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, l = new Blob([n], {
      type: "application/json"
    });
    if (l.size < Ft && navigator.sendBeacon(a, l))
      return;
  }
  const { body: o, encoding: i } = Cs(n), s = { ...t };
  i ? s["Content-Encoding"] = i : delete s["Content-Encoding"];
  const c = o instanceof Blob ? o.size : n.length;
  fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: c < Ft,
    credentials: "omit"
  }).catch(() => {
    x("exit_send_failures");
  });
}
function rn(e, t, n, r) {
  const o = n.length;
  if (it + o > Es) {
    x("retry_drops"), r && Yt(r);
    return;
  }
  const i = { ...t };
  delete i["Content-Encoding"], se.push({
    url: e,
    headers: i,
    body: n,
    bytes: o,
    attempts: 0,
    batchKey: r
  }), it += o, Ao();
}
function Ao() {
  if (nn || se.length === 0)
    return;
  const e = se[0], t = Math.min(
    Ts * Math.pow(2, e.attempts),
    bs
  );
  nn = setTimeout(() => {
    nn = null, ko();
  }, t);
}
async function ko() {
  for (; se.length > 0 && xe < wo && Oe < Eo; ) {
    const e = se.shift();
    if (it -= e.bytes, e.attempts++, e.attempts > Ss) {
      x("retry_drops"), e.batchKey && Yt(e.batchKey);
      continue;
    }
    const t = e.bytes;
    xe += t, Oe++;
    try {
      const { body: n, encoding: r } = await bo(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < Ft,
        credentials: "omit"
      });
      if (Io(i), i.status === 429 || i.status >= 500) {
        se.unshift(e), it += e.bytes;
        break;
      }
    } catch {
      se.unshift(e), it += e.bytes;
      break;
    } finally {
      xe -= t, Oe--;
    }
  }
  se.length > 0 && Ao();
}
function Os() {
  Pe && (clearTimeout(Pe), Pe = null), Ue && (clearTimeout(Ue), Ue = null);
}
function Dn() {
  const e = ks();
  Pe && clearTimeout(Pe), Pe = setTimeout(
    () => re(),
    e
  ), Ue || (Ue = setTimeout(
    () => {
      Ue = null, re();
    },
    e + As
  ));
}
function Bn(e, t, n) {
  const { bytes: r, oversized: o } = wn(
    e,
    t,
    n
  );
  if (o) {
    console.warn(
      `[@oodle-ai/rum] Dropping oversized ${e} payload (${r} bytes)`
    ), Yt(e);
    return;
  }
  const i = So(e);
  if (i.items.push(t), i.bytesEstimate += r, !st && (i.items.length >= go || i.bytesEstimate >= _o)) {
    re();
    return;
  }
  Dn();
}
function Ps(e, t, n) {
  const { bytes: r, oversized: o } = wn(
    e,
    n
  );
  if (o) {
    Yt(e);
    return;
  }
  const i = So(e), s = i.upsertMap.get(t);
  if (s !== void 0) {
    const c = wn(
      e,
      i.items[s]
    ).bytes;
    i.items[s] = n, i.bytesEstimate += r - c;
  } else {
    const c = i.items.length;
    i.items.push(n), i.upsertMap.set(t, c), i.bytesEstimate += r;
  }
  if (!st && (i.items.length >= go || i.bytesEstimate >= _o)) {
    re();
    return;
  }
  Dn();
}
function Co(e) {
  _n = e;
}
const fr = ["events", "replay"];
function re(e = !1) {
  const t = P();
  if (e && _n && !st) {
    st = !0;
    try {
      _n();
    } catch {
    } finally {
      st = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    Dn();
    return;
  }
  Os();
  const n = Ki(), r = [], o = Array.from(
    Dt.keys()
  ).sort((l, u) => {
    const f = fr.indexOf(l), d = fr.indexOf(u), v = f >= 0 ? f : 999, h = d >= 0 ? d : 999;
    return v - h;
  });
  for (const l of o) {
    const u = Dt.get(l);
    if (!u || u.items.length === 0) continue;
    const f = u.items.splice(0);
    u.upsertMap.clear(), u.bytesEstimate = 0;
    const d = f.map((v) => ({
      ...v,
      tags: n
    }));
    r.push({
      type: u.batchKey,
      items: d
    });
  }
  if (r.length === 0) return;
  const i = Ms(r), s = `${t.endpoint}${Ls}`, c = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, a = r.some(
    (l) => l.type === Ht
  );
  if (e) {
    xs(s, c, i);
    return;
  }
  Us(
    s,
    c,
    i,
    a ? Ht : void 0
  );
}
async function Us(e, t, n, r) {
  const o = n.length;
  if (xe >= wo || Oe >= Eo) {
    rn(e, t, n, r);
    return;
  }
  xe += o, Oe++;
  try {
    const { body: i, encoding: s } = await bo(n), c = { ...t };
    s && (c["Content-Encoding"] = s);
    const a = await fetch(e, {
      method: "POST",
      headers: c,
      body: i,
      keepalive: o < Ft,
      credentials: "omit"
    });
    Io(a), (a.status === 429 || a.status >= 500) && rn(e, t, n, r);
  } catch {
    x("send_failures"), rn(e, t, n, r);
  } finally {
    xe -= o, Oe--, ko();
  }
}
const Sn = /* @__PURE__ */ new Map();
function Io(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && Sn.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function Vt(e) {
  const t = Sn.get(e);
  return t ? Date.now() >= t ? (Sn.delete(e), !1) : !0 : !1;
}
let at = null, ct = null, ut = null, Tn = null;
function Ns(e) {
  Tn = e;
}
const Ro = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function dr() {
  typeof document > "u" || (at = () => {
    document.visibilityState === "hidden" && re(!0);
  }, ct = () => re(!0), ut = (e) => {
    e.persisted && Tn && Tn();
  }, document.addEventListener(
    "visibilitychange",
    at
  ), window.addEventListener(
    Ro,
    ct
  ), window.addEventListener(
    "pageshow",
    ut
  ));
}
function Hs() {
  at && (document.removeEventListener(
    "visibilitychange",
    at
  ), at = null), ct && (window.removeEventListener(
    Ro,
    ct
  ), ct = null), ut && (window.removeEventListener(
    "pageshow",
    ut
  ), ut = null);
}
const Bt = /* @__PURE__ */ new Map();
function Fs(e, t) {
  Bt.set(e, t);
}
function Ds() {
  return Bt.size === 0 ? {} : Object.fromEntries(Bt);
}
function Bs() {
  Bt.clear();
}
var bn, ae, lt, Lo, qt, Mo = -1, Se = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (Mo = t.timeStamp, e(t));
  }), !0);
}, qn = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, Wt = function() {
  var e = qn();
  return e && e.activationStart || 0;
}, B = function(e, t) {
  var n = qn(), r = "navigate";
  return Mo >= 0 ? r = "back-forward-cache" : n && (document.prerendering || Wt() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, Ve = function(e, t, n) {
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
}, q = function(e, t, n, r) {
  var o, i;
  return function(s) {
    t.value >= 0 && (s || r) && ((i = t.value - (o || 0)) || o === void 0) && (o = t.value, t.delta = i, t.rating = (function(c, a) {
      return c > a[1] ? "poor" : c > a[0] ? "needs-improvement" : "good";
    })(t.value, n), e(t));
  };
}, $n = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, wt = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, Jt = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Ie = -1, pr = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, $t = function(e) {
  document.visibilityState === "hidden" && Ie > -1 && (Ie = e.type === "visibilitychange" ? e.timeStamp : 0, qs());
}, hr = function() {
  addEventListener("visibilitychange", $t, !0), addEventListener("prerenderingchange", $t, !0);
}, qs = function() {
  removeEventListener("visibilitychange", $t, !0), removeEventListener("prerenderingchange", $t, !0);
}, zn = function() {
  return Ie < 0 && (Ie = pr(), hr(), Se((function() {
    setTimeout((function() {
      Ie = pr(), hr();
    }), 0);
  }))), { get firstHiddenTime() {
    return Ie;
  } };
}, Et = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, mr = [1800, 3e3], xo = function(e, t) {
  t = t || {}, Et((function() {
    var n, r = zn(), o = B("FCP"), i = Ve("paint", (function(s) {
      s.forEach((function(c) {
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < r.firstHiddenTime && (o.value = Math.max(c.startTime - Wt(), 0), o.entries.push(c), n(!0)));
      }));
    }));
    i && (n = q(e, o, mr, t.reportAllChanges), Se((function(s) {
      o = B("FCP"), n = q(e, o, mr, t.reportAllChanges), $n((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, yr = [0.1, 0.25], $s = function(e, t) {
  t = t || {}, xo(Jt((function() {
    var n, r = B("CLS", 0), o = 0, i = [], s = function(a) {
      a.forEach((function(l) {
        if (!l.hadRecentInput) {
          var u = i[0], f = i[i.length - 1];
          o && l.startTime - f.startTime < 1e3 && l.startTime - u.startTime < 5e3 ? (o += l.value, i.push(l)) : (o = l.value, i = [l]);
        }
      })), o > r.value && (r.value = o, r.entries = i, n());
    }, c = Ve("layout-shift", s);
    c && (n = q(e, r, yr, t.reportAllChanges), wt((function() {
      s(c.takeRecords()), n(!0);
    })), Se((function() {
      o = 0, r = B("CLS", 0), n = q(e, r, yr, t.reportAllChanges), $n((function() {
        return n();
      }));
    })), setTimeout(n, 0));
  })));
}, Oo = 0, on = 1 / 0, Tt = 0, zs = function(e) {
  e.forEach((function(t) {
    t.interactionId && (on = Math.min(on, t.interactionId), Tt = Math.max(Tt, t.interactionId), Oo = Tt ? (Tt - on) / 7 + 1 : 0);
  }));
}, Po = function() {
  return bn ? Oo : performance.interactionCount || 0;
}, js = function() {
  "interactionCount" in performance || bn || (bn = Ve("event", zs, { type: "event", buffered: !0, durationThreshold: 0 }));
}, G = [], Rt = /* @__PURE__ */ new Map(), Uo = 0, Xs = function() {
  var e = Math.min(G.length - 1, Math.floor((Po() - Uo) / 50));
  return G[e];
}, Ys = [], Vs = function(e) {
  if (Ys.forEach((function(o) {
    return o(e);
  })), e.interactionId || e.entryType === "first-input") {
    var t = G[G.length - 1], n = Rt.get(e.interactionId);
    if (n || G.length < 10 || e.duration > t.latency) {
      if (n) e.duration > n.latency ? (n.entries = [e], n.latency = e.duration) : e.duration === n.latency && e.startTime === n.entries[0].startTime && n.entries.push(e);
      else {
        var r = { id: e.interactionId, latency: e.duration, entries: [e] };
        Rt.set(r.id, r), G.push(r);
      }
      G.sort((function(o, i) {
        return i.latency - o.latency;
      })), G.length > 10 && G.splice(10).forEach((function(o) {
        return Rt.delete(o.id);
      }));
    }
  }
}, No = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = Jt(e), document.visibilityState === "hidden" ? e() : (n = t(e), wt(e)), n;
}, vr = [200, 500], Ws = function(e, t) {
  "PerformanceEventTiming" in self && "interactionId" in PerformanceEventTiming.prototype && (t = t || {}, Et((function() {
    var n;
    js();
    var r, o = B("INP"), i = function(c) {
      No((function() {
        c.forEach(Vs);
        var a = Xs();
        a && a.latency !== o.value && (o.value = a.latency, o.entries = a.entries, r());
      }));
    }, s = Ve("event", i, { durationThreshold: (n = t.durationThreshold) !== null && n !== void 0 ? n : 40 });
    r = q(e, o, vr, t.reportAllChanges), s && (s.observe({ type: "first-input", buffered: !0 }), wt((function() {
      i(s.takeRecords()), r(!0);
    })), Se((function() {
      Uo = Po(), G.length = 0, Rt.clear(), o = B("INP"), r = q(e, o, vr, t.reportAllChanges);
    })));
  })));
}, gr = [2500, 4e3], sn = {}, Js = function(e, t) {
  t = t || {}, Et((function() {
    var n, r = zn(), o = B("LCP"), i = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - Wt(), 0), o.entries = [l], n());
      }));
    }, s = Ve("largest-contentful-paint", i);
    if (s) {
      n = q(e, o, gr, t.reportAllChanges);
      var c = Jt((function() {
        sn[o.id] || (i(s.takeRecords()), s.disconnect(), sn[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(a) {
        addEventListener(a, (function() {
          return No(c);
        }), { once: !0, capture: !0 });
      })), wt(c), Se((function(a) {
        o = B("LCP"), n = q(e, o, gr, t.reportAllChanges), $n((function() {
          o.value = performance.now() - a.timeStamp, sn[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, _r = [800, 1800], Gs = function e(t) {
  document.prerendering ? Et((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, Ks = function(e, t) {
  t = t || {};
  var n = B("TTFB"), r = q(e, n, _r, t.reportAllChanges);
  Gs((function() {
    var o = qn();
    o && (n.value = Math.max(o.responseStart - Wt(), 0), n.entries = [o], r(!0), Se((function() {
      n = B("TTFB", 0), (r = q(e, n, _r, t.reportAllChanges))(!0);
    })));
  }));
}, Ze = { passive: !0, capture: !0 }, Qs = /* @__PURE__ */ new Date(), wr = function(e, t) {
  ae || (ae = t, lt = e, Lo = /* @__PURE__ */ new Date(), Fo(removeEventListener), Ho());
}, Ho = function() {
  if (lt >= 0 && lt < Lo - Qs) {
    var e = { entryType: "first-input", name: ae.type, target: ae.target, cancelable: ae.cancelable, startTime: ae.timeStamp, processingStart: ae.timeStamp + lt };
    qt.forEach((function(t) {
      t(e);
    })), qt = [];
  }
}, Zs = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        wr(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, Ze), removeEventListener("pointercancel", i, Ze);
      };
      addEventListener("pointerup", o, Ze), addEventListener("pointercancel", i, Ze);
    })(t, e) : wr(t, e);
  }
}, Fo = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, Zs, Ze);
  }));
}, Er = [100, 300], ea = function(e, t) {
  t = t || {}, Et((function() {
    var n, r = zn(), o = B("FID"), i = function(a) {
      a.startTime < r.firstHiddenTime && (o.value = a.processingStart - a.startTime, o.entries.push(a), n(!0));
    }, s = function(a) {
      a.forEach(i);
    }, c = Ve("first-input", s);
    n = q(e, o, Er, t.reportAllChanges), c && (wt(Jt((function() {
      s(c.takeRecords()), c.disconnect();
    }))), Se((function() {
      var a;
      o = B("FID"), n = q(e, o, Er, t.reportAllChanges), qt = [], lt = -1, ae = null, Fo(addEventListener), a = i, qt.push(a), Ho();
    })));
  }));
};
const Ne = "[REDACTED]", ta = /token|secret|auth|cookie|passw|api-?key|access-?key|session|csrf|xsrf|client-?ip|real-?ip|connecting-ip|(^|-)forwarded(-for)?$/, na = /passw|secret|token(?!s|count|limit|usage|type)|apikey|accesskey|privatekey|authorization|credential|cardnumber|creditcard|cardnum|^pan$|cvv|cvc|securitycode|^ssn$|socialsecurity|^ip$|ipaddr|clientip|remoteaddr|remoteip|^ipv[46]$/;
function Do(e, t, n) {
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
function Bo(e) {
  return Do(
    ta,
    (t) => t.toLowerCase(),
    e
  );
}
function qo(e) {
  return Do(
    na,
    (t) => t.toLowerCase().replace(/[-_.\s]/g, ""),
    e
  );
}
function ra(e) {
  let t = 0, n = !1;
  for (let r = e.length - 1; r >= 0; r--) {
    let o = e.charCodeAt(r) - 48;
    n && (o *= 2, o > 9 && (o -= 9)), t += o, n = !n;
  }
  return t % 10 === 0;
}
const oa = /\b\d(?:[ -]?\d){12,18}\b/g;
function ia(e) {
  return e.replace(oa, (t) => {
    const n = t.replace(/[ -]/g, "");
    return n.length >= 13 && n.length <= 19 && n[0] >= "2" && n[0] <= "6" && ra(n) ? Ne : t;
  });
}
function An(e, t, n) {
  if (n > 32 || e === null || typeof e != "object")
    return;
  let r = !1;
  if (Array.isArray(e)) {
    const i = e.map((s) => {
      const c = An(s, t, n + 1);
      return c === void 0 ? s : (r = !0, c);
    });
    return r ? i : void 0;
  }
  const o = /* @__PURE__ */ Object.create(null);
  for (const [i, s] of Object.entries(e)) {
    if (t(i) && s !== null && s !== "") {
      o[i] = Ne, r = !0;
      continue;
    }
    const c = An(s, t, n + 1);
    c === void 0 ? o[i] = s : (o[i] = c, r = !0);
  }
  return r ? o : void 0;
}
const an = /"((?:[^"\\]|\\.){1,200})"\s*:\s*/g, sa = /^("(?:[^"\\]|\\.)*"|[^\s,}\]{["]+)/;
function aa(e, t) {
  let n = "", r = 0;
  an.lastIndex = 0;
  let o;
  for (; (o = an.exec(e)) !== null; ) {
    if (!t(o[1])) continue;
    const i = o.index + o[0].length, s = e.slice(i);
    if (s[0] === "{" || s[0] === "[")
      return n + e.slice(r, i) + `"${Ne}"`;
    const c = sa.exec(s);
    if (!c)
      return s[0] === '"' ? n + e.slice(r, i) + `"${Ne}"` : n + e.slice(r);
    c[1] === '""' || c[1] === "null" || (n += e.slice(r, i) + `"${Ne}"`, r = i + c[1].length, an.lastIndex = r);
  }
  return n + e.slice(r);
}
function ca(e) {
  return /^[\w.%+[\]-]+=[^&]*(&[\w.%+[\]-]+=[^&]*)*$/.test(e);
}
function ua(e, t) {
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
      const s = An(o, t, 0);
      s !== void 0 && (r = JSON.stringify(s));
    } else
      r = aa(e, t);
  } else if (ca(n))
    try {
      const o = new URLSearchParams(e);
      let i = !1;
      if (o.forEach((s, c) => {
        t(c) && s && (i = !0);
      }), i) {
        const s = new URLSearchParams();
        o.forEach((c, a) => {
          s.append(a, t(a) && c ? Ne : c);
        }), r = s.toString();
      }
    } catch {
    }
  return ia(r);
}
const la = 50, Sr = 200, Tr = /* @__PURE__ */ new Map();
function fa(e) {
  let t = Tr.get(e);
  return t || (t = {
    tokens: Sr,
    lastRefill: Date.now(),
    rate: la,
    burst: Sr
  }, Tr.set(e, t)), t;
}
function da(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function pa(e) {
  const t = fa(e);
  return da(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let kn = null, Cn = null;
function Xc(e, t) {
  kn = e, Cn = t;
}
const ha = "00000000000000000000000000000000";
function $o() {
  if (!kn || !Cn) return null;
  try {
    const e = kn.getSpan(
      Cn.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === ha ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const br = 100, ma = 10, Ar = 5e3, ya = 3, va = 0;
function ga(e, t = () => Date.now()) {
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
        const d = f.getNode(a), v = d && d.closest ? d.closest("svg") : null;
        if (v) {
          const h = f.getId(v);
          h !== -1 && (u = h);
        }
      } catch {
      }
    return r.size < Ar && r.set(a, u), u;
  }
  function s(a) {
    const l = i(a), u = t();
    let f = n.get(l);
    if (!f) {
      if (n.size >= Ar)
        return !0;
      f = {
        tokens: br,
        lastRefillMs: u
      }, n.set(l, f);
    }
    const d = (u - f.lastRefillMs) / 1e3;
    return d > 0 && (f.tokens = Math.min(
      br,
      f.tokens + d * ma
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function c(a) {
    var h, _, w;
    if (a.type !== ya)
      return { event: a, dropped: 0 };
    const l = a.data;
    if (!l || l.source !== va || !l.attributes || l.attributes.length === 0)
      return { event: a, dropped: 0 };
    const u = l.attributes.length, f = l.attributes.filter(
      (b) => s(b.id)
    ), d = u - f.length;
    return d === 0 ? { event: a, dropped: 0 } : (l.attributes = f, {
      event: f.length > 0 || (((h = l.adds) == null ? void 0 : h.length) ?? 0) > 0 || (((_ = l.removes) == null ? void 0 : _.length) ?? 0) > 0 || (((w = l.texts) == null ? void 0 : w.length) ?? 0) > 0 ? a : null,
      dropped: d
    });
  }
  return { throttle: c, reset: o };
}
const kr = "replay", _a = 200, wa = 6e4, Ea = 5e3, Sa = 8e6, zo = 2, Ta = 3, ba = 4, Cr = 3e3, jo = 5e3, Aa = 3, ka = 3e4, Ca = 5e3, Ia = 16, Ra = 100, La = 4, Ma = 30, Ir = 32, Rr = 250, xa = 36e4;
function Oa() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const Pa = 3e5, Ua = 9e5, Na = 1e3;
let ge = null, te = null, Ke = null, ze = [], je = 0, Re = "", jn = !1, Xo = 0, cn = "", Z = 0, _e = Date.now(), le = !1, mt = 0, he = null, Xe = !1, He = null, Yo = 0, Q = [], J = 0, Fe = null, ce = null, Lt = 0;
function Ye() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const Xn = ga(
  () => (ge == null ? void 0 : ge.mirror) ?? null
);
let De = null, me = null, Be = !1, yt = !1, Yn = 0, Mt = null, ee = null;
function Ha() {
  Fe && (clearTimeout(Fe), Fe = null), ce && (ce(), ce = null);
}
function In(e, t) {
  Ha();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    Ma
  ) : null, r = e ? Ye() + (n ?? La) : Number.POSITIVE_INFINITY;
  for (; J < Q.length; ) {
    const o = Math.min(
      J + Ir,
      Q.length
    );
    for (; J < o; )
      Rn(
        Q[J++]
      );
    if (Ye() >= r) break;
  }
  if (J >= Q.length) {
    Q = [], J = 0;
    return;
  }
  J >= Ir * 8 && (Q = Q.slice(J), J = 0), Vo();
}
function zt() {
  In(!1);
}
function Vo() {
  if (!Fe) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          ce = null, In(!0, t);
        },
        { timeout: Ra }
      );
      ce = () => cancelIdleCallback(e);
    }
    Fe = setTimeout(() => {
      Fe = null, ce && (ce(), ce = null), In(!0);
    }, Ia);
  }
}
function vt(e = !1) {
  if (Xe = !0, He) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - _e, r = Math.max(
      0,
      jo - n
    ), o = Date.now() - Yo, i = Math.max(
      0,
      Ca - o
    );
    t = Math.max(
      r,
      i
    );
  }
  He = setTimeout(() => {
    He = null, Fa();
  }, t);
}
function Fa() {
  if (!Xe || !ge || !te || le) return;
  mt++;
  const e = Lt > Rr ? 1 : Aa;
  if (mt > e) {
    qa();
    return;
  }
  Yo = Date.now(), Z = 0, _e = Date.now();
  try {
    const t = Ye();
    ge.takeFullSnapshot(!0), Lt = Ye() - t, x("replay_rebases"), Lt > Rr && x(
      "replay_expensive_snapshots"
    );
  } catch {
    _t(), gt();
  }
}
function Lr() {
  x("replay_events_dropped");
}
function Wo() {
  if (Re) return !1;
  Re = ne(), Xo = qi();
  const e = cn !== "" && cn !== Re;
  return cn = Re, e;
}
function St() {
  if (Ba(), ze.length === 0) return;
  if (Vt(kr)) {
    Da(), Jo();
    return;
  }
  Wo();
  const e = Re, t = Xo, n = ze.splice(0), r = je;
  je = 0, Re = "", jn = !0, Bn(
    kr,
    {
      session_id: e,
      segment_index: t,
      events: n
    },
    r
  );
}
function Da() {
  je <= Sa || (x(
    "replay_events_dropped",
    ze.length
  ), ze.length = 0, je = 0, vt());
}
let qe = null;
function Ba() {
  qe && (clearTimeout(qe), qe = null);
}
function Jo() {
  if (qe) return;
  const e = P().replayFlushIntervalMs ?? Ea;
  qe = setTimeout(() => {
    qe = null, St();
  }, e);
}
function Rn(e) {
  Wo() && e.type !== zo && vt(!0), ze.push(e), je += Ut(e), ze.length >= _a || je >= wa ? St() : Jo();
}
function qa() {
  le = !0, x("replay_overload_pauses"), _t(), he && clearTimeout(he), he = setTimeout(() => {
    he = null, le = !1, mt = 0, Z = 0, _e = Date.now(), !Be && !yt && ee && gt();
  }, ka);
}
function $a(e) {
  if (le) return;
  if (e.type === zo) {
    zt(), Xe = !1, Z = 0, _e = Date.now(), Rn(e);
    return;
  }
  if (e.type === ba) {
    const r = e.data;
    typeof r.href == "string" && (r.href = gi(r.href));
  }
  if (e.type !== Ta) {
    zt(), Rn(e);
    return;
  }
  if (Xe) {
    Lr(), vt();
    return;
  }
  const t = Date.now();
  t - _e > jo && (Z <= Cr && (mt = 0), Z = 0, _e = t);
  const n = Xn.throttle(e);
  if (n.dropped > 0 && x(
    "replay_attributes_throttled",
    n.dropped
  ), !!n.event) {
    if (Z++, Z > Cr) {
      Lr(), vt();
      return;
    }
    Q.push(n.event), Vo();
  }
}
async function gt() {
  if (ee && !le && !te)
    return Ke || (Ke = za().finally(
      () => {
        Ke = null;
      }
    ), Ke);
}
async function za() {
  if (!ee) return;
  const { record: e } = await import("./rrweb-SbAupvcM.js");
  !ee || le || te || (ge = e, Xe = !1, Z = 0, _e = Date.now(), Xn.reset(), te = e({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: Oa() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: xa,
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
        $a(t);
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
    blockSelector: Zr,
    maskTextSelector: eo,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => St(), 200));
}
function _t() {
  te && (te(), te = null), He && (clearTimeout(He), He = null), Xe = !1, zt(), St();
}
function ja() {
  const e = P(), t = e.replayIdlePauseMs ?? Pa, n = e.replayIdleExpireMs ?? Ua;
  De && clearTimeout(De), me && (clearTimeout(me), me = null), De = setTimeout(() => {
    Be = !0, _t();
  }, t), me = setTimeout(() => {
    yt = !0, _t();
  }, n);
}
function xt() {
  Yn = Ye(), ja();
}
function Xa() {
  if (yt) {
    if (!ao()) return;
    yt = !1, Be = !1, gt(), xt();
    return;
  }
  if (Be) {
    Be = !1, gt(), xt();
    return;
  }
  Ye() - Yn >= Na && xt();
}
function Ya() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => Xa(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  Mt = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function Va() {
  Mt && (Mt(), Mt = null), De && (clearTimeout(De), De = null), me && (clearTimeout(me), me = null);
}
function Wa() {
  zt(), St();
}
async function Ja() {
  const t = P().privacyLevel ?? "mask-user-input";
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
  }, Rs(() => {
    te && vt();
  }), Co(Wa), await gt(), Ya(), xt();
}
function Ga() {
  return te !== null && !le;
}
function Ka() {
  return jn;
}
function Qa() {
  _t(), Va(), Co(null), he && (clearTimeout(he), he = null), Be = !1, yt = !1, Yn = 0, le = !1, jn = !1, mt = 0, Z = 0, Lt = 0, Q = [], J = 0, Xn.reset(), ee = null, ge = null;
}
let U = [], pe = null;
const Za = [
  "error",
  "action",
  "console",
  "resource"
];
function ec(e) {
  return Za.includes(e) && (Vt(e) || !pa(e)) ? (x("events_rate_limited"), !0) : !1;
}
function tc(e, t) {
  const n = e.origin + ve(e.pathname);
  if (!Array.isArray(t) || t.length === 0 || !e.search)
    return n;
  const r = new URLSearchParams(e.search), o = new URLSearchParams();
  r.forEach((s, c) => {
    t.includes(c) && o.append(c, s);
  });
  const i = o.toString();
  return i ? n + "?" + i : n;
}
function nc() {
  pe || (pe = {
    device_type: Pc(),
    browser_name: Uc(),
    os_name: Nc(),
    user_agent: navigator.userAgent,
    language: navigator.language
  });
}
function Go() {
  nc();
  const e = zi(), t = Ds(), n = P(), r = {
    session_id: ne(),
    ...Si(
      lo(),
      Xi(),
      Yi()
    ),
    user_status: Vi(),
    service: n.service,
    env: n.env ?? "",
    version: n.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: tc(
      window.location,
      n.viewUrlQueryParams
    ),
    view_url_host: window.location.hostname,
    view_url_path: ve(window.location.pathname),
    referrer_url: _i(document.referrer),
    device_type: pe.device_type,
    browser_name: pe.browser_name,
    os_name: pe.os_name,
    user_agent: Ei() ? pe.user_agent : "",
    language: pe.language,
    session_view_count: e.viewCount,
    session_error_count: e.errorCount,
    session_action_count: e.actionCount,
    replay_id: Ga() && Ka() ? ne() : ""
  };
  return Object.keys(t).length > 0 && (r.feature_flags = t), r;
}
function rc(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const Ko = "events", oc = ["session_id", "event_type", "timestamp"];
let Mr = !1;
function Qo(e) {
  const t = P().beforeSend;
  if (typeof t != "function") return e;
  const n = {};
  for (const r of oc) n[r] = e[r];
  try {
    const r = t(e);
    if (r === null || r === !1) return null;
    if (ni(r))
      throw new Error("it returned a promise; it must be synchronous");
    return { ...r && typeof r == "object" ? r : e, ...n };
  } catch (r) {
    return Mr || (Mr = !0, xn(
      `beforeSend failed. Events are dropped until it is fixed: ${String(r)}`
    )), null;
  }
}
function O(e) {
  if (!so() || Vt("events")) return;
  const t = e(), n = t.event_type;
  if (ec(n)) return;
  n === "resource" && Ec(t), uo(n);
  const r = Qo({ ...Go(), ...t });
  r && Bn(Ko, r);
}
function Vn(e) {
  rc(
    () => O(e)
  );
}
function ic(e) {
  if (!so() || Vt("events")) return;
  const t = e(), n = t.event_type;
  uo(n);
  const r = Go(), o = Qo({ ...r, ...t });
  if (!o) return;
  const i = r.session_id + ":" + r.view_url_path;
  Ps(Ko, i, o);
}
function sc() {
  ac(), dc(), yc(), vc(), Lc(), Cc(), Ic(), Rc(), Mc(), pc();
}
function ac() {
  const e = (n) => {
    O(() => {
      var i, s, c;
      const r = n.message ?? "", o = typeof ((i = n.error) == null ? void 0 : i.message) == "string" ? n.error.message : r;
      return {
        event_type: "error",
        error_message: Xt(r),
        error_type: ((s = n.error) == null ? void 0 : s.name) ?? "Error",
        error_stack: Qr(
          ((c = n.error) == null ? void 0 : c.stack) ?? "",
          o
        ),
        error_source: "source"
      };
    });
  }, t = (n) => Zo(n.reason);
  window.addEventListener("error", e), window.addEventListener(
    "unhandledrejection",
    t
  ), Ln = !0, U.push(() => {
    window.removeEventListener("error", e), window.removeEventListener(
      "unhandledrejection",
      t
    ), Ln = !1;
  });
}
let Ln = !1;
const xr = /* @__PURE__ */ new WeakSet();
function Zo(e) {
  if (e !== null && typeof e == "object") {
    if (xr.has(e)) return;
    xr.add(e);
  }
  O(() => {
    const t = (e == null ? void 0 : e.message) ?? String(e);
    return {
      event_type: "error",
      error_message: Xt(t),
      error_type: (e == null ? void 0 : e.name) ?? "UnhandledRejection",
      error_stack: Qr((e == null ? void 0 : e.stack) ?? "", t),
      error_source: "promise"
    };
  });
}
let Or = !1;
function Yc() {
  const e = globalThis.Zone;
  if (Or || !e || typeof e.__symbol__ != "function")
    return;
  Or = !0;
  const t = e.__symbol__("unhandledPromiseRejectionHandler"), n = e[t];
  e[t] = function(r) {
    if (Ln)
      try {
        Zo(
          r && typeof r == "object" && "rejection" in r && "promise" in r ? r.rejection : r
        );
      } catch {
      }
    if (typeof n == "function")
      return n.call(this, r);
  };
}
function cc(e) {
  return e instanceof Error || typeof e == "object" && e !== null && typeof e.message == "string" && typeof e.name == "string" && "stack" in e;
}
const $e = 8192;
function uc(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${$e} bytes omitted]`;
}
function lc(e) {
  if (typeof e == "string") return e;
  if (cc(e))
    return e.message ? `${e.name}: ${e.message}` : e.name;
  if (Ut(
    e,
    $e + 1
  ) > $e)
    return uc(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function fc(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= $e) break;
    t && (t += " "), t += lc(n);
  }
  return t.length > $e ? t.slice(0, $e) + "… [truncated]" : t;
}
function dc() {
  for (const e of wi()) {
    const t = console[e], n = (...r) => {
      try {
        const o = Xt(fc(r));
        O(() => ({
          event_type: "console",
          console_level: e,
          console_message: o
        }));
      } catch {
      }
      t.apply(console, r);
    };
    n[Gr] = t, console[e] = n, U.push(() => {
      console[e] = t;
    });
  }
}
const S = {};
let ye = null, Ot = 0, Pr = "";
function ei() {
  const e = JSON.stringify(S);
  if (e === Pr) return;
  Pr = e, Ot = 0;
  const t = S.page_load_ms || S.lcp || S.dom_complete_ms || 0, n = t > 0;
  ic(() => ({
    event_type: n ? "page_load" : "view",
    page_load_ms: t,
    lcp_ms: S.lcp ?? 0,
    fid_ms: S.fid ?? 0,
    inp_ms: S.inp ?? 0,
    cls: S.cls ?? 0,
    fcp_ms: S.fcp ?? 0,
    ttfb_ms: S.ttfb ?? 0,
    dns_ms: S.dns_ms ?? 0,
    connect_ms: S.connect_ms ?? 0,
    dom_interactive_ms: S.dom_interactive_ms ?? 0,
    dom_complete_ms: S.dom_complete_ms ?? 0
  }));
}
function de() {
  const e = Date.now();
  Ot || (Ot = e);
  const t = e - Ot, n = Math.max(0, 5e3 - t);
  ye && clearTimeout(ye), ye = setTimeout(() => {
    ye = null, ei();
  }, n);
}
function pc() {
  if (typeof document > "u") return;
  const e = () => {
    document.visibilityState === "hidden" && (ye && (clearTimeout(ye), ye = null), ei());
  };
  document.addEventListener(
    "visibilitychange",
    e
  ), U.push(() => {
    document.removeEventListener(
      "visibilitychange",
      e
    );
  });
}
const Mn = "oodle_rum_tab_hidden";
function Ur(e) {
  try {
    e ? sessionStorage.setItem(Mn, "1") : sessionStorage.removeItem(Mn);
  } catch {
  }
}
function hc() {
  try {
    return sessionStorage.getItem(Mn) === "1";
  } catch {
    return !1;
  }
}
function mc() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && hc() && (Ur(!1), O(() => ({
    event_type: "visibility",
    action_type: "tab_visible"
  })));
  let e = document.visibilityState === "hidden";
  const t = () => {
    const n = document.visibilityState === "hidden";
    n !== e && (e = n, Ur(n), O(() => ({
      event_type: "visibility",
      action_type: n ? "tab_hidden" : "tab_visible"
    })), n || re());
  };
  document.addEventListener(
    "visibilitychange",
    t
  ), U.push(() => {
    document.removeEventListener(
      "visibilitychange",
      t
    );
  });
}
function yc() {
  Js((e) => {
    S.lcp = e.value, de();
  }), ea((e) => {
    S.fid = e.value, de();
  }), Ws((e) => {
    S.inp = e.value, de();
  }), $s((e) => {
    S.cls = e.value, de();
  }), xo((e) => {
    S.fcp = e.value, de();
  }), Ks((e) => {
    S.ttfb = e.value, de();
  });
}
function Wn(e) {
  const t = P().endpoint;
  return e.startsWith(t);
}
function vc() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || Wn(r.name))
          continue;
        const i = pt(r.name), s = r.duration, c = r.transferSize ?? 0, a = o;
        Vn(
          () => ({
            event_type: "resource",
            resource_url: i,
            resource_method: "",
            resource_duration_ms: s,
            resource_size: c,
            resource_type: a
          })
        );
      }
    }
  );
  if (e.observe({
    type: "resource",
    buffered: !0
  }), U.push(() => e.disconnect()), typeof performance < "u") {
    const t = () => {
      performance.clearResourceTimings();
    };
    performance.addEventListener(
      "resourcetimingbufferfull",
      t
    ), U.push(() => {
      performance.removeEventListener(
        "resourcetimingbufferfull",
        t
      );
    });
  }
}
function jt(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function gc(e) {
  try {
    return new URL(e, location.href).href;
  } catch {
    return e;
  }
}
function un(e, t, n) {
  return n.some(
    (r) => typeof r == "string" ? e.startsWith(r) || t.startsWith(r) : r.test(e) || r.test(t)
  );
}
function ti(e) {
  const t = gc(e), n = P();
  let r = !1;
  const o = n.allowedTracingUrls;
  o && o.length > 0 && (r = un(
    t,
    e,
    o
  ));
  let i = null;
  const s = n.forwardNetworkBodies;
  s && un(
    t,
    e,
    s.urls
  ) && (i = s);
  let c = !1;
  const a = n.forwardNetworkHeaders;
  return a && (c = un(
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
let Nr = null, Hr = Bo(void 0);
function ft(e) {
  const t = P().redactHeaders;
  return t !== Nr && (Nr = t, Hr = Bo(t)), Hr(e);
}
function _c(e) {
  const t = {};
  for (const n of Object.keys(e)) {
    const r = n.toLowerCase();
    ft(r) || (t[r] = e[n]);
  }
  return t;
}
const Fr = [
  "request_headers",
  "response_headers",
  "request_body",
  "response_body"
];
let Dr = !1;
function ni(e) {
  return !!e && (typeof e == "object" || typeof e == "function") && typeof e.then == "function";
}
function Br(e) {
  if (!(typeof e != "string" || !e))
    try {
      const t = JSON.parse(e);
      return t && typeof t == "object" ? t : void 0;
    } catch {
      return;
    }
}
function qr(e) {
  if (!e || typeof e != "object") return "";
  const t = {};
  for (const [n, r] of Object.entries(e))
    r != null && (t[n.toLowerCase()] = String(r));
  return Object.keys(t).length > 0 ? JSON.stringify(t) : "";
}
let $r = null, zr = qo(void 0);
function wc() {
  const e = P().redactBodyKeys;
  return e !== $r && ($r = e, zr = qo(e)), zr;
}
function Ec(e) {
  var c;
  if (!Fr.some((a) => e[a])) return;
  for (const a of ["request_body", "response_body"])
    typeof e[a] == "string" && e[a] && (e[a] = ua(e[a], wc()));
  const t = P().beforeSendNetwork;
  if (typeof t != "function") return;
  const n = {
    url: String(e.resource_url ?? ""),
    method: String(e.resource_method ?? ""),
    status: Number(e.resource_status ?? 0),
    requestHeaders: Br(e.request_headers),
    responseHeaders: Br(e.response_headers),
    requestBody: typeof e.request_body == "string" ? e.request_body : void 0,
    responseBody: typeof e.response_body == "string" ? e.response_body : void 0
  };
  let r;
  try {
    const a = t(n);
    if (ni(a))
      throw new Error("it returned a promise; it must be synchronous");
    r = a === void 0 ? n : a;
  } catch (a) {
    Dr || (Dr = !0, xn(
      `beforeSendNetwork failed. Captured headers and bodies are dropped until it is fixed: ${String(a)}`
    )), r = null;
  }
  for (const a of Fr) delete e[a];
  if (!r || typeof r != "object") return;
  const o = ((c = P().forwardNetworkBodies) == null ? void 0 : c.maxBodySize) ?? 65536, i = qr(r.requestHeaders), s = qr(r.responseHeaders);
  i && (e.request_headers = i), s && (e.response_headers = s), typeof r.requestBody == "string" && r.requestBody && (e.request_body = ue(r.requestBody, o)), typeof r.responseBody == "string" && r.responseBody && (e.response_body = ue(r.responseBody, o));
}
function ri(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      ft(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      ft(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      ft(r) || (t[r] = e[n]);
    }
  return t;
}
function Sc(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    ft(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function ue(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function Tc(e, t) {
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
function bc(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function Ac(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      ri(
        e
      )
    );
  } catch {
    return "";
  }
}
function jr(e) {
  try {
    return JSON.stringify(
      ri(e)
    );
  } catch {
    return "";
  }
}
function oi(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function kc(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: ue(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: ue(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : oi(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => ue(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function ii(e, t, n) {
  const r = function(o, i) {
    const s = bc(o);
    if (Wn(s))
      return t.apply(e, [
        o,
        i
      ]);
    const c = oi(o), a = ((i == null ? void 0 : i.method) ?? (c ? o.method : "GET")).toUpperCase(), l = performance.now(), u = ti(s);
    let f = "", d = "";
    if (n.injectTracing) {
      const w = $o();
      if (w)
        f = w.traceId, d = w.spanId;
      else if (u.trace) {
        f = jt(16), d = jt(8);
        const b = new Headers(
          (i == null ? void 0 : i.headers) ?? {}
        );
        b.set(
          "traceparent",
          `00-${f}-${d}-01`
        ), i = { ...i, headers: b };
      }
    }
    let v = "", h = null;
    if (u.bodyCfg) {
      const w = u.bodyCfg.maxBodySize ?? 65536, b = kc(
        i,
        o,
        w
      );
      v = b.sync, h = b.asyncP;
    }
    let _ = "";
    return u.captureHeaders && (i != null && i.headers ? _ = Ac(
      i.headers
    ) : c && (_ = jr(
      o.headers
    ))), t.apply(e, [o, i]).then((w) => {
      const b = w.status, R = Math.round(
        performance.now() - l
      );
      let I = "";
      u.captureHeaders && (I = jr(
        w.headers
      ));
      const A = (k) => {
        const g = {
          event_type: "resource",
          resource_url: pt(s),
          resource_method: a,
          resource_status: b,
          resource_duration_ms: R,
          resource_size: 0,
          resource_type: "fetch"
        };
        return f && (g.trace_id = f, g.span_id = d), k && (g.request_body = k), _ && (g.request_headers = _), I && (g.response_headers = I), g;
      }, E = h || Promise.resolve(v);
      if (u.bodyCfg) {
        const k = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          E,
          Tc(
            w.clone(),
            k
          ).catch(() => "")
        ]).then(([g, y]) => {
          O(() => {
            const p = A(g);
            return y && (p.response_body = y), p;
          });
        }).catch(() => {
          E.then((g) => {
            O(
              () => A(g)
            );
          });
        });
      } else
        E.then((k) => {
          O(() => A(k));
        });
      return w;
    }).catch((w) => {
      const b = Math.round(
        performance.now() - l
      );
      throw (h || Promise.resolve(v)).then((I) => {
        O(() => {
          const A = {
            event_type: "resource",
            resource_url: pt(s),
            resource_method: a,
            resource_status: 0,
            resource_duration_ms: b,
            resource_size: 0,
            resource_type: "fetch"
          };
          return f && (A.trace_id = f, A.span_id = d), I && (A.request_body = I), _ && (A.request_headers = _), A;
        });
      }), w;
    });
  };
  return e.fetch = r, () => {
    e.fetch = t;
  };
}
function si(e, t, n) {
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
    if (Wn(c))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const a = ti(c);
    let l = "", u = "";
    if (n.injectTracing) {
      const E = $o();
      E ? (l = E.traceId, u = E.spanId) : a.trace && (l = jt(16), u = jt(8), i.call(
        this,
        "traceparent",
        `00-${l}-${u}-01`
      ));
    }
    let f = "";
    if (a.bodyCfg && s) {
      const E = a.bodyCfg.maxBodySize ?? 65536;
      typeof s == "string" ? f = ue(
        s,
        E
      ) : typeof URLSearchParams < "u" && s instanceof URLSearchParams && (f = ue(
        s.toString(),
        E
      ));
    }
    let d = "";
    if (a.captureHeaders)
      try {
        const E = this.__oodleReqHeaders, k = E ? _c(E) : {};
        Object.keys(k).length > 0 && (d = JSON.stringify(k));
      } catch {
      }
    const v = performance.now(), h = this, _ = l, w = u, b = f, R = a.bodyCfg, I = d, A = a.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        const E = Math.round(
          performance.now() - v
        ), k = h.__oodleMethod ?? "GET";
        O(() => {
          const g = {
            event_type: "resource",
            resource_url: pt(c),
            resource_method: k,
            resource_status: h.status,
            resource_duration_ms: E,
            resource_size: 0,
            resource_type: "xhr"
          };
          if (_ && (g.trace_id = _, g.span_id = w), b && (g.request_body = b), R)
            try {
              const y = h.responseText ?? "";
              g.response_body = ue(
                y,
                R.maxBodySize ?? 65536
              );
            } catch {
            }
          if (I && (g.request_headers = I), A)
            try {
              const y = h.getAllResponseHeaders();
              y && (g.response_headers = JSON.stringify(
                Sc(y)
              ));
            } catch {
            }
          return g;
        });
      }
    ), o.apply(this, [s]);
  }, () => {
    e.open = r, e.send = o, e.setRequestHeader = i;
  };
}
const ai = {
  injectTracing: !0
}, Xr = {
  injectTracing: !1
};
function Cc() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = ii(
    window,
    window.fetch,
    ai
  );
  U.push(e);
}
function Ic() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = si(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    ai
  );
  U.push(e);
}
const Yr = /* @__PURE__ */ new WeakSet();
function ln(e) {
  if (Yr.has(e)) return;
  Yr.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (ii(
        n,
        n.fetch,
        Xr
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (si(
        r.prototype,
        r.prototype.setRequestHeader,
        Xr
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), U.push(() => {
    e.removeEventListener("load", t);
  });
}
function Rc() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach(ln);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          r instanceof HTMLIFrameElement && ln(r), r instanceof HTMLElement && r.childElementCount > 0 && r.querySelectorAll("iframe").forEach(ln);
    }
  );
  e.observe(document.documentElement, {
    childList: !0,
    subtree: !0
  }), U.push(() => {
    e.disconnect();
  });
}
function Lc() {
  if (typeof window > "u" || typeof PerformanceObserver > "u")
    return;
  const e = () => {
    const r = performance.getEntriesByType(
      "navigation"
    )[0];
    r && (S.page_load_ms = Math.round(
      r.loadEventEnd - r.startTime
    ), S.dns_ms = Math.round(
      r.domainLookupEnd - r.domainLookupStart
    ), S.connect_ms = Math.round(
      r.connectEnd - r.connectStart
    ), S.tls_ms = Math.round(
      r.secureConnectionStart > 0 ? r.connectEnd - r.secureConnectionStart : 0
    ), S.ttfb = Math.round(
      r.responseStart - r.requestStart
    ), S.download_ms = Math.round(
      r.responseEnd - r.responseStart
    ), S.dom_interactive_ms = Math.round(
      r.domInteractive - r.startTime
    ), S.dom_complete_ms = Math.round(
      r.domComplete - r.startTime
    ), de());
  };
  let t = 0;
  const n = () => {
    t++;
    const r = performance.getEntriesByType(
      "navigation"
    )[0];
    r && r.loadEventEnd > 0 ? e() : t < 50 && setTimeout(n, 200);
  };
  document.readyState === "complete" ? setTimeout(n, 100) : window.addEventListener("load", () => {
    setTimeout(n, 100);
  });
}
function Mc() {
  if (!(typeof PerformanceObserver > "u") && !xc())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            Vn(() => ({
              event_type: "long_task",
              long_task_duration_ms: r
            }));
          }
        }
      );
      e.observe({
        type: "longtask",
        buffered: !0
      }), U.push(
        () => e.disconnect()
      );
    } catch {
    }
}
function xc() {
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
          Vn(() => ({
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
    }), U.push(
      () => e.disconnect()
    ), !0;
  } catch {
    return !1;
  }
}
function fn() {
  O(() => ({
    event_type: "view"
  }));
}
function bt(e, t, n, r, o, i, s) {
  O(() => {
    const c = {
      event_type: "action",
      action_type: e,
      action_target: t,
      action_selector: n,
      action_text: r,
      is_frustration: o ? 1 : 0
    };
    return i !== void 0 && (c.click_x = i, c.click_y = s, c.viewport_width = window.innerWidth, c.viewport_height = window.innerHeight), c;
  });
}
function Oc(e, t) {
  O(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function Pc() {
  const e = navigator.userAgent;
  return /Mobi|Android/i.test(e) ? "mobile" : /Tablet|iPad/i.test(e) ? "tablet" : "desktop";
}
function Uc() {
  const e = navigator.userAgent;
  return e.includes("Firefox") ? "Firefox" : e.includes("Edg/") ? "Edge" : e.includes("Chrome") ? "Chrome" : e.includes("Safari") ? "Safari" : "Other";
}
function Nc() {
  const e = navigator.userAgent;
  return e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : e.includes("Android") ? "Android" : /iPhone|iPad|iPod/.test(e) ? "iOS" : "Other";
}
function Hc() {
  for (const e of U)
    e();
  U = [];
}
const Vr = typeof MutationObserver < "u" ? MutationObserver : null;
let fe = !1, At = null, kt = null, dt = null, Pt = null;
const Vc = {
  init(e) {
    fe || Pi(e) && (Ji(e.tags), Bi(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), fe = !0, mc(), dr(), $i(), ts(), Ns(() => {
      dr();
    }), e.sessionReplay !== !1 && ao() && Ja(), sc(), At = Fc(), kt = Dc(), e.openTelemetry && import("./tracing-SZUDpj1z.js").then(
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
    Gi(e);
  },
  identify(e) {
    ji(e);
  },
  trackEvent(e, t) {
    fe && Oc(e, t);
  },
  addFeatureFlag(e, t) {
    Fs(e, t);
  },
  getSessionId() {
    return fe ? ne() : "";
  },
  getUserId() {
    return lo();
  },
  flush() {
    fe && re();
  },
  stop() {
    fe && (Qa(), Hc(), ns(), co(), re(!0), Bs(), Hs(), At && (At(), At = null), kt && (kt(), kt = null), et(), fe = !1);
  }
};
function Fc() {
  if (typeof window > "u") return null;
  const e = history.pushState;
  history.pushState = function(...r) {
    e.apply(this, r), fn();
  };
  const t = history.replaceState;
  history.replaceState = function(...r) {
    t.apply(this, r), fn();
  };
  const n = () => fn();
  return window.addEventListener(
    "popstate",
    n
  ), () => {
    history.pushState = e, history.replaceState = t, window.removeEventListener(
      "popstate",
      n
    );
  };
}
function et() {
  dt && (dt.disconnect(), dt = null), Pt && (clearTimeout(Pt), Pt = null);
}
function Dc() {
  if (typeof document > "u")
    return null;
  const e = 3, t = 1e3, n = 1e3;
  let r = [];
  const o = (s) => {
    var R;
    const c = s.target;
    if (!c) return;
    const a = $c(c), l = ((R = c.tagName) == null ? void 0 : R.toLowerCase()) ?? "", u = Bc(c), f = u === null && xi(c), d = u ?? (f ? "" : (c.textContent ?? "").trim().slice(0, 200)), v = u !== null ? `${l}[${u}]` : qc(c, l, d, f), h = Date.now(), _ = s.clientX, w = s.clientY;
    if (r.push({ selector: a, time: h }), r = r.filter(
      (I) => h - I.time < t
    ), r.filter(
      (I) => I.selector === a
    ).length >= e) {
      bt(
        "rage_click",
        v,
        a,
        d,
        !0,
        _,
        w
      ), r = [];
      return;
    }
    i(
      c,
      v,
      a,
      d,
      _,
      w
    );
  };
  document.addEventListener("click", o, {
    capture: !0,
    passive: !0
  });
  function i(s, c, a, l, u, f) {
    var h;
    const d = ((h = s.tagName) == null ? void 0 : h.toLowerCase()) ?? "";
    if (!(d === "a" || d === "button" || d === "input" || d === "select" || d === "textarea" || s.hasAttribute("onclick") || s.getAttribute("role") === "button" || s.closest("a, button") !== null)) {
      bt(
        "click",
        c,
        a,
        l,
        !1,
        u,
        f
      );
      return;
    }
    et(), Vr && (dt = new Vr(() => {
      et(), bt(
        "click",
        c,
        a,
        l,
        !1,
        u,
        f
      );
    }), dt.observe(
      document.body,
      {
        childList: !0,
        subtree: !0
      }
    ), Pt = setTimeout(() => {
      et(), bt(
        "dead_click",
        c,
        a,
        l,
        !1,
        u,
        f
      );
    }, n));
  }
  return () => {
    document.removeEventListener(
      "click",
      o,
      { capture: !0 }
    ), et();
  };
}
const Wr = "data-oodle-action-name";
function Bc(e) {
  var t;
  try {
    const n = typeof e.closest == "function" ? e.closest(`[${Wr}]`) : null, r = (t = n == null ? void 0 : n.getAttribute(Wr)) == null ? void 0 : t.trim();
    return r ? r.slice(0, 200) : null;
  } catch {
    return null;
  }
}
function qc(e, t, n, r = !1) {
  if (r) return Jr(e, t);
  const o = e.getAttribute("aria-label");
  if (o)
    return `${t}[${o}]`;
  const i = e.getAttribute("title");
  if (i) return `${t}[${i}]`;
  const s = n.split(`
`)[0].trim();
  return s && s.length <= 80 ? `${t}[${s}]` : Jr(e, t);
}
function Jr(e, t) {
  if (e.id) return `${t}#${e.id}`;
  const n = Array.from(
    e.classList ?? []
  ).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
function $c(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(
    e.classList ?? []
  ).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
export {
  Vc as O,
  jc as a,
  Yc as c,
  zc as r,
  Xc as s
};
