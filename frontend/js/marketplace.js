
// ==========================================
// ARASHI MARKETPLACE
// Connexion Supabase via Render
// ==========================================


const API_URL =
"https://entreprise-arashi.onrender.com";



async function loadMarketplace(){


const list =
document.getElementById("marketList");


if(!list) return;



try{


const response =
await fetch(
API_URL+"/products"
);



const products =
await response.json();



list.innerHTML="";



if(products.length===0){

list.innerHTML =
"<p>Aucun produit disponible</p>";

return;

}



products.forEach(product=>{


list.innerHTML += `

<div class="product-card">


<h3>
${product.title}
</h3>


<p>
${product.category}
</p>


<p>
${product.description || ""}
</p>


<strong>
${product.price_pi} π
</strong>


<br><br>


<button onclick="addToCart(
'${product.title}',
${product.price_pi}
)">

🛒 Ajouter au panier

</button>


</div>

`;


});



}catch(error){


console.log(error);


list.innerHTML =
"Erreur serveur";


}



}




document.addEventListener(

"DOMContentLoaded",

loadMarketplace

);
