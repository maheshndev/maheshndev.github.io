// Footer component — injects the site footer into #site-footer.
// No fetch() and no inline Tailwind classes; styles come from css/components.css.
(function () {
  const ICONS = window.SITE_ICONS;
  const { mount, onReady } = window.SiteComponents;

  const FOOTER_LINKS = [
    { href: 'index.html', label: 'Home' },
    { href: 'index.html#about', label: 'About' },
    { href: 'index.html#skills', label: 'Skills' },
    { href: 'projects.html', label: 'Projects' },
    { href: 'gallery.html', label: 'Gallery' },
    { href: 'infographic.html', label: 'Infographic' },
    { href: 'career-roadmap.html', label: 'Career Roadmap' },
    { href: 'site-roadmap.html', label: 'Site Roadmap' },
    { href: 'index.html#contact', label: 'Contact' },
  ];

  const renderLinks = () =>
    FOOTER_LINKS.map((l) => `<a href="${l.href}">${l.label}</a>`).join('\n      ');

  const FOOTER_HTML = `
<footer class="site-footer">
  <div class="site-footer-inner">
    <div class="site-footer-grid">
      <div class="site-footer-info">
        <div class="site-footer-brand text-gradient">Mahesh Narsale</div>
        <p class="site-footer-tagline">Building the next generation of web experience.</p>
        <div class="site-footer-socials">
          <a href="https://www.linkedin.com/in/mahesh-narsale" target="_blank" rel="noopener" aria-label="LinkedIn">${ICONS.linkedin}</a>
          <a href="https://github.com/maheshndev" target="_blank" rel="noopener" aria-label="GitHub">${ICONS.github}</a>
          <a href="mailto:maheshnarasale1@gmail.com" aria-label="Email">${ICONS.email}</a>
        </div>
      </div>
      <nav class="site-footer-links" aria-label="Quick links">
        <div class="site-footer-links-title">Quick Links</div>
        <div class="site-footer-links-list">
          ${renderLinks()}
        </div>
      </nav>
    </div>
    <p class="site-footer-copy">&copy; <span id="year"></span> Mahesh Narsale. All rights reserved.</p>
  </div>
</footer>`;

  function mountFooter() {
    mount('site-footer', FOOTER_HTML, 'data-footer-mounted');
  }

  window.mountSiteFooter = mountFooter;
  onReady(mountFooter);
})();
