// Tailwind theme extension (accent: purple -> blue -> green).
// Custom animation utilities live in css/animations.css (plain CSS),
// so they work reliably regardless of the Tailwind Play CDN recompiling.
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9'
        },
        brandblue: '#2563eb',
        brandgreen: '#10b981'
      },
      boxShadow: {
        'soft-lg': '0 10px 30px rgba(13, 14, 29, 0.08)',
        'glow-purple':
          '0 0 0 1px rgba(139, 92, 246, 0.22), 0 18px 45px -18px rgba(139, 92, 246, 0.55)'
      }
    }
  }
}