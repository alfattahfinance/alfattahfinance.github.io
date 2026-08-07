// ======================================
// Syahriyyah App
// Dashboard Firebase
// BAGIAN 1
// ======================================

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ======================================
// Format Rupiah
// ======================================

function rupiah(angka) {
    return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}


// ======================================
// Load Dashboard
// ======================================

async function loadDashboard() {

    try {

        // -------------------------
        // Ambil Semua Data Firebase
        // -------------------------

        const santriSnapshot = await getDocs(
    collection(db, "santri")
);

const pembayaranSnapshot = await getDocs(
    collection(db, "payments")
);

const pengeluaranSnapshot = await getDocs(
    collection(db, "expenses")
);

// Hitung semua pemasukan
pembayaranSnapshot.forEach((doc) => {

    const data = doc.data();

    console.log("PAYMENT:", data);

    if (data.satuan === "Liter") {

        // ...

    } else {

        // ...

    }

});
        // -------------------------
        // Variabel
        // -------------------------

        let totalSantri = santriSnapshot.size;

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

        // -------------------------
        // Total Santri
        // -------------------------

        const totalSantriEl = document.getElementById("totalSantri");

        if (totalSantriEl) {
            totalSantriEl.textContent = totalSantri;
        }

        // -------------------------
        // Hitung Semua Pemasukan
        // -------------------------

        pembayaranSnapshot.forEach((doc) => {

            const data = doc.data();

            if (data.satuan === "Liter") {

                const liter = Number(data.jumlah || 0);

                stokBeras += liter;

                pemasukan.Beras += liter;

            } else {

                const nominal = Number(data.nominal || 0);

                totalMasuk += nominal;

                const jenisData = data.jenis;

if (jenisData === "Syahriyyah") {
    pemasukan.Syahriyyah += nominal;

} else if (jenisData === "Kas") {
    pemasukan.Kas += nominal;

} else if (jenisData === "Beras") {
    pemasukan.Beras += nominal;

} else {
    pemasukan.Lainnya += nominal;
}
            }

        });

        // =========================
        // LANJUT BAGIAN 2
        // =========================

            // -------------------------
        // Hitung Semua Pengeluaran
        // -------------------------

        pengeluaranSnapshot.forEach((doc) => {

            const data = doc.data();

            if (data.satuan === "Liter") {

                const liter = Number(data.jumlah || 0);

                stokBeras -= liter;

                pengeluaran.Beras += liter;

            } else {

                const nominal = Number(data.jumlah || 0);

                totalKeluar += nominal;

                if (pengeluaran[data.jenis] !== undefined) {

                    pengeluaran[data.jenis] += nominal;

                } else {

                    pengeluaran.Lainnya += nominal;

                }

            }

        });

        // -------------------------
        // Hitung Saldo
        // -------------------------
// -------------------------
// Tampilkan Ringkasan Dinamis
// -------------------------

const jenis = document.getElementById("jenisDashboard")?.value || "syahriyyah";
const mode = document.getElementById("modeBeras")?.value || "liter";

const totalSaldoEl = document.getElementById("totalSaldo");
const totalMasukEl = document.getElementById("totalMasuk");
const totalKeluarEl = document.getElementById("totalKeluar");


const namaJenis = {
    syahriyyah: "Syahriyyah",
    kas: "Kas",
    spp: "SPP",
    infaq: "Infaq",
    beras: "Beras"
};


// Jika Beras
if (jenis === "beras") {

    if (mode === "liter") {

        totalMasukEl.textContent = pemasukan.Beras + " Liter";
        totalKeluarEl.textContent = pengeluaran.Beras + " Liter";
        totalSaldoEl.textContent = stokBeras + " Liter";
        
    } else {

        totalMasukEl.textContent = rupiah(pemasukan.Beras);
        totalKeluarEl.textContent = rupiah(pengeluaran.Beras);
        totalSaldoEl.textContent = rupiah(
            pemasukan.Beras - pengeluaran.Beras
        );

    }


} else {

    const key = 
        namaJenis[jenis] || "Lainnya";


    const masuk = pemasukan[key] || 0;
    const keluar = pengeluaran[key] || 0;


    totalMasukEl.textContent = rupiah(masuk);

    totalKeluarEl.textContent = rupiah(keluar);

    totalSaldoEl.textContent = rupiah(
        masuk - keluar
    );

}
    } catch (error) {
        console.error(error);
    }

}

// ======================================
// Isi Filter Bulan & Tahun
// ======================================

function isiFilter() {

    const bulan = document.getElementById("bulan");
    const tahun = document.getElementById("tahun");

    if (!bulan || !tahun) return;

    const namaBulan = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"
    ];

    bulan.innerHTML = "";

    namaBulan.forEach((nama, index) => {

        bulan.innerHTML += `
            <option value="${index}">
                ${nama}
            </option>
        `;

    });

    tahun.innerHTML = "";

    const tahunSekarang = new Date().getFullYear();

    for (let i = tahunSekarang - 2; i <= tahunSekarang + 2; i++) {

        tahun.innerHTML += `
            <option value="${i}">
                ${i}
            </option>
        `;

    }

    bulan.value = new Date().getMonth();
    tahun.value = tahunSekarang;

    // Untuk sementara tombol filter hanya me-refresh dashboard
    bulan.addEventListener("change", loadDashboard);
    tahun.addEventListener("change", loadDashboard);

}


// ======================================
// Jalankan Dashboard
// ======================================

window.addEventListener("DOMContentLoaded", async () => {

    isiFilter();

    await loadDashboard();

    document.getElementById("jenisDashboard")?.addEventListener("change", loadDashboard);

    document.getElementById("modeBeras")?.addEventListener("change", loadDashboard);

});
