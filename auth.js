/**
 * auth.js — login, sesi, dan proteksi halaman berdasarkan role
 */
const Auth = {
    getUser() {
        try { return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER) || "null"); }
        catch { return null; }
    },

    getToken() { return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN) || ""; },

    isLoggedIn() { return !!Auth.getToken() && !!Auth.getUser(); },

    hasRole(...roles) {
        const user = Auth.getUser();
        return !!user && roles.includes(user.role);
    },

    async login(username, password) {
        const result = await Api.login(username, password);
        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, result.token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(result.user));
        return result.user;
    },

    logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
        window.location.href = "index.html";
    },

    /** Panggil di awal setiap halaman terproteksi */
    guard(allowedRoles = null) {
        if (!Auth.isLoggedIn()) {
            window.location.href = "index.html";
            return false;
        }
        if (allowedRoles && !Auth.hasRole(...allowedRoles)) {
            Utils.toast("Anda tidak memiliki akses ke halaman ini", "error");
            window.location.href = "dashboard.html";
            return false;
        }
        return true;
    },

    renderUserBadge() {
        const user = Auth.getUser();
        if (!user) return;
        Utils.qsa(".current-user-name").forEach(el => el.textContent = user.name);
        Utils.qsa(".current-user-role").forEach(el => el.textContent = user.role);
        Utils.qsa(".current-user-initial").forEach(el => el.textContent = (user.name || "?").charAt(0).toUpperCase());
        // Sembunyikan elemen yang butuh role tertentu
        Utils.qsa("[data-role]").forEach(el => {
            const roles = el.dataset.role.split(",").map(r => r.trim());
            if (!roles.includes(user.role)) el.style.display = "none";
        });
    }
};
