import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const daftarSantri = document.getElementById("daftarSantri");

tampilkan();

window.tambahSantri = async function () {

    const nama = document.getElementById("nama").value.trim();
    const kelas = document.getElementById("kelas").value.trim();
    const wali = document.getElementById("wali").value.trim();

    if (!nama || !kelas) {
        alert("Nama dan kelas harus diisi!");
        return;
    }

    await addDoc(collection(db, "santri"), {
        nama,
        kelas,
        wali
    });

    document.getElementById("nama").value = "";
    document.getElementById("kelas").value = "";
    document.getElementById("wali").value = "";

    tampilkan();

    alert("Santri berhasil ditambahkan.");
};


async function tampilkan() {

    daftarSantri.innerHTML = "";

    const snapshot = await getDocs(collection(db, "santri"));

    if (snapshot.empty) {

        daftarSantri.innerHTML =
            "<li class='list-group-item'>Belum ada data santri.</li>";

        return;
    }

    snapshot.forEach((item) => {

        const s = item.data();

        daftarSantri.innerHTML += `

        <li class="list-group-item d-flex justify-content-between align-items-center">

            <div>

                <strong>${s.nama}</strong><br>

                ${s.kelas}<br>

                ${s.wali || "-"}

            </div>

            <button
                class="btn btn-danger btn-sm"
                onclick="hapusSantri('${item.id}')">

                Hapus

            </button>

        </li>

        `;

    });

}


window.hapusSantri = async function(id){

    if(!confirm("Yakin ingin menghapus santri ini?")) return;

    await deleteDoc(doc(db,"santri",id));

    tampilkan();

}
