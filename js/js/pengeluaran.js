import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const daftarPengeluaran = document.getElementById("daftarPengeluaran");

// ==========================
// Tampilkan Pengeluaran
// ==========================
async function tampilkanPengeluaran() {

    daftarPengeluaran.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "expenses"));

        if (snapshot.empty) {

            daftarPengeluaran.innerHTML =
                "<li class='list-group-item'>Belum ada pengeluaran.</li>";

            return;

        }

        snapshot.forEach((item) => {

            const data = item.data();

            daftarPengeluaran.innerHTML += `

            <li class="list-group-item d-flex justify-content-between align-items-center">

                <div>

                    <strong>${data.jenis}</strong><br>

                    ${data.keterangan}<br>

                    ${data.satuan == "Liter"
                        ? data.jumlah + " Liter"
                        : "Rp " + Number(data.jumlah).toLocaleString("id-ID")
                    }

                </div>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="hapusPengeluaran('${item.id}')">

                    Hapus

                </button>

            </li>

            `;

        });

    } catch (error) {

        console.error(error);

        alert("Gagal memuat pengeluaran.");

    }

}

tampilkanPengeluaran();


// ==========================
// Simpan Pengeluaran
// ==========================
window.simpanPengeluaran = async function () {

    const jenis = document.getElementById("jenis").value;
    const keterangan = document.getElementById("keterangan").value.trim();
    const jumlah = document.getElementById("jumlah").value;

    if (jenis === "" || keterangan === "" || jumlah === "") {

        alert("Lengkapi data pengeluaran.");

        return;

    }

    const sekarang = new Date();

    let data = {

        jenis: jenis,

        keterangan: keterangan,

        jumlah: Number(jumlah),

        bulan: sekarang.getMonth() + 1,

        tahun: sekarang.getFullYear(),

        tanggal: serverTimestamp()

    };

    if (jenis === "Beras") {

        data.satuan = "Liter";

    } else {

        data.satuan = "Rupiah";

    }

    try {

        await addDoc(collection(db, "expenses"), data);

        document.getElementById("keterangan").value = "";
        document.getElementById("jumlah").value = "";

        tampilkanPengeluaran();

        alert("Pengeluaran berhasil disimpan.");

    } catch (error) {

        console.error(error);

        alert("Gagal menyimpan pengeluaran.");

    }

};


// ==========================
// Hapus Pengeluaran
// ==========================
window.hapusPengeluaran = async function (id) {

    if (!confirm("Yakin ingin menghapus?")) return;

    try {

        await deleteDoc(doc(db, "expenses", id));

        tampilkanPengeluaran();

    } catch (error) {

        console.error(error);

        alert("Gagal menghapus.");

    }

};
