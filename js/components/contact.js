// ============================================================
// ContactSection component
// ------------------------------------------------------------
// Renders the "Get In Touch" contact card (heading, email/phone
// links, contact form) from JSON. Keeps the form ids used by
// js/contact.js so form submission keeps working.
//
// Usage:
//   <div data-contact-group
//        data-src="data/contact.json"></div>
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

  const INPUT_CLASS =
    'mt-1 block w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-accent-500 focus:ring-accent-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white placeholder-slate-400';

  // ============================================================
  // ContactSection
  // ============================================================
  class ContactSection {
    constructor(host, options) {
      this.host = host;
      this.src = options.src || 'data/contact.json';
      this.data = null;

      this.renderShell();
      this.load();
    }

    renderShell() {
      // decorative background blobs
      const blob1 = el('div', 'absolute -top-24 -right-24 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl');
      const blob2 = el('div', 'absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl');
      this.host.appendChild(blob1);
      this.host.appendChild(blob2);

      this.body = el('div', 'relative z-10');
      this.host.appendChild(this.body);
    }

    async load() {
      try {
        const res = await fetch(this.src, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load ${this.src}: ${res.status}`);
        const json = await res.json();
        this.data = json.contact || {};
        this.render();
      } catch (err) {
        console.warn('[ContactSection] Unable to load contact data', err);
      }
    }

    render() {
      const c = this.data;
      const top = el('div', 'text-center mb-8');
      top.appendChild(el('h2', 'text-3xl font-extrabold text-gradient inline-block', c.title || 'Get In Touch'));
      if (c.subtitle) {
        top.appendChild(el('p', 'mt-4 text-slate-600 dark:text-slate-400 max-w-xl mx-auto', c.subtitle));
      }

      const links = el('div', 'mt-4 flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-700 dark:text-slate-300');
      if (c.email) {
        const mail = el('a', 'hover:text-accent-600 flex items-center gap-2', c.email);
        mail.setAttribute('href', `mailto:${c.email}`);
        mail.insertBefore(this.mailIcon(), mail.firstChild);
        links.appendChild(mail);
      }
      if (c.phone) {
        const phone = el('a', 'hover:text-accent-600 flex items-center gap-2', c.phone);
        phone.setAttribute('href', `tel:${c.phone}`);
        phone.insertBefore(this.phoneIcon(), phone.firstChild);
        links.appendChild(phone);
      }
      top.appendChild(links);
      this.body.appendChild(top);

      this.body.appendChild(this.buildForm(c.form || {}));
    }

    mailIcon() {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'w-4 h-4');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('viewBox', '0 0 24 24');
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
      p.setAttribute('stroke-width', '2');
      p.setAttribute('d', 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z');
      svg.appendChild(p);
      return svg;
    }

    phoneIcon() {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'w-4 h-4');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('viewBox', '0 0 24 24');
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
      p.setAttribute('stroke-width', '2');
      p.setAttribute('d', 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z');
      svg.appendChild(p);
      return svg;
    }

    buildForm(f) {
      const wrap = el('div', 'flex justify-center pt-4');
      const form = el('form', 'w-full max-w-md space-y-4 text-left');
      form.id = 'contact-form';

      // Name
      form.appendChild(this.field('name', 'text', f.nameLabel || 'Name', f.namePlaceholder || 'John Doe', true));
      // Email
      form.appendChild(this.field('email', 'email', f.emailLabel || 'Email', f.emailPlaceholder || 'john@example.com', true));
      // Message
      const msgWrap = el('div');
      const msgLabel = el('label', 'block text-sm font-medium text-slate-700 dark:text-slate-300', f.messageLabel || 'Message');
      msgLabel.setAttribute('for', 'message');
      msgWrap.appendChild(msgLabel);
      const textarea = el('textarea', INPUT_CLASS, null);
      textarea.id = 'message';
      textarea.name = 'message';
      textarea.rows = 4;
      textarea.required = true;
      textarea.placeholder = f.messagePlaceholder || 'How can we work together?';
      msgWrap.appendChild(textarea);
      form.appendChild(msgWrap);

      // Submit
      const submit = el('button', 'w-full btn-premium flex items-center justify-center gap-2 mt-6', null);
      submit.type = 'submit';
      submit.id = 'submit-button';
      submit.appendChild(this.sendIcon());
      submit.appendChild(document.createTextNode(f.submitText || 'Send Message'));
      form.appendChild(submit);

      const status = el('div', 'text-sm mt-4 text-center hidden font-medium');
      status.id = 'form-status';
      form.appendChild(status);

      wrap.appendChild(form);
      return wrap;
    }

    field(id, type, label, placeholder, required) {
      const wrap = el('div');
      const lbl = el('label', 'block text-sm font-medium text-slate-700 dark:text-slate-300', label);
      lbl.setAttribute('for', id);
      wrap.appendChild(lbl);
      const input = document.createElement('input');
      input.type = type;
      input.id = id;
      input.name = id;
      input.required = required;
      input.placeholder = placeholder;
      input.className = INPUT_CLASS;
      wrap.appendChild(input);
      return wrap;
    }

    sendIcon() {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'w-5 h-5');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('viewBox', '0 0 24 24');
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
      p.setAttribute('stroke-width', '2');
      p.setAttribute('d', 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8');
      svg.appendChild(p);
      return svg;
    }
  }

  // ============================================================
  // ComponentRegistry — mounts any [data-contact-group]
  // ============================================================
  const registry = {
    mountContact() {
      document.querySelectorAll('[data-contact-group]').forEach((host) => {
        if (host._contactComponent) return;
        const options = {
          src: host.getAttribute('data-src') || 'data/contact.json'
        };
        host._contactComponent = new ContactSection(host, options);
      });
    }
  };

  // ----- exposure for other scripts (optional API) -----
  window.ContactSection = ContactSection;
  window.ContactComponentRegistry = registry;

  // ----- auto-init once DOM ready (idempotent) -----
  function init() {
    registry.mountContact();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();