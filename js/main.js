
// Mobile menu toggle
const menuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

menuBtn?.addEventListener("click", () => {
  mobileMenu?.classList.toggle("hidden");
});

// Dynamic Experience Years
const experienceStartYear = 2021;
const currentYear = new Date().getFullYear();
const experienceYearsEl = document.getElementById("experience-years");
if (experienceYearsEl) {
  experienceYearsEl.textContent = `${currentYear - experienceStartYear}+ years`;
}
