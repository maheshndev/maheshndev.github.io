// ============================================================
// RoadmapSection component
// ------------------------------------------------------------
// Renders the full "Career Roadmap" page — header, legend,
// winding path, section cards and CTA — from data spread across
// an index file plus one JSON per section.
//
// Usage:
//   <div data-roadmap-group
//        data-src="data/roadmap.json"></div>
//
// Index JSON shape:
//   { header, legend, sections: [{ src }], cta }
//
// The component auto-instantiates via the component registry below.
// ============================================================
(function () {
  'use strict';

  // ----- small helper to create elements safely -----
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // Status icon map (matches the original ✔ / ➜ / ○ legend)
  const STATUS = {
    done:    { icon: '\u2714', class: 'text-green-500' },
    current: { icon: '\u279c', class: 'text-blue-500' },
    future:  { icon: '\u25cb', class: 'text-slate-400' }
  };

  // ============================================================
  // RoadmapSection
  // ============================================================
  class RoadmapSection {
    constructor(host, options) {
      this.host = host;
      this.src = options.src || 'data/roadmap.json';
      this.data = null;
      this.sections = [];

      this.load();
    }

    // ----- fetch the index, then every referenced section JSON -----
    async load() {
      try {
        const res = await fetch(this.src, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load ${this.src}: ${res.status}`);
        this.data = await res.json();
        await this.loadSections();
        this.render();
      } catch (err) {
        console.warn('[RoadmapSection] Unable to load roadmap', err);
        this.host.innerHTML = '<div class="text-sm text-slate-500">Unable to load roadmap.</div>';
      }
    }

    async loadSections() {
      const refs = (this.data && this.data.sections) || [];
      for (const ref of refs) {
        try {
          const res = await fetch(ref.src, { cache: 'no-store' });
          if (!res.ok) throw new Error(`${ref.src}: ${res.status}`);
          this.sections.push(await res.json());
        } catch (err) {
          console.warn('[RoadmapSection] failed to load section', ref.src, err);
        }
      }
    }

    // ----- full-page render -----
    render() {
      this.host.innerHTML = '';

      const wrap = el('div', 'relative space-y-32');

      // progress line (desktop)
      wrap.appendChild(el('div', 'progress-line hidden lg:block'));

      // winding SVG path (desktop)
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 hidden lg:block');
      svg.setAttribute('style', 'z-index: -1;');
      svg.setAttribute('viewBox', '0 0 1000 2400');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'roadmap-path-v2 animate-draw');
      path.setAttribute('d', 'M 500,50 C 800,200 800,400 500,500 S 200,800 500,1000 S 800,1300 500,1500 S 200,1800 500,2000 L 500,2400');
      svg.appendChild(path);
      wrap.appendChild(svg);

      // header section (title + sticky note + subtitle + legend)
      wrap.appendChild(this.buildHeader());

      // sections grid
      this.sections.forEach(section => wrap.appendChild(this.buildSection(section)));

      wrap.appendChild(this.buildCTA());

      this.host.appendChild(wrap);

      // allow page scripts to run reveal animations
      document.dispatchEvent(new CustomEvent('roadmap:loaded', { detail: this.host }));
      console.log('[RoadmapSection] rendered', this.sections.length, 'sections');
    }

    buildHeader() {
      const d = this.data;
      const holder = el('div', 'text-center mb-24 relative');

      const inline = el('div', 'inline-block relative');
      const h1 = document.createElement('h1');
      h1.className = 'marker-font text-5xl md:text-8xl font-bold mb-4 text-slate-900 dark:text-white';
      if (d.header.title) h1.appendChild(document.createTextNode(d.header.title));
      if (d.header.highlight) {
        const span = el('span', 'text-accent-600', d.header.highlight);
        h1.appendChild(span);
      }
      inline.appendChild(h1);

      if (d.header.sticky) {
        const stickyWrap = el('div', 'absolute -top-12 -right-24 hidden lg:block animate-bounce');
        stickyWrap.appendChild(
          el('div', 'sticky-note p-3 w-36 text-xs font-bold sketch-border-sm text-slate-800', d.header.sticky)
        );
        inline.appendChild(stickyWrap);
      }

      holder.appendChild(inline);

      if (d.header.subtitle) {
        holder.appendChild(
          el('p', 'hand-font text-2xl md:text-3xl text-slate-600 dark:text-slate-400 mt-4', d.header.subtitle)
        );
      }

      // legend
      if (d.legend && d.legend.length) {
        const legend = el('div', 'mt-12 flex flex-wrap justify-center gap-6 text-sm font-bold');
        d.legend.forEach(item => {
          const row = el('div', 'flex items-center gap-2');
          const sym = el('span', (item.class || '') + (item.muted ? ' opacity-50' : ''), item.symbol);
          row.appendChild(sym);
          row.appendChild(el('span', item.muted ? 'opacity-50' : '', item.label));
          legend.appendChild(row);
        });
        holder.appendChild(legend);
      }

      return holder;
    }

    buildSection(section) {
      const sec = el('section', 'relative');

      // section header
      const hd = el('div', 'flex justify-center mb-16 flex-col items-center');
      const h2 = el('h2', `section-header marker-font text-3xl font-bold ${section.colorClass}`);
      h2.dataset.roadmapSectionHeader = section.roman;
      h2.textContent = `${section.roman}. ${section.title}`;
      hd.appendChild(h2);
      if (section.subtitle) {
        hd.appendChild(el('p', `hand-font text-xl ${section.colorClass} mt-3 opacity-80`, section.subtitle));
      }
      sec.appendChild(hd);

      // levels grid
      const grid = el('div', `grid grid-cols-1 ${section.gridClass} gap-8 ${section.widthClass || ''}`);
      (section.levels || []).forEach(level => grid.appendChild(this.buildLevelCard(section, level)));
      sec.appendChild(grid);

      return sec;
    }

    buildLevelCard(section, level) {
      const cardClass = `level-card sketch-border p-6 bg-white dark:bg-slate-800/50 relative ${level.borderClass || ''}`;
      const card = el('div', cardClass);

      // badge
      const badge = el(
        'div',
        `absolute -top-4 -left-4 w-10 h-10 ${level.badgeClass || 'bg-slate-200 dark:bg-slate-700'} rounded-full flex items-center justify-center font-bold border-2 border-slate-700`
      );
      badge.textContent = level.badge;
      card.appendChild(badge);

      // title
      card.appendChild(el('h3', 'font-bold text-xl mb-4 marker-font', level.title));

      // side note
      if (level.note) {
        const noteWrap = el('div', level.note.position || '');
        noteWrap.appendChild(el('div', level.note.class || 'hand-font text-blue-500 text-sm', level.note.text));
        card.appendChild(noteWrap);
      }

      // sticky note (below)
      if (level.stickyNote) {
        const stick = el('div', level.stickyNote.position || 'absolute -bottom-8 right-0 hidden xl:block -rotate-6');
        stick.appendChild(
          el('div', `sticky-note p-2 text-[10px] font-bold sketch-border-sm text-slate-800 ${level.stickyNote.size || 'w-24'}`, level.stickyNote.text)
        );
        card.appendChild(stick);
      }

      // items
      const list = el('ul', 'space-y-3 text-sm');
      (level.items || []).forEach(item => {
        const li = el('li', 'flex items-start gap-2');
        const status = STATUS[item.status] || STATUS.future;
        const sym = el('span', `${status.class} mt-1`, status.icon);
        li.appendChild(sym);
        li.appendChild(el('span', null, item.text));
        list.appendChild(li);
      });
      card.appendChild(list);

      return card;
    }

    buildCTA() {
      const cta = this.data.cta || {};
      const section = el('section', 'mt-32 text-center');
      const box = el('div', 'inline-block sketch-border p-10 bg-accent-600 text-white transform hover:rotate-1 transition-all duration-300 shadow-2xl');

      box.appendChild(el('h3', 'marker-font text-3xl mb-4', cta.title || 'Want to Collaborate?'));
      box.appendChild(el('p', 'hand-font text-xl mb-8 opacity-90', cta.subtitle || ''));

      const row = el('div', 'flex flex-wrap justify-center gap-4');

      const mailBtn = document.createElement('a');
      mailBtn.className = 'bg-white text-accent-600 px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 hover:text-black transition-colors flex items-center gap-2';
      mailBtn.href = cta.email || '__CONTACT_EMAIL__';
      const mailIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mailIcon.setAttribute('class', 'w-5 h-5');
      mailIcon.setAttribute('fill', 'none');
      mailIcon.setAttribute('stroke', 'currentColor');
      mailIcon.setAttribute('viewBox', '0 0 24 24');
      const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p1.setAttribute('d', 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z');
      mailIcon.appendChild(p1);
      mailBtn.appendChild(mailIcon);
      mailBtn.appendChild(document.createTextNode(cta.emailLabel || 'Get in Touch'));
      row.appendChild(mailBtn);

      const portfolioBtn = document.createElement('a');
      portfolioBtn.className = 'border-2 border-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors';
      portfolioBtn.href = cta.portfolioHref || 'index.html';
      portfolioBtn.textContent = cta.portfolioLabel || 'View Portfolio';
      row.appendChild(portfolioBtn);

      box.appendChild(row);
      section.appendChild(box);
      return section;
    }
  }

  // ============================================================
  // ComponentRegistry — mounts any [data-roadmap-group]
  // ============================================================
  const registry = {
    mountRoadmap() {
      document.querySelectorAll('[data-roadmap-group]').forEach((host) => {
        if (host._roadmapComponent) return;
        const options = {
          src: host.getAttribute('data-src') || 'data/roadmap.json'
        };
        host._roadmapComponent = new RoadmapSection(host, options);
      });
    }
  };

  // ----- exposure for other scripts (optional API) -----
  window.RoadmapSection = RoadmapSection;
  window.RoadmapComponentRegistry = registry;

  // ----- auto-init once DOM ready (idempotent) -----
  function init() {
    registry.mountRoadmap();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();