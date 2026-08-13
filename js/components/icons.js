// Shared Icons8 icons used across the site (single icon dependency).
//   style "3d-fluency" = glossy 3D icons (UI / general icons)
//   style "color"      = colorful brand / technology logos (3D style has none)
// Every URL below was verified to resolve (200) on the Icons8 CDN.
(function () {
  'use strict';

  // 3D-fluency icon: https://img.icons8.com/3d-fluency/{size}/{name}.png
  function i8d(name, size) {
    const s = size || 96;
    return `<img class="i8" src="https://img.icons8.com/3d-fluency/${s}/${name}.png" alt="" loading="lazy">`;
  }

  // Colorful brand / technology logo: https://img.icons8.com/color/{size}/{name}.png
  function i8c(name, size) {
    const s = size || 96;
    return `<img class="i8" src="https://img.icons8.com/color/${s}/${name}.png" alt="" loading="lazy">`;
  }

  window.I8D = i8d;
  window.I8C = i8c;

  window.SITE_ICONS = {
    linkedin: i8d('linkedin', 96),
    github: i8d('github', 96),
    download: i8d('download', 96),
    email: i8d('email', 96),
    home: i8d('home', 96),
    sun: '<img id="icon-sun" class="i8" src="https://img.icons8.com/3d-fluency/96/sun.png" alt="" loading="lazy">',
    moon: '<img id="icon-moon" class="i8 hidden" src="https://img.icons8.com/3d-fluency/96/crescent-moon.png" alt="" loading="lazy">',
    menu: i8d('menu', 96),
  };
})();