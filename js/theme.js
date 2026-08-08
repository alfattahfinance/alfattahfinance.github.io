// ======================================
// SYAHRIYYAH APP
// THEME MANAGER
// ======================================

function terapkanTemaGlobal() {

    const data =
        JSON.parse(
            localStorage.getItem("pengaturanAplikasi")
        ) || {};

    const tema =
        data.tema || "light";

    let gunakanGelap = false;

    if (tema === "dark") {

        gunakanGelap = true;

    } else if (tema === "system") {

        gunakanGelap =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;
    }


    if (gunakanGelap) {

        document.documentElement.classList.add("dark-mode");
        document.body.classList.add("dark-mode");

    } else {

        document.documentElement.classList.remove("dark-mode");
        document.body.classList.remove("dark-mode");

    }

}


// Jalankan setelah halaman siap

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        terapkanTemaGlobal
    );

} else {

    terapkanTemaGlobal();

}
