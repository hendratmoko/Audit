/**
 * app.js — inisialisasi shell aplikasi (sidebar, navbar, tema, layout)
 * Panggil App.initShell() di setiap halaman setelah Auth.guard()
 */
const App = {
    initShell() {
        Auth.renderUserBadge();
        App.applyTheme(localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || "light");
        App.bindShellEvents();
        App.highlightActiveNav();
        App.setBranding();
        Api.updateQueueBadge();
        window.addEventListener("online", () => Api.syncQueue());
        // Coba sinkronisasi otomatis saat halaman dibuka jika online
        if (navigator.onLine) Api.syncQueue();
    },

    setBranding() {
        Utils.qsa(".app-name").forEach(el => el.textContent = CONFIG.APP_NAME);
        Utils.qsa(".app-subtitle").forEach(el => el.textContent = CONFIG.APP_SUBTITLE);
        Utils.qsa(".school-name").forEach(el => el.textContent = CONFIG.SCHOOL_NAME);
    },

    bindShellEvents() {
        const hamburger = document.getElementById("hamburgerBtn");
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("sidebarOverlay");
        if (hamburger && sidebar) {
            hamburger.addEventListener("click", () => {
                sidebar.classList.toggle("open");
                overlay?.classList.toggle("show");
            });
        }
        overlay?.addEventListener("click", () => {
            sidebar?.classList.remove("open");
            overlay.classList.remove("show");
        });

        document.getElementById("themeToggle")?.addEventListener("click", () => {
            const current = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || "light";
            App.applyTheme(current === "light" ? "dark" : "light");
        });

        document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
            e.preventDefault();
            if (Utils.confirmDialog("Keluar dari aplikasi?")) Auth.logout();
        });

        document.getElementById("syncBadge")?.addEventListener("click", () => Api.syncQueue());

        // Submenu toggle (untuk sidebar bertingkat)
        Utils.qsa(".nav-group-toggle").forEach(el => {
            el.addEventListener("click", () => {
                el.parentElement.classList.toggle("open");
            });
        });

        // Global search
        const globalSearch = document.getElementById("globalSearch");
        if (globalSearch) {
            globalSearch.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && globalSearch.value.trim()) {
                    window.location.href = `hasil.html?q=${encodeURIComponent(globalSearch.value.trim())}`;
                }
            });
        }
    },

    applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
        const icon = document.getElementById("themeIcon");
        if (icon) icon.textContent = theme === "dark" ? "☀" : "🌙";
    },

    highlightActiveNav() {
        const page = window.location.pathname.split("/").pop() || "dashboard.html";
        Utils.qsa(".nav-link").forEach(link => {
            const href = link.getAttribute("href");
            if (href === page) {
                link.classList.add("active");
                const group = link.closest(".nav-group");
                if (group) group.classList.add("open");
            }
        });
    },

    // Ambil parameter query string
    getQueryParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    }
};
