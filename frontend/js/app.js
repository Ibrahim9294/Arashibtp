// ===============================
// ARASHI v3.0 - app.js
// ===============================

import { supabase } from "./supabase.js";

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const userStatus = document.getElementById("userStatus");
const piLoginBtn = document.getElementById("piLogin");
async function loadStatistics() {

    try {

        const [
            users,
            vendors,
            properties,
            payments
        ] = await Promise.all([

            supabase.from("profiles").select("*", { count: "exact", head: true }),
            supabase.from("vendors").select("*", { count: "exact", head: true }),
            supabase.from("properties").select("*", { count: "exact", head: true }),
            supabase.from("payments").select("*")

        ]);

        document.getElementById("totalUsers").textContent =
            users.count || 0;

        document.getElementById("totalVendors").textContent =
            vendors.count || 0;

        document.getElementById("totalProperties").textContent =
            properties.count || 0;

        let totalPi = 0;

        payments.data?.forEach(p => {

            if (p.status === "completed") {

                totalPi += Number(p.amount);

            }

        });

        document.getElementById("totalPayments").textContent =
            totalPi + " π";

    }

    catch (e) {

        console.error(e);

    }

}

loadStatistics();

window.buy = async function (productName, amount) {

    if (!window.createPiPayment) {

        alert("Pi Payment n'est pas chargé.");

        return;

    }

    await window.createPiPayment(
        amount,
        productName
    );

};

const search = document.getElementById("globalSearch");

if (search) {

    search.addEventListener("keyup", e => {

        const value = e.target.value.toLowerCase();

        document.querySelectorAll(".service-card").forEach(card => {

            card.style.display =
                card.innerText.toLowerCase().includes(value)
                ? "block"
                : "none";

        });

    });

}

document.addEventListener("DOMContentLoaded", () => {

    const savedUser = localStorage.getItem("pi_user");

    if (savedUser) {

        const user = JSON.parse(savedUser);

        const status = document.getElementById("userStatus");

        if (status) {

            status.innerHTML =
                `🟢 @${user.username}`;

        }

    }

});
// ===============================
// MENU MOBILE
// ===============================

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });
}
// ===============================
// UTILISATEUR CONNECTÉ
// ===============================

function checkUser() {

    const saved = localStorage.getItem("pi_user");

    if (!saved) {
        if(userStatus){
            userStatus.textContent = "Non connecté";
        }
        return;
    }

    const user = JSON.parse(saved);

    if(userStatus){
        userStatus.innerHTML = `🟢 @${user.username}`;
    }

}
// ===============================
// STATISTIQUES
// ===============================

async function loadStatistics(){

    try{

        const {count:users}=await supabase
        .from("profiles")
        .select("*",{count:"exact",head:true});

        const {count:vendors}=await supabase
        .from("vendors")
        .select("*",{count:"exact",head:true});

        const {count:properties}=await supabase
        .from("properties")
        .select("*",{count:"exact",head:true});

        const {data:payments}=await supabase
        .from("payments")
        .select("amount");

        let totalPi=0;

        if(payments){
            payments.forEach(p=>{
                totalPi+=Number(p.amount)||0;
            });
        }

        if(document.getElementById("totalUsers"))
            document.getElementById("totalUsers").textContent=users||0;

        if(document.getElementById("totalVendors"))
            document.getElementById("totalVendors").textContent=vendors||0;

        if(document.getElementById("totalProperties"))
            document.getElementById("totalProperties").textContent=properties||0;

        if(document.getElementById("totalPayments"))
            document.getElementById("totalPayments").textContent=totalPi+" π";

    }catch(e){

        console.error(e);

    }

}
// ===============================
// PRODUITS POPULAIRES
// ===============================

async function loadPopularProducts() {

    const grid = document.getElementById("popularProductsGrid");

    if (!grid) return;

    try {

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(4);

        if (error) throw error;

        if (!data || data.length === 0) {
            grid.innerHTML = `
                <div class="product-card-placeholder">
                    Aucun produit disponible.
                </div>`;
            return;
        }

        grid.innerHTML = "";

        data.forEach(product => {

            grid.innerHTML += `

            <div class="service-card">

                <img
                    src="${product.image_url || 'assets/images/placeholder.jpg'}"
                    alt="${product.title}"
                    style="width:100%;height:180px;object-fit:cover;border-radius:8px;">

                <h3>${product.title}</h3>

                <p>${product.description || ""}</p>

                <strong style="color:#0B3D91">
                    ${product.price_pi || 0} π
                </strong>

            </div>

            `;

        });

    } catch (err) {

        console.error(err);

    }

}

loadPopularProducts();
// ===============================
// NOTIFICATIONS
// ===============================

window.showNotification = function(message) {

    alert(message);

};
// ===============================
// DECONNEXION
// ===============================

window.logout = function() {

    localStorage.removeItem("pi_user");

    location.reload();

};
// ===============================
// SESSION
// ===============================

window.addEventListener("load", () => {

    const saved = localStorage.getItem("pi_user");

    if (saved) {

        const user = JSON.parse(saved);

        const status = document.getElementById("userStatus");

        if (status) {

            status.innerHTML = "🟢 @" + user.username;

        }

    }

});// ===============================
// AUTO REFRESH
// ===============================

setInterval(() => {

    loadStatistics();

}, 30000);