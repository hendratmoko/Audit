/**
 * result.js — logika halaman HASIL AUDIT (Dashboard, Hasil Sekolah/Jurusan/Bagian, Perbandingan)
 */
const ResultModule = {
    data: { majors: [], areas: [], items: [], sessions: [], results: [], findings: [], actionPlans: [] },

    async loadAll() {
        Utils.setLoading(true, "Memuat data hasil audit...");
        try {
            const [majors, areas, items, sessions, findings, actionPlans] = await Promise.all([
                Api.getMajors(), Api.getAreas(), Api.getItems(), Api.getSessions(), Api.getFindings(), Api.getActionPlans()
            ]);
            // Gabungkan seluruh hasil dari semua sesi (backend juga menyediakan getDashboard agregat)
            let results = [];
            try { results = await Api.call("getAllResults"); } catch { results = []; }
            Object.assign(ResultModule.data, { majors, areas, items, sessions, results, findings, actionPlans });
        } catch (e) { console.error(e); }
        Utils.setLoading(false);
    },

    applyFilters(filters = {}) {
        let r = [...ResultModule.data.results];
        if (filters.major) r = r.filter(x => x.major_id === filters.major);
        if (filters.area) r = r.filter(x => x.area_id === filters.area);
        if (filters.status) r = r.filter(x => x.status === filters.status);
        if (filters.periodSessionIds) r = r.filter(x => filters.periodSessionIds.includes(x.audit_id));
        return r;
    },

    statusCounts(results) {
        const counts = { "Sesuai": 0, "Sebagian Sesuai": 0, "Tidak Sesuai": 0, "Tidak Berlaku": 0 };
        results.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
        return counts;
    },

    overallScore(results) {
        return Utils.calcWeightedScore(results, ResultModule.data.items);
    },

    scoreByGroup(results, groupField, dictionary, idField = "id", nameField = "name") {
        const groups = {};
        results.forEach(r => {
            const key = r[groupField];
            if (!groups[key]) groups[key] = [];
            groups[key].push(r);
        });
        return Object.entries(groups).map(([key, list]) => {
            const entity = dictionary.find(d => d[idField] === key);
            return { id: key, name: entity ? entity[nameField] : key, score: ResultModule.overallScore(list), count: list.length };
        }).sort((a, b) => b.score - a.score);
    },

    renderDashboard(filters = {}) {
        const results = ResultModule.applyFilters(filters);
        const counts = ResultModule.statusCounts(results);
        const overall = ResultModule.overallScore(results);
        const cat = Utils.scoreCategory(overall);

        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setText("kpiTotalAudit", ResultModule.data.sessions.length);
        setText("kpiTotalItem", ResultModule.data.items.length);
        setText("kpiSesuai", counts["Sesuai"]);
        setText("kpiSebagian", counts["Sebagian Sesuai"]);
        setText("kpiTidakSesuai", counts["Tidak Sesuai"]);
        setText("kpiTidakBerlaku", counts["Tidak Berlaku"]);
        setText("kpiTemuan", ResultModule.data.findings.length);
        setText("kpiTindakLanjut", ResultModule.data.actionPlans.filter(a => a.status !== "Selesai" && a.status !== "Diverifikasi").length);
        setText("kpiScoreOverall", overall + "%");
        const catEl = document.getElementById("kpiScoreCategory");
        if (catEl) { catEl.textContent = cat.label; catEl.style.color = cat.color; }

        ChartUtil.doughnutStatus("chartStatus", counts);

        const byMajor = ResultModule.scoreByGroup(results, "major_id", ResultModule.data.majors);
        ChartUtil.barByCategory("chartMajor", byMajor.map(m => m.name), byMajor.map(m => m.score), "Nilai Jurusan (%)");

        const byArea = ResultModule.scoreByGroup(results, "area_id", ResultModule.data.areas);
        ChartUtil.barByCategory("chartArea", byArea.map(a => a.name), byArea.map(a => a.score), "Nilai Bagian (%)");

        ChartUtil.radarSchool("chartRadar", byArea.map(a => a.name), byArea.map(a => a.score));

        const byFindingArea = {};
        ResultModule.data.findings.forEach(f => {
            const area = ResultModule.data.areas.find(a => a.id === f.area_id);
            const name = area ? area.name : f.area_id;
            byFindingArea[name] = (byFindingArea[name] || 0) + 1;
        });
        ChartUtil.barFindings("chartFindings", Object.keys(byFindingArea), Object.values(byFindingArea));

        const apCounts = { "Belum": 0, "Dalam Proses": 0, "Selesai": 0, "Diverifikasi": 0 };
        ResultModule.data.actionPlans.forEach(a => { if (apCounts[a.status] !== undefined) apCounts[a.status]++; });
        ChartUtil.doughnutActionPlan("chartActionPlan", apCounts);

        // Tren berdasarkan periode (menggunakan session date bulan)
        const trend = {};
        ResultModule.data.sessions.forEach(s => {
            const month = (s.date || "").slice(0, 7);
            if (!month) return;
            const sessionResults = ResultModule.data.results.filter(r => r.audit_id === s.id);
            if (!trend[month]) trend[month] = [];
            trend[month] = trend[month].concat(sessionResults);
        });
        const months = Object.keys(trend).sort();
        ChartUtil.lineTrend("chartTrend", months, months.map(m => ResultModule.overallScore(trend[m])));

        return { results, byMajor, byArea };
    },

    renderComparisonTable(byMajor) {
        const tbody = document.getElementById("comparisonTableBody");
        if (!tbody) return;
        tbody.innerHTML = byMajor.map((m, idx) => {
            const cat = Utils.scoreCategory(m.score);
            return `<tr>
                <td>${idx + 1}</td>
                <td>${Utils.escapeHtml(m.name)}</td>
                <td>${m.count}</td>
                <td><strong>${m.score}%</strong></td>
                <td><span class="badge" style="background:${cat.color}22;color:${cat.color}">${cat.label}</span></td>
            </tr>`;
        }).join("") || `<tr><td colspan="5" class="empty-row">Belum ada data</td></tr>`;
    },

    populateFilterOptions() {
        const majorSel = document.getElementById("filterMajor");
        const areaSel = document.getElementById("filterArea");
        if (majorSel) majorSel.innerHTML = `<option value="">Semua Jurusan</option>` + ResultModule.data.majors.map(m => `<option value="${m.id}">${Utils.escapeHtml(m.name)}</option>`).join("");
        if (areaSel) areaSel.innerHTML = `<option value="">Semua Bagian</option>` + ResultModule.data.areas.map(a => `<option value="${a.id}">${Utils.escapeHtml(a.name)}</option>`).join("");
    }
};
