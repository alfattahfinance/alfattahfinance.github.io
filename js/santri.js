let daftar = JSON.parse(localStorage.getItem("santri")) || [];

tampilkan();

function tambahSantri() {
    const nama = document.getElementById("nama").value.trim();
    const kelas = document.getElementById("kelas").value.trim();
    const wali = document.getElementById("wali").value.trim();

    if (!nama || !kelas) {
        alert("Nama dan kelas harus diisi!");
        return;
    }

    daftar.push({ nama, kelas, wali });

    localStorage.setItem("santri", JSON.stringify(daftar));

    document.getElementById("nama").value = "";
    document.getElementById("kelas").value = "";
    document.getElementById("wali").value = "";

    tampilkan();
}

function tampilkan() {
    const daftarSantri = document.getElementById("daftarSantri");
    daftarSantri.innerHTML = "";

    if (daftar.length === 0) {
        daftarSantri.innerHTML =
            "<li class='list-group-item'>Belum ada data santri.</li>";
        return;
    }

    daftar.forEach((s, index) => {
        daftarSantri.innerHTML += `
            <li class="list-group-item d-flex justify-content-between">
                <div>
                    <strong>${s.nama}</strong><br>
                    ${s.kelas}<br>
                    ${s.wali}
                </div>

                <button class="btn btn-danger btn-sm" onclick="hapusSantri(${index})">
                    Hapus
                </button>
            </li>
        `;
    });
}

function hapusSantri(index) {
    daftar.splice(index, 1);
    localStorage.setItem("santri", JSON.stringify(daftar));
    tampilkan();
}
