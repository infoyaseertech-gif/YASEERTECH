/* ==========================================================================
   YASEERTECH PORTFOLIO — BEHAVIOUR
   Reads window.YT_PROJECTS (js/projects.js). No dependencies.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var safeUrl = function (u) { return /^https?:\/\//i.test(u || '') ? u : ''; };
  var arr = function (v) { return Array.isArray(v) ? v.filter(Boolean) : []; };
  var CATEGORY_ORDER = ['Websites', 'Web Applications', 'Business Systems', 'E-commerce', 'UI/UX & Prototypes', 'Other Digital Solutions'];
  var STATUS_CLASS = { 'Live': 'live', 'Source available': 'src', 'In development': 'dev', 'Prototype': 'proto', 'Concept': 'proto' };
  var ICON = {
    ext: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14zM5 5h6v2H7v10h10v-4h2v6H5z"/></svg>',
    code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8.6 7.4-1.4-1.4L1.2 12l6 6 1.4-1.4L4 12zm6.8 0 4.6 4.6-4.6 4.6 1.4 1.4 6-6-6-6z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
  };

  var projects = (window.YT_PROJECTS || []).filter(function (p) { return p && p.visibility !== 'hidden'; });
  var bySlug = {};
  projects.forEach(function (p) { bySlug[p.slug] = p; });

  var state = { cat: 'All Projects', q: '' };

  /* ---------- elements ---------- */
  var grid = $('#grid'), filtersEl = $('#filters'), searchEl = $('#search');
  var countEl = $('#resultCount'), resetBtn = $('#resetBtn'), emptyEl = $('#empty');
  var modal = $('#modal'), modalBody = $('#modalBody'), modalPanel = $('.modal-panel', modal);
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbPrev = $('#lbPrev'), lbNext = $('#lbNext'), lbPanel = $('.lightbox-panel', lb);

  /* ---------- placeholder / media ---------- */
  function hue(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
    return 195 + (h % 60); // stay in the brand's blue range
  }
  function initials(title) {
    var w = String(title).replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
    return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || '?').slice(0, 2)).toUpperCase();
  }
  function placeholder(p) {
    return '<div class="ph" style="--h:' + hue(p.slug || p.title) + '" role="img" aria-label="Preview of ' + esc(p.title) + ' coming soon">' +
      '<strong>' + esc(initials(p.title)) + '</strong><span>Preview coming soon</span></div>';
  }
  function cover(p, eager) {
    if (!p.coverImage) return placeholder(p);
    return '<img src="' + esc(p.coverImage) + '" alt="' + esc(p.altText || p.title + ' screenshot') + '" width="640" height="400" decoding="async"' +
      (eager ? '' : ' loading="lazy"') + ' data-fallback="' + esc(p.slug) + '">';
  }
  // Broken image -> swap in the placeholder (error doesn't bubble, so capture it)
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'IMG' || !t.dataset.fallback) return;
    var p = bySlug[t.dataset.fallback];
    if (!p) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = placeholder(p);
    t.replaceWith(tmp.firstChild);
  }, true);

  function statusPill(p) {
    if (!p.status) return '';
    return '<span class="pill status ' + (STATUS_CLASS[p.status] || '') + '">' + esc(p.status) + '</span>';
  }

  /* ---------- cards ---------- */
  function card(p, i) {
    var tech = arr(p.technologies), shown = tech.slice(0, 4), extra = tech.length - shown.length;
    var live = safeUrl(p.liveUrl), gh = safeUrl(p.githubUrl);
    return '<li class="card" style="--i:' + Math.min(i, 8) + '">' +
      '<div class="thumb">' + cover(p, i < 3) +
        '<div class="badges"><span class="pill">' + esc(p.category) + '</span>' + statusPill(p) + '</div></div>' +
      '<div class="card-body">' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p class="card-desc">' + esc(p.shortDescription) + '</p>' +
        (shown.length ? '<div class="tags" aria-label="Technologies">' + shown.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') +
          (extra > 0 ? '<span class="tag">+' + extra + '</span>' : '') + '</div>' : '<div class="tags"></div>') +
        '<div class="card-actions">' +
          '<button type="button" class="btn btn-primary btn-sm" data-open="' + esc(p.slug) + '" aria-label="View details: ' + esc(p.title) + '">View details</button>' +
          (live ? '<a class="btn btn-outline btn-sm" href="' + esc(live) + '" target="_blank" rel="noopener noreferrer" aria-label="Visit live site: ' + esc(p.title) + ' (opens in new tab)">' + ICON.ext + 'Live</a>' : '') +
          (gh ? '<a class="btn btn-outline btn-sm" href="' + esc(gh) + '" target="_blank" rel="noopener noreferrer" aria-label="View source code: ' + esc(p.title) + ' (opens in new tab)">' + ICON.code + 'Code</a>' : '') +
        '</div></div></li>';
  }

  /* ---------- filtering ---------- */
  function matches(p) {
    if (state.cat !== 'All Projects' && p.category !== state.cat) return false;
    var q = state.q.trim().toLowerCase();
    if (!q) return true;
    var hay = [p.title, p.shortDescription, p.fullDescription, p.category, arr(p.technologies).join(' ')].join(' ').toLowerCase();
    return q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }
  function render() {
    var list = projects.filter(matches);
    grid.innerHTML = list.map(card).join('');
    emptyEl.hidden = list.length > 0;
    grid.hidden = list.length === 0;
    var filtered = state.cat !== 'All Projects' || state.q.trim() !== '';
    resetBtn.hidden = !filtered;
    countEl.textContent = 'Showing ' + list.length + ' of ' + projects.length + ' project' + (projects.length === 1 ? '' : 's');
    Array.prototype.forEach.call(filtersEl.children, function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.cat === state.cat));
    });
  }
  function buildFilters() {
    var present = {};
    projects.forEach(function (p) { present[p.category] = true; });
    var cats = ['All Projects'].concat(CATEGORY_ORDER.filter(function (c) { return present[c]; }));
    Object.keys(present).forEach(function (c) { if (cats.indexOf(c) === -1) cats.push(c); }); // custom categories
    filtersEl.innerHTML = cats.map(function (c) {
      return '<button type="button" class="chip" data-cat="' + esc(c) + '" aria-pressed="false">' + esc(c) + '</button>';
    }).join('');
    // a single category adds no value
    if (cats.length <= 2) filtersEl.hidden = true;
  }
  function resetAll() { state.cat = 'All Projects'; state.q = ''; searchEl.value = ''; render(); }

  filtersEl.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    state.cat = b.dataset.cat;
    render();
  });
  searchEl.addEventListener('input', function () { state.q = searchEl.value; render(); });
  searchEl.addEventListener('keydown', function (e) { if (e.key === 'Escape' && searchEl.value) { searchEl.value = ''; state.q = ''; render(); } });
  resetBtn.addEventListener('click', resetAll);
  $('#emptyReset').addEventListener('click', resetAll);

  /* ---------- hero stats (computed from real data only) ---------- */
  function heroStats() {
    var el = $('#heroStats');
    var live = projects.filter(function (p) { return safeUrl(p.liveUrl); }).length;
    var code = projects.filter(function (p) { return safeUrl(p.githubUrl); }).length;
    var items = [[projects.length, 'Projects showcased'], [live, 'Live websites'], [code, 'Public repositories']].filter(function (x) { return x[0] > 0; });
    if (!items.length) return;
    el.innerHTML = items.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>'; }).join('');
    el.hidden = false;
  }

  /* ---------- video ---------- */
  function youTubeId(u) {
    var m = String(u || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/);
    return m ? m[1] : '';
  }
  function videoBlock(p) {
    var u = p.videoUrl;
    if (!u) return '';
    var id = youTubeId(u);
    if (id) {
      return '<button type="button" class="vid-btn" data-yt="' + id + '" data-title="' + esc(p.title) + '" style="background-image:url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)" aria-label="Play video walkthrough: ' + esc(p.title) + '">' +
        '<span class="vid-play">' + ICON.play + '</span><span class="vid-note">Video walkthrough · loads on click</span></button>';
    }
    if (/\.(mp4|webm)(\?.*)?$/i.test(u)) {
      return '<video controls preload="none" playsinline' + (p.coverImage ? ' poster="' + esc(p.coverImage) + '"' : '') + '><source src="' + esc(u) + '"></video>';
    }
    return '';
  }
  modalBody.addEventListener('click', function (e) {
    var v = e.target.closest('.vid-btn');
    if (!v) return;
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + v.dataset.yt + '?autoplay=1&rel=0';
    f.title = 'Video walkthrough: ' + v.dataset.title;
    f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    v.replaceWith(f);
    f.focus();
  });

  /* ---------- detail modal ---------- */
  var lastFocus = null, openedByHash = false, galleryImgs = [];

  function section(title, inner) { return inner ? '<section class="m-sec"><h3>' + esc(title) + '</h3>' + inner + '</section>' : ''; }
  function listOf(items) { items = arr(items); return items.length ? '<ul class="m-list">' + items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>' : ''; }
  function paraOf(v) { return v ? '<p>' + esc(v) + '</p>' : ''; }

  function detailHTML(p) {
    var live = safeUrl(p.liveUrl), gh = safeUrl(p.githubUrl), tech = arr(p.technologies);
    galleryImgs = arr(p.galleryImages).filter(function (g) { return g && g.src; });
    var media = videoBlock(p) || cover(p, true);
    var meta = '<span class="pill">' + esc(p.category) + '</span>' + statusPill(p) +
      (p.completionDate ? '<span class="pill">Completed ' + esc(p.completionDate) + '</span>' : '');
    var results = arr(p.results);
    return '<div class="m-media">' + media + '</div>' +
      '<div class="m-body">' +
        '<div class="m-meta">' + meta + '</div>' +
        '<h2 id="modalTitle">' + esc(p.title) + '</h2>' +
        '<p class="m-lead">' + esc(p.fullDescription || p.shortDescription) + '</p>' +
        '<div class="m-actions">' +
          (live ? '<a class="btn btn-primary" href="' + esc(live) + '" target="_blank" rel="noopener noreferrer">' + ICON.ext + 'Visit live site</a>' : '') +
          (gh ? '<a class="btn btn-outline" href="' + esc(gh) + '" target="_blank" rel="noopener noreferrer">' + ICON.code + 'View source code</a>' : '') +
        '</div>' +
        section('My role', paraOf(p.role)) +
        section('Objectives', listOf(p.objectives)) +
        section('The challenge', listOf(p.challenges)) +
        section('The solution', listOf(p.solutions)) +
        section('Key features', listOf(p.keyFeatures)) +
        section('Technologies', tech.length ? '<div class="tags" style="margin:0">' + tech.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
        section('Screenshots', galleryImgs.length ? '<div class="m-gallery">' + galleryImgs.map(function (g, i) {
          return '<button type="button" data-lb="' + i + '" aria-label="Open screenshot ' + (i + 1) + ' of ' + galleryImgs.length + ': ' + esc(g.alt || p.title) + '"><img src="' + esc(g.src) + '" alt="' + esc(g.alt || p.title + ' screenshot ' + (i + 1)) + '" loading="lazy" decoding="async"></button>';
        }).join('') + '</div>' : '') +
        section('Results', listOf(results)) +
        section('What’s next', listOf(p.futureImprovements)) +
        '<div class="m-cta"><h3>Need something similar?</h3><p>Let’s build a solution that fits your business.</p>' +
          '<a class="btn btn-primary" href="https://yaseertech.vercel.app/contact.html">Hire YaseerTech</a></div>' +
      '</div>';
  }

  function openModal(slug, fromHash) {
    var p = bySlug[slug];
    if (!p) return;
    if (modal.hidden) lastFocus = document.activeElement;
    modalBody.innerHTML = detailHTML(p);
    modal.hidden = false;
    document.body.classList.add('lock');
    modalBody.scrollTop = 0;
    document.title = p.title + ' | YaseerTech Portfolio';
    openedByHash = !!fromHash;
    if (!fromHash) { try { history.pushState({ slug: slug }, '', '#project=' + slug); } catch (e) { location.hash = 'project=' + slug; } }
    modalPanel.focus();
  }
  function closeModal(fromPop) {
    if (modal.hidden) return;
    modal.hidden = true;
    modalBody.innerHTML = ''; // stops any playing video
    document.body.classList.remove('lock');
    document.title = 'Portfolio | YaseerTech';
    if (!fromPop && /project=/.test(location.hash)) {
      try {
        if (openedByHash) history.replaceState(null, '', location.pathname + location.search);
        else history.back();
      } catch (e) { location.hash = ''; }
    }
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  grid.addEventListener('click', function (e) {
    var b = e.target.closest('[data-open]');
    if (b) openModal(b.dataset.open, false);
  });
  modal.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    var g = e.target.closest('[data-lb]');
    if (g) openLightbox(+g.dataset.lb, g);
  });

  function routeFromHash() {
    var m = location.hash.match(/project=([\w-]+)/);
    if (m && bySlug[m[1]]) openModal(m[1], true);
    else if (!modal.hidden) { closeLightbox(); closeModal(true); }
  }
  window.addEventListener('popstate', routeFromHash);
  window.addEventListener('hashchange', routeFromHash);

  /* ---------- lightbox ---------- */
  var lbIndex = 0, lbOpener = null;
  function showLb(i) {
    lbIndex = (i + galleryImgs.length) % galleryImgs.length;
    var g = galleryImgs[lbIndex];
    lbImg.alt = g.alt || '';
    lbImg.src = g.src;
    lbCap.textContent = (g.alt || '') + (galleryImgs.length > 1 ? '  (' + (lbIndex + 1) + ' / ' + galleryImgs.length + ')' : '');
    lbPrev.hidden = lbNext.hidden = galleryImgs.length < 2;
  }
  function openLightbox(i, opener) {
    if (!galleryImgs.length) return;
    lbOpener = opener || null;
    showLb(i);
    lb.hidden = false;
    lbPanel.focus();
  }
  function closeLightbox() {
    if (lb.hidden) return;
    lb.hidden = true;
    lbImg.removeAttribute('src');
    if (lbOpener && document.contains(lbOpener)) lbOpener.focus();
  }
  lb.addEventListener('click', function (e) { if (e.target.closest('[data-lb-close]')) closeLightbox(); });
  lbPrev.addEventListener('click', function () { showLb(lbIndex - 1); });
  lbNext.addEventListener('click', function () { showLb(lbIndex + 1); });
  lbImg.addEventListener('error', function () { lbCap.textContent = 'This screenshot could not be loaded.'; });

  /* ---------- keyboard: Esc, arrows, focus trap ---------- */
  var FOCUSABLE = 'a[href],button:not([disabled]):not([hidden]),input,select,textarea,iframe,video[controls],[tabindex]:not([tabindex="-1"])';
  function trap(container, e) {
    var f = Array.prototype.filter.call(container.querySelectorAll(FOCUSABLE), function (n) { return n.offsetParent !== null || n === document.activeElement; });
    if (!f.length) { e.preventDefault(); return; }
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === container)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener('keydown', function (e) {
    if (!lb.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
      else if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
      else if (e.key === 'ArrowRight') showLb(lbIndex + 1);
      else if (e.key === 'Tab') trap(lbPanel, e);
      return;
    }
    if (!modal.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
      else if (e.key === 'Tab') trap(modalPanel, e);
      return;
    }
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- mobile menu ---------- */
  var burger = $('#hamburger'), links = $('#navLinks');
  function setMenu(open) {
    links.classList.toggle('open', open);
    burger.classList.toggle('active', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  function closeMenu() { if (links.classList.contains('open')) { setMenu(false); burger.focus(); } }
  burger.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', function (e) {
    if (links.classList.contains('open') && !links.contains(e.target) && !burger.contains(e.target)) setMenu(false);
  });
  // keep the closed mobile menu out of the tab order
  var mq = window.matchMedia('(min-width: 960px)');
  function syncMenuA11y() {
    var hide = !mq.matches && !links.classList.contains('open');
    links.setAttribute('aria-hidden', hide ? 'true' : 'false');
    if (hide) links.setAttribute('inert', ''); else links.removeAttribute('inert');
  }
  new MutationObserver(syncMenuA11y).observe(links, { attributes: true, attributeFilter: ['class'] });
  (mq.addEventListener ? mq.addEventListener('change', syncMenuA11y) : mq.addListener(syncMenuA11y));
  syncMenuA11y();

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- init ---------- */
  buildFilters();
  heroStats();
  render();
  initReveal();
  routeFromHash();
})();
