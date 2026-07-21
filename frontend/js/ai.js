// =====================================
// ARASHI v3.0
// ai.js
// =====================================

import { supabase } from "./supabase.js";

const chat = document.getElementById("chatMessages");
const input = document.getElementById("aiInput");
const send = document.getElementById("sendAI");

function addMessage(type, text) {

    if (!chat) return;

    chat.innerHTML += `

    <div class="${type}">

        ${text}

    </div>

    `;

    chat.scrollTop = chat.scrollHeight;

}

async function askAI(question) {

    addMessage("user", question);

    const q = question.toLowerCase();

    let answer = "";

    if (q.includes("terrain")) {

        answer =
        "ARASHI AI conseille une étude topographique avant tout achat de terrain.";

    }

    else if (q.includes("construction")) {

        answer =
        "Le coût dépend du type de bâtiment, de la surface et des matériaux.";

    }

    else if (q.includes("villa")) {

        answer =
        "Nous proposons plusieurs villas disponibles dans le Marketplace.";

    }

    else if (q.includes("gnss")) {

        answer =
        "Nous vendons des récepteurs GNSS RTK, stations totales et drones.";

    }

    else if (q.includes("pi")) {

        answer =
        "Tous les paiements utilisent le SDK officiel Pi Network.";

    }

    else {

        answer =
        "Merci pour votre question. Une version IA avancée sera prochainement connectée.";

    }

    addMessage("assistant", answer);

}

if (send) {

    send.onclick = () => {

        if (!input.value) return;

        askAI(input.value);

        input.value = "";

    };

}

if (input) {

    input.addEventListener("keypress", e => {

        if (e.key === "Enter") {

            send.click();

        }

    });

}

// ===========================
// Estimation terrain
// ===========================

window.estimateLand = function(

    surface,

    price

){

    const total =

    Number(surface) *

    Number(price);

    return total;

};

// ===========================
// Estimation construction
// ===========================

window.estimateConstruction = function(

    surface,

    priceM2

){

    return

    Number(surface)

    *

    Number(priceM2);

};

// ===========================
// Génération devis
// ===========================

window.generateQuote = async function(

    client,

    project,

    amount

){

    await supabase

    .from("quotes")

    .insert({

        client,

        project,

        amount,

        created_at:

        new Date()

    });

    alert("Devis enregistré.");

};

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        addMessage(

            "assistant",

            "Bienvenue sur ARASHI AI."

        );

    }

);
