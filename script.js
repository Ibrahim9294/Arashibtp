// ==================================================
// ENTREPRISE ARASHI
// SCRIPT PRINCIPAL
// Version Production
// Compatible Pi Browser + Pi App Studio
// ==================================================

// ================= CONFIG =================

const BACKEND_URL = "https://entreprise-arashi.onrender.com";

// ================= RETOUR =================

function goBack(){
    history.back();
}

// ================= AUTH =================

function register(){

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if(email==="" || password===""){
        alert("Veuillez remplir tous les champs.");
        return;
    }

    localStorage.setItem("userEmail",email);
    localStorage.setItem("userPassword",password);

    alert("Compte créé avec succès.");
}

function login(){

    const email=document.getElementById("email").value.trim();
    const password=document.getElementById("password").value.trim();

    if(
        email===localStorage.getItem("userEmail") &&
        password===localStorage.getItem("userPassword")
    ){

        document.getElementById("userStatus").innerHTML=
        "✅ Connecté : "+email;

    }else{

        alert("Email ou mot de passe incorrect.");

    }

}

// ================= CONTACT =================

document.addEventListener("DOMContentLoaded",()=>{

    const btn=document.getElementById("contactBtn");

    if(btn){

        btn.onclick=function(){

            alert(
`ENTREPRISE ARASHI

Construction
Immobilier
Topographie

Niamey - Niger`
);

        };

    }

});

// ================= SCROLL =================

function scrollToMarketplace(){

    document.getElementById("marketplace").scrollIntoView({

        behavior:"smooth"

    });

}

// ================= CALCULATEUR =================

function calculatePrice(){

    const surface=Number(document.getElementById("surface").value);

    const prix=Number(document.getElementById("prixM2").value);

    if(surface<=0 || prix<=0){

        alert("Valeurs invalides.");

        return;

    }

    const total=surface*prix;

    document.getElementById("calculationResult").innerHTML=

    total.toLocaleString()+" FCFA";

}

// ================= PROJETS =================

function addProject(){

    const nom=document.getElementById("projectName").value;

    const client=document.getElementById("projectClient").value;

    const budget=document.getElementById("projectBudget").value;

    if(!nom || !client || !budget){

        alert("Complétez les informations.");

        return;

    }

    const card=document.createElement("div");

    card.className="card";

    card.innerHTML=`

    <h3>${nom}</h3>

    <p>Client : ${client}</p>

    <p>Budget : ${budget} FCFA</p>

    `;

    document.getElementById("projectList").appendChild(card);

}

// ==================================================
// PI NETWORK LOGIN
// ==================================================

document.addEventListener("DOMContentLoaded", async ()=>{

    if(!window.Pi){

        console.log("Pi SDK non détecté.");

        return;

    }

    Pi.init({

        version:"2.0",

        sandbox:true

    });

    const piBtn=document.getElementById("piLogin");

    if(piBtn){

        piBtn.onclick=async function(){

            try{

                const auth=await Pi.authenticate(

                    ["username","payments"],

                    function(){}

                );

                document.getElementById("userStatus").innerHTML=

                "🟢 Pi : "+auth.user.username;

                console.log(auth);

            }

            catch(error){

                console.error(error);

                alert("Connexion Pi annulée.");

            }

        };

    }

});


// ==================================================
// ACHAT PI NETWORK
// ==================================================

