# System Audit

# Sistem Audit Internal SMK
**SMK Negeri 1 Sanden — Digital Quality Assurance & Continuous Improvement System**

Aplikasi web audit internal untuk seluruh lini sekolah (manajemen, kurikulum, pembelajaran, kesiswaan, SDM, sarpras, jurusan, DUDI, K3, dll), dengan frontend di GitHub Pages dan database di Google Sheets melalui Google Apps Script (GAS).

---

## 1. Struktur Proyek

```
/
├── index.html          # Login
├── dashboard.html       # Dashboard utama
├── audit.html           # Audit Baru / Berjalan / Riwayat / Item Audit / Jadwal
├── audit-fill.html      # Halaman pengisian audit per sesi
├── hasil.html           # Dashboard hasil, per jurusan/bagian, perbandingan
├── temuan.html          # Temuan & Tindak Lanjut
├── laporan.html         # Laporan cetak / PDF / CSV
├── pengaturan.html      # Jurusan, Bagian Audit, Pengguna, Periode, Konfigurasi
├── css/                 # style.css, dashboard.css, audit.css, responsive.css
├── js/                  # config.js, utils.js, api.js, auth.js, app.js, layout.js,
│                         audit.js, result.js, finding.js, report.js, chart.js
└── gas/                 # Kode Google Apps Script (Code.gs, Config.gs, Utils.gs,
                          Auth.gs, Audit.gs, Result.gs, Finding.gs)
```

> **Catatan:** data pada `pengaturan.html` (jurusan, bagian, dsb) yang dibuat oleh `setupInitialData()` hanyalah **contoh awal** agar aplikasi langsung bisa dipakai. Silakan disesuaikan/dihapus melalui menu Pengaturan.

---

## 2. Deploy Backend (Google Apps Script)

1. Buka Spreadsheet database:
   `https://docs.google.com/spreadsheets/d/1XhESBBj5zf0bD0ICc4WaLsSPcRIEtGV0V-VcHnFD_2M/edit`
2. Menu **Extensions/Ekstensi → Apps Script**.
3. Hapus isi `Code.gs` bawaan, lalu buat file baru untuk masing-masing file di folder `/gas`:
   `Config.gs`, `Utils.gs`, `Auth.gs`, `Audit.gs`, `Result.gs`, `Finding.gs`, `Code.gs`
   (klik ikon `+` di samping "Files" → Script, beri nama sesuai, lalu salin-tempel isinya).
4. Pilih fungsi **`setupInitialData`** pada dropdown di toolbar editor, klik **Run**.
   - Saat pertama kali run, Google akan meminta otorisasi izin akses Spreadsheet — klik **Review permissions**, pilih akun Anda, klik **Advanced → Go to project (unsafe)** (ini normal untuk script milik sendiri), lalu **Allow**.
   - Fungsi ini otomatis membuat seluruh sheet + header, 1 akun admin default, serta beberapa jurusan/bagian contoh.
5. **Deploy sebagai Web App**:
   - Klik **Deploy → New deployment**.
   - Pilih tipe **Web app**.
   - **Execute as:** Me (akun Anda).
   - **Who has access:** Anyone.
   - Klik **Deploy**, lalu **salin URL Web App** (`https://script.google.com/macros/s/XXXXXXXXXXXX/exec`).
6. Setiap kali Anda mengubah kode `.gs`, buat **New deployment** baru (atau kelola versi lewat "Manage deployments") agar perubahan aktif.

### Akun Admin Default
```
Username : admin
Password : Admin@123
```
**Wajib diganti** setelah login pertama kali melalui menu **Pengaturan → Pengguna**.

---

## 3. Konfigurasi Frontend

1. Buka `js/config.js`.
2. Ganti baris berikut dengan URL Web App hasil deploy:
   ```js
   GAS_URL: "https://script.google.com/macros/s/XXXXXXXXXXXX/exec",
   ```
3. Sesuaikan `SCHOOL_NAME`, `APP_NAME` bila perlu.

---

## 4. Deploy Frontend ke GitHub Pages

1. Buat repository GitHub baru (misal `audit-internal-smk`).
2. Upload seluruh isi folder proyek ini (kecuali folder `gas/`, yang hanya untuk referensi/Apps Script) ke root repository.
3. Buka **Settings → Pages** pada repository.
4. **Source**: `Deploy from a branch` → Branch: `main` → Folder: `/root` → **Save**.
5. Tunggu 1–2 menit, akses melalui URL yang diberikan GitHub (`https://username.github.io/audit-internal-smk/`).

---

## 5. Panduan Penggunaan

### a. Menambahkan Jurusan Baru
Login sebagai ADMIN/OPERATOR → **Pengaturan → Jurusan → + Tambah Jurusan** → isi kode & nama → Simpan. Jurusan baru langsung tersedia di seluruh dropdown aplikasi tanpa perlu mengubah kode program.

### b. Menambahkan Bagian Audit Baru
**Pengaturan → Bagian Audit → + Tambah Bagian Audit** → isi kode, nama, kategori.

