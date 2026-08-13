// Header component — injects the site header into #site-header.
// No fetch() and no inline <style>; markup is plain JS and styles come
// from css/components.css, so it renders on file:// and always styles correctly.
(function () {
  const ICONS = window.SITE_ICONS;
  const { mount, onReady } = window.SiteComponents;

  const NAV_LINKS = [
    { href: 'index.html', label: 'Home', icon: ICONS.home },
    { href: 'index.html#about', label: 'About' },
    { href: 'index.html#skills', label: 'Skills' },
    { href: 'projects.html', label: 'Projects' },
    { href: 'gallery.html', label: 'Gallery' },
    { href: 'infographic.html', label: 'Infographic' },
    { href: 'career-roadmap.html', label: 'Career Roadmap' },
    { href: 'site-roadmap.html', label: 'Site Roadmap' },
    { href: 'index.html#contact', label: 'Contact' },
  ];

  const SOCIAL_LINKS = [
    {
      href: 'https://www.linkedin.com/in/mahesh-narsale',
      label: 'LinkedIn',
      icon: ICONS.linkedin,
      external: true,
    },
    {
      href: 'https://github.com/maheshndev',
      label: 'GitHub',
      icon: ICONS.github,
      external: true,
    },
    {
      href: 'assets/resume/Mahesh-Narsale-Resume.pdf',
      label: 'Resume',
      icon: ICONS.download,
      download: true,
    },
  ];

  const renderNav = () =>
    NAV_LINKS.map(
      (l) => `<a href="${l.href}" aria-label="${l.label}">${l.icon || ''}${l.label}</a>`
    ).join('\n      ');

  const renderSocial = (withLabel) =>
    SOCIAL_LINKS.map((l) => {
      const attrs = [
        `href="${l.href}"`,
        l.external ? 'target="_blank" rel="noopener"' : '',
        l.download ? 'download' : '',
        withLabel ? `aria-label="${l.label}" class="site-header-icon-btn"` : `aria-label="${l.label}"`,
      ]
        .filter(Boolean)
        .join(' ');
      const label = withLabel ? `<span class="site-header-icon-label">${l.label}</span>` : ` ${l.label}`;
      return `<a ${attrs}>${l.icon}${label}</a>`;
    }).join('\n        ');

  const HEADER_HTML = `
<header class="site-header">
  <div class="site-header-inner">
    <a href="index.html" class="site-header-brand" aria-label="Home">
      <img src="https://avatars.githubusercontent.com/maheshndev" alt="Mahesh Narsale" onerror="this.style.display='none'">
      <span class="site-header-brand-text">
        <span class="site-header-brand-name">Mahesh Narsale</span>
        <span class="site-header-brand-sub">Full Stack Developer</span>
      </span>
    </a>

    <nav class="site-header-nav" aria-label="Primary">
      ${renderNav()}
    </nav>

    <div class="site-header-actions">
      <div class="site-header-socials">
        ${renderSocial(true)}
      </div>

      <button id="theme-toggle" aria-label="Toggle theme" type="button" class="site-header-icon-btn">
        ${ICONS.sun}
        ${ICONS.moon}
      </button>

      <button id="mobile-menu-btn" class="site-header-menu-btn" aria-label="Menu">
        ${ICONS.menu}
      </button>
    </div>
  </div>

  <div id="mobile-menu" class="site-header-mobile-menu hidden">
    ${NAV_LINKS.map((l) => `<a class="site-header-mobile-link" href="${l.href}">${l.label}</a>`).join('\n    ')}
    <div class="site-header-mobile-socials">
      ${renderSocial(false)}
    </div>
  </div>
</header>`;

  function mountHeader() {
    mount('site-header', HEADER_HTML, 'data-header-mounted');
  }

  window.mountSiteHeader = mountHeader;
  onReady(mountHeader);
})();