async function buy(productName,amount){

    if(!window.Pi){

        alert("Ouvrez cette application dans Pi Browser.");

        return;

    }

    try{

        const paymentData={

            amount:Number(amount),

            memo:"Achat "+productName,

            metadata:{

                product:productName,

                company:"Entreprise ARASHI"

            }

        };

        const callbacks={

            onReadyForServerApproval:async function(paymentId){

                const response=await fetch(

                    BACKEND_URL+"/approve",

                    {

                        method:"POST",

                        headers:{

                            "Content-Type":"application/json"

                        },

                        body:JSON.stringify({

                            paymentId,

                            product:productName,

                            amount

                        })

                    }

                );

                if(!response.ok){

                    throw new Error("Erreur approbation paiement.");

                }

            },

            onReadyForServerCompletion:async function(paymentId,txid){

                const response=await fetch(

                    BACKEND_URL+"/complete",

                    {

                        method:"POST",

                        headers:{

                            "Content-Type":"application/json"

                        },

                        body:JSON.stringify({

                            paymentId,

                            txid

                        })

                    }

                );

                if(!response.ok){

                    throw new Error("Erreur finalisation paiement.");

                }

                alert("✅ Paiement effectué avec succès.");

            },

            onCancel:function(){

                alert("Paiement annulé.");

            },

            onError:function(error){

                console.error(error);

                alert("Erreur Pi Network.");

            }

        };

        await Pi.createPayment(

            paymentData,

            callbacks

        );

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}

// ==================================================
// MARKETPLACE
// ==================================================

let cart = [];
let favorites = [];

function addMarketItem() {

    const title = document.getElementById("marketTitle").value.trim();
    const category = document.getElementById("marketCategory").value.trim();
    const price = Number(document.getElementById("marketPrice").value);
    const file = document.getElementById("marketImage").files[0];

    if (!title || !category || !price) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    let image = "assets/no-image.png";

    if (file) {
        image = URL.createObjectURL(file);
    }

    const card = document.createElement("div");

    card.className = "product-card";

    card.innerHTML = `
        <img src="${image}" alt="${title}">
        <h3>${title}</h3>
        <p>${category}</p>
        <strong>${price} π</strong>

        <button onclick="buy('${title}',${price})">
            Acheter
        </button>

        <button onclick="addToCart('${title}',${price})">
            🛒 Panier
        </button>

        <button onclick="addFavorite('${title}')">
            ❤️ Favori
        </button>
    `;

    document.getElementById("marketList").appendChild(card);

    document.getElementById("marketTitle").value = "";
    document.getElementById("marketCategory").value = "";
    document.getElementById("marketPrice").value = "";
    document.getElementById("marketImage").value = "";

    alert("Produit ajouté.");
}

// ==================================================
// PANIER
// ==================================================

function addToCart(name, price) {

    cart.push({
        name,
        price
    });

    updateCart();

}

function updateCart() {

    const list = document.getElementById("cartList");

    const total = document.getElementById("cartTotal");

    list.innerHTML = "";

    let somme = 0;

    cart.forEach(function(item){

        somme += item.price;

        const p = document.createElement("p");

        p.innerHTML =
        item.name + " - " + item.price + " π";

        list.appendChild(p);

    });

    total.innerHTML = somme + " π";

}

function checkout(){

    if(cart.length===0){

        alert("Votre panier est vide.");

        return;

    }

    const total = cart.reduce((s,item)=>s+item.price,0);

    buy("Panier ARASHI",total);

}

// ==================================================
// FAVORIS
// ==================================================

function addFavorite(product){

    favorites.push(product);

    const div=document.createElement("p");

    div.innerHTML="❤️ "+product;

    document.getElementById("favoriteList").appendChild(div);

}

// ==================================================
// PARCELLES
// ==================================================

function addParcel(){

    const numero=document.getElementById("parcelNumber").value.trim();
    const superficie=document.getElementById("parcelArea").value.trim();
    const proprietaire=document.getElementById("parcelOwner").value.trim();

    if(!numero || !superficie || !proprietaire){

        alert("Veuillez remplir tous les champs.");

        return;

    }

    const card=document.createElement("div");

    card.className="card";

    card.innerHTML=`

        <h3>Parcelle ${numero}</h3>

        <p>Superficie : ${superficie} m²</p>

        <p>Propriétaire : ${proprietaire}</p>

    `;

    document.getElementById("parcelList").appendChild(card);

    updateDashboard();

}

// ==================================================
// CHANTIERS
// ==================================================

function addSite(){

    const chantier=document.getElementById("siteName").value.trim();
    const avancement=document.getElementById("siteProgress").value.trim();

    if(!chantier || !avancement){

        alert("Veuillez remplir tous les champs.");

        return;

    }

    const card=document.createElement("div");

    card.className="card";

    card.innerHTML=`

        <h3>${chantier}</h3>

        <p>Avancement : ${avancement}%</p>

    `;

    document.getElementById("siteList").appendChild(card);

}

// ==================================================
// DASHBOARD
// ==================================================

function updateDashboard(){

    document.getElementById("totalProjects").innerHTML=
    document.getElementById("projectList").children.length;

    document.getElementById("totalParcels").innerHTML=
    document.getElementById("parcelList").children.length;

    document.getElementById("totalProperties").innerHTML=
    document.getElementById("marketList").children.length;

    const total=cart.reduce((s,item)=>s+item.price,0);

    document.getElementById("totalRevenue").innerHTML=
    total+" π";

}

// ==================================================
// IMPORT TOPO
// ==================================================

document.addEventListener("DOMContentLoaded",()=>{

    const topo=document.getElementById("topoFile");

    if(topo){

        topo.addEventListener("change",function(){

            if(this.files.length>0){

                alert("Fichier importé : "+this.files[0].name);

            }

        });

    }

});

// ==================================================
// INITIALISATION
// ==================================================

document.addEventListener("DOMContentLoaded",()=>{

    updateDashboard();

    console.log("✅ Entreprise ARASHI chargée.");

});