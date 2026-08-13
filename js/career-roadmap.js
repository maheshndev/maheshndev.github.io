// ----- Page logic for the Roadmap page
// Roadmap content is rendered by js/components/roadmap.js (async).
// Mobile menu / theme toggle are wired centrally in js/includes.js.

// Reveal animation for roadmap elements (runs once the component renders)
(function createRevealObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100');
        entry.target.style.removeProperty('transform');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  function observe() {
    document.querySelectorAll('.level-card, .section-header').forEach((el, index) => {
      el.classList.add('opacity-0', 'transition-all', 'duration-700', 'ease-out');
      el.style.transform = `translateY(40px) rotate(${index % 2 === 0 ? '2' : '-2'}deg)`;
      observer.observe(el);
    });
  }

  // Trigger once the component has injected the roadmap, or immediately if present
  function start() { observe(); }

  if (document.querySelector('[data-roadmap-group]') && document.querySelector('.level-card')) {
    start();
  } else {
    document.addEventListener('roadmap:loaded', start, { once: true });
  }
})();