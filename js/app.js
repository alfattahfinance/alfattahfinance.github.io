import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

console.log("Dashboard berhasil dimuat!");

// =======================
// Dashboard
// =======================

async function loadDashboard() {

    try {

        // =======================
        // TOTAL SANTRI
        // =======================

        const santriSnapshot = await getDocs(
            collection(db, "santri")
        );

        const totalSantri = santriSnapshot.size;

        if (document.getElementById("totalSantri")) {

            document.getElementById("totalSantri").textContent =
                totalSantri;

        }

        // =======================
        // PEMASUKAN
        // =======================

        let totalMasuk = 0;
        let berasMasuk = 0;

        const pembayaranSnapshot = await getDocs(
            collection(db, "payments")
        );

        pembayaranSnapshot.forEach((doc) => {

            const data = doc.data();

            if (data.satuan === "Liter") {

                berasMasuk += Number(data.jumlah || 0);

            } else {

                totalMasuk += Number(data.nominal || 0);

            }

        });

        // =======================
        // PENGELUARAN
        // =======================

        let totalKeluar = 0;
        let berasKeluar = 0;

        const pengeluaranSnapshot = await getDocs(
            collection(db, "expenses")
        );

        pengeluaranSnapshot.forEach((doc) => {

            const data = doc.data();

            if (data.satuan === "Liter") {

                berasKeluar += Number(data.jumlah || 0);

            } else {

                totalKeluar += Number(data.jumlah || 0);

            }

        });

        // =======================
        // SALDO
        // =======================

        const saldo = totalMasuk - totalKeluar;

        if (document.getElementById("totalMasuk")) {

            document.getElementById("totalMasuk").textContent =
                "Rp " + totalMasuk.toLocaleString("id-ID");

        }

        if (document.getElementById("totalKeluar")) {

            document.getElementById("totalKeluar").textContent =
                "Rp " + totalKeluar.toLocaleString("id-ID");

        }

        if (document.getElementById("totalSaldo")) {

            document.getElementById("totalSaldo").textContent =
                "Rp " + saldo.toLocaleString("id-ID");

        }

        if (document.getElementById("stokBeras")) {

            document.getElementById("stokBeras").textContent =
                (berasMasuk - berasKeluar) + " Liter";

        }

    } catch (error) {

        console.error(error);

        alert("Gagal mengambil data dari Firebase.");

    }

}

    // =======================
// Dropdown Bulan & Tahun
// =======================

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

}

isiFilter();

// Jalankan Dashboard
loadDashboard();
