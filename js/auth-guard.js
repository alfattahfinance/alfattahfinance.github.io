// ======================================
// Syahriyyah / Alfattah Finance
// AUTH GUARD
// ======================================

import { auth } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

alert("AUTH GUARD JALAN");

onAuthStateChanged(auth, (user) => {

    if (user) {

        alert("SUDAH LOGIN: " + user.email);

    } else {

        alert("BELUM LOGIN");

        window.location.href = "login.html";

    }

});
