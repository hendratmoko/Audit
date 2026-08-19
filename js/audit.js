/**
 * audit.js — logika halaman AUDIT (Audit Baru, Audit Berjalan, Riwayat, Item Audit, Jadwal)
 */
const AuditModule = {
    state: {
        majors: [], areas: [], items: [], sessions: [], periods: [],
        currentSession: null, currentResults: {}, currentEvidence: {}
    },

    async loadMaster() {
        Utils.setLoading(true, "Memuat data induk...");
        try {
            const [majors, areas, items, sessions, periods] = await Promise.all([
                Api.getMajors(), Api.getAreas(), Api.getItems(), Api.getSessions(), Api.getPeriods()
            ]);
            Object.assign(AuditModule.state, { majors, areas, items, sessions, periods });
        } catch (e) { console.error(e); }
        Utils.setLoading(false);
    },

    // ---------- ITEM AUDIT (Kelola Item Audit) ----------
    renderItemTable(filter = {}) {
        const tbody = document.getElementById("itemTableBody");
        if (!tbody) return;
        let list = [...AuditModule.state.items];
        if (filter.area) list = list.filter(i => i.area_id === filter.area);
        if (filter.major) list = list.filter(i => i.major_id === filter.major || i.major_id === "SEMUA");
        if (filter.q) {
            const q = filter.q.toLowerCase();
            list = list.filter(i => (i.code + i.question).toLowerCase().includes(q));
        }
        list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

        tbody.innerHTML = list.map(item => {
            const area = AuditModule.state.areas.find(a => a.id === item.area_id);
            const major = item.major_id === "SEMUA" ? "SEMUA JURUSAN" : (AuditModule.state.majors.find(m => m.id === item.major_id)?.name || "-");
            return `<tr>
                <td>${Utils.escapeHtml(item.code)}</td>
                <td class="max-w">${Utils.escapeHtml(item.question)}</td>
                <td>${Utils.escapeHtml(area?.name || "-")}</td>
                <td>${Utils.escapeHtml(major)}</td>
                <td>${Utils.escapeHtml(item.weight)}</td>
                <td><span class="badge ${item.status === 'Aktif' ? 'badge-success' : 'badge-muted'}">${Utils.escapeHtml(item.status)}</span></td>
                <td class="table-actions">
                    <button class="btn-icon" onclick="AuditModule.editItem('${item.id}')" title="Edit">✏</button>
                    <button class="btn-icon" onclick="AuditModule.duplicateItem('${item.id}')" title="Duplikasi">⧉</button>
                    <button class="btn-icon danger" onclick="AuditModule.deleteItem('${item.id}')" title="Hapus">🗑</button>
                </td>
            </tr>`;
        }).join("") || `<tr><td colspan="7" class="empty-row">Belum ada item audit</td></tr>`;
    },

    openItemForm(item = null) {
        const modal = document.getElementById("itemModal");
        if (!modal) return;
        modal.dataset.editId = item ? item.id : "";
        document.getElementById("itemForm").reset();
        document.getElementById("itemModalTitle").textContent = item ? "Edit Item Audit" : "Tambah Item Audit";

        const areaSel = document.getElementById("itemArea");
        areaSel.innerHTML = AuditModule.state.areas.map(a => `<option value="${a.id}">${Utils.escapeHtml(a.name)}</option>`).join("");
        const majorSel = document.getElementById("itemMajor");
        majorSel.innerHTML = `<option value="SEMUA">SEMUA JURUSAN</option>` +
            AuditModule.state.majors.map(m => `<option value="${m.id}">${Utils.escapeHtml(m.name)}</option>`).join("");

        if (item) {
            document.getElementById("itemCode").value = item.code || "";
            document.getElementById("itemQuestion").value = item.question || "";
            document.getElementById("itemDescription").value = item.description || "";
            areaSel.value = item.area_id || "";
            document.getElementById("itemSubArea").value = item.sub_area || "";
            majorSel.value = item.major_id || "SEMUA";
            document.getElementById("itemEvidenceType").value = item.evidence_type || "";
            document.getElementById("itemWeight").value = item.weight || 1;
            document.getElementById("itemOrder").value = item.order || 0;
            document.getElementById("itemStatus").value = item.status || "Aktif";
        }
        modal.classList.add("show");
    },

    editItem(id) {
        const item = AuditModule.state.items.find(i => i.id === id);
        AuditModule.openItemForm(item);
    },

    async duplicateItem(id) {
        const item = AuditModule.state.items.find(i => i.id === id);
        if (!item) return;
        const copy = { ...item, id: undefined, code: item.code + "-COPY" };
        await Api.saveItem(copy);
        Utils.toast("Item berhasil diduplikasi", "success");
        await AuditModule.loadMaster();
        AuditModule.renderItemTable();
    },

    async deleteItem(id) {
        if (!Utils.confirmDialog("Hapus item audit ini? Tindakan tidak dapat dibatalkan.")) return;
        await Api.deleteItem(id);
        Utils.toast("Item audit dihapus", "success");
        await AuditModule.loadMaster();
        AuditModule.renderItemTable();
    },

    async submitItemForm(e) {
        e.preventDefault();
        const modal = document.getElementById("itemModal");
        const editId = modal.dataset.editId;
        const payload = {
            id: editId || undefined,
            code: document.getElementById("itemCode").value.trim(),
            question: document.getElementById("itemQuestion").value.trim(),
            description: document.getElementById("itemDescription").value.trim(),
            area_id: document.getElementById("itemArea").value,
            sub_area: document.getElementById("itemSubArea").value.trim(),
            major_id: document.getElementById("itemMajor").value,
            evidence_type: document.getElementById("itemEvidenceType").value.trim(),
            weight: Number(document.getElementById("itemWeight").value) || 1,
            order: Number(document.getElementById("itemOrder").value) || 0,
            status: document.getElementById("itemStatus").value
        };
        if (!payload.code || !payload.question || !payload.area_id) {
            Utils.toast("Kode, indikator, dan bagian audit wajib diisi", "warning");
            return;
        }
        Utils.setLoading(true, "Menyimpan item audit...");
        try {
            await Api.saveItem(payload);
            Utils.toast("Item audit tersimpan", "success");
            modal.classList.remove("show");
            await AuditModule.loadMaster();
            AuditModule.renderItemTable();
        } catch (e) { console.error(e); }
        Utils.setLoading(false);
    },

    // ---------- AUDIT BARU (buat sesi) ----------
    populateSessionForm() {
        const periodSel = document.getElementById("sessionPeriod");
        const majorSel = document.getElementById("sessionMajor");
        const areaSel = document.getElementById("sessionArea");
        if (periodSel) periodSel.innerHTML = AuditModule.state.periods.map(p => `<option value="${p.id}">${Utils.escapeHtml(p.name)}</option>`).join("");
        if (majorSel) majorSel.innerHTML = `<option value="SEMUA">SELURUH SEKOLAH</option>` + AuditModule.state.majors.map(m => `<option value="${m.id}">${Utils.escapeHtml(m.name)}</option>`).join("");
        if (areaSel) areaSel.innerHTML = AuditModule.state.areas.map(a => `<option value="${a.id}">${Utils.escapeHtml(a.name)}</option>`).join("");
        const dateInput = document.getElementById("sessionDate");
        if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);
    },

    async submitNewSession(e) {
        e.preventDefault();
        const user = Auth.getUser();
        const payload = {
            code: Utils.uid("AUD"),
            period_id: document.getElementById("sessionPeriod").value,
            date: document.getElementById("sessionDate").value,
            auditor_id: user.id,
            auditor_name: user.name,
            major_id: document.getElementById("sessionMajor").value,
            area_id: document.getElementById("sessionArea").value,
            status: "ongoing",
            progress: 0
        };
        Utils.setLoading(true, "Membuat sesi audit...");
        try {
            const session = await Api.createSession(payload);
            Utils.toast("Sesi audit dibuat, silakan mulai mengisi", "success");
            window.location.href = `audit-fill.html?id=${session.id}`;
        } catch (e) { console.error(e); }
        Utils.setLoading(false);
    },

    // ---------- PENGISIAN AUDIT ----------
    draftKey(sessionId) { return CONFIG.STORAGE_KEYS.DRAFT_PREFIX + sessionId; },

    saveDraftLocal(sessionId) {
        localStorage.setItem(AuditModule.draftKey(sessionId), JSON.stringify(AuditModule.state.currentResults));
    },

    loadDraftLocal(sessionId) {
        try { return JSON.parse(localStorage.getItem(AuditModule.draftKey(sessionId)) || "{}"); }
        catch { return {}; }
    },

    async initFillPage() {
        const sessionId = App.getQueryParam("id");
        if (!sessionId) { window.location.href = "audit.html"; return; }
        await AuditModule.loadMaster();
        const session = AuditModule.state.sessions.find(s => s.id === sessionId);
        if (!session) { Utils.toast("Sesi audit tidak ditemukan", "error"); window.location.href = "audit.html"; return; }
        AuditModule.state.currentSession = session;

        Utils.setLoading(true, "Memuat item audit...");
        let remoteResults = [];
        try { remoteResults = await Api.getResults(sessionId); } catch (e) { console.error(e); }
        Utils.setLoading(false);

        const draft = AuditModule.loadDraftLocal(sessionId);
        AuditModule.state.currentResults = {};
        remoteResults.forEach(r => AuditModule.state.currentResults[r.item_id] = r);
        Object.assign(AuditModule.state.currentResults, draft);

        AuditModule.renderFillHeader(session);
        AuditModule.renderFillItems(session);
    },

    renderFillHeader(session) {
        const major = AuditModule.state.majors.find(m => m.id === session.major_id);
        const area = AuditModule.state.areas.find(a => a.id === session.area_id);
        const el = document.getElementById("fillHeader");
        if (el) el.innerHTML = `
            <h2>${Utils.escapeHtml(area?.name || "Audit")}</h2>
            <p>Jurusan/Unit: <strong>${Utils.escapeHtml(session.major_id === 'SEMUA' ? 'SELURUH SEKOLAH' : (major?.name || '-'))}</strong> &middot;
               Tanggal: <strong>${Utils.formatDate(session.date)}</strong> &middot;
               Auditor: <strong>${Utils.escapeHtml(session.auditor_name || '-')}</strong></p>`;
    },

    getSessionItems(session) {
        return AuditModule.state.items.filter(i =>
            i.status === "Aktif" &&
            i.area_id === session.area_id &&
            (i.major_id === "SEMUA" || i.major_id === session.major_id || session.major_id === "SEMUA")
        ).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    },

    renderFillItems(session) {
        const items = AuditModule.getSessionItems(session);
        const container = document.getElementById("fillItemsContainer");
        if (!container) return;
        container.innerHTML = items.map((item, idx) => {
            const r = AuditModule.state.currentResults[item.id] || {};
            return `<div class="audit-item-card" data-item-id="${item.id}">
                <div class="audit-item-head">
                    <span class="item-index">${idx + 1}</span>
                    <div>
                        <p class="item-question">${Utils.escapeHtml(item.question)}</p>
                        ${item.description ? `<p class="item-desc">${Utils.escapeHtml(item.description)}</p>` : ""}
                        <span class="item-code-tag">${Utils.escapeHtml(item.code)} · Bobot ${Utils.escapeHtml(item.weight)}</span>
                    </div>
                </div>
                <div class="status-options">
                    ${CONFIG.STATUS_OPTIONS.map(s => `
                        <label class="status-radio ${r.status === s ? 'checked' : ''}" data-status="${s}">
                            <input type="radio" name="status_${item.id}" value="${s}" ${r.status === s ? "checked" : ""}
                                onchange="AuditModule.onStatusChange('${item.id}', this.value)">
                            <span>${s}</span>
                        </label>`).join("")}
                </div>
                <textarea class="input" placeholder="Keterangan..." onchange="AuditModule.onFieldChange('${item.id}','notes',this.value)">${Utils.escapeHtml(r.notes || "")}</textarea>
                <div class="grid-2">
                    <input type="text" class="input" placeholder="Link bukti (Drive/Foto/Dokumen)" value="${Utils.escapeHtml(r.evidence_url || "")}"
                        onchange="AuditModule.onFieldChange('${item.id}','evidence_url',this.value)">
                    <input type="text" class="input" placeholder="Temuan (jika ada)" value="${Utils.escapeHtml(r.finding || "")}"
                        onchange="AuditModule.onFieldChange('${item.id}','finding',this.value)">
                </div>
                <input type="text" class="input" placeholder="Rekomendasi" value="${Utils.escapeHtml(r.recommendation || "")}"
                    onchange="AuditModule.onFieldChange('${item.id}','recommendation',this.value)">
            </div>`;
        }).join("") || `<p class="empty-row">Tidak ada item audit untuk kombinasi bagian/jurusan ini. Tambahkan lewat tombol "+ Tambah Item Audit".</p>`;

        AuditModule.updateProgress(session);
    },

    onStatusChange(itemId, status) {
        AuditModule.state.currentResults[itemId] = { ...(AuditModule.state.currentResults[itemId] || {}), item_id: itemId, status };
        Utils.qsa(`[data-item-id="${itemId}"] .status-radio`).forEach(l => l.classList.toggle("checked", l.dataset.status === status));
        AuditModule.saveDraftLocal(AuditModule.state.currentSession.id);
        AuditModule.updateProgress(AuditModule.state.currentSession);
    },

    onFieldChange(itemId, field, value) {
        AuditModule.state.currentResults[itemId] = { ...(AuditModule.state.currentResults[itemId] || {}), item_id: itemId, [field]: value };
        AuditModule.saveDraftLocal(AuditModule.state.currentSession.id);
    },

    updateProgress(session) {
        const items = AuditModule.getSessionItems(session);
        const filled = items.filter(i => AuditModule.state.currentResults[i.id]?.status).length;
        const pct = items.length ? Math.round((filled / items.length) * 100) : 0;
        const bar = document.getElementById("fillProgressBar");
        const label = document.getElementById("fillProgressLabel");
        if (bar) bar.style.width = pct + "%";
        if (label) label.textContent = `${filled} dari ${items.length} item selesai (${pct}%)`;
        return { filled, total: items.length, pct };
    },

    async saveAllResults(finalize = false) {
        const session = AuditModule.state.currentSession;
        const user = Auth.getUser();
        const results = Object.values(AuditModule.state.currentResults).filter(r => r.status);
        if (finalize && results.length === 0) {
            Utils.toast("Isi minimal satu item sebelum menyelesaikan audit", "warning");
            return;
        }
        Utils.setLoading(true, "Menyimpan audit...");
        try {
            for (const r of results) {
                await Api.saveResult({ ...r, audit_id: session.id, major_id: session.major_id, area_id: session.area_id, auditor: user.name });
            }
            const { pct } = AuditModule.updateProgress(session);
            await Api.updateSession({ id: session.id, progress: pct, status: finalize ? "done" : "ongoing" });
            localStorage.removeItem(AuditModule.draftKey(session.id));
            Utils.toast(finalize ? "✔ Audit selesai disimpan" : "✔ Audit tersimpan sementara", "success");
            if (finalize) window.location.href = "audit.html";
        } catch (e) { console.error(e); }
        Utils.setLoading(false);
    },

    // ---------- TAMBAH ITEM SAAT AUDIT (usulan) ----------
    async submitAdHocItem(e) {
        e.preventDefault();
        const session = AuditModule.state.currentSession;
        const user = Auth.getUser();
        const canEditMaster = Auth.hasRole("ADMIN");
        const payload = {
            code: "USUL-" + Math.floor(1000 + Math.random() * 9000),
            question: document.getElementById("adhocQuestion").value.trim(),
            description: document.getElementById("adhocDescription").value.trim(),
            area_id: session.area_id,
            sub_area: "",
            major_id: session.major_id,
            evidence_type: "",
            weight: Number(document.getElementById("adhocWeight").value) || 1,
            order: 999,
            status: canEditMaster ? "Aktif" : "Menunggu Verifikasi",
            created_by: user.name
        };
        Utils.setLoading(true, "Menyimpan usulan item...");
        try {
            const newItem = await Api.saveItem(payload);
            AuditModule.state.items.push(newItem);
            document.getElementById("adhocModal").classList.remove("show");
            document.getElementById("adhocForm").reset();
            AuditModule.renderFillItems(session);
            Utils.toast(canEditMaster ? "Item baru ditambahkan ke master" : "Item diusulkan, menunggu verifikasi admin", "success");
        } catch (e) { console.error(e); }
        Utils.setLoading(false);
    }
};
