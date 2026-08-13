// ----- Page logic for the Interactive Infographic page
// Infographic content is rendered by js/components/infographic.js (async).
// Mobile menu / theme toggle are wired centrally in js/includes.js.

// Reveal animation for sketched cards (runs once the component renders)
(function createRevealObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100');
        entry.target.style.removeProperty('transform');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  function observe() {
    document.querySelectorAll('.sketch-border').forEach(el => {
      el.classList.add('opacity-0', 'transition-all', 'duration-1000', 'ease-out');
      el.style.transform = 'translateY(30px) rotate(2deg)';
      observer.observe(el);
    });
  }

  // Trigger once the component has injected the roadmap, or immediately if present
  function start() { observe(); }

  if (document.querySelector('[data-infographic-group]') && document.querySelector('.sketch-border')) {
    start();
  } else {
    document.addEventListener('infographic:loaded', start, { once: true });
  }
})();