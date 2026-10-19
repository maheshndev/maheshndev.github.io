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

      const backdrop = el('div', 'absolute inset-0 bg-black/80 backdrop-blur-sm');
      backdrop.addEventListener('click', () => this.closeModal());
      modal.appendChild(backdrop);

      const content = el(
        'div',
        'relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl [transform-style:preserve-3d] animate-[modalPop_0.3s_ease-out] flex flex-col'
      );

      const closeBtn = el('button', 'absolute top-4 right-4 z-20 text-slate-400 hover:text-white dark:text-slate-500 dark:hover:text-white rounded-lg text-sm p-1.5');
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.innerHTML =
        '<img class="i8 w-5 h-5" src="https://img.icons8.com/3d-fluency/96/cancel.png" alt="" loading="lazy">';
      closeBtn.addEventListener('click', () => this.closeModal());
      content.appendChild(closeBtn);

      const body = el('div', 'p-6');
      body.appendChild(el('h3', 'text-xl font-bold dark:text-white mb-1', item.title));
      if (item.subtitle) {
        body.appendChild(el('p', 'text-slate-400 dark:text-slate-500 text-sm mb-4', item.subtitle));
      }
      if (item.modalDescription) {
        body.appendChild(el('p', 'text-slate-500 dark:text-slate-400 mb-6', item.modalDescription));
      }
      content.appendChild(body);

      const images = Array.isArray(item.images) && item.images.length > 1 ? item.images : [item.image];
      this._modalImages = images;
      this._modalIdx = 0;

      if (images.length > 1) {
        const carouselWrap = el('div', 'relative w-full bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden mb-6 flex items-center justify-center');
        const imgEl = document.createElement('img');
        imgEl.src = images[0];
        imgEl.alt = item.title;
        imgEl.className = 'max-w-full max-h-[60vh] object-contain';
        imgEl.loading = 'lazy';
        carouselWrap.appendChild(imgEl);

        const setImage = (n) => {
          this._modalIdx = (n + images.length) % images.length;
          imgEl.src = images[this._modalIdx];
          counter.textContent = `${this._modalIdx + 1} / ${images.length}`;
        };

        const prevBtn = el('button', 'absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded-full shadow-lg hover:scale-110 transition-transform', '‹');
        prevBtn.addEventListener('click', (e) => { e.stopPropagation(); setImage(this._modalIdx - 1); });
        const nextBtn = el('button', 'absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded-full shadow-lg hover:scale-110 transition-transform', '›');
        nextBtn.addEventListener('click', (e) => { e.stopPropagation(); setImage(this._modalIdx + 1); });
        carouselWrap.appendChild(prevBtn);
        carouselWrap.appendChild(nextBtn);

        const controls = el('div', 'absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10');
        const counter = el('span', 'text-xs text-slate-500 dark:text-slate-400 font-mono bg-white/20 backdrop-blur px-2 py-1 rounded', `1 / ${images.length}`);
        controls.appendChild(counter);
        carouselWrap.appendChild(controls);

        this._modalImgEl = imgEl;
        this._modalCounter = counter;
        content.appendChild(carouselWrap);
      } else {
        const img = document.createElement('img');
        img.src = images[0];
        img.alt = item.title;
        img.className = 'w-full max-h-[60vh] object-contain mx-auto';
        img.loading = 'lazy';
        content.appendChild(img);
      }

      modal.appendChild(content);
      document.body.appendChild(modal);
      this._onKeydown = (e) => {
        if (e.key === 'Escape') this.closeModal();
        if (this._modalImages && this._modalImages.length > 1) {
          if (e.key === 'ArrowLeft') this._showModalImage(this._modalIdx - 1);
          if (e.key === 'ArrowRight') this._showModalImage(this._modalIdx + 1);
        }
      };
      document.addEventListener('keydown', this._onKeydown);
      document.body.style.overflow = 'hidden';
    }

    _showModalImage(n) {
      if (!this._modalImages || this._modalImages.length === 0) return;
      this._modalIdx = (n + this._modalImages.length) % this._modalImages.length;
      if (this._modalImgEl) this._modalImgEl.src = this._modalImages[this._modalIdx];
      if (this._modalCounter) this._modalCounter.textContent = `${this._modalIdx + 1} / ${this._modalImages.length}`;
    }

    closeModal() {
      const modal = document.body.querySelector('.fixed.inset-0.z-50');
      if (modal) modal.remove();
      if (this._onKeydown) {
        document.removeEventListener('keydown', this._onKeydown);
        this._onKeydown = null;
      }
      this._modalImages = null;
      this._modalIdx = 0;
      this._modalImgEl = null;
      this._modalCounter = null;
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