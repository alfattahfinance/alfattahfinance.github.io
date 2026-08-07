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
};


// ======================================
// Reset Perhitungan
// ======================================

function resetData() {

  totalMasuk = 0;
  totalKeluar = 0;
  stokBeras = 0;

  Object.keys(pemasukan).forEach(key => {
    pemasukan[key] = 0;
  });

  Object.keys(pengeluaran).forEach(key => {
    pengeluaran[key] = 0;
  });

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

  totalSantri = santriSnapshot.size;

  return {
    pembayaranSnapshot,
    pengeluaranSnapshot
  };

}

// ======================================
// Hitung Data
// ======================================

function hitungPemasukan(snapshot) {

    snapshot.forEach((item) => {

        const data = item.data();

        if (data.satuan === "Liter") {

            const liter = Number(data.jumlah || 0);

            stokBeras += liter;
            pemasukan.Beras += liter;

            return;
        }

        const nominal = Number(data.nominal || 0);

        totalMasuk += nominal;

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

        if (data.satuan === "Liter") {

            const liter = Number(data.jumlah || 0);

            stokBeras -= liter;
            pengeluaran.Beras += liter;

            return;
        }

        const nominal = Number(data.jumlah || 0);

        totalKeluar += nominal;

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
// Laporan Keuangan
// ======================================

function tampilkanLaporan(){

    const totalSaldo =
        document.getElementById("totalSaldo");

    const hariIni =
        document.getElementById("hariIni");

    const bulanIni =
        document.getElementById("bulanIni");

    const tahunIni =
        document.getElementById("tahunIni");

    if(!totalSaldo) return;

    totalSaldo.textContent =
        rupiah(totalMasuk-totalKeluar);

    if(hariIni){

        hariIni.textContent =
            rupiah(totalMasuk);

    }

    if(bulanIni){

        bulanIni.textContent =
            rupiah(totalMasuk);

    }

    if(tahunIni){

        tahunIni.textContent =
            rupiah(totalMasuk);

    }

}


// ======================================
// Load Semua Halaman
// ======================================

async function loadSemua(){

    await loadDashboard();

    isiFilter();

    tampilkanLaporan();

}


// ======================================
// Event Global
// ======================================

window.addEventListener("DOMContentLoaded",()=>{

    loadSemua();

});
