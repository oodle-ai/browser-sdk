let tn = null;
function wo(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function To(e) {
  return wo(e.endpoint) ? (typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  ), tn = {
    ...e,
    viewUrlQueryParams: Eo(
      e.viewUrlQueryParams
    )
  }, !0) : (console.error(
    `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
  ), !1);
}
function Eo(e) {
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
function ne() {
  if (!tn)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return tn;
}
const gr = "__oodle_session", So = 1800 * 1e3, bo = 14400 * 1e3;
function Ao() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
function Io() {
  try {
    const e = sessionStorage.getItem(gr);
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
function _r(e) {
  try {
    sessionStorage.setItem(
      gr,
      JSON.stringify(e)
    );
  } catch {
  }
}
let Ae = null;
function wr(e) {
  Ae || (Ae = setTimeout(() => {
    Ae = null, _r(e);
  }, 1e3));
}
function _n(e) {
  Ae && (clearTimeout(Ae), Ae = null), _r(e);
}
let h = null, Tr = 100, Er = 100;
function Mo(e, t) {
  Tr = Math.max(
    0,
    Math.min(100, e)
  ), Er = Math.max(
    0,
    Math.min(100, t)
  );
}
function Un(e) {
  return Math.random() * 100 < e;
}
function ee() {
  const e = Date.now();
  if (h || (h = Io()), !h || e - h.lastActivity > So || e - h.createdAt > bo) {
    const t = Un(Tr);
    h = {
      id: Ao(),
      createdAt: e,
      lastActivity: e,
      viewCount: 0,
      errorCount: 0,
      actionCount: 0,
      sampled: t,
      replaySampled: t && Un(Er),
      replaySegmentSeq: 0
    }, _n(h);
  } else
    h.lastActivity = e, wr(h);
  return h.id;
}
function Co() {
  if (ee(), !h) return 0;
  const e = h.replaySegmentSeq;
  return h.replaySegmentSeq = e + 1, _n(h), e;
}
function Sr() {
  return ee(), (h == null ? void 0 : h.sampled) ?? !0;
}
function br() {
  return ee(), (h == null ? void 0 : h.replaySampled) ?? !0;
}
let Ge = null;
function Lo() {
  typeof document > "u" || (Ar(), Ge = () => {
    document.visibilityState === "hidden" && h && _n(h);
  }, document.addEventListener(
    "visibilitychange",
    Ge
  ));
}
function Ar() {
  Ge && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    Ge
  ), Ge = null);
}
function Ir(e) {
  ee(), h && (e === "view" || e === "page_load" ? h.viewCount++ : e === "error" ? h.errorCount++ : e === "action" && h.actionCount++, wr(h));
}
function Ro() {
  return ee(), {
    viewCount: (h == null ? void 0 : h.viewCount) ?? 0,
    errorCount: (h == null ? void 0 : h.errorCount) ?? 0,
    actionCount: (h == null ? void 0 : h.actionCount) ?? 0
  };
}
let X = null;
function ko(e) {
  X = e;
}
function Mr() {
  return (X == null ? void 0 : X.id) ?? "";
}
function xo() {
  return (X == null ? void 0 : X.name) ?? "";
}
function Oo() {
  return (X == null ? void 0 : X.email) ?? "";
}
function Po() {
  return X ? "identified" : "anonymous";
}
const Do = 5e5;
function Ct(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > Do) return n;
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
let st = {};
function No(e) {
  e && (st = { ...e, ...st });
}
function Uo(e) {
  st = { ...st, ...e };
}
function Ho() {
  return st;
}
const Fo = 6e4, Bo = "sdk_telemetry", Ie = {
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
function qo() {
  for (const e in Ie)
    if (Ie[e] > 0)
      return !0;
  return !1;
}
function nn() {
  if (!qo()) return;
  const e = { ...Ie };
  for (const t in Ie)
    Ie[t] = 0;
  bn(Bo, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let Je = null, Ke = null;
function zo() {
  Je || (Je = setInterval(
    nn,
    Fo
  ), typeof document < "u" && (Ke = () => {
    document.visibilityState === "hidden" && nn();
  }, document.addEventListener(
    "visibilitychange",
    Ke
  )));
}
function Xo() {
  Je && (clearInterval(Je), Je = null), Ke && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    Ke
  ), Ke = null), nn();
}
var U = Uint8Array, N = Uint16Array, wn = Int32Array, Tn = new U([
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
]), En = new U([
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
]), Hn = new U([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Cr = function(e, t) {
  for (var n = new N(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new wn(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, Lr = Cr(Tn, 2), Yo = Lr.b, rn = Lr.r;
Yo[28] = 258, rn[258] = 28;
var Vo = Cr(En, 0), Fn = Vo.r, on = new N(32768);
for (var b = 0; b < 32768; ++b) {
  var oe = (b & 43690) >> 1 | (b & 21845) << 1;
  oe = (oe & 52428) >> 2 | (oe & 13107) << 2, oe = (oe & 61680) >> 4 | (oe & 3855) << 4, on[b] = ((oe & 65280) >> 8 | (oe & 255) << 8) >> 1;
}
var Qe = (function(e, t, n) {
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
        for (var l = o << 4 | e[o], u = t - e[o], f = s[e[o] - 1]++ << u, d = f | (1 << u) - 1; f <= d; ++f)
          c[on[f] >> a] = l;
  } else
    for (c = new N(r), o = 0; o < r; ++o)
      e[o] && (c[o] = on[s[e[o] - 1]++] >> 15 - e[o]);
  return c;
}), ye = new U(288);
for (var b = 0; b < 144; ++b)
  ye[b] = 8;
for (var b = 144; b < 256; ++b)
  ye[b] = 9;
for (var b = 256; b < 280; ++b)
  ye[b] = 7;
for (var b = 280; b < 288; ++b)
  ye[b] = 8;
var Lt = new U(32);
for (var b = 0; b < 32; ++b)
  Lt[b] = 5;
var Wo = /* @__PURE__ */ Qe(ye, 9, 0), jo = /* @__PURE__ */ Qe(Lt, 5, 0), Rr = function(e) {
  return (e + 7) / 8 | 0;
}, kr = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new U(e.subarray(t, n));
}, G = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, Ye = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, Wt = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: Or, l: 0 };
  if (o == 1) {
    var s = new U(n[0].s + 1);
    return s[n[0].s] = 1, { t: s, l: 1 };
  }
  n.sort(function(T, I) {
    return T.f - I.f;
  }), n.push({ s: -1, f: 25001 });
  var c = n[0], a = n[1], l = 0, u = 1, f = 2;
  for (n[0] = { s: -1, f: c.f + a.f, l: c, r: a }; u != o - 1; )
    c = n[n[l].f < n[f].f ? l++ : f++], a = n[l != u && n[l].f < n[f].f ? l++ : f++], n[u++] = { s: -1, f: c.f + a.f, l: c, r: a };
  for (var d = i[0].s, r = 1; r < o; ++r)
    i[r].s > d && (d = i[r].s);
  var y = new N(d + 1), p = sn(n[u - 1], y, 0);
  if (p > t) {
    var r = 0, _ = 0, w = p - t, S = 1 << w;
    for (i.sort(function(I, g) {
      return y[g.s] - y[I.s] || I.f - g.f;
    }); r < o; ++r) {
      var R = i[r].s;
      if (y[R] > t)
        _ += S - (1 << p - y[R]), y[R] = t;
      else
        break;
    }
    for (_ >>= w; _ > 0; ) {
      var M = i[r].s;
      y[M] < t ? _ -= 1 << t - y[M]++ - 1 : ++r;
    }
    for (; r >= 0 && _; --r) {
      var A = i[r].s;
      y[A] == t && (--y[A], ++_);
    }
    p = t;
  }
  return { t: new U(y), l: p };
}, sn = function(e, t, n) {
  return e.s == -1 ? Math.max(sn(e.l, t, n + 1), sn(e.r, t, n + 1)) : t[e.s] = n;
}, Bn = function(e) {
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
}, Ve = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, xr = function(e, t, n) {
  var r = n.length, o = Rr(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, qn = function(e, t, n, r, o, i, s, c, a, l, u) {
  G(t, u++, n), ++o[256];
  for (var f = Wt(o, 15), d = f.t, y = f.l, p = Wt(i, 15), _ = p.t, w = p.l, S = Bn(d), R = S.c, M = S.n, A = Bn(_), T = A.c, I = A.n, g = new N(19), v = 0; v < R.length; ++v)
    ++g[R[v] & 31];
  for (var v = 0; v < T.length; ++v)
    ++g[T[v] & 31];
  for (var m = Wt(g, 7), P = m.t, _e = m.l, D = 19; D > 4 && !P[Hn[D - 1]]; --D)
    ;
  var we = l + 5 << 3, B = Ve(o, ye) + Ve(i, Lt) + s, q = Ve(o, d) + Ve(i, _) + s + 14 + 3 * D + Ve(g, P) + 2 * g[16] + 3 * g[17] + 7 * g[18];
  if (a >= 0 && we <= B && we <= q)
    return xr(t, u, e.subarray(a, a + l));
  var Y, C, z, re;
  if (G(t, u, 1 + (q < B)), u += 2, q < B) {
    Y = Qe(d, y, 0), C = d, z = Qe(_, w, 0), re = _;
    var zt = Qe(P, _e, 0);
    G(t, u, M - 257), G(t, u + 5, I - 1), G(t, u + 10, D - 4), u += 14;
    for (var v = 0; v < D; ++v)
      G(t, u + 3 * v, P[Hn[v]]);
    u += 3 * D;
    for (var V = [R, T], Xe = 0; Xe < 2; ++Xe)
      for (var Te = V[Xe], v = 0; v < Te.length; ++v) {
        var W = Te[v] & 31;
        G(t, u, zt[W]), u += P[W], W > 15 && (G(t, u, Te[v] >> 5 & 127), u += Te[v] >> 12);
      }
  } else
    Y = Wo, C = ye, z = jo, re = Lt;
  for (var v = 0; v < c; ++v) {
    var L = r[v];
    if (L > 255) {
      var W = L >> 18 & 31;
      Ye(t, u, Y[W + 257]), u += C[W + 257], W > 7 && (G(t, u, L >> 23 & 31), u += Tn[W]);
      var Ee = L & 31;
      Ye(t, u, z[Ee]), u += re[Ee], Ee > 3 && (Ye(t, u, L >> 5 & 8191), u += En[Ee]);
    } else
      Ye(t, u, Y[L]), u += C[L];
  }
  return Ye(t, u, Y[256]), u + C[256];
}, $o = /* @__PURE__ */ new wn([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Or = /* @__PURE__ */ new U(0), Go = function(e, t, n, r, o, i) {
  var s = i.z || e.length, c = new U(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = c.subarray(r, c.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (a[0] = i.r >> 3);
    for (var f = $o[t - 1], d = f >> 13, y = f & 8191, p = (1 << n) - 1, _ = i.p || new N(32768), w = i.h || new N(p + 1), S = Math.ceil(n / 3), R = 2 * S, M = function(Vt) {
      return (e[Vt] ^ e[Vt + 1] << S ^ e[Vt + 2] << R) & p;
    }, A = new wn(25e3), T = new N(288), I = new N(32), g = 0, v = 0, m = i.i || 0, P = 0, _e = i.w || 0, D = 0; m + 2 < s; ++m) {
      var we = M(m), B = m & 32767, q = w[we];
      if (_[B] = q, w[we] = B, _e <= m) {
        var Y = s - m;
        if ((g > 7e3 || P > 24576) && (Y > 423 || !l)) {
          u = qn(e, a, 0, A, T, I, v, P, D, m - D, u), P = g = v = 0, D = m;
          for (var C = 0; C < 286; ++C)
            T[C] = 0;
          for (var C = 0; C < 30; ++C)
            I[C] = 0;
        }
        var z = 2, re = 0, zt = y, V = B - q & 32767;
        if (Y > 2 && we == M(m - V))
          for (var Xe = Math.min(d, Y) - 1, Te = Math.min(32767, m), W = Math.min(258, Y); V <= Te && --zt && B != q; ) {
            if (e[m + z] == e[m + z - V]) {
              for (var L = 0; L < W && e[m + L] == e[m + L - V]; ++L)
                ;
              if (L > z) {
                if (z = L, re = V, L > Xe)
                  break;
                for (var Ee = Math.min(V, L - 2), On = 0, C = 0; C < Ee; ++C) {
                  var Xt = m - V + C & 32767, _o = _[Xt], Pn = Xt - _o & 32767;
                  Pn > On && (On = Pn, q = Xt);
                }
              }
            }
            B = q, q = _[B], V += B - q & 32767;
          }
        if (re) {
          A[P++] = 268435456 | rn[z] << 18 | Fn[re];
          var Dn = rn[z] & 31, Nn = Fn[re] & 31;
          v += Tn[Dn] + En[Nn], ++T[257 + Dn], ++I[Nn], _e = m + z, ++g;
        } else
          A[P++] = e[m], ++T[e[m]];
      }
    }
    for (m = Math.max(m, _e); m < s; ++m)
      A[P++] = e[m], ++T[e[m]];
    u = qn(e, a, l, A, T, I, v, P, D, m - D, u), l || (i.r = u & 7 | a[u / 8 | 0] << 3, u -= 7, i.h = w, i.p = _, i.i = m, i.w = _e);
  } else {
    for (var m = i.w || 0; m < s + l; m += 65535) {
      var Yt = m + 65535;
      Yt >= s && (a[u / 8 | 0] = l, Yt = s), u = xr(a, u + 1, e.subarray(m, Yt));
    }
    i.i = s;
  }
  return kr(c, 0, r + Rr(u) + o);
}, Jo = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), Ko = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = Jo[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, Qo = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new U(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return Go(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, an = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, Zo = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && an(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, ei = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function ti(e, t) {
  t || (t = {});
  var n = Ko(), r = e.length;
  n.p(e);
  var o = Qo(e, t, ei(t), 8), i = o.length;
  return Zo(o, t), an(o, i - 8, n.d()), an(o, i - 4, r), o;
}
var zn = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), ni = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), ri = 0;
try {
  ni.decode(Or, { stream: !0 }), ri = 1;
} catch {
}
function oi(e, t) {
  var n;
  if (zn)
    return zn.encode(e);
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
  return kr(o, 0, i);
}
function wt(e) {
  try {
    return ti(oi(e));
  } catch {
    return null;
  }
}
const ii = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function si(e) {
  if (!ii)
    return wt(e);
  try {
    const t = new Response(e).body;
    if (!t) return wt(e);
    const n = t.pipeThrough(
      new CompressionStream("gzip")
    ), r = await new Response(
      n
    ).arrayBuffer();
    return new Uint8Array(r);
  } catch {
    return wt(e);
  }
}
const ai = "0.4.0", Xn = 5e3, Pr = 50, Dr = 5e5, Yn = 256e3, Rt = "replay", Nr = 8e4, Ur = 32, ci = 2e7, ui = 5, li = 1e3, fi = 6e4, di = 500, kt = 63e3;
let Me = 0, Ce = 0, ie = [], Ze = 0, jt = null;
const xt = /* @__PURE__ */ new Map();
let Le = null, Re = null, cn = null, et = !1;
function mi() {
  try {
    return ne().flushIntervalMs ?? Xn;
  } catch {
    return Xn;
  }
}
function Hr(e) {
  let t = xt.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, xt.set(e, t)), t;
}
function Fr(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (x("compression_failures"), { body: t, encoding: "" });
}
async function Br(e) {
  return Fr(await si(e), e);
}
function pi(e) {
  return Fr(wt(e), e);
}
const hi = 64e3;
function un(e, t, n) {
  if (e === Rt)
    return {
      bytes: n ?? Ct(
        t,
        hi
      ),
      oversized: !1
    };
  const r = Ct(
    t,
    Yn + 1
  );
  return {
    bytes: r,
    oversized: r > Yn
  };
}
let ln = null;
function vi(e) {
  ln = e;
}
function Ht(e) {
  x("transport_drops"), e === Rt && ln && ln();
}
const yi = "/v1/rum/ingest";
function gi(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: ai
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
function _i(e, t, n) {
  const r = ne();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const a = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, l = new Blob([n], {
      type: "application/json"
    });
    if (l.size < kt && navigator.sendBeacon(a, l))
      return;
  }
  const { body: o, encoding: i } = pi(n), s = { ...t };
  i ? s["Content-Encoding"] = i : delete s["Content-Encoding"];
  const c = o instanceof Blob ? o.size : n.length;
  fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: c < kt,
    credentials: "omit"
  }).catch(() => {
    x("exit_send_failures");
  });
}
function $t(e, t, n, r) {
  const o = n.length;
  if (Ze + o > ci) {
    x("retry_drops"), r && Ht(r);
    return;
  }
  const i = { ...t };
  delete i["Content-Encoding"], ie.push({
    url: e,
    headers: i,
    body: n,
    bytes: o,
    attempts: 0,
    batchKey: r
  }), Ze += o, qr();
}
function qr() {
  if (jt || ie.length === 0)
    return;
  const e = ie[0], t = Math.min(
    li * Math.pow(2, e.attempts),
    fi
  );
  jt = setTimeout(() => {
    jt = null, zr();
  }, t);
}
async function zr() {
  for (; ie.length > 0 && Me < Nr && Ce < Ur; ) {
    const e = ie.shift();
    if (Ze -= e.bytes, e.attempts++, e.attempts > ui) {
      x("retry_drops"), e.batchKey && Ht(e.batchKey);
      continue;
    }
    const t = e.bytes;
    Me += t, Ce++;
    try {
      const { body: n, encoding: r } = await Br(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < kt,
        credentials: "omit"
      });
      if (Yr(i), i.status === 429 || i.status >= 500) {
        ie.unshift(e), Ze += e.bytes;
        break;
      }
    } catch {
      ie.unshift(e), Ze += e.bytes;
      break;
    } finally {
      Me -= t, Ce--;
    }
  }
  ie.length > 0 && qr();
}
function wi() {
  Le && (clearTimeout(Le), Le = null), Re && (clearTimeout(Re), Re = null);
}
function Sn() {
  const e = mi();
  Le && clearTimeout(Le), Le = setTimeout(
    () => te(),
    e
  ), Re || (Re = setTimeout(
    () => {
      Re = null, te();
    },
    e + di
  ));
}
function bn(e, t, n) {
  const { bytes: r, oversized: o } = un(
    e,
    t,
    n
  );
  if (o) {
    console.warn(
      `[@oodle-ai/rum] Dropping oversized ${e} payload (${r} bytes)`
    ), Ht(e);
    return;
  }
  const i = Hr(e);
  if (i.items.push(t), i.bytesEstimate += r, !et && (i.items.length >= Pr || i.bytesEstimate >= Dr)) {
    te();
    return;
  }
  Sn();
}
function Ti(e, t, n) {
  const { bytes: r, oversized: o } = un(
    e,
    n
  );
  if (o) {
    Ht(e);
    return;
  }
  const i = Hr(e), s = i.upsertMap.get(t);
  if (s !== void 0) {
    const c = un(
      e,
      i.items[s]
    ).bytes;
    i.items[s] = n, i.bytesEstimate += r - c;
  } else {
    const c = i.items.length;
    i.items.push(n), i.upsertMap.set(t, c), i.bytesEstimate += r;
  }
  if (!et && (i.items.length >= Pr || i.bytesEstimate >= Dr)) {
    te();
    return;
  }
  Sn();
}
function Xr(e) {
  cn = e;
}
const Vn = ["events", "replay"];
function te(e = !1) {
  const t = ne();
  if (e && cn && !et) {
    et = !0;
    try {
      cn();
    } catch {
    } finally {
      et = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    Sn();
    return;
  }
  wi();
  const n = Ho(), r = [], o = Array.from(
    xt.keys()
  ).sort((l, u) => {
    const f = Vn.indexOf(l), d = Vn.indexOf(u), y = f >= 0 ? f : 999, p = d >= 0 ? d : 999;
    return y - p;
  });
  for (const l of o) {
    const u = xt.get(l);
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
  const i = gi(r), s = `${t.endpoint}${yi}`, c = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, a = r.some(
    (l) => l.type === Rt
  );
  if (e) {
    _i(s, c, i);
    return;
  }
  Ei(
    s,
    c,
    i,
    a ? Rt : void 0
  );
}
async function Ei(e, t, n, r) {
  const o = n.length;
  if (Me >= Nr || Ce >= Ur) {
    $t(e, t, n, r);
    return;
  }
  Me += o, Ce++;
  try {
    const { body: i, encoding: s } = await Br(n), c = { ...t };
    s && (c["Content-Encoding"] = s);
    const a = await fetch(e, {
      method: "POST",
      headers: c,
      body: i,
      keepalive: o < kt,
      credentials: "omit"
    });
    Yr(a), (a.status === 429 || a.status >= 500) && $t(e, t, n, r);
  } catch {
    x("send_failures"), $t(e, t, n, r);
  } finally {
    Me -= o, Ce--, zr();
  }
}
const fn = /* @__PURE__ */ new Map();
function Yr(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && fn.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function Ft(e) {
  const t = fn.get(e);
  return t ? Date.now() >= t ? (fn.delete(e), !1) : !0 : !1;
}
let tt = null, nt = null, rt = null, dn = null;
function Si(e) {
  dn = e;
}
const Vr = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function Wn() {
  typeof document > "u" || (tt = () => {
    document.visibilityState === "hidden" && te(!0);
  }, nt = () => te(!0), rt = (e) => {
    e.persisted && dn && dn();
  }, document.addEventListener(
    "visibilitychange",
    tt
  ), window.addEventListener(
    Vr,
    nt
  ), window.addEventListener(
    "pageshow",
    rt
  ));
}
function bi() {
  tt && (document.removeEventListener(
    "visibilitychange",
    tt
  ), tt = null), nt && (window.removeEventListener(
    Vr,
    nt
  ), nt = null), rt && (window.removeEventListener(
    "pageshow",
    rt
  ), rt = null);
}
const Ot = /* @__PURE__ */ new Map();
function Ai(e, t) {
  Ot.set(e, t);
}
function Ii() {
  return Ot.size === 0 ? {} : Object.fromEntries(Ot);
}
function Mi() {
  Ot.clear();
}
var mn, se, ot, Wr, Pt, jr = -1, ge = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (jr = t.timeStamp, e(t));
  }), !0);
}, An = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, Bt = function() {
  var e = An();
  return e && e.activationStart || 0;
}, H = function(e, t) {
  var n = An(), r = "navigate";
  return jr >= 0 ? r = "back-forward-cache" : n && (document.prerendering || Bt() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, ze = function(e, t, n) {
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
}, F = function(e, t, n, r) {
  var o, i;
  return function(s) {
    t.value >= 0 && (s || r) && ((i = t.value - (o || 0)) || o === void 0) && (o = t.value, t.delta = i, t.rating = (function(c, a) {
      return c > a[1] ? "poor" : c > a[0] ? "needs-improvement" : "good";
    })(t.value, n), e(t));
  };
}, In = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, mt = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, qt = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Se = -1, jn = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, Dt = function(e) {
  document.visibilityState === "hidden" && Se > -1 && (Se = e.type === "visibilitychange" ? e.timeStamp : 0, Ci());
}, $n = function() {
  addEventListener("visibilitychange", Dt, !0), addEventListener("prerenderingchange", Dt, !0);
}, Ci = function() {
  removeEventListener("visibilitychange", Dt, !0), removeEventListener("prerenderingchange", Dt, !0);
}, Mn = function() {
  return Se < 0 && (Se = jn(), $n(), ge((function() {
    setTimeout((function() {
      Se = jn(), $n();
    }), 0);
  }))), { get firstHiddenTime() {
    return Se;
  } };
}, pt = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, Gn = [1800, 3e3], $r = function(e, t) {
  t = t || {}, pt((function() {
    var n, r = Mn(), o = H("FCP"), i = ze("paint", (function(s) {
      s.forEach((function(c) {
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < r.firstHiddenTime && (o.value = Math.max(c.startTime - Bt(), 0), o.entries.push(c), n(!0)));
      }));
    }));
    i && (n = F(e, o, Gn, t.reportAllChanges), ge((function(s) {
      o = H("FCP"), n = F(e, o, Gn, t.reportAllChanges), In((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, Jn = [0.1, 0.25], Li = function(e, t) {
  t = t || {}, $r(qt((function() {
    var n, r = H("CLS", 0), o = 0, i = [], s = function(a) {
      a.forEach((function(l) {
        if (!l.hadRecentInput) {
          var u = i[0], f = i[i.length - 1];
          o && l.startTime - f.startTime < 1e3 && l.startTime - u.startTime < 5e3 ? (o += l.value, i.push(l)) : (o = l.value, i = [l]);
        }
      })), o > r.value && (r.value = o, r.entries = i, n());
    }, c = ze("layout-shift", s);
    c && (n = F(e, r, Jn, t.reportAllChanges), mt((function() {
      s(c.takeRecords()), n(!0);
    })), ge((function() {
      o = 0, r = H("CLS", 0), n = F(e, r, Jn, t.reportAllChanges), In((function() {
        return n();
      }));
    })), setTimeout(n, 0));
  })));
}, Gr = 0, Gt = 1 / 0, vt = 0, Ri = function(e) {
  e.forEach((function(t) {
    t.interactionId && (Gt = Math.min(Gt, t.interactionId), vt = Math.max(vt, t.interactionId), Gr = vt ? (vt - Gt) / 7 + 1 : 0);
  }));
}, Jr = function() {
  return mn ? Gr : performance.interactionCount || 0;
}, ki = function() {
  "interactionCount" in performance || mn || (mn = ze("event", Ri, { type: "event", buffered: !0, durationThreshold: 0 }));
}, $ = [], Tt = /* @__PURE__ */ new Map(), Kr = 0, xi = function() {
  var e = Math.min($.length - 1, Math.floor((Jr() - Kr) / 50));
  return $[e];
}, Oi = [], Pi = function(e) {
  if (Oi.forEach((function(o) {
    return o(e);
  })), e.interactionId || e.entryType === "first-input") {
    var t = $[$.length - 1], n = Tt.get(e.interactionId);
    if (n || $.length < 10 || e.duration > t.latency) {
      if (n) e.duration > n.latency ? (n.entries = [e], n.latency = e.duration) : e.duration === n.latency && e.startTime === n.entries[0].startTime && n.entries.push(e);
      else {
        var r = { id: e.interactionId, latency: e.duration, entries: [e] };
        Tt.set(r.id, r), $.push(r);
      }
      $.sort((function(o, i) {
        return i.latency - o.latency;
      })), $.length > 10 && $.splice(10).forEach((function(o) {
        return Tt.delete(o.id);
      }));
    }
  }
}, Qr = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = qt(e), document.visibilityState === "hidden" ? e() : (n = t(e), mt(e)), n;
}, Kn = [200, 500], Di = function(e, t) {
  "PerformanceEventTiming" in self && "interactionId" in PerformanceEventTiming.prototype && (t = t || {}, pt((function() {
    var n;
    ki();
    var r, o = H("INP"), i = function(c) {
      Qr((function() {
        c.forEach(Pi);
        var a = xi();
        a && a.latency !== o.value && (o.value = a.latency, o.entries = a.entries, r());
      }));
    }, s = ze("event", i, { durationThreshold: (n = t.durationThreshold) !== null && n !== void 0 ? n : 40 });
    r = F(e, o, Kn, t.reportAllChanges), s && (s.observe({ type: "first-input", buffered: !0 }), mt((function() {
      i(s.takeRecords()), r(!0);
    })), ge((function() {
      Kr = Jr(), $.length = 0, Tt.clear(), o = H("INP"), r = F(e, o, Kn, t.reportAllChanges);
    })));
  })));
}, Qn = [2500, 4e3], Jt = {}, Ni = function(e, t) {
  t = t || {}, pt((function() {
    var n, r = Mn(), o = H("LCP"), i = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - Bt(), 0), o.entries = [l], n());
      }));
    }, s = ze("largest-contentful-paint", i);
    if (s) {
      n = F(e, o, Qn, t.reportAllChanges);
      var c = qt((function() {
        Jt[o.id] || (i(s.takeRecords()), s.disconnect(), Jt[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(a) {
        addEventListener(a, (function() {
          return Qr(c);
        }), { once: !0, capture: !0 });
      })), mt(c), ge((function(a) {
        o = H("LCP"), n = F(e, o, Qn, t.reportAllChanges), In((function() {
          o.value = performance.now() - a.timeStamp, Jt[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, Zn = [800, 1800], Ui = function e(t) {
  document.prerendering ? pt((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, Hi = function(e, t) {
  t = t || {};
  var n = H("TTFB"), r = F(e, n, Zn, t.reportAllChanges);
  Ui((function() {
    var o = An();
    o && (n.value = Math.max(o.responseStart - Bt(), 0), n.entries = [o], r(!0), ge((function() {
      n = H("TTFB", 0), (r = F(e, n, Zn, t.reportAllChanges))(!0);
    })));
  }));
}, je = { passive: !0, capture: !0 }, Fi = /* @__PURE__ */ new Date(), er = function(e, t) {
  se || (se = t, ot = e, Wr = /* @__PURE__ */ new Date(), eo(removeEventListener), Zr());
}, Zr = function() {
  if (ot >= 0 && ot < Wr - Fi) {
    var e = { entryType: "first-input", name: se.type, target: se.target, cancelable: se.cancelable, startTime: se.timeStamp, processingStart: se.timeStamp + ot };
    Pt.forEach((function(t) {
      t(e);
    })), Pt = [];
  }
}, Bi = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        er(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, je), removeEventListener("pointercancel", i, je);
      };
      addEventListener("pointerup", o, je), addEventListener("pointercancel", i, je);
    })(t, e) : er(t, e);
  }
}, eo = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, Bi, je);
  }));
}, tr = [100, 300], qi = function(e, t) {
  t = t || {}, pt((function() {
    var n, r = Mn(), o = H("FID"), i = function(a) {
      a.startTime < r.firstHiddenTime && (o.value = a.processingStart - a.startTime, o.entries.push(a), n(!0));
    }, s = function(a) {
      a.forEach(i);
    }, c = ze("first-input", s);
    n = F(e, o, tr, t.reportAllChanges), c && (mt(qt((function() {
      s(c.takeRecords()), c.disconnect();
    }))), ge((function() {
      var a;
      o = H("FID"), n = F(e, o, tr, t.reportAllChanges), Pt = [], ot = -1, se = null, eo(addEventListener), a = i, Pt.push(a), Zr();
    })));
  }));
};
const zi = 50, nr = 200, rr = /* @__PURE__ */ new Map();
function Xi(e) {
  let t = rr.get(e);
  return t || (t = {
    tokens: nr,
    lastRefill: Date.now(),
    rate: zi,
    burst: nr
  }, rr.set(e, t)), t;
}
function Yi(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function Vi(e) {
  const t = Xi(e);
  return Yi(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let pn = null, hn = null;
function ma(e, t) {
  pn = e, hn = t;
}
const Wi = "00000000000000000000000000000000";
function to() {
  if (!pn || !hn) return null;
  try {
    const e = pn.getSpan(
      hn.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === Wi ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const or = 100, ji = 10, ir = 5e3, $i = 3, Gi = 0;
function Ji(e, t = () => Date.now()) {
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
          const p = f.getId(y);
          p !== -1 && (u = p);
        }
      } catch {
      }
    return r.size < ir && r.set(a, u), u;
  }
  function s(a) {
    const l = i(a), u = t();
    let f = n.get(l);
    if (!f) {
      if (n.size >= ir)
        return !0;
      f = {
        tokens: or,
        lastRefillMs: u
      }, n.set(l, f);
    }
    const d = (u - f.lastRefillMs) / 1e3;
    return d > 0 && (f.tokens = Math.min(
      or,
      f.tokens + d * ji
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function c(a) {
    var p, _, w;
    if (a.type !== $i)
      return { event: a, dropped: 0 };
    const l = a.data;
    if (!l || l.source !== Gi || !l.attributes || l.attributes.length === 0)
      return { event: a, dropped: 0 };
    const u = l.attributes.length, f = l.attributes.filter(
      (S) => s(S.id)
    ), d = u - f.length;
    return d === 0 ? { event: a, dropped: 0 } : (l.attributes = f, {
      event: f.length > 0 || (((p = l.adds) == null ? void 0 : p.length) ?? 0) > 0 || (((_ = l.removes) == null ? void 0 : _.length) ?? 0) > 0 || (((w = l.texts) == null ? void 0 : w.length) ?? 0) > 0 ? a : null,
      dropped: d
    });
  }
  return { throttle: c, reset: o };
}
const sr = "replay", Ki = 200, Qi = 6e4, Zi = 5e3, es = 8e6, no = 2, ts = 3, ar = 3e3, ro = 5e3, ns = 3, rs = 3e4, os = 5e3, is = 16, ss = 100, as = 4, cs = 30, cr = 32, ur = 250, us = 36e4;
function ls() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const fs = 3e5, ds = 9e5, ms = 1e3;
let he = null, Z = null, We = null, He = [], Fe = 0, be = "", Cn = !1, oo = 0, Kt = "", K = 0, ve = Date.now(), ce = !1, at = 0, de = null, Be = !1, ke = null, io = 0, J = [], j = 0, xe = null, ae = null, Et = 0;
function qe() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const Ln = Ji(
  () => (he == null ? void 0 : he.mirror) ?? null
);
let Oe = null, me = null, Pe = !1, ct = !1, Rn = 0, St = null, Q = null;
function ps() {
  xe && (clearTimeout(xe), xe = null), ae && (ae(), ae = null);
}
function vn(e, t) {
  ps();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    cs
  ) : null, r = e ? qe() + (n ?? as) : Number.POSITIVE_INFINITY;
  for (; j < J.length; ) {
    const o = Math.min(
      j + cr,
      J.length
    );
    for (; j < o; )
      yn(
        J[j++]
      );
    if (qe() >= r) break;
  }
  if (j >= J.length) {
    J = [], j = 0;
    return;
  }
  j >= cr * 8 && (J = J.slice(j), j = 0), so();
}
function Nt() {
  vn(!1);
}
function so() {
  if (!xe) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          ae = null, vn(!0, t);
        },
        { timeout: ss }
      );
      ae = () => cancelIdleCallback(e);
    }
    xe = setTimeout(() => {
      xe = null, ae && (ae(), ae = null), vn(!0);
    }, is);
  }
}
function ut(e = !1) {
  if (Be = !0, ke) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - ve, r = Math.max(
      0,
      ro - n
    ), o = Date.now() - io, i = Math.max(
      0,
      os - o
    );
    t = Math.max(
      r,
      i
    );
  }
  ke = setTimeout(() => {
    ke = null, hs();
  }, t);
}
function hs() {
  if (!Be || !he || !Z || ce) return;
  at++;
  const e = Et > ur ? 1 : ns;
  if (at > e) {
    gs();
    return;
  }
  io = Date.now(), K = 0, ve = Date.now();
  try {
    const t = qe();
    he.takeFullSnapshot(!0), Et = qe() - t, x("replay_rebases"), Et > ur && x(
      "replay_expensive_snapshots"
    );
  } catch {
    ft(), lt();
  }
}
function lr() {
  x("replay_events_dropped");
}
function ao() {
  if (be) return !1;
  be = ee(), oo = Co();
  const e = Kt !== "" && Kt !== be;
  return Kt = be, e;
}
function ht() {
  if (ys(), He.length === 0) return;
  if (Ft(sr)) {
    vs(), co();
    return;
  }
  ao();
  const e = be, t = oo, n = He.splice(0), r = Fe;
  Fe = 0, be = "", Cn = !0, bn(
    sr,
    {
      session_id: e,
      segment_index: t,
      events: n
    },
    r
  );
}
function vs() {
  Fe <= es || (x(
    "replay_events_dropped",
    He.length
  ), He.length = 0, Fe = 0, ut());
}
let De = null;
function ys() {
  De && (clearTimeout(De), De = null);
}
function co() {
  if (De) return;
  const e = ne().replayFlushIntervalMs ?? Zi;
  De = setTimeout(() => {
    De = null, ht();
  }, e);
}
function yn(e) {
  ao() && e.type !== no && ut(!0), He.push(e), Fe += Ct(e), He.length >= Ki || Fe >= Qi ? ht() : co();
}
function gs() {
  ce = !0, x("replay_overload_pauses"), ft(), de && clearTimeout(de), de = setTimeout(() => {
    de = null, ce = !1, at = 0, K = 0, ve = Date.now(), !Pe && !ct && Q && lt();
  }, rs);
}
function _s(e) {
  if (ce) return;
  if (e.type === no) {
    Nt(), Be = !1, K = 0, ve = Date.now(), yn(e);
    return;
  }
  if (e.type !== ts) {
    Nt(), yn(e);
    return;
  }
  if (Be) {
    lr(), ut();
    return;
  }
  const t = Date.now();
  t - ve > ro && (K <= ar && (at = 0), K = 0, ve = t);
  const n = Ln.throttle(e);
  if (n.dropped > 0 && x(
    "replay_attributes_throttled",
    n.dropped
  ), !!n.event) {
    if (K++, K > ar) {
      lr(), ut();
      return;
    }
    J.push(n.event), so();
  }
}
async function lt() {
  if (Q && !ce && !Z)
    return We || (We = ws().finally(
      () => {
        We = null;
      }
    ), We);
}
async function ws() {
  if (!Q) return;
  const e = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', t = '[data-oodle-privacy="mask"],.oodle-privacy-mask', { record: n } = await import("./rrweb-SbAupvcM.js");
  !Q || ce || Z || (he = n, Be = !1, K = 0, ve = Date.now(), Ln.reset(), Z = n({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: ls() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: us,
    /**
     * rrweb runs this between `lock()` and `unlock()`
     * of its mutation buffers with no `try/finally`, so
     * an exception escaping here leaves the buffer
     * locked and every later DOM mutation is silently
     * discarded. Recording looks alive (mouse and
     * scroll still arrive) while the replay stays
     * frozen on the last snapshot.
     */
    emit(r) {
      try {
        _s(r);
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
    maskAllInputs: Q.maskAllInputs,
    maskInputOptions: Q.maskInputOptions,
    maskTextFn: Q.maskTextContent ? () => "•••" : void 0,
    blockSelector: e,
    maskTextSelector: t,
    recordCrossOriginIframes: !1
  }) ?? null, setTimeout(() => ht(), 200));
}
function ft() {
  Z && (Z(), Z = null), ke && (clearTimeout(ke), ke = null), Be = !1, Nt(), ht();
}
function Ts() {
  const e = ne(), t = e.replayIdlePauseMs ?? fs, n = e.replayIdleExpireMs ?? ds;
  Oe && clearTimeout(Oe), me && (clearTimeout(me), me = null), Oe = setTimeout(() => {
    Pe = !0, ft();
  }, t), me = setTimeout(() => {
    ct = !0, ft();
  }, n);
}
function bt() {
  Rn = qe(), Ts();
}
function Es() {
  if (ct) {
    if (!br()) return;
    ct = !1, Pe = !1, lt(), bt();
    return;
  }
  if (Pe) {
    Pe = !1, lt(), bt();
    return;
  }
  qe() - Rn >= ms && bt();
}
function Ss() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => Es(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  St = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function bs() {
  St && (St(), St = null), Oe && (clearTimeout(Oe), Oe = null), me && (clearTimeout(me), me = null);
}
function As() {
  Nt(), ht();
}
async function Is() {
  const t = ne().privacyLevel ?? "mask-user-input";
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
  } : o = !1, Q = {
    privacyLevel: t,
    maskAllInputs: o,
    maskInputOptions: n,
    maskTextContent: r
  }, vi(() => {
    Z && ut();
  }), Xr(As), await lt(), Ss(), bt();
}
function Ms() {
  return Z !== null && !ce;
}
function Cs() {
  return Cn;
}
function Ls() {
  ft(), bs(), Xr(null), de && (clearTimeout(de), de = null), Pe = !1, ct = !1, Rn = 0, ce = !1, Cn = !1, at = 0, K = 0, Et = 0, J = [], j = 0, Ln.reset(), Q = null, he = null;
}
let O = [], fe = null;
const Rs = [
  "error",
  "action",
  "console",
  "resource"
];
function ks(e) {
  return Rs.includes(e) && (Ft(e) || !Vi(e)) ? (x("events_rate_limited"), !0) : !1;
}
function dt(e) {
  try {
    const t = new URL(e);
    return t.origin + t.pathname;
  } catch {
    return e;
  }
}
function xs(e, t) {
  const n = e.origin + e.pathname;
  if (!Array.isArray(t) || t.length === 0 || !e.search)
    return n;
  const r = new URLSearchParams(e.search), o = new URLSearchParams();
  r.forEach((s, c) => {
    t.includes(c) && o.append(c, s);
  });
  const i = o.toString();
  return i ? n + "?" + i : n;
}
function Os() {
  fe || (fe = {
    device_type: ia(),
    browser_name: sa(),
    os_name: aa(),
    user_agent: navigator.userAgent,
    language: navigator.language
  });
}
function uo() {
  Os();
  const e = Ro(), t = Ii(), n = ne(), r = {
    session_id: ee(),
    user_id: Mr(),
    user_name: xo(),
    user_email: Oo(),
    user_status: Po(),
    service: n.service,
    env: n.env ?? "",
    version: n.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: xs(
      window.location,
      n.viewUrlQueryParams
    ),
    view_url_host: window.location.hostname,
    view_url_path: window.location.pathname,
    referrer_url: dt(document.referrer),
    device_type: fe.device_type,
    browser_name: fe.browser_name,
    os_name: fe.os_name,
    user_agent: fe.user_agent,
    language: fe.language,
    session_view_count: e.viewCount,
    session_error_count: e.errorCount,
    session_action_count: e.actionCount,
    replay_id: Ms() && Cs() ? ee() : ""
  };
  return Object.keys(t).length > 0 && (r.feature_flags = t), r;
}
function Ps(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const lo = "events";
function k(e) {
  if (!Sr() || Ft("events")) return;
  const t = e(), n = t.event_type;
  if (ks(n)) return;
  Ir(n);
  const r = uo();
  bn(
    lo,
    { ...r, ...t }
  );
}
function kn(e) {
  Ps(
    () => k(e)
  );
}
function Ds(e) {
  if (!Sr() || Ft("events")) return;
  const t = e(), n = t.event_type;
  Ir(n);
  const r = uo(), o = r.session_id + ":" + r.view_url_path;
  Ti(
    lo,
    o,
    { ...r, ...t }
  );
}
function Ns() {
  Us(), Bs(), Ys(), Vs(), ta(), Qs(), Zs(), ea(), na(), qs();
}
function Us() {
  const e = (n) => {
    k(() => {
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
    k(() => ({
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
  ), O.push(() => {
    window.removeEventListener("error", e), window.removeEventListener(
      "unhandledrejection",
      t
    );
  });
}
const Ne = 8192;
function Hs(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${Ne} bytes omitted]`;
}
function Fs(e) {
  if (typeof e == "string") return e;
  if (Ct(
    e,
    Ne + 1
  ) > Ne)
    return Hs(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function fr(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= Ne) break;
    t && (t += " "), t += Fs(n);
  }
  return t.length > Ne ? t.slice(0, Ne) + "… [truncated]" : t;
}
function Bs() {
  const e = {
    error: console.error,
    warn: console.warn
  };
  console.error = (...t) => {
    const n = fr(t);
    k(() => ({
      event_type: "console",
      console_level: "error",
      console_message: n
    })), e.error.apply(console, t);
  }, console.warn = (...t) => {
    const n = fr(t);
    k(() => ({
      event_type: "console",
      console_level: "warn",
      console_message: n
    })), e.warn.apply(console, t);
  }, O.push(() => {
    console.error = e.error, console.warn = e.warn;
  });
}
const E = {};
let pe = null, At = 0, dr = "";
function fo() {
  const e = JSON.stringify(E);
  if (e === dr) return;
  dr = e, At = 0;
  const t = E.page_load_ms || E.lcp || E.dom_complete_ms || 0, n = t > 0;
  Ds(() => ({
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
function le() {
  const e = Date.now();
  At || (At = e);
  const t = e - At, n = Math.max(0, 5e3 - t);
  pe && clearTimeout(pe), pe = setTimeout(() => {
    pe = null, fo();
  }, n);
}
function qs() {
  if (typeof document > "u") return;
  const e = () => {
    document.visibilityState === "hidden" && (pe && (clearTimeout(pe), pe = null), fo());
  };
  document.addEventListener(
    "visibilitychange",
    e
  ), O.push(() => {
    document.removeEventListener(
      "visibilitychange",
      e
    );
  });
}
const gn = "oodle_rum_tab_hidden";
function mr(e) {
  try {
    e ? sessionStorage.setItem(gn, "1") : sessionStorage.removeItem(gn);
  } catch {
  }
}
function zs() {
  try {
    return sessionStorage.getItem(gn) === "1";
  } catch {
    return !1;
  }
}
function Xs() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && zs() && (mr(!1), k(() => ({
    event_type: "visibility",
    action_type: "tab_visible"
  })));
  let e = document.visibilityState === "hidden";
  const t = () => {
    const n = document.visibilityState === "hidden";
    n !== e && (e = n, mr(n), k(() => ({
      event_type: "visibility",
      action_type: n ? "tab_hidden" : "tab_visible"
    })), n || te());
  };
  document.addEventListener(
    "visibilitychange",
    t
  ), O.push(() => {
    document.removeEventListener(
      "visibilitychange",
      t
    );
  });
}
function Ys() {
  Ni((e) => {
    E.lcp = e.value, le();
  }), qi((e) => {
    E.fid = e.value, le();
  }), Di((e) => {
    E.inp = e.value, le();
  }), Li((e) => {
    E.cls = e.value, le();
  }), $r((e) => {
    E.fcp = e.value, le();
  }), Hi((e) => {
    E.ttfb = e.value, le();
  });
}
function xn(e) {
  const t = ne().endpoint;
  return e.startsWith(t);
}
function Vs() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || xn(r.name))
          continue;
        const i = dt(r.name), s = r.duration, c = r.transferSize ?? 0, a = o;
        kn(
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
  }), O.push(() => e.disconnect()), typeof performance < "u") {
    const t = () => {
      performance.clearResourceTimings();
    };
    performance.addEventListener(
      "resourcetimingbufferfull",
      t
    ), O.push(() => {
      performance.removeEventListener(
        "resourcetimingbufferfull",
        t
      );
    });
  }
}
function Ut(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function Ws(e) {
  try {
    return new URL(e, location.href).href;
  } catch {
    return e;
  }
}
function Qt(e, t, n) {
  return n.some(
    (r) => typeof r == "string" ? e.startsWith(r) || t.startsWith(r) : r.test(e) || r.test(t)
  );
}
function mo(e) {
  const t = Ws(e), n = ne();
  let r = !1;
  const o = n.allowedTracingUrls;
  o && o.length > 0 && (r = Qt(
    t,
    e,
    o
  ));
  let i = null;
  const s = n.forwardNetworkBodies;
  s && Qt(
    t,
    e,
    s.urls
  ) && (i = s);
  let c = !1;
  const a = n.forwardNetworkHeaders;
  return a && (c = Qt(
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
const It = /* @__PURE__ */ new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "proxy-authorization"
]);
function po(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      It.has(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      It.has(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      It.has(r) || (t[r] = e[n]);
    }
  return t;
}
function js(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    It.has(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function Ue(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function $s(e, t) {
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
function Gs(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function Js(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      po(
        e
      )
    );
  } catch {
    return "";
  }
}
function pr(e) {
  try {
    return JSON.stringify(
      po(e)
    );
  } catch {
    return "";
  }
}
function ho(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function Ks(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: Ue(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: Ue(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : ho(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => Ue(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function vo(e, t, n) {
  const r = function(o, i) {
    const s = Gs(o);
    if (xn(s))
      return t.apply(e, [
        o,
        i
      ]);
    const c = ho(o), a = ((i == null ? void 0 : i.method) ?? (c ? o.method : "GET")).toUpperCase(), l = performance.now(), u = mo(s);
    let f = "", d = "";
    if (n.injectTracing) {
      const w = to();
      if (w)
        f = w.traceId, d = w.spanId;
      else if (u.trace) {
        f = Ut(16), d = Ut(8);
        const S = new Headers(
          (i == null ? void 0 : i.headers) ?? {}
        );
        S.set(
          "traceparent",
          `00-${f}-${d}-01`
        ), i = { ...i, headers: S };
      }
    }
    let y = "", p = null;
    if (u.bodyCfg) {
      const w = u.bodyCfg.maxBodySize ?? 65536, S = Ks(
        i,
        o,
        w
      );
      y = S.sync, p = S.asyncP;
    }
    let _ = "";
    return u.captureHeaders && (i != null && i.headers ? _ = Js(
      i.headers
    ) : c && (_ = pr(
      o.headers
    ))), t.apply(e, [o, i]).then((w) => {
      const S = w.status, R = Math.round(
        performance.now() - l
      );
      let M = "";
      u.captureHeaders && (M = pr(
        w.headers
      ));
      const A = (I) => {
        const g = {
          event_type: "resource",
          resource_url: dt(s),
          resource_method: a,
          resource_status: S,
          resource_duration_ms: R,
          resource_size: 0,
          resource_type: "fetch"
        };
        return f && (g.trace_id = f, g.span_id = d), I && (g.request_body = I), _ && (g.request_headers = _), M && (g.response_headers = M), g;
      }, T = p || Promise.resolve(y);
      if (u.bodyCfg) {
        const I = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          T,
          $s(
            w.clone(),
            I
          ).catch(() => "")
        ]).then(([g, v]) => {
          k(() => {
            const m = A(g);
            return v && (m.response_body = v), m;
          });
        }).catch(() => {
          T.then((g) => {
            k(
              () => A(g)
            );
          });
        });
      } else
        T.then((I) => {
          k(() => A(I));
        });
      return w;
    }).catch((w) => {
      const S = Math.round(
        performance.now() - l
      );
      throw (p || Promise.resolve(y)).then((M) => {
        k(() => {
          const A = {
            event_type: "resource",
            resource_url: dt(s),
            resource_method: a,
            resource_status: 0,
            resource_duration_ms: S,
            resource_size: 0,
            resource_type: "fetch"
          };
          return f && (A.trace_id = f, A.span_id = d), M && (A.request_body = M), _ && (A.request_headers = _), A;
        });
      }), w;
    });
  };
  return e.fetch = r, () => {
    e.fetch = t;
  };
}
function yo(e, t, n) {
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
    if (xn(c))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const a = mo(c);
    let l = "", u = "";
    if (n.injectTracing) {
      const T = to();
      T ? (l = T.traceId, u = T.spanId) : a.trace && (l = Ut(16), u = Ut(8), i.call(
        this,
        "traceparent",
        `00-${l}-${u}-01`
      ));
    }
    let f = "";
    if (a.bodyCfg && s) {
      const T = a.bodyCfg.maxBodySize ?? 65536;
      typeof s == "string" ? f = Ue(
        s,
        T
      ) : typeof URLSearchParams < "u" && s instanceof URLSearchParams && (f = Ue(
        s.toString(),
        T
      ));
    }
    let d = "";
    if (a.captureHeaders)
      try {
        const T = this.__oodleReqHeaders;
        T && Object.keys(T).length > 0 && (d = JSON.stringify(T));
      } catch {
      }
    const y = performance.now(), p = this, _ = l, w = u, S = f, R = a.bodyCfg, M = d, A = a.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        const T = Math.round(
          performance.now() - y
        ), I = p.__oodleMethod ?? "GET";
        k(() => {
          const g = {
            event_type: "resource",
            resource_url: dt(c),
            resource_method: I,
            resource_status: p.status,
            resource_duration_ms: T,
            resource_size: 0,
            resource_type: "xhr"
          };
          if (_ && (g.trace_id = _, g.span_id = w), S && (g.request_body = S), R)
            try {
              const v = p.responseText ?? "";
              g.response_body = Ue(
                v,
                R.maxBodySize ?? 65536
              );
            } catch {
            }
          if (M && (g.request_headers = M), A)
            try {
              const v = p.getAllResponseHeaders();
              v && (g.response_headers = JSON.stringify(
                js(v)
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
const go = {
  injectTracing: !0
}, hr = {
  injectTracing: !1
};
function Qs() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = vo(
    window,
    window.fetch,
    go
  );
  O.push(e);
}
function Zs() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = yo(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    go
  );
  O.push(e);
}
const vr = /* @__PURE__ */ new WeakSet();
function Zt(e) {
  if (vr.has(e)) return;
  vr.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (vo(
        n,
        n.fetch,
        hr
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (yo(
        r.prototype,
        r.prototype.setRequestHeader,
        hr
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), O.push(() => {
    e.removeEventListener("load", t);
  });
}
function ea() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach(Zt);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          r instanceof HTMLIFrameElement && Zt(r), r instanceof HTMLElement && r.childElementCount > 0 && r.querySelectorAll("iframe").forEach(Zt);
    }
  );
  e.observe(document.documentElement, {
    childList: !0,
    subtree: !0
  }), O.push(() => {
    e.disconnect();
  });
}
function ta() {
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
    ), le());
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
function na() {
  if (!(typeof PerformanceObserver > "u") && !ra())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            kn(() => ({
              event_type: "long_task",
              long_task_duration_ms: r
            }));
          }
        }
      );
      e.observe({
        type: "longtask",
        buffered: !0
      }), O.push(
        () => e.disconnect()
      );
    } catch {
    }
}
function ra() {
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
          kn(() => ({
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
    }), O.push(
      () => e.disconnect()
    ), !0;
  } catch {
    return !1;
  }
}
function en() {
  k(() => ({
    event_type: "view"
  }));
}
function yt(e, t, n, r, o, i, s) {
  k(() => {
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
function oa(e, t) {
  k(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function ia() {
  const e = navigator.userAgent;
  return /Mobi|Android/i.test(e) ? "mobile" : /Tablet|iPad/i.test(e) ? "tablet" : "desktop";
}
function sa() {
  const e = navigator.userAgent;
  return e.includes("Firefox") ? "Firefox" : e.includes("Edg/") ? "Edge" : e.includes("Chrome") ? "Chrome" : e.includes("Safari") ? "Safari" : "Other";
}
function aa() {
  const e = navigator.userAgent;
  return e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : e.includes("Android") ? "Android" : /iPhone|iPad|iPod/.test(e) ? "iOS" : "Other";
}
function ca() {
  for (const e of O)
    e();
  O = [];
}
const yr = typeof MutationObserver < "u" ? MutationObserver : null;
let ue = !1, gt = null, _t = null, it = null, Mt = null;
const pa = {
  init(e) {
    ue || To(e) && (No(e.tags), Mo(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), ue = !0, Xs(), Wn(), Lo(), zo(), Si(() => {
      Wn();
    }), e.sessionReplay !== !1 && br() && Is(), Ns(), gt = ua(), _t = la(), e.openTelemetry && import("./tracing-Y4gY9oSH.js").then(
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
    Uo(e);
  },
  identify(e) {
    ko(e);
  },
  trackEvent(e, t) {
    ue && oa(e, t);
  },
  addFeatureFlag(e, t) {
    Ai(e, t);
  },
  getSessionId() {
    return ue ? ee() : "";
  },
  getUserId() {
    return Mr();
  },
  flush() {
    ue && te();
  },
  stop() {
    ue && (Ls(), ca(), Xo(), Ar(), te(!0), Mi(), bi(), gt && (gt(), gt = null), _t && (_t(), _t = null), $e(), ue = !1);
  }
};
function ua() {
  if (typeof window > "u") return null;
  const e = history.pushState;
  history.pushState = function(...r) {
    e.apply(this, r), en();
  };
  const t = history.replaceState;
  history.replaceState = function(...r) {
    t.apply(this, r), en();
  };
  const n = () => en();
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
function $e() {
  it && (it.disconnect(), it = null), Mt && (clearTimeout(Mt), Mt = null);
}
function la() {
  if (typeof document > "u")
    return null;
  const e = 3, t = 1e3, n = 1e3;
  let r = [];
  const o = (s) => {
    var w;
    const c = s.target;
    if (!c) return;
    const a = da(c), l = (c.textContent ?? "").trim().slice(0, 200), u = ((w = c.tagName) == null ? void 0 : w.toLowerCase()) ?? "", f = fa(
      c,
      u,
      l
    ), d = Date.now(), y = s.clientX, p = s.clientY;
    if (r.push({ selector: a, time: d }), r = r.filter(
      (S) => d - S.time < t
    ), r.filter(
      (S) => S.selector === a
    ).length >= e) {
      yt(
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
      yt(
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
    $e(), yr && (it = new yr(() => {
      $e(), yt(
        "click",
        c,
        a,
        l,
        !1,
        u,
        f
      );
    }), it.observe(
      document.body,
      {
        childList: !0,
        subtree: !0
      }
    ), Mt = setTimeout(() => {
      $e(), yt(
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
    ), $e();
  };
}
function fa(e, t, n) {
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
function da(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(
    e.classList ?? []
  ).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
export {
  pa as O,
  ma as s
};
