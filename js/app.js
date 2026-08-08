// ======================================
// Syahriyyah App v2
// app.js - Bagian 1
// ======================================

import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ======================================
// Format Rupiah
// ======================================

function rupiah(nilai) {
  return "Rp " + Number(nilai || 0).toLocaleString("id-ID");
}


// ======================================
// Variabel Global
// ======================================

let totalSantri = 0;
let totalMasuk = 0;
let totalKeluar = 0;
let stokBeras = 0;

// ======================================
// Data Laporan Keuangan
// ======================================

let semuaPembayaran = [];
let semuaPengeluaran = [];

// ======================================

// Rekap Berdasarkan Periode

// ======================================

let masukHariIni = 0;

let masukBulanIni = 0;

let masukTahunIni = 0;

let keluarHariIni = 0;

let keluarBulanIni = 0;

let keluarTahunIni = 0;

const pemasukan = {

  SPP: 0,

  Syahriyyah: 0,

  Infaq: 0,

  Kas: 0,

  Beras: 0,

  Lainnya: 0

};

const pengeluaran = {

  SPP: 0,

  Syahriyyah: 0,

  Infaq: 0,

  Kas: 0,

  Beras: 0,

  Lainnya: 0

}
// ======================================
// Reset Perhitungan
// ======================================

function resetData() {

  totalMasuk = 0;
  totalKeluar = 0;
  stokBeras = 0;

  masukHariIni = 0;
  masukBulanIni = 0;
  masukTahunIni = 0;

  keluarHariIni = 0;
  keluarBulanIni = 0;
  keluarTahunIni = 0;
  
  Object.keys(pemasukan).forEach(key => {
    pemasukan[key] = 0;
  });

  Object.keys(pengeluaran).forEach(key => {
    pengeluaran[key] = 0;
  });

}

// ======================================
// Baca Tanggal Transaksi
// ======================================
function bacaTanggal(data) {
    const nilaiTanggal =
        data.tanggal ||
        data.date ||
        data.createdAt ||
        data.waktu;
    if (!nilaiTanggal) return null;
    // Firebase Timestamp
    if (nilaiTanggal?.toDate) {
        return nilaiTanggal.toDate();
    }
    // JavaScript Date
    if (nilaiTanggal instanceof Date) {
        return nilaiTanggal;
    }
    // Jika angka timestamp
    if (typeof nilaiTanggal === "number") {
        return new Date(nilaiTanggal);
    }
    // Jika string
    if (typeof nilaiTanggal === "string") {
        const tanggal = new Date(nilaiTanggal);
        if (!isNaN(tanggal.getTime())) {
            return tanggal;
        }
    }
    return null;
}
// ======================================
// Cek Periode
// ======================================
function tanggalHariIni(tanggal) {
    if (!tanggal) return false;
    const sekarang = new Date();
    return (
        tanggal.getDate() === sekarang.getDate() &&
        tanggal.getMonth() === sekarang.getMonth() &&
        tanggal.getFullYear() === sekarang.getFullYear()
    );
}
function tanggalBulanIni(tanggal) {
    if (!tanggal) return false;
    const sekarang = new Date();
    return (
        tanggal.getMonth() === sekarang.getMonth() &&
        tanggal.getFullYear() === sekarang.getFullYear()
    );
}
function tanggalTahunIni(tanggal) {
    if (!tanggal) return false;
    const sekarang = new Date();
    return (
        tanggal.getFullYear() === sekarang.getFullYear()
    );
}

// ======================================
// Ambil Semua Data Firebase
// ======================================

async function ambilDataFirebase() {

  resetData();

  const santriSnapshot =
    await getDocs(collection(db, "santri"));

  const pembayaranSnapshot =
    await getDocs(collection(db, "payments"));

  const pengeluaranSnapshot =
    await getDocs(collection(db, "expenses"));

semuaPembayaran = [];

pembayaranSnapshot.forEach((item) => {

    semuaPembayaran.push({
        id: item.id,
        ...item.data()
    });

});


semuaPengeluaran = [];

pengeluaranSnapshot.forEach((item) => {

    semuaPengeluaran.push({
        id: item.id,
        ...item.data()
    });

});
  
  totalSantri = santriSnapshot.size;

  return {
    pembayaranSnapshot,
    pengeluaranSnapshot
  };

}

