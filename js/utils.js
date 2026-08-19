/**
 * utils.js — helper murni, tidak bergantung pada DOM tertentu
 */
const Utils = {
    uid(prefix = "ID") {
        const d = new Date();
        const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${stamp}-${rand}`;
    },

    formatDate(value) {
        if (!value) return "-";
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    },

    formatDateTime(value) {
        if (!value) return "-";
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    },

    scoreCategory(score) {
        const cat = CONFIG.SCORE_CATEGORY.find(c => score >= c.min && score <= c.max);
        return cat || { label: "-", color: "#94a3b8" };
    },

    statusBadgeClass(status) {
        const map = {
            "Sesuai": "badge-success",
            "Sebagian Sesuai": "badge-warning",
            "Tidak Sesuai": "badge-danger",
            "Tidak Berlaku": "badge-muted"
        };
        return map[status] || "badge-muted";
    },

    priorityBadgeClass(p) {
        const map = { "Rendah": "badge-muted", "Sedang": "badge-warning", "Tinggi": "badge-danger", "Kritis": "badge-critical" };
        return map[p] || "badge-muted";
    },

    actionStatusBadgeClass(s) {
        const map = { "Belum": "badge-danger", "Dalam Proses": "badge-warning", "Selesai": "badge-success", "Diverifikasi": "badge-info" };
        return map[s] || "badge-muted";
    },

    debounce(fn, delay = 300) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), delay);
        };
    },

    escapeHtml(str) {
        if (str === null || str === undefined) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    calcWeightedScore(results, items) {
        // results: [{item_id, status}], items: [{id, weight}]
        let sumScoreWeight = 0;
        let sumWeight = 0;
        results.forEach(r => {
            const scoreVal = CONFIG.SCORE_MAP[r.status];
            if (scoreVal === null || scoreVal === undefined) return; // Tidak Berlaku diabaikan
            const item = items.find(i => String(i.id) === String(r.item_id));
            const weight = item ? Number(item.weight) || 1 : 1;
            sumScoreWeight += scoreVal * weight;
            sumWeight += weight;
        });
        if (sumWeight === 0) return 0;
        return Math.round((sumScoreWeight / sumWeight) * 100) / 100;
    },

    toast(message, type = "info") {
        const container = document.getElementById("toastContainer") || (() => {
            const el = document.createElement("div");
            el.id = "toastContainer";
            el.className = "toast-container";
            document.body.appendChild(el);
            return el;
        })();
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        const icons = { success: "✔", error: "✖", warning: "⚠", info: "ℹ" };
        toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${Utils.escapeHtml(message)}</span>`;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("show"));
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    confirmDialog(message) {
        return window.confirm(message);
    },

    downloadCSV(filename, rows) {
        if (!rows || !rows.length) { Utils.toast("Tidak ada data untuk diekspor", "warning"); return; }
        const headers = Object.keys(rows[0]);
        const csv = [headers.join(",")]
            .concat(rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")))
            .join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    },

    qs(sel, root = document) { return root.querySelector(sel); },
    qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); },

    setLoading(isLoading, msg = "Memuat data...") {
        let el = document.getElementById("globalLoading");
        if (isLoading) {
            if (!el) {
                el = document.createElement("div");
                el.id = "globalLoading";
                el.className = "loading-overlay";
                document.body.appendChild(el);
            }
            el.innerHTML = `<div class="loading-box"><div class="spinner"></div><p>${Utils.escapeHtml(msg)}</p></div>`;
            el.classList.add("show");
        } else if (el) {
            el.classList.remove("show");
        }
    }
};
