/**
 * finding.js — logika halaman TEMUAN & TINDAK LANJUT
 */
const FindingModule = {
    state: { findings: [], actionPlans: [], majors: [], areas: [] },

    async loadAll() {
        Utils.setLoading(true, "Memuat data temuan...");
        try {
            const [findings, actionPlans, majors, areas] = await Promise.all([
                Api.getFindings(), Api.getActionPlans(), Api.getMajors(), Api.getAreas()
            ]);
            Object.assign(FindingModule.state, { findings, actionPlans, majors, areas });
        } catch (e) { console.error(e); }
        Utils.setLoading(false);
    },

    renderFindingTable(filters = {}) {
        const tbody = document.getElementById("findingTableBody");
        if (!tbody) return;
        let list = [...FindingModule.state.findings];
        if (filters.major) list = list.filter(f => f.major_id === filters.major);
        if (filters.area) list = list.filter(f => f.area_id === filters.area);
        if (filters.priority) list = list.filter(f => f.priority === filters.priority);
        if (filters.type) list = list.filter(f => f.type === filters.type);
        if (filters.q) {
            const q = filters.q.toLowerCase();
            list = list.filter(f => (f.description || "").toLowerCase().includes(q));
        }

        tbody.innerHTML = list.map(f => {
            const major = FindingModule.state.majors.find(m => m.id === f.major_id);
            const area = FindingModule.state.areas.find(a => a.id === f.area_id);
            return `<tr>
                <td>${Utils.escapeHtml(f.id)}</td>
                <td>${Utils.escapeHtml(major?.name || f.major_id)}</td>
                <td>${Utils.escapeHtml(area?.name || f.area_id)}</td>
                <td class="max-w">${Utils.escapeHtml(f.description)}</td>
                <td><span class="badge badge-info">${Utils.escapeHtml(f.type)}</span></td>
                <td><span class="badge ${Utils.priorityBadgeClass(f.priority)}">${Utils.escapeHtml(f.priority)}</span></td>
                <td>${Utils.escapeHtml(f.pic || "-")}</td>
                <td>${Utils.formatDate(f.deadline)}</td>
                <td><span class="badge ${Utils.actionStatusBadgeClass(f.status)}">${Utils.escapeHtml(f.status || "Belum")}</span></td>
                <td class="table-actions">
                    <button class="btn-icon" onclick="FindingModule.editFinding('${f.id}')" title="Edit">✏</button>
                    <button class="btn-icon" onclick="FindingModule.openActionPlan('${f.id}')" title="Tindak Lanjut">📌</button>
                </td>
            </tr>`;
        }).join("") || `<tr><td colspan="10" class="empty-row">Tidak ada temuan</td></tr>`;
    },

    openFindingForm(finding = null) {
        const modal = document.getElementById("findingModal");
        if (!modal) return;
        modal.dataset.editId = finding ? finding.id : "";
        document.getElementById("findingForm").reset();
        document.getElementById("findingModalTitle").textContent = finding ? "Edit Temuan" : "Tambah Temuan";

        const majorSel = document.getElementById("findingMajor");
        majorSel.innerHTML = FindingModule.state.majors.map(m => `<option value="${m.id}">${Utils.escapeHtml(m.name)}</option>`).join("");
        const areaSel = document.getElementById("findingArea");
        areaSel.innerHTML = FindingModule.state.areas.map(a => `<option value="${a.id}">${Utils.escapeHtml(a.name)}</option>`).join("");

        if (finding) {
            majorSel.value = finding.major_id;
            areaSel.value = finding.area_id;
            document.getElementById("findingType").value = finding.type;
            document.getElementById("findingPriority").value = finding.priority;
            document.getElementById("findingDescription").value = finding.description;
            document.getElementById("findingEvidence").value = finding.evidence || "";
            document.getElementById("findingRecommendation").value = finding.recommendation || "";
            document.getElementById("findingPic").value = finding.pic || "";
            document.getElementById("findingDeadline").value = finding.deadline || "";
        }
        modal.classList.add("show");
    },

    editFinding(id) {
        FindingModule.openFindingForm(FindingModule.state.findings.find(f => f.id === id));
    },

    async submitFindingForm(e) {
        e.preventDefault();
        const modal = document.getElementById("findingModal");
        const payload = {
            id: modal.dataset.editId || undefined,
            major_id: document.getElementById("findingMajor").value,
            area_id: document.getElementById("findingArea").value,
            type: document.getElementById("findingType").value,
            priority: document.getElementById("findingPriority").value,
            description: document.getElementById("findingDescription").value.trim(),
            evidence: document.getElementById("findingEvidence").value.trim(),
            recommendation: document.getElementById("findingRecommendation").value.trim(),
            pic: document.getElementById("findingPic").value.trim(),
            deadline: document.getElementById("findingDeadline").value,
            status: "Belum"
        };
        if (!payload.description) { Utils.toast("Deskripsi temuan wajib diisi", "warning"); return; }
        Utils.setLoading(true, "Menyimpan temuan...");
        try {
            await Api.saveFinding(payload);
            Utils.toast("Temuan tersimpan", "success");
            modal.classList.remove("show");
            await FindingModule.loadAll();
            FindingModule.renderFindingTable();
        } catch (e) { console.error(e); }
        Utils.setLoading(false);
    },

    // ---------- ACTION PLAN ----------
    openActionPlan(findingId) {
        const finding = FindingModule.state.findings.find(f => f.id === findingId);
        const modal = document.getElementById("actionModal");
        if (!modal || !finding) return;
        modal.dataset.findingId = findingId;
        document.getElementById("actionForm").reset();
        document.getElementById("actionFindingText").textContent = finding.description;
        const existing = FindingModule.state.actionPlans.find(a => a.finding_id === findingId);
        if (existing) {
            modal.dataset.editId = existing.id;
            document.getElementById("actionText").value = existing.action || "";
            document.getElementById("actionPic").value = existing.pic || finding.pic || "";
            document.getElementById("actionDeadline").value = existing.deadline || finding.deadline || "";
            document.getElementById("actionStatus").value = existing.status || "Belum";
            document.getElementById("actionNotes").value = existing.notes || "";
        } else {
            modal.dataset.editId = "";
            document.getElementById("actionPic").value = finding.pic || "";
            document.getElementById("actionDeadline").value = finding.deadline || "";
        }
        modal.classList.add("show");
    },

    async submitActionForm(e) {
        e.preventDefault();
        const modal = document.getElementById("actionModal");
        const payload = {
            id: modal.dataset.editId || undefined,
            finding_id: modal.dataset.findingId,
            action: document.getElementById("actionText").value.trim(),
            pic: document.getElementById("actionPic").value.trim(),
            deadline: document.getElementById("actionDeadline").value,
            status: document.getElementById("actionStatus").value,
            notes: document.getElementById("actionNotes").value.trim()
        };
        Utils.setLoading(true, "Menyimpan tindak lanjut...");
        try {
            await Api.saveActionPlan(payload);
            await Api.saveFinding({ id: modal.dataset.findingId, status: payload.status });
            Utils.toast("Tindak lanjut tersimpan", "success");
            modal.classList.remove("show");
            await FindingModule.loadAll();
            FindingModule.renderFindingTable();
            if (typeof FindingModule.renderActionTable === "function") FindingModule.renderActionTable();
        } catch (e) { console.error(e); }
        Utils.setLoading(false);
    },

    renderActionTable(filters = {}) {
        const tbody = document.getElementById("actionTableBody");
        if (!tbody) return;
        let list = [...FindingModule.state.actionPlans];
        if (filters.status) list = list.filter(a => a.status === filters.status);
        const today = new Date().toISOString().slice(0, 10);

        tbody.innerHTML = list.map(a => {
            const finding = FindingModule.state.findings.find(f => f.id === a.finding_id);
            const late = a.deadline && a.deadline < today && a.status !== "Selesai" && a.status !== "Diverifikasi";
            return `<tr class="${late ? 'row-late' : ''}">
                <td class="max-w">${Utils.escapeHtml(finding?.description || a.finding_id)}</td>
                <td>${Utils.escapeHtml(a.action)}</td>
                <td>${Utils.escapeHtml(a.pic || "-")}</td>
                <td>${Utils.formatDate(a.deadline)} ${late ? '<span class="badge badge-danger">Terlambat</span>' : ''}</td>
                <td><span class="badge ${Utils.actionStatusBadgeClass(a.status)}">${Utils.escapeHtml(a.status)}</span></td>
                <td class="table-actions"><button class="btn-icon" onclick="FindingModule.openActionPlan('${a.finding_id}')" title="Kelola">✏</button></td>
            </tr>`;
        }).join("") || `<tr><td colspan="6" class="empty-row">Belum ada rencana tindak lanjut</td></tr>`;
    },

    actionPlanKpis() {
        const list = FindingModule.state.actionPlans;
        const today = new Date().toISOString().slice(0, 10);
        return {
            total: list.length,
            belum: list.filter(a => a.status === "Belum").length,
            proses: list.filter(a => a.status === "Dalam Proses").length,
            selesai: list.filter(a => a.status === "Selesai" || a.status === "Diverifikasi").length,
            telat: list.filter(a => a.deadline && a.deadline < today && a.status !== "Selesai" && a.status !== "Diverifikasi").length
        };
    }
};
