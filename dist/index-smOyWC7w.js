let Zt = null;
function ho(e) {
  try {
    const t = new URL(e).hostname.toLowerCase();
    return t === "localhost" || t === "127.0.0.1" || t.endsWith(".oodle.ai") || t === "oodle.ai";
  } catch {
    return !1;
  }
}
function yo(e) {
  if (!ho(e.endpoint)) {
    console.error(
      `[@oodle-ai/rum] endpoint must be on *.oodle.ai or localhost. Got: ${e.endpoint}`
    );
    return;
  }
  typeof window < "u" && e.endpoint.startsWith("http://") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && console.warn(
    "[@oodle-ai/rum] endpoint uses plain HTTP. Use HTTPS in production."
  ), Zt = e;
}
function te() {
  if (!Zt)
    throw new Error(
      "[@oodle-ai/rum] Not initialized. Call OodleRum.init() first."
    );
  return Zt;
}
const vr = "__oodle_session", go = 1800 * 1e3, _o = 14400 * 1e3;
function wo() {
  return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (e) => {
      const t = Math.random() * 16 | 0;
      return (e === "x" ? t : t & 3 | 8).toString(16);
    }
  );
}
function To() {
  try {
    const e = sessionStorage.getItem(vr);
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
function hr(e) {
  try {
    sessionStorage.setItem(
      vr,
      JSON.stringify(e)
    );
  } catch {
  }
}
let be = null;
function yr(e) {
  be || (be = setTimeout(() => {
    be = null, hr(e);
  }, 1e3));
}
function hn(e) {
  be && (clearTimeout(be), be = null), hr(e);
}
let v = null, gr = 100, _r = 100;
function Eo(e, t) {
  gr = Math.max(
    0,
    Math.min(100, e)
  ), _r = Math.max(
    0,
    Math.min(100, t)
  );
}
function Pn(e) {
  return Math.random() * 100 < e;
}
function ee() {
  const e = Date.now();
  if (v || (v = To()), !v || e - v.lastActivity > go || e - v.createdAt > _o) {
    const t = Pn(gr);
    v = {
      id: wo(),
      createdAt: e,
      lastActivity: e,
      viewCount: 0,
      errorCount: 0,
      actionCount: 0,
      sampled: t,
      replaySampled: t && Pn(_r),
      replaySegmentSeq: 0
    }, hn(v);
  } else
    v.lastActivity = e, yr(v);
  return v.id;
}
function So() {
  if (ee(), !v) return 0;
  const e = v.replaySegmentSeq;
  return v.replaySegmentSeq = e + 1, hn(v), e;
}
function wr() {
  return ee(), (v == null ? void 0 : v.sampled) ?? !0;
}
function Tr() {
  return ee(), (v == null ? void 0 : v.replaySampled) ?? !0;
}
let je = null;
function bo() {
  typeof document > "u" || (Er(), je = () => {
    document.visibilityState === "hidden" && v && hn(v);
  }, document.addEventListener(
    "visibilitychange",
    je
  ));
}
function Er() {
  je && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    je
  ), je = null);
}
function Sr(e) {
  ee(), v && (e === "view" || e === "page_load" ? v.viewCount++ : e === "error" ? v.errorCount++ : e === "action" && v.actionCount++, yr(v));
}
function Io() {
  return ee(), {
    viewCount: (v == null ? void 0 : v.viewCount) ?? 0,
    errorCount: (v == null ? void 0 : v.errorCount) ?? 0,
    actionCount: (v == null ? void 0 : v.actionCount) ?? 0
  };
}
let X = null;
function Co(e) {
  X = e;
}
function br() {
  return (X == null ? void 0 : X.id) ?? "";
}
function Mo() {
  return (X == null ? void 0 : X.name) ?? "";
}
function Ao() {
  return (X == null ? void 0 : X.email) ?? "";
}
function Lo() {
  return X ? "identified" : "anonymous";
}
const Ro = 5e5;
function en(e, t = Number.POSITIVE_INFINITY) {
  let n = 0, r = 0;
  const o = [e];
  for (; o.length > 0; ) {
    if (n >= t || ++r > Ro) return n;
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
function ko(e) {
  e && (Ct = { ...e });
}
function xo(e) {
  Ct = { ...Ct, ...e };
}
function Oo() {
  return Ct;
}
const Po = 6e4, Do = "sdk_telemetry", Ie = {
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
function k(e, t = 1) {
  Ie[e] += t;
}
function No() {
  for (const e in Ie)
    if (Ie[e] > 0)
      return !0;
  return !1;
}
function tn() {
  if (!No()) return;
  const e = { ...Ie };
  for (const t in Ie)
    Ie[t] = 0;
  Tn(Do, {
    _type: "sdk_telemetry",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...e
  });
}
let Ge = null, $e = null;
function Ho() {
  Ge || (Ge = setInterval(
    tn,
    Po
  ), typeof document < "u" && ($e = () => {
    document.visibilityState === "hidden" && tn();
  }, document.addEventListener(
    "visibilitychange",
    $e
  )));
}
function Uo() {
  Ge && (clearInterval(Ge), Ge = null), $e && typeof document < "u" && (document.removeEventListener(
    "visibilitychange",
    $e
  ), $e = null), tn();
}
var N = Uint8Array, P = Uint16Array, yn = Int32Array, gn = new N([
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
]), _n = new N([
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
]), Dn = new N([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Ir = function(e, t) {
  for (var n = new P(31), r = 0; r < 31; ++r)
    n[r] = t += 1 << e[r - 1];
  for (var o = new yn(n[30]), r = 1; r < 30; ++r)
    for (var i = n[r]; i < n[r + 1]; ++i)
      o[i] = i - n[r] << 5 | r;
  return { b: n, r: o };
}, Cr = Ir(gn, 2), Fo = Cr.b, nn = Cr.r;
Fo[28] = 258, nn[258] = 28;
var Bo = Ir(_n, 0), Nn = Bo.r, rn = new P(32768);
for (var b = 0; b < 32768; ++b) {
  var re = (b & 43690) >> 1 | (b & 21845) << 1;
  re = (re & 52428) >> 2 | (re & 13107) << 2, re = (re & 61680) >> 4 | (re & 3855) << 4, rn[b] = ((re & 65280) >> 8 | (re & 255) << 8) >> 1;
}
var Je = (function(e, t, n) {
  for (var r = e.length, o = 0, i = new P(t); o < r; ++o)
    e[o] && ++i[e[o] - 1];
  var s = new P(t);
  for (o = 1; o < t; ++o)
    s[o] = s[o - 1] + i[o - 1] << 1;
  var c;
  if (n) {
    c = new P(1 << t);
    var a = 15 - t;
    for (o = 0; o < r; ++o)
      if (e[o])
        for (var l = o << 4 | e[o], u = t - e[o], f = s[e[o] - 1]++ << u, d = f | (1 << u) - 1; f <= d; ++f)
          c[rn[f] >> a] = l;
  } else
    for (c = new P(r), o = 0; o < r; ++o)
      e[o] && (c[o] = rn[s[e[o] - 1]++] >> 15 - e[o]);
  return c;
}), he = new N(288);
for (var b = 0; b < 144; ++b)
  he[b] = 8;
for (var b = 144; b < 256; ++b)
  he[b] = 9;
for (var b = 256; b < 280; ++b)
  he[b] = 7;
for (var b = 280; b < 288; ++b)
  he[b] = 8;
var Mt = new N(32);
for (var b = 0; b < 32; ++b)
  Mt[b] = 5;
var qo = /* @__PURE__ */ Je(he, 9, 0), zo = /* @__PURE__ */ Je(Mt, 5, 0), Mr = function(e) {
  return (e + 7) / 8 | 0;
}, Ar = function(e, t, n) {
  return (n == null || n > e.length) && (n = e.length), new N(e.subarray(t, n));
}, $ = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8;
}, ze = function(e, t, n) {
  n <<= t & 7;
  var r = t / 8 | 0;
  e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, Yt = function(e, t) {
  for (var n = [], r = 0; r < e.length; ++r)
    e[r] && n.push({ s: r, f: e[r] });
  var o = n.length, i = n.slice();
  if (!o)
    return { t: Rr, l: 0 };
  if (o == 1) {
    var s = new N(n[0].s + 1);
    return s[n[0].s] = 1, { t: s, l: 1 };
  }
  n.sort(function(T, C) {
    return T.f - C.f;
  }), n.push({ s: -1, f: 25001 });
  var c = n[0], a = n[1], l = 0, u = 1, f = 2;
  for (n[0] = { s: -1, f: c.f + a.f, l: c, r: a }; u != o - 1; )
    c = n[n[l].f < n[f].f ? l++ : f++], a = n[l != u && n[l].f < n[f].f ? l++ : f++], n[u++] = { s: -1, f: c.f + a.f, l: c, r: a };
  for (var d = i[0].s, r = 1; r < o; ++r)
    i[r].s > d && (d = i[r].s);
  var y = new P(d + 1), m = on(n[u - 1], y, 0);
  if (m > t) {
    var r = 0, _ = 0, w = m - t, S = 1 << w;
    for (i.sort(function(C, g) {
      return y[g.s] - y[C.s] || C.f - g.f;
    }); r < o; ++r) {
      var R = i[r].s;
      if (y[R] > t)
        _ += S - (1 << m - y[R]), y[R] = t;
      else
        break;
    }
    for (_ >>= w; _ > 0; ) {
      var M = i[r].s;
      y[M] < t ? _ -= 1 << t - y[M]++ - 1 : ++r;
    }
    for (; r >= 0 && _; --r) {
      var I = i[r].s;
      y[I] == t && (--y[I], ++_);
    }
    m = t;
  }
  return { t: new N(y), l: m };
}, on = function(e, t, n) {
  return e.s == -1 ? Math.max(on(e.l, t, n + 1), on(e.r, t, n + 1)) : t[e.s] = n;
}, Hn = function(e) {
  for (var t = e.length; t && !e[--t]; )
    ;
  for (var n = new P(++t), r = 0, o = e[0], i = 1, s = function(a) {
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
}, Xe = function(e, t) {
  for (var n = 0, r = 0; r < t.length; ++r)
    n += e[r] * t[r];
  return n;
}, Lr = function(e, t, n) {
  var r = n.length, o = Mr(t + 2);
  e[o] = r & 255, e[o + 1] = r >> 8, e[o + 2] = e[o] ^ 255, e[o + 3] = e[o + 1] ^ 255;
  for (var i = 0; i < r; ++i)
    e[o + i + 4] = n[i];
  return (o + 4 + r) * 8;
}, Un = function(e, t, n, r, o, i, s, c, a, l, u) {
  $(t, u++, n), ++o[256];
  for (var f = Yt(o, 15), d = f.t, y = f.l, m = Yt(i, 15), _ = m.t, w = m.l, S = Hn(d), R = S.c, M = S.n, I = Hn(_), T = I.c, C = I.n, g = new P(19), h = 0; h < R.length; ++h)
    ++g[R[h] & 31];
  for (var h = 0; h < T.length; ++h)
    ++g[T[h] & 31];
  for (var p = Yt(g, 7), x = p.t, ge = p.l, O = 19; O > 4 && !x[Dn[O - 1]]; --O)
    ;
  var _e = l + 5 << 3, B = Xe(o, he) + Xe(i, Mt) + s, q = Xe(o, d) + Xe(i, _) + s + 14 + 3 * O + Xe(g, x) + 2 * g[16] + 3 * g[17] + 7 * g[18];
  if (a >= 0 && _e <= B && _e <= q)
    return Lr(t, u, e.subarray(a, a + l));
  var Y, A, z, ne;
  if ($(t, u, 1 + (q < B)), u += 2, q < B) {
    Y = Je(d, y, 0), A = d, z = Je(_, w, 0), ne = _;
    var Bt = Je(x, ge, 0);
    $(t, u, M - 257), $(t, u + 5, C - 1), $(t, u + 10, O - 4), u += 14;
    for (var h = 0; h < O; ++h)
      $(t, u + 3 * h, x[Dn[h]]);
    u += 3 * O;
    for (var V = [R, T], qe = 0; qe < 2; ++qe)
      for (var we = V[qe], h = 0; h < we.length; ++h) {
        var W = we[h] & 31;
        $(t, u, Bt[W]), u += x[W], W > 15 && ($(t, u, we[h] >> 5 & 127), u += we[h] >> 12);
      }
  } else
    Y = qo, A = he, z = zo, ne = Mt;
  for (var h = 0; h < c; ++h) {
    var L = r[h];
    if (L > 255) {
      var W = L >> 18 & 31;
      ze(t, u, Y[W + 257]), u += A[W + 257], W > 7 && ($(t, u, L >> 23 & 31), u += gn[W]);
      var Te = L & 31;
      ze(t, u, z[Te]), u += ne[Te], Te > 3 && (ze(t, u, L >> 5 & 8191), u += _n[Te]);
    } else
      ze(t, u, Y[L]), u += A[L];
  }
  return ze(t, u, Y[256]), u + A[256];
}, Xo = /* @__PURE__ */ new yn([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Rr = /* @__PURE__ */ new N(0), Yo = function(e, t, n, r, o, i) {
  var s = i.z || e.length, c = new N(r + s + 5 * (1 + Math.ceil(s / 7e3)) + o), a = c.subarray(r, c.length - o), l = i.l, u = (i.r || 0) & 7;
  if (t) {
    u && (a[0] = i.r >> 3);
    for (var f = Xo[t - 1], d = f >> 13, y = f & 8191, m = (1 << n) - 1, _ = i.p || new P(32768), w = i.h || new P(m + 1), S = Math.ceil(n / 3), R = 2 * S, M = function(Xt) {
      return (e[Xt] ^ e[Xt + 1] << S ^ e[Xt + 2] << R) & m;
    }, I = new yn(25e3), T = new P(288), C = new P(32), g = 0, h = 0, p = i.i || 0, x = 0, ge = i.w || 0, O = 0; p + 2 < s; ++p) {
      var _e = M(p), B = p & 32767, q = w[_e];
      if (_[B] = q, w[_e] = B, ge <= p) {
        var Y = s - p;
        if ((g > 7e3 || x > 24576) && (Y > 423 || !l)) {
          u = Un(e, a, 0, I, T, C, h, x, O, p - O, u), x = g = h = 0, O = p;
          for (var A = 0; A < 286; ++A)
            T[A] = 0;
          for (var A = 0; A < 30; ++A)
            C[A] = 0;
        }
        var z = 2, ne = 0, Bt = y, V = B - q & 32767;
        if (Y > 2 && _e == M(p - V))
          for (var qe = Math.min(d, Y) - 1, we = Math.min(32767, p), W = Math.min(258, Y); V <= we && --Bt && B != q; ) {
            if (e[p + z] == e[p + z - V]) {
              for (var L = 0; L < W && e[p + L] == e[p + L - V]; ++L)
                ;
              if (L > z) {
                if (z = L, ne = V, L > qe)
                  break;
                for (var Te = Math.min(V, L - 2), Rn = 0, A = 0; A < Te; ++A) {
                  var qt = p - V + A & 32767, vo = _[qt], kn = qt - vo & 32767;
                  kn > Rn && (Rn = kn, q = qt);
                }
              }
            }
            B = q, q = _[B], V += B - q & 32767;
          }
        if (ne) {
          I[x++] = 268435456 | nn[z] << 18 | Nn[ne];
          var xn = nn[z] & 31, On = Nn[ne] & 31;
          h += gn[xn] + _n[On], ++T[257 + xn], ++C[On], ge = p + z, ++g;
        } else
          I[x++] = e[p], ++T[e[p]];
      }
    }
    for (p = Math.max(p, ge); p < s; ++p)
      I[x++] = e[p], ++T[e[p]];
    u = Un(e, a, l, I, T, C, h, x, O, p - O, u), l || (i.r = u & 7 | a[u / 8 | 0] << 3, u -= 7, i.h = w, i.p = _, i.i = p, i.w = ge);
  } else {
    for (var p = i.w || 0; p < s + l; p += 65535) {
      var zt = p + 65535;
      zt >= s && (a[u / 8 | 0] = l, zt = s), u = Lr(a, u + 1, e.subarray(p, zt));
    }
    i.i = s;
  }
  return Ar(c, 0, r + Mr(u) + o);
}, Vo = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var n = t, r = 9; --r; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    e[t] = n;
  }
  return e;
})(), Wo = function() {
  var e = -1;
  return {
    p: function(t) {
      for (var n = e, r = 0; r < t.length; ++r)
        n = Vo[n & 255 ^ t[r]] ^ n >>> 8;
      e = n;
    },
    d: function() {
      return ~e;
    }
  };
}, jo = function(e, t, n, r, o) {
  if (!o && (o = { l: 1 }, t.dictionary)) {
    var i = t.dictionary.subarray(-32768), s = new N(i.length + e.length);
    s.set(i), s.set(e, i.length), e = s, o.w = i.length;
  }
  return Yo(e, t.level == null ? 6 : t.level, t.mem == null ? o.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, o);
}, sn = function(e, t, n) {
  for (; n; ++t)
    e[t] = n, n >>>= 8;
}, Go = function(e, t) {
  var n = t.filename;
  if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : t.level == 9 ? 2 : 0, e[9] = 3, t.mtime != 0 && sn(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), n) {
    e[3] = 8;
    for (var r = 0; r <= n.length; ++r)
      e[r + 10] = n.charCodeAt(r);
  }
}, $o = function(e) {
  return 10 + (e.filename ? e.filename.length + 1 : 0);
};
function Jo(e, t) {
  t || (t = {});
  var n = Wo(), r = e.length;
  n.p(e);
  var o = jo(e, t, $o(t), 8), i = o.length;
  return Go(o, t), sn(o, i - 8, n.d()), sn(o, i - 4, r), o;
}
var Fn = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), Ko = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Qo = 0;
try {
  Ko.decode(Rr, { stream: !0 }), Qo = 1;
} catch {
}
function Zo(e, t) {
  var n;
  if (Fn)
    return Fn.encode(e);
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
  return Ar(o, 0, i);
}
function yt(e) {
  try {
    return Jo(Zo(e));
  } catch {
    return null;
  }
}
const ei = (() => {
  try {
    return typeof CompressionStream < "u" && typeof Response < "u";
  } catch {
    return !1;
  }
})();
async function ti(e) {
  if (!ei)
    return yt(e);
  try {
    const t = new Response(e).body;
    if (!t) return yt(e);
    const n = t.pipeThrough(
      new CompressionStream("gzip")
    ), r = await new Response(
      n
    ).arrayBuffer();
    return new Uint8Array(r);
  } catch {
    return yt(e);
  }
}
const ni = "0.2.8", Bn = 5e3, kr = 50, xr = 5e5, qn = 256e3, At = "replay", Or = 8e4, Pr = 32, ri = 2e7, oi = 5, ii = 1e3, si = 6e4, ai = 500, Lt = 63e3;
let Ce = 0, Me = 0, oe = [], Ke = 0, Vt = null;
const Rt = /* @__PURE__ */ new Map();
let Ae = null, Le = null;
function ci() {
  try {
    return te().flushIntervalMs ?? Bn;
  } catch {
    return Bn;
  }
}
function Dr(e) {
  let t = Rt.get(e);
  return t || (t = {
    batchKey: e,
    items: [],
    upsertMap: /* @__PURE__ */ new Map(),
    bytesEstimate: 0
  }, Rt.set(e, t)), t;
}
function Nr(e, t) {
  return e ? {
    body: new Blob([
      e
    ]),
    encoding: "gzip"
  } : (k("compression_failures"), { body: t, encoding: "" });
}
async function Hr(e) {
  return Nr(await ti(e), e);
}
function ui(e) {
  return Nr(yt(e), e);
}
const li = 64e3;
function an(e, t, n) {
  if (e === At)
    return {
      bytes: n ?? en(
        t,
        li
      ),
      oversized: !1
    };
  const r = en(
    t,
    qn + 1
  );
  return {
    bytes: r,
    oversized: r > qn
  };
}
let cn = null;
function fi(e) {
  cn = e;
}
function Nt(e) {
  k("transport_drops"), e === At && cn && cn();
}
const di = "/v1/rum/ingest";
function pi(e) {
  var r, o;
  const t = ((o = (r = e[0]) == null ? void 0 : r.items[0]) == null ? void 0 : o.session_id) ?? "", n = [];
  n.push(
    JSON.stringify({
      session_id: t,
      sdk_version: ni
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
function mi(e, t, n) {
  const r = te();
  if (typeof navigator < "u" && navigator.sendBeacon) {
    const a = e + `?api_key=${encodeURIComponent(
      r.apiKey
    )}`, l = new Blob([n], {
      type: "application/json"
    });
    if (l.size < Lt && navigator.sendBeacon(a, l))
      return;
  }
  const { body: o, encoding: i } = ui(n), s = { ...t };
  i ? s["Content-Encoding"] = i : delete s["Content-Encoding"];
  const c = o instanceof Blob ? o.size : n.length;
  fetch(e, {
    method: "POST",
    headers: s,
    body: o,
    keepalive: c < Lt,
    credentials: "omit"
  }).catch(() => {
    k("exit_send_failures");
  });
}
function Wt(e, t, n, r) {
  const o = n.length;
  if (Ke + o > ri) {
    k("retry_drops"), r && Nt(r);
    return;
  }
  const i = { ...t };
  delete i["Content-Encoding"], oe.push({
    url: e,
    headers: i,
    body: n,
    bytes: o,
    attempts: 0,
    batchKey: r
  }), Ke += o, Ur();
}
function Ur() {
  if (Vt || oe.length === 0)
    return;
  const e = oe[0], t = Math.min(
    ii * Math.pow(2, e.attempts),
    si
  );
  Vt = setTimeout(() => {
    Vt = null, Fr();
  }, t);
}
async function Fr() {
  for (; oe.length > 0 && Ce < Or && Me < Pr; ) {
    const e = oe.shift();
    if (Ke -= e.bytes, e.attempts++, e.attempts > oi) {
      k("retry_drops"), e.batchKey && Nt(e.batchKey);
      continue;
    }
    const t = e.bytes;
    Ce += t, Me++;
    try {
      const { body: n, encoding: r } = await Hr(e.body), o = { ...e.headers };
      o["Content-Type"] = "application/json", r ? o["Content-Encoding"] = r : delete o["Content-Encoding"];
      const i = await fetch(e.url, {
        method: "POST",
        headers: o,
        body: n,
        keepalive: t < Lt,
        credentials: "omit"
      });
      if (Br(i), i.status === 429 || i.status >= 500) {
        oe.unshift(e), Ke += e.bytes;
        break;
      }
    } catch {
      oe.unshift(e), Ke += e.bytes;
      break;
    } finally {
      Ce -= t, Me--;
    }
  }
  oe.length > 0 && Ur();
}
function vi() {
  Ae && (clearTimeout(Ae), Ae = null), Le && (clearTimeout(Le), Le = null);
}
function wn() {
  const e = ci();
  Ae && clearTimeout(Ae), Ae = setTimeout(
    () => ae(),
    e
  ), Le || (Le = setTimeout(
    () => {
      Le = null, ae();
    },
    e + ai
  ));
}
function Tn(e, t, n) {
  const { bytes: r, oversized: o } = an(
    e,
    t,
    n
  );
  if (o) {
    console.warn(
      `[@oodle-ai/rum] Dropping oversized ${e} payload (${r} bytes)`
    ), Nt(e);
    return;
  }
  const i = Dr(e);
  if (i.items.push(t), i.bytesEstimate += r, i.items.length >= kr || i.bytesEstimate >= xr) {
    ae();
    return;
  }
  wn();
}
function hi(e, t, n) {
  const { bytes: r, oversized: o } = an(
    e,
    n
  );
  if (o) {
    Nt(e);
    return;
  }
  const i = Dr(e), s = i.upsertMap.get(t);
  if (s !== void 0) {
    const c = an(
      e,
      i.items[s]
    ).bytes;
    i.items[s] = n, i.bytesEstimate += r - c;
  } else {
    const c = i.items.length;
    i.items.push(n), i.upsertMap.set(t, c), i.bytesEstimate += r;
  }
  if (i.items.length >= kr || i.bytesEstimate >= xr) {
    ae();
    return;
  }
  wn();
}
const zn = ["events", "replay"];
function ae(e = !1) {
  const t = te();
  if (!e && t.shouldSendData && !t.shouldSendData()) {
    wn();
    return;
  }
  vi();
  const n = Oo(), r = [], o = Array.from(
    Rt.keys()
  ).sort((l, u) => {
    const f = zn.indexOf(l), d = zn.indexOf(u), y = f >= 0 ? f : 999, m = d >= 0 ? d : 999;
    return y - m;
  });
  for (const l of o) {
    const u = Rt.get(l);
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
  const i = pi(r), s = `${t.endpoint}${di}`, c = {
    "X-OODLE-INSTANCE": t.instanceId,
    "X-API-KEY": t.apiKey,
    "Content-Type": "application/json"
  }, a = r.some(
    (l) => l.type === At
  );
  if (e) {
    mi(s, c, i);
    return;
  }
  yi(
    s,
    c,
    i,
    a ? At : void 0
  );
}
async function yi(e, t, n, r) {
  const o = n.length;
  if (Ce >= Or || Me >= Pr) {
    Wt(e, t, n, r);
    return;
  }
  Ce += o, Me++;
  try {
    const { body: i, encoding: s } = await Hr(n), c = { ...t };
    s && (c["Content-Encoding"] = s);
    const a = await fetch(e, {
      method: "POST",
      headers: c,
      body: i,
      keepalive: o < Lt,
      credentials: "omit"
    });
    Br(a), (a.status === 429 || a.status >= 500) && Wt(e, t, n, r);
  } catch {
    k("send_failures"), Wt(e, t, n, r);
  } finally {
    Ce -= o, Me--, Fr();
  }
}
const un = /* @__PURE__ */ new Map();
function Br(e) {
  const t = e.headers.get(
    "X-Oodle-Rate-Limits"
  );
  if (!t) return;
  const n = Date.now();
  for (const r of t.split(",")) {
    const [o, i] = r.trim().split(":");
    o && i && un.set(
      o,
      n + parseInt(i, 10) * 1e3
    );
  }
}
function Ht(e) {
  const t = un.get(e);
  return t ? Date.now() >= t ? (un.delete(e), !1) : !0 : !1;
}
let Qe = null, Ze = null, et = null, ln = null;
function gi(e) {
  ln = e;
}
const qr = typeof self < "u" && "onpagehide" in self ? "pagehide" : "beforeunload";
function Xn() {
  typeof document > "u" || (Qe = () => {
    document.visibilityState === "hidden" && ae(!0);
  }, Ze = () => ae(!0), et = (e) => {
    e.persisted && ln && ln();
  }, document.addEventListener(
    "visibilitychange",
    Qe
  ), window.addEventListener(
    qr,
    Ze
  ), window.addEventListener(
    "pageshow",
    et
  ));
}
function _i() {
  Qe && (document.removeEventListener(
    "visibilitychange",
    Qe
  ), Qe = null), Ze && (window.removeEventListener(
    qr,
    Ze
  ), Ze = null), et && (window.removeEventListener(
    "pageshow",
    et
  ), et = null);
}
const kt = /* @__PURE__ */ new Map();
function wi(e, t) {
  kt.set(e, t);
}
function Ti() {
  return kt.size === 0 ? {} : Object.fromEntries(kt);
}
function Ei() {
  kt.clear();
}
var fn, ie, tt, zr, xt, Xr = -1, ye = function(e) {
  addEventListener("pageshow", (function(t) {
    t.persisted && (Xr = t.timeStamp, e(t));
  }), !0);
}, En = function() {
  var e = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
}, Ut = function() {
  var e = En();
  return e && e.activationStart || 0;
}, U = function(e, t) {
  var n = En(), r = "navigate";
  return Xr >= 0 ? r = "back-forward-cache" : n && (document.prerendering || Ut() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), { name: e, value: t === void 0 ? -1 : t, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: r };
}, Be = function(e, t, n) {
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
}, Sn = function(e) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return e();
    }));
  }));
}, ut = function(e) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && e();
  }));
}, Ft = function(e) {
  var t = !1;
  return function() {
    t || (e(), t = !0);
  };
}, Ee = -1, Yn = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, Ot = function(e) {
  document.visibilityState === "hidden" && Ee > -1 && (Ee = e.type === "visibilitychange" ? e.timeStamp : 0, Si());
}, Vn = function() {
  addEventListener("visibilitychange", Ot, !0), addEventListener("prerenderingchange", Ot, !0);
}, Si = function() {
  removeEventListener("visibilitychange", Ot, !0), removeEventListener("prerenderingchange", Ot, !0);
}, bn = function() {
  return Ee < 0 && (Ee = Yn(), Vn(), ye((function() {
    setTimeout((function() {
      Ee = Yn(), Vn();
    }), 0);
  }))), { get firstHiddenTime() {
    return Ee;
  } };
}, lt = function(e) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return e();
  }), !0) : e();
}, Wn = [1800, 3e3], Yr = function(e, t) {
  t = t || {}, lt((function() {
    var n, r = bn(), o = U("FCP"), i = Be("paint", (function(s) {
      s.forEach((function(c) {
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < r.firstHiddenTime && (o.value = Math.max(c.startTime - Ut(), 0), o.entries.push(c), n(!0)));
      }));
    }));
    i && (n = F(e, o, Wn, t.reportAllChanges), ye((function(s) {
      o = U("FCP"), n = F(e, o, Wn, t.reportAllChanges), Sn((function() {
        o.value = performance.now() - s.timeStamp, n(!0);
      }));
    })));
  }));
}, jn = [0.1, 0.25], bi = function(e, t) {
  t = t || {}, Yr(Ft((function() {
    var n, r = U("CLS", 0), o = 0, i = [], s = function(a) {
      a.forEach((function(l) {
        if (!l.hadRecentInput) {
          var u = i[0], f = i[i.length - 1];
          o && l.startTime - f.startTime < 1e3 && l.startTime - u.startTime < 5e3 ? (o += l.value, i.push(l)) : (o = l.value, i = [l]);
        }
      })), o > r.value && (r.value = o, r.entries = i, n());
    }, c = Be("layout-shift", s);
    c && (n = F(e, r, jn, t.reportAllChanges), ut((function() {
      s(c.takeRecords()), n(!0);
    })), ye((function() {
      o = 0, r = U("CLS", 0), n = F(e, r, jn, t.reportAllChanges), Sn((function() {
        return n();
      }));
    })), setTimeout(n, 0));
  })));
}, Vr = 0, jt = 1 / 0, dt = 0, Ii = function(e) {
  e.forEach((function(t) {
    t.interactionId && (jt = Math.min(jt, t.interactionId), dt = Math.max(dt, t.interactionId), Vr = dt ? (dt - jt) / 7 + 1 : 0);
  }));
}, Wr = function() {
  return fn ? Vr : performance.interactionCount || 0;
}, Ci = function() {
  "interactionCount" in performance || fn || (fn = Be("event", Ii, { type: "event", buffered: !0, durationThreshold: 0 }));
}, G = [], gt = /* @__PURE__ */ new Map(), jr = 0, Mi = function() {
  var e = Math.min(G.length - 1, Math.floor((Wr() - jr) / 50));
  return G[e];
}, Ai = [], Li = function(e) {
  if (Ai.forEach((function(o) {
    return o(e);
  })), e.interactionId || e.entryType === "first-input") {
    var t = G[G.length - 1], n = gt.get(e.interactionId);
    if (n || G.length < 10 || e.duration > t.latency) {
      if (n) e.duration > n.latency ? (n.entries = [e], n.latency = e.duration) : e.duration === n.latency && e.startTime === n.entries[0].startTime && n.entries.push(e);
      else {
        var r = { id: e.interactionId, latency: e.duration, entries: [e] };
        gt.set(r.id, r), G.push(r);
      }
      G.sort((function(o, i) {
        return i.latency - o.latency;
      })), G.length > 10 && G.splice(10).forEach((function(o) {
        return gt.delete(o.id);
      }));
    }
  }
}, Gr = function(e) {
  var t = self.requestIdleCallback || self.setTimeout, n = -1;
  return e = Ft(e), document.visibilityState === "hidden" ? e() : (n = t(e), ut(e)), n;
}, Gn = [200, 500], Ri = function(e, t) {
  "PerformanceEventTiming" in self && "interactionId" in PerformanceEventTiming.prototype && (t = t || {}, lt((function() {
    var n;
    Ci();
    var r, o = U("INP"), i = function(c) {
      Gr((function() {
        c.forEach(Li);
        var a = Mi();
        a && a.latency !== o.value && (o.value = a.latency, o.entries = a.entries, r());
      }));
    }, s = Be("event", i, { durationThreshold: (n = t.durationThreshold) !== null && n !== void 0 ? n : 40 });
    r = F(e, o, Gn, t.reportAllChanges), s && (s.observe({ type: "first-input", buffered: !0 }), ut((function() {
      i(s.takeRecords()), r(!0);
    })), ye((function() {
      jr = Wr(), G.length = 0, gt.clear(), o = U("INP"), r = F(e, o, Gn, t.reportAllChanges);
    })));
  })));
}, $n = [2500, 4e3], Gt = {}, ki = function(e, t) {
  t = t || {}, lt((function() {
    var n, r = bn(), o = U("LCP"), i = function(a) {
      t.reportAllChanges || (a = a.slice(-1)), a.forEach((function(l) {
        l.startTime < r.firstHiddenTime && (o.value = Math.max(l.startTime - Ut(), 0), o.entries = [l], n());
      }));
    }, s = Be("largest-contentful-paint", i);
    if (s) {
      n = F(e, o, $n, t.reportAllChanges);
      var c = Ft((function() {
        Gt[o.id] || (i(s.takeRecords()), s.disconnect(), Gt[o.id] = !0, n(!0));
      }));
      ["keydown", "click"].forEach((function(a) {
        addEventListener(a, (function() {
          return Gr(c);
        }), { once: !0, capture: !0 });
      })), ut(c), ye((function(a) {
        o = U("LCP"), n = F(e, o, $n, t.reportAllChanges), Sn((function() {
          o.value = performance.now() - a.timeStamp, Gt[o.id] = !0, n(!0);
        }));
      }));
    }
  }));
}, Jn = [800, 1800], xi = function e(t) {
  document.prerendering ? lt((function() {
    return e(t);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return e(t);
  }), !0) : setTimeout(t, 0);
}, Oi = function(e, t) {
  t = t || {};
  var n = U("TTFB"), r = F(e, n, Jn, t.reportAllChanges);
  xi((function() {
    var o = En();
    o && (n.value = Math.max(o.responseStart - Ut(), 0), n.entries = [o], r(!0), ye((function() {
      n = U("TTFB", 0), (r = F(e, n, Jn, t.reportAllChanges))(!0);
    })));
  }));
}, Ve = { passive: !0, capture: !0 }, Pi = /* @__PURE__ */ new Date(), Kn = function(e, t) {
  ie || (ie = t, tt = e, zr = /* @__PURE__ */ new Date(), Jr(removeEventListener), $r());
}, $r = function() {
  if (tt >= 0 && tt < zr - Pi) {
    var e = { entryType: "first-input", name: ie.type, target: ie.target, cancelable: ie.cancelable, startTime: ie.timeStamp, processingStart: ie.timeStamp + tt };
    xt.forEach((function(t) {
      t(e);
    })), xt = [];
  }
}, Di = function(e) {
  if (e.cancelable) {
    var t = (e.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - e.timeStamp;
    e.type == "pointerdown" ? (function(n, r) {
      var o = function() {
        Kn(n, r), s();
      }, i = function() {
        s();
      }, s = function() {
        removeEventListener("pointerup", o, Ve), removeEventListener("pointercancel", i, Ve);
      };
      addEventListener("pointerup", o, Ve), addEventListener("pointercancel", i, Ve);
    })(t, e) : Kn(t, e);
  }
}, Jr = function(e) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(t) {
    return e(t, Di, Ve);
  }));
}, Qn = [100, 300], Ni = function(e, t) {
  t = t || {}, lt((function() {
    var n, r = bn(), o = U("FID"), i = function(a) {
      a.startTime < r.firstHiddenTime && (o.value = a.processingStart - a.startTime, o.entries.push(a), n(!0));
    }, s = function(a) {
      a.forEach(i);
    }, c = Be("first-input", s);
    n = F(e, o, Qn, t.reportAllChanges), c && (ut(Ft((function() {
      s(c.takeRecords()), c.disconnect();
    }))), ye((function() {
      var a;
      o = U("FID"), n = F(e, o, Qn, t.reportAllChanges), xt = [], tt = -1, ie = null, Jr(addEventListener), a = i, xt.push(a), $r();
    })));
  }));
};
const Hi = 50, Zn = 200, er = /* @__PURE__ */ new Map();
function Ui(e) {
  let t = er.get(e);
  return t || (t = {
    tokens: Zn,
    lastRefill: Date.now(),
    rate: Hi,
    burst: Zn
  }, er.set(e, t)), t;
}
function Fi(e) {
  const t = Date.now(), n = (t - e.lastRefill) / 1e3;
  e.tokens = Math.min(
    e.burst,
    e.tokens + n * e.rate
  ), e.lastRefill = t;
}
function Bi(e) {
  const t = Ui(e);
  return Fi(t), t.tokens >= 1 ? (t.tokens--, !0) : !1;
}
let dn = null, pn = null;
function na(e, t) {
  dn = e, pn = t;
}
const qi = "00000000000000000000000000000000";
function Kr() {
  if (!dn || !pn) return null;
  try {
    const e = dn.getSpan(
      pn.active()
    );
    if (!e) return null;
    const t = e.spanContext();
    return !t.traceId || t.traceId === qi ? null : {
      traceId: t.traceId,
      spanId: t.spanId
    };
  } catch {
    return null;
  }
}
const tr = 100, zi = 10, nr = 5e3, Xi = 3, Yi = 0;
function Vi(e, t = () => Date.now()) {
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
    return r.size < nr && r.set(a, u), u;
  }
  function s(a) {
    const l = i(a), u = t();
    let f = n.get(l);
    if (!f) {
      if (n.size >= nr)
        return !0;
      f = {
        tokens: tr,
        lastRefillMs: u
      }, n.set(l, f);
    }
    const d = (u - f.lastRefillMs) / 1e3;
    return d > 0 && (f.tokens = Math.min(
      tr,
      f.tokens + d * zi
    ), f.lastRefillMs = u), f.tokens < 1 ? !1 : (f.tokens -= 1, !0);
  }
  function c(a) {
    var m, _, w;
    if (a.type !== Xi)
      return { event: a, dropped: 0 };
    const l = a.data;
    if (!l || l.source !== Yi || !l.attributes || l.attributes.length === 0)
      return { event: a, dropped: 0 };
    const u = l.attributes.length, f = l.attributes.filter(
      (S) => s(S.id)
    ), d = u - f.length;
    return d === 0 ? { event: a, dropped: 0 } : (l.attributes = f, {
      event: f.length > 0 || (((m = l.adds) == null ? void 0 : m.length) ?? 0) > 0 || (((_ = l.removes) == null ? void 0 : _.length) ?? 0) > 0 || (((w = l.texts) == null ? void 0 : w.length) ?? 0) > 0 ? a : null,
      dropped: d
    });
  }
  return { throttle: c, reset: o };
}
const rr = "replay", Wi = 200, or = 6e4, ji = 5e3, Gi = 8e6, Qr = 2, $i = 3, ir = 3e3, Zr = 5e3, Ji = 3, Ki = 3e4, Qi = 5e3, Zi = 16, es = 100, ts = 4, ns = 30, sr = 32, ar = 250, rs = 36e4;
function os() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent ?? "";
  return /iPhone|iPad|iPod/i.test(e) ? !0 : /Macintosh/i.test(e) && (navigator.maxTouchPoints ?? 0) > 1;
}
const is = 3e5, ss = 9e5, as = 1e3;
let me = null, Z = null, Ye = null, Ne = [], He = 0, Se = "", In = !1, eo = 0, $t = "", K = 0, ve = Date.now(), ce = !1, rt = 0, fe = null, Ue = !1, Re = null, to = 0, J = [], j = 0, ke = null, se = null, _t = 0;
function Fe() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
const Cn = Vi(
  () => (me == null ? void 0 : me.mirror) ?? null
);
let xe = null, de = null, Oe = !1, ot = !1, Mn = 0, wt = null, Tt = null, Q = null;
function cs() {
  ke && (clearTimeout(ke), ke = null), se && (se(), se = null);
}
function mn(e, t) {
  cs();
  const n = t && !t.didTimeout ? Math.min(
    t.timeRemaining(),
    ns
  ) : null, r = e ? Fe() + (n ?? ts) : Number.POSITIVE_INFINITY;
  for (; j < J.length; ) {
    const o = Math.min(
      j + sr,
      J.length
    );
    for (; j < o; )
      vn(
        J[j++]
      );
    if (Fe() >= r) break;
  }
  if (j >= J.length) {
    J = [], j = 0;
    return;
  }
  j >= sr * 8 && (J = J.slice(j), j = 0), no();
}
function Pt() {
  mn(!1);
}
function no() {
  if (!ke) {
    if (typeof requestIdleCallback < "u") {
      const e = requestIdleCallback(
        (t) => {
          se = null, mn(!0, t);
        },
        { timeout: es }
      );
      se = () => cancelIdleCallback(e);
    }
    ke = setTimeout(() => {
      ke = null, se && (se(), se = null), mn(!0);
    }, Zi);
  }
}
function it(e = !1) {
  if (Ue = !0, Re) return;
  let t = 0;
  if (!e) {
    const n = Date.now() - ve, r = Math.max(
      0,
      Zr - n
    ), o = Date.now() - to, i = Math.max(
      0,
      Qi - o
    );
    t = Math.max(
      r,
      i
    );
  }
  Re = setTimeout(() => {
    Re = null, us();
  }, t);
}
function us() {
  if (!Ue || !me || !Z || ce) return;
  rt++;
  const e = _t > ar ? 1 : Ji;
  if (rt > e) {
    ds();
    return;
  }
  to = Date.now(), K = 0, ve = Date.now();
  try {
    const t = Fe();
    me.takeFullSnapshot(!0), _t = Fe() - t, k("replay_rebases"), _t > ar && k(
      "replay_expensive_snapshots"
    );
  } catch {
    at(), st();
  }
}
function cr() {
  k("replay_events_dropped");
}
function ro() {
  if (Se) return !1;
  Se = ee(), eo = So();
  const e = $t !== "" && $t !== Se;
  return $t = Se, e;
}
function ft() {
  if (fs(), Ne.length === 0) return;
  if (Ht(rr)) {
    ls(), oo();
    return;
  }
  ro();
  const e = Se, t = eo, n = Ne.splice(0), r = He;
  He = 0, Se = "", In = !0, Tn(
    rr,
    {
      session_id: e,
      segment_index: t,
      events: n
    },
    r
  );
}
function ls() {
  He <= Gi || (k(
    "replay_events_dropped",
    Ne.length
  ), Ne.length = 0, He = 0, it());
}
let Pe = null;
function fs() {
  Pe && (clearTimeout(Pe), Pe = null);
}
function oo() {
  if (Pe) return;
  const e = te().replayFlushIntervalMs ?? ji;
  Pe = setTimeout(() => {
    Pe = null, ft();
  }, e);
}
function vn(e) {
  ro() && e.type !== Qr && it(!0), Ne.push(e), He += en(
    e,
    or
  ), Ne.length >= Wi || He >= or ? ft() : oo();
}
function ds() {
  ce = !0, k("replay_overload_pauses"), at(), fe && clearTimeout(fe), fe = setTimeout(() => {
    fe = null, ce = !1, rt = 0, K = 0, ve = Date.now(), !Oe && !ot && Q && st();
  }, Ki);
}
function ps(e) {
  if (ce) return;
  if (e.type === Qr) {
    Pt(), Ue = !1, K = 0, ve = Date.now(), vn(e);
    return;
  }
  if (e.type !== $i) {
    Pt(), vn(e);
    return;
  }
  if (Ue) {
    cr(), it();
    return;
  }
  const t = Date.now();
  t - ve > Zr && (K <= ir && (rt = 0), K = 0, ve = t);
  const n = Cn.throttle(e);
  if (n.dropped > 0 && k(
    "replay_attributes_throttled",
    n.dropped
  ), !!n.event) {
    if (K++, K > ir) {
      cr(), it();
      return;
    }
    J.push(n.event), no();
  }
}
async function st() {
  if (Q && !ce && !Z)
    return Ye || (Ye = ms().finally(
      () => {
        Ye = null;
      }
    ), Ye);
}
async function ms() {
  if (!Q) return;
  const e = '[data-oodle-privacy="hidden"],.oodle-privacy-hidden', t = '[data-oodle-privacy="mask"],.oodle-privacy-mask', { record: n } = await import("./rrweb-SbAupvcM.js");
  !Q || ce || Z || (me = n, Ue = !1, K = 0, ve = Date.now(), Cn.reset(), Z = n({
    sampling: {
      // Recording mousemove on iOS blocks the main
      // thread badly enough that Safari stalls, so it
      // is off rather than merely sampled there.
      mousemove: os() ? !1 : 50,
      mouseInteraction: !0,
      scroll: 100,
      input: "last"
    },
    slimDOMOptions: "all",
    checkoutEveryNms: rs,
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
        ps(r);
      } catch {
        k("replay_emit_errors");
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
  }) ?? null, setTimeout(() => ft(), 200));
}
function at() {
  Z && (Z(), Z = null), Re && (clearTimeout(Re), Re = null), Ue = !1, Pt(), ft();
}
function vs() {
  const e = te(), t = e.replayIdlePauseMs ?? is, n = e.replayIdleExpireMs ?? ss;
  xe && clearTimeout(xe), de && (clearTimeout(de), de = null), xe = setTimeout(() => {
    Oe = !0, at();
  }, t), de = setTimeout(() => {
    ot = !0, at();
  }, n);
}
function Et() {
  Mn = Fe(), vs();
}
function hs() {
  if (ot) {
    if (!Tr()) return;
    ot = !1, Oe = !1, st(), Et();
    return;
  }
  if (Oe) {
    Oe = !1, st(), Et();
    return;
  }
  Fe() - Mn >= as && Et();
}
function ys() {
  const e = [
    "click",
    "mousemove",
    "keydown",
    "scroll"
  ], t = () => hs(), n = { passive: !0, capture: !0 };
  for (const r of e)
    window.addEventListener(r, t, n);
  wt = () => {
    for (const r of e)
      window.removeEventListener(
        r,
        t,
        n
      );
  };
}
function gs() {
  wt && (wt(), wt = null), xe && (clearTimeout(xe), xe = null), de && (clearTimeout(de), de = null);
}
function _s() {
  if (typeof document > "u") return;
  const e = () => {
    document.visibilityState === "hidden" && (Pt(), ft());
  };
  document.addEventListener(
    "visibilitychange",
    e
  ), Tt = () => {
    document.removeEventListener(
      "visibilitychange",
      e
    );
  };
}
async function ws() {
  const t = te().privacyLevel ?? "mask-user-input";
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
  }, fi(() => {
    Z && it();
  }), await st(), ys(), _s(), Et();
}
function Ts() {
  return Z !== null && !ce;
}
function Es() {
  return In;
}
function Ss() {
  at(), gs(), Tt && (Tt(), Tt = null), fe && (clearTimeout(fe), fe = null), Oe = !1, ot = !1, Mn = 0, ce = !1, In = !1, rt = 0, K = 0, _t = 0, J = [], j = 0, Cn.reset(), Q = null, me = null;
}
let H = [], le = null;
const bs = [
  "error",
  "action",
  "console",
  "resource"
];
function Is(e) {
  return bs.includes(e) && (Ht(e) || !Bi(e)) ? (k("events_rate_limited"), !0) : !1;
}
function ct(e) {
  try {
    const t = new URL(e);
    return t.origin + t.pathname;
  } catch {
    return e;
  }
}
function Cs() {
  le || (le = {
    device_type: Gs(),
    browser_name: $s(),
    os_name: Js(),
    user_agent: navigator.userAgent,
    language: navigator.language
  });
}
function io() {
  Cs();
  const e = Io(), t = Ti(), n = te(), r = {
    session_id: ee(),
    user_id: br(),
    user_name: Mo(),
    user_email: Ao(),
    user_status: Lo(),
    service: n.service,
    env: n.env ?? "",
    version: n.version ?? "",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    view_url: window.location.origin + window.location.pathname,
    view_url_host: window.location.hostname,
    view_url_path: window.location.pathname,
    referrer_url: ct(document.referrer),
    device_type: le.device_type,
    browser_name: le.browser_name,
    os_name: le.os_name,
    user_agent: le.user_agent,
    language: le.language,
    session_view_count: e.viewCount,
    session_error_count: e.errorCount,
    session_action_count: e.actionCount,
    replay_id: Ts() && Es() ? ee() : ""
  };
  return Object.keys(t).length > 0 && (r.feature_flags = t), r;
}
function Ms(e) {
  typeof requestIdleCallback < "u" ? requestIdleCallback(e, { timeout: 1e3 }) : setTimeout(e, 0);
}
const so = "events";
function D(e) {
  if (!wr() || Ht("events")) return;
  const t = e(), n = t.event_type;
  if (Is(n)) return;
  Sr(n);
  const r = io();
  Tn(
    so,
    { ...r, ...t }
  );
}
function An(e) {
  Ms(
    () => D(e)
  );
}
function As(e) {
  if (!wr() || Ht("events")) return;
  const t = e(), n = t.event_type;
  Sr(n);
  const r = io(), o = r.session_id + ":" + r.view_url_path;
  hi(
    so,
    o,
    { ...r, ...t }
  );
}
function Ls() {
  Rs(), ks(), Os(), Ps(), Ys(), qs(), zs(), Xs(), Vs(), xs();
}
function Rs() {
  const e = (n) => {
    D(() => {
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
    D(() => ({
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
function ur(e) {
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function ks() {
  const e = {
    error: console.error,
    warn: console.warn
  };
  console.error = (...t) => {
    const n = t.map(ur).join(" ");
    D(() => ({
      event_type: "console",
      console_level: "error",
      console_message: n
    })), e.error.apply(console, t);
  }, console.warn = (...t) => {
    const n = t.map(ur).join(" ");
    D(() => ({
      event_type: "console",
      console_level: "warn",
      console_message: n
    })), e.warn.apply(console, t);
  }, H.push(() => {
    console.error = e.error, console.warn = e.warn;
  });
}
const E = {};
let pe = null, St = 0, lr = "";
function ao() {
  const e = JSON.stringify(E);
  if (e === lr) return;
  lr = e, St = 0;
  const t = E.page_load_ms || E.lcp || E.dom_complete_ms || 0, n = t > 0;
  As(() => ({
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
  St || (St = e);
  const t = e - St, n = Math.max(0, 5e3 - t);
  pe && clearTimeout(pe), pe = setTimeout(() => {
    pe = null, ao();
  }, n);
}
function xs() {
  if (typeof document > "u") return;
  const e = () => {
    document.visibilityState === "hidden" && (pe && (clearTimeout(pe), pe = null), ao());
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
function Os() {
  ki((e) => {
    E.lcp = e.value, ue();
  }), Ni((e) => {
    E.fid = e.value, ue();
  }), Ri((e) => {
    E.inp = e.value, ue();
  }), bi((e) => {
    E.cls = e.value, ue();
  }), Yr((e) => {
    E.fcp = e.value, ue();
  }), Oi((e) => {
    E.ttfb = e.value, ue();
  });
}
function Ln(e) {
  const t = te().endpoint;
  return e.startsWith(t);
}
function Ps() {
  if (typeof PerformanceObserver > "u")
    return;
  const e = new PerformanceObserver(
    (t) => {
      for (const n of t.getEntries()) {
        const r = n, o = r.initiatorType ?? "";
        if (o === "fetch" || o === "xmlhttprequest" || Ln(r.name))
          continue;
        const i = ct(r.name), s = r.duration, c = r.transferSize ?? 0, a = o;
        An(
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
function Dt(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), Array.from(t).map(
    (n) => n.toString(16).padStart(2, "0")
  ).join("");
}
function Ds(e) {
  try {
    return new URL(e, location.href).href;
  } catch {
    return e;
  }
}
function Jt(e, t, n) {
  return n.some(
    (r) => typeof r == "string" ? e.startsWith(r) || t.startsWith(r) : r.test(e) || r.test(t)
  );
}
function co(e) {
  const t = Ds(e), n = te();
  let r = !1;
  const o = n.allowedTracingUrls;
  o && o.length > 0 && (r = Jt(
    t,
    e,
    o
  ));
  let i = null;
  const s = n.forwardNetworkBodies;
  s && Jt(
    t,
    e,
    s.urls
  ) && (i = s);
  let c = !1;
  const a = n.forwardNetworkHeaders;
  return a && (c = Jt(
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
const bt = /* @__PURE__ */ new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "proxy-authorization"
]);
function uo(e) {
  const t = {};
  if (!e) return t;
  if (typeof e.forEach == "function" && typeof e.get == "function")
    e.forEach((n, r) => {
      const o = r.toLowerCase();
      bt.has(o) || (t[o] = n);
    });
  else if (Array.isArray(e))
    for (const [n, r] of e) {
      const o = n.toLowerCase();
      bt.has(o) || (t[o] = r);
    }
  else
    for (const n of Object.keys(
      e
    )) {
      const r = n.toLowerCase();
      bt.has(r) || (t[r] = e[n]);
    }
  return t;
}
function Ns(e) {
  const t = {};
  for (const n of e.split(`\r
`)) {
    if (!n) continue;
    const r = n.indexOf(":");
    if (r < 0) continue;
    const o = n.slice(0, r).trim().toLowerCase();
    bt.has(o) || (t[o] = n.slice(r + 1).trim());
  }
  return t;
}
function De(e, t) {
  return e.length <= t ? e : e.slice(0, t);
}
async function Hs(e, t) {
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
function Us(e) {
  return typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
}
function Fs(e) {
  if (!e) return "";
  try {
    return JSON.stringify(
      uo(
        e
      )
    );
  } catch {
    return "";
  }
}
function fr(e) {
  try {
    return JSON.stringify(
      uo(e)
    );
  } catch {
    return "";
  }
}
function lo(e) {
  return e instanceof Request || typeof e == "object" && e !== null && "method" in e && "body" in e && "clone" in e && typeof e.clone == "function";
}
function Bs(e, t, n) {
  return e != null && e.body ? typeof e.body == "string" ? {
    sync: De(e.body, n),
    asyncP: null
  } : typeof URLSearchParams < "u" && e.body instanceof URLSearchParams ? {
    sync: De(
      e.body.toString(),
      n
    ),
    asyncP: null
  } : { sync: "", asyncP: null } : lo(t) && t.body !== null ? { sync: "", asyncP: t.clone().text().then((o) => De(o, n)).catch(() => "") } : { sync: "", asyncP: null };
}
function fo(e, t, n) {
  const r = function(o, i) {
    const s = Us(o);
    if (Ln(s))
      return t.apply(e, [
        o,
        i
      ]);
    const c = lo(o), a = ((i == null ? void 0 : i.method) ?? (c ? o.method : "GET")).toUpperCase(), l = performance.now(), u = co(s);
    let f = "", d = "";
    if (n.injectTracing) {
      const w = Kr();
      if (w)
        f = w.traceId, d = w.spanId;
      else if (u.trace) {
        f = Dt(16), d = Dt(8);
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
      const w = u.bodyCfg.maxBodySize ?? 65536, S = Bs(
        i,
        o,
        w
      );
      y = S.sync, m = S.asyncP;
    }
    let _ = "";
    return u.captureHeaders && (i != null && i.headers ? _ = Fs(
      i.headers
    ) : c && (_ = fr(
      o.headers
    ))), t.apply(e, [o, i]).then((w) => {
      const S = w.status, R = Math.round(
        performance.now() - l
      );
      let M = "";
      u.captureHeaders && (M = fr(
        w.headers
      ));
      const I = (C) => {
        const g = {
          event_type: "resource",
          resource_url: ct(s),
          resource_method: a,
          resource_status: S,
          resource_duration_ms: R,
          resource_size: 0,
          resource_type: "fetch"
        };
        return f && (g.trace_id = f, g.span_id = d), C && (g.request_body = C), _ && (g.request_headers = _), M && (g.response_headers = M), g;
      }, T = m || Promise.resolve(y);
      if (u.bodyCfg) {
        const C = u.bodyCfg.maxBodySize ?? 65536;
        Promise.all([
          T,
          Hs(
            w.clone(),
            C
          ).catch(() => "")
        ]).then(([g, h]) => {
          D(() => {
            const p = I(g);
            return h && (p.response_body = h), p;
          });
        }).catch(() => {
          T.then((g) => {
            D(
              () => I(g)
            );
          });
        });
      } else
        T.then((C) => {
          D(() => I(C));
        });
      return w;
    }).catch((w) => {
      const S = Math.round(
        performance.now() - l
      );
      throw (m || Promise.resolve(y)).then((M) => {
        D(() => {
          const I = {
            event_type: "resource",
            resource_url: ct(s),
            resource_method: a,
            resource_status: 0,
            resource_duration_ms: S,
            resource_size: 0,
            resource_type: "fetch"
          };
          return f && (I.trace_id = f, I.span_id = d), M && (I.request_body = M), _ && (I.request_headers = _), I;
        });
      }), w;
    });
  };
  return e.fetch = r, () => {
    e.fetch = t;
  };
}
function po(e, t, n) {
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
    if (Ln(c))
      return o.apply(this, [s]);
    this.__oodleMethod;
    const a = co(c);
    let l = "", u = "";
    if (n.injectTracing) {
      const T = Kr();
      T ? (l = T.traceId, u = T.spanId) : a.trace && (l = Dt(16), u = Dt(8), i.call(
        this,
        "traceparent",
        `00-${l}-${u}-01`
      ));
    }
    let f = "";
    if (a.bodyCfg && s) {
      const T = a.bodyCfg.maxBodySize ?? 65536;
      typeof s == "string" ? f = De(
        s,
        T
      ) : typeof URLSearchParams < "u" && s instanceof URLSearchParams && (f = De(
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
    const y = performance.now(), m = this, _ = l, w = u, S = f, R = a.bodyCfg, M = d, I = a.captureHeaders;
    return this.addEventListener(
      "loadend",
      () => {
        const T = Math.round(
          performance.now() - y
        ), C = m.__oodleMethod ?? "GET";
        D(() => {
          const g = {
            event_type: "resource",
            resource_url: ct(c),
            resource_method: C,
            resource_status: m.status,
            resource_duration_ms: T,
            resource_size: 0,
            resource_type: "xhr"
          };
          if (_ && (g.trace_id = _, g.span_id = w), S && (g.request_body = S), R)
            try {
              const h = m.responseText ?? "";
              g.response_body = De(
                h,
                R.maxBodySize ?? 65536
              );
            } catch {
            }
          if (M && (g.request_headers = M), I)
            try {
              const h = m.getAllResponseHeaders();
              h && (g.response_headers = JSON.stringify(
                Ns(h)
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
const mo = {
  injectTracing: !0
}, dr = {
  injectTracing: !1
};
function qs() {
  if (typeof window > "u" || typeof window.fetch > "u")
    return;
  const e = fo(
    window,
    window.fetch,
    mo
  );
  H.push(e);
}
function zs() {
  if (typeof window > "u" || typeof XMLHttpRequest > "u")
    return;
  const e = po(
    XMLHttpRequest.prototype,
    XMLHttpRequest.prototype.setRequestHeader,
    mo
  );
  H.push(e);
}
const pr = /* @__PURE__ */ new WeakSet();
function Kt(e) {
  if (pr.has(e)) return;
  pr.add(e);
  const t = () => {
    try {
      const n = e.contentWindow;
      if (!n) return;
      n.document, n.fetch && !n.fetch.__oodleFetchPatched && (fo(
        n,
        n.fetch,
        dr
      ), n.fetch.__oodleFetchPatched = !0);
      const r = n.XMLHttpRequest;
      r && !r.prototype.__oodleXHRPatched && (po(
        r.prototype,
        r.prototype.setRequestHeader,
        dr
      ), r.prototype.__oodleXHRPatched = !0);
    } catch {
    }
  };
  t(), e.addEventListener("load", t), H.push(() => {
    e.removeEventListener("load", t);
  });
}
function Xs() {
  if (typeof window > "u" || typeof MutationObserver > "u")
    return;
  document.querySelectorAll("iframe").forEach(Kt);
  const e = new MutationObserver(
    (t) => {
      for (const n of t)
        for (const r of n.addedNodes)
          r instanceof HTMLIFrameElement && Kt(r), r instanceof HTMLElement && r.childElementCount > 0 && r.querySelectorAll("iframe").forEach(Kt);
    }
  );
  e.observe(document.documentElement, {
    childList: !0,
    subtree: !0
  }), H.push(() => {
    e.disconnect();
  });
}
function Ys() {
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
function Vs() {
  if (!(typeof PerformanceObserver > "u") && !Ws())
    try {
      const e = new PerformanceObserver(
        (t) => {
          for (const n of t.getEntries()) {
            if (n.duration < 50) continue;
            const r = Math.round(
              n.duration
            );
            An(() => ({
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
function Ws() {
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
          An(() => ({
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
function Qt() {
  D(() => ({
    event_type: "view"
  }));
}
function pt(e, t, n, r, o, i, s) {
  D(() => {
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
function js(e, t) {
  D(() => ({
    event_type: "custom",
    custom_event_name: e,
    custom_event_properties: t ? JSON.stringify(t) : ""
  }));
}
function Gs() {
  const e = navigator.userAgent;
  return /Mobi|Android/i.test(e) ? "mobile" : /Tablet|iPad/i.test(e) ? "tablet" : "desktop";
}
function $s() {
  const e = navigator.userAgent;
  return e.includes("Firefox") ? "Firefox" : e.includes("Edg/") ? "Edge" : e.includes("Chrome") ? "Chrome" : e.includes("Safari") ? "Safari" : "Other";
}
function Js() {
  const e = navigator.userAgent;
  return e.includes("Windows") ? "Windows" : e.includes("Mac OS") ? "macOS" : e.includes("Linux") ? "Linux" : e.includes("Android") ? "Android" : /iPhone|iPad|iPod/.test(e) ? "iOS" : "Other";
}
function Ks() {
  for (const e of H)
    e();
  H = [];
}
const mr = typeof MutationObserver < "u" ? MutationObserver : null;
let mt = !1, vt = null, ht = null, nt = null, It = null;
const ra = {
  init(e) {
    mt || (yo(e), ko(e.tags), Eo(
      e.sessionSampleRate ?? 100,
      e.replaySampleRate ?? 100
    ), mt = !0, Xn(), bo(), Ho(), gi(() => {
      Xn();
    }), e.sessionReplay !== !1 && Tr() && ws(), Ls(), vt = Qs(), ht = Zs(), e.openTelemetry && import("./tracing-BDy6CCGo.js").then(
      (t) => t.initOtelTracing(e)
    ).catch((t) => {
      console.warn(
        "[@oodle-ai/rum] Failed to init OpenTelemetry:",
        t
      );
    }));
  },
  setTags(e) {
    xo(e);
  },
  identify(e) {
    Co(e);
  },
  trackEvent(e, t) {
    js(e, t);
  },
  addFeatureFlag(e, t) {
    wi(e, t);
  },
  getSessionId() {
    return ee();
  },
  getUserId() {
    return br();
  },
  flush() {
    ae();
  },
  stop() {
    mt && (Ss(), Ks(), Uo(), Er(), ae(!0), Ei(), _i(), vt && (vt(), vt = null), ht && (ht(), ht = null), We(), mt = !1);
  }
};
function Qs() {
  if (typeof window > "u") return null;
  const e = history.pushState;
  history.pushState = function(...r) {
    e.apply(this, r), Qt();
  };
  const t = history.replaceState;
  history.replaceState = function(...r) {
    t.apply(this, r), Qt();
  };
  const n = () => Qt();
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
function We() {
  nt && (nt.disconnect(), nt = null), It && (clearTimeout(It), It = null);
}
function Zs() {
  if (typeof document > "u")
    return null;
  const e = 3, t = 1e3, n = 1e3;
  let r = [];
  const o = (s) => {
    var w;
    const c = s.target;
    if (!c) return;
    const a = ta(c), l = (c.textContent ?? "").trim().slice(0, 200), u = ((w = c.tagName) == null ? void 0 : w.toLowerCase()) ?? "", f = ea(
      c,
      u,
      l
    ), d = Date.now(), y = s.clientX, m = s.clientY;
    if (r.push({ selector: a, time: d }), r = r.filter(
      (S) => d - S.time < t
    ), r.filter(
      (S) => S.selector === a
    ).length >= e) {
      pt(
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
      pt(
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
    We(), mr && (nt = new mr(() => {
      We(), pt(
        "click",
        c,
        a,
        l,
        !1,
        u,
        f
      );
    }), nt.observe(
      document.body,
      {
        childList: !0,
        subtree: !0
      }
    ), It = setTimeout(() => {
      We(), pt(
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
    ), We();
  };
}
function ea(e, t, n) {
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
function ta(e) {
  var r;
  if (e.id) return `#${e.id}`;
  const t = ((r = e.tagName) == null ? void 0 : r.toLowerCase()) ?? "", n = Array.from(
    e.classList ?? []
  ).slice(0, 3).join(".");
  return n ? `${t}.${n}` : t;
}
export {
  ra as O,
  na as s
};
