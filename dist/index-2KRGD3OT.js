const At = [
  "error",
  "warn"
];
function No() {
  return {
    patterns: [],
    maskFn: null,
    referrer: "path",
    consoleLevels: At,
    messages: "full",
    actionText: "full",
    userAgent: "full",
    queryStrings: "events",
    userInfo: "full",
    keepParams: []
  };
}
let I = No();
const Zt = "/:redacted", Ho = 256, Qe = /* @__PURE__ */ new Map();
let ln = !1;
function ge(e) {
  console.warn("[@oodle-ai/rum] " + e);
}
function Ae(e, t, n, r, o) {
  return t === void 0 ? r : typeof t == "string" && n.includes(t) ? t : (ge(
    `${e} must be one of ${n.map((i) => `'${i}'`).join(", ")}. Using '${o}'.`
  ), o);
}
function Bo(e) {
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
function qo(e) {
  if (e === void 0) return [];
  if (!Array.isArray(e))
    return ge(
      "urlPathPatterns must be an array of path patterns such as '/projects/:id'. It is ignored."
    ), [];
  const t = [];
  for (const n of e) {
    const r = Bo(n);
    r ? t.push(r) : ge(
      `urlPathPatterns: ${JSON.stringify(n)} is not a valid pattern. Patterns start with '/', use ':name' for one segment and may end in '/*'. It is ignored.`
    );
  }
  return t;
}
function zo(e) {
  if (e === void 0) return At;
  if (!Array.isArray(e))
    return ge(
      "consoleLevels must be an array such as ['error']. Console capture is off."
    ), [];
  const t = At.filter(
    (n) => e.includes(n)
  );
  return e.some(
    (n) => !At.includes(n)
  ) && ge(
    "consoleLevels accepts only 'error' and 'warn'. Other values are ignored."
  ), t;
}
function Xo(e) {
  Qe.clear(), ln = !1;
  const t = e.maskUrlPath;
  t !== void 0 && typeof t != "function" && ge("maskUrlPath must be a function. It is ignored."), I = {
    patterns: qo(e.urlPathPatterns),
    maskFn: typeof t == "function" ? t : null,
    referrer: Ae(
      "referrerUrl",
      e.referrerUrl,
      ["path", "origin", "none"],
      "path",
      "none"
    ),
    consoleLevels: zo(
      e.consoleLevels
    ),
    messages: Ae(
      "errorMessages",
      e.errorMessages,
      ["full", "scrub", "none"],
      "full",
      "none"
    ),
    // Text the replay masks must not reappear in click events.
    actionText: Ae(
      "actionText",
      e.actionText,
      ["full", "mask"],
      e.privacyLevel === "mask" ? "mask" : "full",
      "mask"
    ),
    userAgent: Ae(
      "userAgent",
      e.userAgent,
      ["full", "none"],
      "full",
      "none"
    ),
    queryStrings: Ae(
      "stripQueryStrings",
      e.stripQueryStrings,
      ["events", "all"],
      "events",
      "all"
    ),
    userInfo: Ae(
      "userInfo",
      e.userInfo,
      ["full", "id", "none"],
      "full",
      "none"
    ),
    keepParams: Array.isArray(e.viewUrlQueryParams) ? e.viewUrlQueryParams : []
  };
}
function Mn() {
  return I.patterns.length > 0 || I.maskFn !== null;
}
function $o(e) {
  const t = e.split("/").slice(1), n = t.length > 0 && t[t.length - 1] === "";
  n && t.pop();
  for (const r of I.patterns) {
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
function Yo(e) {
  let t = I.patterns.length > 0 ? $o(e) : e;
  if (I.maskFn)
    try {
      const n = I.maskFn(t);
      t = typeof n == "string" ? n : Zt;
    } catch (n) {
      ln || (ln = !0, ge(
        `maskUrlPath threw. Paths are sent as '${Zt}' until it is fixed: ${String(n)}`
      )), t = Zt;
    }
  return t;
}
function qe(e) {
  if (!Mn()) return e;
  const t = Qe.get(e);
  if (t !== void 0) return t;
  const n = Yo(e);
  return Qe.size >= Ho && Qe.clear(), Qe.set(e, n), n;
}
function Vo(e) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(e);
}
function ft(e, t) {
  if (Vo(e)) {
    let n;
    try {
      n = new URL(e);
    } catch {
      return e;
    }
    return n.protocol !== "http:" && n.protocol !== "https:" ? n.protocol === "data:" ? "data:" : n.origin + n.pathname : n.origin + qe(n.pathname);
  }
  try {
    const n = new URL(
      e,
      t ?? (typeof location < "u" ? location.href : "http://localhost/")
    );
    return qe(n.pathname);
  } catch {
    const n = e.search(/[?#]/);
    return n >= 0 ? e.slice(0, n) : e;
  }
}
function Or(e) {
  return !Mn() || typeof e != "string" ? e : Ln(e, (t) => t.search + t.hash);
}
function rc() {
  return Mn() || I.queryStrings === "all";
}
function Wo(e) {
  return I.queryStrings !== "all" ? Or(e) : typeof e != "string" ? e : Ln(e, (t) => {
    const n = I.keepParams;
    if (n.length === 0 || !t.search) return "";
    const r = new URLSearchParams();
    t.searchParams.forEach((i, s) => {
      n.includes(s) && r.append(s, i);
    });
    const o = r.toString();
    return o ? "?" + o : "";
  });
}
function oc(e) {
  return I.queryStrings !== "all" ? Or(e) : typeof e != "string" ? e : Ln(e, () => "");
}
function Ln(e, t) {
  let n;
  try {
    n = new URL(e);
  } catch {
    return e;
  }
  return n.protocol !== "http:" && n.protocol !== "https:" ? e : n.origin + qe(n.pathname) + t(n);
}
let jn = null, Gn = "", Jn = null;
function jo(e) {
  if (e === jn && Jn === I)
    return Gn;
  let t = "";
  if (e && I.referrer !== "none")
    try {
      const n = new URL(e);
      t = I.referrer === "origin" ? n.origin : n.origin + qe(n.pathname);
    } catch {
      t = I.referrer === "origin" ? "" : e;
    }
  return jn = e, Gn = t, Jn = I, t;
}
function Go() {
  return I.consoleLevels;
}
function Jo() {
  return I.userAgent === "full";
}
function Qo(e, t, n) {
  switch (I.userInfo) {
    case "full":
      return { user_id: e, user_name: t, user_email: n };
    case "id":
      return { user_id: e, user_name: "", user_email: "" };
    default:
      return { user_id: "", user_name: "", user_email: "" };
  }
}
const Ko = [
  [/(^|[^\w])'(?:[^'\\\n]|\\.){0,500}'/g, "$1'?'"],
  [/(^|[^\w])"(?:[^"\\\n]|\\.){0,500}"/g, '$1"?"'],
  [/(^|[^\w])`(?:[^`\\\n]|\\.){0,500}`/g, "$1`?`"]
], Zo = /\bhttps?:\/\/[^\s'"`<>()\]]+/g, ei = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, ti = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, ni = /\b(?=[0-9a-fA-F]*\d)(?=[0-9a-fA-F]*[a-fA-F])[0-9a-fA-F]{16,}\b/g, ri = /\d{4,}/g;
function oi(e) {
  if (!e) return e;
  let t = e.replace(ei, "<email>");
  t = t.replace(Zo, (n) => {
    const r = ft(n);
    return r === n ? "<url>" : r;
  });
  for (const [n, r] of Ko)
    t = t.replace(n, r);
  return t = t.replace(ti, "<id>"), t = t.replace(ni, "<id>"), t = t.replace(ri, "<n>"), t;
}
const ii = /^\s+at |^[^\s@]*@\S+:\d+(?::\d+)?$/m;
function Pt(e) {
  switch (I.messages) {
    case "full":
      return e;
    case "scrub":
      return oi(e);
    default:
      return "";
  }
}
function Qn(e, t) {
  if (I.messages === "full" || !e || !t) return e;
  const n = ii.exec(e), r = n ? n.index : e.length, o = e.indexOf(t);
  if (o < 0 || o + t.length > r)
    return e;
  const i = Pt(t);
  let s = e.slice(0, o) + i;
  return i || (s = s.replace(/:\s*$/, "")), s + e.slice(o + t.length);
}
const Pr = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', Ur = '[data-oodle-privacy="mask"],.oodle-privacy-mask', si = Pr + "," + Ur + ",.rr-block,.rr-mask";
function ai(e) {
  if (I.actionText === "mask") return !0;
  try {
    return typeof e.closest == "function" && e.closest(si) !== null;
  } catch {
    return !0;
  }
}
let fn = null;
function ci(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function ui(e) {
  if (!ci(e.endpoint))
    return console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    ), !1;
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  );
  const t = li(
    e.viewUrlQueryParams
  );
  return Xo({ ...e, viewUrlQueryParams: t }), fn = { ...e, viewUrlQueryParams: t }, !0;
}
function li(e) {
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
function re() {
  if (!fn)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return fn;
}
const Fr = "__oodle_session", fi = 1800 * 1e3, di = 14400 * 1e3;
function pi() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
function mi() {
  try {
    const e = sessionStorage.getItem(Fr);
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
function Dr(e) {
  try {
    sessionStorage.setItem(
      Fr,
      JSON.stringify(e)
    );
  } catch {
  }
}
let Me = null;
function Nr(e) {
  Me || (Me = setTimeout(() => {
    Me = null, Dr(e);
  }, 1e3));
}
function kn(e) {
  Me && (clearTimeout(Me), Me = null), Dr(e);
}
let h = null, Hr = 100, Br = 100;
function hi(e, t) {
  Hr = Math.max(
    0,
    Math.min(100, e)
  ), Br = Math.max(
    0,
    Math.min(100, t)
  );
}
function Kn(e) {
  return Math.random() * 100 < e;
}
function te() {
  const e = Date.now();
  if (h || (h = mi()), !h || e - h.lastActivity > fi || e - h.createdAt > di) {
    const t = Kn(Hr);
    h = {
      id: pi(),
      createdAt: e,
      lastActivity: e,
      viewCount: 0,
      errorCount: 0,
      actionCount: 0,
      sampled: t,
      replaySampled: t && Kn(Br),
      replaySegmentSeq: 0
    }, kn(h);
  } else
    h.lastActivity = e, Nr(h);
  return h.id;
}
function vi() {
  if (te(), !h) return 0;
  const e = h.replaySegmentSeq;
  return h.replaySegmentSeq = e + 1, kn(h), e;
}
function qr() {
  return te(), (h == null ? void 0 : h.sampled) ?? !0;
}
function zr() {
  return te(), (h == null ? void 0 : h.replaySampled) ?? !0;
}
let et = null;
function yi() {
  typeof document > "u" || (Xr(), et = () => {
    document.visibilityState === "hidden" && h && kn(h);
  }, document.addEventListener(
    "visibilitychange",
    et
  ));
}
function Xr() {
  et && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    et
  ), et = null);
}
function $r(e) {
  te(), h && (e === "view" || e === "page_load" ? h.viewCount++ : e === "error" ? h.errorCount++ : e === "action" && h.actionCount++, Nr(h));
}
function gi() {
  return te(), {
    viewCount: (h == null ? void 0 : h.viewCount) ?? 0,
    errorCount: (h == null ? void 0 : h.errorCount) ?? 0,
    actionCount: (h == null ? void 0 : h.actionCount) ?? 0
  };
}
let $ = null;
function _i(e) {
  $ = e;
}
function Yr() {
  return ($ == null ? void 0 : $.id) ?? "";
}
function wi() {
  return ($ == null ? void 0 : $.name) ?? "";
}
function Ei() {
  return ($ == null ? void 0 : $.email) ?? "";
}
function Ti() {
  return $ ? "identified" : "anonymous";
}
const Si = 5e5;
function Ut(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > Si) return n;
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
let dt = {};
function bi(e) {
  e && (dt = { ...e, ...dt });
}
function Ai(e) {
  dt = { ...dt, ...e };
}
function Ii() {
  return dt;
}
const Ci = 6e4, Mi = "sdk_telemetry", Le = {
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
  Le[e] += t;
}
function Li() {
  for (const e in Le)
    if (Le[e] > 0)
      return !0;
  return !1;
}
function dn() {
  if (!Li()) return;
  const e = { ...Le };
  for (const t in Le)
    Le[t] = 0;
  Un(Mi, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let tt = null, nt = null;
function ki() {
  tt || (tt = setInterval(
    dn,
    Ci
  ), typeof document < "u" && (nt = () => {
    document.visibilityState === "hidden" && dn();
  }, document.addEventListener(
    "visibilitychange",
    nt
  )));
}
function Ri() {
  tt && (clearInterval(tt), tt = null), nt && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    nt
  ), nt = null), dn();
}
var N = Uint8Array, D = Uint16Array, Rn = Int32Array, xn = new N([
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
]), On = new N([
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
]), Zn = new N([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Vr = function(e, t) {
  for (var n = new D(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new Rn(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, Wr = Vr(xn, 2), xi = Wr.b, pn = Wr.r;
xi[28] = 258, pn[258] = 28;
var Oi = Vr(On, 0), er = Oi.r, mn = new D(32768);
for (var b = 0; b < 32768; ++b) {
  var ie = (b & 43690) >> 1 | (b & 21845) << 1;
  ie = (ie & 52428) >> 2 | (ie & 13107) << 2, ie = (ie & 61680) >> 4 | (ie & 3855) << 4, mn[b] = ((ie & 65280) >> 8 | (ie & 255) << 8) >> 1;
}
var rt = (function(e, t, n) {
  for (var r = e.length, o = 0, i = new D(t); o < r; ++o)
    e[o] && ++i[e[o] - 1];
  var s = new D(t);
  for (o = 1; o < t; ++o)
    s[o] = s[o - 1] + i[o - 1] << 1;
  var c;
  if (n) {
    c = new D(1 << t);
    var a = 15 - t;
    for (o = 0; o < r; ++o)
      if (e[o])
        for (var l = o << 4 | e[o], u = t - e[o], f = s[e[o] - 1]++ << u, d = f | (1 << u) - 1; f <= d; ++f)
          c[mn[f] >> a] = l;
  } else
    for (c = new D(r), o = 0; o < r; ++o)
      e[o] && (c[o] = mn[s[e[o] - 1]++] >> 15 - e[o]);
  return c;
}), _e = new N(288);
for (var b = 0; b < 144; ++b)
  _e[b] = 8;
for (var b = 144; b < 256; ++b)
  _e[b] = 9;
for (var b = 256; b < 280; ++b)
  _e[b] = 7;
for (var b = 280; b < 288; ++b)
  _e[b] = 8;
var Ft = new N(32);
for (var b = 0; b < 32; ++b)
  Ft[b] = 5;
var Pi = /* @__PURE__ */ rt(_e, 9, 0), Ui = /* @__PURE__ */ rt(Ft, 5, 0), jr = function(e) {
  return (e + 7) / 8 | 0;
}, Gr = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new N(e.subarray(t, n));
}, J = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, je = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, en = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: Qr, l: 0 };
  if (o == 1) {
    var s = new N(n[0].s + 1);
    return s[n[0].s] = 1, { t: s, l: 1 };
  }
  n.sort(function(w, C) {
    return w.f - C.f;
  }), n.push({ s: -1, f: 25001 });
  var c = n[0], a = n[1], l = 0, u = 1, f = 2;
  for (n[0] = { s: -1, f: c.f + a.f, l: c, r: a }; u != o - 1; )
    c = n[n[l].f < n[f].f ? l++ : f++], a = n[l != u && n[l].f < n[f].f ? l++ : f++], n[u++] = { s: -1, f: c.f + a.f, l: c, r: a };
  for (var d = i[0].s, r = 1; r < o; ++r)
    i[r].s > d && (d = i[r].s);
  var y = new D(d + 1), m = hn(n[u - 1], y, 0);
  if (m > t) {
    var r = 0, _ = 0, T = m - t, S = 1 << T;
    for (i.sort(function(C, g) {
      return y[g.s] - y[C.s] || C.f - g.f;
    }); r < o; ++r) {
      var M = i[r].s;
      if (y[M] > t)
        _ += S - (1 << m - y[M]), y[M] = t;
      else
        break;
    }
    for (_ >>= T; _ > 0; ) {
      var L = i[r].s;
      y[L] < t ? _ -= 1 << t - y[L]++ - 1 : ++r;
    }
    for (; r >= 0 && _; --r) {
      var A = i[r].s;
      y[A] == t && (--y[A], ++_);
    }
    m = t;
  }
  return { t: new N(y), l: m };
}, hn = function(e, t, n) {
  return e.s == -1 ? Math.max(hn(e.l, t, n + 1), hn(e.r, t, n + 1)) : t[e.s] = n;
}, tr = function(e) {
  for (var t = e.length; t && !e[--t]; )
    ;
  for (var n = new D(++t), r = 0, o = e[0], i = 1, s = function(a) {
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
}, Jr = function(e, t, n) {
  var r = n.length, o = jr(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, nr = function(e, t, n, r, o, i, s, c, a, l, u) {
  J(t, u++, n), ++o[256];
  for (var f = en(o, 15), d = f.t, y = f.l, m = en(i, 15), _ = m.t, T = m.l, S = tr(d), M = S.c, L = S.n, A = tr(_), w = A.c, C = A.n, g = new D(19), v = 0; v < M.length; ++v)
    ++g[M[v] & 31];
  for (var v = 0; v < w.length; ++v)
    ++g[w[v] & 31];
  for (var p = en(g, 7), U = p.t, Ee = p.l, F = 19; F > 4 && !U[Zn[F - 1]]; --F)
    ;
  var Te = l + 5 << 3, q = Ge(o, _e) + Ge(i, Ft) + s, z = Ge(o, d) + Ge(i, _) + s + 14 + 3 * F + Ge(g, U) + 2 * g[16] + 3 * g[17] + 7 * g[18];
  if (a >= 0 && Te <= q && Te <= z)
    return Jr(t, u, e.subarray(a, a + l));
  var Y, k, X, oe;
  if (J(t, u, 1 + (z < q)), u += 2, z < q) {
    Y = rt(d, y, 0), k = d, X = rt(_, T, 0), oe = _;
    var Gt = rt(U, Ee, 0);
    J(t, u, L - 257), J(t, u + 5, C - 1), J(t, u + 10, F - 4), u += 14;
    for (var v = 0; v < F; ++v)
      J(t, u + 3 * v, U[Zn[v]]);
    u += 3 * F;
    for (var V = [M, w], We = 0; We < 2; ++We)
      for (var Se = V[We], v = 0; v < Se.length; ++v) {
        var W = Se[v] & 31;
        J(t, u, Gt[W]), u += U[W], W > 15 && (J(t, u, Se[v] >> 5 & 127), u += Se[v] >> 12);
      }
  } else
    Y = Pi, k = _e, X = Ui, oe = Ft;
  for (var v = 0; v < c; ++v) {
    var R = r[v];
    if (R > 255) {
      var W = R >> 18 & 31;
      je(t, u, Y[W + 257]), u += k[W + 257], W > 7 && (J(t, u, R >> 23 & 31), u += xn[W]);
      var be = R & 31;
      je(t, u, X[be]), u += oe[be], be > 3 && (je(t, u, R >> 5 & 8191), u += On[be]);
    } else
      je(t, u, Y[R]), u += k[R];
  }
  return je(t, u, Y[256]), u + k[256];
}, Fi = /* @__PURE__ */ new Rn([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Qr = /* @__PURE__ */ new N(0), Di = function(e, t, n, r, o, i) {
  var s = i.z || e.length, c = new N(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = c.subarray(r, c.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (a[0] = i.r >> 3);
    for (var f = Fi[t - 1], d = f >> 13, y = f & 8191, m = (1 << n) - 1, _ = i.p || new D(32768), T = i.h || new D(m + 1), S = Math.ceil(n / 3), M = 2 * S, L = function(Kt) {
      return (e[Kt] ^ e[Kt + 1] << S ^ e[Kt + 2] << M) & m;
    }, A = new Rn(25e3), w = new D(288), C = new D(32), g = 0, v = 0, p = i.i || 0, U = 0, Ee = i.w || 0, F = 0; p + 2 < s; ++p) {
      var Te = L(p), q = p & 32767, z = T[Te];
      if (_[q] = z, T[Te] = q, Ee <= p) {
        var Y = s - p;
        if ((g > 7e3 || U > 24576) && (Y > 423 || !l)) {
          u = nr(e, a, 0, A, w, C, v, U, F, p - F, u), U = g = v = 0, F = p;
          for (var k = 0; k < 286; ++k)
            w[k] = 0;
          for (var k = 0; k < 30; ++k)
            C[k] = 0;
        }
        var X = 2, oe = 0, Gt = y, V = q - z & 32767;
        if (Y > 2 && Te == L(p - V))
          for (var We = Math.min(d, Y) - 1, Se = Math.min(32767, p), W = Math.min(258, Y); V <= Se && --Gt && q != z; ) {
            if (e[p + X] == e[p + X - V]) {
              for (var R = 0; R < W && e[p + R] == e[p + R - V]; ++R)
                ;
              if (R > X) {
                if (X = R, oe = V, R > We)
                  break;
                for (var be = Math.min(V, R - 2), $n = 0, k = 0; k < be; ++k) {
                  var Jt = p - V + k & 32767, Do = _[Jt], Yn = Jt - Do & 32767;
                  Yn > $n && ($n = Yn, z = Jt);
                }
              }
            }
            q = z, z = _[q], V += q - z & 32767;
          }
        if (oe) {
          A[U++] = 268435456 | pn[X] << 18 | er[oe];
          var Vn = pn[X] & 31, Wn = er[oe] & 31;
          v += xn[Vn] + On[Wn], ++w[257 + Vn], ++C[Wn], Ee = p + X, ++g;
        } else
          A[U++] = e[p], ++w[e[p]];
      }
    }
    for (p = Math.max(p, Ee); p < s; ++p)
      A[U++] = e[p], ++w[e[p]];
    u = nr(e, a, l, A, w, C, v, U, F, p - F, u), l || (i.r = u & 7 | a[u / 8 | 0] << 3, u -= 7, i.h = T, i.p = _, i.i = p, i.w = Ee);
  } else {
    for (var p = i.w || 0; p < s + l; p += 65535) {
      var Qt = p + 65535;
      Qt >= s && (a[u / 8 | 0] = l, Qt = s), u = Jr(a, u + 1, e.subarray(p, Qt));
    }
    i.i = s;
  }
  return Gr(c, 0, r + jr(u) + o);
}, Ni = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), Hi = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = Ni[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, Bi = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new N(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return Di(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, vn = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, qi = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && vn(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, zi = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function Xi(e, t) {
  t || (t = {});
  var n = Hi(), r = e.length;
  n.p(e);
  var o = Bi(e, t, zi(t), 8), i = o.length;
  return qi(o, t), vn(o, i - 8, n.d()), vn(o, i - 4, r), o;
}
var rr = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), $i = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Yi = 0;
try {
  $i.decode(Qr, { stream: !0 }), Yi = 1;
} catch {
}
function Vi(e, t) {
  var n;
  if (rr)
    return rr.encode(e);
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
  return Gr(o, 0, i);
}
function It(e) {
  try {
    return Xi(Vi(e));
  } catch {
    return null;
  }
}
const Wi = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function ji(e) {
  if (!Wi)
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
const Gi = "0.5.0", or = 5e3, Kr = 50, Zr = 5e5, ir = 256e3, Dt = "replay", eo = 8e4, to = 32, Ji = 2e7, Qi = 5, Ki = 1e3, Zi = 6e4, es = 500, Nt = 63e3;
let ke = 0, Re = 0, se = [], ot = 0, tn = null;
const Ht = /* @__PURE__ */ new Map();
let xe = null, Oe = null, yn = null, it = !1;
function ts() {
  try {
    return re().flushIntervalMs ?? or;
  } catch {
    return or;
  }
}
function no(e) {
  let t = Ht.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, Ht.set(e, t)), t;
}
function ro(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (x("compression_failures"), { body: t, encoding: "" });
}
async function oo(e) {
  return ro(await ji(e), e);
}
function ns(e) {
  return ro(It(e), e);
}
const rs = 64e3;
function gn(e, t, n) {
  if (e === Dt)
    return {
      bytes: n ?? Ut(
        t,
        rs
      ),
      oversized: !1
    };
  const r = Ut(
    t,
    ir + 1
  );
  return {
    bytes: r,
    oversized: r > ir
  };
}
let _n = null;
function os(e) {
  _n = e;
}
function Yt(e) {
  x("transport_drops"), e === Dt && _n && _n();
}
const is = "/v1/rum/ingest";
function ss(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: Gi
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
function as(e, t, n) {
  const r = re();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const a = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, l = new Blob([n], {
      type: "application/json"
    });
    if (l.size < Nt && navigator.sendBeacon(a, l))
      return;
  }
  const { body: o, encoding: i } = ns(n), s = { ...t };
  i ? s["Content-Encoding"] = i : delete s["Content-Encoding"];
  const c = o instanceof Blob ? o.size : n.length;
  fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: c < Nt,
    credentials: "omit"
  }).catch(() => {
    x("exit_send_failures");
  });
}
function nn(e, t, n, r) {
  const o = n.length;
  if (ot + o > Ji) {
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
  }), ot += o, io();
}
function io() {
  if (tn || se.length === 0)
    return;
  const e = se[0], t = Math.min(
    Ki * Math.pow(2, e.attempts),
    Zi
  );
  tn = setTimeout(() => {
    tn = null, so();
  }, t);
}
async function so() {
  for (; se.length > 0 && ke < eo && Re < to; ) {
    const e = se.shift();
    if (ot -= e.bytes, e.attempts++, e.attempts > Qi) {
      x("retry_drops"), e.batchKey && Yt(e.batchKey);
      continue;
    }
    const t = e.bytes;
    ke += t, Re++;
    try {
      const { body: n, encoding: r } = await oo(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < Nt,
        credentials: "omit"
      });
      if (co(i), i.status === 429 || i.status >= 500) {
        se.unshift(e), ot += e.bytes;
        break;
      }
    } catch {
      se.unshift(e), ot += e.bytes;
      break;
    } finally {
      ke -= t, Re--;
    }
  }
  se.length > 0 && io();
}
function cs() {
  xe && (clearTimeout(xe), xe = null), Oe && (clearTimeout(Oe), Oe = null);
}
function Pn() {
  const e = ts();
  xe && clearTimeout(xe), xe = setTimeout(
    () => ne(),
    e
  ), Oe || (Oe = setTimeout(
    () => {
      Oe = null, ne();
    },
    e + es
  ));
}
function Un(e, t, n) {
  const { bytes: r, oversized: o } = gn(
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
  const i = no(e);
  if (i.items.push(t), i.bytesEstimate += r, !it && (i.items.length >= Kr || i.bytesEstimate >= Zr)) {
    ne();
    return;
  }
  Pn();
}
function us(e, t, n) {
  const { bytes: r, oversized: o } = gn(
    e,
    n
  );
  if (o) {
    Yt(e);
    return;
  }
  const i = no(e), s = i.upsertMap.get(t);
  if (s !== void 0) {
    const c = gn(
      e,
      i.items[s]
    ).bytes;
    i.items[s] = n, i.bytesEstimate += r - c;
  } else {
    const c = i.items.length;
    i.items.push(n), i.upsertMap.set(t, c), i.bytesEstimate += r;
  }
  if (!it && (i.items.length >= Kr || i.bytesEstimate >= Zr)) {
    ne();
    return;
  }
  Pn();
}
function ao(e) {
  yn = e;
}
const sr = ["events", "replay"];
function ne(e = !1) {
  const t = re();
  if (e && yn && !it) {
    it = !0;
    try {
      yn();
    } catch {
    } finally {
      it = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    Pn();
    return;
  }
  cs();
  const n = Ii(), r = [], o = Array.from(
    Ht.keys()
  ).sort((l, u) => {
    const f = sr.indexOf(l), d = sr.indexOf(u), y = f >= 0 ? f : 999, m = d >= 0 ? d : 999;
    return y - m;
  });
  for (const l of o) {
    const u = Ht.get(l);
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
  const i = ss(r), s = `${t.endpoint}${is}`, c = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, a = r.some(
    (l) => l.type === Dt
  );
  if (e) {
    as(s, c, i);
    return;
  }
  ls(
    s,
    c,
    i,
    a ? Dt : void 0
  );
}
async function ls(e, t, n, r) {
  const o = n.length;
  if (ke >= eo || Re >= to) {
    nn(e, t, n, r);
    return;
  }
  ke += o, Re++;
  try {
    const { body: i, encoding: s } = await oo(n), c = { ...t };
    s && (c["Content-Encoding"] = s);
    const a = await fetch(e, {
      method: "POST",
      headers: c,
      body: i,
      keepalive: o < Nt,
      credentials: "omit"
    });
    co(a), (a.status === 429 || a.status >= 500) && nn(e, t, n, r);
  } catch {
    x("send_failures"), nn(e, t, n, r);
  } finally {
    ke -= o, Re--, so();
  }
}
const wn = /* @__PURE__ */ new Map();
function co(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && wn.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function Vt(e) {
  const t = wn.get(e);
  return t ? Date.now() >= t ? (wn.delete(e), !1) : !0 : !1;
}
let st = null, at = null, ct = null, En = null;
function fs(e) {
  En = e;
}
const uo = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function ar() {
  typeof document > "u" || (st = () => {
    document.visibilityState === "hidden" && ne(!0);
  }, at = () => ne(!0), ct = (e) => {
    e.persisted && En && En();
  }, document.addEventListener(
    "visibilitychange",
    st
  ), window.addEventListener(
    uo,
    at
  ), window.addEventListener(
    "pageshow",
    ct
  ));
}
function ds() {
  st && (document.removeEventListener(
    "visibilitychange",
    st
  ), st = null), at && (window.removeEventListener(
    uo,
    at
  ), at = null), ct && (window.removeEventListener(
    "pageshow",
    ct
  ), ct = null);
}
const Bt = /* @__PURE__ */ new Map();
function ps(e, t) {
  Bt.set(e, t);
}
function ms() {
  return Bt.size === 0 ? {} : Object.fromEntries(Bt);
}
function hs() {
  Bt.clear();
}
var Tn, ae, ut, lo, qt, fo = -1, we = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (fo = t.timeStamp, e(t));
  }), !0);
}, Fn = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, Wt = function() {
  var e = Fn();
  return e && e.activationStart || 0;
}, H = function(e, t) {
  var n = Fn(), r = "navigate";
  return fo >= 0 ? r = "back-forward-cache" : n && (document.prerendering || Wt() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
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
}, B = function(e, t, n, r) {
  var o, i;
  return function(s) {
    t.value >= 0 && (s || r) && ((i = t.value - (o || 0)) || o === void 0) && (o = t.value, t.delta = i, t.rating = (function(c, a) {
      return c > a[1] ? "poor" : c > a[0] ? "needs-improvement" : "good";
    })(t.value, n), e(t));
  };
}, Dn = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, gt = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, jt = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Ie = -1, cr = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, zt = function(e) {
  document.visibilityState === "hidden" && Ie > -1 && (Ie = e.type === "visibilitychange" ? e.timeStamp : 0, vs());
}, ur = function() {
  addEventListener("visibilitychange", zt, !0), addEventListener("prerenderingchange", zt, !0);
}, vs = function() {
  removeEventListener("visibilitychange", zt, !0), removeEventListener("prerenderingchange", zt, !0);
}, Nn = function() {
  return Ie < 0 && (Ie = cr(), ur(), we((function() {
    setTimeout((function() {
      Ie = cr(), ur();
    }), 0);
  }))), { get firstHiddenTime() {
    return Ie;
  } };
}, _t = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, lr = [1800, 3e3], po = function(e, t) {
  t = t || {}, _t((function() {
    var n, r = Nn(), o = H("FCP"), i = Ve("paint", (function(s) {
      s.forEach((function(c) {
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < r.firstHiddenTime && (o.value = Math.max(c.startTime - Wt(), 0), o.entries.push(c), n(!0)));
      }));
    }));
    i && (n = B(e, o, lr, t.reportAllChanges), we((function(s) {
      o = H("FCP"), n = B(e, o, lr, t.reportAllChanges), Dn((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, fr = [0.1, 0.25], ys = function(e, t) {
  t = t || {}, po(jt((function() {
    var n, r = H("CLS", 0), o = 0, i = [], s = function(a) {
      a.forEach((function(l) {
        if (!l.hadRecentInput) {
          var u = i[0], f = i[i.length - 1];
          o && l.startTime - f.startTime < 1e3 && l.startTime - u.startTime < 5e3 ? (o += l.value, i.push(l)) : (o = l.value, i = [l]);
        }
      })), o > r.value && (r.value = o, r.entries = i, n());
    }, c = Ve("layout-shift", s);
    c && (n = B(e, r, fr, t.reportAllChanges), gt((function() {
      s(c.takeRecords()), n(!0);
    })), we((function() {
      o = 0, r = H("CLS", 0), n = B(e, r, fr, t.reportAllChanges), Dn((function() {
        return n();
      }));
    })), setTimeout(n, 0));
  })));
}, mo = 0, rn = 1 / 0, Et = 0, gs = function(e) {
  e.forEach((function(t) {
    t.interactionId && (rn = Math.min(rn, t.interactionId), Et = Math.max(Et, t.interactionId), mo = Et ? (Et - rn) / 7 + 1 : 0);
  }));
}, ho = function() {
  return Tn ? mo : performance.interactionCount || 0;
}, _s = function() {
  "interactionCount" in performance || Tn || (Tn = Ve("event", gs, { type: "event", buffered: !0, durationThreshold: 0 }));
}, G = [], Ct = /* @__PURE__ */ new Map(), vo = 0, ws = function() {
  var e = Math.min(G.length - 1, Math.floor((ho() - vo) / 50));
  return G[e];
}, Es = [], Ts = function(e) {
  if (Es.forEach((function(o) {
    return o(e);
  })), e.interactionId || e.entryType === "first-input") {
    var t = G[G.length - 1], n = Ct.get(e.interactionId);
    if (n || G.length < 10 || e.duration > t.latency) {
      if (n) e.duration > n.latency ? (n.entries = [e], n.latency = e.duration) : e.duration === n.latency && e.startTime === n.entries[0].startTime && n.entries.push(e);
      else {
        var r = { id: e.interactionId, latency: e.duration, entries: [e] };
        Ct.set(r.id, r), G.push(r);
      }
      G.sort((function(o, i) {
        return i.latency - o.latency;
      })), G.length > 10 && G.splice(10).forEach((function(o) {
        return Ct.delete(o.id);
      }));
    }
  }
}, yo = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = jt(e), document.visibilityState === "hidden" ? e() : (n = t(e), gt(e)), n;
}, dr = [200, 500], Ss = function(e, t) {
  "PerformanceEventTiming" in self && "interactionId" in PerformanceEventTiming.prototype && (t = t || {}, _t((function() {
    var n;
    _s();
    var r, o = H("INP"), i = function(c) {
      yo((function() {
        c.forEach(Ts);
        var a = ws();
        a && a.latency !== o.value && (o.value = a.latency, o.entries = a.entries, r());
      }));
    }, s = Ve("event", i, { durationThreshold: (n = t.durationThreshold) !== null && n !== void 0 ? n : 40 });
    r = B(e, o, dr, t.reportAllChanges), s && (s.observe({ type: "first-input", buffered: !0 }), gt((function() {
      i(s.takeRecords()), r(!0);
    })), we((function() {
      vo = ho(), G.length = 0, Ct.clear(), o = H("INP"), r = B(e, o, dr, t.reportAllChanges);
    })));
  })));
}, pr = [2500, 4e3], on = {}, bs = function(e, t) {
  t = t || {}, _t((function() {
    var n, r = Nn(), o = H("LCP"), i = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - Wt(), 0), o.entries = [l], n());
      }));
    }, s = Ve("largest-contentful-paint", i);
    if (s) {
      n = B(e, o, pr, t.reportAllChanges);
      var c = jt((function() {
        on[o.id] || (i(s.takeRecords()), s.disconnect(), on[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(a) {
        addEventListener(a, (function() {
          return yo(c);
        }), { once: !0, capture: !0 });
      })), gt(c), we((function(a) {
        o = H("LCP"), n = B(e, o, pr, t.reportAllChanges), Dn((function() {
          o.value = performance.now() - a.timeStamp, on[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, mr = [800, 1800], As = function e(t) {
  document.prerendering ? _t((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, Is = function(e, t) {
  t = t || {};
  var n = H("TTFB"), r = B(e, n, mr, t.reportAllChanges);
  As((function() {
    var o = Fn();
    o && (n.value = Math.max(o.responseStart - Wt(), 0), n.entries = [o], r(!0), we((function() {
      n = H("TTFB", 0), (r = B(e, n, mr, t.reportAllChanges))(!0);
    })));
  }));
}, Ke = { passive: !0, capture: !0 }, Cs = /* @__PURE__ */ new Date(), hr = function(e, t) {
  ae || (ae = t, ut = e, lo = /* @__PURE__ */ new Date(), _o(removeEventListener), go());
}, go = function() {
  if (ut >= 0 && ut < lo - Cs) {
    var e = { entryType: "first-input", name: ae.type, target: ae.target, cancelable: ae.cancelable, startTime: ae.timeStamp, processingStart: ae.timeStamp + ut };
    qt.forEach((function(t) {
      t(e);
    })), qt = [];
  }
}, Ms = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        hr(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, Ke), removeEventListener("pointercancel", i, Ke);
      };
      addEventListener("pointerup", o, Ke), addEventListener("pointercancel", i, Ke);
    })(t, e) : hr(t, e);
  }
}, _o = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, Ms, Ke);
  }));
}, vr = [100, 300], Ls = function(e, t) {
  t = t || {}, _t((function() {
    var n, r = Nn(), o = H("FID"), i = function(a) {
      a.startTime < r.firstHiddenTime && (o.value = a.processingStart - a.startTime, o.entries.push(a), n(!0));
    }, s = function(a) {
      a.forEach(i);
    }, c = Ve("first-input", s);
    n = B(e, o, vr, t.reportAllChanges), c && (gt(jt((function() {
      s(c.takeRecords()), c.disconnect();
    }))), we((function() {
      var a;
      o = H("FID"), n = B(e, o, vr, t.reportAllChanges), qt = [], ut = -1, ae = null, _o(addEventListener), a = i, qt.push(a), go();
    })));
  }));
};
const ks = 50, yr = 200, gr = /* @__PURE__ */ new Map();
function Rs(e) {
  let t = gr.get(e);
  return t || (t = {
    tokens: yr,
    lastRefill: Date.now(),
    rate: ks,
    burst: yr
  }, gr.set(e, t)), t;
}
function xs(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function Os(e) {
  const t = Rs(e);
  return xs(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let Sn = null, bn = null;
function ic(e, t) {
  Sn = e, bn = t;
}
const Ps = "00000000000000000000000000000000";
function wo() {
  if (!Sn || !bn) return null;
  try {
    const e = Sn.getSpan(
      bn.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === Ps ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const _r = 100, Us = 10, wr = 5e3, Fs = 3, Ds = 0;
function Ns(e, t = () => Date.now()) {
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
        const d = f.getNode(a), y = d && d.closest ? d.closest("svg") : null;
        if (y) {
          const m = f.getId(y);
          m !== -1 && (u = m);
        }
      } catch {
      }
    return r.size < wr && r.set(a, u), u;
  }
  function s(a) {
    const l = i(a), u = t();
    let f = n.get(l);
    if (!f) {
      if (n.size >= wr)
        return !0;
      f = {
        tokens: _r,
        lastRefillMs: u
      }, n.set(l, f);
    }
    const d = (u - f.lastRefillMs) / 1e3;
    return d > 0 && (f.tokens = Math.min(
      _r,
      f.tokens + d * Us
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function c(a) {
    var m, _, T;
    if (a.type !== Fs)
      return { event: a, dropped: 0 };
    const l = a.data;
    if (!l || l.source !== Ds || !l.attributes || l.attributes.length === 0)
      return { event: a, dropped: 0 };
    const u = l.attributes.length, f = l.attributes.filter(
      (S) => s(S.id)
    ), d = u - f.length;
    return d === 0 ? { event: a, dropped: 0 } : (l.attributes = f, {
      event: f.length > 0 || (((m = l.adds) == null ? void 0 : m.length) ?? 0) > 0 || (((_ = l.removes) == null ? void 0 : _.length) ?? 0) > 0 || (((T = l.texts) == null ? void 0 : T.length) ?? 0) > 0 ? a : null,
      dropped: d
    });
  }
  return { throttle: c, reset: o };
}
const Er = "replay", Hs = 200, Bs = 6e4, qs = 5e3, zs = 8e6, Eo = 2, Xs = 3, $s = 4, Tr = 3e3, To = 5e3, Ys = 3, Vs = 3e4, Ws = 5e3, js = 16, Gs = 100, Js = 4, Qs = 30, Sr = 32, br = 250, Ks = 36e4;
function Zs() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const ea = 3e5, ta = 9e5, na = 1e3;
let ve = null, ee = null, Je = null, ze = [], Xe = 0, Ce = "", Hn = !1, So = 0, sn = "", K = 0, ye = Date.now(), ue = !1, pt = 0, pe = null, $e = !1, Pe = null, bo = 0, Q = [], j = 0, Ue = null, ce = null, Mt = 0;
function Ye() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const Bn = Ns(
  () => (ve == null ? void 0 : ve.mirror) ?? null
);
let Fe = null, me = null, De = !1, mt = !1, qn = 0, Lt = null, Z = null;
function ra() {
  Ue && (clearTimeout(Ue), Ue = null), ce && (ce(), ce = null);
}
function An(e, t) {
  ra();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    Qs
  ) : null, r = e ? Ye() + (n ?? Js) : Number.POSITIVE_INFINITY;
  for (; j < Q.length; ) {
    const o = Math.min(
      j + Sr,
      Q.length
    );
    for (; j < o; )
      In(
        Q[j++]
      );
    if (Ye() >= r) break;
  }
  if (j >= Q.length) {
    Q = [], j = 0;
    return;
  }
  j >= Sr * 8 && (Q = Q.slice(j), j = 0), Ao();
}
function Xt() {
  An(!1);
}
function Ao() {
  if (!Ue) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          ce = null, An(!0, t);
        },
        { timeout: Gs }
      );
      ce = () => cancelIdleCallback(e);
    }
    Ue = setTimeout(() => {
      Ue = null, ce && (ce(), ce = null), An(!0);
    }, js);
  }
}
function ht(e = !1) {
  if ($e = !0, Pe) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - ye, r = Math.max(
      0,
      To - n
    ), o = Date.now() - bo, i = Math.max(
      0,
      Ws - o
    );
    t = Math.max(
      r,
      i
    );
  }
  Pe = setTimeout(() => {
    Pe = null, oa();
  }, t);
}
function oa() {
  if (!$e || !ve || !ee || ue) return;
  pt++;
  const e = Mt > br ? 1 : Ys;
  if (pt > e) {
    aa();
    return;
  }
  bo = Date.now(), K = 0, ye = Date.now();
  try {
    const t = Ye();
    ve.takeFullSnapshot(!0), Mt = Ye() - t, x("replay_rebases"), Mt > br && x(
      "replay_expensive_snapshots"
    );
  } catch {
    yt(), vt();
  }
}
function Ar() {
  x("replay_events_dropped");
}
function Io() {
  if (Ce) return !1;
  Ce = te(), So = vi();
  const e = sn !== "" && sn !== Ce;
  return sn = Ce, e;
}
function wt() {
  if (sa(), ze.length === 0) return;
  if (Vt(Er)) {
    ia(), Co();
    return;
  }
  Io();
  const e = Ce, t = So, n = ze.splice(0), r = Xe;
  Xe = 0, Ce = "", Hn = !0, Un(
    Er,
    {
      session_id: e,
      segment_index: t,
      events: n
    },
    r
  );
}
function ia() {
  Xe <= zs || (x(
    "replay_events_dropped",
    ze.length
  ), ze.length = 0, Xe = 0, ht());
}
let Ne = null;
function sa() {
  Ne && (clearTimeout(Ne), Ne = null);
}
function Co() {
  if (Ne) return;
  const e = re().replayFlushIntervalMs ?? qs;
  Ne = setTimeout(() => {
    Ne = null, wt();
  }, e);
}
function In(e) {
  Io() && e.type !== Eo && ht(!0), ze.push(e), Xe += Ut(e), ze.length >= Hs || Xe >= Bs ? wt() : Co();
}
function aa() {
  ue = !0, x("replay_overload_pauses"), yt(), pe && clearTimeout(pe), pe = setTimeout(() => {
    pe = null, ue = !1, pt = 0, K = 0, ye = Date.now(), !De && !mt && Z && vt();
  }, Vs);
}
function ca(e) {
  if (ue) return;
  if (e.type === Eo) {
    Xt(), $e = !1, K = 0, ye = Date.now(), In(e);
    return;
  }
  if (e.type === $s) {
    const r = e.data;
    typeof r.href == "string" && (r.href = Wo(r.href));
  }
  if (e.type !== Xs) {
    Xt(), In(e);
    return;
  }
  if ($e) {
    Ar(), ht();
    return;
  }
  const t = Date.now();
  t - ye > To && (K <= Tr && (pt = 0), K = 0, ye = t);
  const n = Bn.throttle(e);
  if (n.dropped > 0 && x(
    "replay_attributes_throttled",
    n.dropped
  ), !!n.event) {
    if (K++, K > Tr) {
      Ar(), ht();
      return;
    }
    Q.push(n.event), Ao();
  }
}
async function vt() {
  if (Z && !ue && !ee)
    return Je || (Je = ua().finally(
      () => {
        Je = null;
      }
    ), Je);
}
async function ua() {
  if (!Z) return;
  const { record: e } = await import("./rrweb-SbAupvcM.js");
  !Z || ue || ee || (ve = e, $e = !1, K = 0, ye = Date.now(), Bn.reset(), ee = e({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: Zs() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: Ks,
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
        ca(t);
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
    maskAllInputs: Z.maskAllInputs,
    maskInputOptions: Z.maskInputOptions,
    maskTextFn: Z.maskTextContent ? () => "•••" : void 0,
    blockSelector: Pr,
    maskTextSelector: Ur,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => wt(), 200));
}
function yt() {
  ee && (ee(), ee = null), Pe && (clearTimeout(Pe), Pe = null), $e = !1, Xt(), wt();
}
function la() {
  const e = re(), t = e.replayIdlePauseMs ?? ea, n = e.replayIdleExpireMs ?? ta;
  Fe && clearTimeout(Fe), me && (clearTimeout(me), me = null), Fe = setTimeout(() => {
    De = !0, yt();
  }, t), me = setTimeout(() => {
    mt = !0, yt();
  }, n);
}
function kt() {
  qn = Ye(), la();
}
function fa() {
  if (mt) {
    if (!zr()) return;
    mt = !1, De = !1, vt(), kt();
    return;
  }
  if (De) {
    De = !1, vt(), kt();
    return;
  }
  Ye() - qn >= na && kt();
}
function da() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => fa(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  Lt = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function pa() {
  Lt && (Lt(), Lt = null), Fe && (clearTimeout(Fe), Fe = null), me && (clearTimeout(me), me = null);
}
function ma() {
  Xt(), wt();
}
async function ha() {
  const t = re().privacyLevel ?? "mask-user-input";
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
  } : o = !1, Z = {
    privacyLevel: t,
    maskAllInputs: o,
    maskInputOptions: n,
    maskTextContent: r
  }, os(() => {
    ee && ht();
  }), ao(ma), await vt(), da(), kt();
}
function va() {
  return ee !== null && !ue;
}
function ya() {
  return Hn;
}
function ga() {
  yt(), pa(), ao(null), pe && (clearTimeout(pe), pe = null), De = !1, mt = !1, qn = 0, ue = !1, Hn = !1, pt = 0, K = 0, Mt = 0, Q = [], j = 0, Bn.reset(), Z = null, ve = null;
}
let P = [], de = null;
const _a = [
  "error",
  "action",
  "console",
  "resource"
];
function wa(e) {
  return _a.includes(e) && (Vt(e) || !Os(e)) ? (x("events_rate_limited"), !0) : !1;
}
function Ea(e, t) {
  const n = e.origin + qe(e.pathname);
  if (!Array.isArray(t) || t.length === 0 || !e.search)
    return n;
  const r = new URLSearchParams(e.search), o = new URLSearchParams();
  r.forEach((s, c) => {
    t.includes(c) && o.append(c, s);
  });
  const i = o.toString();
  return i ? n + "?" + i : n;
}
function Ta() {
  de || (de = {
    device_type: Ga(),
    browser_name: Ja(),
    os_name: Qa(),
    user_agent: navigator.userAgent,
    language: navigator.language
  });
}
function Mo() {
  Ta();
  const e = gi(), t = ms(), n = re(), r = {
    session_id: te(),
    ...Qo(
      Yr(),
      wi(),
      Ei()
    ),
    user_status: Ti(),
    service: n.service,
    env: n.env ?? "",
    version: n.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: Ea(
      window.location,
      n.viewUrlQueryParams
    ),
    view_url_host: window.location.hostname,
    view_url_path: qe(window.location.pathname),
    referrer_url: jo(document.referrer),
    device_type: de.device_type,
    browser_name: de.browser_name,
    os_name: de.os_name,
    user_agent: Jo() ? de.user_agent : "",
    language: de.language,
    session_view_count: e.viewCount,
    session_error_count: e.errorCount,
    session_action_count: e.actionCount,
    replay_id: va() && ya() ? te() : ""
  };
  return Object.keys(t).length > 0 && (r.feature_flags = t), r;
}
function Sa(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const Lo = "events";
function O(e) {
  if (!qr() || Vt("events")) return;
  const t = e(), n = t.event_type;
  if (wa(n)) return;
  $r(n);
  const r = Mo();
  Un(
    Lo,
    { ...r, ...t }
  );
}
function zn(e) {
  Sa(
    () => O(e)
  );
}
function ba(e) {
  if (!qr() || Vt("events")) return;
  const t = e(), n = t.event_type;
  $r(n);
  const r = Mo(), o = r.session_id + ":" + r.view_url_path;
  us(
    Lo,
    o,
    { ...r, ...t }
  );
}
function Aa() {
  Ia(), ka(), Pa(), Ua(), Ya(), za(), Xa(), $a(), Va(), Ra();
}
function Ia() {
  const e = (n) => {
    O(() => {
      var i, s, c;
      const r = n.message ?? "", o = typeof ((i = n.error) == null ? void 0 : i.message) == "string" ? n.error.message : r;
      return {
        event_type: "error",
        error_message: Pt(r),
        error_type: ((s = n.error) == null ? void 0 : s.name) ?? "Error",
        error_stack: Qn(
          ((c = n.error) == null ? void 0 : c.stack) ?? "",
          o
        ),
        error_source: "source"
      };
    });
  }, t = (n) => {
    const r = n.reason;
    O(() => {
      const o = (r == null ? void 0 : r.message) ?? String(r);
      return {
        event_type: "error",
        error_message: Pt(o),
        error_type: (r == null ? void 0 : r.name) ?? "UnhandledRejection",
        error_stack: Qn(
          (r == null ? void 0 : r.stack) ?? "",
          o
        ),
        error_source: "promise"
      };
    });
  };
  window.addEventListener("error", e), window.addEventListener(
    "unhandledrejection",
    t
  ), P.push(() => {
    window.removeEventListener("error", e), window.removeEventListener(
      "unhandledrejection",
      t
    );
  });
}
const He = 8192;
function Ca(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${He} bytes omitted]`;
}
function Ma(e) {
  if (typeof e == "string") return e;
  if (Ut(
    e,
    He + 1
  ) > He)
    return Ca(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function La(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= He) break;
    t && (t += " "), t += Ma(n);
  }
  return t.length > He ? t.slice(0, He) + "… [truncated]" : t;
}
function ka() {
  for (const e of Go()) {
    const t = console[e];
    console[e] = (...n) => {
      const r = Pt(La(n));
      O(() => ({
        event_type: "console",
        console_level: e,
        console_message: r
      })), t.apply(console, n);
    }, P.push(() => {
      console[e] = t;
    });
  }
}
const E = {};
let he = null, Rt = 0, Ir = "";
function ko() {
  const e = JSON.stringify(E);
  if (e === Ir) return;
  Ir = e, Rt = 0;
  const t = E.page_load_ms || E.lcp || E.dom_complete_ms || 0, n = t > 0;
  ba(() => ({
    event_type: n ? "page_load" : "view",
    page_load_ms: t,
    lcp_ms: E.lcp ?? 0,
    fid_ms: E.fid ?? 0,
    inp_ms: E.inp ?? 0,
    cls: E.cls ?? 0,
    fcp_ms: E.fcp ?? 0,
    ttfb_ms: E.ttfb ?? 0,
    dns_ms: E.dns_ms ?? 0,
    connect_ms: E.connect_ms ?? 0,
    dom_interactive_ms: E.dom_interactive_ms ?? 0,
    dom_complete_ms: E.dom_complete_ms ?? 0
  }));
}
function fe() {
  const e = Date.now();
  Rt || (Rt = e);
  const t = e - Rt, n = Math.max(0, 5e3 - t);
  he && clearTimeout(he), he = setTimeout(() => {
    he = null, ko();
  }, n);
}
function Ra() {
  if (typeof document > "u") return;
  const e = () => {
    document.visibilityState === "hidden" && (he && (clearTimeout(he), he = null), ko());
  };
  document.addEventListener(
    "visibilitychange",
    e
  ), P.push(() => {
    document.removeEventListener(
      "visibilitychange",
      e
    );
  });
}
const Cn = "oodle_rum_tab_hidden";
function Cr(e) {
  try {
    e ? sessionStorage.setItem(Cn, "1") : sessionStorage.removeItem(Cn);
  } catch {
  }
}
function xa() {
  try {
    return sessionStorage.getItem(Cn) === "1";
  } catch {
    return !1;
  }
}
function Oa() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && xa() && (Cr(!1), O(() => ({
    event_type: "visibility",
    action_type: "tab_visible"
  })));
  let e = document.visibilityState === "hidden";
  const t = () => {
    const n = document.visibilityState === "hidden";
    n !== e && (e = n, Cr(n), O(() => ({
      event_type: "visibility",
      action_type: n ? "tab_hidden" : "tab_visible"
    })), n || ne());
  };
  document.addEventListener(
    "visibilitychange",
    t
  ), P.push(() => {
    document.removeEventListener(
      "visibilitychange",
      t
    );
  });
}
function Pa() {
  bs((e) => {
    E.lcp = e.value, fe();
  }), Ls((e) => {
    E.fid = e.value, fe();
  }), Ss((e) => {
    E.inp = e.value, fe();
  }), ys((e) => {
    E.cls = e.value, fe();
  }), po((e) => {
    E.fcp = e.value, fe();
  }), Is((e) => {
    E.ttfb = e.value, fe();
  });
}
function Xn(e) {
  const t = re().endpoint;
  return e.startsWith(t);
}
function Ua() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || Xn(r.name))
          continue;
        const i = ft(r.name), s = r.duration, c = r.transferSize ?? 0, a = o;
        zn(
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
  }), P.push(() => e.disconnect()), typeof performance < "u") {
    const t = () => {
      performance.clearResourceTimings();
    };
    performance.addEventListener(
      "resourcetimingbufferfull",
      t
    ), P.push(() => {
      performance.removeEventListener(
        "resourcetimingbufferfull",
        t
      );
    });
  }
}
function $t(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function Fa(e) {
  try {
    return new URL(e, location.href).href;
  } catch {
    return e;
  }
}
function an(e, t, n) {
  return n.some(
    (r) => typeof r == "string" ? e.startsWith(r) || t.startsWith(r) : r.test(e) || r.test(t)
  );
}
function Ro(e) {
  const t = Fa(e), n = re();
  let r = !1;
  const o = n.allowedTracingUrls;
  o && o.length > 0 && (r = an(
    t,
    e,
    o
  ));
  let i = null;
  const s = n.forwardNetworkBodies;
  s && an(
    t,
    e,
    s.urls
  ) && (i = s);
  let c = !1;
  const a = n.forwardNetworkHeaders;
  return a && (c = an(
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
const xt = /* @__PURE__ */ new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "proxy-authorization"
]);
function xo(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      xt.has(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      xt.has(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      xt.has(r) || (t[r] = e[n]);
    }
  return t;
}
function Da(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    xt.has(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function Be(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function Na(e, t) {
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
function Ha(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function Ba(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      xo(
        e
      )
    );
  } catch {
    return "";
  }
}
function Mr(e) {
  try {
    return JSON.stringify(
      xo(e)
    );
  } catch {
    return "";
  }
}
function Oo(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function qa(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: Be(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: Be(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : Oo(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => Be(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function Po(e, t, n) {
  const r = function(o, i) {
    const s = Ha(o);
    if (Xn(s))
      return t.apply(e, [
        o,
        i
      ]);
    const c = Oo(o), a = ((i == null ? void 0 : i.method) ?? (c ? o.method : "GET")).toUpperCase(), l = performance.now(), u = Ro(s);
    let f = "", d = "";
    if (n.injectTracing) {
      const T = wo();
      if (T)
        f = T.traceId, d = T.spanId;
      else if (u.trace) {
        f = $t(16), d = $t(8);
        const S = new Headers(
          (i == null ? void 0 : i.headers) ?? {}
        );
        S.set(
          "traceparent",
          `00-${f}-${d}-01`
        ), i = { ...i, headers: S };
      }
    }
    let y = "", m = null;
    if (u.bodyCfg) {
      const T = u.bodyCfg.maxBodySize ?? 65536, S = qa(
        i,
        o,
        T
      );
      y = S.sync, m = S.asyncP;
    }
    let _ = "";
    return u.captureHeaders && (i != null && i.headers ? _ = Ba(
      i.headers
    ) : c && (_ = Mr(
      o.headers
    ))), t.apply(e, [o, i]).then((T) => {
      const S = T.status, M = Math.round(
        performance.now() - l
      );
      let L = "";
      u.captureHeaders && (L = Mr(
        T.headers
      ));
      const A = (C) => {
        const g = {
          event_type: "resource",
          resource_url: ft(s),
          resource_method: a,
          resource_status: S,
          resource_duration_ms: M,
          resource_size: 0,
          resource_type: "fetch"
        };
        return f && (g.trace_id = f, g.span_id = d), C && (g.request_body = C), _ && (g.request_headers = _), L && (g.response_headers = L), g;
      }, w = m || Promise.resolve(y);
      if (u.bodyCfg) {
        const C = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          w,
          Na(
            T.clone(),
            C
          ).catch(() => "")
        ]).then(([g, v]) => {
          O(() => {
            const p = A(g);
            return v && (p.response_body = v), p;
          });
        }).catch(() => {
          w.then((g) => {
            O(
              () => A(g)
            );
          });
        });
      } else
        w.then((C) => {
          O(() => A(C));
        });
      return T;
    }).catch((T) => {
      const S = Math.round(
        performance.now() - l
      );
      throw (m || Promise.resolve(y)).then((L) => {
        O(() => {
          const A = {
            event_type: "resource",
            resource_url: ft(s),
            resource_method: a,
            resource_status: 0,
            resource_duration_ms: S,
            resource_size: 0,
            resource_type: "fetch"
          };
          return f && (A.trace_id = f, A.span_id = d), L && (A.request_body = L), _ && (A.request_headers = _), A;
        });
      }), T;
    });
  };
  return e.fetch = r, () => {
    e.fetch = t;
  };
}
function Uo(e, t, n) {
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
    if (Xn(c))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const a = Ro(c);
    let l = "", u = "";
    if (n.injectTracing) {
      const w = wo();
      w ? (l = w.traceId, u = w.spanId) : a.trace && (l = $t(16), u = $t(8), i.call(
        this,
        "traceparent",
        `00-${l}-${u}-01`
      ));
    }
    let f = "";
    if (a.bodyCfg && s) {
      const w = a.bodyCfg.maxBodySize ?? 65536;
      typeof s == "string" ? f = Be(
        s,
        w
      ) : typeof URLSearchParams < "u" && s instanceof URLSearchParams && (f = Be(
        s.toString(),
        w
      ));
    }
    let d = "";
    if (a.captureHeaders)
      try {
        const w = this.__oodleReqHeaders;
        w && Object.keys(w).length > 0 && (d = JSON.stringify(w));
      } catch {
      }
    const y = performance.now(), m = this, _ = l, T = u, S = f, M = a.bodyCfg, L = d, A = a.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        const w = Math.round(
          performance.now() - y
        ), C = m.__oodleMethod ?? "GET";
        O(() => {
          const g = {
            event_type: "resource",
            resource_url: ft(c),
            resource_method: C,
            resource_status: m.status,
            resource_duration_ms: w,
            resource_size: 0,
            resource_type: "xhr"
          };
          if (_ && (g.trace_id = _, g.span_id = T), S && (g.request_body = S), M)
            try {
              const v = m.responseText ?? "";
              g.response_body = Be(
                v,
                M.maxBodySize ?? 65536
              );
            } catch {
            }
          if (L && (g.request_headers = L), A)
            try {
              const v = m.getAllResponseHeaders();
              v && (g.response_headers = JSON.stringify(
                Da(v)
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
const Fo = {
  injectTracing: !0
}, Lr = {
  injectTracing: !1
};
function za() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = Po(
    window,
    window.fetch,
    Fo
  );
  P.push(e);
}
function Xa() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = Uo(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    Fo
  );
  P.push(e);
}
const kr = /* @__PURE__ */ new WeakSet();
function cn(e) {
  if (kr.has(e)) return;
  kr.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (Po(
        n,
        n.fetch,
        Lr
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (Uo(
        r.prototype,
        r.prototype.setRequestHeader,
        Lr
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), P.push(() => {
    e.removeEventListener("load", t);
  });
}
function $a() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach(cn);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          r instanceof HTMLIFrameElement && cn(r), r instanceof HTMLElement && r.childElementCount > 0 && r.querySelectorAll("iframe").forEach(cn);
    }
  );
  e.observe(document.documentElement, {
    childList: !0,
    subtree: !0
  }), P.push(() => {
    e.disconnect();
  });
}
function Ya() {
  if (typeof window > "u" || typeof PerformanceObserver > "u")
    return;
  const e = () => {
    const r = performance.getEntriesByType(
      "navigation"
    )[0];
    r && (E.page_load_ms = Math.round(
      r.loadEventEnd - r.startTime
    ), E.dns_ms = Math.round(
      r.domainLookupEnd - r.domainLookupStart
    ), E.connect_ms = Math.round(
      r.connectEnd - r.connectStart
    ), E.tls_ms = Math.round(
      r.secureConnectionStart > 0 ? r.connectEnd - r.secureConnectionStart : 0
    ), E.ttfb = Math.round(
      r.responseStart - r.requestStart
    ), E.download_ms = Math.round(
      r.responseEnd - r.responseStart
    ), E.dom_interactive_ms = Math.round(
      r.domInteractive - r.startTime
    ), E.dom_complete_ms = Math.round(
      r.domComplete - r.startTime
    ), fe());
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
function Va() {
  if (!(typeof PerformanceObserver > "u") && !Wa())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            zn(() => ({
              event_type: "long_task",
              long_task_duration_ms: r
            }));
          }
        }
      );
      e.observe({
        type: "longtask",
        buffered: !0
      }), P.push(
        () => e.disconnect()
      );
    } catch {
    }
}
function Wa() {
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
          zn(() => ({
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
    }), P.push(
      () => e.disconnect()
    ), !0;
  } catch {
    return !1;
  }
}
function un() {
  O(() => ({
    event_type: "view"
  }));
}
function Tt(e, t, n, r, o, i, s) {
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
function ja(e, t) {
  O(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function Ga() {
  const e = navigator.userAgent;
  return /Mobi|Android/i.test(e) ? "mobile" : /Tablet|iPad/i.test(e) ? "tablet" : "desktop";
}
function Ja() {
  const e = navigator.userAgent;
  return e.includes("Firefox") ? "Firefox" : e.includes("Edg/") ? "Edge" : e.includes("Chrome") ? "Chrome" : e.includes("Safari") ? "Safari" : "Other";
}
function Qa() {
  const e = navigator.userAgent;
  return e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : e.includes("Android") ? "Android" : /iPhone|iPad|iPod/.test(e) ? "iOS" : "Other";
}
function Ka() {
  for (const e of P)
    e();
  P = [];
}
const Rr = typeof MutationObserver < "u" ? MutationObserver : null;
let le = !1, St = null, bt = null, lt = null, Ot = null;
const sc = {
  init(e) {
    le || ui(e) && (bi(e.tags), hi(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), le = !0, Oa(), ar(), yi(), ki(), fs(() => {
      ar();
    }), e.sessionReplay !== !1 && zr() && ha(), Aa(), St = Za(), bt = ec(), e.openTelemetry && import("./tracing-18B1ECtf.js").then(
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
    Ai(e);
  },
  identify(e) {
    _i(e);
  },
  trackEvent(e, t) {
    le && ja(e, t);
  },
  addFeatureFlag(e, t) {
    ps(e, t);
  },
  getSessionId() {
    return le ? te() : "";
  },
  getUserId() {
    return Yr();
  },
  flush() {
    le && ne();
  },
  stop() {
    le && (ga(), Ka(), Ri(), Xr(), ne(!0), hs(), ds(), St && (St(), St = null), bt && (bt(), bt = null), Ze(), le = !1);
  }
};
function Za() {
  if (typeof window > "u") return null;
  const e = history.pushState;
  history.pushState = function(...r) {
    e.apply(this, r), un();
  };
  const t = history.replaceState;
  history.replaceState = function(...r) {
    t.apply(this, r), un();
  };
  const n = () => un();
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
function Ze() {
  lt && (lt.disconnect(), lt = null), Ot && (clearTimeout(Ot), Ot = null);
}
function ec() {
  if (typeof document > "u")
    return null;
  const e = 3, t = 1e3, n = 1e3;
  let r = [];
  const o = (s) => {
    var S;
    const c = s.target;
    if (!c) return;
    const a = nc(c), l = ai(c), u = l ? "" : (c.textContent ?? "").trim().slice(0, 200), f = ((S = c.tagName) == null ? void 0 : S.toLowerCase()) ?? "", d = tc(
      c,
      f,
      u,
      l
    ), y = Date.now(), m = s.clientX, _ = s.clientY;
    if (r.push({ selector: a, time: y }), r = r.filter(
      (M) => y - M.time < t
    ), r.filter(
      (M) => M.selector === a
    ).length >= e) {
      Tt(
        "rage_click",
        d,
        a,
        u,
        !0,
        m,
        _
      ), r = [];
      return;
    }
    i(
      c,
      d,
      a,
      u,
      m,
      _
    );
  };
  document.addEventListener("click", o, {
    capture: !0,
    passive: !0
  });
  function i(s, c, a, l, u, f) {
    var m;
    const d = ((m = s.tagName) == null ? void 0 : m.toLowerCase()) ?? "";
    if (!(d === "a" || d === "button" || d === "input" || d === "select" || d === "textarea" || s.hasAttribute("onclick") || s.getAttribute("role") === "button" || s.closest("a, button") !== null)) {
      Tt(
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
    Ze(), Rr && (lt = new Rr(() => {
      Ze(), Tt(
        "click",
        c,
        a,
        l,
        !1,
        u,
        f
      );
    }), lt.observe(
      document.body,
      {
        childList: !0,
        subtree: !0
      }
    ), Ot = setTimeout(() => {
      Ze(), Tt(
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
    ), Ze();
  };
}
function tc(e, t, n, r = !1) {
  if (r) return xr(e, t);
  const o = e.getAttribute("aria-label");
  if (o)
    return `${t}[${o}]`;
  const i = e.getAttribute("title");
  if (i) return `${t}[${i}]`;
  const s = n.split(`
`)[0].trim();
  return s && s.length <= 80 ? `${t}[${s}]` : xr(e, t);
}
function xr(e, t) {
  if (e.id) return `${t}#${e.id}`;
  const n = Array.from(
    e.classList ?? []
  ).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
function nc(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(
    e.classList ?? []
  ).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
export {
  sc as O,
  oc as a,
  rc as r,
  ic as s
};