// ======================================
// Hitung Pemasukan
// ======================================
function hitungPemasukan(snapshot) {
    snapshot.forEach((item) => {
        const data = item.data();
        const tanggal = bacaTanggal(data);
        // ==============================
        // Data Beras
        // ==============================
        if (data.satuan === "Liter") {
            const liter = Number(data.jumlah || 0);
            stokBeras += liter;
            pemasukan.Beras += liter;
            if (tanggal) {
                if (tanggalHariIni(tanggal)) {
                    masukHariIni += liter;
                }
                if (tanggalBulanIni(tanggal)) {
                    masukBulanIni += liter;
                }
                if (tanggalTahunIni(tanggal)) {
                    masukTahunIni += liter;
                }
            }
            return;
        }
        // ==============================
        // Data Uang
        // ==============================
        const nominal = Number(data.nominal || 0);
        totalMasuk += nominal;
        // Rekap periode
        if (tanggal) {
            if (tanggalHariIni(tanggal)) {
                masukHariIni += nominal;
            }
            if (tanggalBulanIni(tanggal)) {
                masukBulanIni += nominal;
            }
            if (tanggalTahunIni(tanggal)) {
                masukTahunIni += nominal;
            }
        }
        // ==============================
        // Jenis Pembayaran
        // ==============================
        switch (data.jenis) {
            case "SPP":
                pemasukan.SPP += nominal;
                break;
            case "Syahriyyah":
                pemasukan.Syahriyyah += nominal;
                break;
            case "Infaq":
                pemasukan.Infaq += nominal;
                break;
            case "Kas":
                pemasukan.Kas += nominal;
                break;
            case "Beras":
                pemasukan.Beras += nominal;
                break;
            default:
                pemasukan.Lainnya += nominal;
        }
    });
}
// ======================================
// Hitung Pengeluaran
// ======================================
function hitungPengeluaran(snapshot) {
    snapshot.forEach((item) => {
        const data = item.data();
        const tanggal = bacaTanggal(data);
        // ==============================
        // Data Beras
        // ==============================
        if (data.satuan === "Liter") {
            const liter = Number(data.jumlah || 0);
            stokBeras -= liter;
            pengeluaran.Beras += liter;
            if (tanggal) {
                if (tanggalHariIni(tanggal)) {
                    keluarHariIni += liter;
                }
                if (tanggalBulanIni(tanggal)) {
                    keluarBulanIni += liter;
                }
                if (tanggalTahunIni(tanggal)) {
                    keluarTahunIni += liter;
                }
            }
            return;
        }
        // ==============================
        // Data Uang
        // ==============================
        const nominal =
            Number(data.jumlah || data.nominal || 0);
        totalKeluar += nominal;
        // Rekap periode
        if (tanggal) {
            if (tanggalHariIni(tanggal)) {
                keluarHariIni += nominal;
            }
            if (tanggalBulanIni(tanggal)) {
                keluarBulanIni += nominal;
            }
            if (tanggalTahunIni(tanggal)) {
                keluarTahunIni += nominal;
            }
        }
        // ==============================
        // Jenis Pengeluaran
        // ==============================
        switch (data.jenis) {
            case "SPP":
                pengeluaran.SPP += nominal;
                break;
            case "Syahriyyah":
                pengeluaran.Syahriyyah += nominal;
                break;
            case "Infaq":
                pengeluaran.Infaq += nominal;
                break;
            case "Kas":
                pengeluaran.Kas += nominal;
                break;
            case "Beras":
                pengeluaran.Beras += nominal;
                break;
            default:
                pengeluaran.Lainnya += nominal;
        }
    });
}
// ======================================
// Tampilkan Dashboard / Rekap
// ======================================

