// Theme Toggle & Persistence (Default: Warm Editorial Linen / Light)
(function () {
    const savedTheme = localStorage.getItem('kl-portfolio-theme-v3') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    function initThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;

        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('kl-portfolio-theme-v3', newTheme);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeToggle);
    } else {
        initThemeToggle();
    }
})();
