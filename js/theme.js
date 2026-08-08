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

    if (tema === "dark") {

        document.body.classList.add("dark-mode");

        document.documentElement.style.backgroundColor =
            "#121212";

        document.body.style.setProperty(
            "background-color",
            "#121212",
            "important"
        );

    } else {

        document.body.classList.remove("dark-mode");

        document.documentElement.style.backgroundColor =
            "";

        document.body.style.removeProperty(
            "background-color"
        );

    }

})();
