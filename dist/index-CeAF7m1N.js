let Rt = null;
function Pr(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function Br(e) {
  if (!Pr(e.endpoint)) {
    console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    );
    return;
  }
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  ), Rt = e;
}
function W() {
  if (!Rt)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return Rt;
}
const Xn = "__oodle_session", qr = 1800 * 1e3, Xr = 14400 * 1e3;
function Wr() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
function zr() {
  try {
    const e = sessionStorage.getItem(Xn);
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
      replaySampled: t.replaySampled ?? !0
    };
  } catch {
    return null;
  }
}
function Wn(e) {
  try {
    sessionStorage.setItem(
      Xn,
      JSON.stringify(e)
    );
  } catch {
  }
}
let ge = null;
function zn(e) {
  ge || (ge = setTimeout(() => {
    ge = null, Wn(e);
  }, 1e3));
}
function jn(e) {
  ge && (clearTimeout(ge), ge = null), Wn(e);
}
let h = null, Kn = 100, Yn = 100;
function jr(e, t) {
  Kn = Math.max(
    0,
    Math.min(100, e)
  ), Yn = Math.max(
    0,
    Math.min(100, t)
  );
}
function pn(e) {
  return Math.random() * 100 < e;
}
function re() {
  const e = Date.now();
  if (h || (h = zr()), !h || e - h.lastActivity > qr || e - h.createdAt > Xr) {
    const t = pn(Kn);
    h = {
      id: Wr(),
      createdAt: e,
      lastActivity: e,
      viewCount: 0,
      errorCount: 0,
      actionCount: 0,
      sampled: t,
      replaySampled: t && pn(Yn)
    }, jn(h);
  } else
    h.lastActivity = e, zn(h);
  return h.id;
}
function $n() {
  return re(), (h == null ? void 0 : h.sampled) ?? !0;
}
function Kr() {
  return re(), (h == null ? void 0 : h.replaySampled) ?? !0;
}
let xe = null;
function Yr() {
  typeof document > "u" || (Jn(), xe = () => {
    document.visibilityState === "hidden" && h && jn(h);
  }, document.addEventListener(
    "visibilitychange",
    xe
  ));
}
function Jn() {
  xe && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    xe
  ), xe = null);
}
function Vn(e) {
  re(), h && (e === "view" || e === "page_load" ? h.viewCount++ : e === "error" ? h.errorCount++ : e === "action" && h.actionCount++, zn(h));
}
function $r() {
  return re(), {
    viewCount: (h == null ? void 0 : h.viewCount) ?? 0,
    errorCount: (h == null ? void 0 : h.errorCount) ?? 0,
    actionCount: (h == null ? void 0 : h.actionCount) ?? 0
  };
}
let X = null;
function Jr(e) {
  X = e;
}
function Gn() {
  return (X == null ? void 0 : X.id) ?? "";
}
function Vr() {
  return (X == null ? void 0 : X.name) ?? "";
}
function Gr() {
  return (X == null ? void 0 : X.email) ?? "";
}
function Qr() {
  return X ? "identified" : "anonymous";
}
let it = {};
function Zr(e) {
  e && (it = { ...e });
}
function eo(e) {
  it = { ...it, ...e };
}
function Qn() {
  return it;
}
const to = 6e4, no = "sdk_telemetry", _e = {
  events_rate_limited: 0,
  events_should_send_dropped: 0,
  send_failures: 0,
  compression_failures: 0,
  retry_drops: 0
};
function oe(e, t = 1) {
  _e[e] += t;
}
function ro() {
  for (const e in _e)
    if (_e[e] > 0)
      return !0;
  return !1;
}
function Ht() {
  if (!ro()) return;
  const e = { ..._e };
  for (const t in _e)
    _e[t] = 0;
  tn(no, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let Oe = null, Re = null;
function oo() {
  Oe || (Oe = setInterval(
    Ht,
    to
  ), typeof document < "u" && (Re = () => {
    document.visibilityState === "hidden" && Ht();
  }, document.addEventListener(
    "visibilitychange",
    Re
  )));
}
function io() {
  Oe && (clearInterval(Oe), Oe = null), Re && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    Re
  ), Re = null), Ht();
}
var D = Uint8Array, R = Uint16Array, $t = Int32Array, Jt = new D([
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
]), Vt = new D([
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
]), vn = new D([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Zn = function(e, t) {
  for (var n = new R(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new $t(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, er = Zn(Jt, 2), so = er.b, Dt = er.r;
so[28] = 258, Dt[258] = 28;
var ao = Zn(Vt, 0), hn = ao.r, Ut = new R(32768);
for (var T = 0; T < 32768; ++T) {
  var Z = (T & 43690) >> 1 | (T & 21845) << 1;
  Z = (Z & 52428) >> 2 | (Z & 13107) << 2, Z = (Z & 61680) >> 4 | (Z & 3855) << 4, Ut[T] = ((Z & 65280) >> 8 | (Z & 255) << 8) >> 1;
}
var He = (function(e, t, n) {
  for (var r = e.length, o = 0, i = new R(t); o < r; ++o)
    e[o] && ++i[e[o] - 1];
  var s = new R(t);
  for (o = 1; o < t; ++o)
    s[o] = s[o - 1] + i[o - 1] << 1;
  var c;
  if (n) {
    c = new R(1 << t);
    var a = 15 - t;
    for (o = 0; o < r; ++o)
      if (e[o])
        for (var l = o << 4 | e[o], u = t - e[o], f = s[e[o] - 1]++ << u, d = f | (1 << u) - 1; f <= d; ++f)
          c[Ut[f] >> a] = l;
  } else
    for (c = new R(r), o = 0; o < r; ++o)
      e[o] && (c[o] = Ut[s[e[o] - 1]++] >> 15 - e[o]);
  return c;
}), ue = new D(288);
for (var T = 0; T < 144; ++T)
  ue[T] = 8;
for (var T = 144; T < 256; ++T)
  ue[T] = 9;
for (var T = 256; T < 280; ++T)
  ue[T] = 7;
for (var T = 280; T < 288; ++T)
  ue[T] = 8;
var st = new D(32);
for (var T = 0; T < 32; ++T)
  st[T] = 5;
var co = /* @__PURE__ */ He(ue, 9, 0), uo = /* @__PURE__ */ He(st, 5, 0), tr = function(e) {
  return (e + 7) / 8 | 0;
}, nr = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new D(e.subarray(t, n));
}, $ = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, Ce = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, Lt = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: or, l: 0 };
  if (o == 1) {
    var s = new D(n[0].s + 1);
    return s[n[0].s] = 1, { t: s, l: 1 };
  }
  n.sort(function(w, k) {
    return w.f - k.f;
  }), n.push({ s: -1, f: 25001 });
  var c = n[0], a = n[1], l = 0, u = 1, f = 2;
  for (n[0] = { s: -1, f: c.f + a.f, l: c, r: a }; u != o - 1; )
    c = n[n[l].f < n[f].f ? l++ : f++], a = n[l != u && n[l].f < n[f].f ? l++ : f++], n[u++] = { s: -1, f: c.f + a.f, l: c, r: a };
  for (var d = i[0].s, r = 1; r < o; ++r)
    i[r].s > d && (d = i[r].s);
  var y = new R(d + 1), p = Ft(n[u - 1], y, 0);
  if (p > t) {
    var r = 0, _ = 0, S = p - t, C = 1 << S;
    for (i.sort(function(k, E) {
      return y[E.s] - y[k.s] || k.f - E.f;
    }); r < o; ++r) {
      var A = i[r].s;
      if (y[A] > t)
        _ += C - (1 << p - y[A]), y[A] = t;
      else
        break;
    }
    for (_ >>= S; _ > 0; ) {
      var b = i[r].s;
      y[b] < t ? _ -= 1 << t - y[b]++ - 1 : ++r;
    }
    for (; r >= 0 && _; --r) {
      var I = i[r].s;
      y[I] == t && (--y[I], ++_);
    }
    p = t;
  }
  return { t: new D(y), l: p };
}, Ft = function(e, t, n) {
  return e.s == -1 ? Math.max(Ft(e.l, t, n + 1), Ft(e.r, t, n + 1)) : t[e.s] = n;
}, yn = function(e) {
  for (var t = e.length; t && !e[--t]; )
    ;
  for (var n = new R(++t), r = 0, o = e[0], i = 1, s = function(a) {
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
}, Le = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, rr = function(e, t, n) {
  var r = n.length, o = tr(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, gn = function(e, t, n, r, o, i, s, c, a, l, u) {
  $(t, u++, n), ++o[256];
  for (var f = Lt(o, 15), d = f.t, y = f.l, p = Lt(i, 15), _ = p.t, S = p.l, C = yn(d), A = C.c, b = C.n, I = yn(_), w = I.c, k = I.n, E = new R(19), v = 0; v < A.length; ++v)
    ++E[A[v] & 31];
  for (var v = 0; v < w.length; ++v)
    ++E[w[v] & 31];
  for (var m = Lt(E, 7), x = m.t, fe = m.l, O = 19; O > 4 && !x[vn[O - 1]]; --O)
    ;
  var de = l + 5 << 3, P = Le(o, ue) + Le(i, st) + s, B = Le(o, d) + Le(i, _) + s + 14 + 3 * O + Le(E, x) + 2 * E[16] + 3 * E[17] + 7 * E[18];
  if (a >= 0 && de <= P && de <= B)
    return rr(t, u, e.subarray(a, a + l));
  var z, L, q, Q;
  if ($(t, u, 1 + (B < P)), u += 2, B < P) {
    z = He(d, y, 0), L = d, q = He(_, S, 0), Q = _;
    var Et = He(x, fe, 0);
    $(t, u, b - 257), $(t, u + 5, k - 1), $(t, u + 10, O - 4), u += 14;
    for (var v = 0; v < O; ++v)
      $(t, u + 3 * v, x[vn[v]]);
    u += 3 * O;
    for (var j = [A, w], be = 0; be < 2; ++be)
      for (var me = j[be], v = 0; v < me.length; ++v) {
        var K = me[v] & 31;
        $(t, u, Et[K]), u += x[K], K > 15 && ($(t, u, me[v] >> 5 & 127), u += me[v] >> 12);
      }
  } else
    z = co, L = ue, q = uo, Q = st;
  for (var v = 0; v < c; ++v) {
    var M = r[v];
    if (M > 255) {
      var K = M >> 18 & 31;
      Ce(t, u, z[K + 257]), u += L[K + 257], K > 7 && ($(t, u, M >> 23 & 31), u += Jt[K]);
      var pe = M & 31;
      Ce(t, u, q[pe]), u += Q[pe], pe > 3 && (Ce(t, u, M >> 5 & 8191), u += Vt[pe]);
    } else
      Ce(t, u, z[M]), u += L[M];
  }
  return Ce(t, u, z[256]), u + L[256];
}, lo = /* @__PURE__ */ new $t([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), or = /* @__PURE__ */ new D(0), fo = function(e, t, n, r, o, i) {
  var s = i.z || e.length, c = new D(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = c.subarray(r, c.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (a[0] = i.r >> 3);
    for (var f = lo[t - 1], d = f >> 13, y = f & 8191, p = (1 << n) - 1, _ = i.p || new R(32768), S = i.h || new R(p + 1), C = Math.ceil(n / 3), A = 2 * C, b = function(Ct) {
      return (e[Ct] ^ e[Ct + 1] << C ^ e[Ct + 2] << A) & p;
    }, I = new $t(25e3), w = new R(288), k = new R(32), E = 0, v = 0, m = i.i || 0, x = 0, fe = i.w || 0, O = 0; m + 2 < s; ++m) {
      var de = b(m), P = m & 32767, B = S[de];
      if (_[P] = B, S[de] = P, fe <= m) {
        var z = s - m;
        if ((E > 7e3 || x > 24576) && (z > 423 || !l)) {
          u = gn(e, a, 0, I, w, k, v, x, O, m - O, u), x = E = v = 0, O = m;
          for (var L = 0; L < 286; ++L)
            w[L] = 0;
          for (var L = 0; L < 30; ++L)
            k[L] = 0;
        }
        var q = 2, Q = 0, Et = y, j = P - B & 32767;
        if (z > 2 && de == b(m - j))
          for (var be = Math.min(d, z) - 1, me = Math.min(32767, m), K = Math.min(258, z); j <= me && --Et && P != B; ) {
            if (e[m + q] == e[m + q - j]) {
              for (var M = 0; M < K && e[m + M] == e[m + M - j]; ++M)
                ;
              if (M > q) {
                if (q = M, Q = j, M > be)
                  break;
                for (var pe = Math.min(j, M - 2), ln = 0, L = 0; L < pe; ++L) {
                  var St = m - j + L & 32767, Nr = _[St], fn = St - Nr & 32767;
                  fn > ln && (ln = fn, B = St);
                }
              }
            }
            P = B, B = _[P], j += P - B & 32767;
          }
        if (Q) {
          I[x++] = 268435456 | Dt[q] << 18 | hn[Q];
          var dn = Dt[q] & 31, mn = hn[Q] & 31;
          v += Jt[dn] + Vt[mn], ++w[257 + dn], ++k[mn], fe = m + q, ++E;
        } else
          I[x++] = e[m], ++w[e[m]];
      }
    }
    for (m = Math.max(m, fe); m < s; ++m)
      I[x++] = e[m], ++w[e[m]];
    u = gn(e, a, l, I, w, k, v, x, O, m - O, u), l || (i.r = u & 7 | a[u / 8 | 0] << 3, u -= 7, i.h = S, i.p = _, i.i = m, i.w = fe);
  } else {
    for (var m = i.w || 0; m < s + l; m += 65535) {
      var bt = m + 65535;
      bt >= s && (a[u / 8 | 0] = l, bt = s), u = rr(a, u + 1, e.subarray(m, bt));
    }
    i.i = s;
  }
  return nr(c, 0, r + tr(u) + o);
}, mo = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), po = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = mo[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, vo = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new D(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return fo(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, Nt = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, ho = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && Nt(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, yo = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function go(e, t) {
  t || (t = {});
  var n = po(), r = e.length;
  n.p(e);
  var o = vo(e, t, yo(t), 8), i = o.length;
  return ho(o, t), Nt(o, i - 8, n.d()), Nt(o, i - 4, r), o;
}
var _n = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), _o = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), wo = 0;
try {
  _o.decode(or, { stream: !0 }), wo = 1;
} catch {
}
function To(e, t) {
  var n;
  if (_n)
    return _n.encode(e);
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
  return nr(o, 0, i);
}
function Eo(e) {
  try {
    return go(To(e));
  } catch {
    return null;
  }
}
const wn = 5e3, ir = 50, Gt = 64e3, sr = 256e3, Qt = 8e4, Zt = 32, So = 2e7, bo = 5, Co = 1e3, Lo = 6e4, Ao = 500;
let V = 0, G = 0, ee = [], De = 0, At = null;
const qe = /* @__PURE__ */ new Map();
function Io() {
  try {
    return W().flushIntervalMs ?? wn;
  } catch {
    return wn;
  }
}
function ar(e) {
  let t = qe.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0,
    debounceTimer: null,
    maxWaitTimer: null
  }, qe.set(e, t)), t;
}
function ht(e) {
  const t = Eo(e);
  return t ? {
    body: new Blob([
      t
    ]),
    encoding: "gzip"
  } : (oe("compression_failures"), { body: e, encoding: "" });
}
function Pt(e) {
  let t = 2;
  for (const n in e) {
    if (!Object.prototype.hasOwnProperty.call(
      e,
      n
    ))
      continue;
    t += n.length + 4;
    const r = e[n];
    typeof r == "string" ? t += r.length + 2 : typeof r == "number" ? t += 8 : typeof r == "boolean" ? t += 5 : t += 50;
  }
  return t;
}
const Mo = 1e3, ko = 3e5;
let ve = [];
function xo() {
  if (ve.length === 0) return;
  const e = Date.now();
  ve = ve.filter(
    (n) => e - n.createdAt < ko
  );
  const t = ve.splice(0);
  for (const n of t)
    lr(n.path, n.batch);
}
const cr = "/v1/rum/ingest";
function ur(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t
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
async function lr(e, t, n = !1) {
  if (t.length === 0) return;
  const r = W();
  if (!n && r.shouldSendData && !r.shouldSendData()) {
    ve.length < Mo ? ve.push({
      path: e,
      batch: t,
      createdAt: Date.now()
    }) : oe(
      "events_should_send_dropped",
      t.length
    ), setTimeout(xo, 5e3);
    return;
  }
  const o = `${r.endpoint}${cr}`, i = Qn(), s = t.map((u) => ({
    ...u,
    tags: i
  })), c = ur([
    { type: e, items: s }
  ]), a = {
    "X-OODLE-INSTANCE": r.instanceId,
    "X-API-KEY": r.apiKey,
    "Content-Type": "application/json"
  };
  if (n) {
    fr(o, a, c);
    return;
  }
  if (V >= Qt || G >= Zt) {
    we(o, a, c);
    return;
  }
  const l = c.length;
  V += l, G++;
  try {
    const { body: u, encoding: f } = ht(c);
    f && (a["Content-Encoding"] = f);
    const d = await fetch(o, {
      method: "POST",
      headers: a,
      body: u,
      keepalive: l < 63e3
    });
    nn(d), (d.status === 429 || d.status >= 500) && we(o, a, c);
  } catch {
    oe("send_failures"), we(o, a, c);
  } finally {
    V -= l, G--, en();
  }
}
function fr(e, t, n) {
  const r = W();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const c = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, a = new Blob([n], {
      type: "application/json"
    });
    if (a.size < Gt && navigator.sendBeacon(c, a))
      return;
  }
  const { body: o, encoding: i } = ht(n), s = { ...t };
  i && (s["Content-Encoding"] = i), fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: !0
  }).catch(() => {
  });
}
function we(e, t, n) {
  const r = n.length;
  if (De + r > So) {
    oe("retry_drops");
    return;
  }
  ee.push({
    url: e,
    headers: t,
    body: n,
    bytes: r,
    attempts: 0
  }), De += r, dr();
}
function dr() {
  if (At || ee.length === 0)
    return;
  const e = ee[0], t = Math.min(
    Co * Math.pow(2, e.attempts),
    Lo
  );
  At = setTimeout(() => {
    At = null, en();
  }, t);
}
async function en() {
  for (; ee.length > 0 && V < Qt && G < Zt; ) {
    const e = ee.shift();
    if (De -= e.bytes, e.attempts++, e.attempts > bo) {
      oe("retry_drops");
      continue;
    }
    const t = e.bytes;
    V += t, G++;
    try {
      const { body: n, encoding: r } = ht(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r && (o["Content-Encoding"] = r);
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < 63e3
      });
      if (nn(i), i.status === 429 || i.status >= 500) {
        ee.push(e), De += e.bytes;
        break;
      }
    } catch {
      ee.push(e), De += e.bytes;
      break;
    } finally {
      V -= t, G--;
    }
  }
  ee.length > 0 && dr();
}
function mr(e) {
  e.debounceTimer && (clearTimeout(e.debounceTimer), e.debounceTimer = null), e.maxWaitTimer && (clearTimeout(e.maxWaitTimer), e.maxWaitTimer = null);
}
function at(e, t = !1) {
  const n = qe.get(e);
  if (!n || n.items.length === 0) return;
  const r = n.items.splice(0);
  n.upsertMap.clear(), n.bytesEstimate = 0, mr(n), lr(n.batchKey, r, t);
}
function pr(e) {
  const t = Io();
  e.debounceTimer && clearTimeout(e.debounceTimer), e.debounceTimer = setTimeout(
    () => at(e.batchKey),
    t
  ), e.maxWaitTimer || (e.maxWaitTimer = setTimeout(
    () => {
      e.maxWaitTimer = null, at(e.batchKey);
    },
    t + Ao
  ));
}
function tn(e, t) {
  const n = Pt(t);
  if (n > sr) {
    console.warn(
      `[@oodle-ai/rum] Dropping oversized event (${n} bytes)`
    );
    return;
  }
  const r = ar(e);
  if (r.items.push(t), r.bytesEstimate += n, r.items.length >= ir || r.bytesEstimate >= Gt) {
    at(r.batchKey);
    return;
  }
  pr(r);
}
function Oo(e, t, n) {
  const r = Pt(n);
  if (r > sr) return;
  const o = ar(e), i = o.upsertMap.get(t);
  if (i !== void 0) {
    const s = Pt(
      o.items[i]
    );
    o.items[i] = n, o.bytesEstimate += r - s;
  } else {
    const s = o.items.length;
    o.items.push(n), o.upsertMap.set(t, s), o.bytesEstimate += r;
  }
  if (o.items.length >= ir || o.bytesEstimate >= Gt) {
    at(o.batchKey);
    return;
  }
  pr(o);
}
const Tn = ["events", "replay"];
function ct(e = !1) {
  const t = W();
  if (!e && t.shouldSendData && !t.shouldSendData())
    return;
  const n = Qn(), r = [], o = Array.from(
    qe.keys()
  ).sort((a, l) => {
    const u = Tn.indexOf(a), f = Tn.indexOf(l), d = u >= 0 ? u : 999, y = f >= 0 ? f : 999;
    return d - y;
  });
  for (const a of o) {
    const l = qe.get(a);
    if (!l || l.items.length === 0) continue;
    const u = l.items.splice(0);
    l.upsertMap.clear(), l.bytesEstimate = 0, mr(l);
    const f = u.map((d) => ({
      ...d,
      tags: n
    }));
    r.push({
      type: l.batchKey,
      items: f
    });
  }
  if (r.length === 0) return;
  const i = ur(r), s = `${t.endpoint}${cr}`, c = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  };
  if (e) {
    fr(s, c, i);
    return;
  }
  Ro(s, c, i);
}
async function Ro(e, t, n) {
  const r = n.length;
  if (V >= Qt || G >= Zt) {
    we(e, t, n);
    return;
  }
  V += r, G++;
  try {
    const { body: o, encoding: i } = ht(n);
    i && (t["Content-Encoding"] = i);
    const s = await fetch(e, {
      method: "POST",
      headers: t,
      body: o,
      keepalive: r < 63e3
    });
    nn(s), (s.status === 429 || s.status >= 500) && we(e, t, n);
  } catch {
    oe("send_failures"), we(e, t, n);
  } finally {
    V -= r, G--, en();
  }
}
const Bt = /* @__PURE__ */ new Map();
function nn(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && Bt.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function yt(e) {
  const t = Bt.get(e);
  return t ? Date.now() >= t ? (Bt.delete(e), !1) : !0 : !1;
}
let Ue = null, Fe = null, Ne = null, qt = null;
function Ho(e) {
  qt = e;
}
const vr = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function En() {
  typeof document > "u" || (Ue = () => {
    document.visibilityState === "hidden" && ct(!0);
  }, Fe = () => ct(!0), Ne = (e) => {
    e.persisted && qt && qt();
  }, document.addEventListener(
    "visibilitychange",
    Ue
  ), window.addEventListener(
    vr,
    Fe
  ), window.addEventListener(
    "pageshow",
    Ne
  ));
}
function Do() {
  Ue && (document.removeEventListener(
    "visibilitychange",
    Ue
  ), Ue = null), Fe && (window.removeEventListener(
    vr,
    Fe
  ), Fe = null), Ne && (window.removeEventListener(
    "pageshow",
    Ne
  ), Ne = null);
}
const ut = /* @__PURE__ */ new Map();
function Uo(e, t) {
  ut.set(e, t);
}
function Fo() {
  return ut.size === 0 ? {} : Object.fromEntries(ut);
}
function No() {
  ut.clear();
}
var Xt, te, Pe, hr, lt, yr = -1, le = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (yr = t.timeStamp, e(t));
  }), !0);
}, rn = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, gt = function() {
  var e = rn();
  return e && e.activationStart || 0;
}, F = function(e, t) {
  var n = rn(), r = "navigate";
  return yr >= 0 ? r = "back-forward-cache" : n && (document.prerendering || gt() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, Se = function(e, t, n) {
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
}, N = function(e, t, n, r) {
  var o, i;
  return function(s) {
    t.value >= 0 && (s || r) && ((i = t.value - (o || 0)) || o === void 0) && (o = t.value, t.delta = i, t.rating = (function(c, a) {
      return c > a[1] ? "poor" : c > a[0] ? "needs-improvement" : "good";
    })(t.value, n), e(t));
  };
}, on = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, ze = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, _t = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, he = -1, Sn = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, ft = function(e) {
  document.visibilityState === "hidden" && he > -1 && (he = e.type === "visibilitychange" ? e.timeStamp : 0, Po());
}, bn = function() {
  addEventListener("visibilitychange", ft, !0), addEventListener("prerenderingchange", ft, !0);
}, Po = function() {
  removeEventListener("visibilitychange", ft, !0), removeEventListener("prerenderingchange", ft, !0);
}, sn = function() {
  return he < 0 && (he = Sn(), bn(), le((function() {
    setTimeout((function() {
      he = Sn(), bn();
    }), 0);
  }))), { get firstHiddenTime() {
    return he;
  } };
}, je = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, Cn = [1800, 3e3], gr = function(e, t) {
  t = t || {}, je((function() {
    var n, r = sn(), o = F("FCP"), i = Se("paint", (function(s) {
      s.forEach((function(c) {
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < r.firstHiddenTime && (o.value = Math.max(c.startTime - gt(), 0), o.entries.push(c), n(!0)));
      }));
    }));
    i && (n = N(e, o, Cn, t.reportAllChanges), le((function(s) {
      o = F("FCP"), n = N(e, o, Cn, t.reportAllChanges), on((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, Ln = [0.1, 0.25], Bo = function(e, t) {
  t = t || {}, gr(_t((function() {
    var n, r = F("CLS", 0), o = 0, i = [], s = function(a) {
      a.forEach((function(l) {
        if (!l.hadRecentInput) {
          var u = i[0], f = i[i.length - 1];
          o && l.startTime - f.startTime < 1e3 && l.startTime - u.startTime < 5e3 ? (o += l.value, i.push(l)) : (o = l.value, i = [l]);
        }
      })), o > r.value && (r.value = o, r.entries = i, n());
    }, c = Se("layout-shift", s);
    c && (n = N(e, r, Ln, t.reportAllChanges), ze((function() {
      s(c.takeRecords()), n(!0);
    })), le((function() {
      o = 0, r = F("CLS", 0), n = N(e, r, Ln, t.reportAllChanges), on((function() {
        return n();
      }));
    })), setTimeout(n, 0));
  })));
}, _r = 0, It = 1 / 0, Ke = 0, qo = function(e) {
  e.forEach((function(t) {
    t.interactionId && (It = Math.min(It, t.interactionId), Ke = Math.max(Ke, t.interactionId), _r = Ke ? (Ke - It) / 7 + 1 : 0);
  }));
}, wr = function() {
  return Xt ? _r : performance.interactionCount || 0;
}, Xo = function() {
  "interactionCount" in performance || Xt || (Xt = Se("event", qo, { type: "event", buffered: !0, durationThreshold: 0 }));
}, Y = [], Qe = /* @__PURE__ */ new Map(), Tr = 0, Wo = function() {
  var e = Math.min(Y.length - 1, Math.floor((wr() - Tr) / 50));
  return Y[e];
}, zo = [], jo = function(e) {
  if (zo.forEach((function(o) {
    return o(e);
  })), e.interactionId || e.entryType === "first-input") {
    var t = Y[Y.length - 1], n = Qe.get(e.interactionId);
    if (n || Y.length < 10 || e.duration > t.latency) {
      if (n) e.duration > n.latency ? (n.entries = [e], n.latency = e.duration) : e.duration === n.latency && e.startTime === n.entries[0].startTime && n.entries.push(e);
      else {
        var r = { id: e.interactionId, latency: e.duration, entries: [e] };
        Qe.set(r.id, r), Y.push(r);
      }
      Y.sort((function(o, i) {
        return i.latency - o.latency;
      })), Y.length > 10 && Y.splice(10).forEach((function(o) {
        return Qe.delete(o.id);
      }));
    }
  }
}, Er = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = _t(e), document.visibilityState === "hidden" ? e() : (n = t(e), ze(e)), n;
}, An = [200, 500], Ko = function(e, t) {
  "PerformanceEventTiming" in self && "interactionId" in PerformanceEventTiming.prototype && (t = t || {}, je((function() {
    var n;
    Xo();
    var r, o = F("INP"), i = function(c) {
      Er((function() {
        c.forEach(jo);
        var a = Wo();
        a && a.latency !== o.value && (o.value = a.latency, o.entries = a.entries, r());
      }));
    }, s = Se("event", i, { durationThreshold: (n = t.durationThreshold) !== null && n !== void 0 ? n : 40 });
    r = N(e, o, An, t.reportAllChanges), s && (s.observe({ type: "first-input", buffered: !0 }), ze((function() {
      i(s.takeRecords()), r(!0);
    })), le((function() {
      Tr = wr(), Y.length = 0, Qe.clear(), o = F("INP"), r = N(e, o, An, t.reportAllChanges);
    })));
  })));
}, In = [2500, 4e3], Mt = {}, Yo = function(e, t) {
  t = t || {}, je((function() {
    var n, r = sn(), o = F("LCP"), i = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - gt(), 0), o.entries = [l], n());
      }));
    }, s = Se("largest-contentful-paint", i);
    if (s) {
      n = N(e, o, In, t.reportAllChanges);
      var c = _t((function() {
        Mt[o.id] || (i(s.takeRecords()), s.disconnect(), Mt[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(a) {
        addEventListener(a, (function() {
          return Er(c);
        }), { once: !0, capture: !0 });
      })), ze(c), le((function(a) {
        o = F("LCP"), n = N(e, o, In, t.reportAllChanges), on((function() {
          o.value = performance.now() - a.timeStamp, Mt[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, Mn = [800, 1800], $o = function e(t) {
  document.prerendering ? je((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, Jo = function(e, t) {
  t = t || {};
  var n = F("TTFB"), r = N(e, n, Mn, t.reportAllChanges);
  $o((function() {
    var o = rn();
    o && (n.value = Math.max(o.responseStart - gt(), 0), n.entries = [o], r(!0), le((function() {
      n = F("TTFB", 0), (r = N(e, n, Mn, t.reportAllChanges))(!0);
    })));
  }));
}, Ae = { passive: !0, capture: !0 }, Vo = /* @__PURE__ */ new Date(), kn = function(e, t) {
  te || (te = t, Pe = e, hr = /* @__PURE__ */ new Date(), br(removeEventListener), Sr());
}, Sr = function() {
  if (Pe >= 0 && Pe < hr - Vo) {
    var e = { entryType: "first-input", name: te.type, target: te.target, cancelable: te.cancelable, startTime: te.timeStamp, processingStart: te.timeStamp + Pe };
    lt.forEach((function(t) {
      t(e);
    })), lt = [];
  }
}, Go = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        kn(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, Ae), removeEventListener("pointercancel", i, Ae);
      };
      addEventListener("pointerup", o, Ae), addEventListener("pointercancel", i, Ae);
    })(t, e) : kn(t, e);
  }
}, br = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, Go, Ae);
  }));
}, xn = [100, 300], Qo = function(e, t) {
  t = t || {}, je((function() {
    var n, r = sn(), o = F("FID"), i = function(a) {
      a.startTime < r.firstHiddenTime && (o.value = a.processingStart - a.startTime, o.entries.push(a), n(!0));
    }, s = function(a) {
      a.forEach(i);
    }, c = Se("first-input", s);
    n = N(e, o, xn, t.reportAllChanges), c && (ze(_t((function() {
      s(c.takeRecords()), c.disconnect();
    }))), le((function() {
      var a;
      o = F("FID"), n = N(e, o, xn, t.reportAllChanges), lt = [], Pe = -1, te = null, br(addEventListener), a = i, lt.push(a), Sr();
    })));
  }));
};
const Zo = 50, On = 200, Rn = /* @__PURE__ */ new Map();
function ei(e) {
  let t = Rn.get(e);
  return t || (t = {
    tokens: On,
    lastRefill: Date.now(),
    rate: Zo,
    burst: On
  }, Rn.set(e, t)), t;
}
function ti(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function ni(e) {
  const t = ei(e);
  return ti(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let Wt = null, zt = null;
function es(e, t) {
  Wt = e, zt = t;
}
const ri = "00000000000000000000000000000000";
function Cr() {
  if (!Wt || !zt) return null;
  try {
    const e = Wt.getSpan(
      zt.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === ri ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const oi = "replay", ii = 200, si = 6e4, ai = 3, Hn = 750, ci = 5e3, ui = 3, li = 16, fi = 100, di = 3e5, mi = 9e5;
let J = null, dt = [], jt = 0, Ie = 0, Dn = Date.now(), Ze = 0, mt = !1, Lr = [], Te = null, ne = null, Ee = null, ae = null, Xe = !1, Me = !1, wt = !1, et = null, tt = null, ye = null;
function Kt() {
  Te && (clearTimeout(Te), Te = null), ne && (ne(), ne = null);
  const e = Lr.splice(0);
  for (const t of e)
    Ar(t);
}
function pi() {
  if (!Te) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        () => {
          ne = null, Kt();
        },
        { timeout: fi }
      );
      ne = () => cancelIdleCallback(e);
    }
    Te = setTimeout(() => {
      Te = null, ne && (ne(), ne = null), Kt();
    }, li);
  }
}
function vi(e) {
  let t = 50;
  const n = e.data;
  if (n && typeof n == "object")
    for (const r in n) {
      if (!Object.prototype.hasOwnProperty.call(
        n,
        r
      ))
        continue;
      t += r.length + 4;
      const o = n[r];
      typeof o == "string" ? t += o.length : t += 20;
    }
  return t;
}
function Tt() {
  if (dt.length === 0 || yt("replay")) return;
  const e = dt.splice(0);
  jt = 0;
  const t = {
    session_id: re(),
    events: e
  };
  tn(
    oi,
    t
  );
}
let Ye = null;
function hi() {
  Ye && clearTimeout(Ye);
  const e = W().replayFlushIntervalMs ?? 5e3;
  Ye = setTimeout(() => {
    Ye = null, Tt();
  }, e);
}
function Ar(e) {
  dt.push(e);
  const t = vi(e);
  jt += Math.round(t * 0.3), dt.length >= ii || jt >= si ? Tt() : hi();
}
async function an() {
  if (!ye) return;
  W();
  const e = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', t = '[data-oodle-privacy="mask"],.oodle-privacy-mask', { record: n } = await import("./rrweb-6zmdUE_E.js");
  J = n({
    sampling: {
      mousemove: 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: 3e5,
    emit(r) {
      if (!mt) {
        if (r.type === ai) {
          const o = Date.now();
          if (o - Dn > ci && (Ie > Hn ? Ze++ : Ze = 0, Ie = 0, Dn = o, Ze >= ui)) {
            mt = !0, J && (J(), J = null);
            return;
          }
          if (Ie++, Ie > Hn)
            return;
          Lr.push(r), pi();
          return;
        }
        Ar(r);
      }
    },
    maskAllInputs: ye.maskAllInputs,
    maskInputOptions: ye.maskInputOptions,
    maskTextFn: ye.maskTextContent ? () => "•••" : void 0,
    blockSelector: e,
    maskTextSelector: t,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => Tt(), 200);
}
function pt() {
  J && (J(), J = null), Kt(), Tt();
}
function Ir() {
  const e = W(), t = e.replayIdlePauseMs ?? di, n = e.replayIdleExpireMs ?? mi;
  Ee && clearTimeout(Ee), ae && (clearTimeout(ae), ae = null), Ee = setTimeout(() => {
    Xe = !0, pt();
  }, t), ae = setTimeout(() => {
    wt = !0, pt(), Mr();
  }, n);
}
function yi() {
  wt || (Xe && (Xe = !1, an()), Ir());
}
function gi() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => yi(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  et = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function Mr() {
  et && (et(), et = null), Ee && (clearTimeout(Ee), Ee = null), ae && (clearTimeout(ae), ae = null);
}
function _i() {
  if (typeof document > "u") return;
  const e = () => {
    document.visibilityState === "hidden" ? !Me && J && (Me = !0, pt()) : Me && (Me = !1, !Xe && !wt && an());
  };
  document.addEventListener(
    "visibilitychange",
    e
  ), tt = () => {
    document.removeEventListener(
      "visibilitychange",
      e
    );
  };
}
async function wi() {
  const t = W().privacyLevel ?? "mask-user-input";
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
  } : o = !1, ye = {
    privacyLevel: t,
    maskAllInputs: o,
    maskInputOptions: n,
    maskTextContent: r
  }, await an(), gi(), _i(), Ir();
}
function Ti() {
  return J !== null && !mt;
}
function Ei() {
  pt(), Mr(), tt && (tt(), tt = null), Xe = !1, Me = !1, wt = !1, mt = !1, Ze = 0, Ie = 0, ye = null;
}
let U = [], se = null;
const Si = [
  "error",
  "action",
  "console",
  "resource"
];
function bi(e) {
  return Si.includes(e) && (yt(e) || !ni(e)) ? (oe("events_rate_limited"), !0) : !1;
}
function We(e) {
  try {
    const t = new URL(e);
    return t.origin + t.pathname;
  } catch {
    return e;
  }
}
function Ci() {
  se || (se = {
    device_type: Ki(),
    browser_name: Yi(),
    os_name: $i(),
    user_agent: navigator.userAgent,
    language: navigator.language
  });
}
function kr() {
  Ci();
  const e = $r(), t = Fo(), n = W(), r = {
    session_id: re(),
    user_id: Gn(),
    user_name: Vr(),
    user_email: Gr(),
    user_status: Qr(),
    service: n.service,
    env: n.env ?? "",
    version: n.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: window.location.origin + window.location.pathname,
    view_url_host: window.location.hostname,
    view_url_path: window.location.pathname,
    referrer_url: We(document.referrer),
    device_type: se.device_type,
    browser_name: se.browser_name,
    os_name: se.os_name,
    user_agent: se.user_agent,
    language: se.language,
    session_view_count: e.viewCount,
    session_error_count: e.errorCount,
    session_action_count: e.actionCount,
    replay_id: Ti() ? re() : ""
  };
  return Object.keys(t).length > 0 && (r.feature_flags = t), r;
}
function Li(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const xr = "events";
function H(e) {
  if (!$n() || yt("events")) return;
  const t = e(), n = t.event_type;
  if (bi(n)) return;
  Vn(n);
  const r = kr();
  tn(
    xr,
    { ...r, ...t }
  );
}
function cn(e) {
  Li(
    () => H(e)
  );
}
function Ai(e) {
  if (!$n() || yt("events")) return;
  const t = e(), n = t.event_type;
  Vn(n);
  const r = kr(), o = r.session_id + ":" + r.view_url_path;
  Oo(
    xr,
    o,
    { ...r, ...t }
  );
}
function Ii() {
  Mi(), ki(), Oi(), Ri(), Xi(), Pi(), Bi(), qi(), Wi(), xi();
}
function Mi() {
  const e = (n) => {
    H(() => {
      var r, o;
      return {
        event_type: "error",
        error_message: n.message ?? "",
        error_type: ((r = n.error) == null ? void 0 : r.name) ?? "Error",
        error_stack: ((o = n.error) == null ? void 0 : o.stack) ?? "",
        error_source: "source"
      };
    });
  }, t = (n) => {
    const r = n.reason;
    H(() => ({
      event_type: "error",
      error_message: (r == null ? void 0 : r.message) ?? String(r),
      error_type: (r == null ? void 0 : r.name) ?? "UnhandledRejection",
      error_stack: (r == null ? void 0 : r.stack) ?? "",
      error_source: "promise"
    }));
  };
  window.addEventListener("error", e), window.addEventListener(
    "unhandledrejection",
    t
  ), U.push(() => {
    window.removeEventListener("error", e), window.removeEventListener(
      "unhandledrejection",
      t
    );
  });
}
function Un(e) {
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function ki() {
  const e = {
    error: console.error,
    warn: console.warn
  };
  console.error = (...t) => {
    const n = t.map(Un).join(" ");
    H(() => ({
      event_type: "console",
      console_level: "error",
      console_message: n
    })), e.error.apply(console, t);
  }, console.warn = (...t) => {
    const n = t.map(Un).join(" ");
    H(() => ({
      event_type: "console",
      console_level: "warn",
      console_message: n
    })), e.warn.apply(console, t);
  }, U.push(() => {
    console.error = e.error, console.warn = e.warn;
  });
}
const g = {};
let ce = null, nt = 0, Fn = "";
function Or() {
  const e = JSON.stringify(g);
  if (e === Fn) return;
  Fn = e, nt = 0;
  const t = g.page_load_ms || g.lcp || g.dom_complete_ms || 0, n = t > 0;
  Ai(() => ({
    event_type: n ? "page_load" : "view",
    page_load_ms: t,
    lcp_ms: g.lcp ?? 0,
    fid_ms: g.fid ?? 0,
    inp_ms: g.inp ?? 0,
    cls: g.cls ?? 0,
    fcp_ms: g.fcp ?? 0,
    ttfb_ms: g.ttfb ?? 0,
    dns_ms: g.dns_ms ?? 0,
    connect_ms: g.connect_ms ?? 0,
    dom_interactive_ms: g.dom_interactive_ms ?? 0,
    dom_complete_ms: g.dom_complete_ms ?? 0
  }));
}
function ie() {
  const e = Date.now();
  nt || (nt = e);
  const t = e - nt, n = Math.max(0, 5e3 - t);
  ce && clearTimeout(ce), ce = setTimeout(() => {
    ce = null, Or();
  }, n);
}
function xi() {
  if (typeof document > "u") return;
  const e = () => {
    document.visibilityState === "hidden" && (ce && (clearTimeout(ce), ce = null), Or());
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
function Oi() {
  Yo((e) => {
    g.lcp = e.value, ie();
  }), Qo((e) => {
    g.fid = e.value, ie();
  }), Ko((e) => {
    g.inp = e.value, ie();
  }), Bo((e) => {
    g.cls = e.value, ie();
  }), gr((e) => {
    g.fcp = e.value, ie();
  }), Jo((e) => {
    g.ttfb = e.value, ie();
  });
}
function un(e) {
  const t = W().endpoint;
  return e.startsWith(t);
}
function Ri() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || un(r.name))
          continue;
        const i = We(r.name), s = r.duration, c = r.transferSize ?? 0, a = o;
        cn(
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
function vt(e) {
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
function kt(e, t, n) {
  return n.some(
    (r) => typeof r == "string" ? e.startsWith(r) || t.startsWith(r) : r.test(e) || r.test(t)
  );
}
function Rr(e) {
  const t = Hi(e), n = W();
  let r = !1;
  const o = n.allowedTracingUrls;
  o && o.length > 0 && (r = kt(
    t,
    e,
    o
  ));
  let i = null;
  const s = n.forwardNetworkBodies;
  s && kt(
    t,
    e,
    s.urls
  ) && (i = s);
  let c = !1;
  const a = n.forwardNetworkHeaders;
  return a && (c = kt(
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
const rt = /* @__PURE__ */ new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "proxy-authorization"
]);
function Hr(e) {
  const t = {};
  if (!e) return t;
  if (e instanceof Headers)
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      rt.has(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      rt.has(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(e)) {
      const r = n.toLowerCase();
      rt.has(r) || (t[r] = e[n]);
    }
  return t;
}
function Di(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    rt.has(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function Yt(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function Ui(e, t) {
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
function Fi(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function Ni(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      Hr(
        e
      )
    );
  } catch {
    return "";
  }
}
function Nn(e) {
  try {
    return JSON.stringify(
      Hr(e)
    );
  } catch {
    return "";
  }
}
function Dr(e, t, n) {
  const r = function(o, i) {
    const s = Fi(o);
    if (un(s))
      return t.apply(this, [
        o,
        i
      ]);
    const c = ((i == null ? void 0 : i.method) ?? "GET").toUpperCase(), a = performance.now(), l = Rr(s);
    let u = "", f = "";
    if (n.injectTracing) {
      const p = Cr();
      if (p)
        u = p.traceId, f = p.spanId;
      else if (l.trace) {
        u = vt(16), f = vt(8);
        const _ = new Headers(
          (i == null ? void 0 : i.headers) ?? {}
        );
        _.set(
          "traceparent",
          `00-${u}-${f}-01`
        ), i = { ...i, headers: _ };
      }
    }
    let d = "";
    l.bodyCfg && (i != null && i.body) && typeof i.body == "string" && (d = Yt(
      i.body,
      l.bodyCfg.maxBodySize ?? 65536
    ));
    let y = "";
    return l.captureHeaders && (i != null && i.headers ? y = Ni(
      i.headers
    ) : o instanceof Request && (y = Nn(
      o.headers
    ))), t.apply(this, [o, i]).then((p) => {
      const _ = p.status, S = Math.round(
        performance.now() - a
      );
      let C = "";
      l.captureHeaders && (C = Nn(
        p.headers
      ));
      const A = () => {
        const b = {
          event_type: "resource",
          resource_url: We(s),
          resource_method: c,
          resource_status: _,
          resource_duration_ms: S,
          resource_size: 0,
          resource_type: "fetch"
        };
        return u && (b.trace_id = u, b.span_id = f), d && (b.request_body = d), y && (b.request_headers = y), C && (b.response_headers = C), b;
      };
      if (l.bodyCfg) {
        const b = l.bodyCfg.maxBodySize ?? 65536;
        Ui(
          p.clone(),
          b
        ).then((I) => {
          H(() => {
            const w = A();
            return I && (w.response_body = I), w;
          });
        }).catch(() => {
          H(A);
        });
      } else
        H(A);
      return p;
    }).catch((p) => {
      const _ = Math.round(
        performance.now() - a
      );
      throw H(() => {
        const S = {
          event_type: "resource",
          resource_url: We(s),
          resource_method: c,
          resource_status: 0,
          resource_duration_ms: _,
          resource_size: 0,
          resource_type: "fetch"
        };
        return u && (S.trace_id = u, S.span_id = f), d && (S.request_body = d), y && (S.request_headers = y), S;
      }), p;
    });
  };
  return e.fetch = r, () => {
    e.fetch = t;
  };
}
function Ur(e, t, n) {
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
    if (un(c))
      return o.apply(this, [s]);
    const a = Rr(c);
    let l = "", u = "";
    if (n.injectTracing) {
      const w = Cr();
      w ? (l = w.traceId, u = w.spanId) : a.trace && (l = vt(16), u = vt(8), i.call(
        this,
        "traceparent",
        `00-${l}-${u}-01`
      ));
    }
    let f = "";
    a.bodyCfg && s && typeof s == "string" && (f = Yt(
      s,
      a.bodyCfg.maxBodySize ?? 65536
    ));
    let d = "";
    if (a.captureHeaders)
      try {
        const w = this.__oodleReqHeaders;
        w && Object.keys(w).length > 0 && (d = JSON.stringify(w));
      } catch {
      }
    const y = performance.now(), p = this, _ = l, S = u, C = f, A = a.bodyCfg, b = d, I = a.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        const w = Math.round(
          performance.now() - y
        ), k = p.__oodleMethod ?? "GET";
        H(() => {
          const E = {
            event_type: "resource",
            resource_url: We(c),
            resource_method: k,
            resource_status: p.status,
            resource_duration_ms: w,
            resource_size: 0,
            resource_type: "xhr"
          };
          if (_ && (E.trace_id = _, E.span_id = S), C && (E.request_body = C), A)
            try {
              const v = p.responseText ?? "";
              E.response_body = Yt(
                v,
                A.maxBodySize ?? 65536
              );
            } catch {
            }
          if (b && (E.request_headers = b), I)
            try {
              const v = p.getAllResponseHeaders();
              v && (E.response_headers = JSON.stringify(
                Di(v)
              ));
            } catch {
            }
          return E;
        });
      }
    ), o.apply(this, [s]);
  }, () => {
    e.open = r, e.send = o, e.setRequestHeader = i;
  };
}
const Fr = {
  injectTracing: !0
}, Pn = {
  injectTracing: !1
};
function Pi() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = Dr(
    window,
    window.fetch,
    Fr
  );
  U.push(e);
}
function Bi() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = Ur(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    Fr
  );
  U.push(e);
}
const Bn = /* @__PURE__ */ new WeakSet();
function xt(e) {
  if (Bn.has(e)) return;
  Bn.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (Dr(
        n,
        n.fetch,
        Pn
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (Ur(
        r.prototype,
        r.prototype.setRequestHeader,
        Pn
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), U.push(() => {
    e.removeEventListener("load", t);
  });
}
function qi() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach(xt);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          r instanceof HTMLIFrameElement && xt(r), r instanceof HTMLElement && r.childElementCount > 0 && r.querySelectorAll("iframe").forEach(xt);
    }
  );
  e.observe(document.documentElement, {
    childList: !0,
    subtree: !0
  }), U.push(() => {
    e.disconnect();
  });
}
function Xi() {
  if (typeof window > "u" || typeof PerformanceObserver > "u")
    return;
  const e = () => {
    const r = performance.getEntriesByType(
      "navigation"
    )[0];
    r && (g.page_load_ms = Math.round(
      r.loadEventEnd - r.startTime
    ), g.dns_ms = Math.round(
      r.domainLookupEnd - r.domainLookupStart
    ), g.connect_ms = Math.round(
      r.connectEnd - r.connectStart
    ), g.tls_ms = Math.round(
      r.secureConnectionStart > 0 ? r.connectEnd - r.secureConnectionStart : 0
    ), g.ttfb = Math.round(
      r.responseStart - r.requestStart
    ), g.download_ms = Math.round(
      r.responseEnd - r.responseStart
    ), g.dom_interactive_ms = Math.round(
      r.domInteractive - r.startTime
    ), g.dom_complete_ms = Math.round(
      r.domComplete - r.startTime
    ), ie());
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
function Wi() {
  if (!(typeof PerformanceObserver > "u") && !zi())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            cn(() => ({
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
function zi() {
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
          cn(() => ({
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
function Ot() {
  H(() => ({
    event_type: "view"
  }));
}
function $e(e, t, n, r, o, i, s) {
  H(() => {
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
function ji(e, t) {
  H(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function Ki() {
  const e = navigator.userAgent;
  return /Mobi|Android/i.test(e) ? "mobile" : /Tablet|iPad/i.test(e) ? "tablet" : "desktop";
}
function Yi() {
  const e = navigator.userAgent;
  return e.includes("Firefox") ? "Firefox" : e.includes("Edg/") ? "Edge" : e.includes("Chrome") ? "Chrome" : e.includes("Safari") ? "Safari" : "Other";
}
function $i() {
  const e = navigator.userAgent;
  return e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : e.includes("Android") ? "Android" : /iPhone|iPad|iPod/.test(e) ? "iOS" : "Other";
}
function Ji() {
  for (const e of U)
    e();
  U = [];
}
const qn = typeof MutationObserver < "u" ? MutationObserver : null;
let Je = !1, Ve = null, Ge = null, Be = null, ot = null;
const ts = {
  init(e) {
    Je || (Br(e), Zr(e.tags), jr(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), Je = !0, En(), Yr(), oo(), Ho(() => {
      En();
    }), e.sessionReplay !== !1 && Kr() && wi(), Ii(), Ve = Vi(), Ge = Gi(), e.openTelemetry && import("./tracing-Cz_MOKGk.js").then(
      (t) => t.initOtelTracing(e)
    ).catch((t) => {
      console.warn(
        "[@oodle-ai/rum] Failed to init OpenTelemetry:",
        t
      );
    }));
  },
  setTags(e) {
    eo(e);
  },
  identify(e) {
    Jr(e);
  },
  trackEvent(e, t) {
    ji(e, t);
  },
  addFeatureFlag(e, t) {
    Uo(e, t);
  },
  getSessionId() {
    return re();
  },
  getUserId() {
    return Gn();
  },
  flush() {
    ct();
  },
  stop() {
    Je && (Ei(), Ji(), io(), Jn(), ct(!0), No(), Do(), Ve && (Ve(), Ve = null), Ge && (Ge(), Ge = null), ke(), Je = !1);
  }
};
function Vi() {
  if (typeof window > "u") return null;
  const e = history.pushState;
  history.pushState = function(...r) {
    e.apply(this, r), Ot();
  };
  const t = history.replaceState;
  history.replaceState = function(...r) {
    t.apply(this, r), Ot();
  };
  const n = () => Ot();
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
function ke() {
  Be && (Be.disconnect(), Be = null), ot && (clearTimeout(ot), ot = null);
}
function Gi() {
  if (typeof document > "u")
    return null;
  const e = 3, t = 1e3, n = 1e3;
  let r = [];
  const o = (s) => {
    var S;
    const c = s.target;
    if (!c) return;
    const a = Zi(c), l = (c.textContent ?? "").trim().slice(0, 200), u = ((S = c.tagName) == null ? void 0 : S.toLowerCase()) ?? "", f = Qi(
      c,
      u,
      l
    ), d = Date.now(), y = s.clientX, p = s.clientY;
    if (r.push({ selector: a, time: d }), r = r.filter(
      (C) => d - C.time < t
    ), r.filter(
      (C) => C.selector === a
    ).length >= e) {
      $e(
        "rage_click",
        f,
        a,
        l,
        !0,
        y,
        p
      ), r = [];
      return;
    }
    i(
      c,
      f,
      a,
      l,
      y,
      p
    );
  };
  document.addEventListener("click", o, {
    capture: !0,
    passive: !0
  });
  function i(s, c, a, l, u, f) {
    var p;
    const d = ((p = s.tagName) == null ? void 0 : p.toLowerCase()) ?? "";
    if (!(d === "a" || d === "button" || d === "input" || d === "select" || d === "textarea" || s.hasAttribute("onclick") || s.getAttribute("role") === "button" || s.closest("a, button") !== null)) {
      $e(
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
    ke(), qn && (Be = new qn(() => {
      ke(), $e(
        "click",
        c,
        a,
        l,
        !1,
        u,
        f
      );
    }), Be.observe(
      document.body,
      {
        childList: !0,
        subtree: !0
      }
    ), ot = setTimeout(() => {
      ke(), $e(
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
    ), ke();
  };
}
function Qi(e, t, n) {
  const r = e.getAttribute("aria-label");
  if (r)
    return `${t}[${r}]`;
  const o = e.getAttribute("title");
  if (o) return `${t}[${o}]`;
  const i = n.split(`
`)[0].trim();
  if (i && i.length <= 80)
    return `${t}[${i}]`;
  if (e.id) return `${t}#${e.id}`;
  const s = Array.from(
    e.classList ?? []
  ).slice(0, 3).join(".");
  return s ? `${t}.${s}` : t;
}
function Zi(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(
    e.classList ?? []
  ).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
export {
  ts as O,
  es as s
};
