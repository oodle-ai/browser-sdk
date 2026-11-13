const At = [
  "error",
  "warn"
];
function Fo() {
  return {
    patterns: [],
    maskFn: null,
    referrer: "path",
    consoleLevels: At,
    messages: "full",
    actionText: "full",
    userAgent: "full"
  };
}
let R = Fo();
const Zt = "/:redacted", Do = 256, Je = /* @__PURE__ */ new Map();
let ln = !1;
function ge(e) {
  console.warn("[@oodle-ai/rum] " + e);
}
function wt(e, t, n, r, o) {
  return t === void 0 ? r : typeof t == "string" && n.includes(t) ? t : (ge(
    `${e} must be one of ${n.map((i) => `'${i}'`).join(", ")}. Using '${o}'.`
  ), o);
}
function No(e) {
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
function Ho(e) {
  if (e === void 0) return [];
  if (!Array.isArray(e))
    return ge(
      "urlPathPatterns must be an array of path patterns such as '/projects/:id'. It is ignored."
    ), [];
  const t = [];
  for (const n of e) {
    const r = No(n);
    r ? t.push(r) : ge(
      `urlPathPatterns: ${JSON.stringify(n)} is not a valid pattern. Patterns start with '/', use ':name' for one segment and may end in '/*'. It is ignored.`
    );
  }
  return t;
}
function Bo(e) {
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
function qo(e) {
  Je.clear(), ln = !1;
  const t = e.maskUrlPath;
  t !== void 0 && typeof t != "function" && ge("maskUrlPath must be a function. It is ignored."), R = {
    patterns: Ho(e.urlPathPatterns),
    maskFn: typeof t == "function" ? t : null,
    referrer: wt(
      "referrerUrl",
      e.referrerUrl,
      ["path", "origin", "none"],
      "path",
      "none"
    ),
    consoleLevels: Bo(
      e.consoleLevels
    ),
    messages: wt(
      "errorMessages",
      e.errorMessages,
      ["full", "scrub", "none"],
      "full",
      "none"
    ),
    // Text the replay masks must not reappear in click events.
    actionText: wt(
      "actionText",
      e.actionText,
      ["full", "mask"],
      e.privacyLevel === "mask" ? "mask" : "full",
      "mask"
    ),
    userAgent: wt(
      "userAgent",
      e.userAgent,
      ["full", "none"],
      "full",
      "none"
    )
  };
}
function kr() {
  return R.patterns.length > 0 || R.maskFn !== null;
}
function zo(e) {
  const t = e.split("/").slice(1), n = t.length > 0 && t[t.length - 1] === "";
  n && t.pop();
  for (const r of R.patterns) {
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
function Xo(e) {
  let t = R.patterns.length > 0 ? zo(e) : e;
  if (R.maskFn)
    try {
      const n = R.maskFn(t);
      t = typeof n == "string" ? n : Zt;
    } catch (n) {
      ln || (ln = !0, ge(
        `maskUrlPath threw. Paths are sent as '${Zt}' until it is fixed: ${String(n)}`
      )), t = Zt;
    }
  return t;
}
function Be(e) {
  if (!kr()) return e;
  const t = Je.get(e);
  if (t !== void 0) return t;
  const n = Xo(e);
  return Je.size >= Do && Je.clear(), Je.set(e, n), n;
}
function $o(e) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(e);
}
function lt(e, t) {
  if ($o(e)) {
    let n;
    try {
      n = new URL(e);
    } catch {
      return e;
    }
    return n.protocol !== "http:" && n.protocol !== "https:" ? n.protocol === "data:" ? "data:" : n.origin + n.pathname : n.origin + Be(n.pathname);
  }
  try {
    const n = new URL(
      e,
      t ?? (typeof location < "u" ? location.href : "http://localhost/")
    );
    return Be(n.pathname);
  } catch {
    const n = e.search(/[?#]/);
    return n >= 0 ? e.slice(0, n) : e;
  }
}
function Yo(e) {
  if (!kr() || typeof e != "string")
    return e;
  let t;
  try {
    t = new URL(e);
  } catch {
    return e;
  }
  return t.protocol !== "http:" && t.protocol !== "https:" ? e : t.origin + Be(t.pathname) + t.search + t.hash;
}
let Vn = null, Wn = "", jn = null;
function Vo(e) {
  if (e === Vn && jn === R)
    return Wn;
  let t = "";
  if (e && R.referrer !== "none")
    try {
      const n = new URL(e);
      t = R.referrer === "origin" ? n.origin : n.origin + Be(n.pathname);
    } catch {
      t = R.referrer === "origin" ? "" : e;
    }
  return Vn = e, Wn = t, jn = R, t;
}
function Wo() {
  return R.consoleLevels;
}
function jo() {
  return R.userAgent === "full";
}
const Go = [
  [/(^|[^\w])'(?:[^'\\\n]|\\.){0,500}'/g, "$1'?'"],
  [/(^|[^\w])"(?:[^"\\\n]|\\.){0,500}"/g, '$1"?"'],
  [/(^|[^\w])`(?:[^`\\\n]|\\.){0,500}`/g, "$1`?`"]
], Jo = /\bhttps?:\/\/[^\s'"`<>()\]]+/g, Ko = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, Qo = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, Zo = /\b(?=[0-9a-fA-F]*\d)(?=[0-9a-fA-F]*[a-fA-F])[0-9a-fA-F]{16,}\b/g, ei = /\d{4,}/g;
function ti(e) {
  if (!e) return e;
  let t = e.replace(Ko, "<email>");
  t = t.replace(Jo, (n) => {
    const r = lt(n);
    return r === n ? "<url>" : r;
  });
  for (const [n, r] of Go)
    t = t.replace(n, r);
  return t = t.replace(Qo, "<id>"), t = t.replace(Zo, "<id>"), t = t.replace(ei, "<n>"), t;
}
const ni = /^\s+at |^[^\s@]*@\S+:\d+(?::\d+)?$/m;
function Pt(e) {
  switch (R.messages) {
    case "full":
      return e;
    case "scrub":
      return ti(e);
    default:
      return "";
  }
}
function Gn(e, t) {
  if (R.messages === "full" || !e || !t) return e;
  const n = ni.exec(e), r = n ? n.index : e.length, o = e.indexOf(t);
  if (o < 0 || o + t.length > r)
    return e;
  const i = Pt(t);
  let s = e.slice(0, o) + i;
  return i || (s = s.replace(/:\s*$/, "")), s + e.slice(o + t.length);
}
const xr = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', Or = '[data-oodle-privacy="mask"],.oodle-privacy-mask', ri = xr + "," + Or + ",.rr-block,.rr-mask";
function oi(e) {
  if (R.actionText === "mask") return !0;
  try {
    return typeof e.closest == "function" && e.closest(ri) !== null;
  } catch {
    return !0;
  }
}
let fn = null;
function ii(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function si(e) {
  return ii(e.endpoint) ? (typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  ), qo(e), fn = {
    ...e,
    viewUrlQueryParams: ai(
      e.viewUrlQueryParams
    )
  }, !0) : (console.error(
    `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
  ), !1);
}
function ai(e) {
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
const Pr = "__oodle_session", ci = 1800 * 1e3, ui = 14400 * 1e3;
function li() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
function fi() {
  try {
    const e = sessionStorage.getItem(Pr);
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
function Ur(e) {
  try {
    sessionStorage.setItem(
      Pr,
      JSON.stringify(e)
    );
  } catch {
  }
}
let Me = null;
function Fr(e) {
  Me || (Me = setTimeout(() => {
    Me = null, Ur(e);
  }, 1e3));
}
function In(e) {
  Me && (clearTimeout(Me), Me = null), Ur(e);
}
let h = null, Dr = 100, Nr = 100;
function di(e, t) {
  Dr = Math.max(
    0,
    Math.min(100, e)
  ), Nr = Math.max(
    0,
    Math.min(100, t)
  );
}
function Jn(e) {
  return Math.random() * 100 < e;
}
function te() {
  const e = Date.now();
  if (h || (h = fi()), !h || e - h.lastActivity > ci || e - h.createdAt > ui) {
    const t = Jn(Dr);
    h = {
      id: li(),
      createdAt: e,
      lastActivity: e,
      viewCount: 0,
      errorCount: 0,
      actionCount: 0,
      sampled: t,
      replaySampled: t && Jn(Nr),
      replaySegmentSeq: 0
    }, In(h);
  } else
    h.lastActivity = e, Fr(h);
  return h.id;
}
function pi() {
  if (te(), !h) return 0;
  const e = h.replaySegmentSeq;
  return h.replaySegmentSeq = e + 1, In(h), e;
}
function Hr() {
  return te(), (h == null ? void 0 : h.sampled) ?? !0;
}
function Br() {
  return te(), (h == null ? void 0 : h.replaySampled) ?? !0;
}
let Ze = null;
function mi() {
  typeof document > "u" || (qr(), Ze = () => {
    document.visibilityState === "hidden" && h && In(h);
  }, document.addEventListener(
    "visibilitychange",
    Ze
  ));
}
function qr() {
  Ze && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    Ze
  ), Ze = null);
}
function zr(e) {
  te(), h && (e === "view" || e === "page_load" ? h.viewCount++ : e === "error" ? h.errorCount++ : e === "action" && h.actionCount++, Fr(h));
}
function hi() {
  return te(), {
    viewCount: (h == null ? void 0 : h.viewCount) ?? 0,
    errorCount: (h == null ? void 0 : h.errorCount) ?? 0,
    actionCount: (h == null ? void 0 : h.actionCount) ?? 0
  };
}
let $ = null;
function vi(e) {
  $ = e;
}
function Xr() {
  return ($ == null ? void 0 : $.id) ?? "";
}
function yi() {
  return ($ == null ? void 0 : $.name) ?? "";
}
function gi() {
  return ($ == null ? void 0 : $.email) ?? "";
}
function _i() {
  return $ ? "identified" : "anonymous";
}
const wi = 5e5;
function Ut(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > wi) return n;
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
let ft = {};
function Ti(e) {
  e && (ft = { ...e, ...ft });
}
function Ei(e) {
  ft = { ...ft, ...e };
}
function Si() {
  return ft;
}
const bi = 6e4, Ai = "sdk_telemetry", Ie = {
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
  Ie[e] += t;
}
function Ci() {
  for (const e in Ie)
    if (Ie[e] > 0)
      return !0;
  return !1;
}
function dn() {
  if (!Ci()) return;
  const e = { ...Ie };
  for (const t in Ie)
    Ie[t] = 0;
  On(Ai, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let et = null, tt = null;
function Mi() {
  et || (et = setInterval(
    dn,
    bi
  ), typeof document < "u" && (tt = () => {
    document.visibilityState === "hidden" && dn();
  }, document.addEventListener(
    "visibilitychange",
    tt
  )));
}
function Ii() {
  et && (clearInterval(et), et = null), tt && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    tt
  ), tt = null), dn();
}
var N = Uint8Array, D = Uint16Array, Ln = Int32Array, Rn = new N([
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
]), kn = new N([
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
]), Kn = new N([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), $r = function(e, t) {
  for (var n = new D(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new Ln(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, Yr = $r(Rn, 2), Li = Yr.b, pn = Yr.r;
Li[28] = 258, pn[258] = 28;
var Ri = $r(kn, 0), Qn = Ri.r, mn = new D(32768);
for (var b = 0; b < 32768; ++b) {
  var ie = (b & 43690) >> 1 | (b & 21845) << 1;
  ie = (ie & 52428) >> 2 | (ie & 13107) << 2, ie = (ie & 61680) >> 4 | (ie & 3855) << 4, mn[b] = ((ie & 65280) >> 8 | (ie & 255) << 8) >> 1;
}
var nt = (function(e, t, n) {
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
var ki = /* @__PURE__ */ nt(_e, 9, 0), xi = /* @__PURE__ */ nt(Ft, 5, 0), Vr = function(e) {
  return (e + 7) / 8 | 0;
}, Wr = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new N(e.subarray(t, n));
}, J = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, We = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, en = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: Gr, l: 0 };
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
    var r = 0, _ = 0, E = m - t, S = 1 << E;
    for (i.sort(function(C, g) {
      return y[g.s] - y[C.s] || C.f - g.f;
    }); r < o; ++r) {
      var M = i[r].s;
      if (y[M] > t)
        _ += S - (1 << m - y[M]), y[M] = t;
      else
        break;
    }
    for (_ >>= E; _ > 0; ) {
      var I = i[r].s;
      y[I] < t ? _ -= 1 << t - y[I]++ - 1 : ++r;
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
}, Zn = function(e) {
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
}, je = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, jr = function(e, t, n) {
  var r = n.length, o = Vr(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, er = function(e, t, n, r, o, i, s, c, a, l, u) {
  J(t, u++, n), ++o[256];
  for (var f = en(o, 15), d = f.t, y = f.l, m = en(i, 15), _ = m.t, E = m.l, S = Zn(d), M = S.c, I = S.n, A = Zn(_), w = A.c, C = A.n, g = new D(19), v = 0; v < M.length; ++v)
    ++g[M[v] & 31];
  for (var v = 0; v < w.length; ++v)
    ++g[w[v] & 31];
  for (var p = en(g, 7), U = p.t, Te = p.l, F = 19; F > 4 && !U[Kn[F - 1]]; --F)
    ;
  var Ee = l + 5 << 3, q = je(o, _e) + je(i, Ft) + s, z = je(o, d) + je(i, _) + s + 14 + 3 * F + je(g, U) + 2 * g[16] + 3 * g[17] + 7 * g[18];
  if (a >= 0 && Ee <= q && Ee <= z)
    return jr(t, u, e.subarray(a, a + l));
  var Y, L, X, oe;
  if (J(t, u, 1 + (z < q)), u += 2, z < q) {
    Y = nt(d, y, 0), L = d, X = nt(_, E, 0), oe = _;
    var Gt = nt(U, Te, 0);
    J(t, u, I - 257), J(t, u + 5, C - 1), J(t, u + 10, F - 4), u += 14;
    for (var v = 0; v < F; ++v)
      J(t, u + 3 * v, U[Kn[v]]);
    u += 3 * F;
    for (var V = [M, w], Ve = 0; Ve < 2; ++Ve)
      for (var Se = V[Ve], v = 0; v < Se.length; ++v) {
        var W = Se[v] & 31;
        J(t, u, Gt[W]), u += U[W], W > 15 && (J(t, u, Se[v] >> 5 & 127), u += Se[v] >> 12);
      }
  } else
    Y = ki, L = _e, X = xi, oe = Ft;
  for (var v = 0; v < c; ++v) {
    var k = r[v];
    if (k > 255) {
      var W = k >> 18 & 31;
      We(t, u, Y[W + 257]), u += L[W + 257], W > 7 && (J(t, u, k >> 23 & 31), u += Rn[W]);
      var be = k & 31;
      We(t, u, X[be]), u += oe[be], be > 3 && (We(t, u, k >> 5 & 8191), u += kn[be]);
    } else
      We(t, u, Y[k]), u += L[k];
  }
  return We(t, u, Y[256]), u + L[256];
}, Oi = /* @__PURE__ */ new Ln([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Gr = /* @__PURE__ */ new N(0), Pi = function(e, t, n, r, o, i) {
  var s = i.z || e.length, c = new N(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = c.subarray(r, c.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (a[0] = i.r >> 3);
    for (var f = Oi[t - 1], d = f >> 13, y = f & 8191, m = (1 << n) - 1, _ = i.p || new D(32768), E = i.h || new D(m + 1), S = Math.ceil(n / 3), M = 2 * S, I = function(Qt) {
      return (e[Qt] ^ e[Qt + 1] << S ^ e[Qt + 2] << M) & m;
    }, A = new Ln(25e3), w = new D(288), C = new D(32), g = 0, v = 0, p = i.i || 0, U = 0, Te = i.w || 0, F = 0; p + 2 < s; ++p) {
      var Ee = I(p), q = p & 32767, z = E[Ee];
      if (_[q] = z, E[Ee] = q, Te <= p) {
        var Y = s - p;
        if ((g > 7e3 || U > 24576) && (Y > 423 || !l)) {
          u = er(e, a, 0, A, w, C, v, U, F, p - F, u), U = g = v = 0, F = p;
          for (var L = 0; L < 286; ++L)
            w[L] = 0;
          for (var L = 0; L < 30; ++L)
            C[L] = 0;
        }
        var X = 2, oe = 0, Gt = y, V = q - z & 32767;
        if (Y > 2 && Ee == I(p - V))
          for (var Ve = Math.min(d, Y) - 1, Se = Math.min(32767, p), W = Math.min(258, Y); V <= Se && --Gt && q != z; ) {
            if (e[p + X] == e[p + X - V]) {
              for (var k = 0; k < W && e[p + k] == e[p + k - V]; ++k)
                ;
              if (k > X) {
                if (X = k, oe = V, k > Ve)
                  break;
                for (var be = Math.min(V, k - 2), zn = 0, L = 0; L < be; ++L) {
                  var Jt = p - V + L & 32767, Uo = _[Jt], Xn = Jt - Uo & 32767;
                  Xn > zn && (zn = Xn, z = Jt);
                }
              }
            }
            q = z, z = _[q], V += q - z & 32767;
          }
        if (oe) {
          A[U++] = 268435456 | pn[X] << 18 | Qn[oe];
          var $n = pn[X] & 31, Yn = Qn[oe] & 31;
          v += Rn[$n] + kn[Yn], ++w[257 + $n], ++C[Yn], Te = p + X, ++g;
        } else
          A[U++] = e[p], ++w[e[p]];
      }
    }
    for (p = Math.max(p, Te); p < s; ++p)
      A[U++] = e[p], ++w[e[p]];
    u = er(e, a, l, A, w, C, v, U, F, p - F, u), l || (i.r = u & 7 | a[u / 8 | 0] << 3, u -= 7, i.h = E, i.p = _, i.i = p, i.w = Te);
  } else {
    for (var p = i.w || 0; p < s + l; p += 65535) {
      var Kt = p + 65535;
      Kt >= s && (a[u / 8 | 0] = l, Kt = s), u = jr(a, u + 1, e.subarray(p, Kt));
    }
    i.i = s;
  }
  return Wr(c, 0, r + Vr(u) + o);
}, Ui = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), Fi = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = Ui[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, Di = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new N(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return Pi(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, vn = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, Ni = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && vn(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, Hi = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function Bi(e, t) {
  t || (t = {});
  var n = Fi(), r = e.length;
  n.p(e);
  var o = Di(e, t, Hi(t), 8), i = o.length;
  return Ni(o, t), vn(o, i - 8, n.d()), vn(o, i - 4, r), o;
}
var tr = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), qi = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), zi = 0;
try {
  qi.decode(Gr, { stream: !0 }), zi = 1;
} catch {
}
function Xi(e, t) {
  var n;
  if (tr)
    return tr.encode(e);
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
  return Wr(o, 0, i);
}
function Ct(e) {
  try {
    return Bi(Xi(e));
  } catch {
    return null;
  }
}
const $i = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function Yi(e) {
  if (!$i)
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
const Vi = "0.5.0", nr = 5e3, Jr = 50, Kr = 5e5, rr = 256e3, Dt = "replay", Qr = 8e4, Zr = 32, Wi = 2e7, ji = 5, Gi = 1e3, Ji = 6e4, Ki = 500, Nt = 63e3;
let Le = 0, Re = 0, se = [], rt = 0, tn = null;
const Ht = /* @__PURE__ */ new Map();
let ke = null, xe = null, yn = null, ot = !1;
function Qi() {
  try {
    return re().flushIntervalMs ?? nr;
  } catch {
    return nr;
  }
}
function eo(e) {
  let t = Ht.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, Ht.set(e, t)), t;
}
function to(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (x("compression_failures"), { body: t, encoding: "" });
}
async function no(e) {
  return to(await Yi(e), e);
}
function Zi(e) {
  return to(Ct(e), e);
}
const es = 64e3;
function gn(e, t, n) {
  if (e === Dt)
    return {
      bytes: n ?? Ut(
        t,
        es
      ),
      oversized: !1
    };
  const r = Ut(
    t,
    rr + 1
  );
  return {
    bytes: r,
    oversized: r > rr
  };
}
let _n = null;
function ts(e) {
  _n = e;
}
function Yt(e) {
  x("transport_drops"), e === Dt && _n && _n();
}
const ns = "/v1/rum/ingest";
function rs(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: Vi
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
function os(e, t, n) {
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
  const { body: o, encoding: i } = Zi(n), s = { ...t };
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
  if (rt + o > Wi) {
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
  }), rt += o, ro();
}
function ro() {
  if (tn || se.length === 0)
    return;
  const e = se[0], t = Math.min(
    Gi * Math.pow(2, e.attempts),
    Ji
  );
  tn = setTimeout(() => {
    tn = null, oo();
  }, t);
}
async function oo() {
  for (; se.length > 0 && Le < Qr && Re < Zr; ) {
    const e = se.shift();
    if (rt -= e.bytes, e.attempts++, e.attempts > ji) {
      x("retry_drops"), e.batchKey && Yt(e.batchKey);
      continue;
    }
    const t = e.bytes;
    Le += t, Re++;
    try {
      const { body: n, encoding: r } = await no(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < Nt,
        credentials: "omit"
      });
      if (so(i), i.status === 429 || i.status >= 500) {
        se.unshift(e), rt += e.bytes;
        break;
      }
    } catch {
      se.unshift(e), rt += e.bytes;
      break;
    } finally {
      Le -= t, Re--;
    }
  }
  se.length > 0 && ro();
}
function is() {
  ke && (clearTimeout(ke), ke = null), xe && (clearTimeout(xe), xe = null);
}
function xn() {
  const e = Qi();
  ke && clearTimeout(ke), ke = setTimeout(
    () => ne(),
    e
  ), xe || (xe = setTimeout(
    () => {
      xe = null, ne();
    },
    e + Ki
  ));
}
function On(e, t, n) {
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
  const i = eo(e);
  if (i.items.push(t), i.bytesEstimate += r, !ot && (i.items.length >= Jr || i.bytesEstimate >= Kr)) {
    ne();
    return;
  }
  xn();
}
function ss(e, t, n) {
  const { bytes: r, oversized: o } = gn(
    e,
    n
  );
  if (o) {
    Yt(e);
    return;
  }
  const i = eo(e), s = i.upsertMap.get(t);
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
  if (!ot && (i.items.length >= Jr || i.bytesEstimate >= Kr)) {
    ne();
    return;
  }
  xn();
}
function io(e) {
  yn = e;
}
const or = ["events", "replay"];
function ne(e = !1) {
  const t = re();
  if (e && yn && !ot) {
    ot = !0;
    try {
      yn();
    } catch {
    } finally {
      ot = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    xn();
    return;
  }
  is();
  const n = Si(), r = [], o = Array.from(
    Ht.keys()
  ).sort((l, u) => {
    const f = or.indexOf(l), d = or.indexOf(u), y = f >= 0 ? f : 999, m = d >= 0 ? d : 999;
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
  const i = rs(r), s = `${t.endpoint}${ns}`, c = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, a = r.some(
    (l) => l.type === Dt
  );
  if (e) {
    os(s, c, i);
    return;
  }
  as(
    s,
    c,
    i,
    a ? Dt : void 0
  );
}
async function as(e, t, n, r) {
  const o = n.length;
  if (Le >= Qr || Re >= Zr) {
    nn(e, t, n, r);
    return;
  }
  Le += o, Re++;
  try {
    const { body: i, encoding: s } = await no(n), c = { ...t };
    s && (c["Content-Encoding"] = s);
    const a = await fetch(e, {
      method: "POST",
      headers: c,
      body: i,
      keepalive: o < Nt,
      credentials: "omit"
    });
    so(a), (a.status === 429 || a.status >= 500) && nn(e, t, n, r);
  } catch {
    x("send_failures"), nn(e, t, n, r);
  } finally {
    Le -= o, Re--, oo();
  }
}
const wn = /* @__PURE__ */ new Map();
function so(e) {
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
let it = null, st = null, at = null, Tn = null;
function cs(e) {
  Tn = e;
}
const ao = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function ir() {
  typeof document > "u" || (it = () => {
    document.visibilityState === "hidden" && ne(!0);
  }, st = () => ne(!0), at = (e) => {
    e.persisted && Tn && Tn();
  }, document.addEventListener(
    "visibilitychange",
    it
  ), window.addEventListener(
    ao,
    st
  ), window.addEventListener(
    "pageshow",
    at
  ));
}
function us() {
  it && (document.removeEventListener(
    "visibilitychange",
    it
  ), it = null), st && (window.removeEventListener(
    ao,
    st
  ), st = null), at && (window.removeEventListener(
    "pageshow",
    at
  ), at = null);
}
const Bt = /* @__PURE__ */ new Map();
function ls(e, t) {
  Bt.set(e, t);
}
function fs() {
  return Bt.size === 0 ? {} : Object.fromEntries(Bt);
}
function ds() {
  Bt.clear();
}
var En, ae, ct, co, qt, uo = -1, we = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (uo = t.timeStamp, e(t));
  }), !0);
}, Pn = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, Wt = function() {
  var e = Pn();
  return e && e.activationStart || 0;
}, H = function(e, t) {
  var n = Pn(), r = "navigate";
  return uo >= 0 ? r = "back-forward-cache" : n && (document.prerendering || Wt() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, Ye = function(e, t, n) {
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
}, Un = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, yt = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, jt = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Ae = -1, sr = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, zt = function(e) {
  document.visibilityState === "hidden" && Ae > -1 && (Ae = e.type === "visibilitychange" ? e.timeStamp : 0, ps());
}, ar = function() {
  addEventListener("visibilitychange", zt, !0), addEventListener("prerenderingchange", zt, !0);
}, ps = function() {
  removeEventListener("visibilitychange", zt, !0), removeEventListener("prerenderingchange", zt, !0);
}, Fn = function() {
  return Ae < 0 && (Ae = sr(), ar(), we((function() {
    setTimeout((function() {
      Ae = sr(), ar();
    }), 0);
  }))), { get firstHiddenTime() {
    return Ae;
  } };
}, gt = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, cr = [1800, 3e3], lo = function(e, t) {
  t = t || {}, gt((function() {
    var n, r = Fn(), o = H("FCP"), i = Ye("paint", (function(s) {
      s.forEach((function(c) {
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < r.firstHiddenTime && (o.value = Math.max(c.startTime - Wt(), 0), o.entries.push(c), n(!0)));
      }));
    }));
    i && (n = B(e, o, cr, t.reportAllChanges), we((function(s) {
      o = H("FCP"), n = B(e, o, cr, t.reportAllChanges), Un((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, ur = [0.1, 0.25], ms = function(e, t) {
  t = t || {}, lo(jt((function() {
    var n, r = H("CLS", 0), o = 0, i = [], s = function(a) {
      a.forEach((function(l) {
        if (!l.hadRecentInput) {
          var u = i[0], f = i[i.length - 1];
          o && l.startTime - f.startTime < 1e3 && l.startTime - u.startTime < 5e3 ? (o += l.value, i.push(l)) : (o = l.value, i = [l]);
        }
      })), o > r.value && (r.value = o, r.entries = i, n());
    }, c = Ye("layout-shift", s);
    c && (n = B(e, r, ur, t.reportAllChanges), yt((function() {
      s(c.takeRecords()), n(!0);
    })), we((function() {
      o = 0, r = H("CLS", 0), n = B(e, r, ur, t.reportAllChanges), Un((function() {
        return n();
      }));
    })), setTimeout(n, 0));
  })));
}, fo = 0, rn = 1 / 0, Tt = 0, hs = function(e) {
  e.forEach((function(t) {
    t.interactionId && (rn = Math.min(rn, t.interactionId), Tt = Math.max(Tt, t.interactionId), fo = Tt ? (Tt - rn) / 7 + 1 : 0);
  }));
}, po = function() {
  return En ? fo : performance.interactionCount || 0;
}, vs = function() {
  "interactionCount" in performance || En || (En = Ye("event", hs, { type: "event", buffered: !0, durationThreshold: 0 }));
}, G = [], Mt = /* @__PURE__ */ new Map(), mo = 0, ys = function() {
  var e = Math.min(G.length - 1, Math.floor((po() - mo) / 50));
  return G[e];
}, gs = [], _s = function(e) {
  if (gs.forEach((function(o) {
    return o(e);
  })), e.interactionId || e.entryType === "first-input") {
    var t = G[G.length - 1], n = Mt.get(e.interactionId);
    if (n || G.length < 10 || e.duration > t.latency) {
      if (n) e.duration > n.latency ? (n.entries = [e], n.latency = e.duration) : e.duration === n.latency && e.startTime === n.entries[0].startTime && n.entries.push(e);
      else {
        var r = { id: e.interactionId, latency: e.duration, entries: [e] };
        Mt.set(r.id, r), G.push(r);
      }
      G.sort((function(o, i) {
        return i.latency - o.latency;
      })), G.length > 10 && G.splice(10).forEach((function(o) {
        return Mt.delete(o.id);
      }));
    }
  }
}, ho = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = jt(e), document.visibilityState === "hidden" ? e() : (n = t(e), yt(e)), n;
}, lr = [200, 500], ws = function(e, t) {
  "PerformanceEventTiming" in self && "interactionId" in PerformanceEventTiming.prototype && (t = t || {}, gt((function() {
    var n;
    vs();
    var r, o = H("INP"), i = function(c) {
      ho((function() {
        c.forEach(_s);
        var a = ys();
        a && a.latency !== o.value && (o.value = a.latency, o.entries = a.entries, r());
      }));
    }, s = Ye("event", i, { durationThreshold: (n = t.durationThreshold) !== null && n !== void 0 ? n : 40 });
    r = B(e, o, lr, t.reportAllChanges), s && (s.observe({ type: "first-input", buffered: !0 }), yt((function() {
      i(s.takeRecords()), r(!0);
    })), we((function() {
      mo = po(), G.length = 0, Mt.clear(), o = H("INP"), r = B(e, o, lr, t.reportAllChanges);
    })));
  })));
}, fr = [2500, 4e3], on = {}, Ts = function(e, t) {
  t = t || {}, gt((function() {
    var n, r = Fn(), o = H("LCP"), i = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - Wt(), 0), o.entries = [l], n());
      }));
    }, s = Ye("largest-contentful-paint", i);
    if (s) {
      n = B(e, o, fr, t.reportAllChanges);
      var c = jt((function() {
        on[o.id] || (i(s.takeRecords()), s.disconnect(), on[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(a) {
        addEventListener(a, (function() {
          return ho(c);
        }), { once: !0, capture: !0 });
      })), yt(c), we((function(a) {
        o = H("LCP"), n = B(e, o, fr, t.reportAllChanges), Un((function() {
          o.value = performance.now() - a.timeStamp, on[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, dr = [800, 1800], Es = function e(t) {
  document.prerendering ? gt((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, Ss = function(e, t) {
  t = t || {};
  var n = H("TTFB"), r = B(e, n, dr, t.reportAllChanges);
  Es((function() {
    var o = Pn();
    o && (n.value = Math.max(o.responseStart - Wt(), 0), n.entries = [o], r(!0), we((function() {
      n = H("TTFB", 0), (r = B(e, n, dr, t.reportAllChanges))(!0);
    })));
  }));
}, Ke = { passive: !0, capture: !0 }, bs = /* @__PURE__ */ new Date(), pr = function(e, t) {
  ae || (ae = t, ct = e, co = /* @__PURE__ */ new Date(), yo(removeEventListener), vo());
}, vo = function() {
  if (ct >= 0 && ct < co - bs) {
    var e = { entryType: "first-input", name: ae.type, target: ae.target, cancelable: ae.cancelable, startTime: ae.timeStamp, processingStart: ae.timeStamp + ct };
    qt.forEach((function(t) {
      t(e);
    })), qt = [];
  }
}, As = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        pr(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, Ke), removeEventListener("pointercancel", i, Ke);
      };
      addEventListener("pointerup", o, Ke), addEventListener("pointercancel", i, Ke);
    })(t, e) : pr(t, e);
  }
}, yo = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, As, Ke);
  }));
}, mr = [100, 300], Cs = function(e, t) {
  t = t || {}, gt((function() {
    var n, r = Fn(), o = H("FID"), i = function(a) {
      a.startTime < r.firstHiddenTime && (o.value = a.processingStart - a.startTime, o.entries.push(a), n(!0));
    }, s = function(a) {
      a.forEach(i);
    }, c = Ye("first-input", s);
    n = B(e, o, mr, t.reportAllChanges), c && (yt(jt((function() {
      s(c.takeRecords()), c.disconnect();
    }))), we((function() {
      var a;
      o = H("FID"), n = B(e, o, mr, t.reportAllChanges), qt = [], ct = -1, ae = null, yo(addEventListener), a = i, qt.push(a), vo();
    })));
  }));
};
const Ms = 50, hr = 200, vr = /* @__PURE__ */ new Map();
function Is(e) {
  let t = vr.get(e);
  return t || (t = {
    tokens: hr,
    lastRefill: Date.now(),
    rate: Ms,
    burst: hr
  }, vr.set(e, t)), t;
}
function Ls(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function Rs(e) {
  const t = Is(e);
  return Ls(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let Sn = null, bn = null;
function ec(e, t) {
  Sn = e, bn = t;
}
const ks = "00000000000000000000000000000000";
function go() {
  if (!Sn || !bn) return null;
  try {
    const e = Sn.getSpan(
      bn.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === ks ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const yr = 100, xs = 10, gr = 5e3, Os = 3, Ps = 0;
function Us(e, t = () => Date.now()) {
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
    return r.size < gr && r.set(a, u), u;
  }
  function s(a) {
    const l = i(a), u = t();
    let f = n.get(l);
    if (!f) {
      if (n.size >= gr)
        return !0;
      f = {
        tokens: yr,
        lastRefillMs: u
      }, n.set(l, f);
    }
    const d = (u - f.lastRefillMs) / 1e3;
    return d > 0 && (f.tokens = Math.min(
      yr,
      f.tokens + d * xs
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function c(a) {
    var m, _, E;
    if (a.type !== Os)
      return { event: a, dropped: 0 };
    const l = a.data;
    if (!l || l.source !== Ps || !l.attributes || l.attributes.length === 0)
      return { event: a, dropped: 0 };
    const u = l.attributes.length, f = l.attributes.filter(
      (S) => s(S.id)
    ), d = u - f.length;
    return d === 0 ? { event: a, dropped: 0 } : (l.attributes = f, {
      event: f.length > 0 || (((m = l.adds) == null ? void 0 : m.length) ?? 0) > 0 || (((_ = l.removes) == null ? void 0 : _.length) ?? 0) > 0 || (((E = l.texts) == null ? void 0 : E.length) ?? 0) > 0 ? a : null,
      dropped: d
    });
  }
  return { throttle: c, reset: o };
}
const _r = "replay", Fs = 200, Ds = 6e4, Ns = 5e3, Hs = 8e6, _o = 2, Bs = 3, qs = 4, wr = 3e3, wo = 5e3, zs = 3, Xs = 3e4, $s = 5e3, Ys = 16, Vs = 100, Ws = 4, js = 30, Tr = 32, Er = 250, Gs = 36e4;
function Js() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const Ks = 3e5, Qs = 9e5, Zs = 1e3;
let ve = null, ee = null, Ge = null, qe = [], ze = 0, Ce = "", Dn = !1, To = 0, sn = "", Q = 0, ye = Date.now(), ue = !1, dt = 0, pe = null, Xe = !1, Oe = null, Eo = 0, K = [], j = 0, Pe = null, ce = null, It = 0;
function $e() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const Nn = Us(
  () => (ve == null ? void 0 : ve.mirror) ?? null
);
let Ue = null, me = null, Fe = !1, pt = !1, Hn = 0, Lt = null, Z = null;
function ea() {
  Pe && (clearTimeout(Pe), Pe = null), ce && (ce(), ce = null);
}
function An(e, t) {
  ea();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    js
  ) : null, r = e ? $e() + (n ?? Ws) : Number.POSITIVE_INFINITY;
  for (; j < K.length; ) {
    const o = Math.min(
      j + Tr,
      K.length
    );
    for (; j < o; )
      Cn(
        K[j++]
      );
    if ($e() >= r) break;
  }
  if (j >= K.length) {
    K = [], j = 0;
    return;
  }
  j >= Tr * 8 && (K = K.slice(j), j = 0), So();
}
function Xt() {
  An(!1);
}
function So() {
  if (!Pe) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          ce = null, An(!0, t);
        },
        { timeout: Vs }
      );
      ce = () => cancelIdleCallback(e);
    }
    Pe = setTimeout(() => {
      Pe = null, ce && (ce(), ce = null), An(!0);
    }, Ys);
  }
}
function mt(e = !1) {
  if (Xe = !0, Oe) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - ye, r = Math.max(
      0,
      wo - n
    ), o = Date.now() - Eo, i = Math.max(
      0,
      $s - o
    );
    t = Math.max(
      r,
      i
    );
  }
  Oe = setTimeout(() => {
    Oe = null, ta();
  }, t);
}
function ta() {
  if (!Xe || !ve || !ee || ue) return;
  dt++;
  const e = It > Er ? 1 : zs;
  if (dt > e) {
    oa();
    return;
  }
  Eo = Date.now(), Q = 0, ye = Date.now();
  try {
    const t = $e();
    ve.takeFullSnapshot(!0), It = $e() - t, x("replay_rebases"), It > Er && x(
      "replay_expensive_snapshots"
    );
  } catch {
    vt(), ht();
  }
}
function Sr() {
  x("replay_events_dropped");
}
function bo() {
  if (Ce) return !1;
  Ce = te(), To = pi();
  const e = sn !== "" && sn !== Ce;
  return sn = Ce, e;
}
function _t() {
  if (ra(), qe.length === 0) return;
  if (Vt(_r)) {
    na(), Ao();
    return;
  }
  bo();
  const e = Ce, t = To, n = qe.splice(0), r = ze;
  ze = 0, Ce = "", Dn = !0, On(
    _r,
    {
      session_id: e,
      segment_index: t,
      events: n
    },
    r
  );
}
function na() {
  ze <= Hs || (x(
    "replay_events_dropped",
    qe.length
  ), qe.length = 0, ze = 0, mt());
}
let De = null;
function ra() {
  De && (clearTimeout(De), De = null);
}
function Ao() {
  if (De) return;
  const e = re().replayFlushIntervalMs ?? Ns;
  De = setTimeout(() => {
    De = null, _t();
  }, e);
}
function Cn(e) {
  bo() && e.type !== _o && mt(!0), qe.push(e), ze += Ut(e), qe.length >= Fs || ze >= Ds ? _t() : Ao();
}
function oa() {
  ue = !0, x("replay_overload_pauses"), vt(), pe && clearTimeout(pe), pe = setTimeout(() => {
    pe = null, ue = !1, dt = 0, Q = 0, ye = Date.now(), !Fe && !pt && Z && ht();
  }, Xs);
}
function ia(e) {
  if (ue) return;
  if (e.type === _o) {
    Xt(), Xe = !1, Q = 0, ye = Date.now(), Cn(e);
    return;
  }
  if (e.type === qs) {
    const r = e.data;
    typeof r.href == "string" && (r.href = Yo(r.href));
  }
  if (e.type !== Bs) {
    Xt(), Cn(e);
    return;
  }
  if (Xe) {
    Sr(), mt();
    return;
  }
  const t = Date.now();
  t - ye > wo && (Q <= wr && (dt = 0), Q = 0, ye = t);
  const n = Nn.throttle(e);
  if (n.dropped > 0 && x(
    "replay_attributes_throttled",
    n.dropped
  ), !!n.event) {
    if (Q++, Q > wr) {
      Sr(), mt();
      return;
    }
    K.push(n.event), So();
  }
}
async function ht() {
  if (Z && !ue && !ee)
    return Ge || (Ge = sa().finally(
      () => {
        Ge = null;
      }
    ), Ge);
}
async function sa() {
  if (!Z) return;
  const { record: e } = await import("./rrweb-SbAupvcM.js");
  !Z || ue || ee || (ve = e, Xe = !1, Q = 0, ye = Date.now(), Nn.reset(), ee = e({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: Js() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: Gs,
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
        ia(t);
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
    blockSelector: xr,
    maskTextSelector: Or,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => _t(), 200));
}
function vt() {
  ee && (ee(), ee = null), Oe && (clearTimeout(Oe), Oe = null), Xe = !1, Xt(), _t();
}
function aa() {
  const e = re(), t = e.replayIdlePauseMs ?? Ks, n = e.replayIdleExpireMs ?? Qs;
  Ue && clearTimeout(Ue), me && (clearTimeout(me), me = null), Ue = setTimeout(() => {
    Fe = !0, vt();
  }, t), me = setTimeout(() => {
    pt = !0, vt();
  }, n);
}
function Rt() {
  Hn = $e(), aa();
}
function ca() {
  if (pt) {
    if (!Br()) return;
    pt = !1, Fe = !1, ht(), Rt();
    return;
  }
  if (Fe) {
    Fe = !1, ht(), Rt();
    return;
  }
  $e() - Hn >= Zs && Rt();
}
function ua() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => ca(), n = { passive: !0, capture: !0 };
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
function la() {
  Lt && (Lt(), Lt = null), Ue && (clearTimeout(Ue), Ue = null), me && (clearTimeout(me), me = null);
}
function fa() {
  Xt(), _t();
}
async function da() {
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
  }, ts(() => {
    ee && mt();
  }), io(fa), await ht(), ua(), Rt();
}
function pa() {
  return ee !== null && !ue;
}
function ma() {
  return Dn;
}
function ha() {
  vt(), la(), io(null), pe && (clearTimeout(pe), pe = null), Fe = !1, pt = !1, Hn = 0, ue = !1, Dn = !1, dt = 0, Q = 0, It = 0, K = [], j = 0, Nn.reset(), Z = null, ve = null;
}
let P = [], de = null;
const va = [
  "error",
  "action",
  "console",
  "resource"
];
function ya(e) {
  return va.includes(e) && (Vt(e) || !Rs(e)) ? (x("events_rate_limited"), !0) : !1;
}
function ga(e, t) {
  const n = e.origin + Be(e.pathname);
  if (!Array.isArray(t) || t.length === 0 || !e.search)
    return n;
  const r = new URLSearchParams(e.search), o = new URLSearchParams();
  r.forEach((s, c) => {
    t.includes(c) && o.append(c, s);
  });
  const i = o.toString();
  return i ? n + "?" + i : n;
}
function _a() {
  de || (de = {
    device_type: Va(),
    browser_name: Wa(),
    os_name: ja(),
    user_agent: navigator.userAgent,
    language: navigator.language
  });
}
function Co() {
  _a();
  const e = hi(), t = fs(), n = re(), r = {
    session_id: te(),
    user_id: Xr(),
    user_name: yi(),
    user_email: gi(),
    user_status: _i(),
    service: n.service,
    env: n.env ?? "",
    version: n.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: ga(
      window.location,
      n.viewUrlQueryParams
    ),
    view_url_host: window.location.hostname,
    view_url_path: Be(window.location.pathname),
    referrer_url: Vo(document.referrer),
    device_type: de.device_type,
    browser_name: de.browser_name,
    os_name: de.os_name,
    user_agent: jo() ? de.user_agent : "",
    language: de.language,
    session_view_count: e.viewCount,
    session_error_count: e.errorCount,
    session_action_count: e.actionCount,
    replay_id: pa() && ma() ? te() : ""
  };
  return Object.keys(t).length > 0 && (r.feature_flags = t), r;
}
function wa(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const Mo = "events";
function O(e) {
  if (!Hr() || Vt("events")) return;
  const t = e(), n = t.event_type;
  if (ya(n)) return;
  zr(n);
  const r = Co();
  On(
    Mo,
    { ...r, ...t }
  );
}
function Bn(e) {
  wa(
    () => O(e)
  );
}
function Ta(e) {
  if (!Hr() || Vt("events")) return;
  const t = e(), n = t.event_type;
  zr(n);
  const r = Co(), o = r.session_id + ":" + r.view_url_path;
  ss(
    Mo,
    o,
    { ...r, ...t }
  );
}
function Ea() {
  Sa(), Ma(), ka(), xa(), za(), Ha(), Ba(), qa(), Xa(), Ia();
}
function Sa() {
  const e = (n) => {
    O(() => {
      var i, s, c;
      const r = n.message ?? "", o = typeof ((i = n.error) == null ? void 0 : i.message) == "string" ? n.error.message : r;
      return {
        event_type: "error",
        error_message: Pt(r),
        error_type: ((s = n.error) == null ? void 0 : s.name) ?? "Error",
        error_stack: Gn(
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
        error_stack: Gn(
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
const Ne = 8192;
function ba(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${Ne} bytes omitted]`;
}
function Aa(e) {
  if (typeof e == "string") return e;
  if (Ut(
    e,
    Ne + 1
  ) > Ne)
    return ba(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function Ca(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= Ne) break;
    t && (t += " "), t += Aa(n);
  }
  return t.length > Ne ? t.slice(0, Ne) + "… [truncated]" : t;
}
function Ma() {
  for (const e of Wo()) {
    const t = console[e];
    console[e] = (...n) => {
      const r = Pt(Ca(n));
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
const T = {};
let he = null, kt = 0, br = "";
function Io() {
  const e = JSON.stringify(T);
  if (e === br) return;
  br = e, kt = 0;
  const t = T.page_load_ms || T.lcp || T.dom_complete_ms || 0, n = t > 0;
  Ta(() => ({
    event_type: n ? "page_load" : "view",
    page_load_ms: t,
    lcp_ms: T.lcp ?? 0,
    fid_ms: T.fid ?? 0,
    inp_ms: T.inp ?? 0,
    cls: T.cls ?? 0,
    fcp_ms: T.fcp ?? 0,
    ttfb_ms: T.ttfb ?? 0,
    dns_ms: T.dns_ms ?? 0,
    connect_ms: T.connect_ms ?? 0,
    dom_interactive_ms: T.dom_interactive_ms ?? 0,
    dom_complete_ms: T.dom_complete_ms ?? 0
  }));
}
function fe() {
  const e = Date.now();
  kt || (kt = e);
  const t = e - kt, n = Math.max(0, 5e3 - t);
  he && clearTimeout(he), he = setTimeout(() => {
    he = null, Io();
  }, n);
}
function Ia() {
  if (typeof document > "u") return;
  const e = () => {
    document.visibilityState === "hidden" && (he && (clearTimeout(he), he = null), Io());
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
const Mn = "oodle_rum_tab_hidden";
function Ar(e) {
  try {
    e ? sessionStorage.setItem(Mn, "1") : sessionStorage.removeItem(Mn);
  } catch {
  }
}
function La() {
  try {
    return sessionStorage.getItem(Mn) === "1";
  } catch {
    return !1;
  }
}
function Ra() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && La() && (Ar(!1), O(() => ({
    event_type: "visibility",
    action_type: "tab_visible"
  })));
  let e = document.visibilityState === "hidden";
  const t = () => {
    const n = document.visibilityState === "hidden";
    n !== e && (e = n, Ar(n), O(() => ({
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
function ka() {
  Ts((e) => {
    T.lcp = e.value, fe();
  }), Cs((e) => {
    T.fid = e.value, fe();
  }), ws((e) => {
    T.inp = e.value, fe();
  }), ms((e) => {
    T.cls = e.value, fe();
  }), lo((e) => {
    T.fcp = e.value, fe();
  }), Ss((e) => {
    T.ttfb = e.value, fe();
  });
}
function qn(e) {
  const t = re().endpoint;
  return e.startsWith(t);
}
function xa() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || qn(r.name))
          continue;
        const i = lt(r.name), s = r.duration, c = r.transferSize ?? 0, a = o;
        Bn(
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
function Oa(e) {
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
function Lo(e) {
  const t = Oa(e), n = re();
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
function Ro(e) {
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
function Pa(e) {
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
function He(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function Ua(e, t) {
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
function Fa(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function Da(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      Ro(
        e
      )
    );
  } catch {
    return "";
  }
}
function Cr(e) {
  try {
    return JSON.stringify(
      Ro(e)
    );
  } catch {
    return "";
  }
}
function ko(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function Na(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: He(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: He(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : ko(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => He(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function xo(e, t, n) {
  const r = function(o, i) {
    const s = Fa(o);
    if (qn(s))
      return t.apply(e, [
        o,
        i
      ]);
    const c = ko(o), a = ((i == null ? void 0 : i.method) ?? (c ? o.method : "GET")).toUpperCase(), l = performance.now(), u = Lo(s);
    let f = "", d = "";
    if (n.injectTracing) {
      const E = go();
      if (E)
        f = E.traceId, d = E.spanId;
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
      const E = u.bodyCfg.maxBodySize ?? 65536, S = Na(
        i,
        o,
        E
      );
      y = S.sync, m = S.asyncP;
    }
    let _ = "";
    return u.captureHeaders && (i != null && i.headers ? _ = Da(
      i.headers
    ) : c && (_ = Cr(
      o.headers
    ))), t.apply(e, [o, i]).then((E) => {
      const S = E.status, M = Math.round(
        performance.now() - l
      );
      let I = "";
      u.captureHeaders && (I = Cr(
        E.headers
      ));
      const A = (C) => {
        const g = {
          event_type: "resource",
          resource_url: lt(s),
          resource_method: a,
          resource_status: S,
          resource_duration_ms: M,
          resource_size: 0,
          resource_type: "fetch"
        };
        return f && (g.trace_id = f, g.span_id = d), C && (g.request_body = C), _ && (g.request_headers = _), I && (g.response_headers = I), g;
      }, w = m || Promise.resolve(y);
      if (u.bodyCfg) {
        const C = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          w,
          Ua(
            E.clone(),
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
      return E;
    }).catch((E) => {
      const S = Math.round(
        performance.now() - l
      );
      throw (m || Promise.resolve(y)).then((I) => {
        O(() => {
          const A = {
            event_type: "resource",
            resource_url: lt(s),
            resource_method: a,
            resource_status: 0,
            resource_duration_ms: S,
            resource_size: 0,
            resource_type: "fetch"
          };
          return f && (A.trace_id = f, A.span_id = d), I && (A.request_body = I), _ && (A.request_headers = _), A;
        });
      }), E;
    });
  };
  return e.fetch = r, () => {
    e.fetch = t;
  };
}
function Oo(e, t, n) {
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
    if (qn(c))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const a = Lo(c);
    let l = "", u = "";
    if (n.injectTracing) {
      const w = go();
      w ? (l = w.traceId, u = w.spanId) : a.trace && (l = $t(16), u = $t(8), i.call(
        this,
        "traceparent",
        `00-${l}-${u}-01`
      ));
    }
    let f = "";
    if (a.bodyCfg && s) {
      const w = a.bodyCfg.maxBodySize ?? 65536;
      typeof s == "string" ? f = He(
        s,
        w
      ) : typeof URLSearchParams < "u" && s instanceof URLSearchParams && (f = He(
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
    const y = performance.now(), m = this, _ = l, E = u, S = f, M = a.bodyCfg, I = d, A = a.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        const w = Math.round(
          performance.now() - y
        ), C = m.__oodleMethod ?? "GET";
        O(() => {
          const g = {
            event_type: "resource",
            resource_url: lt(c),
            resource_method: C,
            resource_status: m.status,
            resource_duration_ms: w,
            resource_size: 0,
            resource_type: "xhr"
          };
          if (_ && (g.trace_id = _, g.span_id = E), S && (g.request_body = S), M)
            try {
              const v = m.responseText ?? "";
              g.response_body = He(
                v,
                M.maxBodySize ?? 65536
              );
            } catch {
            }
          if (I && (g.request_headers = I), A)
            try {
              const v = m.getAllResponseHeaders();
              v && (g.response_headers = JSON.stringify(
                Pa(v)
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
const Po = {
  injectTracing: !0
}, Mr = {
  injectTracing: !1
};
function Ha() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = xo(
    window,
    window.fetch,
    Po
  );
  P.push(e);
}
function Ba() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = Oo(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    Po
  );
  P.push(e);
}
const Ir = /* @__PURE__ */ new WeakSet();
function cn(e) {
  if (Ir.has(e)) return;
  Ir.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (xo(
        n,
        n.fetch,
        Mr
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (Oo(
        r.prototype,
        r.prototype.setRequestHeader,
        Mr
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), P.push(() => {
    e.removeEventListener("load", t);
  });
}
function qa() {
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
function za() {
  if (typeof window > "u" || typeof PerformanceObserver > "u")
    return;
  const e = () => {
    const r = performance.getEntriesByType(
      "navigation"
    )[0];
    r && (T.page_load_ms = Math.round(
      r.loadEventEnd - r.startTime
    ), T.dns_ms = Math.round(
      r.domainLookupEnd - r.domainLookupStart
    ), T.connect_ms = Math.round(
      r.connectEnd - r.connectStart
    ), T.tls_ms = Math.round(
      r.secureConnectionStart > 0 ? r.connectEnd - r.secureConnectionStart : 0
    ), T.ttfb = Math.round(
      r.responseStart - r.requestStart
    ), T.download_ms = Math.round(
      r.responseEnd - r.responseStart
    ), T.dom_interactive_ms = Math.round(
      r.domInteractive - r.startTime
    ), T.dom_complete_ms = Math.round(
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
function Xa() {
  if (!(typeof PerformanceObserver > "u") && !$a())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            Bn(() => ({
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
function $a() {
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
          Bn(() => ({
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
function Et(e, t, n, r, o, i, s) {
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
function Ya(e, t) {
  O(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function Va() {
  const e = navigator.userAgent;
  return /Mobi|Android/i.test(e) ? "mobile" : /Tablet|iPad/i.test(e) ? "tablet" : "desktop";
}
function Wa() {
  const e = navigator.userAgent;
  return e.includes("Firefox") ? "Firefox" : e.includes("Edg/") ? "Edge" : e.includes("Chrome") ? "Chrome" : e.includes("Safari") ? "Safari" : "Other";
}
function ja() {
  const e = navigator.userAgent;
  return e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : e.includes("Android") ? "Android" : /iPhone|iPad|iPod/.test(e) ? "iOS" : "Other";
}
function Ga() {
  for (const e of P)
    e();
  P = [];
}
const Lr = typeof MutationObserver < "u" ? MutationObserver : null;
let le = !1, St = null, bt = null, ut = null, Ot = null;
const tc = {
  init(e) {
    le || si(e) && (Ti(e.tags), di(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), le = !0, Ra(), ir(), mi(), Mi(), cs(() => {
      ir();
    }), e.sessionReplay !== !1 && Br() && da(), Ea(), St = Ja(), bt = Ka(), e.openTelemetry && import("./tracing-CS2WU5W-.js").then(
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
    Ei(e);
  },
  identify(e) {
    vi(e);
  },
  trackEvent(e, t) {
    le && Ya(e, t);
  },
  addFeatureFlag(e, t) {
    ls(e, t);
  },
  getSessionId() {
    return le ? te() : "";
  },
  getUserId() {
    return Xr();
  },
  flush() {
    le && ne();
  },
  stop() {
    le && (ha(), Ga(), Ii(), qr(), ne(!0), ds(), us(), St && (St(), St = null), bt && (bt(), bt = null), Qe(), le = !1);
  }
};
function Ja() {
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
function Qe() {
  ut && (ut.disconnect(), ut = null), Ot && (clearTimeout(Ot), Ot = null);
}
function Ka() {
  if (typeof document > "u")
    return null;
  const e = 3, t = 1e3, n = 1e3;
  let r = [];
  const o = (s) => {
    var S;
    const c = s.target;
    if (!c) return;
    const a = Za(c), l = oi(c), u = l ? "" : (c.textContent ?? "").trim().slice(0, 200), f = ((S = c.tagName) == null ? void 0 : S.toLowerCase()) ?? "", d = Qa(
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
      Et(
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
      Et(
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
    Qe(), Lr && (ut = new Lr(() => {
      Qe(), Et(
        "click",
        c,
        a,
        l,
        !1,
        u,
        f
      );
    }), ut.observe(
      document.body,
      {
        childList: !0,
        subtree: !0
      }
    ), Ot = setTimeout(() => {
      Qe(), Et(
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
    ), Qe();
  };
}
function Qa(e, t, n, r = !1) {
  if (r) return Rr(e, t);
  const o = e.getAttribute("aria-label");
  if (o)
    return `${t}[${o}]`;
  const i = e.getAttribute("title");
  if (i) return `${t}[${i}]`;
  const s = n.split(`
`)[0].trim();
  return s && s.length <= 80 ? `${t}[${s}]` : Rr(e, t);
}
function Rr(e, t) {
  if (e.id) return `${t}#${e.id}`;
  const n = Array.from(
    e.classList ?? []
  ).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
function Za(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(
    e.classList ?? []
  ).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
export {
  tc as O,
  kr as h,
  Yo as m,
  ec as s
};
