import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



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



document.getElementById("pemasukan").innerHTML =

"Rp "+
totalMasuk.toLocaleString("id-ID");



document.getElementById("pengeluaran").innerHTML =

"Rp "+
totalKeluar.toLocaleString("id-ID");



document.getElementById("saldo").innerHTML =

"Rp "+
(totalMasuk-totalKeluar)
.toLocaleString("id-ID");







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
