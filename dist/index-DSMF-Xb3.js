const kt = [
  "error",
  "warn"
];
function ii() {
  return {
    patterns: [],
    maskFn: null,
    referrer: "path",
    consoleLevels: kt,
    messages: "full",
    actionText: "full",
    userAgent: "full",
    queryStrings: "events",
    userInfo: "full",
    keepParams: []
  };
}
let C = ii();
const en = "/:redacted", si = 256, Ge = /* @__PURE__ */ new Map();
let pn = !1;
function _e(e) {
  console.warn("[@oodle-ai/rum] " + e);
}
function ke(e, t, n, r, o) {
  return t === void 0 ? r : typeof t == "string" && n.includes(t) ? t : (_e(
    `${e} must be one of ${n.map((i) => `'${i}'`).join(", ")}. Using '${o}'.`
  ), o);
}
function ai(e) {
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
function ci(e) {
  if (e === void 0) return [];
  if (!Array.isArray(e))
    return _e(
      "urlPathPatterns must be an array of path patterns such as '/projects/:id'. It is ignored."
    ), [];
  const t = [];
  for (const n of e) {
    const r = ai(n);
    r ? t.push(r) : _e(
      `urlPathPatterns: ${JSON.stringify(n)} is not a valid pattern. Patterns start with '/', use ':name' for one segment and may end in '/*'. It is ignored.`
    );
  }
  return t;
}
function ui(e) {
  if (e === void 0) return kt;
  if (!Array.isArray(e))
    return _e(
      "consoleLevels must be an array such as ['error']. Console capture is off."
    ), [];
  const t = kt.filter(
    (n) => e.includes(n)
  );
  return e.some(
    (n) => !kt.includes(n)
  ) && _e(
    "consoleLevels accepts only 'error' and 'warn'. Other values are ignored."
  ), t;
}
function li(e) {
  Ge.clear(), pn = !1;
  const t = e.maskUrlPath;
  t !== void 0 && typeof t != "function" && _e("maskUrlPath must be a function. It is ignored."), C = {
    patterns: ci(e.urlPathPatterns),
    maskFn: typeof t == "function" ? t : null,
    referrer: ke(
      "referrerUrl",
      e.referrerUrl,
      ["path", "origin", "none"],
      "path",
      "none"
    ),
    consoleLevels: ui(
      e.consoleLevels
    ),
    messages: ke(
      "errorMessages",
      e.errorMessages,
      ["full", "scrub", "none"],
      "full",
      "none"
    ),
    // Text the replay masks must not reappear in click events.
    actionText: ke(
      "actionText",
      e.actionText,
      ["full", "mask"],
      e.privacyLevel === "mask" ? "mask" : "full",
      "mask"
    ),
    userAgent: ke(
      "userAgent",
      e.userAgent,
      ["full", "none"],
      "full",
      "none"
    ),
    queryStrings: ke(
      "stripQueryStrings",
      e.stripQueryStrings,
      ["events", "all"],
      "events",
      "all"
    ),
    userInfo: ke(
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
function fi(e) {
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
function di(e) {
  let t = C.patterns.length > 0 ? fi(e) : e;
  if (C.maskFn)
    try {
      const n = C.maskFn(t);
      t = typeof n == "string" ? n : en;
    } catch (n) {
      pn || (pn = !0, _e(
        `maskUrlPath threw. Paths are sent as '${en}' until it is fixed: ${String(n)}`
      )), t = en;
    }
  return t;
}
function qe(e) {
  if (!On()) return e;
  const t = Ge.get(e);
  if (t !== void 0) return t;
  const n = di(e);
  return Ge.size >= si && Ge.clear(), Ge.set(e, n), n;
}
function pi(e) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(e);
}
function dt(e, t) {
  if (pi(e)) {
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
function Jr(e) {
  return !On() || typeof e != "string" ? e : Pn(e, (t) => t.search + t.hash);
}
function Bc() {
  return On() || C.queryStrings === "all";
}
function mi(e) {
  return C.queryStrings !== "all" ? Jr(e) : typeof e != "string" ? e : Pn(e, (t) => {
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
function qc(e) {
  return C.queryStrings !== "all" ? Jr(e) : typeof e != "string" ? e : Pn(e, () => "");
}
function Pn(e, t) {
  let n;
  try {
    n = new URL(e);
  } catch {
    return e;
  }
  return n.protocol !== "http:" && n.protocol !== "https:" ? e : n.origin + qe(n.pathname) + t(n);
}
let Zn = null, er = "", tr = null;
function hi(e) {
  if (e === Zn && tr === C)
    return er;
  let t = "";
  if (e && C.referrer !== "none")
    try {
      const n = new URL(e);
      t = C.referrer === "origin" ? n.origin : n.origin + qe(n.pathname);
    } catch {
      t = C.referrer === "origin" ? "" : e;
    }
  return Zn = e, er = t, tr = C, t;
}
function yi() {
  return C.consoleLevels;
}
function vi() {
  return C.userAgent === "full";
}
function gi(e, t, n) {
  switch (C.userInfo) {
    case "full":
      return { user_id: e, user_name: t, user_email: n };
    case "id":
      return { user_id: e, user_name: "", user_email: "" };
    default:
      return { user_id: "", user_name: "", user_email: "" };
  }
}
const _i = [
  [/(^|[^\w])'(?:[^'\\\n]|\\.){0,500}'/g, "$1'?'"],
  [/(^|[^\w])"(?:[^"\\\n]|\\.){0,500}"/g, '$1"?"'],
  [/(^|[^\w])`(?:[^`\\\n]|\\.){0,500}`/g, "$1`?`"]
], wi = /\bhttps?:\/\/[^\s'"`<>()\]]+/g, Ei = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, Si = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, Ti = /\b(?=[0-9a-fA-F]*\d)(?=[0-9a-fA-F]*[a-fA-F])[0-9a-fA-F]{16,}\b/g, bi = /\d{4,}/g;
function Ai(e) {
  if (!e) return e;
  let t = e.replace(Ei, "<email>");
  t = t.replace(wi, (n) => {
    const r = dt(n);
    return r === n ? "<url>" : r;
  });
  for (const [n, r] of _i)
    t = t.replace(n, r);
  return t = t.replace(Si, "<id>"), t = t.replace(Ti, "<id>"), t = t.replace(bi, "<n>"), t;
}
const ki = /^\s+at |^[^\s@]*@\S+:\d+(?::\d+)?$/m;
function jt(e) {
  switch (C.messages) {
    case "full":
      return e;
    case "scrub":
      return Ai(e);
    default:
      return "";
  }
}
function Kr(e, t) {
  if (C.messages === "full" || !e || !t) return e;
  const n = ki.exec(e), r = n ? n.index : e.length, o = e.indexOf(t);
  if (o < 0 || o + t.length > r)
    return e;
  const i = jt(t);
  let s = e.slice(0, o) + i;
  return i || (s = s.replace(/:\s*$/, "")), s + e.slice(o + t.length);
}
const Gr = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', Qr = '[data-oodle-privacy="mask"],.oodle-privacy-mask', Ci = Gr + "," + Qr + ",.rr-block,.rr-mask";
function Ii(e) {
  if (C.actionText === "mask") return !0;
  try {
    return typeof e.closest == "function" && e.closest(Ci) !== null;
  } catch {
    return !0;
  }
}
let mn = null;
function Li(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function Ri(e) {
  if (!Li(e.endpoint))
    return console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    ), !1;
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  );
  const t = Mi(
    e.viewUrlQueryParams
  );
  return li({ ...e, viewUrlQueryParams: t }), mn = { ...e, viewUrlQueryParams: t }, !0;
}
function Mi(e) {
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
  if (!mn)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return mn;
}
const Zr = "__oodle_session", xi = 1800 * 1e3, Oi = 14400 * 1e3;
function Pi() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
function Ui() {
  try {
    const e = sessionStorage.getItem(Zr);
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
function eo(e) {
  try {
    sessionStorage.setItem(
      Zr,
      JSON.stringify(e)
    );
  } catch {
  }
}
let Le = null;
function to(e) {
  Le || (Le = setTimeout(() => {
    Le = null, eo(e);
  }, 1e3));
}
function Un(e) {
  Le && (clearTimeout(Le), Le = null), eo(e);
}
let h = null, no = 100, ro = 100;
function Ni(e, t) {
  no = Math.max(
    0,
    Math.min(100, e)
  ), ro = Math.max(
    0,
    Math.min(100, t)
  );
}
function nr(e) {
  return Math.random() * 100 < e;
}
function ne() {
  const e = Date.now();
  if (h || (h = Ui()), !h || e - h.lastActivity > xi || e - h.createdAt > Oi) {
    const t = nr(no);
    h = {
      id: Pi(),
      createdAt: e,
      lastActivity: e,
      viewCount: 0,
      errorCount: 0,
      actionCount: 0,
      sampled: t,
      replaySampled: t && nr(ro),
      replaySegmentSeq: 0
    }, Un(h);
  } else
    h.lastActivity = e, to(h);
  return h.id;
}
function Hi() {
  if (ne(), !h) return 0;
  const e = h.replaySegmentSeq;
  return h.replaySegmentSeq = e + 1, Un(h), e;
}
function oo() {
  return ne(), (h == null ? void 0 : h.sampled) ?? !0;
}
function io() {
  return ne(), (h == null ? void 0 : h.replaySampled) ?? !0;
}
let et = null;
function Fi() {
  typeof document > "u" || (so(), et = () => {
    document.visibilityState === "hidden" && h && Un(h);
  }, document.addEventListener(
    "visibilitychange",
    et
  ));
}
function so() {
  et && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    et
  ), et = null);
}
function ao(e) {
  ne(), h && (e === "view" || e === "page_load" ? h.viewCount++ : e === "error" ? h.errorCount++ : e === "action" && h.actionCount++, to(h));
}
function Di() {
  return ne(), {
    viewCount: (h == null ? void 0 : h.viewCount) ?? 0,
    errorCount: (h == null ? void 0 : h.errorCount) ?? 0,
    actionCount: (h == null ? void 0 : h.actionCount) ?? 0
  };
}
let X = null;
function Bi(e) {
  X = e;
}
function co() {
  return (X == null ? void 0 : X.id) ?? "";
}
function qi() {
  return (X == null ? void 0 : X.name) ?? "";
}
function zi() {
  return (X == null ? void 0 : X.email) ?? "";
}
function $i() {
  return X ? "identified" : "anonymous";
}
const ji = 5e5;
function Pt(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > ji) return n;
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
let pt = {};
function Xi(e) {
  e && (pt = { ...e, ...pt });
}
function Vi(e) {
  pt = { ...pt, ...e };
}
function Yi() {
  return pt;
}
const Wi = 6e4, Ji = "sdk_telemetry", Re = {
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
  Re[e] += t;
}
function Ki() {
  for (const e in Re)
    if (Re[e] > 0)
      return !0;
  return !1;
}
function hn() {
  if (!Ki()) return;
  const e = { ...Re };
  for (const t in Re)
    Re[t] = 0;
  Bn(Ji, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let tt = null, nt = null;
function Gi() {
  tt || (tt = setInterval(
    hn,
    Wi
  ), typeof document < "u" && (nt = () => {
    document.visibilityState === "hidden" && hn();
  }, document.addEventListener(
    "visibilitychange",
    nt
  )));
}
function Qi() {
  tt && (clearInterval(tt), tt = null), nt && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    nt
  ), nt = null), hn();
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
]), rr = new D([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), uo = function(e, t) {
  for (var n = new F(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new Nn(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, lo = uo(Hn, 2), Zi = lo.b, yn = lo.r;
Zi[28] = 258, yn[258] = 28;
var es = uo(Fn, 0), or = es.r, vn = new F(32768);
for (var T = 0; T < 32768; ++T) {
  var ie = (T & 43690) >> 1 | (T & 21845) << 1;
  ie = (ie & 52428) >> 2 | (ie & 13107) << 2, ie = (ie & 61680) >> 4 | (ie & 3855) << 4, vn[T] = ((ie & 65280) >> 8 | (ie & 255) << 8) >> 1;
}
var rt = (function(e, t, n) {
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
          c[vn[f] >> a] = l;
  } else
    for (c = new F(r), o = 0; o < r; ++o)
      e[o] && (c[o] = vn[s[e[o] - 1]++] >> 15 - e[o]);
  return c;
}), we = new D(288);
for (var T = 0; T < 144; ++T)
  we[T] = 8;
for (var T = 144; T < 256; ++T)
  we[T] = 9;
for (var T = 256; T < 280; ++T)
  we[T] = 7;
for (var T = 280; T < 288; ++T)
  we[T] = 8;
var Ut = new D(32);
for (var T = 0; T < 32; ++T)
  Ut[T] = 5;
var ts = /* @__PURE__ */ rt(we, 9, 0), ns = /* @__PURE__ */ rt(Ut, 5, 0), fo = function(e) {
  return (e + 7) / 8 | 0;
}, po = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new D(e.subarray(t, n));
}, G = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, We = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, tn = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: ho, l: 0 };
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
  var v = new F(d + 1), m = gn(n[u - 1], v, 0);
  if (m > t) {
    var r = 0, _ = 0, w = m - t, b = 1 << w;
    for (i.sort(function(k, g) {
      return v[g.s] - v[k.s] || k.f - g.f;
    }); r < o; ++r) {
      var L = i[r].s;
      if (v[L] > t)
        _ += b - (1 << m - v[L]), v[L] = t;
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
    m = t;
  }
  return { t: new D(v), l: m };
}, gn = function(e, t, n) {
  return e.s == -1 ? Math.max(gn(e.l, t, n + 1), gn(e.r, t, n + 1)) : t[e.s] = n;
}, ir = function(e) {
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
}, Je = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, mo = function(e, t, n) {
  var r = n.length, o = fo(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, sr = function(e, t, n, r, o, i, s, c, a, l, u) {
  G(t, u++, n), ++o[256];
  for (var f = tn(o, 15), d = f.t, v = f.l, m = tn(i, 15), _ = m.t, w = m.l, b = ir(d), L = b.c, I = b.n, A = ir(_), E = A.c, k = A.n, g = new F(19), y = 0; y < L.length; ++y)
    ++g[L[y] & 31];
  for (var y = 0; y < E.length; ++y)
    ++g[E[y] & 31];
  for (var p = tn(g, 7), N = p.t, Se = p.l, H = 19; H > 4 && !N[rr[H - 1]]; --H)
    ;
  var Te = l + 5 << 3, z = Je(o, we) + Je(i, Ut) + s, $ = Je(o, d) + Je(i, _) + s + 14 + 3 * H + Je(g, N) + 2 * g[16] + 3 * g[17] + 7 * g[18];
  if (a >= 0 && Te <= z && Te <= $)
    return mo(t, u, e.subarray(a, a + l));
  var V, R, j, oe;
  if (G(t, u, 1 + ($ < z)), u += 2, $ < z) {
    V = rt(d, v, 0), R = d, j = rt(_, w, 0), oe = _;
    var Kt = rt(N, Se, 0);
    G(t, u, I - 257), G(t, u + 5, k - 1), G(t, u + 10, H - 4), u += 14;
    for (var y = 0; y < H; ++y)
      G(t, u + 3 * y, N[rr[y]]);
    u += 3 * H;
    for (var Y = [L, E], Ye = 0; Ye < 2; ++Ye)
      for (var be = Y[Ye], y = 0; y < be.length; ++y) {
        var W = be[y] & 31;
        G(t, u, Kt[W]), u += N[W], W > 15 && (G(t, u, be[y] >> 5 & 127), u += be[y] >> 12);
      }
  } else
    V = ts, R = we, j = ns, oe = Ut;
  for (var y = 0; y < c; ++y) {
    var M = r[y];
    if (M > 255) {
      var W = M >> 18 & 31;
      We(t, u, V[W + 257]), u += R[W + 257], W > 7 && (G(t, u, M >> 23 & 31), u += Hn[W]);
      var Ae = M & 31;
      We(t, u, j[Ae]), u += oe[Ae], Ae > 3 && (We(t, u, M >> 5 & 8191), u += Fn[Ae]);
    } else
      We(t, u, V[M]), u += R[M];
  }
  return We(t, u, V[256]), u + R[256];
}, rs = /* @__PURE__ */ new Nn([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), ho = /* @__PURE__ */ new D(0), os = function(e, t, n, r, o, i) {
  var s = i.z || e.length, c = new D(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = c.subarray(r, c.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (a[0] = i.r >> 3);
    for (var f = rs[t - 1], d = f >> 13, v = f & 8191, m = (1 << n) - 1, _ = i.p || new F(32768), w = i.h || new F(m + 1), b = Math.ceil(n / 3), L = 2 * b, I = function(Zt) {
      return (e[Zt] ^ e[Zt + 1] << b ^ e[Zt + 2] << L) & m;
    }, A = new Nn(25e3), E = new F(288), k = new F(32), g = 0, y = 0, p = i.i || 0, N = 0, Se = i.w || 0, H = 0; p + 2 < s; ++p) {
      var Te = I(p), z = p & 32767, $ = w[Te];
      if (_[z] = $, w[Te] = z, Se <= p) {
        var V = s - p;
        if ((g > 7e3 || N > 24576) && (V > 423 || !l)) {
          u = sr(e, a, 0, A, E, k, y, N, H, p - H, u), N = g = y = 0, H = p;
          for (var R = 0; R < 286; ++R)
            E[R] = 0;
          for (var R = 0; R < 30; ++R)
            k[R] = 0;
        }
        var j = 2, oe = 0, Kt = v, Y = z - $ & 32767;
        if (V > 2 && Te == I(p - Y))
          for (var Ye = Math.min(d, V) - 1, be = Math.min(32767, p), W = Math.min(258, V); Y <= be && --Kt && z != $; ) {
            if (e[p + j] == e[p + j - Y]) {
              for (var M = 0; M < W && e[p + M] == e[p + M - Y]; ++M)
                ;
              if (M > j) {
                if (j = M, oe = Y, M > Ye)
                  break;
                for (var Ae = Math.min(Y, M - 2), Jn = 0, R = 0; R < Ae; ++R) {
                  var Gt = p - Y + R & 32767, oi = _[Gt], Kn = Gt - oi & 32767;
                  Kn > Jn && (Jn = Kn, $ = Gt);
                }
              }
            }
            z = $, $ = _[z], Y += z - $ & 32767;
          }
        if (oe) {
          A[N++] = 268435456 | yn[j] << 18 | or[oe];
          var Gn = yn[j] & 31, Qn = or[oe] & 31;
          y += Hn[Gn] + Fn[Qn], ++E[257 + Gn], ++k[Qn], Se = p + j, ++g;
        } else
          A[N++] = e[p], ++E[e[p]];
      }
    }
    for (p = Math.max(p, Se); p < s; ++p)
      A[N++] = e[p], ++E[e[p]];
    u = sr(e, a, l, A, E, k, y, N, H, p - H, u), l || (i.r = u & 7 | a[u / 8 | 0] << 3, u -= 7, i.h = w, i.p = _, i.i = p, i.w = Se);
  } else {
    for (var p = i.w || 0; p < s + l; p += 65535) {
      var Qt = p + 65535;
      Qt >= s && (a[u / 8 | 0] = l, Qt = s), u = mo(a, u + 1, e.subarray(p, Qt));
    }
    i.i = s;
  }
  return po(c, 0, r + fo(u) + o);
}, is = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), ss = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = is[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, as = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new D(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return os(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, _n = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, cs = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && _n(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, us = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function ls(e, t) {
  t || (t = {});
  var n = ss(), r = e.length;
  n.p(e);
  var o = as(e, t, us(t), 8), i = o.length;
  return cs(o, t), _n(o, i - 8, n.d()), _n(o, i - 4, r), o;
}
var ar = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), fs = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), ds = 0;
try {
  fs.decode(ho, { stream: !0 }), ds = 1;
} catch {
}
function ps(e, t) {
  var n;
  if (ar)
    return ar.encode(e);
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
  return po(o, 0, i);
}
function Ct(e) {
  try {
    return ls(ps(e));
  } catch {
    return null;
  }
}
const ms = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function hs(e) {
  if (!ms)
    return Ct(e);
  try {
    const t = new Response(e).body;
    if (!t) return Ct(e);
    const n = t.pipeThrough(
      new CompressionStream("gzip")
    ), r = await new Response(
      n
    ).arrayBuffer();
    return new Uint8Array(r);
  } catch {
    return Ct(e);
  }
}
const ys = "0.6.0", cr = 5e3, yo = 50, vo = 5e5, ur = 256e3, Nt = "replay", go = 8e4, _o = 32, vs = 2e7, gs = 5, _s = 1e3, ws = 6e4, Es = 500, Ht = 63e3;
let Me = 0, xe = 0, se = [], ot = 0, nn = null;
const Ft = /* @__PURE__ */ new Map();
let Oe = null, Pe = null, wn = null, it = !1;
function Ss() {
  try {
    return P().flushIntervalMs ?? cr;
  } catch {
    return cr;
  }
}
function wo(e) {
  let t = Ft.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, Ft.set(e, t)), t;
}
function Eo(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (x("compression_failures"), { body: t, encoding: "" });
}
async function So(e) {
  return Eo(await hs(e), e);
}
function Ts(e) {
  return Eo(Ct(e), e);
}
const bs = 64e3;
function En(e, t, n) {
  if (e === Nt)
    return {
      bytes: n ?? Pt(
        t,
        bs
      ),
      oversized: !1
    };
  const r = Pt(
    t,
    ur + 1
  );
  return {
    bytes: r,
    oversized: r > ur
  };
}
let Sn = null;
function As(e) {
  Sn = e;
}
function Xt(e) {
  x("transport_drops"), e === Nt && Sn && Sn();
}
const ks = "/v1/rum/ingest";
function Cs(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: ys
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
function Is(e, t, n) {
  const r = P();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const a = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, l = new Blob([n], {
      type: "application/json"
    });
    if (l.size < Ht && navigator.sendBeacon(a, l))
      return;
  }
  const { body: o, encoding: i } = Ts(n), s = { ...t };
  i ? s["Content-Encoding"] = i : delete s["Content-Encoding"];
  const c = o instanceof Blob ? o.size : n.length;
  fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: c < Ht,
    credentials: "omit"
  }).catch(() => {
    x("exit_send_failures");
  });
}
function rn(e, t, n, r) {
  const o = n.length;
  if (ot + o > vs) {
    x("retry_drops"), r && Xt(r);
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
  }), ot += o, To();
}
function To() {
  if (nn || se.length === 0)
    return;
  const e = se[0], t = Math.min(
    _s * Math.pow(2, e.attempts),
    ws
  );
  nn = setTimeout(() => {
    nn = null, bo();
  }, t);
}
async function bo() {
  for (; se.length > 0 && Me < go && xe < _o; ) {
    const e = se.shift();
    if (ot -= e.bytes, e.attempts++, e.attempts > gs) {
      x("retry_drops"), e.batchKey && Xt(e.batchKey);
      continue;
    }
    const t = e.bytes;
    Me += t, xe++;
    try {
      const { body: n, encoding: r } = await So(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < Ht,
        credentials: "omit"
      });
      if (ko(i), i.status === 429 || i.status >= 500) {
        se.unshift(e), ot += e.bytes;
        break;
      }
    } catch {
      se.unshift(e), ot += e.bytes;
      break;
    } finally {
      Me -= t, xe--;
    }
  }
  se.length > 0 && To();
}
function Ls() {
  Oe && (clearTimeout(Oe), Oe = null), Pe && (clearTimeout(Pe), Pe = null);
}
function Dn() {
  const e = Ss();
  Oe && clearTimeout(Oe), Oe = setTimeout(
    () => re(),
    e
  ), Pe || (Pe = setTimeout(
    () => {
      Pe = null, re();
    },
    e + Es
  ));
}
function Bn(e, t, n) {
  const { bytes: r, oversized: o } = En(
    e,
    t,
    n
  );
  if (o) {
    console.warn(
      `[@oodle-ai/rum] Dropping oversized ${e} payload (${r} bytes)`
    ), Xt(e);
    return;
  }
  const i = wo(e);
  if (i.items.push(t), i.bytesEstimate += r, !it && (i.items.length >= yo || i.bytesEstimate >= vo)) {
    re();
    return;
  }
  Dn();
}
function Rs(e, t, n) {
  const { bytes: r, oversized: o } = En(
    e,
    n
  );
  if (o) {
    Xt(e);
    return;
  }
  const i = wo(e), s = i.upsertMap.get(t);
  if (s !== void 0) {
    const c = En(
      e,
      i.items[s]
    ).bytes;
    i.items[s] = n, i.bytesEstimate += r - c;
  } else {
    const c = i.items.length;
    i.items.push(n), i.upsertMap.set(t, c), i.bytesEstimate += r;
  }
  if (!it && (i.items.length >= yo || i.bytesEstimate >= vo)) {
    re();
    return;
  }
  Dn();
}
function Ao(e) {
  wn = e;
}
const lr = ["events", "replay"];
function re(e = !1) {
  const t = P();
  if (e && wn && !it) {
    it = !0;
    try {
      wn();
    } catch {
    } finally {
      it = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    Dn();
    return;
  }
  Ls();
  const n = Yi(), r = [], o = Array.from(
    Ft.keys()
  ).sort((l, u) => {
    const f = lr.indexOf(l), d = lr.indexOf(u), v = f >= 0 ? f : 999, m = d >= 0 ? d : 999;
    return v - m;
  });
  for (const l of o) {
    const u = Ft.get(l);
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
  const i = Cs(r), s = `${t.endpoint}${ks}`, c = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, a = r.some(
    (l) => l.type === Nt
  );
  if (e) {
    Is(s, c, i);
    return;
  }
  Ms(
    s,
    c,
    i,
    a ? Nt : void 0
  );
}
async function Ms(e, t, n, r) {
  const o = n.length;
  if (Me >= go || xe >= _o) {
    rn(e, t, n, r);
    return;
  }
  Me += o, xe++;
  try {
    const { body: i, encoding: s } = await So(n), c = { ...t };
    s && (c["Content-Encoding"] = s);
    const a = await fetch(e, {
      method: "POST",
      headers: c,
      body: i,
      keepalive: o < Ht,
      credentials: "omit"
    });
    ko(a), (a.status === 429 || a.status >= 500) && rn(e, t, n, r);
  } catch {
    x("send_failures"), rn(e, t, n, r);
  } finally {
    Me -= o, xe--, bo();
  }
}
const Tn = /* @__PURE__ */ new Map();
function ko(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && Tn.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function Vt(e) {
  const t = Tn.get(e);
  return t ? Date.now() >= t ? (Tn.delete(e), !1) : !0 : !1;
}
let st = null, at = null, ct = null, bn = null;
function xs(e) {
  bn = e;
}
const Co = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function fr() {
  typeof document > "u" || (st = () => {
    document.visibilityState === "hidden" && re(!0);
  }, at = () => re(!0), ct = (e) => {
    e.persisted && bn && bn();
  }, document.addEventListener(
    "visibilitychange",
    st
  ), window.addEventListener(
    Co,
    at
  ), window.addEventListener(
    "pageshow",
    ct
  ));
}
function Os() {
  st && (document.removeEventListener(
    "visibilitychange",
    st
  ), st = null), at && (window.removeEventListener(
    Co,
    at
  ), at = null), ct && (window.removeEventListener(
    "pageshow",
    ct
  ), ct = null);
}
const Dt = /* @__PURE__ */ new Map();
function Ps(e, t) {
  Dt.set(e, t);
}
function Us() {
  return Dt.size === 0 ? {} : Object.fromEntries(Dt);
}
function Ns() {
  Dt.clear();
}
var An, ae, ut, Io, Bt, Lo = -1, Ee = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (Lo = t.timeStamp, e(t));
  }), !0);
}, qn = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, Yt = function() {
  var e = qn();
  return e && e.activationStart || 0;
}, B = function(e, t) {
  var n = qn(), r = "navigate";
  return Lo >= 0 ? r = "back-forward-cache" : n && (document.prerendering || Yt() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
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
}, zn = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, _t = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, Wt = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Ce = -1, dr = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, qt = function(e) {
  document.visibilityState === "hidden" && Ce > -1 && (Ce = e.type === "visibilitychange" ? e.timeStamp : 0, Hs());
}, pr = function() {
  addEventListener("visibilitychange", qt, !0), addEventListener("prerenderingchange", qt, !0);
}, Hs = function() {
  removeEventListener("visibilitychange", qt, !0), removeEventListener("prerenderingchange", qt, !0);
}, $n = function() {
  return Ce < 0 && (Ce = dr(), pr(), Ee((function() {
    setTimeout((function() {
      Ce = dr(), pr();
    }), 0);
  }))), { get firstHiddenTime() {
    return Ce;
  } };
}, wt = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, mr = [1800, 3e3], Ro = function(e, t) {
  t = t || {}, wt((function() {
    var n, r = $n(), o = B("FCP"), i = Ve("paint", (function(s) {
      s.forEach((function(c) {
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < r.firstHiddenTime && (o.value = Math.max(c.startTime - Yt(), 0), o.entries.push(c), n(!0)));
      }));
    }));
    i && (n = q(e, o, mr, t.reportAllChanges), Ee((function(s) {
      o = B("FCP"), n = q(e, o, mr, t.reportAllChanges), zn((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, hr = [0.1, 0.25], Fs = function(e, t) {
  t = t || {}, Ro(Wt((function() {
    var n, r = B("CLS", 0), o = 0, i = [], s = function(a) {
      a.forEach((function(l) {
        if (!l.hadRecentInput) {
          var u = i[0], f = i[i.length - 1];
          o && l.startTime - f.startTime < 1e3 && l.startTime - u.startTime < 5e3 ? (o += l.value, i.push(l)) : (o = l.value, i = [l]);
        }
      })), o > r.value && (r.value = o, r.entries = i, n());
    }, c = Ve("layout-shift", s);
    c && (n = q(e, r, hr, t.reportAllChanges), _t((function() {
      s(c.takeRecords()), n(!0);
    })), Ee((function() {
      o = 0, r = B("CLS", 0), n = q(e, r, hr, t.reportAllChanges), zn((function() {
        return n();
      }));
    })), setTimeout(n, 0));
  })));
}, Mo = 0, on = 1 / 0, St = 0, Ds = function(e) {
  e.forEach((function(t) {
    t.interactionId && (on = Math.min(on, t.interactionId), St = Math.max(St, t.interactionId), Mo = St ? (St - on) / 7 + 1 : 0);
  }));
}, xo = function() {
  return An ? Mo : performance.interactionCount || 0;
}, Bs = function() {
  "interactionCount" in performance || An || (An = Ve("event", Ds, { type: "event", buffered: !0, durationThreshold: 0 }));
}, K = [], It = /* @__PURE__ */ new Map(), Oo = 0, qs = function() {
  var e = Math.min(K.length - 1, Math.floor((xo() - Oo) / 50));
  return K[e];
}, zs = [], $s = function(e) {
  if (zs.forEach((function(o) {
    return o(e);
  })), e.interactionId || e.entryType === "first-input") {
    var t = K[K.length - 1], n = It.get(e.interactionId);
    if (n || K.length < 10 || e.duration > t.latency) {
      if (n) e.duration > n.latency ? (n.entries = [e], n.latency = e.duration) : e.duration === n.latency && e.startTime === n.entries[0].startTime && n.entries.push(e);
      else {
        var r = { id: e.interactionId, latency: e.duration, entries: [e] };
        It.set(r.id, r), K.push(r);
      }
      K.sort((function(o, i) {
        return i.latency - o.latency;
      })), K.length > 10 && K.splice(10).forEach((function(o) {
        return It.delete(o.id);
      }));
    }
  }
}, Po = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = Wt(e), document.visibilityState === "hidden" ? e() : (n = t(e), _t(e)), n;
}, yr = [200, 500], js = function(e, t) {
  "PerformanceEventTiming" in self && "interactionId" in PerformanceEventTiming.prototype && (t = t || {}, wt((function() {
    var n;
    Bs();
    var r, o = B("INP"), i = function(c) {
      Po((function() {
        c.forEach($s);
        var a = qs();
        a && a.latency !== o.value && (o.value = a.latency, o.entries = a.entries, r());
      }));
    }, s = Ve("event", i, { durationThreshold: (n = t.durationThreshold) !== null && n !== void 0 ? n : 40 });
    r = q(e, o, yr, t.reportAllChanges), s && (s.observe({ type: "first-input", buffered: !0 }), _t((function() {
      i(s.takeRecords()), r(!0);
    })), Ee((function() {
      Oo = xo(), K.length = 0, It.clear(), o = B("INP"), r = q(e, o, yr, t.reportAllChanges);
    })));
  })));
}, vr = [2500, 4e3], sn = {}, Xs = function(e, t) {
  t = t || {}, wt((function() {
    var n, r = $n(), o = B("LCP"), i = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - Yt(), 0), o.entries = [l], n());
      }));
    }, s = Ve("largest-contentful-paint", i);
    if (s) {
      n = q(e, o, vr, t.reportAllChanges);
      var c = Wt((function() {
        sn[o.id] || (i(s.takeRecords()), s.disconnect(), sn[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(a) {
        addEventListener(a, (function() {
          return Po(c);
        }), { once: !0, capture: !0 });
      })), _t(c), Ee((function(a) {
        o = B("LCP"), n = q(e, o, vr, t.reportAllChanges), zn((function() {
          o.value = performance.now() - a.timeStamp, sn[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, gr = [800, 1800], Vs = function e(t) {
  document.prerendering ? wt((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, Ys = function(e, t) {
  t = t || {};
  var n = B("TTFB"), r = q(e, n, gr, t.reportAllChanges);
  Vs((function() {
    var o = qn();
    o && (n.value = Math.max(o.responseStart - Yt(), 0), n.entries = [o], r(!0), Ee((function() {
      n = B("TTFB", 0), (r = q(e, n, gr, t.reportAllChanges))(!0);
    })));
  }));
}, Qe = { passive: !0, capture: !0 }, Ws = /* @__PURE__ */ new Date(), _r = function(e, t) {
  ae || (ae = t, ut = e, Io = /* @__PURE__ */ new Date(), No(removeEventListener), Uo());
}, Uo = function() {
  if (ut >= 0 && ut < Io - Ws) {
    var e = { entryType: "first-input", name: ae.type, target: ae.target, cancelable: ae.cancelable, startTime: ae.timeStamp, processingStart: ae.timeStamp + ut };
    Bt.forEach((function(t) {
      t(e);
    })), Bt = [];
  }
}, Js = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        _r(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, Qe), removeEventListener("pointercancel", i, Qe);
      };
      addEventListener("pointerup", o, Qe), addEventListener("pointercancel", i, Qe);
    })(t, e) : _r(t, e);
  }
}, No = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, Js, Qe);
  }));
}, wr = [100, 300], Ks = function(e, t) {
  t = t || {}, wt((function() {
    var n, r = $n(), o = B("FID"), i = function(a) {
      a.startTime < r.firstHiddenTime && (o.value = a.processingStart - a.startTime, o.entries.push(a), n(!0));
    }, s = function(a) {
      a.forEach(i);
    }, c = Ve("first-input", s);
    n = q(e, o, wr, t.reportAllChanges), c && (_t(Wt((function() {
      s(c.takeRecords()), c.disconnect();
    }))), Ee((function() {
      var a;
      o = B("FID"), n = q(e, o, wr, t.reportAllChanges), Bt = [], ut = -1, ae = null, No(addEventListener), a = i, Bt.push(a), Uo();
    })));
  }));
};
const Jt = "[REDACTED]", Gs = /* @__PURE__ */ new Set([
  "authorization",
  "proxy-authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  // Headers that carry the end user's IP address, which
  // proxies and CDNs add and some APIs echo back.
  "forwarded",
  "x-forwarded-for",
  "x-original-forwarded-for",
  "x-real-ip",
  "x-client-ip",
  "x-cluster-client-ip",
  "cf-connecting-ip",
  "true-client-ip",
  "fastly-client-ip"
]), Qs = /token|secret|auth|cookie|passw|api-?key|access-?key|session|csrf|xsrf|client-?ip|real-?ip|forwarded/;
function Zs(e) {
  return Gs.has(e) || Qs.test(e);
}
const ea = /passw|secret|token|apikey|accesskey|privatekey|authorization|credential|cardnumber|creditcard|cardnum|^pan$|cvv|cvc|securitycode|^ssn$|socialsecurity|^ip$|ipaddr|clientip|remoteaddr|remoteip|^ipv[46]$/;
function Er(e) {
  return e.toLowerCase().replace(/[-_.\s]/g, "");
}
function Ho(e) {
  const t = /* @__PURE__ */ new Set(), n = [];
  if (Array.isArray(e))
    for (const r of e)
      typeof r == "string" ? t.add(Er(r)) : r instanceof RegExp && n.push(r);
  return (r) => {
    const o = Er(r);
    if (ea.test(o) || t.has(o)) return !0;
    for (const i of n)
      if (i.lastIndex = 0, i.test(r)) return !0;
    return !1;
  };
}
function ta(e) {
  let t = 0, n = !1;
  for (let r = e.length - 1; r >= 0; r--) {
    let o = e.charCodeAt(r) - 48;
    n && (o *= 2, o > 9 && (o -= 9)), t += o, n = !n;
  }
  return t % 10 === 0;
}
const na = /\b\d(?:[ -]?\d){12,18}\b/g;
function ra(e) {
  return e.replace(na, (t) => {
    const n = t.replace(/[ -]/g, "");
    return n.length >= 13 && n.length <= 19 && n[0] >= "2" && n[0] <= "6" && ta(n) ? Jt : t;
  });
}
function kn(e, t, n) {
  if (n > 32 || e === null || typeof e != "object")
    return e;
  if (Array.isArray(e))
    return e.map((o) => kn(o, t, n + 1));
  const r = {};
  for (const [o, i] of Object.entries(e))
    r[o] = t(o) && i !== null && i !== "" ? Jt : kn(i, t, n + 1);
  return r;
}
const oa = /"((?:[^"\\]|\\.){1,200})"(\s*:\s*)("(?:[^"\\]|\\.)*"|[^\s,}\]]+)/g;
function ia(e, t) {
  return e.replace(
    oa,
    (n, r, o, i) => t(r) && i !== '""' && i !== "null" ? `"${r}"${o}"${Jt}"` : n
  );
}
function sa(e) {
  return /^[\w.%+-]+=[^&]*(&[\w.%+-]+=[^&]*)*$/.test(e);
}
function aa(e, t) {
  if (!e) return e;
  const n = e.trimStart();
  let r = e;
  if (n[0] === "{" || n[0] === "[")
    try {
      r = JSON.stringify(
        kn(JSON.parse(e), t, 0)
      );
    } catch {
      r = ia(e, t);
    }
  else if (sa(n))
    try {
      const o = new URLSearchParams(e);
      let i = !1;
      o.forEach((s, c) => {
        t(c) && s && (o.set(c, Jt), i = !0);
      }), i && (r = o.toString());
    } catch {
    }
  return ra(r);
}
const ca = 50, Sr = 200, Tr = /* @__PURE__ */ new Map();
function ua(e) {
  let t = Tr.get(e);
  return t || (t = {
    tokens: Sr,
    lastRefill: Date.now(),
    rate: ca,
    burst: Sr
  }, Tr.set(e, t)), t;
}
function la(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function fa(e) {
  const t = ua(e);
  return la(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let Cn = null, In = null;
function zc(e, t) {
  Cn = e, In = t;
}
const da = "00000000000000000000000000000000";
function Fo() {
  if (!Cn || !In) return null;
  try {
    const e = Cn.getSpan(
      In.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === da ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const br = 100, pa = 10, Ar = 5e3, ma = 3, ha = 0;
function ya(e, t = () => Date.now()) {
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
          const m = f.getId(v);
          m !== -1 && (u = m);
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
      f.tokens + d * pa
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function c(a) {
    var m, _, w;
    if (a.type !== ma)
      return { event: a, dropped: 0 };
    const l = a.data;
    if (!l || l.source !== ha || !l.attributes || l.attributes.length === 0)
      return { event: a, dropped: 0 };
    const u = l.attributes.length, f = l.attributes.filter(
      (b) => s(b.id)
    ), d = u - f.length;
    return d === 0 ? { event: a, dropped: 0 } : (l.attributes = f, {
      event: f.length > 0 || (((m = l.adds) == null ? void 0 : m.length) ?? 0) > 0 || (((_ = l.removes) == null ? void 0 : _.length) ?? 0) > 0 || (((w = l.texts) == null ? void 0 : w.length) ?? 0) > 0 ? a : null,
      dropped: d
    });
  }
  return { throttle: c, reset: o };
}
const kr = "replay", va = 200, ga = 6e4, _a = 5e3, wa = 8e6, Do = 2, Ea = 3, Sa = 4, Cr = 3e3, Bo = 5e3, Ta = 3, ba = 3e4, Aa = 5e3, ka = 16, Ca = 100, Ia = 4, La = 30, Ir = 32, Lr = 250, Ra = 36e4;
function Ma() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const xa = 3e5, Oa = 9e5, Pa = 1e3;
let ve = null, te = null, Ke = null, ze = [], $e = 0, Ie = "", jn = !1, qo = 0, an = "", Z = 0, ge = Date.now(), le = !1, mt = 0, me = null, je = !1, Ue = null, zo = 0, Q = [], J = 0, Ne = null, ce = null, Lt = 0;
function Xe() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const Xn = ya(
  () => (ve == null ? void 0 : ve.mirror) ?? null
);
let He = null, he = null, Fe = !1, ht = !1, Vn = 0, Rt = null, ee = null;
function Ua() {
  Ne && (clearTimeout(Ne), Ne = null), ce && (ce(), ce = null);
}
function Ln(e, t) {
  Ua();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    La
  ) : null, r = e ? Xe() + (n ?? Ia) : Number.POSITIVE_INFINITY;
  for (; J < Q.length; ) {
    const o = Math.min(
      J + Ir,
      Q.length
    );
    for (; J < o; )
      Rn(
        Q[J++]
      );
    if (Xe() >= r) break;
  }
  if (J >= Q.length) {
    Q = [], J = 0;
    return;
  }
  J >= Ir * 8 && (Q = Q.slice(J), J = 0), $o();
}
function zt() {
  Ln(!1);
}
function $o() {
  if (!Ne) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          ce = null, Ln(!0, t);
        },
        { timeout: Ca }
      );
      ce = () => cancelIdleCallback(e);
    }
    Ne = setTimeout(() => {
      Ne = null, ce && (ce(), ce = null), Ln(!0);
    }, ka);
  }
}
function yt(e = !1) {
  if (je = !0, Ue) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - ge, r = Math.max(
      0,
      Bo - n
    ), o = Date.now() - zo, i = Math.max(
      0,
      Aa - o
    );
    t = Math.max(
      r,
      i
    );
  }
  Ue = setTimeout(() => {
    Ue = null, Na();
  }, t);
}
function Na() {
  if (!je || !ve || !te || le) return;
  mt++;
  const e = Lt > Lr ? 1 : Ta;
  if (mt > e) {
    Da();
    return;
  }
  zo = Date.now(), Z = 0, ge = Date.now();
  try {
    const t = Xe();
    ve.takeFullSnapshot(!0), Lt = Xe() - t, x("replay_rebases"), Lt > Lr && x(
      "replay_expensive_snapshots"
    );
  } catch {
    gt(), vt();
  }
}
function Rr() {
  x("replay_events_dropped");
}
function jo() {
  if (Ie) return !1;
  Ie = ne(), qo = Hi();
  const e = an !== "" && an !== Ie;
  return an = Ie, e;
}
function Et() {
  if (Fa(), ze.length === 0) return;
  if (Vt(kr)) {
    Ha(), Xo();
    return;
  }
  jo();
  const e = Ie, t = qo, n = ze.splice(0), r = $e;
  $e = 0, Ie = "", jn = !0, Bn(
    kr,
    {
      session_id: e,
      segment_index: t,
      events: n
    },
    r
  );
}
function Ha() {
  $e <= wa || (x(
    "replay_events_dropped",
    ze.length
  ), ze.length = 0, $e = 0, yt());
}
let De = null;
function Fa() {
  De && (clearTimeout(De), De = null);
}
function Xo() {
  if (De) return;
  const e = P().replayFlushIntervalMs ?? _a;
  De = setTimeout(() => {
    De = null, Et();
  }, e);
}
function Rn(e) {
  jo() && e.type !== Do && yt(!0), ze.push(e), $e += Pt(e), ze.length >= va || $e >= ga ? Et() : Xo();
}
function Da() {
  le = !0, x("replay_overload_pauses"), gt(), me && clearTimeout(me), me = setTimeout(() => {
    me = null, le = !1, mt = 0, Z = 0, ge = Date.now(), !Fe && !ht && ee && vt();
  }, ba);
}
function Ba(e) {
  if (le) return;
  if (e.type === Do) {
    zt(), je = !1, Z = 0, ge = Date.now(), Rn(e);
    return;
  }
  if (e.type === Sa) {
    const r = e.data;
    typeof r.href == "string" && (r.href = mi(r.href));
  }
  if (e.type !== Ea) {
    zt(), Rn(e);
    return;
  }
  if (je) {
    Rr(), yt();
    return;
  }
  const t = Date.now();
  t - ge > Bo && (Z <= Cr && (mt = 0), Z = 0, ge = t);
  const n = Xn.throttle(e);
  if (n.dropped > 0 && x(
    "replay_attributes_throttled",
    n.dropped
  ), !!n.event) {
    if (Z++, Z > Cr) {
      Rr(), yt();
      return;
    }
    Q.push(n.event), $o();
  }
}
async function vt() {
  if (ee && !le && !te)
    return Ke || (Ke = qa().finally(
      () => {
        Ke = null;
      }
    ), Ke);
}
async function qa() {
  if (!ee) return;
  const { record: e } = await import("./rrweb-SbAupvcM.js");
  !ee || le || te || (ve = e, je = !1, Z = 0, ge = Date.now(), Xn.reset(), te = e({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: Ma() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: Ra,
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
        Ba(t);
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
    blockSelector: Gr,
    maskTextSelector: Qr,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => Et(), 200));
}
function gt() {
  te && (te(), te = null), Ue && (clearTimeout(Ue), Ue = null), je = !1, zt(), Et();
}
function za() {
  const e = P(), t = e.replayIdlePauseMs ?? xa, n = e.replayIdleExpireMs ?? Oa;
  He && clearTimeout(He), he && (clearTimeout(he), he = null), He = setTimeout(() => {
    Fe = !0, gt();
  }, t), he = setTimeout(() => {
    ht = !0, gt();
  }, n);
}
function Mt() {
  Vn = Xe(), za();
}
function $a() {
  if (ht) {
    if (!io()) return;
    ht = !1, Fe = !1, vt(), Mt();
    return;
  }
  if (Fe) {
    Fe = !1, vt(), Mt();
    return;
  }
  Xe() - Vn >= Pa && Mt();
}
function ja() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => $a(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  Rt = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function Xa() {
  Rt && (Rt(), Rt = null), He && (clearTimeout(He), He = null), he && (clearTimeout(he), he = null);
}
function Va() {
  zt(), Et();
}
async function Ya() {
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
  }, As(() => {
    te && yt();
  }), Ao(Va), await vt(), ja(), Mt();
}
function Wa() {
  return te !== null && !le;
}
function Ja() {
  return jn;
}
function Ka() {
  gt(), Xa(), Ao(null), me && (clearTimeout(me), me = null), Fe = !1, ht = !1, Vn = 0, le = !1, jn = !1, mt = 0, Z = 0, Lt = 0, Q = [], J = 0, Xn.reset(), ee = null, ve = null;
}
let U = [], pe = null;
const Ga = [
  "error",
  "action",
  "console",
  "resource"
];
function Qa(e) {
  return Ga.includes(e) && (Vt(e) || !fa(e)) ? (x("events_rate_limited"), !0) : !1;
}
function Za(e, t) {
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
function ec() {
  pe || (pe = {
    device_type: Mc(),
    browser_name: xc(),
    os_name: Oc(),
    user_agent: navigator.userAgent,
    language: navigator.language
  });
}
function Vo() {
  ec();
  const e = Di(), t = Us(), n = P(), r = {
    session_id: ne(),
    ...gi(
      co(),
      qi(),
      zi()
    ),
    user_status: $i(),
    service: n.service,
    env: n.env ?? "",
    version: n.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: Za(
      window.location,
      n.viewUrlQueryParams
    ),
    view_url_host: window.location.hostname,
    view_url_path: qe(window.location.pathname),
    referrer_url: hi(document.referrer),
    device_type: pe.device_type,
    browser_name: pe.browser_name,
    os_name: pe.os_name,
    user_agent: vi() ? pe.user_agent : "",
    language: pe.language,
    session_view_count: e.viewCount,
    session_error_count: e.errorCount,
    session_action_count: e.actionCount,
    replay_id: Wa() && Ja() ? ne() : ""
  };
  return Object.keys(t).length > 0 && (r.feature_flags = t), r;
}
function tc(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const Yo = "events", Mr = ["session_id", "event_type", "timestamp"];
let xr = !1;
function Wo(e) {
  const t = P().beforeSend;
  if (typeof t != "function") return e;
  const n = {};
  for (const i of Mr) n[i] = e[i];
  let r;
  try {
    r = t(e);
  } catch (i) {
    return xr || (xr = !0, (Ko ?? console.warn).call(
      console,
      `[@oodle-ai/rum] beforeSend threw. Events are dropped until it is fixed: ${String(i)}`
    )), null;
  }
  if (r === null || r === !1) return null;
  const o = r && typeof r == "object" ? r : e;
  for (const i of Mr) o[i] = n[i];
  return o;
}
function O(e) {
  if (!oo() || Vt("events")) return;
  const t = e(), n = t.event_type;
  if (Qa(n)) return;
  n === "resource" && gc(t), ao(n);
  const r = Wo({ ...Vo(), ...t });
  r && Bn(Yo, r);
}
function Yn(e) {
  tc(
    () => O(e)
  );
}
function nc(e) {
  if (!oo() || Vt("events")) return;
  const t = e(), n = t.event_type;
  ao(n);
  const r = Vo(), o = Wo({ ...r, ...t });
  if (!o) return;
  const i = r.session_id + ":" + r.view_url_path;
  Rs(Yo, i, o);
}
function rc() {
  oc(), uc(), pc(), mc(), Cc(), bc(), Ac(), kc(), Ic(), lc();
}
function oc() {
  const e = (n) => {
    O(() => {
      var i, s, c;
      const r = n.message ?? "", o = typeof ((i = n.error) == null ? void 0 : i.message) == "string" ? n.error.message : r;
      return {
        event_type: "error",
        error_message: jt(r),
        error_type: ((s = n.error) == null ? void 0 : s.name) ?? "Error",
        error_stack: Kr(
          ((c = n.error) == null ? void 0 : c.stack) ?? "",
          o
        ),
        error_source: "source"
      };
    });
  }, t = (n) => Jo(n.reason);
  window.addEventListener("error", e), window.addEventListener(
    "unhandledrejection",
    t
  ), Mn = !0, U.push(() => {
    window.removeEventListener("error", e), window.removeEventListener(
      "unhandledrejection",
      t
    ), Mn = !1;
  });
}
let Mn = !1;
function Jo(e) {
  O(() => {
    const t = (e == null ? void 0 : e.message) ?? String(e);
    return {
      event_type: "error",
      error_message: jt(t),
      error_type: (e == null ? void 0 : e.name) ?? "UnhandledRejection",
      error_stack: Kr((e == null ? void 0 : e.stack) ?? "", t),
      error_source: "promise"
    };
  });
}
let Or = !1;
function $c() {
  const e = globalThis.Zone;
  if (Or || !e || typeof e.__symbol__ != "function")
    return;
  Or = !0;
  const t = e.__symbol__("unhandledPromiseRejectionHandler"), n = e[t];
  e[t] = function(r) {
    if (Mn && Jo(
      r && typeof r == "object" && "rejection" in r ? r.rejection : r
    ), typeof n == "function")
      return n.call(this, r);
  };
}
function ic(e) {
  return e instanceof Error || typeof e == "object" && e !== null && typeof e.message == "string" && typeof e.name == "string" && "stack" in e;
}
const Be = 8192;
function sc(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${Be} bytes omitted]`;
}
function ac(e) {
  if (typeof e == "string") return e;
  if (ic(e))
    return e.message ? `${e.name}: ${e.message}` : e.name;
  if (Pt(
    e,
    Be + 1
  ) > Be)
    return sc(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function cc(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= Be) break;
    t && (t += " "), t += ac(n);
  }
  return t.length > Be ? t.slice(0, Be) + "… [truncated]" : t;
}
let Ko = null;
function uc() {
  Ko = console.warn;
  for (const e of yi()) {
    const t = console[e];
    console[e] = (...n) => {
      const r = jt(cc(n));
      O(() => ({
        event_type: "console",
        console_level: e,
        console_message: r
      })), t.apply(console, n);
    }, U.push(() => {
      console[e] = t;
    });
  }
}
const S = {};
let ye = null, xt = 0, Pr = "";
function Go() {
  const e = JSON.stringify(S);
  if (e === Pr) return;
  Pr = e, xt = 0;
  const t = S.page_load_ms || S.lcp || S.dom_complete_ms || 0, n = t > 0;
  nc(() => ({
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
  xt || (xt = e);
  const t = e - xt, n = Math.max(0, 5e3 - t);
  ye && clearTimeout(ye), ye = setTimeout(() => {
    ye = null, Go();
  }, n);
}
function lc() {
  if (typeof document > "u") return;
  const e = () => {
    document.visibilityState === "hidden" && (ye && (clearTimeout(ye), ye = null), Go());
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
const xn = "oodle_rum_tab_hidden";
function Ur(e) {
  try {
    e ? sessionStorage.setItem(xn, "1") : sessionStorage.removeItem(xn);
  } catch {
  }
}
function fc() {
  try {
    return sessionStorage.getItem(xn) === "1";
  } catch {
    return !1;
  }
}
function dc() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && fc() && (Ur(!1), O(() => ({
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
function pc() {
  Xs((e) => {
    S.lcp = e.value, de();
  }), Ks((e) => {
    S.fid = e.value, de();
  }), js((e) => {
    S.inp = e.value, de();
  }), Fs((e) => {
    S.cls = e.value, de();
  }), Ro((e) => {
    S.fcp = e.value, de();
  }), Ys((e) => {
    S.ttfb = e.value, de();
  });
}
function Wn(e) {
  const t = P().endpoint;
  return e.startsWith(t);
}
function mc() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || Wn(r.name))
          continue;
        const i = dt(r.name), s = r.duration, c = r.transferSize ?? 0, a = o;
        Yn(
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
function $t(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function hc(e) {
  try {
    return new URL(e, location.href).href;
  } catch {
    return e;
  }
}
function cn(e, t, n) {
  return n.some(
    (r) => typeof r == "string" ? e.startsWith(r) || t.startsWith(r) : r.test(e) || r.test(t)
  );
}
function Qo(e) {
  const t = hc(e), n = P();
  let r = !1;
  const o = n.allowedTracingUrls;
  o && o.length > 0 && (r = cn(
    t,
    e,
    o
  ));
  let i = null;
  const s = n.forwardNetworkBodies;
  s && cn(
    t,
    e,
    s.urls
  ) && (i = s);
  let c = !1;
  const a = n.forwardNetworkHeaders;
  return a && (c = cn(
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
let Nr = null, un = /* @__PURE__ */ new Set(), ln = [];
function lt(e) {
  if (Zs(e)) return !0;
  const t = P().redactHeaders;
  if (!t) return !1;
  if (t !== Nr && (Nr = t, un = /* @__PURE__ */ new Set(), ln = [], Array.isArray(t)))
    for (const n of t)
      typeof n == "string" ? un.add(n.toLowerCase()) : n instanceof RegExp && ln.push(n);
  if (un.has(e)) return !0;
  for (const n of ln)
    if (n.lastIndex = 0, n.test(e)) return !0;
  return !1;
}
function yc(e) {
  const t = {};
  for (const n of Object.keys(e)) {
    const r = n.toLowerCase();
    lt(r) || (t[r] = e[n]);
  }
  return t;
}
const Hr = [
  "request_headers",
  "response_headers",
  "request_body",
  "response_body"
];
let Fr = !1;
function Dr(e) {
  if (!(typeof e != "string" || !e))
    try {
      const t = JSON.parse(e);
      return t && typeof t == "object" ? t : void 0;
    } catch {
      return;
    }
}
function Br(e) {
  if (!e || typeof e != "object") return "";
  const t = {};
  for (const [n, r] of Object.entries(e))
    r != null && (t[n.toLowerCase()] = String(r));
  return Object.keys(t).length > 0 ? JSON.stringify(t) : "";
}
let qr = null, zr = Ho(void 0);
function vc() {
  const e = P().redactBodyKeys;
  return e !== qr && (qr = e, zr = Ho(e)), zr;
}
function gc(e) {
  var c;
  if (!Hr.some((a) => e[a])) return;
  for (const a of ["request_body", "response_body"])
    typeof e[a] == "string" && e[a] && (e[a] = aa(e[a], vc()));
  const t = P().beforeSendNetwork;
  if (typeof t != "function") return;
  const n = {
    url: String(e.resource_url ?? ""),
    method: String(e.resource_method ?? ""),
    status: Number(e.resource_status ?? 0),
    requestHeaders: Dr(e.request_headers),
    responseHeaders: Dr(e.response_headers),
    requestBody: typeof e.request_body == "string" ? e.request_body : void 0,
    responseBody: typeof e.response_body == "string" ? e.response_body : void 0
  };
  let r;
  try {
    const a = t(n);
    r = a === void 0 ? n : a;
  } catch (a) {
    Fr || (Fr = !0, console.warn(
      `[@oodle-ai/rum] beforeSendNetwork threw. Captured headers and bodies are dropped until it is fixed: ${String(a)}`
    )), r = null;
  }
  for (const a of Hr) delete e[a];
  if (!r || typeof r != "object") return;
  const o = ((c = P().forwardNetworkBodies) == null ? void 0 : c.maxBodySize) ?? 65536, i = Br(r.requestHeaders), s = Br(r.responseHeaders);
  i && (e.request_headers = i), s && (e.response_headers = s), typeof r.requestBody == "string" && r.requestBody && (e.request_body = ue(r.requestBody, o)), typeof r.responseBody == "string" && r.responseBody && (e.response_body = ue(r.responseBody, o));
}
function Zo(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      lt(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      lt(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      lt(r) || (t[r] = e[n]);
    }
  return t;
}
function _c(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    lt(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function ue(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function wc(e, t) {
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
function Ec(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function Sc(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      Zo(
        e
      )
    );
  } catch {
    return "";
  }
}
function $r(e) {
  try {
    return JSON.stringify(
      Zo(e)
    );
  } catch {
    return "";
  }
}
function ei(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function Tc(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: ue(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: ue(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : ei(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => ue(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function ti(e, t, n) {
  const r = function(o, i) {
    const s = Ec(o);
    if (Wn(s))
      return t.apply(e, [
        o,
        i
      ]);
    const c = ei(o), a = ((i == null ? void 0 : i.method) ?? (c ? o.method : "GET")).toUpperCase(), l = performance.now(), u = Qo(s);
    let f = "", d = "";
    if (n.injectTracing) {
      const w = Fo();
      if (w)
        f = w.traceId, d = w.spanId;
      else if (u.trace) {
        f = $t(16), d = $t(8);
        const b = new Headers(
          (i == null ? void 0 : i.headers) ?? {}
        );
        b.set(
          "traceparent",
          `00-${f}-${d}-01`
        ), i = { ...i, headers: b };
      }
    }
    let v = "", m = null;
    if (u.bodyCfg) {
      const w = u.bodyCfg.maxBodySize ?? 65536, b = Tc(
        i,
        o,
        w
      );
      v = b.sync, m = b.asyncP;
    }
    let _ = "";
    return u.captureHeaders && (i != null && i.headers ? _ = Sc(
      i.headers
    ) : c && (_ = $r(
      o.headers
    ))), t.apply(e, [o, i]).then((w) => {
      const b = w.status, L = Math.round(
        performance.now() - l
      );
      let I = "";
      u.captureHeaders && (I = $r(
        w.headers
      ));
      const A = (k) => {
        const g = {
          event_type: "resource",
          resource_url: dt(s),
          resource_method: a,
          resource_status: b,
          resource_duration_ms: L,
          resource_size: 0,
          resource_type: "fetch"
        };
        return f && (g.trace_id = f, g.span_id = d), k && (g.request_body = k), _ && (g.request_headers = _), I && (g.response_headers = I), g;
      }, E = m || Promise.resolve(v);
      if (u.bodyCfg) {
        const k = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          E,
          wc(
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
      throw (m || Promise.resolve(v)).then((I) => {
        O(() => {
          const A = {
            event_type: "resource",
            resource_url: dt(s),
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
function ni(e, t, n) {
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
    const a = Qo(c);
    let l = "", u = "";
    if (n.injectTracing) {
      const E = Fo();
      E ? (l = E.traceId, u = E.spanId) : a.trace && (l = $t(16), u = $t(8), i.call(
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
        const E = this.__oodleReqHeaders, k = E ? yc(E) : {};
        Object.keys(k).length > 0 && (d = JSON.stringify(k));
      } catch {
      }
    const v = performance.now(), m = this, _ = l, w = u, b = f, L = a.bodyCfg, I = d, A = a.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        const E = Math.round(
          performance.now() - v
        ), k = m.__oodleMethod ?? "GET";
        O(() => {
          const g = {
            event_type: "resource",
            resource_url: dt(c),
            resource_method: k,
            resource_status: m.status,
            resource_duration_ms: E,
            resource_size: 0,
            resource_type: "xhr"
          };
          if (_ && (g.trace_id = _, g.span_id = w), b && (g.request_body = b), L)
            try {
              const y = m.responseText ?? "";
              g.response_body = ue(
                y,
                L.maxBodySize ?? 65536
              );
            } catch {
            }
          if (I && (g.request_headers = I), A)
            try {
              const y = m.getAllResponseHeaders();
              y && (g.response_headers = JSON.stringify(
                _c(y)
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
const ri = {
  injectTracing: !0
}, jr = {
  injectTracing: !1
};
function bc() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = ti(
    window,
    window.fetch,
    ri
  );
  U.push(e);
}
function Ac() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = ni(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    ri
  );
  U.push(e);
}
const Xr = /* @__PURE__ */ new WeakSet();
function fn(e) {
  if (Xr.has(e)) return;
  Xr.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (ti(
        n,
        n.fetch,
        jr
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (ni(
        r.prototype,
        r.prototype.setRequestHeader,
        jr
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), U.push(() => {
    e.removeEventListener("load", t);
  });
}
function kc() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach(fn);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          r instanceof HTMLIFrameElement && fn(r), r instanceof HTMLElement && r.childElementCount > 0 && r.querySelectorAll("iframe").forEach(fn);
    }
  );
  e.observe(document.documentElement, {
    childList: !0,
    subtree: !0
  }), U.push(() => {
    e.disconnect();
  });
}
function Cc() {
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
function Ic() {
  if (!(typeof PerformanceObserver > "u") && !Lc())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            Yn(() => ({
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
function Lc() {
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
          Yn(() => ({
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
function dn() {
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
function Rc(e, t) {
  O(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function Mc() {
  const e = navigator.userAgent;
  return /Mobi|Android/i.test(e) ? "mobile" : /Tablet|iPad/i.test(e) ? "tablet" : "desktop";
}
function xc() {
  const e = navigator.userAgent;
  return e.includes("Firefox") ? "Firefox" : e.includes("Edg/") ? "Edge" : e.includes("Chrome") ? "Chrome" : e.includes("Safari") ? "Safari" : "Other";
}
function Oc() {
  const e = navigator.userAgent;
  return e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : e.includes("Android") ? "Android" : /iPhone|iPad|iPod/.test(e) ? "iOS" : "Other";
}
function Pc() {
  for (const e of U)
    e();
  U = [];
}
const Vr = typeof MutationObserver < "u" ? MutationObserver : null;
let fe = !1, bt = null, At = null, ft = null, Ot = null;
const jc = {
  init(e) {
    fe || Ri(e) && (Xi(e.tags), Ni(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), fe = !0, dc(), fr(), Fi(), Gi(), xs(() => {
      fr();
    }), e.sessionReplay !== !1 && io() && Ya(), rc(), bt = Uc(), At = Nc(), e.openTelemetry && import("./tracing-FqaghMDy.js").then(
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
    Vi(e);
  },
  identify(e) {
    Bi(e);
  },
  trackEvent(e, t) {
    fe && Rc(e, t);
  },
  addFeatureFlag(e, t) {
    Ps(e, t);
  },
  getSessionId() {
    return fe ? ne() : "";
  },
  getUserId() {
    return co();
  },
  flush() {
    fe && re();
  },
  stop() {
    fe && (Ka(), Pc(), Qi(), so(), re(!0), Ns(), Os(), bt && (bt(), bt = null), At && (At(), At = null), Ze(), fe = !1);
  }
};
function Uc() {
  if (typeof window > "u") return null;
  const e = history.pushState;
  history.pushState = function(...r) {
    e.apply(this, r), dn();
  };
  const t = history.replaceState;
  history.replaceState = function(...r) {
    t.apply(this, r), dn();
  };
  const n = () => dn();
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
  ft && (ft.disconnect(), ft = null), Ot && (clearTimeout(Ot), Ot = null);
}
function Nc() {
  if (typeof document > "u")
    return null;
  const e = 3, t = 1e3, n = 1e3;
  let r = [];
  const o = (s) => {
    var L;
    const c = s.target;
    if (!c) return;
    const a = Dc(c), l = ((L = c.tagName) == null ? void 0 : L.toLowerCase()) ?? "", u = Hc(c), f = u === null && Ii(c), d = u ?? (f ? "" : (c.textContent ?? "").trim().slice(0, 200)), v = u !== null ? `${l}[${u}]` : Fc(c, l, d, f), m = Date.now(), _ = s.clientX, w = s.clientY;
    if (r.push({ selector: a, time: m }), r = r.filter(
      (I) => m - I.time < t
    ), r.filter(
      (I) => I.selector === a
    ).length >= e) {
      Tt(
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
    Ze(), Vr && (ft = new Vr(() => {
      Ze(), Tt(
        "click",
        c,
        a,
        l,
        !1,
        u,
        f
      );
    }), ft.observe(
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
const Yr = "data-oodle-action-name";
function Hc(e) {
  var t;
  try {
    const n = typeof e.closest == "function" ? e.closest(`[${Yr}]`) : null, r = (t = n == null ? void 0 : n.getAttribute(Yr)) == null ? void 0 : t.trim();
    return r ? r.slice(0, 200) : null;
  } catch {
    return null;
  }
}
function Fc(e, t, n, r = !1) {
  if (r) return Wr(e, t);
  const o = e.getAttribute("aria-label");
  if (o)
    return `${t}[${o}]`;
  const i = e.getAttribute("title");
  if (i) return `${t}[${i}]`;
  const s = n.split(`
`)[0].trim();
  return s && s.length <= 80 ? `${t}[${s}]` : Wr(e, t);
}
function Wr(e, t) {
  if (e.id) return `${t}#${e.id}`;
  const n = Array.from(
    e.classList ?? []
  ).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
function Dc(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(
    e.classList ?? []
  ).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
export {
  jc as O,
  qc as a,
  $c as c,
  Bc as r,
  zc as s
};
