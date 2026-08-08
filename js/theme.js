// ======================================
// SYAHRIYYAH APP
// THEME MANAGER
// ======================================

(function () {

    const data =
        JSON.parse(
            localStorage.getItem("pengaturanAplikasi")
        ) || {};

    const tema =
        data.tema || "light";


    // ======================================
    // CEK TEMA SISTEM HP
    // ======================================

    const sistemGelap =
        window.matchMedia &&
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;


    // ======================================
    // TENTUKAN TEMA
    // ======================================

    let gunakanGelap = false;


    if (tema === "dark") {

        gunakanGelap = true;

    } else if (tema === "system") {

        gunakanGelap = sistemGelap;

    }


    // ======================================
    // TERAPKAN
    // ======================================

    if (gunakanGelap) {

        document.body.classList.add("dark-mode");

    } else {

        document.body.classList.remove("dark-mode");

    }


    // ======================================
    // IKUTI PERUBAHAN TEMA HP
    // ======================================

    if (tema === "system") {

        const mediaQuery =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            );


        mediaQuery.addEventListener(
            "change",
            function (event) {

                if (event.matches) {

                    document.body.classList.add(
                        "dark-mode"
                    );

                } else {

                    document.body.classList.remove(
                        "dark-mode"
                    );

                }

            }
        );

    }

})();
