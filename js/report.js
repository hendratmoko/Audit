/**
 * report.js — logika halaman LAPORAN (cetak, PDF via print, export CSV)
 */
const ReportModule = {
    async buildSchoolReport(filters = {}) {
        await ResultModule.loadAll();
        const { results, byMajor, byArea } = ResultModule.renderDashboard(filters);
        return { results, byMajor, byArea, overall: ResultModule.overallScore(results) };
    },

    renderPrintableReport(container, data, meta = {}) {
        const cat = Utils.scoreCategory(data.overall);
        const counts = ResultModule.statusCounts(data.results);
        const findings = ResultModule.data.findings || [];
        const actionPlans = ResultModule.data.actionPlans || [];

        container.innerHTML = `
        <div class="print-report">
            <div class="print-header">
                <h1>LAPORAN AUDIT INTERNAL</h1>
                <h2>${Utils.escapeHtml(CONFIG.SCHOOL_NAME)}</h2>
                <p>Periode: ${Utils.escapeHtml(meta.period || "Seluruh Periode")} &middot; Dicetak: ${Utils.formatDateTime(new Date())}</p>
                ${meta.major ? `<p>Jurusan: <strong>${Utils.escapeHtml(meta.major)}</strong></p>` : ""}
                ${meta.area ? `<p>Bagian: <strong>${Utils.escapeHtml(meta.area)}</strong></p>` : ""}
            </div>

            <div class="print-section">
                <h3>Ringkasan Hasil</h3>
                <table class="print-table">
                    <tr><td>Nilai Audit</td><td><strong>${data.overall}%</strong></td></tr>
                    <tr><td>Kategori</td><td style="color:${cat.color}"><strong>${cat.label}</strong></td></tr>
                    <tr><td>Jumlah Hasil Dinilai</td><td>${data.results.length}</td></tr>
                    <tr><td>Sesuai</td><td>${counts["Sesuai"]}</td></tr>
                    <tr><td>Sebagian Sesuai</td><td>${counts["Sebagian Sesuai"]}</td></tr>
                    <tr><td>Tidak Sesuai</td><td>${counts["Tidak Sesuai"]}</td></tr>
                    <tr><td>Tidak Berlaku</td><td>${counts["Tidak Berlaku"]}</td></tr>
                </table>
            </div>

            <div class="print-section">
                <h3>Nilai per Jurusan</h3>
                <table class="print-table">
                    <thead><tr><th>Jurusan</th><th>Jumlah Item</th><th>Nilai</th></tr></thead>
                    <tbody>${data.byMajor.map(m => `<tr><td>${Utils.escapeHtml(m.name)}</td><td>${m.count}</td><td>${m.score}%</td></tr>`).join("")}</tbody>
                </table>
            </div>

            <div class="print-section">
                <h3>Nilai per Bagian</h3>
                <table class="print-table">
                    <thead><tr><th>Bagian</th><th>Jumlah Item</th><th>Nilai</th></tr></thead>
                    <tbody>${data.byArea.map(a => `<tr><td>${Utils.escapeHtml(a.name)}</td><td>${a.count}</td><td>${a.score}%</td></tr>`).join("")}</tbody>
                </table>
            </div>

            <div class="print-section">
                <h3>Temuan (${findings.length})</h3>
                <table class="print-table">
                    <thead><tr><th>Deskripsi</th><th>Jenis</th><th>Prioritas</th><th>PIC</th><th>Status</th></tr></thead>
                    <tbody>${findings.map(f => `<tr><td>${Utils.escapeHtml(f.description)}</td><td>${Utils.escapeHtml(f.type)}</td><td>${Utils.escapeHtml(f.priority)}</td><td>${Utils.escapeHtml(f.pic || "-")}</td><td>${Utils.escapeHtml(f.status || "Belum")}</td></tr>`).join("") || "<tr><td colspan='5'>Tidak ada temuan</td></tr>"}</tbody>
                </table>
            </div>

            <div class="print-section">
                <h3>Rencana Tindak Lanjut (${actionPlans.length})</h3>
                <table class="print-table">
                    <thead><tr><th>Tindakan</th><th>PIC</th><th>Deadline</th><th>Status</th></tr></thead>
                    <tbody>${actionPlans.map(a => `<tr><td>${Utils.escapeHtml(a.action)}</td><td>${Utils.escapeHtml(a.pic || "-")}</td><td>${Utils.formatDate(a.deadline)}</td><td>${Utils.escapeHtml(a.status)}</td></tr>`).join("") || "<tr><td colspan='4'>Belum ada rencana tindak lanjut</td></tr>"}</tbody>
                </table>
            </div>

            <div class="print-section">
                <h3>Kesimpulan</h3>
                <p>Berdasarkan hasil audit internal, ${Utils.escapeHtml(meta.major || CONFIG.SCHOOL_NAME)} memperoleh nilai kepatuhan sebesar <strong>${data.overall}%</strong>
                dengan kategori <strong>${cat.label}</strong>. Ditemukan sebanyak <strong>${findings.length}</strong> temuan dengan
                <strong>${actionPlans.filter(a => a.status !== 'Selesai' && a.status !== 'Diverifikasi').length}</strong> rencana tindak lanjut yang masih berjalan.</p>
            </div>

            <div class="print-signature">
                <div><p>Auditor</p><br><br><p>(_______________________)</p></div>
                <div><p>Mengetahui,<br>Kepala Sekolah</p><br><br><p>(_______________________)</p></div>
            </div>
        </div>`;
    },

    printReport() { window.print(); },

    exportResultsCSV(results) {
        const rows = results.map(r => ({
            audit_id: r.audit_id, item_id: r.item_id, major_id: r.major_id, area_id: r.area_id,
            status: r.status, notes: r.notes, evidence_url: r.evidence_url, finding: r.finding,
            recommendation: r.recommendation, auditor: r.auditor
        }));
        Utils.downloadCSV(`hasil-audit-${Date.now()}.csv`, rows);
    },

    exportFindingsCSV(findings) {
        Utils.downloadCSV(`temuan-audit-${Date.now()}.csv`, findings);
    }
};
