'use strict';

/**
 * Motion layer: entrance reveals, tab transitions, a sliding nav indicator,
 * cursor-follow card glow and count-up numbers in project modals.
 * Loaded after script.js so its click handlers run after the page switch.
 */

(function () {

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('m-ready');



  // --------------------
  // Reveal on enter
  // --------------------

  const REVEAL_TARGETS = [
    '.sidebar-info > *',
    '.article-title',
    '.about-text > p',
    '.service-item',
    '.testimonials-item',
    '.title-wrapper',
    '.timeline-item',
    '.skill > *',
    '.filter-list',
    '.filter-select-box',
    '.project-item > a',
    '.extras-post-item',
    '.contact-form'
  ].join(',');

  const STAGGER_MS = 70;
  const MAX_STAGGER_STEPS = 8;

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      reveal(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  const reveal = function (el) {
    el.classList.add('m-in');
    const delay = parseInt(el.style.getPropertyValue('--m-delay'), 10) || 0;
    clearTimeout(el._mDone);
    el._mDone = setTimeout(function () { el.classList.add('m-done'); }, delay + 800);
  };

  const prepare = function (el) {
    el.classList.remove('m-in', 'm-done');
    clearTimeout(el._mDone);
    revealObserver.observe(el);
  };

  const revealEls = Array.from(document.querySelectorAll(REVEAL_TARGETS));

  // stagger siblings that share a parent
  const siblingCount = new Map();
  revealEls.forEach(function (el) {
    const key = el.parentElement;
    const i = siblingCount.get(key) || 0;
    siblingCount.set(key, i + 1);
    el.style.setProperty('--m-delay', Math.min(i, MAX_STAGGER_STEPS) * STAGGER_MS + 'ms');
    el.classList.add('m-reveal');
    prepare(el);
  });

  // replay the entrance for everything inside a container
  const replay = function (container) {
    container.querySelectorAll('.m-reveal').forEach(prepare);
  };

  // the site plays its entrance as the landing journey lifts away
  document.addEventListener('hero:exit', function () {
    const page = document.querySelector('article.active[data-page]');
    const sidebar = document.querySelector('.sidebar');
    if (page) replay(page);
    if (sidebar) replay(sidebar);
    const name = document.querySelector('.sidebar .name');
    if (name) {
      name.style.animation = 'none';
      void name.offsetWidth;
      name.style.animation = '';
    }
  });

  // the phone navbar is pinned to the bottom edge, outside the observer's
  // margin, so its items enter on load instead of on scroll
  document.querySelectorAll('.navbar-list > li').forEach(function (li, i) {
    li.style.setProperty('--m-delay', 200 + i * STAGGER_MS + 'ms');
    li.classList.add('m-reveal');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { reveal(li); });
    });
  });



  // --------------------
  // Nav indicator
  // --------------------

  const navList = document.querySelector('.navbar-list');
  const navLinks = document.querySelectorAll('[data-nav-link]');
  let pill = null;

  const movePill = function (link, instant) {
    if (!pill || !link) return;
    // sum layout offsets up to .navbar-list: they ignore the items' entrance
    // transforms, and a transformed <li> becomes the link's offsetParent
    let offsetX = 0;
    let offsetY = 0;
    for (let node = link; node && node !== navList; node = node.offsetParent) {
      offsetX += node.offsetLeft;
      offsetY += node.offsetTop;
    }
    const height = Math.min(34, link.offsetHeight - 12);
    // the capsule stays within its own tab on narrow bars
    const pad = window.innerWidth < 600 ? 2 : 7;
    const width = link.offsetWidth + pad * 2;
    const x = offsetX - pad;
    const y = offsetY + (link.offsetHeight - height) / 2;

    pill.classList.toggle('m-instant', !!instant);
    pill.style.height = height + 'px';
    pill.style.width = width + 'px';
    pill.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    pill.classList.add('m-on');
    if (instant) requestAnimationFrame(function () { pill.classList.remove('m-instant'); });
  };

  const activeLink = function () {
    return document.querySelector('[data-nav-link].active') || navLinks[0];
  };

  if (navList && navLinks.length) {
    pill = document.createElement('li');
    pill.className = 'm-nav-pill';
    pill.setAttribute('aria-hidden', 'true');
    navList.prepend(pill);

    window.addEventListener('load', function () { movePill(activeLink(), true); });
    window.addEventListener('resize', function () { movePill(activeLink(), true); });
  }



  // --------------------
  // Tab transitions
  // --------------------

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      movePill(link);
      const page = document.querySelector('article.active[data-page]');
      if (page) replay(page);
    });
  });

  // project filters re-run the card entrance
  document.querySelectorAll('[data-filter-btn], [data-select-item]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const list = document.querySelector('.project-list');
      if (list) replay(list);
    });
  });



  // --------------------
  // Card glow follows the cursor
  // --------------------

  document.addEventListener('pointermove', function (e) {
    const card = e.target.closest && e.target.closest('.service-item, .content-card');
    if (!card) return;
    const box = card.getBoundingClientRect();
    card.style.setProperty('--mx', e.clientX - box.left + 'px');
    card.style.setProperty('--my', e.clientY - box.top + 'px');
  }, { passive: true });



  // --------------------
  // Count-up numbers in project modals
  // --------------------

  const COUNT_MS = 900;
  // leading number, but not the start of a range like "35–40%"
  const LEADING_NUMBER = /^(\s*[+−-]?)(\d+(?:\.\d+)?)(?![\d.]*\s*[–-]\s*\d)/;

  const countUp = function (el, match) {
    const text = el.textContent;
    const prefix = match[1];
    const digits = match[2];
    const rest = text.slice(match[0].length);
    const target = parseFloat(digits);
    const decimals = (digits.split('.')[1] || '').length;
    const start = performance.now();

    el.classList.add('m-counting');

    const tick = function (now) {
      const p = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + rest;
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = text;
        el.classList.remove('m-counting');
      }
    };
    requestAnimationFrame(tick);
  };

  const scanModal = function (modal) {
    modal.querySelectorAll('td, strong').forEach(function (el) {
      if (el.dataset.mCounted || el.children.length || !el.getClientRects().length) return;
      const match = el.textContent.match(LEADING_NUMBER);
      if (!match) return;
      el.dataset.mCounted = '1';
      countUp(el, match);
    });
  };

  document.querySelectorAll('#project-modal, [data-project-modal]').forEach(function (modal) {
    let scanTimer = null;
    new MutationObserver(function () {
      clearTimeout(scanTimer);
      scanTimer = setTimeout(function () {
        if (modal.getClientRects().length) scanModal(modal);
      }, 120);
    }).observe(modal, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  });

})();



