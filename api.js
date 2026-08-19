/**
 * api.js — komunikasi dengan Google Apps Script Web App
 * Semua request dikirim sebagai POST dengan Content-Type text/plain (menghindari CORS preflight)
 */
const Api = {
    async call(action, payload = {}, { silent = false, queueOnFail = false } = {}) {
        if (!CONFIG.GAS_URL || CONFIG.GAS_URL === "ISI_URL_GOOGLE_APPS_SCRIPT") {
            Utils.toast("GAS_URL belum dikonfigurasi di js/config.js", "error");
            throw new Error("GAS_URL not configured");
        }
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN) || "";
        const body = JSON.stringify({ action, token, payload });

        try {
            const res = await fetch(CONFIG.GAS_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (!data.ok) {
                throw new Error(data.message || "Terjadi kesalahan pada server");
            }
            return data.data;
        } catch (err) {
            if (queueOnFail) {
                Api.enqueue(action, payload);
                if (!silent) Utils.toast("⚠ Tidak dapat terhubung. Data disimpan sementara & akan disinkronkan otomatis.", "warning");
                return { queued: true };
            }
            if (!silent) {
                Utils.toast(
                    `❌ Gagal memproses permintaan.\nKemungkinan penyebab: koneksi internet bermasalah, Google Apps Script tidak aktif, atau spreadsheet tidak dapat diakses.`,
                    "error"
                );
            }
            throw err;
        }
    },

    // ---- Offline queue (khusus untuk aksi simpan hasil audit) ----
    enqueue(action, payload) {
        const queue = Api.getQueue();
        queue.push({ id: Utils.uid("Q"), action, payload, ts: Date.now() });
        localStorage.setItem(CONFIG.STORAGE_KEYS.QUEUE, JSON.stringify(queue));
        Api.updateQueueBadge();
    },

    getQueue() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.QUEUE) || "[]");
        } catch { return []; }
    },

    updateQueueBadge() {
        const queue = Api.getQueue();
        const badge = document.getElementById("syncBadge");
        if (!badge) return;
        if (queue.length > 0) {
            badge.classList.remove("hidden");
            badge.querySelector(".sync-count").textContent = queue.length;
        } else {
            badge.classList.add("hidden");
        }
    },

    async syncQueue() {
        const queue = Api.getQueue();
        if (!queue.length) { Utils.toast("Tidak ada data yang perlu disinkronkan", "info"); return; }
        Utils.setLoading(true, "Menyinkronkan data...");
        const remaining = [];
        for (const item of queue) {
            try {
                await Api.call(item.action, item.payload, { silent: true });
            } catch {
                remaining.push(item);
            }
        }
        localStorage.setItem(CONFIG.STORAGE_KEYS.QUEUE, JSON.stringify(remaining));
        Api.updateQueueBadge();
        Utils.setLoading(false);
        if (remaining.length === 0) Utils.toast("✔ Semua data berhasil disinkronkan", "success");
        else Utils.toast(`⚠ ${remaining.length} data masih belum tersinkronisasi`, "warning");
    },

    // ---- Shortcut methods per entitas ----
    login(username, password) { return Api.call("login", { username, password }); },

    getUsers() { return Api.call("getUsers"); },
    saveUser(user) { return Api.call(user.id ? "updateUser" : "createUser", user); },
    deleteUser(id) { return Api.call("deleteUser", { id }); },

    getMajors() { return Api.call("getMajors"); },
    saveMajor(m) { return Api.call(m.id ? "updateMajor" : "createMajor", m); },
    deleteMajor(id) { return Api.call("deleteMajor", { id }); },

    getAreas() { return Api.call("getAreas"); },
    saveArea(a) { return Api.call(a.id ? "updateArea" : "createArea", a); },
    deleteArea(id) { return Api.call("deleteArea", { id }); },

    getItems() { return Api.call("getItems"); },
    saveItem(item) { return Api.call(item.id ? "updateItem" : "createItem", item); },
    deleteItem(id) { return Api.call("deleteItem", { id }); },

    getPeriods() { return Api.call("getPeriods"); },
    savePeriod(p) { return Api.call(p.id ? "updatePeriod" : "createPeriod", p); },

    getSessions() { return Api.call("getSessions"); },
    createSession(s) { return Api.call("createSession", s); },
    updateSession(s) { return Api.call("updateSession", s); },

    getResults(auditId) { return Api.call("getResults", { audit_id: auditId }); },
    saveResult(r) { return Api.call("saveResult", r, { queueOnFail: true }); },

    addEvidence(e) { return Api.call("addEvidence", e, { queueOnFail: true }); },
    getEvidence(auditId) { return Api.call("getEvidence", { audit_id: auditId }); },

    getFindings() { return Api.call("getFindings"); },
    saveFinding(f) { return Api.call(f.id ? "updateFinding" : "createFinding", f); },

    getActionPlans() { return Api.call("getActionPlans"); },
    saveActionPlan(a) { return Api.call(a.id ? "updateActionPlan" : "createActionPlan", a); },

    getDashboard(filters = {}) { return Api.call("getDashboard", filters); },
    getSettings() { return Api.call("getSettings"); },
    updateSettings(s) { return Api.call("updateSettings", s); },
    getLog() { return Api.call("getLog"); }
};
