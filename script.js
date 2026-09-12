/* =========================================================
   A LITTLE SOMETHING IS COMING — interaction layer
   GSAP · ScrollTrigger · Lenis · AOS · Three.js
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const EVENT_DATE = new Date("2026-08-24T16:00:00");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- toast ---------------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2600);
  }

  /* ---------------- smooth scroll (Lenis) ---------------- */
  let lenis = null;
  if (typeof window.Lenis !== "undefined" && !reduced) {
    lenis = new Lenis({ duration: 1.5, smoothWheel: true, lerp: 0.085 });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (hasGSAP && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.lagSmoothing(0);
    }
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 2 });
    else target.scrollIntoView({ behavior: "smooth" });
  });

  /* ---------------- AOS ---------------- */
  if (typeof window.AOS !== "undefined") {
    AOS.init({ duration: 1100, easing: "ease-out-quart", once: true, offset: 90 });
  }

  /* ---------------- elegant cursor ---------------- */
  const cursor = $("#cursor");
  if (cursor && window.matchMedia("(hover:hover)").matches) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      cursor.style.translate = cx + "px " + cy + "px";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", (e) => {
      const on = e.target.closest("a,button,.moment,.wish,input,textarea");
      cursor.classList.toggle("is-on", !!on);
    });
  }

  /* ---------------- magnetic hover ---------------- */
  $$(".cta, .choice, .linkbtn").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = (e.clientX - r.left - r.width / 2) * 0.22;
      const my = (e.clientY - r.top - r.height / 2) * 0.28;
      if (hasGSAP) gsap.to(el, { x: mx, y: my, duration: 0.6, ease: "power3.out" });
    });
    el.addEventListener("mouseleave", () => {
      if (hasGSAP) gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,0.5)" });
    });
  });

  /* =========================================================
     1 · OPENING CINEMATIC
     ========================================================= */
  function playOpening() {
    if (!hasGSAP) { $(".opening__sub").style.opacity = 1; return; }
    const words = $$(".opening__title em");
    gsap.set(words, { yPercent: 115, opacity: 0, filter: "blur(16px)", letterSpacing: "0.36em" });

    const tl = gsap.timeline({ delay: 0.35 });
    tl.to(words, {
      yPercent: 0, opacity: 1, filter: "blur(0px)", letterSpacing: "0.18em",
      duration: 1.9, ease: "expo.out", stagger: 0.42,
    })
      .to(".opening__rule i", { scaleX: 1, duration: 1.4, ease: "expo.inOut" }, "-=0.6")
      .to(".opening__sub", { opacity: 1, letterSpacing: "0.62em", duration: 1.6, ease: "expo.out" }, "+=0.5")
      .to(".opening__hint", { opacity: 0.75, duration: 1.2 }, "-=0.8");

    if (window.ScrollTrigger) {
      gsap.to(".opening__bg", {
        yPercent: 12, scale: 1.14, ease: "none",
        scrollTrigger: { trigger: ".opening", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".opening__inner", {
        opacity: 0, filter: "blur(10px)", yPercent: -10, ease: "none",
        scrollTrigger: { trigger: ".opening", start: "top top", end: "bottom top", scrub: true },
      });
    }
  }

  /* =========================================================
     2 · ARRIVAL ORBIT
     ========================================================= */
  (function orbit() {
    const prog = $("#orbitProg"), dot = $("#orbitDot"),
      pct = $("#orbitPct"), state = $("#orbitState"), note = $("#statusNote");
    if (!prog) return;
    const R = 96, C = 2 * Math.PI * R;
    prog.style.strokeDasharray = C;
    prog.style.strokeDashoffset = C;
    let done = false;

    function set(p) {
      p = clamp(p, 0, 1);
      prog.style.strokeDashoffset = C * (1 - p);
      pct.textContent = String(Math.round(p * 100)).padStart(2, "0");
      const a = -Math.PI / 2 + p * Math.PI * 2;
      dot.style.transform = `translate(${Math.cos(a) * R}px, ${Math.sin(a) * R}px)`;
      if (p >= 0.999 && !done) {
        done = true;
        state.textContent = "ALMOST HERE.";
        note.textContent = "the smallest guest is already the main character.";
        if (hasGSAP) gsap.fromTo(state, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 1.1 });
      }
    }
    set(0);

    if (hasGSAP && window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: "#status", start: "top 85%", end: "bottom 20%",
        onUpdate: (self) => set(self.progress * 1.15),
      });
    } else { set(1); }

    $("#status").addEventListener("pointerenter", () => set(1));
  })();

  /* =========================================================
     3 · HERO — petals + scroll typography
     ========================================================= */
  (function hero() {
    const wrap = $("#petals");
    if (wrap) {
      for (let i = 0; i < 18; i++) {
        const p = document.createElement("i");
        p.className = "petal";
        const s = 4 + Math.random() * 12;
        p.style.width = s + "px";
        p.style.height = s * 0.7 + "px";
        p.style.left = Math.random() * 100 + "%";
        p.style.top = Math.random() * 100 + "%";
        p.style.opacity = 0.18 + Math.random() * 0.4;
        wrap.appendChild(p);
        if (hasGSAP && !reduced) {
          gsap.to(p, {
            y: "+=" + (60 + Math.random() * 180),
            x: "+=" + (Math.random() * 120 - 60),
            rotation: Math.random() * 240 - 120,
            duration: 14 + Math.random() * 16,
            repeat: -1, yoyo: true, ease: "sine.inOut", delay: Math.random() * 6,
          });
        }
      }
    }
    if (hasGSAP && window.ScrollTrigger) {
      gsap.from(".hero__title span", {
        yPercent: 120, opacity: 0, duration: 1.6, ease: "expo.out", stagger: 0.15,
        scrollTrigger: { trigger: "#hero", start: "top 70%" },
      });
      gsap.from(".hero__script", {
        opacity: 0, filter: "blur(14px)", duration: 1.8, ease: "power2.out",
        scrollTrigger: { trigger: "#hero", start: "top 60%" },
      });
      gsap.to(".hero__title span:nth-child(1)", { xPercent: -6, ease: "none", scrollTrigger: { trigger: "#hero", scrub: true, start: "top bottom", end: "bottom top" } });
      gsap.to(".hero__title span:nth-child(2)", { xPercent: 6, ease: "none", scrollTrigger: { trigger: "#hero", scrub: true, start: "top bottom", end: "bottom top" } });
    }
  })();

  /* =========================================================
     4 · LITTLE MOMENTS
     ========================================================= */
  (function moments() {
    const items = $$(".moment");
    items.forEach((m) => {
      const on = () => m.classList.add("is-on");
      const off = () => m.classList.remove("is-on");
      m.addEventListener("mouseenter", on);
      m.addEventListener("mouseleave", off);
      m.addEventListener("click", () => m.classList.toggle("is-on"));
      m.addEventListener("focusin", on);
      const img = $(".moment__img", m);
      m.addEventListener("mousemove", (e) => {
        if (!hasGSAP || !img || innerWidth < 861) return;
        const r = m.getBoundingClientRect();
        gsap.to(img, { y: (e.clientY - r.top - r.height / 2) * 0.25, duration: 1, ease: "power3.out" });
      });
      if (hasGSAP && window.ScrollTrigger) {
        gsap.from(m, {
          opacity: 0, y: 40, duration: 1.2, ease: "expo.out",
          scrollTrigger: { trigger: m, start: "top 88%" },
        });
      }
    });
  })();

  /* =========================================================
     5 · CALENDAR → BIG DATE → COUNTDOWN
     ========================================================= */
  (function calendar() {
    const grid = $("#calGrid");
    if (!grid) return;
    const first = new Date(2026, 7, 1).getDay(); // Aug 2026
    const days = 31, TARGET = 24;
    for (let i = 0; i < first; i++) grid.appendChild(document.createElement("span"));
    for (let d = 1; d <= days; d++) {
      if (d === TARGET) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "day--target";
        b.textContent = d;
        b.setAttribute("aria-label", "Reveal the event date");
        b.addEventListener("click", reveal);
        grid.appendChild(b);
      } else {
        const s = document.createElement("span");
        s.textContent = d;
        grid.appendChild(s);
      }
    }

    let revealed = false;
    function reveal() {
      if (revealed) return;
      revealed = true;
      const cal = $("#calendar"), big = $("#bigdate");
      big.setAttribute("aria-hidden", "false");
      if (!hasGSAP) { cal.style.display = "none"; big.style.opacity = 1; big.style.filter = "none"; startCountdown(); return; }
      const tl = gsap.timeline();
      tl.to(cal, { opacity: 0, scale: 1.06, filter: "blur(16px)", duration: 1.1, ease: "expo.inOut" })
        .set(cal, { pointerEvents: "none" })
        .fromTo(big, { opacity: 0, scale: 0.86, filter: "blur(22px)" },
          { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.5, ease: "expo.out" }, "-=0.45")
        .from(".bigdate__d", { yPercent: 30, duration: 1.4, ease: "expo.out" }, "-=1.2")
        .from(".bigdate__begin", { opacity: 0, letterSpacing: "0.4em", duration: 1.2 }, "-=0.7")
        .from(".countdown div", { opacity: 0, y: 18, stagger: 0.1, duration: 0.9 }, "-=0.6");
      startCountdown();
      toast("something tiny is coming.");
    }

    let cdStarted = false;
    function startCountdown() {
      if (cdStarted) return;
      cdStarted = true;
      const f = (n) => String(Math.max(0, n)).padStart(2, "0");
      const els = {
        d: $('[data-cd="d"]'), h: $('[data-cd="h"]'),
        m: $('[data-cd="m"]'), s: $('[data-cd="s"]'),
      };
      const tick = () => {
        let diff = Math.max(0, EVENT_DATE - new Date());
        const sec = Math.floor(diff / 1000);
        els.d.textContent = f(Math.floor(sec / 86400));
        els.h.textContent = f(Math.floor(sec / 3600) % 24);
        els.m.textContent = f(Math.floor(sec / 60) % 60);
        els.s.textContent = f(sec % 60);
      };
      tick();
      setInterval(tick, 1000);
    }
  })();

  /* =========================================================
     6 · TIME DIAL
     ========================================================= */
  (function dial() {
    const wrap = $("#dial"), knob = $("#dialKnob"), hand = $("#dialHand"),
      read = $("#dialRead"), hint = $("#dialHint"), out = $("#timeReveal");
    if (!wrap) return;

    // ticks
    const g = $("#ticks");
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l.setAttribute("x1", 150 + Math.cos(a) * 120);
      l.setAttribute("y1", 150 + Math.sin(a) * 120);
      l.setAttribute("x2", 150 + Math.cos(a) * 130);
      l.setAttribute("y2", 150 + Math.sin(a) * 130);
      l.setAttribute("class", "dial__tick");
      g.appendChild(l);
    }

    let angle = 0, locked = false;
    const TARGET = 120; // 4 o'clock

    function place(deg) {
      angle = (deg + 360) % 360;
      const rad = (angle - 90) * Math.PI / 180;
      const r = wrap.clientWidth / 2;
      knob.style.left = 50 + Math.cos(rad) * 44 + "%";
      knob.style.top = 50 + Math.sin(rad) * 44 + "%";
      hand.setAttribute("transform", `rotate(${angle} 150 150)`);
      const hours = Math.round(angle / 30) % 12;
      const h = hours === 0 ? 12 : hours;
      read.textContent = h + ":00";
      const near = Math.abs(((angle - TARGET + 540) % 360) - 180) > 174;
      if (near && !locked) lock();
    }

    function lock() {
      locked = true;
      place2(TARGET);
      hint.textContent = "the hour is set";
      if (hasGSAP) {
        gsap.to(out, { opacity: 1, y: 0, duration: 1.4, ease: "expo.out" });
        gsap.fromTo(read, { scale: 0.9, filter: "blur(8px)" }, { scale: 1, filter: "blur(0px)", duration: 1 });
      } else { out.style.opacity = 1; }
      toast("see you there.");
    }
    function place2(deg) {
      angle = deg;
      const rad = (angle - 90) * Math.PI / 180;
      knob.style.left = 50 + Math.cos(rad) * 44 + "%";
      knob.style.top = 50 + Math.sin(rad) * 44 + "%";
      hand.setAttribute("transform", `rotate(${angle} 150 150)`);
      read.textContent = "4:00";
    }

    let dragging = false;
    const angFrom = (e) => {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      return (Math.atan2(y, x) * 180 / Math.PI + 90 + 360) % 360;
    };
    const down = (e) => { if (locked) return; dragging = true; wrap.setPointerCapture(e.pointerId); place(angFrom(e)); };
    const move = (e) => { if (!dragging || locked) return; e.preventDefault(); place(angFrom(e)); };
    const up = () => { dragging = false; };
    wrap.addEventListener("pointerdown", down);
    wrap.addEventListener("pointermove", move);
    wrap.addEventListener("pointerup", up);
    wrap.addEventListener("pointercancel", up);
    place(0);
    read.textContent = "— : —";

    // gentle idle rotation invite
    if (hasGSAP && !reduced) {
      gsap.to(knob, { scale: 1.12, duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }
  })();

  /* =========================================================
     7 · VENUE CURTAIN + ART MAP
     ========================================================= */
  (function venue() {
    const stage = $("#veilStage"), curtain = $("#veilCurtain"), info = $("#venueInfo");
    if (!stage) return;
    let p = 0, dragging = false, opened = false;

    function apply(v) {
      p = clamp(v, 0, 1);
      curtain.style.transform = `translateX(${p * 100}%)`;
      curtain.style.opacity = String(1 - p * 0.35);
      if (p > 0.72 && !opened) {
        opened = true;
        curtain.style.transition = "transform 1.1s cubic-bezier(.19,1,.22,1), opacity .8s";
        curtain.style.transform = "translateX(100%)";
        curtain.style.pointerEvents = "none";
        if (hasGSAP) gsap.to(info, { opacity: 1, y: 0, duration: 1.3, ease: "expo.out" });
        else { info.style.opacity = 1; info.style.transform = "none"; }
      }
    }
    const from = (e) => (e.clientX - stage.getBoundingClientRect().left) / stage.clientWidth;
    stage.addEventListener("pointerdown", (e) => { if (opened) return; dragging = true; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener("pointermove", (e) => { if (!dragging || opened) return; apply(from(e)); });
    const end = () => { dragging = false; if (!opened && p < 0.72) apply(Math.max(0, p - 0.15)); };
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);
    stage.addEventListener("click", (e) => { if (!opened && p < 0.05) apply(0.8); });

    const map = $("#artmap"), route = $("#route");
    $("#openMap").addEventListener("click", () => {
      map.hidden = false;
      const len = route.getTotalLength();
      route.style.strokeDasharray = len;
      route.style.strokeDashoffset = len;
      if (hasGSAP) {
        gsap.fromTo(map, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1 });
        gsap.to(route, { strokeDashoffset: 0, duration: 2.6, ease: "power2.inOut" });
      } else { route.style.strokeDashoffset = 0; }
    });
  })();

  /* =========================================================
     8 · GUEST SECTION
     ========================================================= */
  if (hasGSAP && window.ScrollTrigger) {
    gsap.from(".guest__head", {
      clipPath: "inset(0 0 100% 0)", y: 40, duration: 1.6, ease: "expo.out",
      scrollTrigger: { trigger: "#guest", start: "top 72%" },
    });
    gsap.from(".guest__stamp span", {
      opacity: 0, letterSpacing: "0.1em", duration: 1.8, stagger: 0.2, ease: "expo.out",
      scrollTrigger: { trigger: ".guest__stamp", start: "top 88%" },
    });
    gsap.utils.toArray(".details__row").forEach((row, i) => {
      gsap.from(row, {
        xPercent: i % 2 ? 6 : -6, opacity: 0, duration: 1.3, ease: "expo.out",
        scrollTrigger: { trigger: row, start: "top 90%" },
      });
    });
    gsap.from(".sechead__title", {
      opacity: 0, filter: "blur(12px)", y: 26, duration: 1.5, ease: "power3.out",
      scrollTrigger: { trigger: ".sechead", start: "top 88%" },
    });
  }

  /* =========================================================
     9 · WISHES
     ========================================================= */
  (function wishes() {
    $$(".wish").forEach((w) => {
      w.addEventListener("pointerenter", () => w.classList.add("is-open"));
      w.addEventListener("pointerleave", () => w.classList.remove("is-open"));
      w.addEventListener("click", () => { w.classList.toggle("is-open"); $("#wname").focus(); });
      w.addEventListener("keydown", (e) => { if (e.key === "Enter") w.classList.toggle("is-open"); });
    });

    const form = $("#wishForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#wname").value.trim(), msg = $("#wmsg").value.trim();
      if (!name || !msg) return;
      const card = document.createElement("article");
      card.className = "wish is-open";
      card.tabIndex = 0;
      card.innerHTML = `<span class="wish__front">open</span><div class="wish__back"><p>“${msg}”<br><small style="font-family:var(--sans);font-style:normal;letter-spacing:.3em;font-size:.55rem;">— ${name.toUpperCase()}</small></p></div>`;
      $("#wishGrid").prepend(card);
      card.addEventListener("pointerenter", () => card.classList.add("is-open"));
      card.addEventListener("pointerleave", () => card.classList.remove("is-open"));
      if (hasGSAP) gsap.from(card, { opacity: 0, y: 26, filter: "blur(10px)", duration: 1.1, ease: "expo.out" });
      form.reset();
      $("#wishThanks").classList.add("is-on");
      toast("a little wish, safely kept.");
    });
  })();

  /* =========================================================
     10 · RSVP
     ========================================================= */
  (function rsvp() {
    const wrap = $("#rsvpChoices"), result = $("#rsvpResult"), sparks = $("#rsvpSparks");
    wrap.addEventListener("click", (e) => {
      const b = e.target.closest(".choice");
      if (!b) return;
      $$(".choice").forEach((c) => c.classList.remove("is-picked"));
      b.classList.add("is-picked");
      const yes = b.dataset.answer === "yes";
      result.textContent = yes ? "WE'LL SAVE YOU A SEAT." : "WE'LL KEEP THE DOOR OPEN.";
      if (hasGSAP) {
        gsap.fromTo(result, { opacity: 0, y: 16, filter: "blur(10px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.3, ease: "expo.out" });
      } else result.style.opacity = 1;
      if (yes) celebrate();
    });

    function celebrate() {
      if (!hasGSAP) return;
      sparks.innerHTML = "";
      const r = sparks.getBoundingClientRect();
      for (let i = 0; i < 22; i++) {
        const s = document.createElement("i");
        s.className = "spark";
        s.style.left = 30 + Math.random() * 40 + "%";
        s.style.top = 55 + Math.random() * 20 + "%";
        sparks.appendChild(s);
        gsap.to(s, {
          opacity: 0.9, duration: 0.5, delay: Math.random() * 0.5,
          onComplete: () => gsap.to(s, { opacity: 0, duration: 1.6 }),
        });
        gsap.to(s, {
          y: -(60 + Math.random() * 180), x: (Math.random() - 0.5) * 220,
          duration: 2.6 + Math.random() * 1.4, ease: "power2.out", delay: Math.random() * 0.5,
        });
      }
    }
  })();

  /* =========================================================
     11 · FINALE
     ========================================================= */
  if (hasGSAP && window.ScrollTrigger) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: "#finale", start: "top 62%" },
    });
    gsap.set(".fl", { opacity: 0, yPercent: 40, filter: "blur(14px)" });
    tl.to(".fl", { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 1.6, ease: "expo.out", stagger: 1.05 })
      .from(".cta", { opacity: 0, y: 24, duration: 1.2, ease: "expo.out" }, "-=0.6")
      .from(".finale__close", { opacity: 0, duration: 1.4 }, "-=0.6");
    gsap.to(".finale__glow", {
      opacity: 0.85, ease: "none",
      scrollTrigger: { trigger: "#finale", start: "top bottom", end: "center center", scrub: true },
    });
  }

  /* =========================================================
     12 · EASTER EGGS
     ========================================================= */
  $$("[data-egg]").forEach((el) => {
    el.addEventListener("click", () => toast(el.dataset.egg));
    el.addEventListener("mouseenter", () => toast(el.dataset.egg));
  });
  (function microEgg() {
    const el = $("#microEgg");
    if (!el) return;
    const msgs = JSON.parse(el.dataset.msgs);
    let i = 0;
    el.addEventListener("click", () => {
      i = (i + 1) % msgs.length;
      if (hasGSAP) {
        gsap.to(el, {
          opacity: 0, y: -8, duration: 0.35,
          onComplete: () => {
            el.textContent = msgs[i];
            gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6 });
          },
        });
      } else el.textContent = msgs[i];
    });
  })();

  /* =========================================================
     13 · THREE.JS ATMOSPHERE
     ========================================================= */
  (function atmosphere() {
    const canvas = $("#atmosphere");
    if (!canvas || typeof window.THREE === "undefined" || reduced) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
    camera.position.z = 18;

    const COUNT = innerWidth < 700 ? 220 : 460;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 46;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 26;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    // soft round sprite
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d");
    const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,244,226,1)");
    grd.addColorStop(0.4, "rgba(233,199,173,.5)");
    grd.addColorStop(1, "rgba(233,199,173,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);

    const mat = new THREE.PointsMaterial({
      size: 0.42, map: tex, transparent: true, depthWrite: false,
      opacity: 0.34, blending: THREE.NormalBlending,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    let mx = 0, my = 0;
    addEventListener("pointermove", (e) => {
      mx = (e.clientX / innerWidth - 0.5);
      my = (e.clientY / innerHeight - 0.5);
    });
    let scrollY = 0;
    addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

    (function render(t) {
      const time = t * 0.0001;
      points.rotation.y = time * 0.6;
      points.rotation.x = Math.sin(time * 0.5) * 0.08;
      points.position.y = -(scrollY / innerHeight) * 1.6;
      camera.position.x += (mx * 2.4 - camera.position.x) * 0.03;
      camera.position.y += (-my * 1.6 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    })(0);

    addEventListener("resize", () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
  })();

  /* ---------------- boot ---------------- */
  window.addEventListener("load", () => {
    playOpening();
    if (hasGSAP && window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();
