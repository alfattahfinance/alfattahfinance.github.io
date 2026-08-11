import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ======================================
// ANIMASI ANGKA BERHITUNG
// ======================================

function animasiAngka(elementId, nilaiAkhir, durasi = 1000) {

    const element = document.getElementById(elementId);

    if (!element) return;

    const mulai = 0;
    const waktuMulai = performance.now();

    function jalankan(waktuSekarang) {

        const progress =
            Math.min((waktuSekarang - waktuMulai) / durasi, 1);

        // Efek lebih halus di awal dan akhir
        const easing =
            1 - Math.pow(1 - progress, 3);

        const nilaiSekarang =
            Math.floor(
                mulai + (nilaiAkhir - mulai) * easing
            );

        element.innerHTML =
            "Rp " +
            nilaiSekarang.toLocaleString("id-ID");

        if (progress < 1) {

            requestAnimationFrame(jalankan);

        } else {

            // Pastikan angka akhir tepat
            element.innerHTML =
                "Rp " +
                nilaiAkhir.toLocaleString("id-ID");

        }

    }

    requestAnimationFrame(jalankan);
}

window.hitungLaporan = async function(){


let bulan =
Number(document.getElementById("bulan").value);


let tahun =
Number(document.getElementById("tahun").value);


let filterJenis =
document.getElementById("jenisPengeluaran").value;



let pemasukan = {

    Syahriyyah:0,
    Kas:0,
    Beras:0

};



let pengeluaran = {

    Syahriyyah:0,
    Kas:0,
    Beras:0,
    Lainnya:0

};



let riwayat = [];




// =====================
// AMBIL PEMBAYARAN
// =====================


const bayar =
await getDocs(
collection(db,"payments")
);



bayar.forEach((doc)=>{


let data = doc.data();



if(data.tanggal){


let tanggal =
data.tanggal.toDate();



if(
tanggal.getMonth() === bulan &&
tanggal.getFullYear() === tahun
){


if(data.jenis==="Beras"){


pemasukan.Beras +=
Number(data.jumlah || 0);


}


else{


pemasukan[data.jenis] +=
Number(data.nominal || 0);


}



riwayat.push({

nama:data.nama_santri,

jenis:data.jenis,

jumlah:
data.jenis==="Beras"
?
data.jumlah+" Liter"
:
"Rp "+Number(data.nominal).toLocaleString("id-ID"),

tipe:"Masuk"


});



}


}



});





// =====================
// AMBIL PENGELUARAN
// =====================


const keluar =
await getDocs(
collection(db,"expenses")
);



keluar.forEach((doc)=>{


let data = doc.data();



if(data.tanggal){


let tanggal =
data.tanggal.toDate();



if(
tanggal.getMonth() === bulan &&
tanggal.getFullYear() === tahun
){



// filter jenis

if(
filterJenis !== "Semua" &&
data.jenis !== filterJenis
){

return;

}



if(data.satuan==="Liter"){


pengeluaran.Beras +=
Number(data.jumlah);


}



else{


if(pengeluaran[data.jenis] !== undefined){

pengeluaran[data.jenis] +=
Number(data.jumlah);

}

else{

pengeluaran.Lainnya +=
Number(data.jumlah);

}


}





riwayat.push({

nama:data.keterangan,

jenis:data.jenis,

jumlah:
data.satuan==="Liter"
?
data.jumlah+" Liter"
:
"Rp "+Number(data.jumlah).toLocaleString("id-ID"),

tipe:"Keluar"


});



}



}



});







// =====================
// TOTAL
// =====================


let totalMasuk =

pemasukan.Syahriyyah+

pemasukan.Kas;



let totalKeluar =

pengeluaran.Syahriyyah+

pengeluaran.Kas+

pengeluaran.Lainnya;



// ======================================
// TAMPILKAN ANGKA DENGAN ANIMASI
// ======================================

animasiAngka(
    "pemasukan",
    totalMasuk,
    1200
);

animasiAngka(
    "pengeluaran",
    totalKeluar,
    1200
);

animasiAngka(
    "saldo",
    totalMasuk - totalKeluar,
    1200
);

// =====================
// REKAP
// =====================


let tabel = "";


["Syahriyyah","Kas","Beras"].forEach(jenis=>{


let masuk =
pemasukan[jenis];


let keluar =
pengeluaran[jenis];



tabel += `

<tr>

<td>${jenis}</td>


<td>

${
jenis==="Beras"

?
masuk+" Liter"

:

"Rp "+
masuk.toLocaleString("id-ID")

}

</td>



<td>

${
jenis==="Beras"

?
keluar+" Liter"

:

"Rp "+
keluar.toLocaleString("id-ID")

}

</td>




<td>

${
jenis==="Beras"

?
(masuk-keluar)+" Liter"

:

"Rp "+
(masuk-keluar)
.toLocaleString("id-ID")

}

</td>


</tr>

`;



});



document.getElementById("rekap").innerHTML = tabel;








// =====================
// RIWAYAT
// =====================


let daftar = "";



riwayat.forEach(item=>{


daftar += `

<div class="border rounded p-2 mb-2">


<b>${item.nama}</b><br>


${item.jenis}<br>


${item.jumlah}<br>


<span>

${item.tipe}

</span>


</div>

`;



});



document.getElementById("riwayat").innerHTML =

daftar || "Belum ada transaksi.";



};
