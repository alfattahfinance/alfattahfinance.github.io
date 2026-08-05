// Ambil data santri
const daftarSantri = JSON.parse(localStorage.getItem("santri")) || [];

// Ambil data pembayaran
let pembayaran = JSON.parse(localStorage.getItem("pembayaran")) || [];

// Isi dropdown santri
const selectSantri = document.getElementById("santri");

daftarSantri.forEach((santri) => {
    const option = document.createElement("option");
    option.value = santri.nama;
    option.textContent = santri.nama;
    selectSantri.appendChild(option);
});

// Tampilkan riwayat saat halaman dibuka
tampilkanRiwayat();

function simpanPembayaran() {

    const nama = document.getElementById("santri").value;
    const jenis = document.getElementById("jenis").value;
    const nominal = document.getElementById("nominal").value;

    if (nominal === "") {
        alert("Masukkan nominal pembayaran.");
        return;
    }

    pembayaran.push({
        nama,
        jenis,
        nominal,
        tanggal: new Date().toLocaleDateString("id-ID")
    });

    localStorage.setItem("pembayaran", JSON.stringify(pembayaran));

    document.getElementById("nominal").value = "";

    tampilkanRiwayat();

    alert("Pembayaran berhasil disimpan.");
}

function tampilkanRiwayat() {

    const riwayat = document.getElementById("riwayat");

    riwayat.innerHTML = "";

    if (pembayaran.length === 0) {
        riwayat.innerHTML =
        "<li class='list-group-item'>Belum ada pembayaran.</li>";
        return;
    }

    pembayaran.forEach((item) => {

        riwayat.innerHTML += `
        <li class="list-group-item">
            <strong>${item.nama}</strong><br>
            ${item.jenis}<br>
            Rp ${Number(item.nominal).toLocaleString("id-ID")}<br>
            <small>${item.tanggal}</small>
        </li>
        `;

    });

}
