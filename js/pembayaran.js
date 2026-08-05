// Import Firebase
import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Ambil data santri dari Firebase
const selectSantri = document.getElementById("santri");


async function tampilkanSantri(){

    const querySnapshot = await getDocs(collection(db, "santri"));

    querySnapshot.forEach((doc)=>{

        const santri = doc.data();

        const option = document.createElement("option");

        option.value = santri.nama;
        option.textContent = santri.nama;

        selectSantri.appendChild(option);

    });

}


tampilkanSantri();



// Simpan pembayaran ke Firebase

window.simpanPembayaran = async function(){

    const nama = document.getElementById("santri").value;
    const jenis = document.getElementById("jenis").value;
    const nominal = document.getElementById("nominal").value;


    if(nama==="" || jenis==="" || nominal===""){

        alert("Data pembayaran belum lengkap.");
        return;

    }


    await addDoc(collection(db,"payments"),{

        nama_santri: nama,

        jenis: jenis,

        nominal: Angka(nominal),

        tanggal: serverTimestamp()

    });



    document.getElementById("nominal").value="";


    alert("Pembayaran berhasil disimpan ke Firebase.");

};
