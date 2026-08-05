import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const selectSantri = document.getElementById("santri");

// =========================
// Tampilkan Data Santri
// =========================
async function tampilkanSantri() {

    try {

        selectSantri.innerHTML =
            '<option value="">Pilih Santri</option>';

        const querySnapshot =
            await getDocs(collection(db, "santri"));

        querySnapshot.forEach((item) => {

            const santri = item.data();

            const option = document.createElement("option");

            option.value = santri.nama;
            option.textContent = santri.nama;

            selectSantri.appendChild(option);

        });

    } catch (error) {

        console.error(error);

        alert("Gagal mengambil data santri.");

    }

}

tampilkanSantri();


// =========================
// Simpan Pembayaran
// =========================
window.simpanPembayaran = async function () {

    const nama = document.getElementById("santri").value;
    const jenis = document.getElementById("jenis").value;
    const nilai = document.getElementById("nominal").value;

    if (nama === "" || jenis === "" || nilai === "") {

        alert("Data pembayaran belum lengkap.");

        return;

    }

    const sekarang = new Date();

    let dataPembayaran = {

        nama_santri: nama,

        jenis: jenis,

        bulan: sekarang.getMonth() + 1,

        tahun: sekarang.getFullYear(),

        tanggal: serverTimestamp()

    };

    // =========================
    // Syahriyyah & Kas
    // =========================
    if (jenis === "Syahriyyah" || jenis === "Kas") {

        dataPembayaran.nominal = Number(nilai);
        dataPembayaran.jumlah = 0;
        dataPembayaran.satuan = "Rupiah";

    }

    // =========================
    // Beras
    // =========================
    else if (jenis === "Beras") {

        dataPembayaran.nominal = 0;
        dataPembayaran.jumlah = Number(nilai);
        dataPembayaran.satuan = "Liter";

    }

    try {

        await addDoc(
            collection(db, "payments"),
            dataPembayaran
        );

        document.getElementById("nominal").value = "";

        alert("Pembayaran berhasil disimpan.");

    } catch (error) {

        console.error(error);

        alert("Gagal menyimpan pembayaran.");

    }

};
