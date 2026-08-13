// ============================================================
// GallerySection component
// ------------------------------------------------------------
// Renders an image gallery grid from JSON with a lightbox modal.
//
// Usage:
//   <div data-gallery-group
//        data-src="data/gallery.json"></div>
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

  // ============================================================
  // GallerySection
  // ============================================================
  class GallerySection {
    constructor(host, options) {
      this.host = host;
      this.src = options.src || 'data/gallery.json';
      this.items = [];

      this.renderShell();
      this.load();
    }

    renderShell() {
      this.grid = el('div', 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 [perspective:1400px]');
      this.grid.setAttribute('aria-live', 'polite');
      this.host.appendChild(this.grid);
    }

    async load() {
      try {
        const res = await fetch(this.src, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load ${this.src}: ${res.status}`);
        const data = await res.json();
        this.items = Array.isArray(data.gallery) ? data.gallery : [];
        this.render();
      } catch (err) {
        console.warn('[GallerySection] Unable to load gallery', err);
        this.grid.innerHTML = '<div class="text-sm text-slate-500 col-span-full">Unable to load gallery.</div>';
      }
    }

    render() {
      const fragment = document.createDocumentFragment();
      this.items.forEach(item => fragment.appendChild(this.buildItem(item)));
      this.grid.innerHTML = '';
      this.grid.appendChild(fragment);
      console.log('[GallerySection] rendered', this.items.length, 'items');
    }

    buildItem(item) {
      const box = el(
        'div',
        'gallery-item group relative aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer tilt-3d preserve-3d'
      );
      box.setAttribute('tabindex', '0');
      box.setAttribute('role', 'button');
      box.setAttribute('aria-label', `Open ${item.title}`);

      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title;
      img.loading = 'lazy';
      img.className = 'w-full h-full object-cover';
      box.appendChild(img);

      const overlay = el(
        'div',
        'gallery-overlay absolute inset-0 flex flex-col items-center justify-center p-6 text-center'
      );
      overlay.appendChild(el('span', 'text-white font-bold text-lg mb-2', item.title));
      if (item.subtitle) overlay.appendChild(el('span', 'text-slate-300 text-sm', item.subtitle));
      const zoomWrap = el('div', 'mt-4 p-2 rounded-full bg-white/20 backdrop-blur-md');
      const zoom = document.createElement('img');
      zoom.className = 'i8 w-6 h-6';
      zoom.src = 'https://img.icons8.com/3d-fluency/96/search.png';
      zoom.alt = '';
      zoom.loading = 'lazy';
      zoomWrap.appendChild(zoom);
      overlay.appendChild(zoomWrap);
      box.appendChild(overlay);

      const open = () => this.openModal(item);
      box.addEventListener('click', open);
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });

      return box;
    }

    openModal(item) {
      this.closeModal();
      const modal = el('div', 'fixed inset-0 z-50 flex items-center justify-center p-4');
      modal.setAttribute('aria-hidden', 'false');
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', item.title);

      const backdrop = el('div', 'absolute inset-0 bg-black/70 backdrop-blur-sm');
      backdrop.addEventListener('click', () => this.closeModal());
      modal.appendChild(backdrop);

      const content = el(
        'div',
        'relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl [transform-style:preserve-3d] animate-[modalPop_0.3s_ease-out]'
      );

      const closeBtn = el('button', 'absolute top-4 right-4 z-10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg text-sm p-1.5');
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.innerHTML =
        '<img class="i8 w-5 h-5" src="https://img.icons8.com/3d-fluency/96/cancel.png" alt="" loading="lazy">';
      closeBtn.addEventListener('click', () => this.closeModal());
      content.appendChild(closeBtn);

      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title;
      img.className = 'w-full h-auto';
      content.appendChild(img);

      const body = el('div', 'p-6');
      body.appendChild(el('h3', 'text-xl font-bold dark:text-white', item.title));
      if (item.modalDescription) {
        body.appendChild(el('p', 'text-slate-500 dark:text-slate-400 mt-2', item.modalDescription));
      }
      content.appendChild(body);

      modal.appendChild(content);
      document.body.appendChild(modal);
      this._onKeydown = (e) => { if (e.key === 'Escape') this.closeModal(); };
      document.addEventListener('keydown', this._onKeydown);
      document.body.style.overflow = 'hidden';
    }

    closeModal() {
      const modal = document.body.querySelector('.fixed.inset-0.z-50');
      if (modal) modal.remove();
      if (this._onKeydown) {
        document.removeEventListener('keydown', this._onKeydown);
        this._onKeydown = null;
      }
      document.body.style.overflow = '';
    }
  }

  // ============================================================
  // ComponentRegistry — mounts any [data-gallery-group]
  // ============================================================
  const registry = {
    mountGallery() {
      document.querySelectorAll('[data-gallery-group]').forEach((host) => {
        if (host._galleryComponent) return;
        const options = {
          src: host.getAttribute('data-src') || 'data/gallery.json'
        };
        host._galleryComponent = new GallerySection(host, options);
      });
    }
  };

  // ----- exposure for other scripts (optional API) -----
  window.GallerySection = GallerySection;
  window.GalleryComponentRegistry = registry;

  // ----- auto-init once DOM ready (idempotent) -----
  function init() {
    registry.mountGallery();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();