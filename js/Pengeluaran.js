// ======================================
// Pengeluaran Pondok
// js/pengeluaran.js
// ======================================

import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ======================================
// Simpan Pengeluaran
// ======================================

window.simpanPengeluaran = async function () {

    console.log("Tombol Simpan Pengeluaran ditekan");

    const jenis = document.getElementById("jenis").value;
    const keterangan = document.getElementById("keterangan").value.trim();
    const tanggal = document.getElementById("tanggal").value;
    const jumlah = Number(document.getElementById("jumlah").value);
    const satuan = document.getElementById("satuan").value;


    // Validasi
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


    // Simpan ke Firestore
    try {

        console.log("Menyimpan ke Firestore...");

        const docRef = await addDoc(
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

        console.log("Berhasil disimpan:", docRef.id);

        alert("✅ Pengeluaran berhasil disimpan!");


        // Kosongkan form
        document.getElementById("jenis").value = "";
        document.getElementById("keterangan").value = "";
        document.getElementById("jumlah").value = "";
        document.getElementById("satuan").value = "Rupiah";


        // Tampilkan riwayat
        await tampilkanRiwayatPengeluaran();

    } catch (error) {

        console.error("ERROR FIREBASE:", error);

        alert(
            "❌ Gagal menyimpan pengeluaran!\n\n" +
            error.code +
            "\n" +
            error.message
        );

    }

};


// ======================================
// Tampilkan Riwayat Pengeluaran
// ======================================

async function tampilkanRiwayatPengeluaran() {

    const daftar =
        document.getElementById("daftarPengeluaran");

    if (!daftar) {
        console.error(
            "Element daftarPengeluaran tidak ditemukan!"
        );
        return;
    }


    try {

        console.log("Mengambil data expenses...");


        const snapshot = await getDocs(
            collection(db, "expenses")
        );


        console.log(
            "Jumlah data:",
            snapshot.size
        );


        daftar.innerHTML = "";


        // Tidak ada data
        if (snapshot.empty) {

            daftar.innerHTML = `
                <li class="list-group-item text-center text-muted">
                    Belum ada pengeluaran.
                </li>
            `;

            return;
        }


        // Masukkan data ke array
        let dataPengeluaran = [];


        snapshot.forEach((doc) => {

            const data = doc.data();

            dataPengeluaran.push({
                id: doc.id,
                ...data
            });

        });


        // Urutkan berdasarkan tanggal
        dataPengeluaran.sort((a, b) => {

            const tanggalA =
                new Date(a.tanggal || "1970-01-01");

            const tanggalB =
                new Date(b.tanggal || "1970-01-01");

            return tanggalB - tanggalA;

        });


        // Tampilkan semua data
        dataPengeluaran.forEach((data) => {

            let jumlahTampil;


            if (data.satuan === "Liter") {

                jumlahTampil =
                    Number(data.jumlah || 0)
                    .toLocaleString("id-ID") +
                    " Liter";

            } else {

                jumlahTampil =
                    "Rp " +
                    Number(data.jumlah || 0)
                    .toLocaleString("id-ID");

            }


            const item =
                document.createElement("li");

            item.className =
                "list-group-item";


            item.innerHTML = `

                <div class="d-flex justify-content-between align-items-start">

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
                            📅 ${data.tanggal || "-"}
                        </small>

                    </div>

                    <div class="text-danger fw-bold">

                        ${jumlahTampil}

                    </div>

                </div>

            `;


            daftar.appendChild(item);

        });


    } catch (error) {

        console.error(
            "Gagal mengambil riwayat:",
            error
        );


        daftar.innerHTML = `

            <li class="list-group-item text-center text-danger">

                ❌ Gagal memuat riwayat pengeluaran.

                <br>

                <small>
                    ${error.message}
                </small>

            </li>

        `;

    }

}


// ======================================
// Tanggal Hari Ini
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

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


        // Muat riwayat saat halaman dibuka
        tampilkanRiwayatPengeluaran();

    }
);