function tampilkanDashboard() {

    const jenis =
        document.getElementById("jenisDashboard")?.value || "syahriyyah";

    const mode =
        document.getElementById("modeBeras")?.value || "liter";

    const totalSantriEl = document.getElementById("totalSantri");
    const totalSaldoEl = document.getElementById("totalSaldo");
    const totalMasukEl = document.getElementById("totalMasuk");
    const totalKeluarEl = document.getElementById("totalKeluar");

    const judulEl = document.getElementById("judulJenis");
    const masukEl = document.getElementById("masuk");
    const keluarEl = document.getElementById("keluar");
    const saldoEl = document.getElementById("saldo");

    if (totalSantriEl) {
        totalSantriEl.textContent = totalSantri;
    }

    const namaJenis = {
        syahriyyah: "Syahriyyah",
        spp: "SPP",
        kas: "Kas",
        infaq: "Infaq",
        beras: "Beras"
    };

    if (jenis === "beras") {

        if (mode === "liter") {

            totalMasukEl && (totalMasukEl.textContent = pemasukan.Beras + " Liter");
            totalKeluarEl && (totalKeluarEl.textContent = pengeluaran.Beras + " Liter");
            totalSaldoEl && (totalSaldoEl.textContent = stokBeras + " Liter");

            masukEl && (masukEl.textContent = pemasukan.Beras + " Liter");
            keluarEl && (keluarEl.textContent = pengeluaran.Beras + " Liter");
            saldoEl && (saldoEl.textContent = stokBeras + " Liter");

            judulEl && (judulEl.textContent = "Beras");

        } else {

            const saldo = pemasukan.Beras - pengeluaran.Beras;

            totalMasukEl && (totalMasukEl.textContent = rupiah(pemasukan.Beras));
            totalKeluarEl && (totalKeluarEl.textContent = rupiah(pengeluaran.Beras));
            totalSaldoEl && (totalSaldoEl.textContent = rupiah(saldo));

            masukEl && (masukEl.textContent = rupiah(pemasukan.Beras));
            keluarEl && (keluarEl.textContent = rupiah(pengeluaran.Beras));
            saldoEl && (saldoEl.textContent = rupiah(saldo));

            judulEl && (judulEl.textContent = "Beras");

        }

        return;
    }

    const key = namaJenis[jenis];

    const masuk = pemasukan[key] || 0;
    const keluar = pengeluaran[key] || 0;
    const saldo = masuk - keluar;

    totalMasukEl && (totalMasukEl.textContent = rupiah(masuk));
    totalKeluarEl && (totalKeluarEl.textContent = rupiah(keluar));
    totalSaldoEl && (totalSaldoEl.textContent = rupiah(saldo));

    masukEl && (masukEl.textContent = rupiah(masuk));
    keluarEl && (keluarEl.textContent = rupiah(keluar));
    saldoEl && (saldoEl.textContent = rupiah(saldo));

    judulEl && (judulEl.textContent = key);

}


// ======================================
// Load Dashboard
// ======================================

async function loadDashboard() {

    try {

        const data = await ambilDataFirebase();

        hitungPemasukan(data.pembayaranSnapshot);

        hitungPengeluaran(data.pengeluaranSnapshot);

        tampilkanDashboard();

    } catch (e) {

        console.error(e);

    }

}


// ======================================
// Event
// ======================================

window.addEventListener("DOMContentLoaded", () => {

    loadDashboard();

    document
        .getElementById("jenisDashboard")
        ?.addEventListener("change", loadDashboard);

    document
        .getElementById("modeBeras")
        ?.addEventListener("change", loadDashboard);

});

// ======================================
// Isi Filter Bulan & Tahun
// ======================================

function isiFilter() {

    const bulan = document.getElementById("bulan");
    const tahun = document.getElementById("tahun");

    if (!bulan || !tahun) return;

    const namaBulan = [
        "Januari","Februari","Maret","April",
        "Mei","Juni","Juli","Agustus",
        "September","Oktober","November","Desember"
    ];

    bulan.innerHTML = "";

    namaBulan.forEach((nama,index)=>{

        bulan.innerHTML += `
            <option value="${index+1}">
                ${nama}
            </option>
        `;

    });

    tahun.innerHTML = "";

    const sekarang = new Date().getFullYear();

    for(let i=sekarang-2;i<=sekarang+2;i++){

        tahun.innerHTML += `
            <option value="${i}">
                ${i}
            </option>
        `;

    }

    bulan.value = new Date().getMonth()+1;
    tahun.value = sekarang;

}


