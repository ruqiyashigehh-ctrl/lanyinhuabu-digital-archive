/* ══════════════════════════════════════════════════════════════════
   全站交互脚本（多页版的唯一编辑源，由 build_site.py 同步）
   ---------------------------------------------------------------
   整段包在一个 IIFE 里（不污染全局）；开头探测 prefers-reduced-motion，
   所有动画在其开启时降级为直达终态。

   模块目录（按初始化顺序）：
     M1 导航吸顶线       scrollY>8 时给 .nav 打 data-stuck，显示底边细线
     M2 移动端抽屉       汉堡开关 / 焦点管理 / Esc / Tab 焦点圈闭
     M3 页面转场         多页版跨文档跳转的 210ms 淡出（单文件版不走这条）
     M4 页脚手风琴       <details> 的平滑展开收起（CSS 无法对 open 做过渡，手动补）
     M5 滚动淡入         [data-reveal] 进视口淡入；同排错峰；2.5s 兜底
     M6 封面视差         hero 底布纹样按 data-plx 系数做指针跟随（仅精确指针）
     M7 板块展开 + 慢滚  首页标题点击展开/收起、锚点 800ms 定位滚动
                         含 M7b：跳到板块内小块时先展开面板，落位后短暂高亮 + 去向提示
     M8 导航 scroll spy  滚动位置 ↔ 菜单高亮联动
     M9 数据图表动效     count-up 数字 / 工序分段 / 条形对比（进视口播一次）
   事件约定：window 的自定义事件 lb:reveal 表示「页面刚切换/板块刚展开，
   需要重扫滚动淡入与导航高亮」——多页版与单文件版共用。
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── M1 导航吸顶线 ─────────────────────────────── */
  var nav = document.getElementById("nav");
  var onScroll = function () { nav.dataset.stuck = window.scrollY > 8 ? "true" : "false"; };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── M2 移动端抽屉 ───────────────────────────────
     开抽屉记住焦点以便归还；inert 阻止抽屉外元素获得焦点；
     Tab 圈闭保证键盘焦点不出抽屉。 */
  var burger = document.getElementById("burger");
  var drawer = document.getElementById("drawer");
  var closeBtn = document.getElementById("drawerClose");
  var lastFocus = null;

  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.inert = false;
    drawer.dataset.open = "true";
    burger.setAttribute("aria-expanded", "true");
    closeBtn.focus();
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer.dataset.open = "false";
    burger.setAttribute("aria-expanded", "false");
    drawer.inert = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  burger.addEventListener("click", function () {
    if (drawer.dataset.open === "true") { closeDrawer(); } else { openDrawer(); }
  });
  closeBtn.addEventListener("click", closeDrawer);
  drawer.addEventListener("click", function (e) { if (e.target.tagName === "A") closeDrawer(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.dataset.open === "true") closeDrawer();
    if (e.key !== "Tab" || drawer.dataset.open !== "true") return;
    var items = drawer.querySelectorAll("button, a[href]");
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ── M3 页面转场（仅多页版生效）──────────────────
     点击站内链接 → 挂 lb-leaving 播 210ms 淡出 → 再真正跳转。
     排除项：修饰键 / 新标签 / 下载链接 / 纯锚点 / 跨域 / 同页。 */
  window.addEventListener("pageshow", function () {
    document.documentElement.classList.remove("lb-leaving");
  });
  var LEAVE_MS = 210;
  document.addEventListener("click", function (e) {
    if (reduce || e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var node = e.target;
    var a = node && node.closest ? node.closest("a[href]") : null;
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#") return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    document.documentElement.classList.add("lb-leaving");
    window.setTimeout(function () { location.href = a.href; }, LEAVE_MS);
  });

  /* ── M4 页脚手风琴 ───────────────────────────────
     原生 <details> 开合是瞬时跳变，CSS 无法过渡 open 属性，
     这里手动补高度/透明度过渡：先量高 → rAF 内过渡 → 过渡完
     再真正改 open，动画期间锁 dataset.anim 防连点。 */
  Array.prototype.forEach.call(document.querySelectorAll(".foot details"), function (d) {
    var sum = d.querySelector("summary");
    var list = d.querySelector("ul");
    if (!sum || !list) return;
    sum.setAttribute("aria-expanded", d.hasAttribute("open") ? "true" : "false");
    sum.addEventListener("click", function (e) {
      if (reduce) {
        sum.setAttribute("aria-expanded", d.hasAttribute("open") ? "false" : "true");
        return;
      }
      e.preventDefault();
      if (d.dataset.anim === "1") return;
      d.dataset.anim = "1";
      var done = function () { list.style.cssText = ""; d.dataset.anim = "0"; };
      list.style.overflow = "hidden";
      if (d.hasAttribute("open")) {
        list.style.height = list.offsetHeight + "px";
        list.style.marginBottom = "16px";
        requestAnimationFrame(function () {
          list.style.transition = "height .26s var(--ease), margin-bottom .26s var(--ease), opacity .18s var(--ease)";
          list.style.height = "0px";
          list.style.marginBottom = "0px";
          list.style.opacity = "0";
        });
        list.addEventListener("transitionend", function onEnd(ev) {
          if (ev.propertyName !== "height") return;
          list.removeEventListener("transitionend", onEnd);
          d.removeAttribute("open");
          sum.setAttribute("aria-expanded", "false");
          done();
        });
      } else {
        d.setAttribute("open", "");
        sum.setAttribute("aria-expanded", "true");
        var h = list.offsetHeight;
        list.style.height = "0px";
        list.style.marginBottom = "0px";
        list.style.opacity = "0";
        requestAnimationFrame(function () {
          list.style.transition = "height .28s var(--ease), margin-bottom .28s var(--ease), opacity .22s var(--ease)";
          list.style.height = h + "px";
          list.style.marginBottom = "16px";
          list.style.opacity = "1";
        });
        list.addEventListener("transitionend", function onEnd2(ev) {
          if (ev.propertyName !== "height") return;
          list.removeEventListener("transitionend", onEnd2);
          done();
        });
      }
    });
  });

  /* ── M5 滚动淡入 ─────────────────────────────────
     分两路：首屏内的元素直接显示（markInstant，不做动画，
     避免与页面级淡入叠两层）；首屏之下的交给 IntersectionObserver
     （revealLate，同排兄弟最多 4 档 × 70ms 错峰）。
     IO 每次重扫前断开重建，保证新显示的页面用最新布局。 */
  var REVEAL_CFG = { threshold: 0, rootMargin: "0px 0px -10% 0px" };
  var NOT_YET = '[data-reveal]:not([data-revealed="true"])';
  var io = null;

  /* 已在视口内的元素：直接显示，不做入场动画（换页时由页面级淡入负责，避免两层淡入糊在一起） */
  function markInstant(el) {
    el.style.transition = "none";
    el.style.transitionDelay = "0ms";
    el.dataset.revealed = "true";
    window.requestAnimationFrame(function () {
      el.style.transition = "";
      el.style.transitionDelay = "";
    });
  }
  /* 从下方滚进来的元素：淡入 + 同排错峰 */
  function revealLate(el) {
    var sib = el.parentElement ? Array.prototype.slice.call(el.parentElement.children) : [];
    el.style.transitionDelay = Math.min(Math.max(sib.indexOf(el), 0), 4) * 70 + "ms";
    el.dataset.revealed = "true";
  }
  function list(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function visible(el) {
    var r = el.getBoundingClientRect();
    return (r.width || r.height) ? r : null;   /* display:none 的页面量出来是 0×0，先跳过 */
  }
  function scanReveal(safety) {
    var left = list(NOT_YET);
    if (!left.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      left.forEach(function (el) { el.dataset.revealed = "true"; });
      return;
    }
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealLate(entry.target);
        io.unobserve(entry.target);
      });
    }, REVEAL_CFG);
    var vh = window.innerHeight || document.documentElement.clientHeight;
    left.forEach(function (el) {
      var r = visible(el);
      if (!r) return;                       /* 本页还没显示：换页后由 lb:reveal 重新扫描 */
      if (r.top < vh * 0.92) { markInstant(el); return; }
      io.observe(el);
    });
    if (!safety) return;
    window.setTimeout(function () {         /* 兜底：视口里若还有没显示的，直接补上 */
      list(NOT_YET).forEach(function (el) {
        var r = visible(el);
        if (!r) return;
        if (r.top < vh && r.bottom > 0) { revealLate(el); if (io) io.unobserve(el); }
      });
    }, 2500);
  }
  scanReveal(true);
  /* 单文件版换页时由路由广播，重新扫描刚显示的那一页 */
  window.addEventListener("lb:reveal", function () { window.setTimeout(function () { scanReveal(true); }, 30); });

  /* ── M6 指针视差（封面 / 第 9 块共用）─────────────
     仅鼠标设备（触屏没有 hover）；每个「视差作用域」= 带 .plx 的容器，
     容器内每层的跟随幅度写在 data-plx 上，rAF 里做插值，
     松手（指针离开该容器）后缓动归位。
     作用域化之后，同一套逻辑可挂在任意多个板块上，不再写死 .hero。 */
  (function () {
    if (reduce) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var hosts = document.querySelectorAll(".plx");
    Array.prototype.forEach.call(hosts, function (host) {
      var layers = [];
      Array.prototype.forEach.call(host.querySelectorAll("[data-plx]"), function (el) {
        var k = parseFloat(el.getAttribute("data-plx"));
        if (k) layers.push({ el: el, k: k, x: 0, y: 0, tx: 0, ty: 0 });
      });
      if (!layers.length) return;
      var raf = null;
      function step() {
        var live = false;
        layers.forEach(function (l) {
          l.x += (l.tx - l.x) * 0.14;
          l.y += (l.ty - l.y) * 0.14;
          if (Math.abs(l.tx - l.x) > 0.1 || Math.abs(l.ty - l.y) > 0.1) live = true;
          l.el.style.transform = "translate(" + l.x.toFixed(2) + "px," + l.y.toFixed(2) + "px)";
        });
        raf = live ? window.requestAnimationFrame(step) : null;
      }
      function kick() { if (raf === null) raf = window.requestAnimationFrame(step); }
      host.addEventListener("pointermove", function (e) {
        var r = host.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var nx = (e.clientX - r.left) / r.width * 2 - 1;    /* 归一化到 -1 … 1 */
        var ny = (e.clientY - r.top) / r.height * 2 - 1;
        layers.forEach(function (l) {
          l.tx = nx * l.k;
          l.ty = ny * l.k;                             /* 上下左右都满幅 ±k */
        });
        kick();
      }, { passive: true });
      host.addEventListener("pointerleave", function () {
        layers.forEach(function (l) { l.tx = 0; l.ty = 0; });
        kick();
      }, { passive: true });
    });
  })();

  /* ── M7 首页板块展开 + 锚点慢滚 ─────────────────
     SECS 注册了全部可折叠板块：初始化时把标题之后的兄弟节点
     包进 .sec-body、标题换成带 aria 的按钮（渐进增强，
     无 JS 时内容保持展开可读）。 */
  var SECS = ["intro", "themes", "craft", "people", "archive", "value", "vision", "open", "download"];
  var secEls = [];
  SECS.forEach(function (id) {
    var sec = document.getElementById(id);
    if (!sec) return;
    /* 标题优先取 h2；下载纹样板块用的是 h3.serif，兜底取 h3 */
    var h2 = sec.querySelector("h2") || sec.querySelector("h3");
    if (!h2 || h2.querySelector(".sec-toggle")) return;
    var shell = h2.parentElement;
    var body = document.createElement("div");
    body.className = "sec-body";
    body.id = id + "Body";
    /* 保留内容包裹层，隔离子元素外边距与收展高度计算。
       浅蓝底色由 sec-fold.is-open 绘制到整个栏目，而非正文包裹层。 */
    var pad = document.createElement("div");
    pad.className = "sec-pad";
    var n = h2.nextSibling;
    while (n) {
      var next = n.nextSibling;
      pad.appendChild(n);
      n = next;
    }
    body.appendChild(pad);
    shell.appendChild(body);
    /* 箭头由两条描边线勾出（不是字符「↓」），两个方向各一份，
       展开/收起时靠上下位移交接（见 CSS §9.4「收展箭头」）。 */
    h2.innerHTML = '<button type="button" class="sec-toggle" aria-expanded="false" aria-controls="' + body.id + '">' +
      h2.innerHTML + '<span class="sec-chev" aria-hidden="true"><i></i><i></i></span></button>';
    sec.classList.add("sec-fold");   /* 收起时收紧板块上下留白（见 §9.2） */
    secEls.push(sec);
  });
  var SEC_STEP = 55, SEC_CAP = 400;   /* 展开时条目错峰的步长 / 上限 */
  /* 展开：面板里的内容块逐个淡入上浮。
     错峰单元 = 面板的直接子块；ul/ol/div 这类网格容器再下钻一层，
     好让一排卡片是一张张浮出来，而不是整块一起蹦。 */
  function revealSection(sec) {
    var body = sec.querySelector(".sec-body");
    if (!body) return;
    /* 面板里挂着滚动淡入标记的卡片：先把显示标记补上，
       否则 animation 一结束就会回落到 opacity:0 的隐藏态。 */
    Array.prototype.forEach.call(
      body.querySelectorAll('[data-reveal]:not([data-revealed="true"])'),
      function (el) { el.dataset.revealed = "true"; }
    );
    var units = [];
    /* 错峰单元从内衬层那一档开始数：.sec-body 的直接子元素现在只有 .sec-pad，
       照旧从 body.children 取的话，网格容器（一排卡片）就少了一层下钻，
       卡片会整排一起蹦出来，而不是一张张浮起来。 */
    var root = body.firstElementChild && body.firstElementChild.className === "sec-pad"
      ? body.firstElementChild : body;
    Array.prototype.forEach.call(root.children, function (c) {
      if (/^(UL|OL|DIV)$/.test(c.tagName) && c.children.length > 1) {
        Array.prototype.forEach.call(c.children, function (g) { units.push(g); });
      } else {
        units.push(c);
      }
    });
    units.forEach(function (el, i) {
      el.style.setProperty("--sec-d", Math.min(i * SEC_STEP, SEC_CAP) + "ms");
      el.classList.add("sec-in");
    });
  }
  /* 收起：摘掉动画标记，下次展开才会重新浮一遍 */
  function hideSection(sec) {
    var body = sec.querySelector(".sec-body");
    if (!body) return;
    Array.prototype.forEach.call(body.querySelectorAll(".sec-in"), function (el) {
      el.classList.remove("sec-in");
      el.style.removeProperty("--sec-d");
    });
  }
  /* —— 收起 / 展开统一走同一条时间轴 ——
     ① 合二为一：原本是两条各跑各的 CSS 过渡（面板内容高度 0.34s + 板块下方留白 0.3s）。
        实测这两条并不同步：内容在 0–300ms 收完，留白直到 310ms 才开始接上，
        于是板块之间那条分隔线收到一半会停一下、再往上收一段——
        正是用户说的「卡顿一下，然后再往上收」。现在两者共走一条 rAF 时间轴。
     ② 收尾还要再蹦一小截：.sec-body 在普通 block 形态下，第一个子元素的上外边距会
        「穿」出盒子变成盒子自己的上外边距（工序板块是 16px），所以 height 归零之后
        面板仍占着这 16px；脚本摘掉行内样式、交还给 CSS 的 display:none 的那一刻，
        16px 凭空蒸发，分隔线会在收完之后又往上跳一下——这就是残余的那下卡顿。
        解法：量高度和做动画都在 flow-root 形态下（CSS §9.2 那条 display:flow-root），
        面板成为 BFC，外边距留在盒内；height:0 时它的贡献恰好为 0，
        与 display:none 的收起态一分不差，最后那一帧自然也就没有跳动了。
        注意「先上形态、再量高度」的顺序不能反：flow-root 下盒子的自然高度会多出
        这 16px，若照旧用 block 形态的高度起手，第一帧就会先剪掉 16px 内容，
        变成方向相反的一下跳动。
     ③ 快慢：时长按本次「要走多远」给（foldDur），并把缓动换成速度起伏很小的
        easeInOutSine（峰值只有均速的 1.57 倍；原来的 easeInOutCubic 是 2.97 倍），
        长面板不会再几百毫秒里被甩过去。上下留白的数值一个像素都没改。 */
  var FOLD_BASE = 340, FOLD_K = .30, FOLD_MIN = 440, FOLD_MAX = 820;
  function foldDur(dist) {
    return Math.round(Math.max(FOLD_MIN, Math.min(FOLD_MAX, FOLD_BASE + dist * FOLD_K)));
  }
  var foldLast = FOLD_MIN;              /* 最近一次的时长，给别处等回调用 */
  function foldMs(sec) { return (sec && sec.__foldMs) || foldLast || FOLD_MIN; }
  function rmNow() {
    var q = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    return !!(q && q.matches);
  }
  /* 缓动：正弦进出（easeInOutSine）。
     之所以弃用原来的 easeInOutCubic：它的速度峰值是均速的 2.97 倍、末段只剩 0.03 倍，
     中间被狠狠甩一下、尾巴又几乎不动地蹭完最后几十像素，读起来就是「快」+「顿」。
     正弦进出的峰值只有 1.57 倍、末段仍有 0.26 倍，全程匀速感更强，落地时还在走。 */
  function foldEase(t) { return t <= 0 ? 0 : t >= 1 ? 1 : (1 - Math.cos(Math.PI * t)) / 2; }
  function foldStop(sec) {
    if (sec.__foldRaf) { window.cancelAnimationFrame(sec.__foldRaf); sec.__foldRaf = 0; }
  }
  function foldRun(sec, dur, step, done) {
    foldStop(sec);
    if (rmNow() || !dur) { step(1); if (done) done(); return; }
    var t0 = 0;
    function frame(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      step(foldEase(p));
      if (p < 1) sec.__foldRaf = window.requestAnimationFrame(frame);
      else { sec.__foldRaf = 0; if (done) done(); }
    }
    sec.__foldRaf = window.requestAnimationFrame(frame);
  }
  /* 收起态的下方留白：与 CSS 同一出处（--fold-pad），脚本不另写死数值 */
  function foldPad(sec) {
    var v = parseFloat(getComputedStyle(sec).getPropertyValue("--fold-pad"));
    return isNaN(v) ? 26 : v;
  }
  function padNow(sec) { return parseFloat(getComputedStyle(sec).paddingBottom) || 0; }
  /* 收摊：清掉动画期间挂上的所有内联量，把样式交还给 CSS 的规则 */
  function foldClean(sec, body) {
    if (body) {
      body.classList.remove("is-closing", "is-out", "is-foldanim");
      body.style.removeProperty("--sec-h");
      body.style.removeProperty("height");
      body.style.removeProperty("transition-duration");
    }
    sec.classList.remove("is-foldpad");
    sec.style.removeProperty("padding-bottom");
  }
  function clearClose(sec) {
    var st = sec.__lbClose;
    foldStop(sec);
    foldClean(sec, sec.querySelector(".sec-body"));
    if (!st) return;
    window.clearTimeout(st.timer);
    sec.__lbClose = null;
  }
  function startClose(sec) {
    var body = sec.querySelector(".sec-body");
    if (!body) return;
    foldStop(sec);                                    /* 打断上一次没跑完的展开 */
    sec.classList.add("is-foldpad");                  /* 先关 CSS 那道 padding 过渡再量值 */
    /* 顺序要紧：先把面板切成 flow-root（BFC）形态，再量自然高度。
       形态不同，盒子的自然高度也不同（外边距收进盒内后会多出一段），
       量与跑必须用同一个形态，最后一帧才对得上「收干净」的那条 CSS 规则。 */
    body.classList.add("is-closing", "is-foldanim");
    var h = body.getBoundingClientRect().height;
    var p0 = padNow(sec), p1 = foldPad(sec);
    if (!h || rmNow()) { foldClean(sec, body); hideSection(sec); return; }
    var dur = foldDur(h + Math.abs(p1 - p0));
    foldLast = dur; sec.__foldMs = dur;
    body.style.height = h + "px";
    sec.style.paddingBottom = p0 + "px";
    /* 淡出跟总时长走：内容走多远就淡多久，不会「内容先没了、空间还在慢慢合」 */
    body.style.transitionDuration = Math.round(dur * .66) + "ms";
    void body.offsetHeight;                           /* 钉住起点 */
    body.classList.add("is-out");                     /* 透明度仍交给 CSS 过渡 */
    var st = { timer: 0 };
    sec.__lbClose = st;
    foldRun(sec, dur, function (e) {
      body.style.height = (h * (1 - e)) + "px";
      sec.style.paddingBottom = (p0 + (p1 - p0) * e) + "px";
    }, function () {
      sec.__lbClose = null;
      foldClean(sec, body);
      hideSection(sec);                               /* 摘掉错峰标记，下次展开重放 */
    });
    st.timer = window.setTimeout(function () {        /* 兜底：rAF 没跑完也要收干净 */
      if (!sec.__lbClose) return;
      sec.__lbClose = null;
      foldClean(sec, body);
      hideSection(sec);
    }, dur + 200);
  }
  /* 展开对称处理：内容高度与下方留白同样由一条时间轴撑开，
     而不是「内容瞬出、留白再慢慢长」那种两段式。 */
  function startOpen(sec) {
    var body = sec.querySelector(".sec-body");
    if (!body) return;
    foldStop(sec);
    var st = sec.__lbClose;
    if (st) { window.clearTimeout(st.timer); sec.__lbClose = null; }
    foldClean(sec, body);
    /* 顺序要紧：先摘掉 CSS 那条 .34s 的 padding 过渡，再切 is-open。
       否则刚切上就启动过渡，此刻读到的 computed padding 是过渡起点（仍是收起值
       26/30），脚本会以为「展开态也是 30」，插值等于没写，
       动画结束后 CSS 过渡才接着补涨——又变成两段式。 */
    sec.classList.add("is-foldpad");
    sec.classList.add("is-open");                     /* 先可见才量得到自然高度 */
    body.classList.add("is-foldanim");                /* 同起手：先上 BFC 形态再量高度 */
    var h = body.getBoundingClientRect().height;
    var p1 = padNow(sec), p0 = foldPad(sec);          /* 展开态 / 收起态 */
    revealSection(sec);                               /* 面板内条目错峰淡入 */
    window.dispatchEvent(new Event("lb:reveal"));     /* 再重扫一次滚动淡入 */
    if (!h || rmNow()) { foldClean(sec, body); return; }
    var dur = foldDur(h + Math.abs(p1 - p0));
    foldLast = dur; sec.__foldMs = dur;
    body.style.height = "0px";
    sec.style.paddingBottom = p0 + "px";
    void body.offsetHeight;                           /* 钉住起点 */
    foldRun(sec, dur, function (e) {
      body.style.height = (h * e) + "px";
      sec.style.paddingBottom = (p0 + (p1 - p0) * e) + "px";
    }, function () { foldClean(sec, body); });
  }
  function setSec(sec, open) {
    var btn = sec.querySelector(".sec-toggle");
    clearClose(sec);                                  /* 打断上一次未完的收起 */
    if (open) {
      startOpen(sec);
      if (btn) btn.setAttribute("aria-expanded", "true");
    } else {
      var wasOpen = sec.classList.contains("is-open");
      if (btn) btn.setAttribute("aria-expanded", "false");
      /* 收起即停：板块内任何正在播的视频一律暂停，
         不然面板收起（display:none）后画面停了、声音还在走 */
      Array.prototype.forEach.call(sec.querySelectorAll("video"), function (v) {
        try { v.pause(); } catch (e) {}
      });
      /* 顺序要紧：必须先 startClose（此时 is-open 还在，量得到真实高度并挂上
         .is-closing 维持 display:block），再摘 is-open。反过来的话面板会立刻
         display:none，量到高度 0，收起动画就不可能播出来。 */
      if (wasOpen) startClose(sec); else hideSection(sec);
      sec.classList.remove("is-open");                       /* 下方留白同时开始收回过渡 */
    }
    return open;
  }
  /* 慢速平滑滚动：原生 smooth 时长不可调，改为 rAF 时间轴动画。
     固定 800ms、easeInOutCubic；用户滚轮/触摸/按键随时打断；
     prefers-reduced-motion 或极短距离时直接跳。 */
  var rmQ = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var scrollRAF = 0, scrollStop = false;
  function navTop() {
    var nav = document.getElementById("nav");
    return (nav ? nav.offsetHeight : 64) + 22;
  }
  function easeInOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function slowScrollTo(y, done) {
    y = Math.max(0, y);
    var y0 = window.scrollY || window.pageYOffset || 0;
    var dy = y - y0;
    function fin() { if (done) { var f = done; done = null; f(); } }   /* 回调只跑一次 */
    if ((rmQ && rmQ.matches) || Math.abs(dy) < 3) { window.scrollTo(0, y); fin(); return; }
    var dur = 800;                                                 /* 固定约 800ms，远近一致 */
    var t0 = 0;
    if (scrollRAF) window.cancelAnimationFrame(scrollRAF);
    scrollStop = false;
    function step(now) {
      if (!t0) t0 = now;
      if (scrollStop) { scrollRAF = 0; fin(); return; }            /* 被用户打断也算「到位」 */
      var p = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, y0 + dy * easeInOut(p));
      if (p < 1) { scrollRAF = window.requestAnimationFrame(step); }
      else { scrollRAF = 0; fin(); }
    }
    scrollRAF = window.requestAnimationFrame(step);
  }
  ["wheel", "touchstart", "keydown"].forEach(function (ev) {     /* 用户一动手就交还控制权 */
    window.addEventListener(ev, function () {
      scrollStop = true;
      if (scrollRAF) { window.cancelAnimationFrame(scrollRAF); scrollRAF = 0; }
    }, { passive: true });
  });
  /* 目标块的文档纵坐标：沿 offsetParent 链累加 offsetTop。
     刻意不用 getBoundingClientRect——板块刚展开时条目正在跑「淡入上浮」动画，
     rect 会把 translateY 的位移算进去，按版面量到的才是它最终停住的位置。 */
  function docTop(el) {
    var y = 0, n = el;
    while (n) { y += n.offsetTop; n = n.offsetParent; }
    return y;
  }
  function secOf(el) {                                            /* 元素所属的首页板块（含自身） */
    for (var i = 0; i < secEls.length; i++) {
      if (secEls[i] === el || secEls[i].contains(el)) return secEls[i];
    }
    return null;
  }

  /* ── M7b 锚点跳转的落位反馈 ──────────────────────
     二级目录里的「壹 · 刻版」「吴元新」这类目标，藏在折叠板块里看不见，
     直接跳会没反应。gotoId() 先把所在面板展开、再慢滚过去，落位之后：
       ① 给目标块加 .lb-flash —— 一圈会呼吸的描边，1.7s 自动褪去；
       ② 底部弹一条 .lb-hint 去向胶囊，2.2s 自动收起。
     目标是整块 section（如 #craft 本身）时不高亮，避免整屏闪一下。 */
  var FLASH_MS = 1700, HINT_MS = 2200;
  var flashTimer = 0, hintTimer = 0, hintBox = null;
  function showHint(text) {
    if (!hintBox) {
      hintBox = document.createElement("div");
      hintBox.className = "lb-hint";
      hintBox.setAttribute("role", "status");                     /* 读屏播报去向 */
      hintBox.setAttribute("aria-live", "polite");
      document.body.appendChild(hintBox);
    }
    hintBox.textContent = text;
    hintBox.classList.remove("is-on");
    void hintBox.offsetWidth;                                     /* 强制回流，让动画能重播 */
    hintBox.classList.add("is-on");
    window.clearTimeout(hintTimer);
    hintTimer = window.setTimeout(function () { hintBox.classList.remove("is-on"); }, HINT_MS);
  }
  /* 收起高亮时必须连入场动画标记一起摘：
     只摘 .lb-flash 的话，元素的 animation 会落回 .sec-in 的 lb-item-in，
     浏览器把它当作「动画名变了」重新播一遍淡入——看到的就是「前一张卡片又淡入一次」。
     此刻入场动画早已播完（面板展开 1s 内结束，而高亮至少 1.7s 后才收），
     摘掉 .sec-in 不产生任何视觉差异，只是清掉一个已完成的动画。 */
  function clearFlash(el) {
    el.classList.remove("lb-flash", "sec-in");
    el.style.removeProperty("--sec-d");
  }
  function flashEl(el, label) {
    window.clearTimeout(flashTimer);
    var prev = document.querySelector(".lb-flash");
    if (prev) clearFlash(prev);                                   /* 换目标：先把上一张收干净 */
    void el.offsetWidth;                                          /* 强制回流，让描边动画能重播 */
    el.classList.add("lb-flash");
    flashTimer = window.setTimeout(function () { clearFlash(el); }, FLASH_MS);
    if (label) showHint("已到达 · " + label);
  }
  /* 从顶部目录反查某个锚点的「去向名」：hashchange / 跨页路由进来时只拿得到 id，
     提示胶囊想显示「已到达 · 几何」就得自己回目录里查一眼。 */
  function labelFor(id) {
    var a = document.querySelector('.nav__sub a[href="#' + id + '"]');
    return a ? (a.textContent || "").trim() : "";
  }
  /* 统一的「去某个锚点」入口。返回 true 表示已接管（调用方据此 preventDefault），
     false 表示目标不可见（多半不在当前页）——留给路由或浏览器默认行为。 */
  /* 题材卡躺在横向滚动条（.rail）里：窄屏时目标卡多半滑在可视区外，
     纵向落位前先把横条滚到能看见它（居中优先，两端自动收敛）。
     用 rect 差值而不是 offsetLeft——offsetLeft 是相对 offsetParent 的，
     横条不定位时两者基准不同，量出来会偏。 */
  function railIntoView(el) {
    var rail = el.closest ? el.closest(".rail") : null;
    if (!rail || rail.scrollWidth <= rail.clientWidth + 2) return;   /* 没溢出就不用滚 */
    var max = rail.scrollWidth - rail.clientWidth;
    var left = rail.scrollLeft
             + (el.getBoundingClientRect().left - rail.getBoundingClientRect().left)
             - Math.max(0, (rail.clientWidth - el.offsetWidth) / 2);
    left = Math.max(0, Math.min(max, left));
    if (rmQ && rmQ.matches) { rail.scrollLeft = left; return; }
    try { rail.scrollTo({ left: left, behavior: "smooth" }); }
    catch (err) { rail.scrollLeft = left; }                          /* 老浏览器没有 scrollTo 选项 */
  }
  function gotoId(id, label) {
    var el = document.getElementById(id);
    if (!el) return false;
    /* 工序卡：定位动作全权交给甲板模块（lb:deck-goto）——横向滑到对应卡居中、
       页面纵向落到甲板，与左上角胶囊点击一致；这里只负责展开板块和到达提示。 */
    if (el.classList.contains("cdeck__card")) {
      var ps0 = secOf(el);
      if (ps0 && !ps0.classList.contains("is-open")) setSec(ps0, true);
      try { window.dispatchEvent(new CustomEvent("lb:deck-goto", { detail: { id: id, ms: ps0 && ps0.__foldMs } })); } catch (err) {}
      window.setTimeout(function () { flashEl(el, label); }, 950);
      if (window.history && window.history.replaceState) window.history.replaceState(null, "", "#" + id);
      return true;
    }
    /* 面板展开是一条渐进的高度动画（时长按内容长短算，见 foldDur）：
       动画没跑完就量位置会量到半截，滚动落点跟着偏。
       所以只要这一次动作触发了展开，就按这块面板自己的时长等它撑开再落位。 */
    var openedNow = false, openedSec = null;
    if (secEls.indexOf(el) !== -1) {
      if (!el.classList.contains("is-open")) { setSec(el, true); openedNow = true; openedSec = el; }
    } else {
      var ps = secOf(el);                                         /* 目标藏在某个折叠板块里 */
      if (ps && !ps.classList.contains("is-open")) { setSec(ps, true); openedNow = true; openedSec = ps; }
    }
    if (!el.getClientRects().length) return false;                /* 不可见 → 不在当前页 */
    railIntoView(el);                                             /* 横滑条里的目标先横向露出来 */
    var land = function () {
      slowScrollTo(docTop(el) - navTop(), function () {
        if (!el.classList.contains("section") && !el.classList.contains("lb-page")) flashEl(el, label);
      });
    };
    if (openedNow && !(rmQ && rmQ.matches)) window.setTimeout(land, foldMs(openedSec) + 40); else land();
    if (window.history && window.history.replaceState) window.history.replaceState(null, "", "#" + id);
    return true;
  }
  /* 委托点击：.sec-toggle 切换板块；页内 # 锚点一律走 gotoId()。 */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".sec-toggle") : null;
    if (btn) { setSec(btn.closest(".section"), btn.getAttribute("aria-expanded") !== "true"); return; }
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    if (gotoId(id, (a.textContent || "").trim())) e.preventDefault();
  });
  window.addEventListener("hashchange", function () {
    var id = location.hash.slice(1);
    if (!id || id.indexOf("p-") === 0) return;                    /* 单文件版的页面路由，交给路由逻辑 */
    gotoId(id, labelFor(id));
  });
  /* 单文件版跨页带锚点（如在纹样页点「吴元新」）：路由切页完成时广播 lb:routed，
     这里接住再走一遍 gotoId——此时目标页已可见，能展开面板、慢滚微调并给高亮。 */
  window.addEventListener("lb:routed", function (e) {
    var anchor = e.detail && e.detail.anchor;
    if (anchor) window.setTimeout(function () { gotoId(anchor, labelFor(anchor)); }, 60);
  });
  if (location.hash) {                                            /* 带锚点直接进站：先铺开再落位 */
    var hash0 = location.hash.slice(1);
    if (hash0 && hash0.indexOf("p-") !== 0) {
      window.setTimeout(function () { gotoId(hash0, labelFor(hash0)); }, 80);
    }
  }

  /* ── M8 导航 scroll spy ──────────────────────────
     判定线 = scrollY + 导航高 + 56px；滚到页底时直接点亮末项
     （前面板块展开后很高，末项可能永远越不过判定线）。
     scroll/resize 高频触发，用 rAF 合并到每帧一次。 */
  var spyLinks = Array.prototype.filter.call(
    document.querySelectorAll('.nav__menu .nav__top[href^="#"]'),
    function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }
  );
  if (spyLinks.length) {
    var navEl = document.getElementById("nav");
    var spyQueued = false;
    function spy() {
      spyQueued = false;
      var doc = document.documentElement;
      var vh = window.innerHeight || doc.clientHeight;
      /* 滚到页底时最后一项可能还没越过判定线（前面板块展开后很高），直接点亮末项 */
      var atBottom = window.scrollY + vh >= (doc.scrollHeight || doc.offsetHeight) - 2;
      var cur = atBottom ? spyLinks[spyLinks.length - 1] : null;
      if (!atBottom) {
        var probe = window.scrollY + (navEl ? navEl.offsetHeight : 64) + 56;
        spyLinks.forEach(function (a) {
          var el = document.getElementById(a.getAttribute("href").slice(1));
          if (el && el.getBoundingClientRect().top + window.scrollY <= probe) cur = a;
        });
      }
      spyLinks.forEach(function (a) {
        if (a === cur) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }
    function queueSpy() {
      if (spyQueued) return;
      spyQueued = true;
      window.requestAnimationFrame(spy);
    }
    window.addEventListener("scroll", queueSpy, { passive: true });
    window.addEventListener("resize", queueSpy, { passive: true });
    window.addEventListener("lb:reveal", function () { window.setTimeout(queueSpy, 80); });
    spy();
  }

  /* ── M9 数据图表动效 ─────────────────────────────
     data-count：数字滚动（easeOutCubic，1.3s）
     data-segs ：工序分段依次点亮（160ms 起，每段 +150ms）
     data-chart：条形宽度从 0 过渡到 --w 变量值（每条 +140ms）
     三者都由 IntersectionObserver(threshold .45) 触发，只播一次；
     prefers-reduced-motion 下全部直接呈现终态。 */
  function runCount(span) {
    var target = parseFloat(span.getAttribute("data-count")) || 0;
    if (rmQ && rmQ.matches) { span.textContent = String(target); return; }
    var dur = 1300, t0 = null;
    function step(now) {
      if (!t0) t0 = now;
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);                       /* easeOutCubic */
      span.textContent = String(Math.round(target * e));
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  function runSegs(box) {
    var bars = box.querySelectorAll("i");
    if (rmQ && rmQ.matches) {
      for (var i = 0; i < bars.length; i++) bars[i].classList.add("on");
      return;
    }
    for (var j = 0; j < bars.length; j++) {
      (function (b, k) {
        window.setTimeout(function () { b.classList.add("on"); }, 160 + k * 150);
      })(bars[j], j);
    }
  }
  (function initCharts() {
    var runOnce = function (el, fn) {
      var done = false;
      var ob = new IntersectionObserver(function (es) {
        for (var i = 0; i < es.length; i++) {
          if (!es[i].isIntersecting) continue;
          if (!done) { done = true; fn(el); }
          ob.unobserve(el);
        }
      }, { threshold: .45 });
      ob.observe(el);
    };
    document.querySelectorAll("[data-count]").forEach(function (s) { runOnce(s, runCount); });
    document.querySelectorAll("[data-segs]").forEach(function (b) { runOnce(b, runSegs); });
    document.querySelectorAll("[data-chart]").forEach(function (c) {
      runOnce(c, function (box) {
        box.querySelectorAll(".chart__bar i").forEach(function (b, k) {
          window.setTimeout(function () { b.style.width = b.style.getPropertyValue("--w"); }, k * 140);
        });
      });
    });
  })();
})();

/* ── M12 纹样带 ⇄ 互动游戏板块背景联动（交叉淡入淡出） ──
   指针悬停（或键盘聚焦）纹样带上的某张纹样时，背景区域淡入为这张纹样；
   悬停到另一张时新旧两张交叉淡化；移开后回到纯藏蓝。

   做法：背景层里有两张 <i class="game-entry__bg">，轮流担任「当前图」。
   切换时给新层写入 background-image 并加 .is-on（淡入），同时把旧层的
   .is-on 摘掉（淡出）——两层各带 .55s 过渡，重叠即为 cross-fade。
   若沿用「单图层直接换 src」，换图是瞬间的，只有从无到有才有动画。

   图片源直接取缩略图自身的 src：多页版是站内路径，单文件版里它已被
   内联成 data URI，两版都能直接用，不需要另写一套路径。 */
(function () {
  var band = document.querySelector(".band");
  var game = document.getElementById("game");
  if (!band || !game) return;
  var layers = game.querySelectorAll(".game-entry__bg");
  if (layers.length < 2) return;
  var items = band.querySelectorAll(".band__item");
  if (!items.length) return;
  var cur = 0;      /* 当前正在显示的图层下标 */
  var current = ""; /* 当前显示的图片地址，避免重复触发 */
  function paint(idx, src) {
    var el = layers[idx];
    el.style.backgroundImage = 'url("' + src + '")';
    void el.offsetWidth;   /* 强制回流：确保进入 0→1 过渡的起点可见 */
    el.classList.add("is-on");
  }
  function show(src) {
    if (!src || src === current) return;
    current = src;
    var next = cur === 0 ? 1 : 0;
    paint(next, src);
    layers[cur].classList.remove("is-on");
    cur = next;
  }
  function hide() {
    if (!current) return;
    current = "";
    layers[0].classList.remove("is-on");
    layers[1].classList.remove("is-on");
  }
  Array.prototype.forEach.call(items, function (a) {
    var thumb = a.querySelector("img");
    if (!thumb) return;
    var src = thumb.getAttribute("src");
    a.addEventListener("mouseenter", function () { show(src); });
    a.addEventListener("focus", function () { show(src); });
    a.addEventListener("blur", hide);
    a.addEventListener("pointerdown", function () { show(src); }); /* 触屏无 hover：点按先换一次 */
    var pre = new Image();   /* 预加载，首次悬停就能立刻出图 */
    pre.src = src;
  });
  band.addEventListener("mouseleave", hide);
})();

/* —— 工序卡甲板（#craft）：横向 scroll-snap 逐张切换 ——
   中央卡聚焦（原大高亮），两侧卡缩小降透明并向外微倾；
   点击任意卡整列动效滑动让位；左上角吸顶胶囊、进度点、
   左右箭头、键盘方向键、桌面鼠标拖拽全部联动；
   滚离影片卡时自动暂停视频（配合 setSec 折叠停播）。 */
(function () {
  'use strict';
  var deck = document.querySelector(".cdeck");
  if (!deck || !deck.querySelector(".cdeck__card")) return;
  var track = deck.querySelector(".cdeck__track");
  var cards = Array.prototype.slice.call(track.querySelectorAll(".cdeck__card"));
  var pills = Array.prototype.slice.call(document.querySelectorAll(".craft-nav__pill"));
  var dotsWrap = deck.querySelector(".cdeck__dots");
  var btnPrev = deck.querySelector(".cdeck__btn--prev");
  var btnNext = deck.querySelector(".cdeck__btn--next");
  var ink = document.querySelector(".craft-nav__ink");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* animating：跳转动画进行中。此期间焦点锁定在目标卡，
     滚动不再逐张重算焦点（否则中间卡会被反复切换、过渡反复重启）。 */
  var current = -1, raf = 0, animating = false;

  /* 高亮滑块：只改两条自定义属性，让 CSS 负责缓动；
     位置在标签布局变化（窗口改大小、字体加载完成）后都要重算一次。 */
  function moveInk() {
    if (!ink || !pills.length) return;
    var ap = null;
    pills.forEach(function (p) { if (p.classList.contains("is-active")) ap = p; });
    if (!ap) ap = pills[Math.max(0, current)];
    if (!ap) return;
    ink.style.setProperty("--x", ap.offsetLeft + "px");
    ink.style.setProperty("--w", ap.offsetWidth + "px");
  }
  window.addEventListener("resize", function () { measure(); moveInk(); });
  /* 工序板块是可折叠的：折叠时 Track 尺寸为 0，量不到标签位置。
     用 ResizeObserver 盯住 Track，展开后尺寸一到位就补测一次。 */
  if (window.ResizeObserver) {
    try { new ResizeObserver(function () { measure(); moveInk(); }).observe(track); } catch (e) {}
  }
  /* 图片 / 字体落位后卡片宽度可能变一次，重测并静默补正当前卡 */
  window.addEventListener("load", function () { measure(); moveInk(); if (current >= 0) refine(current); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { measure(); moveInk(); }).catch(function () {});
  }
  /* 顶部导航 + 胶囊定位条的高度：把甲板滚到这里，标签点开后卡片正好落在视野里 */
  /* —— 跳转动画：不用浏览器原生的 behavior:"smooth"（太快、时长不可控），
     自己用 rAF 走一条 easeInOutCubic 曲线：起收都慢、中段快，
     看上去是「滑过去」而不是「啪一下切过去」。
     横、纵两段动画由同一个 rAF 驱动——各排一条 rAF 会互相抢帧、每帧多一次
     强制布局，跨多张卡跳转时那一下顿挫就是这么来的。
     横向动画期间临时摘掉 scroll-snap（否则吸力会和插值打架）；
     落定后先精确补正再恢复 snap，免得 snap 归位时又「咔」地吸一下。 —— */
  var H_BASE = 680, H_CAP = 1150, V_MS = 1000;
  function easeIO(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  var snapT = 0, hStop = null, vStop = null;
  /* 一个 rAF 同时推进所有在跑的补间 */
  var tweens = [], tRaf = 0;
  function tick(ts) {
    tRaf = 0;
    var alive = [], i, tw, p;
    for (i = 0; i < tweens.length; i++) {
      tw = tweens[i];
      if (tw.dead) continue;
      if (!tw.t0) tw.t0 = ts;
      p = Math.min(1, (ts - tw.t0) / tw.dur);
      tw.step(tw.from + (tw.to - tw.from) * easeIO(p));
      if (p < 1) alive.push(tw);
      else if (tw.done) tw.done();
    }
    tweens = alive;
    if (tweens.length) tRaf = requestAnimationFrame(tick);
  }
  function tween(from, to, dur, step, done) {
    var tw = { from: from, to: to, dur: dur, step: step, done: done, t0: 0, dead: false };
    tweens.push(tw);
    if (!tRaf) tRaf = requestAnimationFrame(tick);
    return function () { tw.dead = true; };
  }
  function scrollTrackTo(left, dur, done) {
    if (hStop) { hStop(); hStop = null; }
    if (!dur || reduce) { track.scrollLeft = left; if (done) done(); return; }
    track.classList.add("is-anim");
    window.clearTimeout(snapT);
    hStop = tween(track.scrollLeft, left, dur, function (v) {
      track.scrollLeft = v;
    }, function () {
      hStop = null;
      if (done) done();
      snapT = window.setTimeout(function () { track.classList.remove("is-anim"); }, 120);
    });
  }
  function scrollPageTo(top, dur) {
    if (vStop) { vStop(); vStop = null; }
    if (!dur || reduce) { window.scrollTo(0, top); return; }
    vStop = tween(window.pageYOffset, top, dur, function (v) {
      window.scrollTo(0, v);
    }, function () { vStop = null; });
  }
  /* 用户自己滚就没必要再抢方向盘 */
  function dropPage() { if (vStop) { vStop(); vStop = null; } }
  window.addEventListener("wheel", dropPage, { passive: true });
  window.addEventListener("touchstart", dropPage, { passive: true });

  function headOffset() {
    var nav = document.querySelector(".nav"), bar = document.querySelector(".craft-nav");
    return (nav ? nav.offsetHeight : 0) + (bar ? bar.offsetHeight : 0) + 14;
  }
  function bringDeckIntoView(dur) {
    var top = window.pageYOffset + deck.getBoundingClientRect().top - headOffset();
    if (Math.abs(window.pageYOffset - top) < 40) return;          /* 已在合适位置就不打扰 */
    scrollPageTo(top, reduce ? 0 : (dur || V_MS));
  }

  /* 进度点：与卡片一一对应 */
  var dots = cards.map(function (_, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "cdeck__dot";
    b.setAttribute("aria-label", "第 " + (i + 1) + " 张");
    b.addEventListener("click", function () { go(i); });
    dotsWrap.appendChild(b);
    return b;
  });

  function idxById(id) {
    for (var i = 0; i < cards.length; i++) if (cards[i].id === id) return i;
    return -1;
  }
  /* 卡片几何量缓存：跳转时每帧都要算目标位与「哪张卡在正中」，
     每帧现读 offsetLeft / offsetWidth 会反复触发同步布局（layout thrashing）。
     量一次存起来，窗口改大小、板块展开、图片落位时再重测。 */
  var M = null;
  function measure() {
    var lefts = [], widths = [], centers = [];
    cards.forEach(function (c) {
      lefts.push(c.offsetLeft); widths.push(c.offsetWidth);
      centers.push(c.offsetLeft + c.offsetWidth / 2);
    });
    M = { w: track.clientWidth, lefts: lefts, widths: widths, centers: centers };
  }
  function centerLeft(i) {
    if (!M) measure();
    return M.lefts[i] - (M.w - M.widths[i]) / 2;
  }
  /* 目标越远给得越从容一点：跨两三张卡时不会「唰」地一下掠过去 */
  function durFor(to) {
    return Math.min(H_CAP, H_BASE + Math.abs(to - track.scrollLeft) * 0.26);
  }
  function go(i, instant) {
    i = Math.max(0, Math.min(cards.length - 1, i));
    if (!M) measure();
    var to = centerLeft(i);
    /* 焦点一次切到目标卡，卡片只走一趟过渡。
       跨两张以上时若跟着滚动逐张换焦点，中间那张会先放大再缩回、
       过渡反复重启——一路抽搐，正是「跳转卡顿」的观感来源。 */
    apply(i);
    if (instant || reduce) { track.scrollLeft = to; animating = false; refine(i); return; }
    animating = true;
    scrollTrackTo(to, durFor(to), function () {
      animating = false;
      measure();                       /* 落定后重测：图片 / 字体可能刚到位 */
      refine(i);
      apply(nearest());
    });
  }
  /* 静默补正：只在空闲时做，1px 以内不动——动画结束后不再硬跳一下 */
  function refine(i) {
    if (i !== current) return;
    if (animating) { window.setTimeout(function () { refine(i); }, 240); return; }
    if (!M) measure();
    var t = centerLeft(i);
    if (Math.abs(track.scrollLeft - t) > 1) track.scrollLeft = t;
  }
  function nearest() {
    if (!M) measure();
    var mid = track.scrollLeft + M.w / 2, best = 0, bd = Infinity, d;
    for (var i = 0; i < M.centers.length; i++) {
      d = Math.abs(M.centers[i] - mid);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  function apply(i) {
    if (i === current) return;
    current = i;
    cards.forEach(function (c, j) {
      c.classList.toggle("is-focus", j === i);
      c.classList.toggle("is-left", j === i - 1);
      c.classList.toggle("is-right", j === i + 1);
      c.classList.toggle("is-left-far", j < i - 1);
      c.classList.toggle("is-right-far", j > i + 1);
      if (j !== i) { var v = c.querySelector("video"); if (v && !v.paused) v.pause(); }
    });
    pills.forEach(function (p) {
      var on = idxById(p.dataset.step) === i;
      p.classList.toggle("is-active", on);
      if (on) p.setAttribute("aria-current", "true"); else p.removeAttribute("aria-current");
    });
    /* 胶囊轨道放不下时，把当前胶囊滚到中间 */
    var ap = pills.filter(function (p) { return p.classList.contains("is-active"); })[0];
    if (ap) {
      var nt = ap.parentElement;
      if (nt.scrollWidth > nt.clientWidth) {
        nt.scrollTo({ left: ap.offsetLeft - nt.clientWidth / 2 + ap.offsetWidth / 2, behavior: reduce ? "auto" : "smooth" });
      }
    }
    dots.forEach(function (d, j) { d.classList.toggle("is-on", j === i); });
    if (btnPrev) btnPrev.disabled = i === 0;
    if (btnNext) btnNext.disabled = i === cards.length - 1;
    moveInk();
  }
  track.addEventListener("scroll", function () {
    if (animating || raf) return;     /* 跳转动画期间焦点已锁定在目标卡，不再逐帧重算 */
    raf = requestAnimationFrame(function () { raf = 0; if (!animating) apply(nearest()); });
  }, { passive: true });

  /* 点击侧位卡 → 滑到中央（其他卡动效让位）；中央影片卡不拦截 controls */
  cards.forEach(function (c, i) {
    c.addEventListener("click", function (e) {
      if (i === current) return;
      if (c.querySelector("video") && e.target.closest("video")) return;
      go(i);
    });
  });
  /* 点标签：甲板横向滑到那张卡，页面同时纵向滚到甲板。
     第一次 go 之后还要校准：板块刚展开、字号/图片落位时 offsetLeft 会变，
     120 / 420 / 900ms 各补一次（用户若已手动滑走，current 会变，补位自动作废）。 */
  pills.forEach(function (p) {
    p.addEventListener("click", function () {
      var i = idxById(p.dataset.step); if (i < 0) return;
      measure();
      go(i); bringDeckIntoView();
      /* 板块刚展开 / 图片落位会让卡位漂一点：动画前后各重测一次即可。
         不再用一串定时 go(i,true) 硬校正——那会在动画结束后又跳一下，看着就是卡。 */
      window.setTimeout(function () { measure(); refine(i); }, 260);
    });
  });
  /* 顶部主导航「五道工序」子目录（以及移动端抽屉、带 #step-* 锚点进站）跳进来：
     与左上角胶囊完全同一套动作——甲板横向滑到对应卡 + 页面纵向落到甲板。
     板块刚展开/图片落位时 offsetLeft 会漂，分四次补校；用户滑走（current 变）自动作废。 */
  window.addEventListener("lb:deck-goto", function (e) {
    var i = idxById(e.detail && e.detail.id);
    if (i < 0) return;
    /* 工序板块可能刚被展开：等面板撑开（展开有多长等多久）后再起跳，
       免得动画中途改目标、几何量到的还是半截位置。 */
    var wait = Math.max(440, (e.detail && e.detail.ms) || 0) + 40;
    window.setTimeout(function () {
      measure();
      go(i); bringDeckIntoView();
      window.setTimeout(function () { measure(); refine(i); }, 260);
    }, wait);
  });
  if (btnPrev) btnPrev.addEventListener("click", function () { go(current - 1); });
  if (btnNext) btnNext.addEventListener("click", function () { go(current + 1); });
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(current - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1); }
  });

  /* 桌面鼠标拖拽（移动端/触控板走原生滑动） */
  var drag = null;
  track.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    /* 用户上手拖了：立刻放弃正在跑的跳转动画，别跟手感抢方向 */
    if (hStop) { hStop(); hStop = null; }
    animating = false;
    drag = { x: e.clientX, sl: track.scrollLeft, moved: false };
    track.classList.add("is-drag");
  });
  window.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (Math.abs(dx) > 5) drag.moved = true;
    track.scrollLeft = drag.sl - dx;
  });
  window.addEventListener("pointerup", function () {
    if (!drag) return;
    track.classList.remove("is-drag");
    if (drag.moved) {
      measure();
      go(nearest());
      /* 拖拽后的第一次 click 是误触，吞掉 */
      var stop = function (e) { e.stopPropagation(); e.preventDefault(); };
      track.addEventListener("click", stop, { capture: true, once: true });
    }
    drag = null;
  });

  /* 初始：聚焦第一张 */
  measure();
  apply(0);
  track.scrollLeft = centerLeft(0);
  /* 布局稳定后再落一次滑块位置，避免首帧宽度测量偏小 */
  requestAnimationFrame(moveInk);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInk).catch(function () {});
})();
