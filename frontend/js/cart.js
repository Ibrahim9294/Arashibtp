// ==========================================
// ARASHI CART SYSTEM
// Gestion du panier
// ==========================================


let cart = JSON.parse(
    localStorage.getItem("arashiCart")
) || [];


// Ajouter un produit au panier

function addToCart(name, price){

    cart.push({

        name:name,
        price:Number(price)

    });


    saveCart();


    alert("✅ Produit ajouté au panier");

}



// Sauvegarder le panier

function saveCart(){

    localStorage.setItem(

        "arashiCart",

        JSON.stringify(cart)

    );

}



// Afficher le panier

function loadCart(){


    const cartList =
    document.getElementById("cartList");


    const cartTotal =
    document.getElementById("cartTotal");



    if(!cartList){

        return;

    }



    cartList.innerHTML="";


    let total=0;



    if(cart.length===0){


        cartList.innerHTML =
        "<p>Votre panier est vide.</p>";

        cartTotal.innerHTML="0 π";

        return;

    }



    cart.forEach((item,index)=>{


        total += item.price;



        const div =
        document.createElement("div");


        div.className="card";


        div.innerHTML=`

        <h3>${item.name}</h3>

        <p>
        Prix : ${item.price} π
        </p>


        <button onclick="removeCart(${index})">

        ❌ Supprimer

        </button>

        `;


        cartList.appendChild(div);



    });



    cartTotal.innerHTML =
    total+" π";


}



// Supprimer un produit

function removeCart(index){


    cart.splice(index,1);


    saveCart();


    loadCart();


}



// Vider le panier

function clearCart(){


    cart=[];


    saveCart();


    loadCart();


}




document.addEventListener(
"DOMContentLoaded",
()=>{

    loadCart();

});
