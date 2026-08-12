// ============================================================
// InfographicSection component
// ------------------------------------------------------------
// Renders the full interactive infographic page from an index
// JSON plus one JSON per content block.
//
// Usage:
//   <div data-infographic-group
//        data-src="data/infographic.json"></div>
//
// Index JSON shape:
//   { header, columns: [{ class, sections: [{ type, title, src }] }], cta, footer }
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

  function svgEl(attrs, children) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    Object.keys(attrs || {}).forEach(k => svg.setAttribute(k, attrs[k]));
    (children || []).forEach(c => {
      if (c.type === 'path') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        Object.keys(c.attrs || {}).forEach(k => path.setAttribute(k, c.attrs[k]));
        path.setAttribute('d', c.d);
        svg.appendChild(path);
      }
    });
    return svg;
  }

  // ============================================================
  // InfographicSection
  // ============================================================
  class InfographicSection {
    constructor(host, options) {
      this.host = host;
      this.src = options.src || 'data/infographic.json';
      this.data = null;
      this.blocks = {}; // keyed by section src

      this.load();
    }

    async load() {
      try {
        const res = await fetch(this.src, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load ${this.src}: ${res.status}`);
        this.data = await res.json();
        await this.loadBlocks();
        this.render();
      } catch (err) {
        console.warn('[InfographicSection] Unable to load infographic', err);
        this.host.innerHTML = '<div class="text-sm text-slate-500">Unable to load infographic.</div>';
      }
    }

    async loadBlocks() {
      const list = [];
      (this.data.columns || []).forEach(col => {
        (col.sections || []).forEach(sec => list.push(sec));
      });
      const uniq = Array.from(new Map(list.map(s => [s.src, s])).values());
      await Promise.all(uniq.map(async (sec) => {
        try {
          const res = await fetch(sec.src, { cache: 'no-store' });
          if (!res.ok) throw new Error(`${sec.src}: ${res.status}`);
          this.blocks[sec.src] = await res.json();
        } catch (err) {
          console.warn('[InfographicSection] failed to load block', sec.src, err);
        }
      }));
    }

    render() {
      this.host.innerHTML = '';
      const wrap = el('div', 'relative');

      // central SVG roadmap path
      if (this.data.header && this.data.header.path) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20 hidden lg:block');
        svg.setAttribute('style', 'z-index: -1;');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'roadmap-path');
        path.setAttribute('d', this.data.header.path);
        svg.appendChild(path);
        wrap.appendChild(svg);
      }

      wrap.appendChild(this.buildHeader());

      // main grid layout
      const grid = el('div', 'grid grid-cols-1 lg:grid-cols-12 gap-8 relative');
      (this.data.columns || []).forEach(col => grid.appendChild(this.buildColumn(col)));
      wrap.appendChild(grid);

      wrap.appendChild(this.buildCTA());
      wrap.appendChild(this.buildFooter());

      this.host.appendChild(wrap);

      document.dispatchEvent(new CustomEvent('infographic:loaded', { detail: this.host }));
      console.log('[InfographicSection] rendered page');
    }

    buildHeader() {
      const h = this.data.header || {};
      const holder = el('div', 'mb-20 text-center relative');

      const inline = el('div', 'inline-block relative');

      const h1 = el('h1', 'marker-font text-5xl md:text-7xl font-bold mb-4 z-10 relative text-slate-900 dark:text-white', h.title || '');
      inline.appendChild(h1);

      if (h.subtitle) {
        const h2 = el('h2', h.subtitleClass || 'marker-font text-3xl md:text-5xl font-bold mb-6 text-blue-600 dark:text-blue-400', h.subtitle);
        inline.appendChild(h2);
      }

      if (h.sticky) {
        const stickyWrap = el('div', 'absolute -top-10 -right-20 hidden lg:block animate-bounce');
        stickyWrap.appendChild(el('div', 'sticky-note p-4 w-40 text-sm font-bold sketch-border-sm text-slate-800', h.sticky));
        inline.appendChild(stickyWrap);
      }

      holder.appendChild(inline);

      if (h.tagline) {
        holder.appendChild(el('p', 'hand-font text-2xl max-w-2xl mx-auto text-slate-600 dark:text-slate-400', h.tagline));
      }

      // STARTING POINT badge
      if (h.startBadge) {
        const start = el('div', 'flex justify-center mt-6');
        start.appendChild(el('div', 'bg-red-500 text-white px-8 py-3 rounded-full font-bold sketch-border-sm animate-pulse shadow-lg', h.startBadge));
        holder.appendChild(start);
      }

      return holder;
    }

    // ----- column wrapper -----
    buildColumn(col) {
      const colDiv = el('div', col.class || 'lg:col-span-4 space-y-8');
      (col.sections || []).forEach(sec => colDiv.appendChild(this.buildSection(sec)));
      return colDiv;
    }

    buildSection(sec) {
      const wrap = el('div', 'space-y-6');
      const data = this.blocks[sec.src] || {};

      if (sec.title) {
        wrap.appendChild(el('h2', 'node-title text-xl font-bold mb-6 dark:bg-slate-800 dark:text-blue-400', sec.title));
      }

      const renderer = this['render_' + (sec.type || 'academic')];
      if (typeof renderer === 'function') {
        wrap.appendChild(renderer.call(this, data));
      } else {
        wrap.appendChild(el('p', 'text-sm text-slate-500', 'Unknown block type: ' + sec.type));
      }

      return wrap;
    }

    // ---------- BLOCK RENDERERS ----------

    // 1. ACADEMIC BASE
    render_academic(data) {
      const box = el('div', 'space-y-6');
      (data.items || []).forEach(item => {
        const card = el('div', `sketch-border p-5 bg-white dark:bg-slate-800/50 card-hover relative ${item.cardClass || ''}`);
        const num = el(
          'div',
          `absolute -left-3 -top-3 w-8 h-8 ${item.numClass || 'bg-blue-100 dark:bg-blue-900/50'} rounded-full flex items-center justify-center font-bold border-2 border-slate-700 dark:border-slate-500`,
          item.num
        );
        card.appendChild(num);
        card.appendChild(el('h3', `font-bold ${item.titleClass || 'dark:text-slate-200'}`, item.title));
        card.appendChild(el('p', `text-sm text-slate-500 dark:text-slate-400 ${item.metaClass || ''}`, item.meta));
        if (item.note) {
          card.appendChild(el('p', 'text-xs mt-2 italic text-slate-400 dark:text-slate-500', item.note));
        }
        if (item.chip) {
          const chipWrap = el('div', 'mt-2 flex gap-1');
          chipWrap.appendChild(el('span', `text-[10px] px-2 py-0.5 ${item.chip.class}`, item.chip.text));
          card.appendChild(chipWrap);
        }
        box.appendChild(card);
      });
      return box;
    }

    // 2. PROFESSIONAL RECOGNITION
    render_recognition(data) {
      const box = el('div', 'grid grid-cols-1 gap-4');
      (data.items || []).forEach(item => {
        const card = el('div', `sketch-border-sm p-4 ${item.cardClass || 'bg-white dark:bg-slate-800/50'} flex items-center gap-4 card-hover`);
        card.appendChild(this.buildIcon(item.icon));
        const txt = el('div');
        txt.appendChild(el('h4', 'font-bold text-sm dark:text-slate-200', item.title));
        txt.appendChild(el('p', 'text-xs dark:text-slate-400', item.meta));
        card.appendChild(txt);
        box.appendChild(card);
      });
      return box;
    }

    // LIVE / MY TOOLKIT box
    render_toolkit(data) {
      const box = el('div', 'sketch-border p-6 bg-slate-900 text-white relative shadow-2xl');

      if (data.live) {
        const live = el('div', 'absolute -right-4 -top-4 w-12 h-12 bg-yellow-400 text-black flex items-center justify-center font-bold sketch-border rotate-12', data.live);
        box.appendChild(live);
      }

      box.appendChild(el('h2', 'marker-font text-3xl font-bold mb-6 text-yellow-400', data.title || 'MY TOOLKIT'));

      const groups = el('div', 'space-y-8');
      (data.groups || []).forEach(group => {
        const g = el('div');
        g.appendChild(el('h3', 'marker-font text-xl mb-4 border-b border-slate-700', group.title));

        if (group.layout === 'rows') {
          const rows = el('div', 'space-y-3');
          (group.items || []).forEach(item => {
            const row = el('div', 'flex items-center gap-3');
            const iconBox = el('div', item.icon.iconBox || 'w-8 h-8 bg-white rounded-lg flex items-center justify-center');
            iconBox.appendChild(this.buildIcon(item.icon));
            row.appendChild(iconBox);
            row.appendChild(el('span', 'text-sm font-bold', item.text));
            rows.appendChild(row);
          });
          g.appendChild(rows);
        } else if (group.layout === 'grid') {
          const grid = el('div', 'grid grid-cols-2 gap-2');
          (group.items || []).forEach(item => {
            const cell = el('div', 'flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-lg text-sm border border-slate-700');
            cell.appendChild(this.buildIcon(item.icon));
            cell.appendChild(el('span', null, item.text));
            grid.appendChild(cell);
          });
          g.appendChild(grid);
        } else {
          // chips
          const chips = el('div', 'flex flex-wrap gap-2');
          (group.items || []).forEach(item => {
            const chip = el('div', 'flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full text-sm font-bold border border-slate-700');
            chip.appendChild(this.buildIcon(item.icon));
            chip.appendChild(el('span', null, item.text));
            chips.appendChild(chip);
          });
          g.appendChild(chips);
        }
        groups.appendChild(g);
      });
      box.appendChild(groups);

      // caption box
      if (data.caption) {
        const cap = el('div', 'mt-8 border-2 border-dashed border-slate-700 p-4 rounded-xl text-center bg-slate-800/50');
        cap.appendChild(el('div', 'hand-font text-xl text-yellow-200 mb-2', data.caption.text));
        if (data.caption.svg) {
          cap.appendChild(svgEl(data.caption.svg, data.caption.svg.paths || []));
        }
        cap.appendChild(el('p', 'text-[10px] text-slate-400 mt-2 italic', data.caption.note));
        box.appendChild(cap);
      }

      return box;
    }

    // 3. EXPERIENCE JOURNEY
    render_experience(data) {
      const box = el('div', 'space-y-6');
      (data.items || []).forEach(item => {
        const card = el('div', `sketch-border p-5 bg-white dark:bg-slate-800/50 ${item.cardClass || ''} relative card-hover`);

        if (item.badge) {
          const badge = el('div', `absolute -right-3 -top-3 w-10 h-10 ${item.badgeClass || 'bg-blue-600 text-white'} rounded-full flex items-center justify-center font-bold border-2 border-slate-900 shadow-lg`, item.badge);
          card.appendChild(badge);
        }

        card.appendChild(el('h3', `font-bold ${item.titleClass || 'dark:text-slate-200'}`, item.title));
        card.appendChild(el('p', 'text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest', item.period));
        if (item.role) {
          card.appendChild(el('p', `text-sm mt-3 ${item.roleClass || 'text-slate-700 dark:text-slate-200'}`, item.role));
        }

        if ((item.points || []).length) {
          const ul = el('ul', 'text-xs text-slate-600 dark:text-slate-400 mt-2 list-disc ml-4 space-y-1');
          item.points.forEach(p => ul.appendChild(el('li', null, p)));
          card.appendChild(ul);
        }

        if (item.link) {
          const linkEl = document.createElement('a');
          linkEl.href = item.link;
          linkEl.className = 'inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline mt-3';
          linkEl.innerHTML = `${item.linkText || 'View More'} <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
          card.appendChild(linkEl);
        }

        box.appendChild(card);
      });
      return box;
    }

    // 4. STRATEGIC WORK
    render_work(data) {
      const box = el('div', 'space-y-4');

      (data.cards || []).forEach(item => {
        const card = el('div', `sketch-border p-4 bg-white dark:bg-slate-800/50 card-hover shadow-sm ${item.cardClass || ''}`);

        const head = el('div', 'flex justify-between items-start mb-2');
        head.appendChild(el('h4', 'font-bold text-sm dark:text-slate-200', item.title));
        if (item.tag) {
          head.appendChild(el('span', `text-[10px] ${item.tagClass || ''} px-2 py-0.5 rounded font-bold border`, item.tag));
        }
        card.appendChild(head);

        card.appendChild(el('p', 'text-[11px] text-slate-600 dark:text-slate-400 mb-2 leading-relaxed', item.desc));
        
        if (item.link) {
          const linkEl = document.createElement('a');
          linkEl.href = item.link;
          linkEl.className = 'inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline';
          linkEl.innerHTML = `${item.linkText || 'View'} <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
          card.appendChild(linkEl);
        }
        
        box.appendChild(card);
      });

      if (data.special) {
        const sp = el('div', 'sketch-border p-4 bg-slate-50 dark:bg-slate-900/50 card-hover shadow-inner border-slate-200 dark:border-slate-800');
        sp.appendChild(el('h4', 'font-bold text-sm mb-3 dark:text-slate-200', data.special.title));
        const rows = el('div', 'space-y-2');
        (data.special.rows || []).forEach(row => {
          const r = el('div', 'text-[10px] p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2 dark:text-slate-300');
          r.appendChild(el('span', `w-2 h-2 ${row.dot || 'bg-indigo-400'} rounded-full`, ''));
          r.appendChild(el('span', null, row.text));
          rows.appendChild(r);
        });
        
        if (data.special.link) {
          const linkRow = document.createElement('a');
          linkRow.href = data.special.link;
          linkRow.className = 'inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline mt-3';
          linkRow.innerHTML = `${data.special.linkText || 'View All'} <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
          rows.appendChild(linkRow);
        }
        
        sp.appendChild(rows);
        box.appendChild(sp);
      }

      return box;
    }

    // 5. LEGACY & EDUCATION
    render_legacy(data) {
      const box = el('div', 'sketch-border p-5 bg-white dark:bg-slate-800/50 shadow-lg space-y-5 border-dashed');
      (data.items || []).forEach(item => {
        const row = el('div', `flex items-center gap-3 ${item.divider ? 'border-b border-dashed dark:border-slate-700 pb-3' : ''} hover:bg-slate-50 dark:hover:bg-slate-800 p-2 transition-colors rounded-lg`);
        const iconBox = el('div', `p-2 ${item.iconBoxClass || 'bg-rose-50 dark:bg-rose-950/20'} rounded-xl border`);
        const img = document.createElement('img');
        img.src = item.img;
        img.alt = item.title;
        img.className = 'w-6 h-6';
        iconBox.appendChild(img);
        row.appendChild(iconBox);

        const txt = el('div');
        txt.appendChild(el('h5', 'font-bold text-sm dark:text-slate-200', item.title));
        txt.appendChild(el('p', 'text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tight', item.meta));
        row.appendChild(txt);
        box.appendChild(row);
      });

      if (data.link) {
        const linkEl = document.createElement('a');
        linkEl.href = data.link;
        linkEl.className = 'inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline mt-3';
        linkEl.innerHTML = `${data.linkText || 'View More'} <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
        box.appendChild(linkEl);
      }

      return box;
    }

    // 6. QUICK NAVIGATION LINKS
    render_links(data) {
      const box = el('div', 'space-y-3');
      (data.items || []).forEach(item => {
        const card = el('div', `sketch-border-sm p-4 ${item.cardClass || 'bg-white dark:bg-slate-800/50'} relative card-hover cursor-pointer`);
        
        const head = el('div', 'flex items-center gap-3 mb-2');
        if (item.icon) {
          const iconWrap = el('div', 'p-2 rounded-lg bg-white/50 dark:bg-slate-700/50');
          iconWrap.appendChild(this.buildIcon(item.icon));
          head.appendChild(iconWrap);
        }
        const txt = el('div', 'flex-1');
        txt.appendChild(el('h4', 'font-bold text-sm dark:text-slate-200', item.title));
        txt.appendChild(el('p', 'text-[10px] text-slate-500 dark:text-slate-400', item.meta));
        head.appendChild(txt);
        card.appendChild(head);

        if (item.link) {
          const linkBtn = document.createElement('a');
          linkBtn.href = item.link;
          linkBtn.className = 'inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline mt-2';
          linkBtn.innerHTML = `${item.linkText || 'View'} <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
          card.appendChild(linkBtn);
        }

        box.appendChild(card);
      });
      return box;
    }

    // 7. CAREER STATS
    render_stats(data) {
      const grid = el('div', 'grid grid-cols-2 gap-4');
      (data.items || []).forEach(item => {
        const card = el('div', `sketch-border-sm p-4 ${item.cardClass || 'bg-white dark:bg-slate-800/50'} text-center card-hover`);
        
        if (item.icon) {
          const iconWrap = el('div', 'flex justify-center mb-2');
          iconWrap.appendChild(this.buildIcon(item.icon));
          card.appendChild(iconWrap);
        }
        
        card.appendChild(el('div', 'text-2xl font-bold dark:text-white', item.value));
        card.appendChild(el('div', 'text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tight', item.label));
        
        grid.appendChild(card);
      });
      return grid;
    }

    // ----- shared icon builder (img or svg) -----
    buildIcon(icon) {
      if (!icon) return el('span');
      if (icon.type === 'img') {
        const img = document.createElement('img');
        img.src = icon.src;
        img.alt = icon.text || '';
        img.className = icon.class || 'w-8 h-8';
        img.loading = 'lazy';
        return img;
      }
      if (icon.type === 'svg') {
        const attrs = Object.assign({}, icon);
        delete attrs.type;
        delete attrs.color;
        delete attrs.paths;
        return svgEl(attrs, icon.paths || []);
      }
      return el('span');
    }

    // ----- CTA -----
    buildCTA() {
      const cta = this.data.cta || {};
      const section = el('section', 'text-center pt-8');
      const box = el('div', 'inline-block sketch-border p-6 bg-blue-600 text-white rotate-1 hover:rotate-0 transition-transform shadow-xl');
      box.appendChild(el('h3', 'marker-font text-2xl mb-3', cta.title || ''));
      box.appendChild(el('p', 'text-xs mb-4 opacity-90', cta.subtitle || ''));

      const mail = document.createElement('a');
      mail.href = cta.email || '__CONTACT_EMAIL__';
      mail.className = 'bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 hover:text-black transition-colors inline-block';
      mail.textContent = cta.label || 'EMAIL ME @ MAHESH';
      box.appendChild(mail);

      section.appendChild(box);
      return section;
    }

    // ----- footer doodle -----
    buildFooter() {
      const f = this.data.footer || {};
      const row = el('div', 'mt-20 flex justify-between items-end opacity-40 pointer-events-none pb-10');
      row.appendChild(el('div', 'hand-font text-4xl transform -rotate-6', f.left || ''));

      const col = el('div', 'flex flex-col items-center');
      col.appendChild(svgEl({
        class: 'w-16 h-16 animate-pulse text-blue-600',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1'
      }, [
        {
          type: 'path',
          attrs: { 'stroke-width': '2', 'stroke-linecap': 'round' },
          d: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707'
        }
      ]));
      col.appendChild(el('div', 'text-[10px] font-black mt-2 tracking-widest uppercase', f.right || ''));
      row.appendChild(col);
      return row;
    }
  }

  // ============================================================
  // ComponentRegistry — mounts any [data-infographic-group]
  // ============================================================
  const registry = {
    mountInfographic() {
      document.querySelectorAll('[data-infographic-group]').forEach((host) => {
        if (host._infographicComponent) return;
        const options = {
          src: host.getAttribute('data-src') || 'data/infographic.json'
        };
        host._infographicComponent = new InfographicSection(host, options);
      });
    }
  };

  // ----- exposure for other scripts (optional API) -----
  window.InfographicSection = InfographicSection;
  window.InfographicComponentRegistry = registry;

  // ----- auto-init once DOM ready (idempotent) -----
  function init() {
    registry.mountInfographic();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();