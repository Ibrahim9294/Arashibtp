// ==========================================
// ARASHI VENDOR CENTER
// Gestion boutique et produits
// ==========================================


let vendorProducts = JSON.parse(
    localStorage.getItem("arashiProducts")
) || [];



// ==========================================
// CREER UNE BOUTIQUE
// ==========================================

function createShop(){

    const name = document.getElementById("shopName").value;
    const country = document.getElementById("shopCountry").value;
    const email = document.getElementById("shopEmail").value;


    if(!name || !country || !email){

        alert("Veuillez remplir tous les champs.");

        return;
    }


    const shop = {

        name:name,
        country:country,
        email:email

    };


    localStorage.setItem(
        "arashiShop",
        JSON.stringify(shop)
    );


    document.getElementById("shopStatus").innerHTML =
    "✅ Boutique créée : " + name;


}





// ==========================================
// PUBLIER UN PRODUIT
// ==========================================

function publishProduct(){


    const title =
    document.getElementById("productTitle").value;


    const category =
    document.getElementById("productCategory").value;


    const price =
    Number(document.getElementById("productPrice").value);


    const description =
    document.getElementById("productDescription").value;



    if(!title || !category || !price){

        alert("Veuillez remplir les informations du produit.");

        return;

    }



    const product = {

        id: Date.now(),

        title:title,

        category:category,

        price:price,

        description:description,

        date:new Date().toLocaleDateString(),

        sales:0

    };



    vendorProducts.push(product);



    localStorage.setItem(

        "arashiProducts",

        JSON.stringify(vendorProducts)

    );



    alert("✅ Produit publié avec succès.");



    clearForm();


    loadProducts();


}




// ==========================================
// AFFICHER LES PRODUITS DU VENDEUR
// ==========================================

function loadProducts(){


    const box =
    document.getElementById("vendorProducts");


    if(!box){

        return;

    }



    box.innerHTML="";



    if(vendorProducts.length===0){


        box.innerHTML =
        "<p>Aucun produit publié.</p>";

        updateStats();

        return;

    }





    vendorProducts.forEach(product=>{


        const card =
        document.createElement("div");


        card.className="card";



        card.innerHTML = `

        <h3>${product.title}</h3>

        <p>
        Catégorie : ${product.category}
        </p>

        <p>
        ${product.description}
        </p>

        <strong>
        ${product.price} π
        </strong>


        <br>


        <button onclick="deleteProduct(${product.id})">
        🗑️ Supprimer
        </button>


        `;



        box.appendChild(card);



    });



    updateStats();



}





// ==========================================
// SUPPRIMER UN PRODUIT
// ==========================================

function deleteProduct(id){


    vendorProducts =
    vendorProducts.filter(
        product => product.id !== id
    );



    localStorage.setItem(

        "arashiProducts",

        JSON.stringify(vendorProducts)

    );



    loadProducts();


}




// ==========================================
// SUPPRIMER TOUS LES PRODUITS
// ==========================================

function clearVendorProducts(){


    if(confirm("Supprimer tous les produits ?")){


        vendorProducts=[];


        localStorage.removeItem(
            "arashiProducts"
        );


        loadProducts();

    }


}





// ==========================================
// VIDER FORMULAIRE
// ==========================================

function clearForm(){


    document.getElementById("productTitle").value="";

    document.getElementById("productCategory").value="";

    document.getElementById("productPrice").value="";

    document.getElementById("productDescription").value="";


}





// ==========================================
// STATISTIQUES VENDEUR
// ==========================================

function updateStats(){


    const total =
    document.getElementById("vendorTotalProducts");


    if(total){

        total.innerHTML =
        vendorProducts.length;

    }



    const revenue =
    document.getElementById("vendorRevenue");


    if(revenue){

        let sum=0;


        vendorProducts.forEach(p=>{

            sum += p.price;

        });


        revenue.innerHTML =
        sum+" π";

    }


}





// ==========================================
// CHARGEMENT
// ==========================================

document.addEventListener(
"DOMContentLoaded",
()=>{

    loadProducts();

});