// ======================================
// Tampilkan Laporan
// ======================================
function tampilkanLaporan() 

{
    const totalSaldoEl =
        document.getElementById("totalSaldo");
    const hariIniEl =
        document.getElementById("hariIni");
    const bulanIniEl =
        document.getElementById("bulanIni");
    const tahunIniEl =
        document.getElementById("tahunIni");
    // ======================================
    // TOTAL SALDO KESELURUHAN
    // ======================================
    if (totalSaldoEl) {
        totalSaldoEl.textContent =
            rupiah(totalMasuk - totalKeluar);
    }
    // ======================================
    // HARI INI
    // ======================================
    if (hariIniEl) {
        const saldoHariIni =
            masukHariIni - keluarHariIni;
        hariIniEl.textContent =
            rupiah(saldoHariIni);
    }
    // ======================================
    // BULAN INI
    // ======================================
    if (bulanIniEl) {
        const saldoBulanIni =
            masukBulanIni - keluarBulanIni;
        bulanIniEl.textContent =
            rupiah(saldoBulanIni);
    }
    // ======================================
    // TAHUN INI
    // ======================================
    if (tahunIniEl) {
        const saldoTahunIni =
            masukTahunIni - keluarTahunIni;
        tahunIniEl.textContent =
            rupiah(saldoTahunIni);
    }
}

// ======================================
// Tampilkan Tabel Laporan
// ======================================

function tampilkanTabelLaporan() {

    const tbody =
        document.getElementById("dataPembayaran");

    if (!tbody) return;

    tbody.innerHTML = "";

    const transaksi = [];

    // PEMASUKAN
    semuaPembayaran.forEach((data) => {

        transaksi.push({
            tanggal: bacaTanggal(data),

            nama:
                data.namaSantri ||
                data.nama ||
                data.santri ||
                "-",

            jenis:
                data.jenis || "-",

            jumlah:
                Number(data.nominal || data.jumlah || 0),

            tipe: "Pemasukan"
        });

    });

    // PENGELUARAN
    semuaPengeluaran.forEach((data) => {

        transaksi.push({
            tanggal: bacaTanggal(data),

            nama:
                data.namaSantri ||
                data.nama ||
                data.santri ||
                "-",

            jenis:
                data.jenis || "-",

            jumlah:
                Number(data.jumlah || data.nominal || 0),

            tipe: "Pengeluaran"
        });

    });

    // URUTKAN TERBARU
    transaksi.sort((a, b) => {

        const tanggalA =
            a.tanggal ? a.tanggal.getTime() : 0;

        const tanggalB =
            b.tanggal ? b.tanggal.getTime() : 0;

        return tanggalB - tanggalA;

    });

    // JIKA KOSONG
    if (transaksi.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4"
                    class="text-center text-muted">
                    Belum ada transaksi
                </td>
            </tr>
        `;

        return;
    }

    // TAMPILKAN DATA
    transaksi.forEach((item) => {

        const tanggal =
            item.tanggal
                ? item.tanggal.toLocaleDateString("id-ID")
                : "-";

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${tanggal}</td>
            <td>${item.nama}</td>
            <td>${item.jenis}</td>
            <td class="fw-bold">
                ${rupiah(item.jumlah)}
            </td>
        `;

        tbody.appendChild(tr);

    });

}

// ======================================
// Load Semua Halaman
// ======================================

async function loadSemua() {

    try {

        const data = await ambilDataFirebase();

        hitungPemasukan(data.pembayaranSnapshot);

        hitungPengeluaran(data.pengeluaranSnapshot);

        tampilkanDashboard();

        isiFilter();

        tampilkanLaporan();

        tampilkanTabelLaporan();
      
    } catch (e) {

        console.error("Gagal memuat data:", e);

    }

}


// ======================================
// Event Global
// ======================================

window.addEventListener("DOMContentLoaded", () => {

    loadSemua();

    document
        .getElementById("jenisDashboard")
        ?.addEventListener("change", () => {
            tampilkanDashboard();
        });

    document
        .getElementById("modeBeras")
        ?.addEventListener("change", () => {
            tampilkanDashboard();
        });

});
