// ======================================
// Syahriyyah App v2
// app.js
// ======================================

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// ======================================
// FORMAT RUPIAH
// ======================================

function rupiah(nilai) {
    return "Rp " + Number(nilai || 0).toLocaleString("id-ID");
}


// ======================================
// VARIABEL GLOBAL
// ======================================

let totalSantri = 0;
let totalMasuk = 0;
let totalKeluar = 0;
let stokBeras = 0;


// ======================================
// DATA LAPORAN
// ======================================

let semuaPembayaran = [];
let semuaPengeluaran = [];


// ======================================
// REKAP PERIODE
// ======================================

let masukHariIni = 0;
let masukBulanIni = 0;
let masukTahunIni = 0;

let keluarHariIni = 0;
let keluarBulanIni = 0;
let keluarTahunIni = 0;


// ======================================
// REKAP JENIS
// ======================================

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
// RESET DATA
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
// BACA TANGGAL TRANSAKSI
// ======================================

function bacaTanggal(data) {

    const nilaiTanggal =
        data.tanggal ||
        data.date ||
        data.createdAt ||
        data.waktu;


    if (!nilaiTanggal) {
        return null;
    }


    // Firebase Timestamp
    if (nilaiTanggal?.toDate) {

        return nilaiTanggal.toDate();

    }


    // JavaScript Date
    if (nilaiTanggal instanceof Date) {

        return nilaiTanggal;

    }


    // Timestamp angka
    if (typeof nilaiTanggal === "number") {

        return new Date(nilaiTanggal);

    }


    // String tanggal
    if (typeof nilaiTanggal === "string") {

        const tanggal =
            new Date(nilaiTanggal);

        if (!isNaN(tanggal.getTime())) {

            return tanggal;

        }

    }


    return null;

}


// ======================================
// CEK TANGGAL
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
// AMBIL SEMUA DATA FIREBASE
// ======================================

async function ambilDataFirebase() {

    resetData();


    const santriSnapshot =
        await getDocs(
            collection(db, "santri")
        );


    const pembayaranSnapshot =
        await getDocs(
            collection(db, "payments")
        );


    const pengeluaranSnapshot =
        await getDocs(
            collection(db, "expenses")
        );


    // ======================================
    // SIMPAN PEMBAYARAN
    // ======================================

    semuaPembayaran = [];

    pembayaranSnapshot.forEach(item => {

        semuaPembayaran.push({

            id: item.id,

            ...item.data()

        });

    });


    // ======================================
    // SIMPAN PENGELUARAN
    // ======================================

    semuaPengeluaran = [];

    pengeluaranSnapshot.forEach(item => {

        semuaPengeluaran.push({

            id: item.id,

            ...item.data()

        });

    });


    totalSantri =
        santriSnapshot.size;


    return {

        pembayaranSnapshot,
        pengeluaranSnapshot

    };

}


// ======================================
// HITUNG PEMASUKAN
// ======================================

