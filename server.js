/* ==========================
   ARASHI BTP - SCRIPT.JS
========================== */

let Pi = null;

/* INITIALISATION */

document.addEventListener("DOMContentLoaded", () => {

    if (window.Pi) {
        Pi = window.Pi;
        Pi.init({ version: "2.0" });
    }

    /* CONNEXION PI */

    const piBtn = document.getElementById("piLogin");

    if (piBtn) {
        piBtn.onclick = () => {

            if (!Pi) {
                alert("Ouvrir dans Pi Browser");
                return;
            }

            Pi.authenticate(
                ["username", "payments"],
                () => {}
            )
            .then(res => {
                alert("Bienvenue " + res.user.username);
            })
            .catch(err => {
                console.log(err);
                alert("Erreur connexion Pi");
            });
        };
    }

    /* CONTACT */

    const contactBtn =
        document.getElementById("contactBtn");

    if (contactBtn) {
        contactBtn.onclick = () => {
            alert(
                "ARASHI BTP\n\n📞 +227 XX XX XX XX\n📍 Niamey, Niger"
            );
        };
    }

    /* CALCULATEUR */

    const calc =
        document.getElementById("calculate");

    if (calc) {

        calc.onclick = () => {

            const s =
                Number(
                    document.getElementById("surface").value
                );

            const p =
                Number(
                    document.getElementById("prix").value
                );

            if (!s || !p) {
                alert("Remplir tous les champs");
                return;
            }

            const total = s * p;

            document.getElementById("result").innerText =
                total.toLocaleString() + " FCFA";
        };
    }

});

/* ==========================
   AUTH
========================== */

function register() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    if (!email || !password) {
        alert("Remplir tous les champs");
        return;
    }

    localStorage.setItem(
        "arashi_email",
        email
    );

    localStorage.setItem(
        "arashi_password",
        password
    );

    alert("Inscription réussie");
}

function login() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const savedEmail =
        localStorage.getItem("arashi_email");

    const savedPassword =
        localStorage.getItem("arashi_password");

    if (
        email === savedEmail &&
        password === savedPassword
    ) {
        document.getElementById(
            "userStatus"
        ).innerText =
            "Connecté : " + email;

    } else {
        alert("Email ou mot de passe incorrect");
    }
}

/* ==========================
   PROJETS
========================== */

function addProject() {

    const name =
        document.getElementById("projectName").value;

    const client =
        document.getElementById("projectClient").value;

    const budget =
        document.getElementById("projectBudget").value;

    if (!name || !client || !budget) {
        alert("Remplir tous les champs");
        return;
    }

    const card =
        document.createElement("div");

    card.className = "card";

    card.innerHTML = `
        <h3>${name}</h3>
        <p>Client : ${client}</p>
        <p>Budget : ${budget} FCFA</p>
    `;

    document
        .getElementById("projectList")
        .appendChild(card);
}

/* ==========================
   PARCELLES
========================== */

function addParcel() {

    const number =
        document.getElementById("parcelNumber").value;

    const area =
        document.getElementById("parcelArea").value;

    const owner =
        document.getElementById("parcelOwner").value;

    if (!number || !area || !owner) {
        alert("Remplir tous les champs");
        return;
    }

    const card =
        document.createElement("div");

    card.className = "card";

    card.innerHTML = `
        <h3>Parcelle ${number}</h3>
        <p>${area} m²</p>
        <p>${owner}</p>
    `;

    document
        .getElementById("parcelList")
        .appendChild(card);
}

/* ==========================
   CHANTIERS
========================== */

function addSite() {

    const name =
        document.getElementById("siteName").value;

    const progress =
        document.getElementById("siteProgress").value;

    if (!name || !progress) {
        alert("Remplir tous les champs");
        return;
    }

    const card =
        document.createElement("div");

    card.className = "card";

    card.innerHTML = `
        <h3>${name}</h3>
        <p>${progress}% réalisé</p>
        <progress value="${progress}" max="100"></progress>
    `;

    document
        .getElementById("siteList")
        .appendChild(card);
}

/* ==========================
   IMMOBILIER
========================== */

function addProperty() {

    const name =
        document.getElementById("propertyName").value;

    const price =
        document.getElementById("propertyPrice").value;

    if (!name || !price) {
        alert("Remplir tous les champs");
        return;
    }

    const card =
        document.createElement("div");

    card.className = "card";

    card.innerHTML = `
        <h3>${name}</h3>
        <p>${price} Pi</p>
        <button onclick="buy('${name}', ${price})">
            Acheter
        </button>
    `;

    document
        .getElementById("propertyList")
        .appendChild(card);
}

/* ==========================
   PAIEMENT PI
========================== */

function buy(name, price) {

    if (!Pi) {
        alert("Connectez-vous avec Pi");
        return;
    }

    Pi.createPayment(

        {
            amount: Number(price),
            memo: "Achat " + name
        },

        (paymentId) => {

            fetch(
                "https://pi-server-8oy1.onrender.com/approve",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },
                    body: JSON.stringify({
                        paymentId
                    })
                }
            );
        },

        (paymentId, txid) => {

            fetch(
                "https://pi-server-8oy1.onrender.com/complete",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },
                    body: JSON.stringify({
                        paymentId,
                        txid
                    })
                }
            );

            alert(
                "Paiement réussi ✅"
            );
        },

        () => {
            alert(
                "Paiement annulé"
            );
        },

        (err) => {
            console.log(err);
            alert(
                "Erreur paiement"
            );
        }
    );
}

/* ==========================
   DEVIS & FACTURE
========================== */

function createQuote() {
    alert("Fonction Devis PDF à connecter");
}

function createInvoice() {
    alert("Fonction Facture PDF à connecter");}