var hn = Object.defineProperty, pn = (e, t, r) => t in e ? hn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, A = (e, t, r) => pn(e, typeof t != "symbol" ? t + "" : t, r), Gr, dn = Object.defineProperty, mn = (e, t, r) => t in e ? dn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Jr = (e, t, r) => mn(e, typeof t != "symbol" ? t + "" : t, r), Q = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(Q || {});
const Yr = {
  Node: [
    "childNodes",
    "parentNode",
    "parentElement",
    "textContent",
    "ownerDocument"
  ],
  ShadowRoot: ["host", "styleSheets"],
  Element: ["shadowRoot", "querySelector", "querySelectorAll"],
  MutationObserver: []
}, Qr = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, qe = {}, wi = {}, gn = () => !!globalThis.Zone;
function Ar(e) {
  if (qe[e])
    return qe[e];
  const t = globalThis[e], r = t.prototype, l = e in Yr ? Yr[e] : void 0, s = !!(l && // @ts-expect-error 2345
  l.every(
    (m) => {
      var o, p;
      return !!((p = (o = Object.getOwnPropertyDescriptor(r, m)) == null ? void 0 : o.get) != null && p.toString().includes("[native code]"));
    }
  )), c = e in Qr ? Qr[e] : void 0, h = !!(c && c.every(
    // @ts-expect-error 2345
    (m) => {
      var o;
      return typeof r[m] == "function" && ((o = r[m]) == null ? void 0 : o.toString().includes("[native code]"));
    }
  ));
  if (s && h && !gn())
    return qe[e] = t.prototype, t.prototype;
  try {
    const m = document.createElement("iframe");
    m.style.display = "none", document.body.appendChild(m);
    const o = m.contentWindow;
    if (!o) return t.prototype;
    const p = o[e].prototype;
    if (!p)
      return m.remove(), r;
    const i = navigator.userAgent;
    return i.includes("Safari") && !i.includes("Chrome") ? (m.classList.add("rr-block"), m.setAttribute("__rrwebUntaintedMutationObserver", ""), wi[e] = () => m.remove()) : m.remove(), qe[e] = p;
  } catch {
    return r;
  }
}
const bt = {};
function de(e, t, r) {
  var l;
  const s = `${e}.${String(r)}`;
  if (bt[s])
    return bt[s].call(
      t
    );
  const c = Ar(e), h = (l = Object.getOwnPropertyDescriptor(
    c,
    r
  )) == null ? void 0 : l.get;
  return h ? (bt[s] = h, h.call(t)) : t[r];
}
const St = {};
function bi(e, t, r) {
  const l = `${e}.${String(r)}`;
  if (St[l])
    return St[l].bind(
      t
    );
  const c = Ar(e)[r];
  return typeof c != "function" ? t[r] : (St[l] = c, c.bind(t));
}
function yn(e) {
  return de("Node", e, "ownerDocument");
}
function wn(e) {
  return de("Node", e, "childNodes");
}
function bn(e) {
  return de("Node", e, "parentNode");
}
function Sn(e) {
  return de("Node", e, "parentElement");
}
function vn(e) {
  return de("Node", e, "textContent");
}
function Cn(e, t) {
  return bi("Node", e, "contains")(t);
}
function xn(e) {
  return bi("Node", e, "getRootNode")();
}
function Rn(e) {
  return !e || !("host" in e) ? null : de("ShadowRoot", e, "host");
}
function On(e) {
  return e.styleSheets;
}
function Mn(e) {
  return !e || !("shadowRoot" in e) ? null : de("Element", e, "shadowRoot");
}
function En(e, t) {
  return de("Element", e, "querySelector")(t);
}
function In(e, t) {
  return de("Element", e, "querySelectorAll")(t);
}
function An() {
  return [
    Ar("MutationObserver").constructor,
    wi.MutationObserver ?? (() => {
    })
  ];
}
let Si = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Si = () => (/* @__PURE__ */ new Date()).getTime());
function Nn(e, t, r) {
  try {
    if (!(t in e))
      return () => {
      };
    const l = e[t], s = r(l);
    return typeof s == "function" && (s.prototype = s.prototype || {}, Object.defineProperties(s, {
      __rrweb_original__: {
        enumerable: !1,
        value: l
      }
    })), e[t] = s, () => {
      e[t] = l;
    };
  } catch {
    return () => {
    };
  }
}
const K = {
  ownerDocument: yn,
  childNodes: wn,
  parentNode: bn,
  parentElement: Sn,
  textContent: vn,
  contains: Cn,
  getRootNode: xn,
  host: Rn,
  styleSheets: On,
  shadowRoot: Mn,
  querySelector: En,
  querySelectorAll: In,
  nowTimestamp: Si,
  mutationObserverCtor: An,
  patch: Nn
};
function vi(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function Le(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && K.host(e) || null
  );
  return !!(t && "shadowRoot" in t && K.shadowRoot(t) === e);
}
function De(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function Pn(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function kn(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function Or(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const l = Array.from(
      t,
      (s) => Ci(s, r)
    ).join("");
    return Pn(l);
  } catch {
    return null;
  }
}
function Ci(e, t) {
  if (Ln(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      Or(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      kn(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? st(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return Dn(e) && e.selectorText.includes(":") && (r = _n(r)), t ? st(r, t) : r;
  }
}
function _n(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function Ln(e) {
  return "styleSheet" in e;
}
function Dn(e) {
  return "selectorText" in e;
}
class xi {
  constructor() {
    Jr(this, "idNodeMap", /* @__PURE__ */ new Map()), Jr(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
  }
  getId(t) {
    var r;
    return t ? ((r = this.getMeta(t)) == null ? void 0 : r.id) ?? -1 : -1;
  }
  getNode(t) {
    return this.idNodeMap.get(t) || null;
  }
  getIds() {
    return Array.from(this.idNodeMap.keys());
  }
  getMeta(t) {
    return this.nodeMetaMap.get(t) || null;
  }
  // removes the node from idNodeMap
  // doesn't remove the node from nodeMetaMap
  removeNodeFromMap(t) {
    const r = this.getId(t);
    this.idNodeMap.delete(r), t.childNodes && t.childNodes.forEach(
      (l) => this.removeNodeFromMap(l)
    );
  }
  has(t) {
    return this.idNodeMap.has(t);
  }
  hasNode(t) {
    return this.nodeMetaMap.has(t);
  }
  add(t, r) {
    const l = r.id;
    this.idNodeMap.set(l, t), this.nodeMetaMap.set(t, r);
  }
  replace(t, r) {
    const l = this.getNode(t);
    if (l) {
      const s = this.nodeMetaMap.get(l);
      s && this.nodeMetaMap.set(r, s);
    }
    this.idNodeMap.set(t, r);
  }
  reset() {
    this.idNodeMap = /* @__PURE__ */ new Map(), this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
}
function Tn() {
  return new xi();
}
function tt({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: l,
  value: s,
  maskInputFn: c
}) {
  let h = s || "";
  const m = l && ve(l);
  return (t[r.toLowerCase()] || m && t[m]) && (c ? h = c(h, e) : h = "*".repeat(h.length)), h;
}
function ve(e) {
  return e.toLowerCase();
}
const Xr = "__rrweb_original__";
function Un(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let l = 0; l < e.width; l += r)
    for (let s = 0; s < e.height; s += r) {
      const c = t.getImageData, h = Xr in c ? c[Xr] : c;
      if (new Uint32Array(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        h.call(
          t,
          l,
          s,
          Math.min(r, e.width - l),
          Math.min(r, e.height - s)
        ).data.buffer
      ).some((o) => o !== 0)) return !1;
    }
  return !0;
}
function rt(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ve(t)
  ) : null;
}
function Ri(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const l = /\.([0-9a-z]+)(?:$)/i, s = r.pathname.match(l);
  return (s == null ? void 0 : s[1]) ?? null;
}
function Fn(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const $n = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, zn = /^(?:[a-z+]+:)?\/\//i, Bn = /^www\..*/i, Wn = /^(data:)([^,]*),(.*)/i;
function st(e, t) {
  return (e || "").replace(
    $n,
    (r, l, s, c, h, m) => {
      const o = s || h || m, p = l || c || "";
      if (!o)
        return r;
      if (zn.test(o) || Bn.test(o))
        return `url(${p}${o}${p})`;
      if (Wn.test(o))
        return `url(${p}${o}${p})`;
      if (o[0] === "/")
        return `url(${p}${Fn(t) + o}${p})`;
      const i = o.split("#")[0], f = o.substring(i.length), a = t.split("#")[0].split("/"), n = i.split("/");
      a.pop();
      for (const d of n)
        d !== "." && (d === ".." ? a.pop() : a.push(d));
      return `url(${p}${a.join("/")}${f}${p})`;
    }
  );
}
function je(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function qn(e, t, r = !1) {
  const l = Array.from(t.childNodes), s = [];
  let c = 0;
  if (l.length > 1 && e && typeof e == "string") {
    let h = je(e, r);
    const m = h.length / e.length;
    for (let o = 1; o < l.length; o++)
      if (l[o].textContent && typeof l[o].textContent == "string") {
        const p = je(
          l[o].textContent,
          r
        ), i = 100;
        let f = 3;
        for (; f < p.length && // keep consuming css identifiers (to get a decent chunk more quickly)
        (p[f].match(/[a-zA-Z0-9]/) || // substring needs to be unique to this section
        p.indexOf(p.substring(0, f), 1) !== -1); f++)
          ;
        for (; f < p.length; f++) {
          let a = p.substring(0, f), n = h.split(a), d = -1;
          if (n.length === 2)
            d = n[0].length;
          else if (n.length > 2 && n[0] === "" && l[o - 1].textContent !== "")
            d = h.indexOf(a, 1);
          else if (n.length === 1) {
            if (a = a.substring(
              0,
              a.length - 1
            ), n = h.split(a), n.length <= 1)
              return s.push(e), s;
            f = i + 1;
          } else f === p.length - 1 && (d = h.indexOf(a));
          if (n.length >= 2 && f > i) {
            const u = l[o - 1].textContent;
            if (u && typeof u == "string") {
              const g = je(u).length;
              d = h.indexOf(a, g);
            }
            d === -1 && (d = n[0].length);
          }
          if (d !== -1) {
            let u = Math.floor(d / m);
            for (; u > 0 && u < e.length; ) {
              if (c += 1, c > 50 * l.length)
                return s.push(e), s;
              const g = je(
                e.substring(0, u),
                r
              );
              if (g.length === d) {
                s.push(e.substring(0, u)), e = e.substring(u), h = h.substring(d);
                break;
              } else g.length < d ? u += Math.max(
                1,
                Math.floor((d - g.length) / m)
              ) : u -= Math.max(
                1,
                Math.floor((g.length - d) * m)
              );
            }
            break;
          }
        }
      }
  }
  return s.push(e), s;
}
function jn(e, t) {
  return qn(e, t).join("/* rr_split */");
}
let Hn = 1;
const Vn = new RegExp("[^a-z0-9-_:]"), Ue = -2;
function Oi() {
  return Hn++;
}
function Gn(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = ve(e.tagName);
  return Vn.test(t) ? "div" : t;
}
let Me, Kr;
const Jn = /^[^ \t\n\r\u000c]+/, Yn = /^[, \t\n\r\u000c]+/;
function Qn(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function l(c) {
    let h;
    const m = c.exec(t.substring(r));
    return m ? (h = m[0], r += h.length, h) : "";
  }
  const s = [];
  for (; l(Yn), !(r >= t.length); ) {
    let c = l(Jn);
    if (c.slice(-1) === ",")
      c = Ae(e, c.substring(0, c.length - 1)), s.push(c);
    else {
      let h = "";
      c = Ae(e, c);
      let m = !1;
      for (; ; ) {
        const o = t.charAt(r);
        if (o === "") {
          s.push((c + h).trim());
          break;
        } else if (m)
          o === ")" && (m = !1);
        else if (o === ",") {
          r += 1, s.push((c + h).trim());
          break;
        } else o === "(" && (m = !0);
        h += o, r += 1;
      }
    }
  }
  return s.join(", ");
}
const Zr = /* @__PURE__ */ new WeakMap();
function Ae(e, t) {
  return !t || t.trim() === "" ? t : Nr(e, t);
}
function Xn(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function Nr(e, t) {
  let r = Zr.get(e);
  if (r || (r = e.createElement("a"), Zr.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function Mi(e, t, r, l) {
  return l && (r === "src" || r === "href" && !(t === "use" && l[0] === "#") || r === "xlink:href" && l[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? Ae(e, l) : r === "srcset" ? Qn(e, l) : r === "style" ? st(l, Nr(e)) : t === "object" && r === "data" ? Ae(e, l) : l);
}
function Ei(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function Kn(e, t, r) {
  try {
    if (typeof t == "string") {
      if (e.classList.contains(t))
        return !0;
    } else
      for (let l = e.classList.length; l--; ) {
        const s = e.classList[l];
        if (t.test(s))
          return !0;
      }
    if (r)
      return e.matches(r);
  } catch {
  }
  return !1;
}
function it(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? it(K.parentNode(e), t, r) : !1;
  for (let l = e.classList.length; l--; ) {
    const s = e.classList[l];
    if (t.test(s))
      return !0;
  }
  return r ? it(K.parentNode(e), t, r) : !1;
}
function Ii(e, t, r, l) {
  let s;
  if (vi(e)) {
    if (s = e, !K.childNodes(s).length)
      return !1;
  } else {
    if (K.parentElement(e) === null)
      return !1;
    s = K.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (l) {
        if (s.closest(`.${t}`)) return !0;
      } else if (s.classList.contains(t)) return !0;
    } else if (it(s, t, l)) return !0;
    if (r) {
      if (l) {
        if (s.closest(r)) return !0;
      } else if (s.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function Zn(e, t, r) {
  const l = e.contentWindow;
  if (!l)
    return;
  let s = !1, c;
  try {
    c = l.document.readyState;
  } catch {
    return;
  }
  if (c !== "complete") {
    const m = setTimeout(() => {
      s || (t(), s = !0);
    }, r);
    e.addEventListener("load", () => {
      clearTimeout(m), s = !0, t();
    });
    return;
  }
  const h = "about:blank";
  if (l.location.href !== h || e.src === h || e.src === "")
    return setTimeout(t, 0), e.addEventListener("load", t);
  e.addEventListener("load", t);
}
function eo(e, t, r) {
  let l = !1, s;
  try {
    s = e.sheet;
  } catch {
    return;
  }
  if (s) return;
  const c = setTimeout(() => {
    l || (t(), l = !0);
  }, r);
  e.addEventListener("load", () => {
    clearTimeout(c), l = !0, t();
  });
}
function to(e, t) {
  const {
    doc: r,
    mirror: l,
    blockClass: s,
    blockSelector: c,
    needsMask: h,
    inlineStylesheet: m,
    maskInputOptions: o = {},
    maskTextFn: p,
    maskInputFn: i,
    dataURLOptions: f = {},
    inlineImages: a,
    recordCanvas: n,
    keepIframeSrcFn: d,
    newlyAddedElement: u = !1,
    cssCaptured: g = !1
  } = t, v = ro(r, l);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: Q.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: Q.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: Q.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: v
      };
    case e.ELEMENT_NODE:
      return io(e, {
        doc: r,
        blockClass: s,
        blockSelector: c,
        inlineStylesheet: m,
        maskInputOptions: o,
        maskInputFn: i,
        dataURLOptions: f,
        inlineImages: a,
        recordCanvas: n,
        keepIframeSrcFn: d,
        newlyAddedElement: u,
        rootId: v
      });
    case e.TEXT_NODE:
      return so(e, {
        doc: r,
        needsMask: h,
        maskTextFn: p,
        rootId: v,
        cssCaptured: g
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: Q.CDATA,
        textContent: "",
        rootId: v
      };
    case e.COMMENT_NODE:
      return {
        type: Q.Comment,
        textContent: K.textContent(e) || "",
        rootId: v
      };
    default:
      return !1;
  }
}
function ro(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function so(e, t) {
  const { needsMask: r, maskTextFn: l, rootId: s, cssCaptured: c } = t, h = K.parentNode(e), m = h && h.tagName;
  let o = "";
  const p = m === "STYLE" ? !0 : void 0, i = m === "SCRIPT" ? !0 : void 0;
  return i ? o = "SCRIPT_PLACEHOLDER" : c || (o = K.textContent(e), p && o && (o = st(o, Nr(t.doc)))), !p && !i && o && r && (o = l ? l(o, K.parentElement(e)) : o.replace(/[\S]/g, "*")), {
    type: Q.Text,
    textContent: o || "",
    rootId: s
  };
}
function io(e, t) {
  const {
    doc: r,
    blockClass: l,
    blockSelector: s,
    inlineStylesheet: c,
    maskInputOptions: h = {},
    maskInputFn: m,
    dataURLOptions: o = {},
    inlineImages: p,
    recordCanvas: i,
    keepIframeSrcFn: f,
    newlyAddedElement: a = !1,
    rootId: n
  } = t, d = Kn(e, l, s), u = Gn(e);
  let g = {};
  const v = e.attributes.length;
  for (let S = 0; S < v; S++) {
    const x = e.attributes[S];
    Ei(u, x.name, x.value) || (g[x.name] = Mi(
      r,
      u,
      ve(x.name),
      x.value
    ));
  }
  if (u === "link" && c) {
    const S = Array.from(r.styleSheets).find((w) => w.href === e.href);
    let x = null;
    S && (x = Or(S)), x && (delete g.rel, delete g.href, g._cssText = x);
  }
  if (u === "style" && e.sheet) {
    let S = Or(
      e.sheet
    );
    S && (e.childNodes.length > 1 && (S = jn(S, e)), g._cssText = S);
  }
  if (["input", "textarea", "select"].includes(u)) {
    const S = e.value, x = e.checked;
    g.type !== "radio" && g.type !== "checkbox" && g.type !== "submit" && g.type !== "button" && S ? g.value = tt({
      element: e,
      type: rt(e),
      tagName: u,
      value: S,
      maskInputOptions: h,
      maskInputFn: m
    }) : x && (g.checked = x);
  }
  if (u === "option" && (e.selected && !h.select ? g.selected = !0 : delete g.selected), u === "dialog" && e.open && (g.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), u === "canvas" && i) {
    if (e.__context === "2d")
      Un(e) || (g.rr_dataURL = e.toDataURL(
        o.type,
        o.quality
      ));
    else if (!("__context" in e)) {
      const S = e.toDataURL(
        o.type,
        o.quality
      ), x = r.createElement("canvas");
      x.width = e.width, x.height = e.height;
      const w = x.toDataURL(
        o.type,
        o.quality
      );
      S !== w && (g.rr_dataURL = S);
    }
  }
  if (u === "img" && p) {
    Me || (Me = r.createElement("canvas"), Kr = Me.getContext("2d"));
    const S = e, x = S.currentSrc || S.getAttribute("src") || "<unknown-src>", w = S.crossOrigin, y = () => {
      S.removeEventListener("load", y);
      try {
        Me.width = S.naturalWidth, Me.height = S.naturalHeight, Kr.drawImage(S, 0, 0), g.rr_dataURL = Me.toDataURL(
          o.type,
          o.quality
        );
      } catch (C) {
        if (S.crossOrigin !== "anonymous") {
          S.crossOrigin = "anonymous", S.complete && S.naturalWidth !== 0 ? y() : S.addEventListener("load", y);
          return;
        } else
          console.warn(
            `Cannot inline img src=${x}! Error: ${C}`
          );
      }
      S.crossOrigin === "anonymous" && (w ? g.crossOrigin = w : S.removeAttribute("crossorigin"));
    };
    S.complete && S.naturalWidth !== 0 ? y() : S.addEventListener("load", y);
  }
  if (["audio", "video"].includes(u)) {
    const S = g;
    S.rr_mediaState = e.paused ? "paused" : "played", S.rr_mediaCurrentTime = e.currentTime, S.rr_mediaPlaybackRate = e.playbackRate, S.rr_mediaMuted = e.muted, S.rr_mediaLoop = e.loop, S.rr_mediaVolume = e.volume;
  }
  if (a || (e.scrollLeft && (g.rr_scrollLeft = e.scrollLeft), e.scrollTop && (g.rr_scrollTop = e.scrollTop)), d) {
    const { width: S, height: x } = e.getBoundingClientRect();
    g = {
      class: g.class,
      rr_width: `${S}px`,
      rr_height: `${x}px`
    };
  }
  u === "iframe" && !f(g.src) && (e.contentDocument || (g.rr_src = g.src), delete g.src);
  let b;
  try {
    customElements.get(u) && (b = !0);
  } catch {
  }
  return {
    type: Q.Element,
    tagName: u,
    attributes: g,
    childNodes: [],
    isSVG: Xn(e) || void 0,
    needBlock: d,
    rootId: n,
    isCustom: b
  };
}
function W(e) {
  return e == null ? "" : e.toLowerCase();
}
function Ai(e) {
  return e === !0 || e === "all" ? {
    script: !0,
    comment: !0,
    headFavicon: !0,
    headWhitespace: !0,
    headMetaSocial: !0,
    headMetaRobots: !0,
    headMetaHttpEquiv: !0,
    headMetaVerification: !0,
    // the following are off for slimDOMOptions === true,
    // as they destroy some (hidden) info:
    headMetaAuthorship: e === "all",
    headMetaDescKeywords: e === "all",
    headTitleMutations: e === "all"
  } : e || {};
}
function no(e, t) {
  if (t.comment && e.type === Q.Comment)
    return !0;
  if (e.type === Q.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && Ri(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (W(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || W(e.attributes.name) === "application-name" || W(e.attributes.rel) === "icon" || W(e.attributes.rel) === "apple-touch-icon" || W(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && W(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (W(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      W(e.attributes.name).match(/^(og|twitter):/) || W(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (W(e.attributes.name) === "robots" || W(e.attributes.name) === "googlebot" || W(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (W(e.attributes.name) === "author" || W(e.attributes.name) === "generator" || W(e.attributes.name) === "framework" || W(e.attributes.name) === "publisher" || W(e.attributes.name) === "progid" || W(e.attributes.property).match(/^article:/) || W(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (W(e.attributes.name) === "google-site-verification" || W(e.attributes.name) === "yandex-verification" || W(e.attributes.name) === "csrf-token" || W(e.attributes.name) === "p:domain_verify" || W(e.attributes.name) === "verify-v1" || W(e.attributes.name) === "verification" || W(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function Ne(e, t) {
  const {
    doc: r,
    mirror: l,
    blockClass: s,
    blockSelector: c,
    maskTextClass: h,
    maskTextSelector: m,
    skipChild: o = !1,
    inlineStylesheet: p = !0,
    maskInputOptions: i = {},
    maskTextFn: f,
    maskInputFn: a,
    slimDOMOptions: n,
    dataURLOptions: d = {},
    inlineImages: u = !1,
    recordCanvas: g = !1,
    onSerialize: v,
    onIframeLoad: b,
    iframeLoadTimeout: S = 5e3,
    onStylesheetLoad: x,
    stylesheetLoadTimeout: w = 5e3,
    keepIframeSrcFn: y = () => !1,
    newlyAddedElement: C = !1,
    cssCaptured: O = !1
  } = t;
  let { needsMask: I } = t, { preserveWhiteSpace: M = !0 } = t;
  I || (I = Ii(
    e,
    h,
    m,
    I === void 0
  ));
  const P = to(e, {
    doc: r,
    mirror: l,
    blockClass: s,
    blockSelector: c,
    needsMask: I,
    inlineStylesheet: p,
    maskInputOptions: i,
    maskTextFn: f,
    maskInputFn: a,
    dataURLOptions: d,
    inlineImages: u,
    recordCanvas: g,
    keepIframeSrcFn: y,
    newlyAddedElement: C,
    cssCaptured: O
  });
  if (!P)
    return console.warn(e, "not serialized"), null;
  let N;
  l.hasNode(e) ? N = l.getId(e) : no(P, n) || !M && P.type === Q.Text && !P.textContent.replace(/^\s+|\s+$/gm, "").length ? N = Ue : N = Oi();
  const R = Object.assign(P, { id: N });
  if (l.add(e, R), N === Ue)
    return null;
  v && v(e);
  let ae = !o;
  if (R.type === Q.Element) {
    ae = ae && !R.needBlock, delete R.needBlock;
    const F = K.shadowRoot(e);
    F && De(F) && (R.isShadowHost = !0);
  }
  if ((R.type === Q.Document || R.type === Q.Element) && ae) {
    n.headWhitespace && R.type === Q.Element && R.tagName === "head" && (M = !1);
    const F = {
      doc: r,
      mirror: l,
      blockClass: s,
      blockSelector: c,
      needsMask: I,
      maskTextClass: h,
      maskTextSelector: m,
      skipChild: o,
      inlineStylesheet: p,
      maskInputOptions: i,
      maskTextFn: f,
      maskInputFn: a,
      slimDOMOptions: n,
      dataURLOptions: d,
      inlineImages: u,
      recordCanvas: g,
      preserveWhiteSpace: M,
      onSerialize: v,
      onIframeLoad: b,
      iframeLoadTimeout: S,
      onStylesheetLoad: x,
      stylesheetLoadTimeout: w,
      keepIframeSrcFn: y,
      cssCaptured: !1
    };
    if (!(R.type === Q.Element && R.tagName === "textarea" && R.attributes.value !== void 0)) {
      R.type === Q.Element && R.attributes._cssText !== void 0 && typeof R.attributes._cssText == "string" && (F.cssCaptured = !0);
      for (const G of Array.from(K.childNodes(e))) {
        const X = Ne(G, F);
        X && R.childNodes.push(X);
      }
    }
    let U = null;
    if (vi(e) && (U = K.shadowRoot(e)))
      for (const G of Array.from(K.childNodes(U))) {
        const X = Ne(G, F);
        X && (De(U) && (X.isShadow = !0), R.childNodes.push(X));
      }
  }
  const se = K.parentNode(e);
  return se && Le(se) && De(se) && (R.isShadow = !0), R.type === Q.Element && R.tagName === "iframe" && Zn(
    e,
    () => {
      const F = e.contentDocument;
      if (F && b) {
        const U = Ne(F, {
          doc: F,
          mirror: l,
          blockClass: s,
          blockSelector: c,
          needsMask: I,
          maskTextClass: h,
          maskTextSelector: m,
          skipChild: !1,
          inlineStylesheet: p,
          maskInputOptions: i,
          maskTextFn: f,
          maskInputFn: a,
          slimDOMOptions: n,
          dataURLOptions: d,
          inlineImages: u,
          recordCanvas: g,
          preserveWhiteSpace: M,
          onSerialize: v,
          onIframeLoad: b,
          iframeLoadTimeout: S,
          onStylesheetLoad: x,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: y
        });
        U && b(
          e,
          U
        );
      }
    },
    S
  ), R.type === Q.Element && R.tagName === "link" && typeof R.attributes.rel == "string" && (R.attributes.rel === "stylesheet" || R.attributes.rel === "preload" && typeof R.attributes.href == "string" && Ri(R.attributes.href) === "css") && eo(
    e,
    () => {
      if (x) {
        const F = Ne(e, {
          doc: r,
          mirror: l,
          blockClass: s,
          blockSelector: c,
          needsMask: I,
          maskTextClass: h,
          maskTextSelector: m,
          skipChild: !1,
          inlineStylesheet: p,
          maskInputOptions: i,
          maskTextFn: f,
          maskInputFn: a,
          slimDOMOptions: n,
          dataURLOptions: d,
          inlineImages: u,
          recordCanvas: g,
          preserveWhiteSpace: M,
          onSerialize: v,
          onIframeLoad: b,
          iframeLoadTimeout: S,
          onStylesheetLoad: x,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: y
        });
        F && x(
          e,
          F
        );
      }
    },
    w
  ), R;
}
function oo(e, t) {
  const {
    mirror: r = new xi(),
    blockClass: l = "rr-block",
    blockSelector: s = null,
    maskTextClass: c = "rr-mask",
    maskTextSelector: h = null,
    inlineStylesheet: m = !0,
    inlineImages: o = !1,
    recordCanvas: p = !1,
    maskAllInputs: i = !1,
    maskTextFn: f,
    maskInputFn: a,
    slimDOM: n = !1,
    dataURLOptions: d,
    preserveWhiteSpace: u,
    onSerialize: g,
    onIframeLoad: v,
    iframeLoadTimeout: b,
    onStylesheetLoad: S,
    stylesheetLoadTimeout: x,
    keepIframeSrcFn: w = () => !1
  } = t, y = i === !0 ? {
    color: !0,
    date: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
    textarea: !0,
    select: !0,
    password: !0
  } : i === !1 ? {
    password: !0
  } : i, C = Ai(n);
  return Ne(e, {
    doc: e,
    mirror: r,
    blockClass: l,
    blockSelector: s,
    maskTextClass: c,
    maskTextSelector: h,
    skipChild: !1,
    inlineStylesheet: m,
    maskInputOptions: y,
    maskTextFn: f,
    maskInputFn: a,
    slimDOMOptions: C,
    dataURLOptions: d,
    inlineImages: o,
    recordCanvas: p,
    preserveWhiteSpace: u,
    onSerialize: g,
    onIframeLoad: v,
    iframeLoadTimeout: b,
    onStylesheetLoad: S,
    stylesheetLoadTimeout: x,
    keepIframeSrcFn: w,
    newlyAddedElement: !1
  });
}
function ao(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function lo(e) {
  if (e.__esModule) return e;
  var t = e.default;
  if (typeof t == "function") {
    var r = function l() {
      return this instanceof l ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    r.prototype = t.prototype;
  } else r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(e).forEach(function(l) {
    var s = Object.getOwnPropertyDescriptor(e, l);
    Object.defineProperty(r, l, s.get ? s : {
      enumerable: !0,
      get: function() {
        return e[l];
      }
    });
  }), r;
}
var He = { exports: {} }, es;
function uo() {
  if (es) return He.exports;
  es = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return He.exports = t(), He.exports.createColors = t, He.exports;
}
const co = {}, fo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: co
}, Symbol.toStringTag, { value: "Module" })), ce = /* @__PURE__ */ lo(fo);
var vt, ts;
function Pr() {
  if (ts) return vt;
  ts = 1;
  let e = /* @__PURE__ */ uo(), t = ce;
  class r extends Error {
    constructor(s, c, h, m, o, p) {
      super(s), this.name = "CssSyntaxError", this.reason = s, o && (this.file = o), m && (this.source = m), p && (this.plugin = p), typeof c < "u" && typeof h < "u" && (typeof c == "number" ? (this.line = c, this.column = h) : (this.line = c.line, this.column = c.column, this.endLine = h.line, this.endColumn = h.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(s) {
      if (!this.source) return "";
      let c = this.source;
      s == null && (s = e.isColorSupported), t && s && (c = t(c));
      let h = c.split(/\r?\n/), m = Math.max(this.line - 3, 0), o = Math.min(this.line + 2, h.length), p = String(o).length, i, f;
      if (s) {
        let { bold: a, gray: n, red: d } = e.createColors(!0);
        i = (u) => a(d(u)), f = (u) => n(u);
      } else
        i = f = (a) => a;
      return h.slice(m, o).map((a, n) => {
        let d = m + 1 + n, u = " " + (" " + d).slice(-p) + " | ";
        if (d === this.line) {
          let g = f(u.replace(/\d/g, " ")) + a.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return i(">") + f(u) + a + `
 ` + g + i("^");
        }
        return " " + f(u) + a;
      }).join(`
`);
    }
    toString() {
      let s = this.showSourceCode();
      return s && (s = `

` + s + `
`), this.name + ": " + this.message + s;
    }
  }
  return vt = r, r.default = r, vt;
}
var Ve = {}, rs;
function kr() {
  return rs || (rs = 1, Ve.isClean = Symbol("isClean"), Ve.my = Symbol("my")), Ve;
}
var Ct, ss;
function Ni() {
  if (ss) return Ct;
  ss = 1;
  const e = {
    after: `
`,
    beforeClose: `
`,
    beforeComment: `
`,
    beforeDecl: `
`,
    beforeOpen: " ",
    beforeRule: `
`,
    colon: ": ",
    commentLeft: " ",
    commentRight: " ",
    emptyBody: "",
    indent: "    ",
    semicolon: !1
  };
  function t(l) {
    return l[0].toUpperCase() + l.slice(1);
  }
  class r {
    constructor(s) {
      this.builder = s;
    }
    atrule(s, c) {
      let h = "@" + s.name, m = s.params ? this.rawValue(s, "params") : "";
      if (typeof s.raws.afterName < "u" ? h += s.raws.afterName : m && (h += " "), s.nodes)
        this.block(s, h + m);
      else {
        let o = (s.raws.between || "") + (c ? ";" : "");
        this.builder(h + m + o, s);
      }
    }
    beforeAfter(s, c) {
      let h;
      s.type === "decl" ? h = this.raw(s, null, "beforeDecl") : s.type === "comment" ? h = this.raw(s, null, "beforeComment") : c === "before" ? h = this.raw(s, null, "beforeRule") : h = this.raw(s, null, "beforeClose");
      let m = s.parent, o = 0;
      for (; m && m.type !== "root"; )
        o += 1, m = m.parent;
      if (h.includes(`
`)) {
        let p = this.raw(s, null, "indent");
        if (p.length)
          for (let i = 0; i < o; i++) h += p;
      }
      return h;
    }
    block(s, c) {
      let h = this.raw(s, "between", "beforeOpen");
      this.builder(c + h + "{", s, "start");
      let m;
      s.nodes && s.nodes.length ? (this.body(s), m = this.raw(s, "after")) : m = this.raw(s, "after", "emptyBody"), m && this.builder(m), this.builder("}", s, "end");
    }
    body(s) {
      let c = s.nodes.length - 1;
      for (; c > 0 && s.nodes[c].type === "comment"; )
        c -= 1;
      let h = this.raw(s, "semicolon");
      for (let m = 0; m < s.nodes.length; m++) {
        let o = s.nodes[m], p = this.raw(o, "before");
        p && this.builder(p), this.stringify(o, c !== m || h);
      }
    }
    comment(s) {
      let c = this.raw(s, "left", "commentLeft"), h = this.raw(s, "right", "commentRight");
      this.builder("/*" + c + s.text + h + "*/", s);
    }
    decl(s, c) {
      let h = this.raw(s, "between", "colon"), m = s.prop + h + this.rawValue(s, "value");
      s.important && (m += s.raws.important || " !important"), c && (m += ";"), this.builder(m, s);
    }
    document(s) {
      this.body(s);
    }
    raw(s, c, h) {
      let m;
      if (h || (h = c), c && (m = s.raws[c], typeof m < "u"))
        return m;
      let o = s.parent;
      if (h === "before" && (!o || o.type === "root" && o.first === s || o && o.type === "document"))
        return "";
      if (!o) return e[h];
      let p = s.root();
      if (p.rawCache || (p.rawCache = {}), typeof p.rawCache[h] < "u")
        return p.rawCache[h];
      if (h === "before" || h === "after")
        return this.beforeAfter(s, h);
      {
        let i = "raw" + t(h);
        this[i] ? m = this[i](p, s) : p.walk((f) => {
          if (m = f.raws[c], typeof m < "u") return !1;
        });
      }
      return typeof m > "u" && (m = e[h]), p.rawCache[h] = m, m;
    }
    rawBeforeClose(s) {
      let c;
      return s.walk((h) => {
        if (h.nodes && h.nodes.length > 0 && typeof h.raws.after < "u")
          return c = h.raws.after, c.includes(`
`) && (c = c.replace(/[^\n]+$/, "")), !1;
      }), c && (c = c.replace(/\S/g, "")), c;
    }
    rawBeforeComment(s, c) {
      let h;
      return s.walkComments((m) => {
        if (typeof m.raws.before < "u")
          return h = m.raws.before, h.includes(`
`) && (h = h.replace(/[^\n]+$/, "")), !1;
      }), typeof h > "u" ? h = this.raw(c, null, "beforeDecl") : h && (h = h.replace(/\S/g, "")), h;
    }
    rawBeforeDecl(s, c) {
      let h;
      return s.walkDecls((m) => {
        if (typeof m.raws.before < "u")
          return h = m.raws.before, h.includes(`
`) && (h = h.replace(/[^\n]+$/, "")), !1;
      }), typeof h > "u" ? h = this.raw(c, null, "beforeRule") : h && (h = h.replace(/\S/g, "")), h;
    }
    rawBeforeOpen(s) {
      let c;
      return s.walk((h) => {
        if (h.type !== "decl" && (c = h.raws.between, typeof c < "u"))
          return !1;
      }), c;
    }
    rawBeforeRule(s) {
      let c;
      return s.walk((h) => {
        if (h.nodes && (h.parent !== s || s.first !== h) && typeof h.raws.before < "u")
          return c = h.raws.before, c.includes(`
`) && (c = c.replace(/[^\n]+$/, "")), !1;
      }), c && (c = c.replace(/\S/g, "")), c;
    }
    rawColon(s) {
      let c;
      return s.walkDecls((h) => {
        if (typeof h.raws.between < "u")
          return c = h.raws.between.replace(/[^\s:]/g, ""), !1;
      }), c;
    }
    rawEmptyBody(s) {
      let c;
      return s.walk((h) => {
        if (h.nodes && h.nodes.length === 0 && (c = h.raws.after, typeof c < "u"))
          return !1;
      }), c;
    }
    rawIndent(s) {
      if (s.raws.indent) return s.raws.indent;
      let c;
      return s.walk((h) => {
        let m = h.parent;
        if (m && m !== s && m.parent && m.parent === s && typeof h.raws.before < "u") {
          let o = h.raws.before.split(`
`);
          return c = o[o.length - 1], c = c.replace(/\S/g, ""), !1;
        }
      }), c;
    }
    rawSemicolon(s) {
      let c;
      return s.walk((h) => {
        if (h.nodes && h.nodes.length && h.last.type === "decl" && (c = h.raws.semicolon, typeof c < "u"))
          return !1;
      }), c;
    }
    rawValue(s, c) {
      let h = s[c], m = s.raws[c];
      return m && m.value === h ? m.raw : h;
    }
    root(s) {
      this.body(s), s.raws.after && this.builder(s.raws.after);
    }
    rule(s) {
      this.block(s, this.rawValue(s, "selector")), s.raws.ownSemicolon && this.builder(s.raws.ownSemicolon, s, "end");
    }
    stringify(s, c) {
      if (!this[s.type])
        throw new Error(
          "Unknown AST node type " + s.type + ". Maybe you need to change PostCSS stringifier."
        );
      this[s.type](s, c);
    }
  }
  return Ct = r, r.default = r, Ct;
}
var xt, is;
function at() {
  if (is) return xt;
  is = 1;
  let e = Ni();
  function t(r, l) {
    new e(l).stringify(r);
  }
  return xt = t, t.default = t, xt;
}
var Rt, ns;
function lt() {
  if (ns) return Rt;
  ns = 1;
  let { isClean: e, my: t } = kr(), r = Pr(), l = Ni(), s = at();
  function c(m, o) {
    let p = new m.constructor();
    for (let i in m) {
      if (!Object.prototype.hasOwnProperty.call(m, i) || i === "proxyCache") continue;
      let f = m[i], a = typeof f;
      i === "parent" && a === "object" ? o && (p[i] = o) : i === "source" ? p[i] = f : Array.isArray(f) ? p[i] = f.map((n) => c(n, p)) : (a === "object" && f !== null && (f = c(f)), p[i] = f);
    }
    return p;
  }
  class h {
    constructor(o = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let p in o)
        if (p === "nodes") {
          this.nodes = [];
          for (let i of o[p])
            typeof i.clone == "function" ? this.append(i.clone()) : this.append(i);
        } else
          this[p] = o[p];
    }
    addToError(o) {
      if (o.postcssNode = this, o.stack && this.source && /\n\s{4}at /.test(o.stack)) {
        let p = this.source;
        o.stack = o.stack.replace(
          /\n\s{4}at /,
          `$&${p.input.from}:${p.start.line}:${p.start.column}$&`
        );
      }
      return o;
    }
    after(o) {
      return this.parent.insertAfter(this, o), this;
    }
    assign(o = {}) {
      for (let p in o)
        this[p] = o[p];
      return this;
    }
    before(o) {
      return this.parent.insertBefore(this, o), this;
    }
    cleanRaws(o) {
      delete this.raws.before, delete this.raws.after, o || delete this.raws.between;
    }
    clone(o = {}) {
      let p = c(this);
      for (let i in o)
        p[i] = o[i];
      return p;
    }
    cloneAfter(o = {}) {
      let p = this.clone(o);
      return this.parent.insertAfter(this, p), p;
    }
    cloneBefore(o = {}) {
      let p = this.clone(o);
      return this.parent.insertBefore(this, p), p;
    }
    error(o, p = {}) {
      if (this.source) {
        let { end: i, start: f } = this.rangeBy(p);
        return this.source.input.error(
          o,
          { column: f.column, line: f.line },
          { column: i.column, line: i.line },
          p
        );
      }
      return new r(o);
    }
    getProxyProcessor() {
      return {
        get(o, p) {
          return p === "proxyOf" ? o : p === "root" ? () => o.root().toProxy() : o[p];
        },
        set(o, p, i) {
          return o[p] === i || (o[p] = i, (p === "prop" || p === "value" || p === "name" || p === "params" || p === "important" || /* c8 ignore next */
          p === "text") && o.markDirty()), !0;
        }
      };
    }
    markDirty() {
      if (this[e]) {
        this[e] = !1;
        let o = this;
        for (; o = o.parent; )
          o[e] = !1;
      }
    }
    next() {
      if (!this.parent) return;
      let o = this.parent.index(this);
      return this.parent.nodes[o + 1];
    }
    positionBy(o, p) {
      let i = this.source.start;
      if (o.index)
        i = this.positionInside(o.index, p);
      else if (o.word) {
        p = this.toString();
        let f = p.indexOf(o.word);
        f !== -1 && (i = this.positionInside(f, p));
      }
      return i;
    }
    positionInside(o, p) {
      let i = p || this.toString(), f = this.source.start.column, a = this.source.start.line;
      for (let n = 0; n < o; n++)
        i[n] === `
` ? (f = 1, a += 1) : f += 1;
      return { column: f, line: a };
    }
    prev() {
      if (!this.parent) return;
      let o = this.parent.index(this);
      return this.parent.nodes[o - 1];
    }
    rangeBy(o) {
      let p = {
        column: this.source.start.column,
        line: this.source.start.line
      }, i = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: p.column + 1,
        line: p.line
      };
      if (o.word) {
        let f = this.toString(), a = f.indexOf(o.word);
        a !== -1 && (p = this.positionInside(a, f), i = this.positionInside(a + o.word.length, f));
      } else
        o.start ? p = {
          column: o.start.column,
          line: o.start.line
        } : o.index && (p = this.positionInside(o.index)), o.end ? i = {
          column: o.end.column,
          line: o.end.line
        } : typeof o.endIndex == "number" ? i = this.positionInside(o.endIndex) : o.index && (i = this.positionInside(o.index + 1));
      return (i.line < p.line || i.line === p.line && i.column <= p.column) && (i = { column: p.column + 1, line: p.line }), { end: i, start: p };
    }
    raw(o, p) {
      return new l().raw(this, o, p);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...o) {
      if (this.parent) {
        let p = this, i = !1;
        for (let f of o)
          f === this ? i = !0 : i ? (this.parent.insertAfter(p, f), p = f) : this.parent.insertBefore(p, f);
        i || this.remove();
      }
      return this;
    }
    root() {
      let o = this;
      for (; o.parent && o.parent.type !== "document"; )
        o = o.parent;
      return o;
    }
    toJSON(o, p) {
      let i = {}, f = p == null;
      p = p || /* @__PURE__ */ new Map();
      let a = 0;
      for (let n in this) {
        if (!Object.prototype.hasOwnProperty.call(this, n) || n === "parent" || n === "proxyCache") continue;
        let d = this[n];
        if (Array.isArray(d))
          i[n] = d.map((u) => typeof u == "object" && u.toJSON ? u.toJSON(null, p) : u);
        else if (typeof d == "object" && d.toJSON)
          i[n] = d.toJSON(null, p);
        else if (n === "source") {
          let u = p.get(d.input);
          u == null && (u = a, p.set(d.input, a), a++), i[n] = {
            end: d.end,
            inputId: u,
            start: d.start
          };
        } else
          i[n] = d;
      }
      return f && (i.inputs = [...p.keys()].map((n) => n.toJSON())), i;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(o = s) {
      o.stringify && (o = o.stringify);
      let p = "";
      return o(this, (i) => {
        p += i;
      }), p;
    }
    warn(o, p, i) {
      let f = { node: this };
      for (let a in i) f[a] = i[a];
      return o.warn(p, f);
    }
    get proxyOf() {
      return this;
    }
  }
  return Rt = h, h.default = h, Rt;
}
var Ot, os;
function ut() {
  if (os) return Ot;
  os = 1;
  let e = lt();
  class t extends e {
    constructor(l) {
      l && typeof l.value < "u" && typeof l.value != "string" && (l = { ...l, value: String(l.value) }), super(l), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Ot = t, t.default = t, Ot;
}
var Mt, as;
function ho() {
  if (as) return Mt;
  as = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Mt = { nanoid: (l = 21) => {
    let s = "", c = l;
    for (; c--; )
      s += e[Math.random() * 64 | 0];
    return s;
  }, customAlphabet: (l, s = 21) => (c = s) => {
    let h = "", m = c;
    for (; m--; )
      h += l[Math.random() * l.length | 0];
    return h;
  } }, Mt;
}
var Et, ls;
function Pi() {
  if (ls) return Et;
  ls = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ce, { existsSync: r, readFileSync: l } = ce, { dirname: s, join: c } = ce;
  function h(o) {
    return Buffer ? Buffer.from(o, "base64").toString() : window.atob(o);
  }
  class m {
    constructor(p, i) {
      if (i.map === !1) return;
      this.loadAnnotation(p), this.inline = this.startWith(this.annotation, "data:");
      let f = i.map ? i.map.prev : void 0, a = this.loadMap(i.from, f);
      !this.mapFile && i.from && (this.mapFile = i.from), this.mapFile && (this.root = s(this.mapFile)), a && (this.text = a);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(p) {
      let i = /^data:application\/json;charset=utf-?8;base64,/, f = /^data:application\/json;base64,/, a = /^data:application\/json;charset=utf-?8,/, n = /^data:application\/json,/;
      if (a.test(p) || n.test(p))
        return decodeURIComponent(p.substr(RegExp.lastMatch.length));
      if (i.test(p) || f.test(p))
        return h(p.substr(RegExp.lastMatch.length));
      let d = p.match(/data:application\/json;([^,]+),/)[1];
      throw new Error("Unsupported source map encoding " + d);
    }
    getAnnotationURL(p) {
      return p.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    }
    isMap(p) {
      return typeof p != "object" ? !1 : typeof p.mappings == "string" || typeof p._mappings == "string" || Array.isArray(p.sections);
    }
    loadAnnotation(p) {
      let i = p.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!i) return;
      let f = p.lastIndexOf(i.pop()), a = p.indexOf("*/", f);
      f > -1 && a > -1 && (this.annotation = this.getAnnotationURL(p.substring(f, a)));
    }
    loadFile(p) {
      if (this.root = s(p), r(p))
        return this.mapFile = p, l(p, "utf-8").toString().trim();
    }
    loadMap(p, i) {
      if (i === !1) return !1;
      if (i) {
        if (typeof i == "string")
          return i;
        if (typeof i == "function") {
          let f = i(p);
          if (f) {
            let a = this.loadFile(f);
            if (!a)
              throw new Error(
                "Unable to load previous source map: " + f.toString()
              );
            return a;
          }
        } else {
          if (i instanceof e)
            return t.fromSourceMap(i).toString();
          if (i instanceof t)
            return i.toString();
          if (this.isMap(i))
            return JSON.stringify(i);
          throw new Error(
            "Unsupported previous source map format: " + i.toString()
          );
        }
      } else {
        if (this.inline)
          return this.decodeInline(this.annotation);
        if (this.annotation) {
          let f = this.annotation;
          return p && (f = c(s(p), f)), this.loadFile(f);
        }
      }
    }
    startWith(p, i) {
      return p ? p.substr(0, i.length) === i : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return Et = m, m.default = m, Et;
}
var It, us;
function ct() {
  if (us) return It;
  us = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ce, { fileURLToPath: r, pathToFileURL: l } = ce, { isAbsolute: s, resolve: c } = ce, { nanoid: h } = /* @__PURE__ */ ho(), m = ce, o = Pr(), p = Pi(), i = Symbol("fromOffsetCache"), f = !!(e && t), a = !!(c && s);
  class n {
    constructor(u, g = {}) {
      if (u === null || typeof u > "u" || typeof u == "object" && !u.toString)
        throw new Error(`PostCSS received ${u} instead of CSS string`);
      if (this.css = u.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!a || /^\w+:\/\//.test(g.from) || s(g.from) ? this.file = g.from : this.file = c(g.from)), a && f) {
        let v = new p(this.css, g);
        if (v.text) {
          this.map = v;
          let b = v.consumer().file;
          !this.file && b && (this.file = this.mapResolve(b));
        }
      }
      this.file || (this.id = "<input css " + h(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(u, g, v, b = {}) {
      let S, x, w;
      if (g && typeof g == "object") {
        let C = g, O = v;
        if (typeof C.offset == "number") {
          let I = this.fromOffset(C.offset);
          g = I.line, v = I.col;
        } else
          g = C.line, v = C.column;
        if (typeof O.offset == "number") {
          let I = this.fromOffset(O.offset);
          x = I.line, w = I.col;
        } else
          x = O.line, w = O.column;
      } else if (!v) {
        let C = this.fromOffset(g);
        g = C.line, v = C.col;
      }
      let y = this.origin(g, v, x, w);
      return y ? S = new o(
        u,
        y.endLine === void 0 ? y.line : { column: y.column, line: y.line },
        y.endLine === void 0 ? y.column : { column: y.endColumn, line: y.endLine },
        y.source,
        y.file,
        b.plugin
      ) : S = new o(
        u,
        x === void 0 ? g : { column: v, line: g },
        x === void 0 ? v : { column: w, line: x },
        this.css,
        this.file,
        b.plugin
      ), S.input = { column: v, endColumn: w, endLine: x, line: g, source: this.css }, this.file && (l && (S.input.url = l(this.file).toString()), S.input.file = this.file), S;
    }
    fromOffset(u) {
      let g, v;
      if (this[i])
        v = this[i];
      else {
        let S = this.css.split(`
`);
        v = new Array(S.length);
        let x = 0;
        for (let w = 0, y = S.length; w < y; w++)
          v[w] = x, x += S[w].length + 1;
        this[i] = v;
      }
      g = v[v.length - 1];
      let b = 0;
      if (u >= g)
        b = v.length - 1;
      else {
        let S = v.length - 2, x;
        for (; b < S; )
          if (x = b + (S - b >> 1), u < v[x])
            S = x - 1;
          else if (u >= v[x + 1])
            b = x + 1;
          else {
            b = x;
            break;
          }
      }
      return {
        col: u - v[b] + 1,
        line: b + 1
      };
    }
    mapResolve(u) {
      return /^\w+:\/\//.test(u) ? u : c(this.map.consumer().sourceRoot || this.map.root || ".", u);
    }
    origin(u, g, v, b) {
      if (!this.map) return !1;
      let S = this.map.consumer(), x = S.originalPositionFor({ column: g, line: u });
      if (!x.source) return !1;
      let w;
      typeof v == "number" && (w = S.originalPositionFor({ column: b, line: v }));
      let y;
      s(x.source) ? y = l(x.source) : y = new URL(
        x.source,
        this.map.consumer().sourceRoot || l(this.map.mapFile)
      );
      let C = {
        column: x.column,
        endColumn: w && w.column,
        endLine: w && w.line,
        line: x.line,
        url: y.toString()
      };
      if (y.protocol === "file:")
        if (r)
          C.file = r(y);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let O = S.sourceContentFor(x.source);
      return O && (C.source = O), C;
    }
    toJSON() {
      let u = {};
      for (let g of ["hasBOM", "css", "file", "id"])
        this[g] != null && (u[g] = this[g]);
      return this.map && (u.map = { ...this.map }, u.map.consumerCache && (u.map.consumerCache = void 0)), u;
    }
    get from() {
      return this.file || this.id;
    }
  }
  return It = n, n.default = n, m && m.registerInput && m.registerInput(n), It;
}
var At, cs;
function ki() {
  if (cs) return At;
  cs = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ce, { dirname: r, relative: l, resolve: s, sep: c } = ce, { pathToFileURL: h } = ce, m = ct(), o = !!(e && t), p = !!(r && s && l && c);
  class i {
    constructor(a, n, d, u) {
      this.stringify = a, this.mapOpts = d.map || {}, this.root = n, this.opts = d, this.css = u, this.originalCSS = u, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute, this.memoizedFileURLs = /* @__PURE__ */ new Map(), this.memoizedPaths = /* @__PURE__ */ new Map(), this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let a;
      this.isInline() ? a = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? a = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? a = this.mapOpts.annotation(this.opts.to, this.root) : a = this.outputFile() + ".map";
      let n = `
`;
      this.css.includes(`\r
`) && (n = `\r
`), this.css += n + "/*# sourceMappingURL=" + a + " */";
    }
    applyPrevMaps() {
      for (let a of this.previous()) {
        let n = this.toUrl(this.path(a.file)), d = a.root || r(a.file), u;
        this.mapOpts.sourcesContent === !1 ? (u = new e(a.text), u.sourcesContent && (u.sourcesContent = null)) : u = a.consumer(), this.map.applySourceMap(u, n, this.toUrl(this.path(d)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation !== !1)
        if (this.root) {
          let a;
          for (let n = this.root.nodes.length - 1; n >= 0; n--)
            a = this.root.nodes[n], a.type === "comment" && a.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(n);
        } else this.css && (this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, ""));
    }
    generate() {
      if (this.clearAnnotation(), p && o && this.isMap())
        return this.generateMap();
      {
        let a = "";
        return this.stringify(this.root, (n) => {
          a += n;
        }), [a];
      }
    }
    generateMap() {
      if (this.root)
        this.generateString();
      else if (this.previous().length === 1) {
        let a = this.previous()[0].consumer();
        a.file = this.outputFile(), this.map = t.fromSourceMap(a, {
          ignoreInvalidMapping: !0
        });
      } else
        this.map = new t({
          file: this.outputFile(),
          ignoreInvalidMapping: !0
        }), this.map.addMapping({
          generated: { column: 0, line: 1 },
          original: { column: 0, line: 1 },
          source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
        });
      return this.isSourcesContent() && this.setSourcesContent(), this.root && this.previous().length > 0 && this.applyPrevMaps(), this.isAnnotation() && this.addAnnotation(), this.isInline() ? [this.css] : [this.css, this.map];
    }
    generateString() {
      this.css = "", this.map = new t({
        file: this.outputFile(),
        ignoreInvalidMapping: !0
      });
      let a = 1, n = 1, d = "<no source>", u = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      }, g, v;
      this.stringify(this.root, (b, S, x) => {
        if (this.css += b, S && x !== "end" && (u.generated.line = a, u.generated.column = n - 1, S.source && S.source.start ? (u.source = this.sourcePath(S), u.original.line = S.source.start.line, u.original.column = S.source.start.column - 1, this.map.addMapping(u)) : (u.source = d, u.original.line = 1, u.original.column = 0, this.map.addMapping(u))), g = b.match(/\n/g), g ? (a += g.length, v = b.lastIndexOf(`
`), n = b.length - v) : n += b.length, S && x !== "start") {
          let w = S.parent || { raws: {} };
          (!(S.type === "decl" || S.type === "atrule" && !S.nodes) || S !== w.last || w.raws.semicolon) && (S.source && S.source.end ? (u.source = this.sourcePath(S), u.original.line = S.source.end.line, u.original.column = S.source.end.column - 1, u.generated.line = a, u.generated.column = n - 2, this.map.addMapping(u)) : (u.source = d, u.original.line = 1, u.original.column = 0, u.generated.line = a, u.generated.column = n - 1, this.map.addMapping(u)));
        }
      });
    }
    isAnnotation() {
      return this.isInline() ? !0 : typeof this.mapOpts.annotation < "u" ? this.mapOpts.annotation : this.previous().length ? this.previous().some((a) => a.annotation) : !0;
    }
    isInline() {
      if (typeof this.mapOpts.inline < "u")
        return this.mapOpts.inline;
      let a = this.mapOpts.annotation;
      return typeof a < "u" && a !== !0 ? !1 : this.previous().length ? this.previous().some((n) => n.inline) : !0;
    }
    isMap() {
      return typeof this.opts.map < "u" ? !!this.opts.map : this.previous().length > 0;
    }
    isSourcesContent() {
      return typeof this.mapOpts.sourcesContent < "u" ? this.mapOpts.sourcesContent : this.previous().length ? this.previous().some((a) => a.withContent()) : !0;
    }
    outputFile() {
      return this.opts.to ? this.path(this.opts.to) : this.opts.from ? this.path(this.opts.from) : "to.css";
    }
    path(a) {
      if (this.mapOpts.absolute || a.charCodeAt(0) === 60 || /^\w+:\/\//.test(a)) return a;
      let n = this.memoizedPaths.get(a);
      if (n) return n;
      let d = this.opts.to ? r(this.opts.to) : ".";
      typeof this.mapOpts.annotation == "string" && (d = r(s(d, this.mapOpts.annotation)));
      let u = l(d, a);
      return this.memoizedPaths.set(a, u), u;
    }
    previous() {
      if (!this.previousMaps)
        if (this.previousMaps = [], this.root)
          this.root.walk((a) => {
            if (a.source && a.source.input.map) {
              let n = a.source.input.map;
              this.previousMaps.includes(n) || this.previousMaps.push(n);
            }
          });
        else {
          let a = new m(this.originalCSS, this.opts);
          a.map && this.previousMaps.push(a.map);
        }
      return this.previousMaps;
    }
    setSourcesContent() {
      let a = {};
      if (this.root)
        this.root.walk((n) => {
          if (n.source) {
            let d = n.source.input.from;
            if (d && !a[d]) {
              a[d] = !0;
              let u = this.usesFileUrls ? this.toFileUrl(d) : this.toUrl(this.path(d));
              this.map.setSourceContent(u, n.source.input.css);
            }
          }
        });
      else if (this.css) {
        let n = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
        this.map.setSourceContent(n, this.css);
      }
    }
    sourcePath(a) {
      return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(a.source.input.from) : this.toUrl(this.path(a.source.input.from));
    }
    toBase64(a) {
      return Buffer ? Buffer.from(a).toString("base64") : window.btoa(unescape(encodeURIComponent(a)));
    }
    toFileUrl(a) {
      let n = this.memoizedFileURLs.get(a);
      if (n) return n;
      if (h) {
        let d = h(a).toString();
        return this.memoizedFileURLs.set(a, d), d;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(a) {
      let n = this.memoizedURLs.get(a);
      if (n) return n;
      c === "\\" && (a = a.replace(/\\/g, "/"));
      let d = encodeURI(a).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(a, d), d;
    }
  }
  return At = i, At;
}
var Nt, fs;
function ft() {
  if (fs) return Nt;
  fs = 1;
  let e = lt();
  class t extends e {
    constructor(l) {
      super(l), this.type = "comment";
    }
  }
  return Nt = t, t.default = t, Nt;
}
var Pt, hs;
function Ce() {
  if (hs) return Pt;
  hs = 1;
  let { isClean: e, my: t } = kr(), r = ut(), l = ft(), s = lt(), c, h, m, o;
  function p(a) {
    return a.map((n) => (n.nodes && (n.nodes = p(n.nodes)), delete n.source, n));
  }
  function i(a) {
    if (a[e] = !1, a.proxyOf.nodes)
      for (let n of a.proxyOf.nodes)
        i(n);
  }
  class f extends s {
    append(...n) {
      for (let d of n) {
        let u = this.normalize(d, this.last);
        for (let g of u) this.proxyOf.nodes.push(g);
      }
      return this.markDirty(), this;
    }
    cleanRaws(n) {
      if (super.cleanRaws(n), this.nodes)
        for (let d of this.nodes) d.cleanRaws(n);
    }
    each(n) {
      if (!this.proxyOf.nodes) return;
      let d = this.getIterator(), u, g;
      for (; this.indexes[d] < this.proxyOf.nodes.length && (u = this.indexes[d], g = n(this.proxyOf.nodes[u], u), g !== !1); )
        this.indexes[d] += 1;
      return delete this.indexes[d], g;
    }
    every(n) {
      return this.nodes.every(n);
    }
    getIterator() {
      this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach += 1;
      let n = this.lastEach;
      return this.indexes[n] = 0, n;
    }
    getProxyProcessor() {
      return {
        get(n, d) {
          return d === "proxyOf" ? n : n[d] ? d === "each" || typeof d == "string" && d.startsWith("walk") ? (...u) => n[d](
            ...u.map((g) => typeof g == "function" ? (v, b) => g(v.toProxy(), b) : g)
          ) : d === "every" || d === "some" ? (u) => n[d](
            (g, ...v) => u(g.toProxy(), ...v)
          ) : d === "root" ? () => n.root().toProxy() : d === "nodes" ? n.nodes.map((u) => u.toProxy()) : d === "first" || d === "last" ? n[d].toProxy() : n[d] : n[d];
        },
        set(n, d, u) {
          return n[d] === u || (n[d] = u, (d === "name" || d === "params" || d === "selector") && n.markDirty()), !0;
        }
      };
    }
    index(n) {
      return typeof n == "number" ? n : (n.proxyOf && (n = n.proxyOf), this.proxyOf.nodes.indexOf(n));
    }
    insertAfter(n, d) {
      let u = this.index(n), g = this.normalize(d, this.proxyOf.nodes[u]).reverse();
      u = this.index(n);
      for (let b of g) this.proxyOf.nodes.splice(u + 1, 0, b);
      let v;
      for (let b in this.indexes)
        v = this.indexes[b], u < v && (this.indexes[b] = v + g.length);
      return this.markDirty(), this;
    }
    insertBefore(n, d) {
      let u = this.index(n), g = u === 0 ? "prepend" : !1, v = this.normalize(d, this.proxyOf.nodes[u], g).reverse();
      u = this.index(n);
      for (let S of v) this.proxyOf.nodes.splice(u, 0, S);
      let b;
      for (let S in this.indexes)
        b = this.indexes[S], u <= b && (this.indexes[S] = b + v.length);
      return this.markDirty(), this;
    }
    normalize(n, d) {
      if (typeof n == "string")
        n = p(c(n).nodes);
      else if (typeof n > "u")
        n = [];
      else if (Array.isArray(n)) {
        n = n.slice(0);
        for (let g of n)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (n.type === "root" && this.type !== "document") {
        n = n.nodes.slice(0);
        for (let g of n)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (n.type)
        n = [n];
      else if (n.prop) {
        if (typeof n.value > "u")
          throw new Error("Value field is missed in node creation");
        typeof n.value != "string" && (n.value = String(n.value)), n = [new r(n)];
      } else if (n.selector)
        n = [new h(n)];
      else if (n.name)
        n = [new m(n)];
      else if (n.text)
        n = [new l(n)];
      else
        throw new Error("Unknown node type in node creation");
      return n.map((g) => (g[t] || f.rebuild(g), g = g.proxyOf, g.parent && g.parent.removeChild(g), g[e] && i(g), typeof g.raws.before > "u" && d && typeof d.raws.before < "u" && (g.raws.before = d.raws.before.replace(/\S/g, "")), g.parent = this.proxyOf, g));
    }
    prepend(...n) {
      n = n.reverse();
      for (let d of n) {
        let u = this.normalize(d, this.first, "prepend").reverse();
        for (let g of u) this.proxyOf.nodes.unshift(g);
        for (let g in this.indexes)
          this.indexes[g] = this.indexes[g] + u.length;
      }
      return this.markDirty(), this;
    }
    push(n) {
      return n.parent = this, this.proxyOf.nodes.push(n), this;
    }
    removeAll() {
      for (let n of this.proxyOf.nodes) n.parent = void 0;
      return this.proxyOf.nodes = [], this.markDirty(), this;
    }
    removeChild(n) {
      n = this.index(n), this.proxyOf.nodes[n].parent = void 0, this.proxyOf.nodes.splice(n, 1);
      let d;
      for (let u in this.indexes)
        d = this.indexes[u], d >= n && (this.indexes[u] = d - 1);
      return this.markDirty(), this;
    }
    replaceValues(n, d, u) {
      return u || (u = d, d = {}), this.walkDecls((g) => {
        d.props && !d.props.includes(g.prop) || d.fast && !g.value.includes(d.fast) || (g.value = g.value.replace(n, u));
      }), this.markDirty(), this;
    }
    some(n) {
      return this.nodes.some(n);
    }
    walk(n) {
      return this.each((d, u) => {
        let g;
        try {
          g = n(d, u);
        } catch (v) {
          throw d.addToError(v);
        }
        return g !== !1 && d.walk && (g = d.walk(n)), g;
      });
    }
    walkAtRules(n, d) {
      return d ? n instanceof RegExp ? this.walk((u, g) => {
        if (u.type === "atrule" && n.test(u.name))
          return d(u, g);
      }) : this.walk((u, g) => {
        if (u.type === "atrule" && u.name === n)
          return d(u, g);
      }) : (d = n, this.walk((u, g) => {
        if (u.type === "atrule")
          return d(u, g);
      }));
    }
    walkComments(n) {
      return this.walk((d, u) => {
        if (d.type === "comment")
          return n(d, u);
      });
    }
    walkDecls(n, d) {
      return d ? n instanceof RegExp ? this.walk((u, g) => {
        if (u.type === "decl" && n.test(u.prop))
          return d(u, g);
      }) : this.walk((u, g) => {
        if (u.type === "decl" && u.prop === n)
          return d(u, g);
      }) : (d = n, this.walk((u, g) => {
        if (u.type === "decl")
          return d(u, g);
      }));
    }
    walkRules(n, d) {
      return d ? n instanceof RegExp ? this.walk((u, g) => {
        if (u.type === "rule" && n.test(u.selector))
          return d(u, g);
      }) : this.walk((u, g) => {
        if (u.type === "rule" && u.selector === n)
          return d(u, g);
      }) : (d = n, this.walk((u, g) => {
        if (u.type === "rule")
          return d(u, g);
      }));
    }
    get first() {
      if (this.proxyOf.nodes)
        return this.proxyOf.nodes[0];
    }
    get last() {
      if (this.proxyOf.nodes)
        return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
    }
  }
  return f.registerParse = (a) => {
    c = a;
  }, f.registerRule = (a) => {
    h = a;
  }, f.registerAtRule = (a) => {
    m = a;
  }, f.registerRoot = (a) => {
    o = a;
  }, Pt = f, f.default = f, f.rebuild = (a) => {
    a.type === "atrule" ? Object.setPrototypeOf(a, m.prototype) : a.type === "rule" ? Object.setPrototypeOf(a, h.prototype) : a.type === "decl" ? Object.setPrototypeOf(a, r.prototype) : a.type === "comment" ? Object.setPrototypeOf(a, l.prototype) : a.type === "root" && Object.setPrototypeOf(a, o.prototype), a[t] = !0, a.nodes && a.nodes.forEach((n) => {
      f.rebuild(n);
    });
  }, Pt;
}
var kt, ps;
function _r() {
  if (ps) return kt;
  ps = 1;
  let e = Ce(), t, r;
  class l extends e {
    constructor(c) {
      super({ type: "document", ...c }), this.nodes || (this.nodes = []);
    }
    toResult(c = {}) {
      return new t(new r(), this, c).stringify();
    }
  }
  return l.registerLazyResult = (s) => {
    t = s;
  }, l.registerProcessor = (s) => {
    r = s;
  }, kt = l, l.default = l, kt;
}
var _t, ds;
function _i() {
  if (ds) return _t;
  ds = 1;
  let e = {};
  return _t = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, _t;
}
var Lt, ms;
function Li() {
  if (ms) return Lt;
  ms = 1;
  class e {
    constructor(r, l = {}) {
      if (this.type = "warning", this.text = r, l.node && l.node.source) {
        let s = l.node.rangeBy(l);
        this.line = s.start.line, this.column = s.start.column, this.endLine = s.end.line, this.endColumn = s.end.column;
      }
      for (let s in l) this[s] = l[s];
    }
    toString() {
      return this.node ? this.node.error(this.text, {
        index: this.index,
        plugin: this.plugin,
        word: this.word
      }).message : this.plugin ? this.plugin + ": " + this.text : this.text;
    }
  }
  return Lt = e, e.default = e, Lt;
}
var Dt, gs;
function Lr() {
  if (gs) return Dt;
  gs = 1;
  let e = Li();
  class t {
    constructor(l, s, c) {
      this.processor = l, this.messages = [], this.root = s, this.opts = c, this.css = void 0, this.map = void 0;
    }
    toString() {
      return this.css;
    }
    warn(l, s = {}) {
      s.plugin || this.lastPlugin && this.lastPlugin.postcssPlugin && (s.plugin = this.lastPlugin.postcssPlugin);
      let c = new e(l, s);
      return this.messages.push(c), c;
    }
    warnings() {
      return this.messages.filter((l) => l.type === "warning");
    }
    get content() {
      return this.css;
    }
  }
  return Dt = t, t.default = t, Dt;
}
var Tt, ys;
function po() {
  if (ys) return Tt;
  ys = 1;
  const e = 39, t = 34, r = 92, l = 47, s = 10, c = 32, h = 12, m = 9, o = 13, p = 91, i = 93, f = 40, a = 41, n = 123, d = 125, u = 59, g = 42, v = 58, b = 64, S = /[\t\n\f\r "#'()/;[\\\]{}]/g, x = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, y = /[\da-f]/i;
  return Tt = function(O, I = {}) {
    let M = O.css.valueOf(), P = I.ignoreErrors, N, R, ae, se, F, U, G, X, J, $, ge = M.length, E = 0, he = [], ne = [];
    function _e() {
      return E;
    }
    function Z(k) {
      throw O.error("Unclosed " + k, E);
    }
    function le() {
      return ne.length === 0 && E >= ge;
    }
    function be(k) {
      if (ne.length) return ne.pop();
      if (E >= ge) return;
      let Y = k ? k.ignoreUnclosed : !1;
      switch (N = M.charCodeAt(E), N) {
        case s:
        case c:
        case m:
        case o:
        case h: {
          R = E;
          do
            R += 1, N = M.charCodeAt(R);
          while (N === c || N === s || N === m || N === o || N === h);
          $ = ["space", M.slice(E, R)], E = R - 1;
          break;
        }
        case p:
        case i:
        case n:
        case d:
        case v:
        case u:
        case a: {
          let z = String.fromCharCode(N);
          $ = [z, z, E];
          break;
        }
        case f: {
          if (X = he.length ? he.pop()[1] : "", J = M.charCodeAt(E + 1), X === "url" && J !== e && J !== t && J !== c && J !== s && J !== m && J !== h && J !== o) {
            R = E;
            do {
              if (U = !1, R = M.indexOf(")", R + 1), R === -1)
                if (P || Y) {
                  R = E;
                  break;
                } else
                  Z("bracket");
              for (G = R; M.charCodeAt(G - 1) === r; )
                G -= 1, U = !U;
            } while (U);
            $ = ["brackets", M.slice(E, R + 1), E, R], E = R;
          } else
            R = M.indexOf(")", E + 1), se = M.slice(E, R + 1), R === -1 || w.test(se) ? $ = ["(", "(", E] : ($ = ["brackets", se, E, R], E = R);
          break;
        }
        case e:
        case t: {
          ae = N === e ? "'" : '"', R = E;
          do {
            if (U = !1, R = M.indexOf(ae, R + 1), R === -1)
              if (P || Y) {
                R = E + 1;
                break;
              } else
                Z("string");
            for (G = R; M.charCodeAt(G - 1) === r; )
              G -= 1, U = !U;
          } while (U);
          $ = ["string", M.slice(E, R + 1), E, R], E = R;
          break;
        }
        case b: {
          S.lastIndex = E + 1, S.test(M), S.lastIndex === 0 ? R = M.length - 1 : R = S.lastIndex - 2, $ = ["at-word", M.slice(E, R + 1), E, R], E = R;
          break;
        }
        case r: {
          for (R = E, F = !0; M.charCodeAt(R + 1) === r; )
            R += 1, F = !F;
          if (N = M.charCodeAt(R + 1), F && N !== l && N !== c && N !== s && N !== m && N !== o && N !== h && (R += 1, y.test(M.charAt(R)))) {
            for (; y.test(M.charAt(R + 1)); )
              R += 1;
            M.charCodeAt(R + 1) === c && (R += 1);
          }
          $ = ["word", M.slice(E, R + 1), E, R], E = R;
          break;
        }
        default: {
          N === l && M.charCodeAt(E + 1) === g ? (R = M.indexOf("*/", E + 2) + 1, R === 0 && (P || Y ? R = M.length : Z("comment")), $ = ["comment", M.slice(E, R + 1), E, R], E = R) : (x.lastIndex = E + 1, x.test(M), x.lastIndex === 0 ? R = M.length - 1 : R = x.lastIndex - 2, $ = ["word", M.slice(E, R + 1), E, R], he.push($), E = R);
          break;
        }
      }
      return E++, $;
    }
    function ye(k) {
      ne.push(k);
    }
    return {
      back: ye,
      endOfFile: le,
      nextToken: be,
      position: _e
    };
  }, Tt;
}
var Ut, ws;
function Dr() {
  if (ws) return Ut;
  ws = 1;
  let e = Ce();
  class t extends e {
    constructor(l) {
      super(l), this.type = "atrule";
    }
    append(...l) {
      return this.proxyOf.nodes || (this.nodes = []), super.append(...l);
    }
    prepend(...l) {
      return this.proxyOf.nodes || (this.nodes = []), super.prepend(...l);
    }
  }
  return Ut = t, t.default = t, e.registerAtRule(t), Ut;
}
var Ft, bs;
function ze() {
  if (bs) return Ft;
  bs = 1;
  let e = Ce(), t, r;
  class l extends e {
    constructor(c) {
      super(c), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(c, h, m) {
      let o = super.normalize(c);
      if (h) {
        if (m === "prepend")
          this.nodes.length > 1 ? h.raws.before = this.nodes[1].raws.before : delete h.raws.before;
        else if (this.first !== h)
          for (let p of o)
            p.raws.before = h.raws.before;
      }
      return o;
    }
    removeChild(c, h) {
      let m = this.index(c);
      return !h && m === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[m].raws.before), super.removeChild(c);
    }
    toResult(c = {}) {
      return new t(new r(), this, c).stringify();
    }
  }
  return l.registerLazyResult = (s) => {
    t = s;
  }, l.registerProcessor = (s) => {
    r = s;
  }, Ft = l, l.default = l, e.registerRoot(l), Ft;
}
var $t, Ss;
function Di() {
  if (Ss) return $t;
  Ss = 1;
  let e = {
    comma(t) {
      return e.split(t, [","], !0);
    },
    space(t) {
      let r = [" ", `
`, "	"];
      return e.split(t, r);
    },
    split(t, r, l) {
      let s = [], c = "", h = !1, m = 0, o = !1, p = "", i = !1;
      for (let f of t)
        i ? i = !1 : f === "\\" ? i = !0 : o ? f === p && (o = !1) : f === '"' || f === "'" ? (o = !0, p = f) : f === "(" ? m += 1 : f === ")" ? m > 0 && (m -= 1) : m === 0 && r.includes(f) && (h = !0), h ? (c !== "" && s.push(c.trim()), c = "", h = !1) : c += f;
      return (l || c !== "") && s.push(c.trim()), s;
    }
  };
  return $t = e, e.default = e, $t;
}
var zt, vs;
function Tr() {
  if (vs) return zt;
  vs = 1;
  let e = Ce(), t = Di();
  class r extends e {
    constructor(s) {
      super(s), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(s) {
      let c = this.selector ? this.selector.match(/,\s*/) : null, h = c ? c[0] : "," + this.raw("between", "beforeOpen");
      this.selector = s.join(h);
    }
  }
  return zt = r, r.default = r, e.registerRule(r), zt;
}
var Bt, Cs;
function mo() {
  if (Cs) return Bt;
  Cs = 1;
  let e = ut(), t = po(), r = ft(), l = Dr(), s = ze(), c = Tr();
  const h = {
    empty: !0,
    space: !0
  };
  function m(p) {
    for (let i = p.length - 1; i >= 0; i--) {
      let f = p[i], a = f[3] || f[2];
      if (a) return a;
    }
  }
  class o {
    constructor(i) {
      this.input = i, this.root = new s(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: i, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(i) {
      let f = new l();
      f.name = i[1].slice(1), f.name === "" && this.unnamedAtrule(f, i), this.init(f, i[2]);
      let a, n, d, u = !1, g = !1, v = [], b = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (i = this.tokenizer.nextToken(), a = i[0], a === "(" || a === "[" ? b.push(a === "(" ? ")" : "]") : a === "{" && b.length > 0 ? b.push("}") : a === b[b.length - 1] && b.pop(), b.length === 0)
          if (a === ";") {
            f.source.end = this.getPosition(i[2]), f.source.end.offset++, this.semicolon = !0;
            break;
          } else if (a === "{") {
            g = !0;
            break;
          } else if (a === "}") {
            if (v.length > 0) {
              for (d = v.length - 1, n = v[d]; n && n[0] === "space"; )
                n = v[--d];
              n && (f.source.end = this.getPosition(n[3] || n[2]), f.source.end.offset++);
            }
            this.end(i);
            break;
          } else
            v.push(i);
        else
          v.push(i);
        if (this.tokenizer.endOfFile()) {
          u = !0;
          break;
        }
      }
      f.raws.between = this.spacesAndCommentsFromEnd(v), v.length ? (f.raws.afterName = this.spacesAndCommentsFromStart(v), this.raw(f, "params", v), u && (i = v[v.length - 1], f.source.end = this.getPosition(i[3] || i[2]), f.source.end.offset++, this.spaces = f.raws.between, f.raws.between = "")) : (f.raws.afterName = "", f.params = ""), g && (f.nodes = [], this.current = f);
    }
    checkMissedSemicolon(i) {
      let f = this.colon(i);
      if (f === !1) return;
      let a = 0, n;
      for (let d = f - 1; d >= 0 && (n = i[d], !(n[0] !== "space" && (a += 1, a === 2))); d--)
        ;
      throw this.input.error(
        "Missed semicolon",
        n[0] === "word" ? n[3] + 1 : n[2]
      );
    }
    colon(i) {
      let f = 0, a, n, d;
      for (let [u, g] of i.entries()) {
        if (a = g, n = a[0], n === "(" && (f += 1), n === ")" && (f -= 1), f === 0 && n === ":")
          if (!d)
            this.doubleColon(a);
          else {
            if (d[0] === "word" && d[1] === "progid")
              continue;
            return u;
          }
        d = a;
      }
      return !1;
    }
    comment(i) {
      let f = new r();
      this.init(f, i[2]), f.source.end = this.getPosition(i[3] || i[2]), f.source.end.offset++;
      let a = i[1].slice(2, -2);
      if (/^\s*$/.test(a))
        f.text = "", f.raws.left = a, f.raws.right = "";
      else {
        let n = a.match(/^(\s*)([^]*\S)(\s*)$/);
        f.text = n[2], f.raws.left = n[1], f.raws.right = n[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(i, f) {
      let a = new e();
      this.init(a, i[0][2]);
      let n = i[i.length - 1];
      for (n[0] === ";" && (this.semicolon = !0, i.pop()), a.source.end = this.getPosition(
        n[3] || n[2] || m(i)
      ), a.source.end.offset++; i[0][0] !== "word"; )
        i.length === 1 && this.unknownWord(i), a.raws.before += i.shift()[1];
      for (a.source.start = this.getPosition(i[0][2]), a.prop = ""; i.length; ) {
        let b = i[0][0];
        if (b === ":" || b === "space" || b === "comment")
          break;
        a.prop += i.shift()[1];
      }
      a.raws.between = "";
      let d;
      for (; i.length; )
        if (d = i.shift(), d[0] === ":") {
          a.raws.between += d[1];
          break;
        } else
          d[0] === "word" && /\w/.test(d[1]) && this.unknownWord([d]), a.raws.between += d[1];
      (a.prop[0] === "_" || a.prop[0] === "*") && (a.raws.before += a.prop[0], a.prop = a.prop.slice(1));
      let u = [], g;
      for (; i.length && (g = i[0][0], !(g !== "space" && g !== "comment")); )
        u.push(i.shift());
      this.precheckMissedSemicolon(i);
      for (let b = i.length - 1; b >= 0; b--) {
        if (d = i[b], d[1].toLowerCase() === "!important") {
          a.important = !0;
          let S = this.stringFrom(i, b);
          S = this.spacesFromEnd(i) + S, S !== " !important" && (a.raws.important = S);
          break;
        } else if (d[1].toLowerCase() === "important") {
          let S = i.slice(0), x = "";
          for (let w = b; w > 0; w--) {
            let y = S[w][0];
            if (x.trim().indexOf("!") === 0 && y !== "space")
              break;
            x = S.pop()[1] + x;
          }
          x.trim().indexOf("!") === 0 && (a.important = !0, a.raws.important = x, i = S);
        }
        if (d[0] !== "space" && d[0] !== "comment")
          break;
      }
      i.some((b) => b[0] !== "space" && b[0] !== "comment") && (a.raws.between += u.map((b) => b[1]).join(""), u = []), this.raw(a, "value", u.concat(i), f), a.value.includes(":") && !f && this.checkMissedSemicolon(i);
    }
    doubleColon(i) {
      throw this.input.error(
        "Double colon",
        { offset: i[2] },
        { offset: i[2] + i[1].length }
      );
    }
    emptyRule(i) {
      let f = new c();
      this.init(f, i[2]), f.selector = "", f.raws.between = "", this.current = f;
    }
    end(i) {
      this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.semicolon = !1, this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.spaces = "", this.current.parent ? (this.current.source.end = this.getPosition(i[2]), this.current.source.end.offset++, this.current = this.current.parent) : this.unexpectedClose(i);
    }
    endFile() {
      this.current.parent && this.unclosedBlock(), this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.root.source.end = this.getPosition(this.tokenizer.position());
    }
    freeSemicolon(i) {
      if (this.spaces += i[1], this.current.nodes) {
        let f = this.current.nodes[this.current.nodes.length - 1];
        f && f.type === "rule" && !f.raws.ownSemicolon && (f.raws.ownSemicolon = this.spaces, this.spaces = "");
      }
    }
    // Helpers
    getPosition(i) {
      let f = this.input.fromOffset(i);
      return {
        column: f.col,
        line: f.line,
        offset: i
      };
    }
    init(i, f) {
      this.current.push(i), i.source = {
        input: this.input,
        start: this.getPosition(f)
      }, i.raws.before = this.spaces, this.spaces = "", i.type !== "comment" && (this.semicolon = !1);
    }
    other(i) {
      let f = !1, a = null, n = !1, d = null, u = [], g = i[1].startsWith("--"), v = [], b = i;
      for (; b; ) {
        if (a = b[0], v.push(b), a === "(" || a === "[")
          d || (d = b), u.push(a === "(" ? ")" : "]");
        else if (g && n && a === "{")
          d || (d = b), u.push("}");
        else if (u.length === 0)
          if (a === ";")
            if (n) {
              this.decl(v, g);
              return;
            } else
              break;
          else if (a === "{") {
            this.rule(v);
            return;
          } else if (a === "}") {
            this.tokenizer.back(v.pop()), f = !0;
            break;
          } else a === ":" && (n = !0);
        else a === u[u.length - 1] && (u.pop(), u.length === 0 && (d = null));
        b = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (f = !0), u.length > 0 && this.unclosedBracket(d), f && n) {
        if (!g)
          for (; v.length && (b = v[v.length - 1][0], !(b !== "space" && b !== "comment")); )
            this.tokenizer.back(v.pop());
        this.decl(v, g);
      } else
        this.unknownWord(v);
    }
    parse() {
      let i;
      for (; !this.tokenizer.endOfFile(); )
        switch (i = this.tokenizer.nextToken(), i[0]) {
          case "space":
            this.spaces += i[1];
            break;
          case ";":
            this.freeSemicolon(i);
            break;
          case "}":
            this.end(i);
            break;
          case "comment":
            this.comment(i);
            break;
          case "at-word":
            this.atrule(i);
            break;
          case "{":
            this.emptyRule(i);
            break;
          default:
            this.other(i);
            break;
        }
      this.endFile();
    }
    precheckMissedSemicolon() {
    }
    raw(i, f, a, n) {
      let d, u, g = a.length, v = "", b = !0, S, x;
      for (let w = 0; w < g; w += 1)
        d = a[w], u = d[0], u === "space" && w === g - 1 && !n ? b = !1 : u === "comment" ? (x = a[w - 1] ? a[w - 1][0] : "empty", S = a[w + 1] ? a[w + 1][0] : "empty", !h[x] && !h[S] ? v.slice(-1) === "," ? b = !1 : v += d[1] : b = !1) : v += d[1];
      if (!b) {
        let w = a.reduce((y, C) => y + C[1], "");
        i.raws[f] = { raw: w, value: v };
      }
      i[f] = v;
    }
    rule(i) {
      i.pop();
      let f = new c();
      this.init(f, i[0][2]), f.raws.between = this.spacesAndCommentsFromEnd(i), this.raw(f, "selector", i), this.current = f;
    }
    spacesAndCommentsFromEnd(i) {
      let f, a = "";
      for (; i.length && (f = i[i.length - 1][0], !(f !== "space" && f !== "comment")); )
        a = i.pop()[1] + a;
      return a;
    }
    // Errors
    spacesAndCommentsFromStart(i) {
      let f, a = "";
      for (; i.length && (f = i[0][0], !(f !== "space" && f !== "comment")); )
        a += i.shift()[1];
      return a;
    }
    spacesFromEnd(i) {
      let f, a = "";
      for (; i.length && (f = i[i.length - 1][0], f === "space"); )
        a = i.pop()[1] + a;
      return a;
    }
    stringFrom(i, f) {
      let a = "";
      for (let n = f; n < i.length; n++)
        a += i[n][1];
      return i.splice(f, i.length - f), a;
    }
    unclosedBlock() {
      let i = this.current.source.start;
      throw this.input.error("Unclosed block", i.line, i.column);
    }
    unclosedBracket(i) {
      throw this.input.error(
        "Unclosed bracket",
        { offset: i[2] },
        { offset: i[2] + 1 }
      );
    }
    unexpectedClose(i) {
      throw this.input.error(
        "Unexpected }",
        { offset: i[2] },
        { offset: i[2] + 1 }
      );
    }
    unknownWord(i) {
      throw this.input.error(
        "Unknown word",
        { offset: i[0][2] },
        { offset: i[0][2] + i[0][1].length }
      );
    }
    unnamedAtrule(i, f) {
      throw this.input.error(
        "At-rule without name",
        { offset: f[2] },
        { offset: f[2] + f[1].length }
      );
    }
  }
  return Bt = o, Bt;
}
var Wt, xs;
function Ur() {
  if (xs) return Wt;
  xs = 1;
  let e = Ce(), t = mo(), r = ct();
  function l(s, c) {
    let h = new r(s, c), m = new t(h);
    try {
      m.parse();
    } catch (o) {
      throw process.env.NODE_ENV !== "production" && o.name === "CssSyntaxError" && c && c.from && (/\.scss$/i.test(c.from) ? o.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(c.from) ? o.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(c.from) && (o.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), o;
    }
    return m.root;
  }
  return Wt = l, l.default = l, e.registerParse(l), Wt;
}
var qt, Rs;
function Ti() {
  if (Rs) return qt;
  Rs = 1;
  let { isClean: e, my: t } = kr(), r = ki(), l = at(), s = Ce(), c = _r(), h = _i(), m = Lr(), o = Ur(), p = ze();
  const i = {
    atrule: "AtRule",
    comment: "Comment",
    decl: "Declaration",
    document: "Document",
    root: "Root",
    rule: "Rule"
  }, f = {
    AtRule: !0,
    AtRuleExit: !0,
    Comment: !0,
    CommentExit: !0,
    Declaration: !0,
    DeclarationExit: !0,
    Document: !0,
    DocumentExit: !0,
    Once: !0,
    OnceExit: !0,
    postcssPlugin: !0,
    prepare: !0,
    Root: !0,
    RootExit: !0,
    Rule: !0,
    RuleExit: !0
  }, a = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, n = 0;
  function d(x) {
    return typeof x == "object" && typeof x.then == "function";
  }
  function u(x) {
    let w = !1, y = i[x.type];
    return x.type === "decl" ? w = x.prop.toLowerCase() : x.type === "atrule" && (w = x.name.toLowerCase()), w && x.append ? [
      y,
      y + "-" + w,
      n,
      y + "Exit",
      y + "Exit-" + w
    ] : w ? [y, y + "-" + w, y + "Exit", y + "Exit-" + w] : x.append ? [y, n, y + "Exit"] : [y, y + "Exit"];
  }
  function g(x) {
    let w;
    return x.type === "document" ? w = ["Document", n, "DocumentExit"] : x.type === "root" ? w = ["Root", n, "RootExit"] : w = u(x), {
      eventIndex: 0,
      events: w,
      iterator: 0,
      node: x,
      visitorIndex: 0,
      visitors: []
    };
  }
  function v(x) {
    return x[e] = !1, x.nodes && x.nodes.forEach((w) => v(w)), x;
  }
  let b = {};
  class S {
    constructor(w, y, C) {
      this.stringified = !1, this.processed = !1;
      let O;
      if (typeof y == "object" && y !== null && (y.type === "root" || y.type === "document"))
        O = v(y);
      else if (y instanceof S || y instanceof m)
        O = v(y.root), y.map && (typeof C.map > "u" && (C.map = {}), C.map.inline || (C.map.inline = !1), C.map.prev = y.map);
      else {
        let I = o;
        C.syntax && (I = C.syntax.parse), C.parser && (I = C.parser), I.parse && (I = I.parse);
        try {
          O = I(y, C);
        } catch (M) {
          this.processed = !0, this.error = M;
        }
        O && !O[t] && s.rebuild(O);
      }
      this.result = new m(w, O, C), this.helpers = { ...b, postcss: b, result: this.result }, this.plugins = this.processor.plugins.map((I) => typeof I == "object" && I.prepare ? { ...I, ...I.prepare(this.result) } : I);
    }
    async() {
      return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
    }
    catch(w) {
      return this.async().catch(w);
    }
    finally(w) {
      return this.async().then(w, w);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(w, y) {
      let C = this.result.lastPlugin;
      try {
        if (y && y.addToError(w), this.error = w, w.name === "CssSyntaxError" && !w.plugin)
          w.plugin = C.postcssPlugin, w.setMessage();
        else if (C.postcssVersion && process.env.NODE_ENV !== "production") {
          let O = C.postcssPlugin, I = C.postcssVersion, M = this.result.processor.version, P = I.split("."), N = M.split(".");
          (P[0] !== N[0] || parseInt(P[1]) > parseInt(N[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + M + ", but " + O + " uses " + I + ". Perhaps this is the source of the error below."
          );
        }
      } catch (O) {
        console && console.error && console.error(O);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (y, C, O) => {
        this.listeners[C] || (this.listeners[C] = []), this.listeners[C].push([y, O]);
      };
      for (let y of this.plugins)
        if (typeof y == "object")
          for (let C in y) {
            if (!f[C] && /^[A-Z]/.test(C))
              throw new Error(
                `Unknown event ${C} in ${y.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!a[C])
              if (typeof y[C] == "object")
                for (let O in y[C])
                  O === "*" ? w(y, C, y[C][O]) : w(
                    y,
                    C + "-" + O.toLowerCase(),
                    y[C][O]
                  );
              else typeof y[C] == "function" && w(y, C, y[C]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let w = 0; w < this.plugins.length; w++) {
        let y = this.plugins[w], C = this.runOnRoot(y);
        if (d(C))
          try {
            await C;
          } catch (O) {
            throw this.handleError(O);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; ) {
          w[e] = !0;
          let y = [g(w)];
          for (; y.length > 0; ) {
            let C = this.visitTick(y);
            if (d(C))
              try {
                await C;
              } catch (O) {
                let I = y[y.length - 1].node;
                throw this.handleError(O, I);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [y, C] of this.listeners.OnceExit) {
            this.result.lastPlugin = y;
            try {
              if (w.type === "document") {
                let O = w.nodes.map(
                  (I) => C(I, this.helpers)
                );
                await Promise.all(O);
              } else
                await C(w, this.helpers);
            } catch (O) {
              throw this.handleError(O);
            }
          }
      }
      return this.processed = !0, this.stringify();
    }
    runOnRoot(w) {
      this.result.lastPlugin = w;
      try {
        if (typeof w == "object" && w.Once) {
          if (this.result.root.type === "document") {
            let y = this.result.root.nodes.map(
              (C) => w.Once(C, this.helpers)
            );
            return d(y[0]) ? Promise.all(y) : y;
          }
          return w.Once(this.result.root, this.helpers);
        } else if (typeof w == "function")
          return w(this.result.root, this.result);
      } catch (y) {
        throw this.handleError(y);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let w = this.result.opts, y = l;
      w.syntax && (y = w.syntax.stringify), w.stringifier && (y = w.stringifier), y.stringify && (y = y.stringify);
      let O = new r(y, this.result.root, this.result.opts).generate();
      return this.result.css = O[0], this.result.map = O[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let w of this.plugins) {
        let y = this.runOnRoot(w);
        if (d(y))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; )
          w[e] = !0, this.walkSync(w);
        if (this.listeners.OnceExit)
          if (w.type === "document")
            for (let y of w.nodes)
              this.visitSync(this.listeners.OnceExit, y);
          else
            this.visitSync(this.listeners.OnceExit, w);
      }
      return this.result;
    }
    then(w, y) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || h(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(w, y);
    }
    toString() {
      return this.css;
    }
    visitSync(w, y) {
      for (let [C, O] of w) {
        this.result.lastPlugin = C;
        let I;
        try {
          I = O(y, this.helpers);
        } catch (M) {
          throw this.handleError(M, y.proxyOf);
        }
        if (y.type !== "root" && y.type !== "document" && !y.parent)
          return !0;
        if (d(I))
          throw this.getAsyncError();
      }
    }
    visitTick(w) {
      let y = w[w.length - 1], { node: C, visitors: O } = y;
      if (C.type !== "root" && C.type !== "document" && !C.parent) {
        w.pop();
        return;
      }
      if (O.length > 0 && y.visitorIndex < O.length) {
        let [M, P] = O[y.visitorIndex];
        y.visitorIndex += 1, y.visitorIndex === O.length && (y.visitors = [], y.visitorIndex = 0), this.result.lastPlugin = M;
        try {
          return P(C.toProxy(), this.helpers);
        } catch (N) {
          throw this.handleError(N, C);
        }
      }
      if (y.iterator !== 0) {
        let M = y.iterator, P;
        for (; P = C.nodes[C.indexes[M]]; )
          if (C.indexes[M] += 1, !P[e]) {
            P[e] = !0, w.push(g(P));
            return;
          }
        y.iterator = 0, delete C.indexes[M];
      }
      let I = y.events;
      for (; y.eventIndex < I.length; ) {
        let M = I[y.eventIndex];
        if (y.eventIndex += 1, M === n) {
          C.nodes && C.nodes.length && (C[e] = !0, y.iterator = C.getIterator());
          return;
        } else if (this.listeners[M]) {
          y.visitors = this.listeners[M];
          return;
        }
      }
      w.pop();
    }
    walkSync(w) {
      w[e] = !0;
      let y = u(w);
      for (let C of y)
        if (C === n)
          w.nodes && w.each((O) => {
            O[e] || this.walkSync(O);
          });
        else {
          let O = this.listeners[C];
          if (O && this.visitSync(O, w.toProxy()))
            return;
        }
    }
    warnings() {
      return this.sync().warnings();
    }
    get content() {
      return this.stringify().content;
    }
    get css() {
      return this.stringify().css;
    }
    get map() {
      return this.stringify().map;
    }
    get messages() {
      return this.sync().messages;
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      return this.sync().root;
    }
    get [Symbol.toStringTag]() {
      return "LazyResult";
    }
  }
  return S.registerPostcss = (x) => {
    b = x;
  }, qt = S, S.default = S, p.registerLazyResult(S), c.registerLazyResult(S), qt;
}
var jt, Os;
function go() {
  if (Os) return jt;
  Os = 1;
  let e = ki(), t = at(), r = _i(), l = Ur();
  const s = Lr();
  class c {
    constructor(m, o, p) {
      o = o.toString(), this.stringified = !1, this._processor = m, this._css = o, this._opts = p, this._map = void 0;
      let i, f = t;
      this.result = new s(this._processor, i, this._opts), this.result.css = o;
      let a = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return a.root;
        }
      });
      let n = new e(f, i, this._opts, o);
      if (n.isMap()) {
        let [d, u] = n.generate();
        d && (this.result.css = d), u && (this.result.map = u);
      } else
        n.clearAnnotation(), this.result.css = n.css;
    }
    async() {
      return this.error ? Promise.reject(this.error) : Promise.resolve(this.result);
    }
    catch(m) {
      return this.async().catch(m);
    }
    finally(m) {
      return this.async().then(m, m);
    }
    sync() {
      if (this.error) throw this.error;
      return this.result;
    }
    then(m, o) {
      return process.env.NODE_ENV !== "production" && ("from" in this._opts || r(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(m, o);
    }
    toString() {
      return this._css;
    }
    warnings() {
      return [];
    }
    get content() {
      return this.result.css;
    }
    get css() {
      return this.result.css;
    }
    get map() {
      return this.result.map;
    }
    get messages() {
      return [];
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      if (this._root)
        return this._root;
      let m, o = l;
      try {
        m = o(this._css, this._opts);
      } catch (p) {
        this.error = p;
      }
      if (this.error)
        throw this.error;
      return this._root = m, m;
    }
    get [Symbol.toStringTag]() {
      return "NoWorkResult";
    }
  }
  return jt = c, c.default = c, jt;
}
var Ht, Ms;
function yo() {
  if (Ms) return Ht;
  Ms = 1;
  let e = go(), t = Ti(), r = _r(), l = ze();
  class s {
    constructor(h = []) {
      this.version = "8.4.38", this.plugins = this.normalize(h);
    }
    normalize(h) {
      let m = [];
      for (let o of h)
        if (o.postcss === !0 ? o = o() : o.postcss && (o = o.postcss), typeof o == "object" && Array.isArray(o.plugins))
          m = m.concat(o.plugins);
        else if (typeof o == "object" && o.postcssPlugin)
          m.push(o);
        else if (typeof o == "function")
          m.push(o);
        else if (typeof o == "object" && (o.parse || o.stringify)) {
          if (process.env.NODE_ENV !== "production")
            throw new Error(
              "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
            );
        } else
          throw new Error(o + " is not a PostCSS plugin");
      return m;
    }
    process(h, m = {}) {
      return !this.plugins.length && !m.parser && !m.stringifier && !m.syntax ? new e(this, h, m) : new t(this, h, m);
    }
    use(h) {
      return this.plugins = this.plugins.concat(this.normalize([h])), this;
    }
  }
  return Ht = s, s.default = s, l.registerProcessor(s), r.registerProcessor(s), Ht;
}
var Vt, Es;
function wo() {
  if (Es) return Vt;
  Es = 1;
  let e = ut(), t = Pi(), r = ft(), l = Dr(), s = ct(), c = ze(), h = Tr();
  function m(o, p) {
    if (Array.isArray(o)) return o.map((a) => m(a));
    let { inputs: i, ...f } = o;
    if (i) {
      p = [];
      for (let a of i) {
        let n = { ...a, __proto__: s.prototype };
        n.map && (n.map = {
          ...n.map,
          __proto__: t.prototype
        }), p.push(n);
      }
    }
    if (f.nodes && (f.nodes = o.nodes.map((a) => m(a, p))), f.source) {
      let { inputId: a, ...n } = f.source;
      f.source = n, a != null && (f.source.input = p[a]);
    }
    if (f.type === "root")
      return new c(f);
    if (f.type === "decl")
      return new e(f);
    if (f.type === "rule")
      return new h(f);
    if (f.type === "comment")
      return new r(f);
    if (f.type === "atrule")
      return new l(f);
    throw new Error("Unknown node type: " + o.type);
  }
  return Vt = m, m.default = m, Vt;
}
var Gt, Is;
function bo() {
  if (Is) return Gt;
  Is = 1;
  let e = Pr(), t = ut(), r = Ti(), l = Ce(), s = yo(), c = at(), h = wo(), m = _r(), o = Li(), p = ft(), i = Dr(), f = Lr(), a = ct(), n = Ur(), d = Di(), u = Tr(), g = ze(), v = lt();
  function b(...S) {
    return S.length === 1 && Array.isArray(S[0]) && (S = S[0]), new s(S);
  }
  return b.plugin = function(x, w) {
    let y = !1;
    function C(...I) {
      console && console.warn && !y && (y = !0, console.warn(
        x + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        x + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let M = w(...I);
      return M.postcssPlugin = x, M.postcssVersion = new s().version, M;
    }
    let O;
    return Object.defineProperty(C, "postcss", {
      get() {
        return O || (O = C()), O;
      }
    }), C.process = function(I, M, P) {
      return b([C(P)]).process(I, M);
    }, C;
  }, b.stringify = c, b.parse = n, b.fromJSON = h, b.list = d, b.comment = (S) => new p(S), b.atRule = (S) => new i(S), b.decl = (S) => new t(S), b.rule = (S) => new u(S), b.root = (S) => new g(S), b.document = (S) => new m(S), b.CssSyntaxError = e, b.Declaration = t, b.Container = l, b.Processor = s, b.Document = m, b.Comment = p, b.Warning = o, b.AtRule = i, b.Result = f, b.Input = a, b.Rule = u, b.Root = g, b.Node = v, r.registerPostcss(b), Gt = b, b.default = b, Gt;
}
var So = bo();
const q = /* @__PURE__ */ ao(So);
q.stringify;
q.fromJSON;
q.plugin;
q.parse;
q.list;
q.document;
q.comment;
q.atRule;
q.rule;
q.decl;
q.root;
q.CssSyntaxError;
q.Declaration;
q.Container;
q.Processor;
q.Document;
q.Comment;
q.Warning;
q.AtRule;
q.Result;
q.Input;
q.Rule;
q.Root;
q.Node;
var vo = Object.defineProperty, Co = (e, t, r) => t in e ? vo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, oe = (e, t, r) => Co(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function xo(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Ro(e) {
  if (e.__esModule) return e;
  var t = e.default;
  if (typeof t == "function") {
    var r = function l() {
      return this instanceof l ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    r.prototype = t.prototype;
  } else r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(e).forEach(function(l) {
    var s = Object.getOwnPropertyDescriptor(e, l);
    Object.defineProperty(r, l, s.get ? s : {
      enumerable: !0,
      get: function() {
        return e[l];
      }
    });
  }), r;
}
var Ge = { exports: {} }, As;
function Oo() {
  if (As) return Ge.exports;
  As = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Ge.exports = t(), Ge.exports.createColors = t, Ge.exports;
}
const Mo = {}, Eo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Mo
}, Symbol.toStringTag, { value: "Module" })), fe = /* @__PURE__ */ Ro(Eo);
var Jt, Ns;
function Fr() {
  if (Ns) return Jt;
  Ns = 1;
  let e = /* @__PURE__ */ Oo(), t = fe;
  class r extends Error {
    constructor(s, c, h, m, o, p) {
      super(s), this.name = "CssSyntaxError", this.reason = s, o && (this.file = o), m && (this.source = m), p && (this.plugin = p), typeof c < "u" && typeof h < "u" && (typeof c == "number" ? (this.line = c, this.column = h) : (this.line = c.line, this.column = c.column, this.endLine = h.line, this.endColumn = h.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(s) {
      if (!this.source) return "";
      let c = this.source;
      s == null && (s = e.isColorSupported), t && s && (c = t(c));
      let h = c.split(/\r?\n/), m = Math.max(this.line - 3, 0), o = Math.min(this.line + 2, h.length), p = String(o).length, i, f;
      if (s) {
        let { bold: a, gray: n, red: d } = e.createColors(!0);
        i = (u) => a(d(u)), f = (u) => n(u);
      } else
        i = f = (a) => a;
      return h.slice(m, o).map((a, n) => {
        let d = m + 1 + n, u = " " + (" " + d).slice(-p) + " | ";
        if (d === this.line) {
          let g = f(u.replace(/\d/g, " ")) + a.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return i(">") + f(u) + a + `
 ` + g + i("^");
        }
        return " " + f(u) + a;
      }).join(`
`);
    }
    toString() {
      let s = this.showSourceCode();
      return s && (s = `

` + s + `
`), this.name + ": " + this.message + s;
    }
  }
  return Jt = r, r.default = r, Jt;
}
var Je = {}, Ps;
function $r() {
  return Ps || (Ps = 1, Je.isClean = Symbol("isClean"), Je.my = Symbol("my")), Je;
}
var Yt, ks;
function Ui() {
  if (ks) return Yt;
  ks = 1;
  const e = {
    after: `
`,
    beforeClose: `
`,
    beforeComment: `
`,
    beforeDecl: `
`,
    beforeOpen: " ",
    beforeRule: `
`,
    colon: ": ",
    commentLeft: " ",
    commentRight: " ",
    emptyBody: "",
    indent: "    ",
    semicolon: !1
  };
  function t(l) {
    return l[0].toUpperCase() + l.slice(1);
  }
  class r {
    constructor(s) {
      this.builder = s;
    }
    atrule(s, c) {
      let h = "@" + s.name, m = s.params ? this.rawValue(s, "params") : "";
      if (typeof s.raws.afterName < "u" ? h += s.raws.afterName : m && (h += " "), s.nodes)
        this.block(s, h + m);
      else {
        let o = (s.raws.between || "") + (c ? ";" : "");
        this.builder(h + m + o, s);
      }
    }
    beforeAfter(s, c) {
      let h;
      s.type === "decl" ? h = this.raw(s, null, "beforeDecl") : s.type === "comment" ? h = this.raw(s, null, "beforeComment") : c === "before" ? h = this.raw(s, null, "beforeRule") : h = this.raw(s, null, "beforeClose");
      let m = s.parent, o = 0;
      for (; m && m.type !== "root"; )
        o += 1, m = m.parent;
      if (h.includes(`
`)) {
        let p = this.raw(s, null, "indent");
        if (p.length)
          for (let i = 0; i < o; i++) h += p;
      }
      return h;
    }
    block(s, c) {
      let h = this.raw(s, "between", "beforeOpen");
      this.builder(c + h + "{", s, "start");
      let m;
      s.nodes && s.nodes.length ? (this.body(s), m = this.raw(s, "after")) : m = this.raw(s, "after", "emptyBody"), m && this.builder(m), this.builder("}", s, "end");
    }
    body(s) {
      let c = s.nodes.length - 1;
      for (; c > 0 && s.nodes[c].type === "comment"; )
        c -= 1;
      let h = this.raw(s, "semicolon");
      for (let m = 0; m < s.nodes.length; m++) {
        let o = s.nodes[m], p = this.raw(o, "before");
        p && this.builder(p), this.stringify(o, c !== m || h);
      }
    }
    comment(s) {
      let c = this.raw(s, "left", "commentLeft"), h = this.raw(s, "right", "commentRight");
      this.builder("/*" + c + s.text + h + "*/", s);
    }
    decl(s, c) {
      let h = this.raw(s, "between", "colon"), m = s.prop + h + this.rawValue(s, "value");
      s.important && (m += s.raws.important || " !important"), c && (m += ";"), this.builder(m, s);
    }
    document(s) {
      this.body(s);
    }
    raw(s, c, h) {
      let m;
      if (h || (h = c), c && (m = s.raws[c], typeof m < "u"))
        return m;
      let o = s.parent;
      if (h === "before" && (!o || o.type === "root" && o.first === s || o && o.type === "document"))
        return "";
      if (!o) return e[h];
      let p = s.root();
      if (p.rawCache || (p.rawCache = {}), typeof p.rawCache[h] < "u")
        return p.rawCache[h];
      if (h === "before" || h === "after")
        return this.beforeAfter(s, h);
      {
        let i = "raw" + t(h);
        this[i] ? m = this[i](p, s) : p.walk((f) => {
          if (m = f.raws[c], typeof m < "u") return !1;
        });
      }
      return typeof m > "u" && (m = e[h]), p.rawCache[h] = m, m;
    }
    rawBeforeClose(s) {
      let c;
      return s.walk((h) => {
        if (h.nodes && h.nodes.length > 0 && typeof h.raws.after < "u")
          return c = h.raws.after, c.includes(`
`) && (c = c.replace(/[^\n]+$/, "")), !1;
      }), c && (c = c.replace(/\S/g, "")), c;
    }
    rawBeforeComment(s, c) {
      let h;
      return s.walkComments((m) => {
        if (typeof m.raws.before < "u")
          return h = m.raws.before, h.includes(`
`) && (h = h.replace(/[^\n]+$/, "")), !1;
      }), typeof h > "u" ? h = this.raw(c, null, "beforeDecl") : h && (h = h.replace(/\S/g, "")), h;
    }
    rawBeforeDecl(s, c) {
      let h;
      return s.walkDecls((m) => {
        if (typeof m.raws.before < "u")
          return h = m.raws.before, h.includes(`
`) && (h = h.replace(/[^\n]+$/, "")), !1;
      }), typeof h > "u" ? h = this.raw(c, null, "beforeRule") : h && (h = h.replace(/\S/g, "")), h;
    }
    rawBeforeOpen(s) {
      let c;
      return s.walk((h) => {
        if (h.type !== "decl" && (c = h.raws.between, typeof c < "u"))
          return !1;
      }), c;
    }
    rawBeforeRule(s) {
      let c;
      return s.walk((h) => {
        if (h.nodes && (h.parent !== s || s.first !== h) && typeof h.raws.before < "u")
          return c = h.raws.before, c.includes(`
`) && (c = c.replace(/[^\n]+$/, "")), !1;
      }), c && (c = c.replace(/\S/g, "")), c;
    }
    rawColon(s) {
      let c;
      return s.walkDecls((h) => {
        if (typeof h.raws.between < "u")
          return c = h.raws.between.replace(/[^\s:]/g, ""), !1;
      }), c;
    }
    rawEmptyBody(s) {
      let c;
      return s.walk((h) => {
        if (h.nodes && h.nodes.length === 0 && (c = h.raws.after, typeof c < "u"))
          return !1;
      }), c;
    }
    rawIndent(s) {
      if (s.raws.indent) return s.raws.indent;
      let c;
      return s.walk((h) => {
        let m = h.parent;
        if (m && m !== s && m.parent && m.parent === s && typeof h.raws.before < "u") {
          let o = h.raws.before.split(`
`);
          return c = o[o.length - 1], c = c.replace(/\S/g, ""), !1;
        }
      }), c;
    }
    rawSemicolon(s) {
      let c;
      return s.walk((h) => {
        if (h.nodes && h.nodes.length && h.last.type === "decl" && (c = h.raws.semicolon, typeof c < "u"))
          return !1;
      }), c;
    }
    rawValue(s, c) {
      let h = s[c], m = s.raws[c];
      return m && m.value === h ? m.raw : h;
    }
    root(s) {
      this.body(s), s.raws.after && this.builder(s.raws.after);
    }
    rule(s) {
      this.block(s, this.rawValue(s, "selector")), s.raws.ownSemicolon && this.builder(s.raws.ownSemicolon, s, "end");
    }
    stringify(s, c) {
      if (!this[s.type])
        throw new Error(
          "Unknown AST node type " + s.type + ". Maybe you need to change PostCSS stringifier."
        );
      this[s.type](s, c);
    }
  }
  return Yt = r, r.default = r, Yt;
}
var Qt, _s;
function ht() {
  if (_s) return Qt;
  _s = 1;
  let e = Ui();
  function t(r, l) {
    new e(l).stringify(r);
  }
  return Qt = t, t.default = t, Qt;
}
var Xt, Ls;
function pt() {
  if (Ls) return Xt;
  Ls = 1;
  let { isClean: e, my: t } = $r(), r = Fr(), l = Ui(), s = ht();
  function c(m, o) {
    let p = new m.constructor();
    for (let i in m) {
      if (!Object.prototype.hasOwnProperty.call(m, i) || i === "proxyCache") continue;
      let f = m[i], a = typeof f;
      i === "parent" && a === "object" ? o && (p[i] = o) : i === "source" ? p[i] = f : Array.isArray(f) ? p[i] = f.map((n) => c(n, p)) : (a === "object" && f !== null && (f = c(f)), p[i] = f);
    }
    return p;
  }
  class h {
    constructor(o = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let p in o)
        if (p === "nodes") {
          this.nodes = [];
          for (let i of o[p])
            typeof i.clone == "function" ? this.append(i.clone()) : this.append(i);
        } else
          this[p] = o[p];
    }
    addToError(o) {
      if (o.postcssNode = this, o.stack && this.source && /\n\s{4}at /.test(o.stack)) {
        let p = this.source;
        o.stack = o.stack.replace(
          /\n\s{4}at /,
          `$&${p.input.from}:${p.start.line}:${p.start.column}$&`
        );
      }
      return o;
    }
    after(o) {
      return this.parent.insertAfter(this, o), this;
    }
    assign(o = {}) {
      for (let p in o)
        this[p] = o[p];
      return this;
    }
    before(o) {
      return this.parent.insertBefore(this, o), this;
    }
    cleanRaws(o) {
      delete this.raws.before, delete this.raws.after, o || delete this.raws.between;
    }
    clone(o = {}) {
      let p = c(this);
      for (let i in o)
        p[i] = o[i];
      return p;
    }
    cloneAfter(o = {}) {
      let p = this.clone(o);
      return this.parent.insertAfter(this, p), p;
    }
    cloneBefore(o = {}) {
      let p = this.clone(o);
      return this.parent.insertBefore(this, p), p;
    }
    error(o, p = {}) {
      if (this.source) {
        let { end: i, start: f } = this.rangeBy(p);
        return this.source.input.error(
          o,
          { column: f.column, line: f.line },
          { column: i.column, line: i.line },
          p
        );
      }
      return new r(o);
    }
    getProxyProcessor() {
      return {
        get(o, p) {
          return p === "proxyOf" ? o : p === "root" ? () => o.root().toProxy() : o[p];
        },
        set(o, p, i) {
          return o[p] === i || (o[p] = i, (p === "prop" || p === "value" || p === "name" || p === "params" || p === "important" || /* c8 ignore next */
          p === "text") && o.markDirty()), !0;
        }
      };
    }
    markDirty() {
      if (this[e]) {
        this[e] = !1;
        let o = this;
        for (; o = o.parent; )
          o[e] = !1;
      }
    }
    next() {
      if (!this.parent) return;
      let o = this.parent.index(this);
      return this.parent.nodes[o + 1];
    }
    positionBy(o, p) {
      let i = this.source.start;
      if (o.index)
        i = this.positionInside(o.index, p);
      else if (o.word) {
        p = this.toString();
        let f = p.indexOf(o.word);
        f !== -1 && (i = this.positionInside(f, p));
      }
      return i;
    }
    positionInside(o, p) {
      let i = p || this.toString(), f = this.source.start.column, a = this.source.start.line;
      for (let n = 0; n < o; n++)
        i[n] === `
` ? (f = 1, a += 1) : f += 1;
      return { column: f, line: a };
    }
    prev() {
      if (!this.parent) return;
      let o = this.parent.index(this);
      return this.parent.nodes[o - 1];
    }
    rangeBy(o) {
      let p = {
        column: this.source.start.column,
        line: this.source.start.line
      }, i = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: p.column + 1,
        line: p.line
      };
      if (o.word) {
        let f = this.toString(), a = f.indexOf(o.word);
        a !== -1 && (p = this.positionInside(a, f), i = this.positionInside(a + o.word.length, f));
      } else
        o.start ? p = {
          column: o.start.column,
          line: o.start.line
        } : o.index && (p = this.positionInside(o.index)), o.end ? i = {
          column: o.end.column,
          line: o.end.line
        } : typeof o.endIndex == "number" ? i = this.positionInside(o.endIndex) : o.index && (i = this.positionInside(o.index + 1));
      return (i.line < p.line || i.line === p.line && i.column <= p.column) && (i = { column: p.column + 1, line: p.line }), { end: i, start: p };
    }
    raw(o, p) {
      return new l().raw(this, o, p);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...o) {
      if (this.parent) {
        let p = this, i = !1;
        for (let f of o)
          f === this ? i = !0 : i ? (this.parent.insertAfter(p, f), p = f) : this.parent.insertBefore(p, f);
        i || this.remove();
      }
      return this;
    }
    root() {
      let o = this;
      for (; o.parent && o.parent.type !== "document"; )
        o = o.parent;
      return o;
    }
    toJSON(o, p) {
      let i = {}, f = p == null;
      p = p || /* @__PURE__ */ new Map();
      let a = 0;
      for (let n in this) {
        if (!Object.prototype.hasOwnProperty.call(this, n) || n === "parent" || n === "proxyCache") continue;
        let d = this[n];
        if (Array.isArray(d))
          i[n] = d.map((u) => typeof u == "object" && u.toJSON ? u.toJSON(null, p) : u);
        else if (typeof d == "object" && d.toJSON)
          i[n] = d.toJSON(null, p);
        else if (n === "source") {
          let u = p.get(d.input);
          u == null && (u = a, p.set(d.input, a), a++), i[n] = {
            end: d.end,
            inputId: u,
            start: d.start
          };
        } else
          i[n] = d;
      }
      return f && (i.inputs = [...p.keys()].map((n) => n.toJSON())), i;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(o = s) {
      o.stringify && (o = o.stringify);
      let p = "";
      return o(this, (i) => {
        p += i;
      }), p;
    }
    warn(o, p, i) {
      let f = { node: this };
      for (let a in i) f[a] = i[a];
      return o.warn(p, f);
    }
    get proxyOf() {
      return this;
    }
  }
  return Xt = h, h.default = h, Xt;
}
var Kt, Ds;
function dt() {
  if (Ds) return Kt;
  Ds = 1;
  let e = pt();
  class t extends e {
    constructor(l) {
      l && typeof l.value < "u" && typeof l.value != "string" && (l = { ...l, value: String(l.value) }), super(l), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Kt = t, t.default = t, Kt;
}
var Zt, Ts;
function Io() {
  if (Ts) return Zt;
  Ts = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Zt = { nanoid: (l = 21) => {
    let s = "", c = l;
    for (; c--; )
      s += e[Math.random() * 64 | 0];
    return s;
  }, customAlphabet: (l, s = 21) => (c = s) => {
    let h = "", m = c;
    for (; m--; )
      h += l[Math.random() * l.length | 0];
    return h;
  } }, Zt;
}
var er, Us;
function Fi() {
  if (Us) return er;
  Us = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = fe, { existsSync: r, readFileSync: l } = fe, { dirname: s, join: c } = fe;
  function h(o) {
    return Buffer ? Buffer.from(o, "base64").toString() : window.atob(o);
  }
  class m {
    constructor(p, i) {
      if (i.map === !1) return;
      this.loadAnnotation(p), this.inline = this.startWith(this.annotation, "data:");
      let f = i.map ? i.map.prev : void 0, a = this.loadMap(i.from, f);
      !this.mapFile && i.from && (this.mapFile = i.from), this.mapFile && (this.root = s(this.mapFile)), a && (this.text = a);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(p) {
      let i = /^data:application\/json;charset=utf-?8;base64,/, f = /^data:application\/json;base64,/, a = /^data:application\/json;charset=utf-?8,/, n = /^data:application\/json,/;
      if (a.test(p) || n.test(p))
        return decodeURIComponent(p.substr(RegExp.lastMatch.length));
      if (i.test(p) || f.test(p))
        return h(p.substr(RegExp.lastMatch.length));
      let d = p.match(/data:application\/json;([^,]+),/)[1];
      throw new Error("Unsupported source map encoding " + d);
    }
    getAnnotationURL(p) {
      return p.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    }
    isMap(p) {
      return typeof p != "object" ? !1 : typeof p.mappings == "string" || typeof p._mappings == "string" || Array.isArray(p.sections);
    }
    loadAnnotation(p) {
      let i = p.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!i) return;
      let f = p.lastIndexOf(i.pop()), a = p.indexOf("*/", f);
      f > -1 && a > -1 && (this.annotation = this.getAnnotationURL(p.substring(f, a)));
    }
    loadFile(p) {
      if (this.root = s(p), r(p))
        return this.mapFile = p, l(p, "utf-8").toString().trim();
    }
    loadMap(p, i) {
      if (i === !1) return !1;
      if (i) {
        if (typeof i == "string")
          return i;
        if (typeof i == "function") {
          let f = i(p);
          if (f) {
            let a = this.loadFile(f);
            if (!a)
              throw new Error(
                "Unable to load previous source map: " + f.toString()
              );
            return a;
          }
        } else {
          if (i instanceof e)
            return t.fromSourceMap(i).toString();
          if (i instanceof t)
            return i.toString();
          if (this.isMap(i))
            return JSON.stringify(i);
          throw new Error(
            "Unsupported previous source map format: " + i.toString()
          );
        }
      } else {
        if (this.inline)
          return this.decodeInline(this.annotation);
        if (this.annotation) {
          let f = this.annotation;
          return p && (f = c(s(p), f)), this.loadFile(f);
        }
      }
    }
    startWith(p, i) {
      return p ? p.substr(0, i.length) === i : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return er = m, m.default = m, er;
}
var tr, Fs;
function mt() {
  if (Fs) return tr;
  Fs = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = fe, { fileURLToPath: r, pathToFileURL: l } = fe, { isAbsolute: s, resolve: c } = fe, { nanoid: h } = /* @__PURE__ */ Io(), m = fe, o = Fr(), p = Fi(), i = Symbol("fromOffsetCache"), f = !!(e && t), a = !!(c && s);
  class n {
    constructor(u, g = {}) {
      if (u === null || typeof u > "u" || typeof u == "object" && !u.toString)
        throw new Error(`PostCSS received ${u} instead of CSS string`);
      if (this.css = u.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!a || /^\w+:\/\//.test(g.from) || s(g.from) ? this.file = g.from : this.file = c(g.from)), a && f) {
        let v = new p(this.css, g);
        if (v.text) {
          this.map = v;
          let b = v.consumer().file;
          !this.file && b && (this.file = this.mapResolve(b));
        }
      }
      this.file || (this.id = "<input css " + h(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(u, g, v, b = {}) {
      let S, x, w;
      if (g && typeof g == "object") {
        let C = g, O = v;
        if (typeof C.offset == "number") {
          let I = this.fromOffset(C.offset);
          g = I.line, v = I.col;
        } else
          g = C.line, v = C.column;
        if (typeof O.offset == "number") {
          let I = this.fromOffset(O.offset);
          x = I.line, w = I.col;
        } else
          x = O.line, w = O.column;
      } else if (!v) {
        let C = this.fromOffset(g);
        g = C.line, v = C.col;
      }
      let y = this.origin(g, v, x, w);
      return y ? S = new o(
        u,
        y.endLine === void 0 ? y.line : { column: y.column, line: y.line },
        y.endLine === void 0 ? y.column : { column: y.endColumn, line: y.endLine },
        y.source,
        y.file,
        b.plugin
      ) : S = new o(
        u,
        x === void 0 ? g : { column: v, line: g },
        x === void 0 ? v : { column: w, line: x },
        this.css,
        this.file,
        b.plugin
      ), S.input = { column: v, endColumn: w, endLine: x, line: g, source: this.css }, this.file && (l && (S.input.url = l(this.file).toString()), S.input.file = this.file), S;
    }
    fromOffset(u) {
      let g, v;
      if (this[i])
        v = this[i];
      else {
        let S = this.css.split(`
`);
        v = new Array(S.length);
        let x = 0;
        for (let w = 0, y = S.length; w < y; w++)
          v[w] = x, x += S[w].length + 1;
        this[i] = v;
      }
      g = v[v.length - 1];
      let b = 0;
      if (u >= g)
        b = v.length - 1;
      else {
        let S = v.length - 2, x;
        for (; b < S; )
          if (x = b + (S - b >> 1), u < v[x])
            S = x - 1;
          else if (u >= v[x + 1])
            b = x + 1;
          else {
            b = x;
            break;
          }
      }
      return {
        col: u - v[b] + 1,
        line: b + 1
      };
    }
    mapResolve(u) {
      return /^\w+:\/\//.test(u) ? u : c(this.map.consumer().sourceRoot || this.map.root || ".", u);
    }
    origin(u, g, v, b) {
      if (!this.map) return !1;
      let S = this.map.consumer(), x = S.originalPositionFor({ column: g, line: u });
      if (!x.source) return !1;
      let w;
      typeof v == "number" && (w = S.originalPositionFor({ column: b, line: v }));
      let y;
      s(x.source) ? y = l(x.source) : y = new URL(
        x.source,
        this.map.consumer().sourceRoot || l(this.map.mapFile)
      );
      let C = {
        column: x.column,
        endColumn: w && w.column,
        endLine: w && w.line,
        line: x.line,
        url: y.toString()
      };
      if (y.protocol === "file:")
        if (r)
          C.file = r(y);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let O = S.sourceContentFor(x.source);
      return O && (C.source = O), C;
    }
    toJSON() {
      let u = {};
      for (let g of ["hasBOM", "css", "file", "id"])
        this[g] != null && (u[g] = this[g]);
      return this.map && (u.map = { ...this.map }, u.map.consumerCache && (u.map.consumerCache = void 0)), u;
    }
    get from() {
      return this.file || this.id;
    }
  }
  return tr = n, n.default = n, m && m.registerInput && m.registerInput(n), tr;
}
var rr, $s;
function $i() {
  if ($s) return rr;
  $s = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = fe, { dirname: r, relative: l, resolve: s, sep: c } = fe, { pathToFileURL: h } = fe, m = mt(), o = !!(e && t), p = !!(r && s && l && c);
  class i {
    constructor(a, n, d, u) {
      this.stringify = a, this.mapOpts = d.map || {}, this.root = n, this.opts = d, this.css = u, this.originalCSS = u, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute, this.memoizedFileURLs = /* @__PURE__ */ new Map(), this.memoizedPaths = /* @__PURE__ */ new Map(), this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let a;
      this.isInline() ? a = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? a = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? a = this.mapOpts.annotation(this.opts.to, this.root) : a = this.outputFile() + ".map";
      let n = `
`;
      this.css.includes(`\r
`) && (n = `\r
`), this.css += n + "/*# sourceMappingURL=" + a + " */";
    }
    applyPrevMaps() {
      for (let a of this.previous()) {
        let n = this.toUrl(this.path(a.file)), d = a.root || r(a.file), u;
        this.mapOpts.sourcesContent === !1 ? (u = new e(a.text), u.sourcesContent && (u.sourcesContent = null)) : u = a.consumer(), this.map.applySourceMap(u, n, this.toUrl(this.path(d)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation !== !1)
        if (this.root) {
          let a;
          for (let n = this.root.nodes.length - 1; n >= 0; n--)
            a = this.root.nodes[n], a.type === "comment" && a.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(n);
        } else this.css && (this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, ""));
    }
    generate() {
      if (this.clearAnnotation(), p && o && this.isMap())
        return this.generateMap();
      {
        let a = "";
        return this.stringify(this.root, (n) => {
          a += n;
        }), [a];
      }
    }
    generateMap() {
      if (this.root)
        this.generateString();
      else if (this.previous().length === 1) {
        let a = this.previous()[0].consumer();
        a.file = this.outputFile(), this.map = t.fromSourceMap(a, {
          ignoreInvalidMapping: !0
        });
      } else
        this.map = new t({
          file: this.outputFile(),
          ignoreInvalidMapping: !0
        }), this.map.addMapping({
          generated: { column: 0, line: 1 },
          original: { column: 0, line: 1 },
          source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
        });
      return this.isSourcesContent() && this.setSourcesContent(), this.root && this.previous().length > 0 && this.applyPrevMaps(), this.isAnnotation() && this.addAnnotation(), this.isInline() ? [this.css] : [this.css, this.map];
    }
    generateString() {
      this.css = "", this.map = new t({
        file: this.outputFile(),
        ignoreInvalidMapping: !0
      });
      let a = 1, n = 1, d = "<no source>", u = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      }, g, v;
      this.stringify(this.root, (b, S, x) => {
        if (this.css += b, S && x !== "end" && (u.generated.line = a, u.generated.column = n - 1, S.source && S.source.start ? (u.source = this.sourcePath(S), u.original.line = S.source.start.line, u.original.column = S.source.start.column - 1, this.map.addMapping(u)) : (u.source = d, u.original.line = 1, u.original.column = 0, this.map.addMapping(u))), g = b.match(/\n/g), g ? (a += g.length, v = b.lastIndexOf(`
`), n = b.length - v) : n += b.length, S && x !== "start") {
          let w = S.parent || { raws: {} };
          (!(S.type === "decl" || S.type === "atrule" && !S.nodes) || S !== w.last || w.raws.semicolon) && (S.source && S.source.end ? (u.source = this.sourcePath(S), u.original.line = S.source.end.line, u.original.column = S.source.end.column - 1, u.generated.line = a, u.generated.column = n - 2, this.map.addMapping(u)) : (u.source = d, u.original.line = 1, u.original.column = 0, u.generated.line = a, u.generated.column = n - 1, this.map.addMapping(u)));
        }
      });
    }
    isAnnotation() {
      return this.isInline() ? !0 : typeof this.mapOpts.annotation < "u" ? this.mapOpts.annotation : this.previous().length ? this.previous().some((a) => a.annotation) : !0;
    }
    isInline() {
      if (typeof this.mapOpts.inline < "u")
        return this.mapOpts.inline;
      let a = this.mapOpts.annotation;
      return typeof a < "u" && a !== !0 ? !1 : this.previous().length ? this.previous().some((n) => n.inline) : !0;
    }
    isMap() {
      return typeof this.opts.map < "u" ? !!this.opts.map : this.previous().length > 0;
    }
    isSourcesContent() {
      return typeof this.mapOpts.sourcesContent < "u" ? this.mapOpts.sourcesContent : this.previous().length ? this.previous().some((a) => a.withContent()) : !0;
    }
    outputFile() {
      return this.opts.to ? this.path(this.opts.to) : this.opts.from ? this.path(this.opts.from) : "to.css";
    }
    path(a) {
      if (this.mapOpts.absolute || a.charCodeAt(0) === 60 || /^\w+:\/\//.test(a)) return a;
      let n = this.memoizedPaths.get(a);
      if (n) return n;
      let d = this.opts.to ? r(this.opts.to) : ".";
      typeof this.mapOpts.annotation == "string" && (d = r(s(d, this.mapOpts.annotation)));
      let u = l(d, a);
      return this.memoizedPaths.set(a, u), u;
    }
    previous() {
      if (!this.previousMaps)
        if (this.previousMaps = [], this.root)
          this.root.walk((a) => {
            if (a.source && a.source.input.map) {
              let n = a.source.input.map;
              this.previousMaps.includes(n) || this.previousMaps.push(n);
            }
          });
        else {
          let a = new m(this.originalCSS, this.opts);
          a.map && this.previousMaps.push(a.map);
        }
      return this.previousMaps;
    }
    setSourcesContent() {
      let a = {};
      if (this.root)
        this.root.walk((n) => {
          if (n.source) {
            let d = n.source.input.from;
            if (d && !a[d]) {
              a[d] = !0;
              let u = this.usesFileUrls ? this.toFileUrl(d) : this.toUrl(this.path(d));
              this.map.setSourceContent(u, n.source.input.css);
            }
          }
        });
      else if (this.css) {
        let n = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
        this.map.setSourceContent(n, this.css);
      }
    }
    sourcePath(a) {
      return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(a.source.input.from) : this.toUrl(this.path(a.source.input.from));
    }
    toBase64(a) {
      return Buffer ? Buffer.from(a).toString("base64") : window.btoa(unescape(encodeURIComponent(a)));
    }
    toFileUrl(a) {
      let n = this.memoizedFileURLs.get(a);
      if (n) return n;
      if (h) {
        let d = h(a).toString();
        return this.memoizedFileURLs.set(a, d), d;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(a) {
      let n = this.memoizedURLs.get(a);
      if (n) return n;
      c === "\\" && (a = a.replace(/\\/g, "/"));
      let d = encodeURI(a).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(a, d), d;
    }
  }
  return rr = i, rr;
}
var sr, zs;
function gt() {
  if (zs) return sr;
  zs = 1;
  let e = pt();
  class t extends e {
    constructor(l) {
      super(l), this.type = "comment";
    }
  }
  return sr = t, t.default = t, sr;
}
var ir, Bs;
function xe() {
  if (Bs) return ir;
  Bs = 1;
  let { isClean: e, my: t } = $r(), r = dt(), l = gt(), s = pt(), c, h, m, o;
  function p(a) {
    return a.map((n) => (n.nodes && (n.nodes = p(n.nodes)), delete n.source, n));
  }
  function i(a) {
    if (a[e] = !1, a.proxyOf.nodes)
      for (let n of a.proxyOf.nodes)
        i(n);
  }
  class f extends s {
    append(...n) {
      for (let d of n) {
        let u = this.normalize(d, this.last);
        for (let g of u) this.proxyOf.nodes.push(g);
      }
      return this.markDirty(), this;
    }
    cleanRaws(n) {
      if (super.cleanRaws(n), this.nodes)
        for (let d of this.nodes) d.cleanRaws(n);
    }
    each(n) {
      if (!this.proxyOf.nodes) return;
      let d = this.getIterator(), u, g;
      for (; this.indexes[d] < this.proxyOf.nodes.length && (u = this.indexes[d], g = n(this.proxyOf.nodes[u], u), g !== !1); )
        this.indexes[d] += 1;
      return delete this.indexes[d], g;
    }
    every(n) {
      return this.nodes.every(n);
    }
    getIterator() {
      this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach += 1;
      let n = this.lastEach;
      return this.indexes[n] = 0, n;
    }
    getProxyProcessor() {
      return {
        get(n, d) {
          return d === "proxyOf" ? n : n[d] ? d === "each" || typeof d == "string" && d.startsWith("walk") ? (...u) => n[d](
            ...u.map((g) => typeof g == "function" ? (v, b) => g(v.toProxy(), b) : g)
          ) : d === "every" || d === "some" ? (u) => n[d](
            (g, ...v) => u(g.toProxy(), ...v)
          ) : d === "root" ? () => n.root().toProxy() : d === "nodes" ? n.nodes.map((u) => u.toProxy()) : d === "first" || d === "last" ? n[d].toProxy() : n[d] : n[d];
        },
        set(n, d, u) {
          return n[d] === u || (n[d] = u, (d === "name" || d === "params" || d === "selector") && n.markDirty()), !0;
        }
      };
    }
    index(n) {
      return typeof n == "number" ? n : (n.proxyOf && (n = n.proxyOf), this.proxyOf.nodes.indexOf(n));
    }
    insertAfter(n, d) {
      let u = this.index(n), g = this.normalize(d, this.proxyOf.nodes[u]).reverse();
      u = this.index(n);
      for (let b of g) this.proxyOf.nodes.splice(u + 1, 0, b);
      let v;
      for (let b in this.indexes)
        v = this.indexes[b], u < v && (this.indexes[b] = v + g.length);
      return this.markDirty(), this;
    }
    insertBefore(n, d) {
      let u = this.index(n), g = u === 0 ? "prepend" : !1, v = this.normalize(d, this.proxyOf.nodes[u], g).reverse();
      u = this.index(n);
      for (let S of v) this.proxyOf.nodes.splice(u, 0, S);
      let b;
      for (let S in this.indexes)
        b = this.indexes[S], u <= b && (this.indexes[S] = b + v.length);
      return this.markDirty(), this;
    }
    normalize(n, d) {
      if (typeof n == "string")
        n = p(c(n).nodes);
      else if (typeof n > "u")
        n = [];
      else if (Array.isArray(n)) {
        n = n.slice(0);
        for (let g of n)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (n.type === "root" && this.type !== "document") {
        n = n.nodes.slice(0);
        for (let g of n)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (n.type)
        n = [n];
      else if (n.prop) {
        if (typeof n.value > "u")
          throw new Error("Value field is missed in node creation");
        typeof n.value != "string" && (n.value = String(n.value)), n = [new r(n)];
      } else if (n.selector)
        n = [new h(n)];
      else if (n.name)
        n = [new m(n)];
      else if (n.text)
        n = [new l(n)];
      else
        throw new Error("Unknown node type in node creation");
      return n.map((g) => (g[t] || f.rebuild(g), g = g.proxyOf, g.parent && g.parent.removeChild(g), g[e] && i(g), typeof g.raws.before > "u" && d && typeof d.raws.before < "u" && (g.raws.before = d.raws.before.replace(/\S/g, "")), g.parent = this.proxyOf, g));
    }
    prepend(...n) {
      n = n.reverse();
      for (let d of n) {
        let u = this.normalize(d, this.first, "prepend").reverse();
        for (let g of u) this.proxyOf.nodes.unshift(g);
        for (let g in this.indexes)
          this.indexes[g] = this.indexes[g] + u.length;
      }
      return this.markDirty(), this;
    }
    push(n) {
      return n.parent = this, this.proxyOf.nodes.push(n), this;
    }
    removeAll() {
      for (let n of this.proxyOf.nodes) n.parent = void 0;
      return this.proxyOf.nodes = [], this.markDirty(), this;
    }
    removeChild(n) {
      n = this.index(n), this.proxyOf.nodes[n].parent = void 0, this.proxyOf.nodes.splice(n, 1);
      let d;
      for (let u in this.indexes)
        d = this.indexes[u], d >= n && (this.indexes[u] = d - 1);
      return this.markDirty(), this;
    }
    replaceValues(n, d, u) {
      return u || (u = d, d = {}), this.walkDecls((g) => {
        d.props && !d.props.includes(g.prop) || d.fast && !g.value.includes(d.fast) || (g.value = g.value.replace(n, u));
      }), this.markDirty(), this;
    }
    some(n) {
      return this.nodes.some(n);
    }
    walk(n) {
      return this.each((d, u) => {
        let g;
        try {
          g = n(d, u);
        } catch (v) {
          throw d.addToError(v);
        }
        return g !== !1 && d.walk && (g = d.walk(n)), g;
      });
    }
    walkAtRules(n, d) {
      return d ? n instanceof RegExp ? this.walk((u, g) => {
        if (u.type === "atrule" && n.test(u.name))
          return d(u, g);
      }) : this.walk((u, g) => {
        if (u.type === "atrule" && u.name === n)
          return d(u, g);
      }) : (d = n, this.walk((u, g) => {
        if (u.type === "atrule")
          return d(u, g);
      }));
    }
    walkComments(n) {
      return this.walk((d, u) => {
        if (d.type === "comment")
          return n(d, u);
      });
    }
    walkDecls(n, d) {
      return d ? n instanceof RegExp ? this.walk((u, g) => {
        if (u.type === "decl" && n.test(u.prop))
          return d(u, g);
      }) : this.walk((u, g) => {
        if (u.type === "decl" && u.prop === n)
          return d(u, g);
      }) : (d = n, this.walk((u, g) => {
        if (u.type === "decl")
          return d(u, g);
      }));
    }
    walkRules(n, d) {
      return d ? n instanceof RegExp ? this.walk((u, g) => {
        if (u.type === "rule" && n.test(u.selector))
          return d(u, g);
      }) : this.walk((u, g) => {
        if (u.type === "rule" && u.selector === n)
          return d(u, g);
      }) : (d = n, this.walk((u, g) => {
        if (u.type === "rule")
          return d(u, g);
      }));
    }
    get first() {
      if (this.proxyOf.nodes)
        return this.proxyOf.nodes[0];
    }
    get last() {
      if (this.proxyOf.nodes)
        return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
    }
  }
  return f.registerParse = (a) => {
    c = a;
  }, f.registerRule = (a) => {
    h = a;
  }, f.registerAtRule = (a) => {
    m = a;
  }, f.registerRoot = (a) => {
    o = a;
  }, ir = f, f.default = f, f.rebuild = (a) => {
    a.type === "atrule" ? Object.setPrototypeOf(a, m.prototype) : a.type === "rule" ? Object.setPrototypeOf(a, h.prototype) : a.type === "decl" ? Object.setPrototypeOf(a, r.prototype) : a.type === "comment" ? Object.setPrototypeOf(a, l.prototype) : a.type === "root" && Object.setPrototypeOf(a, o.prototype), a[t] = !0, a.nodes && a.nodes.forEach((n) => {
      f.rebuild(n);
    });
  }, ir;
}
var nr, Ws;
function zr() {
  if (Ws) return nr;
  Ws = 1;
  let e = xe(), t, r;
  class l extends e {
    constructor(c) {
      super({ type: "document", ...c }), this.nodes || (this.nodes = []);
    }
    toResult(c = {}) {
      return new t(new r(), this, c).stringify();
    }
  }
  return l.registerLazyResult = (s) => {
    t = s;
  }, l.registerProcessor = (s) => {
    r = s;
  }, nr = l, l.default = l, nr;
}
var or, qs;
function zi() {
  if (qs) return or;
  qs = 1;
  let e = {};
  return or = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, or;
}
var ar, js;
function Bi() {
  if (js) return ar;
  js = 1;
  class e {
    constructor(r, l = {}) {
      if (this.type = "warning", this.text = r, l.node && l.node.source) {
        let s = l.node.rangeBy(l);
        this.line = s.start.line, this.column = s.start.column, this.endLine = s.end.line, this.endColumn = s.end.column;
      }
      for (let s in l) this[s] = l[s];
    }
    toString() {
      return this.node ? this.node.error(this.text, {
        index: this.index,
        plugin: this.plugin,
        word: this.word
      }).message : this.plugin ? this.plugin + ": " + this.text : this.text;
    }
  }
  return ar = e, e.default = e, ar;
}
var lr, Hs;
function Br() {
  if (Hs) return lr;
  Hs = 1;
  let e = Bi();
  class t {
    constructor(l, s, c) {
      this.processor = l, this.messages = [], this.root = s, this.opts = c, this.css = void 0, this.map = void 0;
    }
    toString() {
      return this.css;
    }
    warn(l, s = {}) {
      s.plugin || this.lastPlugin && this.lastPlugin.postcssPlugin && (s.plugin = this.lastPlugin.postcssPlugin);
      let c = new e(l, s);
      return this.messages.push(c), c;
    }
    warnings() {
      return this.messages.filter((l) => l.type === "warning");
    }
    get content() {
      return this.css;
    }
  }
  return lr = t, t.default = t, lr;
}
var ur, Vs;
function Ao() {
  if (Vs) return ur;
  Vs = 1;
  const e = 39, t = 34, r = 92, l = 47, s = 10, c = 32, h = 12, m = 9, o = 13, p = 91, i = 93, f = 40, a = 41, n = 123, d = 125, u = 59, g = 42, v = 58, b = 64, S = /[\t\n\f\r "#'()/;[\\\]{}]/g, x = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, y = /[\da-f]/i;
  return ur = function(O, I = {}) {
    let M = O.css.valueOf(), P = I.ignoreErrors, N, R, ae, se, F, U, G, X, J, $, ge = M.length, E = 0, he = [], ne = [];
    function _e() {
      return E;
    }
    function Z(k) {
      throw O.error("Unclosed " + k, E);
    }
    function le() {
      return ne.length === 0 && E >= ge;
    }
    function be(k) {
      if (ne.length) return ne.pop();
      if (E >= ge) return;
      let Y = k ? k.ignoreUnclosed : !1;
      switch (N = M.charCodeAt(E), N) {
        case s:
        case c:
        case m:
        case o:
        case h: {
          R = E;
          do
            R += 1, N = M.charCodeAt(R);
          while (N === c || N === s || N === m || N === o || N === h);
          $ = ["space", M.slice(E, R)], E = R - 1;
          break;
        }
        case p:
        case i:
        case n:
        case d:
        case v:
        case u:
        case a: {
          let z = String.fromCharCode(N);
          $ = [z, z, E];
          break;
        }
        case f: {
          if (X = he.length ? he.pop()[1] : "", J = M.charCodeAt(E + 1), X === "url" && J !== e && J !== t && J !== c && J !== s && J !== m && J !== h && J !== o) {
            R = E;
            do {
              if (U = !1, R = M.indexOf(")", R + 1), R === -1)
                if (P || Y) {
                  R = E;
                  break;
                } else
                  Z("bracket");
              for (G = R; M.charCodeAt(G - 1) === r; )
                G -= 1, U = !U;
            } while (U);
            $ = ["brackets", M.slice(E, R + 1), E, R], E = R;
          } else
            R = M.indexOf(")", E + 1), se = M.slice(E, R + 1), R === -1 || w.test(se) ? $ = ["(", "(", E] : ($ = ["brackets", se, E, R], E = R);
          break;
        }
        case e:
        case t: {
          ae = N === e ? "'" : '"', R = E;
          do {
            if (U = !1, R = M.indexOf(ae, R + 1), R === -1)
              if (P || Y) {
                R = E + 1;
                break;
              } else
                Z("string");
            for (G = R; M.charCodeAt(G - 1) === r; )
              G -= 1, U = !U;
          } while (U);
          $ = ["string", M.slice(E, R + 1), E, R], E = R;
          break;
        }
        case b: {
          S.lastIndex = E + 1, S.test(M), S.lastIndex === 0 ? R = M.length - 1 : R = S.lastIndex - 2, $ = ["at-word", M.slice(E, R + 1), E, R], E = R;
          break;
        }
        case r: {
          for (R = E, F = !0; M.charCodeAt(R + 1) === r; )
            R += 1, F = !F;
          if (N = M.charCodeAt(R + 1), F && N !== l && N !== c && N !== s && N !== m && N !== o && N !== h && (R += 1, y.test(M.charAt(R)))) {
            for (; y.test(M.charAt(R + 1)); )
              R += 1;
            M.charCodeAt(R + 1) === c && (R += 1);
          }
          $ = ["word", M.slice(E, R + 1), E, R], E = R;
          break;
        }
        default: {
          N === l && M.charCodeAt(E + 1) === g ? (R = M.indexOf("*/", E + 2) + 1, R === 0 && (P || Y ? R = M.length : Z("comment")), $ = ["comment", M.slice(E, R + 1), E, R], E = R) : (x.lastIndex = E + 1, x.test(M), x.lastIndex === 0 ? R = M.length - 1 : R = x.lastIndex - 2, $ = ["word", M.slice(E, R + 1), E, R], he.push($), E = R);
          break;
        }
      }
      return E++, $;
    }
    function ye(k) {
      ne.push(k);
    }
    return {
      back: ye,
      endOfFile: le,
      nextToken: be,
      position: _e
    };
  }, ur;
}
var cr, Gs;
function Wr() {
  if (Gs) return cr;
  Gs = 1;
  let e = xe();
  class t extends e {
    constructor(l) {
      super(l), this.type = "atrule";
    }
    append(...l) {
      return this.proxyOf.nodes || (this.nodes = []), super.append(...l);
    }
    prepend(...l) {
      return this.proxyOf.nodes || (this.nodes = []), super.prepend(...l);
    }
  }
  return cr = t, t.default = t, e.registerAtRule(t), cr;
}
var fr, Js;
function Be() {
  if (Js) return fr;
  Js = 1;
  let e = xe(), t, r;
  class l extends e {
    constructor(c) {
      super(c), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(c, h, m) {
      let o = super.normalize(c);
      if (h) {
        if (m === "prepend")
          this.nodes.length > 1 ? h.raws.before = this.nodes[1].raws.before : delete h.raws.before;
        else if (this.first !== h)
          for (let p of o)
            p.raws.before = h.raws.before;
      }
      return o;
    }
    removeChild(c, h) {
      let m = this.index(c);
      return !h && m === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[m].raws.before), super.removeChild(c);
    }
    toResult(c = {}) {
      return new t(new r(), this, c).stringify();
    }
  }
  return l.registerLazyResult = (s) => {
    t = s;
  }, l.registerProcessor = (s) => {
    r = s;
  }, fr = l, l.default = l, e.registerRoot(l), fr;
}
var hr, Ys;
function Wi() {
  if (Ys) return hr;
  Ys = 1;
  let e = {
    comma(t) {
      return e.split(t, [","], !0);
    },
    space(t) {
      let r = [" ", `
`, "	"];
      return e.split(t, r);
    },
    split(t, r, l) {
      let s = [], c = "", h = !1, m = 0, o = !1, p = "", i = !1;
      for (let f of t)
        i ? i = !1 : f === "\\" ? i = !0 : o ? f === p && (o = !1) : f === '"' || f === "'" ? (o = !0, p = f) : f === "(" ? m += 1 : f === ")" ? m > 0 && (m -= 1) : m === 0 && r.includes(f) && (h = !0), h ? (c !== "" && s.push(c.trim()), c = "", h = !1) : c += f;
      return (l || c !== "") && s.push(c.trim()), s;
    }
  };
  return hr = e, e.default = e, hr;
}
var pr, Qs;
function qr() {
  if (Qs) return pr;
  Qs = 1;
  let e = xe(), t = Wi();
  class r extends e {
    constructor(s) {
      super(s), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(s) {
      let c = this.selector ? this.selector.match(/,\s*/) : null, h = c ? c[0] : "," + this.raw("between", "beforeOpen");
      this.selector = s.join(h);
    }
  }
  return pr = r, r.default = r, e.registerRule(r), pr;
}
var dr, Xs;
function No() {
  if (Xs) return dr;
  Xs = 1;
  let e = dt(), t = Ao(), r = gt(), l = Wr(), s = Be(), c = qr();
  const h = {
    empty: !0,
    space: !0
  };
  function m(p) {
    for (let i = p.length - 1; i >= 0; i--) {
      let f = p[i], a = f[3] || f[2];
      if (a) return a;
    }
  }
  class o {
    constructor(i) {
      this.input = i, this.root = new s(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: i, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(i) {
      let f = new l();
      f.name = i[1].slice(1), f.name === "" && this.unnamedAtrule(f, i), this.init(f, i[2]);
      let a, n, d, u = !1, g = !1, v = [], b = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (i = this.tokenizer.nextToken(), a = i[0], a === "(" || a === "[" ? b.push(a === "(" ? ")" : "]") : a === "{" && b.length > 0 ? b.push("}") : a === b[b.length - 1] && b.pop(), b.length === 0)
          if (a === ";") {
            f.source.end = this.getPosition(i[2]), f.source.end.offset++, this.semicolon = !0;
            break;
          } else if (a === "{") {
            g = !0;
            break;
          } else if (a === "}") {
            if (v.length > 0) {
              for (d = v.length - 1, n = v[d]; n && n[0] === "space"; )
                n = v[--d];
              n && (f.source.end = this.getPosition(n[3] || n[2]), f.source.end.offset++);
            }
            this.end(i);
            break;
          } else
            v.push(i);
        else
          v.push(i);
        if (this.tokenizer.endOfFile()) {
          u = !0;
          break;
        }
      }
      f.raws.between = this.spacesAndCommentsFromEnd(v), v.length ? (f.raws.afterName = this.spacesAndCommentsFromStart(v), this.raw(f, "params", v), u && (i = v[v.length - 1], f.source.end = this.getPosition(i[3] || i[2]), f.source.end.offset++, this.spaces = f.raws.between, f.raws.between = "")) : (f.raws.afterName = "", f.params = ""), g && (f.nodes = [], this.current = f);
    }
    checkMissedSemicolon(i) {
      let f = this.colon(i);
      if (f === !1) return;
      let a = 0, n;
      for (let d = f - 1; d >= 0 && (n = i[d], !(n[0] !== "space" && (a += 1, a === 2))); d--)
        ;
      throw this.input.error(
        "Missed semicolon",
        n[0] === "word" ? n[3] + 1 : n[2]
      );
    }
    colon(i) {
      let f = 0, a, n, d;
      for (let [u, g] of i.entries()) {
        if (a = g, n = a[0], n === "(" && (f += 1), n === ")" && (f -= 1), f === 0 && n === ":")
          if (!d)
            this.doubleColon(a);
          else {
            if (d[0] === "word" && d[1] === "progid")
              continue;
            return u;
          }
        d = a;
      }
      return !1;
    }
    comment(i) {
      let f = new r();
      this.init(f, i[2]), f.source.end = this.getPosition(i[3] || i[2]), f.source.end.offset++;
      let a = i[1].slice(2, -2);
      if (/^\s*$/.test(a))
        f.text = "", f.raws.left = a, f.raws.right = "";
      else {
        let n = a.match(/^(\s*)([^]*\S)(\s*)$/);
        f.text = n[2], f.raws.left = n[1], f.raws.right = n[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(i, f) {
      let a = new e();
      this.init(a, i[0][2]);
      let n = i[i.length - 1];
      for (n[0] === ";" && (this.semicolon = !0, i.pop()), a.source.end = this.getPosition(
        n[3] || n[2] || m(i)
      ), a.source.end.offset++; i[0][0] !== "word"; )
        i.length === 1 && this.unknownWord(i), a.raws.before += i.shift()[1];
      for (a.source.start = this.getPosition(i[0][2]), a.prop = ""; i.length; ) {
        let b = i[0][0];
        if (b === ":" || b === "space" || b === "comment")
          break;
        a.prop += i.shift()[1];
      }
      a.raws.between = "";
      let d;
      for (; i.length; )
        if (d = i.shift(), d[0] === ":") {
          a.raws.between += d[1];
          break;
        } else
          d[0] === "word" && /\w/.test(d[1]) && this.unknownWord([d]), a.raws.between += d[1];
      (a.prop[0] === "_" || a.prop[0] === "*") && (a.raws.before += a.prop[0], a.prop = a.prop.slice(1));
      let u = [], g;
      for (; i.length && (g = i[0][0], !(g !== "space" && g !== "comment")); )
        u.push(i.shift());
      this.precheckMissedSemicolon(i);
      for (let b = i.length - 1; b >= 0; b--) {
        if (d = i[b], d[1].toLowerCase() === "!important") {
          a.important = !0;
          let S = this.stringFrom(i, b);
          S = this.spacesFromEnd(i) + S, S !== " !important" && (a.raws.important = S);
          break;
        } else if (d[1].toLowerCase() === "important") {
          let S = i.slice(0), x = "";
          for (let w = b; w > 0; w--) {
            let y = S[w][0];
            if (x.trim().indexOf("!") === 0 && y !== "space")
              break;
            x = S.pop()[1] + x;
          }
          x.trim().indexOf("!") === 0 && (a.important = !0, a.raws.important = x, i = S);
        }
        if (d[0] !== "space" && d[0] !== "comment")
          break;
      }
      i.some((b) => b[0] !== "space" && b[0] !== "comment") && (a.raws.between += u.map((b) => b[1]).join(""), u = []), this.raw(a, "value", u.concat(i), f), a.value.includes(":") && !f && this.checkMissedSemicolon(i);
    }
    doubleColon(i) {
      throw this.input.error(
        "Double colon",
        { offset: i[2] },
        { offset: i[2] + i[1].length }
      );
    }
    emptyRule(i) {
      let f = new c();
      this.init(f, i[2]), f.selector = "", f.raws.between = "", this.current = f;
    }
    end(i) {
      this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.semicolon = !1, this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.spaces = "", this.current.parent ? (this.current.source.end = this.getPosition(i[2]), this.current.source.end.offset++, this.current = this.current.parent) : this.unexpectedClose(i);
    }
    endFile() {
      this.current.parent && this.unclosedBlock(), this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.root.source.end = this.getPosition(this.tokenizer.position());
    }
    freeSemicolon(i) {
      if (this.spaces += i[1], this.current.nodes) {
        let f = this.current.nodes[this.current.nodes.length - 1];
        f && f.type === "rule" && !f.raws.ownSemicolon && (f.raws.ownSemicolon = this.spaces, this.spaces = "");
      }
    }
    // Helpers
    getPosition(i) {
      let f = this.input.fromOffset(i);
      return {
        column: f.col,
        line: f.line,
        offset: i
      };
    }
    init(i, f) {
      this.current.push(i), i.source = {
        input: this.input,
        start: this.getPosition(f)
      }, i.raws.before = this.spaces, this.spaces = "", i.type !== "comment" && (this.semicolon = !1);
    }
    other(i) {
      let f = !1, a = null, n = !1, d = null, u = [], g = i[1].startsWith("--"), v = [], b = i;
      for (; b; ) {
        if (a = b[0], v.push(b), a === "(" || a === "[")
          d || (d = b), u.push(a === "(" ? ")" : "]");
        else if (g && n && a === "{")
          d || (d = b), u.push("}");
        else if (u.length === 0)
          if (a === ";")
            if (n) {
              this.decl(v, g);
              return;
            } else
              break;
          else if (a === "{") {
            this.rule(v);
            return;
          } else if (a === "}") {
            this.tokenizer.back(v.pop()), f = !0;
            break;
          } else a === ":" && (n = !0);
        else a === u[u.length - 1] && (u.pop(), u.length === 0 && (d = null));
        b = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (f = !0), u.length > 0 && this.unclosedBracket(d), f && n) {
        if (!g)
          for (; v.length && (b = v[v.length - 1][0], !(b !== "space" && b !== "comment")); )
            this.tokenizer.back(v.pop());
        this.decl(v, g);
      } else
        this.unknownWord(v);
    }
    parse() {
      let i;
      for (; !this.tokenizer.endOfFile(); )
        switch (i = this.tokenizer.nextToken(), i[0]) {
          case "space":
            this.spaces += i[1];
            break;
          case ";":
            this.freeSemicolon(i);
            break;
          case "}":
            this.end(i);
            break;
          case "comment":
            this.comment(i);
            break;
          case "at-word":
            this.atrule(i);
            break;
          case "{":
            this.emptyRule(i);
            break;
          default:
            this.other(i);
            break;
        }
      this.endFile();
    }
    precheckMissedSemicolon() {
    }
    raw(i, f, a, n) {
      let d, u, g = a.length, v = "", b = !0, S, x;
      for (let w = 0; w < g; w += 1)
        d = a[w], u = d[0], u === "space" && w === g - 1 && !n ? b = !1 : u === "comment" ? (x = a[w - 1] ? a[w - 1][0] : "empty", S = a[w + 1] ? a[w + 1][0] : "empty", !h[x] && !h[S] ? v.slice(-1) === "," ? b = !1 : v += d[1] : b = !1) : v += d[1];
      if (!b) {
        let w = a.reduce((y, C) => y + C[1], "");
        i.raws[f] = { raw: w, value: v };
      }
      i[f] = v;
    }
    rule(i) {
      i.pop();
      let f = new c();
      this.init(f, i[0][2]), f.raws.between = this.spacesAndCommentsFromEnd(i), this.raw(f, "selector", i), this.current = f;
    }
    spacesAndCommentsFromEnd(i) {
      let f, a = "";
      for (; i.length && (f = i[i.length - 1][0], !(f !== "space" && f !== "comment")); )
        a = i.pop()[1] + a;
      return a;
    }
    // Errors
    spacesAndCommentsFromStart(i) {
      let f, a = "";
      for (; i.length && (f = i[0][0], !(f !== "space" && f !== "comment")); )
        a += i.shift()[1];
      return a;
    }
    spacesFromEnd(i) {
      let f, a = "";
      for (; i.length && (f = i[i.length - 1][0], f === "space"); )
        a = i.pop()[1] + a;
      return a;
    }
    stringFrom(i, f) {
      let a = "";
      for (let n = f; n < i.length; n++)
        a += i[n][1];
      return i.splice(f, i.length - f), a;
    }
    unclosedBlock() {
      let i = this.current.source.start;
      throw this.input.error("Unclosed block", i.line, i.column);
    }
    unclosedBracket(i) {
      throw this.input.error(
        "Unclosed bracket",
        { offset: i[2] },
        { offset: i[2] + 1 }
      );
    }
    unexpectedClose(i) {
      throw this.input.error(
        "Unexpected }",
        { offset: i[2] },
        { offset: i[2] + 1 }
      );
    }
    unknownWord(i) {
      throw this.input.error(
        "Unknown word",
        { offset: i[0][2] },
        { offset: i[0][2] + i[0][1].length }
      );
    }
    unnamedAtrule(i, f) {
      throw this.input.error(
        "At-rule without name",
        { offset: f[2] },
        { offset: f[2] + f[1].length }
      );
    }
  }
  return dr = o, dr;
}
var mr, Ks;
function jr() {
  if (Ks) return mr;
  Ks = 1;
  let e = xe(), t = No(), r = mt();
  function l(s, c) {
    let h = new r(s, c), m = new t(h);
    try {
      m.parse();
    } catch (o) {
      throw process.env.NODE_ENV !== "production" && o.name === "CssSyntaxError" && c && c.from && (/\.scss$/i.test(c.from) ? o.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(c.from) ? o.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(c.from) && (o.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), o;
    }
    return m.root;
  }
  return mr = l, l.default = l, e.registerParse(l), mr;
}
var gr, Zs;
function qi() {
  if (Zs) return gr;
  Zs = 1;
  let { isClean: e, my: t } = $r(), r = $i(), l = ht(), s = xe(), c = zr(), h = zi(), m = Br(), o = jr(), p = Be();
  const i = {
    atrule: "AtRule",
    comment: "Comment",
    decl: "Declaration",
    document: "Document",
    root: "Root",
    rule: "Rule"
  }, f = {
    AtRule: !0,
    AtRuleExit: !0,
    Comment: !0,
    CommentExit: !0,
    Declaration: !0,
    DeclarationExit: !0,
    Document: !0,
    DocumentExit: !0,
    Once: !0,
    OnceExit: !0,
    postcssPlugin: !0,
    prepare: !0,
    Root: !0,
    RootExit: !0,
    Rule: !0,
    RuleExit: !0
  }, a = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, n = 0;
  function d(x) {
    return typeof x == "object" && typeof x.then == "function";
  }
  function u(x) {
    let w = !1, y = i[x.type];
    return x.type === "decl" ? w = x.prop.toLowerCase() : x.type === "atrule" && (w = x.name.toLowerCase()), w && x.append ? [
      y,
      y + "-" + w,
      n,
      y + "Exit",
      y + "Exit-" + w
    ] : w ? [y, y + "-" + w, y + "Exit", y + "Exit-" + w] : x.append ? [y, n, y + "Exit"] : [y, y + "Exit"];
  }
  function g(x) {
    let w;
    return x.type === "document" ? w = ["Document", n, "DocumentExit"] : x.type === "root" ? w = ["Root", n, "RootExit"] : w = u(x), {
      eventIndex: 0,
      events: w,
      iterator: 0,
      node: x,
      visitorIndex: 0,
      visitors: []
    };
  }
  function v(x) {
    return x[e] = !1, x.nodes && x.nodes.forEach((w) => v(w)), x;
  }
  let b = {};
  class S {
    constructor(w, y, C) {
      this.stringified = !1, this.processed = !1;
      let O;
      if (typeof y == "object" && y !== null && (y.type === "root" || y.type === "document"))
        O = v(y);
      else if (y instanceof S || y instanceof m)
        O = v(y.root), y.map && (typeof C.map > "u" && (C.map = {}), C.map.inline || (C.map.inline = !1), C.map.prev = y.map);
      else {
        let I = o;
        C.syntax && (I = C.syntax.parse), C.parser && (I = C.parser), I.parse && (I = I.parse);
        try {
          O = I(y, C);
        } catch (M) {
          this.processed = !0, this.error = M;
        }
        O && !O[t] && s.rebuild(O);
      }
      this.result = new m(w, O, C), this.helpers = { ...b, postcss: b, result: this.result }, this.plugins = this.processor.plugins.map((I) => typeof I == "object" && I.prepare ? { ...I, ...I.prepare(this.result) } : I);
    }
    async() {
      return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
    }
    catch(w) {
      return this.async().catch(w);
    }
    finally(w) {
      return this.async().then(w, w);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(w, y) {
      let C = this.result.lastPlugin;
      try {
        if (y && y.addToError(w), this.error = w, w.name === "CssSyntaxError" && !w.plugin)
          w.plugin = C.postcssPlugin, w.setMessage();
        else if (C.postcssVersion && process.env.NODE_ENV !== "production") {
          let O = C.postcssPlugin, I = C.postcssVersion, M = this.result.processor.version, P = I.split("."), N = M.split(".");
          (P[0] !== N[0] || parseInt(P[1]) > parseInt(N[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + M + ", but " + O + " uses " + I + ". Perhaps this is the source of the error below."
          );
        }
      } catch (O) {
        console && console.error && console.error(O);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (y, C, O) => {
        this.listeners[C] || (this.listeners[C] = []), this.listeners[C].push([y, O]);
      };
      for (let y of this.plugins)
        if (typeof y == "object")
          for (let C in y) {
            if (!f[C] && /^[A-Z]/.test(C))
              throw new Error(
                `Unknown event ${C} in ${y.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!a[C])
              if (typeof y[C] == "object")
                for (let O in y[C])
                  O === "*" ? w(y, C, y[C][O]) : w(
                    y,
                    C + "-" + O.toLowerCase(),
                    y[C][O]
                  );
              else typeof y[C] == "function" && w(y, C, y[C]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let w = 0; w < this.plugins.length; w++) {
        let y = this.plugins[w], C = this.runOnRoot(y);
        if (d(C))
          try {
            await C;
          } catch (O) {
            throw this.handleError(O);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; ) {
          w[e] = !0;
          let y = [g(w)];
          for (; y.length > 0; ) {
            let C = this.visitTick(y);
            if (d(C))
              try {
                await C;
              } catch (O) {
                let I = y[y.length - 1].node;
                throw this.handleError(O, I);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [y, C] of this.listeners.OnceExit) {
            this.result.lastPlugin = y;
            try {
              if (w.type === "document") {
                let O = w.nodes.map(
                  (I) => C(I, this.helpers)
                );
                await Promise.all(O);
              } else
                await C(w, this.helpers);
            } catch (O) {
              throw this.handleError(O);
            }
          }
      }
      return this.processed = !0, this.stringify();
    }
    runOnRoot(w) {
      this.result.lastPlugin = w;
      try {
        if (typeof w == "object" && w.Once) {
          if (this.result.root.type === "document") {
            let y = this.result.root.nodes.map(
              (C) => w.Once(C, this.helpers)
            );
            return d(y[0]) ? Promise.all(y) : y;
          }
          return w.Once(this.result.root, this.helpers);
        } else if (typeof w == "function")
          return w(this.result.root, this.result);
      } catch (y) {
        throw this.handleError(y);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let w = this.result.opts, y = l;
      w.syntax && (y = w.syntax.stringify), w.stringifier && (y = w.stringifier), y.stringify && (y = y.stringify);
      let O = new r(y, this.result.root, this.result.opts).generate();
      return this.result.css = O[0], this.result.map = O[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let w of this.plugins) {
        let y = this.runOnRoot(w);
        if (d(y))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; )
          w[e] = !0, this.walkSync(w);
        if (this.listeners.OnceExit)
          if (w.type === "document")
            for (let y of w.nodes)
              this.visitSync(this.listeners.OnceExit, y);
          else
            this.visitSync(this.listeners.OnceExit, w);
      }
      return this.result;
    }
    then(w, y) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || h(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(w, y);
    }
    toString() {
      return this.css;
    }
    visitSync(w, y) {
      for (let [C, O] of w) {
        this.result.lastPlugin = C;
        let I;
        try {
          I = O(y, this.helpers);
        } catch (M) {
          throw this.handleError(M, y.proxyOf);
        }
        if (y.type !== "root" && y.type !== "document" && !y.parent)
          return !0;
        if (d(I))
          throw this.getAsyncError();
      }
    }
    visitTick(w) {
      let y = w[w.length - 1], { node: C, visitors: O } = y;
      if (C.type !== "root" && C.type !== "document" && !C.parent) {
        w.pop();
        return;
      }
      if (O.length > 0 && y.visitorIndex < O.length) {
        let [M, P] = O[y.visitorIndex];
        y.visitorIndex += 1, y.visitorIndex === O.length && (y.visitors = [], y.visitorIndex = 0), this.result.lastPlugin = M;
        try {
          return P(C.toProxy(), this.helpers);
        } catch (N) {
          throw this.handleError(N, C);
        }
      }
      if (y.iterator !== 0) {
        let M = y.iterator, P;
        for (; P = C.nodes[C.indexes[M]]; )
          if (C.indexes[M] += 1, !P[e]) {
            P[e] = !0, w.push(g(P));
            return;
          }
        y.iterator = 0, delete C.indexes[M];
      }
      let I = y.events;
      for (; y.eventIndex < I.length; ) {
        let M = I[y.eventIndex];
        if (y.eventIndex += 1, M === n) {
          C.nodes && C.nodes.length && (C[e] = !0, y.iterator = C.getIterator());
          return;
        } else if (this.listeners[M]) {
          y.visitors = this.listeners[M];
          return;
        }
      }
      w.pop();
    }
    walkSync(w) {
      w[e] = !0;
      let y = u(w);
      for (let C of y)
        if (C === n)
          w.nodes && w.each((O) => {
            O[e] || this.walkSync(O);
          });
        else {
          let O = this.listeners[C];
          if (O && this.visitSync(O, w.toProxy()))
            return;
        }
    }
    warnings() {
      return this.sync().warnings();
    }
    get content() {
      return this.stringify().content;
    }
    get css() {
      return this.stringify().css;
    }
    get map() {
      return this.stringify().map;
    }
    get messages() {
      return this.sync().messages;
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      return this.sync().root;
    }
    get [Symbol.toStringTag]() {
      return "LazyResult";
    }
  }
  return S.registerPostcss = (x) => {
    b = x;
  }, gr = S, S.default = S, p.registerLazyResult(S), c.registerLazyResult(S), gr;
}
var yr, ei;
function Po() {
  if (ei) return yr;
  ei = 1;
  let e = $i(), t = ht(), r = zi(), l = jr();
  const s = Br();
  class c {
    constructor(m, o, p) {
      o = o.toString(), this.stringified = !1, this._processor = m, this._css = o, this._opts = p, this._map = void 0;
      let i, f = t;
      this.result = new s(this._processor, i, this._opts), this.result.css = o;
      let a = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return a.root;
        }
      });
      let n = new e(f, i, this._opts, o);
      if (n.isMap()) {
        let [d, u] = n.generate();
        d && (this.result.css = d), u && (this.result.map = u);
      } else
        n.clearAnnotation(), this.result.css = n.css;
    }
    async() {
      return this.error ? Promise.reject(this.error) : Promise.resolve(this.result);
    }
    catch(m) {
      return this.async().catch(m);
    }
    finally(m) {
      return this.async().then(m, m);
    }
    sync() {
      if (this.error) throw this.error;
      return this.result;
    }
    then(m, o) {
      return process.env.NODE_ENV !== "production" && ("from" in this._opts || r(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(m, o);
    }
    toString() {
      return this._css;
    }
    warnings() {
      return [];
    }
    get content() {
      return this.result.css;
    }
    get css() {
      return this.result.css;
    }
    get map() {
      return this.result.map;
    }
    get messages() {
      return [];
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      if (this._root)
        return this._root;
      let m, o = l;
      try {
        m = o(this._css, this._opts);
      } catch (p) {
        this.error = p;
      }
      if (this.error)
        throw this.error;
      return this._root = m, m;
    }
    get [Symbol.toStringTag]() {
      return "NoWorkResult";
    }
  }
  return yr = c, c.default = c, yr;
}
var wr, ti;
function ko() {
  if (ti) return wr;
  ti = 1;
  let e = Po(), t = qi(), r = zr(), l = Be();
  class s {
    constructor(h = []) {
      this.version = "8.4.38", this.plugins = this.normalize(h);
    }
    normalize(h) {
      let m = [];
      for (let o of h)
        if (o.postcss === !0 ? o = o() : o.postcss && (o = o.postcss), typeof o == "object" && Array.isArray(o.plugins))
          m = m.concat(o.plugins);
        else if (typeof o == "object" && o.postcssPlugin)
          m.push(o);
        else if (typeof o == "function")
          m.push(o);
        else if (typeof o == "object" && (o.parse || o.stringify)) {
          if (process.env.NODE_ENV !== "production")
            throw new Error(
              "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
            );
        } else
          throw new Error(o + " is not a PostCSS plugin");
      return m;
    }
    process(h, m = {}) {
      return !this.plugins.length && !m.parser && !m.stringifier && !m.syntax ? new e(this, h, m) : new t(this, h, m);
    }
    use(h) {
      return this.plugins = this.plugins.concat(this.normalize([h])), this;
    }
  }
  return wr = s, s.default = s, l.registerProcessor(s), r.registerProcessor(s), wr;
}
var br, ri;
function _o() {
  if (ri) return br;
  ri = 1;
  let e = dt(), t = Fi(), r = gt(), l = Wr(), s = mt(), c = Be(), h = qr();
  function m(o, p) {
    if (Array.isArray(o)) return o.map((a) => m(a));
    let { inputs: i, ...f } = o;
    if (i) {
      p = [];
      for (let a of i) {
        let n = { ...a, __proto__: s.prototype };
        n.map && (n.map = {
          ...n.map,
          __proto__: t.prototype
        }), p.push(n);
      }
    }
    if (f.nodes && (f.nodes = o.nodes.map((a) => m(a, p))), f.source) {
      let { inputId: a, ...n } = f.source;
      f.source = n, a != null && (f.source.input = p[a]);
    }
    if (f.type === "root")
      return new c(f);
    if (f.type === "decl")
      return new e(f);
    if (f.type === "rule")
      return new h(f);
    if (f.type === "comment")
      return new r(f);
    if (f.type === "atrule")
      return new l(f);
    throw new Error("Unknown node type: " + o.type);
  }
  return br = m, m.default = m, br;
}
var Sr, si;
function Lo() {
  if (si) return Sr;
  si = 1;
  let e = Fr(), t = dt(), r = qi(), l = xe(), s = ko(), c = ht(), h = _o(), m = zr(), o = Bi(), p = gt(), i = Wr(), f = Br(), a = mt(), n = jr(), d = Wi(), u = qr(), g = Be(), v = pt();
  function b(...S) {
    return S.length === 1 && Array.isArray(S[0]) && (S = S[0]), new s(S);
  }
  return b.plugin = function(x, w) {
    let y = !1;
    function C(...I) {
      console && console.warn && !y && (y = !0, console.warn(
        x + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        x + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let M = w(...I);
      return M.postcssPlugin = x, M.postcssVersion = new s().version, M;
    }
    let O;
    return Object.defineProperty(C, "postcss", {
      get() {
        return O || (O = C()), O;
      }
    }), C.process = function(I, M, P) {
      return b([C(P)]).process(I, M);
    }, C;
  }, b.stringify = c, b.parse = n, b.fromJSON = h, b.list = d, b.comment = (S) => new p(S), b.atRule = (S) => new i(S), b.decl = (S) => new t(S), b.rule = (S) => new u(S), b.root = (S) => new g(S), b.document = (S) => new m(S), b.CssSyntaxError = e, b.Declaration = t, b.Container = l, b.Processor = s, b.Document = m, b.Comment = p, b.Warning = o, b.AtRule = i, b.Result = f, b.Input = a, b.Rule = u, b.Root = g, b.Node = v, r.registerPostcss(b), Sr = b, b.default = b, Sr;
}
var Do = Lo();
const j = /* @__PURE__ */ xo(Do);
j.stringify;
j.fromJSON;
j.plugin;
j.parse;
j.list;
j.document;
j.comment;
j.atRule;
j.rule;
j.decl;
j.root;
j.CssSyntaxError;
j.Declaration;
j.Container;
j.Processor;
j.Document;
j.Comment;
j.Warning;
j.AtRule;
j.Result;
j.Input;
j.Rule;
j.Root;
j.Node;
class Hr {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    oe(this, "parentElement", null), oe(this, "parentNode", null), oe(this, "ownerDocument"), oe(this, "firstChild", null), oe(this, "lastChild", null), oe(this, "previousSibling", null), oe(this, "nextSibling", null), oe(this, "ELEMENT_NODE", 1), oe(this, "TEXT_NODE", 3), oe(this, "nodeType"), oe(this, "nodeName"), oe(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof Hr) {
      if (t.ownerDocument !== this.ownerDocument) return !1;
      if (t === this) return !0;
    } else return !1;
    for (; t.parentNode; ) {
      if (t.parentNode === this) return !0;
      t = t.parentNode;
    }
    return !1;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  appendChild(t) {
    throw new Error(
      "RRDomException: Failed to execute 'appendChild' on 'RRNode': This RRNode type does not support this method."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  insertBefore(t, r) {
    throw new Error(
      "RRDomException: Failed to execute 'insertBefore' on 'RRNode': This RRNode type does not support this method."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeChild(t) {
    throw new Error(
      "RRDomException: Failed to execute 'removeChild' on 'RRNode': This RRNode type does not support this method."
    );
  }
  toString() {
    return "RRNode";
  }
}
const ii = {
  Node: [
    "childNodes",
    "parentNode",
    "parentElement",
    "textContent",
    "ownerDocument"
  ],
  ShadowRoot: ["host", "styleSheets"],
  Element: ["shadowRoot", "querySelector", "querySelectorAll"],
  MutationObserver: []
}, ni = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Ye = {}, ji = {}, To = () => !!globalThis.Zone;
function Vr(e) {
  if (Ye[e])
    return Ye[e];
  const t = globalThis[e], r = t.prototype, l = e in ii ? ii[e] : void 0, s = !!(l && // @ts-expect-error 2345
  l.every(
    (m) => {
      var o, p;
      return !!((p = (o = Object.getOwnPropertyDescriptor(r, m)) == null ? void 0 : o.get) != null && p.toString().includes("[native code]"));
    }
  )), c = e in ni ? ni[e] : void 0, h = !!(c && c.every(
    // @ts-expect-error 2345
    (m) => {
      var o;
      return typeof r[m] == "function" && ((o = r[m]) == null ? void 0 : o.toString().includes("[native code]"));
    }
  ));
  if (s && h && !To())
    return Ye[e] = t.prototype, t.prototype;
  try {
    const m = document.createElement("iframe");
    m.style.display = "none", document.body.appendChild(m);
    const o = m.contentWindow;
    if (!o) return t.prototype;
    const p = o[e].prototype;
    if (!p)
      return m.remove(), r;
    const i = navigator.userAgent;
    return i.includes("Safari") && !i.includes("Chrome") ? (m.classList.add("rr-block"), m.setAttribute("__rrwebUntaintedMutationObserver", ""), ji[e] = () => m.remove()) : m.remove(), Ye[e] = p;
  } catch {
    return r;
  }
}
const vr = {};
function me(e, t, r) {
  var l;
  const s = `${e}.${String(r)}`;
  if (vr[s])
    return vr[s].call(
      t
    );
  const c = Vr(e), h = (l = Object.getOwnPropertyDescriptor(
    c,
    r
  )) == null ? void 0 : l.get;
  return h ? (vr[s] = h, h.call(t)) : t[r];
}
const Cr = {};
function Hi(e, t, r) {
  const l = `${e}.${String(r)}`;
  if (Cr[l])
    return Cr[l].bind(
      t
    );
  const c = Vr(e)[r];
  return typeof c != "function" ? t[r] : (Cr[l] = c, c.bind(t));
}
function Uo(e) {
  return me("Node", e, "ownerDocument");
}
function Fo(e) {
  return me("Node", e, "childNodes");
}
function $o(e) {
  return me("Node", e, "parentNode");
}
function zo(e) {
  return me("Node", e, "parentElement");
}
function Bo(e) {
  return me("Node", e, "textContent");
}
function Wo(e, t) {
  return Hi("Node", e, "contains")(t);
}
function qo(e) {
  return Hi("Node", e, "getRootNode")();
}
function jo(e) {
  return !e || !("host" in e) ? null : me("ShadowRoot", e, "host");
}
function Ho(e) {
  return e.styleSheets;
}
function Vo(e) {
  return !e || !("shadowRoot" in e) ? null : me("Element", e, "shadowRoot");
}
function Go(e, t) {
  return me("Element", e, "querySelector")(t);
}
function Jo(e, t) {
  return me("Element", e, "querySelectorAll")(t);
}
function Vi() {
  return [
    Vr("MutationObserver").constructor,
    ji.MutationObserver ?? (() => {
    })
  ];
}
let Fe = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Fe = () => (/* @__PURE__ */ new Date()).getTime());
function Re(e, t, r) {
  try {
    if (!(t in e))
      return () => {
      };
    const l = e[t], s = r(l);
    return typeof s == "function" && (s.prototype = s.prototype || {}, Object.defineProperties(s, {
      __rrweb_original__: {
        enumerable: !1,
        value: l
      }
    })), e[t] = s, () => {
      e[t] = l;
    };
  } catch {
    return () => {
    };
  }
}
const _ = {
  ownerDocument: Uo,
  childNodes: Fo,
  parentNode: $o,
  parentElement: zo,
  textContent: Bo,
  contains: Wo,
  getRootNode: qo,
  host: jo,
  styleSheets: Ho,
  shadowRoot: Vo,
  querySelector: Go,
  querySelectorAll: Jo,
  nowTimestamp: Fe,
  mutationObserverCtor: Vi,
  patch: Re
};
function ee(e, t, r = document) {
  const l = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, l), () => r.removeEventListener(e, t, l);
}
const Ee = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let oi = {
  map: {},
  getId() {
    return console.error(Ee), -1;
  },
  getNode() {
    return console.error(Ee), null;
  },
  removeNodeFromMap() {
    console.error(Ee);
  },
  has() {
    return console.error(Ee), !1;
  },
  reset() {
    console.error(Ee);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (oi = new Proxy(oi, {
  get(e, t, r) {
    return t === "map" && console.error(Ee), Reflect.get(e, t, r);
  }
}));
function $e(e, t, r = {}) {
  let l = null, s = 0;
  return function(...c) {
    const h = Date.now();
    !s && r.leading === !1 && (s = h);
    const m = t - (h - s), o = this;
    m <= 0 || m > t ? (l && (clearTimeout(l), l = null), s = h, e.apply(o, c)) : !l && r.trailing !== !1 && (l = setTimeout(() => {
      s = r.leading === !1 ? 0 : Date.now(), l = null, e.apply(o, c);
    }, m));
  };
}
function yt(e, t, r, l, s = window) {
  const c = s.Object.getOwnPropertyDescriptor(e, t);
  return s.Object.defineProperty(
    e,
    t,
    l ? r : {
      set(h) {
        setTimeout(() => {
          r.set.call(this, h);
        }, 0), c && c.set && c.set.call(this, h);
      }
    }
  ), () => yt(e, t, c || {}, !0);
}
function Gi(e) {
  var t, r, l, s;
  const c = e.document;
  return {
    left: c.scrollingElement ? c.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : c.documentElement.scrollLeft || (c == null ? void 0 : c.body) && ((t = _.parentElement(c.body)) == null ? void 0 : t.scrollLeft) || ((r = c == null ? void 0 : c.body) == null ? void 0 : r.scrollLeft) || 0,
    top: c.scrollingElement ? c.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (c == null ? void 0 : c.documentElement.scrollTop) || (c == null ? void 0 : c.body) && ((l = _.parentElement(c.body)) == null ? void 0 : l.scrollTop) || ((s = c == null ? void 0 : c.body) == null ? void 0 : s.scrollTop) || 0
  };
}
function Ji() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function Yi() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function Qi(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : _.parentElement(e) : null;
}
function te(e, t, r, l) {
  if (!e)
    return !1;
  const s = Qi(e);
  if (!s)
    return !1;
  try {
    if (typeof t == "string") {
      if (s.classList.contains(t) || l && s.closest("." + t) !== null) return !0;
    } else if (it(s, t, l)) return !0;
  } catch {
  }
  return !!(r && (s.matches(r) || l && s.closest(r) !== null));
}
function Yo(e, t) {
  return t.getId(e) !== -1;
}
function xr(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === Ue;
}
function Xi(e, t) {
  if (Le(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const l = _.parentNode(e);
  return l && l.nodeType === e.DOCUMENT_NODE ? !1 : l ? Xi(l, t) : !0;
}
function Mr(e) {
  return !!e.changedTouches;
}
function Qo(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function Ki(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function Zi(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function Er(e) {
  return e ? e instanceof Hr && "shadowRoot" in e ? !!e.shadowRoot : !!_.shadowRoot(e) : !1;
}
class Xo {
  constructor() {
    A(this, "id", 1), A(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), A(this, "idStyleMap", /* @__PURE__ */ new Map());
  }
  getId(t) {
    return this.styleIDMap.get(t) ?? -1;
  }
  has(t) {
    return this.styleIDMap.has(t);
  }
  /**
   * @returns If the stylesheet is in the mirror, returns the id of the stylesheet. If not, return the new assigned id.
   */
  add(t, r) {
    if (this.has(t)) return this.getId(t);
    let l;
    return r === void 0 ? l = this.id++ : l = r, this.styleIDMap.set(t, l), this.idStyleMap.set(l, t), l;
  }
  getStyle(t) {
    return this.idStyleMap.get(t) || null;
  }
  reset() {
    this.styleIDMap = /* @__PURE__ */ new WeakMap(), this.idStyleMap = /* @__PURE__ */ new Map(), this.id = 1;
  }
  generateId() {
    return this.id++;
  }
}
function en(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = _.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && _.host(_.getRootNode(e)) && (r = _.host(_.getRootNode(e))), r;
}
function Ko(e) {
  let t = e, r;
  for (; r = en(t); )
    t = r;
  return t;
}
function Zo(e) {
  const t = _.ownerDocument(e);
  if (!t) return !1;
  const r = Ko(e);
  return _.contains(t, r);
}
function tn(e) {
  const t = _.ownerDocument(e);
  return t ? _.contains(t, e) || Zo(e) : !1;
}
var T = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(T || {}), L = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(L || {}), re = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(re || {}), pe = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(pe || {}), ke = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(ke || {}), Ie = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(Ie || {}), rn = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(rn || {});
function ai(e) {
  return "__ln" in e;
}
class ea {
  constructor() {
    A(this, "length", 0), A(this, "head", null), A(this, "tail", null);
  }
  get(t) {
    if (t >= this.length)
      throw new Error("Position outside of list range");
    let r = this.head;
    for (let l = 0; l < t; l++)
      r = (r == null ? void 0 : r.next) || null;
    return r;
  }
  addNode(t) {
    const r = {
      value: t,
      previous: null,
      next: null
    };
    if (t.__ln = r, t.previousSibling && ai(t.previousSibling)) {
      const l = t.previousSibling.__ln.next;
      r.next = l, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, l && (l.previous = r);
    } else if (t.nextSibling && ai(t.nextSibling) && t.nextSibling.__ln.previous) {
      const l = t.nextSibling.__ln.previous;
      r.previous = l, r.next = t.nextSibling.__ln, t.nextSibling.__ln.previous = r, l && (l.next = r);
    } else
      this.head && (this.head.previous = r), r.next = this.head, this.head = r;
    r.next === null && (this.tail = r), this.length++;
  }
  removeNode(t) {
    const r = t.__ln;
    this.head && (r.previous ? (r.previous.next = r.next, r.next ? r.next.previous = r.previous : this.tail = r.previous) : (this.head = r.next, this.head ? this.head.previous = null : this.tail = null), t.__ln && delete t.__ln, this.length--);
  }
}
const li = (e, t) => `${e}@${t}`;
class ta {
  constructor() {
    A(this, "frozen", !1), A(this, "locked", !1), A(this, "texts", []), A(this, "attributes", []), A(this, "attributeMap", /* @__PURE__ */ new WeakMap()), A(this, "removes", []), A(this, "mapRemoves", []), A(this, "movedMap", {}), A(this, "addedSet", /* @__PURE__ */ new Set()), A(this, "movedSet", /* @__PURE__ */ new Set()), A(this, "droppedSet", /* @__PURE__ */ new Set()), A(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), A(this, "mutationCb"), A(this, "blockClass"), A(this, "blockSelector"), A(this, "maskTextClass"), A(this, "maskTextSelector"), A(this, "inlineStylesheet"), A(this, "maskInputOptions"), A(this, "maskTextFn"), A(this, "maskInputFn"), A(this, "keepIframeSrcFn"), A(this, "recordCanvas"), A(this, "inlineImages"), A(this, "slimDOMOptions"), A(this, "dataURLOptions"), A(this, "doc"), A(this, "mirror"), A(this, "iframeManager"), A(this, "stylesheetManager"), A(this, "shadowDomManager"), A(this, "canvasManager"), A(this, "processedNodeManager"), A(this, "unattachedDoc"), A(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), A(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), l = new ea(), s = (o) => {
        let p = o, i = Ue;
        for (; i === Ue; )
          p = p && p.nextSibling, i = p && this.mirror.getId(p);
        return i;
      }, c = (o) => {
        const p = _.parentNode(o);
        if (!p || !tn(o))
          return;
        let i = !1;
        if (o.nodeType === Node.TEXT_NODE) {
          const d = p.tagName;
          if (d === "TEXTAREA")
            return;
          d === "STYLE" && this.addedSet.has(p) && (i = !0);
        }
        const f = Le(p) ? this.mirror.getId(en(o)) : this.mirror.getId(p), a = s(o);
        if (f === -1 || a === -1)
          return l.addNode(o);
        const n = Ne(o, {
          doc: this.doc,
          mirror: this.mirror,
          blockClass: this.blockClass,
          blockSelector: this.blockSelector,
          maskTextClass: this.maskTextClass,
          maskTextSelector: this.maskTextSelector,
          skipChild: !0,
          newlyAddedElement: !0,
          inlineStylesheet: this.inlineStylesheet,
          maskInputOptions: this.maskInputOptions,
          maskTextFn: this.maskTextFn,
          maskInputFn: this.maskInputFn,
          slimDOMOptions: this.slimDOMOptions,
          dataURLOptions: this.dataURLOptions,
          recordCanvas: this.recordCanvas,
          inlineImages: this.inlineImages,
          onSerialize: (d) => {
            Ki(d, this.mirror) && this.iframeManager.addIframe(d), Zi(d, this.mirror) && this.stylesheetManager.trackLinkElement(
              d
            ), Er(o) && this.shadowDomManager.addShadowRoot(_.shadowRoot(o), this.doc);
          },
          onIframeLoad: (d, u) => {
            this.iframeManager.attachIframe(d, u), this.shadowDomManager.observeAttachShadow(d);
          },
          onStylesheetLoad: (d, u) => {
            this.stylesheetManager.attachLinkElement(d, u);
          },
          cssCaptured: i
        });
        n && (t.push({
          parentId: f,
          nextId: a,
          node: n
        }), r.add(n.id));
      };
      for (; this.mapRemoves.length; )
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      for (const o of this.movedSet)
        ui(this.removesSubTreeCache, o, this.mirror) && !this.movedSet.has(_.parentNode(o)) || c(o);
      for (const o of this.addedSet)
        !ci(this.droppedSet, o) && !ui(this.removesSubTreeCache, o, this.mirror) || ci(this.movedSet, o) ? c(o) : this.droppedSet.add(o);
      let h = null;
      for (; l.length; ) {
        let o = null;
        if (h) {
          const p = this.mirror.getId(_.parentNode(h.value)), i = s(h.value);
          p !== -1 && i !== -1 && (o = h);
        }
        if (!o) {
          let p = l.tail;
          for (; p; ) {
            const i = p;
            if (p = p.previous, i) {
              const f = this.mirror.getId(_.parentNode(i.value));
              if (s(i.value) === -1) continue;
              if (f !== -1) {
                o = i;
                break;
              } else {
                const n = i.value, d = _.parentNode(n);
                if (d && d.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const u = _.host(d);
                  if (this.mirror.getId(u) !== -1) {
                    o = i;
                    break;
                  }
                }
              }
            }
          }
        }
        if (!o) {
          for (; l.head; )
            l.removeNode(l.head.value);
          break;
        }
        h = o.previous, l.removeNode(o.value), c(o.value);
      }
      const m = {
        texts: this.texts.map((o) => {
          const p = o.node, i = _.parentNode(p);
          return i && i.tagName === "TEXTAREA" && this.genTextAreaValueMutation(i), {
            id: this.mirror.getId(p),
            value: o.value
          };
        }).filter((o) => !r.has(o.id)).filter((o) => this.mirror.has(o.id)),
        attributes: this.attributes.map((o) => {
          const { attributes: p } = o;
          if (typeof p.style == "string") {
            const i = JSON.stringify(o.styleDiff), f = JSON.stringify(o._unchangedStyles);
            i.length < p.style.length && (i + f).split("var(").length === p.style.split("var(").length && (p.style = o.styleDiff);
          }
          return {
            id: this.mirror.getId(o.node),
            attributes: p
          };
        }).filter((o) => !r.has(o.id)).filter((o) => this.mirror.has(o.id)),
        removes: this.removes,
        adds: t
      };
      !m.texts.length && !m.attributes.length && !m.removes.length && !m.adds.length || (this.texts = [], this.attributes = [], this.attributeMap = /* @__PURE__ */ new WeakMap(), this.removes = [], this.addedSet = /* @__PURE__ */ new Set(), this.movedSet = /* @__PURE__ */ new Set(), this.droppedSet = /* @__PURE__ */ new Set(), this.removesSubTreeCache = /* @__PURE__ */ new Set(), this.movedMap = {}, this.mutationCb(m));
    }), A(this, "genTextAreaValueMutation", (t) => {
      let r = this.attributeMap.get(t);
      r || (r = {
        node: t,
        attributes: {},
        styleDiff: {},
        _unchangedStyles: {}
      }, this.attributes.push(r), this.attributeMap.set(t, r));
      const l = Array.from(
        _.childNodes(t),
        (s) => _.textContent(s) || ""
      ).join("");
      r.attributes.value = tt({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: rt(t),
        value: l,
        maskInputFn: this.maskInputFn
      });
    }), A(this, "processMutation", (t) => {
      if (!xr(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = _.textContent(t.target);
            !te(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: Ii(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, Qi(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let l = t.attributeName, s = t.target.getAttribute(l);
            if (l === "value") {
              const h = rt(r);
              s = tt({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: h,
                value: s,
                maskInputFn: this.maskInputFn
              });
            }
            if (te(t.target, this.blockClass, this.blockSelector, !1) || s === t.oldValue)
              return;
            let c = this.attributeMap.get(t.target);
            if (r.tagName === "IFRAME" && l === "src" && !this.keepIframeSrcFn(s))
              if (!r.contentDocument)
                l = "rr_src";
              else
                return;
            if (c || (c = {
              node: t.target,
              attributes: {},
              styleDiff: {},
              _unchangedStyles: {}
            }, this.attributes.push(c), this.attributeMap.set(t.target, c)), l === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !Ei(r.tagName, l))
              if (c.attributes[l] = Mi(
                this.doc,
                ve(r.tagName),
                ve(l),
                s
              ), l === "style") {
                if (!this.unattachedDoc)
                  try {
                    this.unattachedDoc = document.implementation.createHTMLDocument();
                  } catch {
                    this.unattachedDoc = this.doc;
                  }
                const h = this.unattachedDoc.createElement("span");
                t.oldValue && h.setAttribute("style", t.oldValue);
                for (const m of Array.from(r.style)) {
                  const o = r.style.getPropertyValue(m), p = r.style.getPropertyPriority(m);
                  o !== h.style.getPropertyValue(m) || p !== h.style.getPropertyPriority(m) ? p === "" ? c.styleDiff[m] = o : c.styleDiff[m] = [o, p] : c._unchangedStyles[m] = [o, p];
                }
                for (const m of Array.from(h.style))
                  r.style.getPropertyValue(m) === "" && (c.styleDiff[m] = !1);
              } else l === "open" && r.tagName === "DIALOG" && (r.matches("dialog:modal") ? c.attributes.rr_open_mode = "modal" : c.attributes.rr_open_mode = "non-modal");
            break;
          }
          case "childList": {
            if (te(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const l = this.mirror.getId(r), s = Le(t.target) ? this.mirror.getId(_.host(t.target)) : this.mirror.getId(t.target);
              te(t.target, this.blockClass, this.blockSelector, !1) || xr(r, this.mirror, this.slimDOMOptions) || !Yo(r, this.mirror) || (this.addedSet.has(r) ? (Ir(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && l === -1 || Xi(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[li(l, s)] ? Ir(this.movedSet, r) : (this.removes.push({
                parentId: s,
                id: l,
                isShadow: Le(t.target) && De(t.target) ? !0 : void 0
              }), ra(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), A(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (xr(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let l = null;
          r && this.mirror.hasNode(r) && (l = this.mirror.getId(r)), l && l !== -1 && (this.movedMap[li(this.mirror.getId(t), l)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        te(t, this.blockClass, this.blockSelector, !1) || (_.childNodes(t).forEach((l) => this.genAdds(l)), Er(t) && _.childNodes(_.shadowRoot(t)).forEach((l) => {
          this.processedNodeManager.add(l, this), this.genAdds(l, t);
        }));
      }
    });
  }
  init(t) {
    [
      "mutationCb",
      "blockClass",
      "blockSelector",
      "maskTextClass",
      "maskTextSelector",
      "inlineStylesheet",
      "maskInputOptions",
      "maskTextFn",
      "maskInputFn",
      "keepIframeSrcFn",
      "recordCanvas",
      "inlineImages",
      "slimDOMOptions",
      "dataURLOptions",
      "doc",
      "mirror",
      "iframeManager",
      "stylesheetManager",
      "shadowDomManager",
      "canvasManager",
      "processedNodeManager"
    ].forEach((r) => {
      this[r] = t[r];
    });
  }
  freeze() {
    this.frozen = !0, this.canvasManager.freeze();
  }
  unfreeze() {
    this.frozen = !1, this.canvasManager.unfreeze(), this.emit();
  }
  isFrozen() {
    return this.frozen;
  }
  lock() {
    this.locked = !0, this.canvasManager.lock();
  }
  unlock() {
    this.locked = !1, this.canvasManager.unlock(), this.emit();
  }
  reset() {
    this.shadowDomManager.reset(), this.canvasManager.reset();
  }
}
function Ir(e, t) {
  e.delete(t), _.childNodes(t).forEach((r) => Ir(e, r));
}
function ra(e, t) {
  const r = [e];
  for (; r.length; ) {
    const l = r.pop();
    t.has(l) || (t.add(l), _.childNodes(l).forEach((s) => r.push(s)));
  }
}
function ui(e, t, r) {
  return e.size === 0 ? !1 : sa(e, t);
}
function sa(e, t, r) {
  const l = _.parentNode(t);
  return l ? e.has(l) : !1;
}
function ci(e, t) {
  return e.size === 0 ? !1 : sn(e, t);
}
function sn(e, t) {
  const r = _.parentNode(t);
  return r ? e.has(r) ? !0 : sn(e, r) : !1;
}
let Te;
function ia(e) {
  Te = e;
}
function na() {
  Te = void 0;
}
const D = (e) => Te ? (...r) => {
  try {
    return e(...r);
  } catch (l) {
    if (Te && Te(l) === !0)
      return;
    throw l;
  }
} : e, Se = [];
function We(e) {
  try {
    if ("composedPath" in e) {
      const t = e.composedPath();
      if (t.length)
        return t[0];
    } else if ("path" in e && e.path.length)
      return e.path[0];
  } catch {
  }
  return e && e.target;
}
function nn(e, t) {
  const r = new ta();
  Se.push(r), r.init(e);
  const [l, s] = Vi(), c = new l(
    D(r.processMutations.bind(r))
  );
  return c.observe(t, {
    attributes: !0,
    attributeOldValue: !0,
    characterData: !0,
    characterDataOldValue: !0,
    childList: !0,
    subtree: !0
  }), [c, s];
}
function oa({
  mousemoveCb: e,
  sampling: t,
  doc: r,
  mirror: l
}) {
  if (t.mousemove === !1)
    return () => {
    };
  const s = typeof t.mousemove == "number" ? t.mousemove : 50, c = typeof t.mousemoveCallback == "number" ? t.mousemoveCallback : 500;
  let h = [], m;
  const o = $e(
    D(
      (f) => {
        const a = Date.now() - m;
        e(
          h.map((n) => (n.timeOffset -= a, n)),
          f
        ), h = [], m = null;
      }
    ),
    c
  ), p = D(
    $e(
      D((f) => {
        const a = We(f), { clientX: n, clientY: d } = Mr(f) ? f.changedTouches[0] : f;
        m || (m = Fe()), h.push({
          x: n,
          y: d,
          id: l.getId(a),
          timeOffset: Fe() - m
        }), o(
          typeof DragEvent < "u" && f instanceof DragEvent ? L.Drag : f instanceof MouseEvent ? L.MouseMove : L.TouchMove
        );
      }),
      s,
      {
        trailing: !1
      }
    )
  ), i = [
    ee("mousemove", p, r),
    ee("touchmove", p, r),
    ee("drag", p, r)
  ];
  return D(() => {
    i.forEach((f) => f());
  });
}
function aa({
  mouseInteractionCb: e,
  doc: t,
  mirror: r,
  blockClass: l,
  blockSelector: s,
  sampling: c
}) {
  if (c.mouseInteraction === !1)
    return () => {
    };
  const h = c.mouseInteraction === !0 || c.mouseInteraction === void 0 ? {} : c.mouseInteraction, m = [];
  let o = null;
  const p = (i) => (f) => {
    const a = We(f);
    if (te(a, l, s, !0))
      return;
    let n = null, d = i;
    if ("pointerType" in f) {
      switch (f.pointerType) {
        case "mouse":
          n = pe.Mouse;
          break;
        case "touch":
          n = pe.Touch;
          break;
        case "pen":
          n = pe.Pen;
          break;
      }
      n === pe.Touch ? re[i] === re.MouseDown ? d = "TouchStart" : re[i] === re.MouseUp && (d = "TouchEnd") : pe.Pen;
    } else Mr(f) && (n = pe.Touch);
    n !== null ? (o = n, (d.startsWith("Touch") && n === pe.Touch || d.startsWith("Mouse") && n === pe.Mouse) && (n = null)) : re[i] === re.Click && (n = o, o = null);
    const u = Mr(f) ? f.changedTouches[0] : f;
    if (!u)
      return;
    const g = r.getId(a), { clientX: v, clientY: b } = u;
    D(e)({
      type: re[d],
      id: g,
      x: v,
      y: b,
      ...n !== null && { pointerType: n }
    });
  };
  return Object.keys(re).filter(
    (i) => Number.isNaN(Number(i)) && !i.endsWith("_Departed") && h[i] !== !1
  ).forEach((i) => {
    let f = ve(i);
    const a = p(i);
    if (window.PointerEvent)
      switch (re[i]) {
        case re.MouseDown:
        case re.MouseUp:
          f = f.replace(
            "mouse",
            "pointer"
          );
          break;
        case re.TouchStart:
        case re.TouchEnd:
          return;
      }
    m.push(ee(f, a, t));
  }), D(() => {
    m.forEach((i) => i());
  });
}
function on({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: l,
  blockSelector: s,
  sampling: c
}) {
  const h = D(
    $e(
      D((m) => {
        const o = We(m);
        if (!o || te(o, l, s, !0))
          return;
        const p = r.getId(o);
        if (o === t && t.defaultView) {
          const i = Gi(t.defaultView);
          e({
            id: p,
            x: i.left,
            y: i.top
          });
        } else
          e({
            id: p,
            x: o.scrollLeft,
            y: o.scrollTop
          });
      }),
      c.scroll || 100
    )
  );
  return ee("scroll", h, t);
}
function la({ viewportResizeCb: e }, { win: t }) {
  let r = -1, l = -1;
  const s = D(
    $e(
      D(() => {
        const c = Ji(), h = Yi();
        (r !== c || l !== h) && (e({
          width: Number(h),
          height: Number(c)
        }), r = c, l = h);
      }),
      200
    )
  );
  return ee("resize", s, t);
}
const ua = ["INPUT", "TEXTAREA", "SELECT"], fi = /* @__PURE__ */ new WeakMap();
function ca({
  inputCb: e,
  doc: t,
  mirror: r,
  blockClass: l,
  blockSelector: s,
  ignoreClass: c,
  ignoreSelector: h,
  maskInputOptions: m,
  maskInputFn: o,
  sampling: p,
  userTriggeredOnInput: i
}) {
  function f(b) {
    let S = We(b);
    const x = b.isTrusted, w = S && S.tagName;
    if (S && w === "OPTION" && (S = _.parentElement(S)), !S || !w || ua.indexOf(w) < 0 || te(S, l, s, !0) || S.classList.contains(c) || h && S.matches(h))
      return;
    let y = S.value, C = !1;
    const O = rt(S) || "";
    O === "radio" || O === "checkbox" ? C = S.checked : (m[w.toLowerCase()] || m[O]) && (y = tt({
      element: S,
      maskInputOptions: m,
      tagName: w,
      type: O,
      value: y,
      maskInputFn: o
    })), a(
      S,
      i ? { text: y, isChecked: C, userTriggered: x } : { text: y, isChecked: C }
    );
    const I = S.name;
    O === "radio" && I && C && t.querySelectorAll(`input[type="radio"][name="${I}"]`).forEach((M) => {
      if (M !== S) {
        const P = M.value;
        a(
          M,
          i ? { text: P, isChecked: !C, userTriggered: !1 } : { text: P, isChecked: !C }
        );
      }
    });
  }
  function a(b, S) {
    const x = fi.get(b);
    if (!x || x.text !== S.text || x.isChecked !== S.isChecked) {
      fi.set(b, S);
      const w = r.getId(b);
      D(e)({
        ...S,
        id: w
      });
    }
  }
  const d = (p.input === "last" ? ["change"] : ["input", "change"]).map(
    (b) => ee(b, D(f), t)
  ), u = t.defaultView;
  if (!u)
    return () => {
      d.forEach((b) => b());
    };
  const g = u.Object.getOwnPropertyDescriptor(
    u.HTMLInputElement.prototype,
    "value"
  ), v = [
    [u.HTMLInputElement.prototype, "value"],
    [u.HTMLInputElement.prototype, "checked"],
    [u.HTMLSelectElement.prototype, "value"],
    [u.HTMLTextAreaElement.prototype, "value"],
    // Some UI library use selectedIndex to set select value
    [u.HTMLSelectElement.prototype, "selectedIndex"],
    [u.HTMLOptionElement.prototype, "selected"]
  ];
  return g && g.set && d.push(
    ...v.map(
      (b) => yt(
        b[0],
        b[1],
        {
          set() {
            D(f)({
              target: this,
              isTrusted: !1
              // userTriggered to false as this could well be programmatic
            });
          }
        },
        !1,
        u
      )
    )
  ), D(() => {
    d.forEach((b) => b());
  });
}
function nt(e) {
  const t = [];
  function r(l, s) {
    if (Qe("CSSGroupingRule") && l.parentRule instanceof CSSGroupingRule || Qe("CSSMediaRule") && l.parentRule instanceof CSSMediaRule || Qe("CSSSupportsRule") && l.parentRule instanceof CSSSupportsRule || Qe("CSSConditionRule") && l.parentRule instanceof CSSConditionRule) {
      const h = Array.from(
        l.parentRule.cssRules
      ).indexOf(l);
      return s.unshift(h), r(l.parentRule, s);
    } else if (l.parentStyleSheet) {
      const h = Array.from(l.parentStyleSheet.cssRules).indexOf(l);
      s.unshift(h);
    }
    return s;
  }
  return r(e, t);
}
function we(e, t, r) {
  let l, s;
  return e ? (e.ownerNode ? l = t.getId(e.ownerNode) : s = r.getId(e), {
    styleId: s,
    id: l
  }) : {};
}
function fa({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: l }) {
  if (!l.CSSStyleSheet || !l.CSSStyleSheet.prototype)
    return () => {
    };
  const s = l.CSSStyleSheet.prototype.insertRule;
  l.CSSStyleSheet.prototype.insertRule = new Proxy(s, {
    apply: D(
      (i, f, a) => {
        const [n, d] = a, { id: u, styleId: g } = we(
          f,
          t,
          r.styleMirror
        );
        return (u && u !== -1 || g && g !== -1) && e({
          id: u,
          styleId: g,
          adds: [{ rule: n, index: d }]
        }), i.apply(f, a);
      }
    )
  }), l.CSSStyleSheet.prototype.addRule = function(i, f, a = this.cssRules.length) {
    const n = `${i} { ${f} }`;
    return l.CSSStyleSheet.prototype.insertRule.apply(this, [n, a]);
  };
  const c = l.CSSStyleSheet.prototype.deleteRule;
  l.CSSStyleSheet.prototype.deleteRule = new Proxy(c, {
    apply: D(
      (i, f, a) => {
        const [n] = a, { id: d, styleId: u } = we(
          f,
          t,
          r.styleMirror
        );
        return (d && d !== -1 || u && u !== -1) && e({
          id: d,
          styleId: u,
          removes: [{ index: n }]
        }), i.apply(f, a);
      }
    )
  }), l.CSSStyleSheet.prototype.removeRule = function(i) {
    return l.CSSStyleSheet.prototype.deleteRule.apply(this, [i]);
  };
  let h;
  l.CSSStyleSheet.prototype.replace && (h = l.CSSStyleSheet.prototype.replace, l.CSSStyleSheet.prototype.replace = new Proxy(h, {
    apply: D(
      (i, f, a) => {
        const [n] = a, { id: d, styleId: u } = we(
          f,
          t,
          r.styleMirror
        );
        return (d && d !== -1 || u && u !== -1) && e({
          id: d,
          styleId: u,
          replace: n
        }), i.apply(f, a);
      }
    )
  }));
  let m;
  l.CSSStyleSheet.prototype.replaceSync && (m = l.CSSStyleSheet.prototype.replaceSync, l.CSSStyleSheet.prototype.replaceSync = new Proxy(m, {
    apply: D(
      (i, f, a) => {
        const [n] = a, { id: d, styleId: u } = we(
          f,
          t,
          r.styleMirror
        );
        return (d && d !== -1 || u && u !== -1) && e({
          id: d,
          styleId: u,
          replaceSync: n
        }), i.apply(f, a);
      }
    )
  }));
  const o = {};
  Xe("CSSGroupingRule") ? o.CSSGroupingRule = l.CSSGroupingRule : (Xe("CSSMediaRule") && (o.CSSMediaRule = l.CSSMediaRule), Xe("CSSConditionRule") && (o.CSSConditionRule = l.CSSConditionRule), Xe("CSSSupportsRule") && (o.CSSSupportsRule = l.CSSSupportsRule));
  const p = {};
  return Object.entries(o).forEach(([i, f]) => {
    p[i] = {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      insertRule: f.prototype.insertRule,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      deleteRule: f.prototype.deleteRule
    }, f.prototype.insertRule = new Proxy(
      p[i].insertRule,
      {
        apply: D(
          (a, n, d) => {
            const [u, g] = d, { id: v, styleId: b } = we(
              n.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (v && v !== -1 || b && b !== -1) && e({
              id: v,
              styleId: b,
              adds: [
                {
                  rule: u,
                  index: [
                    ...nt(n),
                    g || 0
                    // defaults to 0
                  ]
                }
              ]
            }), a.apply(n, d);
          }
        )
      }
    ), f.prototype.deleteRule = new Proxy(
      p[i].deleteRule,
      {
        apply: D(
          (a, n, d) => {
            const [u] = d, { id: g, styleId: v } = we(
              n.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (g && g !== -1 || v && v !== -1) && e({
              id: g,
              styleId: v,
              removes: [
                { index: [...nt(n), u] }
              ]
            }), a.apply(n, d);
          }
        )
      }
    );
  }), D(() => {
    l.CSSStyleSheet.prototype.insertRule = s, l.CSSStyleSheet.prototype.deleteRule = c, h && (l.CSSStyleSheet.prototype.replace = h), m && (l.CSSStyleSheet.prototype.replaceSync = m), Object.entries(o).forEach(([i, f]) => {
      f.prototype.insertRule = p[i].insertRule, f.prototype.deleteRule = p[i].deleteRule;
    });
  });
}
function an({
  mirror: e,
  stylesheetManager: t
}, r) {
  var l, s, c;
  let h = null;
  r.nodeName === "#document" ? h = e.getId(r) : h = e.getId(_.host(r));
  const m = r.nodeName === "#document" ? (l = r.defaultView) == null ? void 0 : l.Document : (c = (s = r.ownerDocument) == null ? void 0 : s.defaultView) == null ? void 0 : c.ShadowRoot, o = m != null && m.prototype ? Object.getOwnPropertyDescriptor(
    m == null ? void 0 : m.prototype,
    "adoptedStyleSheets"
  ) : void 0;
  return h === null || h === -1 || !m || !o ? () => {
  } : (Object.defineProperty(r, "adoptedStyleSheets", {
    configurable: o.configurable,
    enumerable: o.enumerable,
    get() {
      var p;
      return (p = o.get) == null ? void 0 : p.call(this);
    },
    set(p) {
      var i;
      const f = (i = o.set) == null ? void 0 : i.call(this, p);
      if (h !== null && h !== -1)
        try {
          t.adoptStyleSheets(p, h);
        } catch {
        }
      return f;
    }
  }), D(() => {
    Object.defineProperty(r, "adoptedStyleSheets", {
      configurable: o.configurable,
      enumerable: o.enumerable,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      get: o.get,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      set: o.set
    });
  }));
}
function ha({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: l
}, { win: s }) {
  const c = s.CSSStyleDeclaration.prototype.setProperty;
  s.CSSStyleDeclaration.prototype.setProperty = new Proxy(c, {
    apply: D(
      (m, o, p) => {
        var i;
        const [f, a, n] = p;
        if (r.has(f))
          return c.apply(o, [f, a, n]);
        const { id: d, styleId: u } = we(
          (i = o.parentRule) == null ? void 0 : i.parentStyleSheet,
          t,
          l.styleMirror
        );
        return (d && d !== -1 || u && u !== -1) && e({
          id: d,
          styleId: u,
          set: {
            property: f,
            value: a,
            priority: n
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: nt(o.parentRule)
        }), m.apply(o, p);
      }
    )
  });
  const h = s.CSSStyleDeclaration.prototype.removeProperty;
  return s.CSSStyleDeclaration.prototype.removeProperty = new Proxy(h, {
    apply: D(
      (m, o, p) => {
        var i;
        const [f] = p;
        if (r.has(f))
          return h.apply(o, [f]);
        const { id: a, styleId: n } = we(
          (i = o.parentRule) == null ? void 0 : i.parentStyleSheet,
          t,
          l.styleMirror
        );
        return (a && a !== -1 || n && n !== -1) && e({
          id: a,
          styleId: n,
          remove: {
            property: f
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: nt(o.parentRule)
        }), m.apply(o, p);
      }
    )
  }), D(() => {
    s.CSSStyleDeclaration.prototype.setProperty = c, s.CSSStyleDeclaration.prototype.removeProperty = h;
  });
}
function pa({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: l,
  sampling: s,
  doc: c
}) {
  const h = D(
    (o) => $e(
      D((p) => {
        const i = We(p);
        if (!i || te(i, t, r, !0))
          return;
        const { currentTime: f, volume: a, muted: n, playbackRate: d, loop: u } = i;
        e({
          type: o,
          id: l.getId(i),
          currentTime: f,
          volume: a,
          muted: n,
          playbackRate: d,
          loop: u
        });
      }),
      s.media || 500
    )
  ), m = [
    ee("play", h(Ie.Play), c),
    ee("pause", h(Ie.Pause), c),
    ee("seeked", h(Ie.Seeked), c),
    ee("volumechange", h(Ie.VolumeChange), c),
    ee("ratechange", h(Ie.RateChange), c)
  ];
  return D(() => {
    m.forEach((o) => o());
  });
}
function da({ fontCb: e, doc: t }) {
  const r = t.defaultView;
  if (!r)
    return () => {
    };
  const l = [], s = /* @__PURE__ */ new WeakMap(), c = r.FontFace;
  r.FontFace = function(o, p, i) {
    const f = new c(o, p, i);
    return s.set(f, {
      family: o,
      buffer: typeof p != "string",
      descriptors: i,
      fontSource: typeof p == "string" ? p : JSON.stringify(Array.from(new Uint8Array(p)))
    }), f;
  };
  const h = Re(
    t.fonts,
    "add",
    function(m) {
      return function(o) {
        return setTimeout(
          D(() => {
            const p = s.get(o);
            p && (e(p), s.delete(o));
          }),
          0
        ), m.apply(this, [o]);
      };
    }
  );
  return l.push(() => {
    r.FontFace = c;
  }), l.push(h), D(() => {
    l.forEach((m) => m());
  });
}
function ma(e) {
  const { doc: t, mirror: r, blockClass: l, blockSelector: s, selectionCb: c } = e;
  let h = !0;
  const m = D(() => {
    const o = t.getSelection();
    if (!o || h && (o != null && o.isCollapsed)) return;
    h = o.isCollapsed || !1;
    const p = [], i = o.rangeCount || 0;
    for (let f = 0; f < i; f++) {
      const a = o.getRangeAt(f), { startContainer: n, startOffset: d, endContainer: u, endOffset: g } = a;
      te(n, l, s, !0) || te(u, l, s, !0) || p.push({
        start: r.getId(n),
        startOffset: d,
        end: r.getId(u),
        endOffset: g
      });
    }
    c({ ranges: p });
  });
  return m(), ee("selectionchange", m);
}
function ga({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : Re(
    r.customElements,
    "define",
    function(s) {
      return function(c, h, m) {
        try {
          t({
            define: {
              name: c
            }
          });
        } catch {
          console.warn(`Custom element callback failed for ${c}`);
        }
        return s.apply(this, [c, h, m]);
      };
    }
  );
}
function ya(e, t) {
  const {
    mutationCb: r,
    mousemoveCb: l,
    mouseInteractionCb: s,
    scrollCb: c,
    viewportResizeCb: h,
    inputCb: m,
    mediaInteractionCb: o,
    styleSheetRuleCb: p,
    styleDeclarationCb: i,
    canvasMutationCb: f,
    fontCb: a,
    selectionCb: n,
    customElementCb: d
  } = e;
  e.mutationCb = (...u) => {
    t.mutation && t.mutation(...u), r(...u);
  }, e.mousemoveCb = (...u) => {
    t.mousemove && t.mousemove(...u), l(...u);
  }, e.mouseInteractionCb = (...u) => {
    t.mouseInteraction && t.mouseInteraction(...u), s(...u);
  }, e.scrollCb = (...u) => {
    t.scroll && t.scroll(...u), c(...u);
  }, e.viewportResizeCb = (...u) => {
    t.viewportResize && t.viewportResize(...u), h(...u);
  }, e.inputCb = (...u) => {
    t.input && t.input(...u), m(...u);
  }, e.mediaInteractionCb = (...u) => {
    t.mediaInteaction && t.mediaInteaction(...u), o(...u);
  }, e.styleSheetRuleCb = (...u) => {
    t.styleSheetRule && t.styleSheetRule(...u), p(...u);
  }, e.styleDeclarationCb = (...u) => {
    t.styleDeclaration && t.styleDeclaration(...u), i(...u);
  }, e.canvasMutationCb = (...u) => {
    t.canvasMutation && t.canvasMutation(...u), f(...u);
  }, e.fontCb = (...u) => {
    t.font && t.font(...u), a(...u);
  }, e.selectionCb = (...u) => {
    t.selection && t.selection(...u), n(...u);
  }, e.customElementCb = (...u) => {
    t.customElement && t.customElement(...u), d(...u);
  };
}
function wa(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  ya(e, t);
  let l, s = () => {
  };
  e.recordDOM && ([l, s] = nn(e, e.doc));
  const c = oa(e), h = aa(e), m = on(e), o = la(e, {
    win: r
  }), p = ca(e), i = pa(e);
  let f = () => {
  }, a = () => {
  }, n = () => {
  }, d = () => {
  };
  e.recordDOM && (f = fa(e, { win: r }), a = an(e, e.doc), n = ha(e, {
    win: r
  }), e.collectFonts && (d = da(e)));
  const u = ma(e), g = ga(e), v = [];
  for (const b of e.plugins)
    v.push(
      b.observer(b.callback, r, b.options)
    );
  return D(() => {
    Se.forEach((b) => b.reset()), l == null || l.disconnect(), s(), c(), h(), m(), o(), p(), i(), f(), a(), n(), d(), u(), g(), v.forEach((b) => b());
  });
}
function Qe(e) {
  return typeof window[e] < "u";
}
function Xe(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class hi {
  constructor(t) {
    A(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), A(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
  }
  getId(t, r, l, s) {
    const c = l || this.getIdToRemoteIdMap(t), h = s || this.getRemoteIdToIdMap(t);
    let m = c.get(r);
    return m || (m = this.generateIdFn(), c.set(r, m), h.set(m, r)), m;
  }
  getIds(t, r) {
    const l = this.getIdToRemoteIdMap(t), s = this.getRemoteIdToIdMap(t);
    return r.map(
      (c) => this.getId(t, c, l, s)
    );
  }
  getRemoteId(t, r, l) {
    const s = l || this.getRemoteIdToIdMap(t);
    if (typeof r != "number") return r;
    const c = s.get(r);
    return c || -1;
  }
  getRemoteIds(t, r) {
    const l = this.getRemoteIdToIdMap(t);
    return r.map((s) => this.getRemoteId(t, s, l));
  }
  reset(t) {
    if (!t) {
      this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap(), this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
      return;
    }
    this.iframeIdToRemoteIdMap.delete(t), this.iframeRemoteIdToIdMap.delete(t);
  }
  getIdToRemoteIdMap(t) {
    let r = this.iframeIdToRemoteIdMap.get(t);
    return r || (r = /* @__PURE__ */ new Map(), this.iframeIdToRemoteIdMap.set(t, r)), r;
  }
  getRemoteIdToIdMap(t) {
    let r = this.iframeRemoteIdToIdMap.get(t);
    return r || (r = /* @__PURE__ */ new Map(), this.iframeRemoteIdToIdMap.set(t, r)), r;
  }
}
class ba {
  constructor(t) {
    A(this, "iframes", /* @__PURE__ */ new WeakMap()), A(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), A(this, "crossOriginIframeMirror", new hi(Oi)), A(this, "crossOriginIframeStyleMirror"), A(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), A(this, "mirror"), A(this, "mutationCb"), A(this, "wrappedEmit"), A(this, "loadListener"), A(this, "stylesheetManager"), A(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new hi(
      this.stylesheetManager.styleMirror.generateId.bind(
        this.stylesheetManager.styleMirror
      )
    ), this.mirror = t.mirror, this.recordCrossOriginIframes && window.addEventListener("message", this.handleMessage.bind(this));
  }
  addIframe(t) {
    this.iframes.set(t, !0), t.contentWindow && this.crossOriginIframeMap.set(t.contentWindow, t);
  }
  addLoadListener(t) {
    this.loadListener = t;
  }
  attachIframe(t, r) {
    var l, s;
    this.mutationCb({
      adds: [
        {
          parentId: this.mirror.getId(t),
          nextId: null,
          node: r
        }
      ],
      removes: [],
      texts: [],
      attributes: [],
      isAttachIframe: !0
    }), this.recordCrossOriginIframes && ((l = t.contentWindow) == null || l.addEventListener(
      "message",
      this.handleMessage.bind(this)
    )), (s = this.loadListener) == null || s.call(this, t), t.contentDocument && t.contentDocument.adoptedStyleSheets && t.contentDocument.adoptedStyleSheets.length > 0 && this.stylesheetManager.adoptStyleSheets(
      t.contentDocument.adoptedStyleSheets,
      this.mirror.getId(t.contentDocument)
    );
  }
  handleMessage(t) {
    const r = t;
    if (r.data.type !== "rrweb" || // To filter out the rrweb messages which are forwarded by some sites.
    r.origin !== r.data.origin || !t.source) return;
    const s = this.crossOriginIframeMap.get(t.source);
    if (!s) return;
    const c = this.transformCrossOriginEvent(
      s,
      r.data.event
    );
    c && this.wrappedEmit(
      c,
      r.data.isCheckout
    );
  }
  transformCrossOriginEvent(t, r) {
    var l;
    switch (r.type) {
      case T.FullSnapshot: {
        this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t);
        const s = r.data.node.id;
        return this.crossOriginIframeRootIdMap.set(t, s), this.patchRootIdOnNode(r.data.node, s), {
          timestamp: r.timestamp,
          type: T.IncrementalSnapshot,
          data: {
            source: L.Mutation,
            adds: [
              {
                parentId: this.mirror.getId(t),
                nextId: null,
                node: r.data.node
              }
            ],
            removes: [],
            texts: [],
            attributes: [],
            isAttachIframe: !0
          }
        };
      }
      case T.Meta:
      case T.Load:
      case T.DomContentLoaded:
        return !1;
      case T.Plugin:
        return r;
      case T.Custom:
        return this.replaceIds(
          r.data.payload,
          t,
          ["id", "parentId", "previousId", "nextId"]
        ), r;
      case T.IncrementalSnapshot:
        switch (r.data.source) {
          case L.Mutation:
            return r.data.adds.forEach((s) => {
              this.replaceIds(s, t, [
                "parentId",
                "nextId",
                "previousId"
              ]), this.replaceIdOnNode(s.node, t);
              const c = this.crossOriginIframeRootIdMap.get(t);
              c && this.patchRootIdOnNode(s.node, c);
            }), r.data.removes.forEach((s) => {
              this.replaceIds(s, t, ["parentId", "id"]);
            }), r.data.attributes.forEach((s) => {
              this.replaceIds(s, t, ["id"]);
            }), r.data.texts.forEach((s) => {
              this.replaceIds(s, t, ["id"]);
            }), r;
          case L.Drag:
          case L.TouchMove:
          case L.MouseMove:
            return r.data.positions.forEach((s) => {
              this.replaceIds(s, t, ["id"]);
            }), r;
          case L.ViewportResize:
            return !1;
          case L.MediaInteraction:
          case L.MouseInteraction:
          case L.Scroll:
          case L.CanvasMutation:
          case L.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case L.StyleSheetRule:
          case L.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case L.Font:
            return r;
          case L.Selection:
            return r.data.ranges.forEach((s) => {
              this.replaceIds(s, t, ["start", "end"]);
            }), r;
          case L.AdoptedStyleSheet:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleIds"]), (l = r.data.styles) == null || l.forEach((s) => {
              this.replaceStyleIds(s, t, ["styleId"]);
            }), r;
        }
    }
    return !1;
  }
  replace(t, r, l, s) {
    for (const c of s)
      !Array.isArray(r[c]) && typeof r[c] != "number" || (Array.isArray(r[c]) ? r[c] = t.getIds(
        l,
        r[c]
      ) : r[c] = t.getId(l, r[c]));
    return r;
  }
  replaceIds(t, r, l) {
    return this.replace(this.crossOriginIframeMirror, t, r, l);
  }
  replaceStyleIds(t, r, l) {
    return this.replace(this.crossOriginIframeStyleMirror, t, r, l);
  }
  replaceIdOnNode(t, r) {
    this.replaceIds(t, r, ["id", "rootId"]), "childNodes" in t && t.childNodes.forEach((l) => {
      this.replaceIdOnNode(l, r);
    });
  }
  patchRootIdOnNode(t, r) {
    t.type !== rn.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((l) => {
      this.patchRootIdOnNode(l, r);
    });
  }
}
class Sa {
  constructor(t) {
    A(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), A(this, "mutationCb"), A(this, "scrollCb"), A(this, "bypassOptions"), A(this, "mirror"), A(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!De(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [l] = nn(
      {
        ...this.bypassOptions,
        doc: r,
        mutationCb: this.mutationCb,
        mirror: this.mirror,
        shadowDomManager: this
      },
      t
    );
    this.restoreHandlers.push(() => l.disconnect()), this.restoreHandlers.push(
      on({
        ...this.bypassOptions,
        scrollCb: this.scrollCb,
        // https://gist.github.com/praveenpuglia/0832da687ed5a5d7a0907046c9ef1813
        // scroll is not allowed to pass the boundary, so we need to listen the shadow document
        doc: t,
        mirror: this.mirror
      })
    ), setTimeout(() => {
      t.adoptedStyleSheets && t.adoptedStyleSheets.length > 0 && this.bypassOptions.stylesheetManager.adoptStyleSheets(
        t.adoptedStyleSheets,
        this.mirror.getId(_.host(t))
      ), this.restoreHandlers.push(
        an(
          {
            mirror: this.mirror,
            stylesheetManager: this.bypassOptions.stylesheetManager
          },
          t
        )
      );
    }, 0);
  }
  /**
   * Monkey patch 'attachShadow' of an IFrameElement to observe newly added shadow doms.
   */
  observeAttachShadow(t) {
    !t.contentWindow || !t.contentDocument || this.patchAttachShadow(
      t.contentWindow.Element,
      t.contentDocument
    );
  }
  /**
   * Patch 'attachShadow' to observe newly added shadow doms.
   */
  patchAttachShadow(t, r) {
    const l = this;
    this.restoreHandlers.push(
      Re(
        t.prototype,
        "attachShadow",
        function(s) {
          return function(c) {
            const h = s.call(this, c), m = _.shadowRoot(this);
            return m && tn(this) && l.addShadowRoot(m, r), h;
          };
        }
      )
    );
  }
  reset() {
    this.restoreHandlers.forEach((t) => {
      try {
        t();
      } catch {
      }
    }), this.restoreHandlers = [], this.shadowDoms = /* @__PURE__ */ new WeakSet();
  }
}
var Pe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", va = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var Ke = 0; Ke < Pe.length; Ke++)
  va[Pe.charCodeAt(Ke)] = Ke;
var Ca = function(e) {
  var t = new Uint8Array(e), r, l = t.length, s = "";
  for (r = 0; r < l; r += 3)
    s += Pe[t[r] >> 2], s += Pe[(t[r] & 3) << 4 | t[r + 1] >> 4], s += Pe[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], s += Pe[t[r + 2] & 63];
  return l % 3 === 2 ? s = s.substring(0, s.length - 1) + "=" : l % 3 === 1 && (s = s.substring(0, s.length - 2) + "=="), s;
};
const pi = /* @__PURE__ */ new Map();
function xa(e, t) {
  let r = pi.get(e);
  return r || (r = /* @__PURE__ */ new Map(), pi.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const ln = (e, t, r) => {
  if (!e || !(cn(e, t) || typeof e == "object"))
    return;
  const l = e.constructor.name, s = xa(r, l);
  let c = s.indexOf(e);
  return c === -1 && (c = s.length, s.push(e)), c;
};
function Ze(e, t, r) {
  if (e instanceof Array)
    return e.map((l) => Ze(l, t, r));
  if (e === null)
    return e;
  if (e instanceof Float32Array || e instanceof Float64Array || e instanceof Int32Array || e instanceof Uint32Array || e instanceof Uint8Array || e instanceof Uint16Array || e instanceof Int16Array || e instanceof Int8Array || e instanceof Uint8ClampedArray)
    return {
      rr_type: e.constructor.name,
      args: [Object.values(e)]
    };
  if (
    // SharedArrayBuffer disabled on most browsers due to spectre.
    // More info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/SharedArrayBuffer
    // value instanceof SharedArrayBuffer ||
    e instanceof ArrayBuffer
  ) {
    const l = e.constructor.name, s = Ca(e);
    return {
      rr_type: l,
      base64: s
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          Ze(e.buffer, t, r),
          e.byteOffset,
          e.byteLength
        ]
      };
    if (e instanceof HTMLImageElement) {
      const l = e.constructor.name, { src: s } = e;
      return {
        rr_type: l,
        src: s
      };
    } else if (e instanceof HTMLCanvasElement) {
      const l = "HTMLImageElement", s = e.toDataURL();
      return {
        rr_type: l,
        src: s
      };
    } else {
      if (e instanceof ImageData)
        return {
          rr_type: e.constructor.name,
          args: [Ze(e.data, t, r), e.width, e.height]
        };
      if (cn(e, t) || typeof e == "object") {
        const l = e.constructor.name, s = ln(e, t, r);
        return {
          rr_type: l,
          index: s
        };
      }
    }
  }
  return e;
}
const un = (e, t, r) => e.map((l) => Ze(l, t, r)), cn = (e, t) => !![
  "WebGLActiveInfo",
  "WebGLBuffer",
  "WebGLFramebuffer",
  "WebGLProgram",
  "WebGLRenderbuffer",
  "WebGLShader",
  "WebGLShaderPrecisionFormat",
  "WebGLTexture",
  "WebGLUniformLocation",
  "WebGLVertexArrayObject",
  // In old Chrome versions, value won't be an instanceof WebGLVertexArrayObject.
  "WebGLVertexArrayObjectOES"
].filter(
  (s) => typeof t[s] == "function"
).find(
  (s) => e instanceof t[s]
);
function Ra(e, t, r, l) {
  const s = [], c = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const h of c)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[h] != "function")
        continue;
      const m = Re(
        t.CanvasRenderingContext2D.prototype,
        h,
        function(o) {
          return function(...p) {
            return te(this.canvas, r, l, !0) || setTimeout(() => {
              const i = un(p, t, this);
              e(this.canvas, {
                type: ke["2D"],
                property: h,
                args: i
              });
            }, 0), o.apply(this, p);
          };
        }
      );
      s.push(m);
    } catch {
      const m = yt(
        t.CanvasRenderingContext2D.prototype,
        h,
        {
          set(o) {
            e(this.canvas, {
              type: ke["2D"],
              property: h,
              args: [o],
              setter: !0
            });
          }
        }
      );
      s.push(m);
    }
  return () => {
    s.forEach((h) => h());
  };
}
function Oa(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function di(e, t, r, l) {
  const s = [];
  try {
    const c = Re(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(h) {
        return function(m, ...o) {
          if (!te(this, t, r, !0)) {
            const p = Oa(m);
            if ("__context" in this || (this.__context = p), l && ["webgl", "webgl2"].includes(p))
              if (o[0] && typeof o[0] == "object") {
                const i = o[0];
                i.preserveDrawingBuffer || (i.preserveDrawingBuffer = !0);
              } else
                o.splice(0, 1, {
                  preserveDrawingBuffer: !0
                });
          }
          return h.apply(this, [m, ...o]);
        };
      }
    );
    s.push(c);
  } catch {
    console.error("failed to patch HTMLCanvasElement.prototype.getContext");
  }
  return () => {
    s.forEach((c) => c());
  };
}
function mi(e, t, r, l, s, c) {
  const h = [], m = Object.getOwnPropertyNames(e);
  for (const o of m)
    if (
      //prop.startsWith('get') ||  // e.g. getProgramParameter, but too risky
      ![
        "isContextLost",
        "canvas",
        "drawingBufferWidth",
        "drawingBufferHeight"
      ].includes(o)
    )
      try {
        if (typeof e[o] != "function")
          continue;
        const p = Re(
          e,
          o,
          function(i) {
            return function(...f) {
              const a = i.apply(this, f);
              if (ln(a, c, this), "tagName" in this.canvas && !te(this.canvas, l, s, !0)) {
                const n = un(f, c, this), d = {
                  type: t,
                  property: o,
                  args: n
                };
                r(this.canvas, d);
              }
              return a;
            };
          }
        );
        h.push(p);
      } catch {
        const p = yt(e, o, {
          set(i) {
            r(this.canvas, {
              type: t,
              property: o,
              args: [i],
              setter: !0
            });
          }
        });
        h.push(p);
      }
  return h;
}
function Ma(e, t, r, l) {
  const s = [];
  return typeof t.WebGLRenderingContext < "u" && s.push(
    ...mi(
      t.WebGLRenderingContext.prototype,
      ke.WebGL,
      e,
      r,
      l,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && s.push(
    ...mi(
      t.WebGL2RenderingContext.prototype,
      ke.WebGL2,
      e,
      r,
      l,
      t
    )
  ), () => {
    s.forEach((c) => c());
  };
}
const fn = `(function() {
  "use strict";
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  var encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer), i2, len = bytes.length, base64 = "";
    for (i2 = 0; i2 < len; i2 += 3) {
      base64 += chars[bytes[i2] >> 2];
      base64 += chars[(bytes[i2] & 3) << 4 | bytes[i2 + 1] >> 4];
      base64 += chars[(bytes[i2 + 1] & 15) << 2 | bytes[i2 + 2] >> 6];
      base64 += chars[bytes[i2 + 2] & 63];
    }
    if (len % 3 === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }
    return base64;
  };
  const lastBlobMap = /* @__PURE__ */ new Map();
  const transparentBlobMap = /* @__PURE__ */ new Map();
  async function getTransparentBlobFor(width, height, dataURLOptions) {
    const id = \`\${width}-\${height}\`;
    if ("OffscreenCanvas" in globalThis) {
      if (transparentBlobMap.has(id)) return transparentBlobMap.get(id);
      const offscreen = new OffscreenCanvas(width, height);
      offscreen.getContext("2d");
      const blob = await offscreen.convertToBlob(dataURLOptions);
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = encode(arrayBuffer);
      transparentBlobMap.set(id, base64);
      return base64;
    } else {
      return "";
    }
  }
  const worker = self;
  worker.onmessage = async function(e) {
    if ("OffscreenCanvas" in globalThis) {
      const { id, bitmap, width, height, dataURLOptions } = e.data;
      const transparentBase64 = getTransparentBlobFor(
        width,
        height,
        dataURLOptions
      );
      const offscreen = new OffscreenCanvas(width, height);
      const ctx = offscreen.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      const blob = await offscreen.convertToBlob(dataURLOptions);
      const type = blob.type;
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = encode(arrayBuffer);
      if (!lastBlobMap.has(id) && await transparentBase64 === base64) {
        lastBlobMap.set(id, base64);
        return worker.postMessage({ id });
      }
      if (lastBlobMap.get(id) === base64) return worker.postMessage({ id });
      worker.postMessage({
        id,
        type,
        base64,
        width,
        height
      });
      lastBlobMap.set(id, base64);
    } else {
      return worker.postMessage({ id: e.data.id });
    }
  };
})();
//# sourceMappingURL=image-bitmap-data-url-worker-IJpC7g_b.js.map
`, gi = typeof self < "u" && self.Blob && new Blob([fn], { type: "text/javascript;charset=utf-8" });
function Ea(e) {
  let t;
  try {
    if (t = gi && (self.URL || self.webkitURL).createObjectURL(gi), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(fn),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class Ia {
  constructor(t) {
    A(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), A(this, "rafStamps", { latestId: 0, invokeId: null }), A(this, "mirror"), A(this, "mutationCb"), A(this, "resetObservers"), A(this, "frozen", !1), A(this, "locked", !1), A(this, "processMutation", (o, p) => {
      (this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) && (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(o) || this.pendingCanvasMutations.set(o, []), this.pendingCanvasMutations.get(o).push(p);
    });
    const {
      sampling: r = "all",
      win: l,
      blockClass: s,
      blockSelector: c,
      recordCanvas: h,
      dataURLOptions: m
    } = t;
    this.mutationCb = t.mutationCb, this.mirror = t.mirror, h && r === "all" && this.initCanvasMutationObserver(l, s, c), h && typeof r == "number" && this.initCanvasFPSObserver(r, l, s, c, {
      dataURLOptions: m
    });
  }
  reset() {
    this.pendingCanvasMutations.clear(), this.resetObservers && this.resetObservers();
  }
  freeze() {
    this.frozen = !0;
  }
  unfreeze() {
    this.frozen = !1;
  }
  lock() {
    this.locked = !0;
  }
  unlock() {
    this.locked = !1;
  }
  initCanvasFPSObserver(t, r, l, s, c) {
    const h = di(
      r,
      l,
      s,
      !0
    ), m = /* @__PURE__ */ new Map(), o = new Ea();
    o.onmessage = (d) => {
      const { id: u } = d.data;
      if (m.set(u, !1), !("base64" in d.data)) return;
      const { base64: g, type: v, width: b, height: S } = d.data;
      this.mutationCb({
        id: u,
        type: ke["2D"],
        commands: [
          {
            property: "clearRect",
            // wipe canvas
            args: [0, 0, b, S]
          },
          {
            property: "drawImage",
            // draws (semi-transparent) image
            args: [
              {
                rr_type: "ImageBitmap",
                args: [
                  {
                    rr_type: "Blob",
                    data: [{ rr_type: "ArrayBuffer", base64: g }],
                    type: v
                  }
                ]
              },
              0,
              0
            ]
          }
        ]
      });
    };
    const p = 1e3 / t;
    let i = 0, f;
    const a = () => {
      const d = [];
      return r.document.querySelectorAll("canvas").forEach((u) => {
        te(u, l, s, !0) || d.push(u);
      }), d;
    }, n = (d) => {
      if (i && d - i < p) {
        f = requestAnimationFrame(n);
        return;
      }
      i = d, a().forEach(async (u) => {
        var g;
        const v = this.mirror.getId(u);
        if (m.get(v) || u.width === 0 || u.height === 0) return;
        if (m.set(v, !0), ["webgl", "webgl2"].includes(u.__context)) {
          const S = u.getContext(u.__context);
          ((g = S == null ? void 0 : S.getContextAttributes()) == null ? void 0 : g.preserveDrawingBuffer) === !1 && S.clear(S.COLOR_BUFFER_BIT);
        }
        const b = await createImageBitmap(u);
        o.postMessage(
          {
            id: v,
            bitmap: b,
            width: u.width,
            height: u.height,
            dataURLOptions: c.dataURLOptions
          },
          [b]
        );
      }), f = requestAnimationFrame(n);
    };
    f = requestAnimationFrame(n), this.resetObservers = () => {
      h(), cancelAnimationFrame(f);
    };
  }
  initCanvasMutationObserver(t, r, l) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const s = di(
      t,
      r,
      l,
      !1
    ), c = Ra(
      this.processMutation.bind(this),
      t,
      r,
      l
    ), h = Ma(
      this.processMutation.bind(this),
      t,
      r,
      l
    );
    this.resetObservers = () => {
      s(), c(), h();
    };
  }
  startPendingCanvasMutationFlusher() {
    requestAnimationFrame(() => this.flushPendingCanvasMutations());
  }
  startRAFTimestamping() {
    const t = (r) => {
      this.rafStamps.latestId = r, requestAnimationFrame(t);
    };
    requestAnimationFrame(t);
  }
  flushPendingCanvasMutations() {
    this.pendingCanvasMutations.forEach(
      (t, r) => {
        const l = this.mirror.getId(r);
        this.flushPendingCanvasMutationFor(r, l);
      }
    ), requestAnimationFrame(() => this.flushPendingCanvasMutations());
  }
  flushPendingCanvasMutationFor(t, r) {
    if (this.frozen || this.locked)
      return;
    const l = this.pendingCanvasMutations.get(t);
    if (!l || r === -1) return;
    const s = l.map((h) => {
      const { type: m, ...o } = h;
      return o;
    }), { type: c } = l[0];
    this.mutationCb({ id: r, type: c, commands: s }), this.pendingCanvasMutations.delete(t);
  }
}
class Aa {
  constructor(t) {
    A(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), A(this, "mutationCb"), A(this, "adoptedStyleSheetCb"), A(this, "styleMirror", new Xo()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
  }
  attachLinkElement(t, r) {
    "_cssText" in r.attributes && this.mutationCb({
      adds: [],
      removes: [],
      texts: [],
      attributes: [
        {
          id: r.id,
          attributes: r.attributes
        }
      ]
    }), this.trackLinkElement(t);
  }
  trackLinkElement(t) {
    this.trackedLinkElements.has(t) || (this.trackedLinkElements.add(t), this.trackStylesheetInLinkElement(t));
  }
  adoptStyleSheets(t, r) {
    if (t.length === 0) return;
    const l = {
      id: r,
      styleIds: []
    }, s = [];
    for (const c of t) {
      let h;
      this.styleMirror.has(c) ? h = this.styleMirror.getId(c) : (h = this.styleMirror.add(c), s.push({
        styleId: h,
        rules: Array.from(c.rules || CSSRule, (m, o) => ({
          rule: Ci(m, c.href),
          index: o
        }))
      })), l.styleIds.push(h);
    }
    s.length > 0 && (l.styles = s), this.adoptedStyleSheetCb(l);
  }
  reset() {
    this.styleMirror.reset(), this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
  }
  // TODO: take snapshot on stylesheet reload by applying event listener
  trackStylesheetInLinkElement(t) {
  }
}
class Na {
  constructor() {
    A(this, "nodeMap", /* @__PURE__ */ new WeakMap()), A(this, "active", !1);
  }
  inOtherBuffer(t, r) {
    const l = this.nodeMap.get(t);
    return l && Array.from(l).some((s) => s !== r);
  }
  add(t, r) {
    this.active || (this.active = !0, requestAnimationFrame(() => {
      this.nodeMap = /* @__PURE__ */ new WeakMap(), this.active = !1;
    })), this.nodeMap.set(t, (this.nodeMap.get(t) || /* @__PURE__ */ new Set()).add(r));
  }
  destroy() {
  }
}
let V, et, Rr, ot = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((Gr = e.contentWindow) == null ? void 0 : Gr.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const ue = Tn();
function Oe(e = {}) {
  const {
    emit: t,
    checkoutEveryNms: r,
    checkoutEveryNth: l,
    blockClass: s = "rr-block",
    blockSelector: c = null,
    ignoreClass: h = "rr-ignore",
    ignoreSelector: m = null,
    maskTextClass: o = "rr-mask",
    maskTextSelector: p = null,
    inlineStylesheet: i = !0,
    maskAllInputs: f,
    maskInputOptions: a,
    slimDOMOptions: n,
    maskInputFn: d,
    maskTextFn: u,
    hooks: g,
    packFn: v,
    sampling: b = {},
    dataURLOptions: S = {},
    mousemoveWait: x,
    recordDOM: w = !0,
    recordCanvas: y = !1,
    recordCrossOriginIframes: C = !1,
    recordAfter: O = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: I = !1,
    collectFonts: M = !1,
    inlineImages: P = !1,
    plugins: N,
    keepIframeSrcFn: R = () => !1,
    ignoreCSSAttributes: ae = /* @__PURE__ */ new Set([]),
    errorHandler: se
  } = e;
  ia(se);
  const F = C ? window.parent === window : !0;
  let U = !1;
  if (!F)
    try {
      window.parent.document && (U = !1);
    } catch {
      U = !0;
    }
  if (F && !t)
    throw new Error("emit function is required");
  if (!F && !U)
    return () => {
    };
  x !== void 0 && b.mousemove === void 0 && (b.mousemove = x), ue.reset();
  const G = f === !0 ? {
    color: !0,
    date: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
    textarea: !0,
    select: !0,
    password: !0
  } : a !== void 0 ? a : { password: !0 }, X = Ai(n);
  Qo();
  let J, $ = 0;
  const ge = (k) => {
    for (const Y of N || [])
      Y.eventProcessor && (k = Y.eventProcessor(k));
    return v && // Disable packing events which will be emitted to parent frames.
    !U && (k = v(k)), k;
  };
  V = (k, Y) => {
    var z;
    const H = k;
    if (H.timestamp = Fe(), (z = Se[0]) != null && z.isFrozen() && H.type !== T.FullSnapshot && !(H.type === T.IncrementalSnapshot && H.data.source === L.Mutation) && Se.forEach((ie) => ie.unfreeze()), F)
      t == null || t(ge(H), Y);
    else if (U) {
      const ie = {
        type: "rrweb",
        event: ge(H),
        origin: window.location.origin,
        isCheckout: Y
      };
      window.parent.postMessage(ie, "*");
    }
    if (H.type === T.FullSnapshot)
      J = H, $ = 0;
    else if (H.type === T.IncrementalSnapshot) {
      if (H.data.source === L.Mutation && H.data.isAttachIframe)
        return;
      $++;
      const ie = l && $ >= l, B = r && H.timestamp - J.timestamp > r;
      (ie || B) && et(!0);
    }
  };
  const E = (k) => {
    V({
      type: T.IncrementalSnapshot,
      data: {
        source: L.Mutation,
        ...k
      }
    });
  }, he = (k) => V({
    type: T.IncrementalSnapshot,
    data: {
      source: L.Scroll,
      ...k
    }
  }), ne = (k) => V({
    type: T.IncrementalSnapshot,
    data: {
      source: L.CanvasMutation,
      ...k
    }
  }), _e = (k) => V({
    type: T.IncrementalSnapshot,
    data: {
      source: L.AdoptedStyleSheet,
      ...k
    }
  }), Z = new Aa({
    mutationCb: E,
    adoptedStyleSheetCb: _e
  }), le = new ba({
    mirror: ue,
    mutationCb: E,
    stylesheetManager: Z,
    recordCrossOriginIframes: C,
    wrappedEmit: V
  });
  for (const k of N || [])
    k.getMirror && k.getMirror({
      nodeMirror: ue,
      crossOriginIframeMirror: le.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: le.crossOriginIframeStyleMirror
    });
  const be = new Na();
  Rr = new Ia({
    recordCanvas: y,
    mutationCb: ne,
    win: window,
    blockClass: s,
    blockSelector: c,
    mirror: ue,
    sampling: b.canvas,
    dataURLOptions: S
  });
  const ye = new Sa({
    mutationCb: E,
    scrollCb: he,
    bypassOptions: {
      blockClass: s,
      blockSelector: c,
      maskTextClass: o,
      maskTextSelector: p,
      inlineStylesheet: i,
      maskInputOptions: G,
      dataURLOptions: S,
      maskTextFn: u,
      maskInputFn: d,
      recordCanvas: y,
      inlineImages: P,
      sampling: b,
      slimDOMOptions: X,
      iframeManager: le,
      stylesheetManager: Z,
      canvasManager: Rr,
      keepIframeSrcFn: R,
      processedNodeManager: be
    },
    mirror: ue
  });
  et = (k = !1) => {
    if (!w)
      return;
    V(
      {
        type: T.Meta,
        data: {
          href: window.location.href,
          width: Yi(),
          height: Ji()
        }
      },
      k
    ), Z.reset(), ye.init(), Se.forEach((z) => z.lock());
    const Y = oo(document, {
      mirror: ue,
      blockClass: s,
      blockSelector: c,
      maskTextClass: o,
      maskTextSelector: p,
      inlineStylesheet: i,
      maskAllInputs: G,
      maskTextFn: u,
      maskInputFn: d,
      slimDOM: X,
      dataURLOptions: S,
      recordCanvas: y,
      inlineImages: P,
      onSerialize: (z) => {
        Ki(z, ue) && le.addIframe(z), Zi(z, ue) && Z.trackLinkElement(z), Er(z) && ye.addShadowRoot(_.shadowRoot(z), document);
      },
      onIframeLoad: (z, H) => {
        le.attachIframe(z, H), ye.observeAttachShadow(z);
      },
      onStylesheetLoad: (z, H) => {
        Z.attachLinkElement(z, H);
      },
      keepIframeSrcFn: R
    });
    if (!Y)
      return console.warn("Failed to snapshot the document");
    V(
      {
        type: T.FullSnapshot,
        data: {
          node: Y,
          initialOffset: Gi(window)
        }
      },
      k
    ), Se.forEach((z) => z.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && Z.adoptStyleSheets(
      document.adoptedStyleSheets,
      ue.getId(document)
    );
  };
  try {
    const k = [], Y = (H) => {
      var ie;
      return D(wa)(
        {
          mutationCb: E,
          mousemoveCb: (B, wt) => V({
            type: T.IncrementalSnapshot,
            data: {
              source: wt,
              positions: B
            }
          }),
          mouseInteractionCb: (B) => V({
            type: T.IncrementalSnapshot,
            data: {
              source: L.MouseInteraction,
              ...B
            }
          }),
          scrollCb: he,
          viewportResizeCb: (B) => V({
            type: T.IncrementalSnapshot,
            data: {
              source: L.ViewportResize,
              ...B
            }
          }),
          inputCb: (B) => V({
            type: T.IncrementalSnapshot,
            data: {
              source: L.Input,
              ...B
            }
          }),
          mediaInteractionCb: (B) => V({
            type: T.IncrementalSnapshot,
            data: {
              source: L.MediaInteraction,
              ...B
            }
          }),
          styleSheetRuleCb: (B) => V({
            type: T.IncrementalSnapshot,
            data: {
              source: L.StyleSheetRule,
              ...B
            }
          }),
          styleDeclarationCb: (B) => V({
            type: T.IncrementalSnapshot,
            data: {
              source: L.StyleDeclaration,
              ...B
            }
          }),
          canvasMutationCb: ne,
          fontCb: (B) => V({
            type: T.IncrementalSnapshot,
            data: {
              source: L.Font,
              ...B
            }
          }),
          selectionCb: (B) => {
            V({
              type: T.IncrementalSnapshot,
              data: {
                source: L.Selection,
                ...B
              }
            });
          },
          customElementCb: (B) => {
            V({
              type: T.IncrementalSnapshot,
              data: {
                source: L.CustomElement,
                ...B
              }
            });
          },
          blockClass: s,
          ignoreClass: h,
          ignoreSelector: m,
          maskTextClass: o,
          maskTextSelector: p,
          maskInputOptions: G,
          inlineStylesheet: i,
          sampling: b,
          recordDOM: w,
          recordCanvas: y,
          inlineImages: P,
          userTriggeredOnInput: I,
          collectFonts: M,
          doc: H,
          maskInputFn: d,
          maskTextFn: u,
          keepIframeSrcFn: R,
          blockSelector: c,
          slimDOMOptions: X,
          dataURLOptions: S,
          mirror: ue,
          iframeManager: le,
          stylesheetManager: Z,
          shadowDomManager: ye,
          processedNodeManager: be,
          canvasManager: Rr,
          ignoreCSSAttributes: ae,
          plugins: ((ie = N == null ? void 0 : N.filter((B) => B.observer)) == null ? void 0 : ie.map((B) => ({
            observer: B.observer,
            options: B.options,
            callback: (wt) => V({
              type: T.Plugin,
              data: {
                plugin: B.name,
                payload: wt
              }
            })
          }))) || []
        },
        g
      );
    };
    le.addLoadListener((H) => {
      try {
        k.push(Y(H.contentDocument));
      } catch (ie) {
        console.warn(ie);
      }
    });
    const z = () => {
      et(), k.push(Y(document)), ot = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? z() : (k.push(
      ee("DOMContentLoaded", () => {
        V({
          type: T.DomContentLoaded,
          data: {}
        }), O === "DOMContentLoaded" && z();
      })
    ), k.push(
      ee(
        "load",
        () => {
          V({
            type: T.Load,
            data: {}
          }), O === "load" && z();
        },
        window
      )
    )), () => {
      k.forEach((H) => {
        try {
          H();
        } catch (ie) {
          String(ie).toLowerCase().includes("cross-origin") || console.warn(ie);
        }
      }), be.destroy(), ot = !1, na();
    };
  } catch (k) {
    console.warn(k);
  }
}
Oe.addCustomEvent = (e, t) => {
  if (!ot)
    throw new Error("please add custom event after start recording");
  V({
    type: T.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
Oe.freezePage = () => {
  Se.forEach((e) => e.freeze());
};
Oe.takeFullSnapshot = (e) => {
  if (!ot)
    throw new Error("please take full snapshot after start recording");
  et(e);
};
Oe.mirror = ue;
var yi;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(yi || (yi = {}));
const { addCustomEvent: Pa } = Oe, { freezePage: ka } = Oe, { takeFullSnapshot: _a } = Oe;
export {
  T as EventType,
  L as IncrementalSource,
  re as MouseInteractions,
  Pa as addCustomEvent,
  ka as freezePage,
  oi as mirror,
  Oe as record,
  _a as takeFullSnapshot
};
