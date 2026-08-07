import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    updateDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy

} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const daftarPengeluaran = document.getElementById("daftarPengeluaran");

// Variabel global untuk mode Edit pengeluaran
let idEditPengeluaran = null;


// ==========================
// Tampilkan Pengeluaran
// ==========================
async function tampilkanPengeluaran() {

    if (!daftarPengeluaran) return;

    daftarPengeluaran.innerHTML = "";

    try {

        const q = query(
    collection(db, "expenses"),
    orderBy("tanggal", "desc")
);
        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            daftarPengeluaran.innerHTML =
                "<li class='list-group-item text-center text-muted'>Belum ada pengeluaran.</li>";

            return;

        }

        snapshot.forEach((item) => {

            const data = item.data();
            const idDoc = item.id;

            daftarPengeluaran.innerHTML += `

            <li class="list-group-item d-flex justify-content-between align-items-center py-3">

                <div>

                    <strong>${data.jenis}</strong><br>

              <small class="text-muted">
                    📅 ${data.tanggal || "-"}
              </small><br>

${data.keterangan}<br>

                    

                    <span class="text-danger fw-bold">
                        ${data.satuan == "Liter"
                            ? data.jumlah + " Liter"
                            : "Rp " + Number(data.jumlah).toLocaleString("id-ID")
                        }
                    </span>

                </div>

                <div>
                    <button
                       class="btn btn-outline-primary btn-sm mb-1 d-block"
                       onclick="mulaiEditPengeluaran('${idDoc}','${data.jenis}','${data.keterangan}','${data.jumlah}','${data.tanggal}')">
    Edit
</button>

                   <button
                      class="btn btn-danger btn-sm d-block"
                      onclick="hapusPengeluaran('${idDoc}')">
    Hapus
</button>
                        
                </div>

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
// Simpan atau Perbarui Pengeluaran
// ==========================
window.simpanPengeluaran = async function () {

    const jenis = document.getElementById("jenis").value;
    const keterangan = document.getElementById("keterangan").value.trim();
    const jumlah = document.getElementById("jumlah").value;
    const tanggal = document.getElementById("tanggal").value;
   
    if (
    jenis === "" ||
    keterangan === "" ||
    jumlah === "" ||
    tanggal === ""
) {

    alert("Lengkapi data pengeluaran.");

    return;

}

    

    let data = {
        jenis: jenis,
        keterangan: keterangan,
        jumlah: Number(jumlah)
    };

    if (jenis === "Beras") {
        data.satuan = "Liter";
    } else {
        data.satuan = "Rupiah";
    }

    try {

if (idEditPengeluaran === null) {

    // Mode Tambah Baru
    const tgl = new Date(tanggal);

    data.tanggal = tanggal;
    data.bulan = tgl.getMonth() + 1;
    data.tahun = tgl.getFullYear();

    await addDoc(collection(db, "expenses"), data);

    alert("Pengeluaran berhasil disimpan.");

} else {

    data.tanggal = tanggal;
    data.bulan = new Date(tanggal).getMonth() + 1;
    data.tahun = new Date(tanggal).getFullYear();

    await updateDoc(doc(db, "expenses", idEditPengeluaran), data);

    alert("Pengeluaran berhasil diperbarui.");
}
            // Reset mode edit
            idEditPengeluaran = null;
            const tombolSimpan = document.querySelector(

        "button[onclick='simpanPengeluaran()']"

    );

    if (tombolSimpan) {

        tombolSimpan.textContent = "Simpan Pengeluaran";

    }
        // Reset Form
        document.getElementById("jenis").value = "";
document.getElementById("keterangan").value = "";
document.getElementById("jumlah").value = "";
document.getElementById("tanggal").value = "";

        ubahSatuan();
        
        tampilkanPengeluaran();

    } catch (error) {

        console.error(error);

        alert("Gagal menyimpan pengeluaran ke database.");

    }

};


// ==========================
// Ambil Data untuk Diedit
// ==========================
window.mulaiEditPengeluaran = function (id, jenis, keterangan, jumlah, tanggal) {

    idEditPengeluaran = id;

    document.getElementById("jenis").value = jenis;
    document.getElementById("keterangan").value = keterangan;
    document.getElementById("jumlah").value = jumlah;
    document.getElementById("tanggal").value = tanggal;

    // Sesuaikan satuan jika Beras
    ubahSatuan();

    // Ubah teks tombol
    const tombolSimpan = document.querySelector(
        "button[onclick='simpanPengeluaran()']"
    );

    if (tombolSimpan) {
        tombolSimpan.textContent = "Simpan Perubahan";
    }

    // Scroll ke atas
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
};

// ==========================
// Hapus Pengeluaran
// ==========================
window.hapusPengeluaran = async function (id) {

    if (!confirm("Yakin ingin menghapus pengeluaran ini dari database?")) return;

    try {

        await deleteDoc(doc(db, "expenses", id));
        alert("Data berhasil dihapus.");
        tampilkanPengeluaran();

    } catch (error) {

        console.error(error);

        alert("Gagal menghapus.");

    }

};