### c. Menambahkan Item Audit
**Audit → Item Audit → + Tambah Item Audit** → isi kode, indikator, bagian, jurusan (pilih `SEMUA JURUSAN` bila berlaku untuk semua), bobot, urutan, status.

### d. Melakukan Audit (Auditor)
1. **Audit → Audit Baru** → pilih periode, tanggal, jurusan/unit, bagian audit → **Mulai Isi Audit**.
2. Pada setiap item: pilih status (Sesuai / Sebagian Sesuai / Tidak Sesuai / Tidak Berlaku), isi keterangan, link bukti, temuan & rekomendasi bila ada.
3. Klik **💾 Simpan Sementara** kapan saja (progress tersimpan, dapat dilanjutkan nanti dari **Audit Berjalan**).
4. Jika ada aspek yang belum tercakup, klik **+ Tambah Item Audit** untuk mengusulkan item baru langsung dari halaman pengisian.
5. Setelah seluruh item terisi, klik **✔ Selesaikan Audit**.

### e. Melihat Hasil
**Hasil Audit** menampilkan dashboard, grafik status, nilai per jurusan/bagian, radar performa, dan tabel perbandingan jurusan. Gunakan filter jurusan/bagian/status untuk analisis lebih spesifik.

### f. Melihat Grafik
Seluruh grafik pada Dashboard & Hasil Audit (Chart.js) otomatis dihitung dari data `AUDIT_RESULT` di Google Sheets — tidak perlu input manual.

### g. Membuat Laporan
**Laporan** → pilih filter jurusan/bagian → **🔄 Buat Laporan** → **🖨 Cetak / Simpan PDF** (gunakan dialog cetak browser, pilih "Save as PDF"), atau **⬇ Export Temuan CSV** / **⬇ Export CSV** pada halaman Hasil Audit untuk data mentah.

### h. Tindak Lanjut Temuan
**Temuan → Daftar Temuan** → tambah/lihat temuan → klik ikon 📌 untuk membuat/memperbarui **Rencana Tindak Lanjut** (tindakan, PIC, deadline, status). Tab **Tindak Lanjut** menampilkan status keseluruhan dan menandai yang **terlambat**.

### i. Backup Data
Karena seluruh data tersimpan di Google Spreadsheet, backup cukup dilakukan lewat:
`File → Download` (Excel/CSV) atau `File → Make a copy` secara berkala di Google Sheets.

---

## 6. Role & Hak Akses

| Role      | Akses |
|-----------|-------|
| ADMIN     | Penuh — kelola pengguna, jurusan, bagian, item, verifikasi usulan item, lihat semua hasil |
| AUDITOR   | Melakukan audit, mengisi hasil, mengusulkan item baru, melihat hasil |
| PIMPINAN  | Melihat dashboard, hasil, grafik, laporan (tanpa mengubah data) |
| OPERATOR  | Membantu administrasi data (jurusan, bagian, item) |
| VIEWER    | Hanya melihat hasil tertentu |

---

## 7. Keamanan & Keandalan Data

- Password disimpan sebagai **hash SHA-256** di Google Sheets, tidak pernah dalam bentuk teks biasa di frontend.
- Setiap request API menyertakan **token sesi** (berlaku 8 jam) yang diverifikasi di sisi server (GAS), bukan hanya di frontend.
- Seluruh perubahan penting dicatat pada sheet `AUDIT_LOG` (waktu, pengguna, aksi, data).
- Jika koneksi terputus saat menyimpan hasil audit, data disimpan sementara di `localStorage` browser (bukan sebagai database utama) dan ditandai **"belum tersinkronisasi"**; klik ikon 🔄 di navbar untuk menyinkronkan ulang begitu koneksi kembali normal.

---

## 8. Troubleshooting

| Gejala | Kemungkinan Penyebab |
|---|---|
| Semua permintaan gagal / toast "GAS_URL belum dikonfigurasi" | `GAS_URL` di `js/config.js` belum diisi |
| Error "Sesi telah berakhir" | Token login sudah lewat 8 jam, silakan login kembali |
| Data tidak muncul setelah deploy ulang GAS | Pastikan membuat **New deployment** baru, bukan hanya menyimpan kode |
| Error CORS di console browser | Pastikan `Who has access` pada deployment Web App diset **Anyone**, dan request dikirim sebagai `text/plain` (sudah ditangani otomatis oleh `js/api.js`) |


Berikut prompt dari GPT yang diberikan ke Anthropic Cloudeyang bisa langsung digunakan untuk meminta AI membuat **aplikasi Audit Internal SMK berbasis GitHub + Google Sheets + Google Apps Script**. Saya buat cukup detail agar AI tidak hanya membuat tampilan, tetapi juga arsitektur data, audit multi-jurusan, penambahan item audit, bukti, grafik, dan laporan.

# PROMPT PEMBUATAN APLIKASI AUDIT INTERNAL SEKOLAH KEJURUAN

