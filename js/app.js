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
