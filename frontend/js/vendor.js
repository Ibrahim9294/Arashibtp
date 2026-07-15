// ==========================================
// ARASHI VENDOR CENTER
// Version connectée Backend + Supabase
// ==========================================


const API_URL =
"https://entreprise-arashi.onrender.com";



// ==========================================
// CREER UNE BOUTIQUE
// ==========================================

function createShop(){

    const name =
    document.getElementById("shopName").value;

    const country =
    document.getElementById("shopCountry").value;

    const email =
    document.getElementById("shopEmail").value;


    if(!name || !country || !email){

        alert("Veuillez remplir tous les champs.");
        return;

    }


    const shop = {

        name,
        country,
        email

    };


    localStorage.setItem(
        "arashiShop",
        JSON.stringify(shop)
    );


    document.getElementById("shopStatus").innerHTML =
    "✅ Boutique créée : "+name;

}



// ==========================================
// PUBLIER UN PRODUIT
// ==========================================

async function publishProduct(){


    const title =
    document.getElementById("productTitle").value;


    const category =
    document.getElementById("productCategory").value;


    const price =
    Number(
    document.getElementById("productPrice").value
    );


    const description =
    document.getElementById("productDescription").value;



    if(!title || !category || !price){

        alert("Veuillez remplir les informations.");
        return;

    }



    const product = {


        title:title,

        category:category,

        description:description,

        price_pi:price,

        image_url:""


    };



    try{


        const response = await fetch(

            API_URL+"/products",

            {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },


            body:
            JSON.stringify(product)


            }

        );



        const data =
        await response.json();



        if(response.ok){


            alert(
            "✅ Produit publié dans Marketplace"
            );


            clearForm();

            loadProducts();



        }else{


            alert(
            "Erreur : "+JSON.stringify(data)
            );


        }



    }catch(error){


        console.log(error);

        alert(
        "Serveur indisponible"
        );


    }



}




// ==========================================
// AFFICHER LES PRODUITS
// ==========================================

async function loadProducts(){


const box =
document.getElementById("vendorProducts");



if(!box){

return;

}



try{


const response =
await fetch(

API_URL+"/products"

);



const products =
await response.json();



box.innerHTML="";



if(products.length===0){


box.innerHTML=
"<p>Aucun produit publié.</p>";

updateStats([]);

return;

}



products.forEach(product=>{


const card =
document.createElement("div");


card.className="card";



card.innerHTML=`

<h3>${product.title}</h3>


<p>
Catégorie :
${product.category}
</p>


<p>
${product.description || ""}
</p>


<strong>
${product.price_pi} π
</strong>


<br>


<button onclick="deleteProduct('${product.id}')">

🗑️ Supprimer

</button>


`;



box.appendChild(card);



});



updateStats(products);



}catch(error){


console.log(error);


box.innerHTML=
"<p>Erreur chargement produits</p>";


}



}




// ==========================================
// SUPPRIMER PRODUIT
// ==========================================

async function deleteProduct(id){



if(!confirm("Supprimer ce produit ?")){

return;

}



try{


await fetch(

API_URL+"/products/"+id,

{

method:"DELETE"

}

);



loadProducts();



}catch(error){


console.log(error);


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
// STATISTIQUES
// ==========================================

function updateStats(products){



const total =
document.getElementById(
"vendorTotalProducts"
);



if(total){

total.innerHTML =
products.length;

}



const revenue =
document.getElementById(
"vendorRevenue"
);



if(revenue){


let sum=0;


products.forEach(p=>{


sum += Number(p.price_pi);


});



revenue.innerHTML =
sum+" π";


}



}



// ==========================================
// INITIALISATION
// ==========================================

document.addEventListener(

"DOMContentLoaded",

()=>{

loadProducts();

}

);
