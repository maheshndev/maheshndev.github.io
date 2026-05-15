// ----- Theme & Menu Logic
        const themeToggle = document.getElementById('theme-toggle');
        const iconSun = document.getElementById('icon-sun');
        const iconMoon = document.getElementById('icon-moon');
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        function setIcons(isDark) {
            if (isDark) { iconMoon.classList.remove('hidden'); iconSun.classList.add('hidden'); }
            else { iconSun.classList.remove('hidden'); iconMoon.classList.add('hidden'); }
        }
        (function initTheme() {
            const saved = localStorage.getItem('theme');
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const dark = saved ? saved === 'dark' : prefersDark;
            document.documentElement.classList.toggle('dark', dark);
            setIcons(dark);
        })();
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            setIcons(isDark);
        });
        mobileBtn?.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Intersection Observer for reveal animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100');
                    entry.target.style.transform = 'translateY(0) rotate(0deg)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.level-card, .section-header').forEach((el, index) => {
            el.classList.add('opacity-0', 'transition-all', 'duration-700', 'ease-out');
            el.style.transform = `translateY(40px) rotate(${index % 2 === 0 ? '2' : '-2'}deg)`;
            observer.observe(el);
        });