/**
 * More-below hint: shows a blurred edge while there's more to scroll to,
 * on the page and inside project pop-ups. Runs for everyone, since it
 * tells people the content continues rather than decorating it.
 */

(function () {

  const SLACK = 48;

  const makeHint = function (parent) {
    const edge = document.createElement('div');
    edge.className = 'm-more';
    edge.setAttribute('aria-hidden', 'true');
    const chevron = document.createElement('div');
    chevron.className = 'm-more-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    parent.append(edge, chevron);
    return {
      edge: edge,
      chevron: chevron,
      set: function (on) {
        edge.classList.toggle('is-on', on);
        chevron.classList.toggle('is-on', on);
      }
    };
  };

  // the page
  const pageHint = makeHint(document.body);
  const updatePage = function () {
    const root = document.documentElement;
    const covered = !!document.querySelector('.project-modal.active');
    pageHint.set(!covered && root.scrollHeight - window.innerHeight - window.scrollY > SLACK);
  };

  window.addEventListener('scroll', updatePage, { passive: true });
  window.addEventListener('resize', updatePage);
  new ResizeObserver(updatePage).observe(document.body);
  updatePage();

  // project pop-ups
  const modalBody = document.getElementById('project-modal-body');
  const modalWrapper = modalBody && modalBody.closest('.project-modal-wrapper');
  if (!modalWrapper) return;

  const modalHint = makeHint(modalWrapper);
  const footer = modalWrapper.querySelector('.project-modal-footer');
  const scroller = function () {
    return modalBody.scrollHeight > modalBody.clientHeight + 1 ? modalBody : modalWrapper;
  };

  const updateModal = function () {
    const box = scroller();
    const bottom = footer ? footer.offsetHeight : 0;
    modalHint.edge.style.bottom = bottom + 'px';
    modalHint.chevron.style.bottom = bottom + 12 + 'px';
    modalHint.set(box.scrollHeight - box.clientHeight - box.scrollTop > SLACK);
  };

  modalBody.addEventListener('scroll', updateModal, { passive: true });
  modalWrapper.addEventListener('scroll', updateModal, { passive: true });
  modalBody.addEventListener('load', updateModal, true);
  new ResizeObserver(updateModal).observe(modalBody);
  new MutationObserver(updatePage).observe(modalBody.closest('.project-modal'), { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(updateModal).observe(modalBody, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

})();