Buatkan sebuah **aplikasi web Audit Internal Sekolah Kejuruan (SMK)** yang profesional, modern, responsif, futuristik, mudah digunakan, dan dapat digunakan untuk melakukan audit seluruh lini sekolah.

Aplikasi akan di-hosting melalui **GitHub Pages**, sedangkan seluruh data dinamis disimpan pada **Google Spreadsheet melalui Google Apps Script (GAS)**.

## 1. BACKEND GOOGLE SHEETS

Gunakan Google Spreadsheet berikut sebagai database utama:

[https://docs.google.com/spreadsheets/d/1XhESBBj5zf0bD0ICc4WaLsSPcRIEtGV0V-VcHnFD_2M/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1XhESBBj5zf0bD0ICc4WaLsSPcRIEtGV0V-VcHnFD_2M/edit?usp=sharing)

Jangan menyimpan data audit hanya di localStorage.

Semua data penting harus dapat:

* Ditambahkan
* Dibaca
* Diperbarui
* Dihapus
* Dicari
* Difilter
* Direkap
* Dianalisis
* Ditampilkan dalam grafik

Gunakan **Google Apps Script Web App** sebagai API antara GitHub Pages dan Google Sheets.

Pisahkan konfigurasi seperti:

```javascript
const CONFIG = {
    GAS_URL: "ISI_URL_GOOGLE_APPS_SCRIPT",
    SCHOOL_NAME: "SMK NEGERI 1 SANDEN",
    APP_NAME: "Sistem Audit Internal SMK"
};
```

Buat struktur Google Sheets yang rapi dan mudah dikembangkan.

Minimal siapkan sheet:

1. `USERS`
2. `JURUSAN`
3. `AUDIT_AREA`
4. `AUDIT_ITEMS`
5. `AUDIT_SESSION`
6. `AUDIT_RESULT`
7. `AUDIT_EVIDENCE`
8. `AUDIT_FINDINGS`
9. `ACTION_PLAN`
10. `AUDIT_LOG`

Jika diperlukan, tambahkan sheet lain.

---

# 2. KONSEP UTAMA APLIKASI

Aplikasi digunakan oleh:

### ADMIN

Admin dapat:

* Mengelola pengguna
* Mengelola auditor
* Mengelola jurusan
* Mengelola unit/bagian sekolah
* Mengelola kategori audit
* Menambah item audit
* Mengubah item audit
* Menghapus item audit
* Mengaktifkan/nonaktifkan item audit
* Melihat seluruh hasil audit
* Melihat dashboard
* Membuat laporan

### AUDITOR

Auditor dapat:

* Memilih periode audit
* Memilih jurusan/unit yang diaudit
* Memilih bagian audit
* Melihat item audit
* Memberikan status audit
* Mengisi keterangan
* Mengunggah/menyimpan bukti
* Menambahkan temuan
* Memberikan rekomendasi
* Memberikan nilai
* Menyimpan audit sementara
* Melanjutkan audit yang belum selesai
* Menyelesaikan audit
* Melihat hasil audit

### PIMPINAN / KEPALA SEKOLAH

Dapat melihat:

* Dashboard keseluruhan
* Nilai audit sekolah
* Nilai setiap jurusan
* Nilai setiap bagian
* Temuan audit
* Bukti audit
* Persentase kepatuhan
* Grafik perkembangan
* Rekomendasi
* Rencana tindak lanjut
* Status tindak lanjut

---

# 3. STRUKTUR AUDIT HARUS BISA MENAMPUNG BANYAK JURUSAN

Jangan membuat aplikasi hanya untuk satu jurusan.

Sistem harus mendukung jumlah jurusan yang dinamis.

Contoh:

* Rekayasa Perangkat Lunak
* Teknik Jaringan Komputer dan Telekomunikasi
* Teknik Kendaraan Ringan
* Teknik Sepeda Motor
* Teknik Elektronika
* Teknik Ketenagalistrikan
* Tata Busana
* Kuliner
* Manajemen Perkantoran
* Akuntansi
* dan jurusan lainnya.

Admin dapat menambahkan jurusan baru kapan saja tanpa mengubah kode program.

Setiap hasil audit harus mempunyai relasi:

```text
Sekolah
   ↓
Jurusan / Unit
   ↓
Bagian Audit
   ↓
Kategori
   ↓
Item Audit
   ↓
Hasil Audit
   ↓
Bukti
   ↓
Temuan
   ↓
Tindak Lanjut
```

---

# 4. BAGIAN / AREA AUDIT

Buat sistem audit yang mencakup seluruh lini sekolah.

Minimal sediakan kategori berikut:

## A. MANAJEMEN SEKOLAH

Contoh:

* Visi dan misi
* Rencana kerja sekolah
* Struktur organisasi
* SOP
* Evaluasi program
* Pengelolaan administrasi
* Pengelolaan risiko
* Dokumentasi kebijakan

## B. KURIKULUM

* Dokumen kurikulum
* CP
* TP
* ATP
* Modul ajar
* Program tahunan
* Program semester
* Jadwal pembelajaran
* Administrasi guru
* Asesmen
* Evaluasi pembelajaran

## C. PEMBELAJARAN

* Pelaksanaan pembelajaran
* Metode pembelajaran
* Media pembelajaran
* Project Based Learning
* Teaching Factory
* Praktik
* Penggunaan teknologi
* Evaluasi siswa
* Remedial
* Pengayaan

## D. KESISWAAN

* Data peserta didik
* Kehadiran
* Tata tertib
* Pembinaan karakter
* Organisasi siswa
* Prestasi
* Pelanggaran
* Konseling
* Kegiatan ekstrakurikuler

## E. SUMBER DAYA MANUSIA

* Data guru
* Data tenaga kependidikan
* Kompetensi
* Sertifikasi
* Pengembangan profesional
* Kehadiran
* Pembagian tugas
* Kinerja
* Pelatihan

## F. SARANA DAN PRASARANA

* Ruang kelas
* Laboratorium
* Bengkel
* Peralatan
* Inventaris
* Kondisi fasilitas
* Pemeliharaan
* Keselamatan kerja
* Ketersediaan alat praktik

## G. JURUSAN / PROGRAM KEAHLIAN

Setiap jurusan mempunyai audit tersendiri.

Contoh:

* Administrasi jurusan
* Kurikulum jurusan
* Laboratorium/bengkel
* Peralatan praktik
* SOP praktik
* K3
* Teaching Factory
* Proyek siswa
* Kompetensi siswa
* Kerja sama industri
* Sertifikasi
* Produk/jasa
* Dokumentasi karya

## H. HUBUNGAN INDUSTRI / DUDI

* Kerja sama industri
* PKL
* MoU
* Monitoring PKL
* Evaluasi PKL
* Sinkronisasi kurikulum
* Guru tamu
* Praktisi industri
* Rekrutmen
* Sertifikasi industri

## I. PRAKTIK KERJA LAPANGAN

* Data peserta
* Tempat PKL
* Kehadiran
* Monitoring
* Pembimbing
* Jurnal
* Penilaian
* Laporan
* Evaluasi

## J. KEUANGAN

* Perencanaan
* Penggunaan anggaran
* Bukti transaksi
* Pelaporan
* Transparansi
* Pengendalian

## K. PERPUSTAKAAN

* Koleksi
* Administrasi
* Peminjaman
* Digitalisasi
* Pelayanan
* Kondisi fasilitas

## L. TEKNOLOGI INFORMASI

* Website
* Sistem informasi
* Keamanan data
* Backup
* Infrastruktur jaringan
* Akun pengguna
* Pengelolaan server
* Sistem digital sekolah

## M. K3 / KESELAMATAN KERJA

* APD
* SOP keselamatan
* Jalur evakuasi
* APAR
* Kotak P3K
* Rambu keselamatan
* Kondisi lingkungan kerja
* Prosedur keadaan darurat

## N. LINGKUNGAN SEKOLAH

* Kebersihan
* Sanitasi
* Pengelolaan sampah
* Taman
* Drainase
* Kesehatan lingkungan
* Keamanan

## O. MUTU DAN PENJAMINAN MUTU

* Standar mutu
* Evaluasi
* Monitoring
* Tindak lanjut
* Bukti perbaikan
* Evaluasi berkelanjutan

## P. ADMINISTRASI DAN TATA USAHA

* Surat masuk/keluar
* Arsip
* Data siswa
* Data guru
* Administrasi sekolah
* Dokumen resmi

## Q. KEPEGAWAIAN

* Data kepegawaian
* Kehadiran
* Beban kerja
* Penilaian kinerja
* Pengembangan kompetensi

## R. KEGIATAN EKSTRAKURIKULER

* Program kerja
* Pembina
* Kehadiran
* Kegiatan
* Prestasi
* Dokumentasi

Sistem harus memungkinkan ADMIN menambahkan bagian audit baru.

---

# 5. ITEM AUDIT DINAMIS

Ini merupakan fitur penting.

Auditor/Admin tidak boleh terbatas pada item audit yang sudah dibuat oleh developer.

Sediakan menu:

**"Kelola Item Audit"**

Admin atau pengguna dengan hak akses tertentu dapat:

* Tambah item
* Edit item
* Hapus item
* Duplikasi item
* Aktif/nonaktifkan item
* Mengatur urutan item
* Menentukan bobot
* Menentukan bagian
* Menentukan jurusan/unit
* Menentukan jenis audit

Form item audit:

```text
Kode Item
Nama Item
Pertanyaan / Indikator Audit
Deskripsi
Bagian Audit
Sub Bagian
Jurusan / Unit
Jenis Bukti
Bobot
Status Aktif
Urutan
```

Contoh:

```text
Kode       : K3-001
Bagian     : K3
Indikator  : Apakah APAR tersedia dan masih dalam masa berlaku?
Bobot      : 5
Jenis Bukti: Foto / Dokumen
Status     : Aktif
```

Jika item berlaku untuk seluruh sekolah, gunakan:

```text
Jurusan = SEMUA
```

Jika hanya berlaku untuk jurusan tertentu, pilih jurusan tersebut.

---

# 6. HALAMAN AUDIT

Buat halaman khusus:

## AUDIT BARU

Auditor terlebih dahulu memilih:

```text
Periode Audit
Tanggal Audit
Auditor
Jurusan / Unit
Bagian Audit
```

Setelah itu sistem menampilkan daftar item audit.

Contoh tampilan:

```text
AUDIT SARANA DAN PRASARANA
Jurusan: Rekayasa Perangkat Lunak

[1] Apakah laboratorium memiliki daftar inventaris terbaru?

Status:
○ Sesuai
○ Sebagian Sesuai
○ Tidak Sesuai
○ Tidak Berlaku

Keterangan:
[........................................]

Bukti:
[ Upload / Link Bukti ]

Temuan:
[........................................]

Rekomendasi:
[........................................]
```

Auditor cukup:

1. Membaca indikator
2. Memilih status
3. Mengisi keterangan jika diperlukan
4. Memasukkan bukti
5. Mengisi temuan jika ada
6. Menyimpan

---

# 7. STATUS AUDIT

Gunakan status:

### SESUAI

Persyaratan terpenuhi.

### SEBAGIAN SESUAI

Sebagian persyaratan sudah terpenuhi tetapi masih ada kekurangan.

### TIDAK SESUAI

Persyaratan belum terpenuhi.

### TIDAK BERLAKU

Item tidak relevan dengan bagian/jurusan tersebut.

Gunakan badge warna yang berbeda dan mudah dipahami.

---

# 8. BUKTI AUDIT

Auditor dapat memasukkan:

* Link Google Drive
* Link dokumen
* Link foto
* Link video
* Link website
* Nomor dokumen
* Keterangan bukti

Jika memungkinkan, tambahkan fitur upload bukti.

Bukti harus mempunyai:

```text
ID Bukti
ID Audit
ID Item
Nama File
URL
Jenis File
Tanggal
Pengunggah
Keterangan
```

Tampilkan preview jika file berupa gambar.

---

# 9. PISAHKAN MENU AUDIT DAN HASIL AUDIT

Jangan mencampurkan proses audit dengan hasil audit.

Buat menu utama:

### 📋 AUDIT

Digunakan untuk melakukan pemeriksaan.

Submenu:

* Audit Baru
* Audit Berjalan
* Audit Selesai
* Item Audit
* Jadwal Audit

### 📊 HASIL AUDIT

Digunakan untuk melihat hasil.

Submenu:

* Dashboard
* Hasil Sekolah
* Hasil Jurusan
* Hasil Bagian
* Temuan
* Rekomendasi
* Tindak Lanjut
* Laporan

Dengan demikian proses pengisian auditor tidak bercampur dengan analisis hasil.

---

# 10. DASHBOARD HASIL AUDIT

Buat dashboard profesional.

Tampilkan kartu:

```text
TOTAL AUDIT
TOTAL ITEM
SESUAI
SEBAGIAN SESUAI
TIDAK SESUAI
TIDAK BERLAKU
TOTAL TEMUAN
TINDAK LANJUT
```

Tambahkan:

### Grafik Nilai Audit Sekolah

Menampilkan persentase kepatuhan.

### Grafik Per Jurusan

Contoh:

```text
RPL                         92%
TJKT                        87%
TKR                         81%
TSM                         90%
AKL                         95%
```

### Grafik Per Bagian

Contoh:

```text
Kurikulum                   94%
Kesiswaan                   88%
Sarana                      79%
K3                          83%
SDM                         91%
DUDI                        86%
```

---

# 11. GRAFIK

Gunakan library seperti **Chart.js**.

Minimal buat:

1. Doughnut Chart status audit
2. Bar Chart nilai tiap jurusan
3. Bar Chart nilai tiap bagian
4. Radar Chart performa sekolah
5. Line Chart perkembangan audit berdasarkan periode
6. Bar Chart jumlah temuan
7. Grafik tindak lanjut
8. Grafik perbandingan antarjurusan

Semua grafik harus otomatis mengambil data dari Google Sheets.

---

# 12. RUMUS NILAI

Gunakan sistem penilaian yang dapat dikonfigurasi.

Contoh:

```text
Sesuai            = 100%
Sebagian Sesuai   = 50%
Tidak Sesuai      = 0%
Tidak Berlaku     = tidak dihitung
```

Jika menggunakan bobot:

```text
Nilai =
Σ (Nilai Item × Bobot)
/
Σ Bobot Item yang Berlaku
```

Tampilkan hasil dalam:

```text
0–59    = Perlu Perbaikan
60–74   = Cukup
75–89   = Baik
90–100  = Sangat Baik
```

Kategori nilai juga harus dapat dikonfigurasi.

---

# 13. TEMUAN AUDIT

Buat menu khusus **TEMUAN**.

Setiap temuan mempunyai:

```text
ID Temuan
Nomor Audit
Jurusan
Bagian
Item Audit
Jenis Temuan
Deskripsi
Bukti
Risiko
Rekomendasi
Prioritas
PIC
Deadline
Status
```

Jenis temuan:

* Minor
* Major
* Observasi
* Peluang Perbaikan

Prioritas:

* Rendah
* Sedang
* Tinggi
* Kritis

---

# 14. RENCANA TINDAK LANJUT

Setiap temuan dapat dibuat menjadi Action Plan.

Contoh:

```text
Temuan:
APAR laboratorium belum diperiksa.

Tindakan:
Melakukan pemeriksaan dan penggantian APAR.

PIC:
Kepala Bengkel

Deadline:
30 September 2026

Status:
Belum
Dalam Proses
Selesai
Diverifikasi
```

Dashboard harus menampilkan:

```text
Total Tindak Lanjut
Belum Selesai
Dalam Proses
Selesai
Terlambat
```

---

# 15. FITUR FILTER

Berikan filter yang sangat lengkap:

* Tahun
* Periode
* Jurusan
* Bagian
* Auditor
* Status
* Nilai
* Prioritas
* Status tindak lanjut

Semua filter dapat digunakan secara bersamaan.

Tambahkan tombol:

**Reset Filter**

---

# 16. PENCARIAN

Sediakan pencarian global.

Pengguna dapat mencari berdasarkan:

* Nama item
* Kode item
* Jurusan
* Auditor
* Temuan
* Keterangan
* Nomor audit

---

# 17. LAPORAN AUDIT

Buat halaman laporan yang dapat dicetak.

Format laporan:

```text
LAPORAN AUDIT INTERNAL
SMK NEGERI 1 SANDEN

Periode:
Tanggal:

Jurusan:
Bagian:

Auditor:

RINGKASAN HASIL

Nilai Audit:
Kategori:

Jumlah Item:
Sesuai:
Sebagian Sesuai:
Tidak Sesuai:

TEMUAN

REKOMENDASI

RENCANA TINDAK LANJUT

KESIMPULAN
```

Sediakan tombol:

* Cetak
* Simpan PDF
* Print
* Export CSV
* Export Excel jika memungkinkan

---

# 18. LAPORAN PER JURUSAN

Buat laporan khusus masing-masing jurusan.

Contoh:

```text
LAPORAN AUDIT
JURUSAN RPL

Nilai Total        : 91.4%
Kurikulum          : 94%
Sarana             : 87%
K3                 : 92%
Pembelajaran       : 93%
DUDI               : 89%

Temuan             : 7
Major              : 1
Minor              : 4
Observasi          : 2
```

Bisa memilih jurusan dari dropdown.

---

# 19. PERBANDINGAN JURUSAN

Buat fitur:

**"Perbandingan Jurusan"**

Contoh:

```text
RPL       92%
TJKT      87%
TKR       81%
TSM       90%
AKL       95%
```

Tampilkan dalam grafik dan tabel.

Tujuannya bukan untuk memberikan label negatif kepada jurusan, tetapi untuk membantu sekolah menentukan **prioritas peningkatan mutu**.

---

# 20. AUDIT BERDASARKAN PERIODE

Sistem mendukung:

* Audit Harian
* Audit Bulanan
* Audit Semester
* Audit Tahunan
* Audit Khusus

Periode dapat dibuat secara dinamis.

Contoh:

```text
2026/2027 Semester 1
2026/2027 Semester 2
```

---

# 21. AUDIT HISTORY

Simpan seluruh riwayat audit.

Jangan menimpa hasil audit lama.

Contoh:

```text
Audit Agustus 2026
Audit September 2026
Audit Oktober 2026
Audit Semester 1
Audit Semester 2
```

Sehingga dapat dibandingkan perkembangannya.

---

# 22. AUDITOR DAPAT MENAMBAHKAN ITEM SAAT AUDIT

Ini fitur WAJIB.

Pada halaman audit, sediakan tombol:

**+ TAMBAH ITEM AUDIT**

Jika auditor menemukan aspek yang belum tersedia, auditor dapat menambahkan item baru.

Form:

```text
Nama Item
Indikator
Bagian
Sub Bagian
Jurusan
Status
Keterangan
Bobot
```

Setelah disimpan:

* Item langsung muncul pada audit saat ini
* Item dapat disimpan ke master `AUDIT_ITEMS`
* Admin dapat melakukan verifikasi
* Item dapat digunakan pada audit berikutnya

Berikan status:

```text
Item Baru
Menunggu Verifikasi
Disetujui
Ditolak
```

Jika auditor tidak mempunyai hak untuk mengubah master item, item baru masuk sebagai **usulan item audit** dan admin yang menyetujuinya.

---

# 23. SISTEM USER DAN HAK AKSES

Buat role:

### ADMIN

Akses penuh.

### AUDITOR

Dapat melakukan audit dan melihat audit yang menjadi kewenangannya.

### PIMPINAN

Dapat melihat dashboard, hasil, grafik dan laporan.

### OPERATOR

Dapat membantu administrasi dan data.

### VIEWER

Hanya dapat melihat hasil tertentu.

Jangan menaruh password sensitif secara langsung di JavaScript frontend.

---

# 24. DESAIN UI/UX

Buat desain:

* Modern
* Futuristik
* Profesional
* Elegan
* Responsif
* Mobile friendly
* Desktop friendly
* Tablet friendly

Gunakan konsep dashboard sekolah modern.

Warna dapat menggunakan kombinasi:

* Biru
* Navy
* Cyan
* Putih
* Sedikit aksen ungu

Gunakan:

* Glassmorphism
* Soft shadow
* Card
* Gradient
* Icon modern
* Animasi ringan
* Hover effect
* Loading animation

Tetapi jangan membuat animasi terlalu berat.

Aplikasi harus tetap cepat.

---

# 25. RESPONSIVE MOBILE

Pada smartphone:

* Sidebar menjadi hamburger menu
* Tabel dapat di-scroll horizontal
* Form menjadi satu kolom
* Tombol mudah ditekan
* Grafik responsif
* Modal tidak keluar layar
* Sticky header
* Floating action button jika diperlukan

Auditor harus dapat melakukan audit menggunakan smartphone.

---

# 26. KOMPONEN FILE GITHUB

Pisahkan kode dengan struktur:

```text
/
├── index.html
├── dashboard.html
├── audit.html
├── hasil.html
├── temuan.html
├── laporan.html
├── pengaturan.html
│
├── css/
│   ├── style.css
│   ├── dashboard.css
│   ├── audit.css
│   └── responsive.css
│
├── js/
│   ├── config.js
│   ├── app.js
│   ├── api.js
│   ├── auth.js
│   ├── audit.js
│   ├── result.js
│   ├── finding.js
│   ├── report.js
│   ├── chart.js
│   └── utils.js
│
└── assets/
    ├── logo.png
    └── icons/
```

Google Apps Script:

```text
Code.gs
Config.gs
Auth.gs
Audit.gs
Result.gs
Finding.gs
Report.gs
Utils.gs
```

Jika struktur lebih baik dapat digunakan, silakan sesuaikan.

---

# 27. API GOOGLE APPS SCRIPT

Buat API untuk:

```text
GET
POST
PUT
DELETE
```

Minimal mendukung operasi:

```text
getUsers()
getDepartments()
getMajors()
getAuditAreas()
getAuditItems()
getAuditSessions()
getAuditResults()
getFindings()
getActionPlans()

createAudit()
saveAuditResult()
updateAuditResult()
createAuditItem()
updateAuditItem()
deleteAuditItem()
createFinding()
updateFinding()
createActionPlan()
updateActionPlan()
```

Pastikan API memiliki validasi data dan error handling.

---

# 28. ERROR HANDLING

Jangan hanya menampilkan:

```text
Gagal menyimpan data
```

Berikan pesan yang jelas.

Contoh:

```text
❌ Gagal menyimpan audit.

Kemungkinan penyebab:
• Koneksi internet bermasalah
• Google Apps Script tidak aktif
• Spreadsheet tidak dapat diakses
• Data belum lengkap

Silakan coba kembali.
```

Tambahkan loading:

```text
Menyimpan...
Memuat data...
Menghitung hasil...
```

---

# 29. DATA TIDAK BOLEH HILANG

Jika koneksi sementara gagal:

* Jangan langsung menghapus input auditor.
* Simpan sementara pada browser.
* Tampilkan status "Belum tersinkronisasi".
* Ketika koneksi kembali, sediakan tombol sinkronisasi.

Contoh:

```text
🟡 3 data belum tersinkronisasi
[Sinkronkan Sekarang]
```

Namun Google Sheets tetap menjadi database utama.

---

# 30. VALIDASI

Validasi:

* Field wajib
* Format tanggal
* Nilai bobot
* Status
* ID
* Jurusan
* Bagian
* Auditor

Gunakan ID unik seperti:

```text
AUD-20260819-0001
ITEM-0001
FIND-0001
ACT-0001
```

---

# 31. KEAMANAN

Jangan menyimpan:

* Password admin
* Secret key
* Token pribadi

secara terbuka di frontend.

Validasi juga harus dilakukan di Google Apps Script.

Tambahkan:

* Role checking
* Input sanitization
* Validasi request
* Audit log
* Timestamp
* User ID

Setiap perubahan penting dicatat:

```text
Tanggal
User
Aksi
Data
IP jika tersedia
```

---

# 32. DASHBOARD UTAMA

Dashboard utama harus menampilkan:

```text
SISTEM AUDIT INTERNAL
SMK NEGERI 1 SANDEN

Selamat datang, Auditor

┌──────────────┐
│ Total Audit  │
└──────────────┘

┌──────────────┐
│ Nilai Sekolah│
└──────────────┘

┌──────────────┐
│ Temuan       │
└──────────────┘

┌──────────────┐
│ Tindak Lanjut│
└──────────────┘
```

Kemudian grafik:

* Status Audit
* Nilai Jurusan
* Nilai Bagian
* Tren Audit
* Temuan
* Tindak Lanjut

---

# 33. STRUKTUR DATA

Buat struktur data yang normal dan mudah dikembangkan.

Contoh `AUDIT_ITEMS`:

```text
id
code
question
description
area_id
sub_area
major_id
evidence_type
weight
status
created_by
created_at
updated_at
```

Contoh `AUDIT_RESULTS`:

```text
id
audit_id
item_id
major_id
area_id
status
score
notes
evidence_url
finding
recommendation
auditor
created_at
updated_at
```

Contoh `FINDINGS`:

```text
id
audit_id
result_id
major_id
area_id
type
priority
description
evidence
recommendation
pic
deadline
status
created_at
updated_at
```

---

# 34. FITUR TAMBAHAN YANG DIHARAPKAN

Jika memungkinkan tambahkan:

### Dark Mode

Mode terang dan gelap.

### Notifikasi

Notifikasi jika:

* Audit belum selesai
* Ada temuan baru
* Tindak lanjut mendekati deadline
* Tindak lanjut terlambat

### Progress Audit

Contoh:

```text
Progress Audit
████████████████░░░░ 80%

40 dari 50 item selesai
```

### Autosave

Simpan jawaban sementara secara otomatis.

### Duplicate Audit

Auditor dapat menggandakan template audit periode sebelumnya.

### Template Audit

Admin dapat membuat template.

Contoh:

```text
Template Audit Sekolah
Template Audit Jurusan
Template Audit K3
Template Audit Bengkel
Template Audit Kurikulum
```

---

# 35. HASIL HARUS TERPISAH DENGAN PROSES AUDIT

Sangat penting:

Jangan menampilkan dashboard hasil secara berlebihan ketika auditor sedang mengisi audit.

Struktur navigasi:

```text
🏠 Dashboard

📋 AUDIT
   ├── Audit Baru
   ├── Audit Berjalan
   ├── Riwayat Audit
   ├── Item Audit
   └── Jadwal Audit

📊 HASIL
   ├── Dashboard Hasil
   ├── Hasil Sekolah
   ├── Hasil Jurusan
   ├── Hasil Bagian
   ├── Grafik
   └── Perbandingan

⚠ TEMUAN
   ├── Daftar Temuan
   └── Tindak Lanjut

📄 LAPORAN
   ├── Laporan Audit
   ├── Laporan Jurusan
   └── Rekap Sekolah

⚙ PENGATURAN
   ├── Jurusan
   ├── Bagian Audit
   ├── Pengguna
   └── Konfigurasi
```

---

# 36. HASIL AKHIR YANG DIMINTA

Jangan hanya memberikan contoh desain.

Buat **kode aplikasi yang benar-benar dapat dijalankan**.

Berikan secara lengkap:

1. `index.html`
2. Semua HTML halaman
3. Semua CSS
4. Semua JavaScript
5. `config.js`
6. Google Apps Script
7. Struktur Google Spreadsheet
8. Header setiap sheet
9. Instruksi deployment GAS
10. Instruksi konfigurasi GitHub Pages
11. Instruksi menghubungkan GitHub dengan Google Sheets
12. Cara menambahkan jurusan
13. Cara menambahkan bagian audit
14. Cara menambahkan item audit
15. Cara auditor melakukan audit
16. Cara melihat hasil
17. Cara melihat grafik
18. Cara membuat laporan
19. Cara melakukan tindak lanjut
20. Cara backup data

Pastikan semua file saling terhubung dan tidak terdapat fungsi JavaScript yang hilang.

Jangan menggunakan data dummy sebagai database utama.

Jika menggunakan data contoh, tandai dengan jelas bahwa data tersebut hanya contoh.

---

# 37. PRIORITAS UTAMA

Prioritaskan:

**1. Data tersimpan dengan benar di Google Sheets**

**2. Audit dapat dilakukan dengan cepat**

**3. Auditor cukup memilih status + mengisi keterangan + bukti**

**4. Item audit dapat ditambahkan secara dinamis**

**5. Sistem mendukung banyak jurusan**

**6. Hasil audit terpisah dari halaman audit**

**7. Grafik otomatis berdasarkan data aktual**

**8. Temuan dan tindak lanjut terdokumentasi**

**9. Riwayat audit tidak hilang**

**10. Aplikasi nyaman digunakan melalui smartphone**

Buat aplikasi dengan arsitektur yang **modular, scalable, maintainable, aman, cepat, dan mudah dikembangkan**.

Gunakan Bahasa Indonesia untuk seluruh antarmuka.

Nama aplikasi:

**SISTEM AUDIT INTERNAL SMK**

Subjudul:

**Digital Quality Assurance & Continuous Improvement System**

Sekolah:

**SMK NEGERI 1 SANDEN**