function hitungPemasukan(snapshot) {

    snapshot.forEach(item => {

        const data = item.data();

        const tanggal =
            bacaTanggal(data);


        // ==================================
        // BERAS
        // ==================================

        if (data.satuan === "Liter") {

            const liter =
                Number(data.jumlah || 0);


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


        // ==================================
        // UANG
        // ==================================

        const nominal =
            Number(data.nominal || 0);


        totalMasuk += nominal;


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


        // ==================================
        // JENIS PEMBAYARAN
        // ==================================

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
// HITUNG PENGELUARAN
// ======================================

function hitungPengeluaran(snapshot) {

    snapshot.forEach(item => {

        const data = item.data();

        const tanggal =
            bacaTanggal(data);


        // ==================================
        // BERAS
        // ==================================

        if (data.satuan === "Liter") {

            const liter =
                Number(data.jumlah || 0);


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


        // ==================================
        // UANG
        // ==================================

        const nominal =
            Number(
                data.jumlah ||
                data.nominal ||
                0
            );


        totalKeluar += nominal;


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


        // ==================================
        // JENIS PENGELUARAN
        // ==================================

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
// TAMPILKAN DASHBOARD
// ======================================

function tampilkanDashboard() {

    const jenis =
        document
            .getElementById("jenisDashboard")
            ?.value || "syahriyyah";


    const mode =
        document
            .getElementById("modeBeras")
            ?.value || "liter";


    const totalSantriEl =
        document.getElementById("totalSantri");


    const totalSaldoEl =
        document.getElementById("totalSaldo");


    const totalMasukEl =
        document.getElementById("totalMasuk");


    const totalKeluarEl =
        document.getElementById("totalKeluar");


    const judulEl =
        document.getElementById("judulJenis");


    const masukEl =
        document.getElementById("masuk");


    const keluarEl =
        document.getElementById("keluar");


    const saldoEl =
        document.getElementById("saldo");


    if (totalSantriEl) {

        totalSantriEl.textContent =
            totalSantri;

    }


    const namaJenis = {

        syahriyyah: "Syahriyyah",

        spp: "SPP",

        kas: "Kas",

        infaq: "Infaq",

        beras: "Beras"

    };


    // ==================================
    // BERAS
    // ==================================

    if (jenis === "beras") {

        if (mode === "liter") {

            totalMasukEl &&
                (
                    totalMasukEl.textContent =
                    pemasukan.Beras + " Liter"
                );


            totalKeluarEl &&
                (
                    totalKeluarEl.textContent =
                    pengeluaran.Beras + " Liter"
                );


            totalSaldoEl &&
                (
                    totalSaldoEl.textContent =
                    stokBeras + " Liter"
                );


            masukEl &&
                (
                    masukEl.textContent =
                    pemasukan.Beras + " Liter"
                );


            keluarEl &&
                (
                    keluarEl.textContent =
                    pengeluaran.Beras + " Liter"
                );


            saldoEl &&
                (
                    saldoEl.textContent =
                    stokBeras + " Liter"
                );


            judulEl &&
                (
                    judulEl.textContent =
                    "Beras"
                );

        } else {

            const saldo =
                pemasukan.Beras -
                pengeluaran.Beras;


            totalMasukEl &&
                (
                    totalMasukEl.textContent =
                    rupiah(pemasukan.Beras)
                );


            totalKeluarEl &&
                (
                    totalKeluarEl.textContent =
                    rupiah(pengeluaran.Beras)
                );


            totalSaldoEl &&
                (
                    totalSaldoEl.textContent =
                    rupiah(saldo)
                );


            masukEl &&
                (
                    masukEl.textContent =
                    rupiah(pemasukan.Beras)
                );


            keluarEl &&
                (
                    keluarEl.textContent =
                    rupiah(pengeluaran.Beras)
                );


            saldoEl &&
                (
                    saldoEl.textContent =
                    rupiah(saldo)
                );


            judulEl &&
                (
                    judulEl.textContent =
                    "Beras"
                );

        }


        return;

    }


    // ==================================
    // JENIS UANG
    // ==================================

    const key =
        namaJenis[jenis];


    const masuk =
        pemasukan[key] || 0;


    const keluar =
        pengeluaran[key] || 0;


    const saldo =
        masuk - keluar;


    totalMasukEl &&
        (
            totalMasukEl.textContent =
            rupiah(masuk)
        );


    totalKeluarEl &&
        (
            totalKeluarEl.textContent =
            rupiah(keluar)
        );


    totalSaldoEl &&
        (
            totalSaldoEl.textContent =
            rupiah(saldo)
        );


    masukEl &&
        (
            masukEl.textContent =
            rupiah(masuk)
        );


    keluarEl &&
        (
            keluarEl.textContent =
            rupiah(keluar)
        );


    saldoEl &&
        (
            saldoEl.textContent =
            rupiah(saldo)
        );


    judulEl &&
        (
            judulEl.textContent =
            key
        );

}


// ======================================
// ISI FILTER BULAN & TAHUN
// ======================================

function isiFilter() {

    const bulan =
        document.getElementById("bulan");


    const tahun =
        document.getElementById("tahun");


    if (!bulan || !tahun) {

        return;

    }


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

            <option value="${index + 1}">
                ${nama}
            </option>

        `;

    });


    tahun.innerHTML = "";


    const sekarang =
        new Date().getFullYear();


    for (
        let i = sekarang - 2;
        i <= sekarang + 2;
        i++
    ) {

        tahun.innerHTML += `

            <option value="${i}">
                ${i}
            </option>

        `;

    }


    bulan.value =
        new Date().getMonth() + 1;


    tahun.value =
        sekarang;

}


// ======================================
// TAMPILKAN LAPORAN SESUAI FILTER
// ======================================

function tampilkanLaporan() {

    const totalSaldoEl =
        document.getElementById("totalSaldo");


    const hariIniEl =
        document.getElementById("hariIni");


    const bulanIniEl =
        document.getElementById("bulanIni");


    const tahunIniEl =
        document.getElementById("tahunIni");


    if (
        !totalSaldoEl &&
        !hariIniEl &&
        !bulanIniEl &&
        !tahunIniEl
    ) {

        return;

    }


    // ==================================
    // AMBIL FILTER
    // ==================================

    const bulanEl =
        document.getElementById("bulan");


    const tahunEl =
        document.getElementById("tahun");


    const jenisEl =
        document.getElementById("filterJenis");


    const bulanDipilih =
        Number(bulanEl?.value);


    const tahunDipilih =
        Number(tahunEl?.value);


    const jenisDipilih =
        jenisEl?.value || "semua";


    // ==================================
    // VARIABEL
    // ==================================

    let pemasukanBulan = 0;

    let pengeluaranBulan = 0;

    let pemasukanTahun = 0;

    let pemasukanHariIni = 0;


    // ==================================
    // HITUNG PEMASUKAN
    // ==================================

    semuaPembayaran.forEach(data => {

        const tanggal =
            bacaTanggal(data);


        if (!tanggal) {

            return;

        }


        const jenis =
            data.jenis || "";


        // Filter jenis
        if (
            jenisDipilih !== "semua" &&
            jenis !== jenisDipilih
        ) {

            return;

        }


        const nominal =
            Number(
                data.nominal ||
                data.jumlah ||
                0
            );


        // Hari ini
        if (
            tanggalHariIni(tanggal)
        ) {

            pemasukanHariIni += nominal;

        }


        // Bulan + tahun
        if (

            tanggal.getMonth() + 1 === bulanDipilih &&

            tanggal.getFullYear() === tahunDipilih

        ) {

            pemasukanBulan += nominal;

        }


        // Tahun
        if (
            tanggal.getFullYear() === tahunDipilih
        ) {

            pemasukanTahun += nominal;

        }

    });


    // ==================================
    // HITUNG PENGELUARAN
    // ==================================

    semuaPengeluaran.forEach(data => {

        const tanggal =
            bacaTanggal(data);


        if (!tanggal) {

            return;

        }


        const jenis =
            data.jenis || "";


        // Filter jenis
        if (
            jenisDipilih !== "semua" &&
            jenis !== jenisDipilih
        ) {

            return;

        }


        const nominal =
            Number(
                data.jumlah ||
                data.nominal ||
                0
            );


        // Bulan + tahun
        if (

            tanggal.getMonth() + 1 === bulanDipilih &&

            tanggal.getFullYear() === tahunDipilih

        ) {

            pengeluaranBulan += nominal;

        }

    });


    // ==================================
    // SALDO
    // ==================================

    const saldoBulan =
        pemasukanBulan -
        pengeluaranBulan;


    // ==================================
    // TAMPILKAN KARTU
    // ==================================

// ======================================
// TAMPILKAN LAPORAN SESUAI FILTER
// ======================================

function tampilkanLaporan() {

    const totalSaldoEl =
        document.getElementById("totalSaldo");

    const hariIniEl =
        document.getElementById("hariIni");

    const bulanIniEl =
        document.getElementById("bulanIni");

    const tahunIniEl =
        document.getElementById("tahunIni");

    // PENGELUARAN
    const pengeluaranHariIniEl =
        document.getElementById("pengeluaranHariIni");

    const pengeluaranBulanIniEl =
        document.getElementById("pengeluaranBulanIni");

    const pengeluaranTahunIniEl =
        document.getElementById("pengeluaranTahunIni");


    if (
        !totalSaldoEl &&
        !hariIniEl &&
        !bulanIniEl &&
        !tahunIniEl &&
        !pengeluaranHariIniEl &&
        !pengeluaranBulanIniEl &&
        !pengeluaranTahunIniEl
    ) {
        return;
    }


    // ==================================
    // FILTER
    // ==================================

    const bulanEl =
        document.getElementById("bulan");

    const tahunEl =
        document.getElementById("tahun");

    const jenisEl =
        document.getElementById("filterJenis");


    const bulanDipilih =
        Number(bulanEl?.value);

    const tahunDipilih =
        Number(tahunEl?.value);

    const jenisDipilih =
        jenisEl?.value || "semua";


    // ==================================
    // VARIABEL
    // ==================================

    let pemasukanBulan = 0;
    let pengeluaranBulan = 0;

    let pemasukanTahun = 0;
    let pengeluaranTahun = 0;

    let pemasukanHariIni = 0;
    let pengeluaranHariIni = 0;


    // ==================================
    // HITUNG PEMASUKAN
    // ==================================

    semuaPembayaran.forEach(data => {

        const tanggal =
            bacaTanggal(data);

        if (!tanggal) {
            return;
        }


        const jenis =
            data.jenis || "";


        if (
            jenisDipilih !== "semua" &&
            jenis !== jenisDipilih
        ) {
            return;
        }


        const nominal =
            Number(
                data.nominal ||
                data.jumlah ||
                0
            );


        // Hari ini
        if (tanggalHariIni(tanggal)) {

            pemasukanHariIni += nominal;

        }


        // Bulan yang dipilih
        if (
            tanggal.getMonth() + 1 === bulanDipilih &&
            tanggal.getFullYear() === tahunDipilih
        ) {

            pemasukanBulan += nominal;

        }


        // Tahun yang dipilih
        if (
            tanggal.getFullYear() === tahunDipilih
        ) {

            pemasukanTahun += nominal;

        }

    });


    // ==================================
    // HITUNG PENGELUARAN
    // ==================================

    semuaPengeluaran.forEach(data => {

        const tanggal =
            bacaTanggal(data);

        if (!tanggal) {
            return;
        }


        const jenis =
            data.jenis || "";


        if (
            jenisDipilih !== "semua" &&
            jenis !== jenisDipilih
        ) {
            return;
        }


        const nominal =
            Number(
                data.jumlah ||
                data.nominal ||
                0
            );


        // Hari ini
        if (tanggalHariIni(tanggal)) {

            pengeluaranHariIni += nominal;

        }


        // Bulan yang dipilih
        if (
            tanggal.getMonth() + 1 === bulanDipilih &&
            tanggal.getFullYear() === tahunDipilih
        ) {

            pengeluaranBulan += nominal;

        }


        // Tahun yang dipilih
        if (
            tanggal.getFullYear() === tahunDipilih
        ) {

            pengeluaranTahun += nominal;

        }

    });


    // ==================================
    // SALDO BULAN
    // ==================================

    const saldoBulan =
        pemasukanBulan -
        pengeluaranBulan;


    // ==================================
    // TAMPILKAN PEMASUKAN
    // ==================================

    if (totalSaldoEl) {

        totalSaldoEl.textContent =
            rupiah(saldoBulan);

    }


    if (hariIniEl) {

        hariIniEl.textContent =
            rupiah(pemasukanHariIni);

    }


    if (bulanIniEl) {

        bulanIniEl.textContent =
            rupiah(pemasukanBulan);

    }


    if (tahunIniEl) {

        tahunIniEl.textContent =
            rupiah(pemasukanTahun);

    }


    // ==================================
    // TAMPILKAN PENGELUARAN
    // ==================================

    if (pengeluaranHariIniEl) {

        pengeluaranHariIniEl.textContent =
            rupiah(pengeluaranHariIni);

    }


    if (pengeluaranBulanIniEl) {

        pengeluaranBulanIniEl.textContent =
            rupiah(pengeluaranBulan);

    }


    if (pengeluaranTahunIniEl) {

        pengeluaranTahunIniEl.textContent =
            rupiah(pengeluaranTahun);

    }

}

// ======================================
// TAMPILKAN TABEL LAPORAN
// ======================================

function tampilkanTabelLaporan() {

    const tbody =
        document.getElementById("dataPembayaran");


    if (!tbody) {

        return;

    }


    const bulanEl =
        document.getElementById("bulan");


    const tahunEl =
        document.getElementById("tahun");


    const jenisEl =
        document.getElementById("filterJenis");


    const bulanDipilih =
        Number(bulanEl?.value);


    const tahunDipilih =
        Number(tahunEl?.value);


    const jenisDipilih =
        jenisEl?.value || "semua";


    tbody.innerHTML = "";


    const transaksi = [];


    // ==================================
    // PEMASUKAN
    // ==================================

    semuaPembayaran.forEach(data => {

        const tanggal =
            bacaTanggal(data);


        if (!tanggal) {

            return;

        }


        // Filter bulan & tahun
        if (

            tanggal.getMonth() + 1 !== bulanDipilih ||

            tanggal.getFullYear() !== tahunDipilih

        ) {

            return;

        }


        // Filter jenis
        if (

            jenisDipilih !== "semua" &&

            data.jenis !== jenisDipilih

        ) {

            return;

        }


        transaksi.push({

            tanggal: tanggal,

            nama:
                data.namaSantri ||
                data.nama ||
                data.santri ||
                "-",

            jenis:
                data.jenis ||
                "-",

            jumlah:
                Number(
                    data.nominal ||
                    data.jumlah ||
                    0
                ),

            tipe: "Pemasukan"

        });

    });


    // ==================================
    // PENGELUARAN
    // ==================================

    semuaPengeluaran.forEach(data => {

        const tanggal =
            bacaTanggal(data);


        if (!tanggal) {

            return;

        }


        // Filter bulan & tahun
        if (

            tanggal.getMonth() + 1 !== bulanDipilih ||

            tanggal.getFullYear() !== tahunDipilih

        ) {

            return;

        }


        // Filter jenis
        if (

            jenisDipilih !== "semua" &&

            data.jenis !== jenisDipilih

        ) {

            return;

        }


        transaksi.push({

            tanggal: tanggal,

            nama:
                data.namaSantri ||
                data.nama ||
                data.santri ||
                "-",

            jenis:
                data.jenis ||
                "-",

            jumlah:
                Number(
                    data.jumlah ||
                    data.nominal ||
                    0
                ),

            tipe: "Pengeluaran"

        });

    });


    // ==================================
    // URUTKAN TERBARU
    // ==================================

    transaksi.sort((a, b) => {

        const tanggalA =
            a.tanggal
                ? a.tanggal.getTime()
                : 0;


        const tanggalB =
            b.tanggal
                ? b.tanggal.getTime()
                : 0;


        return tanggalB - tanggalA;

    });


    // ==================================
    // TIDAK ADA DATA
    // ==================================

    if (transaksi.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center text-muted py-4">

                    Tidak ada transaksi
                    pada bulan, tahun,
                    dan jenis yang dipilih.

                </td>

            </tr>

        `;

        return;

    }


    // ==================================
    // TAMPILKAN DATA
    // ==================================

    transaksi.forEach(item => {

        const tanggal =
            item.tanggal
                ? item.tanggal.toLocaleDateString("id-ID")
                : "-";


        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>
                ${tanggal}
            </td>


            <td>
                ${item.nama}
            </td>


            <td>

                <span class="badge ${
                    item.tipe === "Pemasukan"
                        ? "bg-success"
                        : "bg-danger"
                }">

                    ${item.jenis}

                </span>

            </td>


            <td class="${
                item.tipe === "Pemasukan"
                    ? "text-success"
                    : "text-danger"
            } fw-bold">

                ${rupiah(item.jumlah)}

            </td>

        `;


        tbody.appendChild(tr);

    });

}


// ======================================
// LOAD SEMUA
// ======================================

async function loadSemua() {

    try {

        const data =
            await ambilDataFirebase();


        hitungPemasukan(
            data.pembayaranSnapshot
        );


        hitungPengeluaran(
            data.pengeluaranSnapshot
        );


        // Dashboard
        tampilkanDashboard();


        // Filter laporan
        isiFilter();


        // Laporan
        tampilkanLaporan();


        // Tabel
        tampilkanTabelLaporan();


    } catch (e) {

        console.error(
            "Gagal memuat data:",
            e
        );

    }

}

        // ======================================
// SIMPAN PENGELUARAN
// ======================================

async function simpanPengeluaran(event) {

    // Mencegah form reload
    if (event) {
        event.preventDefault();
    }

    const jenisEl =
        document.getElementById("jenisPengeluaran");

    const keteranganEl =
        document.getElementById("keterangan");

    const tanggalEl =
        document.getElementById("tanggal");

    const nominalEl =
        document.getElementById("nominal");

    const satuanEl =
        document.getElementById("satuan");


    const jenis =
        jenisEl?.value || "";

    const keterangan =
        keteranganEl?.value.trim() || "";

    const tanggal =
        tanggalEl?.value || "";

    const nominal =
        Number(nominalEl?.value || 0);

    const satuan =
        satuanEl?.value || "Rupiah";


    // ======================================
    // VALIDASI
    // ======================================

    if (!jenis) {
        alert("Silakan pilih jenis pengeluaran.");
        return;
    }

    if (!keterangan) {
        alert("Silakan isi keterangan.");
        return;
    }

    if (!tanggal) {
        alert("Silakan pilih tanggal.");
        return;
    }

    if (nominal <= 0) {
        alert("Nominal harus lebih dari 0.");
        return;
    }


    // ======================================
    // SIMPAN KE FIRESTORE
    // ======================================

    try {

        console.log("Mencoba menyimpan pengeluaran...");

        const dataPengeluaran = {

            jenis: jenis,

            keterangan: keterangan,

            tanggal: tanggal,

            jumlah: nominal,

            nominal: nominal,

            satuan: satuan,

            createdAt: serverTimestamp()

        };


        console.log(
            "Data yang dikirim:",
            dataPengeluaran
        );


        const docRef =
            await addDoc(
                collection(db, "expenses"),
                dataPengeluaran
            );


        console.log(
            "BERHASIL DISIMPAN!",
            docRef.id
        );


        alert(
            "Pengeluaran berhasil disimpan!\n\n" +
            "ID: " + docRef.id
        );


        // ======================================
        // KOSONGKAN FORM
        // ======================================

        if (jenisEl) {
            jenisEl.value = "";
        }

        if (keteranganEl) {
            keteranganEl.value = "";
        }

        if (tanggalEl) {
            tanggalEl.value = "";
        }

        if (nominalEl) {
            nominalEl.value = "";
        }


        // ======================================
        // LOAD ULANG FIREBASE
        // ======================================

        await loadSemua();


    } catch (error) {

        console.error(
            "ERROR FIRESTORE:",
            error
        );


        alert(
            "GAGAL MENYIMPAN!\n\n" +
            "Kode: " +
            (error.code || "-") +
            "\n\n" +
            error.message
        );

    }

}


// ======================================
// EVENT GLOBAL
// ======================================

window.addEventListener(
    "DOMContentLoaded",
    () => {


        // ==================================
        // LOAD AWAL
        // ==================================

        loadSemua();


        // ==================================
        // TOMBOL SIMPAN PENGELUARAN
        // ==================================

        const tombolSimpan =
            document.getElementById(
                "simpanPengeluaran"
            );


        if (tombolSimpan) {

            tombolSimpan.addEventListener(
                "click",
                simpanPengeluaran
            );

        }


        // ==================================
        // DASHBOARD - JENIS
        // ==================================

        document
            .getElementById("jenisDashboard")
            ?.addEventListener(
                "change",
                () => {

                    tampilkanDashboard();

                }
            );


        // ==================================
        // DASHBOARD - MODE BERAS
        // ==================================

        document
            .getElementById("modeBeras")
            ?.addEventListener(
                "change",
                () => {

                    tampilkanDashboard();

                }
            );


        // ==================================
        // FILTER BULAN
        // ==================================

        document
            .getElementById("bulan")
            ?.addEventListener(
                "change",
                () => {

                    tampilkanTabelLaporan();

                    tampilkanLaporan();

                }
            );


        // ==================================
        // FILTER TAHUN
        // ==================================

        document
            .getElementById("tahun")
            ?.addEventListener(
                "change",
                () => {

                    tampilkanTabelLaporan();

                    tampilkanLaporan();

                }
            );


        // ==================================
        // FILTER JENIS
        // ==================================

        document
            .getElementById("filterJenis")
            ?.addEventListener(
                "change",
                () => {

                    tampilkanTabelLaporan();

                    tampilkanLaporan();

                }
            );

    }
);
