import { db } from "./firebase-config.js";


import {
collection,
addDoc,
getDocs,
serverTimestamp,
query,
orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";




// Simpan pengeluaran

window.simpanPengeluaran = async function(){


const jenis =
document.getElementById("jenis").value;


const keterangan =
document.getElementById("keterangan").value;


const jumlah =
document.getElementById("jumlah").value;


const satuan =
document.getElementById("satuan").value;



if(
jenis==="" ||
keterangan==="" ||
jumlah===""
){

alert("Data belum lengkap");

return;

}



await addDoc(
collection(db,"expenses"),
{

jenis:jenis,

keterangan:keterangan,

jumlah:Number(jumlah),

satuan:satuan,

tanggal:serverTimestamp()

}
);



alert("Pengeluaran berhasil disimpan");



document.getElementById("keterangan").value="";

document.getElementById("jumlah").value="";



tampilkanPengeluaran();



};






// Tampilkan riwayat

async function tampilkanPengeluaran(){


const list =
document.getElementById("riwayat");


list.innerHTML="";



const data =
await getDocs(
collection(db,"expenses")
);



data.forEach((doc)=>{


const item=doc.data();



list.innerHTML += `

<li class="list-group-item">

<b>${item.jenis}</b><br>

${item.keterangan}<br>

${item.jumlah.toLocaleString("id-ID")} ${item.satuan}

</li>

`;



});



}



tampilkanPengeluaran();
