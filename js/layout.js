/**
 * layout.js — merender sidebar & topbar yang konsisten di seluruh halaman.
 * Panggil Layout.render(activePage) sebelum App.initShell().
 */
const Layout = {
    nav: [
        { type: "link", href: "dashboard.html", icon: "🏠", label: "Dashboard" },
        {
            type: "group", icon: "📋", label: "Audit", items: [
                { href: "audit.html#baru", label: "Audit Baru" },
                { href: "audit.html#berjalan", label: "Audit Berjalan" },
                { href: "audit.html#riwayat", label: "Riwayat Audit" },
                { href: "audit.html#item", label: "Item Audit" },
                { href: "audit.html#jadwal", label: "Jadwal Audit" }
            ]
        },
        {
            type: "group", icon: "📊", label: "Hasil", items: [
                { href: "hasil.html#dashboard", label: "Dashboard Hasil" },
                { href: "hasil.html#sekolah", label: "Hasil Sekolah" },
                { href: "hasil.html#jurusan", label: "Hasil Jurusan" },
                { href: "hasil.html#bagian", label: "Hasil Bagian" },
                { href: "hasil.html#perbandingan", label: "Perbandingan Jurusan" }
            ]
        },
        {
            type: "group", icon: "⚠", label: "Temuan", items: [
                { href: "temuan.html#daftar", label: "Daftar Temuan" },
                { href: "temuan.html#tindaklanjut", label: "Tindak Lanjut" }
            ]
        },
        {
            type: "group", icon: "📄", label: "Laporan", items: [
                { href: "laporan.html#audit", label: "Laporan Audit" },
                { href: "laporan.html#jurusan", label: "Laporan Jurusan" },
                { href: "laporan.html#rekap", label: "Rekap Sekolah" }
            ]
        },
        {
            type: "group", icon: "⚙", label: "Pengaturan", roles: ["ADMIN", "OPERATOR"], items: [
                { href: "pengaturan.html#jurusan", label: "Jurusan" },
                { href: "pengaturan.html#bagian", label: "Bagian Audit" },
                { href: "pengaturan.html#pengguna", label: "Pengguna" },
                { href: "pengaturan.html#konfigurasi", label: "Konfigurasi" }
            ]
        }
    ],

    render(activeFile) {
        const shell = document.getElementById("appShell");
        if (!shell) return;
        const user = Auth.getUser();

        const navHtml = Layout.nav.map(n => {
            if (n.roles && user && !n.roles.includes(user.role)) return "";
            if (n.type === "link") {
                return `<a class="nav-link" href="${n.href}"><span class="nav-icon">${n.icon}</span>${n.label}</a>`;
            }
            const open = n.items.some(i => i.href.startsWith(activeFile));
            return `<div class="nav-group ${open ? "open" : ""}">
                <div class="nav-link nav-group-toggle"><span><span class="nav-icon">${n.icon}</span>${n.label}</span><span class="chevron">▶</span></div>
                <div class="nav-submenu">
                    ${n.items.map(i => `<a class="nav-link" href="${i.href}" style="padding-left:38px;font-size:13px">${i.label}</a>`).join("")}
                </div>
            </div>`;
        }).join("");

        shell.innerHTML = `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-brand">
                <div class="logo-mark">SA</div>
                <div>
                    <div class="app-name">Sistem Audit Internal</div>
                    <div class="school-name">${Utils.escapeHtml(CONFIG.SCHOOL_NAME)}</div>
                </div>
            </div>
            <nav>${navHtml}</nav>
        </aside>
        <div class="sidebar-overlay" id="sidebarOverlay"></div>
        <div class="main-area">
            <header class="topbar">
                <button class="hamburger-btn" id="hamburgerBtn">☰</button>
                <div class="search-box">
                    <span class="search-icon">🔎</span>
                    <input type="text" id="globalSearch" placeholder="Cari item, temuan, jurusan, auditor...">
                </div>
                <div class="topbar-actions">
                    <button class="icon-btn" id="syncBadge" onclick="Api.syncQueue()">
                        🔄<span class="sync-badge hidden"><span class="sync-count">0</span></span>
                    </button>
                    <button class="icon-btn" id="themeToggle"><span id="themeIcon">🌙</span></button>
                    <div class="user-chip">
                        <div class="user-avatar current-user-initial">${(user?.name || "?").charAt(0).toUpperCase()}</div>
                        <div>
                            <div class="u-name current-user-name">${Utils.escapeHtml(user?.name || "")}</div>
                            <div class="u-role current-user-role">${Utils.escapeHtml(user?.role || "")}</div>
                        </div>
                    </div>
                    <button class="btn-icon" id="logoutBtn" title="Keluar">⏻</button>
                </div>
            </header>
            <main class="page-content" id="pageContent"></main>
        </div>`;
    }
};
