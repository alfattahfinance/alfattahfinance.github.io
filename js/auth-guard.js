// ======================================
// Syahriyyah / Alfattah Finance
// AUTH GUARD
// ======================================

import { auth } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log("SUDAH LOGIN:", user.email);

        // User sudah login
        // Halaman boleh dilanjutkan

    } else {

        console.log("BELUM LOGIN");

        window.location.href = "Login.html";

    }

});
