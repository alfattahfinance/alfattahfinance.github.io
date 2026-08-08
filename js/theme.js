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
    }

})();
