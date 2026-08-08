// ======================================
// Pengeluaran Pondok
// js/pengeluaran.js
// ======================================

import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ======================================
// Simpan Pengeluaran
// ======================================

window.simpanPengeluaran = async function () {

    const jenis =
        document.getElementById("jenis").value;

    const keterangan =
        document.getElementById("keterangan").value.trim();

    const tanggal =
        document.getElementById("tanggal").value;

    const jumlah =
        Number(document.getElementById("jumlah").value);

    const satuan =
        document.getElementById("satuan").value;


    // ======================================
    // Validasi
    // ======================================

    if (!jenis) {
        alert("Pilih jenis pengeluaran terlebih dahulu.");
        return;
    }

    if (!keterangan) {
        alert("Keterangan belum diisi.");
        return;
    }

    if (!tanggal) {
        alert("Tanggal belum dipilih.");
        return;
    }

    if (!jumlah || jumlah <= 0) {
        alert("Masukkan jumlah pengeluaran.");
        return;
    }


    // ======================================
    // Simpan ke Firebase
    // ======================================

    try {

        await addDoc(
            collection(db, "expenses"),
            {
                jenis: jenis,
                keterangan: keterangan,
                tanggal: tanggal,
                jumlah: jumlah,
                satuan: satuan,
                createdAt: serverTimestamp()
            }
        );


        alert("Pengeluaran berhasil disimpan ✅");


        // ======================================
        // Kosongkan Form
        // ======================================

        document.getElementById("jenis").value = "";
        document.getElementById("keterangan").value = "";
        document.getElementById("jumlah").value = "";

        document.getElementById("satuan").value = "Rupiah";


        // ======================================
        // Tampilkan ulang riwayat
        // ======================================

        tampilkanRiwayatPengeluaran();


    } catch (error) {

        console.error(
            "Gagal menyimpan pengeluaran:",
            error
        );

        alert(
            "Gagal menyimpan pengeluaran. Cek koneksi Firebase."
        );

    }

};


// ======================================
// Tampilkan Riwayat Pengeluaran
// ======================================

async function tampilkanRiwayatPengeluaran() {

    const daftar =
        document.getElementById("daftarPengeluaran");

    if (!daftar) return;


    try {

        const q = query(
            collection(db, "expenses"),
            orderBy("createdAt", "desc")
        );

        const snapshot =
            await getDocs(q);


        daftar.innerHTML = "";


        // ======================================
        // Belum Ada Data
        // ======================================

        if (snapshot.empty) {

            daftar.innerHTML = `
                <li class="list-group-item text-center text-muted">
                    Belum ada pengeluaran.
                </li>
            `;

            return;
        }


        // ======================================
        // Tampilkan Data
        // ======================================

        snapshot.forEach((item) => {

            const data = item.data();


            let jumlahTampil;

            if (data.satuan === "Liter") {

                jumlahTampil =
                    Number(data.jumlah || 0)
                    .toLocaleString("id-ID")
                    + " Liter";

            } else {

                jumlahTampil =
                    "Rp " +
                    Number(data.jumlah || 0)
                    .toLocaleString("id-ID");

            }


            daftar.innerHTML += `

                <li class="list-group-item">

                    <div class="d-flex justify-content-between">

                        <div>

                            <strong>
                                ${data.jenis || "-"}
                            </strong>

                            <br>

                            <small class="text-muted">
                                ${data.keterangan || "-"}
                            </small>

                            <br>

                            <small class="text-muted">
                                ${data.tanggal || "-"}
                            </small>

                        </div>


                        <div class="text-danger fw-bold">

                            ${jumlahTampil}

                        </div>

                    </div>

                </li>

            `;

        });


    } catch (error) {

        console.error(
            "Gagal mengambil riwayat:",
            error
        );

        daftar.innerHTML = `
            <li class="list-group-item text-center text-danger">
                Gagal memuat riwayat pengeluaran.
            </li>
        `;

    }

}


// ======================================
// Tanggal Hari Ini
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    const tanggal =
        document.getElementById("tanggal");

    if (tanggal) {

        const sekarang =
            new Date();

        const tahun =
            sekarang.getFullYear();

        const bulan =
            String(
                sekarang.getMonth() + 1
            ).padStart(2, "0");

        const hari =
            String(
                sekarang.getDate()
            ).padStart(2, "0");


        tanggal.value =
            `${tahun}-${bulan}-${hari}`;

    }


    tampilkanRiwayatPengeluaran();

});
