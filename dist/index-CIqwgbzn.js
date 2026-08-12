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
  if (!wo(e.endpoint)) {
    console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    );
    return;
  }
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  ), tn = e;
}
function ne() {
  if (!tn)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return tn;
}
const _r = "__oodle_session", Eo = 1800 * 1e3, So = 14400 * 1e3;
function bo() {
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
    const e = sessionStorage.getItem(_r);
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
function gr(e) {
  try {
    sessionStorage.setItem(
      _r,
      JSON.stringify(e)
    );
  } catch {
  }
}
let be = null;
function wr(e) {
  be || (be = setTimeout(() => {
    be = null, gr(e);
  }, 1e3));
}
function gn(e) {
  be && (clearTimeout(be), be = null), gr(e);
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
function Hn(e) {
  return Math.random() * 100 < e;
}
function ee() {
  const e = Date.now();
  if (h || (h = Io()), !h || e - h.lastActivity > Eo || e - h.createdAt > So) {
    const t = Hn(Tr);
    h = {
      id: bo(),
      createdAt: e,
      lastActivity: e,
      viewCount: 0,
      errorCount: 0,
      actionCount: 0,
      sampled: t,
      replaySampled: t && Hn(Er),
      replaySegmentSeq: 0
    }, gn(h);
  } else
    h.lastActivity = e, wr(h);
  return h.id;
}
function Ao() {
  if (ee(), !h) return 0;
  const e = h.replaySegmentSeq;
  return h.replaySegmentSeq = e + 1, gn(h), e;
}
function Sr() {
  return ee(), (h == null ? void 0 : h.sampled) ?? !0;
}
function br() {
  return ee(), (h == null ? void 0 : h.replaySampled) ?? !0;
}
let $e = null;
function Co() {
  typeof document > "u" || (Ir(), $e = () => {
    document.visibilityState === "hidden" && h && gn(h);
  }, document.addEventListener(
    "visibilitychange",
    $e
  ));
}
function Ir() {
  $e && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    $e
  ), $e = null);
}
function Mr(e) {
  ee(), h && (e === "view" || e === "page_load" ? h.viewCount++ : e === "error" ? h.errorCount++ : e === "action" && h.actionCount++, wr(h));
}
function Lo() {
  return ee(), {
    viewCount: (h == null ? void 0 : h.viewCount) ?? 0,
    errorCount: (h == null ? void 0 : h.errorCount) ?? 0,
    actionCount: (h == null ? void 0 : h.actionCount) ?? 0
  };
}
let X = null;
function Ro(e) {
  X = e;
}
function Ar() {
  return (X == null ? void 0 : X.id) ?? "";
}
function ko() {
  return (X == null ? void 0 : X.name) ?? "";
}
function xo() {
  return (X == null ? void 0 : X.email) ?? "";
}
function Oo() {
  return X ? "identified" : "anonymous";
}
const Do = 5e5;
function At(e, t = Number.POSITIVE_INFINITY) {
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
let Ct = {};
function Po(e) {
  e && (Ct = { ...e });
}
function No(e) {
  Ct = { ...Ct, ...e };
}
function Ho() {
  return Ct;
}
const Uo = 6e4, Fo = "sdk_telemetry", Ie = {
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
function Bo() {
  for (const e in Ie)
    if (Ie[e] > 0)
      return !0;
  return !1;
}
function nn() {
  if (!Bo()) return;
  const e = { ...Ie };
  for (const t in Ie)
    Ie[t] = 0;
  bn(Fo, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let Ge = null, Je = null;
function qo() {
  Ge || (Ge = setInterval(
    nn,
    Uo
  ), typeof document < "u" && (Je = () => {
    document.visibilityState === "hidden" && nn();
  }, document.addEventListener(
    "visibilitychange",
    Je
  )));
}
function zo() {
  Ge && (clearInterval(Ge), Ge = null), Je && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    Je
  ), Je = null), nn();
}
var H = Uint8Array, N = Uint16Array, wn = Int32Array, Tn = new H([
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
]), En = new H([
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
]), Un = new H([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Cr = function(e, t) {
  for (var n = new N(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new wn(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, Lr = Cr(Tn, 2), Xo = Lr.b, rn = Lr.r;
Xo[28] = 258, rn[258] = 28;
var Yo = Cr(En, 0), Fn = Yo.r, on = new N(32768);
for (var b = 0; b < 32768; ++b) {
  var oe = (b & 43690) >> 1 | (b & 21845) << 1;
  oe = (oe & 52428) >> 2 | (oe & 13107) << 2, oe = (oe & 61680) >> 4 | (oe & 3855) << 4, on[b] = ((oe & 65280) >> 8 | (oe & 255) << 8) >> 1;
}
var Ke = (function(e, t, n) {
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
}), ve = new H(288);
for (var b = 0; b < 144; ++b)
  ve[b] = 8;
for (var b = 144; b < 256; ++b)
  ve[b] = 9;
for (var b = 256; b < 280; ++b)
  ve[b] = 7;
for (var b = 280; b < 288; ++b)
  ve[b] = 8;
var Lt = new H(32);
for (var b = 0; b < 32; ++b)
  Lt[b] = 5;
var Vo = /* @__PURE__ */ Ke(ve, 9, 0), Wo = /* @__PURE__ */ Ke(Lt, 5, 0), Rr = function(e) {
  return (e + 7) / 8 | 0;
}, kr = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new H(e.subarray(t, n));
}, G = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, Xe = function(e, t, n) {
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
    var s = new H(n[0].s + 1);
    return s[n[0].s] = 1, { t: s, l: 1 };
  }
  n.sort(function(T, M) {
    return T.f - M.f;
  }), n.push({ s: -1, f: 25001 });
  var c = n[0], a = n[1], l = 0, u = 1, f = 2;
  for (n[0] = { s: -1, f: c.f + a.f, l: c, r: a }; u != o - 1; )
    c = n[n[l].f < n[f].f ? l++ : f++], a = n[l != u && n[l].f < n[f].f ? l++ : f++], n[u++] = { s: -1, f: c.f + a.f, l: c, r: a };
  for (var d = i[0].s, r = 1; r < o; ++r)
    i[r].s > d && (d = i[r].s);
  var y = new N(d + 1), m = sn(n[u - 1], y, 0);
  if (m > t) {
    var r = 0, g = 0, w = m - t, S = 1 << w;
    for (i.sort(function(M, _) {
      return y[_.s] - y[M.s] || M.f - _.f;
    }); r < o; ++r) {
      var R = i[r].s;
      if (y[R] > t)
        g += S - (1 << m - y[R]), y[R] = t;
      else
        break;
    }
    for (g >>= w; g > 0; ) {
      var A = i[r].s;
      y[A] < t ? g -= 1 << t - y[A]++ - 1 : ++r;
    }
    for (; r >= 0 && g; --r) {
      var I = i[r].s;
      y[I] == t && (--y[I], ++g);
    }
    m = t;
  }
  return { t: new H(y), l: m };
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
}, Ye = function(e, t) {
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
  for (var f = Wt(o, 15), d = f.t, y = f.l, m = Wt(i, 15), g = m.t, w = m.l, S = Bn(d), R = S.c, A = S.n, I = Bn(g), T = I.c, M = I.n, _ = new N(19), v = 0; v < R.length; ++v)
    ++_[R[v] & 31];
  for (var v = 0; v < T.length; ++v)
    ++_[T[v] & 31];
  for (var p = Wt(_, 7), D = p.t, _e = p.l, P = 19; P > 4 && !D[Un[P - 1]]; --P)
    ;
  var ge = l + 5 << 3, B = Ye(o, ve) + Ye(i, Lt) + s, q = Ye(o, d) + Ye(i, g) + s + 14 + 3 * P + Ye(_, D) + 2 * _[16] + 3 * _[17] + 7 * _[18];
  if (a >= 0 && ge <= B && ge <= q)
    return xr(t, u, e.subarray(a, a + l));
  var Y, C, z, re;
  if (G(t, u, 1 + (q < B)), u += 2, q < B) {
    Y = Ke(d, y, 0), C = d, z = Ke(g, w, 0), re = g;
    var zt = Ke(D, _e, 0);
    G(t, u, A - 257), G(t, u + 5, M - 1), G(t, u + 10, P - 4), u += 14;
    for (var v = 0; v < P; ++v)
      G(t, u + 3 * v, D[Un[v]]);
    u += 3 * P;
    for (var V = [R, T], ze = 0; ze < 2; ++ze)
      for (var we = V[ze], v = 0; v < we.length; ++v) {
        var W = we[v] & 31;
        G(t, u, zt[W]), u += D[W], W > 15 && (G(t, u, we[v] >> 5 & 127), u += we[v] >> 12);
      }
  } else
    Y = Vo, C = ve, z = Wo, re = Lt;
  for (var v = 0; v < c; ++v) {
    var L = r[v];
    if (L > 255) {
      var W = L >> 18 & 31;
      Xe(t, u, Y[W + 257]), u += C[W + 257], W > 7 && (G(t, u, L >> 23 & 31), u += Tn[W]);
      var Te = L & 31;
      Xe(t, u, z[Te]), u += re[Te], Te > 3 && (Xe(t, u, L >> 5 & 8191), u += En[Te]);
    } else
      Xe(t, u, Y[L]), u += C[L];
  }
  return Xe(t, u, Y[256]), u + C[256];
}, jo = /* @__PURE__ */ new wn([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Or = /* @__PURE__ */ new H(0), $o = function(e, t, n, r, o, i) {
  var s = i.z || e.length, c = new H(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = c.subarray(r, c.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (a[0] = i.r >> 3);
    for (var f = jo[t - 1], d = f >> 13, y = f & 8191, m = (1 << n) - 1, g = i.p || new N(32768), w = i.h || new N(m + 1), S = Math.ceil(n / 3), R = 2 * S, A = function(Vt) {
      return (e[Vt] ^ e[Vt + 1] << S ^ e[Vt + 2] << R) & m;
    }, I = new wn(25e3), T = new N(288), M = new N(32), _ = 0, v = 0, p = i.i || 0, D = 0, _e = i.w || 0, P = 0; p + 2 < s; ++p) {
      var ge = A(p), B = p & 32767, q = w[ge];
      if (g[B] = q, w[ge] = B, _e <= p) {
        var Y = s - p;
        if ((_ > 7e3 || D > 24576) && (Y > 423 || !l)) {
          u = qn(e, a, 0, I, T, M, v, D, P, p - P, u), D = _ = v = 0, P = p;
          for (var C = 0; C < 286; ++C)
            T[C] = 0;
          for (var C = 0; C < 30; ++C)
            M[C] = 0;
        }
        var z = 2, re = 0, zt = y, V = B - q & 32767;
        if (Y > 2 && ge == A(p - V))
          for (var ze = Math.min(d, Y) - 1, we = Math.min(32767, p), W = Math.min(258, Y); V <= we && --zt && B != q; ) {
            if (e[p + z] == e[p + z - V]) {
              for (var L = 0; L < W && e[p + L] == e[p + L - V]; ++L)
                ;
              if (L > z) {
                if (z = L, re = V, L > ze)
                  break;
                for (var Te = Math.min(V, L - 2), On = 0, C = 0; C < Te; ++C) {
                  var Xt = p - V + C & 32767, go = g[Xt], Dn = Xt - go & 32767;
                  Dn > On && (On = Dn, q = Xt);
                }
              }
            }
            B = q, q = g[B], V += B - q & 32767;
          }
        if (re) {
          I[D++] = 268435456 | rn[z] << 18 | Fn[re];
          var Pn = rn[z] & 31, Nn = Fn[re] & 31;
          v += Tn[Pn] + En[Nn], ++T[257 + Pn], ++M[Nn], _e = p + z, ++_;
        } else
          I[D++] = e[p], ++T[e[p]];
      }
    }
    for (p = Math.max(p, _e); p < s; ++p)
      I[D++] = e[p], ++T[e[p]];
    u = qn(e, a, l, I, T, M, v, D, P, p - P, u), l || (i.r = u & 7 | a[u / 8 | 0] << 3, u -= 7, i.h = w, i.p = g, i.i = p, i.w = _e);
  } else {
    for (var p = i.w || 0; p < s + l; p += 65535) {
      var Yt = p + 65535;
      Yt >= s && (a[u / 8 | 0] = l, Yt = s), u = xr(a, u + 1, e.subarray(p, Yt));
    }
    i.i = s;
  }
  return kr(c, 0, r + Rr(u) + o);
}, Go = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), Jo = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = Go[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, Ko = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new H(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return $o(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, an = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, Qo = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && an(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, Zo = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function ei(e, t) {
  t || (t = {});
  var n = Jo(), r = e.length;
  n.p(e);
  var o = Ko(e, t, Zo(t), 8), i = o.length;
  return Qo(o, t), an(o, i - 8, n.d()), an(o, i - 4, r), o;
}
var zn = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), ti = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), ni = 0;
try {
  ti.decode(Or, { stream: !0 }), ni = 1;
} catch {
}
function ri(e, t) {
  var n;
  if (zn)
    return zn.encode(e);
  for (var r = e.length, o = new H(e.length + (e.length >> 1)), i = 0, s = function(l) {
    o[i++] = l;
  }, n = 0; n < r; ++n) {
    if (i + 5 > o.length) {
      var c = new H(i + 8 + (r - n << 1));
      c.set(o), o = c;
    }
    var a = e.charCodeAt(n);
    a < 128 || t ? s(a) : a < 2048 ? (s(192 | a >> 6), s(128 | a & 63)) : a > 55295 && a < 57344 ? (a = 65536 + (a & 1047552) | e.charCodeAt(++n) & 1023, s(240 | a >> 18), s(128 | a >> 12 & 63), s(128 | a >> 6 & 63), s(128 | a & 63)) : (s(224 | a >> 12), s(128 | a >> 6 & 63), s(128 | a & 63));
  }
  return kr(o, 0, i);
}
function gt(e) {
  try {
    return ei(ri(e));
  } catch {
    return null;
  }
}
const oi = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function ii(e) {
  if (!oi)
    return gt(e);
  try {
    const t = new Response(e).body;
    if (!t) return gt(e);
    const n = t.pipeThrough(
      new CompressionStream("gzip")
    ), r = await new Response(
      n
    ).arrayBuffer();
    return new Uint8Array(r);
  } catch {
    return gt(e);
  }
}
const si = "0.3.0", Xn = 5e3, Dr = 50, Pr = 5e5, Yn = 256e3, Rt = "replay", Nr = 8e4, Hr = 32, ai = 2e7, ci = 5, ui = 1e3, li = 6e4, fi = 500, kt = 63e3;
let Me = 0, Ae = 0, ie = [], Qe = 0, jt = null;
const xt = /* @__PURE__ */ new Map();
let Ce = null, Le = null, cn = null, Ze = !1;
function di() {
  try {
    return ne().flushIntervalMs ?? Xn;
  } catch {
    return Xn;
  }
}
function Ur(e) {
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
  return Fr(await ii(e), e);
}
function pi(e) {
  return Fr(gt(e), e);
}
const mi = 64e3;
function un(e, t, n) {
  if (e === Rt)
    return {
      bytes: n ?? At(
        t,
        mi
      ),
      oversized: !1
    };
  const r = At(
    t,
    Yn + 1
  );
  return {
    bytes: r,
    oversized: r > Yn
  };
}
let ln = null;
function hi(e) {
  ln = e;
}
function Ut(e) {
  x("transport_drops"), e === Rt && ln && ln();
}
const vi = "/v1/rum/ingest";
function yi(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: si
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
  if (Qe + o > ai) {
    x("retry_drops"), r && Ut(r);
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
  }), Qe += o, qr();
}
function qr() {
  if (jt || ie.length === 0)
    return;
  const e = ie[0], t = Math.min(
    ui * Math.pow(2, e.attempts),
    li
  );
  jt = setTimeout(() => {
    jt = null, zr();
  }, t);
}
async function zr() {
  for (; ie.length > 0 && Me < Nr && Ae < Hr; ) {
    const e = ie.shift();
    if (Qe -= e.bytes, e.attempts++, e.attempts > ci) {
      x("retry_drops"), e.batchKey && Ut(e.batchKey);
      continue;
    }
    const t = e.bytes;
    Me += t, Ae++;
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
        ie.unshift(e), Qe += e.bytes;
        break;
      }
    } catch {
      ie.unshift(e), Qe += e.bytes;
      break;
    } finally {
      Me -= t, Ae--;
    }
  }
  ie.length > 0 && qr();
}
function gi() {
  Ce && (clearTimeout(Ce), Ce = null), Le && (clearTimeout(Le), Le = null);
}
function Sn() {
  const e = di();
  Ce && clearTimeout(Ce), Ce = setTimeout(
    () => te(),
    e
  ), Le || (Le = setTimeout(
    () => {
      Le = null, te();
    },
    e + fi
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
    ), Ut(e);
    return;
  }
  const i = Ur(e);
  if (i.items.push(t), i.bytesEstimate += r, !Ze && (i.items.length >= Dr || i.bytesEstimate >= Pr)) {
    te();
    return;
  }
  Sn();
}
function wi(e, t, n) {
  const { bytes: r, oversized: o } = un(
    e,
    n
  );
  if (o) {
    Ut(e);
    return;
  }
  const i = Ur(e), s = i.upsertMap.get(t);
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
  if (!Ze && (i.items.length >= Dr || i.bytesEstimate >= Pr)) {
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
  if (e && cn && !Ze) {
    Ze = !0;
    try {
      cn();
    } catch {
    } finally {
      Ze = !1;
    }
  }
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    Sn();
    return;
  }
  gi();
  const n = Ho(), r = [], o = Array.from(
    xt.keys()
  ).sort((l, u) => {
    const f = Vn.indexOf(l), d = Vn.indexOf(u), y = f >= 0 ? f : 999, m = d >= 0 ? d : 999;
    return y - m;
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
  const i = yi(r), s = `${t.endpoint}${vi}`, c = {
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
  Ti(
    s,
    c,
    i,
    a ? Rt : void 0
  );
}
async function Ti(e, t, n, r) {
  const o = n.length;
  if (Me >= Nr || Ae >= Hr) {
    $t(e, t, n, r);
    return;
  }
  Me += o, Ae++;
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
    Me -= o, Ae--, zr();
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
let et = null, tt = null, nt = null, dn = null;
function Ei(e) {
  dn = e;
}
const Vr = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function Wn() {
  typeof document > "u" || (et = () => {
    document.visibilityState === "hidden" && te(!0);
  }, tt = () => te(!0), nt = (e) => {
    e.persisted && dn && dn();
  }, document.addEventListener(
    "visibilitychange",
    et
  ), window.addEventListener(
    Vr,
    tt
  ), window.addEventListener(
    "pageshow",
    nt
  ));
}
function Si() {
  et && (document.removeEventListener(
    "visibilitychange",
    et
  ), et = null), tt && (window.removeEventListener(
    Vr,
    tt
  ), tt = null), nt && (window.removeEventListener(
    "pageshow",
    nt
  ), nt = null);
}
const Ot = /* @__PURE__ */ new Map();
function bi(e, t) {
  Ot.set(e, t);
}
function Ii() {
  return Ot.size === 0 ? {} : Object.fromEntries(Ot);
}
function Mi() {
  Ot.clear();
}
var pn, se, rt, Wr, Dt, jr = -1, ye = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (jr = t.timeStamp, e(t));
  }), !0);
}, In = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, Bt = function() {
  var e = In();
  return e && e.activationStart || 0;
}, U = function(e, t) {
  var n = In(), r = "navigate";
  return jr >= 0 ? r = "back-forward-cache" : n && (document.prerendering || Bt() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, qe = function(e, t, n) {
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
}, Mn = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, ft = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, qt = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Ee = -1, jn = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, Pt = function(e) {
  document.visibilityState === "hidden" && Ee > -1 && (Ee = e.type === "visibilitychange" ? e.timeStamp : 0, Ai());
}, $n = function() {
  addEventListener("visibilitychange", Pt, !0), addEventListener("prerenderingchange", Pt, !0);
}, Ai = function() {
  removeEventListener("visibilitychange", Pt, !0), removeEventListener("prerenderingchange", Pt, !0);
}, An = function() {
  return Ee < 0 && (Ee = jn(), $n(), ye((function() {
    setTimeout((function() {
      Ee = jn(), $n();
    }), 0);
  }))), { get firstHiddenTime() {
    return Ee;
  } };
}, dt = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, Gn = [1800, 3e3], $r = function(e, t) {
  t = t || {}, dt((function() {
    var n, r = An(), o = U("FCP"), i = qe("paint", (function(s) {
      s.forEach((function(c) {
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < r.firstHiddenTime && (o.value = Math.max(c.startTime - Bt(), 0), o.entries.push(c), n(!0)));
      }));
    }));
    i && (n = F(e, o, Gn, t.reportAllChanges), ye((function(s) {
      o = U("FCP"), n = F(e, o, Gn, t.reportAllChanges), Mn((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, Jn = [0.1, 0.25], Ci = function(e, t) {
  t = t || {}, $r(qt((function() {
    var n, r = U("CLS", 0), o = 0, i = [], s = function(a) {
      a.forEach((function(l) {
        if (!l.hadRecentInput) {
          var u = i[0], f = i[i.length - 1];
          o && l.startTime - f.startTime < 1e3 && l.startTime - u.startTime < 5e3 ? (o += l.value, i.push(l)) : (o = l.value, i = [l]);
        }
      })), o > r.value && (r.value = o, r.entries = i, n());
    }, c = qe("layout-shift", s);
    c && (n = F(e, r, Jn, t.reportAllChanges), ft((function() {
      s(c.takeRecords()), n(!0);
    })), ye((function() {
      o = 0, r = U("CLS", 0), n = F(e, r, Jn, t.reportAllChanges), Mn((function() {
        return n();
      }));
    })), setTimeout(n, 0));
  })));
}, Gr = 0, Gt = 1 / 0, mt = 0, Li = function(e) {
  e.forEach((function(t) {
    t.interactionId && (Gt = Math.min(Gt, t.interactionId), mt = Math.max(mt, t.interactionId), Gr = mt ? (mt - Gt) / 7 + 1 : 0);
  }));
}, Jr = function() {
  return pn ? Gr : performance.interactionCount || 0;
}, Ri = function() {
  "interactionCount" in performance || pn || (pn = qe("event", Li, { type: "event", buffered: !0, durationThreshold: 0 }));
}, $ = [], wt = /* @__PURE__ */ new Map(), Kr = 0, ki = function() {
  var e = Math.min($.length - 1, Math.floor((Jr() - Kr) / 50));
  return $[e];
}, xi = [], Oi = function(e) {
  if (xi.forEach((function(o) {
    return o(e);
  })), e.interactionId || e.entryType === "first-input") {
    var t = $[$.length - 1], n = wt.get(e.interactionId);
    if (n || $.length < 10 || e.duration > t.latency) {
      if (n) e.duration > n.latency ? (n.entries = [e], n.latency = e.duration) : e.duration === n.latency && e.startTime === n.entries[0].startTime && n.entries.push(e);
      else {
        var r = { id: e.interactionId, latency: e.duration, entries: [e] };
        wt.set(r.id, r), $.push(r);
      }
      $.sort((function(o, i) {
        return i.latency - o.latency;
      })), $.length > 10 && $.splice(10).forEach((function(o) {
        return wt.delete(o.id);
      }));
    }
  }
}, Qr = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = qt(e), document.visibilityState === "hidden" ? e() : (n = t(e), ft(e)), n;
}, Kn = [200, 500], Di = function(e, t) {
  "PerformanceEventTiming" in self && "interactionId" in PerformanceEventTiming.prototype && (t = t || {}, dt((function() {
    var n;
    Ri();
    var r, o = U("INP"), i = function(c) {
      Qr((function() {
        c.forEach(Oi);
        var a = ki();
        a && a.latency !== o.value && (o.value = a.latency, o.entries = a.entries, r());
      }));
    }, s = qe("event", i, { durationThreshold: (n = t.durationThreshold) !== null && n !== void 0 ? n : 40 });
    r = F(e, o, Kn, t.reportAllChanges), s && (s.observe({ type: "first-input", buffered: !0 }), ft((function() {
      i(s.takeRecords()), r(!0);
    })), ye((function() {
      Kr = Jr(), $.length = 0, wt.clear(), o = U("INP"), r = F(e, o, Kn, t.reportAllChanges);
    })));
  })));
}, Qn = [2500, 4e3], Jt = {}, Pi = function(e, t) {
  t = t || {}, dt((function() {
    var n, r = An(), o = U("LCP"), i = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - Bt(), 0), o.entries = [l], n());
      }));
    }, s = qe("largest-contentful-paint", i);
    if (s) {
      n = F(e, o, Qn, t.reportAllChanges);
      var c = qt((function() {
        Jt[o.id] || (i(s.takeRecords()), s.disconnect(), Jt[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(a) {
        addEventListener(a, (function() {
          return Qr(c);
        }), { once: !0, capture: !0 });
      })), ft(c), ye((function(a) {
        o = U("LCP"), n = F(e, o, Qn, t.reportAllChanges), Mn((function() {
          o.value = performance.now() - a.timeStamp, Jt[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, Zn = [800, 1800], Ni = function e(t) {
  document.prerendering ? dt((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, Hi = function(e, t) {
  t = t || {};
  var n = U("TTFB"), r = F(e, n, Zn, t.reportAllChanges);
  Ni((function() {
    var o = In();
    o && (n.value = Math.max(o.responseStart - Bt(), 0), n.entries = [o], r(!0), ye((function() {
      n = U("TTFB", 0), (r = F(e, n, Zn, t.reportAllChanges))(!0);
    })));
  }));
}, We = { passive: !0, capture: !0 }, Ui = /* @__PURE__ */ new Date(), er = function(e, t) {
  se || (se = t, rt = e, Wr = /* @__PURE__ */ new Date(), eo(removeEventListener), Zr());
}, Zr = function() {
  if (rt >= 0 && rt < Wr - Ui) {
    var e = { entryType: "first-input", name: se.type, target: se.target, cancelable: se.cancelable, startTime: se.timeStamp, processingStart: se.timeStamp + rt };
    Dt.forEach((function(t) {
      t(e);
    })), Dt = [];
  }
}, Fi = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        er(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, We), removeEventListener("pointercancel", i, We);
      };
      addEventListener("pointerup", o, We), addEventListener("pointercancel", i, We);
    })(t, e) : er(t, e);
  }
}, eo = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, Fi, We);
  }));
}, tr = [100, 300], Bi = function(e, t) {
  t = t || {}, dt((function() {
    var n, r = An(), o = U("FID"), i = function(a) {
      a.startTime < r.firstHiddenTime && (o.value = a.processingStart - a.startTime, o.entries.push(a), n(!0));
    }, s = function(a) {
      a.forEach(i);
    }, c = qe("first-input", s);
    n = F(e, o, tr, t.reportAllChanges), c && (ft(qt((function() {
      s(c.takeRecords()), c.disconnect();
    }))), ye((function() {
      var a;
      o = U("FID"), n = F(e, o, tr, t.reportAllChanges), Dt = [], rt = -1, se = null, eo(addEventListener), a = i, Dt.push(a), Zr();
    })));
  }));
};
const qi = 50, nr = 200, rr = /* @__PURE__ */ new Map();
function zi(e) {
  let t = rr.get(e);
  return t || (t = {
    tokens: nr,
    lastRefill: Date.now(),
    rate: qi,
    burst: nr
  }, rr.set(e, t)), t;
}
function Xi(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function Yi(e) {
  const t = zi(e);
  return Xi(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let mn = null, hn = null;
function fa(e, t) {
  mn = e, hn = t;
}
const Vi = "00000000000000000000000000000000";
function to() {
  if (!mn || !hn) return null;
  try {
    const e = mn.getSpan(
      hn.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === Vi ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const or = 100, Wi = 10, ir = 5e3, ji = 3, $i = 0;
function Gi(e, t = () => Date.now()) {
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
      f.tokens + d * Wi
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function c(a) {
    var m, g, w;
    if (a.type !== ji)
      return { event: a, dropped: 0 };
    const l = a.data;
    if (!l || l.source !== $i || !l.attributes || l.attributes.length === 0)
      return { event: a, dropped: 0 };
    const u = l.attributes.length, f = l.attributes.filter(
      (S) => s(S.id)
    ), d = u - f.length;
    return d === 0 ? { event: a, dropped: 0 } : (l.attributes = f, {
      event: f.length > 0 || (((m = l.adds) == null ? void 0 : m.length) ?? 0) > 0 || (((g = l.removes) == null ? void 0 : g.length) ?? 0) > 0 || (((w = l.texts) == null ? void 0 : w.length) ?? 0) > 0 ? a : null,
      dropped: d
    });
  }
  return { throttle: c, reset: o };
}
const sr = "replay", Ji = 200, Ki = 6e4, Qi = 5e3, Zi = 8e6, no = 2, es = 3, ar = 3e3, ro = 5e3, ts = 3, ns = 3e4, rs = 5e3, os = 16, is = 100, ss = 4, as = 30, cr = 32, ur = 250, cs = 36e4;
function us() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const ls = 3e5, fs = 9e5, ds = 1e3;
let me = null, Z = null, Ve = null, He = [], Ue = 0, Se = "", Cn = !1, oo = 0, Kt = "", K = 0, he = Date.now(), ce = !1, it = 0, fe = null, Fe = !1, Re = null, io = 0, J = [], j = 0, ke = null, ae = null, Tt = 0;
function Be() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const Ln = Gi(
  () => (me == null ? void 0 : me.mirror) ?? null
);
let xe = null, de = null, Oe = !1, st = !1, Rn = 0, Et = null, Q = null;
function ps() {
  ke && (clearTimeout(ke), ke = null), ae && (ae(), ae = null);
}
function vn(e, t) {
  ps();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    as
  ) : null, r = e ? Be() + (n ?? ss) : Number.POSITIVE_INFINITY;
  for (; j < J.length; ) {
    const o = Math.min(
      j + cr,
      J.length
    );
    for (; j < o; )
      yn(
        J[j++]
      );
    if (Be() >= r) break;
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
  if (!ke) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          ae = null, vn(!0, t);
        },
        { timeout: is }
      );
      ae = () => cancelIdleCallback(e);
    }
    ke = setTimeout(() => {
      ke = null, ae && (ae(), ae = null), vn(!0);
    }, os);
  }
}
function at(e = !1) {
  if (Fe = !0, Re) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - he, r = Math.max(
      0,
      ro - n
    ), o = Date.now() - io, i = Math.max(
      0,
      rs - o
    );
    t = Math.max(
      r,
      i
    );
  }
  Re = setTimeout(() => {
    Re = null, ms();
  }, t);
}
function ms() {
  if (!Fe || !me || !Z || ce) return;
  it++;
  const e = Tt > ur ? 1 : ts;
  if (it > e) {
    ys();
    return;
  }
  io = Date.now(), K = 0, he = Date.now();
  try {
    const t = Be();
    me.takeFullSnapshot(!0), Tt = Be() - t, x("replay_rebases"), Tt > ur && x(
      "replay_expensive_snapshots"
    );
  } catch {
    ut(), ct();
  }
}
function lr() {
  x("replay_events_dropped");
}
function ao() {
  if (Se) return !1;
  Se = ee(), oo = Ao();
  const e = Kt !== "" && Kt !== Se;
  return Kt = Se, e;
}
function pt() {
  if (vs(), He.length === 0) return;
  if (Ft(sr)) {
    hs(), co();
    return;
  }
  ao();
  const e = Se, t = oo, n = He.splice(0), r = Ue;
  Ue = 0, Se = "", Cn = !0, bn(
    sr,
    {
      session_id: e,
      segment_index: t,
      events: n
    },
    r
  );
}
function hs() {
  Ue <= Zi || (x(
    "replay_events_dropped",
    He.length
  ), He.length = 0, Ue = 0, at());
}
let De = null;
function vs() {
  De && (clearTimeout(De), De = null);
}
function co() {
  if (De) return;
  const e = ne().replayFlushIntervalMs ?? Qi;
  De = setTimeout(() => {
    De = null, pt();
  }, e);
}
function yn(e) {
  ao() && e.type !== no && at(!0), He.push(e), Ue += At(e), He.length >= Ji || Ue >= Ki ? pt() : co();
}
function ys() {
  ce = !0, x("replay_overload_pauses"), ut(), fe && clearTimeout(fe), fe = setTimeout(() => {
    fe = null, ce = !1, it = 0, K = 0, he = Date.now(), !Oe && !st && Q && ct();
  }, ns);
}
function _s(e) {
  if (ce) return;
  if (e.type === no) {
    Nt(), Fe = !1, K = 0, he = Date.now(), yn(e);
    return;
  }
  if (e.type !== es) {
    Nt(), yn(e);
    return;
  }
  if (Fe) {
    lr(), at();
    return;
  }
  const t = Date.now();
  t - he > ro && (K <= ar && (it = 0), K = 0, he = t);
  const n = Ln.throttle(e);
  if (n.dropped > 0 && x(
    "replay_attributes_throttled",
    n.dropped
  ), !!n.event) {
    if (K++, K > ar) {
      lr(), at();
      return;
    }
    J.push(n.event), so();
  }
}
async function ct() {
  if (Q && !ce && !Z)
    return Ve || (Ve = gs().finally(
      () => {
        Ve = null;
      }
    ), Ve);
}
async function gs() {
  if (!Q) return;
  const e = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', t = '[data-oodle-privacy="mask"],.oodle-privacy-mask', { record: n } = await import("./rrweb-SbAupvcM.js");
  !Q || ce || Z || (me = n, Fe = !1, K = 0, he = Date.now(), Ln.reset(), Z = n({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: us() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: cs,
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
  }) ?? null, setTimeout(() => pt(), 200));
}
function ut() {
  Z && (Z(), Z = null), Re && (clearTimeout(Re), Re = null), Fe = !1, Nt(), pt();
}
function ws() {
  const e = ne(), t = e.replayIdlePauseMs ?? ls, n = e.replayIdleExpireMs ?? fs;
  xe && clearTimeout(xe), de && (clearTimeout(de), de = null), xe = setTimeout(() => {
    Oe = !0, ut();
  }, t), de = setTimeout(() => {
    st = !0, ut();
  }, n);
}
function St() {
  Rn = Be(), ws();
}
function Ts() {
  if (st) {
    if (!br()) return;
    st = !1, Oe = !1, ct(), St();
    return;
  }
  if (Oe) {
    Oe = !1, ct(), St();
    return;
  }
  Be() - Rn >= ds && St();
}
function Es() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => Ts(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  Et = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function Ss() {
  Et && (Et(), Et = null), xe && (clearTimeout(xe), xe = null), de && (clearTimeout(de), de = null);
}
function bs() {
  Nt(), pt();
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
  }, hi(() => {
    Z && at();
  }), Xr(bs), await ct(), Es(), St();
}
function Ms() {
  return Z !== null && !ce;
}
function As() {
  return Cn;
}
function Cs() {
  ut(), Ss(), Xr(null), fe && (clearTimeout(fe), fe = null), Oe = !1, st = !1, Rn = 0, ce = !1, Cn = !1, it = 0, K = 0, Tt = 0, J = [], j = 0, Ln.reset(), Q = null, me = null;
}
let O = [], le = null;
const Ls = [
  "error",
  "action",
  "console",
  "resource"
];
function Rs(e) {
  return Ls.includes(e) && (Ft(e) || !Yi(e)) ? (x("events_rate_limited"), !0) : !1;
}
function lt(e) {
  try {
    const t = new URL(e);
    return t.origin + t.pathname;
  } catch {
    return e;
  }
}
function ks() {
  le || (le = {
    device_type: ra(),
    browser_name: oa(),
    os_name: ia(),
    user_agent: navigator.userAgent,
    language: navigator.language
  });
}
function uo() {
  ks();
  const e = Lo(), t = Ii(), n = ne(), r = {
    session_id: ee(),
    user_id: Ar(),
    user_name: ko(),
    user_email: xo(),
    user_status: Oo(),
    service: n.service,
    env: n.env ?? "",
    version: n.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: window.location.origin + window.location.pathname,
    view_url_host: window.location.hostname,
    view_url_path: window.location.pathname,
    referrer_url: lt(document.referrer),
    device_type: le.device_type,
    browser_name: le.browser_name,
    os_name: le.os_name,
    user_agent: le.user_agent,
    language: le.language,
    session_view_count: e.viewCount,
    session_error_count: e.errorCount,
    session_action_count: e.actionCount,
    replay_id: Ms() && As() ? ee() : ""
  };
  return Object.keys(t).length > 0 && (r.feature_flags = t), r;
}
function xs(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const lo = "events";
function k(e) {
  if (!Sr() || Ft("events")) return;
  const t = e(), n = t.event_type;
  if (Rs(n)) return;
  Mr(n);
  const r = uo();
  bn(
    lo,
    { ...r, ...t }
  );
}
function kn(e) {
  xs(
    () => k(e)
  );
}
function Os(e) {
  if (!Sr() || Ft("events")) return;
  const t = e(), n = t.event_type;
  Mr(n);
  const r = uo(), o = r.session_id + ":" + r.view_url_path;
  wi(
    lo,
    o,
    { ...r, ...t }
  );
}
function Ds() {
  Ps(), Us(), zs(), Xs(), Zs(), Js(), Ks(), Qs(), ea(), Fs();
}
function Ps() {
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
const Pe = 8192;
function Ns(e) {
  var n;
  return `[${Array.isArray(e) ? "array" : ((n = e == null ? void 0 : e.constructor) == null ? void 0 : n.name) ?? "object"} over ${Pe} bytes omitted]`;
}
function Hs(e) {
  if (typeof e == "string") return e;
  if (At(
    e,
    Pe + 1
  ) > Pe)
    return Ns(e);
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}
function fr(e) {
  let t = "";
  for (const n of e) {
    if (t.length >= Pe) break;
    t && (t += " "), t += Hs(n);
  }
  return t.length > Pe ? t.slice(0, Pe) + "… [truncated]" : t;
}
function Us() {
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
let pe = null, bt = 0, dr = "";
function fo() {
  const e = JSON.stringify(E);
  if (e === dr) return;
  dr = e, bt = 0;
  const t = E.page_load_ms || E.lcp || E.dom_complete_ms || 0, n = t > 0;
  Os(() => ({
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
function ue() {
  const e = Date.now();
  bt || (bt = e);
  const t = e - bt, n = Math.max(0, 5e3 - t);
  pe && clearTimeout(pe), pe = setTimeout(() => {
    pe = null, fo();
  }, n);
}
function Fs() {
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
const _n = "oodle_rum_tab_hidden";
function pr(e) {
  try {
    e ? sessionStorage.setItem(_n, "1") : sessionStorage.removeItem(_n);
  } catch {
  }
}
function Bs() {
  try {
    return sessionStorage.getItem(_n) === "1";
  } catch {
    return !1;
  }
}
function qs() {
  if (typeof document > "u") return;
  document.visibilityState === "visible" && Bs() && (pr(!1), k(() => ({
    event_type: "visibility",
    action_type: "tab_visible"
  })));
  let e = document.visibilityState === "hidden";
  const t = () => {
    const n = document.visibilityState === "hidden";
    n !== e && (e = n, pr(n), k(() => ({
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
function zs() {
  Pi((e) => {
    E.lcp = e.value, ue();
  }), Bi((e) => {
    E.fid = e.value, ue();
  }), Di((e) => {
    E.inp = e.value, ue();
  }), Ci((e) => {
    E.cls = e.value, ue();
  }), $r((e) => {
    E.fcp = e.value, ue();
  }), Hi((e) => {
    E.ttfb = e.value, ue();
  });
}
function xn(e) {
  const t = ne().endpoint;
  return e.startsWith(t);
}
function Xs() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || xn(r.name))
          continue;
        const i = lt(r.name), s = r.duration, c = r.transferSize ?? 0, a = o;
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
function Ht(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function Ys(e) {
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
function po(e) {
  const t = Ys(e), n = ne();
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
function mo(e) {
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
function Vs(e) {
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
function Ne(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function Ws(e, t) {
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
function js(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function $s(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      mo(
        e
      )
    );
  } catch {
    return "";
  }
}
function mr(e) {
  try {
    return JSON.stringify(
      mo(e)
    );
  } catch {
    return "";
  }
}
function ho(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function Gs(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: Ne(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: Ne(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : ho(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => Ne(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function vo(e, t, n) {
  const r = function(o, i) {
    const s = js(o);
    if (xn(s))
      return t.apply(e, [
        o,
        i
      ]);
    const c = ho(o), a = ((i == null ? void 0 : i.method) ?? (c ? o.method : "GET")).toUpperCase(), l = performance.now(), u = po(s);
    let f = "", d = "";
    if (n.injectTracing) {
      const w = to();
      if (w)
        f = w.traceId, d = w.spanId;
      else if (u.trace) {
        f = Ht(16), d = Ht(8);
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
      const w = u.bodyCfg.maxBodySize ?? 65536, S = Gs(
        i,
        o,
        w
      );
      y = S.sync, m = S.asyncP;
    }
    let g = "";
    return u.captureHeaders && (i != null && i.headers ? g = $s(
      i.headers
    ) : c && (g = mr(
      o.headers
    ))), t.apply(e, [o, i]).then((w) => {
      const S = w.status, R = Math.round(
        performance.now() - l
      );
      let A = "";
      u.captureHeaders && (A = mr(
        w.headers
      ));
      const I = (M) => {
        const _ = {
          event_type: "resource",
          resource_url: lt(s),
          resource_method: a,
          resource_status: S,
          resource_duration_ms: R,
          resource_size: 0,
          resource_type: "fetch"
        };
        return f && (_.trace_id = f, _.span_id = d), M && (_.request_body = M), g && (_.request_headers = g), A && (_.response_headers = A), _;
      }, T = m || Promise.resolve(y);
      if (u.bodyCfg) {
        const M = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          T,
          Ws(
            w.clone(),
            M
          ).catch(() => "")
        ]).then(([_, v]) => {
          k(() => {
            const p = I(_);
            return v && (p.response_body = v), p;
          });
        }).catch(() => {
          T.then((_) => {
            k(
              () => I(_)
            );
          });
        });
      } else
        T.then((M) => {
          k(() => I(M));
        });
      return w;
    }).catch((w) => {
      const S = Math.round(
        performance.now() - l
      );
      throw (m || Promise.resolve(y)).then((A) => {
        k(() => {
          const I = {
            event_type: "resource",
            resource_url: lt(s),
            resource_method: a,
            resource_status: 0,
            resource_duration_ms: S,
            resource_size: 0,
            resource_type: "fetch"
          };
          return f && (I.trace_id = f, I.span_id = d), A && (I.request_body = A), g && (I.request_headers = g), I;
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
    const a = po(c);
    let l = "", u = "";
    if (n.injectTracing) {
      const T = to();
      T ? (l = T.traceId, u = T.spanId) : a.trace && (l = Ht(16), u = Ht(8), i.call(
        this,
        "traceparent",
        `00-${l}-${u}-01`
      ));
    }
    let f = "";
    if (a.bodyCfg && s) {
      const T = a.bodyCfg.maxBodySize ?? 65536;
      typeof s == "string" ? f = Ne(
        s,
        T
      ) : typeof URLSearchParams < "u" && s instanceof URLSearchParams && (f = Ne(
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
    const y = performance.now(), m = this, g = l, w = u, S = f, R = a.bodyCfg, A = d, I = a.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        const T = Math.round(
          performance.now() - y
        ), M = m.__oodleMethod ?? "GET";
        k(() => {
          const _ = {
            event_type: "resource",
            resource_url: lt(c),
            resource_method: M,
            resource_status: m.status,
            resource_duration_ms: T,
            resource_size: 0,
            resource_type: "xhr"
          };
          if (g && (_.trace_id = g, _.span_id = w), S && (_.request_body = S), R)
            try {
              const v = m.responseText ?? "";
              _.response_body = Ne(
                v,
                R.maxBodySize ?? 65536
              );
            } catch {
            }
          if (A && (_.request_headers = A), I)
            try {
              const v = m.getAllResponseHeaders();
              v && (_.response_headers = JSON.stringify(
                Vs(v)
              ));
            } catch {
            }
          return _;
        });
      }
    ), o.apply(this, [s]);
  }, () => {
    e.open = r, e.send = o, e.setRequestHeader = i;
  };
}
const _o = {
  injectTracing: !0
}, hr = {
  injectTracing: !1
};
function Js() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = vo(
    window,
    window.fetch,
    _o
  );
  O.push(e);
}
function Ks() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = yo(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    _o
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
function Qs() {
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
function Zs() {
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
    ), ue());
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
function ea() {
  if (!(typeof PerformanceObserver > "u") && !ta())
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
function ta() {
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
function ht(e, t, n, r, o, i, s) {
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
function na(e, t) {
  k(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function ra() {
  const e = navigator.userAgent;
  return /Mobi|Android/i.test(e) ? "mobile" : /Tablet|iPad/i.test(e) ? "tablet" : "desktop";
}
function oa() {
  const e = navigator.userAgent;
  return e.includes("Firefox") ? "Firefox" : e.includes("Edg/") ? "Edge" : e.includes("Chrome") ? "Chrome" : e.includes("Safari") ? "Safari" : "Other";
}
function ia() {
  const e = navigator.userAgent;
  return e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : e.includes("Android") ? "Android" : /iPhone|iPad|iPod/.test(e) ? "iOS" : "Other";
}
function sa() {
  for (const e of O)
    e();
  O = [];
}
const yr = typeof MutationObserver < "u" ? MutationObserver : null;
let vt = !1, yt = null, _t = null, ot = null, Mt = null;
const da = {
  init(e) {
    vt || (To(e), Po(e.tags), Mo(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), vt = !0, qs(), Wn(), Co(), qo(), Ei(() => {
      Wn();
    }), e.sessionReplay !== !1 && br() && Is(), Ds(), yt = aa(), _t = ca(), e.openTelemetry && import("./tracing-NZ4cs7SK.js").then(
      (t) => t.initOtelTracing(e)
    ).catch((t) => {
      console.warn(
        "[@oodle-ai/rum] Failed to init OpenTelemetry:",
        t
      );
    }));
  },
  setTags(e) {
    No(e);
  },
  identify(e) {
    Ro(e);
  },
  trackEvent(e, t) {
    na(e, t);
  },
  addFeatureFlag(e, t) {
    bi(e, t);
  },
  getSessionId() {
    return ee();
  },
  getUserId() {
    return Ar();
  },
  flush() {
    te();
  },
  stop() {
    vt && (Cs(), sa(), zo(), Ir(), te(!0), Mi(), Si(), yt && (yt(), yt = null), _t && (_t(), _t = null), je(), vt = !1);
  }
};
function aa() {
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
function je() {
  ot && (ot.disconnect(), ot = null), Mt && (clearTimeout(Mt), Mt = null);
}
function ca() {
  if (typeof document > "u")
    return null;
  const e = 3, t = 1e3, n = 1e3;
  let r = [];
  const o = (s) => {
    var w;
    const c = s.target;
    if (!c) return;
    const a = la(c), l = (c.textContent ?? "").trim().slice(0, 200), u = ((w = c.tagName) == null ? void 0 : w.toLowerCase()) ?? "", f = ua(
      c,
      u,
      l
    ), d = Date.now(), y = s.clientX, m = s.clientY;
    if (r.push({ selector: a, time: d }), r = r.filter(
      (S) => d - S.time < t
    ), r.filter(
      (S) => S.selector === a
    ).length >= e) {
      ht(
        "rage_click",
        f,
        a,
        l,
        !0,
        y,
        m
      ), r = [];
      return;
    }
    i(
      c,
      f,
      a,
      l,
      y,
      m
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
      ht(
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
    je(), yr && (ot = new yr(() => {
      je(), ht(
        "click",
        c,
        a,
        l,
        !1,
        u,
        f
      );
    }), ot.observe(
      document.body,
      {
        childList: !0,
        subtree: !0
      }
    ), Mt = setTimeout(() => {
      je(), ht(
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
    ), je();
  };
}
function ua(e, t, n) {
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
function la(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(
    e.classList ?? []
  ).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
export {
  da as O,
  fa as s
};
