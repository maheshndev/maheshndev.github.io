// Filtering — wired to the projects component once it has loaded data
const filters = document.querySelectorAll('.filter-btn');

function wireProjectFilters() {
  const comp = document.querySelector('[data-projects-group]');
  const instance = comp && comp._projectsComponent;
  if (!instance) return false;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      instance.setFilter(btn.getAttribute('data-filter'));
    });
  });
  return true;
}

// Try immediately; retry after includes load / component init
if (!wireProjectFilters()) {
  document.addEventListener('includes:loaded', () => setTimeout(wireProjectFilters, 50));
}
