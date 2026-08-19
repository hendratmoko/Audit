/**
 * config.js
 * Konfigurasi utama aplikasi. Ganti GAS_URL setelah deploy Google Apps Script Web App.
 */
const CONFIG = {
    // Ganti dengan URL Web App hasil deploy Google Apps Script (Deploy > New deployment > Web app)
    GAS_URL: "https://script.google.com/macros/s/AKfycbyMoWtSpvMij_BGUuWLvBlSCmJrcuYJgEngdtr5AU6MFLY5XG04kg5E9IeFBVM6y5F7/exec",

    SCHOOL_NAME: "SMK NEGERI 1 SANDEN",
    APP_NAME: "Sistem Audit Internal SMK",
    APP_SUBTITLE: "Digital Quality Assurance & Continuous Improvement System",

    // Kunci penyimpanan lokal (hanya untuk sesi login & antrean sinkronisasi, BUKAN database utama)
    STORAGE_KEYS: {
        TOKEN: "smk_audit_token",
        USER: "smk_audit_user",
        QUEUE: "smk_audit_sync_queue",
        THEME: "smk_audit_theme",
        DRAFT_PREFIX: "smk_audit_draft_"
    },

    // Skema penilaian status audit (dapat disesuaikan)
    SCORE_MAP: {
        "Sesuai": 100,
        "Sebagian Sesuai": 50,
        "Tidak Sesuai": 0,
        "Tidak Berlaku": null // tidak dihitung
    },

    // Kategori nilai akhir
    SCORE_CATEGORY: [
        { min: 90, max: 100, label: "Sangat Baik", color: "#22c55e" },
        { min: 75, max: 89.99, label: "Baik", color: "#3b82f6" },
        { min: 60, max: 74.99, label: "Cukup", color: "#f59e0b" },
        { min: 0, max: 59.99, label: "Perlu Perbaikan", color: "#ef4444" }
    ],

    STATUS_OPTIONS: ["Sesuai", "Sebagian Sesuai", "Tidak Sesuai", "Tidak Berlaku"],
    FINDING_TYPES: ["Minor", "Major", "Observasi", "Peluang Perbaikan"],
    PRIORITY_LEVELS: ["Rendah", "Sedang", "Tinggi", "Kritis"],
    ACTION_STATUS: ["Belum", "Dalam Proses", "Selesai", "Diverifikasi"],
    ROLES: ["ADMIN", "AUDITOR", "PIMPINAN", "OPERATOR", "VIEWER"],

    VERSION: "1.0.0"
};
