// ===============================
// Dashboard Syahriyyah App
// ===============================

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ===============================
// Format Rupiah
// ===============================

function rupiah(nilai) {

    return "Rp " + Number(nilai).toLocaleString("id-ID");

}


// ===============================
// Load Dashboard
// ===============================

async function loadDashboard() {

    try {

        let totalSantri = 0;

        let totalMasuk = 0;

        let totalKeluar = 0;

        let berasMasuk = 0;

        let berasKeluar = 0;

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


        // ===============================
        // Total Santri
        // ===============================

        const santriSnapshot =
            await getDocs(collection(db, "santri"));

        totalSantri = santriSnapshot.size;

        if (document.getElementById("totalSantri")) {

            document.getElementById("totalSantri").textContent =
                totalSantri;

        }


        // ===============================
        // Data Pembayaran
        // ===============================

        const pembayaranSnapshot =
            await getDocs(collection(db, "payments"));

        pembayaranSnapshot.forEach((doc) => {

            const data = doc.data();

            if (data.satuan === "Liter") {

                berasMasuk += Number(data.jumlah || 0);

                pemasukan.Beras += Number(data.jumlah || 0);

            } else {

                const nominal =
                    Number(data.nominal || 0);

                totalMasuk += nominal;

                if (pemasukan[data.jenis] !== undefined) {

                    pemasukan[data.jenis] += nominal;

                } else {

                    pemasukan.Lainnya += nominal;

                }

            }

        });


        // ===============================
        // Data Pengeluaran
        // ===============================

        const pengeluaranSnapshot =
            await getDocs(collection(db, "expenses"));

        pengeluaranSnapshot.forEach((doc) => {

            const data = doc.data();

            if (data.satuan === "Liter") {

                berasKeluar += Number(data.jumlah || 0);

                pengeluaran.Beras += Number(data.jumlah || 0);

            } else {

                const jumlah =
                    Number(data.jumlah || 0);

                totalKeluar += jumlah;

                if (pengeluaran[data.jenis] !== undefined) {

                    pengeluaran[data.jenis] += jumlah;

                } else {

                    pengeluaran.Lainnya += jumlah;

                }

            }

        });

        const saldo = totalMasuk - totalKeluar;

        // ===============================
        // Tampilkan Ringkasan Dashboard
        // ===============================

        if (document.getElementById("totalSaldo")) {

            document.getElementById("totalSaldo").textContent =
                rupiah(saldo);

        }

        if (document.getElementById("totalMasuk")) {

            document.getElementById("totalMasuk").textContent =
                rupiah(totalMasuk);

        }

        if (document.getElementById("totalKeluar")) {

            document.getElementById("totalKeluar").textContent =
                rupiah(totalKeluar);

        }

        if (document.getElementById("stokBeras")) {

            document.getElementById("stokBeras").textContent =
                (berasMasuk - berasKeluar) + " Liter";

        }


        // ===============================
        // Rekap Keuangan
        // ===============================

        const rekap = document.getElementById("rekap");

        if (rekap) {

            rekap.innerHTML = "";

            ["Syahriyyah", "Kas", "Beras", "Lainnya"].forEach((jenis) => {

                let masuk = pemasukan[jenis];
                let keluar = pengeluaran[jenis];

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

        console.error("Dashboard Error:", error);

        alert("Gagal memuat data Dashboard.");

    }

}// ===============================
// Filter Bulan & Tahun
// ===============================

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

    bulan.addEventListener("change", () => {
        loadDashboard();
    });

    tahun.addEventListener("change", () => {
        loadDashboard();
    });

}


// ===============================
// Jalankan Dashboard
// ===============================

window.addEventListener("DOMContentLoaded", () => {

    isiFilter();

    loadDashboard();

});
