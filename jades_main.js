/* ============================================================
   JADES — Ecosistema Web / main.js
   Módulos: nav scroll, hamburger, scroll reveal, FAQ accordion,
            smooth scroll con offset, active nav link on scroll
   Sin código inline en HTML. Sin dependencias externas.
   ============================================================ */

(function () {
  'use strict';

  /* ─────────────────────────────────────
     NAV — clase .scrolled al hacer scroll
  ───────────────────────────────────── */
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    function update() {
      nav.classList.toggle('scrolled', window.scrollY > 24);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ─────────────────────────────────────
     HAMBURGER + MOBILE MENU
  ───────────────────────────────────── */
  function initMobileMenu() {
    const burger  = document.getElementById('burger');
    const mobMenu = document.getElementById('mobMenu');
    if (!burger || !mobMenu) return;

    let open = false;

    function toggle() {
      open = !open;
      burger.classList.toggle('open', open);
      mobMenu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      mobMenu.setAttribute('aria-hidden',  String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    }

    function close() {
      if (!open) return;
      open = false;
      burger.classList.remove('open');
      mobMenu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      mobMenu.setAttribute('aria-hidden',  'true');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', toggle);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    // Expose close for inline onclick in overlay links
    window.closeMob = close;
  }

  /* ─────────────────────────────────────
     SCROLL REVEAL — IntersectionObserver
     Nunca usa window.addEventListener('scroll')
  ───────────────────────────────────── */
  function initScrollReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );

    items.forEach(el => io.observe(el));
  }

  /* ─────────────────────────────────────
     FAQ ACCORDION
  ───────────────────────────────────── */
  function initFAQ() {
    const items = document.querySelectorAll('[data-faq]');
    if (!items.length) return;

    items.forEach(item => {
      const btn    = item.querySelector('.faq-item__q');
      const answer = item.querySelector('.faq-item__a');
      if (!btn || !answer) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Cerrar todos los demás
        items.forEach(other => {
          if (other !== item) {
            other.classList.remove('open');
            const otherBtn = other.querySelector('.faq-item__q');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle actual
        item.classList.toggle('open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  }

  /* ─────────────────────────────────────
     SMOOTH SCROLL con offset del nav fijo
  ───────────────────────────────────── */
  function initSmoothScroll() {
    const NAV_H = 70;

    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href');
        if (id === '#') return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - NAV_H;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ─────────────────────────────────────
     ACTIVE NAV LINK según sección visible
  ───────────────────────────────────── */
  function initActiveNav() {
    const sections  = document.querySelectorAll('section[id], div[id]');
    const navLinks  = document.querySelectorAll('.nav__link');
    if (!sections.length || !navLinks.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        });
      },
      { threshold: 0.35 }
    );

    sections.forEach(s => io.observe(s));
  }

  /* ─────────────────────────────────────
     PLAN CARDS — micro lift on hover
     (refuerza la animación CSS con JS
      para dispositivos que ignoran :hover
      en touch primario)
  ───────────────────────────────────── */
  function initPlanCards() {
    document.querySelectorAll('.plan').forEach(card => {
      card.addEventListener('touchstart', () => {
        card.style.transform = 'translateY(-6px)';
      }, { passive: true });
      card.addEventListener('touchend', () => {
        setTimeout(() => { card.style.transform = ''; }, 300);
      }, { passive: true });
    });
  }

  /* ─────────────────────────────────────
     STATS COUNTER — anima los números
     en el bento del hero
  ───────────────────────────────────── */
  function initHeroCounters() {
    // Los números del bento son estáticos en este caso,
    // pero dejamos el hook por si se agregan counters dinámicos
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el  = entry.target;
        const end = parseInt(el.dataset.count, 10);
        const sfx = el.dataset.suffix || '';
        let   n   = 0;
        const dur = 1200;
        const fps = 60;
        const inc = end / (dur / (1000 / fps));

        const timer = setInterval(() => {
          n = Math.min(n + inc, end);
          el.textContent = Math.floor(n) + sfx;
          if (n >= end) clearInterval(timer);
        }, 1000 / fps);

        io.unobserve(el);
      });
    }, { threshold: 0.6 });

    counters.forEach(el => io.observe(el));
  }

  /* ─────────────────────────────────────
     TABLA COMPARATIVA — highlight col
     al pasar sobre encabezado
  ───────────────────────────────────── */
  function initTableHighlight() {
    const table = document.querySelector('.compare-table');
    if (!table) return;

    const headers = table.querySelectorAll('th');
    headers.forEach((th, colIdx) => {
      if (colIdx === 0) return; // skip first col

      th.style.cursor = 'default';

      th.addEventListener('mouseenter', () => {
        table.querySelectorAll('tr').forEach(row => {
          const cells = row.querySelectorAll('td, th');
          if (cells[colIdx]) {
            cells[colIdx].style.background = '#F7F6F3';
          }
        });
      });

      th.addEventListener('mouseleave', () => {
        table.querySelectorAll('td, th').forEach(cell => {
          cell.style.background = '';
        });
      });
    });
  }

  /* ─────────────────────────────────────
     WHATSAPP FAB — aparece con delay
     suave al cargar la página
  ───────────────────────────────────── */
  function initFAB() {
    const fab = document.querySelector('.fab-wa');
    if (!fab) return;

    fab.style.opacity  = '0';
    fab.style.transform = 'translateY(12px) scale(0.9)';
    fab.style.transition = 'opacity 500ms, transform 500ms cubic-bezier(0.16,1,0.3,1)';

    setTimeout(() => {
      fab.style.opacity   = '1';
      fab.style.transform = 'translateY(0) scale(1)';
    }, 1200);
  }

  /* ─────────────────────────────────────
     INIT ALL
  ───────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initNavScroll();
    initMobileMenu();
    initScrollReveal();
    initFAQ();
    initSmoothScroll();
    initActiveNav();
    initPlanCards();
    initHeroCounters();
    initTableHighlight();
    initFAB();
  });

})();
