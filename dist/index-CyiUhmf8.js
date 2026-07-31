let Gt = null;
function ro(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function oo(e) {
  if (!ro(e.endpoint)) {
    console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    );
    return;
  }
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  ), Gt = e;
}
function Z() {
  if (!Gt)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return Gt;
}
const or = "__oodle_session", io = 1800 * 1e3, so = 14400 * 1e3;
function ao() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
function co() {
  try {
    const e = sessionStorage.getItem(or);
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
function ir(e) {
  try {
    sessionStorage.setItem(
      or,
      JSON.stringify(e)
    );
  } catch {
  }
}
let Ee = null;
function sr(e) {
  Ee || (Ee = setTimeout(() => {
    Ee = null, ir(e);
  }, 1e3));
}
function ln(e) {
  Ee && (clearTimeout(Ee), Ee = null), ir(e);
}
let m = null, ar = 100, cr = 100;
function uo(e, t) {
  ar = Math.max(
    0,
    Math.min(100, e)
  ), cr = Math.max(
    0,
    Math.min(100, t)
  );
}
function Ln(e) {
  return Math.random() * 100 < e;
}
function Q() {
  const e = Date.now();
  if (m || (m = co()), !m || e - m.lastActivity > io || e - m.createdAt > so) {
    const t = Ln(ar);
    m = {
      id: ao(),
      createdAt: e,
      lastActivity: e,
      viewCount: 0,
      errorCount: 0,
      actionCount: 0,
      sampled: t,
      replaySampled: t && Ln(cr),
      replaySegmentSeq: 0
    }, ln(m);
  } else
    m.lastActivity = e, sr(m);
  return m.id;
}
function lo() {
  if (Q(), !m) return 0;
  const e = m.replaySegmentSeq;
  return m.replaySegmentSeq = e + 1, ln(m), e;
}
function ur() {
  return Q(), (m == null ? void 0 : m.sampled) ?? !0;
}
function fo() {
  return Q(), (m == null ? void 0 : m.replaySampled) ?? !0;
}
let Ye = null;
function mo() {
  typeof document > "u" || (lr(), Ye = () => {
    document.visibilityState === "hidden" && m && ln(m);
  }, document.addEventListener(
    "visibilitychange",
    Ye
  ));
}
function lr() {
  Ye && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    Ye
  ), Ye = null);
}
function fr(e) {
  Q(), m && (e === "view" || e === "page_load" ? m.viewCount++ : e === "error" ? m.errorCount++ : e === "action" && m.actionCount++, sr(m));
}
function po() {
  return Q(), {
    viewCount: (m == null ? void 0 : m.viewCount) ?? 0,
    errorCount: (m == null ? void 0 : m.errorCount) ?? 0,
    actionCount: (m == null ? void 0 : m.actionCount) ?? 0
  };
}
let X = null;
function vo(e) {
  X = e;
}
function dr() {
  return (X == null ? void 0 : X.id) ?? "";
}
function ho() {
  return (X == null ? void 0 : X.name) ?? "";
}
function yo() {
  return (X == null ? void 0 : X.email) ?? "";
}
function go() {
  return X ? "identified" : "anonymous";
}
const _o = 5e5;
function $t(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > _o) return n;
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
let wt = {};
function wo(e) {
  e && (wt = { ...e });
}
function To(e) {
  wt = { ...wt, ...e };
}
function Eo() {
  return wt;
}
const So = 6e4, bo = "sdk_telemetry", Se = {
  events_rate_limited: 0,
  events_should_send_dropped: 0,
  send_failures: 0,
  compression_failures: 0,
  retry_drops: 0,
  transport_drops: 0,
  exit_send_failures: 0,
  replay_events_dropped: 0,
  replay_rebases: 0,
  replay_overload_pauses: 0
};
function F(e, t = 1) {
  Se[e] += t;
}
function Co() {
  for (const e in Se)
    if (Se[e] > 0)
      return !0;
  return !1;
}
function Jt() {
  if (!Co()) return;
  const e = { ...Se };
  for (const t in Se)
    Se[t] = 0;
  hn(bo, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let We = null, je = null;
function Io() {
  We || (We = setInterval(
    Jt,
    So
  ), typeof document < "u" && (je = () => {
    document.visibilityState === "hidden" && Jt();
  }, document.addEventListener(
    "visibilitychange",
    je
  )));
}
function Lo() {
  We && (clearInterval(We), We = null), je && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    je
  ), je = null), Jt();
}
var D = Uint8Array, O = Uint16Array, fn = Int32Array, dn = new D([
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
]), mn = new D([
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
]), An = new D([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), mr = function(e, t) {
  for (var n = new O(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new fn(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, pr = mr(dn, 2), Ao = pr.b, Kt = pr.r;
Ao[28] = 258, Kt[258] = 28;
var Mo = mr(mn, 0), Mn = Mo.r, Qt = new O(32768);
for (var S = 0; S < 32768; ++S) {
  var te = (S & 43690) >> 1 | (S & 21845) << 1;
  te = (te & 52428) >> 2 | (te & 13107) << 2, te = (te & 61680) >> 4 | (te & 3855) << 4, Qt[S] = ((te & 65280) >> 8 | (te & 255) << 8) >> 1;
}
var Ve = (function(e, t, n) {
  for (var r = e.length, o = 0, i = new O(t); o < r; ++o)
    e[o] && ++i[e[o] - 1];
  var s = new O(t);
  for (o = 1; o < t; ++o)
    s[o] = s[o - 1] + i[o - 1] << 1;
  var c;
  if (n) {
    c = new O(1 << t);
    var a = 15 - t;
    for (o = 0; o < r; ++o)
      if (e[o])
        for (var l = o << 4 | e[o], u = t - e[o], f = s[e[o] - 1]++ << u, p = f | (1 << u) - 1; f <= p; ++f)
          c[Qt[f] >> a] = l;
  } else
    for (c = new O(r), o = 0; o < r; ++o)
      e[o] && (c[o] = Qt[s[e[o] - 1]++] >> 15 - e[o]);
  return c;
}), pe = new D(288);
for (var S = 0; S < 144; ++S)
  pe[S] = 8;
for (var S = 144; S < 256; ++S)
  pe[S] = 9;
for (var S = 256; S < 280; ++S)
  pe[S] = 7;
for (var S = 280; S < 288; ++S)
  pe[S] = 8;
var Tt = new D(32);
for (var S = 0; S < 32; ++S)
  Tt[S] = 5;
var ko = /* @__PURE__ */ Ve(pe, 9, 0), Ro = /* @__PURE__ */ Ve(Tt, 5, 0), vr = function(e) {
  return (e + 7) / 8 | 0;
}, hr = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new D(e.subarray(t, n));
}, $ = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, Ne = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, Nt = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: gr, l: 0 };
  if (o == 1) {
    var s = new D(n[0].s + 1);
    return s[n[0].s] = 1, { t: s, l: 1 };
  }
  n.sort(function(_, I) {
    return _.f - I.f;
  }), n.push({ s: -1, f: 25001 });
  var c = n[0], a = n[1], l = 0, u = 1, f = 2;
  for (n[0] = { s: -1, f: c.f + a.f, l: c, r: a }; u != o - 1; )
    c = n[n[l].f < n[f].f ? l++ : f++], a = n[l != u && n[l].f < n[f].f ? l++ : f++], n[u++] = { s: -1, f: c.f + a.f, l: c, r: a };
  for (var p = i[0].s, r = 1; r < o; ++r)
    i[r].s > p && (p = i[r].s);
  var g = new O(p + 1), y = Zt(n[u - 1], g, 0);
  if (y > t) {
    var r = 0, T = 0, E = y - t, b = 1 << E;
    for (i.sort(function(I, h) {
      return g[h.s] - g[I.s] || I.f - h.f;
    }); r < o; ++r) {
      var k = i[r].s;
      if (g[k] > t)
        T += b - (1 << y - g[k]), g[k] = t;
      else
        break;
    }
    for (T >>= E; T > 0; ) {
      var L = i[r].s;
      g[L] < t ? T -= 1 << t - g[L]++ - 1 : ++r;
    }
    for (; r >= 0 && T; --r) {
      var C = i[r].s;
      g[C] == t && (--g[C], ++T);
    }
    y = t;
  }
  return { t: new D(g), l: y };
}, Zt = function(e, t, n) {
  return e.s == -1 ? Math.max(Zt(e.l, t, n + 1), Zt(e.r, t, n + 1)) : t[e.s] = n;
}, kn = function(e) {
  for (var t = e.length; t && !e[--t]; )
    ;
  for (var n = new O(++t), r = 0, o = e[0], i = 1, s = function(a) {
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
}, Be = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, yr = function(e, t, n) {
  var r = n.length, o = vr(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, Rn = function(e, t, n, r, o, i, s, c, a, l, u) {
  $(t, u++, n), ++o[256];
  for (var f = Nt(o, 15), p = f.t, g = f.l, y = Nt(i, 15), T = y.t, E = y.l, b = kn(p), k = b.c, L = b.n, C = kn(T), _ = C.c, I = C.n, h = new O(19), v = 0; v < k.length; ++v)
    ++h[k[v] & 31];
  for (var v = 0; v < _.length; ++v)
    ++h[_[v] & 31];
  for (var d = Nt(h, 7), R = d.t, he = d.l, x = 19; x > 4 && !R[An[x - 1]]; --x)
    ;
  var ye = l + 5 << 3, B = Be(o, pe) + Be(i, Tt) + s, q = Be(o, p) + Be(i, T) + s + 14 + 3 * x + Be(h, R) + 2 * h[16] + 3 * h[17] + 7 * h[18];
  if (a >= 0 && ye <= B && ye <= q)
    return yr(t, u, e.subarray(a, a + l));
  var Y, A, z, ee;
  if ($(t, u, 1 + (q < B)), u += 2, q < B) {
    Y = Ve(p, g, 0), A = p, z = Ve(T, E, 0), ee = T;
    var Dt = Ve(R, he, 0);
    $(t, u, L - 257), $(t, u + 5, I - 1), $(t, u + 10, x - 4), u += 14;
    for (var v = 0; v < x; ++v)
      $(t, u + 3 * v, R[An[v]]);
    u += 3 * x;
    for (var W = [k, _], Ue = 0; Ue < 2; ++Ue)
      for (var ge = W[Ue], v = 0; v < ge.length; ++v) {
        var j = ge[v] & 31;
        $(t, u, Dt[j]), u += R[j], j > 15 && ($(t, u, ge[v] >> 5 & 127), u += ge[v] >> 12);
      }
  } else
    Y = ko, A = pe, z = Ro, ee = Tt;
  for (var v = 0; v < c; ++v) {
    var M = r[v];
    if (M > 255) {
      var j = M >> 18 & 31;
      Ne(t, u, Y[j + 257]), u += A[j + 257], j > 7 && ($(t, u, M >> 23 & 31), u += dn[j]);
      var _e = M & 31;
      Ne(t, u, z[_e]), u += ee[_e], _e > 3 && (Ne(t, u, M >> 5 & 8191), u += mn[_e]);
    } else
      Ne(t, u, Y[M]), u += A[M];
  }
  return Ne(t, u, Y[256]), u + A[256];
}, xo = /* @__PURE__ */ new fn([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), gr = /* @__PURE__ */ new D(0), Oo = function(e, t, n, r, o, i) {
  var s = i.z || e.length, c = new D(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = c.subarray(r, c.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (a[0] = i.r >> 3);
    for (var f = xo[t - 1], p = f >> 13, g = f & 8191, y = (1 << n) - 1, T = i.p || new O(32768), E = i.h || new O(y + 1), b = Math.ceil(n / 3), k = 2 * b, L = function(Ut) {
      return (e[Ut] ^ e[Ut + 1] << b ^ e[Ut + 2] << k) & y;
    }, C = new fn(25e3), _ = new O(288), I = new O(32), h = 0, v = 0, d = i.i || 0, R = 0, he = i.w || 0, x = 0; d + 2 < s; ++d) {
      var ye = L(d), B = d & 32767, q = E[ye];
      if (T[B] = q, E[ye] = B, he <= d) {
        var Y = s - d;
        if ((h > 7e3 || R > 24576) && (Y > 423 || !l)) {
          u = Rn(e, a, 0, C, _, I, v, R, x, d - x, u), R = h = v = 0, x = d;
          for (var A = 0; A < 286; ++A)
            _[A] = 0;
          for (var A = 0; A < 30; ++A)
            I[A] = 0;
        }
        var z = 2, ee = 0, Dt = g, W = B - q & 32767;
        if (Y > 2 && ye == L(d - W))
          for (var Ue = Math.min(p, Y) - 1, ge = Math.min(32767, d), j = Math.min(258, Y); W <= ge && --Dt && B != q; ) {
            if (e[d + z] == e[d + z - W]) {
              for (var M = 0; M < j && e[d + M] == e[d + M - W]; ++M)
                ;
              if (M > z) {
                if (z = M, ee = W, M > Ue)
                  break;
                for (var _e = Math.min(W, M - 2), Sn = 0, A = 0; A < _e; ++A) {
                  var Ht = d - W + A & 32767, no = T[Ht], bn = Ht - no & 32767;
                  bn > Sn && (Sn = bn, q = Ht);
                }
              }
            }
            B = q, q = T[B], W += B - q & 32767;
          }
        if (ee) {
          C[R++] = 268435456 | Kt[z] << 18 | Mn[ee];
          var Cn = Kt[z] & 31, In = Mn[ee] & 31;
          v += dn[Cn] + mn[In], ++_[257 + Cn], ++I[In], he = d + z, ++h;
        } else
          C[R++] = e[d], ++_[e[d]];
      }
    }
    for (d = Math.max(d, he); d < s; ++d)
      C[R++] = e[d], ++_[e[d]];
    u = Rn(e, a, l, C, _, I, v, R, x, d - x, u), l || (i.r = u & 7 | a[u / 8 | 0] << 3, u -= 7, i.h = E, i.p = T, i.i = d, i.w = he);
  } else {
    for (var d = i.w || 0; d < s + l; d += 65535) {
      var Ft = d + 65535;
      Ft >= s && (a[u / 8 | 0] = l, Ft = s), u = yr(a, u + 1, e.subarray(d, Ft));
    }
    i.i = s;
  }
  return hr(c, 0, r + vr(u) + o);
}, Po = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), Do = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = Po[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, Ho = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new D(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return Oo(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, en = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, Fo = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && en(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, Uo = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function No(e, t) {
  t || (t = {});
  var n = Do(), r = e.length;
  n.p(e);
  var o = Ho(e, t, Uo(t), 8), i = o.length;
  return Fo(o, t), en(o, i - 8, n.d()), en(o, i - 4, r), o;
}
var xn = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), Bo = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), qo = 0;
try {
  Bo.decode(gr, { stream: !0 }), qo = 1;
} catch {
}
function zo(e, t) {
  var n;
  if (xn)
    return xn.encode(e);
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
  return hr(o, 0, i);
}
function Xo(e) {
  try {
    return No(zo(e));
  } catch {
    return null;
  }
}
const Yo = "0.2.8", On = 5e3, _r = 50, wr = 5e5, Pn = 256e3, Et = "replay", Tr = 8e4, Er = 32, Wo = 2e7, jo = 5, Vo = 1e3, Go = 6e4, $o = 500, St = 63e3;
let be = 0, Ce = 0, ne = [], Ge = 0, Bt = null;
const bt = /* @__PURE__ */ new Map();
let Ie = null, Le = null;
function Jo() {
  try {
    return Z().flushIntervalMs ?? On;
  } catch {
    return On;
  }
}
function Sr(e) {
  let t = bt.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, bt.set(e, t)), t;
}
function pn(e) {
  const t = Xo(e);
  return t ? {
    body: new Blob([
      t
    ]),
    encoding: "gzip"
  } : (F("compression_failures"), { body: e, encoding: "" });
}
const Ko = 64e3;
function tn(e, t) {
  if (e === Et)
    return {
      bytes: $t(
        t,
        Ko
      ),
      oversized: !1
    };
  const n = $t(
    t,
    Pn + 1
  );
  return {
    bytes: n,
    oversized: n > Pn
  };
}
let nn = null;
function Qo(e) {
  nn = e;
}
function kt(e) {
  F("transport_drops"), e === Et && nn && nn();
}
const Zo = "/v1/rum/ingest";
function ei(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: Yo
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
function ti(e, t, n) {
  const r = Z();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const a = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, l = new Blob([n], {
      type: "application/json"
    });
    if (l.size < St && navigator.sendBeacon(a, l))
      return;
  }
  const { body: o, encoding: i } = pn(n), s = { ...t };
  i ? s["Content-Encoding"] = i : delete s["Content-Encoding"];
  const c = o instanceof Blob ? o.size : n.length;
  fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: c < St,
    credentials: "omit"
  }).catch(() => {
    F("exit_send_failures");
  });
}
function qt(e, t, n, r) {
  const o = n.length;
  if (Ge + o > Wo) {
    F("retry_drops"), r && kt(r);
    return;
  }
  const i = { ...t };
  delete i["Content-Encoding"], ne.push({
    url: e,
    headers: i,
    body: n,
    bytes: o,
    attempts: 0,
    batchKey: r
  }), Ge += o, br();
}
function br() {
  if (Bt || ne.length === 0)
    return;
  const e = ne[0], t = Math.min(
    Vo * Math.pow(2, e.attempts),
    Go
  );
  Bt = setTimeout(() => {
    Bt = null, Cr();
  }, t);
}
async function Cr() {
  for (; ne.length > 0 && be < Tr && Ce < Er; ) {
    const e = ne.shift();
    if (Ge -= e.bytes, e.attempts++, e.attempts > jo) {
      F("retry_drops"), e.batchKey && kt(e.batchKey);
      continue;
    }
    const t = e.bytes;
    be += t, Ce++;
    try {
      const { body: n, encoding: r } = pn(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < St,
        credentials: "omit"
      });
      if (Ir(i), i.status === 429 || i.status >= 500) {
        ne.unshift(e), Ge += e.bytes;
        break;
      }
    } catch {
      ne.unshift(e), Ge += e.bytes;
      break;
    } finally {
      be -= t, Ce--;
    }
  }
  ne.length > 0 && br();
}
function ni() {
  Ie && (clearTimeout(Ie), Ie = null), Le && (clearTimeout(Le), Le = null);
}
function vn() {
  const e = Jo();
  Ie && clearTimeout(Ie), Ie = setTimeout(
    () => ie(),
    e
  ), Le || (Le = setTimeout(
    () => {
      Le = null, ie();
    },
    e + $o
  ));
}
function hn(e, t) {
  const { bytes: n, oversized: r } = tn(
    e,
    t
  );
  if (r) {
    console.warn(
      `[@oodle-ai/rum] Dropping oversized ${e} payload (${n} bytes)`
    ), kt(e);
    return;
  }
  const o = Sr(e);
  if (o.items.push(t), o.bytesEstimate += n, o.items.length >= _r || o.bytesEstimate >= wr) {
    ie();
    return;
  }
  vn();
}
function ri(e, t, n) {
  const { bytes: r, oversized: o } = tn(
    e,
    n
  );
  if (o) {
    kt(e);
    return;
  }
  const i = Sr(e), s = i.upsertMap.get(t);
  if (s !== void 0) {
    const c = tn(
      e,
      i.items[s]
    ).bytes;
    i.items[s] = n, i.bytesEstimate += r - c;
  } else {
    const c = i.items.length;
    i.items.push(n), i.upsertMap.set(t, c), i.bytesEstimate += r;
  }
  if (i.items.length >= _r || i.bytesEstimate >= wr) {
    ie();
    return;
  }
  vn();
}
const Dn = ["events", "replay"];
function ie(e = !1) {
  const t = Z();
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    vn();
    return;
  }
  ni();
  const n = Eo(), r = [], o = Array.from(
    bt.keys()
  ).sort((l, u) => {
    const f = Dn.indexOf(l), p = Dn.indexOf(u), g = f >= 0 ? f : 999, y = p >= 0 ? p : 999;
    return g - y;
  });
  for (const l of o) {
    const u = bt.get(l);
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
  const i = ei(r), s = `${t.endpoint}${Zo}`, c = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, a = r.some(
    (l) => l.type === Et
  );
  if (e) {
    ti(s, c, i);
    return;
  }
  oi(
    s,
    c,
    i,
    a ? Et : void 0
  );
}
async function oi(e, t, n, r) {
  const o = n.length;
  if (be >= Tr || Ce >= Er) {
    qt(e, t, n, r);
    return;
  }
  be += o, Ce++;
  try {
    const { body: i, encoding: s } = pn(n), c = { ...t };
    s && (c["Content-Encoding"] = s);
    const a = await fetch(e, {
      method: "POST",
      headers: c,
      body: i,
      keepalive: o < St,
      credentials: "omit"
    });
    Ir(a), (a.status === 429 || a.status >= 500) && qt(e, t, n, r);
  } catch {
    F("send_failures"), qt(e, t, n, r);
  } finally {
    be -= o, Ce--, Cr();
  }
}
const rn = /* @__PURE__ */ new Map();
function Ir(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && rn.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function Rt(e) {
  const t = rn.get(e);
  return t ? Date.now() >= t ? (rn.delete(e), !1) : !0 : !1;
}
let $e = null, Je = null, Ke = null, on = null;
function ii(e) {
  on = e;
}
const Lr = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function Hn() {
  typeof document > "u" || ($e = () => {
    document.visibilityState === "hidden" && ie(!0);
  }, Je = () => ie(!0), Ke = (e) => {
    e.persisted && on && on();
  }, document.addEventListener(
    "visibilitychange",
    $e
  ), window.addEventListener(
    Lr,
    Je
  ), window.addEventListener(
    "pageshow",
    Ke
  ));
}
function si() {
  $e && (document.removeEventListener(
    "visibilitychange",
    $e
  ), $e = null), Je && (window.removeEventListener(
    Lr,
    Je
  ), Je = null), Ke && (window.removeEventListener(
    "pageshow",
    Ke
  ), Ke = null);
}
const Ct = /* @__PURE__ */ new Map();
function ai(e, t) {
  Ct.set(e, t);
}
function ci() {
  return Ct.size === 0 ? {} : Object.fromEntries(Ct);
}
function ui() {
  Ct.clear();
}
var sn, re, Qe, Ar, It, Mr = -1, ve = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (Mr = t.timeStamp, e(t));
  }), !0);
}, yn = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, xt = function() {
  var e = yn();
  return e && e.activationStart || 0;
}, U = function(e, t) {
  var n = yn(), r = "navigate";
  return Mr >= 0 ? r = "back-forward-cache" : n && (document.prerendering || xt() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, Fe = function(e, t, n) {
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
}, gn = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, it = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, Ot = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, we = -1, Fn = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, Lt = function(e) {
  document.visibilityState === "hidden" && we > -1 && (we = e.type === "visibilitychange" ? e.timeStamp : 0, li());
}, Un = function() {
  addEventListener("visibilitychange", Lt, !0), addEventListener("prerenderingchange", Lt, !0);
}, li = function() {
  removeEventListener("visibilitychange", Lt, !0), removeEventListener("prerenderingchange", Lt, !0);
}, _n = function() {
  return we < 0 && (we = Fn(), Un(), ve((function() {
    setTimeout((function() {
      we = Fn(), Un();
    }), 0);
  }))), { get firstHiddenTime() {
    return we;
  } };
}, st = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, Nn = [1800, 3e3], kr = function(e, t) {
  t = t || {}, st((function() {
    var n, r = _n(), o = U("FCP"), i = Fe("paint", (function(s) {
      s.forEach((function(c) {
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < r.firstHiddenTime && (o.value = Math.max(c.startTime - xt(), 0), o.entries.push(c), n(!0)));
      }));
    }));
    i && (n = N(e, o, Nn, t.reportAllChanges), ve((function(s) {
      o = U("FCP"), n = N(e, o, Nn, t.reportAllChanges), gn((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, Bn = [0.1, 0.25], fi = function(e, t) {
  t = t || {}, kr(Ot((function() {
    var n, r = U("CLS", 0), o = 0, i = [], s = function(a) {
      a.forEach((function(l) {
        if (!l.hadRecentInput) {
          var u = i[0], f = i[i.length - 1];
          o && l.startTime - f.startTime < 1e3 && l.startTime - u.startTime < 5e3 ? (o += l.value, i.push(l)) : (o = l.value, i = [l]);
        }
      })), o > r.value && (r.value = o, r.entries = i, n());
    }, c = Fe("layout-shift", s);
    c && (n = N(e, r, Bn, t.reportAllChanges), it((function() {
      s(c.takeRecords()), n(!0);
    })), ve((function() {
      o = 0, r = U("CLS", 0), n = N(e, r, Bn, t.reportAllChanges), gn((function() {
        return n();
      }));
    })), setTimeout(n, 0));
  })));
}, Rr = 0, zt = 1 / 0, ut = 0, di = function(e) {
  e.forEach((function(t) {
    t.interactionId && (zt = Math.min(zt, t.interactionId), ut = Math.max(ut, t.interactionId), Rr = ut ? (ut - zt) / 7 + 1 : 0);
  }));
}, xr = function() {
  return sn ? Rr : performance.interactionCount || 0;
}, mi = function() {
  "interactionCount" in performance || sn || (sn = Fe("event", di, { type: "event", buffered: !0, durationThreshold: 0 }));
}, V = [], pt = /* @__PURE__ */ new Map(), Or = 0, pi = function() {
  var e = Math.min(V.length - 1, Math.floor((xr() - Or) / 50));
  return V[e];
}, vi = [], hi = function(e) {
  if (vi.forEach((function(o) {
    return o(e);
  })), e.interactionId || e.entryType === "first-input") {
    var t = V[V.length - 1], n = pt.get(e.interactionId);
    if (n || V.length < 10 || e.duration > t.latency) {
      if (n) e.duration > n.latency ? (n.entries = [e], n.latency = e.duration) : e.duration === n.latency && e.startTime === n.entries[0].startTime && n.entries.push(e);
      else {
        var r = { id: e.interactionId, latency: e.duration, entries: [e] };
        pt.set(r.id, r), V.push(r);
      }
      V.sort((function(o, i) {
        return i.latency - o.latency;
      })), V.length > 10 && V.splice(10).forEach((function(o) {
        return pt.delete(o.id);
      }));
    }
  }
}, Pr = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = Ot(e), document.visibilityState === "hidden" ? e() : (n = t(e), it(e)), n;
}, qn = [200, 500], yi = function(e, t) {
  "PerformanceEventTiming" in self && "interactionId" in PerformanceEventTiming.prototype && (t = t || {}, st((function() {
    var n;
    mi();
    var r, o = U("INP"), i = function(c) {
      Pr((function() {
        c.forEach(hi);
        var a = pi();
        a && a.latency !== o.value && (o.value = a.latency, o.entries = a.entries, r());
      }));
    }, s = Fe("event", i, { durationThreshold: (n = t.durationThreshold) !== null && n !== void 0 ? n : 40 });
    r = N(e, o, qn, t.reportAllChanges), s && (s.observe({ type: "first-input", buffered: !0 }), it((function() {
      i(s.takeRecords()), r(!0);
    })), ve((function() {
      Or = xr(), V.length = 0, pt.clear(), o = U("INP"), r = N(e, o, qn, t.reportAllChanges);
    })));
  })));
}, zn = [2500, 4e3], Xt = {}, gi = function(e, t) {
  t = t || {}, st((function() {
    var n, r = _n(), o = U("LCP"), i = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - xt(), 0), o.entries = [l], n());
      }));
    }, s = Fe("largest-contentful-paint", i);
    if (s) {
      n = N(e, o, zn, t.reportAllChanges);
      var c = Ot((function() {
        Xt[o.id] || (i(s.takeRecords()), s.disconnect(), Xt[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(a) {
        addEventListener(a, (function() {
          return Pr(c);
        }), { once: !0, capture: !0 });
      })), it(c), ve((function(a) {
        o = U("LCP"), n = N(e, o, zn, t.reportAllChanges), gn((function() {
          o.value = performance.now() - a.timeStamp, Xt[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, Xn = [800, 1800], _i = function e(t) {
  document.prerendering ? st((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, wi = function(e, t) {
  t = t || {};
  var n = U("TTFB"), r = N(e, n, Xn, t.reportAllChanges);
  _i((function() {
    var o = yn();
    o && (n.value = Math.max(o.responseStart - xt(), 0), n.entries = [o], r(!0), ve((function() {
      n = U("TTFB", 0), (r = N(e, n, Xn, t.reportAllChanges))(!0);
    })));
  }));
}, ze = { passive: !0, capture: !0 }, Ti = /* @__PURE__ */ new Date(), Yn = function(e, t) {
  re || (re = t, Qe = e, Ar = /* @__PURE__ */ new Date(), Hr(removeEventListener), Dr());
}, Dr = function() {
  if (Qe >= 0 && Qe < Ar - Ti) {
    var e = { entryType: "first-input", name: re.type, target: re.target, cancelable: re.cancelable, startTime: re.timeStamp, processingStart: re.timeStamp + Qe };
    It.forEach((function(t) {
      t(e);
    })), It = [];
  }
}, Ei = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        Yn(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, ze), removeEventListener("pointercancel", i, ze);
      };
      addEventListener("pointerup", o, ze), addEventListener("pointercancel", i, ze);
    })(t, e) : Yn(t, e);
  }
}, Hr = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, Ei, ze);
  }));
}, Wn = [100, 300], Si = function(e, t) {
  t = t || {}, st((function() {
    var n, r = _n(), o = U("FID"), i = function(a) {
      a.startTime < r.firstHiddenTime && (o.value = a.processingStart - a.startTime, o.entries.push(a), n(!0));
    }, s = function(a) {
      a.forEach(i);
    }, c = Fe("first-input", s);
    n = N(e, o, Wn, t.reportAllChanges), c && (it(Ot((function() {
      s(c.takeRecords()), c.disconnect();
    }))), ve((function() {
      var a;
      o = U("FID"), n = N(e, o, Wn, t.reportAllChanges), It = [], Qe = -1, re = null, Hr(addEventListener), a = i, It.push(a), Dr();
    })));
  }));
};
const bi = 50, jn = 200, Vn = /* @__PURE__ */ new Map();
function Ci(e) {
  let t = Vn.get(e);
  return t || (t = {
    tokens: jn,
    lastRefill: Date.now(),
    rate: bi,
    burst: jn
  }, Vn.set(e, t)), t;
}
function Ii(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function Li(e) {
  const t = Ci(e);
  return Ii(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let an = null, cn = null;
function xs(e, t) {
  an = e, cn = t;
}
const Ai = "00000000000000000000000000000000";
function Fr() {
  if (!an || !cn) return null;
  try {
    const e = an.getSpan(
      cn.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === Ai ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const Gn = "replay", Mi = 200, $n = 6e4, ki = 5e3, Ri = 8e6, Ur = 2, xi = 3, Jn = 750, Nr = 5e3, Oi = 3, Pi = 3e4, Di = 5e3, Hi = 16, Fi = 100, Ui = 3e5, Ni = 9e5;
let At = null, G = null, qe = null, Oe = [], et = 0, Te = "", wn = !1, Br = 0, Yt = "", J = 0, me = Date.now(), se = !1, tt = 0, ue = null, Pe = !1, Ae = null, qr = 0, zr = [], Me = null, oe = null, ke = null, le = null, De = !1, fe = !1, at = !1, vt = null, ht = null, K = null;
function nt() {
  Me && (clearTimeout(Me), Me = null), oe && (oe(), oe = null);
  const e = zr.splice(0);
  for (const t of e)
    un(t);
}
function Bi() {
  if (!Me) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        () => {
          oe = null, nt();
        },
        { timeout: Fi }
      );
      oe = () => cancelIdleCallback(e);
    }
    Me = setTimeout(() => {
      Me = null, oe && (oe(), oe = null), nt();
    }, Hi);
  }
}
function rt(e = !1) {
  if (Pe = !0, Ae) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - me, r = Math.max(
      0,
      Nr - n
    ), o = Date.now() - qr, i = Math.max(
      0,
      Di - o
    );
    t = Math.max(
      r,
      i
    );
  }
  Ae = setTimeout(() => {
    Ae = null, qi();
  }, t);
}
function qi() {
  if (Pe && !(!At || !G) && !se) {
    if (tt++, tt > Oi) {
      Yi();
      return;
    }
    qr = Date.now(), J = 0, me = Date.now();
    try {
      At.takeFullSnapshot(!0), F("replay_rebases");
    } catch {
      He(), ct();
    }
  }
}
function Kn() {
  F("replay_events_dropped");
}
function Xr() {
  if (Te) return !1;
  Te = Q(), Br = lo();
  const e = Yt !== "" && Yt !== Te;
  return Yt = Te, e;
}
function Pt() {
  if (Xi(), Oe.length === 0) return;
  if (Rt(Gn)) {
    zi(), Yr();
    return;
  }
  Xr();
  const e = Te, t = Br, n = Oe.splice(0);
  et = 0, Te = "", wn = !0, hn(Gn, {
    session_id: e,
    segment_index: t,
    events: n
  });
}
function zi() {
  et <= Ri || (F(
    "replay_events_dropped",
    Oe.length
  ), Oe.length = 0, et = 0, rt());
}
let Re = null;
function Xi() {
  Re && (clearTimeout(Re), Re = null);
}
function Yr() {
  if (Re) return;
  const e = Z().replayFlushIntervalMs ?? ki;
  Re = setTimeout(() => {
    Re = null, Pt();
  }, e);
}
function un(e) {
  Xr() && e.type !== Ur && rt(!0), Oe.push(e), et += $t(
    e,
    $n
  ), Oe.length >= Mi || et >= $n ? Pt() : Yr();
}
function Yi() {
  se = !0, F("replay_overload_pauses"), He(), ue && clearTimeout(ue), ue = setTimeout(() => {
    ue = null, se = !1, tt = 0, J = 0, me = Date.now(), !De && !fe && !at && K && ct();
  }, Pi);
}
function Wi(e) {
  if (se) return;
  if (e.type === Ur) {
    nt(), Pe = !1, J = 0, me = Date.now(), un(e);
    return;
  }
  if (e.type !== xi) {
    nt(), un(e);
    return;
  }
  if (Pe) {
    Kn(), rt();
    return;
  }
  const t = Date.now();
  if (t - me > Nr && (J <= Jn && (tt = 0), J = 0, me = t), J++, J > Jn) {
    Kn(), rt();
    return;
  }
  zr.push(e), Bi();
}
async function ct() {
  if (K && !se && !G)
    return qe || (qe = ji().finally(
      () => {
        qe = null;
      }
    ), qe);
}
async function ji() {
  if (!K) return;
  const e = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', t = '[data-oodle-privacy="mask"],.oodle-privacy-mask', { record: n } = await import("./rrweb-C8n2IwJP.js");
  !K || se || G || (At = n, Pe = !1, J = 0, me = Date.now(), G = n({
    sampling: {
      mousemove: 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: 3e5,
    emit(r) {
      Wi(r);
    },
    maskAllInputs: K.maskAllInputs,
    maskInputOptions: K.maskInputOptions,
    maskTextFn: K.maskTextContent ? () => "•••" : void 0,
    blockSelector: e,
    maskTextSelector: t,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => Pt(), 200));
}
function He() {
  G && (G(), G = null), Ae && (clearTimeout(Ae), Ae = null), Pe = !1, nt(), Pt();
}
function Wr() {
  const e = Z(), t = e.replayIdlePauseMs ?? Ui, n = e.replayIdleExpireMs ?? Ni;
  ke && clearTimeout(ke), le && (clearTimeout(le), le = null), ke = setTimeout(() => {
    De = !0, He();
  }, t), le = setTimeout(() => {
    at = !0, He(), jr();
  }, n);
}
function Vi() {
  at || (De && (De = !1, fe || ct()), Wr());
}
function Gi() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => Vi(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  vt = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function jr() {
  vt && (vt(), vt = null), ke && (clearTimeout(ke), ke = null), le && (clearTimeout(le), le = null);
}
function $i() {
  if (typeof document > "u") return;
  const e = () => {
    document.visibilityState === "hidden" ? !fe && G && (fe = !0, He()) : fe && (fe = !1, !De && !at && ct());
  };
  document.addEventListener(
    "visibilitychange",
    e
  ), ht = () => {
    document.removeEventListener(
      "visibilitychange",
      e
    );
  };
}
async function Ji() {
  const t = Z().privacyLevel ?? "mask-user-input";
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
  } : o = !1, K = {
    privacyLevel: t,
    maskAllInputs: o,
    maskInputOptions: n,
    maskTextContent: r
  }, Qo(() => {
    G && rt();
  }), await ct(), Gi(), $i(), Wr();
}
function Ki() {
  return G !== null && !se;
}
function Qi() {
  return wn;
}
function Zi() {
  He(), jr(), ht && (ht(), ht = null), ue && (clearTimeout(ue), ue = null), De = !1, fe = !1, at = !1, se = !1, wn = !1, tt = 0, J = 0, K = null, At = null;
}
let H = [], ce = null;
const es = [
  "error",
  "action",
  "console",
  "resource"
];
function ts(e) {
  return es.includes(e) && (Rt(e) || !Li(e)) ? (F("events_rate_limited"), !0) : !1;
}
function ot(e) {
  try {
    const t = new URL(e);
    return t.origin + t.pathname;
  } catch {
    return e;
  }
}
function ns() {
  ce || (ce = {
    device_type: bs(),
    browser_name: Cs(),
    os_name: Is(),
    user_agent: navigator.userAgent,
    language: navigator.language
  });
}
function Vr() {
  ns();
  const e = po(), t = ci(), n = Z(), r = {
    session_id: Q(),
    user_id: dr(),
    user_name: ho(),
    user_email: yo(),
    user_status: go(),
    service: n.service,
    env: n.env ?? "",
    version: n.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: window.location.origin + window.location.pathname,
    view_url_host: window.location.hostname,
    view_url_path: window.location.pathname,
    referrer_url: ot(document.referrer),
    device_type: ce.device_type,
    browser_name: ce.browser_name,
    os_name: ce.os_name,
    user_agent: ce.user_agent,
    language: ce.language,
    session_view_count: e.viewCount,
    session_error_count: e.errorCount,
    session_action_count: e.actionCount,
    replay_id: Ki() && Qi() ? Q() : ""
  };
  return Object.keys(t).length > 0 && (r.feature_flags = t), r;
}
function rs(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const Gr = "events";
function P(e) {
  if (!ur() || Rt("events")) return;
  const t = e(), n = t.event_type;
  if (ts(n)) return;
  fr(n);
  const r = Vr();
  hn(
    Gr,
    { ...r, ...t }
  );
}
function Tn(e) {
  rs(
    () => P(e)
  );
}
function os(e) {
  if (!ur() || Rt("events")) return;
  const t = e(), n = t.event_type;
  fr(n);
  const r = Vr(), o = r.session_id + ":" + r.view_url_path;
  ri(
    Gr,
    o,
    { ...r, ...t }
  );
}
function is() {
  ss(), as(), us(), ls(), ws(), ys(), gs(), _s(), Ts(), cs();
}
function ss() {
  const e = (n) => {
    P(() => {
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
    P(() => ({
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
  ), H.push(() => {
    window.removeEventListener("error", e), window.removeEventListener(
      "unhandledrejection",
      t
    );
  });
}
function Qn(e) {
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function as() {
  const e = {
    error: console.error,
    warn: console.warn
  };
  console.error = (...t) => {
    const n = t.map(Qn).join(" ");
    P(() => ({
      event_type: "console",
      console_level: "error",
      console_message: n
    })), e.error.apply(console, t);
  }, console.warn = (...t) => {
    const n = t.map(Qn).join(" ");
    P(() => ({
      event_type: "console",
      console_level: "warn",
      console_message: n
    })), e.warn.apply(console, t);
  }, H.push(() => {
    console.error = e.error, console.warn = e.warn;
  });
}
const w = {};
let de = null, yt = 0, Zn = "";
function $r() {
  const e = JSON.stringify(w);
  if (e === Zn) return;
  Zn = e, yt = 0;
  const t = w.page_load_ms || w.lcp || w.dom_complete_ms || 0, n = t > 0;
  os(() => ({
    event_type: n ? "page_load" : "view",
    page_load_ms: t,
    lcp_ms: w.lcp ?? 0,
    fid_ms: w.fid ?? 0,
    inp_ms: w.inp ?? 0,
    cls: w.cls ?? 0,
    fcp_ms: w.fcp ?? 0,
    ttfb_ms: w.ttfb ?? 0,
    dns_ms: w.dns_ms ?? 0,
    connect_ms: w.connect_ms ?? 0,
    dom_interactive_ms: w.dom_interactive_ms ?? 0,
    dom_complete_ms: w.dom_complete_ms ?? 0
  }));
}
function ae() {
  const e = Date.now();
  yt || (yt = e);
  const t = e - yt, n = Math.max(0, 5e3 - t);
  de && clearTimeout(de), de = setTimeout(() => {
    de = null, $r();
  }, n);
}
function cs() {
  if (typeof document > "u") return;
  const e = () => {
    document.visibilityState === "hidden" && (de && (clearTimeout(de), de = null), $r());
  };
  document.addEventListener(
    "visibilitychange",
    e
  ), H.push(() => {
    document.removeEventListener(
      "visibilitychange",
      e
    );
  });
}
function us() {
  gi((e) => {
    w.lcp = e.value, ae();
  }), Si((e) => {
    w.fid = e.value, ae();
  }), yi((e) => {
    w.inp = e.value, ae();
  }), fi((e) => {
    w.cls = e.value, ae();
  }), kr((e) => {
    w.fcp = e.value, ae();
  }), wi((e) => {
    w.ttfb = e.value, ae();
  });
}
function En(e) {
  const t = Z().endpoint;
  return e.startsWith(t);
}
function ls() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || En(r.name))
          continue;
        const i = ot(r.name), s = r.duration, c = r.transferSize ?? 0, a = o;
        Tn(
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
function Mt(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function fs(e) {
  try {
    return new URL(e, location.href).href;
  } catch {
    return e;
  }
}
function Wt(e, t, n) {
  return n.some(
    (r) => typeof r == "string" ? e.startsWith(r) || t.startsWith(r) : r.test(e) || r.test(t)
  );
}
function Jr(e) {
  const t = fs(e), n = Z();
  let r = !1;
  const o = n.allowedTracingUrls;
  o && o.length > 0 && (r = Wt(
    t,
    e,
    o
  ));
  let i = null;
  const s = n.forwardNetworkBodies;
  s && Wt(
    t,
    e,
    s.urls
  ) && (i = s);
  let c = !1;
  const a = n.forwardNetworkHeaders;
  return a && (c = Wt(
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
const gt = /* @__PURE__ */ new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "proxy-authorization"
]);
function Kr(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      gt.has(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      gt.has(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      gt.has(r) || (t[r] = e[n]);
    }
  return t;
}
function ds(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    gt.has(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function xe(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function ms(e, t) {
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
function ps(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function vs(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      Kr(
        e
      )
    );
  } catch {
    return "";
  }
}
function er(e) {
  try {
    return JSON.stringify(
      Kr(e)
    );
  } catch {
    return "";
  }
}
function Qr(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function hs(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: xe(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: xe(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : Qr(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => xe(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function Zr(e, t, n) {
  const r = function(o, i) {
    const s = ps(o);
    if (En(s))
      return t.apply(e, [
        o,
        i
      ]);
    const c = Qr(o), a = ((i == null ? void 0 : i.method) ?? (c ? o.method : "GET")).toUpperCase(), l = performance.now(), u = Jr(s);
    let f = "", p = "";
    if (n.injectTracing) {
      const E = Fr();
      if (E)
        f = E.traceId, p = E.spanId;
      else if (u.trace) {
        f = Mt(16), p = Mt(8);
        const b = new Headers(
          (i == null ? void 0 : i.headers) ?? {}
        );
        b.set(
          "traceparent",
          `00-${f}-${p}-01`
        ), i = { ...i, headers: b };
      }
    }
    let g = "", y = null;
    if (u.bodyCfg) {
      const E = u.bodyCfg.maxBodySize ?? 65536, b = hs(
        i,
        o,
        E
      );
      g = b.sync, y = b.asyncP;
    }
    let T = "";
    return u.captureHeaders && (i != null && i.headers ? T = vs(
      i.headers
    ) : c && (T = er(
      o.headers
    ))), t.apply(e, [o, i]).then((E) => {
      const b = E.status, k = Math.round(
        performance.now() - l
      );
      let L = "";
      u.captureHeaders && (L = er(
        E.headers
      ));
      const C = (I) => {
        const h = {
          event_type: "resource",
          resource_url: ot(s),
          resource_method: a,
          resource_status: b,
          resource_duration_ms: k,
          resource_size: 0,
          resource_type: "fetch"
        };
        return f && (h.trace_id = f, h.span_id = p), I && (h.request_body = I), T && (h.request_headers = T), L && (h.response_headers = L), h;
      }, _ = y || Promise.resolve(g);
      if (u.bodyCfg) {
        const I = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          _,
          ms(
            E.clone(),
            I
          ).catch(() => "")
        ]).then(([h, v]) => {
          P(() => {
            const d = C(h);
            return v && (d.response_body = v), d;
          });
        }).catch(() => {
          _.then((h) => {
            P(
              () => C(h)
            );
          });
        });
      } else
        _.then((I) => {
          P(() => C(I));
        });
      return E;
    }).catch((E) => {
      const b = Math.round(
        performance.now() - l
      );
      throw (y || Promise.resolve(g)).then((L) => {
        P(() => {
          const C = {
            event_type: "resource",
            resource_url: ot(s),
            resource_method: a,
            resource_status: 0,
            resource_duration_ms: b,
            resource_size: 0,
            resource_type: "fetch"
          };
          return f && (C.trace_id = f, C.span_id = p), L && (C.request_body = L), T && (C.request_headers = T), C;
        });
      }), E;
    });
  };
  return e.fetch = r, () => {
    e.fetch = t;
  };
}
function eo(e, t, n) {
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
    if (En(c))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const a = Jr(c);
    let l = "", u = "";
    if (n.injectTracing) {
      const _ = Fr();
      _ ? (l = _.traceId, u = _.spanId) : a.trace && (l = Mt(16), u = Mt(8), i.call(
        this,
        "traceparent",
        `00-${l}-${u}-01`
      ));
    }
    let f = "";
    if (a.bodyCfg && s) {
      const _ = a.bodyCfg.maxBodySize ?? 65536;
      typeof s == "string" ? f = xe(
        s,
        _
      ) : typeof URLSearchParams < "u" && s instanceof URLSearchParams && (f = xe(
        s.toString(),
        _
      ));
    }
    let p = "";
    if (a.captureHeaders)
      try {
        const _ = this.__oodleReqHeaders;
        _ && Object.keys(_).length > 0 && (p = JSON.stringify(_));
      } catch {
      }
    const g = performance.now(), y = this, T = l, E = u, b = f, k = a.bodyCfg, L = p, C = a.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        const _ = Math.round(
          performance.now() - g
        ), I = y.__oodleMethod ?? "GET";
        P(() => {
          const h = {
            event_type: "resource",
            resource_url: ot(c),
            resource_method: I,
            resource_status: y.status,
            resource_duration_ms: _,
            resource_size: 0,
            resource_type: "xhr"
          };
          if (T && (h.trace_id = T, h.span_id = E), b && (h.request_body = b), k)
            try {
              const v = y.responseText ?? "";
              h.response_body = xe(
                v,
                k.maxBodySize ?? 65536
              );
            } catch {
            }
          if (L && (h.request_headers = L), C)
            try {
              const v = y.getAllResponseHeaders();
              v && (h.response_headers = JSON.stringify(
                ds(v)
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
const to = {
  injectTracing: !0
}, tr = {
  injectTracing: !1
};
function ys() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = Zr(
    window,
    window.fetch,
    to
  );
  H.push(e);
}
function gs() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = eo(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    to
  );
  H.push(e);
}
const nr = /* @__PURE__ */ new WeakSet();
function jt(e) {
  if (nr.has(e)) return;
  nr.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (Zr(
        n,
        n.fetch,
        tr
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (eo(
        r.prototype,
        r.prototype.setRequestHeader,
        tr
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), H.push(() => {
    e.removeEventListener("load", t);
  });
}
function _s() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach(jt);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          r instanceof HTMLIFrameElement && jt(r), r instanceof HTMLElement && r.childElementCount > 0 && r.querySelectorAll("iframe").forEach(jt);
    }
  );
  e.observe(document.documentElement, {
    childList: !0,
    subtree: !0
  }), H.push(() => {
    e.disconnect();
  });
}
function ws() {
  if (typeof window > "u" || typeof PerformanceObserver > "u")
    return;
  const e = () => {
    const r = performance.getEntriesByType(
      "navigation"
    )[0];
    r && (w.page_load_ms = Math.round(
      r.loadEventEnd - r.startTime
    ), w.dns_ms = Math.round(
      r.domainLookupEnd - r.domainLookupStart
    ), w.connect_ms = Math.round(
      r.connectEnd - r.connectStart
    ), w.tls_ms = Math.round(
      r.secureConnectionStart > 0 ? r.connectEnd - r.secureConnectionStart : 0
    ), w.ttfb = Math.round(
      r.responseStart - r.requestStart
    ), w.download_ms = Math.round(
      r.responseEnd - r.responseStart
    ), w.dom_interactive_ms = Math.round(
      r.domInteractive - r.startTime
    ), w.dom_complete_ms = Math.round(
      r.domComplete - r.startTime
    ), ae());
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
function Ts() {
  if (!(typeof PerformanceObserver > "u") && !Es())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            Tn(() => ({
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
function Es() {
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
          Tn(() => ({
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
function Vt() {
  P(() => ({
    event_type: "view"
  }));
}
function lt(e, t, n, r, o, i, s) {
  P(() => {
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
function Ss(e, t) {
  P(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function bs() {
  const e = navigator.userAgent;
  return /Mobi|Android/i.test(e) ? "mobile" : /Tablet|iPad/i.test(e) ? "tablet" : "desktop";
}
function Cs() {
  const e = navigator.userAgent;
  return e.includes("Firefox") ? "Firefox" : e.includes("Edg/") ? "Edge" : e.includes("Chrome") ? "Chrome" : e.includes("Safari") ? "Safari" : "Other";
}
function Is() {
  const e = navigator.userAgent;
  return e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : e.includes("Android") ? "Android" : /iPhone|iPad|iPod/.test(e) ? "iOS" : "Other";
}
function Ls() {
  for (const e of H)
    e();
  H = [];
}
const rr = typeof MutationObserver < "u" ? MutationObserver : null;
let ft = !1, dt = null, mt = null, Ze = null, _t = null;
const Os = {
  init(e) {
    ft || (oo(e), wo(e.tags), uo(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), ft = !0, Hn(), mo(), Io(), ii(() => {
      Hn();
    }), e.sessionReplay !== !1 && fo() && Ji(), is(), dt = As(), mt = Ms(), e.openTelemetry && import("./tracing-R3Kg2ATq.js").then(
      (t) => t.initOtelTracing(e)
    ).catch((t) => {
      console.warn(
        "[@oodle-ai/rum] Failed to init OpenTelemetry:",
        t
      );
    }));
  },
  setTags(e) {
    To(e);
  },
  identify(e) {
    vo(e);
  },
  trackEvent(e, t) {
    Ss(e, t);
  },
  addFeatureFlag(e, t) {
    ai(e, t);
  },
  getSessionId() {
    return Q();
  },
  getUserId() {
    return dr();
  },
  flush() {
    ie();
  },
  stop() {
    ft && (Zi(), Ls(), Lo(), lr(), ie(!0), ui(), si(), dt && (dt(), dt = null), mt && (mt(), mt = null), Xe(), ft = !1);
  }
};
function As() {
  if (typeof window > "u") return null;
  const e = history.pushState;
  history.pushState = function(...r) {
    e.apply(this, r), Vt();
  };
  const t = history.replaceState;
  history.replaceState = function(...r) {
    t.apply(this, r), Vt();
  };
  const n = () => Vt();
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
function Xe() {
  Ze && (Ze.disconnect(), Ze = null), _t && (clearTimeout(_t), _t = null);
}
function Ms() {
  if (typeof document > "u")
    return null;
  const e = 3, t = 1e3, n = 1e3;
  let r = [];
  const o = (s) => {
    var E;
    const c = s.target;
    if (!c) return;
    const a = Rs(c), l = (c.textContent ?? "").trim().slice(0, 200), u = ((E = c.tagName) == null ? void 0 : E.toLowerCase()) ?? "", f = ks(
      c,
      u,
      l
    ), p = Date.now(), g = s.clientX, y = s.clientY;
    if (r.push({ selector: a, time: p }), r = r.filter(
      (b) => p - b.time < t
    ), r.filter(
      (b) => b.selector === a
    ).length >= e) {
      lt(
        "rage_click",
        f,
        a,
        l,
        !0,
        g,
        y
      ), r = [];
      return;
    }
    i(
      c,
      f,
      a,
      l,
      g,
      y
    );
  };
  document.addEventListener("click", o, {
    capture: !0,
    passive: !0
  });
  function i(s, c, a, l, u, f) {
    var y;
    const p = ((y = s.tagName) == null ? void 0 : y.toLowerCase()) ?? "";
    if (!(p === "a" || p === "button" || p === "input" || p === "select" || p === "textarea" || s.hasAttribute("onclick") || s.getAttribute("role") === "button" || s.closest("a, button") !== null)) {
      lt(
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
    Xe(), rr && (Ze = new rr(() => {
      Xe(), lt(
        "click",
        c,
        a,
        l,
        !1,
        u,
        f
      );
    }), Ze.observe(
      document.body,
      {
        childList: !0,
        subtree: !0
      }
    ), _t = setTimeout(() => {
      Xe(), lt(
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
    ), Xe();
  };
}
function ks(e, t, n) {
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
function Rs(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(
    e.classList ?? []
  ).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
export {
  Os as O,
  xs as s
};
