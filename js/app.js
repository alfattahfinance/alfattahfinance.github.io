// ======================================
// Syahriyyah App
// Dashboard Firebase
// Bagian 1
// ======================================

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    query,
    where,
    Timestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ======================================
// Format Rupiah
// ======================================

function rupiah(angka) {

    return "Rp " + Number(angka || 0).toLocaleString("id-ID");

}


// ======================================
// Format Tanggal Awal & Akhir Bulan
// ======================================

function getTanggalFilter() {

    const bulanSelect = document.getElementById("bulan");
    const tahunSelect = document.getElementById("tahun");

    let bulan = new Date().getMonth();
    let tahun = new Date().getFullYear();

    if (bulanSelect) {

        bulan = Number(bulanSelect.value);

    }

    if (tahunSelect) {

        tahun = Number(tahunSelect.value);

    }

    const awal = new Date(tahun, bulan, 1, 0, 0, 0);

    const akhir = new Date(tahun, bulan + 1, 1, 0, 0, 0);

    return {

        awal: Timestamp.fromDate(awal),

        akhir: Timestamp.fromDate(akhir)

    };

}


// ======================================
// Load Dashboard
// ======================================

async function loadDashboard() {

    try {

        const filter = getTanggalFilter();

        let totalSantri = 0;

        let totalMasuk = 0;

        let totalKeluar = 0;

        let stokBeras = 0;

        const pemasukan = {

            Syahriyyah: 0,
            Kas: 0,
            Beras: 0,
            Lainnya: 0

        };

        const pengeluaran = {

            Syahriyyah: 0,
            Kas: 0,
            Beras: 0,
            Lainnya: 0

        };


        // ===========================
        // Total Santri
        // ===========================

        const santriSnapshot = await getDocs(

            collection(db, "santri")

        );

        totalSantri = santriSnapshot.size;

        const totalSantriEl = document.getElementById("totalSantri");

        if (totalSantriEl) {

            totalSantriEl.textContent = totalSantri;

        }


        // ===========================
        // Query Pembayaran
        // ===========================

        const pembayaranQuery = query(

            collection(db, "payments"),

            where("tanggal", ">=", filter.awal),

            where("tanggal", "<", filter.akhir)

        );

        const pembayaranSnapshot = await getDocs(

            pembayaranQuery

        );

       
            // ===========================
        // Hitung Pemasukan
        // ===========================

        pembayaranSnapshot.forEach((item) => {

            const data = item.data();

            if (data.satuan === "Liter") {

                const jumlah = Number(data.jumlah || 0);

                stokBeras += jumlah;

                pemasukan.Beras += jumlah;

            } else {

                const nominal = Number(data.nominal || 0);

                totalMasuk += nominal;

                if (pemasukan[data.jenis] !== undefined) {

                    pemasukan[data.jenis] += nominal;

                } else {

                    pemasukan.Lainnya += nominal;

                }

            }

        });


        // ===========================
        // Query Pengeluaran
        // ===========================

        const pengeluaranQuery = query(

            collection(db, "expenses"),

            where("tanggal", ">=", filter.awal),

            where("tanggal", "<", filter.akhir)

        );

        const pengeluaranSnapshot = await getDocs(

            pengeluaranQuery

        );


        // ===========================
        // Hitung Pengeluaran
        // ===========================

        pengeluaranSnapshot.forEach((item) => {

            const data = item.data();

            if (data.satuan === "Liter") {

                const jumlah = Number(data.jumlah || 0);

                stokBeras -= jumlah;

                pengeluaran.Beras += jumlah;

            } else {

                const jumlah = Number(data.jumlah || 0);

                totalKeluar += jumlah;

                if (pengeluaran[data.jenis] !== undefined) {

                    pengeluaran[data.jenis] += jumlah;

                } else {

                    pengeluaran.Lainnya += jumlah;

                }

            }

        });


        // ===========================
        // Hitung Saldo
        // ===========================

        const saldo = totalMasuk - totalKeluar;

                // ===========================
        // Tampilkan Ringkasan
        // ===========================

        const totalSaldoEl = document.getElementById("totalSaldo");
        const totalMasukEl = document.getElementById("totalMasuk");
        const totalKeluarEl = document.getElementById("totalKeluar");
        const stokBerasEl = document.getElementById("stokBeras");

        if (totalSaldoEl) {
            totalSaldoEl.textContent = rupiah(saldo);
        }

        if (totalMasukEl) {
            totalMasukEl.textContent = rupiah(totalMasuk);
        }

        if (totalKeluarEl) {
            totalKeluarEl.textContent = rupiah(totalKeluar);
        }

        if (stokBerasEl) {
            stokBerasEl.textContent = stokBeras + " Liter";
        }


        // ===========================
        // Rekap Keuangan
        // ===========================

        const rekap = document.getElementById("rekap");

        if (rekap) {

            rekap.innerHTML = "";

            const daftarJenis = [
                "Syahriyyah",
                "Kas",
                "Beras",
                "Lainnya"
            ];

            daftarJenis.forEach((jenis) => {

                const masuk = pemasukan[jenis];
                const keluar = pengeluaran[jenis];

                if (jenis === "Beras") {

                    rekap.innerHTML += `
                        <tr>
                            <td>${jenis}</td>
                            <td>${masuk} Liter</td>
                            <td>${keluar} Liter</td>
                            <td>${masuk - keluar} Liter</td>
                        </tr>
                    `;

                } else {

                    rekap.innerHTML += `
                        <tr>
                            <td>${jenis}</td>
                            <td>${rupiah(masuk)}</td>
                            <td>${rupiah(keluar)}</td>
                            <td>${rupiah(masuk - keluar)}</td>
                        </tr>
                    `;

                }

            });

        }

    } catch (error) {

        console.error(error);

        alert("Gagal memuat Dashboard.");

    }

}
// ======================================
// Filter Bulan & Tahun
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

    bulan.addEventListener("change", loadDashboard);
    tahun.addEventListener("change", loadDashboard);

}


// ======================================
// Jalankan Dashboard
// ======================================

window.addEventListener("DOMContentLoaded", async () => {

    isiFilter();

    await loadDashboard();

});
