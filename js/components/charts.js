// ============================================================
// ChartsSection component
// ------------------------------------------------------------
// Renders hand-drawn SVG charts (donut / hbar / bar) from data:
//   { title, subtitle, charts: [{ id, type, title, note,
//                                  center, centerLabel,
//                                  data: [{ label, value, color }] }] }
//
// Usage:
//   <div data-charts-group
//        data-src="data/charts.json"></div>
//
// Cards use the site's sketch / tilt-3d styling so they match the
// career-roadmap and infographic pages. Auto-instantiates via the
// component registry below.
// ============================================================
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';

  // ----- small helpers -----
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function svgEl(attrs, children) {
    const svg = document.createElementNS(NS, 'svg');
    Object.keys(attrs || {}).forEach(k => svg.setAttribute(k, attrs[k]));
    (children || []).forEach(c => svg.appendChild(c));
    return svg;
  }

  function svgNode(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(k => n.setAttribute(k, attrs[k]));
    return n;
  }

  // Round caps + a soft jitter give the sketchy "hand-drawn" feel
  function barPath(x, y, w, h, r) {
    return `M ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  }

  // ============================================================
  // ChartsSection
  // ============================================================
  class ChartsSection {
    constructor(host, options) {
      this.host = host;
      this.src = options.src || 'data/charts.json';
      this.data = null;

      this.load();
    }

    async load() {
      try {
        const res = await fetch(this.src, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load ${this.src}: ${res.status}`);
        this.data = await res.json();
        this.render();
      } catch (err) {
        console.warn('[ChartsSection] Unable to load charts', err);
        this.host.innerHTML = '<div class="text-sm text-slate-500">Unable to load charts.</div>';
      }
    }

    render() {
      this.host.innerHTML = '';

      const wrap = el('div', 'relative [perspective:1500px]');

      // header
      const holder = el('div', 'text-center mb-14');
      if (this.data.title) {
        holder.appendChild(el('h2', 'section-header marker-font text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-3d', this.data.title));
      }
      if (this.data.subtitle) {
        holder.appendChild(el('p', 'hand-font text-xl md:text-2xl text-slate-600 dark:text-slate-400 mt-3', this.data.subtitle));
      }
      wrap.appendChild(holder);

      // grid of chart cards
      const grid = el('div', 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8');
      (this.data.charts || []).forEach(chart => grid.appendChild(this.buildCard(chart)));
      wrap.appendChild(grid);

      this.host.appendChild(wrap);

      document.dispatchEvent(new CustomEvent('charts:loaded', { detail: this.host }));
      console.log('[ChartsSection] rendered', (this.data.charts || []).length, 'charts');
    }

    buildCard(chart) {
      const card = el('div', 'sketch-border p-6 bg-white dark:bg-slate-800/50 relative card-hover tilt-3d gloss-edge flex flex-col h-full');

      card.appendChild(el('h3', 'marker-font text-2xl font-bold mb-1 dark:text-slate-100', chart.title));

      const body = el('div', 'flex-grow flex flex-col justify-center mt-4');

      if (chart.type === 'donut') {
        body.appendChild(this.buildDonut(chart));
      } else if (chart.type === 'hbar') {
        body.appendChild(this.buildHBar(chart));
      } else {
        body.appendChild(this.buildBar(chart));
      }

      if (chart.note) {
        card.appendChild(el('p', 'hand-font text-sm text-slate-500 dark:text-slate-400 mt-4 text-center', chart.note));
      }

      card.appendChild(body);
      return card;
    }

    // ---------- DONUT ----------
    buildDonut(chart) {
      const box = el('div', 'flex flex-col items-center gap-6');

      const total = (chart.data || []).reduce((s, d) => s + d.value, 0);
      const r = 72;
      const C = 2 * Math.PI * r;
      const gap = 4;

      const svg = svgEl({
        viewBox: '0 0 200 200',
        class: 'w-44 h-44 -rotate-3'
      }, []);

      let offset = 0;
      (chart.data || []).forEach(d => {
        const len = Math.max((d.value / total) * C - gap, 1);
        const c = svgNode('circle', {
          cx: '100', cy: '100', r: String(r),
          fill: 'none',
          stroke: d.color,
          'stroke-width': '26',
          'stroke-linecap': 'round',
          'stroke-dasharray': `${len.toFixed(1)} ${(C - len).toFixed(1)}`,
          'stroke-dashoffset': String(-offset)
        });
        svg.appendChild(c);
        offset += len + gap;
      });

      // center total
      const center = svgNode('text', {
        x: '100', y: '92',
        'text-anchor': 'middle',
        class: 'marker-font chart-center-total',
        style: 'font-size:34px;font-weight:700;fill:var(--text)'
      });
      center.textContent = chart.center || String(total);
      svg.appendChild(center);

      const label = svgNode('text', {
        x: '100', y: '116',
        'text-anchor': 'middle',
        class: 'hand-font',
        style: 'font-size:14px;fill:var(--muted)'
      });
      label.textContent = chart.centerLabel || 'total';
      svg.appendChild(label);

      box.appendChild(svg);

      // legend
      const legend = el('ul', 'space-y-1.5 text-sm w-full');
      (chart.data || []).forEach(d => {
        const li = el('li', 'flex items-center gap-2');
        const dot = el('span', 'w-3 h-3 rounded-full inline-block', '');
        dot.style.background = d.color;
        li.appendChild(dot);
        li.appendChild(el('span', 'flex-1 dark:text-slate-300', d.label));
        li.appendChild(el('span', 'font-bold dark:text-slate-200', String(d.value)));
        legend.appendChild(li);
      });
      box.appendChild(legend);

      return box;
    }

    // ---------- HORIZONTAL BARS ----------
    buildHBar(chart) {
      const box = el('div', 'space-y-4');
      const max = Math.max(...(chart.data || []).map(d => d.value), 1);
      const W = 280, H = 18, R = 9;

      (chart.data || []).forEach(d => {
        const row = el('div');
        const head = el('div', 'flex justify-between text-sm mb-1');
        head.appendChild(el('span', 'dark:text-slate-300', d.label));
        head.appendChild(el('span', 'font-bold dark:text-slate-200', String(d.value)));
        row.appendChild(head);

        const w = Math.max((d.value / max) * W, 6);
        const svg = svgEl({
          viewBox: `0 0 ${W} ${H}`,
          class: 'w-full h-auto'
        }, []);
        // track
        const track = svgNode('rect', {
          x: '0', y: String(H / 2 - 7), width: String(W), height: '14',
          rx: '7', fill: 'var(--muted)', opacity: '0.15'
        });
        svg.appendChild(track);
        // fill
        const fill = svgNode('path', {
          d: barPath(0, H / 2 - 7, w, 14, R),
          fill: d.color, stroke: d.color,
          'stroke-width': '1.5', 'stroke-linecap': 'round'
        });
        svg.appendChild(fill);
        row.appendChild(svg);
        box.appendChild(row);
      });

      return box;
    }

    // ---------- VERTICAL BARS ----------
    buildBar(chart) {
      const box = el('div');
      const max = Math.max(...(chart.data || []).map(d => d.value), 1);
      const W = 300, H = 170, baseY = 150, topY = 26;
      const n = (chart.data || []).length;
      const slot = W / n;
      const barW = Math.min(slot * 0.5, 52);

      const svg = svgEl({ viewBox: `0 0 ${W} ${H}`, class: 'w-full h-auto' }, []);

      // baseline
      const base = svgNode('line', {
        x1: '10', y1: String(baseY), x2: String(W - 10), y2: String(baseY),
        stroke: 'var(--muted)', 'stroke-width': '2', 'stroke-linecap': 'round', opacity: '0.4'
      });
      svg.appendChild(base);

      (chart.data || []).forEach((d, i) => {
        const h = Math.max(((d.value / max) * (baseY - topY)), 6);
        const x = i * slot + (slot - barW) / 2 + 6;
        const y = baseY - h;
        const tilt = (i % 2 === 0 ? -1.5 : 1.5) + 'deg';

        const fill = svgNode('path', {
          d: barPath(x, y, barW, h, 8),
          fill: d.color, stroke: d.color,
          'stroke-width': '1.5', 'stroke-linecap': 'round',
          transform: `rotate(${tilt} ${x + barW / 2} ${baseY})`
        });
        svg.appendChild(fill);

        // value
        const val = svgNode('text', {
          x: String(x + barW / 2), y: String(y - 8),
          'text-anchor': 'middle',
          style: 'font-size:13px;font-weight:700;fill:var(--text)'
        });
        val.textContent = String(d.value);
        svg.appendChild(val);

        // label
        const lbl = svgNode('text', {
          x: String(x + barW / 2), y: String(baseY + 20),
          'text-anchor': 'middle',
          class: 'hand-font',
          style: 'font-size:12px;fill:var(--muted)'
        });
        lbl.textContent = d.label;
        svg.appendChild(lbl);
      });

      box.appendChild(svg);
      return box;
    }
  }

  // ============================================================
  // ComponentRegistry — mounts any [data-charts-group]
  // ============================================================
  const registry = {
    mountCharts() {
      document.querySelectorAll('[data-charts-group]').forEach((host) => {
        if (host._chartsComponent) return;
        const options = {
          src: host.getAttribute('data-src') || 'data/charts.json'
        };
        host._chartsComponent = new ChartsSection(host, options);
      });
    }
  };

  // ----- exposure for other scripts (optional API) -----
  window.ChartsSection = ChartsSection;
  window.ChartsComponentRegistry = registry;

  // ----- auto-init once DOM ready (idempotent) -----
  function init() {
    registry.mountCharts();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
