// ==========================================
// ARASHI MARKETPLACE
// Affichage des produits vendeurs
// ==========================================


let marketplaceProducts = JSON.parse(
    localStorage.getItem("arashiProducts")
) || [];



// ==========================================
// CHARGER LES PRODUITS
// ==========================================

function loadMarketplace(){


    const list =
    document.getElementById("marketList");


    if(!list){

        return;

    }


    list.innerHTML="";



    if(marketplaceProducts.length === 0){


        list.innerHTML =
        "<p>Aucun produit disponible.</p>";


        return;

    }



    marketplaceProducts.forEach(product=>{


        const card =
        document.createElement("div");


        card.className="product-card";



        card.innerHTML = `


        <h3>
        ${product.title}
        </h3>


        <p>
        Catégorie : ${product.category}
        </p>


        <p>
        ${product.description}
        </p>


        <strong>
        ${product.price} π
        </strong>


        <button onclick="addToCart('${product.title}',${product.price})">

        🛒 Ajouter au panier

        </button>


        <button onclick="buy('${product.title}',${product.price})">

        💳 Acheter avec Pi

        </button>


        `;



        list.appendChild(card);



    });



}



// ==========================================
// INITIALISATION
// ==========================================

document.addEventListener(
"DOMContentLoaded",
()=>{

    loadMarketplace();

});
