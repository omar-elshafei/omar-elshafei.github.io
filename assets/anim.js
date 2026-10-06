/* Shared animations for Omar Elshafei's portfolio projects. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = "cubic-bezier(.2,.7,.2,1)";

  const style = document.createElement("style");
  style.textContent = `
    .rv{opacity:0;transform:translateY(26px);transition:opacity .75s ${ease} var(--d,0ms),transform .75s ${ease} var(--d,0ms)}
    .rv.in{opacity:1;transform:none}
    @keyframes an-rise{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
    @keyframes an-pop{from{opacity:0;transform:scale(.92) translateY(20px)}to{opacity:1;transform:none}}
    @keyframes an-float{0%,100%{translate:0 0}50%{translate:0 -12px}}
    @keyframes an-draw{to{stroke-dashoffset:0}}
    @keyframes an-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
    @keyframes an-spin{from{opacity:0;transform:rotate(-120deg) scale(.8)}to{opacity:1;transform:none}}
    @keyframes an-shine{from{background-position:0% 50%}to{background-position:200% 50%}}
    @keyframes an-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:.65}}
    .an-rise{animation:an-rise .9s ${ease} both}
    .an-pop{animation:an-pop 1s ${ease} both}
    .an-float{animation:an-float 6s ease-in-out infinite}
    .an-grow{transform-box:fill-box;transform-origin:50% 100%;animation:an-grow .9s ${ease} both}
    .an-spin{animation:an-spin 1.1s ${ease} both}
    .photo::before{animation:an-pulse 6s ease-in-out infinite}
    .btn{transition:transform .2s,box-shadow .2s,filter .2s}
    .btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(0,0,0,.16);filter:brightness(1.05)}
    .btn:not(:disabled):active{transform:scale(.98)}
    @media (prefers-reduced-motion: reduce){
      .rv{opacity:1!important;transform:none!important;transition:none!important}
      .an-rise,.an-pop,.an-float,.an-grow,.an-spin,.photo::before{animation:none!important}
      .btn:hover{transform:none}
    }`;
  document.head.appendChild(style);
  if (reduce) return;

  /* 1. Hero entrance: the first heading, the line above it and the blocks after it. */
  const h1 = document.querySelector("h1");
  if (h1) {
    const seq = [];
    if (h1.previousElementSibling) seq.push(h1.previousElementSibling);
    seq.push(h1);
    let n = h1.nextElementSibling;
    for (let k = 0; n && k < 4; k++, n = n.nextElementSibling) seq.push(n);
    seq.forEach((el, i) => { el.dataset.an = "1"; el.classList.add("an-rise"); el.style.animationDelay = i * 110 + "ms"; });
  }
  document.querySelectorAll(".hero-art, .photo, .plate, .board, .hero .art, .hero .form, .shot.s1, .shot.s2, .shot.s3")
    .forEach((el, i) => { el.dataset.an = "1"; el.classList.add("an-pop"); el.style.animationDelay = 250 + i * 120 + "ms"; });

  /* 2. Gentle floating for product art. */
  document.querySelectorAll(".bottle, .hero-art .box, .badge-logo, .photo img")
    .forEach((el, i) => { el.classList.add("an-float"); el.style.animationDelay = -(i * 0.9) + "s"; });

  /* 3. Shimmer on gradient words inside headings. */
  document.querySelectorAll("h1 span").forEach(s => {
    if (getComputedStyle(s).backgroundImage !== "none") { s.style.backgroundSize = "200% auto"; s.style.animation = "an-shine 6s linear infinite"; }
  });

  /* 4. Scroll reveal with a small stagger between siblings. */
  const REVEAL = "section h2, section .sub, .sh, .head, .toolbar, .bar, .card, .feat, .svc, .stat, .stats > div, .step, .kpi, .panel, article.p, .box, .opt, .proj, .more > a, .sk, .f, .doc, .how > div, .facts > div, .task, .filters, .contact .actions, footer .fgrid > div";
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), {threshold: .12, rootMargin: "0px 0px -40px 0px"});
  function reveal(root) {
    const els = [...root.querySelectorAll(REVEAL)].filter(el =>
      !el.classList.contains("rv") && !el.dataset.an && !(el.parentElement && el.parentElement.closest(".rv, [data-an], dialog, .drawer")) && el.offsetParent !== null);
    const count = new Map();
    els.forEach(el => {
      const i = count.get(el.parentElement) || 0; count.set(el.parentElement, i + 1);
      el.style.setProperty("--d", Math.min(i * 80, 480) + "ms");
      el.classList.add("rv"); io.observe(el);
    });
  }
  reveal(document);
  /* Single-page apps (real estate, booking) render new pages on hash change. */
  addEventListener("hashchange", () => setTimeout(() => reveal(document.getElementById("app") || document), 0));

  /* 5. Count numbers up when they come into view. */
  const cio = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, m = el.textContent.trim().match(/^([^\d]*)(\d[\d,]*(?:\.\d+)?)(.*)$/s);
    if (!m) return;
    const [, pre, num, post] = m, target = parseFloat(num.replace(/,/g, ""));
    if (!isFinite(target) || target === 0) return;
    const dec = (num.split(".")[1] || "").length, comma = num.includes(",");
    const fmt = v => pre + (comma ? v.toLocaleString("en", {minimumFractionDigits: dec, maximumFractionDigits: dec}) : v.toFixed(dec)) + post;
    const t0 = performance.now(), dur = 1400;
    const tick = now => {
      if (!el.isConnected) return;
      const p = Math.min(1, (now - t0) / dur), v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = fmt(p === 1 ? target : v);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), {threshold: .5});
  document.querySelectorAll(".stat b, .stats b, .kpi b, .trust b, [data-count]").forEach(el => cio.observe(el));

  /* 6. Charts draw themselves. */
  document.querySelectorAll("#chart path[fill='none']:not([stroke-dasharray]), .kpi svg path[fill='none']").forEach((p, i) => {
    try {
      const L = p.getTotalLength();
      p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
      p.style.animation = `an-draw 1.6s ${ease} ${200 + i * 60}ms forwards`;
    } catch (e) {}
  });
  document.querySelectorAll("#chart rect").forEach((r, i) => { r.classList.add("an-grow"); r.style.animationDelay = 200 + i * 90 + "ms"; });
  const donut = document.getElementById("donut");
  if (donut) donut.classList.add("an-spin");
})();
