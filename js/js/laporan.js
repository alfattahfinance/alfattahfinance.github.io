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



let pemasukan = {

Syahriyyah:0,

Kas:0,

Beras:0

};



let pengeluaran = {

Syahriyyah:0,

Kas:0,

Beras:0

};





// Ambil pembayaran

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
tanggal.getMonth()==bulan &&
tanggal.getFullYear()==tahun
){


if(data.jenis=="Beras"){

pemasukan.Beras += Number(data.jumlah || 0);

}

else{

pemasukan[data.jenis] += Number(data.nominal || 0);

}


}


}



});





// Ambil pengeluaran

const keluar =
await getDocs(
collection(db,"expenses")
);



keluar.forEach((doc)=>{


let data=doc.data();



if(data.tanggal){


let tanggal =
data.tanggal.toDate();



if(
tanggal.getMonth()==bulan &&
tanggal.getFullYear()==tahun
){



if(data.satuan=="Liter"){

pengeluaran.Beras += Number(data.jumlah);


}

else{

pengeluaran[data.jenis] += Number(data.jumlah);


}


}


}


});





let totalMasuk =
pemasukan.Syahriyyah+
pemasukan.Kas;



let totalKeluar =
pengeluaran.Syahriyyah+
pengeluaran.Kas;



document.getElementById("pemasukan").innerHTML =
"Rp "+totalMasuk.toLocaleString("id-ID");



document.getElementById("pengeluaran").innerHTML =
"Rp "+totalKeluar.toLocaleString("id-ID");



document.getElementById("saldo").innerHTML =
"Rp "+(totalMasuk-totalKeluar).toLocaleString("id-ID");





document.getElementById("rekap").innerHTML = "";


["Syahriyyah","Kas","Beras"].forEach(jenis=>{


let masuk=pemasukan[jenis];

let keluar=pengeluaran[jenis];


document.getElementById("rekap").innerHTML += `

<tr>

<td>${jenis}</td>

<td>${jenis=="Beras" ? masuk+" Liter" : "Rp "+masuk.toLocaleString("id-ID")}</td>

<td>${jenis=="Beras" ? keluar+" Liter" : "Rp "+keluar.toLocaleString("id-ID")}</td>

<td>${jenis=="Beras" ? (masuk-keluar)+" Liter" : "Rp "+(masuk-keluar).toLocaleString("id-ID")}</td>

</tr>

`;

});


}
