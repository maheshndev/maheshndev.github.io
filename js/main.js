
// Mobile menu toggle
const menuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

menuBtn?.addEventListener("click", () => {
  mobileMenu?.classList.toggle("hidden");
});

// Dynamic Experience Years
// const experienceStartYear = 2021;
// const currentYear = new Date().getFullYear();
// const experienceYearsEl = document.getElementById("experience-years");
// if (experienceYearsEl) {
//   experienceYearsEl.textContent = `${currentYear - experienceStartYear}+ years`;
// }

// Config: Set your exact starting point
const startMonth = 11; // December (0 = January, 11 = December in JS)
const startYear = 2023;

const experienceYearsEl = document.getElementById("experience-years");

if (experienceYearsEl) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 1. Calculate total month difference
  const totalMonths = (currentYear - startYear) * 12 + (currentMonth - startMonth);
  
  // 2. Convert to whole years
  const exactYears = Math.floor(totalMonths / 12);

  // 3. Fallback to 0 if the start date is somehow in the future
  const displayYears = Math.max(0, exactYears);

  // Update the DOM
  experienceYearsEl.textContent = `${displayYears}+ years`;
}
