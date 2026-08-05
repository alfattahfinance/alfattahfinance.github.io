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

    const nilai = document.getElementById("nominal").value;



    if(nama==="" || jenis==="" || nilai===""){

        alert("Data pembayaran belum lengkap.");

        return;

    }



    let dataPembayaran = {

        nama_santri: nama,

        jenis: jenis,

        tanggal: serverTimestamp()

    };



    // Jika pembayaran uang

    if(jenis === "Syahriyyah" || jenis === "Kas"){


        dataPembayaran.nominal = Number(nilai);

        dataPembayaran.satuan = "Rupiah";


    }



    // Jika pembayaran beras

    else if(jenis === "Beras"){


        dataPembayaran.jumlah = Number(nilai);

        dataPembayaran.satuan = "Liter";


        dataPembayaran.nominal = 0;


    }




    await addDoc(

        collection(db,"payments"),

        dataPembayaran

    );




    document.getElementById("nominal").value="";


    alert("Pembayaran berhasil disimpan ke Firebase.");

};
