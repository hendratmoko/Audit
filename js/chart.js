/**
 * chart.js — pembungkus Chart.js untuk seluruh grafik pada aplikasi
 * Membutuhkan library Chart.js (dimuat via CDN di setiap halaman yang perlu grafik)
 */
const ChartUtil = {
    _instances: {},
    palette: ["#0ea5e9", "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#14b8a6", "#f97316"],

    _destroy(id) {
        if (ChartUtil._instances[id]) { ChartUtil._instances[id].destroy(); delete ChartUtil._instances[id]; }
    },

    doughnutStatus(canvasId, counts) {
        // counts: {Sesuai, "Sebagian Sesuai", "Tidak Sesuai", "Tidak Berlaku"}
        ChartUtil._destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        ChartUtil._instances[canvasId] = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    data: Object.values(counts),
                    backgroundColor: ["#22c55e", "#f59e0b", "#ef4444", "#94a3b8"],
                    borderWidth: 0
                }]
            },
            options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 16 } } }, cutout: "65%" }
        });
    },

    barByCategory(canvasId, labels, values, label = "Nilai (%)") {
        ChartUtil._destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        ChartUtil._instances[canvasId] = new Chart(ctx, {
            type: "bar",
            data: { labels, datasets: [{ label, data: values, backgroundColor: ChartUtil.palette, borderRadius: 8, maxBarThickness: 42 }] },
            options: {
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 100, grid: { color: "rgba(148,163,184,.15)" } }, x: { grid: { display: false } } }
            }
        });
    },

    radarSchool(canvasId, labels, values) {
        ChartUtil._destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        ChartUtil._instances[canvasId] = new Chart(ctx, {
            type: "radar",
            data: {
                labels,
                datasets: [{
                    label: "Nilai Kepatuhan (%)",
                    data: values,
                    backgroundColor: "rgba(14,165,233,.2)",
                    borderColor: "#0ea5e9",
                    pointBackgroundColor: "#0ea5e9"
                }]
            },
            options: { scales: { r: { min: 0, max: 100, ticks: { showLabelBackdrop: false } } } }
        });
    },

    lineTrend(canvasId, labels, values, label = "Nilai Rata-rata (%)") {
        ChartUtil._destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        ChartUtil._instances[canvasId] = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label, data: values, tension: .35, fill: true,
                    backgroundColor: "rgba(99,102,241,.15)", borderColor: "#6366f1", pointBackgroundColor: "#6366f1"
                }]
            },
            options: { scales: { y: { beginAtZero: true, max: 100 } } }
        });
    },

    barFindings(canvasId, labels, values) {
        ChartUtil._destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        ChartUtil._instances[canvasId] = new Chart(ctx, {
            type: "bar",
            data: { labels, datasets: [{ label: "Jumlah Temuan", data: values, backgroundColor: "#ef4444", borderRadius: 8, maxBarThickness: 38 }] },
            options: { indexAxis: "y", plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
        });
    },

    doughnutActionPlan(canvasId, counts) {
        ChartUtil._destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        ChartUtil._instances[canvasId] = new Chart(ctx, {
            type: "pie",
            data: {
                labels: Object.keys(counts),
                datasets: [{ data: Object.values(counts), backgroundColor: ["#ef4444", "#f59e0b", "#22c55e", "#0ea5e9"] }]
            },
            options: { plugins: { legend: { position: "bottom" } } }
        });
    },

    compareMajors(canvasId, labels, values) {
        ChartUtil.barByCategory(canvasId, labels, values, "Nilai Jurusan (%)");
    }
};
